import { randomUUID } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

import { InterviewAgent } from "./agent.mjs";
import { createArchive, refileQuestion } from "./archive.mjs";
import { asrEnabled, transcribe } from "./asr.mjs";
import { config } from "./config.mjs";
import { addMessage, agentHistory, agentMemory, openDatabase, rowToSession, saveAgentMemory, saveSession } from "./db.mjs";
import { EmbeddingClient } from "./embedding-client.mjs";
import { ensurePlan, focusPayload, resumeSlice, takeFocuses } from "./focus-plan.mjs";
import { readHistorySection } from "./history.mjs";
import { advanceInterview, handleInterviewMessage } from "./interview-flow.mjs";
import { compactHistoryText, PiInteractionAgent } from "./pi-interaction-agent.mjs";
import { QuestionIndex } from "./question-index.mjs";
import { pickPath } from "./picker.mjs";
import { listRealInterviews, readRealInterview } from "./real-interview.mjs";
import { commitResumeDoc, findBrowser, htmlToPdf, listResumeGroups, pdfFileName, readResumeDoc, resolveResumeDoc, writeResumeDoc } from "./resume-doc.mjs";
import { slugify } from "./markdown.mjs";
import { normalizeTitle } from "./search.mjs";
import { commitSelfIntro, listSelfIntros, readSelfIntro, readSelfIntroAt, rollbackSelfIntro, selfIntroHistory, writeSelfIntro } from "./self-intro.mjs";
import { expired } from "./session-time.mjs";
import { isAllowedJob, isAllowedResume, readResume, scanJobs, scanResumes, updateEnvFile } from "./resume.mjs";

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
const piAgent = new PiInteractionAgent({ config: config.chat, questionIndex });
const archiveWriter = createArchive({ questionIndex, agent, knowledgeRoot: config.knowledgeRoot, privateHistoryRoot: config.privateHistoryRoot, db });
let archiveTail = Promise.resolve();
async function acquireArchiveLock() {
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  const previous = archiveTail;
  archiveTail = current;
  await previous;
  return release;
}
async function archive(input) {
  const release = await acquireArchiveLock();
  let settled = false;
  const unlock = () => { if (!settled) { settled = true; release(); } };
  try {
    const result = await archiveWriter(input);
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

function persistTurn(session, userContent, messages) {
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

/** 读原始二进制请求体（语音上传用）；超限就中断并报可读错误 */
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;
async function rawBody(request, limit = MAX_AUDIO_BYTES) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new Error(`音频过大（上限 ${Math.round(limit / 1024 / 1024)}MB），说短一点再试`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * 改写类调用要读的规范：本地规范文件里混着「投递策略」这类跟改写无关的章节，
 * 按标题关键字丢掉再喂，免得模型跑偏、也省 token。
 * 文件不存在就返回空串（提示词里那段会整段省略）。
 */
function readSpec(file, dropKeywords = []) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8")
    .split(/^(?=## )/mu)
    .filter((section) => !dropKeywords.some((keyword) => section.split("\n")[0].includes(keyword)))
    .join("")
    .trim();
}

/** 简历 / 自我介绍的规范正文（缓存：文件不变就不重复读） */
let specCache = { at: 0, resume: "", intro: "" };
function editingSpecs() {
  const now = Date.now();
  if (now - specCache.at < 5000) return specCache;
  specCache = {
    at: now,
    resume: readSpec(path.join(config.resumeDir, "简历设计规范.md"), ["投递策略", "面试话术文档规范"]),
    intro: readSpec(path.join(config.resumeDir, "自我介绍规范.md")),
  };
  return specCache;
}

function ruleSnapshot() {
  const skill = fs.readFileSync(path.join(config.appRoot, "skill", "SKILL.md"), "utf8");
  const handbook = fs.readFileSync(path.join(config.blogRoot, "面试宝典文章格式规范.md"), "utf8");
  const keyRules = handbook.split(/\r?\n/).filter((line) => /^\d+\. \*\*|^- \[ \]/u.test(line)).join("\n");
  return `${skill}\n\n# 面试宝典关键规则快照\n${keyRules}`;
}

/**
 * 出题时要避开「已经问过的题」。只取标题、不带答案和摘要（省 token，也足够模型避让）。
 * 本场：这场答过的 + 当前这题；跨场：同简历（岗位定制时再加同 JD）最近答过的。
 * 挂在 session 上临时传递，不落库。
 */
function askedQuestionTitles(session) {
  const rows = db.prepare(`
    SELECT a.question_title AS title
    FROM attempts a JOIN sessions s ON s.id = a.session_id
    WHERE a.session_id = ? OR (s.resume_path = ? AND (? = '' OR s.jd_path = ?))
    ORDER BY a.id DESC LIMIT 40
  `).all(session.id, session.resumePath, session.jdPath ?? "", session.jdPath ?? "");
  const titles = [];
  if (session.currentQuestion?.title) titles.push(session.currentQuestion.title);
  for (const row of rows) if (row.title && !titles.includes(row.title)) titles.push(row.title);
  return titles.slice(0, 20);
}

/** 人事面试（行为面）的题固定归到软素质文档 */
const HR_SERIES = "基础知识";
const HR_CHAPTER = "基础知识/协作交流.md";

/** 章节名（章节模式的考点表用章节名兜底第一节） */
function chapterNameOf(session) {
  return session.chapterPath ? path.basename(session.chapterPath, ".md") : "";
}

/**
 * 出题前的准备：算好「已经问过什么」和「本轮考哪个考点」。
 * 考点计划按「简历 + JD」（或简历 + 章节）缓存、游标跨场共享，所以这里每题只多一次 SQL 读，
 * 不会重复调模型。计划生成失败时留空，出题自动退回「整篇简历」的老路。
 */
async function prepareGeneration(session, count = 1) {
  session.askedQuestions = askedQuestionTitles(session);
  const plan = await ensurePlan({ db, agent, questionIndex, session, chapterName: chapterNameOf(session) });
  const focuses = takeFocuses(db, plan, count);
  if (!focuses.length) return;
  if (count > 1) { session.nextFocuses = focuses; return; }
  session.nextFocus = focuses[0];
  session.resumeSnippet = resumeSlice(session.resumeExcerpt, focuses[0]);
}

function messagesFor(sessionId) {
  return db.prepare("SELECT id,role,kind,content,payload,created_at AS createdAt FROM messages WHERE session_id=? ORDER BY id").all(sessionId)
    .map((row) => ({ ...row, payload: row.payload ? JSON.parse(row.payload) : null }));
}

async function conversationContext(sessionId, signal) {
  const memory = agentMemory(db, sessionId);
  const rows = agentHistory(db, sessionId, memory.throughMessageId);
  let state = compactHistoryText(rows, memory.summary);
  if (!state.compacted || rows.length <= 8) return state.context;

  const older = rows.slice(0, -8);
  let summary;
  try {
    summary = await piAgent.compact(older, memory.summary, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    console.warn(`会话 ${sessionId} 上下文压缩失败，使用裁剪兜底`, error);
    summary = compactHistoryText(older, memory.summary, 8_000).context;
  }
  saveAgentMemory(db, sessionId, summary, older.at(-1).id);
  return compactHistoryText(rows.slice(-8), summary).context;
}

async function api(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    await questionIndex.refresh();
    const resumeDir = config.resumeDir;
    return json(response, 200, { resumeDir, resumes: scanResumes(resumeDir), jobs: scanJobs(resumeDir), topics: questionIndex.topics(), embeddingEnabled: embeddingClient.enabled, embeddingModel: config.embedding.model || null, docsBaseUrl: config.docsBaseUrl, asrEnabled: asrEnabled(config.asr), asrModel: config.asr.model || null });
  }
  if (request.method === "POST" && url.pathname === "/api/resume/preview") {
    const input = await body(request);
    const target = String(input.path ?? "").trim();
    if (!isAllowedResume(target, config.resumeDir) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      return json(response, 400, { error: "只能预览简历目录下的简历" });
    }
    // 返回转换后的 Markdown 原文，便于确认「模型实际看到的是什么」
    const markdown = readResume(target);
    return json(response, 200, { markdown, chars: markdown.length });
  }
  // 自我介绍编辑：读 / 写 / 让模型改 / 历史版本 / 回滚。
  // 目录下可以放多份（技术面、HR 面…），请求带 file 指定；后端只从扫描结果里取，
  // 不接受拼出来的路径。文件在 src/private 下，写回后顺手提交给那个目录里的独立仓库。
  if (request.method === "GET" && url.pathname === "/api/self-intro") {
    const files = listSelfIntros(config.resumeDir).map(({ file, name }) => ({ file, name }));
    const current = readSelfIntro(config.resumeDir, url.searchParams.get("file") ?? "");
    return json(response, 200, {
      files,
      file: current.file,
      name: current.name,
      path: current.path,
      exists: current.exists,
      markdown: current.markdown,
      mtime: current.mtime,
      versioned: Boolean(current.repo),
    });
  }
  if (request.method === "GET" && url.pathname === "/api/self-intro/history") {
    const file = url.searchParams.get("file") ?? "";
    return json(response, 200, { commits: selfIntroHistory(config.resumeDir, file) });
  }
  if (request.method === "POST" && url.pathname === "/api/self-intro/history") {
    const input = await body(request);
    return json(response, 200, { markdown: readSelfIntroAt(config.resumeDir, String(input.file ?? ""), String(input.hash ?? "")) });
  }
  if (request.method === "POST" && url.pathname === "/api/self-intro/rollback") {
    const input = await body(request);
    const result = rollbackSelfIntro(config.resumeDir, String(input.file ?? ""), String(input.hash ?? ""));
    return json(response, 200, { ...result });
  }
  if (request.method === "POST" && url.pathname === "/api/self-intro") {
    const input = await body(request);
    const file = String(input.file ?? "");
    const markdown = String(input.markdown ?? "");
    if (!markdown.trim()) return json(response, 400, { error: "自我介绍不能为空" });
    // 编辑器打开期间文件被别处改过：先把磁盘上那份提交存档，再覆盖。
    // 不做「报冲突让你二选一」——那会卡住保存；先存档则两边都不会丢，git 里都能翻到。
    const current = readSelfIntro(config.resumeDir, file);
    const externallyChanged = current.exists
      && typeof input.baseMtime === "number"
      && Math.abs(current.mtime - input.baseMtime) > 1;
    const notices = [];
    if (externallyChanged) {
      const archived = commitSelfIntro(config.resumeDir, file, "自我介绍：外部改动存档（编辑器保存前自动存档）");
      notices.push(archived.committed
        ? `这个文件在编辑器外被改过，已先把外部版本存成 ${archived.hash}，再写入你现在的版本`
        : "这个文件在编辑器外被改过（当前内容与磁盘一致，无需额外存档）");
    }
    const written = writeSelfIntro(config.resumeDir, file, markdown);
    const commit = commitSelfIntro(config.resumeDir, file, String(input.message ?? "").trim() || "自我介绍：编辑器保存");
    return json(response, 200, { ...written, commit, externallyChanged, notices });
  }
  if (request.method === "POST" && url.pathname === "/api/self-intro/revise") {
    const input = await body(request);
    const markdown = String(input.markdown ?? "");
    const instruction = String(input.instruction ?? "").trim();
    if (!instruction) return json(response, 400, { error: "请说明想怎么改" });
    try {
      // history 是对话框里已有的那些话：带上它，模型才把「那教育经历那段呢」当成一句追问
      return json(response, 200, await agent.reviseSelfIntro({ markdown, instruction, spec: editingSpecs().intro, history: input.history }));
    } catch (error) {
      return json(response, 502, { error: error.message });
    }
  }
  // 语音转写：前端把 16kHz 单声道 WAV 直接传上来，这里转发给硅基流动（key 只在服务端）
  if (request.method === "POST" && url.pathname === "/api/asr") {
    if (!asrEnabled(config.asr)) return json(response, 400, { error: "未配置语音识别服务（.env 里缺 API Key）" });
    const contentType = String(request.headers["content-type"] || "audio/wav").split(";")[0].trim().toLowerCase();
    if (!contentType.startsWith("audio/")) return json(response, 400, { error: "只接受音频内容" });
    let audio;
    try { audio = await rawBody(request); }
    catch (error) { return json(response, 413, { error: error.message }); }
    if (!audio.length) return json(response, 400, { error: "音频内容为空" });
    try {
      const { text, duration } = await transcribe({ config: config.asr, buffer: audio, mime: contentType });
      return json(response, 200, { text, duration, model: config.asr.model });
    } catch (error) {
      return json(response, 502, { error: error.message });
    }
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
    return json(response, 200, { resumeDir: resolved, resumes: scanResumes(resolved), jobs: scanJobs(resolved) });
  }
  if (request.method === "POST" && url.pathname === "/api/sessions") {
    const input = await body(request);
    if (!isAllowedResume(input.resumePath, config.resumeDir) || !fs.existsSync(input.resumePath) || !fs.statSync(input.resumePath).isFile()) {
      return json(response, 400, { error: "只能选择简历目录下的 Markdown / TXT / HTML 简历" });
    }
    const mode = ["interview", "coding", "written", "jd", "hr"].includes(input.mode) ? input.mode : "interview";
    const jdMode = mode === "jd";
    // 人事面试不让人手选章节：行为面的题固定归到软素质文档，和岗位定制一样省掉这一步
    const hrMode = mode === "hr";
    if (hrMode && !questionIndex.topics().some((series) => series.chapters.some((chapter) => chapter.path === HR_CHAPTER))) {
      return json(response, 400, { error: `人事面试需要知识库里有 ${HR_CHAPTER}，当前索引里没有` });
    }
    // 目标岗位可选；岗位定制模式下则必填
    const jdPath = String(input.jdPath ?? "").trim();
    if (jdPath && (!isAllowedJob(jdPath, config.resumeDir) || !fs.existsSync(jdPath) || !fs.statSync(jdPath).isFile())) {
      return json(response, 400, { error: "目标岗位必须是简历目录下的 Markdown / TXT / HTML 文件" });
    }
    if (jdMode && !jdPath) return json(response, 400, { error: "岗位定制面试需要先选择目标岗位" });

    // 岗位定制、「全部」章节（chapterPath 留空）都不指定具体章节，由模型按题目内容决定归档位置。
    // 但「全部」仍然锁着分类，分类必须真实存在——否则会凭空造出一个新分类出来。
    if (!jdMode && !hrMode) {
      if (!questionIndex.topics().some((series) => series.name === input.series)) {
        return json(response, 400, { error: "请选择有效的知识分类" });
      }
      const wanted = String(input.chapterPath ?? "").trim();
      const validChapter = !wanted
        || questionIndex.topics().some((series) => series.name === input.series && series.chapters.some((chapter) => chapter.path === wanted));
      if (!validChapter) return json(response, 400, { error: "请选择有效的知识分类章节" });
    }
    const session = {
      id: randomUUID(), resumePath: input.resumePath,
      series: jdMode ? "岗位定制" : hrMode ? HR_SERIES : input.series,
      // 留空 = 选的是「全部」：本分类下由模型挑章节。岗位定制同样是空，只是它的分类也归模型定
      chapterPath: jdMode ? "" : hrMode ? HR_CHAPTER : String(input.chapterPath ?? "").trim(),
      mode,
      durationMinutes: Math.min(180, Math.max(5, Number(input.durationMinutes) || 30)), status: "active",
      startedAt: new Date().toISOString(), endedAt: null, currentQuestion: null, answerFragments: [], completedCount: 0,
      skillSnapshot: ruleSnapshot(), resumeExcerpt: readResume(input.resumePath).slice(0, 12_000),
      jdPath: jdPath || "",
      // readResume 对 .md/.txt 原样读、对 .html 转 Markdown，JD 也走同一条路
      jdExcerpt: jdPath ? readResume(jdPath).slice(0, 8_000) : "",
      paperQuestions: [], paperIndex: 0,
      pausedAt: null, pausedMs: 0,
    };
    if (session.mode === "written") {
      const count = Math.min(10, Math.max(3, Math.floor(session.durationMinutes / 6)));
      await prepareGeneration(session, count);
      session.paperQuestions = await agent.generatePaper({ session, count });
      session.currentQuestion = session.paperQuestions[0];
    } else {
      await prepareGeneration(session, 1);
      session.currentQuestion = await agent.generateQuestion({ session });
    }
    saveSession(db, session);
    addMessage(db, session.id, {
      role: "assistant", kind: "question",
      content: session.currentQuestion.prompt ?? session.currentQuestion.title,
      payload: focusPayload(session.nextFocus ?? session.nextFocuses?.[0]),
    });
    return json(response, 201, { session, messages: messagesFor(session.id) });
  }
  const messageMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/messages$/);
  if (request.method === "POST" && messageMatch) {
    if (sessionLocks.has(messageMatch[1])) return json(response, 409, { error: "当前会话正在处理上一条消息，请稍后重试" });
    sessionLocks.add(messageMatch[1]);
    let streamResponse = false;
    try {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(messageMatch[1]));
    if (!session) return json(response, 404, { error: "面试记录不存在" });
    // 暂停中不接受任何消息（含下一题/结束）：界面上这些都禁用了，这里是兜底。
    // 放在引擎之前，否则引擎只会笼统地说「面试已结束」，还会变成 500。
    if (session.status === "paused") return json(response, 409, { error: "面试已暂停，请先点「继续」" });
    if (session.status !== "active") return json(response, 409, { error: "面试已结束" });
    const input = await body(request);
    streamResponse = input.stream === true;
    const requestController = new AbortController();
    request.once("aborted", () => requestController.abort());
    response.once("close", () => { if (!response.writableEnded) requestController.abort(); });
    const emit = (event) => {
      if (!streamResponse || response.destroyed || response.writableEnded) return;
      if (!response.headersSent) response.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" });
      response.write(`${JSON.stringify(event)}\n`);
    };
    // 界面上「下一题」「结束」是按钮，直接指定动作，不经模型判断
    const action = input.action === "next" || input.action === "end" ? input.action : null;
    const content = String(input.content ?? "").trim();
    if (!action && !content) return json(response, 400, { error: "消息不能为空" });

    // 只有「下一题」会出题；出题前把已问过的题和本轮考点挂到 session 上供提示词使用
    if (action === "next") await prepareGeneration(session, 1);
    const history = action ? "" : await conversationContext(session.id, requestController.signal);
    const wasExpired = !action && expired(session);
    const result = action
      ? await advanceInterview({ session, ending: action === "end", agent, listAttempts })
      : await handleInterviewMessage({ session, text: content, piAgent, agent, archive, listAttempts, history, onEvent: emit, signal: requestController.signal });
    try {
      if (wasExpired && result.session.status === "active") {
        const ended = await advanceInterview({ session: result.session, ending: true, agent, listAttempts });
        result.messages.push(...ended.messages);
      }
      persistTurn(result.session, action ? null : content, result.messages);
      result.commitArchive?.();
    }
    catch (error) {
      await result.rollbackArchive?.();
      throw error;
    }
    const payload = { session: result.session, messages: messagesFor(session.id) };
    if (streamResponse) { emit({ type: "result", data: payload }); response.end(); return; }
    return json(response, 200, payload);
    } catch (error) {
      if (streamResponse) {
        if (!response.headersSent) response.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" });
        response.end(`${JSON.stringify({ type: "error", error: error.message || "AI 处理失败" })}\n`);
        return;
      }
      throw error;
    } finally { sessionLocks.delete(messageMatch[1]); }
  }
  // 暂停 / 继续：只改会话状态与暂停计时，不调用模型
  const pauseMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/(pause|resume)$/);
  if (request.method === "POST" && pauseMatch) {
    // 有消息正在处理时不能改状态：那条消息结束时会把旧快照写回，暂停会被覆盖掉
    if (sessionLocks.has(pauseMatch[1])) return json(response, 409, { error: "当前会话正在处理消息，请稍后重试" });
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(pauseMatch[1]));
    if (!session) return json(response, 404, { error: "面试记录不存在" });
    const resuming = pauseMatch[2] === "resume";
    if (resuming && session.status !== "paused") return json(response, 400, { error: "面试当前不在暂停中" });
    if (!resuming && session.status !== "active") {
      return json(response, 400, { error: session.status === "paused" ? "面试已经暂停了" : "面试已结束" });
    }
    const now = Date.now();
    // pausedAt 理论上不会为空，真遇到就按「本次暂停 0 毫秒」处理，别把 now 当成起点加进去
    const pausedAtMs = session.pausedAt ? new Date(session.pausedAt).getTime() : now;
    const next = resuming
      ? { ...session, status: "active", pausedAt: null, pausedMs: Number(session.pausedMs ?? 0) + Math.max(0, now - pausedAtMs) }
      : { ...session, status: "paused", pausedAt: new Date(now).toISOString() };
    saveSession(db, next);
    return json(response, 200, { session: next, messages: messagesFor(session.id) });
  }
  // 结束面试时选择「不保存」：丢弃这场会话记录（题目与回答已归档，不受影响）
  const discardMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/discard$/);
  if (request.method === "POST" && discardMatch) {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(discardMatch[1]));
    if (!session) return json(response, 404, { error: "面试记录不存在" });
    db.prepare("DELETE FROM messages WHERE session_id=?").run(session.id);
    db.prepare("DELETE FROM attempts WHERE session_id=?").run(session.id);
    db.prepare("DELETE FROM agent_memories WHERE session_id=?").run(session.id);
    db.prepare("DELETE FROM sessions WHERE id=?").run(session.id);
    return json(response, 200, { discarded: true });
  }
  const sessionMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)$/);
  if (request.method === "GET" && sessionMatch) {
    const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(sessionMatch[1]));
    return session ? json(response, 200, { session, messages: messagesFor(session.id) }) : json(response, 404, { error: "面试记录不存在" });
  }
  // 我的简历：按人分组列出、读写 HTML、生成 PDF（预览即导出，同一份文件同一个渲染器）
  if (request.method === "GET" && url.pathname === "/api/resume-doc") {
    const people = listResumeGroups(config.resumeDir).map((group) => ({
      id: group.id,
      label: group.label,
      resumes: group.resumes.map((item) => ({ file: item.file, name: item.name })),
    }));
    const wanted = url.searchParams.get("file") || people[0]?.resumes[0]?.file || "";
    const current = wanted ? readResumeDoc(config.resumeDir, wanted) : { file: "", name: "", path: "", html: "", mtime: null, repo: null };
    return json(response, 200, {
      people, file: current.file, name: current.name, path: current.path,
      html: current.html, mtime: current.mtime, versioned: Boolean(current.repo),
      exportDir: config.resumeExportDir, browser: findBrowser(config.browserPath),
    });
  }
  if (request.method === "POST" && url.pathname === "/api/resume-doc") {
    const input = await body(request);
    const file = String(input.file ?? "");
    const html = String(input.html ?? "");
    const current = readResumeDoc(config.resumeDir, file);
    const notices = [];
    if (current.mtime && typeof input.baseMtime === "number" && Math.abs(current.mtime - input.baseMtime) > 1) {
      const archived = commitResumeDoc(config.resumeDir, file, "简历：外部改动存档（编辑器保存前自动存档）");
      notices.push(archived.committed
        ? `这份简历在编辑器外被改过，已先把外部版本存成 ${archived.hash}，再写入你现在的版本`
        : "这份简历在编辑器外被改过（当前内容与磁盘一致，无需额外存档）");
    }
    const written = writeResumeDoc(config.resumeDir, file, html);
    const commit = commitResumeDoc(config.resumeDir, file, String(input.message ?? "").trim() || "简历：编辑器保存");
    return json(response, 200, { ...written, commit, notices });
  }
  if (request.method === "POST" && url.pathname === "/api/resume-doc/revise") {
    const input = await body(request);
    const instruction = String(input.instruction ?? "").trim();
    if (!instruction) return json(response, 400, { error: "请说明想怎么改" });
    try {
      // history 是对话框里已有的那些话：带上它，模型才把「那教育经历那段呢」当成一句追问
      return json(response, 200, await agent.reviseResume({ html: String(input.html ?? ""), instruction, spec: editingSpecs().resume, history: input.history }));
    } catch (error) {
      return json(response, 502, { error: error.message });
    }
  }
  // 预览与导出走同一条渲染：预览把 PDF 字节回给前端显示，导出直接写到配置目录（同名覆盖）
  if (request.method === "POST" && url.pathname === "/api/resume-doc/pdf") {
    const input = await body(request);
    const html = String(input.html ?? "");
    if (!html.trim()) return json(response, 400, { error: "简历内容不能为空" });
    const out = path.join(os.tmpdir(), `resume-preview-${process.pid}-${Date.now()}.pdf`);
    // 预览的是编辑器里还没保存的 HTML，但图片仍在简历目录里，得靠这份文件定位基准目录
    const source = resolveResumeDoc(config.resumeDir, String(input.file ?? ""));
    try {
      await htmlToPdf({ browser: config.browserPath, html, outPath: out, sourceFile: source?.path });
      const bytes = fs.readFileSync(out);
      response.writeHead(200, { "Content-Type": "application/pdf", "Content-Length": bytes.length, "Cache-Control": "no-store" });
      response.end(bytes);
      return;
    } catch (error) {
      return json(response, 500, { error: error.message });
    } finally {
      fs.rmSync(out, { force: true });
    }
  }
  // 原生目录 / 文件选择框：浏览器给不了真实路径，这里由服务端开系统对话框
  if (request.method === "POST" && url.pathname === "/api/pick") {
    const input = await body(request);
    try {
      const picked = await pickPath({ kind: String(input.kind ?? "folder"), start: String(input.start ?? ""), filter: String(input.filter ?? "") });
      return json(response, 200, picked ? { path: picked } : { cancelled: true });
    } catch (error) {
      return json(response, 500, { error: error.message });
    }
  }
  // 导出目录可改：写回 .env，下次启动仍是这个目录
  if (request.method === "POST" && url.pathname === "/api/resume-doc/export-dir") {
    const input = await body(request);
    const dir = String(input.dir ?? "").trim();
    if (!dir) return json(response, 400, { error: "导出目录不能为空" });
    const resolved = path.resolve(dir);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
      return json(response, 400, { error: `目录不存在或不是文件夹：${resolved}` });
    }
    try {
      updateEnvFile(path.join(config.appRoot, ".env"), "INTERVIEW_RESUME_EXPORT_DIR", resolved);
    } catch (error) {
      return json(response, 400, { error: error.message });
    }
    config.resumeExportDir = resolved;
    return json(response, 200, { exportDir: resolved });
  }
  if (request.method === "POST" && url.pathname === "/api/resume-doc/export") {
    const input = await body(request);
    const html = String(input.html ?? "");
    if (!html.trim()) return json(response, 400, { error: "简历内容不能为空" });
    const file = resolveResumeDoc(config.resumeDir, String(input.file ?? ""));
    if (!file) return json(response, 400, { error: "没有这份简历" });
    const name = pdfFileName(input.name, file.name);
    const out = path.join(config.resumeExportDir, name);
    try {
      await htmlToPdf({ browser: config.browserPath, html, outPath: out, sourceFile: file.path });
      return json(response, 200, { path: out, name, bytes: fs.statSync(out).size });
    } catch (error) {
      return json(response, 500, { error: error.message });
    }
  }
  // 真实面试记录（本人一手材料）与模拟面试并列展示，靠 kind 区分
  if (request.method === "POST" && url.pathname === "/api/real-interviews/detail") {
    const input = await body(request);
    try {
      const detail = readRealInterview(config.realInterviewDir, input.id, { knowledgeRoot: config.knowledgeRoot });
      return json(response, 200, { ...detail, docsBaseUrl: config.docsBaseUrl });
    } catch (error) {
      return json(response, 404, { error: error.message });
    }
  }
  if (request.method === "GET" && url.pathname === "/api/history") {
    const rows = db.prepare(`SELECT id,series,chapter_path AS chapterPath,resume_path AS resumePath,mode,status,
      started_at AS startedAt,ended_at AS endedAt,duration_minutes AS durationMinutes,
      completed_count AS completedCount FROM sessions ORDER BY started_at DESC`).all();
    const stats = attemptStats(new Set(rows.map((row) => row.id)));
    const real = listRealInterviews(config.realInterviewDir);
    // 两边各自已按时间倒序，这里合并后再排一次，真实面试才能插在正确的位置
    const merged = [
      ...rows.map((row) => {
        const stat = stats.get(row.id);
        return {
          ...row,
          kind: "session",
          questionCount: stat?.questions.size ?? 0,
          archivedCount: stat?.archived.size ?? 0,
          averageScore: averageScore(stat?.scores),
        };
      }),
      ...real,
    ].sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
    return json(response, 200, merged);
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
      const release = await acquireArchiveLock();
      let result;
      try {
        result = await refileQuestion({
          agent, questionIndex, knowledgeRoot: config.knowledgeRoot, privateHistoryRoot: config.privateHistoryRoot,
          chapterPath: session.chapterPath, title: attempt.question_title, standardAnswer,
        });
      } finally { release(); }
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
  const ext = path.extname(file);
  // index.html 必须每次回源：它指向带哈希的资源文件名，缓存住就会一直加载旧版页面，
  // 表现是"改了代码但页面没变"。带哈希的 js/css 内容变了文件名就变，可以长缓存。
  const cacheControl = ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable";
  response.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": cacheControl });
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
      const result = await advanceInterview({ session, ending: true, agent, listAttempts });
      persistTurn(result.session, null, result.messages);
    } catch (error) {
      console.error(`会话 ${session.id} 自动结束失败`, error);
    } finally { sessionLocks.delete(session.id); }
  }
}, 5_000).unref();

server.listen(config.port, config.host, () => console.log(`面试助手：http://${config.host}:${config.port}`));
