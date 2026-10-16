import "./test-data-dir.ts";
import http from "node:http";
import { once } from "node:events";
import { registerHooks } from "node:module";
import type { TestContext } from "node:test";
import { createRequestHandler, type Route } from "../../server/api/router.ts";

// 必须在动态 import 路由之前替换驱动，context 的启动代码也不能接触真实数据库。
registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === "node:sqlite"
      ? new URL("./memory-database.ts", import.meta.url).href
      : specifier, context);
  },
});

const { config } = await import("../../server/infra/config/index.ts");
Object.assign(config.chat, { baseUrl: "http://127.0.0.1:1/v1", apiKey: "test-only", model: "test-model" });
Object.assign(config.embedding, { baseUrl: "", apiKey: "", model: "" });

export async function serveRoutes(t: TestContext, routes: Route[]): Promise<string> {
  const server = http.createServer(createRequestHandler(routes, (response) => {
    response.writeHead(404).end();
  }));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => { server.closeAllConnections(); server.close(); });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("测试 HTTP 服务未启动");
  return `http://127.0.0.1:${address.port}`;
}
