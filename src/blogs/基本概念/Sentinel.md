---
title: Sentinel
date: 2025-10-19
category: 基本概念
---

## 一、什么是 Sentinel

Sentinel（哨兵）是 Redis 官方提供的 **高可用（High Availability）解决方案**，主要用于 **监控主从集群的运行状态**，并在主节点出现故障时自动完成 **故障转移（Failover）**。

简单来说，Sentinel 是 Redis 的“监控者”和“指挥官”，它能够在主节点宕机时自动选出新的主节点，保证 Redis 服务的持续可用。

---

## 二、Sentinel 的核心功能

1. **监控（Monitoring）**
   Sentinel 会不断地检查主节点（master）和从节点（slave）的运行状态，判断节点是否在线。

2. **通知（Notification）**
   一旦检测到节点故障，Sentinel 会通过消息通知系统管理员或其他应用程序。

3. **自动故障转移（Automatic Failover）**
   当主节点被判定为不可用时，Sentinel 会自动将一个从节点提升为新的主节点，并通知其他从节点和客户端进行切换。

4. **配置中心（Configuration Provider）**
   Sentinel 会动态更新主节点信息，客户端可以通过 Sentinel 获取当前主节点的地址，实现自动连接切换。

---

## 三、Sentinel 的工作原理

Sentinel 通过以下机制协同完成高可用：

1. **定期心跳检测**
   每个 Sentinel 节点会定期发送 `PING` 命令给所有主从节点和其他 Sentinel，判断其是否健康。

2. **主观下线（Subjective Down，SDOWN）**
   如果某个 Sentinel 认为主节点在一段时间内无响应，就会标记为“主观下线”。

3. **客观下线（Objective Down，ODOWN）**
   当多个 Sentinel 一致认为主节点确实宕机后，才会将其标记为“客观下线”，以避免误判。

4. **故障转移（Failover）**

    * 由一个 Sentinel 发起“选举”，选出一个从节点作为新的主节点；
    * 其他从节点会自动复制新的主节点数据；
    * Sentinel 更新集群配置，并通知客户端切换。

---

## 四、Sentinel 集群架构

一个完整的 Sentinel 架构通常包含以下角色：

* **1 个主节点（Master）**：负责写操作；
* **多个从节点（Slave）**：负责数据复制与读操作；
* **多个 Sentinel 节点**：协同监控主从状态。

客户端连接时，不直接指定主节点地址，而是先连接 Sentinel，通过它动态获取当前主节点位置。

---

## 五、Sentinel 的高可用特性

1. **自动主从切换**：主节点宕机后，无需人工干预即可完成故障转移。
2. **多 Sentinel 决策机制**：通过投票机制避免单点误判。
3. **与 Redis 主从复制天然集成**：无需额外插件或代理。
4. **客户端自动感知主节点变化**：提升系统的可靠性与可维护性。

---

## 六、Sentinel 的典型配置

示例配置文件 `sentinel.conf`：

```bash
port 26379
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 10000
sentinel parallel-syncs mymaster 1
```

说明：

* `mymaster`：主节点名称。
* `2`：至少 2 个 Sentinel 同意后，才确认主节点下线。
* `down-after-milliseconds`：节点无响应超过 5 秒即认为下线。
* `failover-timeout`：故障转移超时时间。

---

## 七、Sentinel 的常见使用场景

1. **Redis 高可用部署**：在主从架构基础上提供自动容错能力。
2. **生产级缓存集群**：确保主节点宕机后系统仍能自动恢复。
3. **读写分离架构**：Sentinel 与主从结合，实现自动主写、从读。

---

## 八、Sentinel 与集群模式的区别

| 对比项   | Sentinel 模式    | Redis Cluster 模式 |
| ----- | -------------- | ---------------- |
| 数据分布  | 全量复制（主从）       | 分片（Hash Slot）    |
| 高可用   | ✅ 自动主从切换       | ✅ 自动重分片与故障恢复     |
| 扩展性   | 中等             | 强（水平扩展）          |
| 客户端支持 | 需要 Sentinel 感知 | 客户端直接感知节点变化      |
| 使用场景  | 小中型项目、高可用缓存    | 大数据量、高并发分布式系统    |

---

## 九、总结

Redis Sentinel 是一种轻量级、高可用的 Redis 集群监控与故障转移机制：

* 它能够自动检测主从状态，完成主节点选举与切换；
* 保证 Redis 服务在主节点宕机时依然可用；
* 适合中小规模、高可靠性的 Redis 部署方案。

在实际生产中，Sentinel 模式常用于 **读写分离、高可用缓存系统、微服务配置中心** 等场景，是 Redis 高可用架构的核心组件之一。
