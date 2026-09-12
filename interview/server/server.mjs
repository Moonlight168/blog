import { randomUUID } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

import { InterviewAgent } from "./agent.mjs";
import { createArchive, refileQuestion } from "./archive.mjs";
import { config } from "./config.mjs";
import { addMessage, openDatabase, rowToSession, saveSession } from "./db.mjs";
import { EmbeddingClient } from "./embedding-client.mjs";
import { readHistorySection } from "./history.mjs";
import { InterviewEngine } from "./interview-engine.mjs";
import { QuestionIndex } from "./question-index.mjs";
import { slugify } from "./markdown.mjs";
import { normalizeTitle } from "./search.mjs";
import { isAllowedResume, readResume, scanResumes, updateEnvFile } from "./resume.mjs";

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
function listAttempts(sessionId) {
  return db.prepare("SELECT question_title AS title, evaluation FROM attempts WHERE session_id=? ORDER BY id").all(sessionId)
    .map((row) => {
      try {
        const evaluation = JSON.parse(row.evaluation);
        return {
          title: row.title,
          score: Number(evaluation?.score ?? 0),
          // 带上点评语：没有它，总评只能看着题目倒推候选人说了什么，会编
          comment: String(evaluation?.comment ?? ""),
        };
      } catch { return { title: row.title, score: 0, comment: "" }; }
    });
}
/** 每场面试的「题目数 / 已归档题目数 / 场均分」，列表和详情都用它，避免两处算法不一致。 */
function attemptStats(sessionIds) {
  const stats = new Map();
  if (!sessionIds.size) return stats;
  const known = new Set(db.prepare("SELECT normalized_title FROM questions").all().map((row) => row.normalized_title));
  for (const row of db.prepare("SELECT session_id, question_title, evaluation FROM attempts").all()) {
    if (!sessionIds.has(row.session_id)) continue;
    const entry = stats.get(row.session_id) ?? { questions: new Set(), archived: new Set(), scores: [] };
    entry.questions.add(row.question_title);
    if (known.has(normalizeTitle(row.question_title))) entry.archived.add(row.question_title);
    try { entry.scores.push(Number(JSON.parse(row.evaluation)?.score ?? 0)); } catch { /* 坏数据跳过 */ }
    stats.set(row.session_id, entry);
  }
  return stats;
}

/** 场均分：和 summarize 用同一套算法（四舍五入到整数）。 */
function averageScore(scores = []) {
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
}

// 总评要拿到本场逐题得分，否则只能生成空泛的鼓励
const engine = new InterviewEngine({ agent, archive, listAttempts });
const sessionLocks = new Set();

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

function ruleSnapshot() {
  const skill = fs.readFileSync(path.join(config.appRoot, "skill", "SKILL.md"), "utf8");
  const handbook = fs.readFileSync(path.join(config.blogRoot, "面试宝典文章格式规范.md"), "utf8");
  const keyRules = handbook.split(/\r?\n/).filter((line) => /^\d+\. \*\*|^- \[ \]/u.test(line)).join("\n");
  return `${skill}\n\n# 面试宝典关键规则快照\n${keyRules}`;
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
    const resumeDir = config.resumeDir;
    return json(response, 200, { resumeDir, resumes: scanResumes(resumeDir), topics: questionIndex.topics(), embeddingEnabled: embeddingClient.enabled, embeddingModel: config.embedding.model || null, docsBaseUrl: config.docsBaseUrl });
  }
  if (request.method === "POST" && url.pathname === "/api/config/resume-dir") {
    const input = await body(request);
    const dir = String(input.dir ?? "").trim();
    if (!dir) return json(response, 400, { error: "简历目录不能为空" });
    const resolved = path.resolve(dir);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
      return json(response, 400, { error: `目录不存在或不是文件夹：${resolved}` });
    }
    try {
      updateEnvFile(path.join(config.appRoot, ".env"), "INTERVIEW_RESUME_DIR", resolved);
    } catch (error) {
      return json(response, 400, { error: error.message });
    }
    config.resumeDir = resolved;
    return json(response, 200, { resumeDir: resolved, resumes: scanResumes(resolved) });
  }
  if (request.method === "POST" && url.pathname === "/api/sessions") {
    const input = await body(request);
    if (!isAllowedResume(input.resumePath, config.resumeDir) || !fs.existsSync(input.resumePath) || !fs.statSync(input.resumePath).isFile()) {
      return json(response, 400, { error: "只能选择简历目录下的 Markdown / TXT / HTML 简历" });
    }
    const validTopic = questionIndex.topics().some((series) => series.name === input.series && series.chapters.some((chapter) => chapter.path === input.chapterPath));
    if (!validTopic) return json(response, 400, { error: "请选择有效的知识分类章节" });
    const session = {
      id: randomUUID(), resumePath: input.resumePath, series: input.series, chapterPath: input.chapterPath,
      mode: ["interview", "coding", "written"].includes(input.mode) ? input.mode : "interview",
      durationMinutes: Math.min(180, Math.max(5, Number(input.durationMinutes) || 30)), status: "active",
      startedAt: new Date().toISOString(), endedAt: null, currentQuestion: null, answerFragments: [], completedCount: 0,
      skillSnapshot: ruleSnapshot(), resumeExcerpt: readResume(input.resumePath).slice(0, 12_000),
      paperQuestions: [], paperIndex: 0,
    };
    if (session.mode === "written") {
      const count = Math.min(10, Math.max(3, Math.floor(session.durationMinutes / 6)));
      session.paperQuestions = await agent.generatePaper({ session, count });
      session.currentQuestion = session.paperQuestions[0];
    } else {
      session.currentQuestion = await agent.generateQuestion({ session });
    }
    saveSession(db, session);
    addMessage(db, session.id, { role: "assistant", kind: "question", content: session.currentQuestion.prompt ?? session.currentQuestion.title });
    return json(response, 201, { session, messages: messagesFor(session.id) });
  }
  const messageMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/messages$/);
  if (request.method === "POST" && messageMatch) {
    if (sessionLocks.has(messageMatch[1])) return json(response, 409, { error: "当前会话正在处理上一条消息，请稍后重试" });
    sessionLocks.add(messageMatch[1]);
    try {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(messageMatch[1]));
    if (!session) return json(response, 404, { error: "面试记录不存在" });
    const input = await body(request);
    // 界面上「下一题」「结束」是按钮，直接指定动作，不经模型判断
    const action = input.action === "next" || input.action === "end" ? input.action : null;
    const content = String(input.content ?? "").trim();
    if (!action && !content) return json(response, 400, { error: "消息不能为空" });

    const result = action
      ? await engine.advance(session, action === "end")
      : await engine.handle(session, expired(session) ? "结束" : content);
    if (!action) addMessage(db, session.id, { role: "user", kind: "text", content });
    saveSession(db, result.session);
    result.messages.forEach((message) => addMessage(db, session.id, message));
    return json(response, 200, { session: result.session, messages: messagesFor(session.id) });
    } finally { sessionLocks.delete(messageMatch[1]); }
  }
  const sessionMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)$/);
  if (request.method === "GET" && sessionMatch) {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(sessionMatch[1]));
    return session ? json(response, 200, { session, messages: messagesFor(session.id) }) : json(response, 404, { error: "面试记录不存在" });
  }
  if (request.method === "GET" && url.pathname === "/api/history") {
    const rows = db.prepare(`SELECT id,series,chapter_path AS chapterPath,resume_path AS resumePath,mode,status,
      started_at AS startedAt,ended_at AS endedAt,duration_minutes AS durationMinutes,
      completed_count AS completedCount FROM sessions ORDER BY started_at DESC`).all();
    const stats = attemptStats(new Set(rows.map((row) => row.id)));
    return json(response, 200, rows.map((row) => {
      const stat = stats.get(row.id);
      return {
        ...row,
        questionCount: stat?.questions.size ?? 0,
        archivedCount: stat?.archived.size ?? 0,
        averageScore: averageScore(stat?.scores),
      };
    }));
  }
  const historyMatch = url.pathname.match(/^\/api\/history\/([^/]+)$/);
  if (request.method === "GET" && historyMatch) {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(historyMatch[1]));
    if (!session) return json(response, 404, { error: "面试记录不存在" });
    const attempts = db.prepare("SELECT id,question_title AS questionTitle,raw_answer AS rawAnswer,evaluation,created_at AS createdAt FROM attempts WHERE session_id=? ORDER BY id").all(session.id)
      .map((row) => {
        // 反查题库，才知道这题归档到了哪里（没进知识库的题就查不到）
        const question = db.prepare("SELECT source_path,history_url FROM questions WHERE normalized_title=?").get(normalizeTitle(row.questionTitle));
        return {
          ...row,
          evaluation: JSON.parse(row.evaluation),
          historyUrl: question?.history_url ?? null,
          sourcePath: question?.source_path ?? null,
          // 带锚点，否则只能落到知识库页面顶部、还得自己往下翻。
          // 锚点用 slugify 生成，与 VuePress 渲染出的 h2 id 一致（已实测比对）。
          knowledgeUrl: question?.source_path
            ? `/series/knowledge/${question.source_path.replace(/\.md$/, ".html")}#${slugify(row.questionTitle)}`
            : null,
        };
      });
    const titles = new Set(attempts.map((item) => item.questionTitle));
    const archived = new Set(attempts.filter((item) => item.historyUrl).map((item) => item.questionTitle));
    return json(response, 200, {
      session, messages: messagesFor(session.id), attempts, docsBaseUrl: config.docsBaseUrl,
      questionCount: titles.size, archivedCount: archived.size,
      averageScore: averageScore(attempts.map((item) => Number(item.evaluation?.score ?? 0))),
    });
  }
  const refileMatch = url.pathname.match(/^\/api\/history\/([^/]+)\/attempts\/(\d+)\/refile$/);
  if (request.method === "POST" && refileMatch) {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(refileMatch[1]));
    if (!session) return json(response, 404, { error: "面试记录不存在" });
    const attempt = db.prepare("SELECT * FROM attempts WHERE id=? AND session_id=?").get(Number(refileMatch[2]), session.id);
    if (!attempt) return json(response, 404, { error: "作答记录不存在" });

    // 已经入库就直接返回，避免重复追加
    const already = db.prepare("SELECT source_path,history_url FROM questions WHERE normalized_title=?").get(normalizeTitle(attempt.question_title));
    if (already) return json(response, 200, { historyUrl: already.history_url, sourcePath: already.source_path });

    // 标准答案优先用归档时存下的；旧记录没存，就用会话当前题兜底
    const current = session.currentQuestion;
    const fallback = current && normalizeTitle(current.title) === normalizeTitle(attempt.question_title) ? current.standardAnswer : "";
    const standardAnswer = attempt.standard_answer || fallback || "";
    if (!standardAnswer) return json(response, 400, { error: "这题的标准答案没有留存，无法补录" });

    try {
      const result = await refileQuestion({
        agent, questionIndex, knowledgeRoot: config.knowledgeRoot, privateHistoryRoot: config.privateHistoryRoot,
        chapterPath: session.chapterPath, title: attempt.question_title, standardAnswer,
      });
      if (!result.ok) return json(response, 400, { error: `补录失败：${result.reason}` });
      if (!attempt.standard_answer) db.prepare("UPDATE attempts SET standard_answer=? WHERE id=?").run(standardAnswer, attempt.id);
      return json(response, 200, { historyUrl: result.historyUrl, sourcePath: session.chapterPath });
    } catch (error) {
      return json(response, 400, { error: error.message });
    }
  }
  if (request.method === "POST" && url.pathname === "/api/retrieval/preview") {
    const input = await body(request);
    const query = String(input.query ?? "").trim();
    if (!query) return json(response, 400, { error: "查询内容不能为空" });
    if (query.length > 200) return json(response, 400, { error: "查询内容不能超过 200 字" });
    const topK = Math.min(25, Math.max(1, Number(input.topK) || 5));
    await questionIndex.refresh();
    return json(response, 200, { ...(await questionIndex.search(query, topK)), embeddingModel: config.embedding.model || null });
  }
  if (request.method === "POST" && url.pathname === "/api/index/refresh") {
    const input = await body(request);
    if (input.force !== undefined && typeof input.force !== "boolean") {
      return json(response, 400, { error: "force 必须是布尔值" });
    }
    if (input.force) {
      await questionIndex.refresh(); // 先等在飞的刷新结束，避免清空后又被旧的刷新结果覆盖
      db.prepare("UPDATE questions SET embedding=NULL, embedding_model=NULL").run();
    }
    const result = await questionIndex.refresh();
    return json(response, 200, {
      ...result,
      embeddingEnabled: embeddingClient.enabled,
      embeddingModel: config.embedding.model || null,
    });
  }
  if (request.method === "POST" && url.pathname === "/api/review/questions") {
    const input = await body(request);
    const chapterPath = String(input.chapterPath ?? "").trim();
    if (!chapterPath) return json(response, 400, { error: "请选择章节" });
    const count = Math.min(50, Math.max(1, Number(input.count) || 10));
    try {
      return json(response, 200, { questions: questionIndex.pick(chapterPath, count) });
    } catch (error) {
      return json(response, 400, { error: error.message });
    }
  }
  if (request.method === "POST" && url.pathname === "/api/review/history") {
    const input = await body(request);
    const chapterPath = String(input.chapterPath ?? "").trim();
    const title = String(input.title ?? "").trim();
    if (!chapterPath || !title) return json(response, 400, { error: "缺少章节或题目标题" });
    try {
      return json(response, 200, readHistorySection({
        privateHistoryRoot: config.privateHistoryRoot, chapterPath, title,
      }));
    } catch (error) {
      return json(response, 400, { error: error.message });
    }
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

setInterval(async () => {
  const rows = db.prepare("SELECT * FROM sessions WHERE status='active'").all();
  for (const row of rows) {
    const session = rowToSession(row);
    if (!expired(session) || sessionLocks.has(session.id)) continue;
    sessionLocks.add(session.id);
    try {
      const result = await engine.handle(session, "结束");
      saveSession(db, result.session);
      result.messages.forEach((message) => addMessage(db, session.id, message));
    } catch (error) {
      console.error(`会话 ${session.id} 自动结束失败`, error);
    } finally { sessionLocks.delete(session.id); }
  }
}, 5_000).unref();

server.listen(config.port, config.host, () => console.log(`面试助手：http://${config.host}:${config.port}`));
