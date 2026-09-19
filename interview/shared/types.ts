/**
 * 前后端共用的数据结构。
 *
 * 服务端的 SQLite 行是下划线命名，前端要的是驼峰 —— 转换只发生在 db 层的
 * rowTo* 函数里，越过那一层之后一律用这里的驼峰形状。
 */

export interface Chapter {
  name: string;
  path: string;
}

export interface TopicSeries {
  name: string;
  chapters: Chapter[];
}

/**
 * 一个考点：某章里值得问的一个点。
 *
 * 出题前由考点计划按顺序取出来，挂到 session 上供提示词使用 —— 不落库。
 * 字段都是可选的：计划生成失败时整段留空，出题退回「整篇简历」的老路。
 */
export interface Focus {
  label?: string;
  section?: string;
  /** 简历里的定位锚点（通常是项目名），切片时最先试它 */
  anchor?: string;
  intent?: string;
  index?: number;
  total?: number;
  round?: number;
}

/** 当前正在面的那道题。出题时写入 session，作答后随归档一起清掉。 */
export interface CurrentQuestion {
  title: string;
  [key: string]: unknown;
}

export interface Session {
  id: string;
  resumePath: string;
  series: string;
  chapterPath: string;
  mode: string;
  durationMinutes: number;
  status: string;
  startedAt: string;
  endedAt?: string | null;
  currentQuestion?: CurrentQuestion | null;
  completedCount?: number;
  skillSnapshot?: string;
  resumeExcerpt?: string;
  /** 目标 JD 的路径；没选则为空串 */
  jdPath?: string;
  jdExcerpt?: string;
  paperQuestions?: unknown[];
  paperIndex?: number;
  /** 本次暂停的开始时间；为空表示未暂停 */
  pausedAt?: string | null;
  /** 历史累计暂停毫秒数，超时判定与倒计时都要扣除 */
  pausedMs?: number;
}

export interface Message {
  id?: number;
  role: "user" | "assistant";
  kind: string;
  content: string;
  createdAt?: string;
  payload?: unknown;
  evaluation?: unknown;
  pending?: boolean;
}

/** 一次作答的评分结果。分数 0–100，档位见 prompts/interviewer 的评分标准。 */
export interface Evaluation {
  score: number;
  comment: string;
}

export interface Attempt {
  id?: number;
  questionTitle: string;
  rawAnswer: string;
  evaluation: Evaluation | null;
  standardAnswer?: string;
  createdAt?: string;
  /** 归档后的落点：知识库正文里的锚点链接，以及私有答题记录的位置 */
  historyUrl?: string | null;
  sourcePath?: string | null;
  knowledgeUrl?: string | null;
}

/** 题库里的一道题（索引表 questions 的一行，驼峰化）。 */
export interface Question {
  id: string;
  series: string;
  chapter: string;
  title: string;
  answerExcerpt: string;
  sourcePath: string;
  historyUrl?: string | null;
}

// ---- SQLite 行形状：仅 db 层使用，保持下划线命名与列名一致 ----

export interface SessionRow {
  id: string;
  resume_path: string;
  series: string;
  chapter_path: string;
  mode: string;
  duration_minutes: number;
  status: string;
  started_at: string;
  ended_at: string | null;
  current_question: string | null;
  completed_count: number;
  skill_snapshot: string;
  resume_excerpt: string;
  jd_path: string;
  jd_excerpt: string;
  paper_questions: string;
  paper_index: number;
  paused_at: string | null;
  paused_ms: number;
}

export interface MessageRow {
  id: number;
  session_id: string;
  role: string;
  kind: string;
  content: string;
  payload: string | null;
  created_at: string;
}

export interface AttemptRow {
  id: number;
  session_id: string;
  question_title: string;
  raw_answer: string;
  evaluation: string;
  created_at: string;
  attempt_key: string | null;
  standard_answer: string;
}

export interface QuestionRow {
  id: string;
  series: string;
  chapter: string;
  title: string;
  normalized_title: string;
  answer_excerpt: string;
  source_path: string;
  history_url: string | null;
  content_hash: string;
  embedding: string | null;
  embedding_model: string | null;
  updated_at: string;
}

/**
 * 出题前临时挂在 session 上的几样东西 —— 不落库，只在这一轮里传给提示词。
 * 见 context.ts 的 prepareGeneration。
 */
export type SessionWithFocus = Session & {
  askedQuestions?: string[];
  nextFocus?: Focus;
  nextFocuses?: Focus[];
  resumeSnippet?: string;
};
