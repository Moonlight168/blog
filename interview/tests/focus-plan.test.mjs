import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { openDatabase } from "../server/db.mjs";
import { chapterFocuses, ensurePlan, focusPayload, planKey, resumeSlice, takeFocuses } from "../server/focus-plan.mjs";

function makeDb() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "focus-"));
  return openDatabase(path.join(root, "test.sqlite"));
}

function seedPlan(db, key, labels, cursor = 0) {
  const plan = labels.map((label) => ({ label }));
  db.prepare("INSERT INTO focus_plans(key,kind,plan,cursor,updated_at) VALUES(?,?,?,?,?)")
    .run(key, "resume", JSON.stringify(plan), cursor, new Date().toISOString());
  return plan;
}

const JD_SESSION = {
  mode: "jd", resumePath: "a.html", jdPath: "j.md", chapterPath: "",
  resumeExcerpt: "简历", jdExcerpt: "JD",
};

test("计划键：换简历、换 JD、换章节都是另一条进度线", () => {
  assert.equal(planKey(JD_SESSION), planKey({ ...JD_SESSION }));
  assert.notEqual(planKey(JD_SESSION), planKey({ ...JD_SESSION, jdPath: "other.md" }));
  assert.notEqual(planKey(JD_SESSION), planKey({ ...JD_SESSION, resumePath: "b.html" }));
  const chapter = { mode: "interview", resumePath: "a.html", chapterPath: "Java/多线程.md" };
  assert.notEqual(planKey(chapter), planKey({ ...chapter, chapterPath: "Java/JVM.md" }));
  assert.equal(planKey(chapter), planKey({ ...chapter }));
});

test("章节模式的考点表来自题库标题，章节名排最前", () => {
  const questionIndex = { titles: () => ["什么是线程池？", "volatile 有什么用？"] };
  const focuses = chapterFocuses(questionIndex, "Java/多线程.md", "多线程");
  assert.deepEqual(focuses.map((item) => item.label), ["多线程", "什么是线程池？", "volatile 有什么用？"]);
  // 章节名已经在标题里出现过时不重复插
  const again = chapterFocuses({ titles: () => ["多线程", "A"] }, "x", "多线程");
  assert.deepEqual(again.map((item) => item.label), ["多线程", "A"]);
});

test("考点跨场推进，一轮走完自动进入第二轮", () => {
  const db = makeDb();
  const key = "jd|a.html|j.md";
  const plan = seedPlan(db, key, ["A", "B"]);
  const labels = [];
  const rounds = [];
  for (let i = 0; i < 3; i += 1) {
    const focus = takeFocuses(db, { key, plan }, 1)[0];
    labels.push(focus.label);
    rounds.push(focus.round);
  }
  assert.deepEqual(labels, ["A", "B", "A"]);
  assert.deepEqual(rounds, [1, 1, 2]);
});

test("一次取多个考点用于书面测评，并推进游标", () => {
  const db = makeDb();
  const key = "chapter|a.html|Java/多线程.md";
  const plan = seedPlan(db, key, ["A", "B", "C"], 1);
  const taken = takeFocuses(db, { key, plan }, 3);
  assert.deepEqual(taken.map((item) => item.label), ["B", "C", "A"]);
  assert.deepEqual(taken.map((item) => item.index), [2, 3, 1]);
  assert.equal(db.prepare("SELECT cursor FROM focus_plans WHERE key=?").get(key).cursor, 4);
});

test("计划为空时返回空数组，让调用方回退整篇简历", () => {
  const db = makeDb();
  assert.deepEqual(takeFocuses(db, { key: "不存在", plan: [] }, 1), []);
});

test("ensurePlan 命中缓存就不再调模型", async () => {
  const db = makeDb();
  let calls = 0;
  const agent = { async outlineResume() { calls += 1; return { focuses: [{ label: "考点一", section: "专业技能" }] }; } };
  const questionIndex = { titles: () => [] };
  const first = await ensurePlan({ db, agent, questionIndex, session: JD_SESSION });
  const second = await ensurePlan({ db, agent, questionIndex, session: JD_SESSION });
  assert.equal(calls, 1, "同一份简历+JD 只解析一次");
  assert.equal(first.plan.length, 1);
  assert.equal(second.plan[0].label, "考点一");
});

test("模型解析失败不抛错：退化成空计划，面试能继续", async () => {
  const db = makeDb();
  const agent = { async outlineResume() { throw new Error("模型炸了"); } };
  const plan = await ensurePlan({ db, agent, questionIndex: { titles: () => [] }, session: JD_SESSION });
  assert.deepEqual(plan.plan, []);
});

test("简历分段：按 anchor 命中该段，命中不到返回空串", () => {
  const resume = "# 某某\n\n## 专业技能\nJava、Spring\n\n## 项目经历\n1. FlowMind（流程设计）\n全栈开发\n2. OTC-Agent（指令助手）\nAgent 开发\n";
  const hit = resumeSlice(resume, { anchor: "OTC-Agent", section: "项目经历" });
  assert.match(hit, /Agent 开发/);
  assert.doesNotMatch(hit, /FlowMind/, "只截该考点那一段，别把兄弟项目也带上");
  assert.match(resumeSlice(resume, { section: "专业技能" }), /Spring/);
  assert.equal(resumeSlice(resume, { anchor: "不存在的项目" }), "");
});

test("focusPayload 只带前端要用的字段", () => {
  assert.equal(focusPayload(null), null);
  assert.deepEqual(focusPayload({ label: "A", section: "项目经历", index: 3, total: 18, round: 2 }), {
    focus: { label: "A", section: "项目经历", index: 3, total: 18, round: 2 },
  });
});
