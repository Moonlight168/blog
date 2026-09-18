/**
 * 「那次提交里，这个文件叫什么名字」。
 *
 * 为什么需要它：读取某个版本走的是 `git show <hash>:<path>`，而这个 `<path>` 必须是**当时**的路径。
 * 但历史列表是 `--follow` 出来的，会跟着改名一路走——简历从 `resume/` 挪进 `hjf/`、
 * 自我介绍从 `自我介绍.md` 收进 `自我介绍/` 目录，这些提交里文件根本不叫现在的名字，
 * 拿当前路径去取必然是空的。这就是「取不到这个版本的内容」的来路。
 *
 * 只认 `--name-only --follow` 的输出。**不要用 `--numstat` 的路径列**：git 对那里做了
 * 花括号压缩（`resume/hjf/{自我介绍.md => 自我介绍/技术面.md}`），不是一个能直接用的路径。
 *
 * `core.quotepath=false` 不能省：默认情况下 git 会把非 ASCII 路径转义成
 * `"resume/hjf/\350\207\252..."`，那串东西拿去 show 是找不到的。
 */

import { execFileSync } from "node:child_process";

function git(repo, args) {
  try {
    return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    // 查不到名字不是错误，调用方会退回「这一版里没有这个文件」
    return "";
  }
}

/** git 遇到带空格之类的路径仍会加引号，去掉一层并还原转义 */
export function unquotePath(name) {
  const text = String(name ?? "").trim();
  if (!/^".*"$/.test(text)) return text;
  return text.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

/**
 * 查 `hash` 这次提交里 `relative` 这个文件当时的路径；查不到返回空串。
 * `hash` 给短的也认——历史面板传的是完整哈希，接口里也允许 7 位短号。
 */
export function commitPathAt(repo, relative, hash) {
  const raw = git(repo, ["-c", "core.quotepath=false", "log", "--follow", "--format=%x1e%H", "--name-only", "--", relative]);
  if (!raw) return "";
  for (const chunk of raw.split("\x1e").filter((part) => part.trim())) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    const commitHash = lines[0];
    if (!commitHash) continue;
    if (!(commitHash.startsWith(hash) || hash.startsWith(commitHash))) continue;
    // 改名那次会同时列出旧名和新名，最后一行才是「当时叫的名字」
    return unquotePath(lines.at(-1) ?? "");
  }
  return "";
}
