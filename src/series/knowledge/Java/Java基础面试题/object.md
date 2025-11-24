---
title: Object类
order: 9
---
# object

## ⭐Object类有什么方法？

Object类是所有Java类的根类，所有类都直接或间接继承自Object。Object类提供了以下核心方法：

### 基础方法
| 方法签名 | 功能描述 | 注意事项 |
|----------|----------|----------|
| `toString()` | 返回对象的字符串表示 | 默认返回"类名@哈希码"，建议重写 |
| `equals(Object obj)` | 比较两个对象是否相等 | 默认比较内存地址，建议重写 |
| `hashCode()` | 返回对象的哈希码值 | 与equals()重写需遵循一致性约定 |
| `getClass()` | 返回对象的运行时类信息 | 返回Class对象，不可重写 |
| `clone()` | 创建并返回对象的副本 | 需实现Cloneable接口，默认返回浅拷贝 |

### 线程同步方法
| 方法签名 | 功能描述 | 使用场景 |
|----------|----------|----------|
| `notify()` | 唤醒一个等待该对象锁的线程 | 多线程协作，随机唤醒一个 |
| `notifyAll()` | 唤醒所有等待该对象锁的线程 | 多线程协作，唤醒所有等待线程 |
| `wait()` | 让当前线程等待该对象锁 | 与synchronized配合使用 |
| `wait(long timeout)` | 让当前线程等待指定毫秒数 | 避免无限等待，设置超时时间 |
| `wait(long timeout, int nanos)` | 让当前线程等待更精确时间 | 纳秒级精度，时间单位：毫秒+纳秒 |

### 垃圾回收方法
| 方法签名 | 功能描述 | 状态 |
|----------|----------|------|
| `finalize()` | 垃圾回收前调用此方法 | 已废弃，不推荐使用 |


## == 与 equals 有什么区别？

| 对比维度 | == | equals() |
|----------|----|----------|
| **作用对象** | 基本类型：比较值<br>引用类型：比较内存地址 | 仅用于引用类型，默认比较内存地址，重写后可比较内容 |
| **本质** | 数值比较 | 逻辑比较，可自定义规则 |
| **可重写性** | 不可重写（运算符） | 可重写（Object类方法） |

 {#自定义对象比较}

**1. 字符串比较**
```java
//String类默认重写equals()，比较内容。
String s1 = "abc";              // 字符串常量池中的对象
String s2 = new String("abc");  // 堆中新创建的对象
System.out.println(s1 == s2);    // false（比较内存地址，两者地址不同）
System.out.println(s1.equals(s2)); // true（String类已重写equals()，比较内容）
```

**2. 自定义对象比较** 
```java
class Person {
    private String id;
    
    @Override
    public boolean equals(Object o) {
        return o instanceof Person && Objects.equals(id, ((Person) o).id);
    }
    
    // 重写equals()时必须重写hashCode()
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

Person p1 = new Person("123");
Person p2 = new Person("123");
System.out.println(p1 == p2);    // false（地址不同）
System.out.println(p1.equals(p2)); // true（id相同）
```

> **关键点**：String类已重写equals()比较内容，自定义类需重写equals()才能比较内容而非地址。**重写equals()时必须同时重写hashCode()**，否则会导致HashMap、HashSet等集合类无法正常工作。

## hashcode和equals方法有什么关系？

在Java中，`hashCode()`和`equals()`方法紧密关联，需遵循**两大约定**，以保证哈希表（如`HashMap`、`HashSet`）等数据结构正常工作：

### 1. 核心约定

> **equals()相等 ⇒ hashCode()必须相等**

| 约定类型 | 描述 | 代码示例 |
|----------|------|----------|
| **一致性** | 若两个对象通过`equals()`比较为`true`，则它们的`hashCode()`返回值**必须相同** | `obj1.equals(obj2) == true` ⇒ `obj1.hashCode() == obj2.hashCode()` |
| **非一致性** | 若两个对象的`hashCode()`返回值相同，它们通过`equals()`比较**不一定为`true`** | `obj1.hashCode() == obj2.hashCode()` ⇏ `obj1.equals(obj2) == true` |

### 2. 为什么重写equals()必须重写hashCode()？

> **核心原因：违反约定会导致哈希表异常**

若仅重写`equals()`而不重写`hashCode()`，会违反"一致性"约定，导致哈希表异常：

- **示例场景**：如上文[自定义对象比较](#自定义对象比较)中的`Person`类
  - 若只重写`equals()`（id相同则相等）而不重写`hashCode()`
  - 两个id相同的`Person`对象通过`equals()`为`true`
  - 但`hashCode()`返回值不同（**继承自Object的`hashCode()`返回对象地址**）

- **问题后果**：
  - 将这两个对象存入`HashSet`时，因`hashCode()`不同，会被视为两个不同对象
  - 违反`HashSet`"不存储重复元素"的规则
  - 导致`contains()`、`remove()`等方法行为异常

## 一般覆盖 equals 之后， hashcode 方法是不是也要覆盖？
> **答案：是**

- 因为`hashCode()`默认实现返回对象的内存地址
- 重写`equals()`后，相等判断不再基于内存地址，而是基于对象内容
- 若只重写`equals()`而不重写`hashCode()`，会导致两个内容相等的对象：
  - `equals()`返回`true`（内容相同）
  - `hashCode()`返回不同值（地址不同）
- 这种不一致会破坏哈希表（如HashMap、HashSet）的正常工作，导致数据存储和检索异常

