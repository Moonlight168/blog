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

→ [回答历史](../../../series/答题历史/Java/java-答题记录.md#langgraph-核心概念和直接调-llm-的区别)
