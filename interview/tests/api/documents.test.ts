import { serveRoutes } from "../helpers/api-fixture.ts";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { API } from "../../shared/routes.ts";
import { config } from "../../server/infra/config/index.ts";

const { default: routes } = await import("../../server/api/documents.ts");

test("重置对话 HTTP 入口解析目标文件且不修改稿件", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "document-chat-reset-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "alice"));
  const file = path.join(root, "alice", "resume.html");
  fs.writeFileSync(file, "<html>保留稿件</html>");
  config.resumeDir = root;
  const base = await serveRoutes(t, routes);
  const reset = (file: string) => fetch(`${base}${API.document("resume")}/chat/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file }) });
  assert.equal((await reset("alice/resume.html")).status, 200);
  assert.equal(fs.readFileSync(file, "utf8"), "<html>保留稿件</html>");
  assert.equal((await reset("../outside.html")).status, 404);
});
