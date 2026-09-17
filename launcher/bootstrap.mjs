#!/usr/bin/env node
/**
 * 面试台启动器 —— 真正的逻辑都在这里。
 *
 * ## 为什么分两层
 *
 * ```
 * interview-desk/                      ← 交付给人的文件夹（可整体拷走）
 * ├── 启动.cmd                         纯 ASCII 外壳，永不改变
 * ├── bootstrap.mjs                    薄引导层：只负责把仓库搞到手，然后交给下面这份
 * └── app/                              仓库（git clone 来的）
 *     └── launcher/bootstrap.mjs        ← 本文件，随 git 更新
 * ```
 *
 * 逻辑放在仓库里，是为了**它自己也能被更新**：改了启动器行为，别人的机器下次
 * 重新执行就能拿到。外壳那份只做"找仓库 / 克隆仓库"，稳定到基本不用改。
 *
 * ## 约定
 *
 * - **所有中文提示都在这个文件里**：外面的 `启动.cmd` 保持纯 ASCII——cmd 默认 GBK
 *   代码页，批处理里写中文要么乱码、要么得配 chcp + 存盘编码，怎么弄都是坑。
 * - **每一步都幂等**：已经做过的跳过，重复双击不会重复干活。
 * - 路径都从 `DESK_HOME`（启动器所在文件夹）推，不写死本机路径。
 */

import { execFileSync, spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const SELF_DIR = path.dirname(fileURLToPath(import.meta.url));
/** 启动器文件夹（放 启动.cmd 的地方）：日志和状态跟它走，不跟仓库走 */
const HOME = path.resolve(process.env.DESK_HOME || path.dirname(SELF_DIR));
const STATE_DIR = path.join(HOME, ".launcher");
const STATE_FILE = path.join(STATE_DIR, "state.json");
const LOG_FILE = path.join(STATE_DIR, "launcher.log");

// 这个目录必须先建出来：log() 从第一步就开始往里写，否则中间所有日志都会因为
// 目录不存在被 catch 静默吞掉，失败时那句"详细日志见 …"就成了一句空话。
fs.mkdirSync(STATE_DIR, { recursive: true });

/** Node 至少要到这个版本：node:sqlite 需要 22.5+ */
const MIN_NODE_MAJOR = 22;
const MIN_NODE_MINOR = 5;

const INTERVIEW_PORT = 8890;   // 后端 API（也是 dist 静态站）
const VITE_PORT = 5174;        // 面试台前端热更新
const BLOG_PORT = 8888;        // 博客

// ---------------------------------------------------------------- 基础设施

function log(message = "") {
  const line = String(message);
  process.stdout.write(`${line}\n`);
  try {
    fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${line}\n`, "utf8");
  } catch {
    /* 日志写不进去不该让启动失败 */
  }
}

function step(index, total, title) {
  process.stdout.write(`\n[${index}/${total}] ${title}\n`);
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
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(next, null, 2), "utf8");
}

/** 端口上有东西在监听吗（用来看代理是不是真的开着） */
function portListening(port) {
  const netstat = spawnSync("netstat", ["-ano", "-p", "TCP"], { encoding: "utf8", windowsHide: true }).stdout ?? "";
  return netstat.includes(`:${port} `);
}

/** 常见代理工具的默认混合端口：注册表读不到时的兜底 */
const COMMON_PROXY_PORTS = [7890, 7897, 7891, 10809, 1080];

/**
 * 把 Windows 的系统代理读出来，喂给 git 和 npm。
 *
 * 它们**都不读** Windows 的代理设置（那个只有浏览器读）✗ 于是现象是
 * 「浏览器能开 GitHub，git fetch 却报 Failed to connect to github.com:443」✗
 * 用户明明开着 Clash，只是 git 不知道 ✓ 这里替它知道 ✓ 用户不用配任何东西 ✓
 *
 * 只在"代理端口真的在监听"时才用：注册表里常留着已经关掉的代理 ✓ 照搬会把
 * 本来能直连的网络弄坏 ✗
 */
function systemProxy() {
  if (process.platform !== "win32") return "";
  const query = "Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings' | "
    + "Select-Object -ExpandProperty ProxyServer -ErrorAction SilentlyContinue";
  const server = spawnSync("powershell", ["-NoProfile", "-Command",
    `if ((Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings').ProxyEnable -eq 1) { ${query} }`,
  ], { encoding: "utf8", windowsHide: true }).stdout?.trim() ?? "";

  if (!server) {
    const found = COMMON_PROXY_PORTS.find(portListening);
    return found ? `http://127.0.0.1:${found}` : "";
  }
  const https = /https=([^;]+)/i.exec(server)?.[1];
  const plain = /^[^;=]+$/.test(server) ? server : "";
  const address = (https || plain).trim();
  if (!address || !portListening(Number(address.split(":").pop()))) return "";
  return address.includes("://") ? address : `http://${address}`;
}

/** git / npm 都要走这个（外壳也会传一份下来，两个来源取其一） */
const PROXY = String(process.env.HTTPS_PROXY ?? "").trim() || systemProxy();
const PROXY_ENV = PROXY
  ? { HTTP_PROXY: PROXY, HTTPS_PROXY: PROXY, http_proxy: PROXY, https_proxy: PROXY }
  : {};

/**
 * 哪些命令必须经过 cmd。
 *
 * Windows 上 npm/npx 是 .cmd，Node 从 20 起禁止不经 shell 直接 spawn .cmd（安全修复），
 * 所以这两个必须走 shell；**其余一律不走**——走 shell 时 Node 只把命令与参数
 * **拼接**、不加引号（它自己会发 DeprecationWarning 提醒这点），路径里一旦有空格
 * 就被 cmd 从空格处劈开：实测 node 装在 `C:\Program Files\` 时报
 * 「'C:\Program' 不是内部或外部命令」，两个服务直接起不来。
 */
const needsCmd = (command) => process.platform === "win32" && /^(npm|npx)$/i.test(path.basename(command));

/**
 * 需要经 cmd 的命令，显式换成 `cmd.exe /c npm …`。
 *
 * 不用 `shell: true`：那会让 Node 自己把命令和参数拼成一个字符串（还会发
 * DeprecationWarning 提醒参数没被转义），路径里有空格就被劈开。显式起 cmd.exe 更清楚，
 * 参数仍按 argv 传递——唯一要守的规矩是**参数里不能有带空格的路径**（我们这些都没有）。
 */
function commandFor(command, args) {
  if (needsCmd(command)) {
    const risky = args.find((arg) => /\s/.test(arg));
    if (risky) throw new Error(`参数含空格，经过 cmd 会被劈开，请改调用方式：${risky}`);
    return { command: "cmd.exe", args: ["/c", command, ...args], shell: false };
  }
  return { command, args, shell: false };
}

/** 跑一条命令并把输出透到控制台（npm / git 的进度条才有意义） */
function run(command, args, cwd) {
  const call = commandFor(command, args);
  const child = spawn(call.command, call.args, { cwd, stdio: "inherit", shell: call.shell, env: { ...process.env, ...PROXY_ENV } });
  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} 退出码 ${code}`))));
  });
}

/** 跑一条命令、只要输出（用于 git 查询这类不该刷屏的调用）；失败返回空串 */
function capture(command, args, cwd) {
  const call = commandFor(command, args);
  const result = spawnSync(call.command, call.args, { cwd, encoding: "utf8", windowsHide: true, shell: call.shell, env: { ...process.env, ...PROXY_ENV } });
  return result.status === 0 ? String(result.stdout ?? "") : "";
}

function portBusy(port) {
  try {
    // Windows 上用 netstat 比开 socket 探测更可靠（不会踩到 TIME_WAIT）
    const out = execFileSync("netstat", ["-ano", "-p", "TCP"], { encoding: "utf8", windowsHide: true });
    return out.split("\n").some((line) => line.includes("LISTENING") && line.includes(`:${port} `));
  } catch {
    return false;
  }
}

async function waitForHttp(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve(response.statusCode < 500);
      });
      request.on("error", () => resolve(false));
      request.setTimeout(2000, () => { request.destroy(); resolve(false); });
    });
    if (ok) return true;
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  return false;
}

/** 目录里最新的修改时间（用于判断产物是不是比源码旧）；不存在返回 0 */
function newestMtime(target) {
  let newest = 0;
  const visit = (entry) => {
    let stat;
    try {
      stat = fs.statSync(entry);
    } catch {
      return;
    }
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(entry)) visit(path.join(entry, name));
    } else {
      newest = Math.max(newest, stat.mtimeMs);
    }
  };
  visit(target);
  return newest;
}

// ---------------------------------------------------------------- 各步骤

function checkNode() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < MIN_NODE_MAJOR || (major === MIN_NODE_MAJOR && minor < MIN_NODE_MINOR)) {
    throw new Error(`Node 版本过低（当前 v${process.versions.node}），需要 ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}+`);
  }
  return `Node v${process.versions.node}`;
}

/**
 * 更新只覆盖这些路径：**功能代码和启动器脚本**。
 *
 * 为什么不整棵树一起更新（原来用 `git reset --hard`）：`src/` 下是博客内容，
 * 那是使用者自己的东西——他改过的、删掉的都应该留着，不该被远端版本按回去。
 * 而 `interview/` 和 `launcher/` 是功能代码，没人会在里面写自己的文档，尽管对齐。
 */
const SYNC_PATHS = ["interview", "launcher"];

/**
 * 拉取最新代码。这是"重新执行就拿到最新"的实现处。
 *
 * 三条判断都是为了不把别人的东西弄丢、也不卡住启动：
 * - 只在**要更新的那几个目录**有本地改动时才跳过（博客那边的改动不该拦住更新）
 * - 连不上远端 → 用当前版本启动（离线照常能跑，而不是报错干等）
 * - 已经同步过的提交 → 什么都不做
 */


async function ensureUpToDate({ appDir }) {
  const git = (...args) => capture("git", ["-C", appDir, ...args]);

  if (!git("rev-parse", "--git-dir")) return "不是 git 仓库，跳过";

  // --depth 1：这是个部署副本，不需要完整历史，拉得快也更省
  if (!capture("git", ["-C", appDir, "fetch", "--depth", "1", "origin", "main"])) {
    // 走代理时 Windows 原生 TLS（schannel）有已知的握手问题：
    // 「schannel: failed to receive handshake, SSL/TLS connection」。
    // git 自带两个后端，换 openssl 再试一次就能过——别让人自己去查这个。
    if (!capture("git", ["-C", appDir, "-c", "http.sslBackend=openssl", "fetch", "--depth", "1", "origin", "main"])) {
      return "连不上远端，用当前版本启动";
    }
  }
  const remote = git("rev-parse", "FETCH_HEAD").trim();
  if (!remote) return "连不上远端，用当前版本启动";

  // 用状态文件记"上次同步到哪个提交"，而不是拿 HEAD 比：
  // 我们只对齐部分路径，HEAD 会一直停在旧提交上，比它永远算出"有更新"。
  if (remote === String(readJson(STATE_FILE).syncedSha ?? "")) return "已是最新";

  // 只在**要更新的那些路径**上有本地改动时才跳过——博客那边的改动不该拦住更新。
  const dirty = git("status", "--porcelain", "--", ...SYNC_PATHS).trim();
  if (dirty) return `${SYNC_PATHS.join(" / ")} 有本地改动，跳过更新`;

  // 只把这些路径换成远端版本；其余（src/ 下的博客内容、私人目录）一律不动
  await run("git", ["-C", appDir, "checkout", remote, "--", ...SYNC_PATHS], appDir);
  writeState({ syncedSha: remote });
  return "已更新到最新";
}

/** package-lock 的指纹：变了才说明依赖真的需要重装 */
function lockFingerprint(appDir) {
  const hash = crypto.createHash("sha1");
  for (const lock of [path.join(appDir, "package-lock.json"), path.join(appDir, "interview", "package-lock.json")]) {
    hash.update(fs.existsSync(lock) ? fs.readFileSync(lock) : Buffer.from("(无)"));
  }
  return hash.digest("hex");
}

/**
 * 依赖：node_modules 在、且 package-lock 没变就跳过。
 * 只看"装没装过"是不够的——更新完代码常常带着新的依赖，那时必须重装。
 */
async function ensureDeps({ appDir }) {
  const targets = [
    { dir: appDir, label: "博客" },
    { dir: path.join(appDir, "interview"), label: "面试台" },
  ];
  const fingerprint = lockFingerprint(appDir);
  const recorded = readJson(STATE_FILE).depsFingerprint;
  const missing = targets.filter((target) => !fs.existsSync(path.join(target.dir, "node_modules")));

  // 都装好了、只是没记过指纹（第一次跑，或清过 .launcher）：把现状记下就走。
  // 否则会在已经装好的开发机上白跑一次 npm install——实测那次把博客依赖动了
  // （added 75 packages, removed 2 packages），一个谁都没料到的副作用。
  if (!missing.length && !recorded) {
    writeState({ depsFingerprint: fingerprint });
    return "已安装（首次记录依赖状态）";
  }
  if (!missing.length && fingerprint === recorded) return "已安装";

  for (const target of targets) {
    log(`      安装${target.label}依赖${missing.length ? "" : "（依赖清单有更新）"}...`);
    try {
      await run("npm", ["install", "--no-audit", "--no-fund"], target.dir);
    } catch {
      // 国内直连 registry.npmjs.org 常常慢到超时。换国内镜像再试一次，
      // 比让人对着 ETIMEDOUT 干等强——这一步是她那边唯一还需要联网的地方。
      log(`      直连 npm 源失败，换国内镜像重试...`);
      await run("npm", ["install", "--no-audit", "--no-fund", "--registry=https://registry.npmmirror.com"], target.dir);
    }
  }
  writeState({ depsFingerprint: fingerprint });
  return "安装完成";
}

/**
 * 面试台前端产物：8890 直接服务 dist。
 *
 * 判据是**产物是不是比源码旧**，而不是"产物在不在"——不然更新完代码界面还是旧的，
 * 这种"代码更新了但界面没变"最难排查。
 */
async function ensureBuild({ appDir }) {
  const interview = path.join(appDir, "interview");
  const out = path.join(interview, "dist", "index.html");
  const sources = ["src", "index.html", "package.json", "vite.config.ts"].map((name) => path.join(interview, name));
  if (fs.existsSync(out) && newestMtime(out) >= Math.max(...sources.map(newestMtime))) return "已构建";

  log("      构建面试台前端...");
  await run("npm", ["run", "build"], interview);
  return "构建完成";
}

/**
 * 私有目录：只建**空骨架**，再把 seed\ 里的东西原样拷进去。
 * 已存在的文件一律不覆盖——那可能是人家自己写的内容。
 */
function ensurePrivate({ appDir, seedDir }) {
  const privateRoot = path.join(appDir, "src", "private");
  const skeleton = [
    path.join("resume"),
    path.join("hires", "个人简介", "面试经验"),
    path.join("series", "答题历史"),
  ];
  let created = 0;
  for (const rel of skeleton) {
    const dir = path.join(privateRoot, rel);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      created += 1;
    }
  }

  // seed\private\ 下的内容按原样合并进来（这是使用者自己的资料，随启动器一起带过来）
  let copied = 0;
  const seedPrivate = path.join(seedDir, "private");
  if (fs.existsSync(seedPrivate)) copied = copyMissing(seedPrivate, privateRoot);

  if (!created && !copied) return "已存在";
  return `新建 ${created} 个目录${copied ? `，导入 ${copied} 个文件` : ""}`;
}

/** 递归复制，但**只补不覆盖**：目标已存在的文件跳过 */
function copyMissing(from, to) {
  let count = 0;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) count += copyMissing(src, dst);
    else if (!fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
      count += 1;
    }
  }
  return count;
}

/** 配置文件：没有就从模板生成，缺密钥就当场问（输入不回显、不写进日志） */
async function ensureEnv({ appDir }) {
  const interview = path.join(appDir, "interview");
  const envFile = path.join(interview, ".env");
  if (!fs.existsSync(envFile)) {
    const example = path.join(interview, ".env.example");
    if (fs.existsSync(example)) fs.copyFileSync(example, envFile);
    else fs.writeFileSync(envFile, "", "utf8");
  }
  const content = fs.readFileSync(envFile, "utf8");
  if (/^INTERVIEW_CHAT_API_KEY=\S+/m.test(content)) return "已配置";
  if (!process.stdin.isTTY) return "跳过（非交互环境，没法问密钥）";

  const key = await askSecret("      请输入对话模型的 API Key（粘贴后回车，不会显示）：");
  if (!key) return "跳过（没有密钥，出题功能不可用）";
  const next = /^INTERVIEW_CHAT_API_KEY=/m.test(content)
    ? content.replace(/^INTERVIEW_CHAT_API_KEY=.*$/m, `INTERVIEW_CHAT_API_KEY=${key}`)
    : `${content.trimEnd()}\nINTERVIEW_CHAT_API_KEY=${key}\n`;
  fs.writeFileSync(envFile, next, "utf8");
  return "已写入（保存在本机 .env，不会上传）";
}

/**
 * 问一个不回显的输入——密钥不能出现在屏幕上，也不能进日志。
 *
 * 用 stdin 的**原始模式**：它本就不回显，不用去擦 readline 已经打出来的字符
 * （那样每按一键都要重画提示，界面会花）。顺带处理退格和 Ctrl+C。
 */
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
        if (char === "\u0003") return finish("");                    // Ctrl+C：当作放弃
        if (char === "\u007f" || char === "\b") buffer = buffer.slice(0, -1);
        else buffer += char;
      }
    };
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

// ---------------------------------------------------------------- 起服务

const children = [];

function startService({ title, command, args, cwd, port, url }) {
  if (portBusy(port)) {
    log(`      ${title}：${port} 端口已在运行，跳过启动（复用现有的）`);
    return;
  }
  // node 直接起（它的路径可能含空格，走 shell 会被劈开）；npm 换成 cmd.exe /c
  const call = commandFor(command, args);
  const child = spawn(call.command, call.args, { cwd, stdio: "inherit", shell: call.shell, env: { ...process.env, ...PROXY_ENV } });
  children.push({ child, title });
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) log(`      ${title} 退出了（退出码 ${code}）`);
  });
  log(`      ${title}：已启动（${url}）`);
}

function stopAll() {
  for (const { child } of children) {
    if (!child.pid) continue;
    try {
      // Windows 上必须连子进程树一起杀，否则 npm 会留下孤儿进程占着端口
      if (process.platform === "win32") execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      else child.kill("SIGTERM");
    } catch {
      /* 已经退出了就算了 */
    }
  }
}

async function startAll({ appDir }) {
  const node = process.execPath;
  startService({
    title: "面试台接口",
    command: node,
    args: ["server/server.mjs"],
    cwd: path.join(appDir, "interview"),
    port: INTERVIEW_PORT,
    url: `http://127.0.0.1:${INTERVIEW_PORT}`,
  });
  startService({
    title: "面试台界面",
    command: node,
    args: [path.join(appDir, "interview", "node_modules", "vite", "bin", "vite.js")],
    cwd: path.join(appDir, "interview"),
    port: VITE_PORT,
    url: `http://127.0.0.1:${VITE_PORT}`,
  });
  startService({
    title: "博客",
    command: "npm",
    args: ["run", "docs:dev"],
    cwd: appDir,
    port: BLOG_PORT,
    url: `http://127.0.0.1:${BLOG_PORT}`,
  });

  log(`\n      等待服务就绪...`);
  if (!(await waitForHttp(`http://127.0.0.1:${VITE_PORT}/`, 180_000))) {
    log(`      ⚠ 前端还没起来。VuePress 首次启动要预构建缓存，可能要等一两分钟——`);
    log(`        浏览器如果打不开，稍等片刻手动刷新即可。`);
  }
}

/** 打开浏览器；设 DESK_NO_BROWSER=1 可跳过（不想被打断时用） */
function openBrowser(url) {
  if (String(process.env.DESK_NO_BROWSER ?? "").trim() === "1") return;
  try {
    // 写全 cmd.exe：execFileSync 不走 shell，光写 cmd 在 Windows 上解析不到
    if (process.platform === "win32") execFileSync("cmd.exe", ["/c", "start", "", url], { stdio: "ignore", windowsHide: true });
    else execFileSync(process.platform === "darwin" ? "open" : "xdg-open", [url], { stdio: "ignore" });
  } catch {
    log(`      （自动打开浏览器失败，手动访问 ${url}）`);
  }
}

// ---------------------------------------------------------------- 主流程

async function main() {
  log("============================================");
  log("  面试台 启动器");
  log("============================================");

  const appDir = path.resolve(process.env.DESK_APP_DIR || path.join(HOME, "app"));
  const seedDir = path.resolve(process.env.DESK_SEED_DIR || path.join(HOME, "seed"));
  const settings = { appDir, seedDir };
  if (PROXY) log(`  系统代理 ${PROXY}（git/npm 会走它）`);

  const steps = [
    ["检查运行环境", () => checkNode()],
    ["检查更新", () => ensureUpToDate(settings)],
    ["安装依赖", () => ensureDeps(settings)],
    ["构建面试台", () => ensureBuild(settings)],
    // ensurePrivate 是同步的；await 一个普通值也能正常工作，不必包 Promise
    ["初始化个人目录", () => ensurePrivate(settings)],
    ["配置模型密钥", () => ensureEnv(settings)],
  ];

  for (const [index, [title, action]] of steps.entries()) {
    step(index + 1, steps.length + 1, title);
    try {
      const detail = await action();
      log(`      完成${detail ? `（${detail}）` : ""}`);
    } catch (error) {
      log(`\n✗ 卡在「${title}」：${error.message}`);
      log(`  详细日志：${LOG_FILE}`);
      log(`  常见原因：网络/代理不通、磁盘空间不足、目录被占用。`);
      return 1;
    }
  }

  step(steps.length + 1, steps.length + 1, "启动服务");
  await startAll(settings);

  writeState({ lastRun: new Date().toISOString(), appDir });

  log("");
  log("============================================");
  log(`  面试台  http://127.0.0.1:${VITE_PORT}`);
  log(`  博客    http://127.0.0.1:${BLOG_PORT}`);
  log("============================================");
  log("  这个窗口不要关，关掉服务就停了。");
  openBrowser(`http://127.0.0.1:${VITE_PORT}/`);

  process.on("SIGINT", () => { stopAll(); process.exit(0); });
  return new Promise(() => {});   // 挂着不退，等服务自然结束
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main().then((code) => { if (typeof code === "number") process.exit(code); });
}

export { checkNode, copyMissing, ensurePrivate, ensureUpToDate, lockFingerprint, newestMtime, portBusy, SYNC_PATHS };
