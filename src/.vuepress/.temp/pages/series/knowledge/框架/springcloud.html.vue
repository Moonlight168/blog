<template><div><h2 id="什么是微服务-有哪些优缺点" tabindex="-1"><a class="header-anchor" href="#什么是微服务-有哪些优缺点"><span>什么是微服务？有哪些优缺点？</span></a></h2>
<p><strong>回答：</strong><br>
微服务是将单体应用拆分成多个独立服务，各服务可独立部署、扩展。</p>
<ul>
<li>优点：开发独立、部署灵活、可按需扩展。</li>
<li>缺点：系统复杂、测试困难、运维成本高、接口通信开销大。</li>
</ul>
<h2 id="每个微服务之间如何通信" tabindex="-1"><a class="header-anchor" href="#每个微服务之间如何通信"><span>每个微服务之间如何通信？</span></a></h2>
<p><strong>回答：</strong></p>
<ol>
<li>
<p><strong>同步通信</strong>：使用 HTTP 或 RPC</p>
<ul>
<li>常用方式：OpenFeign、RestTemplate、Dubbo、gRPC</li>
<li>特点：实时响应，适合强一致性场景</li>
</ul>
</li>
<li>
<p><strong>异步通信</strong>：通过消息队列</p>
<ul>
<li>常用组件：Kafka、RabbitMQ、RocketMQ</li>
<li>特点：解耦、削峰填谷，适合异步处理场景</li>
</ul>
</li>
</ol>
<h2 id="微服务四大件都有哪些" tabindex="-1"><a class="header-anchor" href="#微服务四大件都有哪些"><span>微服务四大件都有哪些？</span></a></h2>
<p><strong>回答：</strong></p>
<ol>
<li><strong>服务注册与发现</strong></li>
</ol>
<ul>
<li>作用：管理服务地址，实现自动注册和发现</li>
<li>常用组件：Nacos、Eureka、Consul、Zookeeper</li>
</ul>
<ol start="2">
<li><strong>配置中心</strong></li>
</ol>
<ul>
<li>作用：集中管理微服务配置，支持热更新</li>
<li>常用组件：Nacos、Apollo、Spring Cloud Config</li>
</ul>
<ol start="3">
<li><strong>服务网关</strong></li>
</ol>
<ul>
<li>作用：统一入口，进行路由转发、权限校验、限流熔断等</li>
<li>常用组件：Gateway、Zuul、Kong、Nginx</li>
</ul>
<ol start="4">
<li><strong>服务通信与容错</strong></li>
</ol>
<ul>
<li>作用：服务间调用 + 熔断、限流、重试等容错处理</li>
<li>常用组件：<strong>OpenFeign、Dubbo、gRPC、RestTemplate</strong>（通信）；<strong>Sentinel、Resilience4j、Hystrix</strong>（容错）</li>
</ul>
<h2 id="nacos-如何实现配置热更新" tabindex="-1"><a class="header-anchor" href="#nacos-如何实现配置热更新"><span>Nacos 如何实现配置热更新？</span></a></h2>
<p><strong>回答：</strong><br>
Nacos 配置热更新主要有以下几个机制：</p>
<ol>
<li><strong>长轮询监听</strong>：客户端会开启长轮询，实时监听配置中心的变更</li>
<li><strong>事件通知</strong>：当服务端配置有变化时，会主动推送通知给客户端</li>
<li><strong>@RefreshScope</strong>：Spring Cloud 中使用该注解，可以让 Bean 在配置更新时动态刷新</li>
<li><strong>配置绑定</strong>：通过 <code v-pre>@Value</code> 或 <code v-pre>@ConfigurationProperties</code> 注解绑定属性，配合 <code v-pre>@RefreshScope</code> 实现热更新</li>
</ol>
<h2 id="hystrix-和-sentinel-有什么区别" tabindex="-1"><a class="header-anchor" href="#hystrix-和-sentinel-有什么区别"><span>Hystrix 和 Sentinel 有什么区别？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li><strong>Hystrix</strong>：Netflix 开发的断路器组件，主要功能是服务熔断、降级、隔离，已经停止维护</li>
<li><strong>Sentinel</strong>：阿里巴巴开源的流量防护组件，功能更全面，包含限流、熔断、降级、热点参数限流、系统自适应保护，还提供控制台便于可视化管理</li>
</ul>
<h2 id="如何监控微服务中的负载均衡状态" tabindex="-1"><a class="header-anchor" href="#如何监控微服务中的负载均衡状态"><span>如何监控微服务中的负载均衡状态？</span></a></h2>
<p><strong>回答：</strong><br>
监控负载均衡一般有以下几种方式：</p>
<ol>
<li><strong>应用日志</strong>：在服务调用层打印调用目标实例信息，便于追踪请求分配情况</li>
<li><strong>Spring Cloud LoadBalancer / Ribbon</strong>：开启 debug 日志或结合 Actuator 查看服务实例的调用分布</li>
<li><strong>注册中心（如 Nacos、Eureka）</strong>：通过控制台查看服务实例的健康状态和权重</li>
<li><strong>链路追踪（Sleuth + Zipkin / SkyWalking）</strong>：监控请求在不同实例中的分布和耗时情况</li>
<li><strong>指标监控（Prometheus + Grafana）</strong>：采集服务调用指标，直观展示负载均衡效果</li>
</ol>
<h2 id="spring-boot-admin的作用是什么" tabindex="-1"><a class="header-anchor" href="#spring-boot-admin的作用是什么"><span>Spring Boot Admin的作用是什么？</span></a></h2>
<p><strong>回答：</strong><br>
Spring Boot Admin是一个用于管理和监控Spring Boot应用的开源项目，主要功能包括：</p>
<ul>
<li>服务监控：实时监控服务健康状态、内存、CPU等指标</li>
<li>日志管理：在线查看和修改日志级别</li>
<li>JVM监控：监控内存、线程、GC等情况</li>
<li>配置管理：查看和修改应用配置</li>
<li>告警通知：服务异常时发送告警</li>
<li>统一界面：提供统一的Web界面管理多个微服务实例</li>
</ul>
<h2 id="为什么需要微服务监控中心" tabindex="-1"><a class="header-anchor" href="#为什么需要微服务监控中心"><span>为什么需要微服务监控中心？</span></a></h2>
<p><strong>回答：</strong><br>
在微服务架构中，监控中心的重要性体现在：</p>
<ul>
<li>全局视图：提供所有服务的统一监控视图</li>
<li>故障排查：快速定位问题服务实例</li>
<li>性能优化：通过监控数据发现性能瓶颈</li>
<li>容量规划：根据历史数据进行容量预测</li>
<li>自动化运维：结合告警系统实现自动化运维</li>
<li>服务治理：监控服务间的调用关系和依赖</li>
</ul>
<h2 id="如何实现服务状态变更的告警" tabindex="-1"><a class="header-anchor" href="#如何实现服务状态变更的告警"><span>如何实现服务状态变更的告警？</span></a></h2>
<p><strong>回答：</strong><br>
实现服务状态变更告警的关键步骤：</p>
<ul>
<li>事件监听：监听服务实例的状态变化事件</li>
<li>状态过滤：过滤掉不重要的状态变化（如从DOWN恢复到UP）</li>
<li>告警策略：定义触发条件和频率</li>
<li>多通道通知：支持邮件、短信、钉钉、企业微信等方式</li>
<li>告警去重：避免重复告警</li>
<li>告警升级：持续未处理的告警进行升级处理</li>
</ul>
</div></template>


