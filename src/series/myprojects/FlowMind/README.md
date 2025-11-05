---
order: 1
title: 项目介绍
icon: /assets/icon/介绍.png
dir:
    text: FlowMind
    icon: /assets/icon/cloud_flow.png
    order: 1
---

# FlowMind

**A Cloud-Native Intelligent Workflow Orchestration Platform Based on LLM and Microservices**
*(基于云原生与大模型的智能审批工作流编排平台)*

---

## 🧠项目简介

**FlowMind** 是一个融合 **Spring Cloud Alibaba 微服务架构**、**Camunda 8 (Zeebe)** 工作流引擎与 **LLM 智能 Agent** 的智能审批编排平台。
系统面向跨部门预算与资源审批场景，实现从“申请 → 智能初审 → 自动流转 → 通知反馈”的全链路自动化。

### 核心目标

* 智能化审批：LLM Agent 自动分析文本并初步判断
* 分布式一致性：采用 **Saga 模式 + RocketMQ 事务消息**
* 云原生高可用：基于 **Kubernetes + Helm + Jenkins CI/CD**
* 全链路可观测：集成 **SkyWalking + Prometheus + Grafana**

---

## 💻系统架构概览

@startuml

actor "User" as U

rectangle "FlowMind UI\n(Vue3 / TDesign)" as UI
rectangle "API Gateway\n(Spring Cloud Gateway)" as GW
rectangle "Auth Service\n(Spring Boot + JWT)" as AUTH
rectangle "Approval Service\n(Spring Boot + MyBatis-Plus)" as APPROVAL
rectangle "Resource Service\n(Spring Boot)" as RESOURCE
rectangle "Notification Service\n(Spring Boot + Mail)" as NOTIFY
rectangle "Zeebe Workflow Engine\n(Camunda 8 Cluster)" as ZEEBE
rectangle "Intelligent Agent\n(FastAPI + LangChain + OpenAI)" as AGENT
rectangle "Infrastructure Layer\nNacos / Sentinel / RocketMQ / Redis / PostgreSQL" as INFRA
rectangle "Kubernetes Cluster\nHelm + Jenkins CI/CD" as K8S

U --> UI
UI --> GW
GW --> AUTH
GW --> APPROVAL
GW --> RESOURCE
GW --> NOTIFY

APPROVAL --> ZEEBE
ZEEBE --> AGENT
APPROVAL --> INFRA
RESOURCE --> INFRA
NOTIFY --> INFRA
GW --> INFRA

K8S -[hidden]-> GW
K8S -[hidden]-> INFRA
@enduml


---

## 🔧技术栈

| 模块       | 技术选型                                      | 功能说明              |
| -------- | ----------------------------------------- | ----------------- |
| 工作流引擎    | Camunda 8 (Zeebe)                         | 云原生分布式 BPMN 工作流引擎 |
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
cd services/approval
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
├── agent/                      # Python LLM Agent (FastAPI)
│   ├── main.py
│   └── core/
├── bpmn/                       # BPMN 模型文件
├── services/                   # Java 微服务模块（Spring Cloud Alibaba）
│   ├── approval-service/
│   ├── resource-service/
│   ├── notification-service/
│   ├── gateway-service/
│   └── auth-service/
├── common/                     # 通用模块（DTO、Feign、Utils）
├── docker/                     # Docker Compose 配置
├── k8s/                        # Helm Charts / YAML
├── jenkins/                    # Jenkinsfile 与 Pipeline 模板
├── docs/                       # 技术文档
└── README.md
```

---

## 🛡️高可用验证场景

| 测试场景       | 验证目标           | 预期结果   |
| ---------- | -------------- | ------ |
| 单节点宕机      | K8s 自动重建 Pod   | 服务不中断  |
| Zeebe 节点故障 | Partition 自动迁移 | 流程不中断  |
| 微服务异常      | Saga 补偿执行      | 状态回滚成功 |
| 瞬时高流量      | Sentinel 限流熔断  | 系统稳定运行 |

---

## 📈后续规划

* 集成 OpenTelemetry 统一监控
* 增强 LLM Prompt 模型智能性
* 引入前端流程可视化看板
* 优化 Jenkins 蓝绿部署方案

---

## 📜License

Apache License 2.0 © 2025 FlowMind Team
