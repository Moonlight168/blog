import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { isAllowedResume, readResume, scanResumes, updateEnvFile } from "../server/resume.mjs";

/** 造一份贴近真实简历结构的 HTML（含 head/style/svg 噪音与 class 化章节）。 */
const RESUME_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>不该出现的标题</title>
<style>.section-title { color: red; }</style></head>
<body>
<div class="header-info"><div class="header-left"><h1>张三</h1>
<div class="intent">求职意向：Java 后端开发</div></div></div>
<svg viewBox="0 0 10 10"><path d="M0 0"/></svg>
<div class="section-title">教育经历</div>
<div class="row-item edu-item"><div class="row-left"><span class="school-name">某大学</span><span class="edu-major">计算机科学与技术</span><span class="edu-degree">全日制本科</span></div><div class="row-right">2023.09-2027.06</div></div>
<div class="section-title">项目经历</div>
<div class="proj-item"><div class="row-item"><div class="row-left"><strong>FlowMind（智能流程设计系统） - 全栈开发</strong><span class="proj-tag">(毕业设计)</span></div><div class="row-right">2026.03-2026.06</div></div>
<div class="duty-label">项目职责：</div>
<ol><li><strong>Agent 工作流：</strong>基于 LangGraph 构建状态图</li></ol></div>
</body></html>`;

function makeResumeRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "resume-"));
  const person = path.join(root, "hjf");
  fs.mkdirSync(person, { recursive: true });
  fs.writeFileSync(path.join(person, "张三-Java后端.html"), RESUME_HTML, "utf8");
  fs.writeFileSync(path.join(person, "个人优势.txt"), "具备 Java 后端经验", "utf8");
  fs.writeFileSync(path.join(person, "面试回答话术.md"), "# 模拟面试\n", "utf8");
  fs.writeFileSync(path.join(person, "photo.jpg"), "binary", "utf8");
  // 根目录的规范文档：不是简历，不能进列表
  fs.writeFileSync(path.join(root, "简历设计规范.md"), "# 规范\n", "utf8");
  fs.writeFileSync(path.join(root, "面试回答话术规范.md"), "# 规范\n", "utf8");
  return root;
}

test("扫描只收人目录下的简历，根目录规范文档与图片不入列", () => {
  const root = makeResumeRoot();
  const names = scanResumes(root).map((item) => item.name).sort();

  assert.deepEqual(names, [
    "hjf/个人优势.txt",
    "hjf/张三-Java后端.md",
    "hjf/面试回答话术.md",
  ]);
  assert.ok(!names.some((name) => name.includes("规范")), "规范文档不能出现在简历列表里");
});

test("HTML 简历显示为 .md，但选中值仍是真实路径", () => {
  const root = makeResumeRoot();
  const html = scanResumes(root).find((item) => item.path.endsWith(".html"));

  assert.ok(html, "应能扫到 HTML 简历");
  assert.equal(html.name, "hjf/张三-Java后端.md");
  assert.ok(html.path.endsWith("张三-Java后端.html"));
});

test("isAllowedResume 只放行目录内的简历文件", () => {
  const root = makeResumeRoot();
  const inside = path.join(root, "hjf", "张三-Java后端.html");

  assert.equal(isAllowedResume(inside, root), true);
  assert.equal(isAllowedResume(path.join(root, "hjf", "photo.jpg"), root), false);
  assert.equal(isAllowedResume(path.join(root, "..", "outside.md"), root), false);
  assert.equal(isAllowedResume(path.join(root, "简历设计规范.md"), root), true, "目录内的 md 仍可读");
});

test("HTML 转 markdown：章节成为标题、噪音被剥离、正文不丢", () => {
  const root = makeResumeRoot();
  const markdown = readResume(path.join(root, "hjf", "张三-Java后端.html"));

  // 结构：章节标题必须保留为 markdown 标题
  assert.match(markdown, /^## 教育经历$/m);
  assert.match(markdown, /^## 项目经历$/m);
  assert.match(markdown, /^### /m, "每条经历应有自己的小标题");

  // 噪音：head/style/svg 不能残留
  for (const noise of ["<style", "<svg", "<head", "不该出现的标题", "color: red", "viewBox"]) {
    assert.ok(!markdown.includes(noise), `不应残留：${noise}`);
  }

  // 正文实体必须还在
  for (const kept of ["张三", "某大学", "计算机科学与技术", "FlowMind", "LangGraph", "求职意向"]) {
    assert.ok(markdown.includes(kept), `正文丢失：${kept}`);
  }
});

test("markdown / txt 原样读取，不做转换", () => {
  const root = makeResumeRoot();
  const text = readResume(path.join(root, "hjf", "个人优势.txt"));
  assert.equal(text, "具备 Java 后端经验");
});

test("写 .env：替换已有键、保留其他行、拒绝注入", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "env-"));
  const file = path.join(dir, ".env");
  fs.writeFileSync(file, "# 注释\nINTERVIEW_HOST=127.0.0.1\nINTERVIEW_RESUME_DIR=G:\\\\old\nINTERVIEW_PORT=8890\n", "utf8");

  updateEnvFile(file, "INTERVIEW_RESUME_DIR", "F:/new/dir");
  const written = fs.readFileSync(file, "utf8");
  assert.match(written, /^INTERVIEW_RESUME_DIR=F:\/new\/dir$/m);
  assert.match(written, /^INTERVIEW_HOST=127\.0\.0\.1$/m, "其他行必须原样保留");
  assert.match(written, /^INTERVIEW_PORT=8890$/m);
  assert.match(written, /^# 注释$/m);
  assert.equal(written.match(/INTERVIEW_RESUME_DIR=/g).length, 1, "不能重复写入该键");

  // 注入：换行可以凭空插入别的环境变量
  assert.throws(() => updateEnvFile(file, "INTERVIEW_RESUME_DIR", "a\nINTERVIEW_CHAT_API_KEY=stolen"), /非法/);
  assert.throws(() => updateEnvFile(file, "INTERVIEW_RESUME_DIR", "a=b"), /非法/);
});

test("写 .env：键不存在时追加", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "env2-"));
  const file = path.join(dir, ".env");
  fs.writeFileSync(file, "INTERVIEW_HOST=127.0.0.1\n", "utf8");

  updateEnvFile(file, "INTERVIEW_RESUME_DIR", "F:/resume");
  const written = fs.readFileSync(file, "utf8");
  assert.match(written, /^INTERVIEW_RESUME_DIR=F:\/resume$/m);
  assert.match(written, /^INTERVIEW_HOST=127\.0\.0\.1$/m);
});
