---
title: 'Flowable 启动失败问题排查记录：BaseExceptionHandlerAdvice ClassNotFound 及流程引擎未启动'
date: 2025-11-20
categories: ["BUG"]
tags: ["BUG", "Flowable"]   
---


# 🚨 Flowable 启动失败问题排查记录：BaseExceptionHandlerAdvice ClassNotFound 及流程引擎未启动

## 📝 背景

在为项目集成 **Flowable 工作流引擎** 时，使用了：

```xml
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter-process</artifactId>
    <version>6.8.0</version>
</dependency>

<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter-dmn</artifactId>
    <version>6.8.0</version>
</dependency>
```

预期启动后：

* Flowable 自动创建 ACT_* 表
* 控制台出现
  `Flowable ProcessEngine created`

结果却遇到了一连串异常：

* 流程引擎未启动
* 数据库表未创建
* Bean 注入失败
* 启动日志没有任何 Flowable 引擎初始化信息

最终抛出的关键错误如下：

```
Caused by: java.lang.IllegalArgumentException: 
Could not find class [org.flowable.common.rest.exception.BaseExceptionHandlerAdvice]
```

---

# 🔍 问题表现

1. 启动日志中完全没有出现：

```
Flowable ProcessEngine created
Initializing SpringProcessEngineConfiguration
```

2. Flowable 相关 Bean 未被注入，例如：

```
HistoryService not found
```

3. 最终启动失败，报错：

```
ClassNotFoundException: org.flowable.common.rest.exception.BaseExceptionHandlerAdvice
```

整个 FlowableAutoConfiguration 完全没有生效。

---

# 🔎 排查过程

### **① 确认依赖是否被正确引入**

通过 `mvn dependency:tree` 检查依赖树，Flowable 6.8.0 的依赖链均正常。

但令人疑惑的是：

➡ **项目中根本没有 `BaseExceptionHandlerAdvice`**
➡ Flowable 6.8.0 也不会再提供这个类

这意味着 **Spring 扫描到了某个旧版本 Flowable UI 模块的代码**。

---

### **② 查 Spring Boot 条件装配匹配情况**

日志显示：

```
ProcessEngineAutoConfiguration matched
ProcessEngineServicesAutoConfiguration matched
```

表面上看 FlowableAutoConfiguration 已匹配，但实际没有执行。

核心原因是：

> 在 Flowable 扫描之前，Spring 因为 Bean 定义异常而中断，导致 Flowable 引擎从未开始初始化。

---

### **③ 错误指向的类在 Flowable 6.8 已不存在**

翻查官方源码确认：

* `BaseExceptionHandlerAdvice` 仅存在于 **Flowable UI 系列（6.4.x）**
* 从 6.5 开始已经移除该 UI 模块
* 6.8 更是彻底删除相关包

因此，如果 Spring 启动扫描路径中包含旧版 Flowable UI 代码，就会触发该错误。

✓ 再加上 RuoYi Flowable 模块曾引用过旧 UI 实现
✓ 项目存在残留的 Flowable UI 包路径
→ 必然发生冲突。

---

# 🧨 根本原因

> **项目集成的 Flowable 6.8.0 与 RuoYi Flowable 模块中残留的旧 UI 代码发生冲突，旧代码引用了已删除的 `BaseExceptionHandlerAdvice`，导致 Spring Boot 扫描失败，使得 Flowable 核心引擎无法初始化。**

换句话说：

🔴 **不是依赖问题**
🔴 **不是数据源问题**
🟢 **是版本差异导致的 class not found！**
🟢 **Flowable 6.8 已不再兼容旧 UI 模块**

---

# ✅ 最终解决方案（采用的方案）

将分散的多个 starter 替换为统一的官方整合依赖：

```xml
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter</artifactId>
    <version>7.1.0</version>
</dependency>
```

💡 **Flowable 7.x 再次整合了依赖，移除了旧 UI 模块，避免了类的缺失问题。**

改造后：

✔ Flowable 自动创建数据库表
✔ ProcessEngine 成功初始化
✔ 控制台正常打印 Flowable Logs
✔ 所有 Flowable Service（TaskService、HistoryService 等）均成功注入

---

# 🚀 升级后启动日志正常输出示例

```
Creating Flowable Process Engine
Initializing SpringProcessEngineConfiguration
Flowable ProcessEngine created
>>> Flowable 引擎启动成功 <<<
```

---

# 📌 总结

这次问题本质是 **Flowable 版本变动带来的兼容性问题**。

| 模块                           | 6.4.x | 6.5+    | 6.8    | 7.x    |
| ---------------------------- | ----- | ------- | ------ | ------ |
| Flowable UI                  | ✔ 有   | ⚠️ 逐步废弃 | ❌ 完全删除 | ❌ 完全删除 |
| BaseExceptionHandlerAdvice   | ✔ 存在  | ❌ 删除    | ❌ 删除   | ❌ 删除   |
| flowable-spring-boot-starter | ❌ 无   | ❌ 分散模块  | ❌ 模块分散 | ✔ 重新整合 |

**项目中仍有旧 UI 模块 → 直接冲突 → 启动失败。**

升级为 7.1.0 后：

* UI 模块统一移除
* starter 统一整合
* 类冲突问题彻底解决

---

# 🧭 经验教训

1. Flowable 6.8+ 不再兼容旧 UI 模块
2. Spring Boot 扫描路径一旦包含旧类 → 启动必炸
3. Flowable 升级需检查：

    * UI 模块
    * Rest 模块
    * 依赖树
4. 升级到 7.x 是最省心的方案