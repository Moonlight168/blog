<template><div><h1 id="设计模式" tabindex="-1"><a class="header-anchor" href="#设计模式"><span>设计模式</span></a></h1>
<h2 id="volatile和synchronized如何实现单例模式" tabindex="-1"><a class="header-anchor" href="#volatile和synchronized如何实现单例模式"><span>volatile和synchronized如何实现单例模式</span></a></h2>
<p>通过&quot;双重检查锁定&quot;（Double-Checked Locking）模式，结合<code v-pre>volatile</code>和<code v-pre>synchronized</code>，可实现线程安全、高性能的单例模式，代码如下：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Singleton</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 1. volatile修饰实例变量：禁止指令重排序，保证可见性</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> volatile</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Singleton</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> instance </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> null</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 2. 私有构造方法：防止外部直接new创建对象</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> Singleton</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 3. 静态获取实例方法：双重检查锁定</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Singleton</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> getInstance</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 第一次检查：未加锁，快速判断实例是否已存在（避免频繁加锁）</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (instance </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">==</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> null</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">) {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">            // 加锁：仅当实例未创建时，才进入同步代码块（保证线程安全）</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">            synchronized</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">Singleton</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">class</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">) {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">                // 第二次检查：防止多个线程同时进入同步块后，重复创建实例</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">                if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (instance </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">==</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> null</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">) {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">                    instance </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> Singleton</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(); </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// volatile禁止此步骤指令重排序</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">                }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">            }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        }</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> instance;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="核心作用解析" tabindex="-1"><a class="header-anchor" href="#核心作用解析"><span>核心作用解析</span></a></h3>
<ol>
<li>
<p><strong>volatile的必要性</strong><br>
<code v-pre>instance = new Singleton()</code>在JVM中会拆分为3步指令：</p>
<ol>
<li>分配对象内存空间；</li>
<li>初始化对象（调用构造方法）；</li>
<li>将instance指向分配的内存地址。<br>
若不加<code v-pre>volatile</code>，JVM可能进行<strong>指令重排序</strong>（如1→3→2），导致线程A执行到3时，instance已非null，但对象未初始化；此时线程B进入第一次检查，会直接返回未初始化的instance，引发空指针异常。<code v-pre>volatile</code>可禁止指令重排序，确保3在2之后执行。</li>
</ol>
</li>
<li>
<p><strong>synchronized的必要性</strong><br>
当多个线程同时进入&quot;第一次检查&quot;（instance为null时），<code v-pre>synchronized</code>保证只有一个线程能进入同步块，避免多个线程重复创建实例，确保单例唯一性。</p>
</li>
<li>
<p><strong>双重检查的必要性</strong><br>
第一次检查（无锁）：避免实例已创建后，后续线程仍进入同步块，减少锁竞争，提升性能；<br>
第二次检查（有锁）：防止多个线程在实例未创建时，同时等待同步锁，锁释放后重复创建实例。</p>
</li>
</ol>
<h2 id="代理模式和适配器模式有什么区别" tabindex="-1"><a class="header-anchor" href="#代理模式和适配器模式有什么区别"><span>代理模式和适配器模式有什么区别？</span></a></h2>
<table>
<thead>
<tr>
<th>对比维度</th>
<th>代理模式（Proxy Pattern）</th>
<th>适配器模式（Adapter Pattern）</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>核心目的</strong></td>
<td>控制对目标对象的访问，为目标对象添加额外功能（如日志、权限校验、缓存），不改变目标对象的接口。</td>
<td>解决接口不兼容问题，将一个类的接口转换为客户端期望的另一个接口，使原本因接口不匹配无法协作的类能一起工作。</td>
</tr>
<tr>
<td><strong>角色结构</strong></td>
<td>包含3个核心角色：<br>- 抽象主题（Subject）：目标对象和代理的共同接口；<br>- 真实主题（Real Subject）：被代理的目标对象；<br>- 代理（Proxy）：实现Subject接口，持有Real Subject引用，控制访问并添加额外逻辑。</td>
<td>包含3个核心角色：<br>- 目标接口（Target）：客户端期望的接口；<br>- 被适配者（Adaptee）：现有接口不兼容的类；<br>- 适配器（Adapter）：实现Target接口，持有Adaptee引用，将Adaptee的方法适配为Target的方法。</td>
</tr>
<tr>
<td><strong>接口关系</strong></td>
<td>代理与目标对象实现<strong>相同接口</strong>，客户端无需感知代理的存在，可直接通过抽象主题接口调用。</td>
<td>适配器与被适配者实现<strong>不同接口</strong>，适配器将被适配者的接口转换为目标接口，客户端仅依赖目标接口。</td>
</tr>
<tr>
<td><strong>应用场景</strong></td>
<td>1. 远程代理：代理远程对象（如RPC中的代理）；<br>2. 保护代理：控制目标对象的访问权限（如仅管理员可调用）；<br>3. 缓存代理：为目标对象的结果添加缓存（如查询结果缓存）。</td>
<td>1. 类适配器：通过继承被适配者实现适配；<br>2. 对象适配器：通过组合被适配者实现适配；<br>3. 场景示例：将旧系统的接口适配为新系统的接口，兼容第三方组件的接口。</td>
</tr>
<tr>
<td><strong>代码示例逻辑</strong></td>
<td>```java</td>
<td></td>
</tr>
<tr>
<td>// 抽象主题（接口）</td>
<td></td>
<td></td>
</tr>
<tr>
<td void="" display();="">interface Image</td>
<td></td>
<td></td>
</tr>
<tr>
<td>// 真实主题（被代理对象）</td>
<td></td>
<td></td>
</tr>
<tr>
<td>class RealImage implements Image {</td>
<td></td>
<td></td>
</tr>
<tr>
<td System.out.println(显示图片);="">@Override public void display()</td>
<td></td>
<td></td>
</tr>
<tr>
<td>}</td>
<td></td>
<td></td>
</tr>
<tr>
<td>// 代理（添加日志功能）</td>
<td></td>
<td></td>
</tr>
<tr>
<td>class ProxyImage implements Image {</td>
<td></td>
<td></td>
</tr>
<tr>
<td>private RealImage realImage;</td>
<td></td>
<td></td>
</tr>
<tr>
<td>@Override public void display() {</td>
<td></td>
<td></td>
</tr>
<tr>
<td>System.out.println(&quot;日志：开始显示图片&quot;); // 额外功能</td>
<td></td>
<td></td>
</tr>
<tr>
<td>if (realImage == null) realImage = new RealImage();</td>
<td></td>
<td></td>
</tr>
<tr>
<td>realImage.display(); // 调用目标对象方法</td>
<td></td>
<td></td>
</tr>
<tr>
<td>System.out.println(&quot;日志：结束显示图片&quot;); // 额外功能</td>
<td></td>
<td></td>
</tr>
<tr>
<td>}</td>
<td></td>
<td></td>
</tr>
<tr>
<td>}</td>
<td></td>
<td></td>
</tr>
</tbody>
</table>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>|```java</span></span>
<span class="line"><span>// 目标接口（客户端期望）</span></span>
<span class="line"><span>interface MediaPlayer { void play(String type); }</span></span>
<span class="line"><span>// 被适配者（旧接口，不兼容）</span></span>
<span class="line"><span>class AdvancedMediaPlayer {</span></span>
<span class="line"><span>    public void playMp4(String file) { System.out.println("播放MP4：" + file); }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// 适配器（适配旧接口到目标接口）</span></span>
<span class="line"><span>class MediaAdapter implements MediaPlayer {</span></span>
<span class="line"><span>    private AdvancedMediaPlayer advancedPlayer;</span></span>
<span class="line"><span>    @Override public void play(String type) {</span></span>
<span class="line"><span>        if ("mp4".equals(type)) {</span></span>
<span class="line"><span>            // 将MediaPlayer的play转换为AdvancedMediaPlayer的playMp4</span></span>
<span class="line"><span>            advancedPlayer.playMp4(type);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>|</p>
</div></template>


