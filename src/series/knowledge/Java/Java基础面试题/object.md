---
title: Object类
order: 9
---

## Object 类有哪些方法？

**基础方法：**

| 方法 | 功能 |
|------|------|
| `toString()` | 返回对象字符串表示，默认"类名@哈希码"，建议重写 |
| `equals(Object obj)` | 比较对象相等，默认比较地址，建议重写 |
| `hashCode()` | 返回哈希码，与 equals 需遵循一致性约定 |
| `getClass()` | 返回运行时类信息，不可重写 |
| `clone()` | 创建对象副本，需实现 Cloneable，默认浅拷贝 |

**线程同步方法：**

| 方法 | 功能 |
|------|------|
| `wait()` / `wait(timeout)` | 让当前线程等待 |
| `notify()` / `notifyAll()` | 唤醒等待线程 |

**垃圾回收：** `finalize()` 已废弃，不推荐使用。

## == 与 equals 有什么区别？

| 对比维度 | == | equals() |
|----------|----|----------|
| 基本类型 | 比较值 | 不适用 |
| 引用类型 | 比较内存地址 | 默认比较地址，重写后可比较内容 |
| 可重写性 | 不可（运算符） | 可（Object方法） |

**String 示例：**
```java
String s1 = "abc";
String s2 = new String("abc");
s1 == s2;       // false（地址不同）
s1.equals(s2);  // true（String重写了equals，比较内容）
```

**自定义类需重写 equals 和 hashCode：**
```java
class Person {
    private String id;
    @Override
    public boolean equals(Object o) {
        return o instanceof Person && Objects.equals(id, ((Person) o).id);
    }
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

## 为什么重写 equals 必须重写 hashCode？

**约定：equals 相等 ⇒ hashCode 必须相等**

若只重写 equals，两个内容相同的对象 equals 返回 true，但 hashCode 不同（默认返回地址）。这会导致 HashSet、HashMap 等哈希表结构异常：
1. 两个"相等"对象被视为不同元素
2. contains()、remove() 等方法行为错误

## `==` 和 `equals` 区别？Integer 缓存范围是？

- `==`：基本类型比值，引用类型比**地址**
- `equals`：默认比地址，String/Integer 等重写后比**值**
- Integer 有内部缓存池 **-128 ~ 127**，范围内 `==` 为 true（复用同一对象），范围外每次 new 新对象，`==` 为 false
- 所以 Integer 比较**一律用 `equals`**，避免缓存范围的坑

→ [回答历史](/private/series/答题历史/Java/java-答题记录.md#和-equals-区别integer-缓存范围是)