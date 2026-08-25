---
title: Object类
order: 9
---

## Object 类有哪些方法？

**锚点**：`基础四件套：toString/equals/hashCode/getClass + clone + wait/notify`

**基础方法**：

| 方法 | 功能 |
|------|------|
| `toString()` | 对象字符串表示，默认"类名@哈希码"，建议重写 |
| `equals(Object)` | 比较相等，默认比较地址，建议重写 |
| `hashCode()` | 哈希码，与 equals 需一致性约定 |
| `getClass()` | 返回运行时类信息，不可重写 |
| `clone()` | 创建副本，需实现 Cloneable，默认浅拷贝 |

**线程同步**：`wait()` / `wait(timeout)` 等待；`notify()` / `notifyAll()` 唤醒。

**垃圾回收**：`finalize()` 已废弃。

## == 与 equals 有什么区别？

**锚点**：`== 基本类型比值、引用类型比地址；equals 默认比地址、重写后比内容`

| 对比 | == | equals() |
|------|----|----------|
| 基本类型 | 比较值 | 不适用 |
| 引用类型 | 比较内存地址 | 默认比地址，重写后比内容 |
| 可重写性 | 不可（运算符） | 可（Object 方法） |

```java
String s1 = "abc";
String s2 = new String("abc");
s1 == s2;       // false（地址不同）
s1.equals(s2);  // true（String 重写了 equals）
```

**自定义类需同时重写 equals 和 hashCode**。

## 为什么重写 equals 必须重写 hashCode？

**锚点**：`约定：equals 相等 ⇒ hashCode 必须相等，否则哈希表结构异常`

若只重写 equals，内容相同的对象 equals 返回 true，但 hashCode 不同（默认返回地址），导致：

1. 两个"相等"对象被视为不同元素
2. HashSet 的 contains()、remove() 等方法行为错误

## `==` 和 `equals` 区别？Integer 缓存范围是？

**锚点**：`== 比值/地址，equals 重写后比值；Integer 缓存 -128~127，比较一律用 equals`

- `==`：基本类型比值，引用类型比**地址**
- `equals`：默认比地址，String/Integer 等重写后比**值**
- Integer 内部缓存池 **-128 ~ 127**：范围内 `==` 为 true（复用同一对象），范围外每次 new，`==` 为 false
- 所以 Integer 比较**一律用 `equals`**，避免缓存范围的坑

→ [回答历史](/private/series/答题历史/Java/java-答题记录.md#和-equals-区别integer-缓存范围是)
