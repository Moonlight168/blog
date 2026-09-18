import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { execFileSync } from "node:child_process";

import { commitPathAt } from "../server/commit-path.mjs";
import { versionLabel } from "../server/doc-version.mjs";
import {
  commitResumeDoc, findBrowser, htmlToPdf, listResumeGroups, pdfFileName, readResumeDoc, readResumeDocAt,
  resolveResumeDoc, resumeDocHistory, rollbackResumeDoc, waitForFile, withBaseHref, writeResumeDoc,
} from "../server/resume-doc.mjs";

/** 造一个和线上同构的简历目录：一级目录 = 一个人，里面放 html */
function makeRoot(folders = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "resume-doc-"));
  for (const [dir, files] of Object.entries(folders)) {
    fs.mkdirSync(path.join(root, dir), { recursive: true });
    for (const [name, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(root, dir, name), content, "utf8");
    }
  }
  return root;
}

const HTML = "<html><body>正文</body></html>";

test("按人分组：一级目录即一个人，人员名取简历文件名的第一段", () => {
  const root = makeRoot({
    zhangsan: { "张三-Java后端(AI应用)-27届.html": HTML, "张三-AI全栈开发-27届.html": HTML },
    lisi: { "李四-文员-27届.html": HTML },
  });
  const groups = listResumeGroups(root);
  // 分组按目录名排序（lisi 在 zhangsan 前面）
  assert.deepEqual(groups.map((g) => g.id), ["lisi", "zhangsan"]);
  assert.deepEqual(groups.map((g) => g.label), ["李四", "张三"], "显示名取简历文件名的第一段");
  assert.equal(groups.find((g) => g.id === "zhangsan").resumes.length, 2);
});

test("人员名推不出来时退回目录名，不硬猜", () => {
  const root = makeRoot({ mixed: { "甲-后端.html": HTML, "乙-前端.html": HTML } });
  assert.equal(listResumeGroups(root)[0].label, "mixed");
});

test("只认 html，跳过非 html、jobs 目录与隐藏目录", () => {
  const root = makeRoot({
    zhangsan: { "张三-后端.html": HTML, "photo.jpg": "x", "备注.md": "x" },
    jobs: { "某岗位.html": HTML },
    ".git": { "x.html": HTML },
  });
  const groups = listResumeGroups(root);
  assert.deepEqual(groups.map((g) => g.id), ["zhangsan"]);
  assert.deepEqual(groups[0].resumes.map((r) => r.file), ["张三-后端.html"]);
});

test("目录不存在时返回空数组，而不是抛错", () => {
  assert.deepEqual(listResumeGroups(path.join(os.tmpdir(), "根本不存在的简历目录-xyz")), []);
});

test("只解析扫描结果里出现过的文件（路径穿越拿不到别处的文件）", () => {
  const root = makeRoot({ zhangsan: { "张三-后端.html": HTML } });
  assert.equal(resolveResumeDoc(root, "张三-后端.html").file, "张三-后端.html");
  for (const evil of ["../张三-后端.html", "zhangsan/张三-后端.html", "../../etc/passwd", ""]) {
    assert.equal(resolveResumeDoc(root, evil), null, `${evil} 不该被解析到`);
  }
  assert.throws(() => readResumeDoc(root, "../x.html"), /没有这份简历/);
});

test("写回保留原换行符，且拒绝空内容与不存在的文件", () => {
  const root = makeRoot({ zhangsan: { "crlf.html": "<html>\r\n<body>旧</body>\r\n</html>" } });
  const file = path.join(root, "zhangsan", "crlf.html");

  writeResumeDoc(root, "crlf.html", "<html>\n<body>新</body>\n</html>");
  assert.equal(fs.readFileSync(file, "utf8"), "<html>\r\n<body>新</body>\r\n</html>", "CRLF 要还原");

  assert.throws(() => writeResumeDoc(root, "crlf.html", "   "), /不能为空/);
  assert.throws(() => writeResumeDoc(root, "不存在.html", HTML), /没有这份简历/);
});

test("导出文件名：默认用简历名，去掉 .pdf 后缀与非法字符", () => {
  assert.equal(pdfFileName("", "张三-后端"), "张三-后端.pdf");
  assert.equal(pdfFileName("自定义名.pdf", "张三-后端"), "自定义名.pdf");
  assert.equal(pdfFileName("带/路径:的名*字", "x"), "带路径的名字.pdf");
  assert.equal(pdfFileName("   ", "兜底"), "兜底.pdf", "全空白时退回简历名");
});

/**
 * PDF 渲染是在临时目录里做的，`<img src="photo.jpg">` 这种相对路径会指到临时目录去，
 * 于是照片变成浏览器那个"裂图"占位框。渲染前把基准钉回简历所在目录才对得上。
 */
test("渲染前插 <base>，把相对资源（照片）的基准钉回简历所在目录", () => {
  const dir = path.join(os.tmpdir(), "简历 目录(AI应用)");
  const file = path.join(dir, "张三-Java后端(AI应用)-27届.html");
  const out = withBaseHref("<html><head><title>简历</title></head><body><img src=\"photo.jpg\"></body></html>", file);
  assert.equal(
    out,
    `<html><head><base href="${pathToFileURL(dir + path.sep).href}"><title>简历</title></head><body><img src="photo.jpg"></body></html>`,
  );
});

test("没有 head 时也要插进去，否则 base 不生效", () => {
  const out = withBaseHref("<img src=\"photo.jpg\">", "F:/x/y/简历.html");
  assert.match(out, /^<base href="file:\/\/\/F:\/x\/y\/">/);
});

test("已经有 base 的文档不动它，也不给第二个（重复 base 只有第一个生效）", () => {
  const doc = `<html><head><base href="https://cdn.test/"></head><body></body></html>`;
  assert.equal(withBaseHref(doc, "F:/x/y/简历.html"), doc);
});

test("没给简历路径时原样返回，渲染不该因此失败", () => {
  const doc = "<html><head></head><body></body></html>";
  assert.equal(withBaseHref(doc, ""), doc);
  assert.equal(withBaseHref(doc, undefined), doc);
});

/** 造一份「躺在 git 仓库里」的简历——历史与版本号都建立在这上面 */
function makeRepoWithResume() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "resume-history-"));
  const resumeDir = path.join(repo, "resume");
  fs.mkdirSync(path.join(resumeDir, "zhangsan"), { recursive: true });
  const file = "张三-后端.html";
  fs.writeFileSync(path.join(resumeDir, "zhangsan", file), "<html>第一版</html>", "utf8");
  const run = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  run("init");
  run("config", "user.name", "tester");
  run("config", "user.email", "tester@example.com");
  run("add", "-A");
  run("commit", "-m", "1.0 初版");
  return { repo, resumeDir, file };
}

test("版本号：第几次保存就是第几版，1.0 之后用两位小数", () => {
  assert.equal(versionLabel(1), "1.0");
  assert.equal(versionLabel(2), "1.01");
  assert.equal(versionLabel(3), "1.02");
  assert.equal(versionLabel(11), "1.10");
});

test("简历历史：一次保存一条，提交信息就是那一版的说明", () => {
  const { resumeDir, file } = makeRepoWithResume();
  writeResumeDoc(resumeDir, file, "<html>第二版</html>");
  commitResumeDoc(resumeDir, file, "1.01 压缩了实习那段");

  const history = resumeDocHistory(resumeDir, file);
  assert.equal(history.length, 2, "初版 + 这次保存");
  assert.equal(history[0].subject, "1.01 压缩了实习那段", "新的在前");
  assert.equal(history[1].subject, "1.0 初版");
  assert.ok(history[0].added > 0 && history[0].deleted > 0, "要带上改了多少行");
});

/** 造一份「改过名、也挪过位置」的简历：第一版在 resume/ 下，第二版挪进人名目录还改了名 */
function makeRepoWithRenamedResume() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "resume-rename-"));
  const resumeDir = path.join(repo, "resume");
  const run = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  fs.mkdirSync(resumeDir, { recursive: true });
  // 正文要够长、两版够像，git 才认得出这是改名而不是「删一个加一个」
  const body = `<html><body>${"简历正文".repeat(200)}`;
  const before = path.join(resumeDir, "张三-后端.html");
  fs.writeFileSync(before, `${body}<p>第一版</p></body></html>`, "utf8");
  run("init");
  run("config", "user.name", "tester");
  run("config", "user.email", "tester@example.com");
  run("add", "-A");
  run("commit", "-m", "1.0 初版");

  const after = path.join(resumeDir, "zhangsan", "张三-后端(AI应用).html");
  fs.mkdirSync(path.dirname(after), { recursive: true });
  fs.renameSync(before, after);
  fs.writeFileSync(after, `${body}<p>第二版</p></body></html>`, "utf8");
  run("add", "-A");
  run("commit", "-m", "1.01 归入人名目录并改名");
  return { repo, resumeDir, file: "张三-后端(AI应用).html" };
}

test("改名挪位之前的版本也读得出来——按当时的路径取，而不是拿当前路径去撞", () => {
  const { resumeDir, file } = makeRepoWithRenamedResume();
  const history = resumeDocHistory(resumeDir, file);
  assert.equal(history.length, 2, "--follow 要能跟着改名走回旧提交");

  const first = history.find((item) => item.subject === "1.0 初版");
  assert.ok(first, "旧提交要出现在历史列表里");
  assert.match(
    readResumeDocAt(resumeDir, file, first.hash),
    /第一版/,
    "老版本要能取到内容，不能报「这一版里没有这个文件」",
  );
});

test("恢复过一版还没保存时，读取要报「未提交」——刷新后不能变回已保存", () => {
  const { resumeDir, file } = makeRepoWithResume();
  const first = resumeDocHistory(resumeDir, file)[0].hash;
  writeResumeDoc(resumeDir, file, "<html>第二版</html>");
  commitResumeDoc(resumeDir, file, "1.01 改了点东西");
  assert.equal(readResumeDoc(resumeDir, file).uncommitted, false, "刚提交完，盘上和 HEAD 一致");

  rollbackResumeDoc(resumeDir, file, first);
  assert.equal(readResumeDoc(resumeDir, file).uncommitted, true, "恢复后盘上和最新提交对不上，还没保存");
});

test("恢复到最新那版不算未保存——盘上和 HEAD 一模一样，没什么可存的", () => {
  const { resumeDir, file } = makeRepoWithResume();
  writeResumeDoc(resumeDir, file, "<html>第二版</html>");
  commitResumeDoc(resumeDir, file, "1.01 改了点东西");
  const newest = resumeDocHistory(resumeDir, file)[0].hash;

  const rolled = rollbackResumeDoc(resumeDir, file, newest);
  assert.equal(rolled.uncommitted, false, "恢复的就是当前这版");
  assert.equal(readResumeDoc(resumeDir, file).uncommitted, false, "读出来也该是干净的");
});

test("恢复回给编辑器的是盘上那份，不是 git 里那份——两者的换行符可能不一样", () => {
  // core.autocrlf=true 时 blob 里存 LF、盘上是 CRLF，直接回 git 那份会让编辑器
  // 以为内容变了，为一个根本没改过的文件亮「未保存」
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "resume-eol-"));
  const resumeDir = path.join(repo, "resume");
  const file = "张三-后端.html";
  const run = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  fs.mkdirSync(path.join(resumeDir, "zhangsan"), { recursive: true });
  fs.writeFileSync(path.join(resumeDir, "zhangsan", file), "<html>\r\n<body>第一版</body>\r\n</html>\r\n", "utf8");
  run("init");
  run("config", "user.name", "tester");
  run("config", "user.email", "tester@example.com");
  run("config", "core.autocrlf", "true");
  run("add", "-A");
  run("commit", "-m", "1.0 初版");

  const disk = () => fs.readFileSync(path.join(resumeDir, "zhangsan", file), "utf8");
  const newest = resumeDocHistory(resumeDir, file)[0].hash;
  assert.match(readResumeDocAt(resumeDir, file, newest), /\n/, "git 里那份是 LF");
  assert.doesNotMatch(readResumeDocAt(resumeDir, file, newest), /\r\n/, "git 里那份没有 CR");

  const rolled = rollbackResumeDoc(resumeDir, file, newest);
  assert.equal(rolled.html, disk(), "回给编辑器的必须是盘上那份");
  assert.match(rolled.html, /\r\n/, "盘上是 CRLF，回给编辑器的也得是 CRLF");
});

test("纯改名的提交内容没动，要标成「未改动」好让面板滤掉", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "resume-pure-rename-"));
  const resumeDir = path.join(repo, "resume");
  const run = (...args) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  fs.mkdirSync(path.join(resumeDir, "zhangsan"), { recursive: true });
  const body = `<html><body>${"简历正文".repeat(200)}</body></html>`;
  fs.writeFileSync(path.join(resumeDir, "zhangsan", "张三-后端.html"), body, "utf8");
  run("init");
  run("config", "user.name", "tester");
  run("config", "user.email", "tester@example.com");
  run("add", "-A");
  run("commit", "-m", "1.0 初版");

  // 原地改个名就走，内容一个字都不动——这就是「不该占版本号」的那种提交
  fs.renameSync(path.join(resumeDir, "zhangsan", "张三-后端.html"), path.join(resumeDir, "zhangsan", "张三-后端(AI应用).html"));
  run("add", "-A");
  run("commit", "-m", "1.01 改个名");

  const history = resumeDocHistory(resumeDir, "张三-后端(AI应用).html");
  assert.equal(history.length, 2, "--follow 要能跟着改名走回旧提交");
  const renamed = history.find((item) => item.subject === "1.01 改个名");
  assert.equal(renamed.changed, false, "内容一个字没变");
  assert.equal(renamed.added, 0);
  assert.equal(renamed.deleted, 0);
  assert.equal(history.find((item) => item.subject === "1.0 初版").changed, true, "新建那次是实打实的改动");
});

test("查「那次提交里文件叫什么」：改名前后各是各的名字", () => {
  const { repo, file } = makeRepoWithRenamedResume();
  const history = resumeDocHistory(path.join(repo, "resume"), file);
  const oldest = history.find((item) => item.subject === "1.0 初版");
  const newest = history.find((item) => item.subject.startsWith("1.01"));

  assert.equal(commitPathAt(repo, `resume/zhangsan/${file}`, oldest.hash), "resume/张三-后端.html");
  assert.equal(commitPathAt(repo, `resume/zhangsan/${file}`, newest.hash), `resume/zhangsan/${file}`);
  assert.equal(commitPathAt(repo, `resume/zhangsan/${file}`, "0000000"), "", "查不到的提交给空串，不抛错");
});

test("简历历史：回滚只把内容写回工作区，不自己产生提交", () => {
  const { repo, resumeDir, file } = makeRepoWithResume();
  const first = resumeDocHistory(resumeDir, file)[0].hash;

  writeResumeDoc(resumeDir, file, "<html>第二版</html>");
  commitResumeDoc(resumeDir, file, "1.01 改了点东西");

  assert.equal(readResumeDocAt(resumeDir, file, first), "<html>第一版</html>", "旧版内容取得到");

  const rolled = rollbackResumeDoc(resumeDir, file, first);
  assert.equal(rolled.html, "<html>第一版</html>", "返回的是那一版的内容");
  assert.equal(fs.readFileSync(path.join(resumeDir, "zhangsan", file), "utf8"), "<html>第一版</html>", "磁盘上回到了那一版");
  assert.equal(resumeDocHistory(resumeDir, file).length, 2, "回滚不产生提交，版本数不变");

  // 盘上内容和最新提交对不上＝「未保存」，等用户点保存才成一版
  const dirty = execFileSync("git", ["-C", repo, "-c", "core.quotepath=false", "status", "--porcelain"], { encoding: "utf8" });
  assert.match(dirty, /^\s*M\s+\S+\.html/m, "回滚后工作区应当是脏的");
});

test("简历历史：提交号不合法或不在仓库里时明确报错，不静默给空", () => {
  const { resumeDir, file } = makeRepoWithResume();
  assert.throws(() => readResumeDocAt(resumeDir, file, "../../etc/passwd"), /提交号不合法/);
  const loose = fs.mkdtempSync(path.join(os.tmpdir(), "resume-nogit-"));
  fs.mkdirSync(path.join(loose, "zhangsan"), { recursive: true });
  fs.writeFileSync(path.join(loose, "zhangsan", file), HTML, "utf8");
  assert.throws(() => readResumeDocAt(loose, file, "abcdef1"), /不在任何 git 仓库/);
});

test("找不到浏览器时返回空串，找到的必须是真实存在的路径", () => {
  const found = findBrowser();
  assert.equal(typeof found, "string");
  if (found) assert.ok(fs.existsSync(found), `返回的浏览器路径应当存在：${found}`);
});

// ---- 等浏览器把 PDF 写出来 ----
// 背景：Chrome 拿到参数后会把自己重新拉起来渲染（命令行里多出 --user-data-dir=…\HeadlessChrome…
// 和 --do-not-de-elevate），父进程立刻以 0 退出，PDF 要再过几百毫秒才落盘。
// 之前只看一次 existsSync，就会把好好的渲染报成「浏览器没有产出文件」。

function waitDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "pdf-wait-"));
}

test("浏览器退出了但文件晚一步才出现：要接着等，不能当场判失败", async () => {
  const out = path.join(waitDir(), "晚到.pdf");
  const since = Date.now();
  setTimeout(() => fs.writeFileSync(out, "%PDF-1.4 正文", "utf8"), 250);

  await waitForFile(out, { since, timeoutMs: 5000 });
  assert.ok(fs.statSync(out).size > 0, "等到的是个有内容的文件");
});

test("同名旧文件躺在那儿不算数——导出是覆盖写，等的必须是这一次新写的", async () => {
  const out = path.join(waitDir(), "覆盖.pdf");
  fs.writeFileSync(out, "%PDF-1.4 上一版", "utf8");
  const past = new Date(Date.now() - 60_000);
  fs.utimesSync(out, past, past);                    // 伪装成一分钟前导出的那份
  const since = Date.now();
  setTimeout(() => fs.writeFileSync(out, "%PDF-1.4 这一版", "utf8"), 300);

  const started = Date.now();
  await waitForFile(out, { since, timeoutMs: 5000 });
  assert.equal(fs.readFileSync(out, "utf8"), "%PDF-1.4 这一版", "不能拿旧文件顶数");
  assert.ok(Date.now() - started >= 200, "得真等到新文件写出");
});

test("一直不出现就超时报错，错误里带上路径方便定位", async () => {
  const out = path.join(waitDir(), "永远不会出现.pdf");
  await assert.rejects(
    () => waitForFile(out, { since: Date.now(), timeoutMs: 300, intervalMs: 50 }),
    (error) => error.message.includes("永远不会出现.pdf"),
  );
});

test("空文件不算产出：Chrome 崩在半路会留下 0 字节", async () => {
  const out = path.join(waitDir(), "空的.pdf");
  fs.writeFileSync(out, "", "utf8");
  await assert.rejects(
    () => waitForFile(out, { since: Date.now() - 1000, timeoutMs: 300, intervalMs: 50 }),
    /空的\.pdf/,
  );
});

test("真实浏览器跑一遍：产出的 PDF 非空（没装 Chrome/Edge 就跳过）", async (t) => {
  const browser = findBrowser();
  if (!browser) return t.skip("本机没找到 Chrome 或 Edge");
  const out = path.join(waitDir(), "真渲染.pdf");
  await htmlToPdf({ browser, html: "<html><body><h1>简历</h1></body></html>", outPath: out, sourceFile: "" });
  assert.ok(fs.statSync(out).size > 0, "渲染出来的 PDF 要有内容");
});
