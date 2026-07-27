---
title: Flowable
icon: /assets/icon/flowable.png
---

# Flowable 面试题

## 多人审批（会签）怎么实现？一个节点 3 人全部同意才通过？

- 用 Flowable **多实例（Multi-instance）**：`collection` 指定审批人列表，`completionCondition` 设 `${nrOfCompletedInstances == nrOfInstances}` 即全部同意才通过。
- `sequential="false"` 并行会签（同时审），`sequential="true"` 串行会签（依次审）。

→ [回答历史](/series/答题历史/工作流/flowable-答题记录.md#多人审批会签怎么实现一个节点-3-人全部同意才通过)

## 多实例任务底层原理？

- 多实例本质是**动态生成 N 个子任务**（ActivityImpl），每个审批人对应一个 task 实例。
- 内层用变量 `nrOfInstances`（总实例数）、`nrOfCompletedInstances`（已完成数）、`loopCounter`（当前索引）追踪状态。
- 所有子任务完成后触发 completionCondition 评估，满足则流转到下一节点。
- 底层有 `MultiInstanceBehavior` 控制并行/串行执行模式。

→ [回答历史](/series/答题历史/工作流/flowable-答题记录.md#多实例任务底层原理)