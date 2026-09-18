import assert from "node:assert/strict";
import test from "node:test";

import { InterviewAgent, parseJson } from "../server/agent.mjs";

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

test("人事面试：出行为面题，答案要求写成一段口语而不是分点笔记", async () => {
  await withStubbedChat({ title: "在校期间有没有担任学生干部？", prompt: "题？", standardAnswer: "**锚点**：`x`\n\n在校没有担任学生干部。" }, async (agent, lastBody) => {
    await agent.generateQuestion({
      session: { mode: "hr", series: "基础知识", chapterPath: "基础知识/协作交流.md", resumeExcerpt: "简历", skillSnapshot: "" },
    });
    const system = lastBody().messages[0].content;
    assert.match(system, /人事面试/, "要按人事面试的口径出题");
    assert.match(system, /第一人称/, "答案要是当场会说的话");
    assert.match(system, /不分点/, "行为面不写成分点");
    assert.doesNotMatch(system, /各分类已有章节/, "人事面试不走岗位定制那套章节归类");
  });
});

test("人事面试：出题同样会重试一次结构不全的结果", async () => {
  let calls = 0;
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    calls += 1;
    const content = calls === 1 ? '{"title":"没有问号","standardAnswer":"x"}' : '{"title":"题？","standardAnswer":"**锚点**：`x`\\n\\n一段口语。"}';
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
  };
  try {
    const agent = new InterviewAgent({ config: { baseUrl: "https://x.test/v1", apiKey: "k", model: "m" }, questionIndex: { topics: () => [] } });
    const question = await agent.generateQuestion({ session: { mode: "hr", series: "基础知识", chapterPath: "基础知识/协作交流.md", resumeExcerpt: "简历", skillSnapshot: "" } });
    assert.equal(question.title, "题？");
    assert.equal(calls, 2, "第一次结构不全应当再试一次");
  } finally { globalThis.fetch = previousFetch; }
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

test("改简历时把《简历设计规范》喂进提示词；不传规范时那段整段省略", async () => {
  await withStubbedChat({ html: "<html>改好了</html>" }, async (agent, lastBody) => {
    await agent.reviseResume({ html: "<html>原稿</html>", instruction: "实习那段压缩", spec: "排版硬性规则：正文不小于 13px" });
    assert.match(lastBody().messages[0].content, /简历设计规范/, "要带上规范标题");
    assert.match(lastBody().messages[0].content, /排版硬性规则/, "规范正文要进系统提示词");

    await agent.reviseResume({ html: "<html>原稿</html>", instruction: "改一下" });
    assert.doesNotMatch(lastBody().messages[0].content, /简历设计规范/, "没给规范就不该出现那一段");
  });
});

test("改自我介绍时同样带上《自我介绍规范》", async () => {
  const markdown = ["> a → b", "", "**一、开场**", "", "正文"].join("\n");
  await withStubbedChat({ markdown }, async (agent, lastBody) => {
    await agent.reviseSelfIntro({ markdown, instruction: "开场短点", spec: "篇幅约 3 分钟，不分分钟版" });
    assert.match(lastBody().messages[0].content, /自我介绍规范/);
    assert.match(lastBody().messages[0].content, /不分分钟版/);
  });
});

test("模型偶发不返回 JSON 时重试一次，而不是把错误甩给用户", async () => {
  let calls = 0;
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    calls += 1;
    // 第一次故意回一段散文——实测在 JSON 模式下偶发，同一请求换一次就正常
    const content = calls === 1
      ? "我觉得这段有点长，建议压缩一下。"
      : '{"action":"answer","reply":"确实偏长，建议压到两行。"}';
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
  };
  try {
    const agent = new InterviewAgent({ config: { baseUrl: "https://x.test/v1", apiKey: "k", model: "m" }, questionIndex: { topics: () => [] } });
    const result = await agent.reviseResume({ html: "<html>原稿</html>", instruction: "这段会不会太长了？" });
    assert.equal(calls, 2, "第一次不是 JSON，应当重试一次");
    assert.equal(result.action, "answer");
    assert.match(result.reply, /偏长/);
  } finally { globalThis.fetch = previousFetch; }
});

test("模型干脆说了一段话（没按 JSON 回）时，当作「回答」收下，而不是报错", async () => {
  let calls = 0;
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ choices: [{ message: { content: "这段确实偏长，建议压到两行。" } }] }), { status: 200 });
  };
  try {
    const agent = new InterviewAgent({ config: { baseUrl: "https://x.test/v1", apiKey: "k", model: "m" }, questionIndex: { topics: () => [] } });
    const result = await agent.reviseResume({ html: "<html>原稿</html>", instruction: "这段会不会太长了？" });
    assert.equal(result.action, "answer", "说了一段话，那就是在回答");
    assert.match(result.reply, /偏长/);
    assert.equal(result.html, "", "没给稿子就不动简历");
    assert.equal(calls, 2, "仍然先重试一次，重试还是散文才兜底");
  } finally { globalThis.fetch = previousFetch; }
});

test("JSON 坏了（有 { 但解不开）才报错，且最多重试一次", async () => {
  let calls = 0;
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    calls += 1;
    // 半截 JSON：这种不能兜——它不是「在说话」，是响应真的坏了
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"action":"revise","reply":"' } }] }), { status: 200 });
  };
  try {
    const agent = new InterviewAgent({ config: { baseUrl: "https://x.test/v1", apiKey: "k", model: "m" }, questionIndex: { topics: () => [] } });
    await assert.rejects(
      () => agent.reviseResume({ html: "<html>原稿</html>", instruction: "压缩" }),
      /JSON/,
    );
    assert.equal(calls, 2, "只重试一次，不能无限循环");
  } finally { globalThis.fetch = previousFetch; }
});

test("选「全部」：不受已有章节限制，按岗位普遍要求的技能出题，库里没有的可新建 topic", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句", topic: "langchain" }, async (agent, lastBody) => {
    const question = await agent.generateQuestion({
      session: { mode: "interview", series: "Java", chapterPath: "", resumeExcerpt: "简历", skillSnapshot: "" },
    });
    assert.equal(question.topic, "langchain", "模型自报的新 topic 要传出来，归档要靠它");
    const system = lastBody().messages[0].content;
    assert.match(system, /岗位上普遍要求的技能/, "选题依据是市场要求，不是库里现有什么");
    assert.match(system, /不受已有章节限制/, "已有章节是归档去处，不是选题范围");
    assert.match(system, /新建一个 topic/, "库里没有的技能要能新建收下");
    assert.match(system, /别为了新而新/, "要有反向约束：拿不准算不算岗位必备就别问");
    assert.match(system, /本分类已有章节/, "仍要把已有章节列出来给它当归档去处");
    assert.doesNotMatch(system, /岗位定制/, "别串到岗位定制那套措辞上去");
  });
});

test("选「全部」给的是本分类的章节，不是全库的分类（否则题会归到别的分类去）", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句", topic: "集合" }, async (agent, lastBody) => {
    await agent.generateQuestion({
      session: { mode: "interview", series: "Java", chapterPath: "", resumeExcerpt: "简历", skillSnapshot: "" },
    });
    const system = lastBody().messages[0].content;
    // 只列章节名、不带「分类：」前缀——带了会被模型照抄进 topic（实测返回过「Agent 开发：langgraph」）
    assert.match(system, /本分类已有章节（能归进去就归进去）：集合、多线程/);
    assert.doesNotMatch(system, /spring/, "别的分类的章节不该出现——分类是锁死的");
  });
});

test("指定了具体章节时，提示词按老样子围绕那一章，不出现「不受已有章节限制」", async () => {
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: "1. **要点**：短句" }, async (agent, lastBody) => {
    await agent.generateQuestion({
      session: { mode: "interview", series: "Java", chapterPath: "Java/集合.md", resumeExcerpt: "简历", skillSnapshot: "" },
    });
    const system = lastBody().messages[0].content;
    assert.match(system, /围绕指定章节/, "有指定章节就走原路");
    assert.doesNotMatch(system, /不受已有章节限制/);
  });
});

test("两处「让 AI 改」共用同一份判断规则，不能各写一份长歪", async () => {
  await withStubbedChat({ action: "answer", reply: "……" }, async (agent, lastBody) => {
    await agent.reviseResume({ html: "<html>原稿</html>", instruction: "这段会不会太长？" });
    const resumeSystem = lastBody().messages[0].content;
    await agent.reviseSelfIntro({ markdown: "# 稿子", instruction: "开场会不会太长？" });
    const introSystem = lastBody().messages[0].content;

    for (const [label, system] of [["简历", resumeSystem], ["自我介绍", introSystem]]) {
      assert.match(system, /祈使句/, `${label}：判据是句式——祈使句=让改、疑问句=在问`);
      assert.match(system, /先改个人优势/, `${label}：踩过的那句原话要写进规则，模型才认得出来`);
      assert.match(system, /分不清就判 answer/, `${label}：兜底方向不能被改掉`);
    }
  });
});

test("改简历：模型判为「问意见」时不给改动，只给回复", async () => {
  await withStubbedChat({ action: "answer", reply: "这段确实偏长，建议压到两行。" }, async (agent) => {
    const result = await agent.reviseResume({ html: "<html>原稿</html>", instruction: "这段会不会太长了？" });
    assert.equal(result.action, "answer");
    assert.equal(result.html, "", "问意见时不该返回改动");
    assert.match(result.reply, /偏长/);
  });
});

test("改简历：模型判为「让你改」时返回完整正文", async () => {
  await withStubbedChat({ action: "revise", reply: "压缩了实习那段。", html: "<html>改后</html>" }, async (agent) => {
    const result = await agent.reviseResume({ html: "<html>原稿</html>", instruction: "实习那段压缩到两行" });
    assert.equal(result.action, "revise");
    assert.equal(result.html, "<html>改后</html>");
  });
});

test("改简历：模型没表态也没给稿子时按「问意见」处理，绝不擅自改动", async () => {
  await withStubbedChat({ reply: "……" }, async (agent) => {
    const result = await agent.reviseResume({ html: "<html>原稿</html>", instruction: "嗯" });
    assert.equal(result.action, "answer", "拿不准就该不动手——改稿是有副作用的");
  });
});

test("改简历：模型漏了 action 但给了稿子，仍按改稿处理（兼容漏字段）", async () => {
  await withStubbedChat({ html: "<html>改后</html>" }, async (agent) => {
    const result = await agent.reviseResume({ html: "<html>原稿</html>", instruction: "压缩" });
    assert.equal(result.action, "revise");
  });
});

test("改简历：说了要改却没给稿子，要报错而不是假装改过", async () => {
  await withStubbedChat({ action: "revise", reply: "好了" }, async (agent) => {
    await assert.rejects(
      () => agent.reviseResume({ html: "<html>原稿</html>", instruction: "压缩" }),
      /没返回/,
    );
  });
});

test("自我介绍走同一套判断（两边行为不能长歪）", async () => {
  await withStubbedChat({ action: "answer", reply: "开场有点长。" }, async (agent) => {
    const result = await agent.reviseSelfIntro({
      markdown: "> 开场 → 实习\n\n正文", instruction: "开场是不是太长了？",
    });
    assert.equal(result.action, "answer");
    assert.equal(result.markdown, "", "问意见时不该返回改动");
    assert.match(result.reply, /开场/);
    const revised = await (async () => {
      const previous = globalThis.fetch;
      globalThis.fetch = async () => new Response(
        JSON.stringify({ choices: [{ message: { content: '{"action":"revise","reply":"好了","markdown":"> 开场 → 实习\\n\\n改后"}' } }] }),
        { status: 200 });
      try { return await agent.reviseSelfIntro({ markdown: "旧", instruction: "压短点" }); }
      finally { globalThis.fetch = previous; }
    })();
    assert.equal(revised.action, "revise");
    assert.equal(revised.markdown, "> 开场 → 实习\n\n改后");
  });
});

test("对话框历史还原成真正的多轮消息，报错气泡不喂回模型", async () => {
  await withStubbedChat({ action: "answer", reply: "……" }, async (agent, lastBody) => {
    await agent.reviseResume({
      html: "<html>原稿</html>",
      instruction: "那教育经历那段呢？",
      history: [
        { role: "user", text: "实习那段会不会太长？" },
        { role: "assistant", text: "确实偏长，建议压到两行。" },
        { role: "assistant", text: "这次没成功：连不上对话模型服务", error: true },
      ],
    });
    const messages = lastBody().messages;
    assert.equal(messages[0].role, "system");
    assert.deepEqual(
      messages.slice(1).map((m) => m.role),
      ["user", "assistant", "user"],
      "历史要按 user/assistant 交替还原，最后一条是他这次说的",
    );
    assert.equal(messages.at(-1).content, "那教育经历那段呢？");
    assert.doesNotMatch(JSON.stringify(messages), /连不上对话模型服务/, "报错气泡不该当成模型说过的话");
    // 助手那轮必须是 JSON 形状——混散文进 JSON 模式的对话，模型有 40% 概率返回空内容（实测）
    const assistantTurn = messages.find((m) => m.role === "assistant");
    const replayed = JSON.parse(assistantTurn.content);
    assert.equal(replayed.reply, "确实偏长，建议压到两行。");
    assert.equal(replayed.action, "answer");
    assert.match(messages.find((m) => m.role === "user").content, /实习那段会不会太长/, "用户那侧仍是纯文本");
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

// ---- 对话历史压缩：更早那几轮压成滚动摘要，跟着每轮一起发 ----

test("压缩历史：既有摘要和待压对话都进提示词，并取回新摘要", async () => {
  await withStubbedChat({ summary: "用户要求教育经历那栏别动" }, async (agent, lastBody) => {
    const summary = await agent.compactHistory({
      summary: "早先定过：整体压到一页内",
      turns: [{ role: "user", text: "教育经历那栏别动" }, { role: "assistant", text: "好" }],
    });

    assert.equal(summary, "用户要求教育经历那栏别动");
    const prompt = JSON.stringify(lastBody().messages);
    assert.match(prompt, /整体压到一页内/, "既有摘要是滚动的，漏掉它等于每压一次丢一层");
    assert.match(prompt, /教育经历那栏别动/, "待压缩的对话要在里面");
  });
});

test("压缩历史：模型没给摘要就给空串，不把 undefined 写进去", async () => {
  await withStubbedChat({}, async (agent) => {
    assert.equal(await agent.compactHistory({ turns: [{ role: "user", text: "随便说点什么" }] }), "");
  });
});

test("改简历：带了摘要就进提示词，并标明它只是上下文、不是新指令", async () => {
  await withStubbedChat({ action: "answer", reply: "好" }, async (agent, lastBody) => {
    await agent.reviseResume({ html: "<html></html>", instruction: "再说一遍", summary: "早先定过：整体压到一页内" });
    const system = lastBody().messages[0].content;
    assert.match(system, /早先定过：整体压到一页内/);
    assert.match(system, /不是新指令/, "要写明它是上下文，否则模型可能把摘要当成本次要求");
  });
});

test("改简历：没有摘要时不出现摘要段", async () => {
  await withStubbedChat({ action: "answer", reply: "好" }, async (agent, lastBody) => {
    await agent.reviseResume({ html: "<html></html>", instruction: "问个问题" });
    assert.doesNotMatch(lastBody().messages[0].content, /之前已经聊过/);
  });
});

test("改自我介绍：摘要同样要进提示词", async () => {
  await withStubbedChat({ action: "answer", reply: "好" }, async (agent, lastBody) => {
    await agent.reviseSelfIntro({ markdown: "稿子", instruction: "再改一次", summary: "早先定过：链路锚点那行别动" });
    assert.match(lastBody().messages[0].content, /链路锚点那行别动/);
  });
});

// ---- 从模型回复里抠 JSON ----

test("JSON 后面又补了一段话（里面还带花括号），也要能解析出来", () => {
  // 真机上遇到的报错：Unexpected non-whitespace character after JSON at position 61
  // —— 取「第一个 { 到最后一个 }」时，把后面那句补充说明里的 `}` 也圈进来了
  const text = '{"action":"answer","reply":"好的，这段不用改"}\n\n补充说明：真改的话，注意 { } 要成对';
  assert.deepEqual(parseJson(text), { action: "answer", reply: "好的，这段不用改" });
});

test("JSON 字符串里的花括号和转义引号，不能把配对带偏", () => {
  const text = '{"html":"<style>.a{color:red}</style>","reply":"他说\\"好\\""}';
  assert.deepEqual(parseJson(text), { html: "<style>.a{color:red}</style>", reply: '他说"好"' });
});

test("```json 包起来、前后带空白，都照常解", () => {
  assert.deepEqual(parseJson('\n```json\n{"a":1}\n```\n'), { a: 1 });
});

test("压根没有对象就报错，别硬编一个空的出来", () => {
  assert.throws(() => parseJson("这段我没法按 JSON 回"), /未返回 JSON/);
});

test("对象没闭合要说清楚，而不是抛一句看不懂的解析错", () => {
  assert.throws(() => parseJson('{"action":"answer"'), /不完整/);
});

test("摘要排在文稿之前：文稿每次改都变，放最后才不打断前面那段缓存", async () => {
  await withStubbedChat({ action: "answer", reply: "好" }, async (agent, lastBody) => {
    await agent.reviseResume({ html: "AAAA-简历正文", instruction: "问个问题", summary: "BBBB-摘要" });
    const system = lastBody().messages[0].content;
    assert.ok(system.indexOf("BBBB-摘要") < system.indexOf("AAAA-简历正文"), "摘要要在文稿前面");
  });
});
