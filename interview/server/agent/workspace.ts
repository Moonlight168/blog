import fs from "node:fs";
import path from "node:path";

import { config } from "../infra/config/index.ts";
import { readResume } from "../modules/document/scan.ts";

/**
 * 会话工作目录：agent 能看到的全部文件都在这里，此外哪儿也不给。
 *
 * 为什么要把规范**拷一份**进去，而不是让 agent 读仓库里的原文件：
 * 规则必须在建会话时**冻结**。会话跑到一半有人改了 prompts/，
 * 同一场的出题标准与评分标准就会变 —— 那不是我们想要的（prompts/interviewer/SKILL.md 第 8 条）。
 * 拷进来的这一份就是那一场的规则，改动对已经在跑的会话不生效。
 */

const WORKSPACE_ROOT = path.join(config.dataDir, "workspaces");
const PROMPTS_DIR = path.join(config.appRoot, "prompts");

export interface WorkspaceInput {
  sessionId: string;
  resumePath: string;
  jdPath?: string;
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
export function prepareWorkspace({ sessionId, resumePath, jdPath }: WorkspaceInput): string {
  const dir = workspacePathOf(sessionId);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, "prompts"), { recursive: true });

  if (fs.existsSync(PROMPTS_DIR)) {
    for (const entry of fs.readdirSync(PROMPTS_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skill = path.join(PROMPTS_DIR, entry.name, "SKILL.md");
      if (fs.existsSync(skill)) fs.copyFileSync(skill, path.join(dir, "prompts", `${entry.name}.md`));
    }
  }

  fs.writeFileSync(path.join(dir, "resume.md"), readResume(resumePath), "utf8");

  const jd = String(jdPath ?? "").trim();
  if (jd && fs.existsSync(jd)) fs.writeFileSync(path.join(dir, "jd.md"), readResume(jd), "utf8");

  return dir;
}

export function removeWorkspace(sessionId: string): void {
  fs.rmSync(workspacePathOf(sessionId), { recursive: true, force: true });
}
