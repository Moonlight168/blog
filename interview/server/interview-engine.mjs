const NEXT_RE = /^(下一题|下一个|next)$/iu;
const END_RE = /^(结束|结束面试|到此为止|end)$/iu;

export class InterviewEngine {
  constructor({ agent, archive, listAttempts }) {
    this.agent = agent;
    this.archive = archive;
    this.listAttempts = listAttempts;
  }

  async handle(session, text) {
    if (session.status !== "active") throw new Error("面试已结束");
    const input = text.trim();

    // 界面上切题/结束都是按钮。这两行只是兜底，防止习惯性打字被当成回答打分写进答题历史。
    if (NEXT_RE.test(input)) return this.advance(session, false);
    if (END_RE.test(input)) return this.advance(session, true);

    const classified = await this.agent.classify({ session, text: input });
    if (classified.action === "followup") {
      const reply = await this.agent.answerFollowup({ session, text: input });
      return { session, messages: [{ role: "assistant", kind: "followup", content: reply }] };
    }
    return this.#answer(session, input);
  }

  /**
   * 一条消息就是一次回答——立刻点评，并把标准答案讲出来。
   * （不再累积：原来要等「下一题」才点评，中间只能回一句静态的“已记录”。）
   */
  async #answer(session, input) {
    const question = session.currentQuestion;
    const evaluation = await this.agent.evaluate({ question, rawAnswer: input, session });
    const archived = await this.archive({ session, question, rawAnswer: input, evaluation });
    session.completedCount = (session.completedCount ?? 0) + 1;
    return {
      session,
      messages: [
        { role: "assistant", kind: "evaluation", content: evaluation.comment, evaluation },
        ...(archived?.notice
          ? [{ role: "assistant", kind: "notice", content: `${archived.notice}。这次回答已记录，可在「复习」里看到。` }]
          : []),
        { role: "assistant", kind: "answer", content: question.standardAnswer || "（这道题暂无标准答案）" },
      ],
    };
  }

  /** 按钮触发：出下一题，或结束并给出总评。 */
  async advance(session, ending) {
    const messages = [];
    const nextPaperIndex = (session.paperIndex ?? 0) + 1;
    const paperFinished = session.mode === "written" && nextPaperIndex >= (session.paperQuestions?.length ?? 0);

    if (ending || paperFinished) {
      session.status = "completed";
      session.endedAt = new Date().toISOString();
      const attempts = this.listAttempts?.(session.id) ?? [];
      messages.push({ role: "assistant", kind: "summary", content: await this.agent.summarize({ session, attempts }) });
      return { session, messages };
    }

    let next;
    if (session.mode === "written") {
      session.paperIndex = nextPaperIndex;
      next = session.paperQuestions[nextPaperIndex];
    } else {
      next = await this.agent.generateQuestion({ session });
    }
    session.currentQuestion = next;
    messages.push({ role: "assistant", kind: "question", content: next.prompt ?? next.title });
    return { session, messages };
  }
}
