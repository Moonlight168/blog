/**
 * 全局路径常量
 *
 * 这些常量在 VuePress 编译时使用,集中维护项目内的相对路径。
 * 修改此文件即可全局生效,无需改动每个 .md 文档。
 *
 * 注意:VuePress 在编译 Markdown 时**无法**读取环境变量(.env),
 * 所以这里读不到 process.env 中的值。只能通过改本文件来更新。
 */
import fs from "fs";
import path from "path";

/**
 * 答题历史目录相对路径计算器。
 *
 * 调用:answerHistoryRel(__filename) 返回从当前文件出发,
 * 到 `src/series/答题历史` 的相对路径字符串。
 *
 * 工作原理:
 * - 拿到调用方的绝对路径作为源
 * - 拿到 src/series/答题历史 的绝对路径作为目标
 * - 用 path.relative 计算
 *
 * 这让每个文档都能正确得到自己到答题历史的相对路径,
 * 替代手工写死的 '../../../答题历史'。
 */
export function answerHistoryRel(fromFile: string): string {
    const targetDir = path.resolve(
        import.meta.dirname ?? __dirname,
        "../series/答题历史",
    );
    let rel = path.relative(path.dirname(path.resolve(fromFile)), targetDir);
    // 统一用 POSIX 风格(Windows path 会用 \\ 分隔符,Markdown 链接需要 /)
    rel = rel.replace(/\\/g, "/");
    // 补 trailing slash
    if (!rel.endsWith("/")) rel += "/";
    return rel;
}

/**
 * 答题历史目录的固定相对路径,作为后备常量
 * (适用于不能调用函数计算的场景,例如纯文本注释)
 */
export const ANSWER_HISTORY_REL_FALLBACK = "../../../series/答题历史";
