---
title: SpringBoot
date: 2026-03-24
icon: /assets/icon/spring.png
order: 5
---
## 什么是Spring Boot？说一下它的原理？

**锚点**：`约定优于配置 + 自动装配 + 内嵌服务器 + Starter`

1. **是什么**：基于 Spring 的快速开发框架，简化配置和部署——约定优于配置、开箱即用、内嵌服务器直接运行
2. **自动配置机制**：`@EnableAutoConfiguration` 扫描 `META-INF/spring.factories`（2.4+ 用 imports），按类路径依赖、配置属性、已有 Bean 条件装配
3. **内嵌服务器**：内置 Tomcat/Jetty/Undertow，`SpringApplication.run()` 创建容器 + 启动服务器 + 注册 DispatcherServlet，免 WAR 部署
4. **Starter 依赖**：`spring-boot-starter-web` 等一组 POM，引入即自动装配相关功能
5. **配置管理**：`application.properties/yml` + 环境变量，`@ConfigurationProperties` / `@Value` 注入

## Spring Boot 的启动流程

**锚点**：`创建 SpringApplication → 准备环境 → 创建容器 → 自动配置 → 启动 Web 服务器 → 调用运行器 → 就绪`

1. **启动引导**：`SpringApplication.run(MainClass.class, args)`，创建 SpringApplication 对象初始化配置
2. **准备环境**：加载配置文件，准备 `Environment`（含系统环境变量、命令行参数）
3. **创建并刷新容器**：创建 `ApplicationContext`，扫描主启动类所在包及子包，加载 Bean 定义、实例化，执行自动装配
4. **创建 Web 容器**：内置 Tomcat/Jetty/Undertow 启动，注册 DispatcherServlet
5. **调用运行器**：执行 `ApplicationRunner` / `CommandLineRunner` 的自定义启动逻辑
6. **应用就绪**：监听端口，接受请求

## Spring Boot 自动配置和组件扫描有什么区别？

**锚点**：`组件扫描注册业务组件（无条件），自动配置做框架集成（条件化）`

1. **分工**：组件扫描用于业务组件注册；自动配置用于框架集成和默认配置
2. **注册条件**：组件扫描无条件注册；自动配置通过条件注解决定是否加载
3. **实现机制**：`@ComponentScan` vs `@EnableAutoConfiguration`
4. **控制粒度**：组件扫描按包路径；自动配置粒度更细（基于类、Bean、配置属性）

## 什么场景下应该使用自动配置而不是简单的 @Component？

**锚点**：`第三方集成、可选模块、默认实现可覆盖、环境差异`

1. 第三方库集成（如 Redis、MQ 客户端）
2. 功能模块可选（通过配置启用/禁用）
3. 提供默认实现但允许用户覆盖
4. 根据环境差异提供不同配置（开发/生产）

## @ConditionalOnMissingBean 有什么作用？

**锚点**：`用户已定义则跳过默认 Bean——默认实现 + 保留自定义空间`

1. 避免重复注册 Bean
2. 用户已定义相同类型 Bean 时跳过默认 Bean
3. 提供默认实现的同时保留用户自定义空间

## Spring Boot 2.4 为什么引入 AutoConfiguration.imports 替代 spring.factories？

**锚点**：`每行一个配置类：语法简单、可维护、性能好、单一职责`

1. 简化语法：每行一个配置类，无需 Key-Value
2. 可维护性更好，支持模块化管理
3. 性能更优：避免 Properties 解析，直接逐行读取
4. 更符合单一职责原则

## 如何排查某个自动配置类是否生效？

**锚点**：`--debug 条件报告 / Actuator conditions 端点 / 逐个查条件`

1. 启动时 `--debug` 查看条件评估报告
2. 用 `@ConditionalOn...` 注解逐一排查条件是否满足
3. 查看 `META-INF/spring` 下配置文件是否正确声明
4. 用 Actuator 的 `conditions` 端点查看自动配置报告

## bootstrap.yml 和 application.yml 的区别

**锚点**：`bootstrap 引导期连配置中心（先加载），application 运行期常规配置（后加载）`

1. **基本概念**：`bootstrap.yml` 是 Spring Cloud 引导阶段配置（bootstrap context）；`application.yml` 是运行阶段配置（application context）
2. **加载顺序**：bootstrap 先、application 后；bootstrap 优先级更高
3. **用途**：bootstrap——服务注册发现、配置中心连接、加密设置；application——端口/数据库、业务参数、日志、环境差异化配置
4. **关系**：Spring Boot 应用通常只要 application.yml；Spring Cloud 应用通常 bootstrap + application

## Spring Boot 2 和 3 有什么区别？

**锚点**：`JDK 17+、jakarta 包名、Spring Framework 6、原生镜像更好`

1. **JDK 版本**：Boot 3 需要 JDK 17+；Boot 2 支持 JDK 8+
2. **包名**：`javax.*` 改成 `jakarta.*`（如 javax.servlet → jakarta.servlet）
3. **底层框架**：Boot 3 基于 Spring Framework 6；Boot 2 基于 Framework 5
4. **其他**：3.x 原生镜像支持更好、观测性指标更完善、依赖版本升级

## Spring Boot 的 starter 是干什么的？

**锚点**：`一个 starter 搞定一组依赖 + 自动装配`

1. **简化依赖引入**：不用自己配一堆依赖，一个 starter 搞定
2. **常用 starter**：`spring-boot-starter-web`（Web + Tomcat）、`spring-boot-starter-data-jpa`（数据库）、`spring-boot-starter-data-redis`（Redis）
3. **自动装配**：引入后 Spring Boot 自动配好相关功能

## Spring Boot 怎么实现热部署？

**锚点**：`加 spring-boot-devtools，代码改动自动重启`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
</dependency>
```

原理：代码改动后自动重启，不用手动停再启动。

## 怎么读配置文件？

**锚点**：`@Value 单个 / @ConfigurationProperties 批量 / Environment 动态`

1. **@Value 单个读取**：`@Value("${app.name}")`
2. **@ConfigurationProperties 批量绑定**：`@ConfigurationProperties(prefix = "app")` + `@Data` 类
3. **Environment 动态读取**：`env.getProperty("app.name")`

## Spring Boot 自动配置原理是什么？

**锚点**：`@EnableAutoConfiguration → 读 imports 配置类列表 → 条件注解筛选 → 符合条件的注册 Bean`

- `@EnableAutoConfiguration` → `@Import(AutoConfigurationImportSelector.class)`
- 启动时读 `META-INF/spring/...AutoConfiguration.imports`，获取所有自动配置类列表
- 逐个用条件注解筛选：`@ConditionalOnClass`（classpath 有对应 jar？）、`@ConditionalOnMissingBean`（用户自己写了吗？）
- 符合条件的执行 `@Bean`，将对象放入 IoC 容器
- `@Bean` 创建时通过 `@ConfigurationProperties` 从 `application.properties` 取值
- 跟 IOC 的关系：IOC 管对象生命周期；自动配置是省去手写 `@Bean` 的过程；properties 只提供参数值

→ [回答历史](/private/series/答题历史/框架/springboot-答题记录.md#spring-boot-自动配置原理是什么)

## `@SpringBootApplication` 包含哪几个注解？

**锚点**：`@SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan`

- **`@SpringBootConfiguration`**：标记配置类（底层 `@Configuration`）
- **`@EnableAutoConfiguration`**：自动配置核心
- **`@ComponentScan`**：组件扫描

→ [回答历史](/private/series/答题历史/框架/springboot-答题记录.md#springbootapplication-包含哪几个注解)
