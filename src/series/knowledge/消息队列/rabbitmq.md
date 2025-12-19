---
title: RabbitMQ
date: 2025-05-21
icon: /assets/icon/rabbitmq.png
order: 1
---

## RabbitMQ是什么，在系统架构中有什么作用？

RabbitMQ是基于AMQP协议的开源消息中间件，在系统架构中主要发挥以下作用：

### 1. 系统解耦
- 生产者与消费者无需直接交互，降低系统耦合度
- 各服务可独立开发、部署和扩展

### 2. 异步通信
- 将同步操作转为异步处理，提高系统响应速度
- 非核心任务（如日志、通知）可异步处理，提升用户体验

### 3. 削峰填谷
- 高峰期将请求暂存队列，平滑处理突发流量
- 保护下游系统免受过载冲击，提高系统稳定性

### 4. 可靠性保障
- 持久化机制确保消息不丢失
- 支持消息确认、重试和死信队列，保证消息可靠投递

### 5. 分布式协调
- 实现发布/订阅模式，支持一对多通信
- 可用于分布式事务、事件驱动架构等场景

## RabbitMQ 中有哪些常见的交换器（Exchange）类型，它们有什么区别？

**回答:** 常见的交换器类型有 Direct、Fanout、Topic 和 Headers。

- **Direct** ：消息会被发送到 Binding Key 和 Routing Key 完全匹配的队列。适用于需要精确匹配的场景，比如根据日志级别将日志消息发送到不同队列。
- **Fanout**：消息会被发送到所有绑定到该交换器的队列，忽略 Binding Key。常用于广播消息的场景，比如群发通知。
- **Topic**：消息会根据 Routing Key 和 Binding Key 的模式匹配规则发送到队列。Binding Key 可以使用通配符，比如 *.log 表示匹配所有以 .log 结尾的 Routing Key，适用于需要按规则分发消息的场景。
- **Headers**：不依赖于 Routing Key 与 Binding Key 的匹配规则，而是根据发送的消息内容中的 headers 属性进行匹配。在实际应用中较少使用。

## RabbitMQ怎么保证消息不丢失？

RabbitMQ通过三个层面保障消息不丢失：

### 1. 生产者端
- **消息确认机制**：开启confirm模式，等待Broker确认
- **消息持久化**：设置deliveryMode=2，确保消息持久化到磁盘

### 2. 服务器端
- **队列持久化**：声明队列时设置durable=true
- **交换器持久化**：声明交换器时设置durable=true
- **集群部署**：使用镜像队列实现高可用

### 3. 消费者端
- **手动确认**：关闭autoAck，处理完成后手动ACK
- **死信队列**：处理无法消费的消息

**核心代码：**
```java
channel.confirmSelect();  // 开启发送确认模式，确保消息到达Broker
channel.basicPublish(exchange, routingKey, MessageProperties.PERSISTENT_TEXT_PLAIN, message);
// 发送持久化消息：PERSISTENT_TEXT_PLAIN设置deliveryMode=2，确保消息持久化到磁盘

// 消费者
boolean autoAck = false;  // 关闭自动确认，改为手动确认
channel.basicConsume(queue, autoAck, consumer);  // 消费消息，但不自动确认
channel.basicAck(deliveryTag, false);  // 手动确认消息处理完成
```
**关键点：**生产者确认+持久化+消费者手动ACK，三者缺一不可

## 如何提升RabbitMQ顺序消费性能?

### 1. **单队列单消费者模式**
- **核心原理**：一个队列只对应一个消费者，避免并发消费导致乱序
- **实现方式**：设置`prefetchCount=1`，确保消费者一次只处理一条消息
- **适用场景**：对顺序性要求极高的业务（如订单状态流转）

```java
channel.basicQos(1);  // 设置预取数量为1，确保顺序处理
channel.basicConsume(queue, false, consumer);  // 关闭自动确认
```

### 2. **消息分组策略**
- **业务ID分组**：将相同业务ID的消息路由到同一队列
- **实现方式**：使用Direct交换器，以业务ID作为Routing Key
- **优势**：不同业务可并行处理，同一业务内保持顺序

```java
// 以订单ID作为Routing Key，确保同一订单的消息有序
channel.basicPublish("order_exchange", orderId, properties, message);
```

### 3. **消息序列号机制**
- **生产端**：为每条消息添加全局递增序列号
- **消费端**：缓存乱序消息，按序列号重组后处理
- **适用场景**：允许一定延迟但对顺序性要求严格的场景

```java
// 消息结构
{
  "data": {...},
  "sequence": 1001,  // 全局递增序列号
  "businessId": "order_123"
}
```

### 4. **优化消费者性能**
- **批量处理**：按序号批量处理消息，减少ACK次数
- **异步确认**：使用`confirm.select异步模式`提高吞吐量
- **连接复用**：单连接多通道，减少连接开销

### 5. **架构层面优化**
- **分片队列**：按业务维度分片，减少单队列压力
- **本地缓存**：消费端缓存待处理消息，减少网络IO
- **优先级队列**：重要消息优先处理，减少阻塞

**性能对比：**
- 单队列单消费者：顺序性100%，吞吐量低
- 分组队列：组内顺序100%，整体吞吐量高
- 序列号重组：顺序性100%，延迟较高但吞吐量最高

## 如何解决重复消息问题？

### 1. 问题原因
- 生产者重试机制导致重复发送
- 消费者确认失败导致消息重投
- 消息队列故障恢复时重放未确认消息

### 2. 解决方案

#### 生产者端
- **幂等设计**：确保消息重复发送不影响结果
- **唯一消息ID**：为每条消息生成全局唯一ID
- **确认机制**：使用publisher confirm确保消息可靠投递

#### 消费者端
- **幂等处理**：核心解决方案，确保重复消费不产生副作用
  - 数据库唯一约束
  - Redis原子操作
  - 业务状态校验
- **消息去重表**：
  ```sql
  CREATE TABLE message_dup (
      msg_id VARCHAR(64) PRIMARY KEY,
      status TINYINT DEFAULT 0,
      create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **本地缓存**：使用Guava Cache或Redis临时存储已处理的消息ID
- **合理确认机制**：确保处理完成后再发送ack

#### 消息队列端
- 避免手动确认时的超时设置过短
- 合理配置消息重试策略

### 3. 最佳实践
- **核心业务必须实现幂等**
- **消息ID必须全局唯一**
- **优先使用事务或生产者确认**
- **定期清理消息去重表**
