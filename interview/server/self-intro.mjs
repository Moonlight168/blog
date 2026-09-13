import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * 自我介绍文档：读、写、版本管理。
 *
 * 这个文件躺在 src/private 下——主仓库用 .gitignore 排除了它，但那个目录里有一个
 * 独立的本地 git 仓库（无远程），所以「回滚」直接复用 git，而不是自己造一套备份。
 */

/** 自我介绍相对简历目录的位置 */
export const SELF_INTRO_RELATIVE = path.join("zhangsan", "自我介绍.md");

export function selfIntroPath(resumeDir) {
  return path.join(resumeDir, SELF_INTRO_RELATIVE);
}

/** 从文件所在目录往上找 .git，找到就返回仓库根；没有则返回 null（此时只写盘、不做版本管理） */
export function findRepoRoot(file) {
  let dir = path.dirname(path.resolve(file));
  for (;;) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function git(repo, args, { allowFailure = false } = {}) {
  try {
    return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    if (allowFailure) return null;
    const detail = String(error.stderr || error.message).trim().split("\n").at(-1);
    throw new Error(`git ${args[0]} 失败：${detail}`);
  }
}

export function readSelfIntro(resumeDir) {
  const file = selfIntroPath(resumeDir);
  const exists = fs.existsSync(file) && fs.statSync(file).isFile();
  return {
    path: file,
    exists,
    markdown: exists ? fs.readFileSync(file, "utf8") : "",
    mtime: exists ? fs.statSync(file).mtimeMs : null,
    repo: findRepoRoot(file),
  };
}

/**
 * 原文件用的是哪种换行符。
 * 浏览器 textarea 会把 CRLF 归一成 LF，直接写回就等于把整个文件重写一遍——
 * 26 行的文件会在 git 里显示成 26 行改动，其实只有换行符变了。
 */
function detectEol(file) {
  if (!fs.existsSync(file)) return "\n";
  return fs.readFileSync(file, "utf8").includes("\r\n") ? "\r\n" : "\n";
}

/** 原子写：先写临时文件再 rename，中途失败不会留下半截文件 */
export function writeSelfIntro(resumeDir, markdown) {
  const file = selfIntroPath(resumeDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const eol = detectEol(file);
  const content = String(markdown).replace(/\r\n/g, "\n").replace(/\n/g, eol);
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, content, "utf8");
  fs.renameSync(temp, file);
  return { path: file, mtime: fs.statSync(file).mtimeMs };
}

/**
 * 把这个文件提交进它所在的本地仓库。
 * 内容没变时 git 会拒绝提交，这里当成「无需提交」返回，不当错误。
 */
export function commitSelfIntro(resumeDir, message) {
  const file = selfIntroPath(resumeDir);
  const repo = findRepoRoot(file);
  if (!repo) return { committed: false, reason: "这个文件不在任何 git 仓库里，只写入了磁盘" };
  const relative = path.relative(repo, file).split(path.sep).join("/");
  git(repo, ["add", "--", relative]);
  const dirty = git(repo, ["status", "--porcelain", "--", relative], { allowFailure: true });
  if (!dirty?.trim()) return { committed: false, reason: "内容没有变化，无需提交" };
  const output = git(repo, ["commit", "-m", message, "--", relative], { allowFailure: true });
  if (output === null) return { committed: false, reason: "提交失败（可能是 git 用户信息未配置）" };
  return { committed: true, hash: git(repo, ["rev-parse", "--short", "HEAD"]).trim(), repo };
}

/**
 * 这个文件的提交历史（新→旧）。用 --numstat 一次性把每次改了多少行也带出来，
 * 免得每次提交再单独跑一遍 diff。
 */
export function selfIntroHistory(resumeDir, limit = 50) {
  const file = selfIntroPath(resumeDir);
  const repo = findRepoRoot(file);
  if (!repo) return [];
  const relative = path.relative(repo, file).split(path.sep).join("/");
  const raw = git(repo, ["log", `--max-count=${limit}`, "--follow", "--format=%x1e%H%x1f%aI%x1f%s", "--numstat", "--", relative], { allowFailure: true });
  if (!raw) return [];
  const commits = [];
  for (const chunk of raw.split("\x1e").filter((part) => part.trim())) {
    const [meta, ...rest] = chunk.split("\n");
    const [hash, date, subject] = meta.split("\x1f");
    if (!hash) continue;
    let added = 0;
    let deleted = 0;
    for (const line of rest) {
      const cells = line.split("\t");
      if (cells.length >= 2 && /^\d+$/.test(cells[0]) && /^\d+$/.test(cells[1])) {
        added += Number(cells[0]);
        deleted += Number(cells[1]);
      }
    }
    commits.push({ hash, date, subject, added, deleted });
  }
  return commits;
}

/** 取某次提交里这个文件的内容（用于预览与回滚），不回写任何东西 */
export function readSelfIntroAt(resumeDir, hash) {
  if (!/^[0-9a-f]{7,40}$/i.test(String(hash))) throw new Error("提交号不合法");
  const file = selfIntroPath(resumeDir);
  const repo = findRepoRoot(file);
  if (!repo) throw new Error("这个文件不在任何 git 仓库里，无法回溯历史");
  const relative = path.relative(repo, file).split(path.sep).join("/");
  const content = git(repo, ["show", `${hash}:${relative}`], { allowFailure: true });
  if (content === null) throw new Error("这次提交里没有这个文件");
  return content;
}

/** 回滚 = 把那一版内容取出来重新写一遍并提交（不改写历史） */
export function rollbackSelfIntro(resumeDir, hash, message = "自我介绍：回滚到历史版本") {
  const markdown = readSelfIntroAt(resumeDir, hash);
  const written = writeSelfIntro(resumeDir, markdown);
  const commit = commitSelfIntro(resumeDir, message);
  return { ...written, markdown, commit };
}
