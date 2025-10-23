<template><div><h2 id="spring、springboot-的常用注解" tabindex="-1"><a class="header-anchor" href="#spring、springboot-的常用注解"><span>Spring、SpringBoot 的常用注解？</span></a></h2>
<p><strong>回答：</strong></p>
<h4 id="一、核心组件注解" tabindex="-1"><a class="header-anchor" href="#一、核心组件注解"><span>一、核心组件注解</span></a></h4>
<ul>
<li><code v-pre>@Component</code>：通用组件，注入 Spring 容器</li>
<li><code v-pre>@Service</code>：业务层组件</li>
<li><code v-pre>@Repository</code>：持久层组件，支持异常转换</li>
<li><code v-pre>@Controller</code>：控制器组件</li>
<li><code v-pre>@RestController</code>：<code v-pre>@Controller + @ResponseBody</code>，返回 JSON</li>
<li><code v-pre>@Configuration</code>：配置类</li>
<li><code v-pre>@Bean</code>：方法定义 Bean，常配合 <code v-pre>@Configuration</code> 使用</li>
<li><code v-pre>@ComponentScan</code>：指定扫描路径</li>
<li><code v-pre>@Import</code>：导入配置类或组件</li>
</ul>
<h4 id="二、依赖注入相关" tabindex="-1"><a class="header-anchor" href="#二、依赖注入相关"><span>二、依赖注入相关</span></a></h4>
<ul>
<li><code v-pre>@Autowired</code>：按类型注入</li>
<li><code v-pre>@Qualifier</code>：配合 <code v-pre>@Autowired</code> 指定 Bean 名称</li>
<li><code v-pre>@Resource</code>：JSR 标准注解，默认按名称注入</li>
<li><code v-pre>@Value</code>：注入配置值</li>
<li><code v-pre>@Scope</code>：指定作用域（singleton、prototype）</li>
<li><code v-pre>@Lazy</code>：延迟加载</li>
<li><code v-pre>@PostConstruct</code>：初始化后执行</li>
<li><code v-pre>@PreDestroy</code>：销毁前执行</li>
</ul>
<h4 id="三、aop-注解" tabindex="-1"><a class="header-anchor" href="#三、aop-注解"><span>三、AOP 注解</span></a></h4>
<ul>
<li><code v-pre>@Aspect</code>：声明切面类</li>
<li><code v-pre>@Pointcut</code>：定义切入点</li>
<li><code v-pre>@Before / @After / @Around</code>：通知类型（前置、后置、环绕等）</li>
<li><code v-pre>@Order</code>：切面优先级</li>
</ul>
<h4 id="四、事务管理" tabindex="-1"><a class="header-anchor" href="#四、事务管理"><span>四、事务管理</span></a></h4>
<ul>
<li><code v-pre>@Transactional</code>：声明事务</li>
<li><code v-pre>@EnableTransactionManagement</code>：开启事务注解支持</li>
</ul>
<h4 id="五、spring-mvc-注解" tabindex="-1"><a class="header-anchor" href="#五、spring-mvc-注解"><span>五、Spring MVC 注解</span></a></h4>
<ul>
<li><code v-pre>@RequestMapping</code>：请求映射</li>
<li><code v-pre>@GetMapping / @PostMapping</code>：简化请求映射</li>
<li><code v-pre>@RequestParam</code>：获取请求参数</li>
<li><code v-pre>@PathVariable</code>：路径变量</li>
<li><code v-pre>@RequestBody / @ResponseBody</code>：接收/响应 JSON</li>
<li><code v-pre>@RequestHeader / @CookieValue</code>：获取请求头/Cookie</li>
<li><code v-pre>@ModelAttribute</code>：绑定表单数据</li>
<li><code v-pre>@ExceptionHandler</code>：处理异常</li>
<li><code v-pre>@ControllerAdvice / @RestControllerAdvice</code>：全局异常处理</li>
</ul>
<h4 id="六、springboot-注解" tabindex="-1"><a class="header-anchor" href="#六、springboot-注解"><span>六、SpringBoot 注解</span></a></h4>
<ul>
<li><code v-pre>@SpringBootApplication</code>：启动类注解，整合多项功能</li>
<li><code v-pre>@EnableAutoConfiguration</code>：开启自动配置</li>
<li><code v-pre>@SpringBootTest</code>：SpringBoot 测试类注解</li>
<li><code v-pre>@ConfigurationProperties</code>：绑定配置到 Bean</li>
<li><code v-pre>@EnableConfigurationProperties</code>：启用配置绑定支持</li>
<li><code v-pre>@PropertySource</code>：引入外部属性文件</li>
<li><code v-pre>@WebMvcTest / @DataJpaTest</code>：用于分层测试</li>
<li><code v-pre>@TestConfiguration</code>：测试配置类</li>
<li><code v-pre>@MockBean</code>：测试替换 Bean</li>
<li><code v-pre>@RefreshScope</code>：配置中心动态刷新支持</li>
</ul>
<h2 id="spring-boot-的启动流程" tabindex="-1"><a class="header-anchor" href="#spring-boot-的启动流程"><span>Spring Boot 的启动流程</span></a></h2>
<p><strong>回答：</strong><br>
Spring Boot 应用的启动入口是 <code v-pre>SpringApplication.run()</code>，其流程大致如下：</p>
<ol>
<li><strong>启动引导</strong></li>
</ol>
<ul>
<li>执行 <code v-pre>SpringApplication.run(MainClass.class, args)</code>。</li>
<li>创建 <code v-pre>SpringApplication</code> 对象，初始化配置。</li>
</ul>
<ol start="2">
<li><strong>准备环境</strong></li>
</ol>
<ul>
<li>加载配置文件（<code v-pre>application.yml</code> / <code v-pre>application.properties</code>）。</li>
<li>准备 <code v-pre>Environment</code>（包括系统环境变量、命令行参数等）。</li>
</ul>
<ol start="3">
<li><strong>创建并刷新容器</strong></li>
</ol>
<ul>
<li>创建 <code v-pre>ApplicationContext</code>（默认是 <code v-pre>AnnotationConfigServletWebServerApplicationContext</code>）。</li>
<li>扫描主启动类所在包及子包的组件。</li>
<li>加载 Bean 定义并实例化 Bean。</li>
<li>执行自动装配（Spring Boot Starter 自动配置）。</li>
</ul>
<ol start="4">
<li><strong>创建 Web 容器</strong>（如果是 Web 项目）</li>
</ol>
<ul>
<li>内置 Tomcat/Jetty/Undertow 启动。</li>
<li>将 DispatcherServlet 注册到容器。</li>
</ul>
<ol start="5">
<li><strong>调用运行器</strong></li>
</ol>
<ul>
<li>执行实现了 <code v-pre>ApplicationRunner</code> 和 <code v-pre>CommandLineRunner</code> 接口的 Bean，用于启动后执行自定义逻辑。</li>
</ul>
<ol start="6">
<li><strong>应用就绪</strong></li>
</ol>
<ul>
<li>Spring Boot 应用完全启动，监听端口，接受请求。</li>
</ul>
<p>👉 <strong>总结：</strong><br>
Spring Boot 启动流程 = <strong>创建 SpringApplication → 准备环境 → 创建容器 → 自动配置 → 启动 Web 服务器 → 调用运行器 → 应用就绪</strong></p>
<h2 id="什么是-spring-它有哪些核心模块" tabindex="-1"><a class="header-anchor" href="#什么是-spring-它有哪些核心模块"><span>什么是 Spring？它有哪些核心模块？</span></a></h2>
<p><strong>回答：</strong><br>
Spring 是一个轻量级的 Java 开发框架，核心模块包括：</p>
<ul>
<li>Spring Core（IOC 容器）</li>
<li>Spring AOP（面向切面编程）</li>
<li>Spring MVC（Web 框架）</li>
<li>Spring Data、Spring Security 等</li>
</ul>
<h2 id="什么是-ioc-和-aop" tabindex="-1"><a class="header-anchor" href="#什么是-ioc-和-aop"><span>什么是 IOC 和 AOP？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>IOC（控制反转）：对象创建与依赖注入由容器管理，降低耦合。</li>
<li>AOP（面向切面编程）：用来处理日志、事务等横切逻辑。</li>
</ul>
<h2 id="你对-ioc-和-aop-的理解" tabindex="-1"><a class="header-anchor" href="#你对-ioc-和-aop-的理解"><span>你对 IoC 和 AOP 的理解</span></a></h2>
<p><strong>回答：</strong></p>
<p><strong>IoC（控制反转）</strong></p>
<ul>
<li>核心思想：对象的创建和依赖关系由 <strong>Spring 容器</strong> 来管理，而不是由代码主动去 new。</li>
<li>体现形式：<strong>依赖注入（DI）</strong>，通过 <code v-pre>@Autowired</code>、<code v-pre>@Resource</code> 等方式将依赖交给容器注入。</li>
<li>优点：降低耦合、提高可维护性和可测试性。</li>
</ul>
<p><strong>AOP（面向切面编程）</strong></p>
<ul>
<li>核心思想：把通用的、与业务无关的功能（如日志、事务、权限、缓存）从业务逻辑中抽离出来，通过“切面”进行统一处理。</li>
<li>体现形式：Spring 通过 <strong>动态代理（JDK 动态代理 / CGLIB）</strong> 实现，在运行时织入切面逻辑。</li>
<li>优点：提高代码复用性，增强代码的可维护性，让业务代码更简洁。</li>
</ul>
<h2 id="aop-的常用注解有哪些-实现原理" tabindex="-1"><a class="header-anchor" href="#aop-的常用注解有哪些-实现原理"><span>AOP 的常用注解有哪些？实现原理？</span></a></h2>
<p><strong>回答：</strong></p>
<h4 id="一、常用注解" tabindex="-1"><a class="header-anchor" href="#一、常用注解"><span>一、常用注解</span></a></h4>
<p>Spring AOP 基于 AspectJ 提供注解式切面编程，主要注解包括：</p>
<ul>
<li><code v-pre>@Aspect</code>：声明该类是切面类，通常配合 <code v-pre>@Component</code> 一起使用。</li>
<li><code v-pre>@Pointcut</code>：定义切入点表达式，用于定位哪些方法需要织入增强逻辑。</li>
<li><code v-pre>@Before</code>：前置通知，在目标方法执行前执行。</li>
<li><code v-pre>@After</code>：后置通知，无论方法是否抛异常都会执行。</li>
<li><code v-pre>@AfterReturning</code>：返回通知，目标方法正常返回后执行。</li>
<li><code v-pre>@AfterThrowing</code>：异常通知，目标方法抛出异常时执行。</li>
<li><code v-pre>@Around</code>：环绕通知，包裹目标方法执行，可控制执行前后逻辑。</li>
<li><code v-pre>@Order</code>：指定切面执行顺序，值越小优先级越高。</li>
</ul>
<p><strong>示例代码：</strong></p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Aspect</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Component</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Order</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> LogAspect</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Pointcut</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"execution(* com.example.service.*.*(..))"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> serviceMethods</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Before</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"serviceMethods()"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> before</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">JoinPoint</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> jp</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"调用方法前："</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> jp</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getSignature</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getName</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">AfterReturning</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">pointcut</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "serviceMethods()"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> returning</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "result"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> afterReturn</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Object</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> result</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"返回值："</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> result);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">AfterThrowing</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">pointcut</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "serviceMethods()"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> throwing</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "ex"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> afterThrow</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Exception</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> ex</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"异常："</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> ex</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getMessage</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Around</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"serviceMethods()"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Object</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> around</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">ProceedingJoinPoint</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> pjp</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> throws</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Throwable</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"方法开始"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        Object</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> res</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> pjp</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">proceed</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"方法结束"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> res;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="二、实现原理" tabindex="-1"><a class="header-anchor" href="#二、实现原理"><span>二、实现原理</span></a></h4>
<p>Spring AOP 的核心原理是<RouteLink to="/series/knowledge/Java/java.html#java%E4%B8%AD%E7%9A%84%E4%BB%A3%E7%90%86%E6%A8%A1%E5%BC%8F"><strong>动态代理（Proxy）</strong></RouteLink>，在运行时为目标对象生成代理对象，将通知逻辑织入目标方法的前后。</p>
<h4 id="四、关键组件说明" tabindex="-1"><a class="header-anchor" href="#四、关键组件说明"><span>四、关键组件说明</span></a></h4>
<table>
<thead>
<tr>
<th>组件</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>ProxyFactory</code></td>
<td>决定使用 JDK 代理或 CGLIB</td>
</tr>
<tr>
<td><code v-pre>Advisor</code></td>
<td>包含切入点和通知的封装对象</td>
</tr>
<tr>
<td><code v-pre>MethodInterceptor</code></td>
<td>方法拦截器，执行通知逻辑</td>
</tr>
<tr>
<td><code v-pre>JoinPoint</code></td>
<td>方法调用等连接点的上下文</td>
</tr>
<tr>
<td><code v-pre>ProceedingJoinPoint</code></td>
<td>环绕通知中控制目标方法执行</td>
</tr>
</tbody>
</table>
<h4 id="五、spring-aop-与-aspectj-区别" tabindex="-1"><a class="header-anchor" href="#五、spring-aop-与-aspectj-区别"><span>五、Spring AOP 与 AspectJ 区别</span></a></h4>
<table>
<thead>
<tr>
<th>特性</th>
<th>Spring AOP</th>
<th>AspectJ</th>
</tr>
</thead>
<tbody>
<tr>
<td>实现方式</td>
<td>动态代理（JDK/CGLIB）</td>
<td>编译期或加载期织入</td>
</tr>
<tr>
<td>支持范围</td>
<td>方法级（Spring Bean）</td>
<td>更广泛（字段、构造器）</td>
</tr>
<tr>
<td>配置复杂度</td>
<td>简单（注解或 XML）</td>
<td>略复杂（需编译器支持）</td>
</tr>
<tr>
<td>性能</td>
<td>较低（运行时代理）</td>
<td>高（编译期织入）</td>
</tr>
</tbody>
</table>
<h2 id="spring-是如何实现依赖注入的-底层是如何实现的" tabindex="-1"><a class="header-anchor" href="#spring-是如何实现依赖注入的-底层是如何实现的"><span><strong>Spring 是如何实现依赖注入的？底层是如何实现的？</strong></span></a></h2>
<p>Spring 的依赖注入（DI）通过 IoC 容器 + 反射机制，在运行时动态地将 Bean 的依赖注入进去，核心流程如下：</p>
<h4 id="一、基本概念" tabindex="-1"><a class="header-anchor" href="#一、基本概念"><span>一、基本概念</span></a></h4>
<ul>
<li><strong>依赖注入（DI）</strong>：由 Spring 容器负责创建对象并注入其依赖，降低耦合。</li>
<li><strong>控制反转（IoC）</strong>：对象不主动获取依赖，而是由容器“推”进来。</li>
</ul>
<h4 id="二、底层实现流程" tabindex="-1"><a class="header-anchor" href="#二、底层实现流程"><span>二、底层实现流程</span></a></h4>
<h5 id="_1-解析配置-生成-beandefinition" tabindex="-1"><a class="header-anchor" href="#_1-解析配置-生成-beandefinition"><span>1. 解析配置，生成 BeanDefinition</span></a></h5>
<ul>
<li>解析注解/XML/配置类，封装为 <code v-pre>BeanDefinition</code>（包含类名、作用域、依赖等）。</li>
<li>注册到 <code v-pre>BeanDefinitionRegistry</code> 中。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">BeanDefinition</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> bd </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> RootBeanDefinition</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">UserServiceImpl</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">class</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">registry</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">registerBeanDefinition</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"userService"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">, bd);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_2-实例化-bean-反射创建对象" tabindex="-1"><a class="header-anchor" href="#_2-实例化-bean-反射创建对象"><span>2. 实例化 Bean（反射创建对象）</span></a></h5>
<ul>
<li>容器根据 <code v-pre>BeanDefinition</code> 使用反射调用构造函数创建实例。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Class</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#C678DD">?</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> clazz </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> Class</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">forName</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">beanDefinition</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getClassName</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Object</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> instance </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> clazz</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getDeclaredConstructor</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">newInstance</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_3-依赖注入-属性-构造函数-setter" tabindex="-1"><a class="header-anchor" href="#_3-依赖注入-属性-构造函数-setter"><span>3. 依赖注入（属性/构造函数/Setter）</span></a></h5>
<ul>
<li>容器根据类型或名称查找依赖 Bean。</li>
<li>使用反射注入依赖（字段、Setter、构造方法）。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Field</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> field </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> clazz</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getDeclaredField</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"userService"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">field</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">setAccessible</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">true</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">field</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">set</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(beanInstance, userServiceBean);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_4-beanpostprocessor-处理-如-autowired" tabindex="-1"><a class="header-anchor" href="#_4-beanpostprocessor-处理-如-autowired"><span>4. BeanPostProcessor 处理（如 @Autowired）</span></a></h5>
<ul>
<li><code v-pre>AutowiredAnnotationBeanPostProcessor</code> 扫描字段/方法上的 <code v-pre>@Autowired</code>。</li>
<li>查找依赖 Bean 并注入。</li>
</ul>
<hr>
<h4 id="三、注解注入流程-autowired" tabindex="-1"><a class="header-anchor" href="#三、注解注入流程-autowired"><span>三、注解注入流程（@Autowired）</span></a></h4>
<ol>
<li><code v-pre>@ComponentScan</code> 扫描 Bean 并注册为 <code v-pre>BeanDefinition</code></li>
<li>实例化 Bean</li>
<li><code v-pre>AutowiredAnnotationBeanPostProcessor</code> 处理字段/方法注入</li>
<li>通过类型匹配查找依赖 Bean 并反射注入</li>
</ol>
<hr>
<h4 id="四、常见注入方式" tabindex="-1"><a class="header-anchor" href="#四、常见注入方式"><span>四、常见注入方式</span></a></h4>
<ul>
<li>
<p><strong>构造函数注入（推荐）</strong>：强依赖、不可变、支持 <code v-pre>final</code> 字段</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> UserController</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">UserService</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> userService) {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    this</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">userService</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> userService</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>Setter 注入</strong>：可选依赖、可变性</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Autowired</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> setUserService</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">UserService</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> userService) {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    this</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">userService</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> userService</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>字段注入</strong>（不推荐）：不利于测试和解耦</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Autowired</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">private</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> UserService</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> userService</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ul>
<h4 id="为什么不推荐注解注入" tabindex="-1"><a class="header-anchor" href="#为什么不推荐注解注入"><span>为什么不推荐注解注入？</span></a></h4>
<ul>
<li><strong>侵入性强</strong>：需在类中添加 Spring 注解，降低代码复用性与可测试性</li>
<li><strong>不利于单元测试</strong>：难以 mock 依赖，测试耦合度高,使用注解注入时，依赖对象由 Spring 容器自动注入，无法直接传入自定义的 mock 实例,为了让注解生效，必须启动 Spring 上下文（如用 @SpringBootTest），启动成本高、测试慢。</li>
<li><strong>不清晰的依赖关系</strong>：构造注入显式声明依赖，方便阅读与维护</li>
<li><strong>运行时报错</strong>：注解注入依赖缺失时为运行时报错，构造注入可编译时报错</li>
</ul>
<h4 id="五、循环依赖解决机制-单例" tabindex="-1"><a class="header-anchor" href="#五、循环依赖解决机制-单例"><span>五、循环依赖解决机制（单例）</span></a></h4>
<p>Spring 使用 <strong>三级缓存</strong> 解决构造器循环依赖（仅限单例 &amp; 非构造器注入）：</p>
<ol>
<li><strong>singletonFactories</strong>：一级缓存，存放 <code v-pre>ObjectFactory</code>，用于生成早期代理对象</li>
<li><strong>earlySingletonObjects</strong>：二级缓存，存放早期暴露的半成品 Bean（未填充属性）</li>
<li><strong>singletonObjects</strong>：三级缓存，存放完全初始化好的 Bean</li>
</ol>
<p>流程简要：创建 Bean → 放入 <code v-pre>singletonFactories</code> → 创建实例 → 放入 <code v-pre>earlySingletonObjects</code> → 填充属性 → 初始化 → 放入 <code v-pre>singletonObjects</code></p>
<blockquote>
<p>构造器注入无法提前暴露对象，无法参与三级缓存，不支持构造器循环依赖</p>
</blockquote>
<h4 id="六、spring-5-构造注入改进" tabindex="-1"><a class="header-anchor" href="#六、spring-5-构造注入改进"><span>六、Spring 5+ 构造注入改进</span></a></h4>
<ul>
<li>单构造器类可省略 <code v-pre>@Autowired</code>，Spring 自动推断注入</li>
<li>支持不可变类（<code v-pre>final</code> 字段）构造注入</li>
<li>编译期检查依赖是否满足，提前暴露错误，提升安全性</li>
<li>推荐在配置类（<code v-pre>@Configuration</code>）中也使用构造注入，保证依赖清晰</li>
</ul>
<h2 id="第三方的-bean-如何交给-spring-管理" tabindex="-1"><a class="header-anchor" href="#第三方的-bean-如何交给-spring-管理"><span>第三方的 Bean 如何交给 Spring 管理？</span></a></h2>
<h4 id="_1-使用-bean-注解注册到-spring-容器" tabindex="-1"><a class="header-anchor" href="#_1-使用-bean-注解注册到-spring-容器"><span>1. <strong>使用 <code v-pre>@Bean</code> 注解注册到 Spring 容器</strong></span></a></h4>
<p>在配置类中通过工厂方法手动创建：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Configuration</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> AppConfig</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Bean</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> RestTemplate</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> restTemplate</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        return</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> RestTemplate</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>适用于无法修改源码的第三方类。</p>
<h4 id="_2-使用-import-导入配置类" tabindex="-1"><a class="header-anchor" href="#_2-使用-import-导入配置类"><span>2. <strong>使用 <code v-pre>@Import</code> 导入配置类</strong></span></a></h4>
<p>如果第三方提供了带有 <code v-pre>@Bean</code> 的配置类，可使用：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Import</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">ThirdPartyConfig</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">class</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> AppConfig</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3-使用-componentscan-配合自定义封装类" tabindex="-1"><a class="header-anchor" href="#_3-使用-componentscan-配合自定义封装类"><span>3. <strong>使用 <code v-pre>@ComponentScan</code> 配合自定义封装类</strong></span></a></h4>
<p>若第三方类可被自定义封装，则可在自定义类上加 <code v-pre>@Component</code>，并配置扫描路径：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Component</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> MyRedisClient</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> final</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> RedisClient</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> client </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> RedisClient</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_4-通过-xml-配置注册-bean-不常用" tabindex="-1"><a class="header-anchor" href="#_4-通过-xml-配置注册-bean-不常用"><span>4. <strong>通过 XML 配置注册 Bean</strong>（不常用）</span></a></h4>
<div class="language-xml line-numbers-mode" data-highlighter="shiki" data-ext="xml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-xml"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">bean</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> id</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"restTemplate"</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> class</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"org.springframework.web.client.RestTemplate"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">/></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h4 id="_5-使用-factorybean-自定义实例化逻辑" tabindex="-1"><a class="header-anchor" href="#_5-使用-factorybean-自定义实例化逻辑"><span>5. <strong>使用 <code v-pre>FactoryBean</code> 自定义实例化逻辑</strong></span></a></h4>
<p>适用于创建复杂第三方 Bean：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> MyFactoryBean</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> implements</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> FactoryBean</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">ThirdPartyBean</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Override</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ThirdPartyBean</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> getObject</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        return</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ThirdPartyBean</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(...);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    ...</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注册方式：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Bean</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> MyFactoryBean</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> myFactoryBean</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    return</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyFactoryBean</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="bean-的生命周期" tabindex="-1"><a class="header-anchor" href="#bean-的生命周期"><span>Bean 的生命周期</span></a></h2>
<p><strong>回答：</strong><br>
Spring Bean 的生命周期主要分为以下几个阶段：</p>
<ol>
<li><strong>实例化（Instantiation）</strong></li>
</ol>
<ul>
<li>Spring 容器通过反射创建 Bean 对象。</li>
</ul>
<ol start="2">
<li><strong>属性赋值（Populate）</strong></li>
</ol>
<ul>
<li>依赖注入（DI），为 Bean 设置属性。</li>
</ul>
<ol start="3">
<li><strong>初始化前（BeanPostProcessor.before）</strong></li>
</ol>
<ul>
<li>调用 <code v-pre>BeanPostProcessor</code> 的 <code v-pre>postProcessBeforeInitialization</code>。</li>
</ul>
<ol start="4">
<li><strong>初始化（Initialization）</strong></li>
</ol>
<ul>
<li>执行 <code v-pre>InitializingBean.afterPropertiesSet()</code>。</li>
<li>或调用配置的 <code v-pre>init-method</code> 方法。</li>
</ul>
<ol start="5">
<li><strong>初始化后（BeanPostProcessor.after）</strong></li>
</ol>
<ul>
<li>调用 <code v-pre>BeanPostProcessor</code> 的 <code v-pre>postProcessAfterInitialization</code>。</li>
</ul>
<ol start="6">
<li><strong>使用中（In use）</strong></li>
</ol>
<ul>
<li>Bean 被应用程序使用。</li>
</ul>
<ol start="7">
<li><strong>销毁（Destroy）</strong></li>
</ol>
<ul>
<li>容器关闭时，调用 <code v-pre>DisposableBean.destroy()</code>。</li>
<li>或调用配置的 <code v-pre>destroy-method</code> 方法。</li>
</ul>
<p>👉 <strong>总结：</strong><br>
Bean 生命周期 = <strong>实例化 → 属性赋值 → 初始化前处理 → 初始化 → 初始化后处理 → 使用 → 销毁</strong>。</p>
<h2 id="autowired-和-resource-的区别" tabindex="-1"><a class="header-anchor" href="#autowired-和-resource-的区别"><span>@Autowired 和 @Resource 的区别</span></a></h2>
<p><strong>回答：</strong></p>
<ol>
<li><strong>来源不同</strong></li>
</ol>
<ul>
<li><code v-pre>@Autowired</code>：Spring 提供，属于 <strong>Spring 框架注解</strong>。</li>
<li><code v-pre>@Resource</code>：JDK 提供，属于 <strong>JSR-250 规范注解</strong>。</li>
</ul>
<ol start="2">
<li><strong>注入方式</strong></li>
</ol>
<ul>
<li><code v-pre>@Autowired</code>：默认按 <strong>类型（byType）</strong> 注入，如果存在多个同类型 Bean，则需要配合 <code v-pre>@Qualifier</code> 或 <code v-pre>@Primary</code> 指定。</li>
<li><code v-pre>@Resource</code>：默认按 <strong>名称（byName）</strong> 注入，如果找不到同名 Bean，才会按类型注入。</li>
</ul>
<ol start="3">
<li><strong>required 属性</strong></li>
</ol>
<ul>
<li><code v-pre>@Autowired</code>：有 <code v-pre>required</code> 属性，默认为 <code v-pre>true</code>，如果没有匹配的 Bean 会报错，可以设置 <code v-pre>required = false</code>。</li>
<li><code v-pre>@Resource</code>：没有 <code v-pre>required</code> 属性，如果没有找到 Bean 也会直接报错。</li>
</ul>
<ol start="4">
<li><strong>使用场景</strong></li>
</ol>
<ul>
<li><code v-pre>@Autowired</code>：更适合在 Spring 项目中使用，配合 Spring 的 IoC 和 AOP 特性。</li>
<li><code v-pre>@Resource</code>：在需要兼容 JDK 规范或更关注名称匹配时使用。</li>
</ul>
<p>👉 <strong>总结</strong>：</p>
<ul>
<li><code v-pre>@Autowired</code>：<strong>按类型注入</strong>，Spring 专用，支持 <code v-pre>required</code></li>
<li><code v-pre>@Resource</code>：<strong>按名称注入</strong>，JDK 标准，更通用</li>
</ul>
<h2 id="spring-boot自动配置机制与组件扫描" tabindex="-1"><a class="header-anchor" href="#spring-boot自动配置机制与组件扫描"><span>Spring Boot自动配置机制与组件扫描</span></a></h2>
<h3 id="spring-boot-自动配置和组件扫描有什么区别" tabindex="-1"><a class="header-anchor" href="#spring-boot-自动配置和组件扫描有什么区别"><span>Spring Boot 自动配置和组件扫描有什么区别？</span></a></h3>
<p><strong>答案要点：</strong></p>
<ul>
<li>组件扫描用于业务组件注册，自动配置用于框架集成和默认配置</li>
<li>组件扫描无条件注册，自动配置通过条件化注解决定是否加载</li>
<li>实现机制不同：<code v-pre>@ComponentScan</code> vs <code v-pre>@EnableAutoConfiguration</code></li>
<li>组件扫描控制粒度是包路径，自动配置粒度更细，可基于类、Bean、配置属性</li>
</ul>
<h3 id="什么场景下应该使用自动配置而不是简单的-component" tabindex="-1"><a class="header-anchor" href="#什么场景下应该使用自动配置而不是简单的-component"><span>什么场景下应该使用自动配置而不是简单的 @Component？</span></a></h3>
<p><strong>答案要点：</strong></p>
<ul>
<li>第三方库集成（如 Redis、MQ 客户端）</li>
<li>功能模块可选（通过配置启用/禁用）</li>
<li>提供默认实现但允许用户覆盖</li>
<li>根据环境差异提供不同配置（如开发/生产）</li>
</ul>
<h3 id="conditionalonmissingbean-有什么作用" tabindex="-1"><a class="header-anchor" href="#conditionalonmissingbean-有什么作用"><span>@ConditionalOnMissingBean 有什么作用？</span></a></h3>
<p><strong>答案要点：</strong></p>
<ul>
<li>避免重复注册 Bean</li>
<li>如果用户已定义相同类型的 Bean，则跳过默认 Bean</li>
<li>提供默认实现的同时，保留用户自定义空间</li>
</ul>
<h3 id="spring-boot-2-4-为什么引入-autoconfiguration-imports-替代-spring-factories" tabindex="-1"><a class="header-anchor" href="#spring-boot-2-4-为什么引入-autoconfiguration-imports-替代-spring-factories"><span>Spring Boot 2.4 为什么引入 AutoConfiguration.imports 替代 spring.factories？</span></a></h3>
<p><strong>答案要点：</strong></p>
<ul>
<li>简化语法：每行一个配置类，无需 Key-Value</li>
<li>可维护性更好，支持模块化管理</li>
<li>性能更优：避免 Properties 解析，直接逐行读取</li>
<li>更符合单一职责原则</li>
</ul>
<h3 id="如何排查某个自动配置类是否生效" tabindex="-1"><a class="header-anchor" href="#如何排查某个自动配置类是否生效"><span>如何排查某个自动配置类是否生效？</span></a></h3>
<p><strong>答案要点：</strong></p>
<ol>
<li>启动时查看日志 <code v-pre>--debug</code>，Spring Boot 会打印条件评估报告</li>
<li>使用 <code v-pre>@ConditionalOn...</code> 注解逐一排查条件是否满足</li>
<li>查看 <code v-pre>META-INF/spring</code> 下的配置文件是否正确声明了配置类</li>
<li>使用 Actuator 的 <code v-pre>conditions</code> 端点查看自动配置报告</li>
</ol>
</div></template>


