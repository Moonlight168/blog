import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

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
  return {
    ...target,
    exists,
    markdown: exists ? fs.readFileSync(target.path, "utf8") : "",
    mtime: exists ? fs.statSync(target.path).mtimeMs : null,
    repo: findRepoRoot(target.path),
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
export function readSelfIntroAt(resumeDir, file, hash) {
  if (!/^[0-9a-f]{7,40}$/i.test(String(hash))) throw new Error("提交号不合法");
  const target = resolveSelfIntro(resumeDir, file);
  if (!target) throw new Error(`没有这份自我介绍：${file || "(空)"}`);
  const repo = findRepoRoot(target.path);
  if (!repo) throw new Error("这个文件不在任何 git 仓库里，无法回溯历史");
  const relative = path.relative(repo, target.path).split(path.sep).join("/");
  const content = git(repo, ["show", `${hash}:${relative}`], { allowFailure: true });
  if (content === null) throw new Error("这次提交里没有这个文件");
  return content;
}

/** 回滚 = 把那一版内容取出来重新写一遍并提交（不改写历史） */
export function rollbackSelfIntro(resumeDir, file, hash, message = "自我介绍：回滚到历史版本") {
  const markdown = readSelfIntroAt(resumeDir, file, hash);
  const written = writeSelfIntro(resumeDir, file, markdown);
  const commit = commitSelfIntro(resumeDir, file, message);
  return { ...written, markdown, commit };
}
