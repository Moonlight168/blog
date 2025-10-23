<template><div><h1 id="object" tabindex="-1"><a class="header-anchor" href="#object"><span>object</span></a></h1>
<h2 id="与-equals-有什么区别" tabindex="-1"><a class="header-anchor" href="#与-equals-有什么区别"><span>== 与 equals 有什么区别？</span></a></h2>
<table>
<thead>
<tr>
<th>对比维度</th>
<th>==</th>
<th>equals()</th>
</tr>
</thead>
<tbody>
<tr>
<td>作用对象</td>
<td>基本数据类型：比较值是否相等；<br>引用数据类型：比较内存地址（对象是否为同一实例）</td>
<td>仅用于引用数据类型，默认比较内存地址（继承自Object），重写后可比较内容（如String）</td>
</tr>
<tr>
<td>本质</td>
<td>数值比较（基本类型比较值，引用类型比较地址值）</td>
<td>逻辑比较，可自定义比较规则（通过重写）</td>
</tr>
<tr>
<td>可重写性</td>
<td>不可重写（运算符，非方法）</td>
<td>可重写（Object类的方法，子类可自定义实现）</td>
</tr>
</tbody>
</table>
<h3 id="具体场景示例" tabindex="-1"><a class="header-anchor" href="#具体场景示例"><span>具体场景示例</span></a></h3>
<ol>
<li><strong>字符串比较</strong>：
<ul>
<li><code v-pre>==</code>：比较两个字符串对象的内存地址（是否为同一对象）。</li>
<li><code v-pre>equals()</code>：String类重写了<code v-pre>equals()</code>，比较字符串内容是否相同。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> s1 </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "abc"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> s2 </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> String</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"abc"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(s1 </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">==</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> s2);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // false（地址不同）</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">s1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">equals</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(s2));</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // true（内容相同）</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ul>
</li>
<li><strong>非字符串引用类型比较</strong>：
<ul>
<li>若未重写<code v-pre>equals()</code>，<code v-pre>==</code>与<code v-pre>equals()</code>效果一致，均比较内存地址。</li>
<li>若重写<code v-pre>equals()</code>（如自定义实体类），<code v-pre>equals()</code>按重写逻辑比较（如比较属性值）。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Person</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> String</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> id</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 重写equals()：id相同则认为对象相等</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Override</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> boolean</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> equals</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Object</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> o</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">this</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> ==</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> o) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">return</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> true</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (o </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">==</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> null</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> ||</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> getClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">() </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">!=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> o</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">return</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> false</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        Person</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> person</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (Person) o;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        return</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> Objects</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">equals</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(id, </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">person</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">id</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Person</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> p1 </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> Person</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"123"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Person</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> p2 </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> Person</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"123"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(p1 </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">==</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> p2);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // false（地址不同）</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">p1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">equals</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(p2));</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // true（id相同）</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ul>
</li>
</ol>
<h2 id="hashcode和equals方法有什么关系" tabindex="-1"><a class="header-anchor" href="#hashcode和equals方法有什么关系"><span>hashcode和equals方法有什么关系？</span></a></h2>
<p>在Java中，<code v-pre>hashCode()</code>和<code v-pre>equals()</code>方法紧密关联，需遵循<strong>两大约定</strong>，以保证哈希表（如<code v-pre>HashMap</code>、<code v-pre>HashSet</code>）等数据结构正常工作：</p>
<h3 id="_1-核心约定" tabindex="-1"><a class="header-anchor" href="#_1-核心约定"><span>1. 核心约定</span></a></h3>
<ul>
<li><strong>一致性</strong>：若两个对象通过<code v-pre>equals()</code>比较为<code v-pre>true</code>，则它们的<code v-pre>hashCode()</code>返回值<strong>必须相同</strong>。
<ul>
<li>示例：若<code v-pre>obj1.equals(obj2) = true</code>，则<code v-pre>obj1.hashCode() == obj2.hashCode()</code>必须成立。</li>
</ul>
</li>
<li><strong>非一致性</strong>：若两个对象的<code v-pre>hashCode()</code>返回值相同，它们通过<code v-pre>equals()</code>比较<strong>不一定为<code v-pre>true</code></strong>（这种情况称为&quot;哈希冲突&quot;）。
<ul>
<li>示例：若<code v-pre>obj1.hashCode() == obj2.hashCode()</code>，<code v-pre>obj1.equals(obj2)</code>可能为<code v-pre>false</code>。</li>
</ul>
</li>
</ul>
<h3 id="_2-为什么重写equals-必须重写hashcode" tabindex="-1"><a class="header-anchor" href="#_2-为什么重写equals-必须重写hashcode"><span>2. 为什么重写equals()必须重写hashCode()？</span></a></h3>
<p>若仅重写<code v-pre>equals()</code>而不重写<code v-pre>hashCode()</code>，会违反&quot;一致性&quot;约定，导致哈希表异常：</p>
<ul>
<li>示例：自定义<code v-pre>Person</code>类，重写<code v-pre>equals()</code>（id相同则相等），但未重写<code v-pre>hashCode()</code>。此时，两个id相同的<code v-pre>Person</code>对象通过<code v-pre>equals()</code>为<code v-pre>true</code>，但<code v-pre>hashCode()</code>返回值可能不同（继承自Object的<code v-pre>hashCode()</code>返回对象地址）。</li>
<li>问题：将这两个对象存入<code v-pre>HashSet</code>时，因<code v-pre>hashCode()</code>不同，会被视为两个不同对象，存入不同位置，违反<code v-pre>HashSet</code>&quot;不存储重复元素&quot;的规则。</li>
</ul>
<h3 id="_3-总结" tabindex="-1"><a class="header-anchor" href="#_3-总结"><span>3. 总结</span></a></h3>
<ul>
<li>重写<code v-pre>equals()</code>时，<strong>必须同步重写<code v-pre>hashCode()</code></strong>，确保&quot;相等的对象有相同的哈希码&quot;。</li>
<li>重写<code v-pre>hashCode()</code>时，需保证&quot;相同哈希码的对象不一定相等&quot;（允许哈希冲突，哈希表会通过<code v-pre>equals()</code>进一步判断）。</li>
</ul>
</div></template>


