---
title: Prometheus
date: 2025-10-19
category: 基本概念
---

## 一、什么是 Prometheus

Prometheus 是一个 **开源的系统监控与告警工具**，由 SoundCloud 于 2012 年开发，并在 2015 年成为 CNCF（云原生计算基金会）托管项目。
它以时间序列数据库（Time Series Database, TSDB）为核心，用于采集、存储和查询各种指标数据，是云原生监控体系中最重要的组件之一。

通俗来说，Prometheus 就是一个能“自动拉取监控数据、保存历史指标、支持灵活查询和告警”的监控平台。

---

## 二、Prometheus 的核心特点

1. **多维度数据模型**
   Prometheus 将监控数据存储为时间序列，每条数据由：

    * `metric name`（指标名）
    * 一组 `labels`（标签键值对）
    * 对应的时间戳和值
      组成。
      例如：

   ```
   http_requests_total{method="GET", status="200"} 1027
   ```

2. **拉模式数据采集（Pull）**
   Prometheus 主动从目标（如应用、容器、系统节点）中“拉取”数据，而不是被动接收。
   这种设计使得 Prometheus 更容易在动态环境（如 Kubernetes）中自动发现和管理监控目标。

3. **强大的查询语言（PromQL）**
   PromQL（Prometheus Query Language）是 Prometheus 的查询语言，能对指标数据进行实时聚合、过滤和计算，用于可视化和告警规则。

4. **独立运行，无需外部依赖**
   Prometheus 自带存储引擎和 Web 界面，不依赖外部数据库，易于部署与维护。

5. **与 Grafana 深度集成**
   Grafana 通常与 Prometheus 搭配使用，用于将监控数据可视化展示成图表与仪表盘。

---

## 三、Prometheus 的架构组成

Prometheus 的核心组件包括：

1. **Prometheus Server**
   负责定期拉取监控数据、存储指标并提供查询接口。

2. **Exporter**
   数据采集端，用于将系统或应用的运行状态暴露为 HTTP 接口供 Prometheus 拉取。
   常见类型包括：

    * Node Exporter（监控主机资源）
    * Redis Exporter
    * MySQL Exporter
    * JMX Exporter（Java 应用）

3. **Alertmanager**
   处理来自 Prometheus 的告警规则，负责告警聚合、抑制、路由以及通知（如邮件、钉钉、企业微信）。

4. **Pushgateway**
   用于短生命周期任务（如定时任务、批处理）无法暴露 HTTP 接口的场景，将数据主动“推送”给 Prometheus。

5. **Service Discovery（服务发现）**
   支持动态注册机制，如 Kubernetes、Consul、Eureka 等，使 Prometheus 能自动发现新目标。

---

## 四、Prometheus 的工作原理

1. **采集数据（Scrape）**
   Prometheus 按配置文件中的目标地址，定期从 Exporter 拉取指标数据。

2. **存储数据（Store）**
   采集到的数据以时间序列形式存储在本地 TSDB 中。

3. **查询分析（Query）**
   用户可通过 PromQL 查询、聚合或筛选指标数据，用于监控面板或告警。

4. **触发告警（Alert）**
   当某个指标超过阈值时，Prometheus 会将告警事件发送给 Alertmanager，再由 Alertmanager 通知相关人员。

---

## 五、Prometheus 的应用场景

1. **微服务监控**
   监控每个微服务的请求量、响应时间、错误率等指标。

2. **容器与集群监控**
   与 Kubernetes 集成，实现 Pod、Node、Namespace 等多层级监控。

3. **数据库与中间件监控**
   如 Redis、MySQL、Kafka、Nginx 的运行状态和性能指标。

4. **自定义业务指标**
   开发者可通过 SDK 将自定义指标（如订单量、交易成功率）暴露给 Prometheus。

---

## 六、Prometheus 的优点

1. **部署简单，无外部依赖**
2. **数据模型灵活，支持高维度标签查询**
3. **强大的查询语言 PromQL**
4. **易与 Grafana 集成，可视化能力强**
5. **高性能与高可用，可支持百万级时序数据**

---

## 七、总结

Prometheus 是一款基于时间序列数据库的监控与告警系统，具备高性能、灵活性和强扩展性。
它通过“拉取指标 + 标签管理 + PromQL 查询 + 告警机制”构建了完整的监控生态，广泛应用于云原生、微服务、容器化系统中，是现代分布式系统监控的核心解决方案。
