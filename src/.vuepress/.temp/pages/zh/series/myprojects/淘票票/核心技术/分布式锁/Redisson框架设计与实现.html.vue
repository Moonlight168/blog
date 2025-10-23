<template><div><h1 id="淘票票redisson框架设计与实现详解" tabindex="-1"><a class="header-anchor" href="#淘票票redisson框架设计与实现详解"><span>淘票票Redisson框架设计与实现详解</span></a></h1>
<p>在淘票票高并发系统中，Redisson框架扮演着至关重要的角色。该框架基于Redisson客户端封装了分布式锁、防重复执行、布隆过滤器等多个核心组件，为系统提供了高可用、高性能的分布式协调能力。</p>
<h2 id="一、模块结构概览" tabindex="-1"><a class="header-anchor" href="#一、模块结构概览"><span>一、模块结构概览</span></a></h2>
<p>淘票票Redisson框架采用模块化设计，主要包括以下几个子模块：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>taopiaopiao-redisson-framework</span></span>
<span class="line"><span>├── taopiaopiao-redisson-service-framework</span></span>
<span class="line"><span>│   ├── taopiaopiao-redisson-common-framework     # 公共配置模块</span></span>
<span class="line"><span>│   ├── taopiaopiao-service-lock-framework        # 分布式锁模块</span></span>
<span class="line"><span>│   ├── taopiaopiao-repeat-execute-limit-framework # 防重复执行模块</span></span>
<span class="line"><span>│   └── taopiaopiao-bloom-filter-framework        # 布隆过滤器模块</span></span>
<span class="line"><span>└── taopiaopiao-service-delay-queue-framework     # 延迟队列模块</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-1-模块依赖关系" tabindex="-1"><a class="header-anchor" href="#_1-1-模块依赖关系"><span>1.1 模块依赖关系</span></a></h3>
<p>各模块之间具有清晰的依赖关系：</p>
<ul>
<li><code v-pre>taopiaopiao-redisson-common-framework</code>：作为基础模块，被其他所有模块依赖</li>
<li><code v-pre>taopiaopiao-service-lock-framework</code>：核心分布式锁实现，被防重复执行模块依赖</li>
<li><code v-pre>taopiaopiao-repeat-execute-limit-framework</code>：依赖分布式锁模块，实现防重复执行功能</li>
<li><code v-pre>taopiaopiao-bloom-filter-framework</code>：独立的布隆过滤器实现</li>
<li><code v-pre>taopiaopiao-service-delay-queue-framework</code>：延迟队列实现，依赖公共模块</li>
</ul>
<h2 id="二、核心模块详解" tabindex="-1"><a class="header-anchor" href="#二、核心模块详解"><span>二、核心模块详解</span></a></h2>
<h3 id="_2-1-taopiaopiao-redisson-common-framework-公共配置模块" tabindex="-1"><a class="header-anchor" href="#_2-1-taopiaopiao-redisson-common-framework-公共配置模块"><span>2.1 taopiaopiao-redisson-common-framework（公共配置模块）</span></a></h3>
<p>该模块是整个Redisson框架的基础，提供了通用的配置和抽象类：</p>
<h4 id="_2-1-1-核心组件" tabindex="-1"><a class="header-anchor" href="#_2-1-1-核心组件"><span>2.1.1 核心组件</span></a></h4>
<ol>
<li>
<p><strong>RedissonCommonAutoConfiguration</strong></p>
<ul>
<li>Redisson客户端配置和初始化</li>
<li>提供RedissonDataHandle、LocalLockCache等基础Bean</li>
<li>初始化LockInfoHandleFactory工厂类</li>
</ul>
</li>
<li>
<p><strong>LockInfoHandle接口及实现</strong></p>
<ul>
<li>抽象锁信息处理器，定义锁名称生成规范</li>
<li>提供基于SpEL表达式的动态锁名称生成能力</li>
</ul>
</li>
<li>
<p><strong>常量定义</strong></p>
<ul>
<li>LockInfoType：定义不同业务场景的锁类型标识</li>
</ul>
</li>
</ol>
<h4 id="_2-1-2-设计理念" tabindex="-1"><a class="header-anchor" href="#_2-1-2-设计理念"><span>2.1.2 设计理念</span></a></h4>
<p>该模块采用工厂模式和策略模式相结合的设计：</p>
<ul>
<li>LockInfoHandleFactory通过ApplicationContext动态获取不同类型的锁信息处理器</li>
<li>通过LockInfoType常量标识不同类型处理器，实现解耦</li>
</ul>
<h3 id="_2-2-taopiaopiao-service-lock-framework-分布式锁模块" tabindex="-1"><a class="header-anchor" href="#_2-2-taopiaopiao-service-lock-framework-分布式锁模块"><span>2.2 taopiaopiao-service-lock-framework（分布式锁模块）</span></a></h3>
<p>这是整个框架的核心模块，提供了完整的分布式锁解决方案。</p>
<h4 id="_2-2-1-核心组件" tabindex="-1"><a class="header-anchor" href="#_2-2-1-核心组件"><span>2.2.1 核心组件</span></a></h4>
<ol>
<li>
<p><strong>ServiceLock注解</strong></p>
<ul>
<li>声明式分布式锁的入口</li>
<li>支持多种锁类型（可重入锁、公平锁、读锁、写锁）</li>
<li>支持自定义锁超时策略</li>
</ul>
</li>
<li>
<p><strong>ServiceLockAspect切面</strong></p>
<ul>
<li>通过AOP实现声明式分布式锁</li>
<li>负责锁的获取、释放和超时处理</li>
<li>与Spring框架无缝集成</li>
</ul>
</li>
<li>
<p><strong>ServiceLocker接口及实现类</strong></p>
<ul>
<li>定义分布式锁操作规范</li>
<li>RedissonReentrantLocker：可重入锁实现</li>
<li>RedissonFairLocker：公平锁实现</li>
<li>RedissonReadLocker/RedissonWriteLocker：读写锁实现</li>
</ul>
</li>
<li>
<p><strong>ServiceLockFactory工厂类</strong></p>
<ul>
<li>根据锁类型创建对应的锁实现</li>
<li>通过ManageLocker管理器获取具体锁实例</li>
</ul>
</li>
<li>
<p><strong>工具类</strong></p>
<ul>
<li>ServiceLockTool：编程式使用分布式锁的工具类</li>
<li>支持有返回值和无返回值的任务执行</li>
</ul>
</li>
</ol>
<h4 id="_2-2-2-类关系图" tabindex="-1"><a class="header-anchor" href="#_2-2-2-类关系图"><span>2.2.2 类关系图</span></a></h4>
<div class="language-mermaid line-numbers-mode" data-highlighter="shiki" data-ext="mermaid" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-mermaid"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">classDiagram</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class ServiceLock {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        &#x3C;&#x3C;annotation>></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +LockType lockType()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +String name()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +String[] keys()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +long waitTime()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +TimeUnit timeUnit()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +LockTimeOutStrategy lockTimeoutStrategy()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +String customLockTimeoutStrategy()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class ServiceLockAspect {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -LockInfoHandleFactory lockInfoHandleFactory</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -ServiceLockFactory serviceLockFactory</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +around(ProceedingJoinPoint, ServiceLock)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class ServiceLocker {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        &#x3C;&#x3C;Interface>></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +RLock getLock(String lockKey)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +RLock lock(String lockKey)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +boolean tryLock(String lockKey, TimeUnit unit, long waitTime)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +void unlock(String lockKey)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +void unlock(RLock lock)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class RedissonReentrantLocker {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -RedissonClient redissonClient</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class RedissonFairLocker {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -RedissonClient redissonClient</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class RedissonReadLocker {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -RedissonClient redissonClient</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class RedissonWriteLocker {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -RedissonClient redissonClient</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class ServiceLockFactory {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -ManageLocker manageLocker</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +ServiceLocker getLock(LockType lockType)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class ManageLocker {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -RedissonClient redissonClient</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +RedissonReentrantLocker getReentrantLocker()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +RedissonFairLocker getFairLocker()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +RedissonReadLocker getReadLocker()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +RedissonWriteLocker getWriteLocker()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class LockInfoHandle {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        &#x3C;&#x3C;Interface>></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +String getLockName(JoinPoint joinPoint, String name, String[] keys)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +String simpleGetLockName(String name, String[] keys)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class AbstractLockInfoHandle {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        #abstract String getLockPrefixName()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class ServiceLockInfoHandle {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -String LOCK_PREFIX_NAME</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    class LockInfoHandleFactory {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        -ApplicationContext applicationContext</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        +LockInfoHandle getLockInfoHandle(String lockInfoType)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    ServiceLocker &#x3C;|-- RedissonReentrantLocker</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    ServiceLocker &#x3C;|-- RedissonFairLocker</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    ServiceLocker &#x3C;|-- RedissonReadLocker</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    ServiceLocker &#x3C;|-- RedissonWriteLocker</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    ServiceLockAspect --> LockInfoHandleFactory</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    ServiceLockAspect --> ServiceLockFactory</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    ServiceLockFactory --> ManageLocker</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    LockInfoHandle &#x3C;|.. AbstractLockInfoHandle</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    AbstractLockInfoHandle &#x3C;|-- ServiceLockInfoHandle</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    LockInfoHandleFactory --> LockInfoHandle</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    ServiceLockAspect ..> ServiceLock</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-2-3-工作流程" tabindex="-1"><a class="header-anchor" href="#_2-2-3-工作流程"><span>2.2.3 工作流程</span></a></h4>
<ol>
<li>当方法被@ServiceLock注解标记时，ServiceLockAspect会拦截该方法调用</li>
<li>通过LockInfoHandleFactory获取对应的锁信息处理器，生成唯一锁名称</li>
<li>通过ServiceLockFactory获取指定类型的锁实例</li>
<li>尝试获取锁，如果成功则执行方法，失败则执行超时策略</li>
<li>方法执行完成后自动释放锁</li>
</ol>
<h3 id="_2-3-taopiaopiao-repeat-execute-limit-framework-防重复执行模块" tabindex="-1"><a class="header-anchor" href="#_2-3-taopiaopiao-repeat-execute-limit-framework-防重复执行模块"><span>2.3 taopiaopiao-repeat-execute-limit-framework（防重复执行模块）</span></a></h3>
<p>该模块基于分布式锁实现防重复执行功能，主要用于保证接口幂等性。</p>
<h4 id="_2-3-1-核心组件" tabindex="-1"><a class="header-anchor" href="#_2-3-1-核心组件"><span>2.3.1 核心组件</span></a></h4>
<ol>
<li>
<p><strong>RepeatExecuteLimit注解</strong></p>
<ul>
<li>声明式防重复执行标记</li>
<li>支持本地锁和分布式锁双重保障</li>
</ul>
</li>
<li>
<p><strong>RepeatExecuteLimitAspect切面</strong></p>
<ul>
<li>实现防重复执行逻辑</li>
<li>结合本地锁和分布式锁保证高并发下的幂等性</li>
</ul>
</li>
<li>
<p><strong>LocalLockCache本地锁缓存</strong></p>
<ul>
<li>提供本地锁机制，减少Redis访问压力</li>
<li>通过Guava Cache实现本地锁缓存</li>
</ul>
</li>
</ol>
<h4 id="_2-3-2-设计理念" tabindex="-1"><a class="header-anchor" href="#_2-3-2-设计理念"><span>2.3.2 设计理念</span></a></h4>
<p>该模块采用双层锁机制：</p>
<ul>
<li>本地锁：快速响应，减少Redis访问压力</li>
<li>分布式锁：保证分布式环境下的幂等性</li>
</ul>
<h3 id="_2-4-taopiaopiao-bloom-filter-framework-布隆过滤器模块" tabindex="-1"><a class="header-anchor" href="#_2-4-taopiaopiao-bloom-filter-framework-布隆过滤器模块"><span>2.4 taopiaopiao-bloom-filter-framework（布隆过滤器模块）</span></a></h3>
<p>布隆过滤器模块用于快速判断元素是否存在，避免不必要的数据库查询。</p>
<h4 id="_2-4-1-核心组件" tabindex="-1"><a class="header-anchor" href="#_2-4-1-核心组件"><span>2.4.1 核心组件</span></a></h4>
<ol>
<li>
<p><strong>BloomFilterHandler</strong></p>
<ul>
<li>布隆过滤器操作封装</li>
<li>提供添加元素、判断元素是否存在等方法</li>
</ul>
</li>
<li>
<p><strong>BloomFilterProperties</strong></p>
<ul>
<li>布隆过滤器配置属性</li>
<li>支持自定义误判率、预期元素个数等参数</li>
</ul>
</li>
</ol>
<h3 id="_2-5-taopiaopiao-service-delay-queue-framework-延迟队列模块" tabindex="-1"><a class="header-anchor" href="#_2-5-taopiaopiao-service-delay-queue-framework-延迟队列模块"><span>2.5 taopiaopiao-service-delay-queue-framework（延迟队列模块）</span></a></h3>
<p>延迟队列模块基于Redisson实现延迟任务处理。</p>
<h4 id="_2-5-1-核心组件" tabindex="-1"><a class="header-anchor" href="#_2-5-1-核心组件"><span>2.5.1 核心组件</span></a></h4>
<ol>
<li>
<p><strong>ConsumerTask接口</strong></p>
<ul>
<li>延迟任务消费者接口</li>
<li>定义任务执行方法和主题标识</li>
</ul>
</li>
<li>
<p><strong>DelayBaseQueue</strong></p>
<ul>
<li>延迟队列基础实现</li>
<li>提供任务入队、出队等基础操作</li>
</ul>
</li>
</ol>
<h2 id="三、设计优势与特点" tabindex="-1"><a class="header-anchor" href="#三、设计优势与特点"><span>三、设计优势与特点</span></a></h2>
<h3 id="_3-1-高内聚低耦合" tabindex="-1"><a class="header-anchor" href="#_3-1-高内聚低耦合"><span>3.1 高内聚低耦合</span></a></h3>
<p>框架采用模块化设计，每个模块职责明确，模块间依赖关系清晰。通过接口和抽象类定义规范，实现组件间的解耦。</p>
<h3 id="_3-2-声明式与编程式并存" tabindex="-1"><a class="header-anchor" href="#_3-2-声明式与编程式并存"><span>3.2 声明式与编程式并存</span></a></h3>
<p>框架同时支持声明式（注解）和编程式两种使用方式：</p>
<ul>
<li>声明式：通过@ServiceLock等注解，使用简单直观</li>
<li>编程式：通过ServiceLockTool工具类，灵活性更高</li>
</ul>
<h3 id="_3-3-扩展性强" tabindex="-1"><a class="header-anchor" href="#_3-3-扩展性强"><span>3.3 扩展性强</span></a></h3>
<p>框架设计遵循开闭原则，易于扩展：</p>
<ul>
<li>新增锁类型只需实现ServiceLocker接口</li>
<li>新增业务场景可扩展LockInfoHandle处理器</li>
<li>通过工厂模式实现动态获取实例</li>
</ul>
<h3 id="_3-4-高性能设计" tabindex="-1"><a class="header-anchor" href="#_3-4-高性能设计"><span>3.4 高性能设计</span></a></h3>
<ol>
<li>本地锁缓存减少Redis访问压力</li>
<li>连接池化管理提高资源利用率</li>
<li>异步处理机制提升系统吞吐量</li>
</ol>
<h2 id="四、使用示例" tabindex="-1"><a class="header-anchor" href="#四、使用示例"><span>四、使用示例</span></a></h2>
<h3 id="_4-1-分布式锁使用" tabindex="-1"><a class="header-anchor" href="#_4-1-分布式锁使用"><span>4.1 分布式锁使用</span></a></h3>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Service</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> OrderService</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">ServiceLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66">        name</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "create_order"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> </span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66">        keys</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"#userId"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "#orderId"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> </span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66">        waitTime</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 5</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66">        lockTimeoutStrategy</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> LockTimeOutStrategy</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">FAIL</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    )</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> createOrder</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> userId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">, </span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> orderId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 创建订单的业务逻辑</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-2-防重复执行使用" tabindex="-1"><a class="header-anchor" href="#_4-2-防重复执行使用"><span>4.2 防重复执行使用</span></a></h3>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">RestController</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> PaymentController</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">RepeatExecuteLimit</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66">        name</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "pay_order"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> </span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66">        keys</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"#request.orderId"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    )</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">PostMapping</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"/pay"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ApiResponse</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> pay</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">RequestBody</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> PayRequest</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> request</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 支付逻辑</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        return</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> ApiResponse</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">success</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="五、总结" tabindex="-1"><a class="header-anchor" href="#五、总结"><span>五、总结</span></a></h2>
<p>淘票票Redisson框架通过精心设计的模块结构和类关系，实现了高性能、高可用的分布式协调能力。其声明式与编程式并存的使用方式、良好的扩展性以及双层锁机制等特点，使其能够很好地适应高并发场景下的各种需求。该框架不仅满足了淘票票系统的核心需求，也为其他类似系统提供了可复用的解决方案。</p>
</div></template>


