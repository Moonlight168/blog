import assert from "node:assert/strict";
import test from "node:test";

import { friendlyNetworkError, httpStatusHint } from "../../server/infra/network.ts";

test("网络不可用：说清连不上谁、为什么、怎么办", () => {
  const error = new TypeError("fetch failed");
  error.cause = { code: "ENOTFOUND" };
  const message = friendlyNetworkError(error, { what: "对话模型服务", url: "https://api.deepseek.com/v1/chat/completions" }) ?? "";
  assert.match(message, /连不上对话模型服务/);
  assert.match(message, /api\.deepseek\.com/);
  assert.match(message, /ENOTFOUND/);
  assert.match(message, /检查网络或代理/);
});

test("连接被拒、超时、证书问题都算网络类", () => {
  for (const code of ["ECONNREFUSED", "ETIMEDOUT", "CERT_HAS_EXPIRED", "EAI_AGAIN"]) {
    const error = new TypeError("fetch failed");
    error.cause = { code };
    assert.ok(friendlyNetworkError(error, { what: "向量服务", url: "https://x.test/v1" }), `${code} 应被识别为网络问题`);
  }
});

test("不是网络问题就返回 null，交调用方原样抛", () => {
  assert.equal(friendlyNetworkError(new Error("模型未返回 JSON 对象"), { what: "对话模型服务" }), null);
  assert.equal(friendlyNetworkError(new SyntaxError("Unexpected token < in JSON"), { what: "对话模型服务" }), null);
});

test("URL 不完整时不硬套一个空的主机名", () => {
  const error = new TypeError("fetch failed");
  const message = friendlyNetworkError(error, { what: "语音识别服务", url: "" }) ?? "";
  assert.match(message, /连不上语音识别服务/);
  assert.doesNotMatch(message, /（）/);
});

test("状态码提示直接指向该改什么", () => {
  const hints = [[401, /API Key/], [402, /余额/], [429, /频繁|额度/], [503, /服务端异常/]] as const;
  for (const [status, hint] of hints) assert.match(httpStatusHint(status) ?? "", hint, `${status} 应当给出提示`);
  assert.equal(httpStatusHint(400), "");
});
