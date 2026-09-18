import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { SYNC_PATHS, copyMissing, httpsUrlOf, mergeEnvContent, sshUrlOf } from "./bootstrap.mjs";

test("远程地址支持 SSH 与 HTTPS 双向回退", () => {
  assert.equal(sshUrlOf("https://github.com/example/repo.git"), "git@github.com:example/repo.git");
  assert.equal(httpsUrlOf("git@github.com:example/repo.git"), "https://github.com/example/repo.git");
});

test("env 只补缺失和空值，不覆盖本机非空配置", () => {
  const local = "KEEP=local\nEMPTY=\n";
  const seed = "KEEP=seed\nEMPTY=filled\nNEW=value\n";
  const result = mergeEnvContent(local, seed);
  assert.equal(result.imported, 2);
  assert.match(result.content, /^KEEP=local$/m);
  assert.match(result.content, /^EMPTY=filled$/m);
  assert.match(result.content, /^NEW=value$/m);
});

test("private seed 只复制缺失文件", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-launcher-"));
  const source = path.join(root, "source");
  const target = path.join(root, "target");
  fs.mkdirSync(path.join(source, "nested"), { recursive: true });
  fs.mkdirSync(path.join(target, "nested"), { recursive: true });
  fs.writeFileSync(path.join(source, "nested", "kept.txt"), "seed");
  fs.writeFileSync(path.join(source, "nested", "new.txt"), "new");
  fs.writeFileSync(path.join(target, "nested", "kept.txt"), "local");
  try {
    assert.equal(copyMissing(source, target), 1);
    assert.equal(fs.readFileSync(path.join(target, "nested", "kept.txt"), "utf8"), "local");
    assert.equal(fs.readFileSync(path.join(target, "nested", "new.txt"), "utf8"), "new");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("更新白名单不包含博客正文和私人目录", () => {
  assert.equal(SYNC_PATHS.some((entry) => entry === "src" || entry.startsWith("src/private") || entry.startsWith("src/blogs")), false);
  assert.ok(SYNC_PATHS.includes("src/.vuepress"));
  assert.ok(SYNC_PATHS.includes("interview"));
});
