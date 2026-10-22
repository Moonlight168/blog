import "../helpers/test-data-dir.ts"; // 必须第一个：它要在 config 之前设好数据目录
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import { config } from "../../server/infra/config/index.ts";
import { DocumentEditorAgent } from "../../server/agent/editor.ts";

/**
 * 改稿 agent：中断，以及提交信息的生成。
 *
 * 这两件事都**错了不会报错**，所以必须专门测：
 * - 中断失灵 → 模型继续改文件，而用户早就点了「停止」
 * - 提交信息失真 → 历史里躺着一条描述错了的版本（真发生过：49 行改动写成「无实质变化」）
 *
 * 全部用本地假 OpenAI 服务驱动真实的 harness，不烧 API key。
 */

interface Decoy {
  baseUrl: string;
  /** 已收到的请求数 */
  requests: () => number;
  /** 等到第一个请求真的到达（避免测成「还没开始就断」） */
  waitForRequest: () => Promise<void>;
}

/** 永不回包的假服务：请求进来了就挂住，直到被中断 */
async function hangingModel(t: TestContext): Promise<Decoy> {
  let requests = 0;
  let markArrived: () => void = () => {};
  const arrived = new Promise<void>((resolve) => { markArrived = resolve; });

  const server = http.createServer(async (request, response) => {
    for await (const _ of request) { /* 读完再挂住，模拟「模型正在想」 */ }
    requests += 1;
    markArrived();
    // 不 writeHead、不 end —— 一直挂着，只有连接被中断才会结束
    request.on("close", () => { /* 客户端断了，什么都不用做 */ });
  });
  server.on("clientError", () => { /* 中断时的连接重置不算错误 */ });

  server.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  // 挂住的那些连接不会自己关，只 close() 的话进程退不出去（测试全过了却一直挂着）
  t.after(() => { server.closeAllConnections(); server.close(); });
  const { port } = server.address() as { port: number };

  return {
    baseUrl: `http://127.0.0.1:${port}/v1`,
    requests: () => requests,
    waitForRequest: () => arrived,
  };
}

/** 造一份待改的稿子 */
function makeDoc(t: TestContext): { dir: string; file: string; path: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "editor-abort-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = "张三-后端.html";
  const target = path.join(dir, file);
  fs.writeFileSync(target, "<html>原样</html>", "utf8");
  return { dir, file, path: target };
}

const makeAgent = (baseUrl: string) =>
  new DocumentEditorAgent({ config: { baseUrl, apiKey: "fake-key", model: "fake-model" } });

test("传进去的 signal 已经中断时，一个请求都不发", async (t) => {
  const { dir, file, path: target } = makeDoc(t);
  const model = await hangingModel(t);
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    () => makeAgent(model.baseUrl).revise({ kind: "resume", file, dir, instruction: "改一下", signal: controller.signal }),
  );

  assert.equal(model.requests(), 0, "已经中断了就不该再去麻烦模型");
  assert.equal(fs.readFileSync(target, "utf8"), "<html>原样</html>", "稿子一个字节都不该动");
});

test("改到一半中断：立刻停手，而不是等模型自己结束", async (t) => {
  const { dir, file, path: target } = makeDoc(t);
  const model = await hangingModel(t);
  const agent = makeAgent(model.baseUrl);
  const controller = new AbortController();

  const started = Date.now();
  const pending = agent.revise({ kind: "resume", file, dir, instruction: "改一下", signal: controller.signal });
  // 先等请求真的到模型那边，否则这条测的只是「还没开始就断」
  await model.waitForRequest();
  controller.abort();

  await assert.rejects(pending, "中断应当让 revise 结束，而不是一直挂着");
  const elapsed = Date.now() - started;
  // 假服务会一直挂着不回包，180s 超时才会自己结束 —— 远小于它就说明是中断起了作用
  assert.ok(elapsed < 10_000, `应当立刻停手，实际等了 ${elapsed}ms（说明中断没传到 pi）`);
  assert.equal(fs.readFileSync(target, "utf8"), "<html>原样</html>", "停手之后稿子不该有半截改动");
});

test("中断之后这份文档还能再改 —— 锁必须释放", async (t) => {
  const { dir, file } = makeDoc(t);
  const model = await hangingModel(t);
  // 同一个 agent 实例：锁在实例上，换实例就测不到它了
  const agent = makeAgent(model.baseUrl);

  // 第一次：跑到一半中断
  const controller = new AbortController();
  const first = agent.revise({ kind: "resume", file, dir, instruction: "改一下", signal: controller.signal });
  await model.waitForRequest();
  controller.abort();
  await assert.rejects(first);

  // 第二次：用一个**没被中断**的 signal，才会真的走到并发锁那一步
  // （revise 里 throwIfAborted 在锁检查之前，预中断的调用永远测不到锁）
  // 地址指向一个没人监听的端口，于是它会因为连不上而失败 —— 正好用来区分两种失败
  const locked = await agent
    .revise({ kind: "resume", file, dir, instruction: "再来一次" })
    .then(() => null, (error: unknown) => error as Error);

  assert.ok(locked, "这份文档指向一个不存在的服务，应当失败");
  assert.doesNotMatch(locked.message, /正在改/, "中断必须释放并发锁，否则用户停一次就永久改不动了");
});

// ---- 提交信息：把服务端取好的 diff 交给模型归纳 ----

/** 假模型的一轮回复：只有文本，或「只有思考、没有正文」——后者是输出被长度上限截断的样子 */
interface Turn {
  text?: string;
  /** 只有思考、没有正文的一轮 —— 真实模型输出被长度上限截断时就是这样 */
  reasoning?: string;
}

/** 按脚本回包的假服务，播完就重复最后一轮。同时记下每次请求体 */
async function scriptedModel(t: TestContext, turns: Turn[]): Promise<{ baseUrl: string; bodies: string[] }> {
  const bodies: string[] = [];
  let index = 0;
  const server = http.createServer(async (request, response) => {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    bodies.push(raw);
    const turn = turns[Math.min(index, turns.length - 1)];
    index += 1;
    const delta: Record<string, unknown> = { role: "assistant" };
    if (turn?.text) delta.content = turn.text;
    if (turn?.reasoning) delta.reasoning_content = turn.reasoning;
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    response.write(`data: ${JSON.stringify({
      id: "chatcmpl-test", object: "chat.completion.chunk", created: 1, model: "fake-model",
      choices: [{ index: 0, delta, finish_reason: "stop" }],
      usage: { prompt_tokens: 10, completion_tokens: 4, total_tokens: 14 },
    })}\n\n`);
    response.end("data: [DONE]\n\n");
  });
  server.on("clientError", () => { /* 中断时的连接重置不算错误 */ });
  server.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const { port } = server.address() as { port: number };
  return { baseUrl: `http://127.0.0.1:${port}/v1`, bodies };
}

/**
 * 服务端 git 取好的 diff —— 提交信息这步只消费它，不再自己跑 git。
 * （曾经让模型自己跑 `git diff`：Windows 上 pi 走 WSL，服务一抽风就无输出，
 * 模型把「我跑不了命令」当结果返回，那段自白直接进了提交历史。）
 */
const SAMPLE_DIFF = [
  "diff --git a/张三-后端.html b/张三-后端.html",
  "--- a/张三-后端.html",
  "+++ b/张三-后端.html",
  "@@ -1 +1 @@",
  "-<html>改前：三项实习</html>",
  "+<html>改后：实习压到两项</html>",
  "",
].join("\n");

test("提交信息：diff 由服务端喂进去，模型只归纳成一句话", async (t) => {
  const model = await scriptedModel(t, [{ text: "简历：实习压到两项" }]);

  const message = await makeAgent(model.baseUrl).commitMessage({ diff: SAMPLE_DIFF });

  assert.equal(message, "简历：实习压到两项");
  // diff 必须出现在请求体里 —— 证明模型看到的是服务端取的真实改动，而不是自己猜的。
  // 把请求体解成对象再序列化，好让 \uXXXX 转义还原成中文。
  const body = JSON.stringify(JSON.parse(model.bodies[0] ?? "{}"));
  assert.match(body, /实习压到两项/, "diff 的新内容要出现在模型的输入里");
  assert.match(body, /改前：三项实习/, "diff 里被删掉的那行也要出现");
});

test("提交信息：标题 + 分点要整段保留，不能被截成一行", async (t) => {
  const model = await scriptedModel(t, [{ text: "简历：实习压到两项\n\n- 删掉一段实习\n- 技能栏同步收敛" }]);

  const message = await makeAgent(model.baseUrl).commitMessage({ diff: SAMPLE_DIFF });

  assert.match(message, /^简历：实习压到两项/, "第一行是标题");
  assert.match(message, /- 删掉一段实习/);
  assert.match(message, /- 技能栏同步收敛/, "分点不能被截掉 —— 它们是历史面板悬浮时看的详情");
});

test("改稿：第 2 次显示的是本轮的回复，不是上一轮的", async (t) => {
  const { dir, file } = makeDoc(t);
  // 改稿 lane 按文件复用（同一份稿子的连续几轮共享上下文），所以到第 2 轮时
  // 会话里已经有两条 assistant 文本了 —— 取错方向就会一直显示第 1 轮的回复。
  const model = await scriptedModel(t, [{ text: "第 1 轮的回复" }, { text: "第 2 轮的回复" }]);
  const agent = makeAgent(model.baseUrl);

  const first = await agent.revise({ kind: "resume", file, dir, instruction: "第一次改" });
  const second = await agent.revise({ kind: "resume", file, dir, instruction: "第二次改" });

  assert.equal(first.reply, "第 1 轮的回复");
  assert.equal(second.reply, "第 2 轮的回复", "第二次改稿必须显示本轮的回复");
});

test("改稿：本轮只有思考、没有正文时，不能拿上一轮的回复冒充", async (t) => {
  const { dir, file } = makeDoc(t);
  // 真实场景：粘一整份简历进去，模型把输出预算全花在思考上、撞上长度上限被截断，
  // 这一轮只剩一个断掉的 thinking 块 —— 没有 text，也没有工具调用。
  const model = await scriptedModel(t, [
    { text: "第 1 轮的回复" },
    { reasoning: "我在逐段比对……（这里被截断了" },
  ]);
  const agent = makeAgent(model.baseUrl);

  const first = await agent.revise({ kind: "resume", file, dir, instruction: "第一次改" });
  const second = await agent.revise({ kind: "resume", file, dir, instruction: "第二次改" });

  assert.equal(first.reply, "第 1 轮的回复");
  assert.equal(second.reply, "", "本轮没有正文就该返回空，由上层给「模型这次没有给出回复」");
});

test("提交信息：模型套了代码块围栏或引号，也要清干净", async (t) => {
  const model = await scriptedModel(t, [{ text: "```\n「简历：技能栏重排」\n```" }]);

  const message = await makeAgent(model.baseUrl).commitMessage({ diff: SAMPLE_DIFF });

  assert.equal(message, "简历：技能栏重排");
});

test("提交信息：模型连不上就报错，不拿失败自白当提交信息", async (t) => {
  // 指向一个没人监听的端口。生成不出来就抛错 —— 上层给「保存失败，请稍后重试」，
  // 绝不把模型含糊的输出（或错误自白）写进历史。
  await assert.rejects(
    () => makeAgent("http://127.0.0.1:1/v1").commitMessage({ diff: SAMPLE_DIFF }),
  );
});

test("提交信息：模型只给了思考、没有正文时，同样报错而不是提交空话", async (t) => {
  const model = await scriptedModel(t, [{ reasoning: "我在读 diff……（被截断了" }]);

  await assert.rejects(
    () => makeAgent(model.baseUrl).commitMessage({ diff: SAMPLE_DIFF }),
  );
});

test("提交信息：不落 JSONL —— 会话只在内存里", async (t) => {
  const model = await scriptedModel(t, [{ text: "简历：技能栏重排" }]);
  const sessionsRoot = path.join(config.dataDir, "sessions");
  const count = () => (fs.existsSync(sessionsRoot) ? fs.readdirSync(sessionsRoot).length : 0);
  const before = count();

  await makeAgent(model.baseUrl).commitMessage({ diff: SAMPLE_DIFF });

  // 只为一句话建个会话文件不值当 —— 这里钉住「用的是内存版仓库」
  assert.equal(count(), before, "不该在 data/sessions 下新增会话文件");
});

test("清空对话后同文件不再携带旧指令，重启后也不恢复旧历史", async (t) => {
  const { dir, file } = makeDoc(t);
  const model = await scriptedModel(t, [{ text: "收到" }]);
  const agent = makeAgent(model.baseUrl);
  await agent.revise({ kind: "resume", dir, file, instruction: "旧偏好标记XYZ" });
  await agent.resetConversation({ kind: "resume", dir, file });
  await makeAgent(model.baseUrl).revise({ kind: "resume", dir, file, instruction: "新对话" });
  assert.doesNotMatch(model.bodies.at(-1)!, /旧偏好标记XYZ/);
  assert.equal(fs.readFileSync(path.join(dir, file), "utf8"), "<html>原样</html>");
});

test("改稿提示词区分咨询和修改，简历排版只有一套页数字号规则", async (t) => {
  const { dir, file } = makeDoc(t);
  const model = await scriptedModel(t, [{ text: "建议压缩重复表述" }]);
  await makeAgent(model.baseUrl).revise({ kind: "resume", dir, file, instruction: "只给建议" });
  const prompt = JSON.stringify(JSON.parse(model.bodies[0]));
  assert.match(prompt, /咨询.*只回答/);
  assert.doesNotMatch(prompt, /用户指令都是资料/);
  assert.match(prompt, /2 页内/);
  assert.doesNotMatch(prompt, /12\.5px|单页 A4/);
  assert.equal(fs.readFileSync(path.join(dir, file), "utf8"), "<html>原样</html>");
});

