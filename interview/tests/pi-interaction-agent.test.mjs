import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import test from "node:test";

import { compactHistoryText, PiInteractionAgent } from "../server/pi-interaction-agent.mjs";

test("短对话保留完整历史，超过上限后保留最近交互并标记已压缩", () => {
  const short = compactHistoryText([{ role: "user", kind: "text", content: "回答" }], "", 100);
  assert.equal(short.compacted, false);
  assert.match(short.context, /回答/);

  const messages = Array.from({ length: 20 }, (_, index) => ({
    role: index % 2 ? "assistant" : "user", kind: "text", content: `第 ${index} 条-${"内容".repeat(20)}`,
  }));
  const compacted = compactHistoryText(messages, "之前的摘要", 500);
  assert.equal(compacted.compacted, true);
  assert.match(compacted.context, /最近完整对话/);
  assert.match(compacted.context, /第 19 条/);
});

test("Pi Agent 能通过 OpenAI-compatible 流式协议执行结束工具", async (t) => {
  let requestBody;
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    requestBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    response.write(`data: ${JSON.stringify({
      id: "chatcmpl-test", object: "chat.completion.chunk", created: 1, model: "fake-model",
      choices: [{ index: 0, delta: { role: "assistant", tool_calls: [{
        index: 0, id: "call-finish", type: "function",
        function: { name: "finish_followup", arguments: JSON.stringify({ reply: "这是追问回答" }) },
      }] }, finish_reason: "tool_calls" }],
      usage: { prompt_tokens: 10, completion_tokens: 4, total_tokens: 14 },
    })}\n\n`);
    response.end("data: [DONE]\n\n");
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());

  const address = server.address();
  const agent = new PiInteractionAgent({
    config: { baseUrl: `http://127.0.0.1:${address.port}/v1`, apiKey: "fake-key", model: "fake-model" },
    questionIndex: { async search() { throw new Error("本用例不应查询题库"); } },
  });
  const events = [];
  const result = await agent.run({
    session: { id: "test-session", currentQuestion: { title: "G1 是什么？", standardAnswer: "分区垃圾收集器" } },
    text: "能举个例子吗？",
    onEvent: (event) => events.push(event),
  });

  assert.equal(result.action, "followup");
  assert.equal(result.reply, "这是追问回答");
  assert.ok(events.some((event) => event.type === "draft" && event.content === "这是追问回答"));
  assert.equal(requestBody.stream, true);
  assert.ok(requestBody.tools.some((tool) => tool.function?.name === "finish_followup"));
});

test("Pi Agent 拒绝把查询与结束工具并列调用", async (t) => {
  let requests = 0;
  const server = http.createServer(async (request, response) => {
    for await (const _chunk of request) { /* 读完请求体 */ }
    requests += 1;
    const toolCalls = requests === 1
      ? [
          { index: 0, id: "call-search", type: "function", function: { name: "search_context", arguments: '{"source":"resume","query":"Redis"}' } },
          { index: 1, id: "call-finish-early", type: "function", function: { name: "finish_followup", arguments: '{"reply":"不应采用"}' } },
        ]
      : [{ index: 0, id: "call-finish", type: "function", function: { name: "finish_followup", arguments: '{"reply":"纠正后回答"}' } }];
    response.writeHead(200, { "Content-Type": "text/event-stream" });
    response.write(`data: ${JSON.stringify({
      id: `chatcmpl-${requests}`, object: "chat.completion.chunk", created: 1, model: "fake-model",
      choices: [{ index: 0, delta: { role: "assistant", tool_calls: toolCalls }, finish_reason: "tool_calls" }],
    })}\n\n`);
    response.end("data: [DONE]\n\n");
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());

  const address = server.address();
  const agent = new PiInteractionAgent({
    config: { baseUrl: `http://127.0.0.1:${address.port}/v1`, apiKey: "fake-key", model: "fake-model" },
    questionIndex: { async search() { throw new Error("冲突批次中的查询不应执行"); } },
  });
  const result = await agent.run({
    session: { id: "test-conflict", currentQuestion: { title: "Redis 怎么用？", standardAnswer: "缓存" } },
    text: "结合我的项目说说",
  });

  assert.equal(requests, 2);
  assert.equal(result.reply, "纠正后回答");
});
