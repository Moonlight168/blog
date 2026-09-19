import type { IncomingMessage, ServerResponse } from "node:http";

import { json, readJsonBody } from "./http.ts";
import { EVENT } from "../../shared/events.ts";

/**
 * 业务错误，带上要回给客户端的 HTTP 状态码。
 * 领域层抛它，router 统一翻译成响应 —— 各路由不再手写 try/catch。
 */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface RouteContext {
  params: Record<string, string>;
  query: URLSearchParams;
  body: any;
  request: IncomingMessage;
  response: ServerResponse;
}

export type Handler = (ctx: RouteContext) => Promise<unknown> | unknown;

export interface Route {
  method: string;
  pattern: string;
  handler: Handler;
  /** 置 true 时 handler 自己写 response（NDJSON 流式 / 二进制 PDF），router 不碰它 */
  stream?: boolean;
  /** 同上，用于非流式但自己写响应的（例如 PDF 字节） */
  raw?: boolean;
  /** 请求体不是 JSON（音频上传），router 不解析，handler 自己读 request */
  binary?: boolean;
  /** 成功时的状态码，默认 200。建资源用 201。 */
  status?: number;
}

interface Compiled {
  route: Route;
  segments: string[];
  literals: number;
}

function compile(routes: Route[]): Compiled[] {
  return routes
    .map((route) => {
      const segments = route.pattern.split("/").filter(Boolean);
      const literals = segments.filter((segment) => !segment.startsWith(":")).length;
      return { route, segments, literals };
    })
    // 字面量段多的优先：/api/interviews/real/:id 必须赢过 /api/interviews/:id
    .sort((a, b) => b.literals - a.literals);
}

export function matchRoute(
  routes: Route[],
  method: string,
  pathname: string,
): { route: Route; params: Record<string, string> } | null {
  return matchCompiled(compile(routes), method, pathname);
}

/** 在**已编译好**的路由表上匹配。线上走这条，省掉每请求一次的编译与排序。 */
export function matchCompiled(
  compiled: Compiled[],
  method: string,
  pathname: string,
): { route: Route; params: Record<string, string> } | null {
  const parts = pathname.split("/").filter(Boolean);
  for (const { route, segments } of compiled) {
    if (route.method !== method || segments.length !== parts.length) continue;
    const params: Record<string, string> = {};
    let matched = true;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      if (segment.startsWith(":")) params[segment.slice(1)] = decodeURIComponent(parts[index]);
      else if (segment !== parts[index]) { matched = false; break; }
    }
    if (matched) return { route, params };
  }
  return null;
}

/**
 * 错误 → HTTP 状态码。
 * HttpError 用自己带的码；其余一律 502 —— 走到这里的基本都是模型或上游服务出问题，
 * 500 会让人以为是本程序的 bug。
 */
export function statusFor(error: unknown): number {
  return error instanceof HttpError ? error.status : 502;
}

/**
 * 把路由表变成 http.createServer 的处理函数。
 *
 * 「handler 是否已自己写响应」不看标志位，看 response.headersSent ——
 * 流式与二进制两条路都在写之前先 writeHead，用这个判据不会漏。
 */
export function createRequestHandler(routes: Route[], serveStatic: (response: ServerResponse, pathname: string) => void) {
  // 路由表启动时就定死了，编译一次即可；放在 handler 里会让每个请求都重排一遍
  const compiled = compile(routes);
  return async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      // new URL 必须在 try 之内：request.url 畸形时它抛的异常否则绕过下面的 catch，
      // 不会被翻译成一条人话回给前端
      const url = new URL(request.url ?? "/", `http://${request.headers.host || "localhost"}`);
      if (!url.pathname.startsWith("/api/")) return serveStatic(response, url.pathname);

      const hit = matchCompiled(compiled, request.method ?? "GET", url.pathname);
      if (!hit) return json(response, 404, { error: "接口不存在" });

      const body = hit.route.binary || request.method === "GET" ? {} : await readJsonBody(request);
      const result = await hit.route.handler({
        params: hit.params,
        query: url.searchParams,
        body,
        request,
        response,
      });
      if (response.headersSent) return;      // handler 已经自己写完了
      if (response.destroyed) return;        // 客户端已经断开，写不出去
      json(response, hit.route.status ?? 200, result ?? null);
    } catch (error) {
      console.error(error);
      const message = (error as Error)?.message || "服务器错误";
      if (response.destroyed || response.writableEnded) return;   // 同上
      if (response.headersSent) {
        // 头已经发出去了（多半是 NDJSON 流中途出错），只能把错误写进流里
        response.end(`${JSON.stringify({ type: EVENT.error, error: message })}\n`);
        return;
      }
      json(response, statusFor(error), { error: message });
    }
  };
}

