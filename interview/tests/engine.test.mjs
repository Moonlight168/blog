import assert from "node:assert/strict";
import test from "node:test";

import { InterviewEngine } from "../server/interview-engine.mjs";

test("accumulates answers and evaluates only when moving to the next question", async () => {
  const calls = [];
  const engine = new InterviewEngine({
    agent: {
      async classify() { return { action: "answer" }; },
      async evaluate() { calls.push("evaluate"); return { score: 80, comment: "结构清楚" }; },
      async generateQuestion() { return { title: "下一题？", prompt: "下一题？", standardAnswer: "1. **要点**：答案" }; },
    },
    archive: async () => calls.push("archive"),
  });
  const session = { status: "active", currentQuestion: { title: "当前题？" }, answerFragments: [] };
  const answerResult = await engine.handle(session, "我的回答");
  assert.deepEqual(calls, []);
  assert.equal(answerResult.session.answerFragments.length, 1);

  const nextResult = await engine.handle(answerResult.session, "下一题");
  assert.deepEqual(calls, ["evaluate", "archive"]);
  assert.equal(nextResult.session.currentQuestion.title, "下一题？");
  assert.deepEqual(nextResult.session.answerFragments, []);
});

test("archive failure prevents advancing", async () => {
  const engine = new InterviewEngine({
    agent: {
      async classify() { return { action: "answer" }; },
      async evaluate() { return { score: 60, comment: "需补充" }; },
      async generateQuestion() { throw new Error("must not generate"); },
    },
    archive: async () => { throw new Error("write failed"); },
  });
  const session = { status: "active", currentQuestion: { title: "当前题？" }, answerFragments: ["回答"] };
  await assert.rejects(() => engine.handle(session, "下一题"), /write failed/);
  assert.equal(session.currentQuestion.title, "当前题？");
});

test("written assessment advances through its pre-generated fixed paper", async () => {
  const engine = new InterviewEngine({
    agent: {
      async evaluate() { return { score: 75, comment: "完成" }; },
      async summarize() { return "测评结束"; },
      async generateQuestion() { throw new Error("written mode must not generate a live question"); },
    },
    archive: async () => {},
  });
  const paper = [{ title: "第一题？", prompt: "第一题？" }, { title: "第二题？", prompt: "第二题？" }];
  const session = { status: "active", mode: "written", currentQuestion: paper[0], paperQuestions: paper, paperIndex: 0, answerFragments: ["回答一"] };
  const next = await engine.handle(session, "下一题");
  assert.equal(next.session.currentQuestion.title, "第二题？");
  next.session.answerFragments.push("回答二");
  const finished = await engine.handle(next.session, "下一题");
  assert.equal(finished.session.status, "completed");
});
