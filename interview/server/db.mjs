import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export function openDatabase(file) {
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
      answer_fragments TEXT NOT NULL DEFAULT '[]', completed_count INTEGER NOT NULL DEFAULT 0,
      skill_snapshot TEXT NOT NULL, resume_excerpt TEXT NOT NULL,
      jd_path TEXT NOT NULL DEFAULT '', jd_excerpt TEXT NOT NULL DEFAULT '',
      paper_questions TEXT NOT NULL DEFAULT '[]', paper_index INTEGER NOT NULL DEFAULT 0
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
  `);
  const columns = new Set(db.prepare("PRAGMA table_info(sessions)").all().map((row) => row.name));
  // 目标 JD：出题与总评都会带上它
  if (!columns.has("jd_path")) db.exec("ALTER TABLE sessions ADD COLUMN jd_path TEXT NOT NULL DEFAULT ''");
  if (!columns.has("jd_excerpt")) db.exec("ALTER TABLE sessions ADD COLUMN jd_excerpt TEXT NOT NULL DEFAULT ''");
  if (!columns.has("paper_questions")) db.exec("ALTER TABLE sessions ADD COLUMN paper_questions TEXT NOT NULL DEFAULT '[]'");
  if (!columns.has("paper_index")) db.exec("ALTER TABLE sessions ADD COLUMN paper_index INTEGER NOT NULL DEFAULT 0");
  const attemptColumns = new Set(db.prepare("PRAGMA table_info(attempts)").all().map((row) => row.name));
  if (!attemptColumns.has("attempt_key")) db.exec("ALTER TABLE attempts ADD COLUMN attempt_key TEXT");
  // 归档时被跳过的题，之后要靠它补录
  if (!attemptColumns.has("standard_answer")) db.exec("ALTER TABLE attempts ADD COLUMN standard_answer TEXT NOT NULL DEFAULT ''");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS attempts_attempt_key ON attempts(attempt_key) WHERE attempt_key IS NOT NULL");
  return db;
}

export function rowToSession(row) {
  if (!row) return null;
  return {
    id: row.id, resumePath: row.resume_path, series: row.series, chapterPath: row.chapter_path,
    mode: row.mode, durationMinutes: row.duration_minutes, status: row.status,
    startedAt: row.started_at, endedAt: row.ended_at,
    currentQuestion: row.current_question ? JSON.parse(row.current_question) : null,
    answerFragments: JSON.parse(row.answer_fragments || "[]"), completedCount: row.completed_count,
    skillSnapshot: row.skill_snapshot, resumeExcerpt: row.resume_excerpt,
    jdPath: row.jd_path ?? "", jdExcerpt: row.jd_excerpt ?? "",
    paperQuestions: JSON.parse(row.paper_questions || "[]"), paperIndex: row.paper_index ?? 0,
  };
}

export function saveSession(db, session) {
  db.prepare(`INSERT INTO sessions
    (id,resume_path,series,chapter_path,mode,duration_minutes,status,started_at,ended_at,current_question,answer_fragments,completed_count,skill_snapshot,resume_excerpt,jd_path,jd_excerpt,paper_questions,paper_index)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET status=excluded.status,ended_at=excluded.ended_at,current_question=excluded.current_question,
      answer_fragments=excluded.answer_fragments,completed_count=excluded.completed_count,paper_index=excluded.paper_index`)
    .run(session.id, session.resumePath, session.series, session.chapterPath, session.mode, session.durationMinutes,
      session.status, session.startedAt, session.endedAt ?? null, JSON.stringify(session.currentQuestion),
      JSON.stringify(session.answerFragments), session.completedCount ?? 0, session.skillSnapshot, session.resumeExcerpt,
      session.jdPath ?? "", session.jdExcerpt ?? "",
      JSON.stringify(session.paperQuestions ?? []), session.paperIndex ?? 0);
}

export function addMessage(db, sessionId, message) {
  db.prepare("INSERT INTO messages(session_id,role,kind,content,payload,created_at) VALUES(?,?,?,?,?,?)")
    .run(sessionId, message.role, message.kind || "text", message.content, JSON.stringify(message.evaluation ?? null), new Date().toISOString());
}
