import fs from "node:fs";
import path from "node:path";

import { DEFAULT_COMPACTION_SETTINGS, estimateContextTokens, shouldCompact, err, FileError, type AgentLane } from "@earendil-works/pi-agent-core";
import { BACKGROUND_CONTEXT } from "@earendil-works/pi-agent-core/harness/context";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/harness/env/nodejs";
import { JsonlSessionRepo } from "@earendil-works/pi-agent-core/harness/session";

import { config } from "../infra/config/index.ts";

/**
 * 会话存储与压缩。
 *
 * 对话记录放 pi 的 JSONL 会话（`data/sessions/`），业务表仍留在 SQLite ——
 * 题库、评分、考点游标是业务记录，不是 agent 的对话流，pi 那边没有对应概念。
 *
 * 压缩直接用 pi 的 `lane.compact`：它要的 `Entry[]` 就是这套 session 自己的东西，
 * 自己实现一套反而更绕。
 */

/** 全仓共用一个根 Context。BACKGROUND_CONTEXT 表示「不属于任何请求」，正合适。 */
export const AGENT_CONTEXT = BACKGROUND_CONTEXT;

/** 模型窗口大小，与 agent/model.ts 里声明的 contextWindow 保持一致 */
const CONTEXT_WINDOW = 128_000;

/**
 * 给 agent 的执行环境。
 *
 * `shellEnv` 显式剔除密钥：NodeExecutionEnv 默认把 `process.env` 整个交给 shell，
 * 而 config.ts 的 loadEnv() 已经把 INTERVIEW_*_API_KEY 写进了 process.env ——
 * 于是模型为排查问题随手敲的 `env` / `printenv` 就会把 key 打进工具结果，
 * 再落进会话 JSONL、此后每一轮都作为上下文发给第三方模型服务。这不是被攻击，
 * 是日常误伤。
 */
function shellEnvWithoutSecrets(): Record<string, string> {
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value === undefined) continue;
    if (/_API_KEY$|_APIKEY$|_TOKEN$|_SECRET$/i.test(key)) continue;
    safe[key] = value;
  }
  return safe;
}

export function createEnv(cwd: string) {
  return new NodeExecutionEnv({ cwd, shellEnv: shellEnvWithoutSecrets() });
}

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`));
}

/** 找到最近的现存祖先并解析符号链接，连“尚不存在的待写文件”也能做边界判断。 */
function resolvedThroughExistingAncestor(candidate: string): string {
  let ancestor = candidate;
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    ancestor = parent;
  }
  const canonicalAncestor = fs.realpathSync.native(ancestor);
  return path.resolve(canonicalAncestor, path.relative(ancestor, candidate));
}

class ScopedExecutionEnv extends NodeExecutionEnv {
  readonly #root: string;

  constructor(cwd: string) {
    super({ cwd, shellEnv: shellEnvWithoutSecrets() });
    this.#root = fs.realpathSync.native(cwd);
  }

  override absolutePath(
    input: string,
    context: Parameters<NodeExecutionEnv["absolutePath"]>[1],
  ): ReturnType<NodeExecutionEnv["absolutePath"]> {
    const candidate = path.resolve(this.cwd, input);
    if (!isInside(path.resolve(this.cwd), candidate) || !isInside(this.#root, resolvedThroughExistingAncestor(candidate))) {
      return Promise.resolve(err<string, FileError>(new FileError("permission_denied", "Agent 不允许访问工作目录之外的路径", candidate)));
    }
    return super.absolutePath(candidate, context);
  }
}

/** 只交给模型工具的受限环境；会话仓库仍使用 createEnv 访问 data/sessions。 */
export function createToolEnv(cwd: string) {
  return new ScopedExecutionEnv(cwd);
}

/**
 * 删掉一场面试在磁盘上的痕迹：会话 JSONL（整段对话）。
 * 工作目录（含简历副本）由 workspace.ts 的 removeWorkspace 负责。
 */
export async function deleteAgentSession(sessionId: string, cwd: string): Promise<void> {
  const env = createEnv(cwd);
  const repo = createSessionRepo(env);
  const meta = (await repo.list({ cwd }, AGENT_CONTEXT)).find((item) => item.id === sessionId);
  if (meta) await repo.delete(meta, AGENT_CONTEXT);
}

export function createSessionRepo(env: NodeExecutionEnv) {
  return new JsonlSessionRepo({
    fileSystem: env,
    sessionsRoot: path.join(config.dataDir, "sessions"),
  });
}

/**
 * 打开这一场的会话，没有就新建。
 *
 * 用面试自己的 sessionId 当 pi 的会话 id，两边的记录才对得上 ——
 * 服务端要按 sessionId 找对话，不能另起一个 id 再维护映射表。
 */
export async function openOrCreateSession(
  repo: JsonlSessionRepo,
  { sessionId, cwd }: { sessionId: string; cwd: string },
) {
  const existing = (await repo.list({ cwd }, AGENT_CONTEXT)).find((meta) => meta.id === sessionId);
  return existing
    ? repo.open(existing, AGENT_CONTEXT)
    : repo.create({ id: sessionId, cwd }, AGENT_CONTEXT);
}

/**
 * 上下文快满了就压一次。没到阈值、或压缩失败都返回 false —— 调用方照常继续，
 * 压缩不该成为一轮问答失败的理由。
 */
export async function compactIfNeeded(lane: AgentLane, context: typeof AGENT_CONTEXT): Promise<boolean> {
  const entries = await lane.findEntries(undefined, context);
  const messages = entries.filter((entry: any) => entry.type === "message").map((entry: any) => entry.message);
  const usage = estimateContextTokens(messages);
  if (!shouldCompact(usage.tokens, CONTEXT_WINDOW, DEFAULT_COMPACTION_SETTINGS)) return false;

  const result = await lane.compact(undefined, context);
  if (result?.ok === false) {
    console.warn("会话压缩失败，本轮按未压缩继续", result.error);
    return false;
  }
  return true;
}

/** pi 的 ok 只表示调用被接受；模型执行失败还会落在 value.status。 */
export function assertRunSucceeded(result: Awaited<ReturnType<AgentLane["prompt"]>>): void {
  if (!result.ok) throw new Error(result.error?.message || "AI 处理失败");
  if (result.value.status === "failed") throw new Error(result.value.error?.message || "模型调用失败，请重试");
}

/** 只取当前用户消息之后的最后一条助手消息，空回复不能回溯成旧结果。 */
export async function readTurnReply(lane: AgentLane): Promise<string> {
  const entries = await lane.findEntries({ order: "newestFirst" }, AGENT_CONTEXT);
  for (const entry of entries) {
    if (entry.type !== "message") continue;
    const message = entry.message;
    if (message.role === "user") break;
    if (message.role !== "assistant") continue;
    const text = message.content.filter((block) => block.type === "text").map((block) => block.text).join("").trim();
    if (text) return text;
    break;
  }
  throw new Error("模型本轮未返回正文，请重试");
}
