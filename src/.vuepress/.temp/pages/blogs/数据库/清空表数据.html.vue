<template><div><p>在 SQL 中，清空表数据有两种主要方式：<code v-pre>TRUNCATE TABLE</code> 和 <code v-pre>DELETE FROM</code>。它们的功能和适用场景有所不同，下面为你详细介绍：</p>
<h3 id="一、使用-truncate-table-推荐快速清空" tabindex="-1"><a class="header-anchor" href="#一、使用-truncate-table-推荐快速清空"><span>一、使用 <code v-pre>TRUNCATE TABLE</code>（推荐快速清空）</span></a></h3>
<p><strong>语法</strong>：</p>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">TRUNCATE</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> TABLE</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> table_name;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p><strong>特点</strong>：</p>
<ul>
<li><strong>快速高效</strong>：直接删除数据页，不逐行记录日志，比 <code v-pre>DELETE</code> 快得多</li>
<li><strong>不可回滚</strong>：操作立即生效，无法通过 <code v-pre>ROLLBACK</code> 恢复</li>
<li><strong>重置自增主键</strong>：如果表有自增列（如 <code v-pre>AUTO_INCREMENT</code>），会重置为初始值</li>
<li><strong>不触发触发器</strong>：不会触发表上的 <code v-pre>DELETE</code> 触发器</li>
</ul>
<p><strong>示例</strong>：</p>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">TRUNCATE</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> TABLE</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> users; </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 清空 users 表的所有数据</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>-- 1. 禁用外键约束<br>
SET FOREIGN_KEY_CHECKS = 0;</p>
<p>-- 2. 执行TRUNCATE<br>
TRUNCATE TABLE news_type_relation;</p>
<p>-- 3. 重新启用外键约束<br>
SET FOREIGN_KEY_CHECKS = 1;</p>
<h3 id="二、使用-delete-from-灵活删除" tabindex="-1"><a class="header-anchor" href="#二、使用-delete-from-灵活删除"><span>二、使用 <code v-pre>DELETE FROM</code>（灵活删除）</span></a></h3>
<p><strong>语法</strong>：</p>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">DELETE</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> FROM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> table_name </span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">[WHERE condition]</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p><strong>特点</strong>：</p>
<ul>
<li><strong>可带条件</strong>：通过 <code v-pre>WHERE</code> 子句选择性删除数据（如 <code v-pre>WHERE id &gt; 100</code>）</li>
<li><strong>逐行删除</strong>：逐行记录日志，适合需要事务控制的场景</li>
<li><strong>可回滚</strong>：在事务中执行时，可以通过 <code v-pre>ROLLBACK</code> 撤销</li>
<li><strong>保留自增主键</strong>：自增列的值不会重置，继续递增</li>
<li><strong>触发触发器</strong>：会触发表上的 <code v-pre>DELETE</code> 触发器</li>
</ul>
<p><strong>示例</strong>：</p>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 清空全量数据（不带 WHERE）</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">DELETE</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> FROM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> users;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 条件删除（只删除活跃用户）</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">DELETE</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> FROM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> users </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">WHERE</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> status</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> 'active'</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="四、注意事项" tabindex="-1"><a class="header-anchor" href="#四、注意事项"><span>四、注意事项</span></a></h3>
<ol>
<li>
<p><strong>权限要求</strong>：</p>
<ul>
<li><code v-pre>TRUNCATE</code> 需要 <code v-pre>DROP</code> 权限（因为本质是重建表）</li>
<li><code v-pre>DELETE</code> 只需要 <code v-pre>DELETE</code> 权限</li>
</ul>
</li>
<li>
<p><strong>外键约束</strong>：</p>
<ul>
<li>如果表有外键关联，<code v-pre>TRUNCATE</code> 可能失败（需先禁用外键约束）</li>
</ul>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 禁用外键约束（MySQL）</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">SET</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> FOREIGN_KEY_CHECKS </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">TRUNCATE</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> TABLE</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> orders;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">SET</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> FOREIGN_KEY_CHECKS </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>分区表</strong>：</p>
<ul>
<li><code v-pre>TRUNCATE</code> 会删除所有分区的数据</li>
<li>若需清空特定分区，使用 <code v-pre>ALTER TABLE ... TRUNCATE PARTITION</code></li>
</ul>
</li>
<li>
<p><strong>视图和索引</strong>：</p>
<ul>
<li>两者都不会删除表结构、视图或索引</li>
</ul>
</li>
</ol>
<h3 id="五、清空表并重置自增id的其他方法" tabindex="-1"><a class="header-anchor" href="#五、清空表并重置自增id的其他方法"><span>五、清空表并重置自增ID的其他方法</span></a></h3>
<ol>
<li><strong>使用 <code v-pre>ALTER TABLE</code>（MySQL）</strong>：</li>
</ol>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">ALTER</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> TABLE</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> table_name AUTO_INCREMENT </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">; </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 重置自增ID为1</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><ol start="2">
<li><strong>删除并重建表</strong>：</li>
</ol>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">DROP</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> TABLE</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> table_name;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">CREATE</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> TABLE</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> table_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (...); </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 重新创建表</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div></div></template>


