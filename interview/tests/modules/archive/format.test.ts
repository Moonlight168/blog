import assert from "node:assert/strict";
import test from "node:test";

import {
  buildQuestionBlock,
  parseQuestions,
  splitLongBullets,
  validateQuestionBlock,
  widthUnits,
} from "../../../server/modules/archive/format.ts";
import { mergeHistory } from "../../../server/modules/archive/index.ts";

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
    answer: "**锚点**：`状态定义边界，事件驱动迁移`\n\n1. **边界清晰**：用状态约束流程\n   - 非法迁移会被拒绝",
    historyUrl: "/private/series/答题历史/Java/topic-答题记录.md#为什么需要状态机",
  });
  assert.deepEqual(validateQuestionBlock(block), []);
  assert.match(block, /^## 为什么需要状态机？/);
  // 回答历史链接放在「答案之后」——与全库现有写法一致
  const [beforeLink] = block.split("→ [回答历史]");
  assert.ok(beforeLink.includes("边界清晰"), "答案要在链接之前");
  assert.match(block, /\n→ \[回答历史\]\(\/private\/series\/答题历史\/.+\)\n$/);
});

test("主句字数按汉字当量算：汉字 1、半角 0.5、空格与反引号不计", () => {
  assert.equal(widthUnits("中文"), 2);
  assert.equal(widthUnits("ab"), 1);
  assert.equal(widthUnits("`ab`"), 1);
  assert.equal(widthUnits("a b"), 1);
});

test("英文标识符堆出来的主句不再被误判超长", () => {
  // 旧口径下这句是 40 字（retry_count 每个字母算 1 字），实际视觉宽度只有 24
  const block = buildQuestionBlock({
    title: "定时任务怎么失败重试？",
    answer: "**锚点**：`状态机 + 乐观锁`\n\n1. **失败重试**：记录 retry_count 与 next_retry_time，指数退避重试。",
    historyUrl: "/private/series/答题历史/Java/topic-答题记录.md#定时任务怎么失败重试",
  });
  assert.match(block, /retry_count/);
});

test("真正超长的主句仍然拒绝，并指出是第几条、超多少", () => {
  const long = "1. **定义**：这句话故意写得非常长用来触发上限校验一二三四五六七八九十甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥";
  const block = `## 什么是状态机？\n\n**锚点**：\`状态定义边界\`\n\n${long}\n\n→ [回答历史](/private/series/答题历史/Java/t.md#什么是状态机)\n`;
  const errors = validateQuestionBlock(block);
  assert.ok(errors.some((error) => /第 1 条/.test(error)), `错误信息要指出第几条：${errors.join("；")}`);
});

test("兜底拆分：超长主句降级为二级补充，事实不丢且能通过校验", () => {
  const long = "1. **失败重试**：记录 retry_count 与 next_retry_time，失败后按指数退避重试，超过上限置为死信状态并通知人工介入处理";
  const split = splitLongBullets(`**锚点**：\`状态机重试\`\n\n${long}`);
  assert.match(split, /\n {3}- /, "应当生成 3 空格缩进的二级补充");
  const block = buildQuestionBlock({
    title: "状态机怎么重试？",
    answer: split,
    historyUrl: "/private/series/答题历史/Java/topic-答题记录.md#状态机怎么重试",
  });
  assert.match(block, /retry_count/);
  assert.match(block, /人工介入/);
});

test("锚点写法固定为 **锚点**：`一行口诀`，写成「记忆锚点：」会被拒绝", () => {
  // 全库 574 条锚点无一例外都是这个写法，规范正文里却只写了「记忆锚点」四个字，
  // 模型照着正文写过一次「记忆锚点：…」，校验当时不查格式，就这么漏进了知识库
  const withOldStyle = `## 什么是状态机？\n\n记忆锚点：状态定义边界。\n\n1. **定义**：状态驱动流程\n\n→ [回答历史](/private/series/答题历史/Java/t.md#什么是状态机)\n`;
  const errors = validateQuestionBlock(withOldStyle);
  assert.ok(errors.some((error) => /锚点/.test(error)), `要指出锚点写法不对：${errors.join("；")}`);

  // 漏掉反引号同样不算数
  const withoutTicks = `## 什么是状态机？\n\n**锚点**：状态定义边界。\n\n1. **定义**：状态驱动流程\n\n→ [回答历史](/private/series/答题历史/Java/t.md#什么是状态机)\n`;
  assert.ok(validateQuestionBlock(withoutTicks).some((error) => /锚点/.test(error)), "锚点内容必须用反引号包住");
});

test("行为面答案：锚点 + 一段口语就算合规，不要求编号要点", () => {
  const block = buildQuestionBlock({
    title: "在校期间有没有担任学生干部？",
    answer: "**锚点**：`没干部没竞赛，如实说`\n\n在校没有担任学生干部，也没参加过竞赛，这块我不编。",
    historyUrl: "/private/series/答题历史/基础知识/非技术面试问答-答题记录.md#在校期间有没有担任学生干部",
    prose: true,
  });
  assert.match(block, /这块我不编/);
});

test("行为面答案：分点、或口语超过 4 行，都算不合规", () => {
  const wrap = (answer: string) => `## 题？\n\n${answer}\n\n→ [回答历史](/private/series/答题历史/基础知识/非技术面试问答-答题记录.md#题)\n`;
  const bullets = wrap("**锚点**：`x`\n\n1. **要点**：短句");
  assert.ok(validateQuestionBlock(bullets, { prose: true }).some((error) => /不要编号分点/.test(error)), "行为面不该分点");
  const long = wrap(`**锚点**：\`x\`\n\n${["一", "二", "三", "四", "五"].map((n) => `第${n}段话`).join("\n")}`);
  assert.ok(validateQuestionBlock(long, { prose: true }).some((error) => /不超过 4 行/.test(error)), "口语要短");
});

test("同一段口语：行为面形态放行，技术题形态仍要求编号要点", () => {
  const block = `## 题？\n\n**锚点**：\`x\`\n\n就是一段口语，不分点。\n\n→ [回答历史](/private/series/答题历史/基础知识/非技术面试问答-答题记录.md#题)\n`;
  assert.deepEqual(validateQuestionBlock(block, { prose: true }), []);
  assert.ok(validateQuestionBlock(block).some((error) => /编号加粗要点/.test(error)), "技术题形态下这段口语应当不合格");
});

test("⭐ 是人工标的真题标记：新出的题不许带，重写已有题要放行", () => {
  const block = `## ⭐题？\n\n**锚点**：\`x\`\n\n1. **要点**：短句\n\n→ [回答历史](/private/series/答题历史/基础知识/非技术面试问答-答题记录.md#题)\n`;
  assert.ok(validateQuestionBlock(block).some((error) => /星标/.test(error)), "模型不该自己加星标");
  assert.deepEqual(validateQuestionBlock(block, { allowStar: true }), [], "重写已标 ⭐ 的题不该被拦下");
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
