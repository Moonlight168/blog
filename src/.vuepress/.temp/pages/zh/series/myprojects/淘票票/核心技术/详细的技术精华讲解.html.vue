<template><div><h1 id="淘票票项目详细的技术精华讲解" tabindex="-1"><a class="header-anchor" href="#淘票票项目详细的技术精华讲解"><span>淘票票项目详细的技术精华讲解</span></a></h1>
<h2 id="_1-nacos-核心知识点总结" tabindex="-1"><a class="header-anchor" href="#_1-nacos-核心知识点总结"><span>1. Nacos 核心知识点总结</span></a></h2>
<h3 id="_1-1-nacos简介" tabindex="-1"><a class="header-anchor" href="#_1-1-nacos简介"><span>1.1 Nacos简介</span></a></h3>
<p>Nacos是阿里巴巴开源的动态服务发现、配置管理和服务管理平台，是构建以&quot;服务&quot;为中心的现代应用架构的关键组件。</p>
<h3 id="_1-2-淘票票项目中nacos的应用" tabindex="-1"><a class="header-anchor" href="#_1-2-淘票票项目中nacos的应用"><span>1.2 淘票票项目中Nacos的应用</span></a></h3>
<p>在淘票票项目中，Nacos主要承担以下职责：</p>
<ol>
<li>
<p><strong>服务注册与发现</strong></p>
<ul>
<li>所有微服务启动时自动注册到Nacos</li>
<li>服务间调用通过服务名进行，Nacos负责服务发现</li>
<li>支持服务健康检查和自动剔除</li>
</ul>
</li>
<li>
<p><strong>配置管理</strong></p>
<ul>
<li>统一管理各服务的配置信息</li>
<li>支持配置的动态更新，无需重启服务</li>
<li>配置变更时自动推送到各服务实例</li>
</ul>
</li>
<li>
<p><strong>元数据管理</strong></p>
<ul>
<li>存储服务的元数据信息</li>
<li>支持灰度发布中的服务标签管理</li>
</ul>
</li>
</ol>
<h3 id="_1-3-nacos优势" tabindex="-1"><a class="header-anchor" href="#_1-3-nacos优势"><span>1.3 Nacos优势</span></a></h3>
<ul>
<li><strong>高可用性</strong>：支持集群部署，保证服务的高可用</li>
<li><strong>易用性</strong>：提供友好的Web界面进行服务和配置管理</li>
<li><strong>实时性</strong>：配置和服务变更能够实时推送到客户端</li>
<li><strong>兼容性</strong>：支持多种注册中心协议</li>
</ul>
<h2 id="_2-threadlocal-inheritablethreadlocal-transmittablethreadlocal-攻略" tabindex="-1"><a class="header-anchor" href="#_2-threadlocal-inheritablethreadlocal-transmittablethreadlocal-攻略"><span>2. ThreadLocal/InheritableThreadLocal/TransmittableThreadLocal 攻略</span></a></h2>
<h3 id="_2-1-threadlocal" tabindex="-1"><a class="header-anchor" href="#_2-1-threadlocal"><span>2.1 ThreadLocal</span></a></h3>
<p>ThreadLocal为每个线程提供独立的变量副本，解决多线程访问共享变量的安全问题。</p>
<h4 id="淘票票项目中的应用" tabindex="-1"><a class="header-anchor" href="#淘票票项目中的应用"><span>淘票票项目中的应用：</span></a></h4>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">ThreadLocal</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> tl </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ThreadLocal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h4 id="特点" tabindex="-1"><a class="header-anchor" href="#特点"><span>特点：</span></a></h4>
<ul>
<li>每个线程拥有独立的变量副本</li>
<li>线程间数据隔离</li>
<li>需要手动清理，避免内存泄漏</li>
</ul>
<h3 id="_2-2-inheritablethreadlocal" tabindex="-1"><a class="header-anchor" href="#_2-2-inheritablethreadlocal"><span>2.2 InheritableThreadLocal</span></a></h3>
<p>继承自ThreadLocal，允许子线程继承父线程的变量值。</p>
<h4 id="淘票票项目中的应用-1" tabindex="-1"><a class="header-anchor" href="#淘票票项目中的应用-1"><span>淘票票项目中的应用：</span></a></h4>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">InheritableThreadLocal</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> itl </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> TransmittableThreadLocal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h4 id="特点-1" tabindex="-1"><a class="header-anchor" href="#特点-1"><span>特点：</span></a></h4>
<ul>
<li>子线程可以继承父线程的ThreadLocal值</li>
<li>适用于父子线程间的数据传递</li>
<li>但在线程池场景下存在局限性</li>
</ul>
<h3 id="_2-3-transmittablethreadlocal" tabindex="-1"><a class="header-anchor" href="#_2-3-transmittablethreadlocal"><span>2.3 TransmittableThreadLocal</span></a></h3>
<p>阿里巴巴开源的增强版ThreadLocal，解决线程池场景下的数据传递问题。</p>
<h4 id="淘票票项目中的应用-2" tabindex="-1"><a class="header-anchor" href="#淘票票项目中的应用-2"><span>淘票票项目中的应用：</span></a></h4>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">TransmittableThreadLocal</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> ttl </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> TransmittableThreadLocal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h4 id="特点-2" tabindex="-1"><a class="header-anchor" href="#特点-2"><span>特点：</span></a></h4>
<ul>
<li>解决线程池中ThreadLocal值无法传递的问题</li>
<li>支持线程池复用场景下的上下文传递</li>
<li>在淘票票项目中用于传递TraceId等链路追踪信息</li>
</ul>
<h3 id="_2-4-淘票票项目中的最佳实践" tabindex="-1"><a class="header-anchor" href="#_2-4-淘票票项目中的最佳实践"><span>2.4 淘票票项目中的最佳实践</span></a></h3>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">TransmittableThreadLocal</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> ttl2 </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> TransmittableThreadLocal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Override</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    protected</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> beforeExecute</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        String</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> traceId</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> get</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">StringUtil</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">isNotEmpty</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(traceId)) {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            MDC</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">put</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"traceId"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,traceId);   </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Override</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    protected</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> afterExecute</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        MDC</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">clear</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-redisson的分布式锁原理" tabindex="-1"><a class="header-anchor" href="#_3-redisson的分布式锁原理"><span>3. Redisson的分布式锁原理</span></a></h2>
<h3 id="_3-1-redisson简介" tabindex="-1"><a class="header-anchor" href="#_3-1-redisson简介"><span>3.1 Redisson简介</span></a></h3>
<p>Redisson是基于Redis的Java客户端，提供了丰富的分布式对象和服务，包括分布式锁、分布式集合等。</p>
<h3 id="_3-2-淘票票项目中的分布式锁实现" tabindex="-1"><a class="header-anchor" href="#_3-2-淘票票项目中的分布式锁实现"><span>3.2 淘票票项目中的分布式锁实现</span></a></h3>
<h4 id="_3-2-1-锁类型" tabindex="-1"><a class="header-anchor" href="#_3-2-1-锁类型"><span>3.2.1 锁类型</span></a></h4>
<p>淘票票项目实现了多种类型的分布式锁：</p>
<ul>
<li><strong>可重入锁（Reentrant Lock）</strong>：支持同一线程多次获取同一把锁</li>
<li><strong>公平锁（Fair Lock）</strong>：按照请求顺序获取锁</li>
<li><strong>读写锁（Read/Write Lock）</strong>：支持读读并发，读写互斥</li>
</ul>
<h4 id="_3-2-2-锁的使用方式" tabindex="-1"><a class="header-anchor" href="#_3-2-2-锁的使用方式"><span>3.2.2 锁的使用方式</span></a></h4>
<p>通过@ServiceLock注解简化分布式锁的使用：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">ServiceLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">name</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "order_create_lock"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> keys</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"#order.userId"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "#order.programId"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">})</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> String</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> createOrder</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">OrderCreateDto</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> order) {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 业务逻辑</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3-2-3-核心实现原理" tabindex="-1"><a class="header-anchor" href="#_3-2-3-核心实现原理"><span>3.2.3 核心实现原理</span></a></h4>
<ol>
<li><strong>基于Redis的原子操作</strong>：使用Redis的SET命令的NX和EX参数实现加锁</li>
<li><strong>Watch Dog机制</strong>：自动续期锁的过期时间，防止业务执行时间过长导致锁释放</li>
<li><strong>Lua脚本保证原子性</strong>：解锁操作使用Lua脚本保证原子性</li>
</ol>
<h3 id="_3-3-分布式锁最佳实践" tabindex="-1"><a class="header-anchor" href="#_3-3-分布式锁最佳实践"><span>3.3 分布式锁最佳实践</span></a></h3>
<ul>
<li>合理设置锁的超时时间</li>
<li>尽量缩小锁的粒度</li>
<li>做好异常处理，确保锁能正确释放</li>
</ul>
<h2 id="_4-spring中循环依赖问题" tabindex="-1"><a class="header-anchor" href="#_4-spring中循环依赖问题"><span>4. Spring中循环依赖问题</span></a></h2>
<h3 id="_4-1-循环依赖概念" tabindex="-1"><a class="header-anchor" href="#_4-1-循环依赖概念"><span>4.1 循环依赖概念</span></a></h3>
<p>循环依赖是指两个或多个Bean相互依赖，形成一个闭环。例如A依赖B，B依赖A。</p>
<h3 id="_4-2-spring解决循环依赖的机制" tabindex="-1"><a class="header-anchor" href="#_4-2-spring解决循环依赖的机制"><span>4.2 Spring解决循环依赖的机制</span></a></h3>
<h4 id="_4-2-1-三级缓存机制" tabindex="-1"><a class="header-anchor" href="#_4-2-1-三级缓存机制"><span>4.2.1 三级缓存机制</span></a></h4>
<p>Spring通过三级缓存解决循环依赖问题：</p>
<ol>
<li><strong>一级缓存（singletonObjects）</strong>：存放完全初始化好的Bean</li>
<li><strong>二级缓存（earlySingletonObjects）</strong>：存放提前暴露的Bean实例（未完全初始化）</li>
<li><strong>三级缓存（singletonFactories）</strong>：存放Bean工厂，用于创建提前暴露的Bean实例</li>
</ol>
<h4 id="_4-2-2-解决流程" tabindex="-1"><a class="header-anchor" href="#_4-2-2-解决流程"><span>4.2.2 解决流程</span></a></h4>
<ol>
<li>创建Bean A，放入三级缓存</li>
<li>A依赖B，开始创建Bean B</li>
<li>B依赖A，从三级缓存中获取A的工厂，创建A的早期暴露对象，放入二级缓存</li>
<li>B创建完成，放入一级缓存</li>
<li>A继续完成初始化，放入一级缓存</li>
</ol>
<h3 id="_4-3-无法解决的循环依赖" tabindex="-1"><a class="header-anchor" href="#_4-3-无法解决的循环依赖"><span>4.3 无法解决的循环依赖</span></a></h3>
<ul>
<li>构造器注入的循环依赖</li>
<li>Prototype作用域Bean的循环依赖</li>
</ul>
<h2 id="_5-并发编程工具countdownlatch和cyclicbarrier" tabindex="-1"><a class="header-anchor" href="#_5-并发编程工具countdownlatch和cyclicbarrier"><span>5. 并发编程工具CountDownLatch和CyclicBarrier</span></a></h2>
<h3 id="_5-1-countdownlatch-倒计时器" tabindex="-1"><a class="header-anchor" href="#_5-1-countdownlatch-倒计时器"><span>5.1 CountDownLatch（倒计时器）</span></a></h3>
<p>CountDownLatch允许一个或多个线程等待其他线程完成操作。</p>
<h4 id="核心方法" tabindex="-1"><a class="header-anchor" href="#核心方法"><span>核心方法：</span></a></h4>
<ul>
<li><code v-pre>countDown()</code>：计数器减1</li>
<li><code v-pre>await()</code>：阻塞等待计数器归零</li>
</ul>
<h4 id="淘票票项目中的应用-3" tabindex="-1"><a class="header-anchor" href="#淘票票项目中的应用-3"><span>淘票票项目中的应用：</span></a></h4>
<p>用于等待多个异步任务完成后再执行后续操作。</p>
<h3 id="_5-2-cyclicbarrier-循环屏障" tabindex="-1"><a class="header-anchor" href="#_5-2-cyclicbarrier-循环屏障"><span>5.2 CyclicBarrier（循环屏障）</span></a></h3>
<p>CyclicBarrier让一组线程相互等待，直到所有线程都到达屏障点。</p>
<h4 id="特点-3" tabindex="-1"><a class="header-anchor" href="#特点-3"><span>特点：</span></a></h4>
<ul>
<li>可以重复使用</li>
<li>所有线程到达屏障点后才会继续执行</li>
<li>可以指定屏障操作</li>
</ul>
<h3 id="_5-3-两者区别" tabindex="-1"><a class="header-anchor" href="#_5-3-两者区别"><span>5.3 两者区别</span></a></h3>
<table>
<thead>
<tr>
<th>特性</th>
<th>CountDownLatch</th>
<th>CyclicBarrier</th>
</tr>
</thead>
<tbody>
<tr>
<td>计数方式</td>
<td>递减计数</td>
<td>递增计数</td>
</tr>
<tr>
<td>可重用性</td>
<td>一次性</td>
<td>可重复使用</td>
</tr>
<tr>
<td>作用对象</td>
<td>1个或N个线程等待其他线程</td>
<td>N个线程相互等待</td>
</tr>
</tbody>
</table>
<h2 id="_6-callable-future原理解析" tabindex="-1"><a class="header-anchor" href="#_6-callable-future原理解析"><span>6. Callable/Future原理解析</span></a></h2>
<h3 id="_6-1-callable与runnable的区别" tabindex="-1"><a class="header-anchor" href="#_6-1-callable与runnable的区别"><span>6.1 Callable与Runnable的区别</span></a></h3>
<ul>
<li><strong>Runnable</strong>：无返回值，不能抛出受检异常</li>
<li><strong>Callable</strong>：有返回值，可以抛出受检异常</li>
</ul>
<h3 id="_6-2-future接口" tabindex="-1"><a class="header-anchor" href="#_6-2-future接口"><span>6.2 Future接口</span></a></h3>
<p>Future代表异步计算的结果，提供了以下方法：</p>
<ul>
<li><code v-pre>get()</code>：获取计算结果（阻塞）</li>
<li><code v-pre>get(timeout, unit)</code>：带超时的获取结果</li>
<li><code v-pre>cancel()</code>：取消任务</li>
<li><code v-pre>isDone()</code>：判断任务是否完成</li>
<li><code v-pre>isCancelled()</code>：判断任务是否被取消</li>
</ul>
<h3 id="_6-3-淘票票项目中的应用" tabindex="-1"><a class="header-anchor" href="#_6-3-淘票票项目中的应用"><span>6.3 淘票票项目中的应用</span></a></h3>
<p>在线程池中提交Callable任务，获取异步执行结果，实现非阻塞的并发处理。</p>
<h2 id="_7-线程池原理解析" tabindex="-1"><a class="header-anchor" href="#_7-线程池原理解析"><span>7. 线程池原理解析</span></a></h2>
<h3 id="_7-1-线程池核心参数" tabindex="-1"><a class="header-anchor" href="#_7-1-线程池核心参数"><span>7.1 线程池核心参数</span></a></h3>
<ul>
<li><strong>corePoolSize</strong>：核心线程数</li>
<li><strong>maximumPoolSize</strong>：最大线程数</li>
<li><strong>keepAliveTime</strong>：空闲线程存活时间</li>
<li><strong>workQueue</strong>：工作队列</li>
<li><strong>threadFactory</strong>：线程工厂</li>
<li><strong>handler</strong>：拒绝策略</li>
</ul>
<h3 id="_7-2-淘票票项目中的线程池实现" tabindex="-1"><a class="header-anchor" href="#_7-2-淘票票项目中的线程池实现"><span>7.2 淘票票项目中的线程池实现</span></a></h3>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> BusinessThreadPool</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> extends</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> BaseThreadPool</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ThreadPoolExecutor</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> execute </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> null</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    static</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">        execute </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ThreadPoolExecutor</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">                Runtime</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getRuntime</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">availableProcessors</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 核心线程数</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">                maximumPoolSize</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 最大线程数</span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66">                60</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 空闲线程存活时间</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">                TimeUnit</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">SECONDS</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">                new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ArrayBlockingQueue</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">600</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 工作队列</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">                new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> BusinessNameThreadFactory</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 线程工厂</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">                new</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> ThreadPoolRejectedExecutionHandler</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">BusinessAbortPolicy</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 拒绝策略</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-3-工作流程" tabindex="-1"><a class="header-anchor" href="#_7-3-工作流程"><span>7.3 工作流程</span></a></h3>
<ol>
<li>提交任务，如果核心线程未满，创建核心线程执行</li>
<li>核心线程满后，任务进入工作队列</li>
<li>工作队列满后，创建非核心线程执行</li>
<li>线程数达到最大值后，执行拒绝策略</li>
</ol>
<h3 id="_7-4-拒绝策略" tabindex="-1"><a class="header-anchor" href="#_7-4-拒绝策略"><span>7.4 拒绝策略</span></a></h3>
<ul>
<li><strong>AbortPolicy</strong>：抛出异常（淘票票默认策略）</li>
<li><strong>CallerRunsPolicy</strong>：由调用线程执行</li>
<li><strong>DiscardPolicy</strong>：直接丢弃</li>
<li><strong>DiscardOldestPolicy</strong>：丢弃队列中最老的任务</li>
</ul>
<h2 id="_8-线程和线程池异常处理原理" tabindex="-1"><a class="header-anchor" href="#_8-线程和线程池异常处理原理"><span>8. 线程和线程池异常处理原理</span></a></h2>
<h3 id="_8-1-线程异常处理" tabindex="-1"><a class="header-anchor" href="#_8-1-线程异常处理"><span>8.1 线程异常处理</span></a></h3>
<ul>
<li>未捕获的异常会导致线程终止</li>
<li>可通过设置UncaughtExceptionHandler处理异常</li>
</ul>
<h3 id="_8-2-线程池异常处理" tabindex="-1"><a class="header-anchor" href="#_8-2-线程池异常处理"><span>8.2 线程池异常处理</span></a></h3>
<ul>
<li>提交的任务中的异常不会导致线程池崩溃</li>
<li>Future.get()可以获取任务执行中的异常</li>
<li>可通过重写afterExecute方法统一处理异常</li>
</ul>
<h3 id="_8-3-淘票票项目中的异常处理" tabindex="-1"><a class="header-anchor" href="#_8-3-淘票票项目中的异常处理"><span>8.3 淘票票项目中的异常处理</span></a></h3>
<p>通过自定义线程池和拒绝策略，确保异常能够被正确捕获和处理，保证系统的稳定性。</p>
<h2 id="_9-mybatis-plus生成的id在k8s环境重复问题" tabindex="-1"><a class="header-anchor" href="#_9-mybatis-plus生成的id在k8s环境重复问题"><span>9. Mybatis-plus生成的ID在K8s环境重复问题</span></a></h2>
<h3 id="_9-1-问题原因" tabindex="-1"><a class="header-anchor" href="#_9-1-问题原因"><span>9.1 问题原因</span></a></h3>
<p>雪花算法生成的ID依赖于数据中心ID和机器ID，K8s环境下Pod的IP可能是动态分配的，导致生成的ID可能重复。</p>
<h3 id="_9-2-淘票票解决方案" tabindex="-1"><a class="header-anchor" href="#_9-2-淘票票解决方案"><span>9.2 淘票票解决方案</span></a></h3>
<p>通过Redis分配数据中心ID和机器ID，确保在分布式环境下ID的唯一性：</p>
<div class="language-lua line-numbers-mode" data-highlighter="shiki" data-ext="lua" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-lua"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">local</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> snowflake_work_id_key</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> = </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">KEYS</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">]</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">local</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> snowflake_data_center_id_key</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> = </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">KEYS</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">]</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">local</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> max_worker_id</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> = </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">tonumber</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">ARGV</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">])</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">local</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> max_data_center_id</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> = </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">tonumber</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">ARGV</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">])</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 通过Redis原子操作分配ID</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_10-雪花算法完全解读" tabindex="-1"><a class="header-anchor" href="#_10-雪花算法完全解读"><span>10. 雪花算法完全解读</span></a></h2>
<h3 id="_10-1-雪花算法结构" tabindex="-1"><a class="header-anchor" href="#_10-1-雪花算法结构"><span>10.1 雪花算法结构</span></a></h3>
<p>雪花算法生成的64位ID由以下几部分组成：</p>
<ul>
<li>1位符号位（始终为0）</li>
<li>41位时间戳（毫秒）</li>
<li>10位机器标识（数据中心ID + 工作节点ID）</li>
<li>12位序列号</li>
</ul>
<h3 id="_10-2-淘票票项目中的实现" tabindex="-1"><a class="header-anchor" href="#_10-2-淘票票项目中的实现"><span>10.2 淘票票项目中的实现</span></a></h3>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> SnowflakeIdGenerator</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> final</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> long</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> workerId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">     // 工作节点ID</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> final</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> long</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> datacenterId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 数据中心ID</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> long</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> sequence </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0L</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">      // 序列号</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> long</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> lastTimestamp </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> -</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1L</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 上次时间戳</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_10-3-特点" tabindex="-1"><a class="header-anchor" href="#_10-3-特点"><span>10.3 特点</span></a></h3>
<ul>
<li>全局唯一性</li>
<li>趋势递增</li>
<li>高性能</li>
<li>支持分库分表基因法生成ID</li>
</ul>
<h2 id="_11-灰度环境设计" tabindex="-1"><a class="header-anchor" href="#_11-灰度环境设计"><span>11. 灰度环境设计</span></a></h2>
<h3 id="_11-1-灰度发布概念" tabindex="-1"><a class="header-anchor" href="#_11-1-灰度发布概念"><span>11.1 灰度发布概念</span></a></h3>
<p>灰度发布是一种平滑过渡的发布方式，通过让部分用户继续使用旧版本，部分用户使用新版本，逐步扩大新版本的使用范围。</p>
<h3 id="_11-2-淘票票灰度实现" tabindex="-1"><a class="header-anchor" href="#_11-2-淘票票灰度实现"><span>11.2 淘票票灰度实现</span></a></h3>
<ol>
<li><strong>灰度标识</strong>：通过请求头传递灰度标识</li>
<li><strong>服务过滤</strong>：实现ServerGrayFilter进行服务实例过滤</li>
<li><strong>负载均衡</strong>：结合Nacos元数据实现灰度路由</li>
<li><strong>上下文传递</strong>：通过Feign拦截器传递灰度标识</li>
</ol>
<h3 id="_11-3-优势" tabindex="-1"><a class="header-anchor" href="#_11-3-优势"><span>11.3 优势</span></a></h3>
<ul>
<li>降低新功能发布风险</li>
<li>支持A/B测试</li>
<li>便于快速回滚</li>
</ul>
<h2 id="_12-高效延迟队列设计" tabindex="-1"><a class="header-anchor" href="#_12-高效延迟队列设计"><span>12. 高效延迟队列设计</span></a></h2>
<h3 id="_12-1-延迟队列概述" tabindex="-1"><a class="header-anchor" href="#_12-1-延迟队列概述"><span>12.1 延迟队列概述</span></a></h3>
<p>延迟队列是一种特殊的消息队列，消息发送后不会立即投递，而是等待指定时间后才投递给消费者。</p>
<h3 id="_12-2-淘票票实现" tabindex="-1"><a class="header-anchor" href="#_12-2-淘票票实现"><span>12.2 淘票票实现</span></a></h3>
<p>基于Redisson实现延迟队列：</p>
<ol>
<li><strong>消息发送</strong>：使用RBlockingQueue实现延迟消息入队</li>
<li><strong>消息消费</strong>：通过线程池异步消费延迟消息</li>
<li><strong>消费管理</strong>：实现ConsumerTask接口处理具体业务</li>
</ol>
<h3 id="_12-3-应用场景" tabindex="-1"><a class="header-anchor" href="#_12-3-应用场景"><span>12.3 应用场景</span></a></h3>
<ul>
<li>订单超时自动取消</li>
<li>支付超时提醒</li>
<li>缓存过期处理</li>
</ul>
<h2 id="_13-gateway集成hystrix遇到的巨坑问题" tabindex="-1"><a class="header-anchor" href="#_13-gateway集成hystrix遇到的巨坑问题"><span>13. Gateway集成Hystrix遇到的巨坑问题</span></a></h2>
<h3 id="_13-1-hystrix简介" tabindex="-1"><a class="header-anchor" href="#_13-1-hystrix简介"><span>13.1 Hystrix简介</span></a></h3>
<p>Hystrix是Netflix开源的容错库，通过隔离服务间的访问点、停止服务间的级联故障以及提供降级选项来提高系统的整体弹性。</p>
<h3 id="_13-2-常见问题" tabindex="-1"><a class="header-anchor" href="#_13-2-常见问题"><span>13.2 常见问题</span></a></h3>
<ol>
<li><strong>ThreadLocal失效</strong>：Hystrix使用线程池隔离时，ThreadLocal无法在主线程和Hystrix线程间传递</li>
<li><strong>上下文传递问题</strong>：请求上下文在经过Hystrix后丢失</li>
</ol>
<h3 id="_13-3-淘票票解决方案" tabindex="-1"><a class="header-anchor" href="#_13-3-淘票票解决方案"><span>13.3 淘票票解决方案</span></a></h3>
<p>使用TransmittableThreadLocal解决上下文传递问题，确保TraceId等信息能够在整个调用链中正确传递。</p>
<h2 id="_14-spring事务失效及避免" tabindex="-1"><a class="header-anchor" href="#_14-spring事务失效及避免"><span>14. Spring事务失效及避免</span></a></h2>
<h3 id="_14-1-事务失效场景" tabindex="-1"><a class="header-anchor" href="#_14-1-事务失效场景"><span>14.1 事务失效场景</span></a></h3>
<ol>
<li><strong>非public方法</strong>：只有public方法上的@Transactional才会生效</li>
<li><strong>同一类中方法调用</strong>：同类中非事务方法调用事务方法，事务不生效</li>
<li><strong>异常被吞掉</strong>：捕获异常但未抛出，事务不会回滚</li>
<li><strong>抛出检查异常</strong>：默认情况下，只有RuntimeException和Error才会触发回滚</li>
</ol>
<h3 id="_14-2-淘票票最佳实践" tabindex="-1"><a class="header-anchor" href="#_14-2-淘票票最佳实践"><span>14.2 淘票票最佳实践</span></a></h3>
<ul>
<li>所有事务方法都声明为public</li>
<li>跨类调用事务方法</li>
<li>正确处理异常，确保需要回滚的异常能够抛出</li>
<li>明确指定回滚异常类型</li>
</ul>
<h2 id="_15-springboot的autoconfigurebefore和autoconfigureafter细节" tabindex="-1"><a class="header-anchor" href="#_15-springboot的autoconfigurebefore和autoconfigureafter细节"><span>15. Springboot的AutoConfigureBefore和AutoConfigureAfter细节</span></a></h2>
<h3 id="_15-1-自动配置顺序控制" tabindex="-1"><a class="header-anchor" href="#_15-1-自动配置顺序控制"><span>15.1 自动配置顺序控制</span></a></h3>
<p>通过@AutoConfigureBefore和@AutoConfigureAfter注解控制自动配置类的加载顺序。</p>
<h3 id="_15-2-淘票票应用" tabindex="-1"><a class="header-anchor" href="#_15-2-淘票票应用"><span>15.2 淘票票应用</span></a></h3>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">AutoConfigureBefore</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">LoadBalancerClientConfiguration</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">class</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> EnhanceLoadBalancerClientConfiguration</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 自定义负载均衡配置</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_15-3-优势" tabindex="-1"><a class="header-anchor" href="#_15-3-优势"><span>15.3 优势</span></a></h3>
<ul>
<li>确保配置按预期顺序加载</li>
<li>避免配置冲突</li>
<li>实现配置增强</li>
</ul>
<h2 id="_16-hystrix传递threadlocal数据失效问题" tabindex="-1"><a class="header-anchor" href="#_16-hystrix传递threadlocal数据失效问题"><span>16. Hystrix传递ThreadLocal数据失效问题</span></a></h2>
<h3 id="_16-1-问题原因" tabindex="-1"><a class="header-anchor" href="#_16-1-问题原因"><span>16.1 问题原因</span></a></h3>
<p>Hystrix默认使用线程池隔离策略，主线程和Hystrix线程不是同一个线程，ThreadLocal无法跨线程传递。</p>
<h3 id="_16-2-解决方案" tabindex="-1"><a class="header-anchor" href="#_16-2-解决方案"><span>16.2 解决方案</span></a></h3>
<ol>
<li><strong>使用信号量隔离</strong>：通过配置<code v-pre>execution.isolation.strategy=SEMAPHORE</code>使用信号量隔离</li>
<li><strong>使用TransmittableThreadLocal</strong>：在淘票票项目中使用阿里巴巴的TransmittableThreadLocal解决上下文传递问题</li>
</ol>
<h2 id="_17-自动装配-vs-configuration" tabindex="-1"><a class="header-anchor" href="#_17-自动装配-vs-configuration"><span>17. 自动装配 vs @Configuration</span></a></h2>
<h3 id="_17-1-自动装配-autoconfiguration" tabindex="-1"><a class="header-anchor" href="#_17-1-自动装配-autoconfiguration"><span>17.1 自动装配（AutoConfiguration）</span></a></h3>
<ul>
<li>Spring Boot提供的机制</li>
<li>根据类路径和配置自动配置Bean</li>
<li>通过条件注解控制配置是否生效</li>
<li>无需显式导入，自动生效</li>
</ul>
<h3 id="_17-2-configuration" tabindex="-1"><a class="header-anchor" href="#_17-2-configuration"><span>17.2 @Configuration</span></a></h3>
<ul>
<li>显式配置类</li>
<li>需要通过@ComponentScan扫描或显式导入</li>
<li>配置逻辑明确，便于理解</li>
</ul>
<h3 id="_17-3-淘票票项目选择" tabindex="-1"><a class="header-anchor" href="#_17-3-淘票票项目选择"><span>17.3 淘票票项目选择</span></a></h3>
<p>淘票票项目主要使用自动装配，通过自定义AutoConfiguration类实现模块化配置，提高开发效率。</p>
<h2 id="_18-分布式锁与事务的-疑难杂症" tabindex="-1"><a class="header-anchor" href="#_18-分布式锁与事务的-疑难杂症"><span>18. 分布式锁与事务的&quot;疑难杂症&quot;</span></a></h2>
<h3 id="_18-1-常见问题" tabindex="-1"><a class="header-anchor" href="#_18-1-常见问题"><span>18.1 常见问题</span></a></h3>
<ol>
<li><strong>死锁问题</strong>：事务未提交但锁已获取，其他事务无法获取锁</li>
<li><strong>锁释放时机</strong>：事务回滚时锁未正确释放</li>
<li><strong>性能问题</strong>：锁粒度过大影响并发性能</li>
</ol>
<h3 id="_18-2-淘票票解决方案" tabindex="-1"><a class="header-anchor" href="#_18-2-淘票票解决方案"><span>18.2 淘票票解决方案</span></a></h3>
<ol>
<li><strong>合理设置锁超时时间</strong>：避免死锁</li>
<li><strong>使用注解简化锁管理</strong>：通过@ServiceLock注解自动管理锁的获取和释放</li>
<li><strong>结合事务管理</strong>：确保事务提交或回滚后正确释放锁</li>
</ol>
<h2 id="_19-基姆法完全解读" tabindex="-1"><a class="header-anchor" href="#_19-基姆法完全解读"><span>19. 基姆法完全解读</span></a></h2>
<h3 id="_19-1-基姆法概念" tabindex="-1"><a class="header-anchor" href="#_19-1-基姆法概念"><span>19.1 基姆法概念</span></a></h3>
<p>基姆法是一种分库分表策略，通过在ID中嵌入分片键信息，确保相关数据存储在同一分片中。</p>
<h3 id="_19-2-淘票票实现" tabindex="-1"><a class="header-anchor" href="#_19-2-淘票票实现"><span>19.2 淘票票实现</span></a></h3>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> long</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> calculateDatabaseIndex</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> databaseCount</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Long</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> splicingKey</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Integer</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> tableCount) {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">    String</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> splicingKeyBinary </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> Long</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">toBinaryString</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(splicingKey);</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    long</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> replacementLength </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> log2N</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(tableCount)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">    String</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> geneBinaryStr </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> splicingKeyBinary</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">substring</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">splicingKeyBinary</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">length</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">() </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">-</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">) replacementLength);</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 根据基因片段计算数据库索引</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_19-3-优势" tabindex="-1"><a class="header-anchor" href="#_19-3-优势"><span>19.3 优势</span></a></h3>
<ul>
<li>相关数据存储在同一分片中，便于查询</li>
<li>避免跨分片查询</li>
<li>提高查询性能</li>
</ul>
<h2 id="_20-分库分表实现" tabindex="-1"><a class="header-anchor" href="#_20-分库分表实现"><span>20. 分库分表实现</span></a></h2>
<h3 id="_20-1-分片策略" tabindex="-1"><a class="header-anchor" href="#_20-1-分片策略"><span>20.1 分片策略</span></a></h3>
<p>淘票票项目使用ShardingSphere实现分库分表：</p>
<ul>
<li><strong>分库策略</strong>：根据用户ID或订单号等分片键进行分库</li>
<li><strong>分表策略</strong>：在分库基础上进一步分表</li>
</ul>
<h3 id="_20-2-配置示例" tabindex="-1"><a class="header-anchor" href="#_20-2-配置示例"><span>20.2 配置示例</span></a></h3>
<div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">rules</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  - </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">!SHARDING</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    tables</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      t_order</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">        actualDataNodes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">ds_${0..1}.t_order_${0..3}</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">        databaseStrategy</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">          complex</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">            shardingColumns</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">order_number,user_id</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">            shardingAlgorithmName</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">databaseOrderComplexGeneArithmetic</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">        tableStrategy</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">          complex</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">            shardingColumns</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">order_number,user_id</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">            shardingAlgorithmName</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">tableOrderComplexGeneArithmetic</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_20-3-优势" tabindex="-1"><a class="header-anchor" href="#_20-3-优势"><span>20.3 优势</span></a></h3>
<ul>
<li>支持水平扩展</li>
<li>提高系统并发能力</li>
<li>降低单表数据量</li>
</ul>
<h2 id="_21-布隆过滤器应用" tabindex="-1"><a class="header-anchor" href="#_21-布隆过滤器应用"><span>21. 布隆过滤器应用</span></a></h2>
<h3 id="_21-1-布隆过滤器原理" tabindex="-1"><a class="header-anchor" href="#_21-1-布隆过滤器原理"><span>21.1 布隆过滤器原理</span></a></h3>
<p>布隆过滤器是一种空间效率很高的概率型数据结构，用于判断一个元素是否在一个集合中。</p>
<h3 id="_21-2-淘票票应用" tabindex="-1"><a class="header-anchor" href="#_21-2-淘票票应用"><span>21.2 淘票票应用</span></a></h3>
<p>用于缓存穿透防护：</p>
<ul>
<li>在查询缓存前先通过布隆过滤器判断数据是否存在</li>
<li>如果布隆过滤器判断不存在，则直接返回，避免查询数据库</li>
</ul>
<h3 id="_21-3-配置" tabindex="-1"><a class="header-anchor" href="#_21-3-配置"><span>21.3 配置</span></a></h3>
<div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">bloom-filter</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">user-register-bloom-filter</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  expectedInsertions</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1000</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  falseProbability</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">0.01</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_22-多级缓存架构" tabindex="-1"><a class="header-anchor" href="#_22-多级缓存架构"><span>22. 多级缓存架构</span></a></h2>
<h3 id="_22-1-缓存层次" tabindex="-1"><a class="header-anchor" href="#_22-1-缓存层次"><span>22.1 缓存层次</span></a></h3>
<p>淘票票项目采用多级缓存架构：</p>
<ol>
<li><strong>本地缓存</strong>：使用Caffeine实现，访问速度最快</li>
<li><strong>分布式缓存</strong>：使用Redis实现，支持集群和高并发</li>
<li><strong>数据库</strong>：最终数据存储</li>
</ol>
<h3 id="_22-2-缓存策略" tabindex="-1"><a class="header-anchor" href="#_22-2-缓存策略"><span>22.2 缓存策略</span></a></h3>
<ul>
<li><strong>读策略</strong>：先读本地缓存，再读Redis，最后读数据库</li>
<li><strong>写策略</strong>：写数据库成功后，同步更新Redis和本地缓存</li>
</ul>
<h3 id="_22-3-缓存一致性" tabindex="-1"><a class="header-anchor" href="#_22-3-缓存一致性"><span>22.3 缓存一致性</span></a></h3>
<p>通过延迟双删等策略保证缓存与数据库的一致性。</p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>淘票票项目在微服务架构下，充分运用了各种先进的技术组件和设计模式，包括但不限于：</p>
<ul>
<li>使用Nacos实现服务注册发现和配置管理</li>
<li>通过Redisson实现分布式锁和延迟队列</li>
<li>利用TransmittableThreadLocal解决线程上下文传递问题</li>
<li>基于ShardingSphere实现分库分表</li>
<li>采用多级缓存架构提升系统性能</li>
<li>实现灰度发布支持渐进式功能上线</li>
</ul>
<p>这些技术的合理运用使得淘票票项目具备了高并发、高可用、易扩展等优秀特性，为构建企业级微服务架构提供了完整的解决方案。</p>
</div></template>


