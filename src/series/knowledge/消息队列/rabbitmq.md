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

