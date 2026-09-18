/**
 * 提交信息 → 历史列表要的几段：版本号、标题、分点、时间。
 *
 * 为什么要拆：列表那一栏只有 340px 宽，而提交信息是自由文本——有人写
 * 「2026-09-16 面试记录按新规范重排（5 场）；自我介绍规范独立成文；废弃稿件目录清理」，
 * 有人写「简历：编辑器保存」。直接铺成一行就是一堵扫不动的灰墙。
 *
 * 拆的三条依据，都指向「别重复」：
 *   日期   → 交给 meta 行。git 本来就记着，信息里再写一遍就是同一件事说两次。
 *   版本号 → 按「这是这个文件的第几次提交」算（和保存时用的一套，见 doc-version.mjs）。
 *   分点   → 剩下的按「；」拆开，第一点当标题，其余缩进列在下面。
 *
 * 拆不出来不算错：认不出格式就原样当标题显示，宁可朴素也不要显示错。
 */

import { versionLabel } from "./doc-version.mjs";

/**
 * 写提交信息的规范。**和下面的解析器是一对**：这里要求怎么分词，parseCommitSubject 就怎么拆，
 * 动了一边要回来看另一边一眼。
 *
 * 保存时把它喂给模型（见 agent.summarizeChange），所以「提交信息长什么样」只有这一处定义——
 * 靠生成时就合规，而不是事后拿一份文档去对。历史里那些没按规范写的，由上面的解析器兜着
 * （剥日期、拆分点），照样显示得出来。
 */
export const COMMIT_SUBJECT_SPEC =
  "- 一句话说清这次改了什么，动词开头，点名改了哪一段、怎么改的\n"
  + "- 多个要点用「；」分开，最多 3 个，每个不超过 30 字\n"
  + "- 不要写日期、不要写版本号，也不要「1.」「①」这类序号——历史面板里都会另外显示\n"
  + "- 不要「优化了排版」「完善了内容」这种说了等于没说的\n"
  + "- 两边确实一样就回「无实质变化」";

/** 开头的日期前缀：`2026-09-16 面试记录…` → `面试记录…`。只认开头，正文里的日期不动 */
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}\s+/;

/** 开头的版本号：`1.02 开场压缩到两句` → 版本 1.02 + 标题「开场压缩到两句」 */
const VERSION_PREFIX = /^(\d+\.\d+)\s+/;

/** 分点的分隔符。故意不含「、」——它多半在括号里的并列词中间（`（FastAPI、LangGraph）`），拆了就碎 */
const POINT_SEPARATOR = /[；;。]/;

/** 把提交信息拆成 `{ version, title, points }`；version 拿不到就给空串，由调用方按位置补 */
export function parseCommitSubject(subject) {
  let text = String(subject ?? "").trim();
  text = text.replace(DATE_PREFIX, "");

  let version = "";
  const withVersion = VERSION_PREFIX.exec(text);
  if (withVersion) {
    version = withVersion[1];
    text = text.slice(withVersion[0].length);
  }

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
export function commitDateText(iso, currentYear = String(new Date().getFullYear())) {
  const raw = String(iso ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) return { text: raw, full: raw };
  const full = raw.slice(0, 16).replace("T", " ");
  return { text: full.slice(0, 4) === String(currentYear) ? full.slice(5) : full, full };
}

/**
 * 把 history 的原始提交加上列表要显示的字段。
 * 列表是**新→旧**的，所以第 `index` 条的版本号 = `versionLabel(总数 - index)`——
 * 最旧那条是 1.0，最新的那条是 1.(总数-1)。
 */
export function decorateCommits(commits, currentYear) {
  const list = Array.isArray(commits) ? commits : [];
  const total = list.length;
  return list.map((commit, index) => {
    const parsed = parseCommitSubject(commit.subject);
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
