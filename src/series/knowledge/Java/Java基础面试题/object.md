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
| 作用对象 | 基本数据类型：比较值是否相等；<br>引用数据类型：比较内存地址（对象是否为同一实例） | 仅用于引用数据类型，默认比较内存地址（继承自Object），重写后可比较内容（如String） |
| 本质 | 数值比较（基本类型比较值，引用类型比较地址值） | 逻辑比较，可自定义比较规则（通过重写） |
| 可重写性 | 不可重写（运算符，非方法） | 可重写（Object类的方法，子类可自定义实现） |

### 具体场景示例
1. **字符串比较**：
   - `==`：比较两个字符串对象的内存地址（是否为同一对象）。
   - `equals()`：String类重写了`equals()`，比较字符串内容是否相同。
     ```java
     String s1 = "abc";
     String s2 = new String("abc");
     System.out.println(s1 == s2); // false（地址不同）
     System.out.println(s1.equals(s2)); // true（内容相同）
     ```
2. **非字符串引用类型比较**：
   - 若未重写`equals()`，`==`与`equals()`效果一致，均比较内存地址。
   - 若重写`equals()`（如自定义实体类），`equals()`按重写逻辑比较（如比较属性值）。
     ```java
     class Person {
         private String id;
         // 重写equals()：id相同则认为对象相等
         @Override
         public boolean equals(Object o) {
             if (this == o) return true;
             if (o == null || getClass() != o.getClass()) return false;
             Person person = (Person) o;
             return Objects.equals(id, person.id);
         }
     }

     Person p1 = new Person("123");
     Person p2 = new Person("123");
     System.out.println(p1 == p2); // false（地址不同）
     System.out.println(p1.equals(p2)); // true（id相同）
     ```

## hashcode和equals方法有什么关系？
在Java中，`hashCode()`和`equals()`方法紧密关联，需遵循**两大约定**，以保证哈希表（如`HashMap`、`HashSet`）等数据结构正常工作：

### 1. 核心约定
- **一致性**：若两个对象通过`equals()`比较为`true`，则它们的`hashCode()`返回值**必须相同**。
   - 示例：若`obj1.equals(obj2) = true`，则`obj1.hashCode() == obj2.hashCode()`必须成立。
- **非一致性**：若两个对象的`hashCode()`返回值相同，它们通过`equals()`比较**不一定为`true`**（这种情况称为"哈希冲突"）。
   - 示例：若`obj1.hashCode() == obj2.hashCode()`，`obj1.equals(obj2)`可能为`false`。

### 2. 为什么重写equals()必须重写hashCode()？
若仅重写`equals()`而不重写`hashCode()`，会违反"一致性"约定，导致哈希表异常：
- 示例：自定义`Person`类，重写`equals()`（id相同则相等），但未重写`hashCode()`。此时，两个id相同的`Person`对象通过`equals()`为`true`，但`hashCode()`返回值可能不同（继承自Object的`hashCode()`返回对象地址）。
- 问题：将这两个对象存入`HashSet`时，因`hashCode()`不同，会被视为两个不同对象，存入不同位置，违反`HashSet`"不存储重复元素"的规则。

### 3. 总结
- 重写`equals()`时，**必须同步重写`hashCode()`**，确保"相等的对象有相同的哈希码"。
- 重写`hashCode()`时，需保证"相同哈希码的对象不一定相等"（允许哈希冲突，哈希表会通过`equals()`进一步判断）。