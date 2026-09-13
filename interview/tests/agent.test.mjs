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
      questionIndex: {
        topics: () => [
          { name: "Java", chapters: [{ name: "集合", path: "Java/集合.md" }, { name: "多线程", path: "Java/多线程.md" }] },
          { name: "框架", chapters: [{ name: "spring", path: "框架/spring.md" }] },
        ],
      },
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

test("岗位定制：出题时列出各分类已有章节，要求优先复用而不是另造近义章节", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句", topic: "集合", series: "Java" }, async (agent, lastBody) => {
    await agent.generateQuestion({
      session: { mode: "jd", series: "岗位定制", chapterPath: "", resumeExcerpt: "简历", jdExcerpt: JD, skillSnapshot: "" },
    });
    const system = lastBody().messages[0].content;
    assert.match(system, /各分类已有章节/, "要告诉模型库里已经有哪些章节");
    assert.match(system, /- Java：集合、多线程/, "已有章节要按分类列出来");
    assert.match(system, /不要合并两章造一个新名字/, "跨两章的题要挑最贴近的一个，不能自造合并名");
    assert.doesNotMatch(system, /JVM 调优/, "不能再拿库里没有的章节名当例子，模型会照着造");
  });
});

test("标准答案要求第一人称、不要写成「对应简历那版…」这种旁白", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句" }, async (agent, lastBody) => {
    await agent.generateQuestion({
      session: { mode: "interview", series: "Java", chapterPath: "Java/JVM.md", resumeExcerpt: "简历", skillSnapshot: "" },
    });
    const system = lastBody().messages[0].content;
    assert.match(system, /第一人称/, "要求候选人当场会说的话");
    assert.match(system, /旁白/, "要明确禁止站在文档外面讲解");
    assert.match(system, /不要出现“简历”/, "点明不许出现「简历」二字");
  });
});

test("笔试出题同样要求第一人称、不要旁白", async () => {
  await withStubbedChat({ questions: [{ title: "题？", prompt: "题？", standardAnswer: "**锚点**：`x`\n\n1. **要点**：短句" }] }, async (agent, lastBody) => {
    await agent.generatePaper({
      session: { series: "Java", chapterPath: "Java/JVM.md", resumeExcerpt: "简历", skillSnapshot: "", nextFocuses: [], askedQuestions: [] },
      count: 1,
    });
    const system = lastBody().messages[0].content;
    assert.match(system, /第一人称/);
    assert.match(system, /旁白/);
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

test("规则快照只给真正产出格式化内容的调用，点评/分类不再白带（省 token）", async () => {
  const bodies = [];
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    bodies.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"score":88,"comment":"清楚","action":"answer","title":"题？","prompt":"题？","standardAnswer":"1. **要点**：短句"}' } }] }), { status: 200 });
  };
  try {
    const agent = new InterviewAgent({ config: { baseUrl: "https://example.test/v1", apiKey: "key", model: "model" }, questionIndex: { topics: () => [] } });
    const session = { skillSnapshot: "会话规则快照正文", currentQuestion: { title: "题？" }, series: "Java", chapterPath: "Java/JVM.md", mode: "interview", resumeExcerpt: "简历" };
    await agent.evaluate({ question: { title: "问题？" }, rawAnswer: "回答", session });
    assert.doesNotMatch(bodies.at(-1).messages[0].content, /会话规则快照正文/, "点评不需要格式规范");
    await agent.classify({ session, text: "我不太清楚" });
    assert.doesNotMatch(bodies.at(-1).messages[0].content, /会话规则快照正文/, "分类不需要格式规范");
    await agent.generateQuestion({ session });
    assert.match(bodies.at(-1).messages[0].content, /会话规则快照正文/, "出题仍然需要（格式靠它约束）");
  } finally { globalThis.fetch = previousFetch; }
});

test("出题用高温、判定类调用用低温", async () => {
  const bodies = [];
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    bodies.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"score":88,"comment":"清楚","title":"题？","prompt":"题？","standardAnswer":"1. **要点**：短句","standardAnswerAgain":"x"}' } }] }), { status: 200 });
  };
  try {
    const agent = new InterviewAgent({ config: { baseUrl: "https://example.test/v1", apiKey: "key", model: "model" }, questionIndex: { topics: () => [] } });
    const session = { skillSnapshot: "", currentQuestion: { title: "题？" }, series: "Java", chapterPath: "Java/JVM.md", mode: "interview", resumeExcerpt: "简历" };
    await agent.generateQuestion({ session });
    const creative = bodies.at(-1).temperature;
    await agent.evaluate({ question: { title: "问题？" }, rawAnswer: "回答", session });
    const stable = bodies.at(-1).temperature;
    assert.ok(creative > stable, `出题温度应高于点评：${creative} vs ${stable}`);
    assert.equal(stable, 0.35);
  } finally { globalThis.fetch = previousFetch; }
});

test("出题提示词带上「已问过的题」，只给标题且放在最末尾", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句" }, async (agent, lastBody) => {
    await agent.generateQuestion({
      session: {
        series: "Java", chapterPath: "Java/JVM.md", mode: "interview", resumeExcerpt: "简历", skillSnapshot: "",
        askedQuestions: ["线上 Full GC 怎么排查？", "Redis 缓存穿透怎么防？"],
      },
    });
    const user = lastBody().messages[1].content;
    assert.match(user, /已经问过的题目/);
    assert.match(user, /- 线上 Full GC 怎么排查？/);
    assert.ok(user.trimEnd().endsWith("- Redis 缓存穿透怎么防？"), "变化的部分要放在最后，好让前缀命中缓存");
    // 已问清单只给标题：没有答案/摘要
    assert.doesNotMatch(user, /标准答案|answer_excerpt/);
  });
});

test("网络不可用时给出可读提示，而不是把 fetch failed 甩给用户", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const error = new TypeError("fetch failed");
    error.cause = { code: "ENOTFOUND" };
    throw error;
  };
  try {
    const agent = new InterviewAgent({
      config: { baseUrl: "https://api.deepseek.com/v1", apiKey: "k", model: "m" },
      questionIndex: { topics: () => [] },
    });
    await assert.rejects(
      () => agent.generateQuestion({
        session: { mode: "interview", series: "Java", chapterPath: "Java/JVM.md", resumeExcerpt: "简历", skillSnapshot: "" },
      }),
      (error) => {
        assert.match(error.message, /连不上对话模型服务/);
        assert.match(error.message, /api\.deepseek\.com/);
        assert.match(error.message, /ENOTFOUND/);
        return true;
      },
    );
  } finally { globalThis.fetch = previousFetch; }
});

test("追问要带上简历/JD/当前题与标准答案，否则答不出「结合我的项目」", async () => {
  await withStubbedChat({ reply: "……" }, async (agent, lastBody) => {
    await agent.answerFollowup({
      session: {
        currentQuestion: { title: "集合怎么选型？", standardAnswer: "记忆锚点：先说场景。\n1. **选型**：按 key 查改用 HashMap。" },
        resumeExcerpt: "项目经历：校园二手交易平台，用 Redis 缓存热点商品",
        jdExcerpt: JD,
      },
      text: "结合我的项目，给出一个标准答案。",
    });
    const user = lastBody().messages[1].content;
    assert.match(user, /校园二手交易平台/, "要拿得到简历里的真实项目，否则只能回「我没法替你编」");
    assert.match(user, /LangGraph/, "要带上目标 JD");
    assert.match(user, /HashMap/, "要带上本题标准答案");
    assert.ok(user.trimEnd().endsWith("结合我的项目，给出一个标准答案。"), "追问放最后，前面同一题不变的部分才能命中缓存");
  });
});

test("追问的提示词禁止回避推诿，也不再要求藏起标准答案（它本来就展示给候选人）", async () => {
  await withStubbedChat({ reply: "……" }, async (agent, lastBody) => {
    await agent.answerFollowup({
      session: { currentQuestion: { title: "什么是 G1？", standardAnswer: "1. **分区**：把堆切成 Region。" }, resumeExcerpt: "简历", jdExcerpt: "" },
      text: "结合我的项目讲讲",
    });
    const system = lastBody().messages[0].content;
    assert.match(system, /不许回避/, "要明确禁止「这个得结合你自己的项目来讲」这类推诿");
    assert.doesNotMatch(system, /不泄露完整标准答案/, "作答后本来就会展示标准答案，藏它只会让模型推掉追问");
  });
});

test("出题不再注入「章节已有题目样例」（该功能已移除）", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句" }, async (agent, lastBody) => {
    await agent.generateQuestion({
      session: { series: "Java", chapterPath: "Java/JVM.md", mode: "interview", resumeExcerpt: "简历", skillSnapshot: "" },
    });
    assert.doesNotMatch(JSON.stringify(lastBody().messages), /样例/);
  });
});
