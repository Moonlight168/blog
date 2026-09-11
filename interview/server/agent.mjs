import { apiUrl } from "./config.mjs";

function parseJson(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("模型未返回 JSON 对象");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export class InterviewAgent {
  constructor({ config, questionIndex }) {
    this.config = config;
    this.questionIndex = questionIndex;
  }

  async #json(system, user) {
    if (!this.config.baseUrl || !this.config.apiKey || !this.config.model) {
      throw new Error("尚未配置 INTERVIEW_CHAT_BASE_URL / API_KEY / MODEL");
    }
    const response = await fetch(apiUrl(this.config.baseUrl, "chat/completions"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
    });
    if (!response.ok) throw new Error(`对话模型返回 HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    const payload = await response.json();
    return parseJson(payload.choices?.[0]?.message?.content ?? "");
  }

  async classify({ session, text }) {
    return this.#json(
      `判断用户消息在面试中的动作，只返回 JSON：{"action":"answer|followup|next|end"}。技术追问和要求澄清属于 followup；对当前题作答属于 answer。\n规则快照：${session.skillSnapshot}`,
      `当前题：${session.currentQuestion.title}\n用户消息：${text}`,
    );
  }

  async generateQuestion({ session }) {
    const samples = this.questionIndex.samples(session.chapterPath, 5);
    const result = await this.#json(
      `你是严格的中文技术面试官。围绕指定章节并结合简历生成一道新的、真实面试口吻的问题，不编号、不加星标、一次只问一个核心任务。标准答案必须遵守《面试宝典文章格式规范》：第一行是记忆锚点；之后是1到6个“数字. **关键词**：简短主句”的一级要点，可用恰好3个空格缩进的“-”作为二级补充；不得使用三级标题；总计不超过15行。只返回 JSON：{"title":"以？结尾的问题","prompt":"向候选人展示的问题","standardAnswer":"标准答案"}。\n当前会话规则快照：\n${session.skillSnapshot}`,
      `Series：${session.series}\n章节：${session.chapterPath}\n面试模式：${session.mode}\n简历摘要：${session.resumeExcerpt}\n章节已有题目样例（避免照抄）：${JSON.stringify(samples)}`,
    );
    result.standardAnswer = result.standardAnswer ?? result.standard_answer;
    if (!result.title?.match(/[？?]$/u) || !result.standardAnswer) throw new Error("模型生成的题目结构不完整");
    return result;
  }

  async generatePaper({ session, count }) {
    const samples = this.questionIndex.samples(session.chapterPath, 5);
    const result = await this.#json(
      `你是中文技术笔试出题人。一次生成 ${count} 道彼此不同、难度递进的书面题。每题只考一个核心任务，不编号、不加星标。标准答案格式：先一行记忆锚点，再给1到6个“数字. **关键词**：不超过30字主句”的要点，可用3空格缩进的二级列表；总计不超过15行。只返回 JSON：{"questions":[{"title":"以？结尾","prompt":"题目","standardAnswer":"标准答案"}]}。\n规则快照：${session.skillSnapshot}`,
      `Series：${session.series}\n章节：${session.chapterPath}\n简历摘要：${session.resumeExcerpt}\n已有题目样例：${JSON.stringify(samples)}`,
    );
    if (!Array.isArray(result.questions) || result.questions.length !== count) throw new Error("模型未生成完整书面试卷");
    return result.questions;
  }

  async evaluate({ question, rawAnswer, session }) {
    const result = await this.#json(
      `你是技术面试官。根据题目和标准答案点评候选人的累计回答。客观指出亮点、缺口和更好表述，只返回 JSON：{"score":0到100,"comment":"中文点评"}。\n规则快照：${session.skillSnapshot}`,
      `题目：${question.title}\n标准答案：${question.standardAnswer || "无"}\n候选人回答：${rawAnswer}`,
    );
    return { score: Number(result.score ?? 0), comment: String(result.comment ?? "暂无点评") };
  }

  async answerFollowup({ session, text }) {
    const result = await this.#json(
      `你是正在面试的中文技术面试官。简洁回应候选人对当前题的澄清或技术追问，不泄露完整标准答案。只返回 JSON：{"reply":"内容"}。\n规则快照：${session.skillSnapshot}`,
      `当前题：${session.currentQuestion.title}\n追问：${text}`,
    );
    return result.reply;
  }

  async judgeDuplicate({ title, candidates }) {
    if (!candidates.length) return { kind: "new" };
    return this.#json(
      "判断新题与候选题是否语义等价。只返回 JSON：{\"kind\":\"existing|new\",\"questionId\":\"匹配ID或空字符串\"}。只有考察目标实质相同才算 existing。",
      `新题：${title}\n候选：${JSON.stringify(candidates)}`,
    );
  }

  async summarize({ session }) {
    const result = await this.#json(
      `生成简洁中文面试总结，只返回 JSON：{"summary":"内容"}。\n规则快照：${session.skillSnapshot}`,
      `主题：${session.series}/${session.chapterPath}\n已点评题数：${session.completedCount ?? 0}`,
    );
    return result.summary;
  }
}
