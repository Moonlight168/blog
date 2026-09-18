import { COMMIT_SUBJECT_SPEC } from "./commit-subject.mjs";
import { apiUrl } from "./config.mjs";
import { MAX_PROSE_LINES } from "./markdown.mjs";
import { friendlyNetworkError, httpStatusHint } from "./net.mjs";

/**
 * 分类/点评/查重/总评这些要求判定稳定的调用用低温；
 * 出题、出卷、重写要用高温，否则同样的输入会反复给出同一批题。
 */
const STABLE_TEMPERATURE = 0.35;
const CREATIVE_TEMPERATURE = 0.85;

/**
 * 「改稿还是答问」的判断规则，两个对话框共用——原来简历和自我介绍各写一份，
 * 改一处漏一处迟早长歪。
 *
 * 关键是把**「改」这个字**和**改稿指令**分开：实测「如果投递的岗位是 agent 开发，
 * 怎么修正比较好 先改个人优势」被当成了改稿指令，其实那是在问怎么改、并指出先说哪一段，
 * 不是让人动手。
 */
const REVISE_DECISION_RULE = `先判断他这句话是在「让你去做」还是在「问你」——看句式最可靠：\n`
  + `- revise：**祈使句**，他让你把某处改成某个样子。`
  + `「把个人优势改成更贴合 Agent 岗位的写法」「压缩到两行」「删掉最后一条」「技能区调个顺序」都属于这类；`
  + `说得粗（「把个人优势改改」）也算。照做：JSON 的正文里给改好的全文，reply 说清改了什么（口语，不要分点）。\n`
  + `- answer：**疑问句**，或者陈述句里让你先分析、评估、比较。`
  + `「怎么修正比较好」「要不要改」「会不会太长」「这样行不行」「该突出哪个」都属于这类。`
  + `只写 reply，正文留空，**一个字都不要动稿子**。\n`
  + `- 同一句里既有问又有指路时看主体：「如果投递 Agent 岗，怎么修正比较好 先改个人优势」主体是那个问，`
  + `后面半句是在给分析划范围（先从个人优势说起），不是在让你动手——判 answer。\n`
  + `- 分不清就判 answer：改稿有副作用（覆盖内容、要重新预览），宁可不改，等他明确要求。\n`
  // 对话框按 markdown 渲染，所以 reply 里该用就用——不分点会被读成一坨
  + `- reply 用 markdown 写（**加粗**、列表、\`行内代码\`、必要时分段），前端会渲染出来，`
  + `别把几条建议挤成一大段。只有 revise 的那句话保持简短口语，因为它是动作说明不是分析。`;


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

  /**
   * 发一次对话请求，失败重试一次。
   *
   * 重试的是「再问一次就好」的那类失败：模型偶发会在 JSON 模式下回一段散文
   * （实测在多轮对话里遇到过，同样的请求换一次就正常），以及网络抽一下。
   * 没有这层重试，用户会在对话框里看到「这次没成功：模型未返回 JSON 对象」，
   * 而且是碰运气式的——同一句话有时行有时不行，最难排查。
   */
  async #chat(messages, temperature = STABLE_TEMPERATURE, options = {}) {
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        return await this.#chatOnce(messages, temperature, { ...options, attempt });
      } catch (error) {
        lastError = error;
        console.warn(JSON.stringify({ event: "ai_interaction", operation: options.operation ?? "chat", status: "error", attempt, retryable: error.retryable !== false }));
        if (error.retryable === false) break;
      }
    }
    throw lastError;
  }

  /** 真正发请求的那一次；重试策略在 #chat 里 */
  async #chatOnce(messages, temperature = STABLE_TEMPERATURE, { operation = "chat", maxTokens = 1_600, attempt = 1 } = {}) {
    if (!this.config.baseUrl || !this.config.apiKey || !this.config.model) {
      throw new Error("尚未配置 INTERVIEW_CHAT_BASE_URL / API_KEY / MODEL");
    }
    const url = apiUrl(this.config.baseUrl, "chat/completions");
    const startedAt = Date.now();
    let response;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
        body: JSON.stringify({
          model: this.config.model,
          temperature,
          response_format: { type: "json_object" },
          max_tokens: maxTokens,
          messages,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        const timeout = new Error("对话模型响应超时，请重试");
        timeout.retryable = true;
        throw timeout;
      }
      // 网络不可用：别把 undici 的 "fetch failed" 直接甩给用户
      throw new Error(friendlyNetworkError(error, { what: "对话模型服务", url }) ?? error.message);
    } finally { clearTimeout(timer); }
    if (!response.ok) {
      const error = new Error(`对话模型返回 HTTP ${response.status}${httpStatusHint(response.status)}：${(await response.text()).slice(0, 300)}`);
      error.retryable = response.status === 429 || response.status >= 500;
      throw error;
    }
    let payload;
    try { payload = await response.json(); }
    catch { throw new Error("对话模型返回的不是合法 JSON（可能网络中断），请重试"); }
    const content = payload.choices?.[0]?.message?.content ?? "";
    try {
      const result = parseJson(content);
      console.info(JSON.stringify({
        event: "ai_interaction", operation, promptVersion: `${operation}-v1`, model: this.config.model,
        durationMs: Date.now() - startedAt, attempt, usage: payload.usage ?? null,
      }));
      return result;
    } catch (error) {
      // 把原文挂上：调用方要能分清「模型压根没按 JSON 回」和「JSON 坏了」——
      // 前者是可以兜的（它就是说了段话），后者只能报错。
      error.raw = content;
      throw error;
    }
  }

  /** 单轮的便捷写法：一段系统提示 + 一句用户话 */
  async #json(system, user, temperature = STABLE_TEMPERATURE, options = {}) {
    return this.#chat([{ role: "system", content: system }, { role: "user", content: user }], temperature, options);
  }

  /**
   * 人事面试（行为面）：问经历、动机、协作、稳定性这类问题，不问技术细节。
   * 标准答案写成候选人**当场会说的第一人称口语**，不是分点笔记——行为面背要点没用，
   * 面试官要听的是你怎么把事情讲下来。
   */
  async #generateHrQuestion({ session }) {
    const system = `你是正在做人事面试（HR 面）的面试官。围绕候选人的简历经历问一个真实 HR 会问的问题：`
      + `学生干部或竞赛、团队协作与沟通、为什么换实习、职业规划、稳定性、抗压、最有成就感的事、优缺点这类。`
      + `不问技术细节（不问 JVM、并发、框架原理），考的是经历与做事方式。`
      + `不编号、不加星标、一次只问一个。\n`
      + `标准答案写成候选人当场会说的第一人称回答，严格两段：\n`
      + `第一行——锚点，必须带反引号，照抄这个形状（实测漏过反引号，会被归档校验打回）：\n`
      + `**锚点**：\`一行要点\`\n`
      + `反引号里是简短的一行口诀，不是整句话；不要写成“记忆锚点”或别的前缀。\n`
      + `之后——一段口语，2 到 ${MAX_PROSE_LINES} 行、不分点、不用编号，直接回答，不加旁白也不解释这道题在考什么；\n`
      + `只讲简历里真有的经历，不编；没有的就如实说没有，再把话题转到自己真做过的事上。\n`
      + `只返回 JSON：{"title":"以？结尾的问题","prompt":"向候选人展示的问题","standardAnswer":"标准答案"}。`;
    const user = `面试模式：人事面试（行为面）\n`
      + (session.jdExcerpt ? `目标岗位 JD 摘要：\n${session.jdExcerpt.slice(0, 2_000)}\n` : "")
      + resumeBlock(session)
      + focusBlock(session.nextFocus)
      + askedBlock(session);

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const result = await this.#json(system, user, CREATIVE_TEMPERATURE, { operation: "question_hr", maxTokens: 1_800 });
      result.standardAnswer = result.standardAnswer ?? result.standard_answer;
      const broken = !result.title?.match(/[？?]$/u) || !result.standardAnswer ? "模型生成的题目结构不完整" : "";
      if (!broken) return result;
      if (attempt === 2) throw new Error(broken);
    }
    throw new Error("模型生成的题目结构不完整");
  }

  async generateQuestion({ session }) {
    if (session.mode === "hr") return this.#generateHrQuestion({ session });
    // 岗位定制模式没有指定章节，由模型判断这道题该归到哪个章节与分类
    const jdMode = session.mode === "jd";
    // 「不指定章节」的两种：岗位定制（分类也归模型挑）和「全部」（分类由会话定、章节在本分类里挑）
    const openMode = jdMode || !String(session.chapterPath ?? "").trim();
    // 分类连同其下已有章节一起给它：只给分类名的时候，模型看不见「集合」「多线程」已经存在，
    // 会把跨两章的问题合并成一个新章节名（实测造出过「Java 集合与并发」），于是知识库越分越碎。
    // 岗位定制给全部分类；「全部」只给会话选定的那一个，免得题被归到别的分类下。
    const catalog = jdMode
      ? this.questionIndex.topics()
      : (openMode ? this.questionIndex.topics().filter((item) => item.name === session.series) : []);
    const seriesNames = catalog.map((item) => item.name);
    const chapterCatalog = catalog
      .map((item) => `- ${item.name}：${(item.chapters ?? []).map((chapter) => chapter.name).join("、")}`)
      .join("\n");
    // 「全部」模式下分类是锁死的，列章节名就够。带上「分类：」前缀会被模型照抄进 topic
    // （实测返回过「Agent 开发：langgraph」），那会新建出一个带前缀的章节文件。
    const scopedChapterNames = (catalog[0]?.chapters ?? []).map((chapter) => chapter.name).join("、");

    const system = `你是严格的中文技术面试官。`
      + (jdMode
        ? `围绕目标岗位 JD 与候选人简历生成一道新的、真实面试口吻的问题——考察 JD 里强调、而简历中值得深挖的能力。`
        : openMode
          ? `围绕「${session.series}」这个方向**岗位上普遍要求的技能**，结合候选人简历生成一道新的、真实面试口吻的问题。`
          : `围绕指定章节并结合简历生成一道新的、真实面试口吻的问题。`)
      + `不编号、不加星标、一次只问一个核心任务。`
      // 格式细节只保留在下方规则快照里一处，不再在正文重复一遍（原先两处都写，纯属重复注入）
      + `标准答案严格按下方「当前会话规则快照」里的格式写，不要加开场白或额外说明。`
      // 不点明的话，标准答案会写成「如订单列表按状态分组」这种放之四海皆可的模板，背了也没用
      + `标准答案用第一人称讲简历里真实做过的事（点名项目名、技术栈或具体业务场景），不要用“如订单列表…”这类占位示例；`
      // 只说「落到简历上」它会写成「对应简历那版…」——站在文档外面讲解，候选人当场没法这么说
      + `但不要出现“简历”“对应简历那版”这类旁白，也不要解释这道题在考什么，直接给当场能背出来的答案。`
      + (openMode
        ? `另外判断这道题该归到哪个章节：topic 必填、不能为空。优先从下面列出的已有章节里原样挑一个——`
          + `题目同时牵涉两个章节时，挑最贴近的那一个，不要合并两章造一个新名字；`
          + (jdMode
            ? `只有确实没有任何已有章节覆盖这道题时才新建，新章节名要简短。`
              + `series 必须从这些现有知识分类里挑一个最贴近的：${seriesNames.join("、")}。\n`
              + `各分类已有章节：\n${chapterCatalog}\n`
              + `只返回 JSON：{"title":"以？结尾的问题","prompt":"向候选人展示的问题","standardAnswer":"标准答案","topic":"章节名","series":"分类名"}。`
            : // 选「全部」时已有章节只是**归档去处**，不该限制问什么：
              // 选题依据是「这个方向的岗位普遍要求什么」，库里没有的就新建一个 topic 收下它
              `本分类下已有的章节没覆盖到的，就为它新建一个 topic。\n`
              + `注意：出什么题不受已有章节限制——已有章节是归档去处，不是选题范围；`
              + `选题依据是「这个方向的岗位普遍要求什么技能」，市场常见而库里还没有的（比如新出的框架、工具），`
              + `就新建一个简短的 topic 名（如「langchain」「向量数据库」）收下它。\n`
              + `但别为了新而新：拿不准某个技能算不算这个方向的岗位必备时，宁可不问它。\n`
              + (scopedChapterNames
                ? `本分类已有章节（能归进去就归进去）：${scopedChapterNames}\n`
                : `本分类下还没有章节，这道题直接新建一个。\n`)
              + `只返回 JSON：{"title":"以？结尾的问题","prompt":"向候选人展示的问题","standardAnswer":"标准答案","topic":"章节名"}。`)
        : `只返回 JSON：{"title":"以？结尾的问题","prompt":"向候选人展示的问题","standardAnswer":"标准答案"}。`)
      + `给了目标岗位 JD 时，优先考察 JD 里强调的能力，不要问与该岗位无关的方向。\n`
      + `当前会话规则快照：\n${session.skillSnapshot}`;
    // 顺序是有意的：模式/简历/JD 在一次会话里都不变，放前面才能命中上下文缓存；
    // 每次都变的「已问过的题」追加在最末尾，只让尾巴变化。
    const user = (jdMode
      ? `面试模式：岗位定制（不限定章节）\n`
      : openMode
        ? `知识分类：${session.series}\n章节：不限（本分类下由你挑最贴切的一章）\n`
        : `知识分类：${session.series}\n章节：${session.chapterPath}\n`)
      + `面试模式：${session.mode}\n`
      + (session.jdExcerpt && !(jdMode && session.nextFocus) ? `目标岗位 JD：\n${session.jdExcerpt}\n` : "")
      // 以下三块每次都变，放在稳定前缀之后，尽量保住缓存命中
      + resumeBlock(session)
      + focusBlock(session.nextFocus)
      + askedBlock(session);

    // 出题走高温，偶尔会漏字段（实测漏过 topic）。给它一次补的机会，别让整道题出不来。
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const result = await this.#json(system, user, CREATIVE_TEMPERATURE, { operation: "question", maxTokens: 1_800 });
      result.standardAnswer = result.standardAnswer ?? result.standard_answer;
      const broken = !result.title?.match(/[？?]$/u) || !result.standardAnswer
        ? "模型生成的题目结构不完整"
        : (openMode && !String(result.topic ?? "").trim() ? "模型没有给出这道题归属的章节" : "");
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
      { operation: "outline", maxTokens: 1_500 },
    );
  }

  async generatePaper({ session, count }) {
    const result = await this.#json(
      `你是中文技术笔试出题人。一次生成 ${count} 道彼此不同、难度递进的书面题。每题只考一个核心任务，不编号、不加星标。`
      + `标准答案严格按下方「规则快照」里的格式写（第一行固定为 **锚点**：\`一行口诀\`，再编号要点 + 3 空格缩进的二级补充，≤15 行）。`
      + `标准答案用第一人称讲简历里真实做过的事（点名项目名、技术栈或具体业务场景），不要用“如订单列表…”这类占位示例；`
      + `不要出现“简历”“对应简历那版”这类旁白，直接给当场能背出来的答案。`
      + `只返回 JSON：{"questions":[{"title":"以？结尾","prompt":"题目","standardAnswer":"标准答案"}]}。`
      + `给了目标岗位 JD 时，优先考察 JD 里强调的能力。\n`
      + `规则快照：${session.skillSnapshot}`,
      `知识分类：${session.series}\n章节：${session.chapterPath}\n简历摘要：${session.resumeExcerpt}\n`
      + (session.jdExcerpt ? `目标岗位 JD：\n${session.jdExcerpt}\n` : "")
      + focusListBlock(session.nextFocuses)
      + askedBlock(session),
      CREATIVE_TEMPERATURE,
      { operation: "paper", maxTokens: 4_000 },
    );
    if (!Array.isArray(result.questions) || result.questions.length !== count) throw new Error("模型未生成完整书面试卷");
    return result.questions;
  }

  /**
   * 模型写出的标准答案偶尔不合《格式规范》。归档时用同一个模型按规范重写一遍，
   * 好过把整道题丢掉。只返回 JSON：{"standardAnswer":"重写后的完整答案"}。
   */
  async reformatAnswer({ question, errors = [], prose = false }) {
    const shape = prose
      // 行为面：目标形态是「锚点 + 一段口语」，不能再按技术题重写成编号要点
      ? `之后写成一段第一人称口语，2 到 ${MAX_PROSE_LINES} 行、不分点、不用编号，` +
        `直接回答，不加旁白；讲简历里真有的经历，没有的如实说没有。`
      : `之后是 1 到 6 个“数字. **关键词**：主句”的一级要点——`
        + `冒号后到行尾的这段文字就是主句，必须不超过 30 字，细节、命令、举例一律挪到下一行的二级补充里`
        + `（用恰好 3 个空格缩进的“-”）。`;
    const result = await this.#json(
      `下面这道面试题的标准答案不符合《面试宝典文章格式规范》，请按规范重写，内容不要删减也不要新增事实。\n`
      + `规范：第一行是锚点，写法固定——加粗的锚点二字 + 中文冒号 + 反引号包住一行口诀`
      + `（例：**锚点**：\`按 key 查改用 HashMap\`）；不要写成“记忆锚点：…”或别的前缀；`
      + shape
      + `不得使用三级标题；总计不超过 15 行。\n`
      + `只返回 JSON：{"standardAnswer":"重写后的完整答案"}。`
      + (errors.length ? `\n上次校验未通过：${errors.join("；")}` : ""),
      `题目：${question.title}\n原答案：\n${question.standardAnswer ?? ""}`,
      CREATIVE_TEMPERATURE,
      { operation: "answer_reformat", maxTokens: 1_800 },
    );
    return String(result.standardAnswer ?? "");
  }

  /**
   * 按候选人的一句话要求改写自我介绍。
   * 走「整篇返回」而不是 diff：文档才 2KB，一次往返成本可忽略，而 patch 的失败模式
   * （找不到锚点、上下文对不上）要多得多——改坏了有回撤栈和 git 兜着。
   */
  /**
   * 一次保存改了什么，写成一句话——给提交信息用，也是历史面板里显示的那行。
   *
   * 为什么让模型写：`git diff --stat` 只会说"改了 12 行" ✗ 而人想知道的是
   * "开场压缩到两句、实习那段补了 SQL 脚本维护" ✓ 那才是回头看时能认出来的东西 ✓
   */
  async summarizeChange({ before, after }) {
    const result = await this.#json(
      `下面是一份文档改前和改后的全文。按这份规范写这次改了什么，只返回 JSON：{"summary":"…"}。\n`
      + `${COMMIT_SUBJECT_SPEC}`,
      `改前：\n${before}\n\n改后：\n${after}`,
      STABLE_TEMPERATURE,
    );
    return String(result.summary ?? "").trim();
  }

  async reviseSelfIntro({ markdown, instruction, spec = "", history = [] }) {
    const result = await this.#revise({
      system: `你在帮候选人改他的面试自我介绍（一份 markdown）。`
        + `这是个对话框：他可能让你改稿，也可能只是问你意见。`
        + `只返回 JSON：{"action":"revise|answer","reply":"…","markdown":"…"}。`,
      spec: spec ? `这份稿子要遵守的《自我介绍规范》：\n${spec}` : "",
      context: `当前的自我介绍全文：\n${markdown}`,
      history,
      instruction,
      rules: `改写时的要求：\n`
        + `- 第一行是这份稿子的链路锚点（形如「> 开场 → 实习 → …」），**必须原样保留**，`
        + `小节有增减时同步更新它；实测它被当成冗余删掉过，那是这份稿子的记忆索引，不能丢。\n`
        + `- 保持原文的小节骨架与「**一、开场**」这类小标题写法，编号要连续，除非他明确要求调整结构。\n`
        + `- 只改他要求的部分，其余原样保留：不要顺手润色、不要压缩、不要删减事实。\n`
        + `- 不新增原文里没有的经历、数字或技术栈——原文就是事实来源。\n`
        + `- markdown 要给完整全文，不是 diff、不是片段，开头也不要加任何解释。`,
      field: "markdown",
      emptyError: "模型说要改，但没返回改写后的自我介绍",
    });
    if (result.action === "revise") {
      const first = (value) => value.split("\n").find((line) => line.trim())?.trim() ?? "";
      if (first(markdown).startsWith(">") && !first(result.markdown).startsWith(">")) throw new Error("AI 改写丢失了首行链路锚点，本次结果未应用");
    }
    return result;
  }

  /**
   * 按候选人的一句话要求改简历。
   * 简历是自包含 HTML（样式内联、带 A4 打印规则），所以只动**正文内容**，
   * 不碰 <style> 与结构——一改样式，导出 PDF 的样子就变了。
   */
  async reviseResume({ html, instruction, spec = "", history = [] }) {
    const result = await this.#revise({
      system: `你在帮候选人改他的简历（一份自包含的 HTML）。`
        + `这是个对话框：他可能让你改简历，也可能只是问你意见。`
        + `只返回 JSON：{"action":"revise|answer","reply":"…","html":"…"}。`,
      // 规范由调用方读好传进来（简历设计规范.md，已剔掉投递策略那类无关章节）
      spec: spec ? `这份简历要遵守的《简历设计规范》：\n${spec}` : "",
      context: `当前的简历 HTML：\n${html}`,
      history,
      instruction,
      rules: `改写时的要求：\n`
        + `- <style> 里的样式、@page 打印规则、整体结构（层级与区块顺序）**一律不动**。\n`
        + `- 只改他要求的部分，其余原样保留：不要顺手润色、不要压缩、不要删减事实。\n`
        + `- 不新增原文里没有的经历、数字或技术栈——原文就是事实来源。\n`
        + `- html 要给完整全文，不是 diff、不是片段，开头不要加解释、不要包 markdown 代码块。`,
      field: "html",
      emptyError: "模型说要改，但没返回改写后的简历",
    });
    if (result.action === "revise") {
      const styles = (value) => [...value.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/giu)].map((match) => match[0]);
      if (JSON.stringify(styles(html)) !== JSON.stringify(styles(result.html))) throw new Error("AI 改写改变了简历样式，本次结果未应用");
      if (/<script\b|\son\w+\s*=|javascript:/iu.test(result.html)) throw new Error("AI 改写包含不安全的 HTML，本次结果未应用");
    }
    return result;
  }

  /**
   * 判断这句是「让你改」还是「问意见」。
   * 兜底方向很关键：**拿不准就当 answer**——改稿是有副作用的操作（会覆盖内容、会提示刷新预览），
   * 宁可不改，等他明确要求。没给 action 字段时按有没有稿子推断，兼容模型漏字段的情况。
   */
  #decideAction(rawAction, revised) {
    const explicit = String(rawAction ?? "").trim().toLowerCase();
    if (explicit === "revise") return "revise";
    if (explicit === "answer") return "answer";
    return revised ? "revise" : "answer";
  }

  /**
   * 对话框里的那些话，还原成模型能接得上的消息。
   *
   * **关键**：助手那一轮要还原成**模型当初吐出的 JSON 形状**，不能只放回复正文。
   * 实测在 JSON 模式的对话里混入散文，模型有 40% 概率返回空内容（finish=stop 却拿不到内容），
   * 而这个对话框一空就没法给用户任何东西；换成 JSON 形状后实测 0 次。
   * 用户那侧照旧是纯文本。
   *
   * 空消息和报错气泡要滤掉，别把「这次没成功：连不上服务」当成模型说过的话喂回去。
   */
  #turns(history = []) {
    return (Array.isArray(history) ? history : [])
      .filter((turn) => turn && !turn.error && String(turn.text ?? "").trim())
      .map((turn) => (turn.role === "user"
        ? { role: "user", content: String(turn.text).trim() }
        : {
            role: "assistant",
            content: JSON.stringify({
              action: turn.action === "revise" ? "revise" : "answer",
              reply: String(turn.text).trim(),
            }),
          }));
  }

  /**
   * 「让 AI 改」对话框的公共逻辑：把对话历史拼成**真正的多轮 messages**，
   * 让模型自己判断这句是「让我改」还是「问意见」。简历和自我介绍共用这一套，
   * 免得两边的判断规则各写一遍、行为长歪。
   *
   * 结构跟人聊天一样：
   *   system —— 规则 + 规范 + 当前文稿
   *   user/assistant 交替 —— 之前的每一轮，内容就是对话框里看到的那些话
   *   最后一条 user —— 他这次说的
   * 只有这样，「那教育经历那段呢」这类追问才接得上；每句都单发一条消息会失忆。
   */
  async #revise({ system, spec, context, history, instruction, rules, field, emptyError }) {
    const messages = [
      // 顺序有意：规则/规范在一次会话里不变，放前面好命中缓存；当前文稿改一次变一次，放最后
      { role: "system", content: [system, REVISE_DECISION_RULE, spec, rules, context].filter(Boolean).join("\n\n") },
      ...this.#turns(history),
      { role: "user", content: instruction },
    ];
    let result;
    try {
      result = await this.#chat(messages, 0.35, { operation: `document_${field}_revise`, maxTokens: 16_000 });
    } catch (error) {
      // 模型在 JSON 模式下偶尔直接说一段话（实测同一个请求时好时坏）。对这个对话框来说
      // 那**本身就是一种合法的回答**——按 answer 收下，比甩一句「模型未返回 JSON 对象」
      // 有用得多，也跟「拿不准就当答」的原则一致。
      const spoken = String(error.raw ?? "").trim();
      if (spoken && !spoken.includes("{")) {
        return { action: "answer", reply: spoken, [field]: "" };
      }
      throw error;
    }
    const revised = String(result[field] ?? "").trim();
    const action = this.#decideAction(result.action, revised);
    if (action === "revise" && !revised) throw new Error(emptyError);
    return { action, reply: String(result.reply ?? "").trim(), [field]: revised };
  }

  /**
   * 归档兜底：题目自报的章节名在库里找不到时，先问这个分类下已有的章节装不装得下。
   * 提示词已经要求复用，但出题走高温，偶尔仍会造出近义章节——多这一道就不会凭空多一个文件。
   * 返回已有章节名，或空字符串表示「确实该新建」。
   */
  async matchChapter({ topic, series, chapters = [] }) {
    if (!chapters.length) return "";
    const result = await this.#json(
      `下面给出「${series}」分类下已有的章节名，以及一道新题自报的章节名。`
      + `判断这道题该归入哪一个，只返回 JSON：{"chapter":"章节名"}。`
      + `chapter 必须从已有章节名里原样挑一个；确实一个都覆盖不了这道题时返回 {"chapter":"新建"}。`
      + `宁可归入一个覆盖面稍宽的已有章节，也不要新建近义章节——那会让同一个知识点散落在多个文件里。`,
      `新题自报的章节名：${topic}\n已有章节：${chapters.join("、")}`,
      STABLE_TEMPERATURE,
      { operation: "chapter_match", maxTokens: 64 },
    );
    const picked = String(result.chapter ?? "").trim();
    return chapters.includes(picked) ? picked : "";
  }

  async judgeDuplicate({ title, candidates }) {
    if (!candidates.length) return { kind: "new" };
    return this.#json(
      "判断新题与候选题是否语义等价。只返回 JSON：{\"kind\":\"existing|new\",\"questionId\":\"匹配ID或空字符串\"}。只有考察目标实质相同才算 existing。",
      `新题：${title}\n候选：${JSON.stringify(candidates)}`,
      STABLE_TEMPERATURE,
      { operation: "duplicate", maxTokens: 64 },
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
      + (session.jdExcerpt ? `目标岗位 JD 摘要：\n${session.jdExcerpt.slice(0, 2_000)}\n` : "")
      + `逐题记录：\n${scored || "（本场没有点评记录）"}`,
      STABLE_TEMPERATURE,
      { operation: "summary", maxTokens: 800 },
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
