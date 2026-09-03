---
title: Spring AI
order: 6
date: 2026-08-22
categories: ["Agent 开发"]
---

# Spring AI 面试题

## Spring AI 怎么把自定义工具注册给 Agent 调用？Agent 怎么知道该调哪个工具？

**锚点**：`@Tool 注册 → LLM 读 description 选工具 → 输出 JSON 参数回传`

1. **注册工具**：用 `@Tool`（或 `@ToolMethod`）注解标记方法，Spring AI 启动时自动扫描注册成 Function Calling 工具
2. **Agent 选择工具**：LLM 读到每个工具的 name + description，按用户意图匹配最合适的，输出结构化调用参数 JSON；框架解析参数调用方法，结果返回模型
3. **关键在 description**：功能、参数含义、什么时候该用说清楚，模型才不会乱选

核心工作量其实在**把每个工具的 description 写好**。

→ [回答历史](/private/series/答题历史/Agent%20开发/springai-答题记录.md#spring-ai-怎么把自定义工具注册给-agent-调用-agent-怎么知道该调哪个工具)

---

## Agent 调用工具返回数据太大，怎么防爆上下文？

**锚点**：`治本在工具侧裁剪，其余是兜底手段`

1. **工具侧裁剪（最重要）**：返回值只留 LLM 真正需要的字段，JSON 扁平化，别整坨透传
2. **限制迭代次数**：设 `max_iterations`，防 Agent 反复调工具死循环
3. **摘要压缩**：超出 N 轮的历史对话用 LLM 做摘要，保留关键信息
4. **模型分层**：简单请求走小模型（Haiku），省 token
5. **分页返回**：结果太大分多次返回，按需加载

原则一句话：**工具返回越精简越好，够用就行，别让 Agent 读它不需要的东西。**

→ [回答历史](/private/series/答题历史/Agent%20开发/springai-答题记录.md#agent-调用工具返回数据太大-怎么防爆上下文)
