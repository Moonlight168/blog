---
title: 解决 ruoyi-cloud 集成 Flowable 启动报错 RuntimeService
date: 2025-11-19
categories: ["BUG"]
tags: ["Flowable", "MyBatis-Plus", "Spring Boot"]
---

# 解决 ruoyi-cloud 集成 Flowable 启动报错 RuntimeService

## 1️⃣ 问题现象

在ruoyi-cloud 项目中集成 Flowable 工作流引擎时，集成的是另一个作者的项目
https://gitee.com/bdn007/ruoyi-cloud-module-flowable
启动项目时出现错误：

```log
---

APPLICATION FAILED TO START

---

Description:

A component required a bean of type 'org.flowable.engine.RuntimeService' that could not be found.

Action:

Consider defining a bean of type 'org.flowable.engine.RuntimeService' in your configuration

```

**核心问题**：Spring 容器中找不到 `RuntimeService` 类型的 Bean，导致依赖该 Bean 的组件初始化失败。
[🎯 解决方案跳转](#_4%EF%B8%8F⃣-解决方案)

### 环境配置

- Spring Boot 3.3.5
- Spring Cloud Alibaba 2023.0.3
- Flowable 6.8.0
- dynamic-datasource 3.5.x
- MySQL 8.0

---

## 2️⃣ 排查过程

### 🎯 Flowable 引擎还没初始化
- 但是项目内 `GlobalEventListenerConfig` 在 Spring 容器刷新阶段就尝试注入 RuntimeService  
- ❌ 导致失败，中断 Flowable 自动配置  
- ❌ 最终 RuntimeService 根本没有机会被创建  

这不是 Flowable 自动配置失败，而是 **过早使用 RuntimeService 导致 Flowable 还没初始化**。

#### 🔥 关键问题代码（项目内）

```java
// com.ruoyi.flowable.config.GlobalEventListenerConfig
@Override
public void onApplicationEvent(ContextRefreshedEvent event) {
    runtimeService.addEventListener(globalEventListener, FlowableEngineEventType.PROCESS_COMPLETED);
}
````

* 你的监听器在 `ApplicationStartedEvent` / `ContextRefreshedEvent` 阶段执行
* 但此时 Flowable 引擎还没创建
* 导致抛出：`No qualifying bean of type 'RuntimeService'`
* 从而中断 ApplicationContext 刷新流程

---

### 🔹 Spring Boot 自动配置执行顺序

1. 创建 ApplicationContext
2. 注册事件监听器
3. 遍历并执行 ApplicationListener（你的监听器）
4. 初始化 Flowable 引擎（此时才创建 RuntimeService）
5. refresh 完成

> 你在第 3 步就调用 RuntimeService ⇒ 必然报错

### 🛠 解决监听器问题（延迟执行监听器）

```java
@Component
public class GlobalEventListenerConfig implements ApplicationListener<ApplicationReadyEvent> {

    @Autowired
    private RuntimeService runtimeService;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        runtimeService.addEventListener(globalEventListener, FlowableEngineEventType.PROCESS_COMPLETED);
    }
}
```

* `ApplicationReadyEvent` 是最后一步，Flowable 一定已经初始化完毕
* 监听器安全执行，不再抛出 RuntimeService 未找到的错误

> 但在本次启动报错中，这个监听器 **只是暴露了真正问题**，并不是根本原因。

---

### 🎯 真正导致 Flowable 启动失败的根本原因：MyBatis-Plus DDL Runner

开启 DEBUG 日志后发现：

```log
org.springframework.beans.factory.BeanNotOfRequiredTypeException: Bean named 'ddlApplicationRunner' is expected to be of type 'ApplicationRunner' but was actually of type 'org.springframework.beans.factory.support.NullBean'
```

* Spring Boot 在创建 MyBatis-Plus 的 `DdlApplicationRunner` 时失败
* 应用提前退出 → Flowable AutoConfiguration 根本没机会加载 → RuntimeService 不存在

---

#### 🔹 DdlApplicationRunner 源码（反编译）

```java
public class DdlApplicationRunner implements ApplicationRunner {
    private List<IDdl> ddlList;
    public DdlApplicationRunner(List<IDdl> ddlList) { this.ddlList = ddlList; }
    public void run(ApplicationArguments args) {
        if (ObjectUtils.isNotEmpty(this.ddlList)) {
            this.ddlList.forEach(ddl -> ddl.runScript(...));
        }
    }
}
```

* Bean 依赖 `List<IDdl>`
* 如果列表为空或条件不满足，Spring Boot 3 会将其解析为 NullBean
* 执行 ApplicationRunner 阶段崩溃 → 提前 fail → Flowable AutoConfiguration 未被执行

---

#### 🔹 排查 MyBatis-Plus 配置

尝试远程 Nacos 配置：

```yaml
mybatis-plus:
  ddl:
    enabled: false
```

❌ 无效
原因：DdlApplicationRunner 在 Spring Boot 初始化早期阶段加载，Nacos 配置加载太晚。

IDEA 也提示：

```
无法解析配置属性 'mybatis-plus.ddl.enabled'
```

原因：

* MyBatis-Plus 3.5.4 及以下版本对 Spring Boot 3 支持不完善
* 自动配置类没有绑定配置元数据

---

## 3️⃣ 根因分析

1. **DDL Runner Bean 崩溃** → Spring Boot 提前 fail
2. **Flowable AutoConfiguration 根本未加载** → RuntimeService 不存在
3. **Nacos 配置太晚** → 无法覆盖 DdlApplicationRunner
4. **版本问题** → MyBatis-Plus 3.5.4 及以下在 Spring Boot 3 下自动配置不完善

> Flowable 启动失败的根本原因是 **MyBatis-Plus DdlApplicationRunner Bean 创建失败**，而不是 Flowable 自身问题。

## 4️⃣ 解决方案
### 1.[延迟注册监听器](#🛠-解决监听器问题-延迟执行监听器)
### 2.升级 MyBatis-Plus 到 **3.5.5**

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.5</version>
</dependency>
```

> 来源：[CSDN 博客](https://blog.csdn.net/weixin_46211609/article/details/135552632)


##  5️⃣ 总结经验

1. **Flowable RuntimeService 报错不一定是 Flowable 本身问题**
2. **过早使用 Bean 会暴露底层依赖错误**
3. **Spring Boot 初始化顺序关键**

   * ApplicationContext 初始化 → 注册监听器 → 执行 ApplicationListener → 初始化 Flowable 引擎
4. **MyBatis-Plus DDL Runner 在 Spring Boot 3 下容易触发 NullBean**
5. 解决方式：
   * 先修改GlobalEventListenerConfig- 延迟注册监听器
   * 升级 MyBatis-Plus 至 3.5.5
   * 或排除 DDL 自动配置
   * 或在本地禁用 DDL
6. Flowable 全局监听器可以安全恢复原状，问题根源已解决

💡 **结论**：
Flowable 启动报错 RuntimeService 缺失，实质是 MyBatis-Plus DDL Runner Bean 异常导致自动配置提前失败，而非 Flowable 自动配置错误。升级 MyBatis-Plus 即可解决。
