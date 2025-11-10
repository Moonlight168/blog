---
order: 1
title: 项目介绍
icon: /assets/icon/介绍.png
dir:
    text: FlowMind
    icon: /assets/icon/cloud_flow.png
    order: 2
---

# FlowMind

**A Cloud-Native Intelligent Workflow Orchestration Platform Based on LLM and Microservices**
*(基于云原生与大模型的智能审批工作流编排平台)*

---

## 🧠项目简介

**FlowMind** 是一个融合 **Spring Cloud Alibaba 微服务架构**、**Flowable** 工作流引擎与 **LLM 智能 Agent** 的智能审批编排平台。
系统面向跨部门预算与资源审批场景，实现从“申请 → 智能初审 → 自动流转 → 通知反馈”的全链路自动化。

### 核心目标

* 智能化审批：LLM Agent 自动分析文本并初步判断（利用大语言模型分析审批文本内容，自动提取关键信息并给出审批建议）
* 分布式一致性：采用 **Saga 模式 + RocketMQ 事务消息**（通过分布式事务协调保证微服务间数据一致性，支持服务失败的补偿机制）
* 云原生高可用：基于 **Kubernetes + Helm + Jenkins CI/CD**（容器化部署管理，自动化配置更新与持续集成/交付，确保系统弹性伸缩）
* 全链路可观测：集成 **SkyWalking + Prometheus + Grafana**（提供分布式追踪、性能监控和可视化仪表盘，实时掌握系统运行状态）

---

## 💻系统架构概览

@startuml

actor "User" as U

rectangle "FlowMind UI\n(Vue3 / TDesign)" as UI
rectangle "flowmind-gateway\n(API网关)" as GW
rectangle "flowmind-auth\n(认证授权服务)" as AUTH
rectangle "flowmind-workflow\n(工作流引擎服务)" as WORKFLOW
rectangle "flowmind-application\n(表单与业务模板服务)" as APPLICATION
rectangle "flowmind-notification\n(消息通知服务)" as NOTIFY
rectangle "flowmind-content\n(文件与资源管理)" as CONTENT
rectangle "flowmind-monitor\n(监控审计服务)" as MONITOR
rectangle "Flowable\n(工作流引擎)" as FLOWABLE
rectangle "Intelligent Agent\n(FastAPI + LangChain + OpenAI)" as AGENT
rectangle "Infrastructure Layer\nNacos / Sentinel / RocketMQ / Redis / PostgreSQL" as INFRA
rectangle "Kubernetes Cluster\nHelm + Jenkins CI/CD" as K8S

U --> UI
UI --> GW
GW --> AUTH
GW --> WORKFLOW
GW --> APPLICATION
GW --> NOTIFY
GW --> CONTENT
GW --> MONITOR

WORKFLOW --> FLOWABLE
WORKFLOW --> INFRA
FLOWABLE --> AGENT
APPLICATION --> INFRA
NOTIFY --> INFRA
CONTENT --> INFRA
MONITOR --> INFRA
GW --> INFRA

K8S -[hidden]-> GW
K8S -[hidden]-> INFRA
@enduml

> 注：上图展示的是核心组件架构，除上述组件外，FlowMind后端平台还包含以下重要模块：
> - **flowmind-api**: 公共API模块，包含DTO和Feign接口定义
> - **flowmind-common**: 通用模块，细分为核心工具类、数据传输对象和Feign客户端定义
>   - **flowmind-common-core**: 工具类、异常处理和结果封装
>   - **flowmind-common-dto**: DTO、VO对象和常量定义
>   - **flowmind-common-feign**: 各服务的Feign Client客户端定义


---

## 🔧技术栈

| 模块       | 技术选型                                      | 功能说明              |
| -------- | ----------------------------------------- | ----------------- |
| 工作流引擎    | Flowable                                  | 轻量级开源 BPMN 工作流引擎   |
| 微服务框架    | Spring Cloud Alibaba                      | 注册发现、配置中心、熔断限流    |
| 智能 Agent | Python + FastAPI + LangChain + OpenAI API | 智能审批、语义分析         |
| 消息通信     | RocketMQ / gRPC                           | 异步可靠通信            |
| 注册配置     | Nacos                                     | 服务注册与配置动态刷新       |
| 熔断限流     | Sentinel                                  | 流量控制与服务保护         |
| 数据存储     | PostgreSQL / Redis                        | 数据与缓存支撑           |
| 可观测性     | SkyWalking / Prometheus / Grafana         | 链路追踪与监控           |
| CI/CD    | Jenkins + Docker + Helm                   | 自动化构建与部署          |

---

## 🚀系统特性

* LLM 智能审批与自动分派
* BPMN 工作流可视化编排
* Saga 分布式事务补偿机制
* Kubernetes 高可用部署
* Jenkins 自动化构建与滚动升级
* SkyWalking 全链路追踪

---

## ⚡快速启动

### 1. 环境要求

| 组件                    | 最低版本   |
| --------------------- | ------ |
| Java                  | 21     |
| Maven                 | 3.9+   |
| Python                | 3.10+  |
| Node.js               | 18+    |
| Docker / Compose      | 最新版    |
| Kubernetes / Minikube | 1.28+  |
| Jenkins               | 2.440+ |

### 2. 启动依赖环境

```bash
docker-compose -f docker/infrastructure-compose.yml up -d
```

### 3. 启动智能 Agent

```bash
cd agent
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. 启动微服务集群

```bash
cd flowmind-cloud/flowmind-gateway
mvn spring-boot:run
```

或使用 Jenkins Pipeline 自动构建与部署。

---

## 🌐访问地址

| 模块                | 地址                                             |
| ----------------- | ---------------------------------------------- |
| Operate UI        | [http://localhost:8081](http://localhost:8081) |
| API Gateway       | [http://localhost:8080](http://localhost:8080) |
| LLM Agent         | [http://localhost:8001](http://localhost:8001) |
| Jenkins Dashboard | [http://localhost:8089](http://localhost:8089) |

---

## 📁目录结构

```
flowmind/
├── agent/                              # 智能 Agent 层 (LLM + FastAPI)
│   ├── main.py                         # FastAPI 启动入口
│   ├── core/                           # 业务核心逻辑 (任务规划、意图解析)
│   ├── llm/                            # LLM 调用封装 (OpenAI / Ollama / HuggingFace)
│   ├── tools/                          # 智能体可调用的工具 (SQL、文件、流程)
│   ├── memory/                         # 知识记忆管理 (向量数据库)
│   ├── configs/                        # 模型与服务配置文件
│   └── requirements.txt
│
├── frontend/                           # 前端层 (Vue3 + TypeScript + ElementPlus)
│   ├── flowmind-web/                   # Web 管理端 (审批、监控、建模)
│   │   ├── src/
│   │   │   ├── api/                    # Axios 请求封装
│   │   │   ├── assets/                 # 图片、图标、样式
│   │   │   ├── components/             # 通用组件库
│   │   │   ├── layouts/                # 页面布局
│   │   │   ├── pages/                  # 页面模块 (审批流、模型管理、用户管理)
│   │   │   ├── router/                 # Vue Router 配置
│   │   │   ├── store/                  # Pinia 状态管理
│   │   │   ├── utils/                  # 工具函数
│   │   │   ├── views/                  # 视图页面
│   │   │   └── main.ts                 # 前端入口文件
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── flowmind-modeler/               # BPMN 模型设计器前端 (bpmn.js + vue-bpmn)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── flowmind-mobile/                # 移动端 (Vue3 + TDesign Mobile)
│       ├── src/
│       └── package.json
│
├── flowmind-cloud/                     # FlowMind后端微服务平台 (Spring Cloud Alibaba)
│   ├── flowmind-api/                   # 公共API模块（DTO、Feign接口）
│   ├── flowmind-common/                # 通用模块
│       ├── flowmind-common-core/       # 工具类、异常、结果封装
│       ├── flowmind-common-log/        # 日志模块
│       └── flowmind-common-feign/      # 各服务的 Feign Client 客户端定义
│
│   ├── flowmind-auth/                  # 认证授权服务
│   ├── flowmind-gateway/               # API网关
│   ├── flowmind-workflow/              # 工作流引擎（Flowable集成）
│   ├── flowmind-application/           # 表单与业务模板服务
│   ├── flowmind-content/               # 文件与资源管理
│   ├── flowmind-notification/          # 消息通知（邮件/WebSocket）
│   ├── flowmind-monitor/               # 监控审计（操作日志/性能）
│   └── pom.xml                         # 聚合配置
│
├── bpmn/                               # BPMN 流程定义文件（XML）
│   ├── templates/
│   ├── examples/
│   └── README.md
│
├── infra/                              # 基础设施层
│   ├── docker/                         # Dockerfile 与 Compose 文件
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile.agent
│   │   ├── Dockerfile.gateway
│   │   └── Dockerfile.frontend
│   │
│   ├── k8s/                            # Kubernetes 部署清单 / Helm Chart
│   │   ├── charts/
│   │   ├── deployment/
│   │   └── service/
│   │
│   └── jenkins/                        # CI/CD Pipeline 脚本
│       ├── Jenkinsfile
│       ├── pipeline-template.groovy
│       └── env/
│
├── scripts/                            # 辅助脚本（初始化、迁移、测试）
│   ├── init-db.sql
│   ├── migrate.sh
│   ├── start-dev.sh
│   └── clean.sh
│
├── docs/                               # 项目文档
│   ├── architecture/                   # 架构与设计文档
│   ├── api/                            # 接口文档（OpenAPI / Swagger 导出）
│   ├── dev-guide/                      # 开发规范与流程
│   ├── deployment/                     # 部署与运维说明
│   └── FlowMind 项目开发模式与流程规范文档.md
│
├── .gitlab-ci.yml                      # CI/CD 配置
├── pom.xml                             # 项目聚合配置
└── README.md                           # 项目说明文件

```

---

## 🛡️高可用验证场景

| 测试场景       | 验证目标           | 预期结果   |
| ---------- | -------------- | ------ |
| 单节点宕机      | K8s 自动重建 Pod   | 服务不中断  |
| Flowable 服务故障 | 服务自动恢复与重试 | 流程不中断  |
| 微服务异常      | Saga 补偿执行      | 状态回滚成功 |
| 瞬时高流量      | Sentinel 限流熔断  | 系统稳定运行 |
| 工作流服务故障  | 服务降级与重试机制 | 审批任务不丢失 |
| 应用服务异常    | 多实例负载均衡     | 业务处理持续 |

