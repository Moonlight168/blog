---
title: RabbitMQ
date: 2025-05-21
icon: /assets/icon/rabbitmq.png
order: 1
---

## RabbitMQ 中有哪些常见的交换器（Exchange）类型，它们有什么区别？

**回答:** 常见的交换器类型有 Direct、Fanout、Topic 和 Headers。

- **Direct** ：消息会被发送到 Binding Key 和 Routing Key 完全匹配的队列。适用于需要精确匹配的场景，比如根据日志级别将日志消息发送到不同队列。
- **Fanout**：消息会被发送到所有绑定到该交换器的队列，忽略 Binding Key。常用于广播消息的场景，比如群发通知。
- **Topic**：消息会根据 Routing Key 和 Binding Key 的模式匹配规则发送到队列。Binding Key 可以使用通配符，比如 *.log 表示匹配所有以 .log 结尾的 Routing Key，适用于需要按规则分发消息的场景。
- **Headers**：不依赖于 Routing Key 与 Binding Key 的匹配规则，而是根据发送的消息内容中的 headers 属性进行匹配。在实际应用中较少使用。

### RabbitMQ是什么，在系统架构中有什么作用？
### RabbitMQ有哪些核心组件，它们分别起什么作用？
### 简述RabbitMQ的工作流程。
### RabbitMQ中有哪些常见的交换器类型，各自适用什么场景？
### 如何确保RabbitMQ消息的可靠性，防止消息丢失？
### RabbitMQ的消息确认机制有哪些，它们是如何工作的？
### 什么是RabbitMQ的持久化，如何实现消息、队列和交换器的持久化？
### 在RabbitMQ中，如何处理消息的顺序性问题？
### RabbitMQ集群模式有哪些，它们各自的特点是什么？
### 如何监控和管理RabbitMQ服务器的性能和状态？
### RabbitMQ如何与Spring Boot集成，集成过程中有哪些关键步骤？ 

### RabbitMQ 的性能优化手段有哪些，分别从网络、存储、配置等方面阐述？
### RabbitMQ 中如何避免队列消息堆积，若出现堆积应如何排查和解决？
### 简述 RabbitMQ 的鉴权机制，如何进行用户认证和权限管理？
### 在高并发场景下，RabbitMQ 的性能瓶颈可能出现在哪些方面，如何应对？
### RabbitMQ 的消息 TTL（Time - To - Live）有几种设置方式，分别在什么场景下使用？
### 死信队列（Dead Letter Queue）在 RabbitMQ 中是如何工作的，有哪些应用场景？
### RabbitMQ 与其他消息队列（如 Kafka、RocketMQ）相比，有哪些优势和劣势？
### 如何在 RabbitMQ 中实现延迟队列，有哪些方法和注意事项？
### RabbitMQ 的事务机制和发送方确认机制有什么区别，各自的使用场景是什么？
### 当 RabbitMQ 集群中的某个节点出现故障时，整个集群的可用性如何保障，数据会丢失吗？
### 如何在 RabbitMQ 中进行消息的优先级处理，实现原理是什么？
### RabbitMQ 的拓扑结构设计对系统的扩展性和可靠性有什么影响，如何设计合理的拓扑结构？