import { HttpError, type Route } from "./router.ts";
import { API } from "../../shared/routes.ts";
import { config } from "../infra/config/index.ts";
import { db, embeddingClient, questionIndex, readHistorySection } from "../context.ts";

function required(query: URLSearchParams, name: string, label: string): string {
  const value = String(query.get(name) ?? "").trim();
  if (!value) throw new HttpError(400, `缺少${label}`);
  return value;
}

export default [
  {
    method: "GET",
    pattern: API.questionsSearch,
    handler: async ({ query }) => {
      const text = required(query, "query", "查询内容");
      if (text.length > 200) throw new HttpError(400, "查询内容不能超过 200 字");
      const topK = Math.min(25, Math.max(1, Number(query.get("topK")) || 5));
      await questionIndex.refresh();
      return { ...(await questionIndex.search(text, topK)), embeddingModel: config.embedding.model || null };
    },
  },
  {
    method: "POST",
    pattern: API.questionsReindex,
    handler: async ({ body }) => {
      if (body.force !== undefined && typeof body.force !== "boolean") {
        throw new HttpError(400, "force 必须是布尔值");
      }
      if (body.force) {
        // 先等在飞的刷新结束，避免清空后又被旧的刷新结果覆盖
        await questionIndex.refresh();
        db.prepare("UPDATE questions SET embedding=NULL, embedding_model=NULL").run();
      }
      const result = await questionIndex.refresh();
      return { ...result, embeddingEnabled: embeddingClient.enabled, embeddingModel: config.embedding.model || null };
    },
  },
  {
    /** 按章节抽题（复习页） */
    method: "POST",
    pattern: API.questionsPick,
    handler: ({ body }) => {
      const chapterPath = String(body.chapterPath ?? "").trim();
      if (!chapterPath) throw new HttpError(400, "请选择章节");
      const count = Math.min(50, Math.max(1, Number(body.count) || 10));
      try {
        return { questions: questionIndex.pick(chapterPath, count) };
      } catch (error) {
        throw new HttpError(400, (error as Error).message);
      }
    },
  },
  {
    /** 某道题的历史作答（读私有答题记录，不改任何东西） */
    method: "GET",
    pattern: API.questionsAnswers,
    handler: ({ query }) => {
      const chapterPath = required(query, "chapterPath", "章节");
      const title = required(query, "title", "题目标题");
      try {
        return readHistorySection({ privateHistoryRoot: config.privateHistoryRoot, chapterPath, title });
      } catch (error) {
        throw new HttpError(400, (error as Error).message);
      }
    },
  },
] as Route[];
