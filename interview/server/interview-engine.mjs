const NEXT_RE = /^(下一题|下一个|next)$/iu;
const END_RE = /^(结束|结束面试|到此为止|end)$/iu;

export class InterviewEngine {
  constructor({ agent, archive }) {
    this.agent = agent;
    this.archive = archive;
  }

  async handle(session, text) {
    if (session.status !== "active") throw new Error("面试已结束");
    const input = text.trim();
    if (NEXT_RE.test(input)) return this.#advance(session, false);
    if (END_RE.test(input)) return this.#advance(session, true);

    const classified = await this.agent.classify({ session, text: input });
    if (classified.action === "end") return this.#advance(session, true);
    if (classified.action === "next") return this.#advance(session, false);
    if (classified.action === "followup") {
      const reply = await this.agent.answerFollowup({ session, text: input });
      return { session, messages: [{ role: "assistant", kind: "followup", content: reply }] };
    }

    session.answerFragments.push(input);
    return {
      session,
      messages: [{ role: "assistant", kind: "ack", content: "已记录。你可以继续补充、追问，或输入“下一题”。" }],
    };
  }

  async #advance(session, ending) {
    const messages = [];
    if (session.answerFragments.length) {
      const rawAnswer = session.answerFragments.join("\n");
      const evaluation = await this.agent.evaluate({ question: session.currentQuestion, rawAnswer, session });
      await this.archive({ session, question: session.currentQuestion, rawAnswer, evaluation });
      messages.push({ role: "assistant", kind: "evaluation", content: evaluation.comment, evaluation });
      session.completedCount = (session.completedCount ?? 0) + 1;
    }
    if (ending) {
      session.status = "completed";
      session.endedAt = new Date().toISOString();
      session.answerFragments = [];
      messages.push({ role: "assistant", kind: "summary", content: await this.agent.summarize({ session }) });
      return { session, messages };
    }
    const next = await this.agent.generateQuestion({ session });
    session.currentQuestion = next;
    session.answerFragments = [];
    messages.push({ role: "assistant", kind: "question", content: next.prompt ?? next.title });
    return { session, messages };
  }
}
