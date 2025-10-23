<template><div><h2 id="一、什么是读写锁" tabindex="-1"><a class="header-anchor" href="#一、什么是读写锁"><span>一、什么是读写锁</span></a></h2>
<p>读写锁（Read-Write Lock）是一种比普通互斥锁（Mutex）更细粒度的并发控制机制。它允许多个线程 <strong>同时读取共享资源</strong>，但在有线程执行写操作时，会 <strong>独占锁</strong>，阻塞其他读写线程。</p>
<p>读写锁通常包含两种状态：</p>
<ol>
<li><strong>读锁（共享锁，Read Lock）</strong>：多个线程可以同时获取读锁，前提是没有线程持有写锁。</li>
<li><strong>写锁（独占锁，Write Lock）</strong>：当线程持有写锁时，其他线程无法再获取任何锁（无论是读锁还是写锁）。</li>
</ol>
<hr>
<h2 id="二、为什么需要读写锁" tabindex="-1"><a class="header-anchor" href="#二、为什么需要读写锁"><span>二、为什么需要读写锁</span></a></h2>
<p>在许多应用中，<strong>读操作的频率远高于写操作</strong>。如果仅使用普通的互斥锁（<code v-pre>synchronized</code> 或 <code v-pre>ReentrantLock</code>），即使是多个读取操作，也必须串行执行，这会造成性能浪费。</p>
<p>而读写锁通过区分“读”和“写”两种访问方式，让系统在读多写少的场景下获得更高的并发性能：</p>
<ul>
<li>多个读线程可以 <strong>并发读取</strong> 数据；</li>
<li>写操作仍保持独占，防止并发写入造成数据不一致。</li>
</ul>
<p>常见的使用场景包括：配置中心、缓存系统、搜索引擎索引加载等 <strong>读多写少</strong> 的高并发系统。</p>
<hr>
<h2 id="三、读写锁如何解决并发问题" tabindex="-1"><a class="header-anchor" href="#三、读写锁如何解决并发问题"><span>三、读写锁如何解决并发问题</span></a></h2>
<ol>
<li><strong>读多写少优化</strong>：多个线程可以同时获取读锁，显著提升系统吞吐量。</li>
<li><strong>写操作独占</strong>：在写操作执行期间，禁止其他读写线程访问资源，保证数据一致性。</li>
<li><strong>策略可控</strong>：读写锁可设置为“读优先”或“写优先”，从而在性能与公平性之间做平衡。</li>
</ol>
<hr>
<h2 id="四、读写锁下写锁的获取逻辑" tabindex="-1"><a class="header-anchor" href="#四、读写锁下写锁的获取逻辑"><span>四、读写锁下写锁的获取逻辑</span></a></h2>
<p>当当前存在读锁时，如果有线程尝试获取写锁，会出现以下情况：</p>
<ol>
<li>写锁会被 <strong>阻塞等待</strong>，直到所有读锁都被释放。</li>
<li>一旦读锁全部释放，写锁才能成功获取并执行写操作。</li>
<li>写操作完成后，其他线程才能重新获取读锁或写锁。</li>
</ol>
<p>举个例子：</p>
<table>
<thead>
<tr>
<th>时间</th>
<th>操作</th>
<th>锁状态</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td>T1</td>
<td>ThreadA 获取读锁</td>
<td>读锁数 = 1</td>
<td>✅ 允许</td>
</tr>
<tr>
<td>T2</td>
<td>ThreadB 获取读锁</td>
<td>读锁数 = 2</td>
<td>✅ 允许</td>
</tr>
<tr>
<td>T3</td>
<td>ThreadC 尝试获取写锁</td>
<td>等待中</td>
<td>❌ 阻塞直到所有读锁释放</td>
</tr>
<tr>
<td>T4</td>
<td>ThreadA、B 释放读锁</td>
<td>读锁数 = 0</td>
<td>✅ ThreadC 获得写锁</td>
</tr>
</tbody>
</table>
<p>也就是说，<strong>写锁的获取必须等待读锁全部释放后才能成功</strong>。</p>
<p>这种设计保证了写操作的 <strong>独占性与一致性</strong>，防止写线程在其他线程读取时修改数据，导致数据不稳定或部分可见。</p>
<hr>
<h2 id="五、写锁饥饿问题与公平模式" tabindex="-1"><a class="header-anchor" href="#五、写锁饥饿问题与公平模式"><span>五、写锁饥饿问题与公平模式</span></a></h2>
<p>在默认（非公平）模式下，系统更倾向于优先满足新的读请求，从而提升整体读性能。<br>
但如果读操作持续不断，写线程可能长期被阻塞，形成 <strong>写锁饥饿（Write Starvation）</strong> 问题。</p>
<p>Java 的 <code v-pre>ReentrantReadWriteLock</code> 提供了 <strong>公平模式</strong> 来解决该问题：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">ReentrantReadWriteLock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> lock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ReentrantReadWriteLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">true</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><ul>
<li><code v-pre>true</code> 表示公平锁：读写锁会按照请求顺序获取，防止写线程被读线程长期“压制”。</li>
<li><code v-pre>false</code>（默认）为非公平锁：提升读性能，但存在写锁饥饿风险。</li>
</ul>
<hr>
<h2 id="六、java-中的实现示例" tabindex="-1"><a class="header-anchor" href="#六、java-中的实现示例"><span>六、Java 中的实现示例</span></a></h2>
<p>Java 提供了 <code v-pre>ReentrantReadWriteLock</code> 类来支持可重入读写锁机制：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">ReentrantReadWriteLock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> rwLock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ReentrantReadWriteLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Lock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> readLock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> rwLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">readLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Lock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> writeLock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> rwLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">writeLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 读操作</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">readLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">try</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 执行读取逻辑</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">} </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    readLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 写操作</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">writeLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">try</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 执行写入逻辑</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">} </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    writeLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>特点：</strong></p>
<ul>
<li>读锁可被多个线程同时持有。</li>
<li>写锁获取时会阻塞所有的读线程和写线程。</li>
<li>写操作期间的锁持有具有完全独占性。</li>
</ul>
<hr>
<h2 id="七、总结" tabindex="-1"><a class="header-anchor" href="#七、总结"><span>七、总结</span></a></h2>
<p>读写锁通过将锁粒度细化为“读锁”和“写锁”，在保证数据一致性的同时，大幅提升系统的并发性能：</p>
<ul>
<li><strong>读操作共享</strong>，多个线程可同时访问数据。</li>
<li><strong>写操作独占</strong>，防止数据不一致。</li>
<li><strong>写锁会等待所有读锁释放后再执行</strong>，确保写入安全。</li>
<li>可选择 <strong>公平模式</strong> 以避免写锁饥饿。</li>
</ul>
<p>在“读多写少”的并发场景下，读写锁是实现高性能、线程安全访问的首选机制。</p>
</div></template>


