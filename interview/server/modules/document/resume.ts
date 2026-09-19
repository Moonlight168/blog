import fs from "node:fs";
import path from "node:path";

import type { DocTarget } from "./versioned-file.ts";

/**
 * 简历编辑稿（HTML）的定位。
 *
 * 目录结构：<简历目录>/<人目录>/*.html —— 一级目录即一个人。
 * 与自我介绍是同一套「可版本化文件」操作，只是定位方式不同。
 */

const JOBS_DIR = "jobs";

export interface ResumeTarget extends DocTarget {
  mtime: number;
}

/**
 * 按一级目录（= 一个人）分组列出简历。
 * 人员显示名取该目录下简历文件名的第一段（张三-Java后端….html → 张三）；
 * 各份前缀不一致时退回目录名，不硬猜。
 */
export function listResumeGroups(resumeDir: string) {
  const root = path.resolve(resumeDir);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return [];
  const groups = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === JOBS_DIR) continue;
    const dir = path.join(root, entry.name);
    const resumes = fs.readdirSync(dir, { withFileTypes: true })
      .filter((item) => item.isFile() && /\.html?$/i.test(item.name))
      .map((item) => {
        const full = path.join(dir, item.name);
        return {
          file: item.name,
          name: path.basename(item.name).replace(/\.[^.]+$/, ""),
          path: full,
          // 最近改过的排前面：进页面默认停在「当前在维护的那份」上，
          // 而不是名字排序碰巧第一个的那份
          mtime: fs.statSync(full).mtimeMs,
        };
      })
      .sort((a, b) => b.mtime - a.mtime);
    if (!resumes.length) continue;
    groups.push({ id: entry.name, label: personNameOf(resumes) || entry.name, resumes });
  }
  return groups.sort((a, b) => a.id.localeCompare(b.id));
}

function personNameOf(resumes: Array<{ name: string }>): string {
  const heads = resumes.map((item) => item.name.split("-")[0]).filter(Boolean);
  if (!heads.length) return "";
  return heads.every((head) => head === heads[0]) ? heads[0] : "";
}

/** 只认「扫描结果里出现过的那份」，不接受拼出来的路径 —— 路径穿越从根上就不可能 */
export function resolveResumeDoc(resumeDir: string, file: unknown): ResumeTarget | null {
  const wanted = String(file ?? "").trim();
  if (!wanted) return null;
  for (const group of listResumeGroups(resumeDir)) {
    const hit = group.resumes.find((item) => item.file === wanted || item.path === wanted);
    if (hit) return hit;
  }
  return null;
}
