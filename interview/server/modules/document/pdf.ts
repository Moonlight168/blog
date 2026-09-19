import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * 用本机浏览器无头模式把 HTML 打成 PDF。
 *
 * 简历是自包含的 HTML（样式内联、带 `@page { size: A4 }` 打印规则），
 * 所以「A4 预览」和「导出 PDF」用的是同一份文件、同一个渲染器 —— 预览即所得。
 */

/** 生成 PDF 用的浏览器：优先配置，其次常见安装路径 */
const BROWSER_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

export function findBrowser(configured = ""): string {
  for (const candidate of [configured, ...BROWSER_CANDIDATES]) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return "";
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
export function withBaseHref(html: string, filePath?: string): string {
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
 * 只查一次 existsSync 就会把好好的渲染报成「浏览器没有产出文件」。
 *
 * `since` 是发起渲染的时刻：导出是覆盖写，光看「文件存在」会把上一版当成这一版。
 */
export async function waitForFile(
  outPath: string,
  { since = 0, timeoutMs = 30_000, intervalMs = 120 }: { since?: number; timeoutMs?: number; intervalMs?: number } = {},
): Promise<string> {
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
 * 实测：起一次 Chrome 约 3.4 秒、常驻浏览器约 2.4 秒 —— 瓶颈是打印排版本身，
 * 所以预览走「手动刷新」而不是逐键实时刷新。
 */
export async function renderPdf({ browser, htmlPath, outPath }: { browser: string; htmlPath: string; outPath: string }): Promise<string> {
  const bin = findBrowser(browser);
  if (!bin) throw new Error("找不到 Chrome 或 Edge，无法生成 PDF（可用 INTERVIEW_BROWSER 指定路径）");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const startedAt = Date.now();
  const stderr = await new Promise<string>((resolve, reject) => {
    execFile(bin, [
      "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
      `--print-to-pdf=${outPath}`, pathToFileURL(htmlPath).href,
    ], { timeout: 60_000, windowsHide: true }, (error, _stdout, stderr) => {
      if (error) {
        reject(new Error(`生成 PDF 失败：${String(stderr || error.message).trim().split("\n").at(-1)!.slice(0, 200)}`));
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
export function pdfFileName(raw: unknown, fallbackName: string): string {
  const source = String(raw ?? "").trim() || `${fallbackName}.pdf`;
  const name = source.replace(/[\\/:*?"<>|]/g, "").replace(/\.pdf$/i, "").trim() || fallbackName;
  return `${name}.pdf`;
}

/** 把 HTML 写成临时文件 → 打 PDF → 返回 PDF 路径（预览与导出共用） */
export async function htmlToPdf({ browser, html, outPath, sourceFile = "" }: {
  browser: string; html: string; outPath: string; sourceFile?: string;
}): Promise<string> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-pdf-"));
  const tempHtml = path.join(tempDir, "resume.html");
  try {
    // 临时目录里没有 photo.jpg —— 先把基准钉回简历目录，照片才打得出来
    fs.writeFileSync(tempHtml, withBaseHref(html, sourceFile), "utf8");
    await renderPdf({ browser, htmlPath: tempHtml, outPath });
    return outPath;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
