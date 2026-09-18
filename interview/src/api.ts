export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    });
  } catch {
    // 浏览器断网和「后端没启动」都会走到这里，靠 navigator.onLine 区分一下，
    // 否则用户会对着「请确认 API 服务已启动」白折腾半天。
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    throw new Error(offline
      ? "当前设备网络不可用——请检查 Wi-Fi 或网线后重试"
      : "连不上后端服务：请确认 API 服务已启动（npm run dev），或检查网络/代理");
  }

  // 代理在后端未启动时会返回空 body，直接 response.json() 会抛出难以理解的
  // “Unexpected end of JSON input”，所以这里先取文本再判断。
  const text = await response.text();
  if (!text) {
    throw new Error(
      response.ok
        ? "后端返回了空响应"
        : `后端无响应（HTTP ${response.status}），API 服务可能未启动或已崩溃——请重跑 npm run dev`,
    );
  }

  let payload: { error?: string };
  try {
    payload = JSON.parse(text) as { error?: string };
  } catch {
    throw new Error(`后端返回了非 JSON 内容（HTTP ${response.status}）：${text.slice(0, 120)}`);
  }

  if (!response.ok) throw new Error(payload.error || `请求失败（${response.status}）`);
  return payload as T;
}

export async function apiStream<T>(url: string, options: RequestInit, onEvent: (event: any) => void): Promise<T> {
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
