import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { filesContaining, sourceFiles } from "../helpers/sources.ts";

/**
 * 分层不变量。
 *
 * 它们靠约定维持，编译器看不见 —— `modules/` 里 import 一个 pi 的包照样过 tsc，
 * `api/` 里 execFileSync 一条命令也能过。约定一破，代价是那一层不再能单独测、
 * 也不再能单独换实现，所以要钉住，而不是靠记性。
 */

test("modules/ 里不许出现 pi：业务规则不该依赖 agent 框架", () => {
  assert.deepEqual(filesContaining("server/modules", /@earendil-works\//), []);
});

test("api/ 里不许碰子进程或直接写文件：边界层只做转发", () => {
  assert.deepEqual(filesContaining("server/api", /child_process|fs\.writeFileSync/), []);
});

test("pi-ai 只在 agent/ 里出现", () => {
  const agentDir = path.join("server", "agent") + path.sep;
  const bad = filesContaining("server", /pi-ai/).filter((file) => !file.startsWith(agentDir));
  assert.deepEqual(bad, []);
});

test("web/ 里不许出现裸 URL：路径只在 shared/routes.ts 里定义", () => {
  // 写死 "/api/xxx" 的话，服务端改名时这一侧不会报错，只会在运行时 404
  const bad = sourceFiles("web")
    .filter((file) => /["`]\/api\//.test(fs.readFileSync(file, "utf8")))
    .map((file) => path.relative(process.cwd(), file));
  assert.deepEqual(bad, []);
});
