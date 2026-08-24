---
icon: /assets/icon/关于我.png
cover: /assets/images/cover3.jpg
title: 关于我
date: 2026-08-24
sidebar: false
---

# 👋 关于我

## 🌟 个人优势

- **Java 后端开发基础扎实**：兼具广发证券企业实习与项目实战经验，可独立完成后端开发、接口联调，熟悉编码、测试到部署全流程。
- **流程类业务实战**：个人项目中基于 **Flowable 工作流引擎** 实现审批流程设计、任务流转与流程状态管理。
- **微服务开发基础**：参与 **Spring Cloud Alibaba** 微服务项目开发，熟悉 **Nacos** 服务注册发现、**OpenFeign** 远程调用。
- **AI 集成能力**：熟悉 **Spring AI**、**Dify**、**LangGraph**，具备 RAG、Tool Calling、结构化输出等大模型应用开发实践，能够通过 AI 服务与 Java 业务系统进行集成。
- **前后端协作能力**：掌握 **Vue3 + TypeScript**，具备 **React + Ant Design** 企业项目开发经验，可独立完成前后端联调。
- **部署与环境搭建**：熟悉 **Docker Compose** 容器化部署，能够搭建 **MySQL**、**Redis**、**RabbitMQ** 等服务环境并完成系统部署。
- **AI 编程工具**：深度使用 **Claude Code**、**Codex** 辅助复杂功能开发与代码重构，使用 Skills 封装开发规范与任务流程，提升开发效率。

---

## 🎓 教育经历

- **韩山师范学院** · 计算机科学与技术 · 全日制本科（2027 届）   2025.09 － 2027.06

---

## 💼 实习经历

### 广州图灵科技有限公司 — Java 开发实习生  2026.06 － 2026.08

驻广发证券项目组，参与 VM 变动保证金管理系统开发，负责履保方案模块前后端开发及接口联调。

- **业务开发**：负责履保方案、保证金监控及历史模块开发，完成列表、新增、编辑、详情及交易对手、部门权限等业务逻辑。
- **接口联调**：按 API 契约完成前后端适配，使用 **Apifox Mock** 模拟上游接口，联调本地服务，处理接口和数据问题。
- **测试与协作**：编写履保方案功能测试用例，分析修复 **SonarQube** 问题，参与 Git、PR、Code Review，跟进并处理测试缺陷。
- **链路验证**：搭建 Mock、履保计算服务及数据库环境，通过接口请求、数据库校验及实际批次执行验证监管保证金重算链路。

---

## 🚀 项目经历

### 1. FlowMind（智能审批工作流）— 后端开发（毕业设计）

**项目描述：**

基于 **RuoYi-Cloud** 二次开发的智能审批系统，采用 **Spring Cloud Alibaba** 微服务架构，集成 **Flowable** 实现流程建模、任务流转及审批记录管理；结合 AI 服务实现自然语言生成审批流程与表单配置。

**技术栈：**

`Spring Cloud Alibaba` · `Flowable` · `MyBatis` · `Redis` · `MySQL` · `LangGraph` · `FastAPI` · `Vue3` · `Element Plus`

**项目职责：**

- **工作流集成**：接入 Flowable，实现审批流程的设计、发布和执行；完成任务流转、流程记录查询等基础能力。
- **AI 流程设计开发**：基于 FastAPI + LangGraph 构建 AI 服务，通过节点编排解析自然语言需求，生成流程节点及表单配置；设计结构化输出与参数校验，限制生成结果符合业务规则；通过 Nacos + OpenFeign 接入业务系统。
- **草稿箱功能**：设计草稿数据结构，完成草稿保存、编辑、恢复等接口，实现审批申请与草稿数据的状态管理。
- **前端与部署**：使用 Vue3 + Element Plus 开发申请表单、审批中心等页面，使用 **Docker Compose** 完成项目服务部署。

🔗 [项目介绍文档](/series/myprojects/FlowMind/README.md) | [GitHub](https://github.com/Moonlight168/flowmind) | [Gitee](https://gitee.com/wish168/flowmind)

### 2. 绝缘油质量智能管家（OISG）— 后端 / Agent 开发（校企合作项目）

**项目描述：**

面向南方电网电力变压器运维场景，开发绝缘油试验数据分析平台，实现试验数据管理、智能审核、异常告警、自动报告及 AI 辅助分析等功能，提升运维数据处理效率。

**技术栈：**

`Spring Boot 3` · `Spring AI` · `Spring Security` · `JWT` · `MyBatis-Plus` · `DM8` · `Dify` · `Apache POI` · `MinIO`

**项目职责：**

- **后端开发**：参与数据模型及数据库设计，开发试验数据管理、异常告警等业务模块，完成接口设计及前后端联调。
- **AI Agent**：基于 **Dify** 编排知识库检索流程，结合 **Spring AI** 封装试验数据查询、故障分析等业务工具并接入 Agent，实现自然语言查询试验数据及辅助故障分析。
- **数据审核模块**：开发离线数据审核规则模块，支持误差阈值及校验规则配置，根据规则自动识别异常数据并记录审核结果。
- **报告生成**：基于 **Apache POI** 解析预设 Word 模板，将试验数据及分析结果填充至对应字段并生成报告；结合 MinIO 完成文件上传、存储及下载。

### 3. 广发证券 VM 变动保证金管理系统 — 前后端开发（企业项目）

**项目描述：**

广发证券 TITANS 投资交易系统配套的 VM 变动保证金管理子系统，支持履保方案管理、保证金监控及历史记录查询等业务。

**技术栈：**

`Spring Boot 3` · `Java 17` · `MyBatis` · `GoldenDB` · `React 17` · `Umi 4` · `Ant Design 3` · `Redisson` · `PageHelper`

**项目职责：**

- **后端开发**：根据需求调整 DO、Mapper、VO、DTO 及 SQL，新增协议编号等字段，修正 DB 到接口的数据映射及业务校验。
- **前端开发**：使用 **React + Umi + Ant Design** 开发履保方案列表、详情及编辑页面，实现表单交互、下拉联动及资金户选择。
- **业务逻辑**：实现交易对手、资金户、协议要素等业务校验与数据联动，处理交易对手池、金额精度、利率及协议时限等规则。
- **数据导出**：完成合约明细、资金户每日余额等数据导出，处理筛选、日期范围及无数据场景；参与追保/返还 Word 附件生成。

---

## 🛠️ 专业技能

### Java 后端

- 掌握 Java 集合、多线程、JVM 等基础
- 熟悉 **Spring Boot**、**Spring Cloud Alibaba**（Nacos、OpenFeign）、**Spring Security**
- 具备微服务业务开发及接口设计经验

### 数据与中间件

- 熟悉 **MyBatis**、**MyBatis-Plus**
- 掌握 **MySQL**、**Redis**，了解 **RabbitMQ**
- 具备数据库设计及事务处理经验

### AI 应用开发

- 熟悉 **Spring AI**、**Dify**、**LangGraph**、**FastAPI**
- 具备 **RAG**、**Tool Calling**、结构化输出等大模型应用开发实践
- 能够通过 AI 服务与 Java 业务系统进行集成

### 前端技术

- 掌握 **Vue3**、**TypeScript**、Element Plus、TailwindCSS
- 具备前后端协作开发经验

### AI 编程

- 熟悉 **Claude**、**Codex** 等 AI 编程工具
- 使用 Skills 封装开发规范与任务流程，辅助需求拆解、代码开发、调试及测试

### 工程工具

- 使用 **Docker Compose** 进行项目环境部署
- 熟悉 Git、Maven、Apifox 等开发工具

---

## 🏆 我的证书

- **软件设计师**（软考中级）
- **CET-4**（大学英语四级）
