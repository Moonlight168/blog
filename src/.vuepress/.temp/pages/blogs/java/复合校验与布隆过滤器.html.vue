<template><div><p>比如在高并发系统中，用户注册是一个典型的高风险操作：</p>
<ul>
<li>同一个手机号可能被重复提交</li>
<li>数据校验逻辑复杂</li>
<li>数据库频繁查询可能成为性能瓶颈</li>
</ul>
<p>为了应对这些挑战，本篇笔记总结了 <strong>复合校验（Composite Check）</strong> 和 <strong>布隆过滤器（Bloom Filter）</strong> 在注册场景中的应用实践。</p>
<h2 id="_1️⃣-注册方法解析" tabindex="-1"><a class="header-anchor" href="#_1️⃣-注册方法解析"><span>1️⃣ 注册方法解析</span></a></h2>
<p>以 <code v-pre>register(UserRegisterDto userRegisterDto)</code> 方法为例：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Transactional</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">rollbackFor</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> Exception</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">class</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">ServiceLock</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">lockType</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">LockType</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">Write</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> name</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> REGISTER_USER_LOCK</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> keys</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> {</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"#userRegisterDto.mobile"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">})</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Boolean</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> register</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">UserRegisterDto</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> userRegisterDto) {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 执行用户注册前的复合校验检查</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    compositeContainer</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">execute</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">CompositeCheckType</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">USER_REGISTER_CHECK</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getValue</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(), userRegisterDto);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 数据库操作</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">    User</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> user </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> User</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    BeanUtils</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">copyProperties</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(userRegisterDto, user);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    user</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">setId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">uidGenerator</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getUid</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    userMapper</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">insert</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(user);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">    UserMobile</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> userMobile </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> UserMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    userMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">setId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">uidGenerator</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getUid</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    userMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">setUserId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">user</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    userMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">setMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">userRegisterDto</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    userMobileMapper</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">insert</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(userMobile);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 布隆过滤器添加手机号</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    bloomFilterHandler</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">userMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    return</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> true</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="核心功能点" tabindex="-1"><a class="header-anchor" href="#核心功能点"><span>核心功能点</span></a></h3>
<ol>
<li>
<p><strong>事务保证（@Transactional）</strong></p>
<ul>
<li>保证用户表和手机号表操作原子性</li>
<li>异常回滚，避免部分数据写入</li>
</ul>
</li>
<li>
<p><strong>服务锁（@ServiceLock）</strong></p>
<ul>
<li>防止高并发下重复注册</li>
<li>锁粒度基于手机号</li>
</ul>
</li>
</ol>
<h2 id="_2️⃣-复合校验-composite-check" tabindex="-1"><a class="header-anchor" href="#_2️⃣-复合校验-composite-check"><span>2️⃣ 复合校验（Composite Check）</span></a></h2>
<h3 id="什么是复合校验" tabindex="-1"><a class="header-anchor" href="#什么是复合校验"><span>什么是复合校验？</span></a></h3>
<p>复合校验是一种 <strong>将多种校验策略组合在一起的模式</strong>，通常使用 <strong>Composite + Strategy 设计模式</strong> 实现：</p>
<ul>
<li>每种校验逻辑是一个独立策略（Strategy），继承 <code v-pre>AbstractUserRegisterCheckHandler</code></li>
<li><code v-pre>CompositeContainer</code> 负责扫描所有策略，按层级和顺序组装成组合树</li>
<li>调用 <code v-pre>execute(type, param)</code> 时，会依次执行所有策略</li>
<li>只要有一条策略校验失败，就抛出异常，终止注册流程</li>
</ul>
<blockquote>
<p>与简单接口策略不同，抽象类提供了 <strong>子节点管理、递归执行和公共方法</strong>，无需每个策略重复实现组合逻辑。</p>
</blockquote>
<figure><img src="@source/blogs/java/imges/img.png" alt="img.png" tabindex="0" loading="lazy"><figcaption>img.png</figcaption></figure>
<h3 id="_1️⃣-类关系梳理" tabindex="-1"><a class="header-anchor" href="#_1️⃣-类关系梳理"><span>1️⃣ 类关系梳理</span></a></h3>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>AbstractComposite&#x3C;T>           // 抽象组合接口基类</span></span>
<span class="line"><span>      ↑</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>AbstractUserRegisterCheckHandler  // 用户注册校验抽象基类</span></span>
<span class="line"><span>      ↑</span></span>
<span class="line"><span>      │</span></span>
<span class="line"><span>+------------------------------+</span></span>
<span class="line"><span>| 具体策略类（Strategy）         |</span></span>
<span class="line"><span>| UserExistCheckHandler         |</span></span>
<span class="line"><span>| UserRegisterVerifyCaptcha     |</span></span>
<span class="line"><span>| UserRegisterMobileCheck       |</span></span>
<span class="line"><span>| ...                           |</span></span>
<span class="line"><span>+------------------------------+</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CompositeContainer&#x3C;T>         // 容器类，负责初始化和执行整个组合树</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul>
<li>
<p><strong>AbstractComposite</strong></p>
<ul>
<li>定义了组合模式的通用结构，包括 <code v-pre>list</code> 存储子节点、<code v-pre>add()</code> 添加子节点、<code v-pre>allExecute()</code> 层次遍历执行</li>
<li>提供抽象方法：<code v-pre>execute()、type()、executeParentOrder()、executeTier()、executeOrder()</code></li>
</ul>
</li>
<li>
<p><strong>AbstractUserRegisterCheckHandler</strong></p>
<ul>
<li>用户注册校验的抽象基类</li>
<li>固定了 <code v-pre>type()</code> 返回值为 <code v-pre>USER_REGISTER_CHECK</code></li>
</ul>
</li>
<li>
<p><strong>具体策略类</strong></p>
<ul>
<li>每条校验逻辑继承自 <code v-pre>AbstractUserRegisterCheckHandler</code></li>
<li>实现 <code v-pre>execute()</code> 方法完成校验</li>
<li>通过 <code v-pre>executeParentOrder() / executeTier() / executeOrder()</code> 定义树形结构和执行顺序</li>
</ul>
</li>
<li>
<p><strong>CompositeContainer</strong></p>
<ul>
<li>Spring 初始化时扫描所有 <code v-pre>AbstractComposite</code> Bean</li>
<li>按 <code v-pre>type</code> 分组并根据 tier/order 构建组合树</li>
<li>调用 <code v-pre>execute(type, param)</code> 时，按层次遍历执行所有子策略</li>
</ul>
</li>
</ul>
<h3 id="_2️⃣-执行流程示意" tabindex="-1"><a class="header-anchor" href="#_2️⃣-执行流程示意"><span>2️⃣ 执行流程示意</span></a></h3>
<p>假设注册流程中有三个策略：</p>
<ol>
<li><strong>UserRegisterMobileCheck</strong>（手机号校验） tier=1, order=1</li>
<li><strong>UserExistCheckHandler</strong>（手机号是否存在） tier=2, order=2</li>
<li><strong>UserRegisterVerifyCaptcha</strong>（验证码校验） tier=1, order=2</li>
</ol>
<p><strong>组合树结构：</strong></p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>Root (tier 1)</span></span>
<span class="line"><span>├─ UserRegisterMobileCheck (order 1)</span></span>
<span class="line"><span>├─ UserRegisterVerifyCaptcha (order 2)</span></span>
<span class="line"><span>└─ UserExistCheckHandler (tier 2, parentOrder=1)</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>执行顺序（层次遍历 BFS）：</p>
<ol>
<li>Tier 1: UserRegisterMobileCheck → UserRegisterVerifyCaptcha</li>
<li>Tier 2: UserExistCheckHandler</li>
</ol>
<h3 id="优势" tabindex="-1"><a class="header-anchor" href="#优势"><span>优势</span></a></h3>
<table>
<thead>
<tr>
<th>特性</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>高度解耦</strong></td>
<td>每条校验逻辑独立实现，不耦合注册方法</td>
</tr>
<tr>
<td><strong>易扩展</strong></td>
<td>新增校验只需新增策略类并继承抽象基类，容器自动加载</td>
</tr>
<tr>
<td><strong>复用性高</strong></td>
<td>相同策略可复用于不同业务场景，如注册、修改手机号、找回密码</td>
</tr>
<tr>
<td><strong>统一管理</strong></td>
<td>抽象类和容器提供子节点管理、执行顺序和组合树结构，简化流程控制</td>
</tr>
<tr>
<td><strong>高性能</strong></td>
<td>可以轻松组合布隆过滤器、Redis校验等高效判断逻辑，减少数据库查询</td>
</tr>
</tbody>
</table>
<h2 id="_3️⃣-布隆过滤器-bloom-filter" tabindex="-1"><a class="header-anchor" href="#_3️⃣-布隆过滤器-bloom-filter"><span>3️⃣ 布隆过滤器（Bloom Filter）</span></a></h2>
<h3 id="什么是布隆过滤器" tabindex="-1"><a class="header-anchor" href="#什么是布隆过滤器"><span>什么是布隆过滤器？</span></a></h3>
<p>布隆过滤器是一种 <strong>高效判断元素是否存在的概率型数据结构</strong>：</p>
<ul>
<li>
<p><strong>特点</strong>：</p>
<ul>
<li><strong>可能误判存在</strong>（false positive）</li>
<li><strong>绝不会漏报不存在</strong>（no false negative）</li>
</ul>
</li>
</ul>
<h3 id="示例-手机号存在判断" tabindex="-1"><a class="header-anchor" href="#示例-手机号存在判断"><span>示例：手机号存在判断</span></a></h3>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 添加手机号到布隆过滤器</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">bloomFilterHandler</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">userMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">());</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 检查手机号是否存在</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">bloomFilterHandler</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">exists</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">userRegisterDto</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getMobile</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">())</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    throw</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> BusinessException</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"手机号已注册（布隆过滤器判断）"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="在注册场景的作用" tabindex="-1"><a class="header-anchor" href="#在注册场景的作用"><span>在注册场景的作用</span></a></h3>
<ul>
<li>用户注册后，将手机号加入布隆过滤器</li>
<li>下次注册或验证手机号时，先通过布隆过滤器判断是否存在</li>
<li>如果布隆判断不存在，则直接写库；如果判断存在，再去数据库二次确认</li>
<li><strong>减少数据库查询次数，提高性能</strong></li>
</ul>
<h3 id="优势-1" tabindex="-1"><a class="header-anchor" href="#优势-1"><span>优势</span></a></h3>
<table>
<thead>
<tr>
<th>特性</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr>
<td>高性能</td>
<td>内存中判断，避免频繁查询数据库</td>
</tr>
<tr>
<td>高并发适用</td>
<td>快速判断重复元素，防止重复注册</td>
</tr>
<tr>
<td>节省资源</td>
<td>使用位数组和哈希函数，内存消耗小</td>
</tr>
</tbody>
</table>
<h2 id="_4️⃣-总结" tabindex="-1"><a class="header-anchor" href="#_4️⃣-总结"><span>4️⃣ 总结</span></a></h2>
<p>在用户注册功能中，结合 <strong>复合校验 + 布隆过滤器</strong> 可以有效解决：</p>
<ol>
<li><strong>业务校验复杂</strong> → 复合校验解耦策略</li>
<li><strong>重复注册风险</strong> → 分布式锁 + 布隆过滤器</li>
<li><strong>性能压力大</strong> → 布隆过滤器减少数据库查询</li>
</ol>
<p>通过这种设计，注册功能既保证了 <strong>安全性、正确性</strong>，也兼顾 <strong>高性能与高并发能力</strong>。</p>
<h3 id="核心概念回顾" tabindex="-1"><a class="header-anchor" href="#核心概念回顾"><span>核心概念回顾</span></a></h3>
<table>
<thead>
<tr>
<th>概念</th>
<th>描述</th>
<th>优势</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>复合校验（Composite Check）</strong></td>
<td>将多种校验策略组合成一个统一执行器</td>
<td>高度解耦、易扩展、复用性高</td>
</tr>
<tr>
<td><strong>布隆过滤器（Bloom Filter）</strong></td>
<td>高效判断元素是否存在的概率型数据结构</td>
<td>减少数据库查询、高性能、高并发适用</td>
</tr>
</tbody>
</table>
</div></template>


