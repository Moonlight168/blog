/**
 * NDJSON 流式事件：服务端推、前端消费，两边共用这一份定义。
 *
 * 传输沿用既有的 NDJSON（`Content-Type: application/x-ndjson`），不是 SSE ——
 * 面试链路本来就跑在这套协议上，换协议没有收益。
 */

export const EVENT = {
  /** 正在做什么（查询资料 / 保存归档…）——给人看的阶段提示 */
  stage: "stage",
  /** 开始用某个工具 */
  tool: "tool",
  /** 模型正在说的字 */
  draft: "draft",
  /** 评分结果定了 */
  evaluation: "evaluation",
  /** 这一轮结束，带最终数据 */
  result: "result",
  /** 出错（一条人话） */
  error: "error",
} as const;

export type StreamEventType = (typeof EVENT)[keyof typeof EVENT];

export interface StageEvent {
  type: "stage";
  stage?: string;
  [key: string]: unknown;
}

export interface ToolEvent {
  type: "tool";
  name?: string;
}

/**
 * 模型吐字的**增量片段**，不是累积文本。
 *
 * 消费方必须 `+=` 拼接：早期版本服务端推的是「累积后的整段」，前端用赋值接；
 * 改成逐字增量之后若还赋值，气泡里就只剩最后一个字。
 */
export interface DraftEvent {
  type: "draft";
  kind?: string;
  content: string;
}

export interface EvaluationEvent {
  type: "evaluation";
  evaluation: { score: number; comment: string };
}

export interface ResultEvent<T = unknown> {
  type: "result";
  data: T;
}

export interface ErrorEvent {
  type: "error";
  error: string;
}

export type StreamEvent =
  | StageEvent
  | ToolEvent
  | DraftEvent
  | EvaluationEvent
  | ResultEvent
  | ErrorEvent;
