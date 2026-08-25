---
title: Spring
date: 2026-03-24
icon: /assets/icon/spring.png
order: 1
---

## 什么是 Spring？它有哪些核心模块？

**锚点**：`轻量级 Java 框架：Core(IOC) + AOP + MVC + Data/Security`

Spring 是一个轻量级的 Java 开发框架，核心模块包括：

- Spring Core（IOC 容器）
- Spring AOP（面向切面编程）
- Spring MVC（Web 框架）
- Spring Data、Spring Security 等

## 你对 IoC 和 AOP 的理解

**锚点**：`IoC 容器管对象（依赖注入），AOP 抽公共逻辑（动态代理）`

**IoC（控制反转）**：

- 核心思想：对象创建和依赖关系由 **Spring 容器** 管理，不是代码主动 new
- 体现形式：**依赖注入（DI）**——`@Autowired`、`@Resource` 交给容器注入
- 优点：降低耦合、提高可维护性和可测试性

**AOP（面向切面编程）**：

- 核心思想：把通用的、与业务无关的功能（日志、事务、权限、缓存）从业务逻辑抽离，通过"切面"统一处理
- 体现形式：**动态代理（JDK 动态代理 / CGLIB）** 运行时织入切面逻辑
- 优点：提高代码复用性、可维护性，业务代码更简洁

## AOP 的常用注解有哪些？实现原理？

**锚点**：`@Aspect + @Pointcut + 五通知（Before/After/AfterReturning/AfterThrowing/Around）`

1. **常用注解**：
   - `@Aspect`：声明切面类（配合 `@Component`）
   - `@Pointcut`：定义切入点表达式，定位哪些方法织入
   - `@Before` / `@After` / `@AfterReturning` / `@AfterThrowing` / `@Around`：五类通知
   - `@Order`：切面执行顺序，值越小优先级越高
2. **实现原理**：**动态代理**——运行时为目标对象生成代理对象，把通知逻辑织入方法前后；JDK 动态代理（接口）或 CGLIB（类）
3. **关键组件**：`ProxyFactory` 决定代理方式；`Advisor` 封装切入点和通知；`MethodInterceptor` 执行通知；`ProceedingJoinPoint` 在环绕通知中控制目标执行
4. **Spring AOP vs AspectJ**：

| 特性 | Spring AOP | AspectJ |
|------|-----------|---------|
| 实现方式 | 动态代理（JDK/CGLIB） | 编译期或加载期织入 |
| 支持范围 | 方法级（Spring Bean） | 更广泛（字段、构造器） |
| 配置复杂度 | 简单（注解/XML） | 略复杂（需编译器支持） |
| 性能 | 较低（运行时代理） | 高（编译期织入） |

## Spring 是如何实现依赖注入的？底层是如何实现的？

**锚点**：`IoC 容器 + 反射：BeanDefinition → 反射实例化 → 反射注入 → BeanPostProcessor 处理 @Autowired`

1. **基本概念**：DI 由容器创建对象并注入依赖；IoC 对象不主动获取，容器"推"进来
2. **底层流程**：
   - 解析配置生成 `BeanDefinition`（类名、作用域、依赖），注册到 `BeanDefinitionRegistry`
   - 按 BeanDefinition 用反射调构造器创建实例
   - 按类型/名称找依赖 Bean，反射注入（字段/Setter/构造器）
   - `AutowiredAnnotationBeanPostProcessor` 扫描 `@Autowired`，查依赖并注入
3. **三种注入方式**：构造器（推荐，强依赖不可变 final）；Setter（可选依赖）；字段（不推荐，不利测试）
4. **循环依赖**：三级缓存解决（仅限单例 + 非构造器注入）

## Spring 循环依赖如何解决？

**锚点**：`三级缓存：singletonFactories 存工厂 → earlySingletonObjects 存半成品 → singletonObjects 存成品`

1. **三级缓存**：
   - **singletonObjects（一级）**：完全初始化好的单例 Bean，直接返回
   - **earlySingletonObjects（二级）**：早期暴露的半成品 Bean（已实例化未填充属性）
   - **singletonFactories（三级）**：`ObjectFactory` 工厂，用于生成早期代理对象或原始对象
2. **流程（A → B → A）**：创建 A 实例化后放三级缓存 → 填充属性发现依赖 B → 创建 B 实例化放三级缓存 → B 填充发现依赖 A → 从三级缓存取 A 的 ObjectFactory 调 getObject() 得早期对象，移入二级缓存注入 B → B 完成移一级 → A 完成移一级
3. **为什么三级**：一级存成品；二级存早期对象避免重复创建；**三级处理 AOP 代理场景**——循环依赖时返回的是代理对象（没有三级缓存，代理会晚于依赖注入生成，注入的就是原始对象）
4. **不支持的场景**：
   - 构造器循环依赖：实例化和注入同一过程，无法提前暴露对象
   - 原型 Bean：每次新建无法缓存复用，无限递归栈溢出

→ [回答历史](/private/series/答题历史/框架/spring-答题记录.md#spring-循环依赖怎么解决)

## Spring 注入 Bean 的方式

**锚点**：`构造器（推荐）/ Setter / 字段 / @Resource 按名 / @Inject 按类型`

1. **构造器注入（推荐）**：适合必需依赖，对象创建时依赖完整，支持 final
2. **Setter 注入**：适合可选依赖
3. **字段注入（不推荐）**：简洁但不易测试
4. **@Resource 注入**：JSR-250，按名称匹配，找不到再按类型
5. **@Inject 注入**：JSR-330，按类型匹配

**@Autowired 匹配规则**：先按类型（byType）；类型冲突按字段名或 `@Qualifier`（byName）；`required=true` 默认必须找到，`false` 可选注入。

## 第三方的 Bean 如何交给 Spring 管理？

**锚点**：`@Bean 手动创建 / @Import 导入配置 / FactoryBean 复杂逻辑`

1. **@Bean 注解**：配置类中手动创建

```java
@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

2. **@Import 导入配置类**：`@Import(ThirdPartyConfig.class)`
3. **FactoryBean**：适用于复杂实例化逻辑，实现 `getObject()`
4. **XML 配置**（不常用）

## Bean 的生命周期

**锚点**：`实例化 → 属性赋值 → 初始化前 → 初始化 → 初始化后 → 使用 → 销毁`

1. **实例化**：反射创建 Bean 对象
2. **属性赋值**：依赖注入（DI）
3. **初始化前**：`BeanPostProcessor.postProcessBeforeInitialization`
4. **初始化**：`InitializingBean.afterPropertiesSet()` 或配置的 `init-method`
5. **初始化后**：`BeanPostProcessor.postProcessAfterInitialization`
6. **使用中**：Bean 被应用程序使用
7. **销毁**：容器关闭时 `DisposableBean.destroy()` 或 `destroy-method`

## @Autowired 和 @Resource 的区别

**锚点**：`@Autowired 按类型（Spring 专用，有 required）；@Resource 按名称（JDK 标准）`

1. **来源**：`@Autowired` Spring 提供；`@Resource` JDK 提供（JSR-250）
2. **注入方式**：`@Autowired` 默认按类型，多同类型 Bean 配 `@Qualifier`/`@Primary`；`@Resource` 默认按名称，找不到再按类型
3. **required**：`@Autowired` 有 required 属性（默认 true，可设 false）；`@Resource` 没有
4. **场景**：`@Autowired` 适合 Spring 项目配合 IoC/AOP；`@Resource` 需兼容 JDK 规范或重名称匹配时

## Spring 常用注解有哪些？

**锚点**：`组件（@Component/@Service/@Repository）+ 注入（@Autowired/@Qualifier/@Value）+ AOP + 事务`

1. **核心组件**：`@Component`、`@Service`（业务层）、`@Repository`（持久层，异常转换）、`@Configuration`、`@Bean`、`@ComponentScan`、`@Import`
2. **依赖注入**：`@Autowired`、`@Qualifier`、`@Resource`、`@Value`、`@Scope`、`@Lazy`、`@PostConstruct`、`@PreDestroy`
3. **AOP**：`@Aspect`、`@Pointcut`、`@Before/@After/@Around`、`@Order`
4. **事务**：`@Transactional`、`@EnableTransactionManagement`

## Spring Bean 的作用域有哪些？一般项目中用什么？

**锚点**：`singleton 默认 90% 场景，prototype 有状态，request/session/application/websocket Web 环境`

| 作用域 | 描述 | 适用环境 |
|--------|------|----------|
| singleton | 容器中一个实例（默认） | 所有环境 |
| prototype | 每次请求新实例 | 所有环境 |
| request | 每个 HTTP 请求一个实例 | Web |
| session | 每个 HTTP 会话一个实例 | Web |
| application | ServletContext 生命周期一个实例 | Web |
| websocket | 每个 WebSocket 会话一个实例 | WebSocket |

**常用**：singleton（90% 场景，无状态服务类）、prototype（有状态对象）、request/session（Web 请求数据）。

⚠️ **singleton 依赖 prototype 问题**：singleton 初始化时 prototype 依赖只创建一次——用 `@Lookup` 或 `ObjectProvider` 解决。

## @Transactional 注解四种机制有哪些？

**锚点**：`传播机制 + 隔离级别 + 只读属性 + 回滚规则`

1. **传播机制（Propagation）**：控制事务方法间调用关系——REQUIRED（默认，有则加入无则创建）、REQUIRES_NEW（总是新建，不受调用方影响）等
2. **隔离级别（Isolation）**：控制数据可见性——READ_UNCOMMITTED（允许脏读/不可重复读/幻读）→ READ_COMMITTED（避免脏读）→ REPEATABLE_READ（避免脏读+不可重复读）→ SERIALIZABLE（避免所有并发问题）
3. **只读属性（ReadOnly）**：`readOnly=true` 告诉数据库这是查询操作，优化性能
4. **回滚规则（Rollback For）**：默认 RuntimeException 和 Error 自动回滚；可 `rollbackFor`/`noRollbackFor` 自定义

> 📖 详细说明：[@Transactional注解四种机制详解](/blogs/框架/spring/transactional-annotation.md)

## @Transactional 失效的常见原因？

**锚点**：`四个：内部调用 / 非 public / 异常被吞 / 引擎不支持`

1. **类内部调用**：不经过 AOP 代理
2. **非 public 方法**：Spring 默认只代理 public
3. **异常被吞**：try-catch 没往外抛；默认只回滚 RuntimeException
4. **数据库引擎不支持**：如 MyISAM

→ [回答历史](/private/series/答题历史/框架/spring-答题记录.md#transactional-失效的常见原因)

## Spring中的ApplicationContext 原理是什么，它与BeanFactory区别？

**锚点**：`BeanFactory 只管建 Bean；ApplicationContext 加事件/AOP/资源加载，启动即初始化单例`

1. **ApplicationContext 原理**：以 BeanFactory 为核心，通过统一的 `refresh()` 启动流程完成 BeanDefinition 加载注册，靠各种 PostProcessor 扩展容器能力，启动阶段完成单例 Bean 实例化、注入和生命周期管理
2. **区别**：BeanFactory 只负责基础 Bean 创建和依赖注入；ApplicationContext 引入事件机制、AOP、资源加载等应用级能力，默认启动时初始化单例 Bean

## 实际应用中你怎么使用 ApplicationContext ？

**锚点**：`注解方式为主，典型用法是 AOP：@Aspect + @Around 做日志/鉴权/事务`

1. 实际项目主要通过注解使用，容器启动时统一管理 Bean
2. 典型用法是 AOP：`@Aspect` + `@Around` 实现日志、鉴权和事务控制
3. Spring 在容器启动过程中通过 BeanPostProcessor 对目标 Bean 代理增强，只需声明切面，不用手动干预对象创建

## JWT 认证流程？token 里能放敏感信息吗？

**锚点**：`登录发 JWT → 请求带 Bearer → 过滤器验签解析；不能放敏感信息（Base64 非加密）`

1. **流程**：登录 → 后端校验 → 生成 JWT（Header + Payload + Signature）→ 返回前端；前端每次请求带 `Authorization: Bearer <token>`；过滤器拦截 → 验签 → 解析用户信息 → 放入 SecurityContext
2. **不能放敏感信息**：JWT 是 Base64 编码不是加密，任何人解码可见 payload
3. **配合**：短 TTL + refresh token、生产换掉默认密钥

→ [回答历史](/private/series/答题历史/框架/spring-答题记录.md#jwt-认证流程token-里能放敏感信息吗)

## JWT token 过期了怎么办？Refresh Token 怎么续期？

**锚点**：`双 token：Access 短过期静默续，Refresh 长过期存服务端可吊销`

1. Access Token 短过期（15-30min），Refresh Token 长过期（7-30 天）
2. Access 过期 → 客户端拿 Refresh 静默换新 Access，用户无感知
3. Refresh 也过期才需要重新登录
4. Refresh 存服务端（Redis）可主动吊销；Access 不存，靠短 TTL 降低泄露风险

→ [回答历史](/private/series/答题历史/基础知识/非技术面试问答-答题记录.md#jwt-token-过期了怎么办refresh-token-怎么续期)

## Spring Bean 默认单例，多线程并发会有安全问题吗？怎么处理？

**锚点**：`看有没有共享可变状态；无状态天然安全，有状态用 ThreadLocal/加锁/prototype`

1. 看 Bean 有没有**共享可变状态**（成员变量）；Controller/Service 只调方法不存成员变量 → 天然线程安全
2. 有状态时：`ThreadLocal`、加锁（synchronized/Lock）、或改用 prototype 作用域
3. 能用无状态就无状态，**最优解是不持有状态**

→ [回答历史](/private/series/答题历史/框架/spring-答题记录.md#spring-bean-默认单例多线程并发会有安全问题吗怎么处理)

## Spring IoC 容器启动过程中，Bean 的完整生命周期是怎样的？

**锚点**：`实例化 → 注入 → Aware → 前置 → 初始化 → 后置(AOP) → 就绪 → 销毁`

1. **实例化**：反射调用构造器创建对象
2. **属性填充**：注入 `@Autowired`、`@Value` 等依赖
3. **Aware 回调**：`BeanNameAware`、`BeanFactoryAware`、`ApplicationContextAware` 等，容器把元信息塞给 Bean
4. **BeanPostProcessor 前置处理**：`postProcessBeforeInitialization`
5. **初始化**：`@PostConstruct` → `InitializingBean.afterPropertiesSet()` → `init-method`
6. **BeanPostProcessor 后置处理**：`postProcessAfterInitialization`——**AOP 代理在这一步生成**
7. **就绪**：放入单例池
8. **销毁**：`@PreDestroy` → `DisposableBean.destroy()` → `destroy-method`

- 简记：**实例化 → 注入 → Aware → 前置 → 初始化 → 后置(AOP) → 就绪 → 销毁**
- 三级缓存是解决**循环依赖**的机制，不是生命周期本身，发生在步骤 2 之后

→ [回答历史](/private/series/答题历史/框架/spring-答题记录.md#spring-ioc-容器启动过程中bean-的完整生命周期是怎样的)

## Spring Aware 接口是什么？

**锚点**：`回调接口：Spring 发现 Bean 实现了 Aware，就把容器底层信息塞给它`

- Aware 是一组**回调接口**，Spring 创建 Bean 时若发现它实现了某个 Aware 接口，就把容器底层信息主动塞给它
- `ApplicationContextAware` 塞上下文，`BeanNameAware` 塞名字，`EnvironmentAware` 塞环境配置等
- Aware 回调在 `@PostConstruct` 之前执行，确保初始化方法里相关信息已就绪

→ [回答历史](/private/series/答题历史/框架/spring-答题记录.md#spring-aware-接口是什么)

## Spring Aware 接口实际开发中还有用吗？

**锚点**：`业务代码很少用（@Autowired 覆盖 99%），框架/基础设施仍依赖`

- **业务代码很少直接用**：`@Autowired`、`@Value`、构造器注入已覆盖 99% 场景
- **框架/基础设施仍依赖**：工具类拿 Bean（如 `SpringUtils`）、Spring 内部 Bean 获取容器能力
- **Spring 4.3+ 可直接注入替代**：`@Autowired private ApplicationContext context;`，Spring 把自己注册成了 Bean
- 面试考点不在实用性，在它在生命周期链上的位置和扩展点意义

→ [回答历史](/private/series/答题历史/框架/spring-答题记录.md#spring-aware-接口实际开发中还有用吗)
