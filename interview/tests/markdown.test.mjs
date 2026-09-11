import assert from "node:assert/strict";
import test from "node:test";

import {
  buildQuestionBlock,
  parseQuestions,
  validateQuestionBlock,
} from "../server/markdown.mjs";
import { mergeHistory } from "../server/archive.mjs";

test("parses H2 questions and omits the answer-history link from the answer", () => {
  const source = `# Topic\n\n## 什么是状态机？\n\n1. **定义**：状态驱动流程\n\n→ [回答历史](/private/series/答题历史/Java/topic-答题记录.md#什么是状态机)\n\n---\n`;
  const [question] = parseQuestions(source, "src/series/knowledge/Java/topic.md");
  assert.equal(question.title, "什么是状态机？");
  assert.match(question.answer, /状态驱动流程/);
  assert.doesNotMatch(question.answer, /回答历史/);
});

test("builds a question block that follows the interview handbook", () => {
  const block = buildQuestionBlock({
    title: "为什么需要状态机？",
    answer: "记忆锚点：状态定义边界，事件驱动迁移。\n\n1. **边界清晰**：用状态约束流程\n   - 非法迁移会被拒绝",
    historyUrl: "/private/series/答题历史/Java/topic-答题记录.md#为什么需要状态机",
  });
  assert.deepEqual(validateQuestionBlock(block), []);
  assert.match(block, /^## 为什么需要状态机？/);
  assert.match(block, /^## 为什么需要状态机？\n\n→ \[回答历史\]/);
});

test("rejects headings, stars and overlong answer cards", () => {
  const invalid = `## 1. ⭐坏问题？\n\n### 小节\n${Array.from({ length: 16 }, (_, i) => `${i + 1}. 内容`).join("\n")}\n`;
  const errors = validateQuestionBlock(invalid);
  assert.ok(errors.length >= 3);
});

test("appends repeat answers under one existing history heading", () => {
  const first = mergeHistory("", { chapter: "状态机", title: "为什么需要状态机？", date: "2026-09-11", rawAnswer: "第一次" });
  const second = mergeHistory(first, { chapter: "状态机", title: "为什么需要状态机？", date: "2026-09-11", rawAnswer: "第二次" });
  assert.equal((second.match(/^## 为什么需要状态机？$/gmu) ?? []).length, 1);
  assert.match(second, /第一次/);
  assert.match(second, /第二次/);
});
