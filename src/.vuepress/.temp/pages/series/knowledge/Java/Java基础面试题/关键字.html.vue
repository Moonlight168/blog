<template><div><h1 id="关键字" tabindex="-1"><a class="header-anchor" href="#关键字"><span>关键字</span></a></h1>
<h2 id="java-中-final-作用是什么" tabindex="-1"><a class="header-anchor" href="#java-中-final-作用是什么"><span>Java 中 final 作用是什么？</span></a></h2>
<p><code v-pre>final</code>关键字主要用于修饰<strong>类、方法、变量</strong>，作用分别如下：</p>
<ol>
<li><strong>修饰类</strong>：该类不能被继承，是继承体系的最终形态。示例：Java的<code v-pre>String</code>类用<code v-pre>final</code>修饰，保证其不可变性和安全性，防止子类修改其行为。</li>
<li><strong>修饰方法</strong>：该方法不能在子类中被重写。示例：<code v-pre>java.lang.Object</code>的<code v-pre>getClass()</code>方法是<code v-pre>final</code>的，其行为由JVM底层实现，不允许子类修改。</li>
<li><strong>修饰变量</strong>：
<ul>
<li>基本数据类型：变量赋值后不能再修改（成为常量）。示例：<code v-pre>final int num = 10;</code>，<code v-pre>num</code>不能二次赋值。</li>
<li>引用数据类型：引用变量不能再指向其他对象，但对象内部内容可修改。示例：<code v-pre>final StringBuilder sb = new StringBuilder(&quot;Hello&quot;);</code>，<code v-pre>sb</code>不能指向新对象，但可通过<code v-pre>sb.append(&quot;World&quot;)</code>修改字符串内容。</li>
</ul>
</li>
</ol>
</div></template>


