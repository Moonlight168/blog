import { execFile, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { commitPathAt } from "./commit-path.mjs";
import { findRepoRoot } from "./self-intro.mjs";

/**
 * 简历文档：按人分组列出、读写 HTML、生成 PDF。
 *
 * 简历是自包含的 HTML（样式内联、带 `@page { size: A4 }` 打印规则），
 * 所以「A4 预览」和「导出 PDF」用的是同一份文件、同一个渲染器——预览即所得。
 */

const JOBS_DIR = "jobs";

/** 生成 PDF 用的浏览器：优先配置，其次常见安装路径 */
const BROWSER_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

export function findBrowser(configured = "") {
  for (const candidate of [configured, ...BROWSER_CANDIDATES]) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return "";
}

/**
 * 按一级目录（= 一个人）分组列出简历。
 * 人员显示名取该目录下简历文件名的第一段（张三-Java后端….html → 张三）；
 * 各份前缀不一致时退回目录名，不硬猜。
 */
export function listResumeGroups(resumeDir) {
  const root = path.resolve(resumeDir);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return [];
  const groups = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === JOBS_DIR) continue;
    const dir = path.join(root, entry.name);
    const resumes = fs.readdirSync(dir, { withFileTypes: true })
      .filter((item) => item.isFile() && /\.html?$/i.test(item.name))
      .map((item) => {
        const full = path.join(dir, item.name);
        return {
          file: item.name,
          name: path.basename(item.name).replace(/\.[^.]+$/, ""),
          path: full,
          // 最近改过的排前面：进页面默认停在「你当前在维护的那份」上，
          // 而不是名字排序碰巧第一个的那份
          mtime: fs.statSync(full).mtimeMs,
        };
      })
      .sort((a, b) => b.mtime - a.mtime);
    if (!resumes.length) continue;
    groups.push({ id: entry.name, label: personNameOf(resumes) || entry.name, resumes });
  }
  return groups.sort((a, b) => a.id.localeCompare(b.id));
}

function personNameOf(resumes) {
  const heads = resumes.map((item) => item.name.split("-")[0]).filter(Boolean);
  if (!heads.length) return "";
  return heads.every((head) => head === heads[0]) ? heads[0] : "";
}

/** 只认「扫描结果里出现过的那份」，不接受拼出来的路径 */
export function resolveResumeDoc(resumeDir, file) {
  const wanted = String(file ?? "").trim();
  if (!wanted) return null;
  for (const group of listResumeGroups(resumeDir)) {
    const hit = group.resumes.find((item) => item.file === wanted || item.path === wanted);
    if (hit) return hit;
  }
  return null;
}

export function readResumeDoc(resumeDir, file) {
  const target = resolveResumeDoc(resumeDir, file);
  if (!target) throw new Error(`没有这份简历：${file || "(空)"}`);
  return {
    file: target.file,
    name: target.name,
    path: target.path,
    html: fs.readFileSync(target.path, "utf8"),
    mtime: fs.statSync(target.path).mtimeMs,
    repo: findRepoRoot(target.path),
  };
}

/** 原子写：先写临时文件再 rename，中途失败不会留下半截文件 */
export function writeResumeDoc(resumeDir, file, html) {
  const target = resolveResumeDoc(resumeDir, file);
  if (!target) throw new Error(`没有这份简历：${file || "(空)"}`);
  if (!String(html).trim()) throw new Error("简历内容不能为空");
  // 原文件若不是 CRLF，这里也不该把它改过去（浏览器 textarea 会把 CRLF 归一成 LF）
  const eol = fs.readFileSync(target.path, "utf8").includes("\r\n") ? "\r\n" : "\n";
  const content = String(html).replace(/\r\n/g, "\n").replace(/\n/g, eol);
  const temp = `${target.path}.${process.pid}.tmp`;
  fs.writeFileSync(temp, content, "utf8");
  fs.renameSync(temp, target.path);
  return { file: target.file, path: target.path, mtime: fs.statSync(target.path).mtimeMs };
}

/** 把简历提交进它所在的本地仓库（src/private 下的独立仓库，与自我介绍同一套保护） */
export function commitResumeDoc(resumeDir, file, message) {
  const target = resolveResumeDoc(resumeDir, file);
  if (!target) return { committed: false, reason: `没有这份简历：${file || "(空)"}` };
  const repo = findRepoRoot(target.path);
  if (!repo) return { committed: false, reason: "这个文件不在任何 git 仓库里，只写入了磁盘" };
  const relative = path.relative(repo, target.path).split(path.sep).join("/");
  const git = (args, allowFailure = false) => gitIn(repo, args, allowFailure);
  git(["add", "--", relative]);
  if (!(git(["status", "--porcelain", "--", relative], true) ?? "").trim()) {
    return { committed: false, reason: "内容没有变化，无需提交" };
  }
  if (git(["commit", "-m", message, "--", relative], true) === null) {
    return { committed: false, reason: "提交失败（可能是 git 用户信息未配置）" };
  }
  return { committed: true, hash: git(["rev-parse", "--short", "HEAD"]).trim() };
}

/** git 操作；allowFailure 时失败返回 null 而不是抛错 */
function gitIn(repo, args, allowFailure = false) {
  try {
    return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    if (allowFailure) return null;
    throw new Error(`git ${args[0]} 失败：${String(error.stderr || error.message).trim().split("\n").at(-1)}`);
  }
}

/** 文件在它所在仓库里的相对路径；不在仓库里返回 null */
function repoRelative(target) {
  const repo = findRepoRoot(target.path);
  return repo ? { repo, relative: path.relative(repo, target.path).split(path.sep).join("/") } : null;
}

/** 提交历史（新→旧），带每次改了多少行——历史面板的列表就是它 */
export function resumeDocHistory(resumeDir, file, limit = 50) {
  const target = resolveResumeDoc(resumeDir, file);
  const info = target ? repoRelative(target) : null;
  if (!info) return [];
  const raw = gitIn(info.repo, ["log", `--max-count=${limit}`, "--follow",
    "--format=%x1e%H%x1f%aI%x1f%s", "--numstat", "--", info.relative], true);
  if (!raw) return [];
  const commits = [];
  for (const chunk of raw.split("\x1e").filter((part) => part.trim())) {
    const [meta, ...rest] = chunk.split("\n");
    const [hash, date, subject] = meta.split("\x1f");
    if (!hash) continue;
    let added = 0;
    let deleted = 0;
    for (const line of rest) {
      const cells = line.split("\t");
      if (cells.length >= 2 && /^\d+$/.test(cells[0]) && /^\d+$/.test(cells[1])) {
        added += Number(cells[0]);
        deleted += Number(cells[1]);
      }
    }
    commits.push({ hash, date, subject, added, deleted });
  }
  return commits;
}

/** 取某个版本的内容（预览用），不回写任何东西 */
export function readResumeDocAt(resumeDir, file, hash) {
  if (!/^[0-9a-f]{7,40}$/i.test(String(hash))) throw new Error("提交号不合法");
  const target = resolveResumeDoc(resumeDir, file);
  if (!target) throw new Error(`没有这份简历：${file || "(空)"}`);
  const info = repoRelative(target);
  if (!info) throw new Error("这个文件不在任何 git 仓库里，无法回溯历史");
  // 先按当前路径取；改过名的那几版要回头查当时的名字（简历从 resume/ 挪进 hjf/ 就是这种）。
  // 名字查不到就不要再拿空路径去 show——`<hash>:` 会被 git 当成根 tree，返回一坨非空的东西。
  let content = gitIn(info.repo, ["show", `${hash}:${info.relative}`], true);
  if (content === null) {
    const then = commitPathAt(info.repo, info.relative, hash);
    content = then ? gitIn(info.repo, ["show", `${hash}:${then}`], true) : null;
  }
  if (content === null) throw new Error("这一版里没有这个文件");
  return content;
}

/** 回滚到某一版：内容写回去再提交一次——历史不丢，回滚本身也算一版 */
export function rollbackResumeDoc(resumeDir, file, hash, message = "简历：回滚到历史版本") {
  const html = readResumeDocAt(resumeDir, file, hash);
  const written = writeResumeDoc(resumeDir, file, html);
  return { ...written, html, commit: commitResumeDoc(resumeDir, file, message) };
}

/**
 * 把 HTML 里相对路径（`<img src="photo.jpg">`、CSS 的 url()）的解析基准钉回简历所在目录。
 *
 * 必须做这一步：渲染是在临时目录里进行的（见 htmlToPdf），不钉基准的话
 * `photo.jpg` 会被解析成「临时目录/photo.jpg」→ 找不到 → 打出浏览器那张裂图占位框。
 * 自包含的简历（照片已内联成 base64）看不出问题，所以这个坑只在引用外部图片的那几份上暴露。
 *
 * 插在 <head> 之后是有讲究的：<base> 只对出现在它之后的 URL 生效。
 */
export function withBaseHref(html, filePath) {
  const source = String(html ?? "");
  const file = String(filePath ?? "").trim();
  if (!file) return source;
  if (/<base[\s>]/i.test(source)) return source;   // 已有 base，尊重作者写法，也避免出现第二个
  const dir = path.dirname(path.resolve(file));
  const tag = `<base href="${pathToFileURL(dir + path.sep).href}">`;
  if (/<head[^>]*>/i.test(source)) return source.replace(/<head[^>]*>/i, (head) => head + tag);
  return tag + source;                             // 连 head 都没有，就直接顶到最前面
}

/**
 * 等 PDF 真正落盘。
 *
 * 为什么不能「浏览器退出即成功」：Chrome 拿到参数后会把自己重新拉起来渲染——
 * 命令行里会多出 `--user-data-dir=…\HeadlessChrome…`、`--do-not-de-elevate`——
 * 父进程立刻以 0 退出，真正的文件还要再过几百毫秒才写出来（本机实测差 716ms）。
 * 只查一次 existsSync 就会把好好的渲染报成「浏览器没有产出文件」，
 * 而调用方的 finally 已经把那个路径删了，文件随后落下来就成了临时目录里的垃圾。
 *
 * `since` 是发起渲染的时刻：导出是覆盖写，光看「文件存在」会把上一版当成这一版。
 */
export async function waitForFile(outPath, { since = 0, timeoutMs = 30_000, intervalMs = 120 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const stat = fs.statSync(outPath);
      if (stat.size > 0 && stat.mtimeMs >= since) return outPath;
    } catch {
      /* 还没写出来，接着等 */
    }
    if (Date.now() >= deadline) throw new Error(`等不到浏览器写出 PDF：${outPath}`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/**
 * 用本机浏览器无头模式把 HTML 打成 PDF。
 * 实测：起一次 Chrome 约 3.4 秒、常驻浏览器约 2.4 秒——瓶颈是打印排版本身，
 * 所以预览走「手动刷新」而不是逐键实时刷新。
 */
export async function renderPdf({ browser, htmlPath, outPath }) {
  const bin = findBrowser(browser);
  if (!bin) throw new Error("找不到 Chrome 或 Edge，无法生成 PDF（可用 INTERVIEW_BROWSER 指定路径）");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const startedAt = Date.now();
  const stderr = await new Promise((resolve, reject) => {
    execFile(bin, [
      "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
      `--print-to-pdf=${outPath}`, pathToFileURL(htmlPath).href,
    ], { timeout: 60_000, windowsHide: true }, (error, _stdout, stderr) => {
      if (error) {
        reject(new Error(`生成 PDF 失败：${String(stderr || error.message).trim().split("\n").at(-1).slice(0, 200)}`));
        return;
      }
      resolve(String(stderr ?? ""));
    });
  });
  try {
    return await waitForFile(outPath, { since: startedAt });
  } catch {
    // 等不到时把浏览器自己吐的话一并带出去，否则只剩「没有产出文件」，无从下手
    const tail = stderr.trim().split("\n").at(-1)?.slice(0, 200);
    throw new Error(`生成 PDF 失败：浏览器没有产出文件${tail ? `（${tail}）` : ""}`);
  }
}

/** 导出文件名：默认用简历名，用户可改；只允许文件名，不接受路径 */
export function pdfFileName(raw, fallbackName) {
  const source = String(raw ?? "").trim() || `${fallbackName}.pdf`;
  const name = source.replace(/[\\/:*?"<>|]/g, "").replace(/\.pdf$/i, "").trim() || fallbackName;
  return `${name}.pdf`;
}

/** 把 HTML 写成临时文件 → 打 PDF → 返回 PDF 路径（预览与导出共用） */
export async function htmlToPdf({ browser, html, outPath, sourceFile = "" }) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-pdf-"));
  const tempHtml = path.join(tempDir, "resume.html");
  try {
    // 临时目录里没有 photo.jpg——先把基准钉回简历目录，照片才打得出来
    fs.writeFileSync(tempHtml, withBaseHref(html, sourceFile), "utf8");
    await renderPdf({ browser, htmlPath: tempHtml, outPath });
    return outPath;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
