import type { Plugin } from "vuepress";
import { readFileSync } from "node:fs";

/**
 * 答题历史链接增强插件
 *
 * 把 `→ [回答历史](/private/series/答题历史/...-答题记录.md#锚点)` 渲染出的
 * `<RouteLink>回答历史</RouteLink>` 替换为：
 *   - 有记录（count > 0）：可跳转链接 + 回答次数小计数
 *   - 无记录（count = 0）：不跳转的纯文本 + 「0 次」灰色计数（悬停/点击有提示）
 *
 * 计数来源：答题记录文件里对应 `## 标题` 段落下 `- **YYYY-MM-DD**` 条目的
 * 去重日期数。文件不存在或锚点匹配不到 → 0。
 */

// 归一化：小写 + 去掉所有非字母数字（兼容中英文），用于锚点 ↔ 标题匹配
const normalize = (s: string): string =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

// 解析答题记录文件：{ 归一化标题 -> 回答次数 }
function parseAnswerCounts(content: string): Map<string, number> {
  const counts = new Map<string, number>();
  // 按 `## 标题` 分段；第 0 段是标题前的内容，跳过
  const sections = content.split(/^##\s+/m);
  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i];
    const nl = sec.indexOf("\n");
    const title = (nl === -1 ? sec : sec.slice(0, nl)).trim();
    const body = nl === -1 ? "" : sec.slice(nl + 1);
    const key = normalize(title);
    if (!key) continue;

    // 数日期条目，按日期去重（同一天多次回答只算一次）
    const dates = new Set<string>();
    const re = /^\s*-\s*\*\*(\d{4}-\d{2}-\d{2})\*\*/gm;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) dates.add(m[1]);
    counts.set(key, dates.size);
  }
  return counts;
}

export const answerHistoryPlugin = (): Plugin => {
  // 缓存：文件绝对路径 -> 计数表，避免重复读盘
  const cache = new Map<string, Map<string, number>>();

  const getCount = (file: string, anchor: string): number => {
    let counts = cache.get(file);
    if (!counts) {
      counts = new Map<string, number>();
      try {
        counts = parseAnswerCounts(readFileSync(file, "utf-8"));
      } catch {
        // 文件不存在或读取失败 → 保持空表，全部按 0
      }
      cache.set(file, counts);
    }
    return counts.get(normalize(anchor)) ?? 0;
  };

  return {
    name: "answer-history-counter",

    extendsPage(page, app) {
      const tpl = page.sfcBlocks.template;
      if (tpl?.contentStripped) {
        tpl.contentStripped = tpl.contentStripped.replace(
          /<RouteLink to="([^"]*)">回答历史<\/RouteLink>/g,
          (_match, to: string) => {
            let decoded = to;
            try {
              decoded = decodeURIComponent(to);
            } catch {
              // 非法的百分号编码则原样使用
            }

            const hashIdx = decoded.indexOf("#");
            const rawPath = hashIdx === -1 ? decoded : decoded.slice(0, hashIdx);
            const anchor = hashIdx === -1 ? "" : decoded.slice(hashIdx + 1);
            // 渲染后的 path 是 .html，答题记录文件是 .md
            const relPath = rawPath.replace(/^\//, "").replace(/\.html$/, ".md");
            const count = getCount(app.dir.source(relPath), anchor);

            if (count === 0) {
              // 无历史：纯文本，不跳转、不交互
              return (
                `<span class="ah-none">回答历史 ` +
                `<span class="ah-count is-zero">0 次</span></span>`
              );
            }

            return (
              `<RouteLink to="${to}">回答历史</RouteLink>` +
              `<span class="ah-count">${count} 次</span>`
            );
          }
        );
      }
    },
  };
};
