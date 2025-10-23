<template><div><h2 id="一、什么是公平锁" tabindex="-1"><a class="header-anchor" href="#一、什么是公平锁"><span>一、什么是公平锁</span></a></h2>
<p>公平锁（Fair Lock）是一种按照 <strong>线程请求锁的先后顺序</strong> 来分配锁资源的机制。<br>
简单来说，<strong>谁先申请锁，谁就先获得锁</strong>，像排队买票一样遵循“先来先得”的原则。</p>
<p>在多线程环境下，公平锁能够确保每个线程都有机会依次获得锁，避免线程“饿死”（长期得不到执行机会）。</p>
<hr>
<h2 id="二、公平锁与非公平锁的区别" tabindex="-1"><a class="header-anchor" href="#二、公平锁与非公平锁的区别"><span>二、公平锁与非公平锁的区别</span></a></h2>
<table>
<thead>
<tr>
<th>对比项</th>
<th>公平锁（Fair Lock）</th>
<th>非公平锁（Non-Fair Lock）</th>
</tr>
</thead>
<tbody>
<tr>
<td>获取顺序</td>
<td>按请求先后顺序（FIFO）获取锁</td>
<td>新线程可直接竞争锁，可能插队成功</td>
</tr>
<tr>
<td>公平性</td>
<td>高（不会饿死线程）</td>
<td>低（可能长期抢不到锁）</td>
</tr>
<tr>
<td>性能</td>
<td>略低（需维护等待队列）</td>
<td>较高（减少排队调度开销）</td>
</tr>
<tr>
<td>使用场景</td>
<td>对公平性要求高的业务</td>
<td>对性能要求高的业务</td>
</tr>
</tbody>
</table>
<p>在实际项目中，<strong>非公平锁更常用</strong>，因为它减少了线程切换的开销，提高系统吞吐量。</p>
<hr>
<h2 id="三、为什么需要公平锁" tabindex="-1"><a class="header-anchor" href="#三、为什么需要公平锁"><span>三、为什么需要公平锁</span></a></h2>
<p>在高并发系统中，如果没有公平机制，某些线程可能长期抢不到锁，出现“<strong>线程饥饿（Starvation）</strong>”问题。</p>
<p>例如：<br>
多个线程不断竞争同一资源时，非公平锁可能让部分线程反复抢占成功，而另一些线程长时间无法执行。</p>
<p>公平锁的设计目的是 <strong>让线程获取锁的顺序更可预期、更稳定</strong>，避免资源分配不均。</p>
<hr>
<h2 id="四、java-中的公平锁实现原理" tabindex="-1"><a class="header-anchor" href="#四、java-中的公平锁实现原理"><span>四、Java 中的公平锁实现原理</span></a></h2>
<h3 id="_1-reentrantlock-的公平与非公平模式" tabindex="-1"><a class="header-anchor" href="#_1-reentrantlock-的公平与非公平模式"><span>1. <code v-pre>ReentrantLock</code> 的公平与非公平模式</span></a></h3>
<p>Java 提供的 <code v-pre>ReentrantLock</code> 支持两种模式：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 公平锁</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Lock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> fairLock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ReentrantLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">true</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 非公平锁（默认）</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Lock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> unfairLock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ReentrantLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">false</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当构造参数为 <code v-pre>true</code> 时，表示启用公平锁机制。</p>
<h3 id="_2-实现原理-基于-aqs-队列" tabindex="-1"><a class="header-anchor" href="#_2-实现原理-基于-aqs-队列"><span>2. 实现原理（基于 AQS 队列）</span></a></h3>
<p>公平锁依赖于 <strong>AQS（AbstractQueuedSynchronizer）同步队列</strong> 实现：</p>
<ul>
<li>当线程尝试获取锁时，AQS 会检查是否有其他线程在等待。</li>
<li>如果有，当前线程会被加入等待队列尾部，依次排队。</li>
<li>当锁释放时，AQS 会唤醒队列头部的下一个线程，让其获取锁。</li>
</ul>
<p>这种机制保证了 <strong>锁的获取顺序与请求顺序一致</strong>，实现真正的公平性。</p>
<p>非公平锁则不同：线程在抢锁时可以直接尝试“插队”获取锁，即使前面还有其他等待的线程，从而提高性能但牺牲公平性。</p>
<hr>
<h2 id="五、公平锁的优缺点" tabindex="-1"><a class="header-anchor" href="#五、公平锁的优缺点"><span>五、公平锁的优缺点</span></a></h2>
<h3 id="优点" tabindex="-1"><a class="header-anchor" href="#优点"><span>优点：</span></a></h3>
<ol>
<li><strong>保证公平性</strong>：线程按照先后顺序获取锁，不会饿死。</li>
<li><strong>调度可预测</strong>：系统行为更稳定，适合对实时性或任务顺序有要求的业务场景。</li>
</ol>
<h3 id="缺点" tabindex="-1"><a class="header-anchor" href="#缺点"><span>缺点：</span></a></h3>
<ol>
<li><strong>性能略低</strong>：线程必须排队，无法利用空闲 CPU 时间快速竞争锁。</li>
<li><strong>上下文切换频繁</strong>：频繁唤醒与阻塞线程会增加系统开销。</li>
</ol>
<hr>
<h2 id="六、应用场景" tabindex="-1"><a class="header-anchor" href="#六、应用场景"><span>六、应用场景</span></a></h2>
<ol>
<li>
<p><strong>任务调度系统</strong><br>
确保任务按照提交顺序执行，避免后来的任务抢占先提交的任务资源。</p>
</li>
<li>
<p><strong>金融交易、订单系统</strong><br>
需要保证请求处理的严格顺序，避免出现处理乱序问题。</p>
</li>
<li>
<p><strong>日志写入、流水记录</strong><br>
对写入顺序要求严格，使用公平锁可确保顺序性与一致性。</p>
</li>
</ol>
<hr>
<h2 id="七、总结" tabindex="-1"><a class="header-anchor" href="#七、总结"><span>七、总结</span></a></h2>
<p>公平锁是一种 <strong>按请求顺序分配锁资源的机制</strong>，确保线程按照先后顺序依次获取锁，从而避免线程饥饿问题。</p>
<p>在 Java 中，<code v-pre>ReentrantLock(true)</code> 就是公平锁的典型实现。<br>
虽然公平锁牺牲了部分性能，但在对执行顺序和公平性有要求的系统中，它能显著提升系统的稳定性与可预测性。</p>
</div></template>


