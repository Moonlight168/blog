<template><div><h2 id="一、什么是-lua-脚本" tabindex="-1"><a class="header-anchor" href="#一、什么是-lua-脚本"><span>一、什么是 Lua 脚本</span></a></h2>
<p>Lua 是一种轻量级的脚本语言。Redis 从 2.6 版本开始内置了对 Lua 的支持，允许我们把一段逻辑写成 Lua 脚本，一次性提交给 Redis 服务器执行。</p>
<h2 id="二、lua-脚本的作用" tabindex="-1"><a class="header-anchor" href="#二、lua-脚本的作用"><span>二、Lua 脚本的作用</span></a></h2>
<p>Lua 脚本在 Redis 中的主要作用是 <strong>将多条命令封装为一个原子操作执行</strong>。这意味着脚本中的所有 Redis 命令会在一次执行中完成，不会被其他客户端的命令打断，从而保证数据操作的一致性和完整性。</p>
<p>它常用于以下场景：</p>
<ol>
<li><strong>原子操作</strong>：在高并发环境下确保关键业务逻辑不被其他请求干扰，比如秒杀、库存扣减。</li>
<li><strong>减少网络开销</strong>：客户端只需一次请求即可完成多条命令执行。</li>
<li><strong>逻辑复用</strong>：在 Redis 端处理逻辑，减少客户端逻辑复杂度。</li>
<li><strong>性能提升</strong>：执行脚本的效率通常高于多条命令连续执行。</li>
</ol>
<h2 id="三、为什么-lua-脚本是原子操作" tabindex="-1"><a class="header-anchor" href="#三、为什么-lua-脚本是原子操作"><span>三、为什么 Lua 脚本是原子操作</span></a></h2>
<p>Redis 保证 Lua 脚本的执行是 <strong>单线程、原子的</strong>。其内部机制如下：</p>
<ol>
<li>
<p><strong>单线程模型</strong><br>
Redis 的核心是单线程执行命令的，Lua 脚本执行时会被 Redis 当作一条独立命令来处理。<br>
当一个 Lua 脚本开始执行后，Redis 不会切换去处理其他客户端的请求，直到脚本执行完成。</p>
</li>
<li>
<p><strong>无中断执行机制</strong><br>
Redis 在执行 Lua 脚本时，会将整个脚本加载到 Lua 解释器中运行，脚本中的所有 Redis 命令都在一个上下文中按顺序执行，不会被其他命令插队。<br>
因此，从外部看，这段脚本的所有操作是一个整体，要么全部执行成功，要么全部执行失败。</p>
</li>
<li>
<p><strong>原子性保证的本质</strong><br>
Redis 将 Lua 脚本的执行过程与事务机制类似处理：</p>
<ul>
<li>期间不会执行其他命令</li>
<li>不存在部分执行或中断</li>
<li>如果出错，整个脚本终止，不会有部分命令生效</li>
</ul>
</li>
</ol>
<p>这使得 Lua 脚本天然具备 <strong>原子性（Atomicity）</strong> 特征。</p>
<h2 id="四、为什么能解决并发竞争问题" tabindex="-1"><a class="header-anchor" href="#四、为什么能解决并发竞争问题"><span>四、为什么能解决并发竞争问题</span></a></h2>
<p>在分布式系统中，并发竞争通常出现在多个客户端同时操作同一资源的情况下，比如多个用户同时抢购一个库存。</p>
<p>如果使用多条普通 Redis 命令执行（如 GET → 判断 → DECR），在命令间可能被其他请求打断，导致数据不一致。</p>
<p>而 Lua 脚本通过将逻辑写在同一个脚本中，一次性提交给 Redis 执行，保证在执行期间不会有其他客户端的命令介入，从而避免了并发修改问题。例如：</p>
<div class="language-lua line-numbers-mode" data-highlighter="shiki" data-ext="lua" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-lua"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 秒杀库存扣减逻辑</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">local</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> stock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> = </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">redis</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">call</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">'GET'</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">, </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">'product_stock'</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">if</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2"> tonumber</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">stock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">) > </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">0</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> then</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    redis</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">call</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">'DECR'</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">, </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">'product_stock'</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    return</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">else</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    return</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">end</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这段脚本执行时，Redis 会保证：</p>
<ul>
<li>不会在 <code v-pre>GET</code> 和 <code v-pre>DECR</code> 之间被其他请求打断；</li>
<li>执行期间库存数据是一致的；</li>
<li>并发请求只能依次进入执行，避免超卖。</li>
</ul>
<h2 id="五、总结" tabindex="-1"><a class="header-anchor" href="#五、总结"><span>五、总结</span></a></h2>
<p>Lua 脚本之所以能解决并发问题，是因为 <strong>Redis 在单线程模型下将脚本当作一个整体命令执行</strong>，在执行过程中不允许其他命令插入，从而实现了严格的原子性和一致性。</p>
<p>这使得 Lua 成为在高并发分布式场景中实现安全操作（如秒杀、抢购、分布式锁）的关键手段。</p>
</div></template>


