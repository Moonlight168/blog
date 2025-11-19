---
title: Java 版本特性
order: 11
---

各个版本详细说明： [Java版本演进与特性对比](blogs/java/Java版本演进与特性对比.md)

## ⭐Java 8 你知道有什么新特性？
下面是 Java 8 主要新特性的整理表格，包含关键改进和示例说明：
|特性名称|描述|示例或说明|
|----|----|----|
|Lambda 表达式|简化匿名内部类，支持函数式编程|`(a, b) -> a + b` 代替匿名类实现接口|
|函数式接口|仅含一个抽象方法的接口，可用`@FunctionalInterface`注解标记|`Runnable`, `Comparator`, 或自定义接口 `@FunctionalInterface interface MyFunc { void run(); }`|
|Stream API|提供链式操作处理集合数据，支持并行处理|`list.stream().filter(x -> x > 0).collect(Collectors.toList())`|
|Optional 类|封装可能为`null`的对象，减少空指针异常|`Optional.ofNullable(value).orElse("default")`|
|方法引用|简化 Lambda 表达式，直接引用现有方法|`System.out::println` 等价于 `x -> System.out.println(x)`|
|接口的默认方法与静态方法|接口可定义默认实现和静态方法，增强扩展性|`interface A { default void print() { System.out.println("默认方法"); } }`|
|并行数组排序|使用多线程加速数组排序|`Arrays.parallelSort(array)`|
|重复注解|允许同一位置多次使用相同注解|`@Repeatable` 注解配合容器注解使用|
|类型注解|注解可应用于更多位置（如泛型、异常等）|`List<@NonNull String> list`|
|[CompletableFuture](#completablefuture-怎么用的)|增强异步编程能力，支持链式调用和组合操作|`CompletableFuture.supplyAsync(() -> "result").thenAccept(System.out::println)`|

## Lambda 表达式了解吗？

* **Lambda 是一种更简洁的匿名函数写法**，主要用于简化函数式接口（只有一个抽象方法） 的调用方式。
* **核心语法**：

   * `(params) -> expression`：单表达式自动返回
   * `(params) -> { statements; }`：多语句需写 `{}`，需要 `return` 才能返回值
* **用途：让代码更短、更清晰**，尤其在集合处理、回调、异步执行等场景下表现突出。

**传统写法：匿名内部类（冗长）**

```java
Thread t = new Thread(new Runnable() {
    @Override
    public void run() {
        System.out.println("Running...");
    }
});
```

**Lambda 写法：简洁**

```java
Thread t = new Thread(() -> System.out.println("Running..."));
```

* **结合 Stream 使用更强大**，例如过滤偶数：

```java
numbers.stream().filter(n -> n % 2 == 0).toList();
```

* **支持函数式编程，让行为作为参数传递**

```java
operate(3, 5, (x, y) -> x + y);
```

* **缺点：调试困难**，因为 Lambda 是匿名的，异常栈定位不如普通方法明确。

## CompletableFuture 怎么用的？

* **CompletableFuture 是 Java 8 引入的强大异步编排工具**，解决 Future 无法回调、不能链式组合的问题。
* **优势：支持回调、链式调用、并行任务组合，不会产生回调地狱。**

**异步执行**

```java
CompletableFuture.supplyAsync(() -> "result");
```

**链式执行**

```java
cf.thenApply(r -> r + " updated");
```

**组合两个异步任务**

```java
cf1.thenCombine(cf2, (r1, r2) -> r1 + r2);
```

**最终消费**

```java
.thenAccept(System.out::println);
```

* **关键接口**：

   * Future：结果获取
   * CompletionStage：异步任务编排（thenApply / thenCompose / thenCombine）

* **适合多步骤依赖、多任务并行执行、异步处理场景**

## Java 21 新特性知道哪些？

### Switch 模式匹配增强

* **直接在 case 中进行类型匹配，不再需要手动强转**

```java
switch (obj) {
    case String s -> ...
    case Integer i -> ...
}
```

### 数组模式（Array Patterns）

* **支持匹配数组内容**

```java
if (arr instanceof int[] {1, 2, 3}) { ... }
```

### 字符串模板

* **让字符串拼接更直观**

```java
String msg = `Hello ${name}`;
```

### 虚拟线程（Virtual Threads）

* **超轻量线程，可创建百万级线程**
* **适合高并发、高阻塞场景（如 Web 服务）**

```java
Thread.startVirtualThread(() -> work());
```

### Scoped Values（范围值）

* **安全替代 ThreadLocal，避免内存泄漏**
* **让多个线程共享不可变上下文**

```java
ScopedValue.runWhere(USER, "Alice", () -> ... );
```


## 为什么 `Class.newInstance()` 被废弃（deprecated）？

因为它有两个严重问题：

1. **只能调用 public 无参构造器**
   如果类没有 public 的无参构造器，就直接报错，根本无法用。

2. **异常不透明**
   所有构造器异常都被包装成 `InstantiationException` 或 `IllegalAccessException`，无法看到真实错误原因，不利于调试。

因此官方认为它“不安全、不可控、功能不足”，把它废弃掉了。

### 从什么时候开始废弃？

自 **Java 9**（JDK 9）起，`Class.newInstance()` 被标注为 **deprecated**。

推荐使用：

```java
// ✔ 支持任意构造器（包括 private、有参构造）
// ✔ 异常透明，可看到真实错误原因
clazz.getDeclaredConstructor().newInstance();

Constructor<?> c = clazz.getDeclaredConstructor(String.class, int.class);
c.setAccessible(true); // 支持 private 构造器
Object obj = c.newInstance("Tom", 18);

```

下面是 **简洁、易背、无序号、无图标、可读性增强（使用 - 和加粗重点）** 的面试版回答。

---

## Java 常用的版本有哪些？有什么区别？

### Java 8

* **目前企业最广泛使用的版本（事实标准）**
* **引入 Lambda、Stream、Optional、CompletableFuture、新的日期时间 API**
* **性能稳定、生态完善**
* 大量框架（Spring、MyBatis、Kafka）默认基于 Java 8 构建

### Java 11（LTS）

* **长期支持版本（LTS），生产环境常用**
* 性能大幅优化、GC 改进
* HTTP Client 正式版
* 新特性如 **var 局部变量类型推断**
* 移除部分过时模块（如 JavaFX，从 JDK 中分离）

### Java 17（LTS）

* 新时代主流 LTS，是很多新系统默认选择
* **更强性能（JIT 优化、GC 优化）**
* **sealed classes（密封类）**
* **records（不可变数据类）**
* **模式匹配（Pattern Matching）增强**
* 更安全、更节能

→ **是 Java 8 项目升级的首选版本**

### Java 21（LTS）

* 最新 LTS，大厂逐步迁移中
* **虚拟线程 Virtual Threads（革命性并发模型）**
* **字符串模板、模式匹配、记录类全面成熟**
* **ScopedValue 替代 ThreadLocal 更安全**
* 更强性能，GC 和 JIT 全面升级

→ **高并发、微服务架构非常适用**

### 总结对比
* **Java 8 → 企业最常用，Lambda/Stream 奠基现代 Java**
* **Java 11 → 支持周期更长，语法更现代、性能更强**
* **Java 17 → 新主流 LTS，Record / sealed / Pattern Matching**
* **Java 21 → 虚拟线程时代，高性能并发革命**
