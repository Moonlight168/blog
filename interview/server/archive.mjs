import fs from "node:fs";
import path from "node:path";

import { buildQuestionBlock, slugify } from "./markdown.mjs";
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

export function createArchive({ questionIndex, agent, knowledgeRoot, privateHistoryRoot, db }) {
  return async ({ session, question, rawAnswer, evaluation }) => {
    const attemptKey = `${session.id}:${session.completedCount ?? 0}:${normalizeTitle(question.title)}`;
    if (db.prepare("SELECT 1 FROM attempts WHERE attempt_key=?").get(attemptKey)) return;
    const candidates = await questionIndex.candidates(question.title, 5);
    const exact = candidates.find((candidate) => candidate.normalized_title === normalizeTitle(question.title));
    const decision = exact ? { kind: "existing", questionId: exact.id } : await agent.judgeDuplicate({ title: question.title, candidates });
    const existing = decision.kind === "existing" ? questionIndex.getById(decision.questionId) : null;
    const sourceRelative = existing?.source_path ?? session.chapterPath;
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
    try {
      if (!existing) {
        const historyUrl = `${history.url}#${slugify(question.title)}`;
        const block = buildQuestionBlock({ title: question.title, answer: question.standardAnswer, historyUrl });
        appendAtomically(sourceFile, `\n${block}`);
      }
      fs.mkdirSync(path.dirname(history.file), { recursive: true });
      const historyTemp = `${history.file}.${process.pid}.tmp`;
      fs.writeFileSync(historyTemp, historyNext, "utf8");
      fs.renameSync(historyTemp, history.file);
      const inserted = db.prepare("INSERT INTO attempts(session_id,question_title,raw_answer,evaluation,created_at,attempt_key) VALUES(?,?,?,?,?,?)")
        .run(session.id, question.title, rawAnswer, JSON.stringify(evaluation), new Date().toISOString(), attemptKey);
      attemptId = inserted.lastInsertRowid;
      await questionIndex.refresh();
    } catch (error) {
      restoreFile(sourceFile, publicExisted, publicBefore);
      restoreFile(history.file, historyExisted, historyOriginal);
      if (attemptId !== null) db.prepare("DELETE FROM attempts WHERE id=?").run(attemptId);
      await questionIndex.refresh().catch(() => {});
      throw error;
    }
  };
}
