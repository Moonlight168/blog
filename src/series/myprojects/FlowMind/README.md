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

**基于 RuoYi-Cloud 的企业级工作流管理系统，新增审批中心和草稿箱功能**

## 🧠项目简介

FlowMind是基于RuoYi-Cloud的企业级工作流管理系统，在保留RuoYi-Cloud原有功能的基础上，新增了审批中心和草稿箱功能，为企业提供更完善的流程管理解决方案。

* 基于[RuoYi-Cloud](https://gitee.com/y_project/RuoYi-Cloud)框架进行扩展开发。
* 采用前后端分离架构，后端使用Spring Boot、Spring Cloud & Alibaba微服务架构，前端采用Vue3 + Element Plus + Vite。
* 注册中心、配置中心选型Nacos，权限认证使用Redis。
* 流量控制框架选型Sentinel，分布式事务选型Seata。
* 在RuoYi-Cloud原有功能基础上，新增了以下核心功能：
    * **审批中心**：提供统一的流程审批管理界面，支持待办任务、已办任务、待签任务、我的流程等全方位流程管理
    * **草稿箱**：支持流程草稿的保存、编辑和管理，用户可以随时保存未完成的流程申请，稍后继续编辑

---

## 💻系统架构概览

### 技术架构

* 前端技术栈：Vue3 + Element Plus + Vite
* 后端技术栈：Spring Boot 3 + Spring Cloud Alibaba
* 注册中心、配置中心：Nacos
* 权限认证：Redis
* 流量控制：Sentinel
* 分布式事务：Seata
* 数据库：MySQL
* 工作流引擎：Flowable

---

## 📋主要功能

### RuoYi-Cloud原有功能

1. 用户管理：用户是系统操作者，该功能主要完成系统用户配置。
2. 部门管理：配置系统组织机构（公司、部门、小组），树结构展现支持数据权限。
3. 岗位管理：配置系统用户所属担任职务。
4. 菜单管理：配置系统菜单，操作权限，按钮权限标识等。
5. 角色管理：角色菜单权限分配、设置角色按机构进行数据范围权限划分。
6. 字典管理：对系统中经常使用的一些较为固定的数据进行维护。
7. 参数管理：对系统动态配置常用参数。
8. 通知公告：系统通知公告信息发布维护。
9. 操作日志：系统正常操作日志记录和查询；系统异常信息日志记录和查询。
10. 登录日志：系统登录日志记录查询包含登录异常。
11. 在线用户：当前系统中活跃用户状态监控。
12. 定时任务：在线（添加、修改、删除)任务调度包含执行结果日志。
13. 代码生成：前后端代码的生成（java、html、xml、sql）支持CRUD下载 。
14. 系统接口：根据业务代码自动生成相关的api接口文档。
15. 服务监控：监视当前系统CPU、内存、磁盘、堆栈等相关信息。
16. 在线构建器：拖动表单元素生成相应的HTML代码。
17. 连接池监视：监视当前系统数据库连接池状态，可进行分析SQL找出系统性能瓶颈。

### FlowMind新增功能

18. **审批中心**：
    * 待办任务：显示当前用户需要处理的任务列表
    * 已办任务：显示当前用户已经处理完成的任务列表
    * 待签任务：显示当前用户可以签收的任务列表
    * 我的流程：显示当前用户发起的流程实例列表
    * 流程详情：查看流程实例的详细信息、流程图和审批记录

19. **草稿箱**：
    * 草稿列表：显示用户保存的流程草稿列表
    * 草稿编辑：支持编辑已保存的草稿，继续完善流程申请
    * 草稿删除：支持删除不需要的草稿
    * 草稿转正：支持将草稿直接转换为正式流程申请

20. **AI审批智能体**：
    * 智能审批决策：基于本地微调模型（Phi-3 Mini）自动进行审批决策
    * 支持批准/拒绝/建议人工处理三种决策类型
    * 数据隐私保障：本地部署模型，数据不出境
    * 可扩展规则引擎：支持从MySQL数据库加载审批规则
    * 与工作流深度集成：直接嵌入Flowable工作流引擎
    * 技术栈：Python + LangChain + Ollama + 微调Phi-3 Mini

---

## 📁项目结构

```
flowmind/
├── flowmind-ui           // 前端项目
├── flowmind-cloud        // 后端项目
│   ├── flowmind-gateway      // 网关模块
│   ├── flowmind-auth         // 认证中心
│   ├── flowmind-api          // 接口模块
│   │   └── flowmind-api-system                  // 系统接口
│   ├── flowmind-common       // 通用模块
│   │   └── flowmind-common-core                  // 核心模块
│   │   └── flowmind-common-datascope             // 权限范围
│   │   └── flowmind-common-datasource            // 多数据源
│   │   └── flowmind-common-log                   // 日志记录
│   │   └── flowmind-common-redis                 // 缓存服务
│   │   └── flowmind-common-security              // 安全模块
│   │   └── flowmind-common-swagger               // 系统接口
│   ├── flowmind-modules      // 业务模块
│   │   └── flowmind-system                       // 系统模块 
│   │   └── flowmind-gen                          // 代码生成
│   │   └── flowmind-job                          // 定时任务
│   │   └── flowmind-file                         // 文件服务
│   │   └── flowmind-flowable                     // 工作流模块
│   ├── flowmind-visual       // 图形化管理模块
│   │   └── flowmind-visual-monitor               // 监控中心
│   └── pom.xml                // 公共依赖
```

---

## 🚀快速开始

详细部署步骤请参考：[部署方案](./部署方案.md)

## 🌐在线体验

演示地址：https://codebyggbond.dpdns.org/series/myprojects/FlowMind/  
文档地址：https://codebyggbond.dpdns.org/series/myprojects/FlowMind/ 

测试账号：admin/123456

## 🖼️项目预览

### 登录页面
![登录页面](../imges/FlowMind/README/登陆.png)

### 工作台
![工作台](../imges/FlowMind/README/工作台.png)

### 审批中心
#### 待办事项
![审批中心待办事项](../imges/FlowMind/README/审批中心待办事项.png)

#### 我的流程
![我的流程](../imges/FlowMind/README/我的流程.png) 

### 流程管理
#### 流程分类
![流程分类](../imges/FlowMind/README/流程分类.png)

#### 流程设计
![流程设计](../imges/FlowMind/README/流程设计.png)

#### 流程部署
![流程部署](../imges/FlowMind/README/流程部署.png)

#### 流程发起
![流程发起](../imges/FlowMind/README/流程发起.png) 

#### 表单编辑
![表单编辑](../imges/FlowMind/README/表单编辑.png)

### 草稿箱
![草稿箱](../imges/FlowMind/README/草稿箱.png)

### 个人信息
![个人信息](../imges/FlowMind/README/个人信息.png)

## 📄项目仓库

* Gitee：[flowmind](https://gitee.com/wish168/flowmind)
* GitHub：[flowmind](https://github.com/Moonlight168/flowmind)

## 📚相关教程

- [完整教程：基于Python的审批智能体实现及接入FlowMind系统](../../../../blogs/开发工具/实践出真知/完整教程：基于Python的单一功能审批智能体实现及接入Spring Cloud Alibaba.md)

## 🛡️版权信息

本项目基于 [RuoYi-Cloud](https://gitee.com/y_project/RuoYi-Cloud) 进行扩展开发，遵循 [Apache License 2.0](https://github.com/Moonlight168/flowmind/blob/master/LICENSE) 开源协议。