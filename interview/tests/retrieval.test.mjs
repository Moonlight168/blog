import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { openDatabase } from "../server/db.mjs";
import { QuestionIndex } from "../server/question-index.mjs";

const TOPIC = `# 数据库

## HashMap 的底层原理是什么？

1. **结构**：数组 + 链表 + 红黑树

→ [回答历史](/private/series/答题历史/Java/topic-答题记录.md#hashmap-的底层原理)

---

## Redis 缓存穿透怎么解决？

1. **方案**：布隆过滤器 + 空值缓存

→ [回答历史](/private/series/答题历史/数据库/topic-答题记录.md#redis-缓存穿透)

---
`;

/** 建一个临时知识库，跑一次 refresh，返回可检索的索引实例。 */
async function makeIndex({ embeddingClient } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "retrieval-"));
  const seriesDir = path.join(root, "Java");
  fs.mkdirSync(seriesDir, { recursive: true });
  fs.writeFileSync(path.join(seriesDir, "topic.md"), TOPIC, "utf8");

  const db = openDatabase(path.join(root, "test.sqlite"));
  const disabled = { enabled: false, config: { model: "none" }, embed: async () => [] };
  const index = new QuestionIndex({ db, knowledgeRoot: root, embeddingClient: embeddingClient ?? disabled });
  await index.refresh();
  return index;
}

const LEGACY_CANDIDATE_KEYS = [
  "id", "title", "normalized_title", "answer_excerpt", "source_path", "history_url",
].sort();

test("search() 返回三条通道，各自带上分数与来源信息", async () => {
  const index = await makeIndex();
  const result = await index.search("HashMap 的底层原理是什么？", 5);

  assert.equal(result.embeddingEnabled, false);
  assert.equal(typeof result.normalizedTitle, "string");

  // 精确匹配：标题规范化后完全相同
  assert.ok(result.channels.exact.length >= 1, "exact 通道应命中规范标题");
  assert.equal(result.channels.exact[0].normalized_title, "hashmap的底层原理是什么");

  // 关键词匹配：底层是 FTS5 + bm25（bm25 越小越相关，这里只要求是数字）
  assert.ok(result.channels.keyword.length >= 1, "keyword 通道应有命中");
  assert.equal(typeof result.channels.keyword[0].score, "number");

  // 未启用向量时该通道为空
  assert.deepEqual(result.channels.semantic, []);
});

test("search() 的 fused 结果带 RRF 分数与命中通道标记", async () => {
  const index = await makeIndex();
  const { fused } = await index.search("HashMap 的底层原理是什么？", 5);

  assert.ok(fused.length >= 1);
  const top = fused[0];
  assert.equal(typeof top.rrfScore, "number");
  assert.ok(Array.isArray(top.channels));
  assert.ok(top.channels.includes("exact"), "同一标题应同时命中 exact 通道");
});

test("启用向量后 semantic 通道参与，且 fused 标记该来源", async () => {
  // 用确定性假向量：命中标题给高分，否则低分
  const embeddingClient = {
    enabled: true,
    config: { model: "fake-embed" },
    embed: async (inputs) => inputs.map((text) => (text.includes("HashMap") ? [1, 0] : [0, 1])),
  };
  const index = await makeIndex({ embeddingClient });
  const result = await index.search("HashMap 的底层原理是什么？", 5);

  assert.equal(result.embeddingEnabled, true);
  assert.ok(result.channels.semantic.length >= 1, "semantic 通道应有命中");
  assert.equal(typeof result.channels.semantic[0].score, "number");
  assert.equal(result.channels.semantic[0].title, "HashMap 的底层原理是什么？");

  const top = result.fused[0];
  assert.ok(top.channels.includes("semantic"), "融合结果应标记 semantic 来源");
});

test("candidates() 的返回结构保持重构前不变", async () => {
  const index = await makeIndex();
  const candidates = await index.candidates("HashMap 的底层原理是什么？", 5);

  assert.ok(candidates.length >= 1);
  for (const candidate of candidates) {
    assert.deepEqual(Object.keys(candidate).sort(), LEGACY_CANDIDATE_KEYS);
  }
  // archive.mjs 依赖 normalized_title 做精确判定
  assert.equal(candidates[0].normalized_title, "hashmap的底层原理是什么");
});

test("没有命中时各通道为空且不抛错", async () => {
  const index = await makeIndex();
  const result = await index.search("zzzz-完全不存在的题目-zzzz", 5);
  assert.deepEqual(result.channels.exact, []);
  assert.deepEqual(result.fused, []);
});
