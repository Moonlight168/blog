import { HttpError, type Route } from "./router.ts";
import { PATTERN } from "../../shared/routes.ts";
import { config } from "../infra/config/index.ts";
import { refileQuestion } from "../modules/archive/index.ts";
import { normalizeTitle } from "../modules/question/text.ts";
import { agent, db, questionIndex, rowToSession, withArchiveLock } from "../context.ts";

/**
 * 补录：把一场面试里被跳过的那道题重新归档进知识库。
 *
 * 路径挂在 interviews 下（入口在面试详情页），但它是**归档域**的操作 ——
 * 校验、写题块、写答题历史全在 modules/archive 里，这里只做参数准备与串行化。
 */
export default [
  {
    method: "POST",
    pattern: PATTERN.interviewArchiveAnswer,
    handler: async ({ params }) => {
      const session = rowToSession(db.prepare("SELECT * FROM sessions WHERE id=?").get(params.id) as never);
      if (!session) throw new HttpError(404, "面试记录不存在");
      const attempt = db.prepare("SELECT * FROM attempts WHERE id=? AND session_id=?").get(Number(params.index), session.id);
      if (!attempt) throw new HttpError(404, "作答记录不存在");

      const title = String(attempt.question_title);
      // 已经入库就直接返回，避免重复追加
      const already = db.prepare("SELECT source_path,history_url FROM questions WHERE normalized_title=?").get(normalizeTitle(title));
      if (already) return { historyUrl: already.history_url, sourcePath: already.source_path };

      // 标准答案优先用归档时存下的；旧记录没存，就用会话当前题兜底
      const current = session.currentQuestion as any;
      const fallback = current && normalizeTitle(current.title) === normalizeTitle(title) ? current.standardAnswer : "";
      const standardAnswer = String(attempt.standard_answer) || fallback || "";
      if (!standardAnswer) throw new HttpError(400, "这题的标准答案没有留存，无法补录");

      const result = await withArchiveLock(() => refileQuestion({
        agent,
        questionIndex,
        knowledgeRoot: config.knowledgeRoot,
        privateHistoryRoot: config.privateHistoryRoot,
        chapterPath: session.chapterPath,
        title,
        standardAnswer,
      }));
      if (!result.ok) throw new HttpError(400, `补录失败：${result.reason}`);
      if (!attempt.standard_answer) db.prepare("UPDATE attempts SET standard_answer=? WHERE id=?").run(standardAnswer, attempt.id);
      return { historyUrl: result.historyUrl, sourcePath: session.chapterPath };
    },
  },
] as Route[];
