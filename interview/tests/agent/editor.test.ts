import "../helpers/test-data-dir.ts"; // 必须第一个：它要在 config 之前设好数据目录
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import { initRepo, commitAll } from "../helpers/repo.ts";
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

// ---- 提交信息：交给 agent 跑 git diff 看真实改动 ----

/** 假模型的一轮回复：可以只说一句话，也可以「先说一句 + 要调工具」——真实模型常是后者 */
interface Turn {
  text?: string;
  toolCall?: { name: string; arguments: unknown };
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
    if (turn?.toolCall) {
      delta.tool_calls = [{
        index: 0,
        id: `call-${index}`,
        type: "function",
        function: { name: turn.toolCall.name, arguments: JSON.stringify(turn.toolCall.arguments) },
      }];
    }
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    response.write(`data: ${JSON.stringify({
      id: "chatcmpl-test", object: "chat.completion.chunk", created: 1, model: "fake-model",
      choices: [{ index: 0, delta, finish_reason: turn?.toolCall ? "tool_calls" : "stop" }],
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
 * 造一个「已提交一版、又改了但没提交」的仓库 —— 正是点「保存」那一刻的状态。
 * 写提交信息就是在这一刻发生的。
 */
function makeGitRepo(t: TestContext): { dir: string; file: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "commit-msg-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = "张三-后端.html";
  fs.writeFileSync(path.join(dir, file), "<html>改前：三项实习</html>", "utf8");
  initRepo(dir);
  commitAll(dir, "1.0 初版");
  fs.writeFileSync(path.join(dir, file), "<html>改后：实习压到两项</html>", "utf8");
  return { dir, file };
}

test("提交信息：模型先说要去看 diff、再给结论，取的是结论", async (t) => {
  const { dir, file } = makeGitRepo(t);
  // 真实模型就是这样的：第一轮先念一句「我去看看 git status 和 diff」并调工具，
  // 工具跑完才给结论。这条钉住的是「取的是哪一条 assistant 文本」——
  // 取反方向时，存进历史的会是那句英文预告。
  const model = await scriptedModel(t, [
    { text: "I'll check the git status and diff for that file.", toolCall: { name: "bash", arguments: { command: `git diff -- ${file}` } } },
    { text: "简历：实习压到两项" },
  ]);

  const message = await makeAgent(model.baseUrl).commitMessage({ file, dir, fallback: "简历：编辑器保存" });

  assert.equal(message, "简历：实习压到两项");
  assert.doesNotMatch(message, /I'll check/, "不能把动手前的预告当成提交信息");
  // 第二轮请求里带着第一轮 bash 的结果 —— 那里面必须是真实的 diff，
  // 而不是模型自己猜的。把请求体解成对象再序列化，好让 \uXXXX 转义还原成中文。
  const second = JSON.stringify(JSON.parse(model.bodies[1] ?? "{}"));
  assert.match(second, /实习压到两项/, "diff 的新内容要出现在模型的输入里");
  assert.match(second, /改前：三项实习/, "diff 里被删掉的那行也要出现");
});

test("提交信息：标题 + 分点要整段保留，不能被截成一行", async (t) => {
  const { dir, file } = makeGitRepo(t);
  const model = await scriptedModel(t, [
    { text: "I'll check the diff.", toolCall: { name: "bash", arguments: { command: `git diff -- ${file}` } } },
    { text: "简历：实习压到两项\n\n- 删掉一段实习\n- 技能栏同步收敛" },
  ]);

  const message = await makeAgent(model.baseUrl).commitMessage({ file, dir, fallback: "简历：编辑器保存" });

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

test("提交信息：模型套了代码块围栏或引号，也要清干净", async (t) => {
  const { dir, file } = makeGitRepo(t);
  const model = await scriptedModel(t, [{ text: "```\n「简历：技能栏重排」\n```" }]);

  const message = await makeAgent(model.baseUrl).commitMessage({ file, dir, fallback: "简历：编辑器保存" });

  assert.equal(message, "简历：技能栏重排");
});

test("提交信息：模型连不上就退回兜底文案，不拦住保存", async (t) => {
  const { dir, file } = makeGitRepo(t);
  // 指向一个没人监听的端口
  const message = await makeAgent("http://127.0.0.1:1/v1").commitMessage({ file, dir, fallback: "简历：编辑器保存" });

  assert.equal(message, "简历：编辑器保存");
});

test("提交信息：不落 JSONL —— 会话只在内存里", async (t) => {
  const { dir, file } = makeGitRepo(t);
  const model = await scriptedModel(t, [{ text: "简历：技能栏重排" }]);
  const sessionsRoot = path.join(config.dataDir, "sessions");
  const count = () => (fs.existsSync(sessionsRoot) ? fs.readdirSync(sessionsRoot).length : 0);
  const before = count();

  await makeAgent(model.baseUrl).commitMessage({ file, dir, fallback: "简历：编辑器保存" });

  // 只为一句话建个会话文件不值当 —— 这里钉住「用的是内存版仓库」
  assert.equal(count(), before, "不该在 data/sessions 下新增会话文件");
});

