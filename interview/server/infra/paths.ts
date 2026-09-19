import path from "node:path";

/**
 * 路径与文件类型的守卫：外部传进来的路径必须先过这里。
 *
 * 这是安全边界而不是业务规则 —— 所以放 infra，由 modules 反过来依赖它。
 */

/** 可选的文件类型。图片等一律忽略。 */
const RESUME_EXTENSIONS = [".md", ".txt", ".html"];

export function isResumeFile(file: string): boolean {
  return RESUME_EXTENSIONS.includes(path.extname(file).toLowerCase());
}

/** 选中值必须落在简历目录内，且是受支持的文件类型。 */
export function isAllowedResume(file: unknown, root: string): boolean {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(String(file ?? ""));
  const relative = path.relative(resolvedRoot, resolved);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative) && isResumeFile(resolved);
}

/** JD 允许的路径与简历同规则（都在简历目录内）。 */
export function isAllowedJob(file: unknown, root: string): boolean {
  return isAllowedResume(file, root);
}
