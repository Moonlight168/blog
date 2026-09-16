import fs from "node:fs";
import path from "node:path";

/**
 * 真实面试记录：读 src/private/hires/个人简介/面试经验/ 下按场次分的目录。
 *
 * 每场一个目录，命名形如「公司_岗位_2026_9_14」，里面是自由格式的 markdown
 * （面试总结 / 面试真题 / 岗位信息 …）。这里只负责列出与读取，不写回——
 * 这些是本人的一手记录，要改在编辑器里改。
 */

/**
 * 详情页只展示这四类，顺序即标签页顺序。
 * README、面试预测、岗位信息.jpg、面试纪要.pdf 这些仍保留在仓库里，只是不在页面上出现。
 */
const VISIBLE_FILES = ["面试真题", "面试总结", "自我介绍", "岗位信息"];

/**
 * 从目录名解析出场次信息。
 * 「星辰科技_AI应用开发实习生_2026_8_6」→ 公司 / 岗位 / 2026-08-06。
 * 解析不出来时不猜，退回目录名当公司、日期留空。
 */
export function parseFolderName(name) {
  const cells = String(name).split("_");
  const dateCells = cells.slice(-3);
  const isDate = dateCells.length === 3 && dateCells.every((cell) => /^\d+$/.test(cell));
  if (!isDate) return { company: name, role: "", date: "" };
  const [year, month, day] = dateCells;
  const rest = cells.slice(0, -3);
  return {
    company: rest[0] ?? name,
    role: rest.slice(1).join(" ").trim(),
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

/** 目录里要展示的那几类 markdown，按 VISIBLE_FILES 的顺序返回 */
function markdownFiles(dir) {
  const present = new Set(fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => path.basename(entry.name, ".md")));
  return VISIBLE_FILES.filter((name) => present.has(name));
}

/**
 * 去掉开头的 YAML frontmatter（title / date / categories）。
 * 那是博客的元数据，直接渲染会变成页面顶部一坨 `title: xxx` 的原文。
 */
export function stripFrontmatter(markdown) {
  return String(markdown).replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, "").replace(/^\s+/, "");
}

/** 题块里的「→ 宝典：`分类/文档.md`《⭐题名》」一行 */
const BAODIAN_LINE = /^→ 宝典：`?([^`《\n]+?)`?《([^》]+)》[ \t]*$/gmu;

/**
 * 取这道题在宝典页面上的锚点。
 * 直接用题目所在题块里那条「回答历史」链接的锚点——两边标题同一串文字，
 * VuePress 生成的 slug 也同一串，比自己按规则猜可靠。
 */
function anchorOfQuestion(knowledgeRoot, relative, title) {
  if (!knowledgeRoot) return "";
  const file = path.join(knowledgeRoot, relative);
  if (!fs.existsSync(file)) return "";
  const text = fs.readFileSync(file, "utf8");
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^##\\s+${escaped}\\s*$`, "mu").exec(text);
  if (!heading) return "";
  const rest = text.slice(heading.index + heading[0].length);
  const next = /^##\s+/mu.exec(rest);
  const block = next ? rest.slice(0, next.index) : rest;
  return /→\s*\[回答历史\]\([^)]*#([^)]+)\)/u.exec(block)?.[1] ?? "";
}

/**
 * 把「→ 宝典：…《…》」那行变成可点的 markdown 链接。
 * 链接写站点根相对路径，由前端补上博客基址（这个 app 和博客不同端口）。
 */
export function linkKnowledge(markdown, knowledgeRoot) {
  return String(markdown).replace(BAODIAN_LINE, (_line, relative, title) => {
    const anchor = anchorOfQuestion(knowledgeRoot, relative, title);
    const page = `/series/knowledge/${relative.replace(/\.md$/i, ".html")}`;
    return `→ 宝典：[${relative}《${title}》](${page}${anchor ? `#${anchor}` : ""})`;
  });
}

/** 列出全部场次，按日期新→旧；没有日期的排最后 */
export function listRealInterviews(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return [];
  const rows = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const dir = path.join(root, entry.name);
    const files = markdownFiles(dir);
    if (!files.length) continue;
    const { company, role, date } = parseFolderName(entry.name);
    rows.push({
      id: entry.name,
      kind: "real",
      series: "真实面试",
      company,
      role,
      startedAt: date,
      fileCount: files.length,
    });
  }
  return rows.sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
}

/**
 * 取一场的正文。id 只从上面扫出来的结果里查，不接受拼出来的路径。
 * 返回 { company, role, date, files: [{ name, markdown }] }。
 */
export function readRealInterview(root, id, { knowledgeRoot = "" } = {}) {
  const hit = listRealInterviews(root).find((row) => row.id === String(id ?? "").trim());
  if (!hit) throw new Error(`没有这场真实面试记录：${id || "(空)"}`);
  const dir = path.join(root, hit.id);
  return {
    ...hit,
    files: markdownFiles(dir).map((name) => ({
      name,
      markdown: linkKnowledge(stripFrontmatter(fs.readFileSync(path.join(dir, `${name}.md`), "utf8")), knowledgeRoot),
    })),
  };
}
