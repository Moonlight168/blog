import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { SYNC_PATHS, copyMissing, fetchArgs, httpsUrlOf, mergeEnvContent, sshUrlOf } from "./bootstrap.mjs";

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

test("本地值还停在 .env.example 的占位地址上时，seed 要能顶掉它", () => {
  // 真机上踩过的坑：示例里写了 https://example.com/v1（非空），合并规则又是「不覆盖非空」，
  // 于是 seed 里的真地址永远填不进去——变成「真 key + 假地址」，
  // 聊天打向 example.com 拿 4xx、向量拿 405。
  const example = "INTERVIEW_CHAT_BASE_URL=https://example.com/v1\nINTERVIEW_CHAT_API_KEY=\n";
  const local = "INTERVIEW_CHAT_BASE_URL=https://example.com/v1\nINTERVIEW_CHAT_API_KEY=\n";
  const seed = "INTERVIEW_CHAT_BASE_URL=https://api.deepseek.com/v1\nINTERVIEW_CHAT_API_KEY=sk-real\n";

  const result = mergeEnvContent(local, seed, example);
  assert.match(result.content, /^INTERVIEW_CHAT_BASE_URL=https:\/\/api\.deepseek\.com\/v1$/m, "占位地址要被顶掉");
  assert.match(result.content, /^INTERVIEW_CHAT_API_KEY=sk-real$/m);
  assert.equal(result.imported, 2);
});

test("本地自己填过的地址，seed 不许覆盖", () => {
  const example = "INTERVIEW_CHAT_BASE_URL=https://api.deepseek.com/v1\n";
  const local = "INTERVIEW_CHAT_BASE_URL=https://my-gateway.internal/v1\n";
  const seed = "INTERVIEW_CHAT_BASE_URL=https://api.deepseek.com/v1\n";

  const result = mergeEnvContent(local, seed, example);
  assert.match(result.content, /^INTERVIEW_CHAT_BASE_URL=https:\/\/my-gateway\.internal\/v1$/m, "用户自己填的不能被顶掉");
  assert.equal(result.imported, 0);
});

test("只有浅仓库才带 --depth=1：全量仓库加了会把自己搞浅、丢历史", () => {
  const shallowSsh = fetchArgs({ transport: "SSH", url: "git@x:y.git", shallow: true });
  const shallowHttps = fetchArgs({ transport: "HTTPS", url: "https://x/y.git", shallow: true });
  const fullHttps = fetchArgs({ transport: "HTTPS", url: "https://x/y.git", shallow: false });

  assert.ok(shallowSsh.includes("--depth=1"));
  assert.ok(shallowHttps.includes("--depth=1"));
  assert.equal(fullHttps.includes("--depth=1"), false, "全量仓库绝不能带 --depth=1，会被变成浅仓库");
  assert.ok(shallowSsh.some((arg) => arg.includes("sshCommand")), "SSH 的免交互参数不能丢");
  for (const args of [shallowSsh, shallowHttps, fullHttps]) assert.equal(args.at(-1), "main");
  // 不传 shallow 时按全量处理——取不到状态时的安全默认
  assert.equal(fetchArgs({ transport: "HTTPS", url: "u" }).includes("--depth=1"), false);
});
