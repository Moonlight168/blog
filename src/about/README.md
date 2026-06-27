---
icon: /assets/icon/关于我.png
cover: /assets/images/cover3.jpg
title: 关于我
date: 2025-05-17
sidebar: false
---

# 👋 关于我

## 🌟 个人优势

- **Java 后端开发基础扎实**：兼具企业实习与项目实战经验，可独立完成后端开发、接口联调，熟悉编码、测试到部署全流程。
- **流程类业务实战**：个人项目中基于 **Flowable 工作流引擎** 实现审批流程设计、任务流转与流程状态管理。
- **微服务开发基础**：参与 **Spring Cloud Alibaba** 微服务项目开发，熟悉 **Nacos** 服务注册发现、**OpenFeign** 远程调用。
- **AI 集成能力**：有投资智能体开发实习经验，熟练使用 **HermesAgent**、**Dify**、**LangGraph** 搭建 AI 服务落地业务场景。
- **部署与环境搭建**：熟悉 **Docker** 容器化部署，能够搭建 **MySQL**、**Redis**、**RabbitMQ** 等服务环境并完成系统部署。
- **AI 编程工具**：深度使用 **Claude Code**、**Codex** 辅助复杂功能开发与代码重构，提升开发效率。

---

## 💼 实习经历

### 广州图灵科技有限公司 — Java 开发实习生（Agent 方向）  2026.05 － 至今

- 基于 **HermesAgent** 框架搭建投资领域智能体，完成多 Agent 协作流程编排、节点逻辑配置与任务路由调试，落地投研数据查询、基本面分析等业务场景。
- 使用 **Spring Boot + Spring AI** 封装业务工具函数与数据查询接口，对接内部行情、财报数据源，完成 Agent 工具调用的参数校验、结果结构化解析与异常兜底。
- 配合搭建投资领域知识库，参与文档整理、**Prompt 调优**与效果验证，优化智能体问答准确率与工具调用成功率。
- 使用 **Git**、**Postman**、**Docker** 完成版本管理、接口测试与服务部署验证，配合前后端联调与功能迭代，保障交付质量。

---

## 🚀 项目经历

### 1. FlowMind（智能审批工作流） — 后端开发

**项目描述：**

基于 **RuoYi-Cloud** 二次开发的智能审批系统，采用 **Spring Cloud Alibaba** 微服务架构，集成 **Flowable** 工作流引擎实现审批流程设计、任务流转与流程追踪。系统结合 AI 服务实现审批流程智能设计与审批辅助，提高审批效率。

**技术栈：**

`Spring Cloud Alibaba` · `Flowable` · `MyBatis` · `Redis` · `MySQL` · `LangGraph` · `FastAPI` · `Vue3` · `Element Plus`

**项目职责：**

- **工作流集成**：接入 Flowable，实现审批流程的设计、发布和执行；完成任务流转、流程记录查询等基础能力
- **AI 流程设计开发**：基于 FastAPI + LangGraph 构建 AI 服务，实现用户通过自然语言生成审批流程与表单配置；将 AI 服务注册至 Nacos，通过 OpenFeign 完成微服务调用，设计前后端与 AI 服务的数据交互流程
- **草稿箱功能**：设计草稿数据结构，实现申请表单的保存、编辑与恢复功能，提升用户填写体验
- **前端功能开发**：使用 Vue3 + Element Plus 开发申请表单页面与审批中心界面，实现审批任务列表、流程详情查看等交互功能
- **系统部署与 CI/CD**：Docker Compose 一键部署服务，配置 Jenkins 流水线，实现代码提交后自动构建、镜像打包与服务部署

🔗 [项目详情](/series/myprojects/FlowMind/README.md) | [GitHub](https://github.com/Moonlight168/flowmind) | [Gitee](https://gitee.com/wish168/flowmind)

---

### 2. 绝缘油质量智能管家（OISG） — 后端开发

**项目描述：**

面向电力行业变压器运维场景，参与绝缘油试验数据分析平台的开发工作，涵盖数据审核、阈值告警、自动报告与 AI 智能问答等模块。

**技术栈：**

`Spring Boot 3` · `Spring AI` · `Spring Security` · `MyBatis-Plus` · `Dify` · `Apache POI` · `MinIO`

**项目职责：**

- **AI 问答模块**：基于 Dify 编排问答工作流，搭建行业知识库；依托 Spring AI 封装业务工具并暴露给大模型调用，实现自然语言数据查询与报告智能生成。
- **离线数据审核模块**：负责数据审核规则的后台管理开发，完成误差阈值、分级审核规则的配置；维护在线与离线数据比对校验规则，配合业务流程完成异常数据的持久化。
- **自动报告模块**：使用 Apache POI 实现 Word 模板占位符填充，支持报告模板统一管理；完成报告文件的上传、存储、下载与溯源管理。

**项目成果：**

实现试验数据审核、报告生成的自动化处理，减少人工重复操作，适配电力行业数据管理规范。

🔗 [项目详情](/series/myprojects/OISG/README.md)

---

## 🛠️ 专业技能

### 后端开发

- **Java**：集合、多线程、异常处理
- **Spring Boot**、**MyBatis**
- **JVM**：内存结构、GC、类加载

### 微服务与中间件

- **Spring Cloud Alibaba**：Nacos、OpenFeign（RPC 调用）、Sentinel

### 数据库与缓存

- **MySQL**：常用 SQL、索引、查询优化基础
- **Redis**：缓存、高频数据处理
- **Elasticsearch**：全文检索

### 消息队列

- **RabbitMQ**：异步处理、解耦系统、延迟任务

### 前端与协作

- **Vue3 + TypeScript**：基础开发、接口联调
- **Element Plus**、**TailwindCSS**

### 部署与工程能力

- **Docker**：环境搭建、服务容器化
- **Git**、**Maven**、**Postman**
- **Jenkins**：CI/CD 自动化构建

### AI 应用集成

- 熟悉 **LangGraph**、**Spring AI**、**Dify**、**Ollama** 的基础应用
- 可实现 RAG 知识库搭建、AI 服务接口封装与业务系统集成

---

## 🏆 我的证书

- **软件设计师**（软考中级）
- **CET-4**（大学英语四级）