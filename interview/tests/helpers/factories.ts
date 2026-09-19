import type { SessionWithFocus } from "../../shared/types.ts";

/**
 * 测试夹具：领域对象的工厂。
 *
 * 为什么要工厂而不是直接写字面量：`Session` 有 8 个必填字段，
 * 而单个用例通常只关心其中一两个 —— 手写字面量要么漏字段（类型不过），
 * 要么把八行样板抄满每个用例。工厂给全部必填项兜上默认值，用例只写它关心的。
 */

/**
 * 一场进行中的面试。默认值只是一个「形状对得上」的普通会话，不含任何真实信息。
 * 返回 SessionWithFocus —— 它比 Session 多几个只挂在内存里的临时字段（考点、简历片段），
 * 它比 Session 只多不少，所以需要 Session 的地方直接用它就行。
 */
export function makeSession(over: Partial<SessionWithFocus> = {}): SessionWithFocus {
  return {
    id: "s1",
    resumePath: "resume/zhangsan/张三-后端.html",
    series: "Java",
    chapterPath: "Java/多线程.md",
    mode: "interview",
    durationMinutes: 30,
    status: "active",
    startedAt: "2026-09-19T02:00:00.000Z",
    ...over,
  };
}
