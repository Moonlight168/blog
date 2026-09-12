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
      `判断候选人这条消息是「回答」还是「追问」，只返回 JSON：{"action":"answer|followup"}。`
      + `疑问句、求解释、要例子、问范围（如“这里指生产环境吗”“G1 和 CMS 有什么区别”）属于 followup；`
      + `陈述对当前题的理解，或表态“不会/不知道/没接触过”，属于 answer。`
      + `两者都像时判 followup——宁可少记一次回答，也不要把提问当成回答写进答题历史。\n`
      + `规则快照：${session.skillSnapshot}`,
      `当前题：${session.currentQuestion.title}\n候选人消息：${text}`,
    );
  }

  async generateQuestion({ session }) {
    // 岗位定制模式没有指定章节，由模型判断这道题该归到哪个章节与分类
    const jdMode = session.mode === "jd";
    const samples = this.questionIndex.samples(session.chapterPath, 5);
    const seriesNames = jdMode ? this.questionIndex.topics().map((item) => item.name) : [];

    const result = await this.#json(
      `你是严格的中文技术面试官。`
      + (jdMode
        ? `围绕目标岗位 JD 与候选人简历生成一道新的、真实面试口吻的问题——考察 JD 里强调、而简历中值得深挖的能力。`
        : `围绕指定章节并结合简历生成一道新的、真实面试口吻的问题。`)
      + `不编号、不加星标、一次只问一个核心任务。`
      + `标准答案必须遵守《面试宝典文章格式规范》：第一行是记忆锚点；`
      + `之后是1到6个“数字. **关键词**：主句”的一级要点——冒号后到行尾的这段文字就是主句，必须不超过30字，`
      + `细节、命令、举例一律放到下一行的二级补充里（用恰好3个空格缩进的“-”）；`
      + `不得使用三级标题；总计不超过15行。`
      + (jdMode
        ? `另外判断这道题该归到哪个章节：topic 是简短的章节名（如“JVM 调优”“分布式事务”）；`
          + `series 必须从这些现有知识分类里挑一个最贴近的：${seriesNames.join("、")}。`
          + `只返回 JSON：{"title":"以？结尾的问题","prompt":"向候选人展示的问题","standardAnswer":"标准答案","topic":"章节名","series":"分类名"}。`
        : `只返回 JSON：{"title":"以？结尾的问题","prompt":"向候选人展示的问题","standardAnswer":"标准答案"}。`)
      + `给了目标岗位 JD 时，优先考察 JD 里强调的能力，不要问与该岗位无关的方向。\n`
      + `当前会话规则快照：\n${session.skillSnapshot}`,
      (jdMode ? `面试模式：岗位定制（不限定章节）\n` : `知识分类：${session.series}\n章节：${session.chapterPath}\n`)
      + `面试模式：${session.mode}\n简历摘要：${session.resumeExcerpt}\n`
      + (session.jdExcerpt ? `目标岗位 JD：\n${session.jdExcerpt}\n` : "")
      + `章节已有题目样例（避免照抄）：${JSON.stringify(samples)}`,
    );
    result.standardAnswer = result.standardAnswer ?? result.standard_answer;
    if (!result.title?.match(/[？?]$/u) || !result.standardAnswer) throw new Error("模型生成的题目结构不完整");
    if (jdMode && !String(result.topic ?? "").trim()) throw new Error("模型没有给出这道题归属的章节");
    return result;
  }

  async generatePaper({ session, count }) {
    const samples = this.questionIndex.samples(session.chapterPath, 5);
    const result = await this.#json(
      `你是中文技术笔试出题人。一次生成 ${count} 道彼此不同、难度递进的书面题。每题只考一个核心任务，不编号、不加星标。`
      + `标准答案格式：先一行记忆锚点，再给1到6个“数字. **关键词**：主句”的要点——冒号后到行尾的这段文字就是主句，必须不超过30字，`
      + `细节放到3空格缩进的二级列表里；总计不超过15行。`
      + `只返回 JSON：{"questions":[{"title":"以？结尾","prompt":"题目","standardAnswer":"标准答案"}]}。`
      + `给了目标岗位 JD 时，优先考察 JD 里强调的能力。\n`
      + `规则快照：${session.skillSnapshot}`,
      `知识分类：${session.series}\n章节：${session.chapterPath}\n简历摘要：${session.resumeExcerpt}\n`
      + (session.jdExcerpt ? `目标岗位 JD：\n${session.jdExcerpt}\n` : "")
      + `已有题目样例：${JSON.stringify(samples)}`,
    );
    if (!Array.isArray(result.questions) || result.questions.length !== count) throw new Error("模型未生成完整书面试卷");
    return result.questions;
  }

  async evaluate({ question, rawAnswer, session }) {
    const result = await this.#json(
      `你是技术面试官。根据题目和标准答案点评候选人的回答。客观指出亮点、缺口和更好表述。`
      + `comment 用 markdown 组织（要点用短列表或加粗关键词），不要写成一整段。`
      + `只返回 JSON：{"score":0到100,"comment":"中文点评"}。\n规则快照：${session.skillSnapshot}`,
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

  /**
   * 模型写出的标准答案偶尔不合《格式规范》。归档时用同一个模型按规范重写一遍，
   * 好过把整道题丢掉。只返回 JSON：{"standardAnswer":"重写后的完整答案"}。
   */
  async reformatAnswer({ question, errors = [] }) {
    const result = await this.#json(
      `下面这道面试题的标准答案不符合《面试宝典文章格式规范》，请按规范重写，内容不要删减也不要新增事实。\n`
      + `规范：第一行是记忆锚点；之后是 1 到 6 个“数字. **关键词**：主句”的一级要点——`
      + `冒号后到行尾的这段文字就是主句，必须不超过 30 字，细节、命令、举例一律挪到下一行的二级补充里`
      + `（用恰好 3 个空格缩进的“-”）；不得使用三级标题；总计不超过 15 行。\n`
      + `只返回 JSON：{"standardAnswer":"重写后的完整答案"}。`
      + (errors.length ? `\n上次校验未通过：${errors.join("；")}` : ""),
      `题目：${question.title}\n原答案：\n${question.standardAnswer ?? ""}`,
    );
    return String(result.standardAnswer ?? "");
  }

  async judgeDuplicate({ title, candidates }) {
    if (!candidates.length) return { kind: "new" };
    return this.#json(
      "判断新题与候选题是否语义等价。只返回 JSON：{\"kind\":\"existing|new\",\"questionId\":\"匹配ID或空字符串\"}。只有考察目标实质相同才算 existing。",
      `新题：${title}\n候选：${JSON.stringify(candidates)}`,
    );
  }

  async summarize({ session, attempts = [] }) {
    // 必须带上满分：只给一个「5 分」，模型会以为 5 是满分、再自行脑补「实际得 0 分」
    const scored = attempts
      .map((item) => `· ${item.title}（得分 ${item.score}/100）${item.comment ? `—— 点评：${item.comment}` : ""}`)
      .join("\n");
    const result = await this.#json(
      `生成中文面试总评，只返回 JSON：{"level":"...","weak":"...","next":"..."}。\n`
      + `level：一句话概括整体水平，可带分数。\n`
      + `weak：具体偏弱的知识点，用顿号分隔；没有明显弱项就写“暂未暴露明显短板”。\n`
      + `next：1 到 3 条具体可执行的练习建议，用分号分隔。\n`
      + `不要泛泛鼓励（“表现不错继续加油”这类等于没说）。`
      + `逐题记录里的「得分 N/100」就是该题实际得分，引用时必须原样照抄，不要换算、也不要推测它“应该”得几分。`
      + `只依据给出的点评判断候选人会什么、不会什么，不要根据题目本身臆测他答过什么。`
      + `给了目标岗位 JD 时，「下一场重点」要落到该岗位最看重、而候选人目前最弱的那块。`
      + `不要自己写场均分或总分，那一行由系统统一给出。\n`
      + `规则快照：${session.skillSnapshot}`,
      `主题：${session.series}/${session.chapterPath}\n已点评 ${session.completedCount ?? 0} 次\n`
      + (session.jdExcerpt ? `目标岗位 JD：\n${session.jdExcerpt}\n` : "")
      + `逐题记录：\n${scored || "（本场没有点评记录）"}`,
    );
    // 场均分由服务端算，不让模型碰数字——否则它会自己编
    const average = attempts.length
      ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length)
      : null;
    // 固定格式由服务端拼装：靠提示词约束排版不可靠，模型会漏行、丢加粗
    return [
      `**本场场均分**：${average === null ? "本场没有点评记录" : `${average}/100（${attempts.length} 题）`}`,
      `**整体水平**：${result.level || "暂无评估"}`,
      `**薄弱题型**：${result.weak || "暂未暴露明显短板"}`,
      `**下一场重点**：${result.next || "暂无建议"}`,
    ].join("\n");
  }
}
