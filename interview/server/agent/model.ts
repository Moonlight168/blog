import { createModels, createProvider } from "@earendil-works/pi-ai";
import type { Model } from "@earendil-works/pi-ai";
import { openAICompletionsApi } from "@earendil-works/pi-ai/api/openai-completions.lazy";

import type { ServiceConfig } from "../infra/config/index.ts";

/**
 * 把「OpenAI 兼容的对话服务」注册成 pi 能用的 models 集合。
 *
 * 换别家服务只改 .env 的三行；这里不含任何厂商特有的东西。
 */
export function makeModels(config: ServiceConfig) {
  const baseUrl = String(config.baseUrl || "").replace(/\/+$/, "");
  // 标注类型而不是靠推断：compat 的类型取决于 api 是不是字面量 "openai-completions"，
  // 不标就会被推成 string，条件类型落空、整个对象对不上 Model。
  const model: Model<"openai-completions"> = {
    id: config.model,
    name: config.model,
    api: "openai-completions",
    provider: "interview-chat",
    baseUrl: baseUrl.endsWith("/v1") ? baseUrl : `${baseUrl}/v1`,
    reasoning: false,
    input: ["text"] as ("text" | "image")[],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 4_096,
    compat: { supportsStrictMode: false, maxTokensField: "max_tokens", supportsUsageInStreaming: true },
  };
  const provider = createProvider({
    id: model.provider,
    name: "Interview chat model",
    baseUrl: model.baseUrl,
    auth: { apiKey: { name: "Interview API key", resolve: async () => ({ auth: { apiKey: config.apiKey } }) } },
    models: [model],
    api: openAICompletionsApi(),
  });
  const models = createModels();
  models.setProvider(provider);
  return { models, model };
}

/** 没配齐就不要往下走 —— 报一句能照着 .env 修的话，而不是让 pi 抛底层错误 */
export function assertConfigured(config: ServiceConfig, what = "对话模型"): void {
  if (!config.baseUrl || !config.apiKey || !config.model) {
    throw new Error(`尚未配置 ${what}：请在 interview/.env 里填 INTERVIEW_CHAT_BASE_URL / API_KEY / MODEL`);
  }
}
