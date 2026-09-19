import "../helpers/test-data-dir.ts"; // 必须第一个：它要在 config 之前设好数据目录
import assert from "node:assert/strict";
import { once } from "node:events";
import fs from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import { InterviewChatAgent } from "../../server/agent/runtime.ts";
import { buildTools } from "../../server/agent/tools.ts";
import type { Evaluation, SessionWithFocus } from "../../shared/types.ts";

/**
 * agent 层的集成测试：用**本地假 OpenAI 流式服务**驱动真实的 harness，
 * 走完「工作目录 → JSONL 会话 → harness → 工具 → 结论」整条链，不烧 API key。
 *
 * 假服务只回一个工具调用，够验接线；真实模型的表现不在单测范围内。
 */

/** 起一个假服务，按脚本依次回 tool_calls；**脚本播完就回纯文本**，让 agent 收尾。
 *  若播完还重复最后一个工具调用，harness 会执行完再问、再拿到同一个调用 —— 无限循环。 */
async function fakeModel(t: TestContext, toolCalls: Array<{ name: string; arguments: unknown }>): Promise<string> {
  let index = 0;
  const server = http.createServer(async (request, response) => {
    for await (const _ of request) { /* 请求体不用看 */ }
    const call = index < toolCalls.length ? toolCalls[index++] : null;
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    response.write(`data: ${JSON.stringify({
      id: "chatcmpl-test", object: "chat.completion.chunk", created: 1, model: "fake-model",
      choices: [call
        ? { index: 0, delta: { role: "assistant", tool_calls: [{ index: 0, id: `call-${index}`, type: "function", function: { name: call.name, arguments: JSON.stringify(call.arguments) } }] }, finish_reason: "tool_calls" }
        : { index: 0, delta: { role: "assistant", content: "这是追问的回答" }, finish_reason: "stop" }],
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

test("工具集正好 5 个：pi 的四个能力 + 一个领域工具", () => {
  const tools = buildTools({ onSubmitEvaluation: () => {} });
  assert.deepEqual(
    tools.map((tool) => tool.name).sort(),
    ["bash", "edit", "read", "submit_evaluation", "write"],
  );
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
