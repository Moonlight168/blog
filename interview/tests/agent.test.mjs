import assert from "node:assert/strict";
import test from "node:test";

import { InterviewAgent } from "../server/agent.mjs";

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
