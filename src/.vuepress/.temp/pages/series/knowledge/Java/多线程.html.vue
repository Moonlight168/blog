<template><div><h2 id="⭐java-中的多线程实现方式有哪些" tabindex="-1"><a class="header-anchor" href="#⭐java-中的多线程实现方式有哪些"><span>⭐Java 中的多线程实现方式有哪些？</span></a></h2>
<ol>
<li>
<p><strong>继承 <code v-pre>Thread</code> 类</strong></p>
<ul>
<li>创建子类继承 <code v-pre>Thread</code>，重写 <code v-pre>run()</code> 方法。</li>
<li>调用 <code v-pre>start()</code> 启动线程。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> MyThread</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> extends</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Thread</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> run</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Thread running"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[] </span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        MyThread</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> t</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyThread</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        t</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">start</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 启动线程</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>实现 <code v-pre>Runnable</code> 接口</strong></p>
<ul>
<li>实现 <code v-pre>Runnable</code> 接口，重写 <code v-pre>run()</code> 方法。</li>
<li>传入 <code v-pre>Thread</code> 构造函数，调用 <code v-pre>start()</code> 启动。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> MyRunnable</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> implements</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Runnable</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> run</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Runnable running"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[] </span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        MyRunnable</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> r</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyRunnable</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        Thread</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> t</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> Thread</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(r);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        t</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">start</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 启动线程</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>使用 <code v-pre>Callable</code> 和 <code v-pre>Future</code></strong></p>
<ul>
<li>实现 <code v-pre>Callable</code> 接口，支持返回值和异常处理。</li>
<li>通过 <code v-pre>ExecutorService.submit()</code> 提交任务，使用 <code v-pre>Future.get()</code> 获取结果。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">import</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> java.util.concurrent.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">*</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> MyCallable</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> implements</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Callable</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> String</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> call</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        return</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "Callable running"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[] </span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> throws</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Exception</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        ExecutorService</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> executor</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> Executors</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">newFixedThreadPool</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 提交Callable任务并获取Future对象，用于获取线程执行结果</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        Future</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">> </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">future</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> executor</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">submit</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyCallable</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 通过future.get()阻塞等待线程执行完成，并获取返回值</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">future</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">get</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 输出 Callable 执行结果           executor.shutdown();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>使用线程池 (<code v-pre>ExecutorService</code>)</strong></p>
<ul>
<li>管理和调度线程，减少线程创建开销。</li>
<li>常用线程池：<code v-pre>FixedThreadPool</code>，<code v-pre>CachedThreadPool</code>。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">import</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> java.util.concurrent.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">*</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[] </span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        ExecutorService</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> executor</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> Executors</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">newFixedThreadPool</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        executor</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">submit</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(() </span><span style="--shiki-light:#C18401;--shiki-dark:#C678DD">-></span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Thread pool running"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">));</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        executor</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">shutdown</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>使用 <code v-pre>ForkJoinPool</code></strong></p>
<ul>
<li>适合分治任务，通过 <code v-pre>ForkJoinTask</code> 执行并行计算。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">import</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> java.util.concurrent.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">*</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> MyTask</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> extends</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> RecursiveTask</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> final</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> n</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyTask</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> n</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        this</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">n</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> n;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Override</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    protected</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Integer</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> compute</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (n </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">&#x3C;=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">) {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">            return</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">else</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">            MyTask</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> task1</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyTask</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(n </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">-</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            task1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">fork</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">            return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> n </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">*</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> task1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">join</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[] </span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        ForkJoinPool</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> pool</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ForkJoinPool</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        MyTask</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> task</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyTask</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">5</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">pool</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">invoke</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(task));  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 输出 120</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ol>
<h4 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span><strong>总结：</strong></span></a></h4>
<ul>
<li><strong>继承 <code v-pre>Thread</code></strong>：简单，适合单任务。</li>
<li><strong><code v-pre>Runnable</code></strong>：灵活，适合多个任务共享。</li>
<li><strong><code v-pre>Callable</code> + <code v-pre>Future</code></strong>：支持返回值。</li>
<li><strong>线程池</strong>：高效管理线程。</li>
<li><strong><code v-pre>ForkJoinPool</code></strong>：大规模并行计算。</li>
</ul>
<h2 id="什么是线程安全-如何实现" tabindex="-1"><a class="header-anchor" href="#什么是线程安全-如何实现"><span>什么是线程安全？如何实现？</span></a></h2>
<p><strong>回答：</strong><br>
线程安全指在多线程环境下运行结果正确、状态不被破坏。常见方式有：</p>
<ul>
<li>使用 <code v-pre>synchronized</code>、Lock 加锁；</li>
<li>使用线程安全类如 <code v-pre>ConcurrentHashMap</code>；</li>
<li>使用原子类（如 <code v-pre>AtomicInteger</code>）进行 CAS 操作。</li>
</ul>
<h2 id="hashmap-和-hashtable-的区别" tabindex="-1"><a class="header-anchor" href="#hashmap-和-hashtable-的区别"><span><strong>HashMap 和 Hashtable 的区别：</strong></span></a></h2>
<table>
<thead>
<tr>
<th><strong>维度</strong></th>
<th><strong>HashMap</strong></th>
<th><strong>Hashtable</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>线程安全</strong></td>
<td>不是线程安全的，多个线程同时访问时需要手动同步。</td>
<td>线程安全的，所有方法都被 <code v-pre>synchronized</code> 修饰。</td>
</tr>
<tr>
<td><strong>性能</strong></td>
<td>性能较高，因为不涉及同步操作。</td>
<td>性能较低，因为每个方法都要进行同步。</td>
</tr>
<tr>
<td><strong>null 键和值</strong></td>
<td>允许一个 <code v-pre>null</code> 键和多个 <code v-pre>null</code> 值。</td>
<td>不允许 <code v-pre>null</code> 键和 <code v-pre>null</code> 值。</td>
</tr>
<tr>
<td><strong>迭代器</strong></td>
<td>使用 <code v-pre>Iterator</code>，是 fail-fast 的（即发现结构修改会抛出异常）。</td>
<td>使用 <code v-pre>Enumerator</code>，不是 fail-fast 的。</td>
</tr>
<tr>
<td><strong>继承关系</strong></td>
<td>继承自 <code v-pre>AbstractMap</code> 类。</td>
<td>继承自 <code v-pre>Dictionary</code> 类。</td>
</tr>
<tr>
<td><strong>使用场景</strong></td>
<td>适用于非线程安全的场景，需要高性能时使用。</td>
<td>适用于多线程环境下，需要线程安全时使用。</td>
</tr>
<tr>
<td><strong>可扩展性</strong></td>
<td>提供更好的灵活性，可以通过 <code v-pre>ConcurrentHashMap</code> 替代线程安全需求。</td>
<td>因为本身是线程安全的，但不够高效，已不常使用。</td>
</tr>
</tbody>
</table>
<h4 id="总结-1" tabindex="-1"><a class="header-anchor" href="#总结-1"><span><strong>总结：</strong></span></a></h4>
<ul>
<li><strong>HashMap</strong> 更常用，因为它具有较好的性能和灵活性，适合大多数非线程安全的场景。</li>
<li><strong>Hashtable</strong> 由于性能较低和过时，现在很少使用，通常用 <code v-pre>ConcurrentHashMap</code> 替代。</li>
</ul>
<h2 id="什么是线程的虚假唤醒-为什么if而用-while" tabindex="-1"><a class="header-anchor" href="#什么是线程的虚假唤醒-为什么if而用-while"><span>什么是线程的虚假唤醒？为什么if而用 while？</span></a></h2>
<p><strong>回答：</strong></p>
<p>在Java的多线程编程中，使用 <code v-pre>while</code> 循环而非 <code v-pre>if</code> 来检查等待条件是<strong>线程安全的关键实践</strong>，主要原因是需要防御<strong>虚假唤醒（Spurious Wakeup）<strong>和</strong>条件状态变化</strong>。</p>
<h4 id="_1-虚假唤醒-spurious-wakeup" tabindex="-1"><a class="header-anchor" href="#_1-虚假唤醒-spurious-wakeup"><span><strong>1. 虚假唤醒（Spurious Wakeup）</strong></span></a></h4>
<ul>
<li><strong>定义</strong>：线程可能在没有被明确通知（如 <code v-pre>notify()</code>/<code v-pre>notifyAll()</code>）的情况下从 <code v-pre>wait()</code> 中苏醒。</li>
<li><strong>原因</strong>：这是Java语言规范允许的行为，通常由底层操作系统或JVM优化导致。</li>
<li><strong>风险</strong>：如果使用 <code v-pre>if</code> 检查条件，线程被虚假唤醒后会直接跳过条件检查，继续执行后续代码，可能导致状态不一致。</li>
</ul>
<p><strong>示例</strong>（错误写法，使用 <code v-pre>if</code>）：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">synchronized</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (lock) {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (step </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">!=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 只检查一次</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">wait</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    }</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 虚假唤醒时，即使step≠1也会执行这里</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    printSecond</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">run</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 可能在step≠1时执行，导致顺序错乱</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-条件状态可能被其他线程改变" tabindex="-1"><a class="header-anchor" href="#_2-条件状态可能被其他线程改变"><span><strong>2. 条件状态可能被其他线程改变</strong></span></a></h4>
<ul>
<li>当线程被唤醒时，条件可能已经被其他线程再次改变。</li>
<li><strong>示例场景</strong>：
<ol>
<li>线程B在 <code v-pre>step=1</code> 时被唤醒。</li>
<li>线程A抢先执行并将 <code v-pre>step</code> 重置为0。</li>
<li>线程B如果只用 <code v-pre>if</code> 检查，会直接执行后续代码，导致 <code v-pre>step≠1</code> 时仍执行 <code v-pre>printSecond</code>。</li>
</ol>
</li>
</ul>
<p><strong>正确写法（使用 <code v-pre>while</code>）</strong>：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">synchronized</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (lock) {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    while</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (step </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">!=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 每次苏醒后都重新检查条件</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">wait</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    }</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 只有step==1时才会执行</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    printSecond</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">run</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="为什么避免在多线程编程中使用-static-变量" tabindex="-1"><a class="header-anchor" href="#为什么避免在多线程编程中使用-static-变量"><span><strong>为什么避免在多线程编程中使用 <code v-pre>static</code> 变量？</strong></span></a></h4>
<ol>
<li>
<p><strong>线程安全问题</strong>：</p>
<ul>
<li><code v-pre>static</code> 变量是类级别的变量，不属于任何一个特定实例。所有线程共享同一个 <code v-pre>static</code> 变量，这就可能导致多个线程同时访问并修改该变量，从而引发数据不一致问题。</li>
</ul>
</li>
<li>
<p><strong>可见性问题</strong>：</p>
<ul>
<li>即使使用 <code v-pre>synchronized</code> 或 <code v-pre>volatile</code> 来保护 <code v-pre>static</code> 变量，多个线程可能会看到过时的或不一致的值，因为缓存一致性或内存屏障问题可能导致不同线程对 <code v-pre>static</code> 变量的视图不一致。</li>
</ul>
</li>
<li>
<p><strong>不可预期的行为</strong>：</p>
<ul>
<li>在多线程环境下，<code v-pre>static</code> 变量的状态可能会在不同线程之间传递，这可能导致不可预期的行为，特别是在不当使用的情况下。</li>
</ul>
</li>
<li>
<p><strong>设计问题</strong>：</p>
<ul>
<li><code v-pre>static</code> 变量通常会使代码的可测试性和可维护性降低。它使得状态在类级别上共享，这与对象的封装原则冲突，容易导致耦合和难以理解的代码。</li>
</ul>
</li>
</ol>
<h4 id="如何避免" tabindex="-1"><a class="header-anchor" href="#如何避免"><span><strong>如何避免</strong>：</span></a></h4>
<ul>
<li>使用实例变量而非 <code v-pre>static</code> 变量。</li>
<li>如果必须使用 <code v-pre>static</code> 变量，确保对其访问进行适当的同步或使用线程安全的数据结构（如 <code v-pre>AtomicInteger</code>）。</li>
</ul>
<h2 id="什么是锁" tabindex="-1"><a class="header-anchor" href="#什么是锁"><span><strong>什么是锁？</strong></span></a></h2>
<p>锁是多线程编程中的机制，用于控制对共享资源的访问，确保每次只有一个线程访问资源，避免并发问题。</p>
<h2 id="为什么需要锁" tabindex="-1"><a class="header-anchor" href="#为什么需要锁"><span><strong>为什么需要锁？</strong></span></a></h2>
<ol>
<li><strong>防止数据竞态</strong>：避免多个线程同时修改共享资源导致数据不一致。</li>
<li><strong>保证线程安全</strong>：确保只有一个线程能访问共享资源，保持数据完整性。</li>
<li><strong>避免死锁和阻塞</strong>：合理使用锁避免线程相互等待。</li>
<li><strong>控制访问顺序</strong>：协调线程访问资源，避免冲突。</li>
</ol>
<h2 id="java中的主要锁机制" tabindex="-1"><a class="header-anchor" href="#java中的主要锁机制"><span><strong>Java中的主要锁机制？</strong></span></a></h2>
<ol>
<li>
<p><strong>内置锁（Synchronized）</strong></p>
<ul>
<li><strong>描述</strong>：通过 <code v-pre>synchronized</code> 关键字实现锁，保证同一时刻只有一个线程能执行被同步的代码块。</li>
<li><strong>应用</strong>：可用于方法或代码块。</li>
</ul>
</li>
<li>
<p><strong>显示锁（ReentrantLock）</strong></p>
<ul>
<li><strong>描述</strong>：<code v-pre>java.util.concurrent.locks.ReentrantLock</code> 提供了更灵活的锁控制，支持可重入锁、尝试加锁、超时加锁等功能。</li>
<li><strong>应用</strong>：适用于需要更多控制的场景（如死锁避免）。</li>
</ul>
</li>
<li>
<p><strong>读写锁（ReadWriteLock）</strong></p>
<ul>
<li><strong>描述</strong>：<code v-pre>java.util.concurrent.locks.ReadWriteLock</code>，提供读锁和写锁。允许多个线程并发读取，但写操作时需要独占锁。</li>
<li><strong>应用</strong>：适用于读多写少的场景。</li>
</ul>
</li>
<li>
<p><strong>自旋锁（SpinLock）</strong></p>
<ul>
<li><strong>描述</strong>：线程在获取锁时不断循环判断是否可以获得锁，不会立即挂起线程，减少上下文切换的开销。</li>
<li><strong>应用</strong>：适用于短时间锁定资源的场景。</li>
</ul>
</li>
<li>
<p><strong>乐观锁（CAS）</strong></p>
<ul>
<li><strong>描述</strong>：通过 <code v-pre>java.util.concurrent.atomic</code> 包中的原子变量实现，通过比较和交换操作保证数据一致性。</li>
<li><strong>应用</strong>：适用于无锁并发控制和高效的锁竞争场景。</li>
</ul>
</li>
<li>
<p><strong>偏向锁、轻量级锁、重量级锁</strong></p>
<ul>
<li><strong>描述</strong>：Java虚拟机实现的锁优化，分别用于单线程、线程竞争较小、线程竞争较大的场景。</li>
<li><strong>应用</strong>：自动根据竞争情况进行优化。</li>
</ul>
</li>
</ol>
<h4 id="总结-2" tabindex="-1"><a class="header-anchor" href="#总结-2"><span><strong>总结：</strong></span></a></h4>
<ul>
<li><strong>Synchronized</strong>：简单、常用，适合小范围同步。</li>
<li><strong>ReentrantLock</strong>：提供更多控制，适合复杂锁需求。</li>
<li><strong>ReadWriteLock</strong>：优化读多写少场景。</li>
<li><strong>CAS</strong>：无锁并发控制。</li>
</ul>
<h2 id="synchronized-的使用方式" tabindex="-1"><a class="header-anchor" href="#synchronized-的使用方式"><span><strong><code v-pre>synchronized</code> 的使用方式：</strong></span></a></h2>
<ol>
<li>
<p><strong>同步实例方法</strong></p>
<ul>
<li><strong>作用</strong>：锁定当前对象实例 (<code v-pre>this</code>)，确保同一时间只有一个线程能执行该实例的方法。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> synchronized</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> method</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 同步代码</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>同步静态方法</strong></p>
<ul>
<li><strong>作用</strong>：锁定类的 <code v-pre>Class</code> 对象，确保同一时间只有一个线程能执行该类的静态方法。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> synchronized</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> staticMethod</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 同步代码</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>同步代码块（实例锁）</strong></p>
<ul>
<li><strong>作用</strong>：通过指定某个对象作为锁，锁定特定代码块，其他线程必须等待该锁释放后才能进入该代码块。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> method</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    synchronized</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (lockObject) {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 同步代码块</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>同步代码块（类锁）</strong></p>
<ul>
<li><strong>作用</strong>：锁定类的 <code v-pre>Class</code> 对象，用于控制对静态代码块的访问。</li>
</ul>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> method</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    synchronized</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">MyClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">class</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 同步代码块</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ol>
<h2 id="什么是可重入锁-reentrant-lock" tabindex="-1"><a class="header-anchor" href="#什么是可重入锁-reentrant-lock"><span><strong>什么是可重入锁（Reentrant Lock）？</strong></span></a></h2>
<p>可重入锁是指同一线程可以多次获取同一把锁，而不会发生死锁的情况。换句话说，线程在已经持有锁的情况下，如果再次请求该锁，能够成功获得，而不会被阻塞。</p>
<h4 id="工作原理" tabindex="-1"><a class="header-anchor" href="#工作原理"><span><strong>工作原理：</strong></span></a></h4>
<ul>
<li>当一个线程获得了可重入锁后，它可以多次获取该锁，每次获取时都会对锁的计数器进行增加，直到调用 <code v-pre>unlock()</code> 的次数与锁的获取次数相等时，锁才会真正被释放。</li>
</ul>
<h4 id="特点" tabindex="-1"><a class="header-anchor" href="#特点"><span><strong>特点：</strong></span></a></h4>
<ol>
<li><strong>避免死锁</strong>：同一线程可以重复获取自己已经拥有的锁，而不会造成阻塞或死锁。</li>
<li><strong>递归调用</strong>：当方法内部调用了自己（递归调用）或者调用了其他需要锁的代码时，可以顺利执行。</li>
</ol>
<h4 id="常见实现" tabindex="-1"><a class="header-anchor" href="#常见实现"><span><strong>常见实现：</strong></span></a></h4>
<ol>
<li><strong><code v-pre>synchronized</code></strong>：Java的内置 <code v-pre>synchronized</code> 锁就是可重入的。</li>
<li><strong><code v-pre>ReentrantLock</code></strong>：<code v-pre>java.util.concurrent.locks.ReentrantLock</code> 也是可重入的。</li>
</ol>
<h4 id="示例" tabindex="-1"><a class="header-anchor" href="#示例"><span><strong>示例：</strong></span></a></h4>
<ol>
<li>
<p><strong>使用 <code v-pre>synchronized</code>（隐式可重入锁）</strong>：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ReentrantExample</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> synchronized</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> method1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">        method2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 同一线程可以重复获取锁</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> synchronized</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> method2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Inside method2"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>使用 <code v-pre>ReentrantLock</code>（显式可重入锁）</strong>：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">import</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> java.util.concurrent.locks.ReentrantLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ReentrantLockExample</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> final</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ReentrantLock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> lock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ReentrantLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> method1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        try</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">            method2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 同一线程可以重复获取锁</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> method2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        try</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Inside method2"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ol>
<h4 id="总结-3" tabindex="-1"><a class="header-anchor" href="#总结-3"><span><strong>总结：</strong></span></a></h4>
<ul>
<li><strong>可重入性</strong>：允许线程在持有锁的情况下再次获得该锁，避免死锁。</li>
<li><strong><code v-pre>synchronized</code></strong> 和 <strong><code v-pre>ReentrantLock</code></strong> 都支持可重入性，但 <code v-pre>ReentrantLock</code> 提供了更多的控制，例如可以尝试锁定、定时锁等。</li>
</ul>
<h2 id="reentrantlock与synchronized的区别是什么" tabindex="-1"><a class="header-anchor" href="#reentrantlock与synchronized的区别是什么"><span><code v-pre>ReentrantLock</code>与<code v-pre>synchronized</code>的区别是什么？</span></a></h2>
<table>
<thead>
<tr>
<th>特性</th>
<th><code v-pre>synchronized</code></th>
<th><code v-pre>ReentrantLock</code></th>
</tr>
</thead>
<tbody>
<tr>
<td>锁获取方式</td>
<td>隐式获取和释放</td>
<td>显式调用<code v-pre>lock()</code>和<code v-pre>unlock()</code></td>
</tr>
<tr>
<td>可中断性</td>
<td>不可中断</td>
<td>可中断（<code v-pre>lockInterruptibly()</code>）</td>
</tr>
<tr>
<td>尝试锁</td>
<td>不支持</td>
<td>支持（<code v-pre>tryLock()</code>）</td>
</tr>
<tr>
<td>公平性</td>
<td>非公平</td>
<td>可选择公平或非公平</td>
</tr>
<tr>
<td>条件变量</td>
<td>单一<code v-pre>wait/notify</code>机制</td>
<td>可创建多个<code v-pre>Condition</code>对象</td>
</tr>
</tbody>
</table>
<h2 id="什么是读写锁-readwritelock" tabindex="-1"><a class="header-anchor" href="#什么是读写锁-readwritelock"><span>什么是读写锁（ReadWriteLock）？</span></a></h2>
<p><code v-pre>ReadWriteLock</code> 是一种锁机制，允许多个线程同时读取共享资源，但在写操作时，确保只有一个线程可以修改资源。这种机制能够提高性能，尤其是读操作频繁的场景。</p>
<h4 id="工作原理-1" tabindex="-1"><a class="header-anchor" href="#工作原理-1"><span><strong>工作原理：</strong></span></a></h4>
<ul>
<li><strong>读锁（Read Lock）</strong>：允许多个线程同时持有，只要没有线程持有写锁。多个线程可以并行执行读操作。</li>
<li><strong>写锁（Write Lock）</strong>：只有一个线程可以持有，并且在持有写锁时，其他任何线程都无法获取读锁或写锁。</li>
</ul>
<h4 id="优点" tabindex="-1"><a class="header-anchor" href="#优点"><span><strong>优点：</strong></span></a></h4>
<ul>
<li><strong>并发性</strong>：读锁允许多个线程同时读取，提高并发性能。</li>
<li><strong>排他性</strong>：写锁是独占的，确保写操作的正确性。</li>
</ul>
<h4 id="常见实现-1" tabindex="-1"><a class="header-anchor" href="#常见实现-1"><span><strong>常见实现：</strong></span></a></h4>
<ol>
<li><strong><code v-pre>ReentrantReadWriteLock</code></strong>：Java中 <code v-pre>java.util.concurrent.locks</code> 包中的实现，提供了读锁和写锁。</li>
</ol>
<h4 id="示例-1" tabindex="-1"><a class="header-anchor" href="#示例-1"><span><strong>示例：</strong></span></a></h4>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">import</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> java.util.concurrent.locks.ReentrantReadWriteLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ReadWriteLockExample</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> final</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ReentrantReadWriteLock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> rwLock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ReentrantReadWriteLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> count </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 读操作</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> read</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        rwLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">readLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        try</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Reading: "</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> count);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            rwLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">readLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 写操作</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> write</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> value</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        rwLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">writeLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        try</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">            count </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> value;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Writing: "</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> count);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            rwLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">writeLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[] </span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        ReadWriteLockExample</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> example</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ReadWriteLockExample</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 读操作</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> Thread</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(example</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">::</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">read).</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">start</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> Thread</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(example</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">::</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">read).</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">start</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 写操作</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> Thread</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(() </span><span style="--shiki-light:#C18401;--shiki-dark:#C678DD">-></span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> example</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">write</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">100</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)).</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">start</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="总结-4" tabindex="-1"><a class="header-anchor" href="#总结-4"><span><strong>总结：</strong></span></a></h4>
<ul>
<li><strong>读写锁</strong>适用于读多写少的场景，可以提高并发性能。</li>
<li><strong><code v-pre>ReentrantReadWriteLock</code></strong> 是 <code v-pre>ReadWriteLock</code> 的常见实现，允许多个线程并行读取资源，但写操作是独占的。</li>
</ul>
<h2 id="什么是公平锁和非公平锁" tabindex="-1"><a class="header-anchor" href="#什么是公平锁和非公平锁"><span>什么是公平锁和非公平锁？</span></a></h2>
<ul>
<li><strong>公平锁</strong>：线程按照请求锁的顺序获取锁，先到先得</li>
<li><strong>非公平锁</strong>：线程获取锁的顺序不确定，可能后请求的线程先获得锁</li>
</ul>
<p><code v-pre>ReentrantLock</code>默认是非公平锁，可以通过构造函数指定为公平锁：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Lock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> fairLock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ReentrantLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">true</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 公平锁</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="什么情况下选择synchronized-什么情况下选择reentrantlock" tabindex="-1"><a class="header-anchor" href="#什么情况下选择synchronized-什么情况下选择reentrantlock"><span>什么情况下选择<code v-pre>synchronized</code>，什么情况下选择<code v-pre>ReentrantLock</code>？</span></a></h2>
<ul>
<li>
<p><strong>选择<code v-pre>synchronized</code></strong>：</p>
<ul>
<li>代码简单，不需要高级锁特性</li>
<li>优先考虑代码简洁性和可读性</li>
</ul>
</li>
<li>
<p><strong>选择<code v-pre>ReentrantLock</code></strong>：</p>
<ul>
<li>需要可中断锁、尝试锁或公平锁</li>
<li>需要使用多个条件变量</li>
<li>对锁的性能有更高要求</li>
</ul>
</li>
</ul>
<p>c<br>
CAS是一种无锁算法，用于实现原子操作。它包含三个操作数：</p>
<ul>
<li>内存位置（V）</li>
<li>预期原值（A）</li>
<li>新值（B）</li>
</ul>
<p>如果内存位置的值与预期原值相匹配，那么处理器会自动将该位置值更新为新值。否则，处理器不做任何操作。Java中的<code v-pre>Atomic</code>类（如<code v-pre>AtomicInteger</code>）基于CAS实现。</p>
<h2 id="stampedlock是什么" tabindex="-1"><a class="header-anchor" href="#stampedlock是什么"><span><code v-pre>StampedLock</code>是什么？</span></a></h2>
<p><code v-pre>StampedLock</code> 是 Java 8 引入的一种锁机制，主要用于提高高并发环境下的性能，特别是在读操作远远多于写操作的场景中。</p>
<h4 id="特点-1" tabindex="-1"><a class="header-anchor" href="#特点-1"><span><strong>特点</strong>：</span></a></h4>
<ol>
<li><strong>乐观读</strong>：允许线程在不获取锁的情况下读取共享数据（称为乐观锁）。只有在写锁竞争时，才会升级为悲观锁。</li>
<li><strong>悲观读</strong>：类似传统的读锁，获取锁后才能读取数据。</li>
<li><strong>写锁</strong>：与传统的写锁类似，写操作需要独占锁。</li>
</ol>
<h4 id="优点-1" tabindex="-1"><a class="header-anchor" href="#优点-1"><span><strong>优点</strong>：</span></a></h4>
<ul>
<li>提供更高的并发性，特别是读多写少的场景。</li>
<li>通过乐观锁减少了不必要的锁竞争，提高了效率。</li>
</ul>
<h4 id="使用方式" tabindex="-1"><a class="header-anchor" href="#使用方式"><span><strong>使用方式</strong>：</span></a></h4>
<ul>
<li><code v-pre>readLock()</code>：获取乐观锁。</li>
<li><code v-pre>tryOptimisticRead()</code>：尝试乐观锁，如果读取的数据未被修改则可直接使用，若被修改则需要获取悲观锁。</li>
<li><code v-pre>writeLock()</code>：获取写锁。</li>
<li><code v-pre>unlock()</code>：释放锁。</li>
</ul>
<h4 id="示例-2" tabindex="-1"><a class="header-anchor" href="#示例-2"><span><strong>示例</strong>：</span></a></h4>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">import</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> java.util.concurrent.locks.StampedLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> StampedLockExample</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> final</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> StampedLock</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> lock </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> StampedLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> count </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 乐观读操作</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> int</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> optimisticRead</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        long</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> stamp</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">tryOptimisticRead</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(); </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 获取乐观锁</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> currentCount</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> count; </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 乐观读取数据</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">!</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">validate</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(stamp)) { </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 如果数据被修改，进行悲观读操作</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">            stamp </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">readLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(); </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 获取悲观读锁，可能会阻塞直到没有写锁</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">            try</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">                currentCount </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> count; </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 再次读取数据</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">            } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">                lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlockRead</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(stamp); </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 释放悲观读锁</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">            }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        }</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> currentCount; </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 返回读取的数据</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 写操作</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> increment</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        long</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> stamp</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">writeLock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        try</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">            count++;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">finally</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">unlockWrite</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(stamp);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="锁与原子类的区别是什么" tabindex="-1"><a class="header-anchor" href="#锁与原子类的区别是什么"><span>锁与原子类的区别是什么？</span></a></h2>
<ul>
<li><strong>锁</strong>：通过阻塞线程来保证线程安全，适合保护复杂的操作</li>
<li><strong>原子类</strong>：基于CAS实现，是非阻塞的，适合简单的原子操作</li>
</ul>
<p>原子类（如<code v-pre>AtomicInteger</code>）通常比锁具有更好的性能，特别是在竞争较少的情况下。</p>
<h2 id="什么是锁的饥饿和公平性问题" tabindex="-1"><a class="header-anchor" href="#什么是锁的饥饿和公平性问题"><span>什么是锁的饥饿和公平性问题？</span></a></h2>
<ul>
<li><strong>锁饥饿</strong>：某些线程长期无法获得锁，导致程序性能下降</li>
<li><strong>公平性</strong>：通过公平锁机制确保所有线程都有机会获得锁</li>
</ul>
<p>公平锁可以减少锁饥饿问题，但会带来一定的性能开销。</p>
<h2 id="乐观锁的典型实现方式有哪些" tabindex="-1"><a class="header-anchor" href="#乐观锁的典型实现方式有哪些"><span><strong>乐观锁的典型实现方式有哪些？</strong></span></a></h2>
<p><strong>回答</strong>：</p>
<ol>
<li>
<p><strong>版本号机制</strong>：</p>
<ul>
<li>每次修改数据时递增版本号。</li>
<li>线程读取数据时记录版本号，更新时检查版本号是否与读取时一致。</li>
<li>示例：数据库表中添加<code v-pre>version</code>字段。</li>
</ul>
</li>
<li>
<p><strong>CAS（Compare-and-Swap）</strong>：</p>
<ul>
<li>原子操作，三个参数：内存值（V）、预期原值（A）、新值（B）。</li>
<li>如果 V == A，则将 V 更新为 B；否则操作失败。</li>
<li>Java中的<code v-pre>AtomicInteger</code>类基于CAS实现。</li>
</ul>
</li>
</ol>
<h2 id="cas的底层原理是什么" tabindex="-1"><a class="header-anchor" href="#cas的底层原理是什么"><span><strong>CAS的底层原理是什么？</strong></span></a></h2>
<p><strong>回答</strong>：</p>
<ul>
<li><strong>硬件支持</strong>：CAS依赖CPU的原子指令（如x86的<code v-pre>CMPXCHG</code>），确保操作的原子性。</li>
<li><strong>Java实现</strong>：
<ul>
<li><code v-pre>Unsafe</code>类的<code v-pre>compareAndSwap</code>方法是CAS的核心。</li>
<li><code v-pre>AtomicInteger</code>等原子类通过<code v-pre>Unsafe</code>实现无锁操作。</li>
</ul>
</li>
<li><strong>示例</strong>：<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> final</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> boolean</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> compareAndSet</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> expect</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> int</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> update) {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    return</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> unsafe</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">compareAndSwapInt</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">this</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">, valueOffset, expect, update);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ul>
<h2 id="乐观锁有哪些优缺点" tabindex="-1"><a class="header-anchor" href="#乐观锁有哪些优缺点"><span><strong>乐观锁有哪些优缺点？</strong></span></a></h2>
<p><strong>优点：</strong></p>
<ol>
<li><strong>无锁开销</strong>：无锁机制，提高了并发性能。</li>
<li><strong>非阻塞</strong>：线程不会被阻塞，减少上下文切换。</li>
<li><strong>适合读多写少的场景</strong>：当冲突较少时，性能极高。</li>
</ol>
<p><strong>缺点：</strong></p>
<ol>
<li><strong>冲突时重试消耗资源</strong>：频繁的冲突会导致线程重试，浪费CPU资源。</li>
</ol>
<p><strong>冲突通常指：</strong></p>
<ul>
<li>
<p><strong>数据版本冲突：</strong> 一个线程在读取数据时，其他线程可能已经修改了数据。乐观锁通过记录版本号或时间戳，来检测在操作期间数据是否被其他线程修改。</p>
</li>
<li>
<p><strong>重试消耗：</strong> 乐观锁在检测到冲突时会让线程重试操作，如果冲突发生频繁，线程就会反复重试，消耗CPU资源，影响性能。</p>
</li>
</ul>
<ol start="2">
<li><strong>不适合长事务</strong>：长时间持有数据可能增加冲突的概率。比如线程A占用数据的时间非常长（例如复杂计算），线程B可能在乐观锁的“验证阶段”发现版本号已被更新，导致线程B必须反复尝试。</li>
<li><strong>ABA问题</strong>：若数据值被修改后再恢复原值，乐观锁无法检测到（可以使用<code v-pre>AtomicStampedReference</code>解决）。</li>
</ol>
<h2 id="什么是aba问题-如何解决" tabindex="-1"><a class="header-anchor" href="#什么是aba问题-如何解决"><span><strong>什么是ABA问题？如何解决？</strong></span></a></h2>
<p><strong>回答</strong>：</p>
<ul>
<li><strong>问题描述</strong>：值从A变为B再变回A，CAS操作误认为值未修改。</li>
<li><strong>解决方案</strong>：
<ul>
<li><strong>版本号</strong>：使用<code v-pre>AtomicStampedReference</code>，每次修改时增加版本号。</li>
<li><strong>时间戳</strong>：记录值的修改时间，确保唯一性。</li>
</ul>
</li>
</ul>
<h2 id="乐观锁和悲观锁的适用场景分别是什么" tabindex="-1"><a class="header-anchor" href="#乐观锁和悲观锁的适用场景分别是什么"><span><strong>乐观锁和悲观锁的适用场景分别是什么？</strong></span></a></h2>
<p><strong>回答</strong>：</p>
<table>
<thead>
<tr>
<th><strong>场景</strong></th>
<th><strong>乐观锁</strong></th>
<th><strong>悲观锁</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>读写比例</strong></td>
<td>读多写少</td>
<td>写多读少</td>
</tr>
<tr>
<td><strong>冲突频率</strong></td>
<td>冲突少</td>
<td>冲突多</td>
</tr>
<tr>
<td><strong>典型实现</strong></td>
<td>CAS、版本号</td>
<td><code v-pre>synchronized</code>、<code v-pre>ReentrantLock</code></td>
</tr>
<tr>
<td><strong>示例</strong></td>
<td>缓存更新、数据库乐观锁</td>
<td>临界区代码、数据库行锁</td>
</tr>
</tbody>
</table>
<h2 id="什么是-condition-接口" tabindex="-1"><a class="header-anchor" href="#什么是-condition-接口"><span>什么是 Condition 接口？</span></a></h2>
<p><strong>回答：</strong></p>
<p>Condition接口是 Java 并发包（java.util.concurrent.locks）中的一个组件，用于替代传统的<code v-pre>Object.wait()</code>、<code v-pre>notify()</code>和<code v-pre>notifyAll()</code>方法，提供更灵活的线程等待和唤醒机制。</p>
<p>与 Lock 配合使用：Condition实例通过Lock.newCondition()创建，每个Lock可以关联多个Condition对象。</p>
<h2 id="condition-的核心方法有哪些" tabindex="-1"><a class="header-anchor" href="#condition-的核心方法有哪些"><span>Condition 的核心方法有哪些？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>等待方法：
<ul>
<li><code v-pre>await()</code>：当前线程进入等待状态，直到被唤醒或中断。</li>
<li><code v-pre>await(long time, TimeUnit unit)</code>：带超时的等待。</li>
<li><code v-pre>awaitUninterruptibly()</code>：不可中断的等待。</li>
<li><code v-pre>awaitUntil(Date deadline)</code>：等待到指定时间。</li>
</ul>
</li>
<li>唤醒方法：
<ul>
<li><code v-pre>signal()</code>：唤醒一个等待在该 Condition 上的线程。</li>
<li><code v-pre>signalAll()</code>：唤醒所有等待线程。</li>
</ul>
</li>
</ul>
</div></template>


