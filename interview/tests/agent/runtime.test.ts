import "../helpers/test-data-dir.ts"; // 必须第一个：它要在 config 之前设好数据目录
import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import { InterviewChatAgent } from "../../server/agent/runtime.ts";
import { buildEditingTools, buildTools } from "../../server/agent/tools.ts";
import type { Evaluation, SessionWithFocus } from "../../shared/types.ts";
import { workspacePathOf } from "../../server/agent/workspace.ts";

/**
 * agent 层的集成测试：用**本地假 OpenAI 流式服务**驱动真实的 harness，
 * 走完「工作目录 → JSONL 会话 → harness → 工具 → 结论」整条链，不烧 API key。
 *
 * 假服务只回一个工具调用，够验接线；真实模型的表现不在单测范围内。
 */

/** 起一个假服务，按脚本依次回 tool_calls；**脚本播完就回纯文本**，让 agent 收尾。
 *  若播完还重复最后一个工具调用，harness 会执行完再问、再拿到同一个调用 —— 无限循环。 */
async function fakeModel(t: TestContext, toolCalls: Array<{ name: string; arguments: unknown }>, replies = ["这是追问的回答"], bodies: string[] = []): Promise<string> {
  let index = 0;
  let replyIndex = 0;
  const server = http.createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    bodies.push(body);
    const call = index < toolCalls.length ? toolCalls[index++] : null;
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    response.write(`data: ${JSON.stringify({
      id: "chatcmpl-test", object: "chat.completion.chunk", created: 1, model: "fake-model",
      choices: [call
        ? { index: 0, delta: { role: "assistant", tool_calls: [{ index: 0, id: `call-${index}`, type: "function", function: { name: call.name, arguments: JSON.stringify(call.arguments) } }] }, finish_reason: "tool_calls" }
        : { index: 0, delta: { role: "assistant", content: replies[Math.min(replyIndex++, replies.length - 1)] }, finish_reason: "stop" }],
      usage: { prompt_tokens: 10, completion_tokens: 4, total_tokens: 14 },
    })}\n\n`);
    response.end("data: [DONE]\n\n");
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`;
}

/** 造一份最小可用的简历文件，工作目录要从它读正文 */
function makeResume(t: TestContext): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-resume-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "张三-后端-27届.md");
  fs.writeFileSync(file, "# 张三\n\n熟悉 Java 与 Redis。\n", "utf8");
  return file;
}

function makeSession(resumePath: string): SessionWithFocus {
  return {
    id: `s-${Math.random().toString(36).slice(2)}`,
    resumePath,
    series: "基础知识",
    chapterPath: "",
    mode: "interview",
    durationMinutes: 30,
    status: "active",
    startedAt: new Date().toISOString(),
    currentQuestion: { title: "Redis 的持久化方式有哪些", standardAnswer: "RDB 与 AOF" },
  };
}

test("面试 Agent 只有读取资料和提交点评的最小权限", () => {
  const tools = buildTools({ onSubmitEvaluation: () => {} });
  assert.deepEqual(tools.map((tool) => tool.name).sort(), ["read", "submit_evaluation"]);
});

test("文档编辑 Agent 可以定点读写，但不能执行任意命令", () => {
  assert.deepEqual(buildEditingTools().map((tool) => tool.name).sort(), ["edit", "read", "write"]);
});

type Tool = ReturnType<typeof buildTools>[number];

/**
 * 直接调工具的 `execute`。
 * 它的签名是 harness-native 的 6 参（toolCallId / params / onUpdate / 工具上下文 / 调用信息 / 对话上下文），
 * 这里不在 harness 里跑，后三个补占位值 —— 测试只关心前两个。
 */
function callTool(tool: Tool, params: { score: number; comment: string }) {
  return tool.execute("test-call", params, () => {}, undefined as never, undefined as never, undefined as never);
}

test("submit_evaluation 只回传结论，不写库", async () => {
  let received: Evaluation | undefined;
  const tools = buildTools({ onSubmitEvaluation: (evaluation) => { received = evaluation; } });
  const tool = tools.find((item) => item.name === "submit_evaluation");
  assert.ok(tool, "工具集里应当有 submit_evaluation");

  await callTool(tool, { score: 88, comment: "要点齐全" });

  assert.deepEqual(received, { score: 88, comment: "要点齐全" });
});

test("分数会被夹到 0-100，不信任模型给的越界值", async () => {
  let received: Evaluation | undefined;
  const tools = buildTools({ onSubmitEvaluation: (evaluation) => { received = evaluation; } });
  const tool = tools.find((item) => item.name === "submit_evaluation");
  assert.ok(tool, "工具集里应当有 submit_evaluation");

  await callTool(tool, { score: 250, comment: "x" });

  assert.equal(received?.score, 100);
});

test("模型调用 submit_evaluation 时判为「回答」", async (t) => {
  const resumePath = makeResume(t);
  const baseUrl = await fakeModel(t, [{ name: "submit_evaluation", arguments: { score: 82, comment: "答对了主要点，边界没说" } }]);
  const agent = new InterviewChatAgent({ config: { baseUrl, apiKey: "fake-key", model: "fake-model" } });

  const outcome = await agent.run({ session: makeSession(resumePath), text: "RDB 和 AOF" });

  assert.equal(outcome.action, "answer");
  assert.equal(outcome.evaluation?.score, 82);
  assert.match(outcome.evaluation?.comment ?? "", /边界没说/);
});

test("模型没有调用 submit_evaluation 时判为「追问」，回复取正文", async (t) => {
  const resumePath = makeResume(t);
  const baseUrl = await fakeModel(t, []);   // 只回文本、不调工具
  const agent = new InterviewChatAgent({ config: { baseUrl, apiKey: "fake-key", model: "fake-model" } });

  const outcome = await agent.run({ session: makeSession(resumePath), text: "AOF 和 RDB 有什么区别？" });

  assert.equal(outcome.action, "followup");
  assert.match(outcome.reply ?? "", /追问的回答/);
});

test("同一场面试复用运行时：两轮都走同一条链，各自判各自的动作", async (t) => {
  const resumePath = makeResume(t);
  const baseUrl = await fakeModel(t, [
    { name: "submit_evaluation", arguments: { score: 70, comment: "第一轮" } },
  ]);
  const agent = new InterviewChatAgent({ config: { baseUrl, apiKey: "fake-key", model: "fake-model" } });
  const session = makeSession(resumePath);

  const first = await agent.run({ session, text: "回答一" });
  const second = await agent.run({ session, text: "再问一句" });

  assert.equal(first.action, "answer", "第一轮调了点评");
  assert.equal(second.action, "followup", "第二轮没调点评 —— 上一轮的结果不能漏到这一轮");
});

test("未配置模型时给一句能照着 .env 修的提示", () => {
  assert.throws(
    () => new InterviewChatAgent({ config: { baseUrl: "", apiKey: "", model: "" } }),
    /INTERVIEW_CHAT_BASE_URL/,
  );
});

test("连续两次追问分别返回当轮回复，不重复早期回答", async (t) => {
  const resumePath = makeResume(t);
  const baseUrl = await fakeModel(t, [], ["RDB 是快照", "AOF 是命令日志"]);
  const agent = new InterviewChatAgent({ config: { baseUrl, apiKey: "fake-key", model: "fake-model" } });
  const session = makeSession(resumePath);
  const first = await agent.run({ session, text: "什么是 RDB？" });
  const second = await agent.run({ session, text: "那 AOF 呢？" });
  assert.equal(first.reply, "RDB 是快照");
  assert.equal(second.reply, "AOF 是命令日志");
});

test("本轮空回复不能冒充上一轮追问的回答", async (t) => {
  const baseUrl = await fakeModel(t, [], ["上一轮回答", ""]);
  const agent = new InterviewChatAgent({ config: { baseUrl, apiKey: "test", model: "fake-model" } });
  const session = makeSession(makeResume(t));
  await agent.run({ session, text: "第一问" });
  await assert.rejects(agent.run({ session, text: "第二问" }), /未返回正文/);
});

test("首答与重启恢复都使用建会话快照，并传完整题干", async (t) => {
  const resumePath = makeResume(t);
  const session = makeSession(resumePath);
  session.skillSnapshot = "冻结规则：答案必须包含边界条件";
  session.resumeExcerpt = "冻结简历内容";
  session.jdExcerpt = "冻结岗位要求";
  session.currentQuestion!.prompt = "请实现队列，空间复杂度 O(1)";
  fs.unlinkSync(resumePath);
  const bodies: string[] = [];
  const baseUrl = await fakeModel(t, [], undefined, bodies);
  for (let run = 0; run < 2; run++) {
    const agent = new InterviewChatAgent({ config: { baseUrl, apiKey: "fake-key", model: "fake-model" } });
    await agent.run({ session, text: "追问" });
    assert.equal(fs.readFileSync(path.join(workspacePathOf(session.id), "resume.md"), "utf8"), session.resumeExcerpt);
    assert.match(bodies[run], /冻结规则/);
    assert.match(bodies[run], /空间复杂度 O\(1\)/);
  }
});

test("生成中进程退出后可恢复同一场面试", async (t) => {
  const session = makeSession(makeResume(t));
  let arrived!: () => void;
  const requestArrived = new Promise<void>((resolve) => { arrived = resolve; });
  let recovering = false;
  const hanging = http.createServer(async (request, response) => {
    for await (const _ of request) { /* 等请求体发完，操作已经持久化 */ }
    if (recovering) {
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      response.end(`data: ${JSON.stringify({ choices: [{ index: 0, delta: { role: "assistant", content: "恢复成功" }, finish_reason: "stop" }] })}\n\ndata: [DONE]\n\n`);
      return;
    }
    arrived();
  });
  hanging.listen(0, "127.0.0.1");
  await once(hanging, "listening");
  t.after(() => { hanging.closeAllConnections(); hanging.close(); });
  const baseUrl = `http://127.0.0.1:${(hanging.address() as AddressInfo).port}/v1`;
  const child = spawn(process.execPath, ["--input-type=module", "-e", `
    import { InterviewChatAgent } from './server/agent/runtime.ts';
    await new InterviewChatAgent({ config: ${JSON.stringify({ baseUrl, apiKey: "fake-key", model: "fake-model" })} })
      .run({ session: ${JSON.stringify(session)}, text: '第一轮' });
  `], { cwd: path.resolve(import.meta.dirname, "../.."), stdio: "ignore" });
  t.after(() => { if (child.exitCode === null) child.kill(); });
  await requestArrived;
  const exited = once(child, "exit");
  child.kill();
  await exited;
  recovering = true;
  const agent = new InterviewChatAgent({ config: { baseUrl, apiKey: "fake-key", model: "fake-model" } });
  assert.equal((await agent.run({ session, text: "继续追问" })).reply, "恢复成功");
});

test("取消后不重启也能在同一场继续发送", async (t) => {
  const controller = new AbortController();
  let calls = 0;
  const server = http.createServer(async (request, response) => {
    for await (const _ of request) { /* 收到后再取消，确保运行时已经启动 */ }
    if (++calls === 1) { controller.abort(); return; }
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    response.end(`data: ${JSON.stringify({ choices: [{ index: 0, delta: { role: "assistant", content: "继续成功" }, finish_reason: "stop" }] })}\n\ndata: [DONE]\n\n`);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => { server.closeAllConnections(); server.close(); });
  const agent = new InterviewChatAgent({ config: { baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`, apiKey: "test", model: "fake-model" } });
  const session = makeSession(makeResume(t));
  await assert.rejects(agent.run({ session, text: "第一次", signal: controller.signal }));
  assert.equal((await agent.run({ session, text: "继续" })).reply, "继续成功");
});
