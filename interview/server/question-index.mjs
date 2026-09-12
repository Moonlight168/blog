import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { parseQuestions } from "./markdown.mjs";
import { cjkBigrams, cosineSimilarity, normalizeTitle, reciprocalRankFusion } from "./search.mjs";

function walk(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    return entry.isDirectory() ? walk(full) : entry.isFile() && entry.name.endsWith(".md") ? [full] : [];
  });
}

/** Fisher–Yates 洗牌，返回新数组。 */
function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export class QuestionIndex {
  constructor({ db, knowledgeRoot, embeddingClient }) {
    this.db = db;
    this.knowledgeRoot = knowledgeRoot;
    this.embeddingClient = embeddingClient;
    this.refreshing = null;
  }

  async refresh() {
    if (this.refreshing) return this.refreshing;
    this.refreshing = this.#refresh();
    try { return await this.refreshing; }
    finally { this.refreshing = null; }
  }

  async #refresh() {
    const seen = new Set();
    const changed = [];
    for (const file of walk(this.knowledgeRoot)) {
      const markdown = fs.readFileSync(file, "utf8");
      const relative = path.relative(this.knowledgeRoot, file).replaceAll("\\", "/");
      const [series] = relative.split("/");
      const chapter = path.basename(relative, ".md");
      for (const question of parseQuestions(markdown, relative)) {
        seen.add(question.id);
        const hash = createHash("sha256").update(`${question.title}\0${question.answer}`).digest("hex");
        const old = this.db.prepare("SELECT content_hash,embedding,embedding_model FROM questions WHERE id=?").get(question.id);
        const modelChanged = this.embeddingClient.enabled && old?.embedding_model !== this.embeddingClient.config.model;
        if (!old || old.content_hash !== hash || (this.embeddingClient.enabled && (!old.embedding || modelChanged))) {
          changed.push({ ...question, hash, series, chapter, old });
        }
      }
    }
    this.db.exec("BEGIN IMMEDIATE");
    try {
      for (const question of changed) this.#upsert(question, null);
      const all = this.db.prepare("SELECT id FROM questions").all();
      for (const row of all) if (!seen.has(row.id)) this.#delete(row.id);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    let embedded = 0;
    let embeddingError = null;
    if (this.embeddingClient.enabled && changed.length) {
      try {
        for (let offset = 0; offset < changed.length; offset += 64) {
          const batch = changed.slice(offset, offset + 64);
          const vectors = await this.embeddingClient.embed(batch.map((q) => `${q.title}\n${q.answerExcerpt}`));
          batch.forEach((question, index) => this.#setEmbedding(question.id, vectors[index]));
          embedded += batch.length;
        }
      } catch (error) {
        embeddingError = error.message;
        console.error("Embedding 更新失败，本次使用本地检索", error);
      }
    }
    return { total: seen.size, changed: changed.length, embedded, embeddingError };
  }

  #upsert(q, embedding) {
    this.db.prepare(`INSERT INTO questions(id,series,chapter,title,normalized_title,answer_excerpt,source_path,history_url,content_hash,embedding,embedding_model,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,normalized_title=excluded.normalized_title,
      answer_excerpt=excluded.answer_excerpt,history_url=excluded.history_url,content_hash=excluded.content_hash,
      embedding=excluded.embedding,embedding_model=excluded.embedding_model,updated_at=excluded.updated_at`)
      .run(q.id, q.series, q.chapter, q.title, q.normalizedTitle, q.answerExcerpt, q.sourcePath, q.historyUrl,
        q.hash, embedding, null, new Date().toISOString());
    this.db.prepare("DELETE FROM questions_fts WHERE id=?").run(q.id);
    this.db.prepare("INSERT INTO questions_fts(id,title,grams,answer) VALUES(?,?,?,?)")
      .run(q.id, q.title, cjkBigrams(q.title), q.answerExcerpt);
  }

  #setEmbedding(id, vector) {
    this.db.prepare("UPDATE questions SET embedding=?,embedding_model=? WHERE id=?")
      .run(JSON.stringify(vector), this.embeddingClient.config.model, id);
  }

  #delete(id) {
    this.db.prepare("DELETE FROM questions WHERE id=?").run(id);
    this.db.prepare("DELETE FROM questions_fts WHERE id=?").run(id);
  }

  topics() {
    const rows = this.db.prepare("SELECT DISTINCT series,chapter,source_path FROM questions ORDER BY series,chapter").all();
    const result = new Map();
    for (const row of rows) {
      if (!result.has(row.series)) result.set(row.series, []);
      result.get(row.series).push({ name: row.chapter, path: row.source_path });
    }
    return [...result.entries()].map(([name, chapters]) => ({ name, chapters }));
  }

  getById(id) { return this.db.prepare("SELECT * FROM questions WHERE id=?").get(id); }

  /** 某章节已有的题目标题——章节模式的考点表直接由它推出来，不用调模型 */
  titles(sourcePath, limit = 40) {
    return this.db.prepare("SELECT title FROM questions WHERE source_path=? ORDER BY updated_at DESC LIMIT ?")
      .all(sourcePath, limit).map((row) => row.title);
  }

  #detail(id) {
    return this.db.prepare("SELECT id,title,normalized_title,answer_excerpt,source_path,history_url FROM questions WHERE id=?").get(id);
  }

  /**
   * 分通道检索，保留每路排名的明细与来源，供检索预览页展示。
   * candidates() 基于本方法实现，归档查重路径的返回结构保持不变。
   */
  async search(title, topK = 5) {
    const normalized = normalizeTitle(title);

    // ① 精确匹配：标题规范化后完全相同
    const exactIds = this.db.prepare("SELECT id FROM questions WHERE normalized_title=? LIMIT 5").all(normalized).map((row) => row.id);

    // ② 关键词匹配：SQLite FTS5 + bm25（数值越小越相关）
    let keywordRows = [];
    let keywordError = null;
    try {
      keywordRows = this.db.prepare("SELECT id, bm25(questions_fts) AS score FROM questions_fts WHERE questions_fts MATCH ? ORDER BY bm25(questions_fts) LIMIT 10")
        .all(cjkBigrams(title).split(" ").map((token) => `"${token}"`).join(" OR "));
    } catch (error) {
      keywordError = error.message;
    }

    // ③ 语义检索：仅在配置了向量模型时参与
    let semanticRows = [];
    let semanticError = null;
    if (this.embeddingClient.enabled) {
      try {
        const [query] = await this.embeddingClient.embed([title]);
        semanticRows = this.db.prepare("SELECT id,embedding FROM questions WHERE embedding IS NOT NULL").all()
          .map((row) => ({ id: row.id, score: cosineSimilarity(query, JSON.parse(row.embedding)) }))
          .sort((a, b) => b.score - a.score).slice(0, 10);
      } catch (error) {
        semanticError = error.message;
        console.error("Embedding 查询失败，本次仅使用精确匹配与关键词匹配", error);
      }
    }

    const keywordIds = keywordRows.map((row) => row.id);
    const semanticIds = semanticRows.map((row) => row.id);

    // 记录每个 id 由哪些通道召回，便于解释融合排序
    const sources = new Map();
    for (const [channel, ids] of [["exact", exactIds], ["keyword", keywordIds], ["semantic", semanticIds]]) {
      for (const id of ids) sources.set(id, [...(sources.get(id) ?? []), channel]);
    }

    const fused = reciprocalRankFusion([exactIds, keywordIds, semanticIds]).slice(0, topK)
      .map((ranked) => {
        const row = this.#detail(ranked.id);
        return row ? { ...row, rrfScore: ranked.score, channels: sources.get(ranked.id) ?? [] } : null;
      })
      .filter(Boolean);

    const withChannel = (id, channel, score) => {
      const row = this.#detail(id);
      if (!row) return null;
      return score === undefined ? { ...row, channel } : { ...row, channel, score: Number(score) };
    };

    return {
      query: title,
      normalizedTitle: normalized,
      embeddingEnabled: this.embeddingClient.enabled,
      channels: {
        exact: exactIds.map((id) => withChannel(id, "exact")).filter(Boolean),
        keyword: keywordRows.map((row) => withChannel(row.id, "keyword", row.score)).filter(Boolean),
        semantic: semanticRows.map((row) => withChannel(row.id, "semantic", row.score)).filter(Boolean),
      },
      errors: { keyword: keywordError, semantic: semanticError },
      fused,
    };
  }

  async candidates(title, topK = 5) {
    const { fused } = await this.search(title, topK);
    // 归档查重依赖这里的字段结构，不要把 rrfScore / channels 透传给 LLM
    return fused.map(({ rrfScore, channels, ...row }) => row);
  }

  /**
   * 复习用：从某个章节的源 markdown 里随机抽 count 道题，返回完整答案。
   * 不能读库里的 answer_excerpt——那是 answer.slice(0, 180)，会从中间截断。
   */
  pick(chapterPath, count = 10) {
    const file = path.resolve(this.knowledgeRoot, chapterPath);
    const relative = path.relative(this.knowledgeRoot, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("章节路径超出知识库范围");
    if (!fs.existsSync(file)) throw new Error(`章节文件不存在：${chapterPath}`);

    const questions = parseQuestions(fs.readFileSync(file, "utf8"), chapterPath);
    return shuffle(questions)
      .slice(0, Math.max(0, count))
      .map(({ id, title, answer, historyUrl }) => ({ id, title, answer, historyUrl }));
  }
}
