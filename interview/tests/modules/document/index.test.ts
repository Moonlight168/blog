import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import { commitAll, gitLog, headHash, initRepo } from "../../helpers/repo.ts";
import { registerSharedInvariants } from "../../helpers/document-invariants.ts";
import { commitPathAt } from "../../../server/infra/git/path-at-commit.ts";
import { findRepoRoot, requireRepo } from "../../../server/infra/git/repo.ts";
import { versionLabel } from "../../../server/infra/git/version.ts";
import {
  commitDocument, discardDocument, documentContentAt, documentHistory, readDocument, rollbackDocument, writeDocument,
} from "../../../server/modules/document/index.ts";
import { listResumeGroups, resolveResumeDoc } from "../../../server/modules/document/resume.ts";
import { listSelfIntros, resolveSelfIntro, selfIntroDir } from "../../../server/modules/document/self-intro.ts";
import { findBrowser, htmlToPdf, pdfFileName, waitForFile, withBaseHref } from "../../../server/modules/document/pdf.ts";

/**
 * 文档域：简历编辑稿与自我介绍是同一套「可版本化文件」操作的两个实例。
 *
 * 前一段是简历，后一段是自我介绍 —— 两边共用同一份 git 管道（modules/document/versioned-file.ts），
 * 所以不变量只需验一遍，这里分开只是为了断言能贴着各自的定位规则写。
 */

// ============ 简历编辑稿 ============

/** 造一个和线上同构的简历目录：一级目录 = 一个人，里面放 html */
function makeRoot(folders: Record<string, Record<string, string>> = {}): string {
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
  assert.equal(groups.find((g) => g.id === "zhangsan")?.resumes.length, 2);
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
  assert.equal(resolveResumeDoc(root, "张三-后端.html")?.file, "张三-后端.html");
  for (const evil of ["../张三-后端.html", "zhangsan/张三-后端.html", "../../etc/passwd", ""]) {
    assert.equal(resolveResumeDoc(root, evil), null, `${evil} 不该被解析到`);
  }
  assert.throws(() => readDocument("resume", root, "../x.html"), /没有这份简历/);
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
  const run = (...args: string[]) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  initRepo(repo);

  commitAll(repo, "1.0 初版");
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
  writeDocument("resume", resumeDir, file, "<html>第二版</html>");
  commitDocument("resume", resumeDir, file, "1.01 压缩了实习那段");

  const history = documentHistory("resume", resumeDir, file);
  assert.equal(history.length, 2, "初版 + 这次保存");
  assert.equal(history[0].subject, "1.01 压缩了实习那段", "新的在前");
  assert.equal(history[1].subject, "1.0 初版");
  assert.ok(history[0].added > 0 && history[0].deleted > 0, "要带上改了多少行");
});

/** 造一份「改过名、也挪过位置」的简历：第一版在 resume/ 下，第二版挪进人名目录还改了名 */
function makeRepoWithRenamedResume() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "resume-rename-"));
  const resumeDir = path.join(repo, "resume");
  const run = (...args: string[]) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  fs.mkdirSync(resumeDir, { recursive: true });
  // 正文要够长、两版够像，git 才认得出这是改名而不是「删一个加一个」
  const body = `<html><body>${"简历正文".repeat(200)}`;
  const before = path.join(resumeDir, "张三-后端.html");
  fs.writeFileSync(before, `${body}<p>第一版</p></body></html>`, "utf8");
  initRepo(repo);

  commitAll(repo, "1.0 初版");

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
  const history = documentHistory("resume", resumeDir, file);
  assert.equal(history.length, 2, "--follow 要能跟着改名走回旧提交");

  const first = history.find((item) => item.subject === "1.0 初版");
  assert.ok(first, "旧提交要出现在历史列表里");
  assert.match(
    documentContentAt("resume", resumeDir, file, first.hash),
    /第一版/,
    "老版本要能取到内容，不能报「这一版里没有这个文件」",
  );
});

test("恢复回给编辑器的是盘上那份，不是 git 里那份——两者的换行符可能不一样", () => {
  // core.autocrlf=true 时 blob 里存 LF、盘上是 CRLF，直接回 git 那份会让编辑器
  // 以为内容变了，为一个根本没改过的文件亮「未保存」
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "resume-eol-"));
  const resumeDir = path.join(repo, "resume");
  const file = "张三-后端.html";
  const run = (...args: string[]) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  fs.mkdirSync(path.join(resumeDir, "zhangsan"), { recursive: true });
  fs.writeFileSync(path.join(resumeDir, "zhangsan", file), "<html>\r\n<body>第一版</body>\r\n</html>\r\n", "utf8");
  initRepo(repo, { autocrlf: true });

  commitAll(repo, "1.0 初版");

  const disk = () => fs.readFileSync(path.join(resumeDir, "zhangsan", file), "utf8");
  const newest = documentHistory("resume", resumeDir, file)[0].hash;
  assert.match(documentContentAt("resume", resumeDir, file, newest), /\n/, "git 里那份是 LF");
  assert.doesNotMatch(documentContentAt("resume", resumeDir, file, newest), /\r\n/, "git 里那份没有 CR");

  const rolled = rollbackDocument("resume", resumeDir, file, newest);
  assert.equal(rolled.content, disk(), "回给编辑器的必须是盘上那份");
  assert.match(rolled.content, /\r\n/, "盘上是 CRLF，回给编辑器的也得是 CRLF");
});

test("纯改名的提交内容没动，要标成「未改动」好让面板滤掉", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "resume-pure-rename-"));
  const resumeDir = path.join(repo, "resume");
  const run = (...args: string[]) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
  fs.mkdirSync(path.join(resumeDir, "zhangsan"), { recursive: true });
  const body = `<html><body>${"简历正文".repeat(200)}</body></html>`;
  fs.writeFileSync(path.join(resumeDir, "zhangsan", "张三-后端.html"), body, "utf8");
  initRepo(repo);

  commitAll(repo, "1.0 初版");

  // 原地改个名就走，内容一个字都不动——这就是「不该占版本号」的那种提交
  fs.renameSync(path.join(resumeDir, "zhangsan", "张三-后端.html"), path.join(resumeDir, "zhangsan", "张三-后端(AI应用).html"));
  run("add", "-A");
  run("commit", "-m", "1.01 改个名");

  const history = documentHistory("resume", resumeDir, "张三-后端(AI应用).html");
  assert.equal(history.length, 2, "--follow 要能跟着改名走回旧提交");
  const renamed = history.find((item) => item.subject === "1.01 改个名");
  assert.ok(renamed, "改名那次应当在历史里");
  assert.equal(renamed.changed, false, "内容一个字没变");
  assert.equal(renamed.added, 0);
  assert.equal(renamed.deleted, 0);
  assert.equal(history.find((item) => item.subject === "1.0 初版")?.changed, true, "新建那次是实打实的改动");
});

test("查「那次提交里文件叫什么」：改名前后各是各的名字", () => {
  const { repo, file } = makeRepoWithRenamedResume();
  const history = documentHistory("resume", path.join(repo, "resume"), file);
  const oldest = history.find((item) => item.subject === "1.0 初版");
  const newest = history.find((item) => item.subject.startsWith("1.01"));

  assert.ok(oldest && newest, "两版都该在历史里");
  assert.equal(commitPathAt(repo, `resume/zhangsan/${file}`, oldest.hash), "resume/张三-后端.html");
  assert.equal(commitPathAt(repo, `resume/zhangsan/${file}`, newest.hash), `resume/zhangsan/${file}`);
  assert.equal(commitPathAt(repo, `resume/zhangsan/${file}`, "0000000"), "", "查不到的提交给空串，不抛错");
});

test("简历历史：提交号不合法或不在仓库里时明确报错，不静默给空", () => {
  const { resumeDir, file } = makeRepoWithResume();
  assert.throws(() => documentContentAt("resume", resumeDir, file, "../../etc/passwd"), /提交号不合法/);
  const loose = fs.mkdtempSync(path.join(os.tmpdir(), "resume-nogit-"));
  fs.mkdirSync(path.join(loose, "zhangsan"), { recursive: true });
  fs.writeFileSync(path.join(loose, "zhangsan", file), HTML, "utf8");
  assert.throws(() => documentContentAt("resume", loose, file, "abcdef1"), /不在任何 git 仓库/);
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
    (error: unknown) => (error as Error).message.includes("永远不会出现.pdf"),
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

test("放弃改动：把工作区退回 HEAD 那一版", () => {
  const { resumeDir, file } = makeRepoWithResume();
  writeDocument("resume", resumeDir, file, "<html>改坏了</html>");
  assert.equal(readDocument("resume", resumeDir, file).uncommitted, true, "改过之后是未保存");

  const restored = discardDocument("resume", resumeDir, file);

  assert.match(restored.content, /第一版/, "内容退回 HEAD 那版");
  assert.equal(restored.uncommitted, false, "退回之后盘上就是 HEAD，不再有未保存改动");
  assert.doesNotMatch(readDocument("resume", resumeDir, file).content, /改坏了/);
});

test("放弃改动不产生新提交——它只是把工作区退回去", () => {
  const { resumeDir, file } = makeRepoWithResume();
  const before = documentHistory("resume", resumeDir, file).length;

  writeDocument("resume", resumeDir, file, "<html>改坏了</html>");
  discardDocument("resume", resumeDir, file);

  assert.equal(documentHistory("resume", resumeDir, file).length, before, "历史条数不变");
});

test("不在 git 仓库里时放弃改动会报错，而不是假装成功", () => {
  const root = makeRoot({ zhangsan: { "张三-后端-27届.html": "<html>x</html>" } });
  assert.throws(() => discardDocument("resume", root, "张三-后端-27届.html"), /没有可退回的版本/);
});

// 两个 kind 共用的不变量在 tests/helpers/document-invariants.ts 里统一注册，
// 避免同一段断言按 kind 抄两份。
registerSharedInvariants();
// ============ 自我介绍 ============

const TECH = "技术面.md";
const HR = "HR面.md";

/** 临时改「人目录」，跑完还原——人目录名因人而异，不该在代码里写死 */
function withPersonDir(name: string, run: () => void): void {
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
  if (init) initRepo(repo);
  return { repo, resumeDir, file: path.join(dir, TECH) };
}

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
  assert.equal(readDocument("self-intro", root, "").content, "稿子内容\n");
});

test("目录还不存在时退回旧位置的单文件（改目录结构不会把内容读丢）", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "selfintro-legacy-"));
  const resumeDir = path.join(repo, "resume");
  withPersonDir("zhangsan", () => {
    fs.mkdirSync(path.join(resumeDir, "zhangsan"), { recursive: true });
    fs.writeFileSync(path.join(resumeDir, "zhangsan", "自我介绍.md"), "老位置的内容\n", "utf8");

    const list = listSelfIntros(resumeDir);
    assert.equal(list.length, 1);
    assert.equal(readDocument("self-intro", resumeDir, "").content, "老位置的内容\n");
  });
});

test("解析文件名：支持带后缀、不带后缀、留空取第一份；不认识的返回 null", () => {
  const env = makeRepo({ files: [TECH, HR] });
  assert.equal(resolveSelfIntro(env.resumeDir, TECH)?.file, TECH);
  assert.equal(resolveSelfIntro(env.resumeDir, "技术面")?.file, TECH);
  assert.equal(resolveSelfIntro(env.resumeDir, "")?.file, listSelfIntros(env.resumeDir)[0].file);
  assert.equal(resolveSelfIntro(env.resumeDir, "不存在.md"), null);
});

test("路径穿越拿不到目录外的文件", () => {
  const env = makeRepo();
  for (const evil of ["../../secret.md", "..\\..\\secret.md", "/etc/passwd", "sub/技术面.md"]) {
    assert.equal(resolveSelfIntro(env.resumeDir, evil), null, `${evil} 不该被解析成路径`);
  }
  assert.throws(() => writeDocument("self-intro", env.resumeDir, "../../x.md", "内容"), /没有这份自我介绍/);
});

test("写进去能原样读回来（含中文与换行），且各份互不影响", () => {
  const env = makeRepo({ files: [TECH, HR] });
  writeDocument("self-intro", env.resumeDir, HR, "# HR 面\n\n面试官您好。\n");
  assert.equal(readDocument("self-intro", env.resumeDir, HR).content, "# HR 面\n\n面试官您好。\n");
  assert.equal(readDocument("self-intro", env.resumeDir, TECH).content, `${TECH} 的内容\n`, "不该动到另一份");
});

test("本来就是 LF 的文件不会被改成 CRLF", () => {
  const env = makeRepo();
  fs.writeFileSync(env.file, "第一行\n第二行\n", "utf8");
  writeDocument("self-intro", env.resumeDir, TECH, "第一行\n改过\n");
  assert.equal(fs.readFileSync(env.file, "utf8"), "第一行\n改过\n");
});

test("提交后进仓库历史，提交信息按传入的写", () => {
  const env = makeRepo();
  commitDocument("self-intro", env.resumeDir, TECH, "自我介绍：基线");
  assert.deepEqual(gitLog(env.repo), ["自我介绍：基线"]);
});

test("内容没变时不产生空提交", () => {
  const env = makeRepo();
  commitDocument("self-intro", env.resumeDir, TECH, "第一次");
  const again = commitDocument("self-intro", env.resumeDir, TECH, "第二次");
  assert.equal(again.committed, false);
  assert.match(again.reason ?? "", /没有变化/);
});

test("两份自我介绍各自提交、各自有历史", () => {
  const env = makeRepo({ files: [TECH, HR] });
  writeDocument("self-intro", env.resumeDir, HR, "HR 面第一版\n");
  commitDocument("self-intro", env.resumeDir, HR, "HR面：初稿");
  writeDocument("self-intro", env.resumeDir, TECH, "技术面第一版\n");
  commitDocument("self-intro", env.resumeDir, TECH, "技术面：初稿");

  assert.equal(documentHistory("self-intro", env.resumeDir, HR).length, 1);
  assert.equal(documentHistory("self-intro", env.resumeDir, TECH).length, 1);
  assert.equal(documentHistory("self-intro", env.resumeDir, HR)[0].subject, "HR面：初稿");
});

test("不在 git 仓库里时只写盘，并说明没有版本管理", () => {
  const env = makeRepo({ init: false });
  writeDocument("self-intro", env.resumeDir, TECH, "内容\n");
  const result = commitDocument("self-intro", env.resumeDir, TECH, "提交");
  assert.equal(result.committed, false);
  assert.match(result.reason ?? "", /不在任何 git 仓库/);
  assert.equal(fs.readFileSync(env.file, "utf8"), "内容\n", "文件仍要正常落盘");
});

test("历史带出提交信息与增删行数（新→旧）", () => {
  const env = makeRepo();
  writeDocument("self-intro", env.resumeDir, TECH, "第一版\n");
  commitDocument("self-intro", env.resumeDir, TECH, "第一次");
  writeDocument("self-intro", env.resumeDir, TECH, "第一版\n第二版\n");
  commitDocument("self-intro", env.resumeDir, TECH, "第二次");

  const commits = documentHistory("self-intro", env.resumeDir, TECH);
  assert.equal(commits.length, 2);
  assert.equal(commits[0].subject, "第二次");
  assert.equal(commits[1].subject, "第一次");
  assert.ok(commits[0].added >= 1);
  assert.match(commits[0].date, /^\d{4}-\d{2}-\d{2}T/);
});

test("提交信息带 body 时：body 完整读出来，增删行数也不受影响", () => {
  const env = makeRepo();
  writeDocument("self-intro", env.resumeDir, TECH, "第一版\n");
  commitDocument("self-intro", env.resumeDir, TECH, "自我介绍：重排技能栏\n\n- 拆出工程能力\n- 去掉重复项");
  writeDocument("self-intro", env.resumeDir, TECH, "第一版\n第二版\n");
  commitDocument("self-intro", env.resumeDir, TECH, "自我介绍：补一行");

  const commits = documentHistory("self-intro", env.resumeDir, TECH);
  assert.equal(commits[0].subject, "自我介绍：补一行");
  assert.equal(commits[0].body, "", "没有 body 时给空串，不是 undefined");
  assert.equal(commits[1].subject, "自我介绍：重排技能栏", "body 不能混进 subject");
  assert.match(commits[1].body, /拆出工程能力/, "多行 body 要完整读出来");
  assert.match(commits[1].body, /去掉重复项/);
  // 关键：body 是多行的，解析时不能把 numstat 行冲散 —— 冲散了增删会算成 0，
  // 那条提交就会被当成「内容没动」而从历史里滤掉，用户会以为这一版丢了。
  assert.ok(commits[1].added > 0, `增行数要算对，实际 ${commits[1].added}`);
  assert.equal(commits[1].changed, true);
});

test("能取到某一版的内容，且不会改动当前文件", () => {
  const env = makeRepo();
  commitDocument("self-intro", env.resumeDir, TECH, "基线");
  const hash = headHash(env.repo);
  writeDocument("self-intro", env.resumeDir, TECH, "新版\n");

  assert.equal(documentContentAt("self-intro", env.resumeDir, TECH, hash), `${TECH} 的内容\n`);
  assert.equal(readDocument("self-intro", env.resumeDir, TECH).content, "新版\n", "读取历史不该动到工作区");
});

test("路径被外层仓库 .gitignore 排除时，不算「在这个仓库里」", () => {
  // 真机上踩过的坑：新机器上 src/private 没有自己的 .git（seed 只复制文件），
  // 于是 findRepoRoot 一路往上找到外层业务仓库，而外层把 src/private 整个排除了——
  // git add 被拒 → 内容写进了盘却永远提交不了，界面还显示「已保存」。
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "repo-ignored-"));
  const run = (...args: string[]) => execFileSync("git", ["-C", repo, ...args], { stdio: "ignore" });
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
      () => requireRepo(path.join(repo, "src", "private", "a.md")),
      /没法留版本/,
      "没有可用仓库要拒掉保存，而不是写下去",
    );
    assert.ok(requireRepo(path.join(repo, "b.md")), "正常路径照常放行");
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("非法提交号被拒绝，不会去碰文件", () => {
  const env = makeRepo();
  assert.throws(() => documentContentAt("self-intro", env.resumeDir, TECH, "; rm -rf /"), /提交号不合法/);
});
