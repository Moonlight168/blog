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
        if (!old || old.content_hash !== hash) changed.push({ ...question, hash, series, chapter, old });
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
    if (this.embeddingClient.enabled && changed.length) {
      for (let offset = 0; offset < changed.length; offset += 64) {
        const batch = changed.slice(offset, offset + 64);
        const vectors = await this.embeddingClient.embed(batch.map((q) => `${q.title}\n${q.answerExcerpt}`));
        batch.forEach((question, index) => this.#setEmbedding(question.id, vectors[index]));
      }
    }
    return { total: seen.size, changed: changed.length };
  }

  #upsert(q, embedding) {
    this.db.prepare(`INSERT INTO questions(id,series,chapter,title,normalized_title,answer_excerpt,source_path,history_url,content_hash,embedding,embedding_model,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,normalized_title=excluded.normalized_title,
      answer_excerpt=excluded.answer_excerpt,history_url=excluded.history_url,content_hash=excluded.content_hash,updated_at=excluded.updated_at`)
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

  samples(sourcePath, limit = 5) {
    return this.db.prepare("SELECT title,answer_excerpt FROM questions WHERE source_path=? ORDER BY updated_at DESC LIMIT ?")
      .all(sourcePath, limit);
  }

  async candidates(title, limit = 5) {
    const normalized = normalizeTitle(title);
    const exact = this.db.prepare("SELECT id FROM questions WHERE normalized_title=? LIMIT 5").all(normalized).map((r) => r.id);
    let lexical = [];
    try {
      lexical = this.db.prepare("SELECT id FROM questions_fts WHERE questions_fts MATCH ? ORDER BY bm25(questions_fts) LIMIT 10")
        .all(cjkBigrams(title).split(" ").map((token) => `\"${token}\"`).join(" OR ")).map((r) => r.id);
    } catch { lexical = []; }
    let semantic = [];
    if (this.embeddingClient.enabled) {
      const [query] = await this.embeddingClient.embed([title]);
      semantic = this.db.prepare("SELECT id,embedding FROM questions WHERE embedding IS NOT NULL").all()
        .map((row) => ({ id: row.id, score: cosineSimilarity(query, JSON.parse(row.embedding)) }))
        .sort((a, b) => b.score - a.score).slice(0, 10).map((row) => row.id);
    }
    const ids = reciprocalRankFusion([exact, lexical, semantic]).slice(0, limit).map((row) => row.id);
    return ids.map((id) => this.db.prepare("SELECT id,title,answer_excerpt,source_path,history_url FROM questions WHERE id=?").get(id));
  }
}
