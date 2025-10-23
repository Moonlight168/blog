---
order: 1
title: 项目介绍
dir:
    text: FlowMind
    icon: /assets/icon/cloud_flow.png
    order: 1
---

# 🌐 FlowMind

**A Cloud-Native Intelligent Workflow Orchestration Platform Based on LLM and Microservices**
*(基于云原生与大模型的智能审批工作流编排平台)*

---

## 🚀 项目简介

**FlowMind** 是一个结合 **Camunda 8 (Zeebe)**、**LLM 智能 Agent** 与 **云原生微服务架构** 的智能审批工作流平台。
系统面向跨部门资源与预算申请场景，实现从“申请→审批→分配→通知”的全流程自动化与智能化。

核心目标：

* 🔹 提升审批效率与准确性（通过 LLM 智能初审与自动路由）
* 🔹 保证分布式一致性（基于 **Saga 模式** 的补偿事务）
* 🔹 实现高可用架构（Kubernetes 集群 + Zeebe 集群）

---

## 🧠 系统架构

```
┌──────────────────────────┐
│        FlowMind UI       │
│ (Vue / React 前端界面)    │
└──────────┬───────────────┘
           │ REST API
┌──────────▼───────────────┐
│    Intelligent Agent      │
│ (FastAPI + LangChain + LLM)│
└──────────┬───────────────┘
           │ gRPC / REST
┌──────────▼───────────────┐
│   Zeebe Workflow Engine   │
│ (Camunda 8 Cluster)       │
└──────────┬───────────────┘
           │ Jobs Dispatch
┌──────────▼───────────────┐
│  Microservices (Workers) │
│  - Approval Service      │
│  - Resource Service      │
│  - Notification Service  │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│   K8s Cluster & Helm     │
│   - HA Deployment        │
│   - Monitoring / Logging │
└──────────────────────────┘
```

---

## ⚙️ 技术栈

| 模块        | 技术                               | 说明                 |
| --------- | -------------------------------- | ------------------ |
| 工作流引擎     | **Camunda 8 (Zeebe)**            | 云原生、分布式 BPMN 工作流引擎 |
| 智能决策层     | **LangChain + OpenAI API (LLM)** | 智能初审、自动路由、文本分析     |
| Agent 微服务 | **Python + FastAPI**             | 统一封装 LLM 推理接口      |
| 应用微服务     | **Spring Boot / Go Micro**       | 审批逻辑与资源调度服务        |
| 部署架构      | **Kubernetes + Helm**            | 高可用部署、自动扩缩容        |
| 存储与消息     | PostgreSQL / Redis               | 数据存储与缓存队列          |

---

## 🧩 功能特性

* 🧠 **LLM 智能审批**：对申请内容进行摘要、分类、风险提示与自动分派。
* ⚙️ **BPMN 工作流可视化**：基于 Camunda Modeler 设计跨部门流程。
* 🔁 **Saga 分布式事务补偿**：保障多微服务操作的一致性。
* ☁️ **高可用微服务架构**：基于 Kubernetes 实现无单点容错。
* 📊 **可观测性支持**：Prometheus + Grafana + Zeebe Operate。

---

## 📦 快速启动

### 1️⃣ 环境要求

* Docker & Docker Compose
* Node.js 18+
* Python 3.10+
* Kubernetes (本地可用 Minikube/K3s)

### 2️⃣ 克隆仓库

```bash
git clone https://github.com/yourname/flowmind.git
cd flowmind
```

### 3️⃣ 启动 Zeebe & Operate

```bash
docker-compose -f docker/zeebe-compose.yml up -d
```

### 4️⃣ 启动智能 Agent

```bash
cd services/agent
pip install -r requirements.txt
uvicorn main:app --reload
```

### 5️⃣ 启动工作流微服务

```bash
cd services/approval
mvn spring-boot:run
```

### 6️⃣ 访问系统

```
Operate UI: http://localhost:8081
API Gateway: http://localhost:8000
```

---

## 🧮 系统示例流程（预算申请）

1️⃣ 用户提交预算申请表（含长文本描述）
2️⃣ LLM Agent 自动分析并提取关键字段（部门、金额、风险）
3️⃣ Camunda BPMN 模型根据智能决策进行审批路由
4️⃣ 审批通过后触发资源分配微服务
5️⃣ 任务完成后发送通知邮件或消息

---

## 📊 高可用验证场景

| 测试项          | 验证目标               | 结果预期   |
| ------------ | ------------------ | ------ |
| 微服务节点故障      | K8s 自动拉起新 Pod      | 流程不中断  |
| Zeebe 节点故障   | 集群自动重新分配 Partition | 无状态丢失  |
| 流程异常（资源服务失败） | Saga 补偿逻辑生效        | 状态回滚成功 |

---

## 📄 目录结构

```
flowmind/
├── agent/                # LLM Agent (FastAPI)
├── bpmn/                 # BPMN 模型文件
├── services/
│   ├── approval/         # 审批微服务
│   ├── resource/         # 资源管理服务
│   └── notification/     # 通知服务
├── k8s/                  # K8s YAML / Helm Charts
├── docker/               # Docker Compose 配置
├── docs/                 # 技术文档与论文材料
└── README.md             # 当前文件
```

---

## 📚 参考文献

* Camunda 8 Documentation
* LangChain Docs
* Kubernetes: Up & Running, O’Reilly
* Tree of Thoughts (2023), Yao et al.

---

## 👨‍💻 作者信息

| 信息      | 内容          |
| ------- | ----------- |
| 学生      | [填写姓名]      |
| 指导教师    | [填写导师姓名]    |
| 学校 / 专业 | [填写学院与专业]   |
| 时间      | 2025 年 10 月 |

