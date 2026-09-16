import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { listRealInterviews, parseFolderName, readRealInterview } from "../server/real-interview.mjs";

/** 造一个和线上同构的目录：每场一个目录，里面是自由格式的 markdown */
function makeRoot(folders = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "real-interview-"));
  for (const [name, files] of Object.entries(folders)) {
    const dir = path.join(root, name);
    fs.mkdirSync(dir, { recursive: true });
    for (const [file, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, `${file}.md`), content, "utf8");
    }
  }
  return root;
}

test("从目录名解析公司 / 岗位 / 日期", () => {
  assert.deepEqual(parseFolderName("星辰科技_初级全栈开发工程师_2026_9_14"), {
    company: "星辰科技", role: "初级全栈开发工程师", date: "2026-09-14",
  });
  // 月/日补零
  assert.equal(parseFolderName("云图智能_AI应用开发实习生_2026_8_6").date, "2026-08-06");
  // 岗位名里带空格也要完整保留
  assert.equal(parseFolderName("深圳明远软件技术_AI Agent工程师_2026_8_20").role, "AI Agent工程师");
});

test("目录名不合规范时不猜，退回目录名当公司、日期留空", () => {
  assert.deepEqual(parseFolderName("随手记的一场"), { company: "随手记的一场", role: "", date: "" });
  assert.deepEqual(parseFolderName("公司_岗位_2026"), { company: "公司_岗位_2026", role: "", date: "" });
});

test("列出全部场次：按日期新→旧，跳过非目录与没有 markdown 的目录", () => {
  const root = makeRoot({
    "A公司_后端_2026_3_1": { 面试总结: "## 小结\n" },
    "B公司_前端_2026_9_9": { 面试总结: "## 小结\n", 面试真题: "## 题一？\n\n## 题二？\n" },
    "空目录_岗位_2026_5_5": {},
  });
  fs.writeFileSync(path.join(root, "README.md"), "根目录的说明，不算一场", "utf8");

  const rows = listRealInterviews(root);
  assert.deepEqual(rows.map((row) => row.company), ["B公司", "A公司"], "按日期倒序");
  assert.equal(rows[0].fileCount, 2);
  assert.equal(rows[0].kind, "real");
  assert.equal(rows[0].series, "真实面试");
});

test("根目录不存在时返回空数组，而不是抛错", () => {
  assert.deepEqual(listRealInterviews(path.join(os.tmpdir(), "根本不存在的目录-xyz")), []);
});

test("读一场：只给四类文件，顺序是 真题→总结→自我介绍→岗位信息", () => {
  const root = makeRoot({
    "A公司_后端_2026_3_1": {
      README: "索引\n", 面试预测: "预测\n",
      岗位信息: "岗位\n", 自我介绍: "介绍\n", 面试总结: "总结\n", 面试真题: "题\n",
    },
  });
  const detail = readRealInterview(root, "A公司_后端_2026_3_1");
  assert.deepEqual(detail.files.map((file) => file.name), ["面试真题", "面试总结", "自我介绍", "岗位信息"]);
  assert.equal(detail.files[0].markdown, "题\n", "真题排第一（页面默认打开它）");
  assert.equal(detail.company, "A公司");
});

test("只有 README/面试预测 的目录不算一场（页面不展示这些）", () => {
  const root = makeRoot({ "A公司_后端_2026_3_1": { README: "索引\n", 面试预测: "预测\n" } });
  assert.deepEqual(listRealInterviews(root), []);
});

test("渲染前去掉 YAML frontmatter，别让它变成页面顶部的原文", () => {
  const root = makeRoot({
    "A公司_后端_2026_3_1": {
      面试总结: "---\ntitle: A公司 - 面试总结\ndate: 2026-03-01\ncategories: [面试经验]\n---\n\n## 小结\n\n正文\n",
    },
  });
  const [file] = readRealInterview(root, "A公司_后端_2026_3_1").files;
  assert.doesNotMatch(file.markdown, /title:|categories:/);
  assert.match(file.markdown, /^## 小结/, "正文要完整保留");
});

test("没有 frontmatter 的文件原样返回", () => {
  const root = makeRoot({ "A公司_后端_2026_3_1": { 面试总结: "## 小结\n\n正文\n" } });
  assert.equal(readRealInterview(root, "A公司_后端_2026_3_1").files[0].markdown, "## 小结\n\n正文\n");
});

test("目录里没列过的文件名读不到（路径穿越拿不到目录外的内容）", () => {
  const root = makeRoot({ "A公司_后端_2026_3_1": { 面试总结: "总结\n" } });
  for (const evil of ["../A公司_后端_2026_3_1", "../../secret", "A公司_后端_2026_3_1/../..", ""]) {
    assert.throws(() => readRealInterview(root, evil), /没有这场真实面试记录/, `${evil} 不该被读到`);
  }
});
