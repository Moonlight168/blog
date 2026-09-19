import { createBashTool, createEditTool, createReadTool, createWriteTool } from "@earendil-works/pi-agent-core";
import type { AgentHarnessTool, ExecutionEnv } from "@earendil-works/pi-agent-core";
import { Type } from "@earendil-works/pi-ai";

/**
 * 工具装配：pi 自带的四个能力全用上，只留一个领域工具。
 *
 * 为什么只有 submit_evaluation 是自写的：pi 没有「结构化产出」这个轮子
 * （`operationResult` 那套是 harness 内部的 operation 生命周期记录，不是给模型的工具），
 * 而「评分 + 点评」是本应用的业务契约，没有替身。
 *
 * 原先的两个自造工具已删除：
 *   - 简历 / JD / 题库都在会话工作目录里，用 pi 的 read 与 bash(grep) 直接找
 *   - 「回答 vs 追问」由「有没有调 submit_evaluation」天然区分，不需要模型专门报告
 */

/** 内置工具要从 toolContext 取 env；这个接口与 pi 内部的 ExecutionToolContext 等价，
 *  但那个名字不从包根导出，所以这里自己声明一份。 */
export interface ExecToolContext {
  env: ExecutionEnv;
}

export interface Evaluation {
  score: number;
  comment: string;
}

export interface BuildToolsOptions {
  /** 工具只回传结论，不写库 —— 存进 attempts 是服务端的事 */
  onSubmitEvaluation: (evaluation: Evaluation) => void;
}

export function buildTools({ onSubmitEvaluation }: BuildToolsOptions): AgentHarnessTool<ExecToolContext>[] {
  const submitEvaluation = {
    name: "submit_evaluation",
    label: "提交回答点评",
    description: "当候选人是在回答当前题目时调用。不会、不知道、未接触过也属于回答。不调用本工具即视为追问。",
    parameters: Type.Object({
      score: Type.Number({ minimum: 0, maximum: 100, description: "按 prompts/interviewer.md 的评分标准给 0-100" }),
      comment: Type.String({ minLength: 1, maxLength: 2_000, description: "客观指出亮点、缺口与更好的表达" }),
    }),
    execute: async (
      _toolCallId: string,
      params: { score: number; comment: string },
    ) => {
      onSubmitEvaluation({
        score: Math.max(0, Math.min(100, Number(params.score))),
        comment: String(params.comment).trim(),
      });
      return { content: [{ type: "text" as const, text: "点评已记录" }], details: {} };
    },
  } as unknown as AgentHarnessTool<ExecToolContext>;

  return [...executionTools(), submitEvaluation];
}

/**
 * 改文档场景的工具集：只有 pi 的四个能力。
 *
 * 没有 submit 类工具 —— 模型的产出就是**它对文件做的改动本身**，
 * 服务端改完从盘上读回来即可，不需要它再报一遍。
 */
export function buildEditingTools(): AgentHarnessTool<ExecToolContext>[] {
  return executionTools();
}

function executionTools(): AgentHarnessTool<ExecToolContext>[] {
  return [
    createReadTool<ExecToolContext>(),
    createWriteTool<ExecToolContext>(),
    createEditTool<ExecToolContext>(),
    createBashTool<ExecToolContext>(),
  ];
}
