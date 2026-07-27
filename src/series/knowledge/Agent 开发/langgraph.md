---
title: LangGraph
---
# LangGraph 面试题

## LangGraph 是什么？

LangGraph 是 LangChain 团队推出的基于图的状态管理库，用于构建有状态、多参与者的 LLM 应用。

核心特点：

1. **循环支持** - 支持循环和分支的工作流
2. **状态管理** - 明确定义和传递状态
3. **持久化** - 支持检查点和时间旅行
4. **人类介入** - 支持人工审核和干预

## LangGraph 与 LangChain 的关系？

| LangChain  | LangGraph  |
| ---------- | ---------- |
| 组件库     | 编排引擎   |
| 线性 Chain | 循环图结构 |
| 简单流程   | 复杂状态机 |

LangGraph 是 LangChain 的补充，专注于复杂工作流编排。

## LangGraph 的核心概念有哪些？

1. **State（状态）** - 应用的状态结构定义
2. **Nodes（节点）** - 执行具体逻辑的函数
3. **Edges（边）** - 节点间的流转逻辑
4. **Graph** - 由节点和边组成的有向图
5. **Checkpoint** - 状态持久化检查点

## LangGraph 核心概念？和直接调 LLM 的区别？

- LangGraph：LLM 调用组织成**有状态的图**，开发者定义节点/边，LLM 运行时决定路由。支持 human-in-loop。
- 直接调 LLM：应用代码决定每一步，不是 LLM 自己决策。

→ [回答历史](/series/答题历史/Agent 开发/langgraph-答题记录.md#langgraph-核心概念和直接调-llm-的区别)

## LangGraph 的 state 是什么？和普通 dict 的区别？

- State 是 LangGraph 图的**共享记忆**，用 TypedDict 定义 schema。
- 每个节点读 state → 做决策 → 写回 state，流转到下一节点。
- 和普通 dict 区别：有 **schema 约束**（类型安全）、支持 **reducer**（如 `operator.add` 合并消息列表）、保证并发挥节点数据安全合并。
- 你项目里可能存：消息历史、用户意图、生成的审批流程 JSON、校验状态、下一步路由。

→ [回答历史](/series/答题历史/Agent 开发/langgraph-答题记录.md#langgraph-的-state-是什么和普通-dict-的区别)

## LangGraph 节点之间怎么路由？条件边是什么？

- **条件边**（conditional edge）：节点执行完后，根据返回值判断走哪个分支（类似 if-else）。
- 图定义时需要声明：`builder.add_conditional_edges("node_a", router_func, {"path_a": "node_b", "path_b": "node_c"})`
- 和普通边区别：普通边固定流转，条件边是 LLM/逻辑决定下一步。

→ [回答历史](/series/答题历史/Agent 开发/langgraph-答题记录.md#langgraph-节点之间怎么路由条件边是什么)
