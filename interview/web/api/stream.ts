import { EVENT, type StreamEvent } from "../../shared/events.ts";

export async function apiStream<T>(url: string, options: RequestInit, onEvent: (event: StreamEvent) => void): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", Accept: "application/x-ndjson", ...(options.headers || {}) } });
  if (!response.ok || !response.body) {
    const raw = await response.text();
    let message = raw;
    try { message = JSON.parse(raw).error || raw; } catch { /* 非 JSON 错误保留原文 */ }
    throw new Error(message || `请求失败（${response.status}）`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: T | undefined;
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.type === "error") throw new Error(event.error || "AI 处理失败");
      if (event.type === "result") result = event.data;
      else onEvent(event);
    }
    if (done) break;
  }
  if (!result) throw new Error("AI 流式响应未返回最终结果");
  return result;
}
