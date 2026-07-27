/**
 * 全局路径常量
 *
 * 答题历史目录的绝对路径统一维护在项目根目录的 `.env` 中
 * （变量名 `ANSWER_HISTORY_REL`）。
 *
 * Markdown 链接里直接写 `/series/答题历史/...`（站点根绝对路径）。
 *
 * 注意:VuePress 在编译 Markdown 时**无法**读取环境变量(.env),
 * 所以这里不能再提供 answerHistoryRel() 函数。改路径只需更新 .env。
 */

/* 此文件原本提供 answerHistoryRel() 函数与 ANSWER_HISTORY_REL_FALLBACK
 * 常量,现已统一改用 .env 管理,函数删除。历史链接请直接使用绝对路径。 */
export {};