import fs from "node:fs";
import path from "node:path";

/**
 * 给「结构守卫」类测试用：按目录收集源码、按正则找内容。
 *
 * `imports.test.ts` 与 `architecture.test.ts` 都要扫源码树，扫法一样，
 * 所以放这里 —— 两处各写一份的话，改了排除规则（比如加一个新的忽略目录）会漏改一处。
 */

/** 递归收集 dir 下的源码文件，跳过 node_modules 与隐藏目录。`.mjs` / `.js` 也算 —— 漏扫它们正是当初 dev.mjs 断链没被发现的原因 */
export function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(full));
    else if ([".ts", ".mjs", ".js", ".vue"].includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

/** dir 下内容命中 pattern 的文件，返回相对 cwd 的路径（报错信息读起来短一点） */
export function filesContaining(dir: string, pattern: RegExp): string[] {
  return sourceFiles(dir)
    .filter((file) => pattern.test(fs.readFileSync(file, "utf8")))
    .map((file) => path.relative(process.cwd(), file));
}
