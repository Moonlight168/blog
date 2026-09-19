/**
 * 考点计划：让出题**有顺序、跨场推进、且不重复**。
 *
 * 为什么必须由系统来记：模型每次自己声明的 focus 措辞都不一样
 * （"LangGraph 状态持久化" / "Checkpoint 设计" / "会话状态存储" 其实是同一个点），
 * 靠它自报没法判断「这个考点是不是问过了」。所以计划生成一次、存库，
 * 进度（cursor）由我们推进，出题时只告诉模型「本轮只考这一个点」。
 */

import { createHash } from "node:crypto";
import type { Db } from "../../db/index.ts";
import type { Focus, Session } from "../../../shared/types.ts";

const MAX_FOCUS = 18;

/**
 * 计划只用到这两个依赖的各一个方法，所以按**结构**收窄，而不是要求整个 QuestionIndex / InterviewAgent。
 * 这样调用方（含测试）不必为了出一个计划去造一整套索引与模型客户端。
 */
export interface ChapterTitles {
  titles(chapterPath: string, limit?: number): string[];
}
export interface ResumeOutliner {
  outlineResume(input: { session: Session }): Promise<unknown>;
}

/** 计划的键：路径或内容变化都是另一条进度线，避免同路径文件更新后继续使用旧考点。 */
export function planKey(session: Session): string {
  const version = createHash("sha256")
    .update(`${session.resumeExcerpt ?? ""}\0${session.jdExcerpt ?? ""}\0${session.skillSnapshot ?? ""}`)
    .digest("hex").slice(0, 12);
  return session.mode === "jd"
    ? `jd|${session.resumePath}|${session.jdPath ?? ""}|${version}`
    : `chapter|${session.resumePath}|${session.chapterPath}|${version}`;
}

/** 章节模式的考点表：直接拿题库里这一章已有的题目标题（0 成本，不调模型） */
export function chapterFocuses(questionIndex: ChapterTitles, chapterPath: string, chapterName = ""): Focus[] {
  const focuses = questionIndex.titles(chapterPath, MAX_FOCUS)
    .filter(Boolean)
    .map((title) => ({ label: title, section: chapterName, anchor: "", intent: "" }));
  if (chapterName && !focuses.some((item) => item.label === chapterName)) {
    focuses.unshift({ label: chapterName, section: chapterName, anchor: "", intent: "" });
  }
  return focuses.slice(0, MAX_FOCUS);
}

/** 岗位定制的考点表：一次 LLM 调用，把简历 + JD 按简历板块顺序拆成考点 */
export async function resumeFocuses(agent: ResumeOutliner, session: Session): Promise<Focus[]> {
  const result = await agent.outlineResume({ session });
  const focuses = (result as { focuses?: Array<Partial<Focus>> } | null)?.focuses;
  return (Array.isArray(focuses) ? focuses : [])
    .map((item) => ({
      label: String(item?.label ?? "").trim(),
      section: String(item?.section ?? "").trim(),
      anchor: String(item?.anchor ?? "").trim(),
      intent: String(item?.intent ?? "").trim(),
    }))
    .filter((item) => item.label)
    .slice(0, MAX_FOCUS);
}

/**
 * 取计划：同一份「简历 + JD」（或简历 + 章节）复用已有计划，没有才新建。
 * 生成失败不能让面试挂掉——返回空计划，出题退回「整篇简历」的老路。
 */
export async function ensurePlan({ db, agent, questionIndex, session, chapterName = "" }: {
  db: Db; agent: ResumeOutliner; questionIndex: ChapterTitles; session: Session; chapterName?: string;
}): Promise<{ key: string; plan: Focus[]; cursor: number }> {
  const key = planKey(session);
  const existing = db.prepare("SELECT plan,cursor FROM focus_plans WHERE key=?").get(key);
  if (existing) {
    const plan = JSON.parse(String(existing.plan)) as Focus[];
    if (plan.length) return { key, plan, cursor: Number(existing.cursor ?? 0) };
  }
  let focuses: Focus[] = [];
  try {
    focuses = session.mode === "jd"
      ? await resumeFocuses(agent, session)
      : chapterFocuses(questionIndex, session.chapterPath, chapterName);
  } catch (error) {
    console.warn(`考点计划生成失败，本题按整篇简历出题：${(error as Error).message}`);
  }
  db.prepare(`INSERT INTO focus_plans(key,kind,plan,cursor,updated_at) VALUES(?,?,?,0,?)
    ON CONFLICT(key) DO UPDATE SET plan=excluded.plan, updated_at=excluded.updated_at`)
    .run(key, session.mode === "jd" ? "resume" : "chapter", JSON.stringify(focuses), new Date().toISOString());
  return { key, plan: focuses, cursor: 0 };
}

/**
 * 取下 count 个考点并推进跨场游标。
 * cursor 单调递增：实际考点 = plan[cursor % len]，第几轮 = floor(cursor / len) + 1。
 * 计划为空（生成失败过）时返回 []，调用方回退到老的出题方式。
 */
export function takeFocuses(db: Db, { key, plan }: { key: string; plan: Focus[] | null }, count = 1): Focus[] {
  if (!plan?.length) return [];
  const row = db.prepare("SELECT cursor FROM focus_plans WHERE key=?").get(key);
  const cursor = Number(row?.cursor ?? 0);
  const taken: Focus[] = [];
  for (let offset = 0; offset < count; offset += 1) {
    const position = cursor + offset;
    taken.push({
      ...plan[position % plan.length],
      index: (position % plan.length) + 1,
      total: plan.length,
      round: Math.floor(position / plan.length) + 1,
    });
  }
  db.prepare("UPDATE focus_plans SET cursor=?, updated_at=? WHERE key=?").run(cursor + count, new Date().toISOString(), key);
  return taken;
}

/** 随题目消息带给前端的字段（只放显示要用的，别把整段提示词塞进 payload） */
/** 随题目消息带给前端的载荷：只放显示要用的，别把整段提示词塞进去 */
export interface FocusPayload {
  focus: { label: string; section: string; index?: number; total?: number; round: number };
}

export function focusPayload(next: Focus | null | undefined): FocusPayload | null {
  if (!next?.label) return null;
  return { focus: { label: next.label, section: next.section ?? "", index: next.index, total: next.total, round: next.round ?? 1 } };
}

/** 简历拆块：每块的起点是标题行（`## 板块`）或编号条目（`1. 项目名`） */
function blocks(markdown: string): string[] {
  const lines = String(markdown).split(/\r?\n/);
  const isStart = (line: string): boolean => /^#{1,4}\s/.test(line) || /^\d+\.\s/.test(line);
  const out: string[] = [];
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    if (!isStart(lines[index])) continue;
    if (start >= 0) out.push(lines.slice(start, index).join("\n"));
    start = index;
  }
  if (start >= 0) out.push(lines.slice(start).join("\n"));
  return out.map((block) => block.trim()).filter(Boolean);
}

/**
 * 只截出该考点所属的那一段简历，替掉原来每道题都重发的整篇（3,400 字 → 几百字）。
 * 关键词按「最具体 → 最泛」依次试：anchor（项目名）→ label → section（板块名）。
 * 都匹配不到就返回空串，调用方回退到整篇简历，不让出题失败。
 */
export function resumeSlice(markdown: string, focus: Focus): string {
  if (!markdown) return "";
  const pieces = blocks(markdown);
  for (const keyword of [focus?.anchor, focus?.label, focus?.section]) {
    if (!keyword) continue;
    const hit = pieces.find((block) => block.includes(keyword));
    if (hit) return hit;
  }
  return "";
}
