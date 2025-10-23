<template><div><h1 id="淘票票-taopiaopiao-——高并发分布式票务系统" tabindex="-1"><a class="header-anchor" href="#淘票票-taopiaopiao-——高并发分布式票务系统"><span>淘票票（Taopiaopiao）——高并发分布式票务系统</span></a></h1>
<hr>
<p><a href="https://opensource.org/licenses/Apache-2.0" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/License-Apache 2.0-blue.svg" alt="License" loading="lazy"></a><br>
<img src="https://img.shields.io/badge/Java-17-orange" alt="Java" loading="lazy"><br>
<img src="https://img.shields.io/badge/Spring Boot-3.2.x-brightgreen" alt="Spring Boot" loading="lazy"><br>
<img src="https://img.shields.io/badge/build-Maven-blue" alt="Build" loading="lazy"></p>
<blockquote>
<p>一个基于 Spring Cloud Alibaba 构建的高并发票务系统，专注于演唱会/大型活动的高并发抢票场景。</p>
</blockquote>
<hr>
<h2 id="🚀-项目简介" tabindex="-1"><a class="header-anchor" href="#🚀-项目简介"><span>🚀 项目简介</span></a></h2>
<p><strong>淘票票（Taopiaopiao）</strong> 是一个高并发分布式票务系统，聚焦于 <strong>演唱会/大型活动抢票</strong> 等秒杀场景，重点解决 <strong>高并发下的库存一致性、性能瓶颈与系统可用性</strong> 问题。</p>
<p>系统设计目标：</p>
<ul>
<li><strong>高性能</strong>：通过缓存预热、异步削峰、读写分离等手段，支撑 <strong>万级 QPS</strong> 的并发抢票请求</li>
<li><strong>高一致性</strong>：使用 Redis Lua 脚本与分布式锁保证库存原子扣减，结合消息队列实现订单与库存最终一致</li>
<li><strong>高可用</strong>：利用 Sentinel 限流熔断与 Kafka 异步削峰，确保系统在流量洪峰下稳定运行</li>
<li><strong>可扩展性</strong>：模块化微服务架构 + 分库分表 + Docker 部署，支持灵活扩展与快速上线</li>
</ul>
<p>该项目不仅是一个票务系统，更是一次 <strong>高并发分布式架构的综合实战</strong>，涵盖缓存、消息队列、数据库分片、分布式锁、限流熔断等核心技术栈。</p>
<hr>
<h2 id="🔍-项目界面预览" tabindex="-1"><a class="header-anchor" href="#🔍-项目界面预览"><span>🔍 项目界面预览</span></a></h2>
<table>
<thead>
<tr>
<th>页面</th>
<th>示例截图</th>
</tr>
</thead>
<tbody>
<tr>
<td>登录界面</td>
<td><img src="@source/zh/series/myprojects/imges/淘票票/页面预览图/login.png" alt="login" loading="lazy"></td>
</tr>
<tr>
<td>主页面</td>
<td><img src="@source/zh/series/myprojects/imges/淘票票/页面预览图/home.png" alt="home" loading="lazy"></td>
</tr>
<tr>
<td>分类列表</td>
<td><img src="@source/zh/series/myprojects/imges/淘票票/页面预览图/categories.png" alt="category" loading="lazy"></td>
</tr>
<tr>
<td>票务详情页</td>
<td><img src="@source/zh/series/myprojects/imges/淘票票/页面预览图/detail.png" alt="ticket" loading="lazy"></td>
</tr>
<tr>
<td>支付页面</td>
<td><img src="@source/zh/series/myprojects/imges/淘票票/页面预览图/pay.png" alt="pay" loading="lazy"></td>
</tr>
</tbody>
</table>
<hr>
<h2 id="🧭-项目架构图" tabindex="-1"><a class="header-anchor" href="#🧭-项目架构图"><span>🧭 项目架构图</span></a></h2>
<table>
<thead>
<tr>
<th>图示</th>
</tr>
</thead>
<tbody>
<tr>
<td><img src="@source/zh/series/myprojects/imges/淘票票/业务大纲.png" alt="业务大纲" loading="lazy"></td>
</tr>
<tr>
<td><img src="@source/zh/series/myprojects/imges/淘票票/组织架构图.png" alt="组织架构图" loading="lazy"></td>
</tr>
<tr>
<td><img src="@source/zh/series/myprojects/imges/淘票票/项目架构图.gif" alt="项目架构图动态" loading="lazy"></td>
</tr>
</tbody>
</table>
<h2 id="✨-淘票票项目技术亮点一览" tabindex="-1"><a class="header-anchor" href="#✨-淘票票项目技术亮点一览"><span>✨ 淘票票项目技术亮点一览</span></a></h2>
<h3 id="i-核心技术架构与治理" tabindex="-1"><a class="header-anchor" href="#i-核心技术架构与治理"><span>Ⅰ. 核心技术架构与治理</span></a></h3>
<table>
<thead>
<tr>
<th style="text-align:left">维度</th>
<th style="text-align:left">技术/方案</th>
<th style="text-align:left">亮点与优势</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><strong>微服务架构</strong></td>
<td style="text-align:left"><strong>Spring Cloud Alibaba 全家桶</strong></td>
<td style="text-align:left">基于 SpringCloud 体系构建分布式系统，快速实现服务注册、配置管理与流量治理。</td>
</tr>
<tr>
<td style="text-align:left"><strong>服务治理</strong></td>
<td style="text-align:left"><strong>Nacos + Sentinel</strong></td>
<td style="text-align:left">Nacos 实现服务注册与发现、统一配置管理；Sentinel 实现熔断降级、系统自适应限流。</td>
</tr>
<tr>
<td style="text-align:left"><strong>API 网关</strong></td>
<td style="text-align:left"><strong>Spring Cloud Gateway</strong></td>
<td style="text-align:left">统一 API 入口，实现鉴权、路由转发、全局限流、请求日志等功能，保障后端服务安全。</td>
</tr>
<tr>
<td style="text-align:left"><strong>数据层架构</strong></td>
<td style="text-align:left"><strong>ShardingSphere 分库分表</strong></td>
<td style="text-align:left">针对订单、用户等核心表进行分库分表（如按用户ID或订单ID），有效解决海量数据存储瓶长颈与查询性能问题。</td>
</tr>
<tr>
<td style="text-align:left"><strong>ID 生成</strong></td>
<td style="text-align:left"><strong>分布式 ID (雪花算法优化)</strong></td>
<td style="text-align:left">采用优化的雪花算法，保证全局唯一且趋势递增的 ID，满足分库分表键值与高性能要求。</td>
</tr>
</tbody>
</table>
<h3 id="ii-高并发与性能优化-万级-qps-核心保障" tabindex="-1"><a class="header-anchor" href="#ii-高并发与性能优化-万级-qps-核心保障"><span>Ⅱ. 高并发与性能优化（万级 QPS 核心保障）</span></a></h3>
<table>
<thead>
<tr>
<th style="text-align:left">维度</th>
<th style="text-align:left">技术/方案</th>
<th style="text-align:left">亮点与优势</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><strong>极致性能优化</strong></td>
<td style="text-align:left"><strong>订单生成四版本演进</strong></td>
<td style="text-align:left">从 V1 直写 DB 到 <strong>V4 Redis Lua 原子扣减 + 异步 Kafka 落库 + Redisson 锁</strong>，性能提升约 <strong>15 倍</strong>，达到 <strong>12000 QPS</strong>。</td>
</tr>
<tr>
<td style="text-align:left"><strong>库存一致性</strong></td>
<td style="text-align:left"><strong>Redis Lua 脚本原子操作</strong></td>
<td style="text-align:left">使用 Lua 脚本将“检查库存”和“扣减库存”封装为单个原子命令执行，彻底杜绝超卖。</td>
</tr>
<tr>
<td style="text-align:left"><strong>多级缓存体系</strong></td>
<td style="text-align:left"><strong>Caffeine (L1) + Redis (L2)</strong></td>
<td style="text-align:left"><strong>本地缓存</strong>（Caffeine）承担热点数据第一层压力，<strong>分布式缓存</strong>（Redis）提供共享数据，有效降低网络IO和数据库压力。</td>
</tr>
<tr>
<td style="text-align:left"><strong>缓存安全</strong></td>
<td style="text-align:left"><strong>防穿透、击穿、雪崩</strong></td>
<td style="text-align:left"><strong>布隆过滤器</strong> 结合缓存空值防穿透；<strong>数据预热</strong> + <strong>热点数据永不失效</strong> 防击穿/雪崩。</td>
</tr>
<tr>
<td style="text-align:left"><strong>分布式锁</strong></td>
<td style="text-align:left"><strong>Redisson 高性能分布式锁</strong></td>
<td style="text-align:left">采用 Redisson 实现了基于 Redis 的分布式锁，具备自动续期（看门狗）、防止死锁等特性，保障购票过程并发安全。</td>
</tr>
</tbody>
</table>
<h3 id="iii-核心中间件高级应用" tabindex="-1"><a class="header-anchor" href="#iii-核心中间件高级应用"><span>Ⅲ. 核心中间件高级应用</span></a></h3>
<table>
<thead>
<tr>
<th style="text-align:left">维度</th>
<th style="text-align:left">技术/方案</th>
<th style="text-align:left">亮点与优势</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><strong>异步处理与削峰</strong></td>
<td style="text-align:left"><strong>Kafka 消息队列</strong></td>
<td style="text-align:left">核心购票流程采用 Kafka 异步处理订单落库、库存补偿等，平滑流量洪峰，保障系统高可用。</td>
</tr>
<tr>
<td style="text-align:left"><strong>业务一致性</strong></td>
<td style="text-align:left"><strong>Redis 延迟队列 (ZSet)</strong></td>
<td style="text-align:left">精准控制订单支付超时关闭逻辑，超时未支付则释放库存，保证资源最大化利用。</td>
</tr>
<tr>
<td style="text-align:left"><strong>数据流处理</strong></td>
<td style="text-align:left"><strong>Redis Stream</strong></td>
<td style="text-align:left">用于实现消息队列特性，支持消费组、消息持久化和消费追踪，用于日志或关键操作的可靠记录。</td>
</tr>
<tr>
<td style="text-align:left"><strong>数据搜索</strong></td>
<td style="text-align:left"><strong>Elasticsearch (ES)</strong></td>
<td style="text-align:left">为票务/场次提供高性能全文检索服务，支持复杂条件筛选和快速响应。</td>
</tr>
<tr>
<td style="text-align:left"><strong>可观测性</strong></td>
<td style="text-align:left"><strong>ELK Stack (日志) + Prometheus/Grafana (监控)</strong></td>
<td style="text-align:left">统一日志采集、存储与查询；实时监控 JVM、业务指标、延迟、错误率，实现高效故障排查和预警。</td>
</tr>
</tbody>
</table>
<h3 id="iv-核心业务与工程实践" tabindex="-1"><a class="header-anchor" href="#iv-核心业务与工程实践"><span>Ⅳ. 核心业务与工程实践</span></a></h3>
<table>
<thead>
<tr>
<th style="text-align:left">维度</th>
<th style="text-align:left">技术/方案</th>
<th style="text-align:left">亮点与优势</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><strong>数据一致性</strong></td>
<td style="text-align:left"><strong>延迟双删/消息队列补偿</strong></td>
<td style="text-align:left">结合使用<strong>延迟双删</strong>策略和<strong>消息队列</strong>保证最终一致性，解决高并发下缓存与数据库的瞬时不一致问题。</td>
</tr>
<tr>
<td style="text-align:left"><strong>线程池优化</strong></td>
<td style="text-align:left"><strong>定制化线程池</strong></td>
<td style="text-align:left">基于业务场景定制 IO 密集型和 CPU 密集型线程池，并集成 <strong>TraceId</strong>（MDC），便于跨线程的日志链路追踪。</td>
</tr>
<tr>
<td style="text-align:left"><strong>幂等性保障</strong></td>
<td style="text-align:left"><strong>防重复提交机制</strong></td>
<td style="text-align:left">采用 AOP 注解 + Token/分布式锁，实现订单创建、支付等核心接口的幂等性控制，防止用户重复操作。</td>
</tr>
<tr>
<td style="text-align:left"><strong>读写分离优化</strong></td>
<td style="text-align:left"><strong>订单查询分库设计</strong></td>
<td style="text-align:left">针对订单历史查询进行分库设计，避免用户高频查询引发的读扩散问题影响核心业务数据库。</td>
</tr>
<tr>
<td style="text-align:left"><strong>组件化设计</strong></td>
<td style="text-align:left"><strong>SpringBoot Starter</strong></td>
<td style="text-align:left">封装可复用的业务组件，基于 SpringBoot 自动装配机制，提高代码复用率和开发效率。</td>
</tr>
</tbody>
</table>
<hr>
<h2 id="🔧-快速运行" tabindex="-1"><a class="header-anchor" href="#🔧-快速运行"><span>🔧 快速运行</span></a></h2>
<h3 id="本地环境依赖" tabindex="-1"><a class="header-anchor" href="#本地环境依赖"><span>本地环境依赖</span></a></h3>
<ul>
<li>JDK 17</li>
<li>Maven 3.8+</li>
<li>MySQL 8+</li>
<li>Redis 6+</li>
<li>Kafka 3+</li>
<li>Nacos 2.x</li>
</ul>
<h3 id="启动步骤" tabindex="-1"><a class="header-anchor" href="#启动步骤"><span>启动步骤</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"># clone 仓库</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">git</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> clone</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> https://github.com/java-up-up/taopiaopiao.git</span></span>
<span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">cd</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> taopiaopiao</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"># 构建</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">mvn</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> clean</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> package</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -DskipTests</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"># 启动依赖服务（推荐使用 Docker Compose）</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">docker-compose</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> up</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -d</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"># 启动应用服务</span></span>
<span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">cd</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> taopiaopiao-server</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">mvn</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> spring-boot:run</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="swagger-接口文档" tabindex="-1"><a class="header-anchor" href="#swagger-接口文档"><span>Swagger 接口文档</span></a></h3>
<p>访问：<a href="http://localhost:8080/swagger-ui/index.html" target="_blank" rel="noopener noreferrer">http://localhost:8080/swagger-ui/index.html</a></p>
<hr>
<h2 id="📈-性能优化实践" tabindex="-1"><a class="header-anchor" href="#📈-性能优化实践"><span>📈 性能优化实践</span></a></h2>
<p>本地 JMeter 压测（1w 并发）结果：</p>
<table>
<thead>
<tr>
<th>版本</th>
<th>QPS</th>
<th>平均延迟</th>
<th>超卖情况</th>
</tr>
</thead>
<tbody>
<tr>
<td>V1（直写 DB）</td>
<td>~800</td>
<td>500ms+</td>
<td>严重</td>
</tr>
<tr>
<td>V2（Redis 预扣）</td>
<td>~3500</td>
<td>120ms</td>
<td>少量</td>
</tr>
<tr>
<td>V3（Redis Lua + Kafka）</td>
<td>~12000</td>
<td>40ms</td>
<td>无</td>
</tr>
<tr>
<td>V4（加锁优化）</td>
<td>~11000</td>
<td>50ms</td>
<td>无</td>
</tr>
</tbody>
</table>
<blockquote>
<p>⚡ 从直写 DB 到异步 Kafka，性能提升约 15 倍。</p>
</blockquote>
<hr>
<p>✨ <strong>淘票票（Taopiaopiao）——让高并发系统设计更优雅。</strong></p>
</div></template>


