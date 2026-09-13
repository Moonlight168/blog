import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  commitSelfIntro, findRepoRoot, readSelfIntro, readSelfIntroAt,
  rollbackSelfIntro, selfIntroHistory, selfIntroPath, writeSelfIntro,
} from "../server/self-intro.mjs";

/** 造一个和线上同构的环境：简历目录在一个独立 git 仓库里 */
function makeRepo({ init = true } = {}) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "selfintro-"));
  const resumeDir = path.join(repo, "resume");
  fs.mkdirSync(path.join(resumeDir, "zhangsan"), { recursive: true });
  if (init) {
    const run = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
    run("init");
    run("config", "user.name", "tester");
    run("config", "user.email", "tester@example.com");
  }
  return { repo, resumeDir, file: selfIntroPath(resumeDir) };
}

test("找到文件所在的独立仓库；不在仓库里时返回 null", () => {
  const inRepo = makeRepo();
  assert.equal(findRepoRoot(inRepo.file), fs.realpathSync(inRepo.repo));
  const loose = makeRepo({ init: false });
  assert.equal(findRepoRoot(loose.file), null);
});

test("没写过时读出来是空的，不报错", () => {
  const { resumeDir } = makeRepo();
  const state = readSelfIntro(resumeDir);
  assert.equal(state.exists, false);
  assert.equal(state.markdown, "");
  assert.equal(state.mtime, null);
});

test("写进去能原样读回来（含中文与换行）", () => {
  const { resumeDir } = makeRepo();
  const text = "# 一、开场\n\n面试官您好，我叫张三。\n";
  writeSelfIntro(resumeDir, text);
  assert.equal(readSelfIntro(resumeDir).markdown, text);
});

test("CRLF 文件写回后仍是 CRLF：只改内容，不把整个文件重写一遍", () => {
  const env = makeRepo();
  // 模拟「浏览器 textarea 交回来的内容」——换行已被归一成 LF
  fs.mkdirSync(path.dirname(env.file), { recursive: true });
  fs.writeFileSync(env.file, "第一行\r\n第二行\r\n第三行\r\n", "utf8");

  writeSelfIntro(env.resumeDir, "第一行\n改过的第二行\n第三行\n");
  const after = fs.readFileSync(env.file, "utf8");
  assert.equal(after, "第一行\r\n改过的第二行\r\n第三行\r\n", "换行符要还原成 CRLF");
});

test("本来就是 LF 的文件不会被改成 CRLF", () => {
  const env = makeRepo();
  fs.mkdirSync(path.dirname(env.file), { recursive: true });
  fs.writeFileSync(env.file, "第一行\n第二行\n", "utf8");

  writeSelfIntro(env.resumeDir, "第一行\n改过\n");
  assert.equal(fs.readFileSync(env.file, "utf8"), "第一行\n改过\n");
});

test("提交后进仓库历史，提交信息按传入的写", () => {
  const env = makeRepo();
  writeSelfIntro(env.resumeDir, "第一版\n");
  const first = commitSelfIntro(env.resumeDir, "自我介绍：基线");
  assert.equal(first.committed, true);
  assert.ok(first.hash);
  const log = execFileSync("git", ["-C", env.repo, "log", "--format=%s"], { encoding: "utf8" }).trim();
  assert.equal(log, "自我介绍：基线");
});

test("内容没变时不产生空提交", () => {
  const env = makeRepo();
  writeSelfIntro(env.resumeDir, "同一份内容\n");
  commitSelfIntro(env.resumeDir, "第一次");
  const again = commitSelfIntro(env.resumeDir, "第二次");
  assert.equal(again.committed, false);
  assert.match(again.reason, /没有变化/);
});

test("不在 git 仓库里时只写盘，并说明没有版本管理", () => {
  const env = makeRepo({ init: false });
  writeSelfIntro(env.resumeDir, "内容\n");
  const result = commitSelfIntro(env.resumeDir, "提交");
  assert.equal(result.committed, false);
  assert.match(result.reason, /不在任何 git 仓库/);
  assert.equal(fs.readFileSync(env.file, "utf8"), "内容\n", "文件仍要正常落盘");
});

test("历史带出提交信息与增删行数（新→旧）", () => {
  const env = makeRepo();
  writeSelfIntro(env.resumeDir, "第一版\n");
  commitSelfIntro(env.resumeDir, "第一次");
  writeSelfIntro(env.resumeDir, "第一版\n第二版\n");
  commitSelfIntro(env.resumeDir, "第二次");

  const commits = selfIntroHistory(env.resumeDir);
  assert.equal(commits.length, 2);
  assert.equal(commits[0].subject, "第二次");
  assert.equal(commits[1].subject, "第一次");
  assert.ok(commits[0].added >= 1, `第二次应当是新增：${JSON.stringify(commits[0])}`);
  assert.match(commits[0].date, /^\d{4}-\d{2}-\d{2}T/);
});

test("能取到某一版的内容，且不会改动当前文件", () => {
  const env = makeRepo();
  writeSelfIntro(env.resumeDir, "旧版\n");
  const first = commitSelfIntro(env.resumeDir, "旧版");
  writeSelfIntro(env.resumeDir, "新版\n");

  assert.equal(readSelfIntroAt(env.resumeDir, first.hash), "旧版\n");
  assert.equal(readSelfIntro(env.resumeDir).markdown, "新版\n", "读取历史不该动到工作区");
});

test("回滚把旧内容写回并留成一次新提交，历史不丢", () => {
  const env = makeRepo();
  writeSelfIntro(env.resumeDir, "旧版\n");
  const first = commitSelfIntro(env.resumeDir, "旧版");
  writeSelfIntro(env.resumeDir, "新版\n");
  commitSelfIntro(env.resumeDir, "新版");

  const result = rollbackSelfIntro(env.resumeDir, first.hash, "回滚到旧版");
  assert.equal(readSelfIntro(env.resumeDir).markdown, "旧版\n");
  assert.equal(result.commit.committed, true);
  const subjects = execFileSync("git", ["-C", env.repo, "log", "--format=%s"], { encoding: "utf8" }).trim().split("\n");
  assert.deepEqual(subjects, ["回滚到旧版", "新版", "旧版"], "回滚是新增一次提交，不改写历史");
});

test("非法提交号被拒绝，不会去碰文件", () => {
  const env = makeRepo();
  writeSelfIntro(env.resumeDir, "内容\n");
  assert.throws(() => readSelfIntroAt(env.resumeDir, "; rm -rf /"), /提交号不合法/);
});
