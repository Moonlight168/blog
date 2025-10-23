<template><div><h2 id="java中有哪些集合" tabindex="-1"><a class="header-anchor" href="#java中有哪些集合"><span>Java中有哪些集合？</span></a></h2>
<p><strong>回答：</strong><br>
<img src="@source/zh/series/knowledge/Java/img.png" alt="img.png" loading="lazy"></p>
<h2 id="list-set-queue-map-有什么区别" tabindex="-1"><a class="header-anchor" href="#list-set-queue-map-有什么区别"><span>List, Set, Queue, Map 有什么区别？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li><strong>List</strong>：有序、可重复，如 <code v-pre>ArrayList</code>、<code v-pre>LinkedList</code></li>
<li><strong>Set</strong>：无序、不可重复，如 <code v-pre>HashSet</code>、<code v-pre>TreeSet</code></li>
<li><strong>Queue</strong>：队列结构，先进先出，如 <code v-pre>LinkedList</code>、<code v-pre>PriorityQueue</code></li>
<li><strong>Map</strong>：键值对存储，键唯一，如 <code v-pre>HashMap</code>、<code v-pre>TreeMap</code></li>
</ul>
<h2 id="arraylist-和-数组-有什么区别" tabindex="-1"><a class="header-anchor" href="#arraylist-和-数组-有什么区别"><span>ArrayList 和 数组 有什么区别？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li><strong>数组</strong>：长度固定，类型单一，性能高</li>
<li><strong>ArrayList</strong>：长度可变，提供丰富的API，底层基于数组实现</li>
<li><strong>适用场景</strong>：数组适合性能敏感、长度固定的场景，ArrayList 更适合动态增删数据的场景</li>
</ul>
<h2 id="为什么要使用集合-如何选择" tabindex="-1"><a class="header-anchor" href="#为什么要使用集合-如何选择"><span>为什么要使用集合，如何选择？</span></a></h2>
<p><strong>一、使用集合的原因</strong></p>
<ol>
<li><strong>动态扩容</strong>：自动扩展容量，无需预设大小</li>
<li><strong>功能丰富</strong>：提供常用操作方法</li>
<li><strong>类型安全</strong>：使用泛型，避免类型错误</li>
<li><strong>高性能</strong>：Java 集合经过优化，效率高</li>
</ol>
<p><strong>二、选择集合的方法</strong></p>
<ol>
<li>
<p><strong>按数据特点</strong>：</p>
<ul>
<li>允许重复：用 <code v-pre>List</code>（<code v-pre>ArrayList</code>、<code v-pre>LinkedList</code>）</li>
<li>不允许重复：用 <code v-pre>Set</code>（<code v-pre>HashSet</code>、<code v-pre>TreeSet</code>）</li>
<li>键值对存储：用 <code v-pre>Map</code>（<code v-pre>HashMap</code>、<code v-pre>TreeMap</code>）</li>
</ul>
</li>
<li>
<p><strong>按线程环境</strong>：</p>
<ul>
<li>单线程：用非同步集合（<code v-pre>ArrayList</code>、<code v-pre>HashMap</code>）</li>
<li>多线程：用同步集合（<code v-pre>Vector</code>、<code v-pre>ConcurrentHashMap</code>）</li>
</ul>
</li>
</ol>
<h2 id="arraylist-的扩容机制" tabindex="-1"><a class="header-anchor" href="#arraylist-的扩容机制"><span>ArrayList 的扩容机制？</span></a></h2>
<p><strong>回答：</strong></p>
<ol>
<li><strong>初始容量</strong>：默认初始容量为 0（JDK 8+ 后），首次添加元素时扩容为 10。</li>
<li><strong>扩容触发条件</strong>：当元素数量超过当前容量时触发扩容。</li>
<li><strong>扩容公式</strong>：新容量 = <strong>原容量 * 1.5</strong>（如 10 → 15 → 22 → 33）。</li>
<li><strong>数组复制</strong>：扩容后通过 <code v-pre>Arrays.copyOf()</code> 复制数组，性能开销较大。</li>
<li><strong>优化</strong>：可通过 <code v-pre>new ArrayList&lt;&gt;(初始容量)</code> 手动预分配容量，避免频繁扩容。</li>
</ol>
<p><strong>面试答题模板</strong>：</p>
<div class="language-text line-numbers-mode" data-highlighter="shiki" data-ext="text" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-text"><span class="line"><span>1. 初始容量：默认 0，首次添加扩容为 10。</span></span>
<span class="line"><span>2. 触发条件：元素数量超过当前容量。</span></span>
<span class="line"><span>3. 扩容公式：原容量 * 1.5。</span></span>
<span class="line"><span>4. 数组复制：使用 `Arrays.copyOf()`，性能开销大。</span></span>
<span class="line"><span>5. 优化：预分配容量提升性能。</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>源码验证（JDK 17）</strong></p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> grow</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> minCapacity) {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> oldCapacity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> elementData</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">length</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> newCapacity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> oldCapacity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">+</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (oldCapacity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">>></span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 1.5倍</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (newCapacity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">-</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> minCapacity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">&#x3C;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">        newCapacity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> minCapacity</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 若1.5倍不够，直接用minCapacity</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (newCapacity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">-</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> MAX_ARRAY_SIZE </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">></span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">        newCapacity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> hugeCapacity</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(minCapacity)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 处理超大容量</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    elementData </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> Arrays</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">copyOf</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(elementData, newCapacity);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 复制数组</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="comparable-和-comparator-的区别" tabindex="-1"><a class="header-anchor" href="#comparable-和-comparator-的区别"><span>Comparable 和 Comparator 的区别</span></a></h2>
<p><strong>回答：</strong></p>
<h4 id="_1-核心区别" tabindex="-1"><a class="header-anchor" href="#_1-核心区别"><span>1. 核心区别</span></a></h4>
<table>
<thead>
<tr>
<th><strong>维度</strong></th>
<th><strong>Comparable</strong></th>
<th><strong>Comparator</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>接口定义</strong></td>
<td><code v-pre>compareTo()</code> 方法，定义自然排序规则</td>
<td><code v-pre>compare()</code> 方法，定义临时排序规则</td>
</tr>
<tr>
<td><strong>耦合度</strong></td>
<td>排序与类绑定，侵入性强</td>
<td>排序与类分离，解耦性好</td>
</tr>
<tr>
<td><strong>使用场景</strong></td>
<td>类的默认排序方式</td>
<td>需要额外排序规则（如逆序、按其他字段排序）</td>
</tr>
</tbody>
</table>
<h4 id="_2-代码对比" tabindex="-1"><a class="header-anchor" href="#_2-代码对比"><span>2. 代码对比</span></a></h4>
<p><strong>Comparable 示例</strong></p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Person</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> implements</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Comparable</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Person</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Override</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> int</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> compareTo</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Person</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> other</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        return</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> this</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">age</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> -</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> other</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">age</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 按年龄升序</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">Collections</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">sort</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(people);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 自动按默认规则排序</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>Comparator 示例</strong></p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Comparator</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Person</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> ageComparator </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (p1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> p2) </span><span style="--shiki-light:#C18401;--shiki-dark:#C678DD">-></span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> p1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getAge</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> -</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> p2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getAge</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 按年龄升序</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">Collections</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">sort</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(people, ageComparator);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 按指定规则排序</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3-关键方法" tabindex="-1"><a class="header-anchor" href="#_3-关键方法"><span>3. 关键方法</span></a></h4>
<ul>
<li><strong>Comparable</strong>：<code v-pre>int compareTo(T o)</code></li>
<li><strong>Comparator</strong>：<code v-pre>int compare(T o1, T o2)</code></li>
</ul>
<h4 id="_4-优缺点" tabindex="-1"><a class="header-anchor" href="#_4-优缺点"><span>4. 优缺点</span></a></h4>
<table>
<thead>
<tr>
<th><strong>接口</strong></th>
<th><strong>优点</strong></th>
<th><strong>缺点</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Comparable</strong></td>
<td>直接排序，简单易用</td>
<td>排序规则固定，灵活性差</td>
</tr>
<tr>
<td><strong>Comparator</strong></td>
<td>多维度排序，不修改原类</td>
<td>需要额外的 Comparator 实例</td>
</tr>
</tbody>
</table>
<h4 id="_5-应用场景" tabindex="-1"><a class="header-anchor" href="#_5-应用场景"><span>5. 应用场景</span></a></h4>
<ul>
<li><strong>Comparable</strong>：自定义类的默认排序，常用于数字、字符串等基本类型</li>
<li><strong>Comparator</strong>：临时排序、按多个规则排序，或对未实现 <code v-pre>Comparable</code> 的类排序</li>
</ul>
<h4 id="_6-面试高频问题" tabindex="-1"><a class="header-anchor" href="#_6-面试高频问题"><span>6. 面试高频问题</span></a></h4>
<p><strong>问</strong>：“如何对一个没有实现 <code v-pre>Comparable</code> 的类排序？”</p>
<p><strong>答</strong>：创建外部 <code v-pre>Comparator</code>，或者修改类实现 <code v-pre>Comparable</code>。</p>
<h2 id="为什么泛型不能直接使用基本类型-那如何在泛型中使用基本类型" tabindex="-1"><a class="header-anchor" href="#为什么泛型不能直接使用基本类型-那如何在泛型中使用基本类型"><span>为什么泛型不能直接使用基本类型？那如何在泛型中使用基本类型？</span></a></h2>
<p><strong>回答：</strong></p>
<ol>
<li>
<p><strong>原因</strong>：</p>
<ul>
<li><strong>Java 泛型使用类型擦除机制</strong>：在编译时，泛型类型被擦除，转换为 <code v-pre>Object</code> 类型。由于基本类型（如 <code v-pre>int</code>, <code v-pre>char</code>）不是对象，无法作为泛型参数。</li>
<li><strong>类型安全</strong>：泛型要求类型参数必须是类类型，而基本类型不是类，因此无法直接使用。</li>
</ul>
</li>
<li>
<p><strong>如何使用基本类型</strong>：</p>
<ul>
<li>
<p><strong>使用包装类</strong>：Java 提供了基本类型的包装类（如 <code v-pre>Integer</code>、<code v-pre>Double</code>、<code v-pre>Character</code>），可以使用这些包装类作为泛型类型。</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">List</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> list </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ArrayList</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">list</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">10</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 使用包装类 Integer</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>自动装箱与拆箱</strong>：Java 自动将基本类型转换为包装类，或将包装类转换回基本类型，无需显式转换。</p>
</li>
</ul>
</li>
</ol>
<h2 id="java中的类型擦除是什么-这样做的目的和后果是什么" tabindex="-1"><a class="header-anchor" href="#java中的类型擦除是什么-这样做的目的和后果是什么"><span>Java中的类型擦除是什么？这样做的目的和后果是什么？</span></a></h2>
<h4 id="_1-类型擦除定义" tabindex="-1"><a class="header-anchor" href="#_1-类型擦除定义"><span><strong>1. 类型擦除定义</strong></span></a></h4>
<ul>
<li>编译器将泛型类型参数替换为上限类型（通常是<code v-pre>Object</code>，若有显式边界则为边界类型）。</li>
<li>运行时泛型类型信息被移除，<code v-pre>List&lt;Integer&gt;</code> 和 <code v-pre>List&lt;String&gt;</code> 在运行时都为 <code v-pre>List</code>。</li>
</ul>
<h4 id="_2-擦除规则" tabindex="-1"><a class="header-anchor" href="#_2-擦除规则"><span><strong>2. 擦除规则</strong></span></a></h4>
<ul>
<li>
<p><strong>无边界泛型</strong>：擦除为 <code v-pre>Object</code>。</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Box</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">T</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> private</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> T</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> value</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> }</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 编译后：private Object value;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
<li>
<p><strong>有边界泛型</strong>：擦除为边界类型。</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Box</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">T</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> extends</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Number</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> private</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> T</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> value</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> }</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 编译后：private Number value;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
</ul>
<h4 id="_3-类型擦除目的" tabindex="-1"><a class="header-anchor" href="#_3-类型擦除目的"><span><strong>3. 类型擦除目的</strong></span></a></h4>
<ul>
<li><strong>保持二进制兼容性</strong>：确保泛型代码与老版本代码兼容。</li>
<li><strong>简化实现</strong>：避免为每个泛型类型生成单独的类，减少字节码大小。</li>
</ul>
<h4 id="_4-后果" tabindex="-1"><a class="header-anchor" href="#_4-后果"><span><strong>4. 后果</strong></span></a></h4>
<ul>
<li><strong>运行时无法获取泛型类型信息</strong>：<code v-pre>List&lt;Integer&gt;</code> 和 <code v-pre>List&lt;String&gt;</code> 运行时无法区分。</li>
<li><strong>不能创建泛型数组</strong>：如 <code v-pre>new List&lt;Integer&gt;[10]</code> 编译错误。</li>
<li><strong>基本类型不能作为泛型类型</strong>：如 <code v-pre>List&lt;int&gt;</code> 编译错误，需使用包装类。</li>
<li><strong>静态成员不能引用泛型参数</strong>：如 <code v-pre>private static T value;</code> 编译错误。</li>
</ul>
<h4 id="_5-解决运行时无法获取泛型类型信息的方式" tabindex="-1"><a class="header-anchor" href="#_5-解决运行时无法获取泛型类型信息的方式"><span><strong>5. 解决运行时无法获取泛型类型信息的方式</strong></span></a></h4>
<ul>
<li>
<p><strong>反射</strong>：通过反射获取泛型类型信息，例如使用 <code v-pre>getGenericSuperclass()</code> 获取类的泛型类型。</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Box</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">T</span><span style="--shiki-light:#C18401;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {}</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Box</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> box </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Box</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Type</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> type </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> box</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getGenericSuperclass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 获取泛型类型</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(type);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 输出 Box&#x3C;Integer></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>通配符</strong>：使用通配符（<code v-pre>?</code>）来处理不同类型的泛型参数，配合反射操作实现类型获取。</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">List</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#C678DD">?</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> list </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ArrayList</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Type</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> type </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> list</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getGenericSuperclass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 获取 List&#x3C;?> 的类型信息</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(type);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 输出 List</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ul>
<h4 id="常见面试问题" tabindex="-1"><a class="header-anchor" href="#常见面试问题"><span><strong>常见面试问题</strong></span></a></h4>
<ul>
<li>
<p><strong>Q</strong>：为什么选择类型擦除？</p>
<ul>
<li><strong>A</strong>：为了兼容老版本代码，避免修改现有类库。</li>
</ul>
</li>
<li>
<p><strong>Q</strong>：类型擦除带来什么问题？</p>
<ul>
<li><strong>A</strong>：无法区分泛型类型、无法创建泛型数组、基本类型不能作为泛型。</li>
</ul>
</li>
</ul>
</div></template>


