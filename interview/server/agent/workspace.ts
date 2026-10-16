import fs from "node:fs";
import path from "node:path";

import { config } from "../infra/config/index.ts";
import { readResume } from "../modules/document/scan.ts";
import { readPrompt } from "../infra/prompts.ts";

/**
 * 会话工作目录：agent 能看到的全部文件都在这里，此外哪儿也不给。
 *
 * 为什么要把规范**拷一份**进去，而不是让 agent 读仓库里的原文件：
 * 规则必须在建会话时**冻结**。会话跑到一半有人改了 prompts/，
 * 同一场的出题标准与评分标准就会变 —— 那不是我们想要的（prompts/interviewer/SKILL.md 第 8 条）。
 * 拷进来的这一份就是那一场的规则，改动对已经在跑的会话不生效。
 */

const WORKSPACE_ROOT = path.join(config.dataDir, "workspaces");

export interface WorkspaceInput {
  sessionId: string;
  resumePath: string;
  jdPath?: string;
  skillSnapshot?: string;
  resumeExcerpt?: string;
  jdExcerpt?: string;
}

export function workspacePathOf(sessionId: string): string {
  return path.join(WORKSPACE_ROOT, sessionId);
}

/**
 * 建好这一场的工作目录并返回路径。
 *
 * 收录内容：
 *   prompts/   冻结的规范副本（agent 按需读，而不是把全文塞进提示词）
 *   resume.md  面试用的简历正文（已从 HTML 转 Markdown）
 *   jd.md      目标岗位，有才建
 */
export function prepareWorkspace({ sessionId, resumePath, jdPath, skillSnapshot, resumeExcerpt, jdExcerpt }: WorkspaceInput): string {
  const dir = workspacePathOf(sessionId);
  fs.mkdirSync(path.join(dir, "prompts"), { recursive: true });
  // 持久化快照是权威来源；旧会话没有快照时优先保留已有副本。
  const writeSnapshot = (file: string, snapshot: string | undefined, fallback: () => string) => {
    const target = path.join(dir, file);
    if (snapshot !== undefined || !fs.existsSync(target)) fs.writeFileSync(target, snapshot ?? fallback(), "utf8");
  };
  writeSnapshot("prompts/interviewer.md", skillSnapshot, () => readPrompt("interviewer"));
  writeSnapshot("resume.md", resumeExcerpt, () => readResume(resumePath));
  const jd = String(jdPath ?? "").trim();
  if (jdExcerpt !== undefined || (jd && fs.existsSync(jd))) writeSnapshot("jd.md", jdExcerpt, () => readResume(jd));

  return dir;
}

export function removeWorkspace(sessionId: string): void {
  fs.rmSync(workspacePathOf(sessionId), { recursive: true, force: true });
}
