import fs from "node:fs";
import path from "node:path";

import TurndownService from "turndown";

/** 可选的简历文件类型。图片等一律忽略。 */
const RESUME_EXTENSIONS = [".md", ".txt", ".html"];

/** 需要从 HTML 里整块剥掉的噪音标签（都有闭合标签，可成对匹配）。 */
const NOISE_TAGS = ["script", "style", "svg"];

function hasClass(node, name) {
  const value = node.getAttribute?.("class") ?? "";
  return value.split(/\s+/).includes(name);
}

function normalizeSlashes(value) {
  return value.split(path.sep).join("/");
}

function isResumeFile(file) {
  return RESUME_EXTENSIONS.includes(path.extname(file).toLowerCase());
}

/** 简历根目录下这个子目录放的是 JD，不是简历——扫描简历时要跳过它 */
export const JOBS_DIR_NAME = "jobs";

/**
 * 「已有简历」只列**简历本体**：命名符合 `姓名-目标岗位-毕业年限`（如 `黄锦锋-Java后端(AI应用)-27届`）
 * 的 HTML 文件（读取时转成 Markdown 供模型使用）。
 * 同目录的面试稿、个人优势、照片、以及同一份简历的 .txt/.md 副本都不会被列出来。
 */
const RESUME_NAME_PATTERN = /^[^-]+-.+-\d{2,4}届$/;

function isListedResume(file) {
  return path.extname(file).toLowerCase() === ".html"
    && RESUME_NAME_PATTERN.test(path.basename(file, path.extname(file)));
}

/**
 * 按「每人一个目录」的约定扫描简历：
 * 只进入 root 的子目录，root 自身散落的文档（如各类规范）不算简历。
 */
export function scanResumes(root) {
  const resolved = path.resolve(root);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) return [];

  const results = [];
  for (const entry of fs.readdirSync(resolved, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    if (entry.name === JOBS_DIR_NAME) continue;
    collect(path.join(resolved, entry.name), resolved, results);
  }

  return results
    .map(({ name, file }) => {
      const dir = name.split("/")[0];
      return {
        // HTML 展示成 .md：读取时会被转成 markdown，列表里不该暴露 .html
        name: path.extname(name).toLowerCase() === ".html" ? `${name.slice(0, -5)}.md` : name,
        path: file,
        // 一级子目录（按人分组用），也便于前端按目录筛选
        dir,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, "zh"));
}

function collect(directory, root, results) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(full, root, results);
    else if (entry.isFile() && isListedResume(full)) {
      results.push({ name: normalizeSlashes(path.relative(root, full)), file: full });
    }
  }
}

/** 扫描 JD 目录（平铺，不按人分组）；显示名去掉文件后缀。 */
export function scanJobs(root) {
  const dir = path.join(path.resolve(root), JOBS_DIR_NAME);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && isResumeFile(entry.name))
    .map((entry) => ({
      name: entry.name.replace(/\.[^.]+$/, ""),
      path: path.join(dir, entry.name),
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "zh"));
}

/** 选中值必须落在简历目录内，且是受支持的简历类型。 */
export function isAllowedResume(file, root) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(file);
  const relative = path.relative(resolvedRoot, resolved);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative) && isResumeFile(resolved);
}

/** JD 允许的路径与简历同规则（都在简历目录内）。 */
export function isAllowedJob(file, root) {
  return isAllowedResume(file, root);
}

/**
 * 读成 markdown：
 * .md / .txt 原样返回；.html 先剥掉 head 与样式类噪音，再转 markdown。
 */
export function readResume(file) {
  const ext = path.extname(file).toLowerCase();
  const raw = fs.readFileSync(file, "utf8");
  if (ext !== ".html") return raw;
  return htmlToMarkdown(raw);
}

export function htmlToMarkdown(html) {
  const bodyStart = html.search(/<body[^>]*>/i);
  let source = bodyStart >= 0 ? html.slice(bodyStart) : html;
  for (const tag of NOISE_TAGS) {
    source = source.replace(new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, "gi"), " ");
  }
  // <img> 是空元素、没有闭合标签，成对正则匹配不到它——不单独删掉的话，
  // 内联的证件照 base64（动辄 6 万字符）会占满简历摘要，正文反而被截掉。
  source = source.replace(/<img\b[^>]*>/gi, " ");
  source = source.replace(/<[^>]+\/>/g, " "); // 其它自闭合标签（如 <br/>）

  const service = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

  service.addRule("sectionTitle", {
    filter: (node) => node.nodeName === "DIV" && hasClass(node, "section-title"),
    replacement: (content) => `\n\n## ${content.trim()}\n\n`,
  });

  service.addRule("entryRow", {
    filter: (node) => node.nodeName === "DIV" && hasClass(node, "row-item"),
    replacement: (_content, node) => {
      const left = node.querySelector(".row-left");
      const right = node.querySelector(".row-right");
      const parts = left
        ? [...left.querySelectorAll("strong, span")].map((item) => item.textContent.trim()).filter(Boolean)
        : [];
      const title = parts.length ? parts.join(" · ") : (left?.textContent ?? "").trim();
      const period = (right?.textContent ?? "").trim();
      return `\n\n### ${title}${period ? `　*${period}*` : ""}\n\n`;
    },
  });

  service.addRule("dutyLabel", {
    filter: (node) => node.nodeName === "DIV" && hasClass(node, "duty-label"),
    replacement: (content) => `\n\n**${content.trim()}**\n\n`,
  });

  const markdown = service.turndown(source);
  return markdown
    // 兜底：任何残留的内联资源（base64 图片等）对模型都没有意义，只会挤占上下文
    .replace(/data:[^;)"'\s]+;base64,[A-Za-z0-9+/=]+/gi, "")
    .replace(/!\[[^\]]*\]\(\s*\)/g, "")   // 链接被清空后留下的空图片语法
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * 就地把某个键写回 .env：已存在则按行替换，不存在则追加。
 * 拒绝换行与等号——否则可以凭空插入别的环境变量。
 */
export function updateEnvFile(file, key, value) {
  if (/[\r\n=]/.test(value)) throw new Error(`简历目录含非法字符（不允许换行或等号）：${JSON.stringify(value)}`);

  const exists = fs.existsSync(file);
  const original = exists ? fs.readFileSync(file, "utf8") : "";
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const line = `${key}=${value}`;

  const lines = original.length ? original.split(/\r?\n/) : [];
  const index = lines.findIndex((item) => item.startsWith(`${key}=`));
  if (index >= 0) lines[index] = line;
  else lines.push(line);

  const text = lines.join(eol).replace(new RegExp(`(${eol}){2,}$`), eol);
  fs.writeFileSync(file, text.endsWith(eol) ? text : `${text}${eol}`);
}
