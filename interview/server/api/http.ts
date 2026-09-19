import type { IncomingMessage, ServerResponse } from "node:http";

export function json(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}

const MAX_BODY_CHARS = 1_000_000;

export async function readJsonBody(request: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString("utf8");
  if (text.length > MAX_BODY_CHARS) throw new Error("请求体过大");
  return text ? JSON.parse(text) : {};
}

export const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

/** 读原始二进制请求体（语音上传用）；超限就中断并报可读错误 */
export async function readBinaryBody(
  request: IncomingMessage,
  limit: number = MAX_AUDIO_BYTES,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = chunk as Buffer;
    size += buffer.length;
    if (size > limit) throw new Error(`音频过大（上限 ${Math.round(limit / 1024 / 1024)}MB），说短一点再试`);
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}
