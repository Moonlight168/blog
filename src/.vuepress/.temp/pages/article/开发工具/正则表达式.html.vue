<template><div><hr>
<blockquote>
<p>正则表达式（Regular Expression, 简称 Regex）是用于字符串匹配和处理的强大工具，广泛应用于文本搜索、数据清洗、表单验证、爬虫开发等场景。</p>
</blockquote>
<h2 id="一、基础语法速览" tabindex="-1"><a class="header-anchor" href="#一、基础语法速览"><span>一、基础语法速览</span></a></h2>
<table>
<thead>
<tr>
<th>符号</th>
<th>含义</th>
<th>示例</th>
<th></th>
<th></th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>.</code></td>
<td>匹配除换行外的任意字符</td>
<td><code v-pre>a.b</code> → 匹配 <code v-pre>acb</code>、<code v-pre>a1b</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>^</code></td>
<td>匹配字符串开始</td>
<td><code v-pre>^abc</code> 匹配 <code v-pre>abc123</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>$</code></td>
<td>匹配字符串结尾</td>
<td><code v-pre>abc$</code> 匹配 <code v-pre>123abc</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>*</code></td>
<td>匹配前一个字符 <strong>0次或多次</strong></td>
<td><code v-pre>a*</code> 匹配 <code v-pre>&quot;&quot;</code>、<code v-pre>a</code>、<code v-pre>aaa</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>+</code></td>
<td>匹配前一个字符 <strong>1次或多次</strong></td>
<td><code v-pre>a+</code> 匹配 <code v-pre>a</code>、<code v-pre>aa</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>?</code></td>
<td>匹配前一个字符 <strong>0次或1次</strong></td>
<td><code v-pre>a?</code> 匹配 <code v-pre>&quot;&quot;</code>、<code v-pre>a</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>{n}</code></td>
<td>恰好重复 n 次</td>
<td><code v-pre>a{3}</code> 匹配 <code v-pre>aaa</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>{n,}</code></td>
<td>至少重复 n 次</td>
<td><code v-pre>a{2,}</code> 匹配 <code v-pre>aa</code>、<code v-pre>aaa...</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>{n,m}</code></td>
<td>重复 n 到 m 次</td>
<td><code v-pre>a{2,4}</code> 匹配 <code v-pre>aa</code>、<code v-pre>aaa</code>、<code v-pre>aaaa</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>[]</code></td>
<td>字符集合，匹配其中任意一个字符</td>
<td><code v-pre>[abc]</code> 匹配 <code v-pre>a</code>、<code v-pre>b</code>、<code v-pre>c</code></td>
<td></td>
<td></td>
</tr>
<tr>
<td><code v-pre>[^]</code></td>
<td>非字符集合，匹配不在其中的字符</td>
<td><code v-pre>[^abc]</code> 匹配非 a/b/c 的字符</td>
<td></td>
<td></td>
</tr>
<tr>
<td>`</td>
<td>`</td>
<td>或运算，匹配左右任意一个表达式</td>
<td>`abc</td>
<td>123<code v-pre>匹配</code>abc<code v-pre>或</code>123`</td>
</tr>
<tr>
<td><code v-pre>()</code></td>
<td>分组，提取或整体应用量词</td>
<td><code v-pre>(abc)+</code> 匹配 <code v-pre>abcabc</code></td>
<td></td>
<td></td>
</tr>
</tbody>
</table>
<h2 id="二、常用元字符与转义" tabindex="-1"><a class="header-anchor" href="#二、常用元字符与转义"><span>二、常用元字符与转义</span></a></h2>
<table>
<thead>
<tr>
<th>元字符</th>
<th>说明</th>
<th>示例</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>\d</code></td>
<td>数字（0-9）</td>
<td><code v-pre>\d+</code> 匹配一个或多个数字</td>
</tr>
<tr>
<td><code v-pre>\D</code></td>
<td>非数字</td>
<td><code v-pre>\D+</code> 匹配一个或多个非数字字符</td>
</tr>
<tr>
<td><code v-pre>\w</code></td>
<td>单词字符（字母数字下划线）</td>
<td><code v-pre>\w+</code> 匹配变量名、函数名等</td>
</tr>
<tr>
<td><code v-pre>\W</code></td>
<td>非单词字符</td>
<td><code v-pre>\W+</code> 匹配符号、空格等</td>
</tr>
<tr>
<td><code v-pre>\s</code></td>
<td>空白字符（空格、Tab等）</td>
<td><code v-pre>\s+</code> 匹配空白区域</td>
</tr>
<tr>
<td><code v-pre>\S</code></td>
<td>非空白字符</td>
<td><code v-pre>\S+</code> 匹配非空格文本</td>
</tr>
<tr>
<td><code v-pre>\b</code></td>
<td>单词边界</td>
<td><code v-pre>\bword\b</code> 只匹配单词 <code v-pre>word</code></td>
</tr>
<tr>
<td><code v-pre>\\</code></td>
<td>匹配 <code v-pre>\</code> 本身</td>
<td><code v-pre>\\</code> 匹配反斜杠</td>
</tr>
</tbody>
</table>
<h2 id="三、常见应用场景" tabindex="-1"><a class="header-anchor" href="#三、常见应用场景"><span>三、常见应用场景</span></a></h2>
<h3 id="✅-验证手机号-中国大陆" tabindex="-1"><a class="header-anchor" href="#✅-验证手机号-中国大陆"><span>✅ 验证手机号（中国大陆）</span></a></h3>
<div class="language-regex line-numbers-mode" data-highlighter="shiki" data-ext="regex" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-regex"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">^1</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">[3-9]</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">\d</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">{9}</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">$</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="✅-验证邮箱" tabindex="-1"><a class="header-anchor" href="#✅-验证邮箱"><span>✅ 验证邮箱</span></a></h3>
<div class="language-regex line-numbers-mode" data-highlighter="shiki" data-ext="regex" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-regex"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">^</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">[</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">\w</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">.-]</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">+</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">[</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">\w</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">.-]</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">+</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">\.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">[a-zA-Z]</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">{2,6}</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">$</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="✅-提取网页中的链接" tabindex="-1"><a class="header-anchor" href="#✅-提取网页中的链接"><span>✅ 提取网页中的链接</span></a></h3>
<div class="language-regex line-numbers-mode" data-highlighter="shiki" data-ext="regex" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-regex"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">https</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">?</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">://</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">[</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">^\s</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">"'>]</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">+</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="✅-匹配身份证号-15-或-18-位" tabindex="-1"><a class="header-anchor" href="#✅-匹配身份证号-15-或-18-位"><span>✅ 匹配身份证号（15 或 18 位）</span></a></h3>
<div class="language-regex line-numbers-mode" data-highlighter="shiki" data-ext="regex" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-regex"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">(</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">^\d</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">{15}</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">$</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">|</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">(</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">^\d</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">{17}</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">[</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">\d</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">Xx]</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">$</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">)</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="✅-清理-html-标签" tabindex="-1"><a class="header-anchor" href="#✅-清理-html-标签"><span>✅ 清理 HTML 标签</span></a></h3>
<div class="language-regex line-numbers-mode" data-highlighter="shiki" data-ext="regex" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-regex"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">[</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">^</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">>]</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">+</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="四、分组与提取" tabindex="-1"><a class="header-anchor" href="#四、分组与提取"><span>四、分组与提取</span></a></h2>
<p>分组使用 <code v-pre>()</code>，可以通过正则工具或编程语言中提取匹配结果。</p>
<div class="language-regex line-numbers-mode" data-highlighter="shiki" data-ext="regex" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-regex"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">(</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">\d</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">{4})</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">-</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">(</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">\d</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">{2})</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">-</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">(</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">\d</span><span style="--shiki-light:#383A42;--shiki-dark:#D19A66">{2})</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>匹配 <code v-pre>2025-06-04</code>，分组结果：</p>
<ul>
<li><code v-pre>$1</code>: 2025</li>
<li><code v-pre>$2</code>: 06</li>
<li><code v-pre>$3</code>: 04</li>
</ul>
</div></template>


