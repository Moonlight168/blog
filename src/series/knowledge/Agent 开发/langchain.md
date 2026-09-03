---
title: LangChain
order: 4
date: 2026-08-22
categories: ["Agent 开发"]
---

# LangChain 面试题

## LangChain 是什么？核心价值在哪？

**锚点**：`统一调用抽象 + 标准组件 + 生态大；但早期被吐槽太抽象`

1. **统一 LLM 调用抽象**：OpenAI、Claude 都是同一套接口，换模型不改业务代码
2. **标准组件**：Prompt 管理、模型调用、输出解析、Retriever、记忆、工具调用都有现成组件，拼装即用
3. **生态大**：社区和集成最广，文档、第三方集成、AI 应用基本绕不开
4. **实话**：早期版本太抽象、太绕，简单功能代码比直接调 API 还长；现在主流是 LangGraph（编排）或直接调模型，LangChain 越来越偏"组件库"

→ [回答历史](/private/series/答题历史/Agent%20开发/langchain-答题记录.md#langchain-是什么-核心价值在哪)

---

## LangChain 和 LangGraph 是什么关系？各自解决什么问题？

**锚点**：`LangChain 给积木（组件库），LangGraph 给图纸（编排引擎）`

1. **LangChain 组件库**：模型、Prompt、Retriever、Memory、Tool 现成组件，适合快速拼线性应用
2. **LangGraph 编排引擎**：专门做"图"式有状态编排——节点、边、状态、循环、条件路由，适合复杂工作流和 Agent，建立在 LangChain 组件之上
3. **选型**：简单应用 LangChain 够；复杂流程、要循环和状态管理的用 LangGraph

→ [回答历史](/private/series/答题历史/Agent%20开发/langchain-答题记录.md#langchain-和-langgraph-是什么关系-各自解决什么问题)

---

## Chain 和 Agent 有什么区别？

**锚点**：`Chain 是写死的流程，Agent 是模型自己决策的流程`

1. **Chain**：步骤确定，先 A 再 B 再 C，模型只在每步内有限输出——可预期、稳定、好调试
2. **Agent**：给目标自己决定调哪个工具、走哪条路，还能根据结果回头调整——灵活、上限高，但不稳定、要防死循环
3. **选型**：业务规则清楚用 Chain，需要探索决策用 Agent；常见混合：Chain 打底 + 关键节点给 Agent 自主

→ [回答历史](/private/series/答题历史/Agent%20开发/langchain-答题记录.md#chain-和-agent-有什么区别)

---

## LCEL（LangChain Expression Language）是什么？为什么用它？

**锚点**：`管道符声明式组装：prompt | model | outputParser`

1. **声明式组装**：一条管道串完"Prompt → 模型 → 输出解析"，代码比手写每步简洁
2. **自动流式**：LCEL 兼容组件自动支持流式输出、异步、批量
3. **可组合**：一个 Runnable 能嵌入另一个管道，搭积木

区别本质：**不是命令式地"调用"，而是声明式地"描述流程"**，框架来执行。

→ [回答历史](/private/series/答题历史/Agent%20开发/langchain-答题记录.md#lcel-langchain-expression-language-是什么-为什么用它)

---

## 你实际用 LangChain 踩过什么坑？

**锚点**：`版本割裂、过度抽象、调试难、Chain/Agent 混用`

1. **版本割裂**：迭代快，旧代码一升级就废，教程很多过时——锁版本 + 只信官方文档
2. **过度抽象**：简单功能代码比直接调 API 还绕——能直连模型就直连，需要拼装才上 LangChain
3. **调试难**：框架隐藏细节，出问题不好定位——每步打日志看输入输出
4. **Chain/Agent 混用**：需要模型决策的地方用了写死的 Chain，业务一复杂就绕不动——复杂编排上 LangGraph

一句话：LangChain 好用但别滥用，复杂编排上 LangGraph，简单直连就直连。

→ [回答历史](/private/series/答题历史/Agent%20开发/langchain-答题记录.md#你实际用-langchain-踩过什么坑)
