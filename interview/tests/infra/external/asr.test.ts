import assert from "node:assert/strict";
import test from "node:test";

import { asrEnabled, transcribe } from "../../../server/infra/external/asr.ts";
import type { ServiceConfig } from "../../../server/infra/config/index.ts";

const CONFIG: ServiceConfig = { baseUrl: "https://api.siliconflow.cn/v1", apiKey: "test-key", model: "XingChenAGI/XingChenASR-V3.2-Ultra" };
const PARTIAL = { baseUrl: "https://x/v1", apiKey: "k", model: "m" };

/** 上游回包用真 Response：手搓 `{ ok, status, text }` 对不上类型，也测不出真实的解析路径 */
const okResponse = (payload: unknown): Response =>
  new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });

/** 记下一次请求：地址 + 初始化参数（body 按 multipart 表单取用） */
interface Call { url: string; init: RequestInit; form: FormData }
function recordingFetch(calls: Call[], payload: unknown): typeof fetch {
  return async (input, init) => {
    calls.push({ url: String(input), init: init ?? {}, form: init?.body as FormData });
    return okResponse(payload);
  };
}

test("缺 baseUrl 或 key 时视为不可用", () => {
  assert.equal(asrEnabled({ ...PARTIAL, baseUrl: "" }), false);
  assert.equal(asrEnabled({ ...PARTIAL, apiKey: "" }), false);
  assert.equal(asrEnabled(PARTIAL), true);
});

test("转写成功：拼对地址、带上鉴权与 model，返回文本与时长", async () => {
  const calls: Call[] = [];
  const result = await transcribe({
    config: CONFIG, buffer: Buffer.from("fake-audio"), mime: "audio/wav",
    fetchImpl: recordingFetch(calls, { text: "  你好，Spring Boot  ", duration: 3.25 }),
  });

  assert.equal(result.text, "你好，Spring Boot");
  assert.equal(result.duration, 3.25);

  const [call] = calls;
  assert.ok(call, "应当发过一次请求");
  assert.equal(call.url, "https://api.siliconflow.cn/v1/audio/transcriptions");
  assert.equal(call.init.method, "POST");
  assert.equal((call.init.headers as Record<string, string>).Authorization, "Bearer test-key");
  assert.ok(call.form instanceof FormData, "应当用 multipart 表单上传");
  assert.equal(call.form.get("model"), CONFIG.model);
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
  const fileNames: string[] = [];
  const fetchImpl: typeof fetch = async (_input, init) => {
    // get("file") 拿到的是 File 对象，取它的 name 才是上传的文件名
    fileNames.push(((init?.body as FormData).get("file") as File).name);
    return okResponse({ text: "a" });
  };
  await transcribe({ config: CONFIG, buffer: Buffer.from("a"), mime: "audio/webm;codecs=opus", fetchImpl });
  await transcribe({ config: CONFIG, buffer: Buffer.from("a"), mime: "application/octet-stream", fetchImpl });
  assert.deepEqual(fileNames, ["speech.webm", "speech.wav"]);
});

test("上游报错时把状态码与内容带出来", async () => {
  const fetchImpl: typeof fetch = async () => new Response("rate limit exceeded", { status: 429 });
  await assert.rejects(
    () => transcribe({ config: CONFIG, buffer: Buffer.from("a"), mime: "audio/wav", fetchImpl }),
    /429.*rate limit exceeded/,
  );
});

test("空音频不发请求", async () => {
  let called = false;
  const fetchImpl: typeof fetch = async () => { called = true; return okResponse({ text: "x" }); };
  await assert.rejects(() => transcribe({ config: CONFIG, buffer: Buffer.alloc(0), mime: "audio/wav", fetchImpl }), /音频内容为空/);
  assert.equal(called, false);
});

test("网络不可用时说「连不上」而不是 fetch failed", async () => {
  const fetchImpl: typeof fetch = async () => {
    const error = new TypeError("fetch failed");
    error.cause = { code: "ECONNREFUSED" };
    throw error;
  };
  await assert.rejects(
    () => transcribe({ config: CONFIG, buffer: Buffer.from("a"), mime: "audio/wav", fetchImpl }),
    /连不上语音识别服务.*ECONNREFUSED/s,
  );
});

test("超时转成可读提示，而不是抛 AbortError", async () => {
  const fetchImpl: typeof fetch = async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => {
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
