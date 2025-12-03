---
series: myprojects
title: 我的项目总览
icon: /assets/icon/myprojects.png
order: 1
---

这里展示我在学习与实战中独立完成的重点项目，涵盖前后端开发与系统集成。每个项目均附源码地址与详细说明。

---

### 🧠 FlowMind · 智能流程管理平台
> 基于RuoYi-Cloud的企业级工作流管理系统，新增审批中心和草稿箱功能，为企业提供更完善的流程管理解决方案。

**🔧 技术栈：**
`Spring Boot 3` · `Spring Cloud Alibaba` · `Flowable` ｜ `Vue3` · `Element Plus` · `Vite` ｜ `MySQL` · `Redis` · `Nacos` · `Sentinel` · `Seata`

**📌 主要职责：**
- 基于RuoYi-Cloud框架进行扩展开发，采用前后端分离架构
- 集成Flowable工作流引擎，实现流程定义、部署与执行
- 开发审批中心功能，支持待办任务、已办任务、待签任务、我的流程等全方位流程管理
- 设计草稿箱模块，支持流程草稿的保存、编辑和管理
- 实现基于微服务架构的企业级应用，包含网关、认证、系统、工作流等模块
- 使用Nacos作为注册中心和配置中心，Redis作为权限认证存储

🔗 [查看项目详情](./FlowMind/README.md) | [GitHub](https://github.com/Moonlight168/flowmind) | [Gitee](https://gitee.com/wish168/flowmind)

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

🔗 [查看项目详情](./淘票票/README.md) | [GitHub](https://github.com/Moonlight168/taopiaopiao) | [Gitee](https://gitee.com/wish168/taopiaopiao)

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

🔗 [查看项目详情](./邮院通/README.md) | [GitHub](https://github.com/Moonlight168/gupt-management) | [Gitee](https://gitee.com/wish168/gupt-management)

----
### 📋 数据库设计规范
- [数据库设计规范](./数据库设计规范.md) - 统一的数据库设计标准，适用于所有项目

---

📌 更多项目与细节请访问我的 [GitHub主页](https://github.com/Moonlight168)或[Gitee主页](https://gitee.com/wish168)，或通过博客左侧分类导航查看。
