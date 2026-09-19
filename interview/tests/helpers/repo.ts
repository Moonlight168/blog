import { execFileSync } from "node:child_process";

/**
 * 测试夹具：临时目录与 git 仓库。
 *
 * 抽出来的理由是它们原先散在多个测试文件里各写一遍 ——
 * 建仓库那 5 行样板在一份文件里就重复了 6 次，改一次（比如加 core.autocrlf）要改 6 处。
 */

/**
 * 在 dir 里初始化一个能提交的仓库。
 * user.name / user.email 必须配：没配的话 commit 直接失败，而报错信息看起来像是别的问题。
 */
export function initRepo(dir: string, { autocrlf = false }: { autocrlf?: boolean } = {}): string {
  const run = (...args: string[]) => execFileSync("git", ["-C", dir, ...args], { stdio: "ignore" });
  run("init");
  run("config", "user.name", "tester");
  run("config", "user.email", "tester@example.com");
  if (autocrlf) run("config", "core.autocrlf", "true");
  return dir;
}

/** 把当前全部改动提交一版 */
export function commitAll(dir: string, message: string): void {
  const run = (...args: string[]) => execFileSync("git", ["-C", dir, ...args], { stdio: "ignore" });
  run("add", "-A");
  run("commit", "-m", message);
}

/** 提交信息列表，新 → 旧 */
export function gitLog(repo: string): string[] {
  return execFileSync("git", ["-C", repo, "log", "--format=%s"], { encoding: "utf8" }).trim().split("\n");
}

/** 最近一次提交的短 hash —— 要「取当前这版」的测试都从它起步 */
export function headHash(repo: string): string {
  return execFileSync("git", ["-C", repo, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
}
