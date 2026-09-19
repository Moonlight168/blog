import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { HttpError, type Route } from "./router.ts";
import { PATTERN, type DocumentKind } from "../../shared/routes.ts";
import { EVENT } from "../../shared/events.ts";
import { config } from "../infra/config/index.ts";
import { decorateCommits } from "../infra/git/subject.ts";
import { requireRepo } from "../infra/git/repo.ts";
import { setDirectory } from "../infra/config/env-dir.ts";
import { editorAgent } from "../context.ts";
import {
  commitDocument, discardDocument, documentContentAt, documentHistory, listResumeGroups, listSelfIntros,
  readDocument, resolverOf, rollbackDocument, writeDocument,
} from "../modules/document/index.ts";
import { findBrowser, htmlToPdf, pdfFileName } from "../modules/document/pdf.ts";

/**
 * 简历编辑稿与自我介绍：两个可版本化文档实例的 HTTP 边界。
 *
 * 领域层对两者一视同仁（正文一律叫 content），前端看到的字段名不同
 * （简历是 html、自我介绍是 markdown）—— 转换只发生在这个文件里。
 */

export function kindOf(params: Record<string, string>): DocumentKind {
  const kind = params.kind;
  if (kind !== "resume" && kind !== "self-intro") throw new HttpError(404, `未知的文档类型：${kind}`);
  return kind;
}

function fileOf(body: any): string {
  return String(body.file ?? "");
}

function contentOf(body: any, kind: DocumentKind): string {
  return String((kind === "resume" ? body.html : body.markdown) ?? "");
}

/**
 * 保存的共同流程：先确认能提交，再把「编辑器打开期间被别处改过」的那份存档，最后写盘 + 提交。
 *
 * 不做「报冲突让你二选一」—— 那会卡住保存；先存档则两边都不会丢，git 里都能翻到。
 */
async function saveFlow(kind: DocumentKind, input: any): Promise<unknown> {
  const file = fileOf(input);
  const body = contentOf(input, kind);
  if (!body.trim()) throw new HttpError(400, kind === "resume" ? "简历内容不能为空" : "自我介绍不能为空");

  const current = readDocument(kind, config.resumeDir, file);
  // 没有可提交的仓库就整个拒绝，一个字节都不写：写下去会变成
  // 「盘上是新的、历史里没有、界面还说已保存」，比直接报错难查得多
  try {
    requireRepo(current.path);
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }

  const notices: string[] = [];
  const externallyChanged = current.mtime !== null
    && typeof input.baseMtime === "number"
    && Math.abs(current.mtime - input.baseMtime) > 1;
  if (externallyChanged) {
    const archived = commitDocument(kind, config.resumeDir, file, kind === "resume" ? "简历：外部改动存档" : "自我介绍：外部改动存档");
    notices.push(archived.committed
      ? `文件在编辑器外被改过，已把外部版本存成 ${archived.hash}`
      : "文件在编辑器外被改过，内容与磁盘一致，无需存档");
  }

  const written = writeDocument(kind, config.resumeDir, file, body);
  // 先写盘、再问模型：agent 要跑 `git diff`，改动得先落到工作区才有得看。
  // 这也是它比「改前改后两份全文」强的地方 —— 它看的是**真实改动的行**，编不出来。
  const scope = kind === "resume" ? "简历" : "自我介绍";
  const message = String(input.message ?? "").trim()
    || await editorAgent.commitMessage({
      file: current.file,
      dir: path.dirname(current.path),
      fallback: `${scope}：编辑器保存`,
    });
  const commit = commitDocument(kind, config.resumeDir, file, message);
  return { ...written, commit, externallyChanged, notices };
}

/**
 * 让 agent 自己改文件。
 *
 * 模型用 pi 的 read/edit/write 直接改盘上那份稿子，服务端**不看它改了什么** ——
 * 没有输出校验、没有「找—换」契约、没有样式比对。改坏有两条退路：编辑器里的
 * 「放弃改动」（git checkout）与历史里回滚到某一版。
 *
 * 「改没改」由**前后文件内容比对**得出，不需要模型报告 —— 于是前端的
 * {action, reply, html} 契约原样保留。
 */
async function reviseFlow(
  kind: DocumentKind,
  body: any,
  onEvent?: (event: { type: string; [key: string]: unknown }) => void,
  signal?: AbortSignal,
): Promise<unknown> {
  const instruction = String(body.instruction ?? "").trim();
  if (!instruction) throw new HttpError(400, "请说明想怎么改");

  const file = fileOf(body);
  const target = resolverOf(kind).resolve(config.resumeDir, file);
  if (!target) throw new HttpError(404, resolverOf(kind).missing(file));

  const before = fs.existsSync(target.path) ? fs.readFileSync(target.path, "utf8") : "";
  const outcome = await editorAgent.revise({
    kind,
    file: target.file,
    dir: path.dirname(target.path),
    instruction,
    onEvent,
    signal,
  });
  const changed = outcome.content !== before;

  return {
    action: changed ? "revise" : "answer",
    reply: outcome.reply,
    ...(changed ? { [contentKeyOf(kind)]: outcome.content } : {}),
  };
}

function readFlow(kind: DocumentKind, query: URLSearchParams): unknown {
  const wanted = query.get("file") ?? "";
  const resolver = resolverOf(kind);

  if (kind === "resume") {
    const people = listResumeGroups(config.resumeDir).map((group) => ({
      id: group.id,
      label: group.label,
      resumes: group.resumes.map((item) => ({ file: item.file, name: item.name })),
    }));
    const pick = wanted || people[0]?.resumes[0]?.file || "";
    if (!pick) {
      return {
        people, file: "", name: "", path: "", html: "", mtime: null,
        versioned: false, uncommitted: false,
        exportDir: config.resumeExportDir, browser: findBrowser(config.browserPath),
      };
    }
    if (!resolver.resolve(config.resumeDir, pick)) throw new HttpError(404, `没有这份简历：${pick}`);
    const current = readDocument(kind, config.resumeDir, pick);
    return {
      people, file: current.file, name: current.name, path: current.path,
      html: current.content, mtime: current.mtime, versioned: Boolean(current.repo),
      uncommitted: current.uncommitted,
      exportDir: config.resumeExportDir, browser: findBrowser(config.browserPath),
    };
  }

  const files = listSelfIntros(config.resumeDir).map((item) => ({ file: item.file, name: item.name }));
  const target = resolver.resolve(config.resumeDir, wanted) ?? resolver.fallback(config.resumeDir);
  if (!target) {
    return { files, file: "", name: "", path: "", exists: false, markdown: "", mtime: null, versioned: false, uncommitted: false };
  }
  const current = readDocument(kind, config.resumeDir, target.file);
  return {
    files,
    file: current.file, name: current.name, path: current.path, exists: current.exists,
    markdown: current.content, mtime: current.mtime,
    versioned: Boolean(current.repo), uncommitted: current.uncommitted,
  };
}

/** 正文在协议里叫什么，由文档类型决定；领域层只认 content */
function contentKeyOf(kind: DocumentKind): "html" | "markdown" {
  return kind === "resume" ? "html" : "markdown";
}

/** 6 个操作对两种文档是同构的，所以只写一遍、按 :kind 分派 */
const shared: Route[] = [
  { method: "GET", pattern: PATTERN.document, handler: ({ params, query }) => readFlow(kindOf(params), query) },
  { method: "POST", pattern: PATTERN.document, handler: ({ params, body }) => saveFlow(kindOf(params), body) },
  {
    /**
     * 让 AI 改这份文档。带 stream:true 时走 NDJSON —— 改稿要 5～10 秒，
     * 全程只转一个圈用户不知道在干什么，得把「正在读」「正在改」推出来。
     */
    method: "POST",
    pattern: `${PATTERN.document}/revise`,
    stream: true,
    handler: async ({ params, body, response }) => {
      const kind = kindOf(params);
      const streaming = body.stream === true;
      const emit = (event: { type: string; [key: string]: unknown }) => {
        if (!streaming || response.destroyed || response.writableEnded) return;
        if (!response.headersSent) {
          response.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" });
        }
        response.write(`${JSON.stringify(event)}\n`);
      };

      /**
       * 点「停止」、关页面、断网 —— 三者在服务端都表现为响应关闭。
       * 必须把它转成中断信号发给模型：模型此刻正在**直接改文件**，不管它的话
       * 它会一直改到底，而这边早已不再等它，用户回来看到一份来路不明的稿子。
       */
      const controller = new AbortController();
      const abortOnDisconnect = () => { if (!response.writableEnded) controller.abort(); };
      response.on("close", abortOnDisconnect);

      try {
        const payload = await reviseFlow(kind, body, emit, controller.signal);
        if (streaming) {
          if (!response.headersSent) response.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" });
          response.end(`${JSON.stringify({ type: EVENT.result, data: payload })}\n`);
          return;
        }
        return payload;
      } catch (error) {
        // 客户端已经走了：连接没了，写什么都没人看，也没必要当成错误往上抛
        if (controller.signal.aborted) return;
        if (!streaming) throw error;
        if (!response.headersSent) response.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" });
        response.end(`${JSON.stringify({ type: EVENT.error, error: (error as Error).message || "AI 处理失败" })}\n`);
      } finally {
        response.off("close", abortOnDisconnect);
      }
    },
  },
  {
    method: "GET",
    pattern: `${PATTERN.document}/history`,
    handler: ({ params, query }) => {
      const kind = kindOf(params);
      return { commits: decorateCommits(documentHistory(kind, config.resumeDir, query.get("file") ?? "")) };
    },
  },
  {
    method: "POST",
    pattern: `${PATTERN.document}/history`,
    handler: ({ params, body }) => {
      const kind = kindOf(params);
      try {
        return { [contentKeyOf(kind)]: documentContentAt(kind, config.resumeDir, fileOf(body), String(body.hash ?? "")) };
      } catch (error) {
        throw new HttpError(404, (error as Error).message);
      }
    },
  },
  {
    // 回滚只写工作区，不提交 —— 用户满意了再点「保存」才成一版
    method: "POST",
    pattern: `${PATTERN.document}/rollback`,
    handler: ({ params, body }) => {
      const kind = kindOf(params);
      try {
        const result = rollbackDocument(kind, config.resumeDir, fileOf(body), String(body.hash ?? ""));
        return { ...result, [contentKeyOf(kind)]: result.content };
      } catch (error) {
        throw new HttpError(400, (error as Error).message);
      }
    },
  },
  {
    /**
     * 放弃改动：把工作区退回 HEAD 那一版。
     *
     * 这是「模型直接改文件、服务器不做任何校验」的逃生口 —— 改坏了就一键回到上次保存的样子。
     * 与 rollback 的区别：那个回到历史面板里挑的某一版，这个只回 HEAD。
     */
    method: "POST",
    pattern: `${PATTERN.document}/discard`,
    handler: ({ params, body }) => {
      const kind = kindOf(params);
      try {
        const result = discardDocument(kind, config.resumeDir, fileOf(body));
        return { ...result, [contentKeyOf(kind)]: result.content };
      } catch (error) {
        throw new HttpError(400, (error as Error).message);
      }
    },
  },
];

/** 简历专属：自我介绍不导 PDF，也没有导出目录 */
const resumeOnly: Route[] = [
  {
    /** 预览与导出走同一条渲染：预览把 PDF 字节直接回给前端显示 */
    method: "POST",
    pattern: PATTERN.documentPdf,
    raw: true,
    handler: async ({ body, response }) => {
      const html = String(body.html ?? "");
      if (!html.trim()) throw new HttpError(400, "简历内容不能为空");
      const out = path.join(os.tmpdir(), `resume-preview-${process.pid}-${Date.now()}.pdf`);
      // 预览的是编辑器里还没保存的 HTML，但图片仍在简历目录里，得靠这份文件定位基准目录
      const source = resolverOf("resume").resolve(config.resumeDir, fileOf(body));
      try {
        await htmlToPdf({ browser: config.browserPath, html, outPath: out, sourceFile: source?.path });
        const bytes = fs.readFileSync(out);
        response.writeHead(200, { "Content-Type": "application/pdf", "Content-Length": bytes.length, "Cache-Control": "no-store" });
        response.end(bytes);
      } finally {
        fs.rmSync(out, { force: true });
      }
    },
  },
  {
    method: "POST",
    pattern: PATTERN.documentExportDir,
    handler: ({ body }) => ({
      exportDir: setDirectory(body.dir, "INTERVIEW_RESUME_EXPORT_DIR", (dir) => { config.resumeExportDir = dir; }, "导出目录"),
    }),
  },
  {
    method: "POST",
    pattern: PATTERN.documentExport,
    handler: async ({ body }) => {
      const html = String(body.html ?? "");
      if (!html.trim()) throw new HttpError(400, "简历内容不能为空");
      const file = resolverOf("resume").resolve(config.resumeDir, fileOf(body));
      if (!file) throw new HttpError(400, "没有这份简历");
      const name = pdfFileName(body.name, file.name);
      const out = path.join(config.resumeExportDir, name);
      await htmlToPdf({ browser: config.browserPath, html, outPath: out, sourceFile: file.path });
      return { path: out, name, bytes: fs.statSync(out).size };
    },
  },
];

export default [...shared, ...resumeOnly] as Route[];
