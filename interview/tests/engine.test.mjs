import assert from "node:assert/strict";
import test from "node:test";

import { InterviewEngine } from "../server/interview-engine.mjs";

const QUESTION = { title: "当前题？", standardAnswer: "**锚点**：`短句`\n\n1. **要点**：短句" };
const session = () => ({ id: "s1", status: "active", currentQuestion: { ...QUESTION } });

/** 桩：覆盖项只改返回值，调用记录一律保留，避免自定义实现绕过断言。 */
function makeEngine({
  classifyAction = "answer",
  evaluateResult = { score: 80, comment: "结构清楚" },
  archiveResult = {},
  archiveError = null,
  summarizeResult = "本场总评",
  attempts = [],
} = {}) {
  const calls = [];
  const engine = new InterviewEngine({
    agent: {
      async classify() { calls.push("classify"); return { action: classifyAction }; },
      async evaluate() { calls.push("evaluate"); return evaluateResult; },
      async answerFollowup() { calls.push("answerFollowup"); return "答疑内容"; },
      async generateQuestion() {
        calls.push("generateQuestion");
        return { title: "下一题？", prompt: "下一题？", standardAnswer: "1. **要点**：x" };
      },
      async summarize() { calls.push("summarize"); return summarizeResult; },
    },
    archive: async () => { calls.push("archive"); if (archiveError) throw archiveError; return archiveResult; },
    listAttempts: (id) => { calls.push("listAttempts:" + id); return attempts; },
  });
  return { engine, calls };
}

test("一条消息就是一次回答：立刻点评，并给出标准答案", async () => {
  const { engine, calls } = makeEngine();
  const result = await engine.handle(session(), "我答的是这样的");

  assert.deepEqual(calls, ["classify", "evaluate", "archive"], "回答要立刻点评并归档，不再等「下一题」");
  assert.deepEqual(result.messages.map((m) => m.kind), ["evaluation", "answer"]);
  assert.equal(result.messages[1].content, QUESTION.standardAnswer, "要把宝典规范格式的标准答案讲出来");
  assert.equal(result.session.completedCount, 1);
});

test("说「不知道」和普通回答走同一条路，只是分数低", async () => {
  const { engine, calls } = makeEngine({ evaluateResult: { score: 0, comment: "这题没答上来，正常" } });
  const result = await engine.handle(session(), "这个不太清楚");

  assert.deepEqual(calls, ["classify", "evaluate", "archive"], "「不知道」也是一次回答，照样点评归档");
  assert.deepEqual(result.messages.map((m) => m.kind), ["evaluation", "answer"]);
  assert.equal(result.messages[0].evaluation.score, 0);
});

test("没有标准答案时降级为提示文案", async () => {
  const { engine } = makeEngine();
  const result = await engine.handle({ ...session(), currentQuestion: { title: "题？" } }, "不会");
  assert.match(result.messages.find((m) => m.kind === "answer").content, /暂无标准答案/);
});

test("追问只答疑，不点评不归档", async () => {
  const { engine, calls } = makeEngine({ classifyAction: "followup" });
  const result = await engine.handle(session(), "那 G1 和 CMS 有什么区别？");

  assert.deepEqual(calls, ["classify", "answerFollowup"]);
  assert.deepEqual(result.messages.map((m) => m.kind), ["followup"]);
  assert.equal(result.session.completedCount, undefined);
});

test("归档被跳过时用 notice 告知，但点评和标准答案照常给", async () => {
  const { engine } = makeEngine({ archiveResult: { notice: "未写入知识库：一级要点主句不得超过 30 字" } });
  const result = await engine.handle(session(), "我的回答");

  const kinds = result.messages.map((m) => m.kind);
  assert.deepEqual(kinds, ["evaluation", "notice", "answer"]);
  assert.match(result.messages[1].content, /30 字/);
});

test("按钮：下一题只出题，不点评（回答已经即时点评过）", async () => {
  const { engine, calls } = makeEngine();
  const result = await engine.advance(session(), false);

  assert.deepEqual(calls, ["generateQuestion"]);
  assert.equal(result.session.currentQuestion.title, "下一题？");
  assert.deepEqual(result.messages.map((m) => m.kind), ["question"]);
});

test("按钮：结束会带上本场逐题得分生成总评", async () => {
  const attempts = [{ title: "当前题？", score: 60 }, { title: "上一题？", score: 90 }];
  let received;
  const { engine, calls } = makeEngine({ attempts, summarizeResult: "你在 JVM 上偏弱" });
  received = await engine.advance({ ...session(), completedCount: 2 }, true);

  assert.deepEqual(calls, ["listAttempts:s1", "summarize"]);
  assert.equal(received.session.status, "completed");
  assert.equal(received.messages[0].kind, "summary");
  assert.equal(received.messages[0].content, "你在 JVM 上偏弱");
  assert.deepEqual(engine.listAttempts("s1"), attempts, "总评必须能拿到真实得分，否则只能是废话");
});

test("字面兜底：直接打「下一题」「结束」仍然有效，不会被当成回答", async () => {
  const next = makeEngine();
  await next.engine.handle(session(), "下一题");
  assert.deepEqual(next.calls, ["generateQuestion"], "打字「下一题」不能走回答分支");

  const end = makeEngine();
  await end.engine.handle(session(), "结束");
  assert.deepEqual(end.calls, ["listAttempts:s1", "summarize"]);
});

test("归档失败时不产出点评，且不切题", async () => {
  const { engine, calls } = makeEngine({ archiveError: new Error("write failed") });
  const target = session();
  await assert.rejects(() => engine.handle(target, "我的回答"), /write failed/);
  assert.ok(!calls.includes("generateQuestion"), "失败时不该往下走");
  assert.equal(target.currentQuestion.title, "当前题？");
});

test("书面测评：按钮推进整卷，答完最后一题自动结束", async () => {
  const paper = [{ title: "第一题？", standardAnswer: "a" }, { title: "第二题？", standardAnswer: "b" }];
  const { engine } = makeEngine();
  const base = { id: "s1", status: "active", mode: "written", paperQuestions: paper, paperIndex: 0 };

  const first = await engine.advance({ ...base, currentQuestion: paper[0] }, false);
  assert.equal(first.session.currentQuestion.title, "第二题？");

  const done = await engine.advance(first.session, false);
  assert.equal(done.session.status, "completed");
  assert.equal(done.messages.at(-1).kind, "summary");
});
