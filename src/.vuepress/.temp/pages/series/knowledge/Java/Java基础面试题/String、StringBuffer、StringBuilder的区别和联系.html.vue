<template><div><h1 id="string、stringbuffer、stringbuilder的区别和联系" tabindex="-1"><a class="header-anchor" href="#string、stringbuffer、stringbuilder的区别和联系"><span>String、StringBuffer、StringBuilder的区别和联系</span></a></h1>
<ol>
<li><strong>可变性</strong>：<code v-pre>String</code>是不可变的（Immutable），一旦创建，内容无法修改，每次修改都会生成一个新的对象。<code v-pre>StringBuilder</code>和<code v-pre>StringBuffer</code>是可变的（Mutable），可以直接对字符串内容进行修改而不会创建新对象。</li>
<li><strong>线程安全性</strong>：<code v-pre>String</code>因为不可变，天然线程安全。<code v-pre>StringBuilder</code>不是线程安全的，适用于单线程环境。<code v-pre>StringBuffer</code>是线程安全的，其方法通过<code v-pre>synchronized</code>关键字实现同步，适用于多线程环境。</li>
<li><strong>性能</strong>：<code v-pre>String</code>性能最低，尤其是在频繁修改字符串时会生成大量临时对象，增加内存开销和垃圾回收压力。<code v-pre>StringBuilder</code>性能最高，因为它没有线程安全的开销，适合单线程下的字符串操作。<code v-pre>StringBuffer</code>性能略低于<code v-pre>StringBuilder</code>，因为它的线程安全机制引入了同步开销。</li>
<li><strong>使用场景</strong>：如果字符串内容固定或不常变化，优先使用<code v-pre>String</code>。如果需要频繁修改字符串且在单线程环境下，使用<code v-pre>StringBuilder</code>。如果需要频繁修改字符串且在多线程环境下，使用<code v-pre>StringBuffer</code>。</li>
</ol>
<p>对比总结如下：</p>
<table>
<thead>
<tr>
<th>特性</th>
<th>String</th>
<th>StringBuilder</th>
<th>StringBuffer</th>
</tr>
</thead>
<tbody>
<tr>
<td>不可变性</td>
<td>不可变</td>
<td>可变</td>
<td>可变</td>
</tr>
<tr>
<td>线程安全</td>
<td>是（因不可变）</td>
<td>否</td>
<td>是（同步方法）</td>
</tr>
<tr>
<td>性能</td>
<td>低（频繁修改时）</td>
<td>高（单线程）</td>
<td>中（多线程安全）</td>
</tr>
<tr>
<td>适用场景</td>
<td>静态字符串</td>
<td>单线程动态字符串</td>
<td>多线程动态字符串</td>
</tr>
</tbody>
</table>
<p>例子代码如下：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// String的不可变性</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> str </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "abc"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">str </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> str </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">+</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "def"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 新建对象，str指向新对象</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// StringBuilder（单线程高效）</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">StringBuilder</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> sb </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> StringBuilder</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">sb</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"abc"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">).</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"def"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 直接修改内部数组</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// StringBuffer（多线程安全）</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">StringBuffer</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> sbf </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> StringBuffer</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">sbf</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"abc"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">).</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"def"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 同步方法保证线程安全</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div></template>


