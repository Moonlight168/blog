---
title: SpringBoot
date: 2026-03-24
icon: /assets/icon/spring.png
order: 5
---
## 什么是Spring Boot？说一下它的原理？

1. **什么是 Spring Boot**

   Spring Boot 是基于 Spring 的快速开发框架，用于简化 Spring 应用的配置和部署。
   核心目标：

   - 约定优于配置：开箱即用，减少 XML/Java 配置量
   - 快速启动：内嵌服务器（如 Tomcat），直接运行即可
   - 自动化配置：根据类路径依赖和配置文件自动装配 Bean
2. **Spring Boot 原理**

   （1）自动配置机制

   核心注解：`@SpringBootApplication` → 包含：

   - `@Configuration`：配置类
   - `@EnableAutoConfiguration`：启用自动配置
   - `@ComponentScan`：扫描组件

   工作原理：

   - `@EnableAutoConfiguration` 会扫描 `META-INF/spring.factories` 下的自动配置类
   - 根据 **类路径依赖**、**配置属性**、**已有 Bean** 条件装配相应组件

   （2）内嵌服务器启动

   Spring Boot 内置 Tomcat/Jetty/Undertow，避免手动部署 WAR 包
   原理：

   - 启动类调用 `SpringApplication.run()`
   - 创建 `ApplicationContext` 并加载自动配置
   - 启动嵌入式服务器并注册 DispatcherServlet

   （3）Starter 依赖

   提供一组 "Starter" POM，例如：

   - `spring-boot-starter-web` → 包含 Web、Tomcat、Jackson 等依赖
   - `spring-boot-starter-data-jpa` → 包含 Hibernate、Spring Data JPA

   原理：引入 Starter 即可自动装配相关功能，无需手动依赖和配置

   （4）配置管理

   支持 `application.properties` / `application.yml` / 环境变量
   原理：

   - `@ConfigurationProperties` 或 `@Value` 注入属性
   - 自动匹配 Bean 配置和属性值

## Spring Boot 的启动流程

Spring Boot 应用的启动入口是 `SpringApplication.run()`，其流程大致如下：

1. **启动引导**

   - 执行 `SpringApplication.run(MainClass.class, args)`
   - 创建 `SpringApplication` 对象，初始化配置
2. **准备环境**

   - 加载配置文件（`application.yml` / `application.properties`）
   - 准备 `Environment`（包括系统环境变量、命令行参数等）
3. **创建并刷新容器**

   - 创建 `ApplicationContext`（默认是 `AnnotationConfigServletWebServerApplicationContext`）
   - 扫描主启动类所在包及子包的组件
   - 加载 Bean 定义并实例化 Bean
   - 执行自动装配（Spring Boot Starter 自动配置）
4. **创建 Web 容器**（如果是 Web 项目）

   - 内置 Tomcat/Jetty/Undertow 启动
   - 将 DispatcherServlet 注册到容器
5. **调用运行器**

   - 执行实现了 `ApplicationRunner` 和 `CommandLineRunner` 接口的 Bean，用于启动后执行自定义逻辑
6. **应用就绪**

   - Spring Boot 应用完全启动，监听端口，接受请求

👉 **总结：**
Spring Boot 启动流程 = **创建 SpringApplication → 准备环境 → 创建容器 → 自动配置 → 启动 Web 服务器 → 调用运行器 → 应用就绪**

## SpringBoot 常用注解有哪些？


1. `@SpringBootApplication`：启动类注解，等于 `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`
2. `@ConfigurationProperties`：把配置文件的属性绑定到 Bean 上，配合 `@EnableConfigurationProperties` 启用
3. `@SpringBootTest`：测试类注解，跑单元测试
4. `@MockBean`：测试时 mock 掉某个 Bean
5. `@TestConfiguration`：测试用的配置类，不走自动扫描

## Spring Boot自动配置机制与组件扫描

1. **Spring Boot 自动配置和组件扫描有什么区别？**

   - 组件扫描用于业务组件注册，自动配置用于框架集成和默认配置
   - 组件扫描无条件注册，自动配置通过条件化注解决定是否加载
   - 实现机制不同：`@ComponentScan` vs `@EnableAutoConfiguration`
   - 组件扫描控制粒度是包路径，自动配置粒度更细，可基于类、Bean、配置属性
2. **什么场景下应该使用自动配置而不是简单的 @Component？**

   - 第三方库集成（如 Redis、MQ 客户端）
   - 功能模块可选（通过配置启用/禁用）
   - 提供默认实现但允许用户覆盖
   - 根据环境差异提供不同配置（如开发/生产）
3. **@ConditionalOnMissingBean 有什么作用？**

   - 避免重复注册 Bean
   - 如果用户已定义相同类型的 Bean，则跳过默认 Bean
   - 提供默认实现的同时，保留用户自定义空间
4. **Spring Boot 2.4 为什么引入 AutoConfiguration.imports 替代 spring.factories？**

   - 简化语法：每行一个配置类，无需 Key-Value
   - 可维护性更好，支持模块化管理
   - 性能更优：避免 Properties 解析，直接逐行读取
   - 更符合单一职责原则
5. **如何排查某个自动配置类是否生效？**

   - 启动时查看日志 `--debug`，Spring Boot 会打印条件评估报告
   - 使用 `@ConditionalOn...` 注解逐一排查条件是否满足
   - 查看 `META-INF/spring` 下的配置文件是否正确声明了配置类
   - 使用 Actuator 的 `conditions` 端点查看自动配置报告

## bootstrap.yml 和 application.yml 的区别

1. **基本概念**

   - `bootstrap.yml`：Spring Cloud 中的配置文件，用于应用程序的**引导阶段**（bootstrap context）
   - `application.yml`：Spring Boot 的标准配置文件，用于应用程序的**运行阶段**（application context）
2. **加载顺序与优先级**

   （1）加载顺序

   - `bootstrap.yml` 先加载（引导上下文）
   - `application.yml` 后加载（应用上下文）

   （2）优先级

   - `bootstrap.yml` 中的配置优先级更高
   - `application.yml` 中的配置可以覆盖 `bootstrap.yml` 中的同名配置
3. **主要用途**

   **bootstrap.yml 主要用于：**

   - **服务注册与发现**：配置 Nacos、Consul 等注册中心
   - **配置中心连接**：连接 Spring Cloud Config Server
   - **加密/解密设置**：配置密钥和加密属性
   - **应用上下文父级设置**：作为父上下文的配置

   **application.yml 主要用于：**

   - **常规应用配置**：服务器端口、数据库连接等
   - **业务相关配置**：业务参数、功能开关等
   - **日志配置**：日志级别、输出格式等
   - **特定环境配置**：开发、测试、生产环境的差异化配置
4. **Spring Cloud 与 Spring Boot 的关系**

   - **Spring Boot 应用**：通常只需要 `application.yml`
   - **Spring Cloud 应用**：通常需要 `bootstrap.yml` + `application.yml`

## Spring Boot 2 和 3 有什么区别？

1. **JDK 版本要求不同**

   - Spring Boot 3 需要 JDK 17+
   - Spring Boot 2 支持 JDK 8+
2. **包名全部变了**

   - `javax.*` 改成 `jakarta.*`
   - 比如原来 `javax.servlet` 现在是 `jakarta.servlet`
3. **底层框架升级**

   - Spring Boot 3 基于 Spring Framework 6
   - Spring Boot 2 基于 Spring Framework 5
4. **其他变化**

   - 3.x 对原生镜像支持更好
   - 观测性指标更完善
   - 各依赖版本都升级了

## Spring Boot 的 starter 是干什么的？

1. **简化依赖引入**

   不用自己配一堆依赖，一个 starter 就搞定

2. **常用 starter**

   - `spring-boot-starter-web`：Web 开发（自动配好 Tomcat）
   - `spring-boot-starter-data-jpa`：数据库操作
   - `spring-boot-starter-redis`：Redis

3. **自动装配**

   引入 starter 后，Spring Boot 自动帮你配好相关功能

## Spring Boot 怎么实现热部署？

1. **加个依赖**

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-devtools</artifactId>
   </dependency>
   ```

2. **原理**

   代码改动后自动重启，不用手动停再启动

## 怎么读配置文件？

1. **@Value 单个读取**

   ```java
   @Value("${app.name}")
   private String name;
   ```

2. **@ConfigurationProperties 批量绑定**

   ```java
   @ConfigurationProperties(prefix = "app")
   @Data
   public class AppConfig {
       private String name;
       private Integer port;
   }
   ```

3. **Environment 动态读取**

   ```java
   @Autowired
   private Environment env;

   env.getProperty("app.name");
   ```

## Spring Boot 自动配置原理是什么？

- `@EnableAutoConfiguration` → `@Import(AutoConfigurationImportSelector.class)`
- 启动时读 `META-INF/spring/...AutoConfiguration.imports`，获取所有自动配置类列表
- 逐个用条件注解筛选：`@ConditionalOnClass`（classpath 有对应 jar？）、`@ConditionalOnMissingBean`（用户自己写了吗？）
- 符合条件的执行 `@Bean`，将对象放入 IoC 容器
- `@Bean` 创建时通过 `@ConfigurationProperties` 从 `application.properties` 取值
- 跟 IOC 的关系：IOC 管对象生命周期；自动配置是省去手写 `@Bean` 的过程；properties 只提供参数值

→ [回答历史](/private/series/答题历史/框架/springboot-答题记录.md#spring-boot-自动配置原理是什么)

## `@SpringBootApplication` 包含哪几个注解？

- **`@SpringBootConfiguration`** — 标记配置类（底层 `@Configuration`）
- **`@EnableAutoConfiguration`** — 自动配置核心
- **`@ComponentScan`** — 组件扫描

→ [回答历史](/private/series/答题历史/框架/springboot-答题记录.md#springbootapplication-包含哪几个注解)
