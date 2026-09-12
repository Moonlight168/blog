import { apiUrl } from "./config.mjs";

/**
 * 语音转写：调硅基流动的 /audio/transcriptions（OpenAI 兼容的 multipart 形式）。
 * 单独成文件是为了能用 mock 掉 fetch 的方式做单测，不必真起 HTTP 服务、也不花钱。
 */

/** 没配 key/baseUrl 就当不可用，前端会把「模型」选项灰掉 */
export function asrEnabled(asrConfig) {
  return Boolean(asrConfig?.baseUrl && asrConfig?.apiKey);
}

// 上游按文件后缀判断格式，前端固定发 16kHz 单声道 WAV（这条链路已实测可用），
// 其余几个后缀留着，万一以后直接拿 MediaRecorder 的原始产物上传也不用改这里
const EXTENSIONS = {
  "audio/wav": "wav", "audio/x-wav": "wav", "audio/wave": "wav",
  "audio/webm": "webm", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/mp4": "m4a",
};

/**
 * @returns {Promise<{text: string, duration: number}>}
 */
export async function transcribe({ config: asrConfig, buffer, mime, fetchImpl = fetch, timeoutMs = 60_000 }) {
  if (!asrEnabled(asrConfig)) throw new Error("未配置语音识别服务（缺 API Key）");
  if (!buffer?.length) throw new Error("音频内容为空");

  const contentType = String(mime || "audio/wav").split(";")[0].trim().toLowerCase();
  const extension = EXTENSIONS[contentType] || "wav";
  const form = new FormData();
  form.append("model", asrConfig.model);
  form.append("file", new Blob([buffer], { type: contentType }), `speech.${extension}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(apiUrl(asrConfig.baseUrl, "audio/transcriptions"), {
      method: "POST",
      headers: { Authorization: `Bearer ${asrConfig.apiKey}` },
      body: form,
      signal: controller.signal,
    });
    const raw = await response.text();
    if (!response.ok) {
      // 带上上游状态码：前端才分得清是 key 失效（401）、限流（429）还是音频有问题（400）
      throw new Error(`语音识别服务返回 ${response.status}${raw ? `：${raw.slice(0, 200)}` : ""}`);
    }
    let payload;
    try { payload = JSON.parse(raw); }
    catch { throw new Error("语音识别服务返回了非 JSON 内容"); }
    return {
      text: String(payload.text ?? "").trim(),
      duration: Number(payload.duration ?? payload.usage?.seconds ?? 0) || 0,
    };
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("语音识别超时，请重试或改用浏览器内置识别");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
