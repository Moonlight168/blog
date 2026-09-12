import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_ROOT = path.resolve(APP_ROOT, "..");

function loadEnv(file = path.join(APP_ROOT, ".env")) {
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

export const config = {
  appRoot: APP_ROOT,
  blogRoot: BLOG_ROOT,
  knowledgeRoot: path.join(BLOG_ROOT, "src", "series", "knowledge"),
  privateHistoryRoot: path.join(BLOG_ROOT, "src", "private", "series", "答题历史"),
  databasePath: path.join(APP_ROOT, "data", "interview.sqlite"),
  host: process.env.INTERVIEW_HOST || "127.0.0.1",
  port: Number(process.env.INTERVIEW_PORT || 8890),
  // 简历默认放在博客仓库的私有目录下（src/private 不进版本库），.env 可覆盖
  resumeDir: process.env.INTERVIEW_RESUME_DIR || path.join(BLOG_ROOT, "src", "private", "resume"),
  // 题目里的「回答历史」是 VuePress 文档站的路径，页面里要拼上这个基址才能打开。
  // 8888 对应 src/.vuepress/config.ts 里的 port；那边改了这里也要跟着改。
  docsBaseUrl: (process.env.INTERVIEW_DOCS_BASE_URL || "http://127.0.0.1:8888").replace(/\/+$/, ""),
  chat: {
    baseUrl: process.env.INTERVIEW_CHAT_BASE_URL || "",
    apiKey: process.env.INTERVIEW_CHAT_API_KEY || "",
    model: process.env.INTERVIEW_CHAT_MODEL || "",
  },
  embedding: {
    baseUrl: process.env.INTERVIEW_EMBEDDING_BASE_URL || "",
    apiKey: process.env.INTERVIEW_EMBEDDING_API_KEY || "",
    model: process.env.INTERVIEW_EMBEDDING_MODEL || "",
  },
  // 语音转写（ASR）：默认复用硅基流动那套（embedding 用同一账号、同一个 key），
  // 要换别家服务时用 INTERVIEW_ASR_BASE_URL / INTERVIEW_ASR_API_KEY / INTERVIEW_ASR_MODEL 覆盖
  asr: {
    baseUrl: process.env.INTERVIEW_ASR_BASE_URL || process.env.INTERVIEW_EMBEDDING_BASE_URL || "",
    apiKey: process.env.INTERVIEW_ASR_API_KEY || process.env.INTERVIEW_EMBEDDING_API_KEY || "",
    model: process.env.INTERVIEW_ASR_MODEL || "XingChenAGI/XingChenASR-V3.2-Ultra",
  },
};

export function apiUrl(baseUrl, endpoint) {
  const clean = baseUrl.replace(/\/+$/, "");
  return `${clean.endsWith("/v1") ? clean : `${clean}/v1`}/${endpoint}`;
}
