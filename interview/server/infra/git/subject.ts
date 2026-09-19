/**
 * 提交信息 → 历史列表要的几段：版本号、标题、分点、时间。
 *
 * 提交信息按 git 本来的分法用两段：
 *   subject（第一行）→ 概括这次改了什么，列表里只显示它
 *   body（空行之后）→ 逐条列出改了哪些地方，鼠标停上去看
 * 这样列表那一栏（只有 340px 宽）不会被一堵灰墙塞满，而详情一点就能看全。
 *
 * 另外两条也指向「别重复」：
 *   日期   → 交给 meta 行。git 本来就记着，信息里再写一遍就是同一件事说两次。
 *   版本号 → 按「这是这个文件的第几次提交」算（和保存时用的一套，见 version.ts）。
 *
 * 拆不出来不算错：认不出格式就原样当标题显示，宁可朴素也不要显示错。
 * 老提交（body 为空、要点挤在 subject 里用「；」隔开）由解析器兜着。
 */

import { versionLabel } from "./version.ts";

/**
 * 写提交信息的规范。**和下面的解析器是一对**：这里要求怎么写，parseCommitMessage 就怎么拆，
 * 动了一边要回来看另一边一眼。
 *
 * 它是 `COMMIT_MESSAGE_PROMPT` 的一部分，也就是**唯一**定义「提交信息长什么样」的地方 ——
 * 靠生成时就合规，而不是事后拿一份文档去对。
 */
export const COMMIT_MESSAGE_SPEC =
  "- 第一行：一句话概括这次改动，动词开头，点名改了哪一段、怎么改的，不超过 30 字\n"
  + "- 空一行，然后逐条列出具体改了哪些地方：一条一行，每条不超过 40 字\n"
  + "  要覆盖**全部**改动（通常 3～8 条），不要合并成一句笼统的话；一条也写不出就只留第一行\n"
  + "- 不要写日期、不要写版本号，也不要「1.」「①」这类序号——历史面板里都会另外显示\n"
  + "- 不要「优化了排版」「完善了内容」这种说了等于没说的";

/**
 * 写提交信息的完整提示词：让 agent 自己跑 `git diff` 看**真实改了哪些行**。
 *
 * 为什么不把「改前改后两份全文」喂给模型（曾经就是那么做的）：一份 18KB 的简历 HTML
 * 两份拼起来 36KB，改动只占其中几十行，模型扫一眼就回「无实质变化」——
 * 而那时候内容**确实变了**（提交都建出来了）。给它 diff，就没有看不出来的余地。
 *
 * 规范里原来还有一句「两边确实一样就回「无实质变化」」，已经删掉：
 * 真没变化时 commitFile 会因为工作区干净而直接返回「内容没有变化，无需提交」，
 * 压根不产生提交，这句话永远用不上；有变化时它又必然是错的。
 */
export const COMMIT_MESSAGE_PROMPT =
  "你在给一次文档保存写提交信息。\n\n"
  + "先跑 `git status --porcelain` 看清这次改了哪些文件，再跑 `git diff -- <文件>` 看具体改了哪些行。\n"
  + "**以 diff 的输出为唯一依据** —— 不要凭印象，不要描述 diff 里没有的东西。\n\n"
  + `${COMMIT_MESSAGE_SPEC}\n`
  + "只回这段文字（第一行概括，空行，然后分点），不要引号、不要 JSON、不要解释，也不要代码块围栏。";

/** 开头的日期前缀：`2026-09-16 面试记录…` → `面试记录…`。只认开头，正文里的日期不动 */
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}\s+/;

/** 开头的版本号：`1.02 开场压缩到两句` → 版本 1.02 + 标题「开场压缩到两句」 */
const VERSION_PREFIX = /^(\d+\.\d+)\s+/;

/**
 * 老格式的分点分隔符：早期把要点全写在一行里用「；」隔开。
 * 故意不含「、」——它多半在括号里的并列词中间（`（FastAPI、LangGraph）`），拆了就碎。
 */
const POINT_SEPARATOR = /[；;。]/;

/**
 * 把提交信息拆成 `{ version, title, points }`。
 *
 * `points` 优先取 body 的逐行分点（现在的写法）；body 为空就退回老办法，
 * 把 subject 按「；」拆开，第一段当标题、其余当分点 —— 历史里那些旧版本照样显示得出来。
 *
 * 提交信息可能是任何东西（git 里翻出来的、手写的），所以入口收 unknown，函数内自己兜。
 */
export function parseCommitMessage(subject: unknown, body: unknown = "") {
  let text = String(subject ?? "").trim();
  text = text.replace(DATE_PREFIX, "");

  let version = "";
  const withVersion = VERSION_PREFIX.exec(text);
  if (withVersion) {
    version = withVersion[1];
    text = text.slice(withVersion[0].length);
  }

  const bodyPoints = String(body ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*·]\s*/, "").trim())
    .filter(Boolean);
  if (bodyPoints.length) return { version, title: text, points: bodyPoints };

  // 老格式：要点挤在 subject 里，用「；」隔开
  const parts = text.split(POINT_SEPARATOR).map((part) => part.trim()).filter(Boolean);
  return { version, title: parts[0] ?? "", points: parts.slice(1) };
}

/**
 * 提交时间 → `{ text, full }`。
 * `text` 给列表用：同年省掉年份（340px 里 `09-17 21:11` 比 `2026-09-17 21:11` 好读），
 * 跨年才写全。`full` 挂进 title 属性，鼠标停上去能看到完整的。
 *
 * 直接切 ISO 字符串而不走 Date：git 记的是带时区的 `2026-09-17T21:11:44+08:00`，
 * 字符串切出来的就是**当时写下它的那个时刻**，换算成本机会在跨时区时显示成另一个时间。
 */
export function commitDateText(iso: string, currentYear: string = String(new Date().getFullYear())): { text: string; full: string } {
  const raw = String(iso ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) return { text: raw, full: raw };
  const full = raw.slice(0, 16).replace("T", " ");
  return { text: full.slice(0, 4) === String(currentYear) ? full.slice(5) : full, full };
}

/**
 * 把 history 的原始提交加上列表要显示的字段。
 *
 * 先滤掉「内容一个字没动」的提交（纯改名、挪位置——numstat 是 `0 0`，历史函数标的 `changed`）：
 * 它们占着一个版本号却没有任何新内容，只会让「第几版」这个数字变虚。
 *
 * 版本号在过滤**之后**才编：列表是**新→旧**的，第 `index` 条的版本号 = `versionLabel(总数 - index)`——
 * 最旧那条是 1.0，最新的那条是 1.(总数-1)。
 */
export function decorateCommits(commits: unknown, currentYear: string = String(new Date().getFullYear())): any[] {
  const list = (Array.isArray(commits) ? commits : []).filter((commit) => commit.changed !== false);
  const total = list.length;
  return list.map((commit, index) => {
    const parsed = parseCommitMessage(commit.subject, commit.body);
    const { text, full } = commitDateText(commit.date, currentYear);
    return {
      ...commit,
      version: parsed.version || versionLabel(total - index),
      title: parsed.title,
      points: parsed.points,
      dateText: text,
      dateFull: full,
    };
  });
}
