---
title: LangGraph 面试题
icon: graph
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

| LangChain | LangGraph |
|-----------|-----------|
| 组件库 | 编排引擎 |
| 线性 Chain | 循环图结构 |
| 简单流程 | 复杂状态机 |

LangGraph 是 LangChain 的补充，专注于复杂工作流编排。

## LangGraph 的核心概念有哪些？

1. **State（状态）** - 应用的状态结构定义
2. **Nodes（节点）** - 执行具体逻辑的函数
3. **Edges（边）** - 节点间的流转逻辑
4. **Graph** - 由节点和边组成的有向图
5. **Checkpoint** - 状态持久化检查点

## 什么是 StateGraph？

StateGraph 是 LangGraph 的核心类，定义状态流转图。

基本结构：
```python
from langgraph.graph import StateGraph

class State(TypedDict):
    messages: list

graph = StateGraph(State)
graph.add_node("agent", agent_function)
graph.add_edge("agent", "human_review")
graph.set_entry_point("agent")
```

## Node 的作用是什么？

Node 是执行具体逻辑的函数单元。

特点：
1. 接收当前状态作为输入
2. 返回状态更新（字典）
3. 可以是 LLM 调用、工具执行、条件判断等

## Edge 有哪些类型？

1. **普通边** - 直接连接到下一个节点
2. **条件边** - 根据返回值决定走向
3. **入口边** - 指定起始节点
4. **结束边** - 指向 END 终止流程

## 如何实现条件路由？

使用 `add_conditional_edges`：

```python
def route(state):
    if state["score"] > 0.8:
        return "accept"
    return "revise"

graph.add_conditional_edges(
    "agent",
    route,
    {
        "accept": "final",
        "revise": "revision"
    }
)
```

## 什么是 Checkpointing？

Checkpointing 是状态持久化机制。

作用：
1. **断点续跑** - 中断后继续执行
2. **时间旅行** - 回看历史状态
3. **调试** - 查看中间状态
4. **人类介入** - 暂停等待人工审核

## 如何实现人类介入（Human-in-the-loop）？

1. 在需要人工审核的节点后暂停
2. 保存检查点
3. 等待人工审批或修改
4. 从检查点恢复执行

典型场景：
- 内容审核
- 敏感操作确认
- 质量检查

## LangGraph 支持循环吗？

支持。这是 LangGraph 相比 LangChain Chain 的主要优势。

循环实现：
```python
graph.add_edge("review", "agent")  # 返回上一步
graph.add_conditional_edges(
    "review",
    should_continue,
    {
        "continue": "agent",  # 循环
        "end": END
    }
)
```

## 什么是入口点（Entry Point）？

入口点是图执行的起始节点。

设置方式：
```python
graph.set_entry_point("node_name")
```

## 如何编译并运行图？

```python
app = graph.compile()

# 执行
result = app.invoke({"messages": ["hello"]})

# 流式执行
for event in app.stream({"messages": ["hello"]}):
    print(event)
```

## LangGraph 适合什么场景？

1. **多轮对话** - 需要维护对话状态
2. **工作流审批** - 需要人工介入
3. **迭代优化** - 需要循环改进
4. **多 Agent 协作** - 多个角色配合
5. **复杂决策树** - 条件分支较多

## END 是什么？

END 是 LangGraph 中的特殊节点，表示图的终止。

```python
from langgraph.graph import END

graph.add_edge("final_node", END)
```

## LangGraph 的状态如何更新？

节点函数返回字典，自动合并到全局状态：

```python
def agent(state):
    return {
        "messages": [new_message],
        "step": state["step"] + 1
    }
```

Reducer 函数可自定义合并逻辑。
