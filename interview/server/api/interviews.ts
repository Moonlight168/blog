import fs from "node:fs";
import { randomUUID } from "node:crypto";

import { HttpError, type Route } from "./router.ts";
import { asRows } from "../db/index.ts";
import { API, PATTERN } from "../../shared/routes.ts";
import { config } from "../infra/config/index.ts";
import { isAllowedJob, isAllowedResume, readResume } from "../context.ts";
import { EVENT } from "../../shared/events.ts";
import { slugify } from "../modules/archive/format.ts";
import { normalizeTitle } from "../modules/question/text.ts";
import { expired } from "../modules/interview/timer.ts";
import { deleteAgentSession } from "../agent/session.ts";
import { removeWorkspace, workspacePathOf } from "../agent/workspace.ts";
import { advanceInterview, handleInterviewMessage } from "../modules/interview/flow.ts";
import { listRealInterviews, readRealInterview } from "../modules/interview/real.ts";
import {
  HR_CHAPTER, HR_SERIES, agent, archive, attemptStats, averageScore,
  db, focusPayload, messagesFor, persistTurn, piAgent, prepareGeneration, questionIndex,
  rowToSession, ruleSnapshot, sessionLocks, listAttempts,
} from "../context.ts";

function requireSession(id: string) {
  const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(id) as never);
  if (!session) throw new HttpError(404, "面试记录不存在");
  return session;
}

export default [
  {
    /**
     * 建会话：校验简历 / 岗位 / 章节，冻结规则快照与简历摘要，出第一道题。
     * 冻结是有意的 —— 会话中途改规范不该影响已在跑的这场。
     */
    method: "POST",
    pattern: API.interviews,
    status: 201,
    handler: async ({ body }) => {
      if (!isAllowedResume(body.resumePath, config.resumeDir) || !fs.existsSync(body.resumePath) || !fs.statSync(body.resumePath).isFile()) {
        throw new HttpError(400, "只能选择简历目录下的 Markdown / TXT / HTML 简历");
      }
      const mode = ["interview", "coding", "written", "jd", "hr"].includes(body.mode) ? body.mode : "interview";
      const jdMode = mode === "jd";
      // 人事面试不让人手选章节：行为面的题固定归到软素质文档，和岗位定制一样省掉这一步
      const hrMode = mode === "hr";
      if (hrMode && !questionIndex.topics().some((series: any) => series.chapters.some((chapter: any) => chapter.path === HR_CHAPTER))) {
        throw new HttpError(400, `人事面试需要知识库里有 ${HR_CHAPTER}，当前索引里没有`);
      }
      const jdPath = String(body.jdPath ?? "").trim();
      if (jdPath && (!isAllowedJob(jdPath, config.resumeDir) || !fs.existsSync(jdPath) || !fs.statSync(jdPath).isFile())) {
        throw new HttpError(400, "目标岗位必须是简历目录下的 Markdown / TXT / HTML 文件");
      }
      if (jdMode && !jdPath) throw new HttpError(400, "岗位定制面试需要先选择目标岗位");

      // 岗位定制、「全部」章节（chapterPath 留空）都不指定具体章节，由模型按题目内容决定归档位置。
      // 但「全部」仍然锁着分类，分类必须真实存在 —— 否则会凭空造出一个新分类出来。
      if (!jdMode && !hrMode) {
        if (!questionIndex.topics().some((series: any) => series.name === body.series)) {
          throw new HttpError(400, "请选择有效的知识分类");
        }
        const wanted = String(body.chapterPath ?? "").trim();
        const validChapter = !wanted
          || questionIndex.topics().some((series: any) => series.name === body.series && series.chapters.some((chapter: any) => chapter.path === wanted));
        if (!validChapter) throw new HttpError(400, "请选择有效的知识分类章节");
      }

      const session = {
        id: randomUUID(),
        resumePath: body.resumePath,
        series: jdMode ? "岗位定制" : hrMode ? HR_SERIES : body.series,
        // 留空 = 选的是「全部」：本分类下由模型挑章节。岗位定制同样是空，只是它的分类也归模型定
        chapterPath: jdMode ? "" : hrMode ? HR_CHAPTER : String(body.chapterPath ?? "").trim(),
        mode,
        durationMinutes: Math.min(180, Math.max(5, Number(body.durationMinutes) || 30)),
        status: "active",
        startedAt: new Date().toISOString(),
        endedAt: null,
        currentQuestion: null,
        completedCount: 0,
        skillSnapshot: ruleSnapshot(),
        resumeExcerpt: readResume(body.resumePath).slice(0, 12_000),
        jdPath: jdPath || "",
        // readResume 对 .md/.txt 原样读、对 .html 转 Markdown，JD 也走同一条路
        jdExcerpt: jdPath ? readResume(jdPath).slice(0, 8_000) : "",
        paperQuestions: [],
        paperIndex: 0,
        pausedAt: null,
        pausedMs: 0,
      } as any;

      if (session.mode === "written") {
        const count = Math.min(10, Math.max(3, Math.floor(session.durationMinutes / 6)));
        await prepareGeneration(session, count);
        session.paperQuestions = await agent.generatePaper({ session, count });
        session.currentQuestion = session.paperQuestions[0];
      } else {
        await prepareGeneration(session, 1);
        session.currentQuestion = await agent.generateQuestion({ session });
      }
      persistTurn(session, null, [{
        role: "assistant",
        kind: "question",
        content: session.currentQuestion.prompt ?? session.currentQuestion.title,
        payload: focusPayload(session.nextFocus ?? session.nextFocuses?.[0]),
      }]);
      return { session, messages: messagesFor(session.id) };
    },
  },
  {
    /** 面试记录列表：模拟面试与真实面试按时间合并，靠 kind 区分 */
    method: "GET",
    pattern: API.interviews,
    handler: () => {
      const rows = db.prepare(`SELECT id,series,chapter_path AS chapterPath,resume_path AS resumePath,mode,status,
        started_at AS startedAt,ended_at AS endedAt,duration_minutes AS durationMinutes,
        completed_count AS completedCount FROM sessions ORDER BY started_at DESC`).all();
      const stats = attemptStats(new Set(rows.map((row) => String(row.id))));
      const real = listRealInterviews(config.realInterviewDir);
      // 两边各自已按时间倒序，这里合并后再排一次，真实面试才能插在正确的位置
      return [
        ...rows.map((row) => {
          const stat = stats.get(String(row.id));
          return {
            ...row,
            kind: "session",
            questionCount: stat?.questions.size ?? 0,
            archivedCount: stat?.archived.size ?? 0,
            averageScore: averageScore(stat?.scores),
          };
        }),
        ...real,
      ].sort((a: any, b: any) => (b.startedAt || "").localeCompare(a.startedAt || ""));
    },
  },
  {
    /** 真实面试记录（本人一手材料） */
    method: "GET",
    pattern: PATTERN.realInterview,
    handler: ({ params }) => {
      try {
        const detail = readRealInterview(config.realInterviewDir, params.id, { knowledgeRoot: config.knowledgeRoot });
        return { ...detail, docsBaseUrl: config.docsBaseUrl };
      } catch (error) {
        throw new HttpError(404, (error as Error).message);
      }
    },
  },
  {
    /** 面试进行中的轮询：会话状态 + 已有消息 */
    method: "GET",
    pattern: PATTERN.interview,
    handler: ({ params }) => {
      const session = requireSession(params.id);
      return { session, messages: messagesFor(session.id) };
    },
  },
  {
    /** 逐题点评与归档链接（历史详情页用） */
    method: "GET",
    pattern: PATTERN.interviewReport,
    handler: ({ params }) => {
      const session = requireSession(params.id);
      const attempts = asRows<{ id: number; questionTitle: string; rawAnswer: string; evaluation: string; createdAt: string }>(
        db.prepare("SELECT id,question_title AS questionTitle,raw_answer AS rawAnswer,evaluation,created_at AS createdAt FROM attempts WHERE session_id=? ORDER BY id").all(session.id),
      )
        .map((row) => {
          // 反查题库，才知道这题归档到了哪里（没进知识库的题就查不到）
          const question = db.prepare("SELECT source_path,history_url FROM questions WHERE normalized_title=?").get(normalizeTitle(String(row.questionTitle)));
          return {
            ...row,
            evaluation: JSON.parse(String(row.evaluation)),
            historyUrl: question?.history_url ?? null,
            sourcePath: question?.source_path ?? null,
            // 带锚点，否则只能落到知识库页面顶部、还得自己往下翻。
            // 锚点用 slugify 生成，与 VuePress 渲染出的 h2 id 一致（已实测比对）。
            knowledgeUrl: question?.source_path
              ? `/series/knowledge/${String(question.source_path).replace(/\.md$/, ".html")}#${slugify(String(row.questionTitle))}`
              : null,
          };
        });
      const titles = new Set(attempts.map((item) => item.questionTitle));
      const archived = new Set(attempts.filter((item) => item.historyUrl).map((item) => item.questionTitle));
      return {
        session,
        messages: messagesFor(session.id),
        attempts,
        docsBaseUrl: config.docsBaseUrl,
        questionCount: titles.size,
        archivedCount: archived.size,
        averageScore: averageScore(attempts.map((item: any) => Number(item.evaluation?.score ?? 0))),
      };
    },
  },
  {
    /** 一轮问答。带 stream:true 时走 NDJSON，事件由 handler 自己写。 */
    method: "POST",
    pattern: PATTERN.interviewMessages,
    stream: true,
    handler: async ({ params, body, request, response }) => {
      const id = params.id;
      if (sessionLocks.has(id)) throw new HttpError(409, "当前会话正在处理上一条消息，请稍后重试");
      sessionLocks.add(id);

      let streamResponse = body.stream === true;
      try {
        const session = requireSession(id);
        // 暂停中不接受任何消息（含下一题/结束）：界面上这些都禁用了，这里是兜底。
        // 放在引擎之前，否则引擎只会笼统地说「面试已结束」，还会变成 500。
        if (session.status === "paused") throw new HttpError(409, "面试已暂停，请先点「继续」");
        if (session.status !== "active") throw new HttpError(409, "面试已结束");

        const requestController = new AbortController();
        request.once("aborted", () => requestController.abort());
        response.once("close", () => { if (!response.writableEnded) requestController.abort(); });
        const emit = (event: unknown) => {
          if (!streamResponse || response.destroyed || response.writableEnded) return;
          if (!response.headersSent) response.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive" });
          response.write(`${JSON.stringify(event)}\n`);
        };

        // 界面上「下一题」「结束」是按钮，直接指定动作，不经模型判断
        const action = body.action === "next" || body.action === "end" ? body.action : null;
        const content = String(body.content ?? "").trim();
        if (!action && !content) throw new HttpError(400, "消息不能为空");

        // 只有「下一题」会出题；出题前把已问过的题和本轮考点挂到 session 上供提示词使用
        if (action === "next") await prepareGeneration(session, 1);
        const wasExpired = !action && expired(session);
        const result = action
          ? await advanceInterview({ session, ending: action === "end", agent, listAttempts })
          : await handleInterviewMessage({
              session, text: content, piAgent, agent, archive, listAttempts,
              onEvent: emit, signal: requestController.signal,
            });

        try {
          if (wasExpired && result.session.status === "active") {
            const ended = await advanceInterview({ session: result.session, ending: true, agent, listAttempts });
            result.messages.push(...ended.messages);
          }
          persistTurn(result.session, action ? null : content, result.messages);
          result.commitArchive?.();
        } catch (error) {
          await result.rollbackArchive?.();
          throw error;
        }

        const payload = { session: result.session, messages: messagesFor(session.id) };
        emit({ type: EVENT.result, data: payload });
        if (streamResponse) {
          if (!response.headersSent) response.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" });
          response.end();
          return { handled: true };
        }
        return payload;
      } catch (error) {
        if (streamResponse) {
          if (!response.headersSent) response.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" });
          response.end(`${JSON.stringify({ type: EVENT.error, error: (error as Error).message || "AI 处理失败" })}\n`);
          return { handled: true };
        }
        throw error;
      } finally {
        sessionLocks.delete(id);
      }
    },
  },
  {
    /** 暂停 / 继续：只改会话状态与暂停计时，不调用模型 */
    method: "POST",
    pattern: PATTERN.interviewPause,
    handler: ({ params }) => setPaused(params.id, true),
  },
  {
    method: "POST",
    pattern: PATTERN.interviewResume,
    handler: ({ params }) => setPaused(params.id, false),
  },
  {
    /** 结束面试时选择「不保存」：丢弃这场会话记录（题目与回答已归档，不受影响） */
    method: "POST",
    pattern: PATTERN.interviewDiscard,
    handler: ({ params }) => {
      const session = requireSession(params.id);
      db.prepare("DELETE FROM messages WHERE session_id=?").run(session.id);
      db.prepare("DELETE FROM attempts WHERE session_id=?").run(session.id);
      db.prepare("DELETE FROM agent_memories WHERE session_id=?").run(session.id);
      db.prepare("DELETE FROM sessions WHERE id=?").run(session.id);
      return { discarded: true };
    },
  },
] as Route[];

function setPaused(id: string, resume: boolean) {
  // 有消息正在处理时不能改状态：那条消息结束时会把旧快照写回，暂停会被覆盖掉
  if (sessionLocks.has(id)) throw new HttpError(409, "当前会话正在处理消息，请稍后重试");
  const session = requireSession(id);
  if (resume && session.status !== "paused") throw new HttpError(400, "面试当前不在暂停中");
  if (!resume && session.status !== "active") {
    throw new HttpError(400, session.status === "paused" ? "面试已经暂停了" : "面试已结束");
  }
  const now = Date.now();
  // pausedAt 理论上不会为空，真遇到就按「本次暂停 0 毫秒」处理，不能把 now 当成起点加进去
  const pausedAtMs = session.pausedAt ? new Date(session.pausedAt).getTime() : now;
  const next = resume
    ? { ...session, status: "active", pausedAt: null, pausedMs: Number(session.pausedMs ?? 0) + Math.max(0, now - pausedAtMs) }
    : { ...session, status: "paused", pausedAt: new Date(now).toISOString() };
  persistTurn(next as any, null, []);
  return { session: next, messages: messagesFor(session.id) };
}
