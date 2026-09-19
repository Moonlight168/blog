import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { sourceFiles } from "../helpers/sources.ts";

/**
 * 相对 import 必须解析得到文件。
 *
 * 为什么专门加这条：`scripts/` 与 `tests/` 下的文件**曾经不在任何 tsconfig 的
 * include 里**，import 写错了没有任何检查能发现 —— 实测同一个 `scripts/dev.mjs`
 * 因为文件搬家坏了两次，两次都是「跑起来才发现」。现在它们进了类型检查，
 * 这道闸留着兜底：`tsconfig` 的 include 谁要是再漏一个目录，这里能看出来。
 */

const ROOTS = ["server", "web", "shared", "tests", "scripts"];
const EXTS = ["", ".ts", ".mjs", ".js", ".vue", ".json", "/index.ts", "/index.mjs"];

/** 取出所有 import 的说明符 */
function specifiers(text: string): string[] {
  return [...text.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]);
}

function resolves(from: string, spec: string): boolean {
  const base = path.resolve(path.dirname(from), spec);
  return EXTS.some((ext) => fs.existsSync(base + ext));
}

test("每个相对 import 都能解析到文件", () => {
  const broken: string[] = [];
  for (const root of ROOTS) {
    for (const file of sourceFiles(root)) {
      const text = fs.readFileSync(file, "utf8");
      for (const spec of specifiers(text)) {
        if (spec.startsWith(".") && !resolves(file, spec)) broken.push(`${file}: ${spec}`);
      }
    }
  }
  assert.deepEqual(broken, [], `这些 import 指向不存在的文件：\n${broken.join("\n")}`);
});

test("没有指向搬家前老路径的 import", () => {
  // 比的是**说明符的路径尾巴**，不是整份文件做子串匹配 —— 后者会把合法的
  // ../../infra/network.ts 判成搬家前的 ../infra/network.ts。
  // 按尾巴比的好处是相对深度写错时也照样能被逮到。
  const STALE = [
    "infra/net.ts", "infra/asr.ts", "infra/embeddings.ts", "infra/config.ts",
    "views/", "helpers/repo.mjs", "helpers/document-invariants.mjs", "helpers/test-data-dir.mjs",
  ];
  const hits: string[] = [];
  for (const root of ROOTS) {
    for (const file of sourceFiles(root)) {
      for (const spec of specifiers(fs.readFileSync(file, "utf8"))) {
        if (!spec.startsWith(".")) continue;
        if (spec.endsWith(".mjs")) hits.push(`${file}: ${spec}（已转 TypeScript，后缀该是 .ts）`);
        for (const stale of STALE) {
          if (spec.endsWith(`/${stale}`)) hits.push(`${file}: ${spec}（搬家前在 ${stale}）`);
        }
      }
    }
  }
  assert.deepEqual(hits, [], `还在引用搬家前的老路径：\n${hits.join("\n")}`);
});
