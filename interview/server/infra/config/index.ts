import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 从 from 向上找到最近的含 package.json 的目录，那一层就是应用根。
 *
 * 不用 `resolve(dirname(import.meta.url), "..")`：本模块会挪进 server/infra/，
 * 位置一变相对层级就指错。appRoot 被四处消费（db 路径 / .env 读写 / prompt 读取 /
 * dist 静态服务），指错时不会抛错，只会写到别处或读不到。
 */
export function findAppRoot(from: string): string {
  let dir = path.resolve(from);
  for (;;) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error(`向上找不到 package.json，无法确定应用根：${from}`);
    dir = parent;
  }
}

const APP_ROOT = findAppRoot(path.dirname(fileURLToPath(import.meta.url)));
const BLOG_ROOT = path.resolve(APP_ROOT, "..");

function loadEnv(file: string = path.join(APP_ROOT, ".env")): void {
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

/** 一个 OpenAI 兼容服务端的接入参数。对话、向量、语音转写三处形状相同。 */
export interface ServiceConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AppConfig {
  appRoot: string;
  /** 运行期数据目录（sqlite / 会话记录 / 会话工作目录）。默认 `<appRoot>/data`，可用 `INTERVIEW_DATA_DIR` 指到别处 —— 测试就靠它避开真实数据 */
  dataDir: string;
  blogRoot: string;
  knowledgeRoot: string;
  privateHistoryRoot: string;
  databasePath: string;
  host: string;
  port: number;
  resumeDir: string;
  realInterviewDir: string;
  resumeExportDir: string;
  browserPath: string;
  docsBaseUrl: string;
  chat: ServiceConfig;
  embedding: ServiceConfig;
  asr: ServiceConfig;
}

export const config: AppConfig = {
  appRoot: APP_ROOT,
  blogRoot: BLOG_ROOT,
  knowledgeRoot: path.join(BLOG_ROOT, "src", "series", "knowledge"),
  privateHistoryRoot: path.join(BLOG_ROOT, "src", "private", "series", "答题历史"),
  dataDir: process.env.INTERVIEW_DATA_DIR || path.join(APP_ROOT, "data"),
  databasePath: path.join(process.env.INTERVIEW_DATA_DIR || path.join(APP_ROOT, "data"), "interview.sqlite"),
  host: process.env.INTERVIEW_HOST || "127.0.0.1",
  port: Number(process.env.INTERVIEW_PORT || 8890),
  // 简历默认放在博客仓库的私有目录下（src/private 不进版本库），.env 可覆盖
  resumeDir: process.env.INTERVIEW_RESUME_DIR || path.join(BLOG_ROOT, "src", "private", "resume"),
  /** 真实面试记录的根目录（面试历史里与模拟面试并列展示） */
  realInterviewDir: process.env.INTERVIEW_REAL_DIR || path.join(BLOG_ROOT, "src", "private", "hires", "个人简介", "面试经验"),
  /** 简历导出的 PDF 落盘目录：默认 OneDrive 桌面（同名直接覆盖） */
  resumeExportDir: process.env.INTERVIEW_RESUME_EXPORT_DIR || path.join(os.homedir(), "OneDrive", "桌面"),
  /** 生成 PDF 用的浏览器；留空则按常见路径自动找 Chrome / Edge */
  browserPath: process.env.INTERVIEW_BROWSER || "",
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

export function apiUrl(baseUrl: string, endpoint: string): string {
  const clean = baseUrl.replace(/\/+$/, "");
  return `${clean.endsWith("/v1") ? clean : `${clean}/v1`}/${endpoint}`;
}
