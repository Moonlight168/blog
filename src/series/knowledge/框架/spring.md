---
title: Spring
icon: /assets/icon/spring.png
order: 1
---

## Spring、SpringBoot 的常用注解？

**回答：**

#### 一、核心组件注解

* `@Component`：通用组件，注入 Spring 容器
* `@Service`：业务层组件
* `@Repository`：持久层组件，支持异常转换
* `@Controller`：控制器组件
* `@RestController`：`@Controller + @ResponseBody`，返回 JSON
* `@Configuration`：配置类
* `@Bean`：方法定义 Bean，常配合 `@Configuration` 使用
* `@ComponentScan`：指定扫描路径
* `@Import`：导入配置类或组件

#### 二、依赖注入相关

* `@Autowired`：按类型注入
* `@Qualifier`：配合 `@Autowired` 指定 Bean 名称
* `@Resource`：JSR 标准注解，默认按名称注入
* `@Value`：注入配置值
* `@Scope`：指定作用域（singleton、prototype）
* `@Lazy`：延迟加载
* `@PostConstruct`：初始化后执行
* `@PreDestroy`：销毁前执行

#### 三、AOP 注解

* `@Aspect`：声明切面类
* `@Pointcut`：定义切入点
* `@Before / @After / @Around`：通知类型（前置、后置、环绕等）
* `@Order`：切面优先级

#### 四、事务管理

* `@Transactional`：声明事务
* `@EnableTransactionManagement`：开启事务注解支持

#### 五、Spring MVC 注解

* `@RequestMapping`：请求映射
* `@GetMapping / @PostMapping`：简化请求映射
* `@RequestParam`：获取请求参数
* `@PathVariable`：路径变量
* `@RequestBody / @ResponseBody`：接收/响应 JSON
* `@RequestHeader / @CookieValue`：获取请求头/Cookie
* `@ModelAttribute`：绑定表单数据
* `@ExceptionHandler`：处理异常
* `@ControllerAdvice / @RestControllerAdvice`：全局异常处理

#### 六、SpringBoot 注解

* `@SpringBootApplication`：启动类注解，整合多项功能
* `@EnableAutoConfiguration`：开启自动配置
* `@SpringBootTest`：SpringBoot 测试类注解
* `@ConfigurationProperties`：绑定配置到 Bean
* `@EnableConfigurationProperties`：启用配置绑定支持
* `@PropertySource`：引入外部属性文件
* `@WebMvcTest / @DataJpaTest`：用于分层测试
* `@TestConfiguration`：测试配置类
* `@MockBean`：测试替换 Bean
* `@RefreshScope`：配置中心动态刷新支持

## Spring Boot 的启动流程

**回答：**
Spring Boot 应用的启动入口是 `SpringApplication.run()`，其流程大致如下：

1. **启动引导**

  * 执行 `SpringApplication.run(MainClass.class, args)`。
  * 创建 `SpringApplication` 对象，初始化配置。

2. **准备环境**

  * 加载配置文件（`application.yml` / `application.properties`）。
  * 准备 `Environment`（包括系统环境变量、命令行参数等）。

3. **创建并刷新容器**

  * 创建 `ApplicationContext`（默认是 `AnnotationConfigServletWebServerApplicationContext`）。
  * 扫描主启动类所在包及子包的组件。
  * 加载 Bean 定义并实例化 Bean。
  * 执行自动装配（Spring Boot Starter 自动配置）。

4. **创建 Web 容器**（如果是 Web 项目）

  * 内置 Tomcat/Jetty/Undertow 启动。
  * 将 DispatcherServlet 注册到容器。

5. **调用运行器**

  * 执行实现了 `ApplicationRunner` 和 `CommandLineRunner` 接口的 Bean，用于启动后执行自定义逻辑。

6. **应用就绪**

  * Spring Boot 应用完全启动，监听端口，接受请求。

👉 **总结：**
Spring Boot 启动流程 = **创建 SpringApplication → 准备环境 → 创建容器 → 自动配置 → 启动 Web 服务器 → 调用运行器 → 应用就绪**

##  什么是 Spring？它有哪些核心模块？

**回答：**
Spring 是一个轻量级的 Java 开发框架，核心模块包括：

* Spring Core（IOC 容器）
* Spring AOP（面向切面编程）
* Spring MVC（Web 框架）
* Spring Data、Spring Security 等

##  什么是 IOC 和 AOP？

**回答：**

* IOC（控制反转）：对象创建与依赖注入由容器管理，降低耦合。
* AOP（面向切面编程）：用来处理日志、事务等横切逻辑。

## 你对 IoC 和 AOP 的理解

**回答：**

**IoC（控制反转）**

* 核心思想：对象的创建和依赖关系由 **Spring 容器** 来管理，而不是由代码主动去 new。
* 体现形式：**依赖注入（DI）**，通过 `@Autowired`、`@Resource` 等方式将依赖交给容器注入。
* 优点：降低耦合、提高可维护性和可测试性。

**AOP（面向切面编程）**

* 核心思想：把通用的、与业务无关的功能（如日志、事务、权限、缓存）从业务逻辑中抽离出来，通过“切面”进行统一处理。
* 体现形式：Spring 通过 **动态代理（JDK 动态代理 / CGLIB）** 实现，在运行时织入切面逻辑。
* 优点：提高代码复用性，增强代码的可维护性，让业务代码更简洁。

## AOP 的常用注解有哪些？实现原理？

**回答：**

#### 一、常用注解

Spring AOP 基于 AspectJ 提供注解式切面编程，主要注解包括：

* `@Aspect`：声明该类是切面类，通常配合 `@Component` 一起使用。
* `@Pointcut`：定义切入点表达式，用于定位哪些方法需要织入增强逻辑。
* `@Before`：前置通知，在目标方法执行前执行。
* `@After`：后置通知，无论方法是否抛异常都会执行。
* `@AfterReturning`：返回通知，目标方法正常返回后执行。
* `@AfterThrowing`：异常通知，目标方法抛出异常时执行。
* `@Around`：环绕通知，包裹目标方法执行，可控制执行前后逻辑。
* `@Order`：指定切面执行顺序，值越小优先级越高。

**示例代码：**

```java
@Aspect
@Component
@Order(1)
public class LogAspect {

    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceMethods() {}

    @Before("serviceMethods()")
    public void before(JoinPoint jp) {
        System.out.println("调用方法前：" + jp.getSignature().getName());
    }

    @AfterReturning(pointcut = "serviceMethods()", returning = "result")
    public void afterReturn(Object result) {
        System.out.println("返回值：" + result);
    }

    @AfterThrowing(pointcut = "serviceMethods()", throwing = "ex")
    public void afterThrow(Exception ex) {
        System.out.println("异常：" + ex.getMessage());
    }

    @Around("serviceMethods()")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("方法开始");
        Object res = pjp.proceed();
        System.out.println("方法结束");
        return res;
    }
}
```

#### 二、实现原理

Spring AOP 的核心原理是[**动态代理（Proxy）**](../Java/java.html#java中的代理模式)，在运行时为目标对象生成代理对象，将通知逻辑织入目标方法的前后。

#### 四、关键组件说明

| 组件                    | 说明                 |
| --------------------- | ------------------ |
| `ProxyFactory`        | 决定使用 JDK 代理或 CGLIB |
| `Advisor`             | 包含切入点和通知的封装对象      |
| `MethodInterceptor`   | 方法拦截器，执行通知逻辑       |
| `JoinPoint`           | 方法调用等连接点的上下文       |
| `ProceedingJoinPoint` | 环绕通知中控制目标方法执行      |


#### 五、Spring AOP 与 AspectJ 区别

| 特性    | Spring AOP       | AspectJ     |
| ----- | ---------------- | ----------- |
| 实现方式  | 动态代理（JDK/CGLIB）  | 编译期或加载期织入   |
| 支持范围  | 方法级（Spring Bean） | 更广泛（字段、构造器） |
| 配置复杂度 | 简单（注解或 XML）      | 略复杂（需编译器支持） |
| 性能    | 较低（运行时代理）        | 高（编译期织入）    |

## **Spring 是如何实现依赖注入的？底层是如何实现的？**

Spring 的依赖注入（DI）通过 IoC 容器 + 反射机制，在运行时动态地将 Bean 的依赖注入进去，核心流程如下：


#### 一、基本概念

* **依赖注入（DI）**：由 Spring 容器负责创建对象并注入其依赖，降低耦合。
* **控制反转（IoC）**：对象不主动获取依赖，而是由容器“推”进来。


#### 二、底层实现流程

##### 1. 解析配置，生成 BeanDefinition

* 解析注解/XML/配置类，封装为 `BeanDefinition`（包含类名、作用域、依赖等）。
* 注册到 `BeanDefinitionRegistry` 中。

```java
BeanDefinition bd = new RootBeanDefinition(UserServiceImpl.class);
registry.registerBeanDefinition("userService", bd);
```

##### 2. 实例化 Bean（反射创建对象）

* 容器根据 `BeanDefinition` 使用反射调用构造函数创建实例。

```java
Class<?> clazz = Class.forName(beanDefinition.getClassName());
Object instance = clazz.getDeclaredConstructor().newInstance();
```

##### 3. 依赖注入（属性/构造函数/Setter）

* 容器根据类型或名称查找依赖 Bean。
* 使用反射注入依赖（字段、Setter、构造方法）。

```java
Field field = clazz.getDeclaredField("userService");
field.setAccessible(true);
field.set(beanInstance, userServiceBean);
```

##### 4. BeanPostProcessor 处理（如 @Autowired）

* `AutowiredAnnotationBeanPostProcessor` 扫描字段/方法上的 `@Autowired`。
* 查找依赖 Bean 并注入。

---

#### 三、注解注入流程（@Autowired）

1. `@ComponentScan` 扫描 Bean 并注册为 `BeanDefinition`
2. 实例化 Bean
3. `AutowiredAnnotationBeanPostProcessor` 处理字段/方法注入
4. 通过类型匹配查找依赖 Bean 并反射注入

---

#### 四、常见注入方式

* **构造函数注入（推荐）**：强依赖、不可变、支持 `final` 字段

  ```java
  public UserController(UserService userService) {
      this.userService = userService;
  }
  ```

* **Setter 注入**：可选依赖、可变性

  ```java
  @Autowired
  public void setUserService(UserService userService) {
      this.userService = userService;
  }
  ```

* **字段注入**（不推荐）：不利于测试和解耦

  ```java
  @Autowired
  private UserService userService;
  ```


#### 为什么不推荐注解注入？

* **侵入性强**：需在类中添加 Spring 注解，降低代码复用性与可测试性
* **不利于单元测试**：难以 mock 依赖，测试耦合度高,使用注解注入时，依赖对象由 Spring 容器自动注入，无法直接传入自定义的 mock 实例,为了让注解生效，必须启动 Spring 上下文（如用 @SpringBootTest），启动成本高、测试慢。
* **不清晰的依赖关系**：构造注入显式声明依赖，方便阅读与维护
* **运行时报错**：注解注入依赖缺失时为运行时报错，构造注入可编译时报错


#### 五、循环依赖解决机制（单例）

Spring 使用 **三级缓存** 解决构造器循环依赖（仅限单例 & 非构造器注入）：

1. **singletonFactories**：一级缓存，存放 `ObjectFactory`，用于生成早期代理对象
2. **earlySingletonObjects**：二级缓存，存放早期暴露的半成品 Bean（未填充属性）
3. **singletonObjects**：三级缓存，存放完全初始化好的 Bean

流程简要：创建 Bean → 放入 `singletonFactories` → 创建实例 → 放入 `earlySingletonObjects` → 填充属性 → 初始化 → 放入 `singletonObjects`

> 构造器注入无法提前暴露对象，无法参与三级缓存，不支持构造器循环依赖


#### 六、Spring 5+ 构造注入改进

* 单构造器类可省略 `@Autowired`，Spring 自动推断注入
* 支持不可变类（`final` 字段）构造注入
* 编译期检查依赖是否满足，提前暴露错误，提升安全性
* 推荐在配置类（`@Configuration`）中也使用构造注入，保证依赖清晰

## 第三方的 Bean 如何交给 Spring 管理？

#### 1. **使用 `@Bean` 注解注册到 Spring 容器**

在配置类中通过工厂方法手动创建：

```java
@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

适用于无法修改源码的第三方类。

#### 2. **使用 `@Import` 导入配置类**

如果第三方提供了带有 `@Bean` 的配置类，可使用：

```java
@Import(ThirdPartyConfig.class)
public class AppConfig {
}
```

#### 3. **使用 `@ComponentScan` 配合自定义封装类**

若第三方类可被自定义封装，则可在自定义类上加 `@Component`，并配置扫描路径：

```java
@Component
public class MyRedisClient {
    private final RedisClient client = new RedisClient();
}
```

#### 4. **通过 XML 配置注册 Bean**（不常用）

```xml
<bean id="restTemplate" class="org.springframework.web.client.RestTemplate"/>
```


#### 5. **使用 `FactoryBean` 自定义实例化逻辑**

适用于创建复杂第三方 Bean：

```java
public class MyFactoryBean implements FactoryBean<ThirdPartyBean> {
    @Override
    public ThirdPartyBean getObject() {
        return new ThirdPartyBean(...);
    }
    ...
}
```

注册方式：

```java
@Bean
public MyFactoryBean myFactoryBean() {
    return new MyFactoryBean();
}
```

## Bean 的生命周期

**回答：**
Spring Bean 的生命周期主要分为以下几个阶段：

1. **实例化（Instantiation）**

  * Spring 容器通过反射创建 Bean 对象。

2. **属性赋值（Populate）**

  * 依赖注入（DI），为 Bean 设置属性。

3. **初始化前（BeanPostProcessor.before）**

  * 调用 `BeanPostProcessor` 的 `postProcessBeforeInitialization`。

4. **初始化（Initialization）**

  * 执行 `InitializingBean.afterPropertiesSet()`。
  * 或调用配置的 `init-method` 方法。

5. **初始化后（BeanPostProcessor.after）**

  * 调用 `BeanPostProcessor` 的 `postProcessAfterInitialization`。

6. **使用中（In use）**

  * Bean 被应用程序使用。

7. **销毁（Destroy）**

  * 容器关闭时，调用 `DisposableBean.destroy()`。
  * 或调用配置的 `destroy-method` 方法。

👉 **总结：**
Bean 生命周期 = **实例化 → 属性赋值 → 初始化前处理 → 初始化 → 初始化后处理 → 使用 → 销毁**。


## @Autowired 和 @Resource 的区别

**回答：**

1. **来源不同**

  * `@Autowired`：Spring 提供，属于 **Spring 框架注解**。
  * `@Resource`：JDK 提供，属于 **JSR-250 规范注解**。

2. **注入方式**

  * `@Autowired`：默认按 **类型（byType）** 注入，如果存在多个同类型 Bean，则需要配合 `@Qualifier` 或 `@Primary` 指定。
  * `@Resource`：默认按 **名称（byName）** 注入，如果找不到同名 Bean，才会按类型注入。

3. **required 属性**

  * `@Autowired`：有 `required` 属性，默认为 `true`，如果没有匹配的 Bean 会报错，可以设置 `required = false`。
  * `@Resource`：没有 `required` 属性，如果没有找到 Bean 也会直接报错。

4. **使用场景**

  * `@Autowired`：更适合在 Spring 项目中使用，配合 Spring 的 IoC 和 AOP 特性。
  * `@Resource`：在需要兼容 JDK 规范或更关注名称匹配时使用。

👉 **总结**：

* `@Autowired`：**按类型注入**，Spring 专用，支持 `required`
* `@Resource`：**按名称注入**，JDK 标准，更通用 

## Spring Boot自动配置机制与组件扫描

### Spring Boot 自动配置和组件扫描有什么区别？

**答案要点：**

* 组件扫描用于业务组件注册，自动配置用于框架集成和默认配置
* 组件扫描无条件注册，自动配置通过条件化注解决定是否加载
* 实现机制不同：`@ComponentScan` vs `@EnableAutoConfiguration`
* 组件扫描控制粒度是包路径，自动配置粒度更细，可基于类、Bean、配置属性


### 什么场景下应该使用自动配置而不是简单的 @Component？

**答案要点：**

* 第三方库集成（如 Redis、MQ 客户端）
* 功能模块可选（通过配置启用/禁用）
* 提供默认实现但允许用户覆盖
* 根据环境差异提供不同配置（如开发/生产）


###  @ConditionalOnMissingBean 有什么作用？

**答案要点：**

* 避免重复注册 Bean
* 如果用户已定义相同类型的 Bean，则跳过默认 Bean
* 提供默认实现的同时，保留用户自定义空间

###  Spring Boot 2.4 为什么引入 AutoConfiguration.imports 替代 spring.factories？

**答案要点：**

* 简化语法：每行一个配置类，无需 Key-Value
* 可维护性更好，支持模块化管理
* 性能更优：避免 Properties 解析，直接逐行读取
* 更符合单一职责原则


###  如何排查某个自动配置类是否生效？

**答案要点：**

1. 启动时查看日志 `--debug`，Spring Boot 会打印条件评估报告
2. 使用 `@ConditionalOn...` 注解逐一排查条件是否满足
3. 查看 `META-INF/spring` 下的配置文件是否正确声明了配置类
4. 使用 Actuator 的 `conditions` 端点查看自动配置报告

