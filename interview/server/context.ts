import fs from "node:fs";
import path from "node:path";

import { InterviewAgent } from "./modules/interview/interviewer.ts";
import { createArchive } from "./modules/archive/index.ts";
import { config } from "./infra/config/index.ts";
import { addMessage, openDatabase, rowToSession, saveSession } from "./db/index.ts";
import { EmbeddingClient } from "./infra/external/embeddings.ts";
import { ensurePlan, focusPayload, resumeSlice, takeFocuses } from "./modules/interview/plan.ts";
import { InterviewChatAgent } from "./agent/runtime.ts";
import { DocumentEditorAgent } from "./agent/editor.ts";
import { QuestionIndex } from "./modules/question/index.ts";
import { normalizeTitle } from "./modules/question/text.ts";
import { readHistorySection } from "./modules/question/answers.ts";
import { readResume, scanJobs, scanResumes } from "./modules/document/scan.ts";
import { isAllowedJob, isAllowedResume } from "./infra/paths.ts";
import { updateEnvFile } from "./infra/config/env-file.ts";
import { readPrompt } from "./infra/prompts.ts";
import type { Db } from "./db/index.ts";
import type { Evaluation, Message, Session, SessionWithFocus } from "../shared/types.ts";

export { isAllowedJob, isAllowedResume, readHistorySection, readResume, scanJobs, scanResumes, updateEnvFile };

/**
 * 应用上下文：进程内只建一次的单例，与它们的共享状态。
 *
 * 路由文件从这里取依赖，不各自 new —— db 连接、题库索引、模型客户端都是要共享的。
 * 启动期的副作用（题库热更新、超时巡检）不在这里，在 index.ts。
 */

export const db: Db = openDatabase(config.databasePath);
export const embeddingClient = new EmbeddingClient(config.embedding);
export const questionIndex = new QuestionIndex({ db, knowledgeRoot: config.knowledgeRoot, embeddingClient });
export const agent = new InterviewAgent({ config: config.chat, questionIndex });
export const piAgent = new InterviewChatAgent({ config: config.chat });
export const editorAgent = new DocumentEditorAgent({ config: config.chat });
export const archiveWriter = createArchive({
  questionIndex,
  agent,
  knowledgeRoot: config.knowledgeRoot,
  privateHistoryRoot: config.privateHistoryRoot,
  db,
});

/** 同一会话的消息串行处理；暂停/丢弃也要先看它。跨路由共享，故放在这里。 */
export const sessionLocks = new Set<string>();

let archiveTail: Promise<void> = Promise.resolve();

async function acquireArchiveLock(): Promise<() => void> {
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  const previous = archiveTail;
  archiveTail = current;
  await previous;
  return release;
}

/** 归档一次作答要的全部输入 */
export interface ArchiveInput {
  session: Session;
  question: { title: string; standardAnswer?: string };
  rawAnswer: string;
  evaluation: Evaluation;
}

export interface ArchiveOutcome {
  commit?: () => void;
  rollback?: () => Promise<void>;
  [key: string]: unknown;
}

/** 归档写盘串行化：知识库题块与私有答题历史是「先读后写」，并发会互相覆盖。 */
export async function archive(input: ArchiveInput): Promise<ArchiveOutcome> {
  const release = await acquireArchiveLock();
  let settled = false;
  const unlock = () => { if (!settled) { settled = true; release(); } };
  try {
    const result = (await archiveWriter(input)) as ArchiveOutcome;
    return {
      ...result,
      commit: unlock,
      rollback: async () => {
        try { await result?.rollback?.(); }
        finally { unlock(); }
      },
    };
  } catch (error) {
    unlock();
    throw error;
  }
}

/** 补录要独占归档写盘，但不需要 createArchive 的 commit/rollback 协议 */
export async function withArchiveLock<T>(run: () => Promise<T>): Promise<T> {
  const release = await acquireArchiveLock();
  try { return await run(); } finally { release(); }
}

export function listAttempts(sessionId: string): Array<{ title: string; score: number; comment: string }> {
  return db.prepare("SELECT question_title AS title, evaluation FROM attempts WHERE session_id=? ORDER BY id").all(sessionId)
    .map((row) => {
      try {
        const evaluation = JSON.parse(String(row.evaluation)) as Evaluation;
        return {
          title: String(row.title),
          score: Number(evaluation?.score ?? 0),
          // 带上点评语：没有它，总评只能看着题目倒推候选人说了什么，会编
          comment: String(evaluation?.comment ?? ""),
        };
      } catch { return { title: String(row.title), score: 0, comment: "" }; }
    });
}

/** 一轮问答的结果落库。三条写入要么全成要么全不成，故走事务。 */
export function persistTurn(session: Session, userContent: string | null, messages: Message[]): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    if (userContent !== null) addMessage(db, session.id, { role: "user", kind: "text", content: userContent });
    saveSession(db, session);
    messages.forEach((message) => addMessage(db, session.id, message));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/** 每场面试的「题目数 / 已归档题目数 / 场均分」，列表和详情都用它，避免两处算法不一致。 */
export function attemptStats(sessionIds: Set<string>) {
  const stats = new Map<string, { questions: Set<string>; archived: Set<string>; scores: number[] }>();
  if (!sessionIds.size) return stats;
  const known = new Set(db.prepare("SELECT normalized_title FROM questions").all().map((row) => String(row.normalized_title)));
  for (const row of db.prepare("SELECT session_id, question_title, evaluation FROM attempts").all()) {
    const sessionId = String(row.session_id);
    if (!sessionIds.has(sessionId)) continue;
    const entry = stats.get(sessionId) ?? { questions: new Set<string>(), archived: new Set<string>(), scores: [] as number[] };
    entry.questions.add(String(row.question_title));
    if (known.has(normalizeTitle(String(row.question_title)))) entry.archived.add(String(row.question_title));
    try { entry.scores.push(Number((JSON.parse(String(row.evaluation)) as Evaluation)?.score ?? 0)); } catch { /* 坏数据跳过 */ }
    stats.set(sessionId, entry);
  }
  return stats;
}

/** 场均分：和 summarize 用同一套算法（四舍五入到整数）。 */
export function averageScore(scores: number[] = []): number | null {
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
}

export function messagesFor(sessionId: string): Message[] {
  return db.prepare("SELECT id,role,kind,content,payload,created_at AS createdAt FROM messages WHERE session_id=? ORDER BY id").all(sessionId)
    .map((row) => ({ ...row, payload: row.payload ? JSON.parse(String(row.payload)) : null })) as unknown as Message[];
}

// conversationContext 已删除：对话记录改由 pi 的 JSONL 会话持有，
// 压缩走 lane.compact（见 agent/session.ts），不再需要从 SQLite 读出来自己裁剪。

/**
 * 简历 / 自我介绍的规范正文。
 *
 * 读仓库里的 `prompts/`（通用版），**不再读私人目录** —— 私人的那几份保留在磁盘上但
 * 已退出提示词链路，免得同一份规则两处生效、互相打架。缓存由 readPrompt 负责。
 */
export function editingSpecs(): { resume: string; intro: string } {
  return {
    resume: readPrompt("resume-editor"),
    intro: readPrompt("self-intro-editor"),
  };
}

/**
 * 建会话时冻结的规则快照：面试官 skill 正文 + 面试宝典的关键规则行。
 *
 * 面试宝典规范留在博客仓库根（归档流程读它、与知识库一起维护），不复制进 prompts/ ——
 * 复制就会有两份真相，改一边忘一边。
 */
export function ruleSnapshot(): string {
  const skill = readPrompt("interviewer");
  const handbookFile = path.join(config.blogRoot, "面试宝典文章格式规范.md");
  const handbook = fs.existsSync(handbookFile) ? fs.readFileSync(handbookFile, "utf8") : "";
  const keyRules = handbook.split(/\r?\n/).filter((line) => /^\d+\. \*\*|^- \[ \]/u.test(line)).join("\n");
  return `${skill}\n\n# 面试宝典关键规则快照\n${keyRules}`;
}

/**
 * 出题时要避开「已经问过的题」。只取标题、不带答案和摘要（省 token，也足够模型避让）。
 * 本场：这场答过的 + 当前这题；跨场：同简历（岗位定制时再加同 JD）最近答过的。
 */
export function askedQuestionTitles(session: Session): string[] {
  const rows = db.prepare(`
    SELECT a.question_title AS title
    FROM attempts a JOIN sessions s ON s.id = a.session_id
    WHERE a.session_id = ? OR (s.resume_path = ? AND (? = '' OR s.jd_path = ?))
    ORDER BY a.id DESC LIMIT 40
  `).all(session.id, session.resumePath, session.jdPath ?? "", session.jdPath ?? "");
  const titles: string[] = [];
  if (session.currentQuestion?.title) titles.push(session.currentQuestion.title);
  for (const row of rows) {
    const title = String(row.title);
    if (title && !titles.includes(title)) titles.push(title);
  }
  return titles.slice(0, 20);
}

/** 人事面试（行为面）的题固定归到软素质文档 */
export const HR_SERIES = "基础知识";
export const HR_CHAPTER = "基础知识/协作交流.md";

function chapterNameOf(session: Session): string {
  return session.chapterPath ? path.basename(session.chapterPath, ".md") : "";
}

/**
 * 出题前的准备：算好「已经问过什么」和「本轮考哪个考点」。
 * 考点计划按「简历 + JD」（或简历 + 章节）缓存、游标跨场共享，所以每题只多一次 SQL 读。
 * 计划生成失败时留空，出题自动退回「整篇简历」的老路。
 */
export async function prepareGeneration(session: Session, count = 1): Promise<void> {
  // 考点相关的字段是临时挂上去的（不落库），所以这里换一个更宽的视图来写
  const target = session as SessionWithFocus;
  target.askedQuestions = askedQuestionTitles(session);
  const plan = await ensurePlan({ db, agent, questionIndex, session, chapterName: chapterNameOf(session) });
  const focuses = takeFocuses(db, plan, count);
  if (!focuses.length) return;
  if (count > 1) { target.nextFocuses = focuses; return; }
  target.nextFocus = focuses[0];
  target.resumeSnippet = resumeSlice(session.resumeExcerpt ?? "", focuses[0]);
}

export { focusPayload, rowToSession };
