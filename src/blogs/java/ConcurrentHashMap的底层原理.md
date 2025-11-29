---
title: ConcurrentHashMap 的底层原理
date: 2025-11-27
categories: ["Java"]
---

# ConcurrentHashMap 的底层原理

## 概述
ConcurrentHashMap 是 Java 并发编程中的线程安全哈希表实现，通过分段锁、CAS无锁操作和原子计数机制实现高性能并发访问。

## 1. 核心数据结构

### 1.1 JDK 8+ 版本（当前主流）

```
┌─────────────────────────────────────────────────────────┐
│                   ConcurrentHashMap                      │
│  ┌─────────────┬─────────────┬─────────────┬──────────┐ │
│  │ Node[] table│    链表     │   红黑树    │ 计数统计  │ │
│  │   (桶数组)  │  (链表头节点)│ (树化阈值8) │ (baseCount│ │
│  │             │             │             │ +counter)│ │
│  └─────────────┴─────────────┴─────────────┴──────────┘ │
└─────────────────────────────────────────────────────────┘
```

**主要组成：**
- **Node[] table**：主数组，每个元素是一个桶位
- **链表结构**：解决哈希冲突
- **红黑树结构**：链表长度>8时转换为红黑树
- **原子计数**：baseCount + counterCells

#### 1.2 JDK 7 版本（了解历史）

```
┌─────────────────────────────────────────┐
│        ConcurrentHashMap (JDK 7)         │
│  ┌─────────────────────────────────────┐ │
│  │          Segment[] 数组              │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐        │ │
│  │  │Seg[0]│ │Seg[1]│ │Seg[n]│        │ │
│  │  │ 锁   │ │ 锁   │ │ 锁   │        │ │
│  │  └──────┘ └──────┘ └──────┘        │ │
│  └─────────────────────────────────────┘ │
│  每个Segment包含：HashEntry[] + 锁机制    │
└─────────────────────────────────────────┘
```

**Segment数组详解：**
Segment数组是JDK 7中ConcurrentHashMap的核心并发控制结构，将整个哈希表分割成多个独立的段（Segment）。每个Segment本质上是一个小的哈希表，包含自己的HashEntry数组和独立的ReentrantLock锁。

**设计优势：**
- **分段锁机制**：16个Segment默认支持16个线程并发写入
- **降低锁竞争**：不同Segment的操作互不影响
- **独立扩容**：每个Segment可以独立进行扩容操作
- **锁粒度细化**：从锁住整个表优化为锁住单个Segment

**工作原理：**
- 通过高位哈希确定Segment索引，低位哈希确定桶索引
- 每个Segment维护独立的HashEntry数组和锁
- 读操作无需加锁，通过volatile保证可见性
- 写操作只锁定对应的Segment，不影响其他Segment

## 2. 并发控制机制

### 2.1 分段锁机制（Segment）(JDK 7)

```java
// JDK 7 的分段锁实现
static class Segment<K,V> extends ReentrantLock {
    transient volatile HashEntry<K,V>[] table;
    // 每个Segment独立加锁，支持并发访问不同Segment
}
```

**工作原理：**
- 默认16个Segment，每个独立加锁
- 不同Segment可并发读写

### 2.2 CAS与synchronized协同机制（JDK 8+）

```java
// JDK 8 的并发控制完整实现（简化示例）
final V putVal(K key, V value, boolean onlyIfAbsent) {
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());
    Node<K,V>[] tab; Node<K,V> f; int n, i;
    
    // 第一步：初始化表
    if ((tab = table) == null || (n = tab.length) == 0)
        tab = initTable();
    
    // 第二步：CAS无锁尝试插入（桶位为空时）
    else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
        // 使用CAS原子操作设置新节点，无锁并发
        if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value)))
            break;  // 成功则退出
    }
    
    // 第三步：桶级锁同步插入（桶位非空或CAS失败时）
    else {
        // 当CAS失败或桶位已有节点时，使用synchronized锁
        synchronized (f) {
            if (tabAt(tab, i) == f) {
                // 只锁定具体桶位，粒度更细
                if (f.hash == hash && 
                    (f.key == key || (key != null && key.equals(f.key)))) {
                    // 处理节点更新
                }
                // 处理链表或红黑树插入...
            }
        }
    }
}
```

**核心优势：**
- **CAS无锁操作**：桶位为空时使用，高并发无阻塞
- **桶级锁机制**：桶位非空时使用，只锁定具体桶位
- **无缝切换**：根据情况自动选择最优策略
- **性能优化**：最大程度减少锁竞争

## 3. 扩容机制

### 3.1 扩容触发条件

ConcurrentHashMap使用sizeCtl同时控制扩容阈值和扩容状态，触发扩容的条件如下：

1. **容量达到sizeCtl阈值**：
   - sizeCtl = 当前容量 × 0.75（负载因子）
   - 当元素数量超过sizeCtl时触发tryPresize()方法
   - put操作通过CAS方式增加baseCount，并与sizeCtl比较

2. **链表长度过长时的树化或扩容决策**：
   ```java
   // JDK 8 实际逻辑
   if (binCount >= TREEIFY_THRESHOLD) {  // 链表长度 ≥ 8
       if (tab.length < MIN_TREEIFY_CAPACITY) {  // 数组长度 < 64
           tryPresize(tab.length << 1);  // 优先扩容
       } else {
           treeifyBin(tab, hash);  // 树化
       }
   }
   ```
   - 链表长度 ≥ 8 且数组长度 < 64：优先扩容
   - 链表长度 ≥ 8 且数组长度 ≥ 64：链表树化

**扩容触发的操作场景**：
- **put操作**：包括putVal、putIfAbsent等所有插入操作
- **remove操作**：删除操作过程中可能触发扩容
- **get操作**：**不会触发扩容**，只进行查询操作

这种设计确保了读操作的高性能，避免了查询操作因扩容而阻塞，体现了ConcurrentHashMap读写分离的设计思想。

### 3.2 渐进式扩容过程

ConcurrentHashMap采用多线程协作的渐进式扩容，避免全局阻塞：

**扩容流程图：**

```
┌─────────────────────────────────────────────────────────────┐
│                    ConcurrentHashMap扩容流程                   │
└─────────────────────────────────────────────────────────────┘

1. 扩容触发
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  容量超过sizeCtl │    │ 链表长度≥8且     │    │   put/remove     │
│   (容量×0.75)   │───▶│  数组长度<64    │───▶│    操作触发      │
└─────────────────┘    └─────────────────┘    └─────────────────┘

2. 初始化新表
┌─────────────────────────────────────────────────────────────┐
│  创建新表(容量翻倍) → 设置transferIndex=n → 多线程可参与      │
└─────────────────────────────────────────────────────────────┘

3. 多线程任务分配
┌─────────────────────────────────────────────────────────────┐
│  transferIndex从后向前分配任务，每个线程处理stride个桶        │
│                                                             │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐          │
│  │ 15  │ 14  │ 13  │ 12  │ 11  │ 10  │  9  │  8  │  ← 线程A │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤          │
│  │  7  │  6  │  5  │  4  │  3  │  2  │  1  │  0  │  ← 线程B │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘          │
│    ↑                                                  ↑       │
│  transferIndex=n                                    transferIndex=0 │
└─────────────────────────────────────────────────────────────┘

4. 桶处理流程
┌─────────────────┐
│  获取桶i         │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
┌───▼───┐   ┌───▼──────────────────┐
│桶为空? │   │桶不为空且hash=MOVED?  │
└───┬───┘   └─────────┬────────────┘
    │                 │
  是 │               否 │
    │                 │
┌───▼───┐         ┌───▼──────────────────┐
│CAS标记│         │synchronized锁住桶头节点│
│为已迁移│         └─────────┬────────────┘
└───┬───┘                   │
    │                 ┌─────┴─────┐
    │                 │           │
    │           ┌─────▼───┐ ┌─────▼───┐
    │           │普通链表? │ │红黑树节点?│
    │           └─────┬───┘ └─────┬───┘
    │                 │           │
    │               是           是
    │                 │           │
    │           ┌─────▼───┐ ┌─────▼───┐
    │           │链表拆分  │ │红黑树拆分│
    │           │迁移处理  │ │迁移处理  │
    │           └─────┬───┘ └─────┬───┘
    │                 │           │
    │                 └─────┬─────┘
    │                       │
    │                 ┌─────▼───┐
    │                 │设置标记  │
    │                 │Forwarding│
    │                 │Node     │
    │                 └─────┬───┘
    │                       │
    └───────────────────────┘

5. 链表拆分迁移
┌─────────────────────────────────────────────────────────────┐
│  原链表: [A]→[B]→[C]→[D]→[E]                                │
│                                                             │
│  按hash & n结果拆分:                                         │
│  - hash & n = 0 → 低位链表(位置不变)                         │
│  - hash & n = 1 → 高位链表(位置+n)                          │
│                                                             │
│  低位链表: [A]→[C]→[E]     高位链表: [B]→[D]                │
│     ↓                        ↓                             │
│  新表位置i                新表位置i+n                         │
└─────────────────────────────────────────────────────────────┘

6. 扩容完成
┌─────────────────────────────────────────────────────────────┐
│  table = nextTab                                            │
│  sizeCtl = newCap - (newCap >>> 2)  // newCap * 0.75        │
└─────────────────────────────────────────────────────────────┘
```

**扩容核心特点：**

- **sizeCtl控制**：既作为扩容阈值(容量×0.75)，又控制扩容状态
- **反向任务分配**：通过transferIndex从后向前分配迁移任务，避免冲突
- **ForwardingNode标记**：标记已迁移桶，其他线程遇到直接跳过
- **链表拆分迁移**：按(hash & n)结果拆分为低位链表和高位链表
- **尾插法保证顺序**：使用尾插法构建新链表，保持节点顺序稳定
- **多线程协作**：多个线程通过CAS竞争迁移任务，并行完成扩容

## 4. 性能优化策略

### 4.1 并发控制对比

| 特性     | JDK 7 分段锁     | JDK 8+ CAS+Synchronized |
|--------|----------------|----------------------|
| 锁粒度   | Segment级别     | 桶级别                |
| 并发度   | 16个            | 更高                  |
| 内存开销 | Segment数组     | 更少                  |

### 4.2 与其他Map对比

| 维度     | HashMap    | Hashtable   | ConcurrentHashMap |
|--------|----------|-----------|------------------|
| 线程安全  | 不安全     | 全局锁       | 细粒度锁+CAS        |
| 性能     | 最高       | 最低        | 高                |
| null支持 | 允许       | 不允许       | 不允许              |
| 推荐场景 | 单线程     | 不推荐       | 多线程并发           |

## 5. 核心方法与代码示例

### 5.1 putIfAbsent 方法
```java
ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
String result = map.putIfAbsent("key", "value");
```

### 5.2 compute 方法
```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.compute("userCount", (key, oldValue) ->
    oldValue == null ? 1 : oldValue + 1);
```

### 5.3 merge 方法
```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.merge("totalScore", 100, (oldValue, newValue) -> oldValue + newValue);
```

## 6. 典型应用场景

### 6.1 库存管理
```java
ConcurrentHashMap<String, Integer> inventory = new ConcurrentHashMap<>();

// 扣减库存
inventory.compute(productId, (id, stock) -> 
    stock != null && stock >= quantity ? stock - quantity : stock);

// 添加库存
inventory.merge(productId, quantity, Integer::sum);
```

### 6.2 缓存系统
```java
ConcurrentHashMap<String, Object> cache = new ConcurrentHashMap<>();

// 缓存查询
cache.computeIfAbsent(key, k -> supplier.get());
```

### 6.3 计数器
```java
ConcurrentHashMap<String, Long> counters = new ConcurrentHashMap<>();

// 原子递增
counters.merge(counterName, 1L, Long::sum);
```

## 底层原理核心总结

ConcurrentHashMap通过**三重优化**实现了高性能线程安全：

1. **数据结构优化**
   - JDK 7：分段锁(Segment)实现多段并发
   - JDK 8+：CAS+Synchronized桶级锁，降低锁粒度
   - 链表/红黑树混合结构，平衡查询与插入效率

2. **并发控制优化**
   - 读写分离：无锁读 + 细粒度写锁
   - 渐进式扩容：多线程协作，避免全局阻塞
   - 原子计数：baseCount+counterCells分散竞争

3. **性能优化**
   - 空桶CAS操作：减少锁竞争
   - ForwardingNode标记：安全扩容
   - 哈希优化：扰动函数减少冲突

**核心优势**：相比Hashtable性能提升数十倍，同时保持线程安全，适用于高并发读写场景。