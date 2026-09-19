import assert from "node:assert/strict";
import test from "node:test";

import { InterviewAgent, parseJson } from "../../../server/modules/interview/interviewer.ts";
import { makeSession } from "../../helpers/factories.ts";
import type { SessionWithFocus, TopicSeries } from "../../../shared/types.ts";

/**
 * `InterviewAgent` 走的是裸 HTTP（不是 pi 那条链），所以这里用 fetch 桩接住请求，
 * 而不是 pi 的 fauxProvider。
 */

const TOPICS: TopicSeries[] = [
  { name: "Java", chapters: [{ name: "集合", path: "Java/集合.md" }, { name: "多线程", path: "Java/多线程.md" }] },
  { name: "框架", chapters: [{ name: "spring", path: "框架/spring.md" }] },
];

const JD = "岗位职责：参与 AI 应用落地，熟悉 LangGraph 与 RAG";
const ANSWER = "1. **要点**：短句";

/** 一次请求里我们关心的部分：发给模型的 messages */
interface ChatBody {
  messages: Array<{ role: string; content: string }>;
}

let bodies: ChatBody[] = [];

/** 取最后一次请求体；没发过请求说明用例本身写错了 */
function lastBody(): ChatBody {
  const body = bodies.at(-1);
  assert.ok(body, "应当发过至少一次请求");
  return body;
}

type Responder = (call: number, url: string) => Response | Promise<Response>;
type Scenario = (agent: InterviewAgent, lastBody: () => ChatBody) => Promise<void>;
interface FetchOptions { baseUrl?: string; topics?: TopicSeries[] }

/** 换掉 fetch 跑一段，跑完还原；调用记录进 `bodies` */
async function withFetch(
  respond: Responder,
  run: Scenario,
  { baseUrl = "https://x.test/v1", topics = TOPICS }: FetchOptions = {},
): Promise<void> {
  const previousFetch = globalThis.fetch;
  bodies = [];
  globalThis.fetch = async (input, init) => {
    bodies.push(JSON.parse(String(init?.body ?? "{}")) as ChatBody);
    return respond(bodies.length - 1, String(input));
  };
  try {
    const agent = new InterviewAgent({ config: { baseUrl, apiKey: "k", model: "m" }, questionIndex: { topics: () => topics } });
    await run(agent, lastBody);
  } finally { globalThis.fetch = previousFetch; }
}

const replyWith = (content: string): Response =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });

/** 桩固定回同一个 JSON 结果 */
function withStubbedChat(reply: unknown, run: Scenario, options?: FetchOptions): Promise<void> {
  const content = JSON.stringify(reply);
  return withFetch(async () => replyWith(content), run, options);
}

/** 桩按次序回不同的 content，用完之后一直重复最后一个 */
function withSequence(contents: string[], run: Scenario): Promise<void> {
  return withFetch(async (call) => replyWith(contents[Math.min(call, contents.length - 1)]), run);
}

/** 一道普通题目的返回，绝大多数用例只关心提示词，不关心返回体 */
const QUESTION_REPLY = { title: "题？", prompt: "题？", standardAnswer: ANSWER, topic: "x" };

// ============ 提示词按会话形态分派 ============

/**
 * 一行一个形态：`has` 是必须出现的关键约束，`hasNot` 是不该出现的。
 *
 * 断言打在系统提示词上，所以改措辞时这里会红 —— 有意为之：
 * 这些句子本身就是给模型的行为约束，掉了等于功能掉了。
 */
interface PromptCase {
  name: string;
  session: Partial<SessionWithFocus>;
  has: RegExp[];
  hasNot?: RegExp[];
}

const PROMPT_CASES: PromptCase[] = [
  {
    name: "岗位定制：列出各分类已有章节，要求优先复用而不是另造近义章节",
    session: { mode: "jd", series: "岗位定制", chapterPath: "", jdExcerpt: JD },
    has: [/各分类已有章节/, /- Java：集合、多线程/, /不要合并两章造一个新名字/],
    hasNot: [/JVM 调优/],
  },
  {
    name: "人事面试：按行为面口径出题，答案写成一段口语而不是分点笔记",
    session: { mode: "hr", series: "基础知识", chapterPath: "基础知识/协作交流.md" },
    has: [/人事面试/, /第一人称/, /不分点/],
    hasNot: [/各分类已有章节/],
  },
  {
    name: "标准答案要求第一人称，禁止写成站在文档外讲解的旁白",
    session: { mode: "interview", series: "Java", chapterPath: "Java/JVM.md" },
    has: [/第一人称/, /旁白/, /不要出现“简历”/],
  },
  {
    name: "选「全部」：按岗位普遍要求出题，不受已有章节限制，库里没有的可新建 topic",
    session: { mode: "interview", series: "Java", chapterPath: "" },
    has: [/岗位上普遍要求的技能/, /不受已有章节限制/, /新建一个 topic/, /别为了新而新/, /本分类已有章节/],
    hasNot: [/岗位定制/],
  },
  {
    name: "选「全部」时列的是本分类的章节，不是全库的分类（否则题会归到别的分类去）",
    session: { mode: "interview", series: "Java", chapterPath: "" },
    has: [/本分类已有章节（能归进去就归进去）：集合、多线程/],
    hasNot: [/spring/],
  },
  {
    name: "指定了具体章节时围绕那一章，不出现「不受已有章节限制」",
    session: { mode: "interview", series: "Java", chapterPath: "Java/集合.md" },
    has: [/围绕指定章节/],
    hasNot: [/不受已有章节限制/],
  },
];

for (const { name, session, has, hasNot = [] } of PROMPT_CASES) {
  test(`提示词：${name}`, async () => {
    await withStubbedChat(QUESTION_REPLY, async (agent) => {
      await agent.generateQuestion({ session: makeSession({ resumeExcerpt: "简历", skillSnapshot: "", ...session }) });
      const system = String(lastBody().messages[0].content);
      for (const pattern of has) assert.match(system, pattern);
      for (const pattern of hasNot) assert.doesNotMatch(system, pattern);
    });
  });
}

test("提示词：笔试出题同样要求第一人称、不要旁白", async () => {
  await withStubbedChat({ questions: [{ title: "题？", prompt: "题？", standardAnswer: ANSWER }] }, async (agent) => {
    await agent.generatePaper({
      session: makeSession({ series: "Java", chapterPath: "Java/JVM.md", resumeExcerpt: "简历", skillSnapshot: "", nextFocuses: [], askedQuestions: [] }),
      count: 1,
    });
    const system = String(lastBody().messages[0].content);
    assert.match(system, /第一人称/);
    assert.match(system, /旁白/);
  });
});

// ============ 会话数据怎么进提示词 ============

test("选了目标 JD 时提示词带上它；没选时不带", async () => {
  await withStubbedChat(QUESTION_REPLY, async (agent) => {
    const base = { series: "Java", chapterPath: "Java/JVM.md", mode: "interview", resumeExcerpt: "简历", skillSnapshot: "" };
    await agent.generateQuestion({ session: makeSession({ ...base, jdExcerpt: JD }) });
    assert.match(JSON.stringify(lastBody().messages), /LangGraph/, "JD 正文要进提示词");

    // 系统提示词里始终有一句「给了目标岗位 JD 时…」的条件指令，
    // 这里要断言的是 JD 正文没被塞进去，不是那句指令。
    await agent.generateQuestion({ session: makeSession({ ...base, jdExcerpt: "" }) });
    assert.ok(!JSON.stringify(lastBody().messages).includes("LangGraph"), "没选就不该把 JD 正文塞进去");
  });
});

test("总评的提示词同样带上目标 JD", async () => {
  await withStubbedChat({ level: "一般", weak: "并发", next: "多练" }, async (agent) => {
    await agent.summarize({
      session: makeSession({ series: "Java", chapterPath: "Java/JVM.md", completedCount: 1, jdExcerpt: JD, skillSnapshot: "" }),
      attempts: [{ title: "题？", score: 60, comment: "点评" }],
    });
    assert.match(JSON.stringify(lastBody().messages), /LangGraph/, "JD 正文要进总评提示词");
  });
});

test("已问过的题只给标题，且放在最末尾（好让前缀命中缓存）", async () => {
  await withStubbedChat(QUESTION_REPLY, async (agent) => {
    await agent.generateQuestion({
      session: makeSession({
        series: "Java", chapterPath: "Java/JVM.md", mode: "interview", resumeExcerpt: "简历", skillSnapshot: "",
        askedQuestions: ["线上 Full GC 怎么排查？", "Redis 缓存穿透怎么防？"],
      }),
    });
    const user = String(lastBody().messages[1].content);
    assert.match(user, /已经问过的题目/);
    assert.match(user, /- 线上 Full GC 怎么排查？/);
    assert.ok(user.trimEnd().endsWith("- Redis 缓存穿透怎么防？"), "变化的部分要放在最后");
    assert.doesNotMatch(user, /标准答案|answer_excerpt/, "已问清单只给标题：没有答案与摘要");
  });
});

// ============ 出错与重试 ============

test("岗位定制：模型没给 topic 时抛错，而不是带着空 topic 往下走", async () => {
  // 这一条刻意不带 topic —— 其余用例的桩都带着它
  await withStubbedChat({ title: "题？", prompt: "题？", standardAnswer: ANSWER }, async (agent) => {
    await assert.rejects(() => agent.generateQuestion({
      session: makeSession({ mode: "jd", series: "岗位定制", chapterPath: "", resumeExcerpt: "简历", jdExcerpt: JD, skillSnapshot: "" }),
    }), /归属的章节/);
  });
});

test("模型自报的 topic 要原样传出来 —— 归档靠它决定写哪个章节", async () => {
  await withStubbedChat({ ...QUESTION_REPLY, topic: "JVM 调优" }, async (agent) => {
    const question = await agent.generateQuestion({
      session: makeSession({ mode: "jd", series: "岗位定制", chapterPath: "", resumeExcerpt: "简历", jdExcerpt: JD, skillSnapshot: "" }),
    });
    assert.equal(question.topic, "JVM 调优");
  });
});

test("结构不全时再试一次，第二次对了就用第二次的", async () => {
  const calls: number[] = [];
  await withFetch(
    async (call) => {
      calls.push(call);
      return replyWith(call === 0 ? '{"title":"没有问号","standardAnswer":"x"}' : '{"title":"题？","standardAnswer":"一段口语。"}');
    },
    async (agent) => {
      const question = await agent.generateQuestion({
        session: makeSession({ mode: "hr", series: "基础知识", chapterPath: "基础知识/协作交流.md", resumeExcerpt: "简历", skillSnapshot: "" }),
      });
      assert.equal(question.title, "题？");
    },
  );
  assert.equal(calls.length, 2, "第一次结构不全应当再试一次");
});

test("网络不可用时给出可读提示，而不是把 fetch failed 甩给用户", async () => {
  await withFetch(
    async () => {
      const error = new TypeError("fetch failed");
      error.cause = { code: "ENOTFOUND" };
      throw error;
    },
    async (agent) => {
      await assert.rejects(
        () => agent.generateQuestion({
          session: makeSession({ mode: "interview", series: "Java", chapterPath: "Java/JVM.md", resumeExcerpt: "简历", skillSnapshot: "" }),
        }),
        (error: unknown) => {
          const message = (error as Error).message;
          assert.match(message, /连不上对话模型服务/);
          // 报错里要带上出问题的那台主机，用户才知道去查哪个地址
          assert.match(message, /api\.deepseek\.com/);
          assert.match(message, /ENOTFOUND/);
          return true;
        },
      );
    },
    { baseUrl: "https://api.deepseek.com/v1" },
  );
});

// ============ JSON 解析 ============

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
