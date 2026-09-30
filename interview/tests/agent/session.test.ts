import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { getOrThrow } from "@earendil-works/pi-agent-core";
import { BACKGROUND_CONTEXT } from "@earendil-works/pi-agent-core/harness/context";

import { createToolEnv } from "../../server/agent/session.ts";

test("Agent 工具只能解析工作目录内的路径", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "scoped-env-"));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "scoped-env-outside-"));
  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  });
  fs.writeFileSync(path.join(root, "allowed.txt"), "ok");
  fs.symlinkSync(outside, path.join(root, "escape"), "junction");
  const env = createToolEnv(root);

  assert.equal(getOrThrow(await env.absolutePath("allowed.txt", BACKGROUND_CONTEXT)), path.join(root, "allowed.txt"));
  assert.equal((await env.absolutePath("../outside.txt", BACKGROUND_CONTEXT)).ok, false);
  assert.equal((await env.absolutePath(path.join(outside, "secret.txt"), BACKGROUND_CONTEXT)).ok, false);
  assert.equal((await env.absolutePath("escape/secret.txt", BACKGROUND_CONTEXT)).ok, false, "符号链接也不能逃逸");
});
