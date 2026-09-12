import fs from "node:fs";
import path from "node:path";

import { normalizeTitle } from "./search.mjs";

/** 每次回答是段落里的一行：`- **YYYY-MM-DD**：原话`（archive.mjs 就是这么写的） */
const ENTRY = /^\s*-\s*\*\*(\d{4}-\d{2}-\d{2})\*\*[：:]\s*(.*)$/;

/**
 * 读出某道题的历次回答，用于在应用内直接预览答题历史（不必跳转到文档站）。
 * 答题记录文件结构：每道题一个 `## 标题` 段落，段落内每次回答占一行。
 */
export function readHistorySection({ privateHistoryRoot, chapterPath, title }) {
  const [series] = String(chapterPath ?? "").split("/");
  const chapter = path.basename(String(chapterPath ?? ""), ".md");
  const file = path.join(privateHistoryRoot, series ?? "", `${chapter}-答题记录.md`);

  const relative = path.relative(path.resolve(privateHistoryRoot), path.resolve(file));
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("章节路径超出答题记录目录");
  if (!fs.existsSync(file)) return { entries: [], file: null };

  const wanted = normalizeTitle(title);
  for (const section of fs.readFileSync(file, "utf8").split(/^##\s+/m).slice(1)) {
    const breakIndex = section.indexOf("\n");
    const heading = (breakIndex === -1 ? section : section.slice(0, breakIndex)).trim();
    if (normalizeTitle(heading) !== wanted) continue;

    const body = breakIndex === -1 ? "" : section.slice(breakIndex + 1);
    // 冒号后为空的条目也要保留：文档站是按日期计数的，过滤掉会让两边次数对不上
    const entries = body.split(/\r?\n/).flatMap((line) => {
      const matched = ENTRY.exec(line);
      return matched ? [{ date: matched[1], answer: matched[2].trim() }] : [];
    });
    return { entries, file };
  }
  return { entries: [], file };
}
