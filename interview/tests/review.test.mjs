import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { openDatabase } from "../server/db.mjs";
import { QuestionIndex } from "../server/question-index.mjs";

/** 一道答案超过 180 字符的题：用来验证复习页拿到的是完整答案而非库里的摘要。 */
const LONG_ANSWER = Array.from({ length: 6 }, (_, i) =>
  `${i + 1}. **要点${i + 1}**：这是一段足够长的说明文字，用来把整道题的答案撑过一百八十个字符的截断线。`).join("\n");

const CHAPTER = `# 多线程

## 什么是线程池？为什么要用？

**锚点**：\`池化复用，避免频繁创建销毁\`

→ [回答历史](/private/series/答题历史/Java/多线程-答题记录.md#什么是线程池)

1. **复用**：线程预先创建

---

## volatile 关键字的作用？

**锚点**：\`保证可见性，不保证原子性\`

→ [回答历史](/private/series/答题历史/Java/多线程-答题记录.md#volatile)

1. **可见性**：写入立刻对其他线程可见

---

## synchronized 和 ReentrantLock 怎么选？

${LONG_ANSWER}

→ [回答历史](/private/series/答题历史/Java/多线程-答题记录.md#synchronized-和-reentrantlock)

---
`;

function makeIndex() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "review-"));
  const seriesDir = path.join(root, "Java");
  fs.mkdirSync(seriesDir, { recursive: true });
  fs.writeFileSync(path.join(seriesDir, "多线程.md"), CHAPTER, "utf8");

  const db = openDatabase(path.join(root, "test.sqlite"));
  const index = new QuestionIndex({
    db, knowledgeRoot: root,
    embeddingClient: { enabled: false, config: { model: "none" }, embed: async () => [] },
  });
  return index;
}

test("pick() 按章节抽题，返回的答案必须是完整的而非 180 字摘要", () => {
  const index = makeIndex();
  const [picked] = index.pick("Java/多线程.md", 10).filter((q) => q.title.includes("synchronized"));

  assert.ok(picked, "应能抽到那道长答案的题");
  assert.ok(picked.answer.length > 180, `答案不能被截断，实际 ${picked.answer.length} 字符`);
  assert.ok(picked.answer.includes("要点6"), "答案的最后一段也必须在");
});

test("pick() 保留题目、锚点与回答历史链接", () => {
  const index = makeIndex();
  const all = index.pick("Java/多线程.md", 10);

  assert.equal(all.length, 3);
  for (const question of all) {
    assert.ok(question.id && question.title, "每题要有 id 与 title");
    assert.match(question.historyUrl, /^\/private\/series\/答题历史\//);
  }
  const threadPool = all.find((q) => q.title.includes("线程池"));
  assert.ok(threadPool.answer.includes("池化复用"), "记忆锚点应包含在答案里");
});

test("pick() 超出章节题量时返回全部，不报错", () => {
  const index = makeIndex();
  assert.equal(index.pick("Java/多线程.md", 99).length, 3);
});

test("pick() 抽题数量受 count 限制", () => {
  const index = makeIndex();
  assert.equal(index.pick("Java/多线程.md", 2).length, 2);
});

test("pick() 拒绝越界路径与不存在的章节", () => {
  const index = makeIndex();
  assert.throws(() => index.pick("../../etc/passwd.md", 5), /超出知识库/);
  assert.throws(() => index.pick("Java/不存在.md", 5), /不存在/);
});
