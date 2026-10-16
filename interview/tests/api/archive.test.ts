import { serveRoutes } from "../helpers/api-fixture.ts";
import { DatabaseSync } from "../helpers/memory-database.ts";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { config } from "../../server/infra/config/index.ts";
import { API } from "../../shared/routes.ts";

const { default: routes } = await import("../../server/api/archive.ts");
const { questionIndex } = await import("../../server/context.ts");

for (const mode of ["interview", "jd"]) {
  test(`${mode} 未指定章节时，补录写入作答记录的实际章节并允许幂等重试`, async (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "archive-api-"));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    config.knowledgeRoot = path.join(root, "knowledge");
    config.privateHistoryRoot = path.join(root, "history");
    // context 中索引在启动时记录目录；测试切到独立夹具目录。
    Object.assign(questionIndex, { knowledgeRoot: config.knowledgeRoot });
    const chapter = "Java/状态机.md";
    const target = path.join(config.knowledgeRoot, chapter);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, "---\ntitle: 状态机\n---\n");
    let indexed: Record<string, unknown> | undefined;
    DatabaseSync.statement = (sql) => {
      if (sql.startsWith("SELECT * FROM sessions")) return { get: () => ({ id: "refile-test", mode, chapter_path: "" }) };
      if (sql.startsWith("SELECT * FROM attempts")) return { get: () => ({
        id: 1, question_title: "为什么需要状态机？", source_path: chapter,
        standard_answer: "**锚点**：`状态定义边界`\n\n1. **约束**：通过状态限制操作",
      }) };
      if (sql.includes("WHERE normalized_title")) return { get: () => indexed };
      if (sql.startsWith("SELECT content_hash")) return { get: () => undefined };
      if (sql.startsWith("SELECT id FROM questions")) return { all: () => [] };
      if (sql.startsWith("INSERT INTO questions(")) return { run: (...args) => {
        indexed = { source_path: args[6], history_url: args[7] };
      } };
      if (/^(DELETE FROM|INSERT INTO) questions_fts/.test(sql)) return { run: () => {} };
      throw new Error(`未预期的查询：${sql}`);
    };
    const base = await serveRoutes(t, routes);
    const response = await fetch(base + API.interviewArchiveAnswer("refile-test", 1), { method: "POST" });
    const result = await response.json() as { sourcePath: string; historyUrl: string };
    assert.equal(response.status, 200, JSON.stringify(result));
    assert.equal(result.sourcePath, chapter);
    assert.match(result.historyUrl, /状态机/);
    const written = fs.readFileSync(target, "utf8");
    assert.match(written, /## 为什么需要状态机？/);
    const retry = await fetch(base + API.interviewArchiveAnswer("refile-test", 1), { method: "POST" });
    assert.equal(retry.status, 200);
    assert.equal(fs.readFileSync(target, "utf8"), written, "再次重试不重复追加题目");
  });
}
