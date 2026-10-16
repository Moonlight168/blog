import { serveRoutes } from "../helpers/api-fixture.ts";
import { DatabaseSync } from "../helpers/memory-database.ts";
import assert from "node:assert/strict";
import test from "node:test";
import { API } from "../../shared/routes.ts";
import type { Session } from "../../shared/types.ts";

const { default: routes } = await import("../../server/api/interviews.ts");

test("HTTP 暂停后继续恢复 active，并扣除暂停时间", async (t) => {
  let row: Record<string, unknown> = {
    id: "pause-test", status: "active", started_at: new Date().toISOString(),
    duration_minutes: 30, paused_ms: 0,
  };
  DatabaseSync.statement = (sql) => {
    if (sql.startsWith("SELECT * FROM sessions")) return { get: () => row };
    if (sql.startsWith("INSERT INTO sessions")) return { run: (...args) => {
      row = { ...row, status: args[6], paused_at: args[17], paused_ms: args[18] };
    } };
    if (sql.includes("FROM messages")) return { all: () => [] };
    throw new Error(`未预期的查询：${sql}`);
  };
  const base = await serveRoutes(t, routes);
  const paused = await fetch(base + API.interviewPause("pause-test"), { method: "POST" });
  const pauseBody = await paused.json() as { session: Session };
  assert.equal(paused.status, 200, JSON.stringify(pauseBody));
  assert.equal(pauseBody.session.status, "paused");
  assert.ok(pauseBody.session.pausedAt);

  row.paused_at = new Date(Date.now() - 5_000).toISOString();
  const resumed = await fetch(base + API.interviewResume("pause-test"), { method: "POST" });
  const resumeBody = await resumed.json() as { session: Session };
  assert.equal(resumed.status, 200, JSON.stringify(resumeBody));
  assert.equal(resumeBody.session.status, "active");
  assert.equal(resumeBody.session.pausedAt, null);
  assert.ok(Number(resumeBody.session.pausedMs) >= 5_000);
});

test("未入库作答只保留目标章节，不生成虚假的知识库链接", async (t) => {
  DatabaseSync.statement = (sql) => {
    if (sql.startsWith("SELECT * FROM sessions")) return { get: () => ({ id: "report-test", status: "completed" }) };
    if (sql.includes("FROM attempts")) return { all: () => [{
      id: 1, questionTitle: "什么是状态机？", questionId: "", sourcePath: "Java/状态机.md",
      rawAnswer: "我的回答", evaluation: JSON.stringify({ score: 60, comment: "继续练习" }),
    }] };
    if (sql.includes("FROM questions")) return { get: () => undefined };
    if (sql.includes("FROM messages")) return { all: () => [] };
    throw new Error(`未预期的查询：${sql}`);
  };
  const base = await serveRoutes(t, routes);
  const response = await fetch(base + API.interviewReport("report-test"));
  assert.equal(response.status, 200);
  const report = await response.json() as {
    attempts: Array<{ sourcePath: string; knowledgeUrl: string | null }>;
    archivedCount: number;
  };
  assert.equal(report.attempts[0].sourcePath, "Java/状态机.md");
  assert.equal(report.attempts[0].knowledgeUrl, null);
  assert.equal(report.archivedCount, 0);
});
