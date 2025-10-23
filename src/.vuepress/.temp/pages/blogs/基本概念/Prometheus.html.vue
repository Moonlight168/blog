<template><div><h2 id="一、什么是-prometheus" tabindex="-1"><a class="header-anchor" href="#一、什么是-prometheus"><span>一、什么是 Prometheus</span></a></h2>
<p>Prometheus 是一个 <strong>开源的系统监控与告警工具</strong>，由 SoundCloud 于 2012 年开发，并在 2015 年成为 CNCF（云原生计算基金会）托管项目。<br>
它以时间序列数据库（Time Series Database, TSDB）为核心，用于采集、存储和查询各种指标数据，是云原生监控体系中最重要的组件之一。</p>
<p>通俗来说，Prometheus 就是一个能“自动拉取监控数据、保存历史指标、支持灵活查询和告警”的监控平台。</p>
<hr>
<h2 id="二、prometheus-的核心特点" tabindex="-1"><a class="header-anchor" href="#二、prometheus-的核心特点"><span>二、Prometheus 的核心特点</span></a></h2>
<ol>
<li>
<p><strong>多维度数据模型</strong><br>
Prometheus 将监控数据存储为时间序列，每条数据由：</p>
<ul>
<li><code v-pre>metric name</code>（指标名）</li>
<li>一组 <code v-pre>labels</code>（标签键值对）</li>
<li>对应的时间戳和值<br>
组成。<br>
例如：</li>
</ul>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>http_requests_total{method="GET", status="200"} 1027</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
<li>
<p><strong>拉模式数据采集（Pull）</strong><br>
Prometheus 主动从目标（如应用、容器、系统节点）中“拉取”数据，而不是被动接收。<br>
这种设计使得 Prometheus 更容易在动态环境（如 Kubernetes）中自动发现和管理监控目标。</p>
</li>
<li>
<p><strong>强大的查询语言（PromQL）</strong><br>
PromQL（Prometheus Query Language）是 Prometheus 的查询语言，能对指标数据进行实时聚合、过滤和计算，用于可视化和告警规则。</p>
</li>
<li>
<p><strong>独立运行，无需外部依赖</strong><br>
Prometheus 自带存储引擎和 Web 界面，不依赖外部数据库，易于部署与维护。</p>
</li>
<li>
<p><strong>与 Grafana 深度集成</strong><br>
Grafana 通常与 Prometheus 搭配使用，用于将监控数据可视化展示成图表与仪表盘。</p>
</li>
</ol>
<hr>
<h2 id="三、prometheus-的架构组成" tabindex="-1"><a class="header-anchor" href="#三、prometheus-的架构组成"><span>三、Prometheus 的架构组成</span></a></h2>
<p>Prometheus 的核心组件包括：</p>
<ol>
<li>
<p><strong>Prometheus Server</strong><br>
负责定期拉取监控数据、存储指标并提供查询接口。</p>
</li>
<li>
<p><strong>Exporter</strong><br>
数据采集端，用于将系统或应用的运行状态暴露为 HTTP 接口供 Prometheus 拉取。<br>
常见类型包括：</p>
<ul>
<li>Node Exporter（监控主机资源）</li>
<li>Redis Exporter</li>
<li>MySQL Exporter</li>
<li>JMX Exporter（Java 应用）</li>
</ul>
</li>
<li>
<p><strong>Alertmanager</strong><br>
处理来自 Prometheus 的告警规则，负责告警聚合、抑制、路由以及通知（如邮件、钉钉、企业微信）。</p>
</li>
<li>
<p><strong>Pushgateway</strong><br>
用于短生命周期任务（如定时任务、批处理）无法暴露 HTTP 接口的场景，将数据主动“推送”给 Prometheus。</p>
</li>
<li>
<p><strong>Service Discovery（服务发现）</strong><br>
支持动态注册机制，如 Kubernetes、Consul、Eureka 等，使 Prometheus 能自动发现新目标。</p>
</li>
</ol>
<hr>
<h2 id="四、prometheus-的工作原理" tabindex="-1"><a class="header-anchor" href="#四、prometheus-的工作原理"><span>四、Prometheus 的工作原理</span></a></h2>
<ol>
<li>
<p><strong>采集数据（Scrape）</strong><br>
Prometheus 按配置文件中的目标地址，定期从 Exporter 拉取指标数据。</p>
</li>
<li>
<p><strong>存储数据（Store）</strong><br>
采集到的数据以时间序列形式存储在本地 TSDB 中。</p>
</li>
<li>
<p><strong>查询分析（Query）</strong><br>
用户可通过 PromQL 查询、聚合或筛选指标数据，用于监控面板或告警。</p>
</li>
<li>
<p><strong>触发告警（Alert）</strong><br>
当某个指标超过阈值时，Prometheus 会将告警事件发送给 Alertmanager，再由 Alertmanager 通知相关人员。</p>
</li>
</ol>
<hr>
<h2 id="五、prometheus-的应用场景" tabindex="-1"><a class="header-anchor" href="#五、prometheus-的应用场景"><span>五、Prometheus 的应用场景</span></a></h2>
<ol>
<li>
<p><strong>微服务监控</strong><br>
监控每个微服务的请求量、响应时间、错误率等指标。</p>
</li>
<li>
<p><strong>容器与集群监控</strong><br>
与 Kubernetes 集成，实现 Pod、Node、Namespace 等多层级监控。</p>
</li>
<li>
<p><strong>数据库与中间件监控</strong><br>
如 Redis、MySQL、Kafka、Nginx 的运行状态和性能指标。</p>
</li>
<li>
<p><strong>自定义业务指标</strong><br>
开发者可通过 SDK 将自定义指标（如订单量、交易成功率）暴露给 Prometheus。</p>
</li>
</ol>
<hr>
<h2 id="六、prometheus-的优点" tabindex="-1"><a class="header-anchor" href="#六、prometheus-的优点"><span>六、Prometheus 的优点</span></a></h2>
<ol>
<li><strong>部署简单，无外部依赖</strong></li>
<li><strong>数据模型灵活，支持高维度标签查询</strong></li>
<li><strong>强大的查询语言 PromQL</strong></li>
<li><strong>易与 Grafana 集成，可视化能力强</strong></li>
<li><strong>高性能与高可用，可支持百万级时序数据</strong></li>
</ol>
<hr>
<h2 id="七、总结" tabindex="-1"><a class="header-anchor" href="#七、总结"><span>七、总结</span></a></h2>
<p>Prometheus 是一款基于时间序列数据库的监控与告警系统，具备高性能、灵活性和强扩展性。<br>
它通过“拉取指标 + 标签管理 + PromQL 查询 + 告警机制”构建了完整的监控生态，广泛应用于云原生、微服务、容器化系统中，是现代分布式系统监控的核心解决方案。</p>
</div></template>


