import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { readHistorySection } from "../server/history.mjs";

const HISTORY = `# 多线程 面试答题记录

---

## 什么是线程池？为什么要用？

- **2026-08-30**：线程池是为了复用线程，避免频繁创建销毁的开销。
- **2026-09-05**：补充：还能控制并发数，防止资源被耗尽。

## volatile 关键字的作用？

- **2026-09-01**：保证可见性和有序性，但不保证原子性。

## 只记了日期没记内容的题？

- **2026-09-10**：

## 没有任何回答的题？

---
`;

function makeRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "history-"));
  fs.mkdirSync(path.join(root, "Java"), { recursive: true });
  fs.writeFileSync(path.join(root, "Java", "多线程-答题记录.md"), HISTORY, "utf8");
  return root;
}

test("按章节与标题读出历次回答，含日期", () => {
  const root = makeRoot();
  const result = readHistorySection({
    privateHistoryRoot: root, chapterPath: "Java/多线程.md", title: "什么是线程池？为什么要用？",
  });

  assert.equal(result.entries.length, 2);
  assert.equal(result.entries[0].date, "2026-08-30");
  assert.match(result.entries[0].answer, /复用线程/);
  assert.equal(result.entries[1].date, "2026-09-05");
  assert.match(result.entries[1].answer, /控制并发数/);
});

test("标题匹配容忍标点与空白差异", () => {
  const root = makeRoot();
  const result = readHistorySection({
    privateHistoryRoot: root, chapterPath: "Java/多线程.md", title: "什么是线程池 为什么要用",
  });
  assert.equal(result.entries.length, 2, "去掉标点和空格后应能匹配到同一段落");
});

test("只返回该题的段落，不串到别的题", () => {
  const root = makeRoot();
  const result = readHistorySection({
    privateHistoryRoot: root, chapterPath: "Java/多线程.md", title: "volatile 关键字的作用？",
  });
  assert.equal(result.entries.length, 1);
  assert.match(result.entries[0].answer, /可见性/);
  assert.ok(!result.entries.some((entry) => entry.answer.includes("线程池")), "不能混入其它题的回答");
});

test("只记了日期、内容为空的条目也要保留（与文档站的日期计数一致）", () => {
  const root = makeRoot();
  const result = readHistorySection({
    privateHistoryRoot: root, chapterPath: "Java/多线程.md", title: "只记了日期没记内容的题？",
  });
  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].date, "2026-09-10");
  assert.equal(result.entries[0].answer, "");
});

test("没有回答的题返回空列表", () => {
  const root = makeRoot();
  const result = readHistorySection({
    privateHistoryRoot: root, chapterPath: "Java/多线程.md", title: "没有任何回答的题？",
  });
  assert.deepEqual(result.entries, []);
});

test("答题记录文件不存在时返回空列表而不是报错", () => {
  const root = makeRoot();
  const result = readHistorySection({
    privateHistoryRoot: root, chapterPath: "Java/不存在的章节.md", title: "随便什么题？",
  });
  assert.deepEqual(result.entries, []);
});

test("拒绝越界的章节路径", () => {
  const root = makeRoot();
  assert.throws(() => readHistorySection({
    privateHistoryRoot: root, chapterPath: "../../../etc/passwd.md", title: "x？",
  }), /超出/);
});
