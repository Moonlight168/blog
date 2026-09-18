import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { commitPathAt } from "./commit-path.mjs";

/**
 * 自我介绍文档：读、写、版本管理。
 *
 * 这个文件躺在 src/private 下——主仓库用 .gitignore 排除了它，但那个目录里有一个
 * 独立的本地 git 仓库（无远程），所以「回滚」直接复用 git，而不是自己造一套备份。
 */

/** 自我介绍目录名（一个目录放多份，如 技术面 / HR面） */
const SELF_INTRO_NAME = "自我介绍";
/** 目录化之前的老位置：目录不存在时退回这里读单文件 */
const LEGACY_SELF_INTRO_NAME = "自我介绍.md";
/** 实在认不出来时（简历目录还空着）用的占位名 */
const FALLBACK_PERSON_DIR = "me";

/**
 * 简历所属人的目录名（如 zhangsan）。
 *
 * 一台机器上可能不止一个人的简历，所以这个目录名因人而异，**不能写死在代码里**。
 * 取值顺序：
 *   ① .env 的 INTERVIEW_PERSON_DIR（显式配了就听它的）
 *   ② **自动认**：哪个人目录下已经有「自我介绍」，那就是正在用的人
 *   ③ 再退一步：第一个人目录
 *   ④ 简历目录还空着，才用占位名
 *
 * ②③ 是必须的：原先默认写死占位名 `me`，换台机器就落到一个不存在的目录，
 * 自我介绍一份都读不到——表现成"这个页面打不开/不可编辑"，而那些人根本没配过 .env。
 * 自动识别让"把项目给别人用"这件事不需要任何配置。
 *
 * 惰性读取而不是模块顶层读：这样不依赖"config.mjs 先把 .env 加载进来"的导入顺序。
 */
function personDir(resumeDir) {
  const configured = String(process.env.INTERVIEW_PERSON_DIR ?? "").trim();
  if (configured) return configured;

  let people = [];
  try {
    people = fs.readdirSync(resumeDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "zh"));
  } catch {
    return FALLBACK_PERSON_DIR;   // 简历目录还不存在
  }
  if (!people.length) return FALLBACK_PERSON_DIR;

  const hasSelfIntro = (name) => {
    const dir = path.join(resumeDir, name);
    return fs.existsSync(path.join(dir, SELF_INTRO_NAME)) || fs.existsSync(path.join(dir, LEGACY_SELF_INTRO_NAME));
  };
  return people.find(hasSelfIntro) ?? people[0];
}

/** 自我介绍目录：<简历目录>/<人目录>/自我介绍/ */
export function selfIntroDir(resumeDir) {
  return path.join(resumeDir, personDir(resumeDir), SELF_INTRO_NAME);
}

/**
 * 扫描目录下所有自我介绍（按文件名排序）。
 * 目录还没建时退回旧位置的单文件，免得改目录结构把已有内容读丢。
 */
export function listSelfIntros(resumeDir) {
  const dir = selfIntroDir(resumeDir);
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
      .map((entry) => ({ file: entry.name, name: path.basename(entry.name, ".md"), path: path.join(dir, entry.name) }))
      .sort((a, b) => a.name.localeCompare(b.name, "zh"));
  }
  const legacy = path.join(resumeDir, personDir(resumeDir), LEGACY_SELF_INTRO_NAME);
  return fs.existsSync(legacy)
    ? [{ file: path.basename(legacy), name: path.basename(legacy, ".md"), path: legacy }]
    : [];
}

/**
 * 把客户端传来的文件名解析成真实路径。
 * 只从扫描结果里取，不接受拼出来的路径——这样路径穿越从根上就不可能。
 */
export function resolveSelfIntro(resumeDir, file) {
  const list = listSelfIntros(resumeDir);
  const wanted = String(file ?? "").trim();
  if (!wanted) return list[0] ?? null;
  return list.find((item) => item.file === wanted || item.name === wanted) ?? null;
}

/** 让 Git 自己确认仓库根；仅看到一个损坏或占位的 .git 目录不能算有效仓库。 */
export function findRepoRoot(file) {
  try {
    const root = execFileSync("git", ["-C", path.dirname(path.resolve(file)), "rev-parse", "--show-toplevel"], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return root ? fs.realpathSync(root) : null;
  } catch { return null; }
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

/** 读一份自我介绍；file 为空时取目录里排第一的那份 */
export function readSelfIntro(resumeDir, file = "") {
  const target = resolveSelfIntro(resumeDir, file);
  if (!target) return { file: "", name: "", path: "", exists: false, markdown: "", mtime: null, repo: null };
  const exists = fs.existsSync(target.path) && fs.statSync(target.path).isFile();
  const repo = findRepoRoot(target.path);
  return {
    ...target,
    exists,
    markdown: exists ? fs.readFileSync(target.path, "utf8") : "",
    mtime: exists ? fs.statSync(target.path).mtimeMs : null,
    repo,
    // 盘上和最新提交对不上——刚恢复过一版还没保存就会这样。刷新页面后要接着显示「未保存」
    uncommitted: repo ? differsFromHead(repo, relativeTo(repo, target.path)) : false,
  };
}

/** 文件在仓库里的相对路径（git 只认正斜杠） */
function relativeTo(repo, file) {
  return path.relative(repo, file).split(path.sep).join("/");
}

/** 盘上这份和最新提交对不上？——恢复到最新那版时会是 false，那就没有「未保存」可言 */
function differsFromHead(repo, relative) {
  if (!repo || !relative) return false;
  return Boolean(git(repo, ["diff", "--name-only", "HEAD", "--", relative], { allowFailure: true })?.trim());
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
export function writeSelfIntro(resumeDir, file, markdown) {
  const target = resolveSelfIntro(resumeDir, file);
  if (!target) throw new Error(`没有这份自我介绍：${file || "(空)"}`);
  fs.mkdirSync(path.dirname(target.path), { recursive: true });
  const eol = detectEol(target.path);
  const content = String(markdown).replace(/\r\n/g, "\n").replace(/\n/g, eol);
  const temp = `${target.path}.${process.pid}.tmp`;
  fs.writeFileSync(temp, content, "utf8");
  fs.renameSync(temp, target.path);
  return { path: target.path, file: target.file, name: target.name, mtime: fs.statSync(target.path).mtimeMs };
}

/**
 * 把这个文件提交进它所在的本地仓库。
 * 内容没变时 git 会拒绝提交，这里当成「无需提交」返回，不当错误。
 */
export function commitSelfIntro(resumeDir, file, message) {
  const target = resolveSelfIntro(resumeDir, file);
  if (!target) return { committed: false, reason: `没有这份自我介绍：${file || "(空)"}` };
  const repo = findRepoRoot(target.path);
  if (!repo) return { committed: false, reason: "这个文件不在任何 git 仓库里，只写入了磁盘" };
  const relative = path.relative(repo, target.path).split(path.sep).join("/");
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
export function selfIntroHistory(resumeDir, file, limit = 50) {
  const target = resolveSelfIntro(resumeDir, file);
  if (!target) return [];
  const repo = findRepoRoot(target.path);
  if (!repo) return [];
  const relative = path.relative(repo, target.path).split(path.sep).join("/");
  const raw = git(repo, ["log", `--max-count=${limit}`, "--follow", "--format=%x1e%H%x1f%aI%x1f%s", "--numstat", "--", relative], { allowFailure: true });
  if (!raw) return [];
  const commits = [];
  for (const chunk of raw.split("\x1e").filter((part) => part.trim())) {
    const [meta, ...rest] = chunk.split("\n");
    const [hash, date, subject] = meta.split("\x1f");
    if (!hash) continue;
    let added = 0;
    let deleted = 0;
    let binary = false;
    for (const line of rest) {
      const cells = line.split("\t");
      if (cells.length < 2) continue;
      if (/^\d+$/.test(cells[0]) && /^\d+$/.test(cells[1])) {
        added += Number(cells[0]);
        deleted += Number(cells[1]);
      } else if (cells[0] === "-") {
        binary = true;            // 二进制文件的 numstat 是 `-`，别把它读成「没改动」
      }
    }
    // 纯改名/挪位置那次提交，这个文件的 numstat 是 `0 0`——内容一个字没动。
    // 标出来交给展示层，别让它占一个版本号
    commits.push({ hash, date, subject, added, deleted, changed: binary || added > 0 || deleted > 0 });
  }
  return commits;
}

/** 取某次提交里这个文件的内容（用于预览与回滚），不回写任何东西 */
export function readSelfIntroAt(resumeDir, file, hash) {
  if (!/^[0-9a-f]{7,40}$/i.test(String(hash))) throw new Error("提交号不合法");
  const target = resolveSelfIntro(resumeDir, file);
  if (!target) throw new Error(`没有这份自我介绍：${file || "(空)"}`);
  const repo = findRepoRoot(target.path);
  if (!repo) throw new Error("这个文件不在任何 git 仓库里，无法回溯历史");
  const relative = path.relative(repo, target.path).split(path.sep).join("/");
  // 先按当前路径取；改名之前的那几版要回头查当时的名字。
  // 名字查不到就不要再拿空路径去 show——`<hash>:` 会被 git 当成根 tree，返回一坨非空的东西。
  let content = git(repo, ["show", `${hash}:${relative}`], { allowFailure: true });
  if (content === null) {
    const then = commitPathAt(repo, relative, hash);
    content = then ? git(repo, ["show", `${hash}:${then}`], { allowFailure: true }) : null;
  }
  if (content === null) throw new Error("这一版里没有这个文件");
  return content;
}

/**
 * 回滚到某一版：只把内容写回工作区，**不提交**。
 *
 * 提交是「保存」才做的事。回滚若自己提交，列表里就多一条内容上只是旧版副本的记录——
 * 不带任何新信息，只把「第几版」这个数字冲淡。所以回滚完编辑器是「未保存」状态，
 * 由你决定要不要点保存把它记成一版（git 里 `checkout <commit> -- <file>` 也是这个语义）。
 */
export function rollbackSelfIntro(resumeDir, file, hash) {
  const markdown = readSelfIntroAt(resumeDir, file, hash);
  const written = writeSelfIntro(resumeDir, file, markdown);
  const repo = findRepoRoot(written.path);
  return {
    ...written,
    // 回**盘上现在的样子**，不是 git 里那份：blob 存的是 LF（core.autocrlf），
    // 盘上是 CRLF，直接把 git 那份回给编辑器，字符串一比对不上，
    // 就会为一个根本没改过的文件亮「未保存」
    markdown: fs.readFileSync(written.path, "utf8"),
    // 照实回：恢复到**最新那版**时盘上和 HEAD 一样，就没有未保存的改动
    uncommitted: repo ? differsFromHead(repo, relativeTo(repo, written.path)) : false,
  };
}
