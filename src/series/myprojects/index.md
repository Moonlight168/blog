---
series: myprojects
title: 我的项目总览
icon: /assets/icon/myprojects.png
order: 1
---

这里展示我在学习与实战中独立完成的重点项目，涵盖前后端开发与系统集成。每个项目均附源码地址与详细说明。

## 📋 项目规范文档

### 数据库设计规范
- [数据库设计规范](./数据库设计规范.md) - 统一的数据库设计标准，适用于所有项目

---

---

### 🧠 FlowMind · 智能流程管理平台
> 一站式智能流程管理平台，集需求分析、开发规范、UI原型设计于一体，助力团队高效协作。

**🔧 技术栈：**
`SpringBoot` · `MyBatis-Plus` · `SpringSecurity` ｜ `Vue3` · `TDesign` · `TailwindCSS` ｜ `MySQL` · `Redis` · `ElasticSearch` · `RabbitMQ`

**📌 主要职责：**
- 实现流程管理、需求分析、UI 原型模块前端页面
- 基于 `Spring Security + JWT` 完成登录与权限控制
- 使用 `Redis` 提升数据读取性能
- 通过 `RabbitMQ` 实现异步任务处理
- 集成 `ElasticSearch` 实现智能问答与推荐

🔗 [查看项目详情](./FlowMind/README.md)

---

### 🎫 淘票票 · 高并发票务系统
> 分布式高并发在线购票系统，支持灰度发布、缓存优化与搜索推荐。

**🔧 技术栈：**
`SpringBoot` · `MyBatis-Plus` · `Vue3` · `Redis` · `ElasticSearch` · `RabbitMQ`

**📌 主要职责：**
- 实现购票与订单管理前端页面
- 设计分布式架构（分布式锁 / 消息队列 / ID 生成）
- 优化性能：Redis 缓存 + 布隆过滤器
- 实现灰度发布、安全防护与验证码机制
- 集成搜索推荐系统

🔗 [查看项目详情](./淘票票/README.md)

---

### 🎓 邮院通 · 校园一站式服务平台 + AI 助手
> 集课程、成绩、新闻、宿舍管理于一体的校内服务平台，内置智能问答助手。

**🔧 技术栈：**
`SpringBoot` · `Vue3` · `MyBatis-Plus` · `Redis` · `ElasticSearch` · `RabbitMQ`

**📌 主要职责：**
- 前端开发课程查询、新闻展示等核心页面
- 基于 `JWT` 实现认证与权限控制
- 使用 `Redis` 提升高频访问数据响应速度
- 利用 `RabbitMQ` 优化抢课并发性能
- 集成 `Qwen` 大模型 + `ElasticSearch` 实现 FAQ 智能问答

🔗 [查看项目详情](./邮院通/README.md)

---

📌 更多项目与细节请访问我的 [GitHub主页](https://github.com/Moonlight168)，或通过博客左侧分类导航查看。
