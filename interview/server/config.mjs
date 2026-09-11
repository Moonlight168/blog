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
  resumeDir: process.env.INTERVIEW_RESUME_DIR || "G:\\handoff\\interview",
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
};

export function apiUrl(baseUrl, endpoint) {
  const clean = baseUrl.replace(/\/+$/, "");
  return `${clean.endsWith("/v1") ? clean : `${clean}/v1`}/${endpoint}`;
}
