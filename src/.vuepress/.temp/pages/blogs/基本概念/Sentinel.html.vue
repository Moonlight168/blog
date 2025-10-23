<template><div><h2 id="一、什么是-sentinel" tabindex="-1"><a class="header-anchor" href="#一、什么是-sentinel"><span>一、什么是 Sentinel</span></a></h2>
<p>Sentinel（哨兵）是 Redis 官方提供的 <strong>高可用（High Availability）解决方案</strong>，主要用于 <strong>监控主从集群的运行状态</strong>，并在主节点出现故障时自动完成 <strong>故障转移（Failover）</strong>。</p>
<p>简单来说，Sentinel 是 Redis 的“监控者”和“指挥官”，它能够在主节点宕机时自动选出新的主节点，保证 Redis 服务的持续可用。</p>
<hr>
<h2 id="二、sentinel-的核心功能" tabindex="-1"><a class="header-anchor" href="#二、sentinel-的核心功能"><span>二、Sentinel 的核心功能</span></a></h2>
<ol>
<li>
<p><strong>监控（Monitoring）</strong><br>
Sentinel 会不断地检查主节点（master）和从节点（slave）的运行状态，判断节点是否在线。</p>
</li>
<li>
<p><strong>通知（Notification）</strong><br>
一旦检测到节点故障，Sentinel 会通过消息通知系统管理员或其他应用程序。</p>
</li>
<li>
<p><strong>自动故障转移（Automatic Failover）</strong><br>
当主节点被判定为不可用时，Sentinel 会自动将一个从节点提升为新的主节点，并通知其他从节点和客户端进行切换。</p>
</li>
<li>
<p><strong>配置中心（Configuration Provider）</strong><br>
Sentinel 会动态更新主节点信息，客户端可以通过 Sentinel 获取当前主节点的地址，实现自动连接切换。</p>
</li>
</ol>
<hr>
<h2 id="三、sentinel-的工作原理" tabindex="-1"><a class="header-anchor" href="#三、sentinel-的工作原理"><span>三、Sentinel 的工作原理</span></a></h2>
<p>Sentinel 通过以下机制协同完成高可用：</p>
<ol>
<li>
<p><strong>定期心跳检测</strong><br>
每个 Sentinel 节点会定期发送 <code v-pre>PING</code> 命令给所有主从节点和其他 Sentinel，判断其是否健康。</p>
</li>
<li>
<p><strong>主观下线（Subjective Down，SDOWN）</strong><br>
如果某个 Sentinel 认为主节点在一段时间内无响应，就会标记为“主观下线”。</p>
</li>
<li>
<p><strong>客观下线（Objective Down，ODOWN）</strong><br>
当多个 Sentinel 一致认为主节点确实宕机后，才会将其标记为“客观下线”，以避免误判。</p>
</li>
<li>
<p><strong>故障转移（Failover）</strong></p>
<ul>
<li>由一个 Sentinel 发起“选举”，选出一个从节点作为新的主节点；</li>
<li>其他从节点会自动复制新的主节点数据；</li>
<li>Sentinel 更新集群配置，并通知客户端切换。</li>
</ul>
</li>
</ol>
<hr>
<h2 id="四、sentinel-集群架构" tabindex="-1"><a class="header-anchor" href="#四、sentinel-集群架构"><span>四、Sentinel 集群架构</span></a></h2>
<p>一个完整的 Sentinel 架构通常包含以下角色：</p>
<ul>
<li><strong>1 个主节点（Master）</strong>：负责写操作；</li>
<li><strong>多个从节点（Slave）</strong>：负责数据复制与读操作；</li>
<li><strong>多个 Sentinel 节点</strong>：协同监控主从状态。</li>
</ul>
<p>客户端连接时，不直接指定主节点地址，而是先连接 Sentinel，通过它动态获取当前主节点位置。</p>
<hr>
<h2 id="五、sentinel-的高可用特性" tabindex="-1"><a class="header-anchor" href="#五、sentinel-的高可用特性"><span>五、Sentinel 的高可用特性</span></a></h2>
<ol>
<li><strong>自动主从切换</strong>：主节点宕机后，无需人工干预即可完成故障转移。</li>
<li><strong>多 Sentinel 决策机制</strong>：通过投票机制避免单点误判。</li>
<li><strong>与 Redis 主从复制天然集成</strong>：无需额外插件或代理。</li>
<li><strong>客户端自动感知主节点变化</strong>：提升系统的可靠性与可维护性。</li>
</ol>
<hr>
<h2 id="六、sentinel-的典型配置" tabindex="-1"><a class="header-anchor" href="#六、sentinel-的典型配置"><span>六、Sentinel 的典型配置</span></a></h2>
<p>示例配置文件 <code v-pre>sentinel.conf</code>：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">port</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 26379</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">sentinel</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> monitor</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> mymaster</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 127.0.0.1</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 6379</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 2</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">sentinel</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> down-after-milliseconds</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> mymaster</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 5000</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">sentinel</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> failover-timeout</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> mymaster</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 10000</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">sentinel</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> parallel-syncs</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> mymaster</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>说明：</p>
<ul>
<li><code v-pre>mymaster</code>：主节点名称。</li>
<li><code v-pre>2</code>：至少 2 个 Sentinel 同意后，才确认主节点下线。</li>
<li><code v-pre>down-after-milliseconds</code>：节点无响应超过 5 秒即认为下线。</li>
<li><code v-pre>failover-timeout</code>：故障转移超时时间。</li>
</ul>
<hr>
<h2 id="七、sentinel-的常见使用场景" tabindex="-1"><a class="header-anchor" href="#七、sentinel-的常见使用场景"><span>七、Sentinel 的常见使用场景</span></a></h2>
<ol>
<li><strong>Redis 高可用部署</strong>：在主从架构基础上提供自动容错能力。</li>
<li><strong>生产级缓存集群</strong>：确保主节点宕机后系统仍能自动恢复。</li>
<li><strong>读写分离架构</strong>：Sentinel 与主从结合，实现自动主写、从读。</li>
</ol>
<hr>
<h2 id="八、sentinel-与集群模式的区别" tabindex="-1"><a class="header-anchor" href="#八、sentinel-与集群模式的区别"><span>八、Sentinel 与集群模式的区别</span></a></h2>
<table>
<thead>
<tr>
<th>对比项</th>
<th>Sentinel 模式</th>
<th>Redis Cluster 模式</th>
</tr>
</thead>
<tbody>
<tr>
<td>数据分布</td>
<td>全量复制（主从）</td>
<td>分片（Hash Slot）</td>
</tr>
<tr>
<td>高可用</td>
<td>✅ 自动主从切换</td>
<td>✅ 自动重分片与故障恢复</td>
</tr>
<tr>
<td>扩展性</td>
<td>中等</td>
<td>强（水平扩展）</td>
</tr>
<tr>
<td>客户端支持</td>
<td>需要 Sentinel 感知</td>
<td>客户端直接感知节点变化</td>
</tr>
<tr>
<td>使用场景</td>
<td>小中型项目、高可用缓存</td>
<td>大数据量、高并发分布式系统</td>
</tr>
</tbody>
</table>
<hr>
<h2 id="九、总结" tabindex="-1"><a class="header-anchor" href="#九、总结"><span>九、总结</span></a></h2>
<p>Redis Sentinel 是一种轻量级、高可用的 Redis 集群监控与故障转移机制：</p>
<ul>
<li>它能够自动检测主从状态，完成主节点选举与切换；</li>
<li>保证 Redis 服务在主节点宕机时依然可用；</li>
<li>适合中小规模、高可靠性的 Redis 部署方案。</li>
</ul>
<p>在实际生产中，Sentinel 模式常用于 <strong>读写分离、高可用缓存系统、微服务配置中心</strong> 等场景，是 Redis 高可用架构的核心组件之一。</p>
</div></template>


