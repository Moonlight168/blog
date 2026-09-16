import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import {
  findBrowser, listResumeGroups, pdfFileName, readResumeDoc,
  resolveResumeDoc, withBaseHref, writeResumeDoc,
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

test("找不到浏览器时返回空串，找到的必须是真实存在的路径", () => {
  const found = findBrowser();
  assert.equal(typeof found, "string");
  if (found) assert.ok(fs.existsSync(found), `返回的浏览器路径应当存在：${found}`);
});
