import assert from "node:assert/strict";
import test from "node:test";

import { InterviewAgent } from "../server/agent.mjs";

/** 用桩接住请求，返回指定 JSON，避免真调模型。 */
async function withStubbedChat(reply, run) {
  const previousFetch = globalThis.fetch;
  const bodies = [];
  globalThis.fetch = async (_url, options) => {
    bodies.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(reply) } }] }), { status: 200 });
  };
  try {
    const agent = new InterviewAgent({
      config: { baseUrl: "https://x.test/v1", apiKey: "k", model: "m" },
      questionIndex: { samples: () => [], topics: () => [{ name: "Java" }, { name: "框架" }] },
    });
    await run(agent, () => bodies.at(-1));
  } finally { globalThis.fetch = previousFetch; }
}

const JD = "岗位职责：参与 AI 应用落地，熟悉 LangGraph 与 RAG";

test("选了目标 JD 时，出题的提示词里要带上它", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句" }, async (agent, lastBody) => {
    await agent.generateQuestion({ session: { series: "Java", chapterPath: "Java/JVM.md", mode: "interview", resumeExcerpt: "简历", jdExcerpt: JD, skillSnapshot: "" } });
    assert.match(JSON.stringify(lastBody().messages), /LangGraph/, "JD 正文要进提示词");
  });
});

test("没选目标 JD 时，提示词里不出现 JD 段", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句" }, async (agent, lastBody) => {
    await agent.generateQuestion({ session: { series: "Java", chapterPath: "Java/JVM.md", mode: "interview", resumeExcerpt: "简历", jdExcerpt: "", skillSnapshot: "" } });
    // 注意：系统提示词里始终有一句「给了目标岗位 JD 时…」的条件指令，
    // 这里要断言的是 JD 正文没被塞进去，不是那句指令。
    assert.ok(!JSON.stringify(lastBody().messages).includes("LangGraph"), "没选就不该把 JD 正文塞进去");
  });
});

test("岗位定制：出题时要求模型给出 topic / series，并把现有分类列给它", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句", topic: "JVM 调优", series: "Java" }, async (agent, lastBody) => {
    const question = await agent.generateQuestion({
      session: { mode: "jd", series: "岗位定制", chapterPath: "", resumeExcerpt: "简历", jdExcerpt: JD, skillSnapshot: "" },
    });
    assert.equal(question.topic, "JVM 调优");
    assert.match(JSON.stringify(lastBody().messages), /topic/, "提示词里要说明 topic");
    assert.match(JSON.stringify(lastBody().messages), /框架/, "要把现有分类列给它挑");
  });
});

test("岗位定制：模型没给 topic 时抛错而不是带着空 topic 往下走", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句" }, async (agent) => {
    await assert.rejects(() => agent.generateQuestion({
      session: { mode: "jd", series: "岗位定制", chapterPath: "", resumeExcerpt: "简历", jdExcerpt: JD, skillSnapshot: "" },
    }), /归属的章节/);
  });
});

test("选了目标 JD 时，总评的提示词里也要带上它", async () => {
  await withStubbedChat({ level: "一般", weak: "并发", next: "多练" }, async (agent, lastBody) => {
    await agent.summarize({
      session: { series: "Java", chapterPath: "Java/JVM.md", completedCount: 1, jdExcerpt: JD, skillSnapshot: "" },
      attempts: [{ title: "题？", score: 60, comment: "点评" }],
    });
    assert.match(JSON.stringify(lastBody().messages), /LangGraph/, "JD 正文要进总评提示词");
  });
});

test("evaluation includes the active session rule snapshot", async () => {
  const previousFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"score":88,"comment":"清楚"}' } }] }), { status: 200 });
  };
  try {
    const agent = new InterviewAgent({ config: { baseUrl: "https://example.test/v1", apiKey: "key", model: "model" }, questionIndex: {} });
    const result = await agent.evaluate({ question: { title: "问题？" }, rawAnswer: "回答", session: { skillSnapshot: "会话规则" } });
    assert.equal(result.score, 88);
    assert.match(requestBody.messages[0].content, /会话规则/);
  } finally { globalThis.fetch = previousFetch; }
});
