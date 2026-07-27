---
title: Spring AI
---

# Spring AI 面试题

## Spring AI 怎么把自定义工具注册给 Agent 调用？Agent 怎么知道该调哪个工具？

- 用 `@Tool`（或 `@ToolMethod`）注解标记方法，Spring AI 自动扫描并注册为 Function Calling 工具。
- Agent 通过 **Function Calling**：LLM 读取每个工具的 name + description，根据用户意图匹配最合适的工具，输出结构化调用参数（JSON），框架解析参数调用对应方法。
- 工具 description 是关键——要写清楚功能、参数含义、什么时候该用。

→ [回答历史](/series/答题历史/Agent 开发/springai-答题记录.md#spring-ai-怎么把自定义工具注册给-agent-调用agent-怎么知道该调哪个工具)

## Agent 调用工具返回数据太大，怎么防爆上下文？

1. **工具侧裁剪**：返回值只保留 LLM 需要的字段，JSON 扁平化，不冗余。
2. **摘要压缩**：超出 N 轮的历史用 LLM 做摘要，保留关键信息。
3. **限制迭代**：设 `max_iterations`，防止 Agent 反复调工具死循环。
4. **模型分层**：简单请求走小模型（Haiku），省 token。
5. **分页返回**：大结果分次返回，按需加载。

→ [回答历史](/series/答题历史/Agent 开发/springai-答题记录.md#agent-调用工具返回数据太大怎么防爆上下文)

