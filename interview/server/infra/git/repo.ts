import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * git 操作；allowFailure 时失败返回 null 而不是抛错。
 *
 * 失败信息只取 stderr 的最后一行 —— git 的完整输出对用户没有意义，
 * 末行才是「fatal: …」那句真原因。
 */
export function git(repo: string, args: string[], allowFailure = false): string | null {
  try {
    return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    if (allowFailure) return null;
    const detail = String((error as any).stderr || (error as Error).message).trim().split("\n").at(-1);
    throw new Error(`git ${args[0]} 失败：${detail}`);
  }
}

/**
 * 这个文件归哪个仓库管。
 *
 * 不能只看「往上找到的第一个仓库」：一路找上去可能是**外层业务仓库**，
 * 而它常常把私有目录整个 .gitignore 掉了（典型：仓库根写了 `src/private`）。
 * 那种「找到的仓库其实管不到这个路径」的情况下 `git add` 会被直接拒绝，
 * 于是保存变成「内容写进了盘、却永远提交不了，界面还说已保存」——
 * 所以这里用 check-ignore 判一下，被排除就当它不在仓库里。
 */
export function findRepoRoot(file: string): string | null {
  const target = path.resolve(file);
  let root = "";
  try {
    root = execFileSync("git", ["-C", path.dirname(target), "rev-parse", "--show-toplevel"], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;                 // 不在任何仓库里
  }
  if (!root) return null;
  try {
    // 退出码 0 = 被排除。走到这里就说明被排除了
    execFileSync("git", ["-C", root, "check-ignore", "-q", target], { stdio: "ignore" });
    return null;
  } catch (error) {
    // 退出码 1 = 没被排除，正常。其它错误（git 太老、参数不认）也不该把仓库整个否掉
    const status = (error as any)?.status;
    return status === 1 || status === undefined ? fs.realpathSync(root) : null;
  }
}

/**
 * 保存前先确认这个文件有仓库可提交，没有就抛错、**不写盘**。
 *
 * 为什么不「先写下去、回头再说」：那样会造出一个「盘上是新的、历史里没有、界面还显示已保存」
 * 的中间态 —— 正是这个中间态让人以为改动丢了（其实没丢，只是永远进不了版本库）。
 * 宁可这一次保存整个失败、把原因说清楚。
 */
export function requireRepo(filePath: string): string {
  const repo = filePath ? findRepoRoot(filePath) : null;
  if (!repo) {
    throw new Error("这个文件的私有目录还不是可用的 git 仓库（没有独立仓库，或被外层仓库的 .gitignore 排除了），保存没法留版本");
  }
  return repo;
}

/** 文件在仓库里的相对路径（git 只认正斜杠） */
export function relativeTo(repo: string, file: string): string {
  return path.relative(repo, file).split(path.sep).join("/");
}

/** 盘上这份和最新提交对不上？——恢复到最新那版时会是 false，那就没有「未保存」可言 */
export function differsFromHead(repo: string | null, relative: string): boolean {
  if (!repo || !relative) return false;
  return Boolean(git(repo, ["diff", "--name-only", "HEAD", "--", relative], true)?.trim());
}

export interface RepoRelative { repo: string; relative: string }

/** 文件在哪个仓库、相对路径是什么；不在仓库里返回 null */
export function repoRelative(file: string): RepoRelative | null {
  const repo = findRepoRoot(file);
  return repo ? { repo, relative: relativeTo(repo, file) } : null;
}
