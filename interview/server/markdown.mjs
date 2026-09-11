import { createHash } from "node:crypto";

import { normalizeTitle } from "./search.mjs";

const HISTORY_LINK = /^→\s*\[回答历史\]\(([^)]+)\)\s*$/m;

export function slugify(title) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/[\u0000-\u001f]/g, "")
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^(\d)/, "_$1")
    .toLowerCase()
    ;
}

export function parseQuestions(markdown, sourcePath) {
  const headings = [...markdown.matchAll(/^##\s+(.+?[？?])\s*$/gmu)];
  return headings.map((match, index) => {
    const end = headings[index + 1]?.index ?? markdown.length;
    const section = markdown.slice(match.index + match[0].length, end).trim();
    const link = section.match(HISTORY_LINK)?.[1] ?? null;
    const answer = section
      .replace(HISTORY_LINK, "")
      .replace(/^---\s*$/gm, "")
      .trim();
    const title = match[1].trim();
    return {
      id: createHash("sha256").update(`${sourcePath}\0${normalizeTitle(title)}`).digest("hex").slice(0, 24),
      title,
      normalizedTitle: normalizeTitle(title),
      answer,
      answerExcerpt: answer.slice(0, 180),
      historyUrl: link,
      sourcePath,
    };
  });
}

export function validateQuestionBlock(block) {
  const errors = [];
  const lines = block.trim().split(/\r?\n/);
  const title = lines[0] ?? "";
  if (!/^##\s+[^#].*[？?]$/u.test(title)) errors.push("题目必须使用 H2 且以问号结尾");
  if (/^##\s+\d+[.、]|⭐/u.test(title)) errors.push("题目不能编号或自动添加星标");
  if (/[`#|]/u.test(title.slice(3))) errors.push("题目不能包含反引号、# 或竖线");
  if (/^#{3,}\s/m.test(block)) errors.push("答案只允许两级结构，不能使用三级标题");

  const historyIndex = lines.findIndex((line) => /^→\s*\[回答历史\]\(\/private\/series\/答题历史\/.+\)$/u.test(line));
  if (historyIndex < 0) errors.push("缺少绝对回答历史链接");
  if (historyIndex !== 2 || lines[1] !== "") errors.push("回答历史链接必须紧跟题目下方");
  const answerLines = lines.slice(historyIndex < 0 ? 1 : historyIndex + 1).filter((line) => line.trim() && line.trim() !== "---");
  if (answerLines.length > 15) errors.push("答案记忆卡不得超过 15 行");
  if (!answerLines.length || /^\d+\.|^\s+-|^#/u.test(answerLines[0])) errors.push("答案第一行必须是记忆锚点");
  const topLevel = answerLines.filter((line) => /^\d+\.\s+\*\*[^*]+\*\*/u.test(line));
  if (!topLevel.length || topLevel.length > 6) errors.push("答案必须包含 1–6 个编号加粗要点");
  if (topLevel.some((line) => (line.split(/[：:]/u).slice(1).join(":").trim().length > 30))) errors.push("一级要点主句不得超过 30 字");
  if (answerLines.some((line) => /^\s+-\s/.test(line) && !/^ {3}-\s/.test(line))) {
    errors.push("二级要点必须缩进 3 个空格");
  }
  const fences = answerLines.reduce((state, line) => {
    if (line.trim().startsWith("```")) return { ...state, open: !state.open };
    return { ...state, codeLines: state.codeLines + (state.open ? 1 : 0) };
  }, { open: false, codeLines: 0 });
  if (fences.codeLines > 5) errors.push("代码示例不得超过 5 行");
  return errors;
}

export function buildQuestionBlock({ title, answer, historyUrl }) {
  const normalizedTitle = title.trim().replace(/^#+\s*/, "");
  const block = `## ${normalizedTitle}\n\n→ [回答历史](${historyUrl})\n\n${answer.trim()}\n\n---\n`;
  const errors = validateQuestionBlock(block);
  if (errors.length) throw new Error(`题目不符合《面试宝典文章格式规范》：${errors.join("；")}`);
  return block;
}
