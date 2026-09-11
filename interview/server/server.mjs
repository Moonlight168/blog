import { randomUUID } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

import { InterviewAgent } from "./agent.mjs";
import { createArchive } from "./archive.mjs";
import { config } from "./config.mjs";
import { addMessage, openDatabase, rowToSession, saveSession } from "./db.mjs";
import { EmbeddingClient } from "./embedding-client.mjs";
import { InterviewEngine } from "./interview-engine.mjs";
import { QuestionIndex } from "./question-index.mjs";

const db = openDatabase(config.databasePath);
const embeddingClient = new EmbeddingClient(config.embedding);
const questionIndex = new QuestionIndex({ db, knowledgeRoot: config.knowledgeRoot, embeddingClient });
await questionIndex.refresh();
let refreshTimer;
fs.watch(config.knowledgeRoot, { recursive: true }, (_event, filename) => {
  if (!filename?.endsWith(".md")) return;
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => questionIndex.refresh().catch((error) => console.error("题库热更新失败", error)), 350);
});
const agent = new InterviewAgent({ config: config.chat, questionIndex });
const archive = createArchive({ questionIndex, agent, knowledgeRoot: config.knowledgeRoot, privateHistoryRoot: config.privateHistoryRoot, db });
const engine = new InterviewEngine({ agent, archive });

function json(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}

async function body(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  if (text.length > 1_000_000) throw new Error("请求体过大");
  return text ? JSON.parse(text) : {};
}

function listResumes(root) {
  const resolved = path.resolve(root);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) return [];
  const visit = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return visit(full);
    return entry.isFile() && [".md", ".txt"].includes(path.extname(entry.name).toLowerCase())
      ? [{ name: path.relative(resolved, full), path: full }]
      : [];
  });
  return visit(resolved);
}

function messagesFor(sessionId) {
  return db.prepare("SELECT id,role,kind,content,payload,created_at AS createdAt FROM messages WHERE session_id=? ORDER BY id").all(sessionId)
    .map((row) => ({ ...row, payload: row.payload ? JSON.parse(row.payload) : null }));
}

function expired(session) {
  return Date.now() >= new Date(session.startedAt).getTime() + session.durationMinutes * 60_000;
}

async function api(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    await questionIndex.refresh();
    const resumeDir = url.searchParams.get("resumeDir") || config.resumeDir;
    return json(response, 200, { resumeDir, resumes: listResumes(resumeDir), topics: questionIndex.topics(), embeddingEnabled: embeddingClient.enabled });
  }
  if (request.method === "POST" && url.pathname === "/api/sessions") {
    const input = await body(request);
    if (!fs.existsSync(input.resumePath) || !fs.statSync(input.resumePath).isFile()) return json(response, 400, { error: "请选择存在的简历文件" });
    const validTopic = questionIndex.topics().some((series) => series.name === input.series && series.chapters.some((chapter) => chapter.path === input.chapterPath));
    if (!validTopic) return json(response, 400, { error: "请选择有效的 Series 章节" });
    const skillPath = path.join(config.appRoot, "skill", "SKILL.md");
    const session = {
      id: randomUUID(), resumePath: input.resumePath, series: input.series, chapterPath: input.chapterPath,
      mode: ["interview", "coding", "written"].includes(input.mode) ? input.mode : "interview",
      durationMinutes: Math.min(180, Math.max(5, Number(input.durationMinutes) || 30)), status: "active",
      startedAt: new Date().toISOString(), endedAt: null, currentQuestion: null, answerFragments: [], completedCount: 0,
      skillSnapshot: fs.readFileSync(skillPath, "utf8"), resumeExcerpt: fs.readFileSync(input.resumePath, "utf8").slice(0, 12_000),
    };
    session.currentQuestion = await agent.generateQuestion({ session });
    saveSession(db, session);
    addMessage(db, session.id, { role: "assistant", kind: "question", content: session.currentQuestion.prompt ?? session.currentQuestion.title });
    return json(response, 201, { session, messages: messagesFor(session.id) });
  }
  const messageMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/messages$/);
  if (request.method === "POST" && messageMatch) {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(messageMatch[1]));
    if (!session) return json(response, 404, { error: "面试记录不存在" });
    const input = await body(request);
    const content = String(input.content ?? "").trim();
    if (!content) return json(response, 400, { error: "消息不能为空" });
    addMessage(db, session.id, { role: "user", kind: "text", content });
    const result = await engine.handle(session, expired(session) ? "结束" : content);
    saveSession(db, result.session);
    result.messages.forEach((message) => addMessage(db, session.id, message));
    return json(response, 200, { session: result.session, messages: messagesFor(session.id) });
  }
  const sessionMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)$/);
  if (request.method === "GET" && sessionMatch) {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(sessionMatch[1]));
    return session ? json(response, 200, { session, messages: messagesFor(session.id) }) : json(response, 404, { error: "面试记录不存在" });
  }
  if (request.method === "GET" && url.pathname === "/api/history") {
    const rows = db.prepare(`SELECT id,series,chapter_path AS chapterPath,mode,status,started_at AS startedAt,
      ended_at AS endedAt,completed_count AS completedCount FROM sessions ORDER BY started_at DESC`).all();
    return json(response, 200, rows);
  }
  const historyMatch = url.pathname.match(/^\/api\/history\/([^/]+)$/);
  if (request.method === "GET" && historyMatch) {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(historyMatch[1]));
    if (!session) return json(response, 404, { error: "面试记录不存在" });
    const attempts = db.prepare("SELECT question_title AS questionTitle,raw_answer AS rawAnswer,evaluation,created_at AS createdAt FROM attempts WHERE session_id=? ORDER BY id").all(session.id)
      .map((row) => ({ ...row, evaluation: JSON.parse(row.evaluation) }));
    return json(response, 200, { session, messages: messagesFor(session.id), attempts });
  }
  return false;
}

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };
function staticFile(response, pathname) {
  const dist = path.join(config.appRoot, "dist");
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  let file = path.resolve(dist, relative);
  if (!file.startsWith(path.resolve(dist)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, "index.html");
  if (!fs.existsSync(file)) return json(response, 404, { error: "前端尚未构建，请运行 npm run build" });
  response.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      const handled = await api(request, response, url);
      if (handled === false) json(response, 404, { error: "接口不存在" });
    } else staticFile(response, url.pathname);
  } catch (error) {
    console.error(error);
    json(response, 500, { error: error.message || "服务器错误" });
  }
});

server.listen(config.port, config.host, () => console.log(`面试助手：http://${config.host}:${config.port}`));
