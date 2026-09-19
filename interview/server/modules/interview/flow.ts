import { focusPayload } from "./plan.ts";
import { EVENT } from "../../../shared/events.ts";
import type { Message, Session } from "../../../shared/types.ts";

const NEXT_RE = /^(下一题|下一个|next)$/iu;
const END_RE = /^(结束|结束面试|到此为止|end)$/iu;

function fallbackSummary(attempts: Array<{ title: string; score: number; comment: string }>): string {
  if (!attempts.length) return "本场面试已结束。本场没有形成可评分的回答，建议下一场先完整回答 2～3 道题再查看能力趋势。";
  const average = Math.round(attempts.reduce((sum, item) => sum + Number(item.score || 0), 0) / attempts.length);
  const weakest = [...attempts].sort((a, b) => Number(a.score || 0) - Number(b.score || 0)).slice(0, 3).map((item) => item.title).join("、");
  return `**场均分：${average}/100**\n\n**当前短板**：${weakest || "暂未暴露明显短板"}\n\n**下一场重点**：优先复习低分题并重新口述一遍。`;
}

export interface TurnResult {
  session: Session;
  messages: Message[];
  /** 归档写了盘还没提交；这一轮落库成功后才 commit，失败就 rollback */
  commitArchive?: () => void;
  rollbackArchive?: () => Promise<void>;
}

export async function handleInterviewMessage({ session, text, piAgent, agent, archive, listAttempts, onEvent, signal }: any): Promise<TurnResult> {
  if (session.status !== "active") throw new Error("面试已结束");
  const input = text.trim();
  if (NEXT_RE.test(input)) return advanceInterview({ session, ending: false, agent, listAttempts });
  if (END_RE.test(input)) return advanceInterview({ session, ending: true, agent, listAttempts });

  const decision = await piAgent.run({ session, text: input, onEvent, signal });
  signal?.throwIfAborted();
  if (decision.action === "followup") {
    return { session, messages: [{ role: "assistant", kind: "followup", content: decision.reply }] };
  }
  const evaluation = decision.evaluation;
  onEvent?.({ type: EVENT.evaluation, evaluation });
  onEvent?.({ type: EVENT.stage, stage: "archiving" });
  const question = session.currentQuestion;
  // 没有当前题目就无从归档 —— 说清楚，别让它到下面以「读 undefined 的 title」崩掉
  if (!question) throw new Error("这一轮没有当前题目，无法归档");
  const archived = await archive({ session, question, rawAnswer: input, evaluation });
  if (signal?.aborted) {
    await archived?.rollback?.();
    signal.throwIfAborted();
  }
  session.completedCount = (session.completedCount ?? 0) + 1;
  return {
    session,
    commitArchive: archived?.commit,
    rollbackArchive: archived?.rollback,
    messages: [
      { role: "assistant" as const, kind: "evaluation", content: evaluation.comment, evaluation },
      ...(archived?.notice ? [{ role: "assistant" as const, kind: "notice", content: `${archived.notice}。这次回答已记录，可在「复习」里看到。` }] : []),
      { role: "assistant", kind: "answer", content: session.currentQuestion?.standardAnswer || "（这道题暂无标准答案）" },
    ] as Message[],
  };
}

export async function advanceInterview({ session, ending, agent, listAttempts }: any): Promise<TurnResult> {
  const messages: Message[] = [];
  const nextPaperIndex = (session.paperIndex ?? 0) + 1;
  const paperFinished = session.mode === "written" && nextPaperIndex >= (session.paperQuestions?.length ?? 0);
  if (ending || paperFinished) {
    session.status = "completed";
    session.endedAt = new Date().toISOString();
    const attempts = listAttempts?.(session.id) ?? [];
    let summary;
    try { summary = await agent.summarize({ session, attempts }); }
    catch { summary = fallbackSummary(attempts); }
    return { session, messages: [{ role: "assistant", kind: "summary", content: summary }] };
  }
  let next;
  if (session.mode === "written") {
    session.paperIndex = nextPaperIndex;
    next = session.paperQuestions[nextPaperIndex];
  } else {
    next = await agent.generateQuestion({ session });
  }
  session.currentQuestion = next;
  messages.push({ role: "assistant" as const, kind: "question", content: next.prompt ?? next.title, payload: focusPayload(session.nextFocus) });
  return { session, messages };
}
