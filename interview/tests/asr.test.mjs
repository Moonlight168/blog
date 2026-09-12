import assert from "node:assert/strict";
import test from "node:test";

import { asrEnabled, transcribe } from "../server/asr.mjs";

const CONFIG = { baseUrl: "https://api.siliconflow.cn/v1", apiKey: "test-key", model: "XingChenAGI/XingChenASR-V3.2-Ultra" };
const okResponse = (payload) => ({ ok: true, status: 200, text: async () => JSON.stringify(payload) });

test("缺 baseUrl 或 key 时视为不可用", () => {
  assert.equal(asrEnabled({ baseUrl: "", apiKey: "k" }), false);
  assert.equal(asrEnabled({ baseUrl: "https://x/v1", apiKey: "" }), false);
  assert.equal(asrEnabled({ baseUrl: "https://x/v1", apiKey: "k" }), true);
});

test("转写成功：拼对地址、带上鉴权与 model，返回文本与时长", async () => {
  let seen = null;
  const fetchImpl = async (url, options) => {
    seen = { url, options };
    return okResponse({ text: "  你好，Spring Boot  ", duration: 3.25 });
  };
  const result = await transcribe({ config: CONFIG, buffer: Buffer.from("fake-audio"), mime: "audio/wav", fetchImpl });

  assert.equal(result.text, "你好，Spring Boot");
  assert.equal(result.duration, 3.25);
  assert.equal(seen.url, "https://api.siliconflow.cn/v1/audio/transcriptions");
  assert.equal(seen.options.method, "POST");
  assert.equal(seen.options.headers.Authorization, "Bearer test-key");
  assert.ok(seen.options.body instanceof FormData, "应当用 multipart 表单上传");
  assert.equal(seen.options.body.get("model"), CONFIG.model);
});

test("时长缺失时回落 usage.seconds，再不行才是 0", async () => {
  const withUsage = await transcribe({
    config: CONFIG, buffer: Buffer.from("a"), mime: "audio/wav",
    fetchImpl: async () => okResponse({ text: "a", usage: { seconds: 8 } }),
  });
  assert.equal(withUsage.duration, 8);
  const without = await transcribe({
    config: CONFIG, buffer: Buffer.from("a"), mime: "audio/wav",
    fetchImpl: async () => okResponse({ text: "a" }),
  });
  assert.equal(without.duration, 0);
});

test("MIME 决定上传的文件后缀，未知类型回落到 wav", async () => {
  const fileNames = [];
  const fetchImpl = async (_url, options) => {
    fileNames.push(options.body.get("file").name);
    return okResponse({ text: "a" });
  };
  await transcribe({ config: CONFIG, buffer: Buffer.from("a"), mime: "audio/webm;codecs=opus", fetchImpl });
  await transcribe({ config: CONFIG, buffer: Buffer.from("a"), mime: "application/octet-stream", fetchImpl });
  assert.deepEqual(fileNames, ["speech.webm", "speech.wav"]);
});

test("上游报错时把状态码与内容带出来", async () => {
  const fetchImpl = async () => ({ ok: false, status: 429, text: async () => "rate limit exceeded" });
  await assert.rejects(
    () => transcribe({ config: CONFIG, buffer: Buffer.from("a"), mime: "audio/wav", fetchImpl }),
    /429.*rate limit exceeded/,
  );
});

test("空音频不发请求", async () => {
  let called = false;
  const fetchImpl = async () => { called = true; return okResponse({ text: "x" }); };
  await assert.rejects(() => transcribe({ config: CONFIG, buffer: Buffer.alloc(0), mime: "audio/wav", fetchImpl }), /音频内容为空/);
  assert.equal(called, false);
});

test("超时转成可读提示，而不是抛 AbortError", async () => {
  const fetchImpl = async (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    });
  });
  await assert.rejects(
    () => transcribe({ config: CONFIG, buffer: Buffer.from("a"), mime: "audio/wav", fetchImpl, timeoutMs: 20 }),
    /语音识别超时/,
  );
});
