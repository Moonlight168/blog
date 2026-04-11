---
title: Java 版本特性
order: 11
---

各个版本详细说明：[Java版本演进与特性对比](blogs/java/Java版本演进与特性对比.md)

## Java 8 有什么新特性？

| 特性名称 | 描述 | 示例 |
|----|----|----|
| Lambda 表达式 | 简化匿名内部类 | `(a, b) -> a + b` |
| 函数式接口 | 仅含一个抽象方法的接口 | `@FunctionalInterface` |
| Stream API | 链式操作处理集合 | `list.stream().filter(x -> x > 0).toList()` |
| Optional 类 | 封装可能为 null 的对象 | `Optional.ofNullable(value).orElse("default")` |
| 方法引用 | 简化 Lambda | `System.out::println` |
| 接口默认方法 | 接口可定义默认实现 | `default void print() { }` |
| CompletableFuture | 异步编程增强 | `CompletableFuture.supplyAsync(() -> "result")` |

## Lambda 表达式了解吗？

**Lambda 是一种更简洁的匿名函数写法**，用于简化函数式接口的调用。

**核心语法：**
1. `(params) -> expression`：单表达式自动返回
2. `(params) -> { statements; }`：多语句需写 `{}`，需要 `return` 返回值

```java
// 传统写法
Thread t = new Thread(new Runnable() {
    @Override
    public void run() { System.out.println("Running..."); }
});

// Lambda 写法
Thread t = new Thread(() -> System.out.println("Running..."));
```

**缺点：** 调试困难，因为 Lambda 是匿名的。

## CompletableFuture 怎么用的？

**CompletableFuture 是 Java 8 的异步编排工具**，支持回调、链式调用、并行任务组合。

```java
// 异步执行
CompletableFuture.supplyAsync(() -> "result");

// 链式执行
cf.thenApply(r -> r + " updated");

// 组合两个异步任务
cf1.thenCombine(cf2, (r1, r2) -> r1 + r2);

// 最终消费
.thenAccept(System.out::println);
```

## Java 21 新特性知道哪些？

1. **Switch 模式匹配增强**：直接在 case 中进行类型匹配
2. **虚拟线程**：超轻量线程，可创建百万级线程
3. **Scoped Values**：安全替代 ThreadLocal，避免内存泄漏
4. **字符串模板**：让字符串拼接更直观

## 为什么 Class.newInstance() 被废弃？

1. **只能调用 public 无参构造器**：没有 public 无参构造器就直接报错
2. **异常不透明**：所有构造器异常被包装，无法看到真实错误

**推荐使用：**
```java
clazz.getDeclaredConstructor().newInstance();  // 支持任意构造器，异常透明
```

## Java 常用版本有哪些区别？

1. **Java 8**：企业最广泛使用，Lambda/Stream/Optional 奠基现代 Java
2. **Java 11（LTS）**：长期支持版，性能优化，HTTP Client 正式版，var 类型推断
3. **Java 17（LTS）**：新主流 LTS，Record / sealed / Pattern Matching，Java 8 升级首选
4. **Java 21（LTS）**：虚拟线程时代，高性能并发革命，适合高并发、微服务架构