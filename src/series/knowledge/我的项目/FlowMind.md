---
series: 我的项目
title: FlowMind 智能审批工作流
icon: /assets/icon/cloud_flow.png
order: 1
categories: ["我的项目"]
date: 2026-03-22
---

## 项目概述

基于 RuoYi-Cloud 二次开发的智能审批系统，采用 Spring Cloud Alibaba 微服务架构，集成 Flowable 工作流引擎实现审批流程设计、任务流转与流程追踪。系统结合 AI 服务实现审批流程智能设计与审批辅助，提高审批效率。

**技术栈：** Spring Cloud Alibaba、Flowable、MyBatis、Redis、MySQL、LangGraph、FastAPI、Vue3、Element Plus

---

## 面试问答

### Flowable 工作流引擎是如何集成到项目中的？

**回答：** 基于 RuoYi-Cloud 的 `ruoyi-flowable` 模块进行二次开发。

**追问：**

1. Flowable 的核心表有哪些？各自存储什么数据？

**回答：** Flowable 核心表分四大类：

| 前缀 | 表名 | 用途 |
|------|------|------|
| `ACT_GE_` | General | 通用表，如 `ACT_GE_BYTEARRAY`（资源文件）、`ACT_GE_PROPERTY`（属性） |
| `ACT_RE_` | Repository | 流程部署相关，`ACT_RE_PROCDEF`（流程定义）、`ACT_RE_MODEL`（模型） |
| `ACT_RU_` | Runtime | 运行时数据，`ACT_RU_EXECUTION`（执行实例）、`ACT_RU_TASK`（任务） |
| `ACT_HI_` | History | 历史数据，`ACT_HI_PROCINST`（历史流程实例）、`ACT_HI_TASKINST`（历史任务） |

2. BPMN 2.0 的主要元素有哪些？

**回答：** BPMN 2.0 核心元素：
   - **事件（Event）**：`startEvent`（开始）、`endEvent`（结束）、`intermediateEvent`（中间事件）
   - **活动（Activity）**：`userTask`（用户任务）、`serviceTask`（服务任务）、`subProcess`（子流程）
   - **网关（Gateway）**：`exclusiveGateway`（排他网关）、`parallelGateway`（并行网关）
   - **连接（Connection）**：`sequenceFlow`（顺序流），定义节点间流转方向

---

### AI 流程设计是如何实现的？

**回答：** 基于 FastAPI + LangGraph 构建 AI 服务，使用 StateGraph 实现多轮对话工作流。核心流程：
1. `intent_node`：意图识别（分类/流程设计/表单修改/审批意见）
2. `category_node`：流程分类生成
3. `flow_design_node`：流程节点设计
4. `form_design_node`：表单设计
5. `bpmn_node`：BPMN XML 生成

**追问：**

1. LangGraph 的核心概念是什么？

**回答：** LangGraph 核心概念：
   - **StateGraph（状态图）**：定义 AI 工作流整体结构，包含状态和转移逻辑
   - **Node（节点）**：执行具体操作的单元，如 LLM 调用、工具调用
   - **Edge（边）**：定义节点间流转关系，支持条件分支和循环
   - **Checkpoint**：会话状态持久化（项目使用 Redis + MySQL）

2. 如何让 AI 理解用户的流程设计意图？

**回答：** 使用 **JSON Schema 结构化输出** + **意图分类**：
   - 定义 `IntentName` 枚举（`GENERAL`、`FULL_FLOW_DESIGN`、`CONFIRM`、`MODIFY`、`EXIT`、`APPROVAL_OPINION`）
   - 使用 `build_prompt(IntentName.INTENT_CLASSIFICATION, variables)` 构建提示
   - LLM 返回符合 Schema 的 JSON（`intent`、`confidence` 字段）
   - `route_by_intent()` 函数根据意图决定下一个节点

3. 如何确保 AI 输出为 BPMN 格式？

使用 **JSON Schema 结构化输出** + **BpmnBuilder 构建**：
   - 定义 `BpmnOutput` 结构（`nodes`、`edges`、`form_fields`）
   - 使用 `with_structured_output()` 强制 LLM 返回符合 Schema 的 JSON
   - `BpmnBuilder` 将 JSON 转换为标准 BPMN 2.0 XML
   - 通过 `BpmnXMLConverter` 验证格式正确性

4. 如何防止 AI 工作流无限循环？

采用 **状态机驱动 + 最大迭代限制**：
   - **状态转移严格控制**：`NEW → CATEGORY_GENERATION → AWAITING_CONFIRM → DONE`
   - **FLOW 模式内状态机优先**：忽略 LLM 意图，完全由状态机驱动
   - **最大迭代次数**：设置 `recursion_limit=50`，超过自动终止
   - **chat_node 不连回 intent_node**：避免 CHAT 模式下无限循环


---

### Spring Cloud Alibaba 在项目中是如何应用的？

**回答：** 项目采用 Spring Cloud Alibaba 微服务架构，使用 Nacos 作为注册中心和配置中心，通过 OpenFeign 实现服务间调用，使用 Sentinel 进行流量控制和熔断降级。

**追问：**

1. Nacos 作为注册中心的工作原理是什么？

**回答：** 服务启动时向 Nacos 注册自己的 IP 和端口，Nacos 维护服务列表。消费者通过服务名从 Nacos 获取提供者列表，客户端负载均衡选择目标实例。Nacos 支持 AP/CP 模式切换，健康检查保证实例可用。

2. OpenFeign 的底层实现是什么？（Ribbon + HttpUrlConnection）

**回答：** OpenFeign = 动态代理 + 编码器 + 解码器。接口方法被动态代理拦截，构建 Request 模板，通过 Ribbon 负载均衡选择实例，HttpUrlConnection 发送 HTTP 请求，解码器将响应转为 Java 对象。

3. Sentinel 的熔断降级策略有哪些？

**回答：**
   - **QPS 流控**：单位时间内请求数超过阈值则限流
   - **线程数流控**：并发线程数超过阈值则限流
   - **熔断降级**：响应时间超时或异常比例达到阈值时熔断
   - **系统保护**：根据系统负载、CPU 使用率等自动保护

4. 微服务架构下，如何实现分布式事务？

**回答：** 常用方案：
   - **Seata**：AT 模式（无侵入 2PC）、TCC 模式（补偿事务）
   - **本地消息表**：将分布式事务拆分为本地事务 + 消息最终一致性
   - **事务消息**：RocketMQ 事务消息实现最终一致性
   - **Saga 模式**：长事务拆分为多个本地事务，失败时执行补偿操作

---

### 草稿箱功能是如何设计的？

**回答：** 设计 `wf_draft` 表存储流程草稿，实现申请表单的保存、编辑与恢复。核心接口：`saveOrUpdateDraft()` 确保同一用户对同一流程只存在一个草稿，提交时映射为正式流程实例。

**追问：**

1. 草稿表的数据结构如何设计？

**回答：** `wf_draft` 表结构：
   - `draft_id`：主键（自增）
   - `user_id`：用户 ID
   - `definition_id`：流程定义 ID
   - `deploy_id`：部署 ID
   - `process_name`：流程名称
   - `formData`：表单数据（JSON 存储）
   - `formModel`：表单模型（JSON 存储）
   - `del_flag`：逻辑删除标记（0-存在，2-删除）

2. 如何保证同一流程只能存在一个草稿？

**回答：** `saveOrUpdateDraft()` 方法逻辑：
   - 先调用 `selectByUserIdAndDefIdWithDelFlag()` 查询现有草稿（含逻辑删除）
   - 如存在则恢复草稿（`delFlag=0`），执行更新
   - 如不存在则新增草稿
   - 唯一性保障：用户 ID + 流程定义 ID

4. 草稿的 Redis 缓存设计（AI 设计流程）？

**回答：** AI 流程设计草稿存储于 Redis，24 小时过期：
   - Key 格式：`flow_design:{threadId}`
   - Value：包含 `stage`、`category`、`bpmn_xml`、`form_json` 等
   - 过期后自动持久化到 MySQL

---

### 微服务架构下，如何设计前后端与 AI 服务的数据交互流程？

**回答：** 前端通过网关访问后端微服务，后端通过 `RemoteAiService`（OpenFeign）调用 AI 服务。AI 服务注册至 Nacos，服务发现获取地址。核心接口：
- `/api/flow-design/draft`：Redis 草稿存储（24 小时过期）
- `/api/flow-design/history`：聊天历史列表

**追问：**

1. 网关在架构中起到什么作用？

**回答：** 网关作为系统统一入口，负责：
   - 路由转发（StripPrefix 去掉 `/flowmind-ai/api/v1`）
   - 身份认证、限流熔断
   - 日志记录、跨域处理
   - Spring Cloud Gateway 基于 WebFlux 实现高性能异步网关

2. 如何保证 AI 服务的高可用？

从三个层面保障：
   - **服务层面**：AI 服务多实例部署，注册到 Nacos 实现服务发现
   - **调用层面**：OpenFeign 配置重试机制 + Sentinel 熔断降级
   - **容错层面**：AI 服务不可用时返回友好提示，记录日志待人工处理

3. 服务超时如何处理？

分层超时策略：
   - **网关层**：设置全局超时（如 30s），超时返回友好提示
   - **调用层**：OpenFeign 配置 `connectTimeout` 和 `readTimeout`
   - **AI 服务层**：LLM 调用设置 `timeout` 参数，超时返回默认响应
   - **兜底策略**：超时后记录请求日志，支持后续重试或人工处理

4. 如何设计接口的幂等性？

根据业务场景选择不同策略：
   - **Token 机制**：提交表单时携带唯一 Token，服务端消费后失效
   - **唯一索引**：数据库层面通过业务唯一键（如 `user_id + process_id`）防重
   - **状态机**：流程状态流转只能单向进行，防止重复提交
   - **分布式锁**：关键操作前获取 Redis 锁，防止并发重复执行

---

### Jenkins CI/CD 流程是如何配置的？

**回答：** 使用 Jenkins 实现代码提交后自动构建、打包镜像并部署。配置 Docker Compose 一键部署服务，实现开发、测试、生产环境的自动化发布。

**追问：**

1. Jenkins Pipeline 的基本语法是什么？

**回答：** Jenkins Pipeline 使用 Groovy 语法，核心块：
   - **pipeline**：定义流水线
   - **agent**：指定执行节点
   - **stages**：包含多个 stage（阶段）
   - **stage**：定义阶段（如 build、test、deploy）
   - **steps**：阶段内执行的具体步骤

2. 如何配置多环境部署？

**回答：** 使用 Jenkins **参数化构建**，选择部署环境（dev/test/prod）。不同环境对应不同的配置文件和 Docker Compose 文件，通过环境变量注入配置。

3. 如何实现回滚机制？

**回答：**
   - **Docker 镜像版本管理**：每次构建生成带版本号/commit hash 的镜像
   - **Kubernetes/Docker Compose 回滚**：修改镜像版本重新部署
   - **数据库回滚**：准备回滚 SQL 脚本，或使用 Flyway/Liquibase 管理迁移

---

### 项目中的 Redis 是如何使用的？

**回答：** 使用 Redis 缓存流程定义、用户信息、待办任务等高频访问数据，降低数据库压力，提升系统响应速度。

**追问：**

1. 缓存的 key 是如何设计的？

**回答：** 使用分层命名：`项目名：模块名：业务名：唯一标识`。如 `flowmind:flow:definition:123`、`flowmind:user:todo:456`。使用 Redis Hash 存储对象类型数据。

2. 如何保证缓存与数据库的一致性？

**回答：**
   - **缓存过期策略**：设置合理的过期时间
   - **先更新 DB 后删除缓存**：读取时发现缓存失效再重建
   - **双删策略**：更新 DB 前后各删一次缓存
   - **消息队列异步同步**：通过 MQ 通知删除/更新缓存

3. Redis 有哪些数据结构？项目中使用了哪些？

**回答：**
   - **String**：缓存简单值、计数器
   - **Hash**：存储对象（如用户信息、流程定义）
   - **List**：消息队列、待办列表
   - **Set**：权限标签、去重集合
   - **ZSet**：排行榜、优先级队列

4. 如何处理缓存穿透、击穿、雪崩问题？

**回答：**
   - **缓存穿透**（查不存在的数据）：布隆过滤器、缓存空值
   - **缓存击穿**（热点 key 失效）：互斥锁重建缓存、逻辑过期（不设 TTL）
   - **缓存雪崩**（大量 key 同时失效）：过期时间加随机值、集群部署

---

### Flowable 中如何查询流程实例的执行历史？

**回答：** 通过 `HistoryService` 查询历史流程实例、历史任务和历史活动记录。Flowable 默认开启历史记录（`HistoryLevel.AUDIT`），所有流程执行数据都会被记录。

**追问：**

1. 历史级别（HistoryLevel）有哪些？各自记录什么内容？

**回答：**
   - **NONE**：不记录任何历史
   - **ACTIVITY**：仅记录活动实例
   - **AUDIT**：默认级别，记录流程实例、任务、变量
   - **FULL**：最详细，包含所有历史细节

2. 如何查询某个用户参与的所有流程？

**回答：** 使用 `historyService.createHistoricProcessInstanceQuery().involvedUser(userId).list()`。也可查询历史任务表 `ACT_HI_TASKINST` 关联流程实例 ID。

3. 如何实现流程追踪图？

**回答：** 使用 `FlowableUtils` 工具类：
   - `getAllElements()`：获取全部节点列表（包含子流程）
   - `iteratorFindDirtyRoads()`：从后向前寻路，获取脏线路上的点
   - `historicTaskInstanceClean()`：清洗回滚导致的脏数据
   - `dfsFindRejects()`：深搜获取未通过的节点
   - 结合 `ProcessDiagramGenerator` 生成高亮流程图

4. 历史数据量过大时如何优化？

**回答：**
   - **定期归档**：将历史数据迁移到归档表
   - **分区表**：按时间分区存储
   - **异步历史**：开启异步历史记录，降低主流程影响
   - **清理策略**：设置历史数据保留期限，定期清理

5. 如何处理回滚导致的脏数据？

**回答：** `FlowableUtils.historicTaskInstanceClean()` 方法：
   - 使用栈结构遍历历史任务实例（LIFO）
   - 根据 `deleteReason` 识别回跳/回退操作
   - `iteratorFindDirtyRoads()` 获取脏线路上的点
   - 会签节点特殊处理（`MI_END` 删除原因）
   - 最终返回清洗后的历史任务实例列表

---

### 项目中有遇到什么技术难点吗？如何解决的？

**回答要点：** 结合项目实际实现，列举 2-3 个具体技术难点及解决方案。

**示例 1：AI 工作流无限循环问题**

**问题：** LangGraph 多轮对话中，单次 `invoke()` 内出现节点无限循环，导致流程无法结束。

**解决：** 实现混合路由策略：
   - **FLOW 模式内状态机优先**：`session_mode == FLOW_DESIGN && flow_stage != NEW` 时，完全由状态机驱动，忽略 LLM 意图
   - **状态转移严格控制**：`NEW → CATEGORY_GENERATION → AWAITING_CONFIRM → CATEGORY_CONFIRMED → FLOW_DESIGN → FORM_DESIGN → BPMN_GENERATION → DONE`
   - **chat_node 不连回 intent_node**：避免 CHAT 模式下无限循环

**示例 2：Flowable 历史数据脏数据清洗**

**问题：** 流程回退/回跳时，历史任务表产生大量脏数据，影响流程追踪图生成。

**解决：** `FlowableUtils.historicTaskInstanceClean()` 方法：
   - 使用栈结构遍历历史任务实例（LIFO）
   - 根据 `deleteReason` 识别回跳/回退操作（`Change activity to`、`Change parent activity to`）
   - `iteratorFindDirtyRoads()` 从后向前寻路，获取脏线路上的点
   - 会签节点特殊处理（`MI_END` 删除原因）
   - 最终返回清洗后的历史任务实例列表

**示例 3：BPMN XML 审批人属性分离设计**

**问题：** AI 生成的 BPMN XML 包含审批人属性，但用户需要在前端编辑器中灵活指定审批人。

**解决：** `BpmnBuilder` 设计原则：
   - AI 只生成节点名称和流程结构
   - 审批人属性（`assignees`、`strategy`）保留在模型中，但不在 BPMN XML 中生成
   - 用户在前端编辑器中设置审批人，提交时再写入 BPMN
