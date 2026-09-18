#!/usr/bin/env node
/**
 * 本地启动器：启动前更新功能代码、导入可选 seed，再启动热更新服务。
 *
 * 对外只有两个模式：
 *   node launcher/bootstrap.mjs interview
 *   node launcher/bootstrap.mjs blog
 */

import { execFileSync, spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SELF_FILE = fileURLToPath(import.meta.url);
const SELF_DIR = path.dirname(SELF_FILE);
const APP_DIR = path.resolve(process.env.DESK_APP_DIR || path.dirname(SELF_DIR));
const SEED_DIR = path.resolve(process.env.DESK_SEED_DIR || path.join(path.dirname(APP_DIR), "seed"));
const STATE_DIR = path.join(APP_DIR, ".launcher");
const STATE_FILE = path.join(STATE_DIR, "state.json");
const LOG_FILE = path.join(STATE_DIR, "launcher.log");

const INTERVIEW_API_PORT = 8890;
const INTERVIEW_WEB_PORT = 5174;
const BLOG_PORT = 8888;

/**
 * 远程优先覆盖的功能文件。博客正文、题库、私人资料、运行数据和 .env 不在这里。
 * 面试台会读取文章格式规范，因此它虽然是 Markdown，也属于运行时契约。
 */
const SYNC_PATHS = [
  "launcher",
  "interview",
  "data",
  "src/.vuepress",
  ".gitignore",
  ".nvmrc",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "CNAME",
  "面试宝典文章格式规范.md",
];

fs.mkdirSync(STATE_DIR, { recursive: true });

function log(message = "") {
  const line = String(message);
  process.stdout.write(`${line}\n`);
  try {
    fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${line}\n`, "utf8");
  } catch {
    // 日志失败不应阻止服务启动。
  }
}

function readJson(file, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeState(patch) {
  const next = { ...readJson(STATE_FILE), ...patch };
  fs.writeFileSync(STATE_FILE, JSON.stringify(next, null, 2), "utf8");
}

function commandFor(command, args) {
  if (process.platform === "win32" && /^(npm|npx)$/i.test(path.basename(command))) {
    return { command: "cmd.exe", args: ["/d", "/s", "/c", command, ...args] };
  }
  return { command, args };
}

const COMMON_PROXY_PORTS = [7890, 7897, 7891, 10809, 1080];

function portBusy(port) {
  try {
    const out = execFileSync("netstat", ["-ano", "-p", "TCP"], { encoding: "utf8", windowsHide: true });
    return out.split(/\r?\n/).some((line) => line.includes("LISTENING") && line.includes(`:${port} `));
  } catch {
    return false;
  }
}

function systemProxy() {
  if (process.platform !== "win32") return "";
  const script = "$p=Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings';"
    + "if($p.ProxyEnable -eq 1){$p.ProxyServer}";
  const server = spawnSync("powershell", ["-NoProfile", "-Command", script], {
    encoding: "utf8",
    windowsHide: true,
  }).stdout?.trim() ?? "";

  if (!server) {
    const found = COMMON_PROXY_PORTS.find(portBusy);
    return found ? `http://127.0.0.1:${found}` : "";
  }
  const https = /https=([^;]+)/i.exec(server)?.[1];
  const plain = /^[^;=]+$/.test(server) ? server : "";
  const address = (https || plain).trim();
  if (!address || !portBusy(Number(address.split(":").pop()))) return "";
  return address.includes("://") ? address : `http://${address}`;
}

const PROXY = String(process.env.HTTPS_PROXY ?? "").trim() || systemProxy();
const COMMAND_ENV = {
  ...process.env,
  ...(PROXY ? { HTTP_PROXY: PROXY, HTTPS_PROXY: PROXY, http_proxy: PROXY, https_proxy: PROXY } : {}),
};

function capture(command, args, cwd = APP_DIR) {
  const call = commandFor(command, args);
  const result = spawnSync(call.command, call.args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
    env: COMMAND_ENV,
  });
  return result.status === 0 ? String(result.stdout ?? "") : "";
}

function captureDetailed(command, args, cwd = APP_DIR) {
  const call = commandFor(command, args);
  const result = spawnSync(call.command, call.args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
    env: COMMAND_ENV,
  });
  return {
    ok: result.status === 0,
    error: String(result.stderr || result.error?.message || "").trim().split(/\r?\n/).at(-1) || "未知错误",
  };
}

function run(command, args, cwd = APP_DIR) {
  const call = commandFor(command, args);
  const child = spawn(call.command, call.args, { cwd, stdio: "inherit", env: COMMAND_ENV });
  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} 退出码 ${code}`)));
  });
}

function checkNode(mode) {
  const [major, minor] = process.versions.node.split(".").map(Number);
  const required = mode === "interview" ? [22, 19] : [20, 19];
  if (major < required[0] || (major === required[0] && minor < required[1])) {
    throw new Error(`Node 版本过低（当前 v${process.versions.node}），${mode === "interview" ? "面试台" : "博客"}需要 ${required.join(".")}+`);
  }
  return `Node v${process.versions.node}`;
}

function sshUrlOf(url) {
  const match = /^https?:\/\/([^/]+)\/(.+?)(?:\.git)?$/i.exec(String(url ?? "").trim());
  return match ? `git@${match[1]}:${match[2]}.git` : "";
}

function httpsUrlOf(url) {
  const match = /^git@([^:]+):(.+)$/.exec(String(url ?? "").trim());
  return match ? `https://${match[1]}/${match[2]}` : "";
}

function hasSshKey() {
  try {
    return fs.readdirSync(path.join(os.homedir(), ".ssh"))
      .some((name) => /^id_(rsa|ed25519|ecdsa)$/.test(name));
  } catch {
    return false;
  }
}

/**
 * 拉取参数。
 *
 * `--depth=1` **只给浅仓库用**，实测依据：
 * - 浅仓库 + 不带 --depth 的普通 fetch：虽然还是浅的，但克隆点之后每来一个新提交本地就多留一条
 *   （1→2→3→4→5…），慢慢长回一份完整历史；
 * - 全量仓库 + `--depth=1`：**会把它变成浅仓库**，`git rev-list --count` 从 3 直接变 1，
 *   开发者机上的历史视图就没了。所以这里必须先问一句是不是浅的。
 */
export function fetchArgs({ transport, url, shallow = false }) {
  const common = ["fetch", ...(shallow ? ["--depth=1"] : []), url, "main"];
  return transport === "SSH"
    ? ["-c", "core.sshCommand=ssh -o BatchMode=yes -o ConnectTimeout=5", ...common]
    : ["-c", "http.sslBackend=openssl", ...common];
}

/** SSH 可用时优先；失败后立即回退 HTTPS，不额外等待。 */
function tryFetch(appDir) {
  const origin = capture("git", ["-C", appDir, "remote", "get-url", "origin"], appDir).trim();
  const originIsSsh = /^git@/.test(origin);
  const ssh = originIsSsh ? origin : sshUrlOf(origin);
  const https = originIsSsh ? httpsUrlOf(origin) : origin;
  const attempts = [];
  // 取不到就当作全量（不加 --depth）——宁可少省点体积，也不能把全量仓库搞浅
  const shallow = capture("git", ["-C", appDir, "rev-parse", "--is-shallow-repository"], appDir).trim() === "true";

  if (ssh && hasSshKey()) {
    attempts.push({ label: "SSH", args: fetchArgs({ transport: "SSH", url: ssh, shallow }) });
  }
  if (https) {
    attempts.push({ label: "HTTPS", args: fetchArgs({ transport: "HTTPS", url: https, shallow }) });
  }

  for (const attempt of attempts) {
    log(`      使用 ${attempt.label} 检查远程更新...`);
    const result = captureDetailed("git", ["-C", appDir, ...attempt.args], appDir);
    if (result.ok) return { ok: true, transport: attempt.label };
    log(`      ${attempt.label} 失败：${result.error.slice(0, 160)}`);
  }
  return { ok: false, transport: "" };
}

function fileHash(file) {
  if (!fs.existsSync(file)) return "";
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function backupLocalChanges(appDir, baseline) {
  const diff = capture("git", ["-C", appDir, "diff", "--binary", baseline, "--", ...SYNC_PATHS], appDir);
  if (!diff.trim()) return "";
  const backupDir = path.join(STATE_DIR, "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(backupDir, `${stamp}.patch`);
  fs.writeFileSync(file, diff, "utf8");
  return file;
}

async function ensureUpToDate({ appDir }) {
  const git = (...args) => capture("git", ["-C", appDir, ...args], appDir).trim();
  if (!git("rev-parse", "--git-dir")) return { detail: "不是 Git 仓库，跳过更新", changed: false };

  const fetched = tryFetch(appDir);
  if (!fetched.ok) return { detail: "远程不可用，使用当前版本", changed: false };
  const remote = git("rev-parse", "FETCH_HEAD");
  if (!remote) return { detail: "未取得远程版本，使用当前版本", changed: false };

  const state = readJson(STATE_FILE);
  if (remote === state.syncedSha) return { detail: `已是最新（${fetched.transport}）`, changed: false, remote };

  const before = fileHash(path.join(appDir, "launcher", "bootstrap.mjs"));
  const baselineExists = state.syncedSha
    && captureDetailed("git", ["-C", appDir, "cat-file", "-e", `${state.syncedSha}^{commit}`], appDir).ok;
  const baseline = baselineExists ? state.syncedSha : "HEAD";
  const backup = backupLocalChanges(appDir, baseline);
  if (backup) log(`      功能目录的本地差异已备份到 ${backup}`);

  await run("git", ["-C", appDir, "restore", `--source=${remote}`, "--worktree", "--no-overlay", "--", ...SYNC_PATHS], appDir);
  writeState({ syncedSha: remote, syncedAt: new Date().toISOString() });
  const bootstrapChanged = before !== fileHash(path.join(appDir, "launcher", "bootstrap.mjs"));
  return { detail: `已通过 ${fetched.transport} 更新功能代码`, changed: true, bootstrapChanged, remote };
}

function dependencyFingerprint(dir) {
  const lock = path.join(dir, "package-lock.json");
  return crypto.createHash("sha256").update(fs.existsSync(lock) ? fs.readFileSync(lock) : Buffer.from("missing")).digest("hex");
}

async function ensureDependencies(mode, appDir) {
  const dir = mode === "interview" ? path.join(appDir, "interview") : appDir;
  const stateKey = `${mode}DepsFingerprint`;
  const fingerprint = dependencyFingerprint(dir);
  const installed = fs.existsSync(path.join(dir, "node_modules"));
  const recorded = readJson(STATE_FILE)[stateKey];

  if (installed && recorded === fingerprint) return "已安装";

  log(`      安装${mode === "interview" ? "面试台" : "博客"}依赖...`);
  // 用 npm ci 而不是 npm install，两个理由：
  //
  // 1) install 是按「本机实际装出来的树」回写 package-lock.json 的，会把平台兜底包
  //    （sass-embedded-*-unknown，本机和 CI 都装不上）够不到的 sass 剪掉；
  //    而远程部署跑的正是 npm ci，它按 lockfile 里的**完整依赖图**校验，缺这条就
  //    EUSAGE 直接失败。本地跑一次安装就把远程弄挂，就是这么来的。
  //    ci 只按 lockfile 装、从不回写——本地和远程从此是同一条命令。
  // 2) package.json 和 lockfile 对不上时，它会**当场报错**，不用等推送后远程才发现。
  //
  // 代价是每次都会清空 node_modules 重装；靠上面那句「已装且指纹没变就跳过」兜着，
  // 只有依赖真的变了时才会走到这儿——那时本来也该重装。没有 lockfile 时只能退回 install。
  const command = fs.existsSync(path.join(dir, "package-lock.json")) ? "ci" : "install";
  try {
    await run("npm", [command, "--no-audit", "--no-fund"], dir);
  } catch {
    log("      默认 npm 源失败，切换镜像重试...");
    await run("npm", [command, "--no-audit", "--no-fund", "--registry=https://registry.npmmirror.com"], dir);
  }
  writeState({ [stateKey]: dependencyFingerprint(dir) });
  return "安装完成";
}

function copyMissing(from, to) {
  let count = 0;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) count += copyMissing(source, target);
    else if (!fs.existsSync(target)) {
      fs.copyFileSync(source, target);
      count += 1;
    }
  }
  return count;
}

function ensurePrivate({ appDir, seedDir }) {
  const privateRoot = path.join(appDir, "src", "private");
  const skeleton = ["resume", path.join("hires", "个人简介", "面试经验"), path.join("series", "答题历史")];
  let created = 0;
  for (const relative of skeleton) {
    const directory = path.join(privateRoot, relative);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      created += 1;
    }
  }
  const seedPrivate = path.join(seedDir, "private");
  const copied = fs.existsSync(seedPrivate) ? copyMissing(seedPrivate, privateRoot) : 0;
  return `个人目录已就绪${copied ? `，从 seed 导入 ${copied} 个文件` : ""}${created ? `，新建 ${created} 个目录` : ""}`;
}

function envEntries(content) {
  const entries = new Map();
  for (const line of content.split(/\r?\n/)) {
    if (/^\s*#/.test(line)) continue;
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (match) entries.set(match[1], { line, value: match[2].trim() });
  }
  return entries;
}

function mergeEnvContent(targetContent, seedContent) {
  let content = targetContent;
  let imported = 0;
  const target = envEntries(content);
  for (const [key, seed] of envEntries(seedContent)) {
    if (!seed.value || (target.has(key) && target.get(key).value)) continue;
    if (target.has(key)) {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      content = content.replace(new RegExp(`^\\s*${escaped}=.*$`, "m"), seed.line);
    } else {
      content = `${content.trimEnd()}${content.trim() ? "\n" : ""}${seed.line}\n`;
    }
    target.set(key, seed);
    imported += 1;
  }
  return { content, imported };
}

function initializeEnv({ appDir, seedDir }) {
  const envFile = path.join(appDir, "interview", ".env");
  const example = path.join(appDir, "interview", ".env.example");
  if (!fs.existsSync(envFile)) fs.copyFileSync(example, envFile);

  const seedEnv = path.join(seedDir, "interview", ".env");
  if (!fs.existsSync(seedEnv)) return { envFile, imported: 0 };
  const merged = mergeEnvContent(fs.readFileSync(envFile, "utf8"), fs.readFileSync(seedEnv, "utf8"));
  if (merged.imported) fs.writeFileSync(envFile, merged.content, "utf8");
  return { envFile, imported: merged.imported };
}

function askSecret(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    let buffer = "";
    const finish = (value) => {
      stdin.setRawMode?.(false);
      stdin.pause();
      stdin.off("data", onData);
      process.stdout.write("\n");
      resolve(value);
    };
    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\r" || char === "\n") return finish(buffer.trim());
        if (char === "\u0003") return finish("");
        if (char === "\u007f" || char === "\b") buffer = buffer.slice(0, -1);
        else buffer += char;
      }
    };
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

async function ensureInterviewKey(envFile) {
  let content = fs.readFileSync(envFile, "utf8");
  if (/^INTERVIEW_CHAT_API_KEY=\S+/m.test(content)) return "模型配置已就绪";
  if (!process.stdin.isTTY) return "未配置模型密钥（非交互环境，已跳过询问）";

  const key = await askSecret("      请输入对话模型 API Key（输入不回显，直接回车可跳过）：");
  if (!key) return "未配置模型密钥，AI 出题功能暂不可用";
  content = /^INTERVIEW_CHAT_API_KEY=/m.test(content)
    ? content.replace(/^INTERVIEW_CHAT_API_KEY=.*$/m, `INTERVIEW_CHAT_API_KEY=${key}`)
    : `${content.trimEnd()}\nINTERVIEW_CHAT_API_KEY=${key}\n`;
  fs.writeFileSync(envFile, content, "utf8");
  return "模型密钥已写入本机 interview/.env";
}

async function waitForHttp(url, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ready = await new Promise((resolve) => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve(response.statusCode < 500);
      });
      request.on("error", () => resolve(false));
      request.setTimeout(2_000, () => { request.destroy(); resolve(false); });
    });
    if (ready) return true;
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  return false;
}

const children = [];

function startChild(title, command, args, cwd) {
  const call = commandFor(command, args);
  const child = spawn(call.command, call.args, { cwd, stdio: "inherit", env: COMMAND_ENV });
  children.push(child);
  child.on("error", (error) => log(`      ${title}启动失败：${error.message}`));
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) log(`      ${title}已退出（退出码 ${code}）`);
  });
}

async function startMode(mode, appDir) {
  const interviewDir = path.join(appDir, "interview");
  if (mode === "interview") {
    const apiBusy = portBusy(INTERVIEW_API_PORT);
    const webBusy = portBusy(INTERVIEW_WEB_PORT);
    if (apiBusy !== webBusy) throw new Error("面试台只有一个端口被占用，请先关闭占用 8890 或 5174 的进程");
    if (!apiBusy) startChild("面试台", "npm", ["run", "dev"], interviewDir);
    else log("      面试台端口已在运行，复用现有服务");
    return { url: `http://127.0.0.1:${INTERVIEW_WEB_PORT}/`, label: "面试台" };
  }

  if (!portBusy(BLOG_PORT)) startChild("博客", "npm", ["run", "docs:dev"], appDir);
  else log("      博客端口已在运行，复用现有服务");
  return { url: `http://127.0.0.1:${BLOG_PORT}/`, label: "博客" };
}

function stopAll() {
  for (const child of children) {
    if (!child.pid) continue;
    try {
      if (process.platform === "win32") execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      else child.kill("SIGTERM");
    } catch {
      // 子进程已经退出。
    }
  }
}

function openBrowser(url) {
  if (String(process.env.DESK_NO_BROWSER ?? "") === "1") return;
  try {
    if (process.platform === "win32") execFileSync("cmd.exe", ["/c", "start", "", url], { stdio: "ignore", windowsHide: true });
    else execFileSync(process.platform === "darwin" ? "open" : "xdg-open", [url], { stdio: "ignore" });
  } catch {
    log(`      自动打开浏览器失败，请手动访问 ${url}`);
  }
}

function restartWithUpdatedBootstrap(mode, remote) {
  if (process.env.DESK_BOOTSTRAP_RESTARTED === remote) return null;
  log("      启动器已更新，使用新版本继续...");
  const result = spawnSync(process.execPath, [path.join(APP_DIR, "launcher", "bootstrap.mjs"), mode], {
    cwd: APP_DIR,
    stdio: "inherit",
    env: { ...process.env, DESK_BOOTSTRAP_RESTARTED: remote },
  });
  return result.status ?? 1;
}

async function runStep(index, total, title, action) {
  process.stdout.write(`\n[${index}/${total}] ${title}\n`);
  const detail = await action();
  log(`      完成${detail ? `（${detail}）` : ""}`);
  return detail;
}

async function main(argv = process.argv.slice(2)) {
  const mode = argv[0];
  if (!new Set(["interview", "blog"]).has(mode)) {
    log("用法：node launcher/bootstrap.mjs <interview|blog>");
    return 2;
  }

  log("============================================");
  log(`  ${mode === "interview" ? "面试台" : "博客"}启动器`);
  log("============================================");
  log(`  仓库：${APP_DIR}`);
  log(`  Seed：${SEED_DIR}${fs.existsSync(SEED_DIR) ? "" : "（未提供，跳过导入）"}`);
  if (PROXY) log(`  代理：${PROXY}`);

  const total = mode === "interview" ? 6 : 5;
  try {
    await runStep(1, total, "检查运行环境", () => checkNode(mode));
    process.stdout.write(`\n[2/${total}] 检查功能更新\n`);
    const update = await ensureUpToDate({ appDir: APP_DIR });
    log(`      完成（${update.detail}）`);
    if (update.bootstrapChanged) return restartWithUpdatedBootstrap(mode, update.remote);

    await runStep(3, total, "安装依赖", () => ensureDependencies(mode, APP_DIR));
    await runStep(4, total, "导入 Seed", () => ensurePrivate({ appDir: APP_DIR, seedDir: SEED_DIR }));
    const env = initializeEnv({ appDir: APP_DIR, seedDir: SEED_DIR });
    if (env.imported) log(`      从 seed 导入 ${env.imported} 项面试台配置（配置值未写入日志）`);

    if (mode === "interview") {
      await runStep(5, total, "检查模型配置", () => ensureInterviewKey(env.envFile));
    }

    process.stdout.write(`\n[${total}/${total}] 启动热更新服务\n`);
    const service = await startMode(mode, APP_DIR);
    log("      等待服务就绪...");
    const ready = await waitForHttp(service.url);
    log(ready ? `      ${service.label}已就绪：${service.url}` : `      服务尚未响应，请稍后手动访问 ${service.url}`);
    writeState({ [`${mode}LastRun`]: new Date().toISOString(), appDir: APP_DIR, seedDir: SEED_DIR });
    openBrowser(service.url);
  } catch (error) {
    log(`\n✗ 启动失败：${error.message}`);
    log(`  详细日志：${LOG_FILE}`);
    stopAll();
    return 1;
  }

  if (!children.length) return 0;
  log("  保持此窗口开启；关闭窗口会停止本次启动的服务。");
  process.on("SIGINT", () => { stopAll(); process.exit(0); });
  process.on("SIGTERM", () => { stopAll(); process.exit(0); });
  return new Promise(() => {});
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(SELF_FILE);
if (isMain) main().then((code) => { if (typeof code === "number") process.exitCode = code; });

export {
  APP_DIR,
  SEED_DIR,
  SYNC_PATHS,
  checkNode,
  copyMissing,
  ensurePrivate,
  envEntries,
  httpsUrlOf,
  mergeEnvContent,
  sshUrlOf,
};
