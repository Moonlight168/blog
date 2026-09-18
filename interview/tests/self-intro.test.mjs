import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  commitSelfIntro, findRepoRoot, listSelfIntros, readSelfIntro, readSelfIntroAt,
  requireRepo, resolveSelfIntro, rollbackSelfIntro, selfIntroDir, selfIntroHistory, writeSelfIntro,
} from "../server/self-intro.mjs";

const TECH = "技术面.md";
const HR = "HR面.md";

/** 临时改「人目录」，跑完还原——人目录名因人而异，不该在代码里写死 */
function withPersonDir(name, run) {
  const previous = process.env.INTERVIEW_PERSON_DIR;
  process.env.INTERVIEW_PERSON_DIR = name;
  try {
    run();
  } finally {
    if (previous === undefined) delete process.env.INTERVIEW_PERSON_DIR;
    else process.env.INTERVIEW_PERSON_DIR = previous;
  }
}

/** 造一个和线上同构的环境：简历目录在一个独立 git 仓库里 */
function makeRepo({ init = true, files = [TECH] } = {}) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "selfintro-"));
  const resumeDir = path.join(repo, "resume");
  const dir = selfIntroDir(resumeDir);
  fs.mkdirSync(dir, { recursive: true });
  for (const name of files) fs.writeFileSync(path.join(dir, name), `${name} 的内容\n`, "utf8");
  if (init) {
    const run = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
    run("init");
    run("config", "user.name", "tester");
    run("config", "user.email", "tester@example.com");
  }
  return { repo, resumeDir, file: path.join(dir, TECH) };
}

const gitLog = (repo) => execFileSync("git", ["-C", repo, "log", "--format=%s"], { encoding: "utf8" }).trim().split("\n");

test("找到文件所在的独立仓库；不在仓库里时返回 null", () => {
  const inRepo = makeRepo();
  assert.equal(findRepoRoot(inRepo.file), fs.realpathSync(inRepo.repo));
  const loose = makeRepo({ init: false });
  assert.equal(findRepoRoot(loose.file), null);
});

test("扫描目录：列出所有 .md，按名字排序，忽略其它文件", () => {
  const env = makeRepo({ files: [TECH, HR, "notes.txt"] });
  const list = listSelfIntros(env.resumeDir);
  assert.deepEqual(list.map((item) => item.file), [HR, TECH].sort((a, b) => a.localeCompare(b, "zh")));
  assert.equal(list[0].name.endsWith(".md"), false, "name 是不带后缀的显示名");
  assert.ok(list.every((item) => fs.existsSync(item.path)));
});

test("配了 INTERVIEW_PERSON_DIR 就听它的", () => {
  const resumeDir = path.join(os.tmpdir(), "selfintro-person");
  withPersonDir("zhangsan", () => {
    assert.equal(selfIntroDir(resumeDir), path.join(resumeDir, "zhangsan", "自我介绍"));
  });
});

test("没配时自动认人目录：哪个人下面有自我介绍就是谁", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "selfintro-auto-"));
  fs.mkdirSync(path.join(root, "zhangsan", "自我介绍"), { recursive: true });
  fs.mkdirSync(path.join(root, "lisi"), { recursive: true });
  withPersonDir("", () => {
    delete process.env.INTERVIEW_PERSON_DIR;
    assert.equal(selfIntroDir(root), path.join(root, "zhangsan", "自我介绍"), "有稿子那位才是正在用的人");
  });
});

test("都没稿子时退回第一个人目录（按名字排序，结果是确定的）", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "selfintro-first-"));
  fs.mkdirSync(path.join(root, "zhangsan"));
  fs.mkdirSync(path.join(root, "lisi"));
  delete process.env.INTERVIEW_PERSON_DIR;
  assert.equal(selfIntroDir(root), path.join(root, "lisi", "自我介绍"));
});

test("简历目录还空着才用占位名——不能因为认不出来就报错", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "selfintro-empty-"));
  delete process.env.INTERVIEW_PERSON_DIR;
  assert.equal(selfIntroDir(root), path.join(root, "me", "自我介绍"));
});

test("换台机器不配任何东西也能读到已有稿子（原先默认写死 me，落到不存在的目录）", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "selfintro-anywhere-"));
  fs.mkdirSync(path.join(root, "hyl", "自我介绍"), { recursive: true });
  fs.writeFileSync(path.join(root, "hyl", "自我介绍", "技术面.md"), "稿子内容\n", "utf8");
  delete process.env.INTERVIEW_PERSON_DIR;
  assert.equal(listSelfIntros(root).length, 1, "不配 .env 也该找得到");
  assert.equal(readSelfIntro(root, "").markdown, "稿子内容\n");
});

test("目录还不存在时退回旧位置的单文件（改目录结构不会把内容读丢）", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "selfintro-legacy-"));
  const resumeDir = path.join(repo, "resume");
  withPersonDir("zhangsan", () => {
    fs.mkdirSync(path.join(resumeDir, "zhangsan"), { recursive: true });
    fs.writeFileSync(path.join(resumeDir, "zhangsan", "自我介绍.md"), "老位置的内容\n", "utf8");

    const list = listSelfIntros(resumeDir);
    assert.equal(list.length, 1);
    assert.equal(readSelfIntro(resumeDir, "").markdown, "老位置的内容\n");
  });
});

test("解析文件名：支持带后缀、不带后缀、留空取第一份；不认识的返回 null", () => {
  const env = makeRepo({ files: [TECH, HR] });
  assert.equal(resolveSelfIntro(env.resumeDir, TECH).file, TECH);
  assert.equal(resolveSelfIntro(env.resumeDir, "技术面").file, TECH);
  assert.equal(resolveSelfIntro(env.resumeDir, "").file, listSelfIntros(env.resumeDir)[0].file);
  assert.equal(resolveSelfIntro(env.resumeDir, "不存在.md"), null);
});

test("路径穿越拿不到目录外的文件", () => {
  const env = makeRepo();
  for (const evil of ["../../secret.md", "..\\..\\secret.md", "/etc/passwd", "sub/技术面.md"]) {
    assert.equal(resolveSelfIntro(env.resumeDir, evil), null, `${evil} 不该被解析成路径`);
  }
  assert.throws(() => writeSelfIntro(env.resumeDir, "../../x.md", "内容"), /没有这份自我介绍/);
});

test("写进去能原样读回来（含中文与换行），且各份互不影响", () => {
  const env = makeRepo({ files: [TECH, HR] });
  writeSelfIntro(env.resumeDir, HR, "# HR 面\n\n面试官您好。\n");
  assert.equal(readSelfIntro(env.resumeDir, HR).markdown, "# HR 面\n\n面试官您好。\n");
  assert.equal(readSelfIntro(env.resumeDir, TECH).markdown, `${TECH} 的内容\n`, "不该动到另一份");
});

test("CRLF 文件写回后仍是 CRLF：只改内容，不把整个文件重写一遍", () => {
  const env = makeRepo();
  fs.writeFileSync(env.file, "第一行\r\n第二行\r\n第三行\r\n", "utf8");
  // 模拟浏览器 textarea 交回来的内容——换行已被归一成 LF
  writeSelfIntro(env.resumeDir, TECH, "第一行\n改过的第二行\n第三行\n");
  assert.equal(fs.readFileSync(env.file, "utf8"), "第一行\r\n改过的第二行\r\n第三行\r\n");
});

test("本来就是 LF 的文件不会被改成 CRLF", () => {
  const env = makeRepo();
  fs.writeFileSync(env.file, "第一行\n第二行\n", "utf8");
  writeSelfIntro(env.resumeDir, TECH, "第一行\n改过\n");
  assert.equal(fs.readFileSync(env.file, "utf8"), "第一行\n改过\n");
});

test("提交后进仓库历史，提交信息按传入的写", () => {
  const env = makeRepo();
  commitSelfIntro(env.resumeDir, TECH, "自我介绍：基线");
  assert.deepEqual(gitLog(env.repo), ["自我介绍：基线"]);
});

test("内容没变时不产生空提交", () => {
  const env = makeRepo();
  commitSelfIntro(env.resumeDir, TECH, "第一次");
  const again = commitSelfIntro(env.resumeDir, TECH, "第二次");
  assert.equal(again.committed, false);
  assert.match(again.reason, /没有变化/);
});

test("两份自我介绍各自提交、各自有历史", () => {
  const env = makeRepo({ files: [TECH, HR] });
  writeSelfIntro(env.resumeDir, HR, "HR 面第一版\n");
  commitSelfIntro(env.resumeDir, HR, "HR面：初稿");
  writeSelfIntro(env.resumeDir, TECH, "技术面第一版\n");
  commitSelfIntro(env.resumeDir, TECH, "技术面：初稿");

  assert.equal(selfIntroHistory(env.resumeDir, HR).length, 1);
  assert.equal(selfIntroHistory(env.resumeDir, TECH).length, 1);
  assert.equal(selfIntroHistory(env.resumeDir, HR)[0].subject, "HR面：初稿");
});

test("不在 git 仓库里时只写盘，并说明没有版本管理", () => {
  const env = makeRepo({ init: false });
  writeSelfIntro(env.resumeDir, TECH, "内容\n");
  const result = commitSelfIntro(env.resumeDir, TECH, "提交");
  assert.equal(result.committed, false);
  assert.match(result.reason, /不在任何 git 仓库/);
  assert.equal(fs.readFileSync(env.file, "utf8"), "内容\n", "文件仍要正常落盘");
});

test("历史带出提交信息与增删行数（新→旧）", () => {
  const env = makeRepo();
  writeSelfIntro(env.resumeDir, TECH, "第一版\n");
  commitSelfIntro(env.resumeDir, TECH, "第一次");
  writeSelfIntro(env.resumeDir, TECH, "第一版\n第二版\n");
  commitSelfIntro(env.resumeDir, TECH, "第二次");

  const commits = selfIntroHistory(env.resumeDir, TECH);
  assert.equal(commits.length, 2);
  assert.equal(commits[0].subject, "第二次");
  assert.equal(commits[1].subject, "第一次");
  assert.ok(commits[0].added >= 1);
  assert.match(commits[0].date, /^\d{4}-\d{2}-\d{2}T/);
});

test("能取到某一版的内容，且不会改动当前文件", () => {
  const env = makeRepo();
  commitSelfIntro(env.resumeDir, TECH, "基线");
  const hash = execFileSync("git", ["-C", env.repo, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  writeSelfIntro(env.resumeDir, TECH, "新版\n");

  assert.equal(readSelfIntroAt(env.resumeDir, TECH, hash), `${TECH} 的内容\n`);
  assert.equal(readSelfIntro(env.resumeDir, TECH).markdown, "新版\n", "读取历史不该动到工作区");
});

test("回滚把旧内容写回工作区，但不自己产生提交", () => {
  const env = makeRepo();
  commitSelfIntro(env.resumeDir, TECH, "旧版");
  const hash = execFileSync("git", ["-C", env.repo, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  writeSelfIntro(env.resumeDir, TECH, "新版\n");
  commitSelfIntro(env.resumeDir, TECH, "新版");

  rollbackSelfIntro(env.resumeDir, TECH, hash);
  assert.equal(readSelfIntro(env.resumeDir, TECH).markdown, `${TECH} 的内容\n`, "磁盘上回到了那一版");
  assert.deepEqual(gitLog(env.repo), ["新版", "旧版"], "回滚不产生提交，历史停在原处");
});

test("恢复过一版还没保存时，读取要报「未提交」——刷新后不能变回已保存", () => {
  const env = makeRepo();
  commitSelfIntro(env.resumeDir, TECH, "旧版");
  const hash = execFileSync("git", ["-C", env.repo, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  writeSelfIntro(env.resumeDir, TECH, "新版\n");
  commitSelfIntro(env.resumeDir, TECH, "新版");
  assert.equal(readSelfIntro(env.resumeDir, TECH).uncommitted, false, "刚提交完，盘上和 HEAD 一致");

  rollbackSelfIntro(env.resumeDir, TECH, hash);
  assert.equal(readSelfIntro(env.resumeDir, TECH).uncommitted, true, "恢复后盘上和最新提交对不上，还没保存");
});

test("恢复到最新那版不算未保存——盘上和 HEAD 一模一样，没什么可存的", () => {
  const env = makeRepo();
  commitSelfIntro(env.resumeDir, TECH, "旧版");
  writeSelfIntro(env.resumeDir, TECH, "新版\n");
  commitSelfIntro(env.resumeDir, TECH, "新版");
  const newest = execFileSync("git", ["-C", env.repo, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();

  const rolled = rollbackSelfIntro(env.resumeDir, TECH, newest);
  assert.equal(rolled.uncommitted, false, "恢复的就是当前这版");
  assert.equal(readSelfIntro(env.resumeDir, TECH).uncommitted, false, "读出来也该是干净的");
});

test("路径被外层仓库 .gitignore 排除时，不算「在这个仓库里」", () => {
  // 真机上踩过的坑：新机器上 src/private 没有自己的 .git（seed 只复制文件），
  // 于是 findRepoRoot 一路往上找到外层业务仓库，而外层把 src/private 整个排除了——
  // git add 被拒 → 内容写进了盘却永远提交不了，界面还显示「已保存」。
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "repo-ignored-"));
  const run = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  fs.mkdirSync(path.join(repo, "src", "private"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".gitignore"), "src/private\n", "utf8");
  fs.writeFileSync(path.join(repo, "src", "private", "a.md"), "内容", "utf8");
  fs.writeFileSync(path.join(repo, "b.md"), "内容", "utf8");
  run("init");
  run("config", "user.name", "tester");
  run("config", "user.email", "tester@example.com");

  try {
    assert.equal(findRepoRoot(path.join(repo, "src", "private", "a.md")), null, "被排除的路径要当作不在仓库里");
    assert.ok(findRepoRoot(path.join(repo, "b.md")), "没被排除的路径照常认");

    // 保存前的门槛：这种文件直接拒掉，别写盘——否则会留下「盘上有了、历史里没有」的中间态
    assert.throws(
      () => requireRepo({ path: path.join(repo, "src", "private", "a.md") }),
      /没法留版本/,
      "没有可用仓库要拒掉保存，而不是写下去",
    );
    assert.ok(requireRepo({ path: path.join(repo, "b.md") }), "正常路径照常放行");
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("非法提交号被拒绝，不会去碰文件", () => {
  const env = makeRepo();
  assert.throws(() => readSelfIntroAt(env.resumeDir, TECH, "; rm -rf /"), /提交号不合法/);
});
