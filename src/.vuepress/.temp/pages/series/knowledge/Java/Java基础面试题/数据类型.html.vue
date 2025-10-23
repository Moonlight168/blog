<template><div><h1 id="数据类型" tabindex="-1"><a class="header-anchor" href="#数据类型"><span>数据类型</span></a></h1>
<h2 id="八种基本的数据类型" tabindex="-1"><a class="header-anchor" href="#八种基本的数据类型"><span>八种基本的数据类型</span></a></h2>
<p>Java数据类型分为<strong>基本数据类型</strong>和<strong>引用数据类型</strong>：</p>
<ul>
<li>基本数据类型共8种，分三类：
<ul>
<li>数值型：整数类型（byte、short、int、long）、浮点类型（float、double）</li>
<li>字符型：char</li>
<li>布尔型：boolean</li>
</ul>
</li>
<li>引用数据类型：类（class）、接口（interface）、数组</li>
</ul>
<p>8种基本数据类型的默认值、位数、取值范围如下表所示：</p>
<table>
<thead>
<tr>
<th>数据类型</th>
<th>占用大小（字节）</th>
<th>位数</th>
<th>取值范围</th>
<th>默认值</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>byte</code></td>
<td>1</td>
<td>8</td>
<td>-128（-2<sup>7）到127（2</sup>7 - 1）</td>
<td>0</td>
<td>最小整数类型，适合节省内存（如处理文件/网络流小范围整数）</td>
</tr>
<tr>
<td><code v-pre>short</code></td>
<td>2</td>
<td>16</td>
<td>-32768（-2<sup>15）到32767（2</sup>15 - 1）</td>
<td>0</td>
<td>较少使用，适用于需节省内存且数值在该区间的场景</td>
</tr>
<tr>
<td><code v-pre>int</code></td>
<td>4</td>
<td>32</td>
<td>-2147483648（-2<sup>31）到2147483647（2</sup>31 - 1）</td>
<td>0</td>
<td>最常用整数类型，满足多数日常整数计算需求</td>
</tr>
<tr>
<td><code v-pre>long</code></td>
<td>8</td>
<td>64</td>
<td>-9223372036854775808（-2<sup>63）到9223372036854775807（2</sup>63 - 1）</td>
<td>0L</td>
<td>用于超大整数，int范围不足时使用，定义时数值后需加L/l</td>
</tr>
<tr>
<td><code v-pre>float</code></td>
<td>4</td>
<td>32</td>
<td>1.4E-45到3.4028235E38</td>
<td>0.0f</td>
<td>单精度浮点数，精度较低，定义时数值后需加F/f</td>
</tr>
<tr>
<td><code v-pre>double</code></td>
<td>8</td>
<td>64</td>
<td>4.9E-324到1.7976931348623157E308</td>
<td>0.0d</td>
<td>双精度浮点数，精度高于float，是Java表示小数的默认类型</td>
</tr>
<tr>
<td><code v-pre>char</code></td>
<td>2</td>
<td>16</td>
<td>'\u0000'（0）到'\uffff'（65535）</td>
<td>'\u0000'</td>
<td>表示单个字符，采用Unicode编码，可表示多语言字符</td>
</tr>
<tr>
<td><code v-pre>boolean</code></td>
<td>无明确字节大小（理论1位）</td>
<td>无明确位数</td>
<td><code v-pre>true</code>或<code v-pre>false</code></td>
<td><code v-pre>false</code></td>
<td>用于逻辑判断，如条件判断、循环控制</td>
</tr>
</tbody>
</table>
<p><strong>注意事项</strong>：</p>
<ul>
<li>基本数据类型字节数：1字节（byte、boolean）、2字节（short、char）、4字节（int、float）、8字节（long、double）。</li>
<li>浮点数默认类型为double，声明float需加F/f；整数默认类型为int，声明long需加L/l。</li>
<li>8种基本数据类型的包装类：char对应Character、int对应Integer，其他均为首字母大写（如Byte、Short）。</li>
<li>char类型无符号，取值从0开始，不能为负。</li>
</ul>
<h2 id="int和long是多少位-多少字节的" tabindex="-1"><a class="header-anchor" href="#int和long是多少位-多少字节的"><span>int和long是多少位，多少字节的？</span></a></h2>
<ul>
<li><strong><code v-pre>int</code>类型</strong>：32位（bit），占4个字节（byte），是有符号整数，取值范围为-2<sup>31到2</sup>31-1（-2147483648到2147483647）。例如，简单计数器用int存储计数值，最大正数为2147483647，超范围会溢出。</li>
<li><strong><code v-pre>long</code>类型</strong>：64位，占8个字节，是有符号整数，取值范围为-2<sup>63到2</sup>63-1（-9223372036854775808到9223372036854775807）。处理超大整数（如文件大小）时，int范围不足则用long。</li>
</ul>
<h2 id="long和int可以互转吗" tabindex="-1"><a class="header-anchor" href="#long和int可以互转吗"><span>long和int可以互转吗 ？</span></a></h2>
<p>可以，Java中<code v-pre>long</code>和<code v-pre>int</code>可相互转换，但需注意安全性：</p>
<ul>
<li><strong>int转long</strong>：因long范围大于int，转换安全，可自动转换或强制转换。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> intValue </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 10</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">long</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> longValue </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> intValue</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 自动转换，安全</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li><strong>long转int</strong>：因long范围大于int，转换可能导致数据丢失或溢出，需强制转换。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">long</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> longValue </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 100L</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> intValue </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) longValue</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 强制转换，需注意风险</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ul>
<p>若<code v-pre>longValue</code>超出int范围，转换结果会截断高位，保留低位。建议转换前先检查<code v-pre>longValue</code>是否在int取值范围内，避免数据问题。</p>
<p>（此处应有“Java数据类型自动提升顺序”的示意图，图片名称：Java类型自动提升顺序图）</p>
<h2 id="数据类型转换方式你知道哪些" tabindex="-1"><a class="header-anchor" href="#数据类型转换方式你知道哪些"><span>数据类型转换方式你知道哪些？</span></a></h2>
<ol>
<li><strong>自动类型转换（隐式转换）</strong>：目标类型范围大于源类型时，Java自动转换，无需显式操作。例如，int转long、float转double。</li>
<li><strong>强制类型转换（显式转换）</strong>：目标类型范围小于源类型时，需显式声明，可能导致数据丢失或溢出。语法：<code v-pre>目标类型 变量名 = (目标类型) 源类型</code>。例如，long转int、double转int。</li>
<li><strong>字符串转换</strong>：通过包装类方法将字符串转为其他类型。例如，<code v-pre>Integer.parseInt()</code>将字符串转int，<code v-pre>Double.parseDouble()</code>将字符串转double。</li>
<li><strong>数值之间的转换</strong>：通过包装类实现数值类型互转（如int转char、char转int），例如<code v-pre>Character</code>类、<code v-pre>Integer</code>类的转换方法。</li>
</ol>
<h2 id="类型互转会出现什么问题吗" tabindex="-1"><a class="header-anchor" href="#类型互转会出现什么问题吗"><span>类型互转会出现什么问题吗？</span></a></h2>
<ul>
<li><strong>数据丢失</strong>：大范围类型转小范围类型时，可能丢失高位数据。例如，long转int时，若long值超int范围，结果仅保留低位，高位丢失。</li>
<li><strong>数据溢出</strong>：小范围类型转大范围类型时，虽原始数据不变，但可能因符号位扩展导致意外结果（如byte转int时，负byte值的符号位会扩展）。</li>
<li><strong>精度损失</strong>：浮点数转换时，因表示方式不同可能损失精度。例如，float转double时，虽double精度更高，但float的近似值转换后仍可能有误差。</li>
<li><strong>类型不匹配错误</strong>：源类型与目标类型不兼容时，会触发编译错误或运行时错误（如字符串直接转int未用<code v-pre>parseInt()</code>）。</li>
</ul>
<h2 id="为什么用bigdecimal-不用double" tabindex="-1"><a class="header-anchor" href="#为什么用bigdecimal-不用double"><span>为什么用bigDecimal 不用double ？</span></a></h2>
<p>因double会出现精度丢失问题：<br>
double执行二进制浮点运算，二进制无法准确表示部分小数（如0.1）——类似十进制无法准确表示1/3（0.333...），二进制仅能表示&quot;1/(2^n)的和&quot;形式，而0.1无法表示为这种形式，导致计算误差。</p>
<p>示例：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">0.05</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0.01</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 输出0.060000000000000005</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1.0</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> -</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0.42</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 输出0.5800000000000001</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">4.015</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> *</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 100</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 输出401.49999999999994</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">123.3</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> /</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 100</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 输出1.2329999999999999</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这种误差在金钱计算（如商品价格）中会引发严重问题（如0.05+0.01算成0.060000000000000005，导致无法下单或对账错误）。</p>
<p>而<code v-pre>BigDecimal</code>支持精确的十进制计算，可避免上述问题。示例：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">import</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> java.math.BigDecimal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> BigDecimalExample</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[] </span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        BigDecimal</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> num1</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> BigDecimal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"0.1"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        BigDecimal</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> num2</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> BigDecimal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"0.2"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        BigDecimal</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> sum</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> num1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(num2);</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        BigDecimal</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> product</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> num1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">multiply</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(num2);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Sum: "</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> sum); </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 输出Sum: 0.3</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Product: "</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> product); </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 输出Product: 0.02</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意：创建<code v-pre>BigDecimal</code>时，需用字符串作为参数，避免直接用浮点数值（否则仍会因浮点精度问题导致误差）。</p>
<h2 id="装箱和拆箱是什么" tabindex="-1"><a class="header-anchor" href="#装箱和拆箱是什么"><span>装箱和拆箱是什么？</span></a></h2>
<p>装箱（Boxing）和拆箱（Unboxing）是<strong>基本数据类型与对应包装类之间的转换过程</strong>。</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> i </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 10</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  // 装箱：int转Integer</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> n </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> i</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">       // 拆箱：Integer转int</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="自动装箱的场景" tabindex="-1"><a class="header-anchor" href="#自动装箱的场景"><span>自动装箱的场景</span></a></h3>
<ol>
<li><strong>赋值时</strong>：Java 1.5后，编译器自动完成转换，无需手动操作。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// Java 1.5前（手动转换）</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> iObject </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> Integer</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">valueOf</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">3</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> iPrimitive </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> iObject</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">intValue</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// Java 1.5后（自动装箱/拆箱）</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> iObject </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 3</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 自动装箱：基本类型转包装类</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> iPrimitive </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> iObject</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 自动拆箱：包装类转基本类型</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li><strong>方法调用时</strong>：传入基本类型或接收包装类返回值时，编译器自动转换。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Integer</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> show</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> iParam){</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"autoboxing example - method invocation i: "</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> iParam);</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    return</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> iParam</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 方法调用时的自动装箱/拆箱</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">show</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">3</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 自动装箱：int转Integer作为参数</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> result </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> show</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">3</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 自动拆箱：Integer返回值转int</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ol>
<h3 id="自动装箱的弊端" tabindex="-1"><a class="header-anchor" href="#自动装箱的弊端"><span>自动装箱的弊端</span></a></h3>
<p>循环中自动装箱会创建大量无用对象，影响性能。例如：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> sum </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">for</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> i</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1000</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> i</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">&#x3C;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">5000</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> i</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">++</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">){   </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    sum </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">+=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> i</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code v-pre>sum += i</code>等价于<code v-pre>sum = sum + i</code>：sum先自动拆箱为int与i相加，再自动装箱为Integer。循环会创建近4000个无用Integer对象，增加内存开销和垃圾回收压力。</p>
<h2 id="java为什么要有integer" tabindex="-1"><a class="header-anchor" href="#java为什么要有integer"><span>Java为什么要有Integer？</span></a></h2>
<p>Integer是int的包装类，核心作用是<strong>将int基本类型封装为对象</strong>，满足Java对&quot;对象操作&quot;的需求，主要体现在三方面：</p>
<ol>
<li><strong>封装方法</strong>：将int数据与处理方法结合，如<code v-pre>Integer.parseInt()</code>用于字符串转int，方便数据处理。</li>
<li><strong>泛型支持</strong>：Java泛型仅支持引用类型，无法直接使用int，需用Integer才能在泛型中使用（如<code v-pre>List&lt;Integer&gt;</code>）。示例：<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">List</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> list </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ArrayList</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">list</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">3</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">list</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">list</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">Collections</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">sort</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(list);</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 泛型依赖Integer包装类</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(list);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li><strong>集合兼容</strong>：Java集合（如List、Map）仅能存储对象，无法存储int基本类型，需将int包装为Integer才能存入集合。示例：<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">List</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Integer</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> list </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ArrayList</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;></span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">list</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">3</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">list</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">list</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 用stream计算总和，依赖Integer包装类</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> sum </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> list</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">stream</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">().</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">mapToInt</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(Integer</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">::</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">intValue).</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">sum</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(sum);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ol>
<h2 id="integer相比int有什么优点" tabindex="-1"><a class="header-anchor" href="#integer相比int有什么优点"><span>Integer相比int有什么优点？</span></a></h2>
<p>int是基本数据类型，Integer是int的包装类，两者核心区别如下：</p>
<table>
<thead>
<tr>
<th>对比维度</th>
<th>int</th>
<th>Integer</th>
</tr>
</thead>
<tbody>
<tr>
<td>类型性质</td>
<td>基本数据类型</td>
<td>引用数据类型</td>
</tr>
<tr>
<td>内存存储</td>
<td>变量直接存储数据</td>
<td>需为对象分配内存（引用+数据）</td>
</tr>
<tr>
<td>性能</td>
<td>操作速度快</td>
<td>操作速度较慢（需对象实例化）</td>
</tr>
<tr>
<td>自动转换</td>
<td>不支持</td>
<td>支持自动装箱/拆箱，转换更便捷</td>
</tr>
<tr>
<td>空值处理</td>
<td>默认值为0，无空值</td>
<td>未初始化时为null，可能触发空指针异常</td>
</tr>
<tr>
<td>功能扩展</td>
<td>无额外方法</td>
<td>提供<code v-pre>parseInt()</code>、<code v-pre>valueOf()</code>等方法，支持泛型和集合</td>
</tr>
</tbody>
</table>
<h2 id="那为什么还要保留int类型" tabindex="-1"><a class="header-anchor" href="#那为什么还要保留int类型"><span>那为什么还要保留int类型？</span></a></h2>
<p>因基本类型在<strong>效率和内存占用</strong>上远超包装类：</p>
<ul>
<li>内存方面：64位JVM开启引用压缩后，一个Integer对象占16字节，而int仅占4字节，前者是后者的4倍。</li>
<li>效率方面：基本类型变量直接存储数据，读写无需通过对象引用，操作速度更快；包装类需实例化对象，且自动装箱/拆箱会额外消耗性能。</li>
</ul>
<p>因此，无需对象特性（如泛型、集合）时，用int更高效。</p>
<h2 id="说一下-integer的缓存" tabindex="-1"><a class="header-anchor" href="#说一下-integer的缓存"><span>说一下 integer的缓存</span></a></h2>
<p>Java的Integer类内部实现了<strong>静态缓存池</strong>，用于复用特定范围的Integer对象：</p>
<ul>
<li>默认缓存范围：-128至127。</li>
<li>缓存逻辑：通过<code v-pre>Integer.valueOf(int)</code>方法创建该范围内的整数对象时，不会新建实例，而是复用缓存中的现有对象；超出范围则新建对象。</li>
</ul>
<p>例如，<code v-pre>Integer a = 100</code>和<code v-pre>Integer b = 100</code>会指向同一缓存对象，而<code v-pre>Integer c = 200</code>和<code v-pre>Integer d = 200</code>会指向不同对象。</p>
<p>例如，<code v-pre>Integer a = 100</code>和<code v-pre>Integer b = 100</code>会指向同一缓存对象，而<code v-pre>Integer c = 200</code>和<code v-pre>Integer d = 200</code>会指向不同对象。</p>
</div></template>


