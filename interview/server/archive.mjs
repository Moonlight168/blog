import fs from "node:fs";
import path from "node:path";

import { buildQuestionBlock, slugify, splitLongBullets } from "./markdown.mjs";
import { normalizeTitle } from "./search.mjs";

function ensureInside(root, file) {
  const relative = path.relative(path.resolve(root), path.resolve(file));
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("归档路径超出允许目录");
}

function appendAtomically(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const original = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, original + content, "utf8");
  fs.renameSync(temp, file);
  return original;
}

function restoreFile(file, existed, content) {
  if (existed) fs.writeFileSync(file, content, "utf8");
  else if (fs.existsSync(file)) fs.unlinkSync(file);
}

export function mergeHistory(markdown, { chapter, title, date, rawAnswer }) {
  const header = markdown.trim() ? markdown.trimEnd() : `# ${chapter} 面试答题记录\n\n---`;
  const entry = `- **${date}**：${rawAnswer.replace(/\s+/g, " ").trim()}`;
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^## ${escaped}\\s*$`, "mu").exec(header);
  if (!match) return `${header}\n\n## ${title}\n\n${entry}\n`;
  const sectionStart = match.index + match[0].length;
  const nextHeading = /^##\s+/mu.exec(header.slice(sectionStart));
  const insertAt = nextHeading ? sectionStart + nextHeading.index : header.length;
  return `${header.slice(0, insertAt).trimEnd()}\n\n${entry}\n\n${header.slice(insertAt).trimStart()}`.trimEnd() + "\n";
}

function historyLocation({ privateHistoryRoot, series, chapter }) {
  const file = path.join(privateHistoryRoot, series, `${chapter}-答题记录.md`);
  const encodedSeries = encodeURIComponent(series).replaceAll("%2F", "/");
  const encodedChapter = encodeURIComponent(`${chapter}-答题记录.md`);
  return { file, url: `/private/series/答题历史/${encodedSeries}/${encodedChapter}` };
}

function listMarkdown(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listMarkdown(full, out);
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

/**
 * 岗位定制模式下没有指定章节，由模型给出的 topic / series 决定归档位置：
 * 全库已有同名章节就归过去，没有就在它选的分类下新建。
 */
function resolveJdTarget({ question, knowledgeRoot }) {
  const topic = String(question.topic ?? "").trim();
  const series = String(question.series ?? "").trim();
  if (!topic) throw new Error("岗位定制模式下缺少题目归属的章节");
  if (/[\\/]/.test(topic)) throw new Error(`章节名不能包含路径分隔符：${topic}`);

  const wanted = topic.toLowerCase();
  for (const file of listMarkdown(knowledgeRoot)) {
    if (path.basename(file, ".md").toLowerCase() === wanted) {
      return path.relative(knowledgeRoot, file).split(path.sep).join("/");
    }
  }

  if (!series || /[\\/]/.test(series)) throw new Error(`新建章节需要合法的知识分类名：${series || "(空)"}`);
  const target = path.join(knowledgeRoot, series, `${topic}.md`);
  ensureInside(knowledgeRoot, target);
  return path.relative(knowledgeRoot, target).split(path.sep).join("/");
}

/**
 * 把一道题按《格式规范》写进知识库；校验不过时先让模型按规范重写再试。
 * 返回 { ok: true, historyUrl } 或 { ok: false, reason }。
 */
async function writeQuestionBlock({ agent, knowledgeRoot, privateHistoryRoot, sourceRelative, title, standardAnswer }) {
  const series = sourceRelative.split("/")[0];
  const chapter = path.basename(sourceRelative, ".md");
  const history = historyLocation({ privateHistoryRoot, series, chapter });
  const sourceFile = path.join(knowledgeRoot, sourceRelative);
  ensureInside(knowledgeRoot, sourceFile);
  ensureInside(privateHistoryRoot, history.file);
  const historyUrl = `${history.url}#${slugify(title)}`;

  const append = (answer) => appendAtomically(sourceFile, `\n${buildQuestionBlock({ title, answer, historyUrl })}`);
  const strip = (message = "") => message.replace(/^题目不符合《面试宝典文章格式规范》：/, "");
  let candidate = standardAnswer;
  let lastReason = "";
  // 模型常把命令、英文标识符堆在一级主句里导致超标。归档时模型就在手边，让它按规范重写，
  // 最多两次；报错里带着「第几条、超多少」，它才知道该改哪句。
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      append(candidate);
      return { ok: true, historyUrl };
    } catch (error) {
      lastReason = error.message;
      try {
        candidate = await agent.reformatAnswer({ question: { title, standardAnswer }, errors: [strip(error.message)] });
      } catch (rewriteError) {
        lastReason = rewriteError.message;
        break;
      }
    }
  }
  // 模型也救不回来时走确定性兜底：自动把超长主句拆成二级补充。
  // 一条 bullet 的风格问题不该等于整个知识点丢失。
  try {
    append(splitLongBullets(candidate));
    return { ok: true, historyUrl };
  } catch (fallbackError) {
    return { ok: false, reason: strip(fallbackError.message) || strip(lastReason) };
  }
}

/** 补录：把归档时被跳过的一道题重新写进知识库（详情页的「再次归档」用）。 */
export async function refileQuestion({ agent, questionIndex, knowledgeRoot, privateHistoryRoot, chapterPath, title, standardAnswer }) {
  const written = await writeQuestionBlock({
    agent, knowledgeRoot, privateHistoryRoot, sourceRelative: chapterPath, title, standardAnswer,
  });
  if (written.ok) await questionIndex.refresh();
  return written;
}

export function createArchive({ questionIndex, agent, knowledgeRoot, privateHistoryRoot, db }) {
  return async ({ session, question, rawAnswer, evaluation }) => {
    const attemptKey = `${session.id}:${session.completedCount ?? 0}:${normalizeTitle(question.title)}`;
    if (db.prepare("SELECT 1 FROM attempts WHERE attempt_key=?").get(attemptKey)) return;
    const candidates = await questionIndex.candidates(question.title, 5);
    const exact = candidates.find((candidate) => candidate.normalized_title === normalizeTitle(question.title));
    const decision = exact ? { kind: "existing", questionId: exact.id } : await agent.judgeDuplicate({ title: question.title, candidates });
    const existing = decision.kind === "existing" ? questionIndex.getById(decision.questionId) : null;
    // 岗位定制模式没有指定章节，改由题目自带的 topic/series 决定归档位置
    const sourceRelative = existing?.source_path
      ?? (session.mode === "jd" ? resolveJdTarget({ question, knowledgeRoot }) : session.chapterPath);
    const sourceFile = path.join(knowledgeRoot, sourceRelative);
    ensureInside(knowledgeRoot, sourceFile);
    const series = sourceRelative.split("/")[0];
    const chapter = path.basename(sourceRelative, ".md");
    const history = historyLocation({ privateHistoryRoot, series, chapter });
    ensureInside(privateHistoryRoot, history.file);

    const date = new Date().toISOString().slice(0, 10);
    const publicExisted = fs.existsSync(sourceFile);
    const publicBefore = publicExisted ? fs.readFileSync(sourceFile, "utf8") : "";
    const historyExisted = fs.existsSync(history.file);
    const historyOriginal = historyExisted ? fs.readFileSync(history.file, "utf8") : "";
    const historyNext = mergeHistory(historyOriginal, { chapter, title: existing?.title ?? question.title, date, rawAnswer });
    let attemptId = null;
    let notice = null;
    try {
      if (!existing) {
        const written = await writeQuestionBlock({
          agent, knowledgeRoot, privateHistoryRoot, sourceRelative,
          title: question.title, standardAnswer: question.standardAnswer,
        });
        if (!written.ok) {
          // 重写也救不回来才跳过入库；下面的回答记录照常写入，并把原因回报给调用方。
          notice = `未写入知识库：${written.reason}`;
          console.warn(`题目未写入知识库（${sourceRelative}）：${written.reason}`);
        }
      }
      fs.mkdirSync(path.dirname(history.file), { recursive: true });
      const historyTemp = `${history.file}.${process.pid}.tmp`;
      fs.writeFileSync(historyTemp, historyNext, "utf8");
      fs.renameSync(historyTemp, history.file);
      const inserted = db.prepare("INSERT INTO attempts(session_id,question_title,raw_answer,evaluation,created_at,attempt_key,standard_answer) VALUES(?,?,?,?,?,?,?)")
        .run(session.id, question.title, rawAnswer, JSON.stringify(evaluation), new Date().toISOString(), attemptKey, question.standardAnswer ?? "");
      attemptId = inserted.lastInsertRowid;
      await questionIndex.refresh();
    } catch (error) {
      restoreFile(sourceFile, publicExisted, publicBefore);
      restoreFile(history.file, historyExisted, historyOriginal);
      if (attemptId !== null) db.prepare("DELETE FROM attempts WHERE id=?").run(attemptId);
      await questionIndex.refresh().catch(() => {});
      throw error;
    }
    return notice ? { notice } : {};
  };
}
