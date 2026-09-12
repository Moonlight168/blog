export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    });
  } catch {
    throw new Error("连不上后端服务，请确认 API 服务已启动（npm run dev）");
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
