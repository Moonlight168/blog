#!/usr/bin/env node
/**
 * 面试台启动器 —— 外壳层（薄引导）
 *
 * ## 它为什么这么薄
 *
 * 真正的逻辑在**仓库里**：`app/launcher/bootstrap.mjs`，随 git 更新。
 * 这一份只做四件**在拿到仓库之前就得有**的事：
 *
 *   1. 定位仓库；没有就（带上系统代理）克隆一份
 *   2. 有仓库时，**直接把控制权交给仓库那份**——日常逻辑不在这里
 *   3. 拿仓库里的正本覆盖自己（见 selfUpdate），于是"发新外壳"只需要发一次
 *   4. 启动失败时别让窗口一闪而过（退出码透传给 启动.cmd，它负责 pause）
 *
 * 换来的好处：外壳极小、基本不用改 ✓ 一旦有仓库，干活的全是能自动更新的那份 ✓
 *
 * ```
 * interview-desk/                      ← 交付给人的文件夹（可整体拷走）
 * ├── 启动.cmd                         纯 ASCII 外壳，双击入口
 * ├── bootstrap.mjs                    ← 本文件：找/克隆仓库，然后交给仓库里那份
 * └── app/                              仓库
 *     └── launcher/bootstrap.mjs        真正的启动逻辑
 * ```
 *
 * 注意：这里只做「没有仓库就克隆」。**更新**是仓库里那份的事——它每次执行都会
 * 检查远端有没有新提交，所以"重新执行就拿到最新"。
 *
 * ## ⚠ 改了本文件，要同步更新仓库里的 `launcher/shell.mjs`
 *
 * 仓库里那份是**正本**：外壳每次启动都会拿它跟自己比，不一样就就地覆盖（下次启动生效）。
 * 所以改了这份而忘了同步正本 → 别人那边永远拿不到新外壳；改了正本而没发新外壳 →
 * 已经发出去的那些也追不上。**两份要一起改、一起提交。**
 *
 * 文件名可以随便改，但 `启动.cmd` 是照着这个名字调的。
 */

import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SELF_DIR = path.dirname(fileURLToPath(import.meta.url));
const STATE_DIR = path.join(SELF_DIR, ".launcher");
const LOG_FILE = path.join(STATE_DIR, "launcher.log");
fs.mkdirSync(STATE_DIR, { recursive: true });

const REPO_URL = "https://github.com/Moonlight168/blog.git";
const REPO_LAUNCHER = path.join("launcher", "bootstrap.mjs");

function log(message = "") {
  process.stdout.write(`${String(message)}\n`);
  try {
    fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${message}\n`, "utf8");
  } catch {
    /* 日志写不进去不该让启动失败 */
  }
}

/**
 * 读出 Windows 的系统代理，注入到子进程环境里（HTTP_PROXY / HTTPS_PROXY）。
 *
 * 为什么非做不可：代理工具（Clash 这类）把代理写在 **WinINET**（注册表）里，
 * 浏览器读它、所以浏览器能开 GitHub；而 **git 和 npm 都不读它**——它们只看自己的
 * 配置或这两个环境变量。于是现象就是：
 *
 *     浏览器能开 GitHub，git clone 却报 Failed to connect to github.com:443 after 21062 ms
 *
 * 用户明明开了代理，只是 git 不知道。这里把系统代理读出来喂给它们，用户不用配任何东西。
 *
 * 只在"代理端口真的在监听"时才注入：注册表里常常留着已经关掉的代理设置，
 * 照搬过去反而会把本来能直连的网络弄坏。
 */
/** 端口上有东西在监听吗（用来看代理是不是真的开着） */
function portListening(port) {
  const netstat = spawnSync("netstat", ["-ano", "-p", "TCP"], { encoding: "utf8", windowsHide: true }).stdout ?? "";
  return netstat.includes(`:${port} `);
}

/** 常见代理工具的默认混合端口：注册表读不到时的兜底 */
const COMMON_PROXY_PORTS = [7890, 7897, 7891, 10809, 1080];

function systemProxy() {
  if (process.platform !== "win32") return "";

  // 正路：读 Windows 的系统代理设置
  const query = "Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings' | "
    + "Select-Object -ExpandProperty ProxyServer -ErrorAction SilentlyContinue";
  const server = spawnSync("powershell", ["-NoProfile", "-Command",
    `if ((Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings').ProxyEnable -eq 1) { ${query} }`,
  ], { encoding: "utf8", windowsHide: true }).stdout?.trim() ?? "";

  if (!server) {
    // 兜底：注册表没写（有些工具只开 TUN、或写法不同）。探一下常见端口，
    // 探到就用——反正只有端口真在监听才会命中，探不到就什么都不做。
    const found = COMMON_PROXY_PORTS.find(portListening);
    return found ? `http://127.0.0.1:${found}` : "";
  }

  // 可能是 "127.0.0.1:7890"，也可能是 "http=...;https=..." 这种按协议分开的写法
  const https = /https=([^;]+)/i.exec(server)?.[1];
  const plain = /^[^;=]+$/.test(server) ? server : "";
  const address = (https || plain).trim();
  if (!address) return "";

  // 只在这条代理确实活着的时候才用：注册表里常留着已经关掉的代理设置，
  // 照搬过去反而会把本来能直连的网络弄坏。
  if (!portListening(Number(address.split(":").pop()))) return "";
  return address.includes("://") ? address : `http://${address}`;
}

/** 仓库位置：环境变量 > desk.config.json > 外壳旁边的 app\ */
function resolveAppDir() {
  const configured = process.env.DESK_APP_DIR;
  if (configured) return path.resolve(configured);
  try {
    const file = JSON.parse(fs.readFileSync(path.join(SELF_DIR, "desk.config.json"), "utf8"));
    if (file.appDir) return path.resolve(file.appDir);
  } catch {
    /* 没有配置文件是正常的 */
  }
  return path.join(SELF_DIR, "app");
}

/**
 * 外壳的自我更新：仓库里存着它的**正本** `launcher/shell.mjs`，跟手头这份不一样就覆盖掉自己。
 *
 * 为什么要有这一步：外壳躺在仓库外面，git 管不到它 ✗ 而它又是"把仓库搞到手"的那一环 ✗
 * 于是每次改外壳都得手动重发一次 ✗ 有了这个，**发一次就够了**——之后它跟着仓库走。
 *
 * 覆盖的是正在运行的文件：Node 启动时已经把它整份读进内存了，所以覆盖安全 ✓
 * 但**改动下次启动才生效** ✓（这次仍按旧逻辑跑完）
 *
 * 覆盖前先把手头这份存到 `.launcher\shell.backup.mjs`：万一有人在本地改过外壳
 * 却没同步进仓库，被盖掉还能找回来（这一步是静默的，不备份就真没了）。
 */
function selfUpdate(appDir) {
  const canonical = path.join(appDir, "launcher", "shell.mjs");
  const self = fileURLToPath(import.meta.url);
  try {
    if (!fs.existsSync(canonical)) return "";
    const theirs = fs.readFileSync(canonical);
    if (theirs.length < 1024) return "";              // 明显不完整，别拿它盖掉自己能跑的版本
    const mine = fs.readFileSync(self);
    if (mine.equals(theirs)) return "";
    fs.writeFileSync(path.join(STATE_DIR, "shell.backup.mjs"), mine);
    fs.writeFileSync(self, theirs);
    return "下次启动生效";
  } catch {
    return "";                                         // 盖不动就算了，不该因此拦启动
  }
}

async function main() {
  const appDir = resolveAppDir();
  const launcher = path.join(appDir, REPO_LAUNCHER);

  // 代理要在**克隆之前**就准备好：git 和 npm 都不读 Windows 的系统代理
  // （见 systemProxy 的注释），而克隆正是这里第一次联网，漏了它就等于没修。
  const proxy = systemProxy();
  const proxyEnv = proxy
    ? { HTTP_PROXY: proxy, HTTPS_PROXY: proxy, http_proxy: proxy, https_proxy: proxy }
    : {};
  if (proxy) log(`  检测到系统代理 ${proxy}，git/npm 会走它`);

  if (!fs.existsSync(launcher)) {
    // 仓库还没有（或者是很老的版本、那时还没有 launcher 目录）
    if (fs.existsSync(path.join(appDir, ".git"))) {
      log(`✗ 仓库在 ${appDir}，但里面没有 ${REPO_LAUNCHER}`);
      log(`  这个仓库可能是旧版本。手动更新一次即可：`);
      log(`    git -C "${appDir}" pull`);
      return 1;
    }
    if (fs.existsSync(appDir) && fs.readdirSync(appDir).length) {
      log(`✗ ${appDir} 已存在且不是空的，但不是本项目的仓库。`);
      log(`  清空它，或改 desk.config.json 里的 appDir。`);
      return 1;
    }
    if (spawnSync("git", ["--version"], { stdio: "ignore", shell: false }).status !== 0) {
      log("✗ 找不到 git。需要先装 git 才能获取程序文件：https://git-scm.com/download/win");
      return 1;
    }
    log("  正在获取程序文件（约 110 MB，公开仓库免登录）...");
    const clone = spawnSync("git", ["clone", "--depth", "1", REPO_URL, appDir], {
      stdio: "inherit", shell: false, env: { ...process.env, ...proxyEnv },
    });
    if (clone.status !== 0) {
      log("✗ 克隆失败。检查网络/代理后重新双击即可。");
      return 1;
    }
  }

  // 外壳自己也跟着仓库更新（见 selfUpdate 的注释：这样"发新外壳"只需要发一次）
  const shellUpdated = selfUpdate(appDir);
  if (shellUpdated) log(`  外壳有新版，已就地更新（${shellUpdated}）`);

  // 交给仓库里那份，并**等它结束**——这里要是提前退出，启动.cmd 会立刻弹回
  // 命令行，看起来像"窗口闪了一下就没了"。把位置和代理一起传下去，
  // 免得两边各自猜路径、或者子进程里的 git fetch / npm install 又变回裸连。
  const child = spawn(process.execPath, [launcher], {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      DESK_HOME: process.env.DESK_HOME || SELF_DIR,
      DESK_APP_DIR: appDir,
      DESK_SEED_DIR: process.env.DESK_SEED_DIR || path.join(SELF_DIR, "seed"),
      ...proxyEnv,
    },
  });
  return new Promise((resolve) => {
    child.on("error", (error) => {
      log(`✗ 起不来仓库里的启动逻辑：${error.message}`);
      resolve(1);
    });
    // 退出码透传：启动失败时 启动.cmd 会 pause 住，别让窗口一闪而过
    child.on("exit", (code) => resolve(code ?? 0));
  });
}

main().then((code) => process.exit(code));
