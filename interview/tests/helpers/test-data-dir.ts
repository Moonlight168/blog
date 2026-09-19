import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * 测试用的数据目录。
 *
 * **这个文件必须被第一个 import**：`config` 是在模块加载时读 env 的，
 * 而 ESM 的 import 会先于本模块之外的任何代码执行 —— 写在测试文件顶部的
 * `process.env.X = ...` 其实跑在 import 之后，来不及。
 *
 * 不这么做的话，每跑一次测试就会往真实的 `interview/data/` 里留下
 * 一份会话记录和一份工作目录（实测堆了 127 份）。
 */
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "interview-test-data-"));
process.env.INTERVIEW_DATA_DIR = dir;

// 退出时收掉，别让临时目录也跟着堆
process.on("exit", () => {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* 收不掉就算了，在系统临时目录里 */ }
});
