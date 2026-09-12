/** 列表卡片和详情头部共用这些格式化，避免两处显示不一致。 */

/** Java + Java/JVM.md → Java-JVM */
export function topicLabel(series: string, chapterPath: string) {
  const chapter = (chapterPath ?? "").split("/").pop() ?? "";
  return chapter ? `${series}-${chapter.replace(/\.md$/i, "")}` : series;
}

/** …/resume/hjf/黄锦锋-Java后端.html → hjf-黄锦锋-Java后端（去掉文件后缀） */
export function resumeLabel(resumePath: string) {
  const parts = (resumePath ?? "").split(/[\\/]/).filter(Boolean);
  if (!parts.length) return "未记录简历";
  const file = parts.at(-1)?.replace(/\.[^.]+$/, "") ?? "";
  const dir = parts.length > 1 ? parts.at(-2) : "";
  return dir && dir !== file ? `${dir}-${file}` : file;
}

/** 人员目录（用于筛选） */
export function personLabel(resumePath: string) {
  const parts = (resumePath ?? "").split(/[\\/]/).filter(Boolean);
  return parts.length > 1 ? (parts.at(-2) ?? "") : "";
}

export function durationLabel(minutes: number) {
  return minutes ? `${minutes} 分钟` : "";
}

export function timeLabel(iso: string) {
  return iso ? new Date(iso).toLocaleString("zh-CN") : "";
}

/** 本场分数一行：场均 X/100 · N 题 · 已归档 M */
export function statLabel(averageScore: number | null, questionCount: number, archivedCount: number) {
  const score = averageScore === null ? "暂无评分" : `场均 ${averageScore}/100`;
  return `${score} · ${questionCount} 题 · 已归档 ${archivedCount}`;
}

/**
 * 评分档位——⚠️ 必须与 interview/skill/SKILL.md 里的「评分标准」保持一致。
 * 那边是给模型看的规则（随规则快照注入提示词），这边只是给界面展示用的副本。
 * 改档位时两处都要改，否则界面显示的档位会和实际评分口径对不上。
 */
export interface ScoreBand { min: number; range: string; label: string; hint: string }
export const SCORE_BANDS: ScoreBand[] = [
  { min: 90, range: "90–100", label: "完全答对", hint: "要点齐全，还能主动讲出取舍、边界或踩过的坑" },
  { min: 70, range: "70–89", label: "基本答对", hint: "主要要点都在，细节或边界有缺失" },
  { min: 50, range: "50–69", label: "答到一半", hint: "方向对，但关键要点缺 1–2 个" },
  { min: 30, range: "30–49", label: "答偏了", hint: "提到了一些相关术语，但没答到点上" },
  { min: 1, range: "1–29", label: "基本没答上来", hint: "只蹦出个别关键词" },
  { min: 0, range: "0", label: "完全没答", hint: "完全没作答，或明确表示“不会 / 不清楚”" },
];
