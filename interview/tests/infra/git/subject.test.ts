import assert from "node:assert/strict";
import test from "node:test";

import { commitDateText, decorateCommits, parseCommitMessage } from "../../../server/infra/git/subject.ts";

// 下面几条用例的输入全部取自 src/private 仓库里的真实提交信息——
// 这一层要处理的正是「历史里已经写下的那些话」，不是理想格式。
//
// 这批老提交把要点挤在 subject 里用「；」隔开（没有 body），走的是兜底分支；
// 新格式是 subject + body 两段，见文件末尾那几条。

test("剥掉开头的日期：日期已经在 meta 行显示，信息里不该再说一遍", () => {
  const { title } = parseCommitMessage("2026-09-16 面试记录按新规范重排（5 场）；自我介绍规范独立成文；废弃稿件目录清理");
  assert.equal(title, "面试记录按新规范重排（5 场）");
});

test("同一句里后面的日期不动——只认开头那一个", () => {
  const { title } = parseCommitMessage("2026-09-07 补 2026-08-30 的投递记录");
  assert.equal(title, "补 2026-08-30 的投递记录");
});

test("取出版本号，标题里就不再留着它", () => {
  const { version, title } = parseCommitMessage("1.02 开场压缩到两句");
  assert.equal(version, "1.02");
  assert.equal(title, "开场压缩到两句");
});

test("按「；」拆点：第一点当标题，其余列在下面", () => {
  const { title, points } = parseCommitMessage("面试记录：按新规范重排 5 场；自我介绍规范独立成文；清掉废弃稿件目录");
  assert.equal(title, "面试记录：按新规范重排 5 场");
  assert.deepEqual(points, ["自我介绍规范独立成文", "清掉废弃稿件目录"]);
});

test("括号里的顿号不拆——拆了会碎成「（FastAPI」和「LangGraph）」", () => {
  const { title, points } = parseCommitMessage(
    "2026-09-15 简历：凸显 Python 能力；技能 AI 行 Python 前置（FastAPI、LangGraph），并同步 txt 版",
  );
  assert.equal(title, "简历：凸显 Python 能力");
  assert.deepEqual(points, ["技能 AI 行 Python 前置（FastAPI、LangGraph），并同步 txt 版"]);
});

test("句号也当分隔，末尾的空段丢掉", () => {
  const { title, points } = parseCommitMessage("自我介绍：独立成文；建立版本管理基线。");
  assert.equal(title, "自我介绍：独立成文");
  assert.deepEqual(points, ["建立版本管理基线"]);
});

test("没有分隔符就是一句话，不硬拆", () => {
  const { title, points } = parseCommitMessage("自我介绍：编辑器保存");
  assert.equal(title, "自我介绍：编辑器保存");
  assert.deepEqual(points, []);
});

test("conventional commit 也当普通标题，不误判成版本号", () => {
  const { version, title, points } = parseCommitMessage("chore: private 初始内容（hires/offer/实习笔记）");
  assert.equal(version, "");
  assert.equal(title, "chore: private 初始内容（hires/offer/实习笔记）");
  assert.deepEqual(points, []);
});

test("空值不炸：拿不到就给空标题，交给调用方兜底", () => {
  for (const value of [undefined, null, "", "   "]) {
    const parsed = parseCommitMessage(value);
    assert.equal(parsed.title, "");
    assert.deepEqual(parsed.points, []);
  }
});

test("版本号按「第几次提交」算：新→旧排列，最旧那条是 1.0", () => {
  const raw = [
    { hash: "c", date: "2026-09-16T10:00:00+08:00", subject: "第三次" },
    { hash: "b", date: "2026-09-15T10:00:00+08:00", subject: "第二次" },
    { hash: "a", date: "2026-09-14T10:00:00+08:00", subject: "第一次" },
  ];
  assert.deepEqual(decorateCommits(raw).map((item) => item.version), ["1.02", "1.01", "1.0"]);
});

test("信息里已经写了版本号就用它的，不按位置再补一个", () => {
  const raw = [
    { hash: "b", date: "2026-09-16T10:00:00+08:00", subject: "1.07 后来手写的一版" },
    { hash: "a", date: "2026-09-15T10:00:00+08:00", subject: "最早那版" },
  ];
  assert.deepEqual(decorateCommits(raw).map((item) => item.version), ["1.07", "1.0"]);
});

test("时间同年省年份，跨年写全；完整值另外给一份挂着", () => {
  assert.deepEqual(commitDateText("2026-09-17T21:11:44+08:00", "2026"), { text: "09-17 21:11", full: "2026-09-17 21:11" });
  assert.deepEqual(commitDateText("2025-12-31T08:05:00+08:00", "2026"), { text: "2025-12-31 08:05", full: "2025-12-31 08:05" });
});

test("时间按字符串切，不换算成本机时区——git 记的是当时那个时刻", () => {
  const { full } = commitDateText("2026-09-17T21:11:44-05:00", "2026");
  assert.equal(full, "2026-09-17 21:11");
});

test("时间给得不认识就原样返回，不显示 Invalid Date", () => {
  assert.deepEqual(commitDateText("", "2026"), { text: "", full: "" });
  assert.deepEqual(commitDateText("前天", "2026"), { text: "前天", full: "前天" });
});

test("decorateCommits 对非数组输入返回空数组，页面拿到的是可渲染的东西", () => {
  assert.deepEqual(decorateCommits(undefined), []);
});

test("内容一个字没动的提交不进列表，版本号也只数真版本", () => {
  const raw = [
    { hash: "d", date: "2026-09-18T10:00:00+08:00", subject: "第四次", changed: true },
    { hash: "c", date: "2026-09-17T10:00:00+08:00", subject: "第三次（只挪了位置）", changed: false },
    { hash: "b", date: "2026-09-16T10:00:00+08:00", subject: "第二次", changed: true },
    { hash: "a", date: "2026-09-15T10:00:00+08:00", subject: "第一次", changed: true },
  ];
  const list = decorateCommits(raw);
  assert.deepEqual(list.map((item) => item.title), ["第四次", "第二次", "第一次"], "只挪位置的那条被滤掉");
  assert.deepEqual(list.map((item) => item.version), ["1.02", "1.01", "1.0"], "编号跳过没内容的那条");
});

test("没有 changed 字段的提交当有改动处理，不能因缺字段就把历史吃掉", () => {
  const raw = [
    { hash: "b", date: "2026-09-16T10:00:00+08:00", subject: "第二次" },
    { hash: "a", date: "2026-09-15T10:00:00+08:00", subject: "第一次" },
  ];
  assert.equal(decorateCommits(raw).length, 2);
});

// ---- 新格式：subject 是标题，body 是逐条详情 ----

test("第一行当标题（整行不拆），body 的每一行当一条详情", () => {
  const { title, points } = parseCommitMessage(
    "简历：页边距收紧；教育经历两段学历合并",
    "- 页边距 12mm 14mm → 8mm 12mm\n- 两段学历合并成一行\n- 技能栏措辞收敛",
  );
  assert.equal(title, "简历：页边距收紧；教育经历两段学历合并", "标题是整行，不按「；」拆");
  assert.deepEqual(points, ["页边距 12mm 14mm → 8mm 12mm", "两段学历合并成一行", "技能栏措辞收敛"]);
});

test("body 里的 markdown 列表符号去掉，空行与缩进丢掉", () => {
  const { points } = parseCommitMessage("标题", "- 改了一处\n\n  - 改了另一处\n* 又一处");
  assert.deepEqual(points, ["改了一处", "改了另一处", "又一处"]);
});

test("body 为空时退回老格式：按「；」拆 subject", () => {
  const { title, points } = parseCommitMessage("自我介绍：独立成文；建立版本管理基线");
  assert.equal(title, "自我介绍：独立成文");
  assert.deepEqual(points, ["建立版本管理基线"]);
});

test("版本号与日期前缀在两种格式下都剥得掉", () => {
  const { version, title } = parseCommitMessage("2026-09-16 1.02 开场压缩到两句", "- 开场压到两句");
  assert.equal(version, "1.02");
  assert.equal(title, "开场压缩到两句");
});

test("decorateCommits 把 body 一路带出来", () => {
  const raw = [
    { hash: "b", date: "2026-09-16T10:00:00+08:00", subject: "简历：技能栏重排", body: "- 拆出工程能力\n- 去掉重复项", changed: true },
  ];
  const [item] = decorateCommits(raw);
  assert.equal(item.title, "简历：技能栏重排");
  assert.deepEqual(item.points, ["拆出工程能力", "去掉重复项"]);
});
