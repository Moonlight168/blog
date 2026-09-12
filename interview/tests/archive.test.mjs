import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createArchive, refileQuestion } from "../server/archive.mjs";
import { openDatabase } from "../server/db.mjs";

const SESSION = { id: "session-1", completedCount: 0, chapterPath: "Java/多线程.md" };

function makeEnv({ candidates = [], existing = null, reformat = null } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "archive-"));
  const knowledgeRoot = path.join(root, "knowledge");
  const privateHistoryRoot = path.join(root, "history");
  fs.mkdirSync(path.join(knowledgeRoot, "Java"), { recursive: true });
  fs.writeFileSync(path.join(knowledgeRoot, "Java", "多线程.md"), "# 多线程\n", "utf8");

  const calls = [];
  const questionIndex = {
    async candidates() { return candidates; },
    getById() { return existing; },
    async refresh() { calls.push("refresh"); },
  };
  const agent = {
    async judgeDuplicate() { calls.push("judgeDuplicate"); return { kind: "new" }; },
    async reformatAnswer() {
      calls.push("reformatAnswer");
      // reformat 为 null 时模拟"重写也救不回来"
      if (!reformat) throw new Error("题目不符合《面试宝典文章格式规范》：一级要点主句不得超过 30 字");
      return reformat;
    },
  };
  return {
    calls, agent, questionIndex, knowledgeRoot, privateHistoryRoot,
    // 暴露出来给「新建章节」的断言用
    knowledgeFile: path.join(knowledgeRoot, "Java", "多线程.md"),
    historyFile: path.join(privateHistoryRoot, "Java", "多线程-答题记录.md"),
    archive: createArchive({ questionIndex, agent, knowledgeRoot, privateHistoryRoot, db: openDatabase(path.join(root, "test.sqlite")) }),
  };
}

const COMPLIANT = "**锚点**：`状态定边界`\n\n1. **边界清晰**：用状态约束流程";
const JD_SESSION = { id: "session-jd", completedCount: 0, mode: "jd", chapterPath: "" };

test("岗位定制：已有同名章节时归到那个文件", async () => {
  const env = makeEnv();
  const result = await env.archive({
    session: JD_SESSION,
    question: { title: "为什么需要状态机？", standardAnswer: COMPLIANT, topic: "多线程", series: "Java" },
    rawAnswer: "回答", evaluation: { score: 80, comment: "清楚" },
  });

  assert.equal(result?.notice, undefined);
  assert.match(fs.readFileSync(env.knowledgeFile, "utf8"), /## 为什么需要状态机？/, "应归到已有的 多线程.md");
});

test("岗位定制：没有同名章节时按模型选的分类新建", async () => {
  const env = makeEnv();
  const result = await env.archive({
    session: JD_SESSION,
    question: { title: "G1 和 CMS 怎么选？", standardAnswer: COMPLIANT, topic: "JVM 调优", series: "Java" },
    rawAnswer: "回答", evaluation: { score: 70, comment: "还行" },
  });

  assert.equal(result?.notice, undefined);
  const created = path.join(env.knowledgeRoot, "Java", "JVM 调优.md");
  assert.ok(fs.existsSync(created), "应按 topic 新建章节文件");
  assert.match(fs.readFileSync(created, "utf8"), /## G1 和 CMS 怎么选？/);
  assert.match(fs.readFileSync(env.knowledgeFile, "utf8"), /^# 多线程/, "不该动到别的章节");
});

test("岗位定制：模型没给 topic 时报错，不静默写错地方", async () => {
  const env = makeEnv();
  await assert.rejects(() => env.archive({
    session: JD_SESSION,
    question: { title: "题？", standardAnswer: COMPLIANT, series: "Java" },
    rawAnswer: "回答", evaluation: { score: 60, comment: "凑合" },
  }), /缺少题目归属的章节/);
});

test("岗位定制：topic 带路径分隔符时拒绝写入", async () => {
  const env = makeEnv();
  await assert.rejects(() => env.archive({
    session: JD_SESSION,
    question: { title: "题？", standardAnswer: COMPLIANT, topic: "../../etc/passwd", series: "Java" },
    rawAnswer: "回答", evaluation: { score: 60, comment: "凑合" },
  }), /路径分隔符/);
});

test("答案不合规范时，先让模型按规范重写再入库", async () => {
  const compliant = "**锚点**：`先看频率`\n\n1. **看 GC 频率**：jstat 观察老年代增长\n   - `jstat -gcutil <pid> 1000` 看 O 区与 FGC 增速";
  const env = makeEnv({ reformat: compliant });
  const overlong = `**锚点**：\`先看频率\`\n\n1. **超长主句**：${"啊".repeat(40)}`;

  const result = await env.archive({
    session: SESSION,
    question: { title: "为什么需要状态机？", standardAnswer: overlong },
    rawAnswer: "这个不太清楚",
    evaluation: { score: 0, comment: "未作答" },
  });

  assert.ok(env.calls.includes("reformatAnswer"), "校验不过时要先试着重写");
  assert.equal(result?.notice, undefined, "重写成功就不该报跳过");
  const written = fs.readFileSync(env.knowledgeFile, "utf8");
  assert.match(written, /## 为什么需要状态机？/, "重写后的题要入库");
  assert.match(written, /看 GC 频率/, "入库的是重写后的内容");
});

test("重写也救不回来时才跳过入库，且不阻断整场面试", async () => {
  const env = makeEnv(); // reformat 为 null → 重写抛错
  const overlong = `**锚点**：\`先看频率\`\n\n1. **超长主句**：${"啊".repeat(40)}`;

  const result = await env.archive({
    session: SESSION,
    question: { title: "为什么需要状态机？", standardAnswer: overlong },
    rawAnswer: "这个不太清楚",
    evaluation: { score: 0, comment: "未作答" },
  });

  assert.ok(result?.notice, "要把跳过原因回报出来，不能静默吞掉");
  assert.match(result.notice, /30 字/);
  // 知识库保持原样，没有写入不合规的题块
  assert.equal(fs.readFileSync(env.knowledgeFile, "utf8").trim(), "# 多线程");
  // 但这次回答必须留下来
  assert.match(fs.readFileSync(env.historyFile, "utf8"), /这个不太清楚/);
});

test("答案合规时正常写入知识库，不产生 notice", async () => {
  const env = makeEnv();

  const result = await env.archive({
    session: SESSION,
    question: {
      title: "为什么需要状态机？",
      standardAnswer: "**锚点**：`状态定边界`\n\n1. **边界清晰**：用状态约束流程\n   - 非法迁移会被拒绝",
    },
    rawAnswer: "状态机让流程可控",
    evaluation: { score: 80, comment: "清楚" },
  });

  assert.equal(result?.notice, undefined, "合规时不应有 notice");
  const written = fs.readFileSync(env.knowledgeFile, "utf8");
  assert.match(written, /## 为什么需要状态机？/);
  assert.match(written, /状态定边界/);
});

test("补录：把归档时被跳过的题重新写进知识库", async () => {
  const compliant = "**锚点**：`先看频率`\n\n1. **看 GC 频率**：jstat 观察老年代增长";
  const env = makeEnv({ reformat: compliant });
  const overlong = `**锚点**：\`先看频率\`\n\n1. **超长主句**：${"啊".repeat(40)}`;

  const result = await refileQuestion({
    agent: env.agent, questionIndex: env.questionIndex,
    knowledgeRoot: env.knowledgeRoot, privateHistoryRoot: env.privateHistoryRoot,
    chapterPath: "Java/多线程.md", title: "为什么需要状态机？", standardAnswer: overlong,
  });

  assert.equal(result.ok, true, "补录应当成功");
  assert.ok(result.historyUrl, "要返回归档后的链接");
  const written = fs.readFileSync(env.knowledgeFile, "utf8");
  assert.match(written, /## 为什么需要状态机？/);
  assert.match(written, /看 GC 频率/, "入库的是按规范重写后的内容");
  assert.ok(env.calls.includes("refresh"), "补录后要重建索引");
});

test("补录失败时返回原因而不是抛错", async () => {
  const env = makeEnv(); // reformat 为 null → 重写也失败
  const result = await refileQuestion({
    agent: env.agent, questionIndex: env.questionIndex,
    knowledgeRoot: env.knowledgeRoot, privateHistoryRoot: env.privateHistoryRoot,
    chapterPath: "Java/多线程.md", title: "题？", standardAnswer: `1. **超长**：${"啊".repeat(40)}`,
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /30 字/);
  assert.equal(fs.readFileSync(env.knowledgeFile, "utf8").trim(), "# 多线程", "失败时不该写入");
});

test("判定为已有题时复用原题，不重复写题块也不报 notice", async () => {
  const env = makeEnv({
    // normalized_title 是 normalizeTitle 之后的值（问号等标点已被去掉）
    candidates: [{ normalized_title: "为什么需要状态机" }],
    existing: { id: "q1", title: "为什么需要状态机？", source_path: "Java/多线程.md" },
  });

  const result = await env.archive({
    session: SESSION,
    question: { title: "为什么需要状态机？", standardAnswer: "**锚点**：`x`\n\n1. **要点**：短句" },
    rawAnswer: "再答一次",
    evaluation: { score: 90, comment: "好" },
  });

  assert.equal(result?.notice, undefined);
  assert.ok(!env.calls.includes("judgeDuplicate"), "精确命中时应短路，不调用模型判重");
  assert.ok(!env.calls.includes("reformatAnswer"), "已有题不涉及重写");
  assert.equal(fs.readFileSync(env.knowledgeFile, "utf8").trim(), "# 多线程", "已有题不该重复写入");
  assert.match(fs.readFileSync(env.historyFile, "utf8"), /再答一次/, "回答仍要并入该题历史");
});
