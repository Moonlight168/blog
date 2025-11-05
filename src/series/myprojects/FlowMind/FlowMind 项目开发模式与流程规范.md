---
title: "FlowMind 项目开发模式与流程规范"
icon: /assets/icon/测试.png
order: 5
---

# FlowMind 项目开发模式与流程规范文档

## 一、文档目的

本文档用于规范 **FlowMind 智能工作流编排平台** 的企业级开发流程，确保团队在开发、测试、部署、运维各阶段具备统一标准，实现高可靠、高可维护、高可扩展的研发体系。

---

## 二、总体开发模式概述

FlowMind 采用 **DDD（领域驱动设计）+ 微服务架构 + DevOps 持续交付** 的开发模式。

核心理念：
> 以领域模型划分业务边界，以微服务实现解耦，以 DevOps 实现自动化交付。

---

## 三、开发阶段与流程

| 阶段 | 模式/方法 | 工具支持 | 主要输出 |
|------|------------|-----------|-----------|
| 1️⃣ 需求分析阶段 | 敏捷 Scrum + 用例驱动分析 | Jira / 飞书 / Notion | 用户故事、任务拆解 |
| 2️⃣ 架构设计阶段 | DDD + 六边形架构 | PlantUML / Draw.io | 上下文图、领域模型图 |
| 3️⃣ 开发阶段 | Clean Architecture + 分层开发 | Spring Cloud Alibaba / FastAPI | 模块代码、单元测试 |
| 4️⃣ 测试阶段 | TDD（测试驱动开发） | JUnit5 / Pytest / Postman | 自动化测试用例 |
| 5️⃣ 集成阶段 | CI/CD 模式 | Jenkins / Docker / Helm | 自动构建与持续集成 |
| 6️⃣ 部署阶段 | GitOps + K8s 持续部署 | ArgoCD / K8s / Nacos | 灰度与滚动发布 |
| 7️⃣ 监控阶段 | Observability 可观测性 | Prometheus / Grafana / Loki | 指标与报警配置 |

---

## 四、DDD 分层设计规范

```

flowmind-approval-service/
├── api/                # 接口层：Controller、Feign、DTO、VO
├── application/        # 应用层：业务编排、服务封装
├── domain/             # 领域层：实体、聚合根、领域事件
├── infrastructure/     # 基础设施层：Mapper、Repository、外部接口
├── common/             # 通用模块：异常、工具、统一响应结构
└── test/               # 单元与集成测试

```

### 各层职责说明

| 层级 | 职责 | 技术实现 |
|------|------|-----------|
| **api** | 暴露 REST 接口 / Feign 调用 | Spring MVC / OpenFeign |
| **application** | 聚合业务逻辑，调用领域与基础设施层 | Spring Service |
| **domain** | 定义核心业务逻辑与模型 | 实体类 + 领域服务 |
| **infrastructure** | 数据存取、第三方交互 | MyBatis-Plus / Redis / Feign |
| **common** | 工具类、异常、统一响应封装 | Hutool / Lombok |
| **test** | 单元与集成测试 | JUnit5 / Mockito |

---

## 五、微服务架构规范（Spring Cloud Alibaba）

| 模块 | 主要技术 | 职责 |
|------|-----------|------|
| **Nacos** | 注册中心 + 配置中心 | 服务发现与配置管理 |
| **Gateway** | Spring Cloud Gateway | API 网关、路由与限流 |
| **Sentinel** | 熔断与限流保护 | 流量保护与降级 |
| **OpenFeign** | 微服务调用 | 服务间通信 |
| **RocketMQ / Kafka** | 消息中间件 | 异步通信与事件驱动 |
| **Seata** | 分布式事务 | Saga / TCC 模式支持 |

---

## 六、Python Agent 开发规范

| 模块 | 技术栈 | 职责 |
|------|----------|------|
| **FastAPI** | Python + Uvicorn | 提供 LLM 推理与智能决策服务 |
| **LangChain** | LLM 调用框架 | 智能初审、自动分类与摘要 |
| **gRPC / REST** | 与 Java 微服务通信 | 统一接口协议 |
| **Redis / Celery** | 异步任务队列 | 批量分析与缓存 |

---

## 七、开发流程规范（DevOps）

### 1️⃣ Git 分支模型（Git Flow）

```

main        —— 生产分支（CI 发布）
│
├── develop —— 开发主干分支
│
├── feature/* —— 新功能开发分支
│       ├── feature/approval-service
│       ├── feature/resource-service
│       └── feature/agent-integration
│
├── hotfix/* —— 线上紧急修复
│
└── release/* —— 预发布版本

```

### 2️⃣ 提交规范

```

feat: 新功能
fix: 修复问题
refactor: 代码重构
perf: 性能优化
docs: 文档变更
test: 测试相关
build: 构建配置修改
chore: 其他杂项

````

### 3️⃣ Jenkins CI/CD 流程

```text
开发者提交代码 → Jenkins 自动拉取 →
  1. 编译与单测（Maven + JUnit）
  2. Docker 构建镜像并推送到 Harbor
  3. Helm 部署到 K8s 测试环境
  4. 自动执行集成测试
  5. 触发 ArgoCD 更新生产集群
````

---

## 八、测试与质量保证

| 测试类型 | 工具                          | 目标               |
| ---- | --------------------------- | ---------------- |
| 单元测试 | JUnit5 / Pytest             | 验证最小逻辑单元正确性      |
| 接口测试 | Postman / RestAssured       | 验证 API 输入输出一致性   |
| 性能测试 | JMeter / Locust             | 压测、并发、TPS/QPS 验证 |
| 集成测试 | TestContainers / MockServer | 模拟微服务交互          |
| 安全测试 | OWASP ZAP / BurpSuite       | 防注入与认证漏洞         |

---

## 九、持续集成与交付（CI/CD）

| 阶段    | 工具                          | 内容         |
| ----- | --------------------------- | ---------- |
| 构建阶段  | Jenkins + Maven + Docker    | 自动构建镜像     |
| 部署阶段  | Helm + Kubernetes           | 环境部署与回滚    |
| 配置管理  | Nacos                       | 动态配置刷新     |
| 灰度发布  | ArgoCD / Istio              | 按用户或流量比例发布 |
| 日志与监控 | Prometheus + Grafana + Loki | 运行指标可视化    |

---

## 十、团队协作规范

1. 每个功能开发前必须创建 **Jira 任务** 与 **feature 分支**
2. 开发完成后需提交 **MR（Merge Request）**，并由架构师或模块负责人进行 **Code Review**
3. 严格执行 **单元测试通过率 ≥ 80%**
4. 每次版本迭代都需更新 **CHANGELOG.md**
5. 所有配置、镜像、依赖版本需在 `env.yaml` 中集中管理

---

## 十一、代码质量与安全规范

* **代码扫描工具**：SonarQube（代码质量）
* **依赖漏洞检测**：OWASP Dependency-Check
* **静态代码分析**：SpotBugs / Pylint
* **容器安全扫描**：Trivy

---

## 十二、可观测性与日志追踪

| 模块   | 工具                            | 功能                  |
| ---- | ----------------------------- | ------------------- |
| 指标采集 | Prometheus                    | 采集 JVM、Pod、Zeebe 指标 |
| 日志聚合 | Loki + Grafana                | 可视化查询日志             |
| 链路追踪 | SkyWalking / Zipkin           | 分布式调用链监控            |
| 报警系统 | Alertmanager + Feishu Webhook | 自动报警与通知             |

---

## 十三、版本与环境管理

| 环境   | 说明    | 分支        |
| ---- | ----- | --------- |
| DEV  | 开发环境  | develop   |
| TEST | 测试环境  | release/* |
| UAT  | 预发布环境 | release/* |
| PROD | 生产环境  | main      |

版本号规范：

```
主版本号.次版本号.修订号（如 1.3.0）
```

---

## 十四、总结

FlowMind 的开发模式融合了 **DDD、微服务架构、CI/CD、Kubernetes** 的最佳实践，目标是：

* 实现智能审批流程的高可用、高扩展、低耦合；
* 构建自动化的交付与运维体系；
* 保障研发团队在多模块协同下的高效与稳定。

该规范应放置于：

```
docs/development/FlowMind_Development_Guide.md
```

并作为项目新成员入职与版本迭代的标准参考文档。
