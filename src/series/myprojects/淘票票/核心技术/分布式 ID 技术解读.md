---
title: "分布式 ID 技术解读"
order: 4
---

# 分布式 ID 技术解读

## 1. 技术概述

在分布式系统中，唯一ID的生成是一个基础但关键的需求。淘票票项目采用多种策略实现高并发、高可用的分布式ID生成方案，满足订单号、用户ID、交易流水号等场景的唯一性要求。

## 2. ID生成需求

- **唯一性**：在分布式环境下全局唯一，不重复
- **高性能**：高并发场景下生成速度快，延迟低
- **高可用**：服务可用性高，不成为系统瓶颈
- **趋势递增**：ID最好是趋势递增的，有利于数据库索引
- **可扩展性**：支持水平扩展，适应业务增长
- **可读性**：部分场景下需要ID具有一定的可读性（如包含时间戳）

## 3. 实现方案

### 3.1 雪花算法（Snowflake）

**原理**：生成64位Long类型ID，结构如下：
- 1位符号位：固定为0
- 41位时间戳：从某个固定时间点开始的毫秒数
- 10位工作机器ID：5位数据中心ID + 5位机器ID
- 12位序列号：同一毫秒内的计数器，最多支持4096个ID

**优点**：
- 本地生成，无网络开销，性能高
- 生成的ID趋势递增，有利于数据库索引
- 支持水平扩展，通过调整机器ID实现

**缺点**：
- 强依赖机器时钟，如果时钟回拨可能导致ID重复
- 需要妥善管理机器ID，避免冲突

### 3.2 数据库自增ID

**原理**：使用数据库的自增序列生成ID，通过多库多表策略分散压力。

**优点**：
- 实现简单，依赖数据库自身特性
- ID绝对递增，顺序性好

**缺点**：
- 依赖数据库，性能瓶颈明显
- 单点故障风险，需要高可用部署

### 3.3 Redis生成ID

**原理**：利用Redis的INCR/INCRBY命令实现原子递增。

**优点**：
- 性能优于数据库，支持高并发
- 可以通过Lua脚本实现复杂的ID生成逻辑

**缺点**：
- 依赖Redis服务，需要考虑高可用
- Redis重启可能导致ID不连续

### 3.4 美团Leaf算法

**原理**：结合数据库号段模式和雪花算法的优点，提供双模式支持。
- **号段模式**：从数据库批量获取号段，本地缓存使用，减少数据库压力
- **雪花模式**：基于雪花算法的分布式ID生成

**优点**：
- 性能优秀，支持高并发
- 支持多模式，适应不同场景
- 提供运维界面，方便监控和管理

## 4. 淘票票实践方案

### 4.1 订单号生成策略

采用**雪花算法**作为基础，结合业务特性进行定制：

```java
public class OrderIdGenerator {
    
    private static final long START_TIME_STAMP = 1609459200000L; // 2021-01-01 00:00:00
    private static final long DATA_CENTER_ID_BITS = 5L;
    private static final long WORKER_ID_BITS = 5L;
    private static final long SEQUENCE_BITS = 12L;
    
    private static final long MAX_DATA_CENTER_ID = ~(-1L << DATA_CENTER_ID_BITS);
    private static final long MAX_WORKER_ID = ~(-1L << WORKER_ID_BITS);
    
    private static final long WORKER_ID_SHIFT = SEQUENCE_BITS;
    private static final long DATA_CENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;
    private static final long TIME_STAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATA_CENTER_ID_BITS;
    
    private static final long SEQUENCE_MASK = ~(-1L << SEQUENCE_BITS);
    
    private final long dataCenterId;
    private final long workerId;
    private long sequence = 0L;
    private long lastTimeStamp = -1L;
    
    // 构造函数和初始化逻辑
    
    public synchronized long nextId() {
        long currentTimeStamp = getCurrentTimeStamp();
        
        // 处理时钟回拨
        if (currentTimeStamp < lastTimeStamp) {
            throw new RuntimeException("时钟回拨异常");
        }
        
        // 同一毫秒内，序列号递增
        if (currentTimeStamp == lastTimeStamp) {
            sequence = (sequence + 1) & SEQUENCE_MASK;
            // 序列号溢出，等待下一毫秒
            if (sequence == 0) {
                currentTimeStamp = getNextTimeStamp(lastTimeStamp);
            }
        } else {
            sequence = 0L;
        }
        
        lastTimeStamp = currentTimeStamp;
        
        // 组合ID：时间戳 + 数据中心ID + 机器ID + 序列号
        return ((currentTimeStamp - START_TIME_STAMP) << TIME_STAMP_SHIFT)
                | (dataCenterId << DATA_CENTER_ID_SHIFT)
                | (workerId << WORKER_ID_SHIFT)
                | sequence;
    }
    
    private long getCurrentTimeStamp() {
        return System.currentTimeMillis();
    }
    
    private long getNextTimeStamp(long lastTimeStamp) {
        long timeStamp = getCurrentTimeStamp();
        while (timeStamp <= lastTimeStamp) {
            timeStamp = getCurrentTimeStamp();
        }
        return timeStamp;
    }
}
```

### 4.2 用户ID生成策略

采用**Redis INCR**结合**用户特征**生成：

```java
public class UserIdGenerator {
    
    @Autowired
    private RedisTemplate<String, Long> redisTemplate;
    
    public long generateUserId(String phoneNumber) {
        // 使用Redis生成递增序列
        String key = "user_id:seq";
        long seq = redisTemplate.opsForValue().increment(key);
        
        // 生成用户ID = 前缀 + 递增序列
        long prefix = 1000000000L; // 10亿前缀
        return prefix + seq;
    }
}
```

## 5. 优化策略

### 5.1 时钟回拨处理

- **检测与等待**：检测到时钟回拨时，等待一段时间再生成ID
- **时间戳缓存**：缓存上一次生成的时间戳，避免重复
- **服务降级**：极端情况下，切换到备用ID生成策略

### 5.2 高可用保障

- **多实例部署**：ID生成服务多实例部署，避免单点故障
- **本地缓存**：预生成并缓存一定数量的ID，提高性能并应对短暂故障
- **监控告警**：监控ID生成服务的性能和错误率，及时发现问题

## 6. 最佳实践

- **选择合适的算法**：根据业务场景选择最适合的ID生成算法
- **合理设置机器ID**：在集群部署时，确保机器ID的唯一性
- **避免过长ID**：尽量控制ID长度，减少存储和传输开销
- **考虑可读性**：在部分场景下，可在ID中嵌入业务信息，提高可读性
- **做好压力测试**：在上线前进行充分的压力测试，确保高并发下的稳定性