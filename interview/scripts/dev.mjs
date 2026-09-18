import net from "node:net";
import { spawn } from "node:child_process";

import { config } from "../server/config.mjs";

/** 等后台起来的上限。超了也照样启动前端——宁可首屏报几个连不上，也不能卡着不开 */
const API_WAIT_MS = 60_000;

/** 端口有没有在监听。只探连通性、不发请求：那会儿后台可能还在跑题库索引刷新 */
function portReady(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });
    const done = (ok) => { socket.destroy(); resolve(ok); };
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
    socket.setTimeout(1_000, () => done(false));
  });
}

async function waitForApi(port) {
  const deadline = Date.now() + API_WAIT_MS;
  while (Date.now() < deadline) {
    if (await portReady(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

/*
 * 先起后台，等它真的开始监听了再起前端。
 *
 * 为什么不能同时起：server.mjs 在 listen **之前**要先跑一遍题库索引刷新（会打向量服务），
 * 这段可能要好几秒；前端先就绪的话，页面第一屏那批 /api 请求会全部打空——
 * 浏览器控制台里就是一串 ECONNREFUSED 127.0.0.1:8890。
 *
 * 端口从 config 读，不写死：.env 里改过 INTERVIEW_PORT 时这里要跟着变。
 */
const api = spawn(process.execPath, ["--watch", "server/server.mjs"], { stdio: "inherit" });
if (!await waitForApi(config.port)) {
  console.warn(`后台 ${config.port} 端口 ${API_WAIT_MS / 1000}s 内还没起来，先启动前端（首屏可能报连不上）`);
}

const commands = [
  api,
  spawn(process.execPath, ["node_modules/vite/bin/vite.js"], { stdio: "inherit" }),
];
function stop() { commands.forEach((child) => child.kill()); process.exit(); }
process.on("SIGINT", stop); process.on("SIGTERM", stop);
