import { spawn } from "node:child_process";

const commands = [
  spawn(process.execPath, ["--watch", "server/server.mjs"], { stdio: "inherit" }),
  spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["exec", "vite"], { stdio: "inherit" }),
];
function stop() { commands.forEach((child) => child.kill()); process.exit(); }
process.on("SIGINT", stop); process.on("SIGTERM", stop);
