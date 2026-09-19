import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { Message, Session, SessionRow } from "../../shared/types.ts";

/** 打开后的 SQLite 连接。全仓传这个对象，不再传文件路径。 */
export type Db = DatabaseSync;

/**
 * node:sqlite 的 get/all 只声明了 Record<string, SQLOutputValue>，拿不到列类型。
 * 断言集中在这两个函数里，查询点就不必各自写 as。
 * 代价：列名或类型与 SQL 对不上时编译器不报错 —— 改表结构要同步改 shared/types.ts 的行接口。
 */
export function asRow<T>(row: unknown): T | undefined {
  return row as T | undefined;
}

export function asRows<T>(rows: unknown): T[] {
  return rows as T[];
}

export function openDatabase(file: string): Db {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY, series TEXT NOT NULL, chapter TEXT NOT NULL,
      title TEXT NOT NULL, normalized_title TEXT NOT NULL, answer_excerpt TEXT NOT NULL,
      source_path TEXT NOT NULL, history_url TEXT, content_hash TEXT NOT NULL,
      embedding TEXT, embedding_model TEXT, updated_at TEXT NOT NULL
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS questions_fts USING fts5(id UNINDEXED, title, grams, answer);
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, resume_path TEXT NOT NULL, series TEXT NOT NULL, chapter_path TEXT NOT NULL,
      mode TEXT NOT NULL, duration_minutes INTEGER NOT NULL, status TEXT NOT NULL,
      started_at TEXT NOT NULL, ended_at TEXT, current_question TEXT,
      completed_count INTEGER NOT NULL DEFAULT 0,
      skill_snapshot TEXT NOT NULL, resume_excerpt TEXT NOT NULL,
      jd_path TEXT NOT NULL DEFAULT '', jd_excerpt TEXT NOT NULL DEFAULT '',
      paper_questions TEXT NOT NULL DEFAULT '[]', paper_index INTEGER NOT NULL DEFAULT 0,
      paused_at TEXT, paused_ms INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, role TEXT NOT NULL,
      kind TEXT NOT NULL, content TEXT NOT NULL, payload TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, question_title TEXT NOT NULL,
      raw_answer TEXT NOT NULL, evaluation TEXT NOT NULL, created_at TEXT NOT NULL, attempt_key TEXT,
      standard_answer TEXT NOT NULL DEFAULT ''
    );
    -- 考点计划：按「简历 + JD」（或章节）缓存一份有序考点表，cursor 是跨场共享的进度。
    -- cursor 单调递增，实际考点 = plan[cursor % plan.length]，第几轮 = floor(cursor / plan.length) + 1。
    CREATE TABLE IF NOT EXISTS focus_plans (
      key TEXT PRIMARY KEY, kind TEXT NOT NULL, plan TEXT NOT NULL,
      cursor INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agent_memories (
      session_id TEXT PRIMARY KEY, summary TEXT NOT NULL DEFAULT '',
      through_message_id INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL
    );
  `);
  const columns = new Set(db.prepare("PRAGMA table_info(sessions)").all().map((row) => String(row.name)));
  // 目标 JD：出题与总评都会带上它
  if (!columns.has("jd_path")) db.exec("ALTER TABLE sessions ADD COLUMN jd_path TEXT NOT NULL DEFAULT ''");
  if (!columns.has("jd_excerpt")) db.exec("ALTER TABLE sessions ADD COLUMN jd_excerpt TEXT NOT NULL DEFAULT ''");
  if (!columns.has("paper_questions")) db.exec("ALTER TABLE sessions ADD COLUMN paper_questions TEXT NOT NULL DEFAULT '[]'");
  if (!columns.has("paper_index")) db.exec("ALTER TABLE sessions ADD COLUMN paper_index INTEGER NOT NULL DEFAULT 0");
  // 暂停：paused_at 非空表示正在暂停中，paused_ms 是累计已暂停时长（超时判定要扣除）
  if (!columns.has("paused_at")) db.exec("ALTER TABLE sessions ADD COLUMN paused_at TEXT");
  if (!columns.has("paused_ms")) db.exec("ALTER TABLE sessions ADD COLUMN paused_ms INTEGER NOT NULL DEFAULT 0");
  const attemptColumns = new Set(db.prepare("PRAGMA table_info(attempts)").all().map((row) => String(row.name)));
  if (!attemptColumns.has("attempt_key")) db.exec("ALTER TABLE attempts ADD COLUMN attempt_key TEXT");
  // 归档时被跳过的题，之后要靠它补录
  if (!attemptColumns.has("standard_answer")) db.exec("ALTER TABLE attempts ADD COLUMN standard_answer TEXT NOT NULL DEFAULT ''");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS attempts_attempt_key ON attempts(attempt_key) WHERE attempt_key IS NOT NULL");
  return db;
}

export function rowToSession(row: SessionRow | undefined | null): Session | null {
  if (!row) return null;
  return {
    id: row.id, resumePath: row.resume_path, series: row.series, chapterPath: row.chapter_path,
    mode: row.mode, durationMinutes: row.duration_minutes, status: row.status,
    startedAt: row.started_at, endedAt: row.ended_at,
    currentQuestion: row.current_question ? JSON.parse(row.current_question) : null,
    completedCount: row.completed_count,
    skillSnapshot: row.skill_snapshot, resumeExcerpt: row.resume_excerpt,
    jdPath: row.jd_path ?? "", jdExcerpt: row.jd_excerpt ?? "",
    paperQuestions: JSON.parse(row.paper_questions || "[]"), paperIndex: row.paper_index ?? 0,
    pausedAt: row.paused_at ?? null, pausedMs: row.paused_ms ?? 0,
  };
}

export function saveSession(db: Db, session: Session): void {
  db.prepare(`INSERT INTO sessions
    (id,resume_path,series,chapter_path,mode,duration_minutes,status,started_at,ended_at,current_question,completed_count,skill_snapshot,resume_excerpt,jd_path,jd_excerpt,paper_questions,paper_index,paused_at,paused_ms)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET status=excluded.status,ended_at=excluded.ended_at,current_question=excluded.current_question,
      completed_count=excluded.completed_count,paper_index=excluded.paper_index,
      paused_at=excluded.paused_at,paused_ms=excluded.paused_ms`)
    .run(session.id, session.resumePath, session.series, session.chapterPath, session.mode, session.durationMinutes,
      session.status, session.startedAt, session.endedAt ?? null, JSON.stringify(session.currentQuestion),
      session.completedCount ?? 0, session.skillSnapshot ?? "", session.resumeExcerpt ?? "",
      session.jdPath ?? "", session.jdExcerpt ?? "",
      JSON.stringify(session.paperQuestions ?? []), session.paperIndex ?? 0,
      session.pausedAt ?? null, session.pausedMs ?? 0);
}

export function addMessage(db: Db, sessionId: string, message: Message): void {
  db.prepare("INSERT INTO messages(session_id,role,kind,content,payload,created_at) VALUES(?,?,?,?,?,?)")
    .run(sessionId, message.role, message.kind || "text", message.content, JSON.stringify(message.payload ?? message.evaluation ?? null), new Date().toISOString());
}

export function agentMemory(db: Db, sessionId: string): { summary: string; throughMessageId: number } {
  return asRow<{ summary: string; throughMessageId: number }>(
    db.prepare("SELECT summary,through_message_id AS throughMessageId FROM agent_memories WHERE session_id=?").get(sessionId),
  ) ?? { summary: "", throughMessageId: 0 };
}

export function saveAgentMemory(db: Db, sessionId: string, summary: string, throughMessageId: number): void {
  db.prepare(`INSERT INTO agent_memories(session_id,summary,through_message_id,updated_at) VALUES(?,?,?,?)
    ON CONFLICT(session_id) DO UPDATE SET summary=excluded.summary,
      through_message_id=excluded.through_message_id,updated_at=excluded.updated_at`)
    .run(sessionId, summary, throughMessageId, new Date().toISOString());
}

export function agentHistory(db: Db, sessionId: string, afterId = 0): Array<{ id: number; role: string; kind: string; content: string }> {
  return asRows<{ id: number; role: string; kind: string; content: string }>(
    db.prepare(`SELECT id,role,kind,content FROM messages
    WHERE session_id=? AND id>? ORDER BY id`).all(sessionId, afterId),
  );
}
