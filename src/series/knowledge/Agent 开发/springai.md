---
title: Spring AI
date: 2026-08-22
categories: ["Agent 开发"]
---

# Spring AI 面试题

## Spring AI 怎么把自定义工具注册给 Agent 调用？Agent 怎么知道该调哪个工具？

这个我用 Spring AI 做过，流程挺清晰的。

1. **注册工具**：用 `@Tool`（或 `@ToolMethod`）注解标记一个方法，Spring AI 启动时自动扫描、把它注册成 Function Calling 工具。
2. **Agent 选择工具**：靠的是 **Function Calling** 机制——LLM 会读到每个工具的 name + description，根据用户意图匹配最合适的工具，然后输出结构化的调用参数（JSON），框架解析参数、调用对应方法，把结果返回给模型。
3. **关键在 description**：工具怎么被选中，全靠 description 写得清不清楚——要把功能、参数含义、什么时候该用说清楚，模型才不会乱选。

所以调工具这事的核心工作量，其实在**把每个工具的 description 写好**。

→ [回答历史](/private/series/答题历史/Agent%20开发/springai-答题记录.md#spring-ai-怎么把自定义工具注册给-agent-调用-agent-怎么知道该调哪个工具)

---

## Agent 调用工具返回数据太大，怎么防爆上下文？

几个有效手段：

1. **工具侧裁剪（最重要）**：返回值只保留 LLM 真正需要的字段，JSON 扁平化，别把整坨数据透传过去。这是治本。
2. **限制迭代次数**：设 `max_iterations`，防止 Agent 反复调工具死循环，把上下文撑爆。
3. **摘要压缩**：超出 N 轮的历史对话用 LLM 做摘要，保留关键信息，牺牲细节。
4. **模型分层**：简单请求走小模型（Haiku），省 token。
5. **分页返回**：结果太大的分多次返回，按需加载，别一次全塞。

我的原则就一句话：**工具返回越精简越好，够用就行，别让 Agent 读它不需要的东西**。

→ [回答历史](/private/series/答题历史/Agent%20开发/springai-答题记录.md#agent-调用工具返回数据太大-怎么防爆上下文)
