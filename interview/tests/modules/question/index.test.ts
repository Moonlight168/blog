import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { openDatabase } from "../../../server/db/index.ts";
import { QuestionIndex } from "../../../server/modules/question/index.ts";
import type { EmbeddingClient } from "../../../server/infra/external/embeddings.ts";
import { readHistorySection } from "../../../server/modules/question/answers.ts";
import { cjkBigrams, normalizeTitle, reciprocalRankFusion } from "../../../server/modules/question/text.ts";

/**
 * 题库域：索引（检索 / 抽题）、正文处理、答题历史。
 *
 * 三部分都建在同一份「临时知识库 + 临时 sqlite」上，所以夹具只写一次 ——
 * 原先散在 retrieval / review / search / history 四个文件里，各自抄了一遍建库样板。
 */

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

/**
 * 检索命中的一行。
 *
 * `search()` 在类型上只声明了 `channel` 与可选的 `score`（行本身是松散的），
 * 而断言要读标题等字段 —— 在这里按实际形状收一次，好过每处断言各自强转。
 */
type Hit = { channel: string; score?: number; title?: string; normalized_title?: string };
type FakeEmbedding = ConstructorParameters<typeof QuestionIndex>[0]["embeddingClient"];

/**
 * 假客户端只用到这三个成员，先按它们校验形状，再转到真类型 ——
 * EmbeddingClient 带私有字段，结构上永远对不上，这一处强转无法避免。
 */
type EmbeddingStub = Pick<EmbeddingClient, "enabled" | "config" | "embed">;
const asEmbedding = (stub: EmbeddingStub): FakeEmbedding => stub as unknown as FakeEmbedding;

function channelsOf(result: { channels: unknown }): { exact: Hit[]; keyword: Hit[]; semantic: Hit[] } {
  return result.channels as { exact: Hit[]; keyword: Hit[]; semantic: Hit[] };
}

/** 关掉向量的假客户端：不配 Embedding 时线上就是这个状态 */
const NO_EMBEDDING = asEmbedding({ enabled: false, config: { baseUrl: "", apiKey: "", model: "none" }, embed: async () => [] });

/**
 * 建一个临时知识库并 refresh 一次，返回可检索的索引实例。
 * `chapter` 为 null 时不写章节文件 —— 给只测检索的用例省点 IO。
 */
interface IndexOptions {
  /** 传了就写这一章的 md，不传就写 TOPIC（只测检索的用例省点 IO） */
  chapter?: string | null;
  embeddingClient?: FakeEmbedding;
}

async function makeIndex({ chapter = null, embeddingClient }: IndexOptions = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "question-"));
  const seriesDir = path.join(root, "Java");
  fs.mkdirSync(seriesDir, { recursive: true });
  if (chapter) fs.writeFileSync(path.join(seriesDir, "多线程.md"), chapter, "utf8");
  else fs.writeFileSync(path.join(seriesDir, "topic.md"), TOPIC, "utf8");

  const db = openDatabase(path.join(root, "test.sqlite"));
  const index = new QuestionIndex({ db, knowledgeRoot: root, embeddingClient: embeddingClient ?? NO_EMBEDDING });
  await index.refresh();
  return index;
}

// ============ 检索 ============

test("search() 返回三条通道，各自带上分数与来源信息", async () => {
  const index = await makeIndex();
  const result = await index.search("HashMap 的底层原理是什么？", 5);

  assert.equal(result.embeddingEnabled, false);
  assert.equal(typeof result.normalizedTitle, "string");

  const { exact, keyword, semantic } = channelsOf(result);

  // 精确匹配：标题规范化后完全相同
  assert.ok(exact.length >= 1, "exact 通道应命中规范标题");
  assert.equal(exact[0].normalized_title, "hashmap的底层原理是什么");

  // 关键词匹配：底层是 FTS5 + bm25（bm25 越小越相关，这里只要求是数字）
  const [keywordRow] = keyword;
  assert.ok(keywordRow, "keyword 通道应有命中");
  assert.equal(typeof keywordRow.score, "number");

  // 未启用向量时该通道为空
  assert.deepEqual(semantic, []);
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
  const embeddingClient = asEmbedding({
    enabled: true,
    config: { baseUrl: "https://fake.test/v1", apiKey: "k", model: "fake-embed" },
    embed: async (inputs: string[]) => inputs.map((text) => (text.includes("HashMap") ? [1, 0] : [0, 1])),
  });
  const index = await makeIndex({ embeddingClient });
  const result = await index.search("HashMap 的底层原理是什么？", 5);

  assert.equal(result.embeddingEnabled, true);
  const [semanticRow] = channelsOf(result).semantic;
  assert.ok(semanticRow, "semantic 通道应有命中");
  assert.equal(typeof semanticRow.score, "number");
  assert.equal(semanticRow.title, "HashMap 的底层原理是什么？");

  const top = result.fused[0];
  assert.ok(top.channels.includes("semantic"), "融合结果应标记 semantic 来源");
});

const LEGACY_CANDIDATE_KEYS = [
  "id", "title", "normalized_title", "answer_excerpt", "source_path", "history_url",
].sort();

test("candidates() 的返回结构保持重构前不变", async () => {
  const index = await makeIndex();
  const candidates = await index.candidates("HashMap 的底层原理是什么？", 5);

  assert.ok(candidates.length >= 1);
  for (const candidate of candidates) {
    assert.deepEqual(Object.keys(candidate).sort(), LEGACY_CANDIDATE_KEYS);
  }
  // modules/archive/index.ts 依赖 normalized_title 做精确判定
  assert.equal(candidates[0].normalized_title, "hashmap的底层原理是什么");
});

test("没有命中时各通道为空且不抛错", async () => {
  const index = await makeIndex();
  const result = await index.search("zzzz-完全不存在的题目-zzzz", 5);
  assert.deepEqual(result.channels.exact, []);
  assert.deepEqual(result.fused, []);
});

// ============ 抽题 ============

test("pick() 按章节抽题，返回的答案必须是完整的而非 180 字摘要", async () => {
  const index = await makeIndex({ chapter: CHAPTER });
  const [picked] = index.pick("Java/多线程.md", 10).filter((q) => q.title.includes("synchronized"));

  assert.ok(picked, "应能抽到那道长答案的题");
  assert.ok(picked.answer.length > 180, `答案不能被截断，实际 ${picked.answer.length} 字符`);
  assert.ok(picked.answer.includes("要点6"), "答案的最后一段也必须在");
});

test("pick() 保留题目、锚点与回答历史链接", async () => {
  const index = await makeIndex({ chapter: CHAPTER });
  const all = index.pick("Java/多线程.md", 10);

  assert.equal(all.length, 3);
  for (const question of all) {
    assert.ok(question.id && question.title, "每题要有 id 与 title");
    assert.match(question.historyUrl ?? "", /^\/private\/series\/答题历史\//);
  }
  const threadPool = all.find((q) => q.title.includes("线程池"));
  assert.ok(threadPool?.answer.includes("池化复用"), "记忆锚点应包含在答案里");
});

test("pick() 的数量：超出章节题量就给全部，给了 count 就按 count", async () => {
  const index = await makeIndex({ chapter: CHAPTER });
  assert.equal(index.pick("Java/多线程.md", 99).length, 3);
  assert.equal(index.pick("Java/多线程.md", 2).length, 2);
});

test("pick() 拒绝越界路径与不存在的章节", async () => {
  const index = await makeIndex({ chapter: CHAPTER });
  assert.throws(() => index.pick("../../etc/passwd.md", 5), /超出知识库/);
  assert.throws(() => index.pick("Java/不存在.md", 5), /不存在/);
});

// ============ 正文处理 ============

test("标题规范化与 CJK 二元切分", () => {
  assert.equal(normalizeTitle(" 什么是 LangGraph？ "), "什么是langgraph");
  assert.equal(cjkBigrams("状态机"), "状态 态机");
});

test("RRF 让被多路召回的候选排前面", () => {
  const ranked = reciprocalRankFusion([["a", "b"], ["b", "c"]]);
  assert.equal(ranked[0].id, "b");
});

// ============ 答题历史 ============

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

function historyRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "history-"));
  fs.mkdirSync(path.join(root, "Java"), { recursive: true });
  fs.writeFileSync(path.join(root, "Java", "多线程-答题记录.md"), HISTORY, "utf8");
  return root;
}

/** 读某一章里某道题的历次回答 */
const readAt = (title: string, chapterPath = "Java/多线程.md") =>
  readHistorySection({ privateHistoryRoot: historyRoot(), chapterPath, title });

test("按章节与标题读出历次回答，含日期", () => {
  const result = readAt("什么是线程池？为什么要用？");

  assert.equal(result.entries.length, 2);
  assert.equal(result.entries[0].date, "2026-08-30");
  assert.match(result.entries[0].answer, /复用线程/);
  assert.equal(result.entries[1].date, "2026-09-05");
  assert.match(result.entries[1].answer, /控制并发数/);
});

test("标题匹配容忍标点与空白差异，且不串到别的题", () => {
  assert.equal(readAt("什么是线程池 为什么要用").entries.length, 2, "去掉标点和空格后应能匹配到同一段落");

  const volatile = readAt("volatile 关键字的作用？");
  assert.equal(volatile.entries.length, 1);
  assert.match(volatile.entries[0].answer, /可见性/);
  assert.ok(!volatile.entries.some((entry) => entry.answer.includes("线程池")), "不能混入其它题的回答");
});

test("只记了日期、内容为空的条目也要保留（与文档站的日期计数一致）", () => {
  const result = readAt("只记了日期没记内容的题？");
  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].date, "2026-09-10");
  assert.equal(result.entries[0].answer, "");
});

test("没有回答的题、以及答题记录文件不存在时，都返回空列表而不是报错", () => {
  assert.deepEqual(readAt("没有任何回答的题？").entries, []);
  assert.deepEqual(readAt("随便什么题？", "Java/不存在的章节.md").entries, []);
});

test("拒绝越界的章节路径", () => {
  assert.throws(() => readAt("x？", "../../../etc/passwd.md"), /超出/);
});
