<template><div><h2 id="一、什么是可重入锁" tabindex="-1"><a class="header-anchor" href="#一、什么是可重入锁"><span>一、什么是可重入锁</span></a></h2>
<p>可重入锁（Reentrant Lock）是一种允许同一个线程 <strong>重复获取同一把锁</strong> 的锁机制。<br>
简单来说，当一个线程已经持有了某个锁，它在未释放该锁之前再次请求同一锁时，系统会允许它继续获取，而不会被阻塞或死锁。</p>
<hr>
<h2 id="二、为什么需要可重入锁" tabindex="-1"><a class="header-anchor" href="#二、为什么需要可重入锁"><span>二、为什么需要可重入锁</span></a></h2>
<p>在多线程编程中，<strong>一个线程可能在调用某个同步方法时，又间接调用了另一个也需要同一把锁的同步方法</strong>。如果没有可重入机制，线程会因为再次尝试获取自己已持有的锁而陷入死锁。</p>
<p>例如：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> synchronized</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> methodA</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Method A"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">    methodB</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 这里再次请求同一把锁</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> synchronized</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> methodB</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Method B"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面的两个方法都被 <code v-pre>synchronized</code> 修饰，意味着它们都需要获取对象的锁。如果没有可重入特性，线程在 <code v-pre>methodA()</code> 中调用 <code v-pre>methodB()</code> 时会再次尝试获取同一把锁，从而自己阻塞自己，导致死锁。</p>
<p>而由于 Java 的内置锁（<code v-pre>synchronized</code>）和 <code v-pre>ReentrantLock</code> 都是可重入锁，因此该代码能正常执行。</p>
<hr>
<h2 id="三、可重入锁的实现原理" tabindex="-1"><a class="header-anchor" href="#三、可重入锁的实现原理"><span>三、可重入锁的实现原理</span></a></h2>
<p>可重入锁的核心原理是 <strong>锁持有计数（Hold Count）机制</strong>。</p>
<ol>
<li>每当一个线程第一次获取锁时，锁的持有计数设为 1。</li>
<li>当该线程再次获取相同的锁时，计数器加 1。</li>
<li>当线程释放锁时，计数器减 1。</li>
<li>只有当计数器降为 0 时，锁才真正被释放。</li>
</ol>
<p>这种设计保证了同一个线程可以安全地多次进入加锁代码块，而不会造成死锁。</p>
<hr>
<h2 id="四、可重入锁的应用场景" tabindex="-1"><a class="header-anchor" href="#四、可重入锁的应用场景"><span>四、可重入锁的应用场景</span></a></h2>
<ol>
<li>
<p><strong>递归调用</strong><br>
在递归函数中可能会多次调用相同的同步代码块，如果没有可重入特性会造成死锁。</p>
</li>
<li>
<p><strong>父子方法调用</strong><br>
当父方法和子方法都需要加同一锁时，可重入锁可以避免线程被自己阻塞。</p>
</li>
<li>
<p><strong>多层封装场景</strong><br>
在框架或组件开发中，底层封装可能已经加锁，调用层无需担心重复加锁问题。</p>
</li>
</ol>
<hr>
<h2 id="五、可重入锁在-java-中的实现" tabindex="-1"><a class="header-anchor" href="#五、可重入锁在-java-中的实现"><span>五、可重入锁在 Java 中的实现</span></a></h2>
<h3 id="_1-synchronized" tabindex="-1"><a class="header-anchor" href="#_1-synchronized"><span>1. <code v-pre>synchronized</code></span></a></h3>
<p>Java 内置关键字 <code v-pre>synchronized</code> 天然支持可重入。<br>
JVM 会在对象头（Object Header）中维护锁的持有线程标识与重入次数，当同一线程再次进入同步块时，计数加一，退出时减一。</p>
<h3 id="_2-reentrantlock" tabindex="-1"><a class="header-anchor" href="#_2-reentrantlock"><span>2. <code v-pre>ReentrantLock</code></span></a></h3>
<p><code v-pre>ReentrantLock</code> 是 <code v-pre>java.util.concurrent.locks</code> 包中的显式可重入锁，它提供了比 <code v-pre>synchronized</code> 更灵活的锁控制能力，如：</p>
<ul>
<li>可响应中断的锁请求；</li>
<li>可设置超时时间；</li>
<li>可实现公平锁。</li>
</ul>
<p>使用示例：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Lock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> lock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ReentrantLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">try</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"第一次加锁"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 第二次加锁（同一线程）</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    try</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"可重入成功"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">} </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出结果：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>第一次加锁  </span></span>
<span class="line"><span>可重入成功</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><hr>
<h2 id="六、可重入锁的优点" tabindex="-1"><a class="header-anchor" href="#六、可重入锁的优点"><span>六、可重入锁的优点</span></a></h2>
<ol>
<li><strong>避免死锁</strong>：允许同一线程多次进入同步区域而不会阻塞。</li>
<li><strong>简化编程逻辑</strong>：开发者无需担心多层调用时锁重复加的问题。</li>
<li><strong>增强灵活性</strong>：显式可重入锁（如 <code v-pre>ReentrantLock</code>）可提供更丰富的控制方式。</li>
</ol>
<hr>
<h2 id="七、总结" tabindex="-1"><a class="header-anchor" href="#七、总结"><span>七、总结</span></a></h2>
<p>可重入锁是一种允许同一线程多次获取同一锁的机制，通过 <strong>锁计数器</strong> 来记录持有次数，防止线程被自身阻塞。<br>
在 Java 中，<code v-pre>synchronized</code> 和 <code v-pre>ReentrantLock</code> 都属于可重入锁，是编写线程安全代码、避免死锁的重要工具。</p>
</div></template>


