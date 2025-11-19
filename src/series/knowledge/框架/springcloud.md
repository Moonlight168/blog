---
title:   SpringCloud
icon: /assets/icon/cloud.png
order: 3
---

##  什么是微服务？有哪些优缺点？

**回答：**
微服务是将单体应用拆分成多个独立服务，各服务可独立部署、扩展。

* 优点：开发独立、部署灵活、可按需扩展。
* 缺点：系统复杂、测试困难、运维成本高、接口通信开销大。


## 每个微服务之间如何通信？

**回答：**

1. **同步通信**：使用 HTTP 或 RPC

    * 常用方式：OpenFeign、RestTemplate、Dubbo、gRPC
    * 特点：实时响应，适合强一致性场景

2. **异步通信**：通过消息队列

    * 常用组件：Kafka、RabbitMQ、RocketMQ
    * 特点：解耦、削峰填谷，适合异步处理场景

## ⭐微服务四大件都有哪些？

**回答：**
1. **服务注册与发现**

  * 作用：管理服务地址，实现自动注册和发现
  * 常用组件：Nacos、Eureka、Consul、Zookeeper

2. **配置中心**

  * 作用：集中管理微服务配置，支持热更新
  * 常用组件：Nacos、Apollo、Spring Cloud Config

3. **服务网关**

  * 作用：统一入口，进行路由转发、权限校验、限流熔断等
  * 常用组件：Gateway、Zuul、Kong、Nginx

4. **服务通信与容错**

  * 作用：服务间调用 + 熔断、限流、重试等容错处理
  * 常用组件：**OpenFeign、Dubbo、gRPC、RestTemplate**（通信）；**Sentinel、Resilience4j、Hystrix**（容错）


## Nacos 如何实现配置热更新？

**回答：**
Nacos 配置热更新主要有以下几个机制：

1. **长轮询监听**：客户端会开启长轮询，实时监听配置中心的变更
2. **事件通知**：当服务端配置有变化时，会主动推送通知给客户端
3. **@RefreshScope**：Spring Cloud 中使用该注解，可以让 Bean 在配置更新时动态刷新
4. **配置绑定**：通过 `@Value` 或 `@ConfigurationProperties` 注解绑定属性，配合 `@RefreshScope` 实现热更新

## Hystrix 和 Sentinel 有什么区别？

**回答：**

* **Hystrix**：Netflix 开发的断路器组件，主要功能是服务熔断、降级、隔离，已经停止维护
* **Sentinel**：阿里巴巴开源的流量防护组件，功能更全面，包含限流、熔断、降级、热点参数限流、系统自适应保护，还提供控制台便于可视化管理

## 如何监控微服务中的负载均衡状态？

**回答：**
监控负载均衡一般有以下几种方式：

1. **应用日志**：在服务调用层打印调用目标实例信息，便于追踪请求分配情况
2. **Spring Cloud LoadBalancer / Ribbon**：开启 debug 日志或结合 Actuator 查看服务实例的调用分布
3. **注册中心（如 Nacos、Eureka）**：通过控制台查看服务实例的健康状态和权重
4. **链路追踪（Sleuth + Zipkin / SkyWalking）**：监控请求在不同实例中的分布和耗时情况
5. **指标监控（Prometheus + Grafana）**：采集服务调用指标，直观展示负载均衡效果

## Spring Boot Admin的作用是什么？

**回答：**
Spring Boot Admin是一个用于管理和监控Spring Boot应用的开源项目，主要功能包括：

* 服务监控：实时监控服务健康状态、内存、CPU等指标
* 日志管理：在线查看和修改日志级别
* JVM监控：监控内存、线程、GC等情况
* 配置管理：查看和修改应用配置
* 告警通知：服务异常时发送告警
* 统一界面：提供统一的Web界面管理多个微服务实例

## 为什么需要微服务监控中心？

**回答：**
在微服务架构中，监控中心的重要性体现在：

* 全局视图：提供所有服务的统一监控视图
* 故障排查：快速定位问题服务实例
* 性能优化：通过监控数据发现性能瓶颈
* 容量规划：根据历史数据进行容量预测
* 自动化运维：结合告警系统实现自动化运维
* 服务治理：监控服务间的调用关系和依赖

## 如何实现服务状态变更的告警？

**回答：**
实现服务状态变更告警的关键步骤：

* 事件监听：监听服务实例的状态变化事件
* 状态过滤：过滤掉不重要的状态变化（如从DOWN恢复到UP）
* 告警策略：定义触发条件和频率
* 多通道通知：支持邮件、短信、钉钉、企业微信等方式
* 告警去重：避免重复告警
* 告警升级：持续未处理的告警进行升级处理

## 在微服务中，为什么业务配置（如数据库、服务地址）通常放在配置中心，而配置中心的连接信息（如 Nacos 地址）却放在本地的 bootstrap.yml 中？”

你必须先能连上“配置中心”，才能从配置中心读取业务配置。
所以连接配置中心的最小启动配置bootstrap.yml必须放本地。

## 为什么 Nacos 配置表的 context 字段用 LONGTEXT 而不是 JSON？

Nacos 的配置内容格式多样（YAML、Properties、XML、JSON），如果使用 JSON 字段会触发数据库的 JSON 校验，限制格式类型。

同时 Nacos 要兼容多种数据库（MySQL、MariaDB、PostgreSQL），而各数据库的 JSON 类型实现不一致，兼容性差。

LONGTEXT 是所有数据库都支持的纯文本字段，无校验、兼容性最好、写入性能更高，因此官方选择 LONGTEXT。

## `debug: true` 为什么不能放在 bootstrap.yml 中？必须放在 application.yml（或 application-xxx.yml）中才能生效？

**回答：**

`debug: true` **必须放在本地的 application.yml 中才有效**，有以下重要原因：

### 1. **时机问题**
* **debug需要在应用启动早期就生效**，用于捕获启动过程中的问题
* 而Nacos远程配置获取需要时间，**启动时还没加载到远程配置**
* 放在远程application.yml中的debug配置无法在启动初期生效

### 2. **配置加载顺序**
1. **bootstrap.yml** → 连接配置中心
2. **本地application.yml** → 立即生效，设置启动参数
3. **远程application.yml** → 后期加载（此时debug已错过生效时机）

### 3. **核心原因**
```yaml
# ✅ 正确：本地的 application.yml 立即生效
debug: true
logging:
  level:
    root: DEBUG

# ❌ 错误：远程的 application.yml 生效太晚
# （Nacos中的application.yml配置，debug已错过生效时机）
```

