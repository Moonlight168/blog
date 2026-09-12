import { apiUrl } from "./config.mjs";

/**
 * 分类/点评/查重/总评这些要求判定稳定的调用用低温；
 * 出题、出卷、重写要用高温，否则同样的输入会反复给出同一批题。
 */
const STABLE_TEMPERATURE = 0.35;
const CREATIVE_TEMPERATURE = 0.85;

/** 已问题目清单只取标题、不带答案摘要——省 token，又足够让模型避开重复 */
function askedBlock(session) {
  const asked = (session.askedQuestions ?? []).filter(Boolean);
  if (!asked.length) return "";
  return `已经问过的题目（不要重复，也不要换汤不换药地改问法）：\n${asked.map((title) => `- ${title}`).join("\n")}\n`;
}

/** 把「本轮只考哪个考点」写进提示词；第二轮起要求换角度深挖，而不是再问一遍同一个事实 */
function focusBlock(next) {
  if (!next?.label) return "";
  const round = next.round > 1 ? `，第 ${next.round} 轮` : "";
  return `本轮要考察的考点（第 ${next.index}/${next.total} 个${round}）：${next.label}\n`
    + (next.section ? `出自简历板块：${next.section}\n` : "")
    + (next.intent ? `考察意图：${next.intent}\n` : "")
    + (next.round > 1 ? `这个考点前面已经问过一轮，这次换一个更深的角度，不要再问同一个事实性问题。\n` : "")
    + `只围绕这一个考点出题，不要跳到别的板块。\n`;
}

/** 把本轮要覆盖的多个考点写成清单（书面测评一次出多题时用） */
function focusListBlock(list = []) {
  if (!list.length) return "";
  return `本轮要覆盖的考点（每题一个、按顺序，不要重复）：\n`
    + list.map((item) => `${item.index}. ${item.label}${item.intent ? `——${item.intent}` : ""}`).join("\n") + "\n";
}

/** 有考点计划时只发该考点相关的那一段简历；没有就退回整篇 */
function resumeBlock(session) {
  return session.resumeSnippet
    ? `简历相关段落：\n${session.resumeSnippet}\n`
    : `简历摘要：${session.resumeExcerpt}\n`;
}

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

  async #json(system, user, temperature = STABLE_TEMPERATURE) {
    if (!this.config.baseUrl || !this.config.apiKey || !this.config.model) {
      throw new Error("尚未配置 INTERVIEW_CHAT_BASE_URL / API_KEY / MODEL");
    }
    const response = await fetch(apiUrl(this.config.baseUrl, "chat/completions"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
      body: JSON.stringify({
        model: this.config.model,
        temperature,
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
      + `两者都像时判 followup——宁可少记一次回答，也不要把提问当成回答写进答题历史。`,
      `当前题：${session.currentQuestion.title}\n候选人消息：${text}`,
    );
  }

  async generateQuestion({ session }) {
    // 岗位定制模式没有指定章节，由模型判断这道题该归到哪个章节与分类
    const jdMode = session.mode === "jd";
    const seriesNames = jdMode ? this.questionIndex.topics().map((item) => item.name) : [];

    const system = `你是严格的中文技术面试官。`
      + (jdMode
        ? `围绕目标岗位 JD 与候选人简历生成一道新的、真实面试口吻的问题——考察 JD 里强调、而简历中值得深挖的能力。`
        : `围绕指定章节并结合简历生成一道新的、真实面试口吻的问题。`)
      + `不编号、不加星标、一次只问一个核心任务。`
      // 格式细节只保留在下方规则快照里一处，不再在正文重复一遍（原先两处都写，纯属重复注入）
      + `标准答案严格按下方「当前会话规则快照」里的格式写，不要加开场白或额外说明。`
      + (jdMode
        ? `另外判断这道题该归到哪个章节：topic 必填、不能为空，是简短的章节名（如“JVM 调优”“分布式事务”）；`
          + `series 必须从这些现有知识分类里挑一个最贴近的：${seriesNames.join("、")}。`
          + `只返回 JSON：{"title":"以？结尾的问题","prompt":"向候选人展示的问题","standardAnswer":"标准答案","topic":"章节名","series":"分类名"}。`
        : `只返回 JSON：{"title":"以？结尾的问题","prompt":"向候选人展示的问题","standardAnswer":"标准答案"}。`)
      + `给了目标岗位 JD 时，优先考察 JD 里强调的能力，不要问与该岗位无关的方向。\n`
      + `当前会话规则快照：\n${session.skillSnapshot}`;
    // 顺序是有意的：模式/简历/JD 在一次会话里都不变，放前面才能命中上下文缓存；
    // 每次都变的「已问过的题」追加在最末尾，只让尾巴变化。
    const user = (jdMode ? `面试模式：岗位定制（不限定章节）\n` : `知识分类：${session.series}\n章节：${session.chapterPath}\n`)
      + `面试模式：${session.mode}\n`
      + (session.jdExcerpt ? `目标岗位 JD：\n${session.jdExcerpt}\n` : "")
      // 以下三块每次都变，放在稳定前缀之后，尽量保住缓存命中
      + resumeBlock(session)
      + focusBlock(session.nextFocus)
      + askedBlock(session);

    // 出题走高温，偶尔会漏字段（实测漏过 topic）。给它一次补的机会，别让整道题出不来。
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const result = await this.#json(system, user, CREATIVE_TEMPERATURE);
      result.standardAnswer = result.standardAnswer ?? result.standard_answer;
      const broken = !result.title?.match(/[？?]$/u) || !result.standardAnswer
        ? "模型生成的题目结构不完整"
        : (jdMode && !String(result.topic ?? "").trim() ? "模型没有给出这道题归属的章节" : "");
      if (!broken) return result;
      if (attempt === 2) throw new Error(broken);
    }
    throw new Error("模型生成的题目结构不完整");
  }

  /**
   * 把简历 + JD 拆成**按简历板块顺序**的有序考点表（一次调用）。
   * 只要结构、不产标准答案，所以不注入格式规范快照——输入能省一半以上。
   */
  async outlineResume({ session }) {
    return this.#json(
      `你在帮面试官准备提问提纲。按简历本身的板块顺序（先专业技能、再实习经历、最后项目经历）拆出可考察的考点。`
      + `每个实习/项目拆 2 到 3 个考点，要落到具体技术点或取舍上，不要写成“了解某技术”这类泛泛的话。\n`
      + `section 填简历里的板块名（如“专业技能”“实习经历”“项目经历”）；`
      + `anchor 填该考点所属段落开头的关键词（项目名或公司名，用来回查简历原文）；`
      + `intent 用一句话说明这道题想考什么。\n`
      + `只返回 JSON：{"focuses":[{"section":"板块名","anchor":"段落关键词","label":"考点名","intent":"考察意图"}]}，最多 18 条。`,
      `简历：\n${session.resumeExcerpt}\n`
      + (session.jdExcerpt ? `目标岗位 JD：\n${session.jdExcerpt}\n` : "")
      + `JD 里强调的能力，对应的考点要排进去并适当靠前。`,
      STABLE_TEMPERATURE,
    );
  }

  async generatePaper({ session, count }) {
    const result = await this.#json(
      `你是中文技术笔试出题人。一次生成 ${count} 道彼此不同、难度递进的书面题。每题只考一个核心任务，不编号、不加星标。`
      + `标准答案严格按下方「规则快照」里的格式写（记忆锚点 + 编号要点 + 3 空格缩进的二级补充，≤15 行）。`
      + `只返回 JSON：{"questions":[{"title":"以？结尾","prompt":"题目","standardAnswer":"标准答案"}]}。`
      + `给了目标岗位 JD 时，优先考察 JD 里强调的能力。\n`
      + `规则快照：${session.skillSnapshot}`,
      `知识分类：${session.series}\n章节：${session.chapterPath}\n简历摘要：${session.resumeExcerpt}\n`
      + (session.jdExcerpt ? `目标岗位 JD：\n${session.jdExcerpt}\n` : "")
      + focusListBlock(session.nextFocuses)
      + askedBlock(session),
      CREATIVE_TEMPERATURE,
    );
    if (!Array.isArray(result.questions) || result.questions.length !== count) throw new Error("模型未生成完整书面试卷");
    return result.questions;
  }

  async evaluate({ question, rawAnswer, session }) {
    const result = await this.#json(
      `你是技术面试官。根据题目和标准答案点评候选人的回答。客观指出亮点、缺口和更好表述。`
      + `comment 用 markdown 组织（要点用短列表或加粗关键词），不要写成一整段。`
      + `只返回 JSON：{"score":0到100,"comment":"中文点评"}。`,
      `题目：${question.title}\n标准答案：${question.standardAnswer || "无"}\n候选人回答：${rawAnswer}`,
    );
    return { score: Number(result.score ?? 0), comment: String(result.comment ?? "暂无点评") };
  }

  async answerFollowup({ session, text }) {
    const result = await this.#json(
      `你是正在面试的中文技术面试官。简洁回应候选人对当前题的澄清或技术追问，不泄露完整标准答案。只返回 JSON：{"reply":"内容"}。`,
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
      CREATIVE_TEMPERATURE,
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
      + `不要自己写场均分或总分，那一行由系统统一给出。`,
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
