import fs from "node:fs";
import http from "node:http";

import { routes } from "./api/index.ts";
import { createRequestHandler } from "./api/router.ts";
import { serveStatic } from "./static.ts";
import { config } from "./infra/config/index.ts";
import { advanceInterview } from "./modules/interview/flow.ts";
import { expired } from "./modules/interview/timer.ts";
import {
  agent, db, listAttempts, persistTurn, questionIndex, rowToSession, sessionLocks,
} from "./context.ts";

/**
 * 服务入口：装路由表、装启动期副作用、起服务。
 * 业务逻辑一律不在这里 —— 路由在 api/，规则在 modules/，与 pi 打交道在 agent/。
 */

// 先把题库索引建好再开始监听：否则首屏那几个请求会打在一个空索引上
await questionIndex.refresh();

// 知识库改动后重建索引。350ms 防抖，一次保存常常触发多次 fs 事件。
let refreshTimer: NodeJS.Timeout | undefined;
fs.watch(config.knowledgeRoot, { recursive: true }, (_event, filename) => {
  if (!filename?.endsWith(".md")) return;
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    questionIndex.refresh().catch((error) => console.error("题库热更新失败", error));
  }, 350);
});

const server = http.createServer(createRequestHandler(routes, serveStatic));

/** 超时巡检：到点的会话自动收尾，否则用户关掉页面后那场会一直挂在 active */
setInterval(async () => {
  const rows = db.prepare("SELECT * FROM sessions WHERE status='active'").all();
  for (const row of rows) {
    const session = rowToSession(row as never);
    if (!session) continue;
    if (!expired(session) || sessionLocks.has(session.id)) continue;
    sessionLocks.add(session.id);
    try {
      const result = await advanceInterview({ session, ending: true, agent, listAttempts });
      persistTurn(result.session, null, result.messages);
    } catch (error) {
      console.error(`会话 ${session.id} 自动结束失败`, error);
    } finally {
      sessionLocks.delete(session.id);
    }
  }
}, 5_000).unref();

server.listen(config.port, config.host, () => {
  console.log(`面试助手：http://${config.host}:${config.port}`);
});
