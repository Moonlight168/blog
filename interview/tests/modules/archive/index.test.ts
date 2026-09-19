import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createArchive, refileQuestion, stripSeriesPrefix } from "../../../server/modules/archive/index.ts";
import type { ArchiveAgent, ArchiveIndex } from "../../../server/modules/archive/index.ts";
import { openDatabase } from "../../../server/db/index.ts";
import { makeSession } from "../../helpers/factories.ts";
import type { Evaluation, Session } from "../../../shared/types.ts";

/** 一道题的归档入参形状 */
interface QuestionInput {
  title: string;
  standardAnswer?: string;
  topic?: string;
  series?: string;
}

interface EnvOptions {
  candidates?: Array<{ id: string; normalized_title: string; [key: string]: unknown }>;
  existing?: { title: string; source_path: string } | null;
  /** null = 重写也救不回来 */
  reformat?: string | null;
  /** 传函数可以按候选章节决定归到哪儿；空串表示「没有章节装得下」 */
  matchChapter?: string | ((input: { chapters: string[] }) => string);
}

const COMPLIANT = "**锚点**：`状态定边界`\n\n1. **边界清晰**：用状态约束流程";
const SESSION = makeSession({ id: "session-1", completedCount: 0, chapterPath: "Java/多线程.md" });
const JD_SESSION = makeSession({ id: "session-jd", completedCount: 0, mode: "jd", chapterPath: "" });
/** 选了「全部」章节：分类由会话定，章节由模型自报 */
const ALL_SESSION = makeSession({ id: "session-all", completedCount: 0, mode: "interview", series: "Java", chapterPath: "" });

function makeEnv({ candidates = [], existing = null, reformat = null, matchChapter = "" }: EnvOptions = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "archive-"));
  const knowledgeRoot = path.join(root, "knowledge");
  const privateHistoryRoot = path.join(root, "history");
  fs.mkdirSync(path.join(knowledgeRoot, "Java"), { recursive: true });
  fs.writeFileSync(path.join(knowledgeRoot, "Java", "多线程.md"), "# 多线程\n", "utf8");

  const calls: string[] = [];
  const questionIndex: ArchiveIndex = {
    async candidates() { return candidates; },
    getById() { return existing ?? undefined; },
    async refresh() { calls.push("refresh"); return { total: 0, changed: 0, embedded: 0, embeddingError: null }; },
  };
  const agent: ArchiveAgent = {
    async judgeDuplicate() { calls.push("judgeDuplicate"); return { kind: "new" }; },
    // 默认空串 = 模型认为该分类下没有章节装得下这道题 → 新建
    async matchChapter({ chapters }) {
      calls.push("matchChapter");
      return typeof matchChapter === "function" ? matchChapter({ chapters }) : matchChapter;
    },
    async reformatAnswer() {
      calls.push("reformatAnswer");
      // reformat 为 null 时模拟"重写也救不回来"
      if (!reformat) throw new Error("题目不符合《面试宝典文章格式规范》：一级要点主句不得超过 30 字");
      return reformat;
    },
  };
  const db = openDatabase(path.join(root, "test.sqlite"));
  return {
    calls, agent, questionIndex, knowledgeRoot, privateHistoryRoot, db,
    // 暴露出来给「新建章节」的断言用
    knowledgeDir: path.join(knowledgeRoot, "Java"),
    knowledgeFile: path.join(knowledgeRoot, "Java", "多线程.md"),
    historyFile: path.join(privateHistoryRoot, "Java", "多线程-答题记录.md"),
    archive: createArchive({ questionIndex, agent, knowledgeRoot, privateHistoryRoot, db }),
  };
}

/**
 * 归档一次的常见形状：默认「标准答案合规、答得清楚、得分 80」。
 * 用例只写它真正关心的那几项；要换会话（岗位定制 / 选全部）就传 session。
 */
function submit(env: ReturnType<typeof makeEnv>, {
  session = SESSION,
  title = "为什么需要状态机？",
  standardAnswer = COMPLIANT,
  rawAnswer = "回答",
  evaluation = { score: 80, comment: "清楚" },
  ...question
}: {
  session?: Session; title?: string; standardAnswer?: string;
  rawAnswer?: string; evaluation?: Evaluation;
} & Partial<QuestionInput> = {}) {
  return env.archive({ session, question: { title, standardAnswer, ...question }, rawAnswer, evaluation });
}

/** 补录一道题，仓库路径固定，用例只给题目 */
const refile = (env: ReturnType<typeof makeEnv>, input: { title: string; standardAnswer: string }) => refileQuestion({
  agent: env.agent, questionIndex: env.questionIndex,
  knowledgeRoot: env.knowledgeRoot, privateHistoryRoot: env.privateHistoryRoot,
  chapterPath: "Java/多线程.md", ...input,
});

/** 主句超过 30 字的答案：规范校验过不去，但自动拆分能救 */
const OVERLONG = `**锚点**：\`先看频率\`\n\n1. **超长主句**：${"啊".repeat(40)}`;
const REFORMATTED = "**锚点**：`先看频率`\n\n1. **看 GC 频率**：jstat 观察老年代增长";

test("会话落库失败时可回滚已归档的文件和答题记录", async () => {
  const env = makeEnv();
  const before = fs.readFileSync(env.knowledgeFile, "utf8");
  const result = await submit(env, { title: "线程池怎么关闭？" });
  assert.equal(env.db.prepare("SELECT COUNT(*) AS total FROM attempts").get()?.total, 1);

  assert.ok(result, "应当返回可回滚的结果");

  await result.rollback();

  assert.equal(fs.readFileSync(env.knowledgeFile, "utf8"), before);
  assert.equal(fs.existsSync(env.historyFile), false);
  assert.equal(env.db.prepare("SELECT COUNT(*) AS total FROM attempts").get()?.total, 0);
  assert.ok(result, "应当返回可回滚的结果");

  await result.rollback();
});

test("回滚不覆盖归档后的外部文件修改", async () => {
  const env = makeEnv();
  const result = await submit(env, { title: "线程池怎么关闭？" });
  const external = `${fs.readFileSync(env.knowledgeFile, "utf8")}\n<!-- 外部修改 -->\n`;
  fs.writeFileSync(env.knowledgeFile, external, "utf8");

  assert.ok(result, "应当返回可回滚的结果");

  await result.rollback();

  assert.equal(fs.readFileSync(env.knowledgeFile, "utf8"), external);
  assert.equal(env.db.prepare("SELECT COUNT(*) AS total FROM attempts").get()?.total, 0);
});

test("剥掉模型误带上的分类前缀（实测返回过「Agent 开发：langgraph」）", () => {
  assert.equal(stripSeriesPrefix("Java：多线程", "Java"), "多线程");
  assert.equal(stripSeriesPrefix("Java:多线程", "Java"), "多线程");
  assert.equal(stripSeriesPrefix("多线程", "Java"), "多线程", "没前缀就原样");
  assert.equal(stripSeriesPrefix("Java 8 新特性", "Java"), "Java 8 新特性", "别把正文里的 Java 也当成前缀");
  assert.equal(stripSeriesPrefix("Java：", "Java"), "Java：", "剥完是空就退回原值，别把章节名清没了");
});

test("选「全部」：分类锁死，别的分类有同名章节也不跑过去", async () => {
  const env = makeEnv();
  fs.mkdirSync(path.join(env.knowledgeRoot, "框架"), { recursive: true });
  fs.writeFileSync(path.join(env.knowledgeRoot, "框架", "spring.md"), "# spring\n", "utf8");

  const result = await submit(env, {
    session: ALL_SESSION, title: "spring 和 springboot 什么关系？", topic: "spring",
  });

  assert.equal(result?.notice, undefined);
  assert.ok(fs.existsSync(path.join(env.knowledgeRoot, "Java", "spring.md")), "应在会话选的 Java 下新建");
  assert.doesNotMatch(
    fs.readFileSync(path.join(env.knowledgeRoot, "框架", "spring.md"), "utf8"),
    /spring 和 springboot 什么关系/,
    "不该跑到别的分类去",
  );
});

test("选「全部」：模型自报的章节命中已有文件时归过去（带分类前缀也认）", async () => {
  const env = makeEnv();
  const result = await submit(env, { session: ALL_SESSION, title: "线程池怎么设参数？", topic: "Java：多线程" });

  assert.equal(result?.notice, undefined);
  assert.match(fs.readFileSync(env.knowledgeFile, "utf8"), /## 线程池怎么设参数？/, "剥掉前缀后应归到已有的 多线程.md");
});

test("岗位定制：已有同名章节时归到那个文件", async () => {
  const env = makeEnv();
  const result = await submit(env, { session: JD_SESSION, topic: "多线程", series: "Java" });

  assert.equal(result?.notice, undefined);
  assert.match(fs.readFileSync(env.knowledgeFile, "utf8"), /## 为什么需要状态机？/, "应归到已有的 多线程.md");
});

test("岗位定制：没有章节装得下时，才按模型选的分类新建", async () => {
  const env = makeEnv({ matchChapter: "" });
  const result = await submit(env, {
    session: JD_SESSION, title: "G1 和 CMS 怎么选？", topic: "JVM 调优", series: "Java",
  });

  assert.equal(result?.notice, undefined);
  assert.ok(env.calls.includes("matchChapter"), "新建之前要先问一遍已有章节");
  const created = path.join(env.knowledgeDir, "JVM 调优.md");
  assert.ok(fs.existsSync(created), "确实没有能覆盖的章节时才新建");
  assert.match(fs.readFileSync(created, "utf8"), /## G1 和 CMS 怎么选？/);
  assert.match(fs.readFileSync(env.knowledgeFile, "utf8"), /^# 多线程/, "不该动到别的章节");
});

test("岗位定制：章节名对不上但已有章节能覆盖时，归到已有章节而不是新建", async () => {
  const env = makeEnv({ matchChapter: ({ chapters }) => (chapters.includes("集合") ? "集合" : "") });
  fs.writeFileSync(path.join(env.knowledgeDir, "集合.md"), "# 集合\n", "utf8");

  // 复现线上那次：模型把「集合」和「多线程」并成了一个新名字
  const result = await submit(env, {
    session: JD_SESSION, title: "说说集合怎么选型，有没有并发控制？", topic: "Java 集合与并发", series: "Java",
  });

  assert.equal(result?.notice, undefined);
  assert.match(fs.readFileSync(path.join(env.knowledgeDir, "集合.md"), "utf8"), /## 说说集合怎么选型，有没有并发控制？/, "应并进已有的 集合.md");
  assert.ok(!fs.existsSync(path.join(env.knowledgeDir, "Java 集合与并发.md")), "不该凭空多出一个近义章节文件");
});

test("岗位定制：分类下还一个章节都没有时，不再多问一次直接新建", async () => {
  const env = makeEnv({ matchChapter: "" });
  const result = await submit(env, { session: JD_SESSION, title: "题？", topic: "全新的章节", series: "Python" });

  assert.equal(result?.notice, undefined);
  assert.ok(!env.calls.includes("matchChapter"), "该分类下没有候选章节，没必要白调一次模型");
  assert.ok(fs.existsSync(path.join(env.knowledgeRoot, "Python", "全新的章节.md")));
});

test("岗位定制：模型没给 topic 时报错，不静默写错地方", async () => {
  const env = makeEnv();
  await assert.rejects(() => submit(env, { session: JD_SESSION, title: "题？", series: "Java" }), /缺少题目归属的章节/);
});

test("岗位定制：topic 带路径分隔符时拒绝写入", async () => {
  const env = makeEnv();
  await assert.rejects(
    () => submit(env, { session: JD_SESSION, title: "题？", topic: "../../etc/passwd", series: "Java" }),
    /路径分隔符/,
  );
});

test("答案不合规范时，先让模型按规范重写再入库", async () => {
  const env = makeEnv({ reformat: REFORMATTED });

  const result = await submit(env, {
    standardAnswer: OVERLONG, rawAnswer: "这个不太清楚", evaluation: { score: 0, comment: "未作答" },
  });

  assert.ok(env.calls.includes("reformatAnswer"), "校验不过时要先试着重写");
  assert.equal(result?.notice, undefined, "重写成功就不该报跳过");
  const written = fs.readFileSync(env.knowledgeFile, "utf8");
  assert.match(written, /## 为什么需要状态机？/, "重写后的题要入库");
  assert.match(written, /看 GC 频率/, "入库的是重写后的内容");
});

test("主句超长、重写也失败时，用自动拆分兜底写进知识库（不再整题丢弃）", async () => {
  const env = makeEnv(); // reformat 为 null → 重写抛错
  const result = await submit(env, {
    standardAnswer: OVERLONG, rawAnswer: "这个不太清楚", evaluation: { score: 0, comment: "未作答" },
  });

  assert.equal(result?.notice, undefined, "兜底拆分后不该再跳过入库");
  const knowledge = fs.readFileSync(env.knowledgeFile, "utf8");
  assert.match(knowledge, /超长主句/, "题块要写进知识库");
  assert.match(knowledge, /- 啊{10}$/m, "被拆下来的后半段要留成 3 空格缩进的二级补充");
  assert.match(fs.readFileSync(env.historyFile, "utf8"), /这个不太清楚/);
});

test("结构性不合规（拆分也修不了）才跳过入库，且不阻断整场面试", async () => {
  const env = makeEnv(); // reformat 为 null → 重写抛错
  // 第一行不是锚点：属于结构问题，自动拆分只处理主句超长，救不了这种
  const result = await submit(env, {
    standardAnswer: `1. **第一条**：短句\n\n2. **第二条**：短句`,
    rawAnswer: "这个不太清楚",
    evaluation: { score: 0, comment: "未作答" },
  });

  assert.ok(result?.notice, "要把跳过原因回报出来，不能静默吞掉");
  assert.match(result.notice, /锚点/);
  // 知识库保持原样，没有写入不合规的题块
  assert.equal(fs.readFileSync(env.knowledgeFile, "utf8").trim(), "# 多线程");
  // 但这次回答必须留下来
  assert.match(fs.readFileSync(env.historyFile, "utf8"), /这个不太清楚/);
});

test("答案合规时正常写入知识库，不产生 notice", async () => {
  const env = makeEnv();
  const result = await submit(env, {
    standardAnswer: "**锚点**：`状态定边界`\n\n1. **边界清晰**：用状态约束流程\n   - 非法迁移会被拒绝",
    rawAnswer: "状态机让流程可控",
  });

  assert.equal(result?.notice, undefined, "合规时不应有 notice");
  const written = fs.readFileSync(env.knowledgeFile, "utf8");
  assert.match(written, /## 为什么需要状态机？/);
  assert.match(written, /状态定边界/);
});

test("补录：把归档时被跳过的题重新写进知识库", async () => {
  const env = makeEnv({ reformat: REFORMATTED });

  const result = await refile(env, { title: "为什么需要状态机？", standardAnswer: OVERLONG });

  assert.equal(result.ok, true, "补录应当成功");
  assert.ok(result.historyUrl, "要返回归档后的链接");
  const written = fs.readFileSync(env.knowledgeFile, "utf8");
  assert.match(written, /## 为什么需要状态机？/);
  assert.match(written, /看 GC 频率/, "入库的是按规范重写后的内容");
  assert.ok(env.calls.includes("refresh"), "补录后要重建索引");
});

test("补录：主句超长时走自动拆分兜底，成功写入", async () => {
  const env = makeEnv(); // reformat 为 null → 重写失败
  const result = await refile(env, { title: "题？", standardAnswer: OVERLONG });
  assert.equal(result.ok, true);
  assert.match(fs.readFileSync(env.knowledgeFile, "utf8"), /- 啊{10}$/m);
});

test("补录失败时返回原因而不是抛错", async () => {
  const env = makeEnv(); // reformat 为 null → 重写也失败
  const result = await refile(env, { title: "题？", standardAnswer: `1. **缺锚点**：短句` });
  assert.equal(result.ok, false);
  assert.ok(result.reason, "失败要说明原因");
  assert.match(result.reason, /锚点/);
  assert.equal(fs.readFileSync(env.knowledgeFile, "utf8").trim(), "# 多线程", "失败时不该写入");
});

test("判定为已有题时复用原题，不重复写题块也不报 notice", async () => {
  const env = makeEnv({
    // normalized_title 是 normalizeTitle 之后的值（问号等标点已被去掉）
    candidates: [{ id: "q1", normalized_title: "为什么需要状态机" }],
    existing: { title: "为什么需要状态机？", source_path: "Java/多线程.md" },
  });

  const result = await submit(env, { standardAnswer: "**锚点**：`x`\n\n1. **要点**：短句", rawAnswer: "再答一次", evaluation: { score: 90, comment: "好" } });

  assert.equal(result?.notice, undefined);
  assert.ok(!env.calls.includes("judgeDuplicate"), "精确命中时应短路，不调用模型判重");
  assert.ok(!env.calls.includes("reformatAnswer"), "已有题不涉及重写");
  assert.equal(fs.readFileSync(env.knowledgeFile, "utf8").trim(), "# 多线程", "已有题不该重复写入");
  assert.match(fs.readFileSync(env.historyFile, "utf8"), /再答一次/, "回答仍要并入该题历史");
});
