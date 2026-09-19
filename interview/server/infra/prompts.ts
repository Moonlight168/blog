import fs from "node:fs";
import path from "node:path";

import { config } from "./config/index.ts";

/**
 * 读 prompts/ 下的规范。
 *
 * 目录约定（`loadSkills` 要求的）：**一个 skill 一个目录、文件叫 SKILL.md、
 * 目录名等于 frontmatter 的 name**。不符就会加载失败或报 invalid_metadata。
 *
 * 这里读的是服务端自己拼提示词用的正文，所以顺手剥掉 frontmatter ——
 * 那几行是给 pi 的 skill 清单看的，混进提示词只会占 token。
 */

const PROMPTS_DIR = path.join(config.appRoot, "prompts");
const CACHE_MS = 5_000;

const cache = new Map<string, { at: number; text: string }>();

export function promptPath(name: string): string {
  return path.join(PROMPTS_DIR, name, "SKILL.md");
}

/** 去掉开头的 YAML frontmatter（`---` 包起来的那一段） */
function stripFrontmatter(text: string): string {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  return end < 0 ? text : text.slice(end + 4).trim();
}

/**
 * 读一份规范的正文（不含 frontmatter）。
 * 文件不存在返回空串 —— 提示词里那一段会整段省略，不该因此让请求失败。
 */
export function readPrompt(name: string): string {
  const now = Date.now();
  const hit = cache.get(name);
  if (hit && now - hit.at < CACHE_MS) return hit.text;

  const file = promptPath(name);
  const text = fs.existsSync(file) ? stripFrontmatter(fs.readFileSync(file, "utf8")) : "";
  cache.set(name, { at: now, text });
  return text;
}

