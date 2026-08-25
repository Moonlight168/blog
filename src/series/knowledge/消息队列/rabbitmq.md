---
title: RabbitMQ
date: 2026-03-26
icon: /assets/icon/rabbitmq.png
order: 1
---

## RabbitMQ是什么，在系统架构中有什么作用？

**锚点**：`五大作用：解耦 / 异步 / 削峰 / 可靠 / 协调`

基于 AMQP 协议的开源消息中间件，主要作用：

1. **系统解耦**：生产者与消费者无需直接交互，各服务独立开发部署扩展
2. **异步通信**：同步操作转异步，非核心任务（日志、通知）异步处理，响应更快
3. **削峰填谷**：高峰期请求暂存队列平滑处理，保护下游系统免过载
4. **可靠性保障**：持久化防丢、消息确认、重试、死信队列保证可靠投递
5. **分布式协调**：发布/订阅一对多通信，用于分布式事务、事件驱动架构

## RabbitMQ 中有哪些常见的交换器（Exchange）类型，它们有什么区别？

**锚点**：`Direct 精确 / Fanout 广播 / Topic 通配 / Headers 按头`

- **Direct**：Binding Key 和 Routing Key 完全匹配才发——按日志级别分发等精确场景
- **Fanout**：发给所有绑定队列，忽略 Key——广播、群发通知
- **Topic**：Routing Key 与 Binding Key 模式匹配（`*.log` 通配）——按规则分发
- **Headers**：按消息内容 headers 属性匹配——实际较少用

## RabbitMQ怎么保证消息不丢失？

**锚点**：`生产端 confirm + 服务端持久化 + 消费端手动 ACK，三者缺一不可`

1. **生产者端**：开启 confirm 模式等 Broker 确认；设置 deliveryMode=2 消息持久化
2. **服务器端**：队列 durable=true、交换器 durable=true；镜像队列集群高可用
3. **消费者端**：关闭 autoAck 手动 ACK，处理完再确认；死信队列兜底

```java
channel.confirmSelect();  // 发送确认模式
channel.basicPublish(exchange, routingKey, MessageProperties.PERSISTENT_TEXT_PLAIN, message);

boolean autoAck = false;  // 关闭自动确认
channel.basicConsume(queue, autoAck, consumer);
channel.basicAck(deliveryTag, false);  // 手动确认
```

## 如何提升RabbitMQ顺序消费性能?

**锚点**：`保序三招：单队列单消费者 / 业务 ID 分组 / 序列号重组`

1. **单队列单消费者**：`prefetchCount=1` 一次处理一条，顺序 100% 但吞吐低——订单状态流转
2. **消息分组**：同业务 ID 走同一队列（Direct 交换器以业务 ID 做 Routing Key）——组内有序、整体并行
3. **序列号重组**：生产端全局递增序列号，消费端缓存乱序消息按序号重组——允许延迟、吞吐最高
4. **消费者优化**：批量处理减 ACK 次数、confirm 异步模式、单连接多通道
5. **架构优化**：按业务分片队列、消费端本地缓存、优先级队列

**性能对比**：单队列单消费者顺序 100% 吞吐低；分组队列组内 100% 吞吐高；序列号重组 100% 延迟高但吞吐最高。

## 如何解决重复消息问题？

**锚点**：`消息唯一 ID + 消费端幂等（唯一约束/SETNX/状态校验）`

1. **重复原因**：生产者重试、消费者确认失败、MQ 故障恢复
2. **生产者端**：每条消息生成全局唯一 ID；publisher confirm 保证可靠投递
3. **消费者端（核心：幂等）**：
   - 数据库唯一约束（消息 ID 做主键）
   - Redis 原子操作（SETNX 去重）
   - 业务状态校验（订单状态判断）

```sql
CREATE TABLE message_dup (
    msg_id VARCHAR(64) PRIMARY KEY,
    status TINYINT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**最佳实践**：核心业务必须幂等，消息 ID 全局唯一，定期清理去重表。

## RabbitMQ 延迟队列如何实现？

**锚点**：`TTL+死信（简单但头阻塞）vs 延迟插件（消息级延迟，推荐）`

1. **TTL + 死信队列**：消息 TTL 过期进死信队列，消费者监听死信实现延迟
   - 缺点：队列先进先出，第一条 TTL 最长会阻塞后续消息
2. **延迟队列插件（推荐）**：`rabbitmq-plugins enable rabbitmq_delayed_message_exchange`，声明 `x-delayed-message` 交换器，消息头带 `x-delay` 毫秒数
   - 优点：消息级延迟不阻塞、支持动态调整

**应用场景**：订单超时取消、定时提醒、延迟重试。

## RabbitMQ 死信队列是什么？

**锚点**：`三种死信：拒绝不重入队 / TTL 过期 / 队列满`

1. **变死信条件**：消息被拒绝（`basic.reject`/`basic.nack` 且 `requeue=false`）；TTL 过期未被消费；队列满被丢弃
2. **配置**：业务队列声明 `x-dead-letter-exchange` + `x-dead-letter-routing-key`，死信进 DLX 对应队列
3. **应用场景**：失败消息人工介入或重试；配合 TTL 做延迟队列；消息兜底防丢、可追溯
4. **监控建议**：监控死信队列长度超阈值告警；定期分析死信原因优化消费逻辑

## 消息队列怎么保证消息不丢？生产端、Broker、消费端分别怎么做？

**锚点**：`生产端确认 + Broker 持久化副本 + 消费端手动 ACK`

| 环节 | 方案 |
|------|------|
| **生产端** | 发送确认（publisher confirm），MQ 落盘后才返回确认；事务模式也可但性能差 |
| **Broker** | 持久化（队列/消息/交换机都设 durable）+ 镜像队列（RabbitMQ）或同步副本（RocketMQ） |
| **消费端** | 手动 ACK，处理完业务再确认。自动 ACK 拿到消息就确认，进程崩了消息就丢 |

补充：死信队列（DLQ）是消息被拒绝/超时/超出重试次数后的去处，跟防丢是不同概念。

→ [回答历史](/private/series/答题历史/消息队列/rabbitmq-答题记录.md#消息队列怎么保证消息不丢生产端broker消费端分别怎么做)

## RabbitMQ 交换机是什么？

**锚点**：`生产端先发交换机，交换机按路由规则转发到绑定的队列`

- 交换机（Exchange）是生产端不直接发队列，先发交换机，交换机按路由规则转发到绑定的队列
- 跟"队列负载均衡"不同：交换机只看路由规则，消费者之间的负载是多个消费者绑定同一队列时由 Channel 轮询分发

→ [回答历史](/private/series/答题历史/消息队列/rabbitmq-答题记录.md#rabbitmq-交换机是什么)

## RabbitMQ 交换机有哪几种类型？

**锚点**：`Direct 精确 / Topic 通配 / Fanout 广播 / Headers 按头`

- **Direct**：routing key 精确匹配 → 指定队列
- **Topic**：通配符匹配（`order.*` 单段、`order.#` 多段）
- **Fanout**：广播，绑定的队列全发
- **Headers**：按消息头匹配（很少用）

→ [回答历史](/private/series/答题历史/消息队列/rabbitmq-答题记录.md#rabbitmq-交换机有哪几种类型)

## 消息持久化和队列持久化的区别是什么？

**锚点**：`队列持久化保元数据，消息持久化保内容——两者缺一不可`

- **队列持久化**：队列元数据（名称、绑定关系）写磁盘，Broker 重启后队列还在；没持久化则重启后队列消失，消息跟着全丢
- **消息持久化**：设置 `delivery_mode = 2`，单条消息内容落地磁盘；没持久化则重启后消息丢失
- 两者缺一不可：队列持久化 + 消息不持久化 → 队列在消息空；消息持久化 + 队列不持久化 → 队列消失消息跟着丢

→ [回答历史](/private/series/答题历史/消息队列/rabbitmq-答题记录.md#消息持久化和队列持久化的区别是什么)
