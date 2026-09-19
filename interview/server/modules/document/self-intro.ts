import fs from "node:fs";
import path from "node:path";

import type { DocTarget } from "./versioned-file.ts";

/**
 * 自我介绍（Markdown）的定位。
 *
 * 目录结构：<简历目录>/<人目录>/自我介绍/*.md —— 一个目录放多份（技术面 / HR 面）。
 * 与简历编辑稿是同一套「可版本化文件」操作，只是定位方式不同。
 */

const SELF_INTRO_NAME = "自我介绍";
/** 目录化之前的老位置：目录不存在时退回这里读单文件 */
const LEGACY_SELF_INTRO_NAME = "自我介绍.md";
/** 实在认不出来时（简历目录还空着）用的占位名 */
const FALLBACK_PERSON_DIR = "me";

/**
 * 简历所属人的目录名（如 zhangsan）。
 *
 * 一台机器上可能不止一个人的简历，所以这个目录名因人而异，**不能写死在代码里**。
 * 取值顺序：
 *   ① .env 的 INTERVIEW_PERSON_DIR（显式配了就听它的）
 *   ② **自动认**：哪个人目录下已经有「自我介绍」，那就是正在用的人
 *   ③ 再退一步：第一个人目录
 *   ④ 简历目录还空着，才用占位名
 *
 * ②③ 是必须的：原先默认写死占位名 `me`，换台机器就落到一个不存在的目录，
 * 自我介绍一份都读不到 —— 表现成「这个页面打不开/不可编辑」，而那些人根本没配过 .env。
 * 自动识别让「把项目给别人用」这件事不需要任何配置。
 *
 * 惰性读取而不是模块顶层读：这样不依赖「config 先把 .env 加载进来」的导入顺序。
 */
export function personDir(resumeDir: string): string {
  const configured = String(process.env.INTERVIEW_PERSON_DIR ?? "").trim();
  if (configured) return configured;

  let people: string[] = [];
  try {
    people = fs.readdirSync(resumeDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "zh"));
  } catch {
    return FALLBACK_PERSON_DIR;   // 简历目录还不存在
  }
  if (!people.length) return FALLBACK_PERSON_DIR;

  const hasSelfIntro = (name: string) => {
    const dir = path.join(resumeDir, name);
    return fs.existsSync(path.join(dir, SELF_INTRO_NAME)) || fs.existsSync(path.join(dir, LEGACY_SELF_INTRO_NAME));
  };
  return people.find(hasSelfIntro) ?? people[0];
}

/** 自我介绍目录：<简历目录>/<人目录>/自我介绍/ */
export function selfIntroDir(resumeDir: string): string {
  return path.join(resumeDir, personDir(resumeDir), SELF_INTRO_NAME);
}

/**
 * 扫描目录下所有自我介绍（按文件名排序）。
 * 目录还没建时退回旧位置的单文件，免得改目录结构把已有内容读丢。
 */
export function listSelfIntros(resumeDir: string): DocTarget[] {
  const dir = selfIntroDir(resumeDir);
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
      .map((entry) => ({ file: entry.name, name: path.basename(entry.name, ".md"), path: path.join(dir, entry.name) }))
      .sort((a, b) => a.name.localeCompare(b.name, "zh"));
  }
  const legacy = path.join(resumeDir, personDir(resumeDir), LEGACY_SELF_INTRO_NAME);
  return fs.existsSync(legacy)
    ? [{ file: path.basename(legacy), name: path.basename(legacy, ".md"), path: legacy }]
    : [];
}

/** 只认「扫描结果里出现过的那份」，不接受拼出来的路径 —— 路径穿越从根上就不可能 */
export function resolveSelfIntro(resumeDir: string, file: unknown): DocTarget | null {
  const list = listSelfIntros(resumeDir);
  const wanted = String(file ?? "").trim();
  if (!wanted) return list[0] ?? null;
  return list.find((item) => item.file === wanted || item.name === wanted) ?? null;
}
