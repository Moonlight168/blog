---
title: UML建模
icon: /assets/icon/UML.png
order: 5
---

## 什么是UML?
UML（Unified Modeling Language）统一建模语言，是一种用于描述软件系统的语言。

## UML中有什么图？

### 结构图（描述系统静态结构）

1. **类图（Class Diagram）**：描述类、接口及其关系
2. **对象图（Object Diagram）**：描述对象及其关系
3. **组件图（Component Diagram）**：描述系统组件的组织结构
4. **部署图（Deployment Diagram）**：描述系统硬件部署
5. **包图（Package Diagram）**：描述系统的包结构
6. **组合结构图（Composite Structure Diagram）**：描述类的内部结构

### 行为图（描述系统动态行为）

1. **用例图（Use Case Diagram）**：描述用户与系统交互
2. **活动图（Activity Diagram）**：描述业务流程或操作流程
3. **状态机图（State Machine Diagram）**：描述对象状态变化
4. **顺序图（Sequence Diagram）**：也称序列图，描述对象间交互时序
5. **通信图（Communication Diagram）**：描述对象间协作关系
6. **交互概览图（Interaction Overview Diagram）**：描述交互流程
7. **时序图（Timing Diagram）**：也称定时图，描述对象状态随时间变化

> **简单记忆**：结构图关注"有什么"，行为图关注"做什么"


## 用例图中extend与include的区别

**核心区别**

| 特性 | **include（包含）** | **extend（扩展）** |
|------|-------------------|-------------------|
| **目的** | 复用公共用例，避免重复 | 添加可选功能，增强主用例 |
| **执行方式** | **必须执行**的公共步骤 | **条件触发**的可选步骤 |
| **方向** | 基础用例 → 包含用例 | 扩展用例 → 基础用例 |
| **场景** | 多个用例共享相同步骤 | 在特定条件下增强功能 |

**简单理解**

* **include** = 必做事项（如：登录后才能操作）
* **extend** = 可选事项（如：VIP用户额外功能）

@startuml
left to right direction
skinparam packageStyle rectangle

actor 用户
actor VIP用户

rectangle "购物系统" {
usecase "浏览商品" as UC1
usecase "购买商品" as UC2
usecase "用户登录" as UC3  
usecase "支付订单" as UC4
usecase "使用优惠券" as UC5
usecase "申请退款" as UC6

UC2 ..> UC3 : <<include>>  # 购买前必须登录
UC4 ..> UC3 : <<include>>  # 支付前必须登录
UC5 ..> UC2 : <<extend>>   # 可选使用优惠券
UC6 ..> UC2 : <<extend>>   # 可选申请退款
}

用户 --> UC1
用户 --> UC2
VIP用户 --> UC2
VIP用户 --> UC5
VIP用户 --> UC6
@enduml

1. **include关系**（虚线箭头+`<<include>>`）：
    - `购买商品` 必须包含 `用户登录`
    - `购买商品` 必须包含 `支付订单`

2. **extend关系**（虚线箭头+`<<extend>>`）：
    - `使用优惠券` 可选扩展 `购买商品`（VIP专享）
    - `申请退款` 可选扩展 `购买商品`（条件触发）

**记忆口诀**

> **"包含必做，扩展可选"**
> include：没有我，你干不了  
> extend：没有我，你照样干，有了我更香





