import { serveRoutes } from "../helpers/api-fixture.ts";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { initRepo, commitAll } from "../helpers/repo.ts";
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

test("外部稿存档失败时拒绝覆盖；修复 Git 后重试保留两份版本", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "document-save-api-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "alice"));
  const target = path.join(root, "alice", "resume.html");
  fs.writeFileSync(target, "<html>基线</html>");
  initRepo(root);
  commitAll(root, "initial");
  config.resumeDir = root;
  const base = await serveRoutes(t, routes);
  const loaded = await (await fetch(base + API.document("resume"))).json() as { file: string; mtime: number };
  fs.writeFileSync(target, "<html>外部新稿</html>");
  const later = new Date(loaded.mtime + 5_000);
  fs.utimesSync(target, later, later);
  execFileSync("git", ["-C", root, "config", "commit.gpgsign", "true"]);
  execFileSync("git", ["-C", root, "config", "gpg.program", "missing-test-signing-program"]);
  const save = () => fetch(base + API.document("resume"), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: loaded.file, html: "<html>编辑器稿</html>", baseMtime: loaded.mtime, message: "editor save" }),
  });

  const rejected = await save();
  assert.equal(rejected.status, 409, JSON.stringify(await rejected.json()));
  assert.equal(fs.readFileSync(target, "utf8"), "<html>外部新稿</html>");

  execFileSync("git", ["-C", root, "config", "commit.gpgsign", "false"]);
  const retried = await save();
  assert.equal(retried.status, 200);
  const saved = await retried.json() as { commit: { committed: boolean } };
  assert.equal(saved.commit.committed, true);
  assert.equal(fs.readFileSync(target, "utf8"), "<html>编辑器稿</html>");
  assert.equal(execFileSync("git", ["-C", root, "show", "HEAD~1:alice/resume.html"], { encoding: "utf8" }), "<html>外部新稿</html>");
});
