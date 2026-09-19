// pi 的 AgentHarness 接线冒烟测试。
//
// 这个文件的价值在于「钉住接线」：pi 的 harness 不是类、prompt 在 lane 上、
// 内置工具必须从 toolContext 拿到 env —— 这三件事官方文档里都没写，
// 踩过一次才知道。升级 pi 时它会第一时间报出来。
//
// 全程用 fauxProvider 假模型，不需要 API key、不产生费用。

import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  AgentHarness,
  DEFAULT_COMPACTION_SETTINGS,
  createReadTool,
  createWriteTool,
  estimateContextTokens,
  loadSkills,
  prepareCompaction,
  shouldCompact,
} from "@earendil-works/pi-agent-core";
import { BACKGROUND_CONTEXT } from "@earendil-works/pi-agent-core/harness/context";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/harness/env/nodejs";
import { JsonlSessionRepo } from "@earendil-works/pi-agent-core/harness/session";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";

/** 起一套完整的本地 harness：工作目录 + JSONL 会话 + 假模型。 */
/**
 * 会话条目的真实形状（type / message.role …）是 pi 运行时的实情，它的类型里没写。
 * 这个文件本身就是来钉这些没写进类型的行为的，所以按实际形状取用。
 */
type FauxResponses = Parameters<ReturnType<typeof fauxProvider>["setResponses"]>[0];
type AgentMessage = Parameters<typeof estimateContextTokens>[0][number];

interface EntryShape {
  type: string;
  message: { role: string; [key: string]: unknown };
  [key: string]: unknown;
}

async function makeHarness(t: TestContext, { responses = [] }: { responses?: FauxResponses } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "harness-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const env = new NodeExecutionEnv({ cwd: root });
  const context = BACKGROUND_CONTEXT;
  const repo = new JsonlSessionRepo({ fileSystem: env, sessionsRoot: path.join(root, "sessions") });
  // cwd 是必填；漏了会崩在内部 resolvePath 的 startsWith 上，报错完全看不出原因
  const session = await repo.create({ cwd: root }, context);

  const faux = fauxProvider();
  const models = createModels();
  models.setProvider(faux.provider);
  faux.setResponses(responses);

  return { root, env, context, session, faux, models, model: faux.getModel() };
}

async function makeLane(t: TestContext, options?: { responses?: FauxResponses }) {
  const parts = await makeHarness(t, options);
  const { harness } = await AgentHarness.create(
    {
      session: parts.session,
      models: parts.models,
      model: parts.model,
      tools: [createReadTool(), createWriteTool()],
      // 不传 toolContext，内置工具会报 "Cannot destructure property 'env' of 'undefined'"
      toolContext: { env: parts.env },
    },
    parts.context,
  );
  // prompt 在 lane 上，不在 harness 上（harness 管理 lane，但它自己不是 lane）
  const lane = await harness.lane("main", parts.context);
  return { ...parts, harness, lane };
}

test("工具真的会执行，并落到工作目录里", async (t) => {
  const { root, lane, context } = await makeLane(t, {
    responses: [
      fauxAssistantMessage([fauxToolCall("write", { path: "hello.txt", content: "hi" })]),
      fauxAssistantMessage("done"),
    ],
  });

  const result = await lane.prompt("写一个 hello.txt", undefined, context);

  assert.equal(result.ok, true, "run 应当成功");
  assert.equal(result.value.status, "completed");
  assert.equal(fs.readFileSync(path.join(root, "hello.txt"), "utf8"), "hi");
});

test("会话记录的形状：user → toolCall → toolResult → assistant", async (t) => {
  const { session, lane, context } = await makeLane(t, {
    responses: [
      fauxAssistantMessage([fauxToolCall("write", { path: "a.txt", content: "1" })]),
      fauxAssistantMessage("完成"),
    ],
  });

  await lane.prompt("写个文件", undefined, context);
  const entries = await session.findEntries(undefined, context);

  const shaped = entries as unknown as EntryShape[];
  assert.ok(shaped.length >= 4);
  for (const entry of shaped) {
    assert.equal(entry.type, "message");
    for (const key of ["id", "parentId", "type", "message", "seq", "timestamp"]) {
      assert.ok(key in entry, `entry 缺字段 ${key}`);
    }
  }
  const roles = new Set(shaped.map((entry) => entry.message.role));
  // toolResult 也是 message.role 的一种 —— 前端渲染要单独处理，不能当成对话气泡
  assert.deepEqual([...roles].sort(), ["assistant", "toolResult", "user"]);
});

test("压缩三件套能在真实 entry 上跑通", async (t) => {
  const { session, lane, context } = await makeLane(t, {
    responses: [
      fauxAssistantMessage([fauxToolCall("write", { path: "a.txt", content: "1" })]),
      fauxAssistantMessage("完成"),
    ],
  });
  await lane.prompt("写个文件", undefined, context);
  const entries = await session.findEntries(undefined, context);
  const messages = (entries as unknown as EntryShape[])
    .filter((entry) => entry.type === "message")
    .map((entry) => entry.message as unknown as AgentMessage);

  const usage = estimateContextTokens(messages);
  assert.equal(typeof usage.tokens, "number", "返回的是对象，不是数字");

  assert.equal(shouldCompact(usage.tokens, 128_000, DEFAULT_COMPACTION_SETTINGS), false);
  assert.equal(shouldCompact(200_000, 128_000, DEFAULT_COMPACTION_SETTINGS), true);

  const prepared = prepareCompaction(entries, DEFAULT_COMPACTION_SETTINGS);
  assert.equal(prepared.ok, true, "真实 entry 应当能准备出压缩方案");
  assert.ok(prepared.ok && prepared.value && "messagesToSummarize" in prepared.value);
});

test("loadSkills 要求目录名 == frontmatter 的 name", async (t) => {
  const { root, env, context } = await makeHarness(t);

  fs.mkdirSync(path.join(root, "prompts", "interviewer"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "prompts", "interviewer", "SKILL.md"),
    "---\nname: interviewer\ndescription: 面试官规则\n---\n\n一次只出一道题。\n",
  );

  const loaded = await loadSkills(env, [path.join(root, "prompts")], context);

  assert.equal(loaded.skills.length, 1);
  assert.equal(loaded.diagnostics.length, 0, `不该有告警：${JSON.stringify(loaded.diagnostics)}`);
  assert.equal(loaded.skills[0].name, "interviewer");
});
