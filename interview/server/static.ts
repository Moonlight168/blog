import fs from "node:fs";
import path from "node:path";
import type { ServerResponse } from "node:http";

import { json } from "./api/http.ts";
import { config } from "./infra/config/index.ts";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
};

/** 服务构建产物；非文件路径一律回 index.html 交给前端路由 */
export function serveStatic(response: ServerResponse, pathname: string): void {
  const dist = path.join(config.appRoot, "dist");
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  let file = path.resolve(dist, relative);
  if (!file.startsWith(path.resolve(dist)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(dist, "index.html");
  }
  if (!fs.existsSync(file)) return json(response, 404, { error: "前端尚未构建，请运行 npm run build" });

  const ext = path.extname(file);
  // index.html 必须每次回源：它指向带哈希的资源文件名，缓存住就会一直加载旧版页面，
  // 表现是「改了代码但页面没变」。带哈希的 js/css 内容变了文件名就变，可以长缓存。
  const cacheControl = ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable";
  response.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": cacheControl });
  fs.createReadStream(file).pipe(response);
}
