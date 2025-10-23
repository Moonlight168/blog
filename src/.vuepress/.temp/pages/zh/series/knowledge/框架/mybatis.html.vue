<template><div><h2 id="hibernate-和-mybatis-有什么区别" tabindex="-1"><a class="header-anchor" href="#hibernate-和-mybatis-有什么区别"><span>Hibernate 和 MyBatis 有什么区别？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>
<p><strong>SQL编写：</strong></p>
<ul>
<li>Hibernate：自动生成SQL，无需手写SQL，适合快速开发。</li>
<li>MyBatis：需要手写SQL，灵活性高，适合复杂查询和性能优化。</li>
</ul>
</li>
<li>
<p><strong>映射方式：</strong></p>
<ul>
<li>Hibernate：全自动ORM映射。</li>
<li>MyBatis：半自动映射，需要手动配置映射关系。</li>
</ul>
</li>
<li>
<p><strong>缓存机制：</strong></p>
<ul>
<li>Hibernate：内置强大的一级、二级缓存机制。</li>
<li>MyBatis：提供一级缓存，二级缓存需手动配置。</li>
</ul>
</li>
<li>
<p><strong>事务管理：</strong></p>
<ul>
<li>都支持JDBC和Spring事务管理。</li>
</ul>
</li>
<li>
<p><strong>适用场景：</strong></p>
<ul>
<li>Hibernate：适合开发需求变化小、数据结构稳定的项目。</li>
<li>MyBatis：适合对SQL控制要求高、业务逻辑复杂的项目。</li>
</ul>
</li>
</ul>
<h2 id="mybatis-是如何进行分页的" tabindex="-1"><a class="header-anchor" href="#mybatis-是如何进行分页的"><span>MyBatis 是如何进行分页的？</span></a></h2>
<p><strong>回答：</strong><br>
MyBatis 本身不支持分页语法，但可以通过以下两种方式实现分页：</p>
<ul>
<li><strong>手动分页：</strong> 在 SQL 语句中直接使用数据库的分页语法（如 MySQL 的 <code v-pre>LIMIT offset, size</code>）进行分页。</li>
<li><strong>使用分页插件：</strong> 常用插件是 <strong>PageHelper</strong>，只需在查询前调用 <code v-pre>PageHelper.startPage(pageNum, pageSize)</code> 即可自动生成分页SQL并封装分页结果。</li>
</ul>
<h2 id="mybatis-字段名与数据库列名不一致时的映射方式总结" tabindex="-1"><a class="header-anchor" href="#mybatis-字段名与数据库列名不一致时的映射方式总结"><span>MyBatis 字段名与数据库列名不一致时的映射方式总结</span></a></h2>
<h4 id="_1-原生-mybatis-的处理方式" tabindex="-1"><a class="header-anchor" href="#_1-原生-mybatis-的处理方式"><span>1. 原生 MyBatis 的处理方式：</span></a></h4>
<ul>
<li>
<p><strong>方式一：使用 SQL 别名</strong></p>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">SELECT</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> user_name </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">AS</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> userName </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">FROM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> user</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
<li>
<p><strong>方式二：使用 <code v-pre>@Results</code> 注解</strong></p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Select</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"SELECT user_id, user_name FROM user"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Results</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">({</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Result</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">property</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "userId"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> column</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "user_id"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Result</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">property</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "userName"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> column</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "user_name"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">})</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">List</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">&#x3C;</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">User</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">></span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> getAllUsers</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>方式三：使用 <code v-pre>&lt;resultMap&gt;</code> 映射</strong></p>
<div class="language-xml line-numbers-mode" data-highlighter="shiki" data-ext="xml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-xml"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">resultMap</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> id</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"userMap"</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"User"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">result</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> property</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"userId"</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> column</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"user_id"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">/></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">result</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> property</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"userName"</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> column</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"user_name"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">/></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">resultMap</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>方式四：配置驼峰命名自动映射</strong></p>
<div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">mybatis</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  configuration</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    map-underscore-to-camel-case</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">true</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实体字段使用驼峰命名，如 <code v-pre>userName</code>，可自动映射 <code v-pre>user_name</code>。</p>
</li>
</ul>
<h4 id="_2-mybatis-plus-的处理方式-mybatis-plus-专有" tabindex="-1"><a class="header-anchor" href="#_2-mybatis-plus-的处理方式-mybatis-plus-专有"><span>2. MyBatis-Plus 的处理方式（<strong>MyBatis-Plus 专有</strong>）：</span></a></h4>
<ul>
<li>
<p><strong>使用 <code v-pre>@TableName</code> 指定表名</strong></p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">TableName</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"user"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> User</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> ...</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> }</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>使用 <code v-pre>@TableField</code> 指定字段映射</strong></p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">TableField</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"user_name"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">private</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> String</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> userName</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ul>
<h2 id="mybatis-的缓存机制" tabindex="-1"><a class="header-anchor" href="#mybatis-的缓存机制"><span>MyBatis 的缓存机制？</span></a></h2>
<p><strong>回答：</strong><br>
MyBatis 提供两级缓存机制：</p>
<ul>
<li>
<p><strong>一级缓存（本地缓存）：</strong></p>
<ul>
<li>默认开启，作用范围是同一个 <code v-pre>SqlSession</code>。</li>
<li>相同查询在同一个 <code v-pre>SqlSession</code> 中执行多次时，第二次会从缓存中读取。</li>
<li><code v-pre>SqlSession</code> 关闭后，一级缓存失效。</li>
</ul>
</li>
<li>
<p><strong>二级缓存（全局缓存）：</strong></p>
<ul>
<li>默认关闭，需要在 <code v-pre>mapper.xml</code> 中通过 <code v-pre>&lt;cache/&gt;</code> 显式开启。</li>
<li>作用范围是同一个 Mapper 的多个 <code v-pre>SqlSession</code> 之间共享。</li>
<li>可配置缓存实现类、过期时间、大小、清除策略等。</li>
</ul>
</li>
<li>
<p><strong>使用示例（开启二级缓存）：</strong></p>
<div class="language-xml line-numbers-mode" data-highlighter="shiki" data-ext="xml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-xml"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">mapper</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> namespace</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"com.example.mapper.UserMapper"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">cache</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">/></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">mapper</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p><strong>注意事项：</strong></p>
<ul>
<li>更新操作会清空相关缓存。</li>
<li>二级缓存中的对象必须实现 <code v-pre>Serializable</code> 接口。</li>
<li>与 Spring 集成时，推荐使用第三方缓存（如 EhCache、Redis）配合二级缓存使用。</li>
</ul>
</li>
</ul>
</div></template>


