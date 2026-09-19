import fs from "node:fs";
import path from "node:path";

import { commitPathAt } from "../../infra/git/path-at-commit.ts";
import { differsFromHead, findRepoRoot, git, repoRelative, relativeTo } from "../../infra/git/repo.ts";

/**
 * 「一个躺在 git 仓库里的文件」的通用操作：读、写、提交、历史、取某一版、回滚。
 *
 * 简历编辑稿与自我介绍共用这一份 —— 两者的差别只在**怎么定位文件**
 * （见 resume.ts / self-intro.ts），git 那一套完全相同。
 */

export interface DocTarget {
  file: string;
  name: string;
  path: string;
}

export interface CommitInfo {
  hash: string;
  date: string;
  /** git 的 subject：第一行，列表里只显示它 */
  subject: string;
  /** git 的 body：逐条列出的改动详情，鼠标停上去看 */
  body: string;
  added: number;
  deleted: number;
  /** 纯改名/挪位置的那次提交 numstat 是 0 0 —— 内容一个字没动，展示层不该给它一个版本号 */
  changed: boolean;
}

export interface CommitResult {
  committed: boolean;
  hash?: string;
  repo?: string;
  unchanged?: boolean;
  reason?: string;
}

/**
 * 原文件用的是哪种换行符。
 * 浏览器 textarea 会把 CRLF 归一成 LF，直接写回就等于把整个文件重写一遍——
 * 26 行的文件会在 git 里显示成 26 行改动，其实只有换行符变了。
 */
export function eolOf(file: string): string {
  if (!fs.existsSync(file)) return "\n";
  return fs.readFileSync(file, "utf8").includes("\r\n") ? "\r\n" : "\n";
}

export function readFileAt(target: DocTarget) {
  const exists = fs.existsSync(target.path) && fs.statSync(target.path).isFile();
  const info = exists ? repoRelative(target.path) : null;
  return {
    ...target,
    exists,
    content: exists ? fs.readFileSync(target.path, "utf8") : "",
    mtime: exists ? fs.statSync(target.path).mtimeMs : null,
    repo: info?.repo ?? null,
    // 盘上和最新提交对不上 —— 刚回滚过一版还没保存就会这样。刷新页面后要接着显示「未保存」
    uncommitted: info ? differsFromHead(info.repo, info.relative) : false,
  };
}

/** 原子写：先写临时文件再 rename，中途失败不会留下半截文件 */
export function writeFile(target: DocTarget, content: string) {
  // 域层的不变量：一个「可版本化的文档」不会是空的。
  // api 层还会按文档类型给出更具体的提示（「简历内容不能为空」），这里只是兜底。
  if (!String(content).trim()) throw new Error("文档内容不能为空");
  fs.mkdirSync(path.dirname(target.path), { recursive: true });
  const eol = eolOf(target.path);
  const normalized = String(content).replace(/\r\n/g, "\n").replace(/\n/g, eol);
  const temp = `${target.path}.${process.pid}.tmp`;
  fs.writeFileSync(temp, normalized, "utf8");
  fs.renameSync(temp, target.path);
  return { file: target.file, path: target.path, mtime: fs.statSync(target.path).mtimeMs };
}

/**
 * 提交进它所在的本地仓库。内容没变时 git 会拒绝提交，这里当成「无需提交」返回，不当错误。
 *
 * 这里**不抛错**：不在仓库里就如实回报，让调用方说明「写进盘了但没进版本库」。
 * 「没有仓库时整个拒绝保存」是 api 层在写盘前用 requireRepo 做的，两件事分工不同。
 */
export function commitFile(target: DocTarget, message: string): CommitResult {
  const repo = findRepoRoot(target.path);
  if (!repo) return { committed: false, reason: "这个文件不在任何 git 仓库里，只写入了磁盘" };
  const relative = relativeTo(repo, target.path);
  git(repo, ["add", "--", relative]);
  if (!(git(repo, ["status", "--porcelain", "--", relative], true) ?? "").trim()) {
    return { committed: false, unchanged: true, reason: "内容没有变化，无需提交" };
  }
  if (git(repo, ["commit", "-m", message, "--", relative], true) === null) {
    return { committed: false, reason: "提交失败（可能是 git 用户信息未配置）" };
  }
  return { committed: true, hash: git(repo, ["rev-parse", "--short", "HEAD"])!.trim(), repo };
}

/**
 * 提交历史（新→旧）。用 --numstat 一次把每次改了多少行也带出来，免得每次提交再单独跑一遍 diff。
 */
export function historyOf(target: DocTarget, limit = 50): CommitInfo[] {
  const info = repoRelative(target.path);
  if (!info) return [];
  // body 是多行的，所以用 %x1e 把它和 numstat **夹住**，切出来就是
  // [空, meta, numstat, meta, numstat, …] —— 每个 meta 和它自己的 numstat 紧挨着。
  // 只按 "\n" 切不行：body 的换行会把 numstat 行冲散，改动的行数就统计错了。
  const raw = git(info.repo, ["log", `--max-count=${limit}`, "--follow",
    "--format=%x1e%H%x1f%aI%x1f%s%x1f%b%x1e", "--numstat", "--", info.relative], true);
  if (!raw) return [];

  const pieces = raw.split("\x1e");
  const commits: CommitInfo[] = [];
  for (let index = 0; index < pieces.length; index += 1) {
    const piece = pieces[index];
    if (!piece.includes("\x1f")) continue;         // 空块，或属于上一个 meta 的 numstat 块
    const [hash, date, subject, body] = piece.split("\x1f");
    if (!hash) continue;
    let added = 0;
    let deleted = 0;
    let binary = false;
    for (const line of (pieces[index + 1] ?? "").split("\n")) {
      const cells = line.split("\t");
      if (cells.length < 2) continue;
      if (/^\d+$/.test(cells[0]) && /^\d+$/.test(cells[1])) {
        added += Number(cells[0]);
        deleted += Number(cells[1]);
      } else if (cells[0] === "-") {
        binary = true;            // 二进制文件的 numstat 是 `-`，不能读成「没改动」
      }
    }
    commits.push({
      hash, date, subject: subject ?? "", body: body ?? "",
      added, deleted, changed: binary || added > 0 || deleted > 0,
    });
  }
  return commits;
}

/** 取某个版本的内容（预览用），不回写任何东西 */
export function contentAt(target: DocTarget, hash: string): string {
  if (!/^[0-9a-f]{7,40}$/i.test(String(hash))) throw new Error("提交号不合法");
  const info = repoRelative(target.path);
  if (!info) throw new Error("这个文件不在任何 git 仓库里，无法回溯历史");
  // 先按当前路径取；改过名的那几版要回头查当时的名字（简历从 resume/ 挪进 zhangsan/ 就是这种）。
  // 名字查不到就不要再拿空路径去 show —— `<hash>:` 会被 git 当成根 tree，返回一坨非空的东西。
  let content = git(info.repo, ["show", `${hash}:${info.relative}`], true);
  if (content === null) {
    const then = commitPathAt(info.repo, info.relative, hash);
    content = then ? git(info.repo, ["show", `${hash}:${then}`], true) : null;
  }
  if (content === null) throw new Error("这一版里没有这个文件");
  return content;
}

/**
 * 丢弃工作区改动：把文件退回 HEAD 那一版。
 *
 * 这是「不做校验拦截」的逃生口 —— 模型改坏了，一键回到上次保存的样子。
 * 与 rollbackTo 的区别：那个回到**指定的某一版**（历史面板里挑），这个只回 HEAD。
 */
export function discardChanges(target: DocTarget) {
  const info = repoRelative(target.path);
  if (!info) throw new Error("这个文件不在任何 git 仓库里，没有可退回的版本");
  git(info.repo, ["checkout", "--", info.relative]);
  return {
    file: target.file,
    path: target.path,
    content: fs.readFileSync(target.path, "utf8"),
    uncommitted: differsFromHead(info.repo, info.relative),
  };
}

/**
 * 回滚到某一版：只把内容写回工作区，**不提交**。
 *
 * 提交是「保存」才做的事。回滚若自己提交，列表里就多一条内容上只是旧版副本的记录——
 * 不带任何新信息，只把「第几版」这个数字冲淡。所以回滚完编辑器是「未保存」状态，
 * 由用户决定要不要点保存把它记成一版（git 里 `checkout <commit> -- <file>` 也是这个语义）。
 */
export function rollbackTo(target: DocTarget, hash: string) {
  const written = writeFile(target, contentAt(target, hash));
  const info = repoRelative(written.path);
  return {
    ...written,
    // 回**盘上现在的样子**，不是 git 里那份：blob 存的是 LF（core.autocrlf），
    // 盘上是 CRLF，直接把 git 那份回给编辑器，字符串一比对不上，
    // 就会为一个根本没改过的文件亮「未保存」
    content: fs.readFileSync(written.path, "utf8"),
    // 照实回：回到**最新那版**时盘上和 HEAD 一样，那就没有未保存的改动
    uncommitted: info ? differsFromHead(info.repo, info.relative) : false,
  };
}
