import { createHash } from "node:crypto";

import { normalizeTitle } from "./search.mjs";

const HISTORY_LINK = /^→\s*\[回答历史\]\(([^)]+)\)\s*$/m;

/** 一级要点主句的字数上限，按「汉字当量」计。 */
export const MAX_MAIN_UNITS = 30;

/**
 * 视觉宽度当量：非 ASCII（汉字、全角标点、箭头等）算 1，ASCII 算 0.5，空格与反引号不计。
 * 不能直接用 String.length——那会把 retry_count 这类标识符按每个字母 1 字算，
 * 视觉上 12 个汉字宽的东西被记成 24 字，技术题的主句会被大面积误判。
 */
export function widthUnits(text) {
  let units = 0;
  for (const char of String(text)) {
    if (char === "`" || /\s/u.test(char)) continue;
    units += char.codePointAt(0) < 0x7f ? 0.5 : 1;
  }
  return units;
}

/** 一级要点的「主句」＝ 第一个冒号之后到行尾（与《格式规范》口径一致） */
function mainClause(line) {
  return line.split(/[：:]/u).slice(1).join(":").trim();
}

const isBalancedCode = (text) => ((text.match(/`/g) ?? []).length % 2 === 0);

/**
 * 在宽度上限内找最靠后的「安全断点」：优先标点、其次空格，最后才硬切；
 * 并要求行内代码的反引号成对，免得把 `jstat -gcutil` 切成两半。
 */
function safeCut(text, limit) {
  const punctuations = [];
  const spaces = [];
  let units = 0;
  let hardEnd = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char !== "`" && !/\s/u.test(char)) {
      const cost = char.codePointAt(0) < 0x7f ? 0.5 : 1;
      if (units + cost > limit) break;
      units += cost;
    }
    hardEnd = index + 1;
    if (/[；。，、！？;,.!?]/u.test(char)) punctuations.push(index + 1);
    else if (/\s/u.test(char)) spaces.push(index + 1);
  }
  const lastFitting = (cuts) => [...cuts].reverse().find((cut) => isBalancedCode(text.slice(0, cut))) ?? 0;
  return lastFitting(punctuations) || lastFitting(spaces) || (() => {
    for (let cut = hardEnd; cut > 0; cut -= 1) if (isBalancedCode(text.slice(0, cut))) return cut;
    return 0;
  })();
}

/**
 * 兜底：把超长的一级要点拆成「主句 + 3 空格缩进的二级补充」。
 * 校验和模型重写都救不回来时用它，保证内容进得去知识库、事实一条不丢。
 */
export function splitLongBullets(answer, limit = MAX_MAIN_UNITS) {
  const out = [];
  for (const line of String(answer).trim().split(/\r?\n/)) {
    if (!/^\d+\.\s+\*\*[^*]+\*\*/u.test(line)) { out.push(line); continue; }
    const colonAt = line.search(/[：:]/u);
    const main = mainClause(line);
    if (colonAt < 0 || widthUnits(main) <= limit) { out.push(line); continue; }
    const cut = safeCut(main, limit);
    if (!cut) { out.push(line); continue; }
    // 主句留在第一级，被切下来的部分降为二级补充。
    // 若断在顿号处，把主句末尾那个顿号丢掉——句子被拆开了，留着它反而像被截断。
    const head = main.slice(0, cut).trim().replace(/、$/u, "");
    out.push(`${line.slice(0, colonAt + 1)}${head}`);
    out.push(`   - ${main.slice(cut).trim()}`);
  }
  return out.join("\n");
}

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

  // 回答历史链接放在答案之后（全库现有写法都是这样）。
  // 答案区间 = 题目之后、链接之前；链接之后只剩 `---` 之类的收尾。
  const historyIndex = lines.findIndex((line) => /^→\s*\[回答历史\]\(\/private\/series\/答题历史\/.+\)$/u.test(line));
  if (historyIndex < 0) errors.push("缺少绝对回答历史链接");
  const answerLines = lines.slice(1, historyIndex < 0 ? lines.length : historyIndex)
    .filter((line) => line.trim() && line.trim() !== "---");
  if (answerLines.length > 15) errors.push("答案记忆卡不得超过 15 行");
  if (!answerLines.length) errors.push("题目与回答历史链接之间必须有标准答案");
  else if (/^\d+\.|^\s+-|^#/u.test(answerLines[0])) errors.push("答案第一行必须是记忆锚点");
  const topLevel = answerLines.filter((line) => /^\d+\.\s+\*\*[^*]+\*\*/u.test(line));
  if (!topLevel.length || topLevel.length > 6) errors.push("答案必须包含 1–6 个编号加粗要点");
  // 主句上限按汉字当量算；报错要带上「第几条、超多少」，否则重写时模型不知道该改哪句
  const overlong = topLevel
    .map((line) => widthUnits(mainClause(line)))
    .map((units, index) => ({ index: index + 1, units }))
    .filter((item) => item.units > MAX_MAIN_UNITS);
  if (overlong.length) {
    const detail = overlong
      .map((item) => `第 ${item.index} 条 ${item.units} 字、超 ${item.units - MAX_MAIN_UNITS}`)
      .join("；");
    errors.push(`一级要点主句不得超过 ${MAX_MAIN_UNITS} 字（汉字当量）：${detail}`);
  }
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
  // 不加结尾的 `---`：现有题库的题与题之间只有空行，加 `---` 会多渲染一条 <hr>
  const block = `## ${normalizedTitle}\n\n${answer.trim()}\n\n→ [回答历史](${historyUrl})\n`;
  const errors = validateQuestionBlock(block);
  if (errors.length) throw new Error(`题目不符合《面试宝典文章格式规范》：${errors.join("；")}`);
  return block;
}
