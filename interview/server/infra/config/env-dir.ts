import fs from "node:fs";
import path from "node:path";

import { HttpError } from "../../api/router.ts";
import { config } from "./index.ts";
import { updateEnvFile } from "./env-file.ts";

/**
 * 改一个「配置里的目录」（简历目录 / 导出目录）：
 * 确认目录存在 → 写回 .env 让下次启动仍是它 → 更新内存里的 config。
 *
 * 三件事必须一起做：只改内存则重启即失效，只改 .env 则当前进程还在用旧目录。
 */
export function setDirectory(
  dir: unknown,
  envKey: string,
  apply: (resolved: string) => void,
  label: string,
): string {
  const wanted = String(dir ?? "").trim();
  if (!wanted) throw new HttpError(400, `${label}不能为空`);
  const resolved = path.resolve(wanted);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new HttpError(400, `目录不存在或不是文件夹：${resolved}`);
  }
  try {
    updateEnvFile(path.join(config.appRoot, ".env"), envKey, resolved);
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }
  apply(resolved);
  return resolved;
}
