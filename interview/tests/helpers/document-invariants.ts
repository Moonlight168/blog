import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { commitAll, initRepo } from "./repo.ts";
import {
  commitDocument, documentContentAt, documentHistory, readDocument, rollbackDocument, writeDocument,
} from "../../server/modules/document/index.ts";
import type { DocumentKind } from "../../shared/routes.ts";

/**
 * 简历与自我介绍共用的不变量。
 *
 * 两者走的是同一套 versioned-file（读 / 写 / 提交 / 历史 / 回滚），
 * 差别只在**怎么定位文件**。所以这些不变量在这里对两个 kind 各跑一遍，
 * 而不是把同一段断言按 kind 抄两份 —— 抄两份的话，改一处要记得改两处。
 *
 * 夹具自带，不依赖调用方的：这样 helper 挪到哪儿都能跑。
 */

const RESUME_FILE = "张三-后端.html";
const INTRO_FILE = "技术面.md";
const HTML = "<html>第一版</html>";
const INTRO = "# 第一版\n";

/** 一个 kind 的临时仓库：文件放在 repo 里、简历目录是 repo/resume */
interface Fixture {
  repo: string;
  dir: string;
  file: string;
  filePath: string;
}

/** 简历：<root>/resume/<人>/*.html */
function makeResumeRepo({ content = HTML }: { content?: string } = {}): Fixture {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "invariant-resume-"));
  const dir = path.join(repo, "resume");
  const filePath = path.join(dir, "zhangsan", RESUME_FILE);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  initRepo(repo);
  commitAll(repo, "1.0 初版");
  return { repo, dir, file: RESUME_FILE, filePath };
}

/** 自我介绍：<root>/resume/<人>/自我介绍/*.md */
function makeSelfIntroRepo({ content = INTRO }: { content?: string } = {}): Fixture {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "invariant-intro-"));
  const dir = path.join(repo, "resume");
  const filePath = path.join(dir, "zhangsan", "自我介绍", INTRO_FILE);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  initRepo(repo);
  commitAll(repo, "1.0 初版");
  return { repo, dir, file: INTRO_FILE, filePath };
}

interface Case {
  kind: DocumentKind;
  setup: (options?: { content?: string }) => Fixture;
}

const SHARED: Case[] = [
  { kind: "resume", setup: makeResumeRepo },
  { kind: "self-intro", setup: makeSelfIntroRepo },
];

/** 最早那一版 —— 回滚类用例都拿它当目标 */
function oldestHash(kind: DocumentKind, dir: string, file: string): string {
  const first = documentHistory(kind, dir, file).at(-1);
  assert.ok(first, "仓库里至少该有一版");
  return first.hash;
}

export function registerSharedInvariants() {
  for (const { kind, setup } of SHARED) {
    test(`[${kind}] 写回只改内容，不把整个文件重写一遍（原换行符保留）`, () => {
      const { dir, file } = setup({ content: "第一行\r\n第二行\r\n" });

      // 模拟浏览器 textarea 交回来的内容 —— 换行已被归一成 LF
      writeDocument(kind, dir, file, "第一行\n改过的第二行\n");

      // git diff 只该有一行改动；若整份被重写，numstat 会显示增删全部行
      const repoRoot = path.dirname(dir);
      const [added, deleted] = execFileSync(
        "git", ["-C", repoRoot, "diff", "--numstat", "--", path.relative(repoRoot, dir)],
        { encoding: "utf8" },
      ).trim().split("\n")[0]?.split("\t") ?? [];
      assert.ok(Number(added) + Number(deleted) <= 2, `只该改动一行，实际 +${added} -${deleted}`);
    });

    test(`[${kind}] 换行符按盘上那份还原，且拒绝空内容与不存在的文件`, () => {
      const { dir, file, filePath } = setup({ content: "第一行\r\n第二行\r\n" });
      writeDocument(kind, dir, file, "第一行\n改过的第二行\n");
      assert.equal(fs.readFileSync(filePath, "utf8"), "第一行\r\n改过的第二行\r\n", "CRLF 要还原");
      assert.throws(() => writeDocument(kind, dir, file, "   "), /不能为空/);
      assert.throws(() => writeDocument(kind, dir, "不存在的那一份", "内容"), /没有这份/);
    });

    test(`[${kind}] 回滚只写工作区，不自己产生提交`, () => {
      const { repo, dir, file, filePath } = setup();
      const before = documentHistory(kind, dir, file).length;
      const first = oldestHash(kind, dir, file);
      const original = fs.readFileSync(filePath, "utf8");

      writeDocument(kind, dir, file, "改坏的样子\n");
      commitDocument(kind, dir, file, "1.01 改了点东西");
      assert.equal(documentContentAt(kind, dir, file, first), original, "旧版内容取得到");

      const rolled = rollbackDocument(kind, dir, file, first);

      assert.equal(rolled.content, original, "返回的是那一版的内容");
      assert.equal(fs.readFileSync(filePath, "utf8"), original, "磁盘上回到了那一版");
      assert.equal(documentHistory(kind, dir, file).length, before + 1, "只多了那次提交，回滚本身不产生提交");
      const dirty = execFileSync("git", ["-C", repo, "status", "--porcelain"], { encoding: "utf8" });
      assert.match(dirty, /^\s*M\s/m, "回滚后工作区应当是脏的 —— 等用户点保存才成一版");
    });

    test(`[${kind}] 恢复过一版还没保存时，读取要报「未提交」`, () => {
      const { dir, file } = setup();
      const first = oldestHash(kind, dir, file);
      writeDocument(kind, dir, file, "第二版\n");
      commitDocument(kind, dir, file, "1.01 改了点东西");
      assert.equal(readDocument(kind, dir, file).uncommitted, false, "刚提交完，盘上和 HEAD 一致");

      rollbackDocument(kind, dir, file, first);
      assert.equal(readDocument(kind, dir, file).uncommitted, true, "恢复后盘上和最新提交对不上，还没保存");
    });

    test(`[${kind}] 恢复到最新那版不算未保存 —— 盘上和 HEAD 一模一样`, () => {
      const { dir, file } = setup();
      writeDocument(kind, dir, file, "第二版\n");
      commitDocument(kind, dir, file, "1.01 改了点东西");
      const newest = documentHistory(kind, dir, file)[0].hash;

      const rolled = rollbackDocument(kind, dir, file, newest);

      assert.equal(rolled.uncommitted, false, "恢复的就是当前这版");
      assert.equal(readDocument(kind, dir, file).uncommitted, false, "读出来也该是干净的");
    });
  }
}
