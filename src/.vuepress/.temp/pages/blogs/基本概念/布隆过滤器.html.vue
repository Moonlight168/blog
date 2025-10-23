<template><div><h2 id="一、什么是布隆过滤器" tabindex="-1"><a class="header-anchor" href="#一、什么是布隆过滤器"><span>一、什么是布隆过滤器</span></a></h2>
<p>布隆过滤器（Bloom Filter）是一种 <strong>高效的概率型数据结构</strong>，用于判断一个元素是否存在于集合中。<br>
它的核心特点是：</p>
<ul>
<li>判断“<strong>一定不存在</strong>”是准确的；</li>
<li>判断“<strong>可能存在</strong>”是有一定误差的（即存在误判率）。</li>
</ul>
<p>因此，布隆过滤器非常适合用于 <strong>快速判断元素是否存在</strong> 的场景，而不需要真正存储所有元素。</p>
<hr>
<h2 id="二、布隆过滤器的工作原理" tabindex="-1"><a class="header-anchor" href="#二、布隆过滤器的工作原理"><span>二、布隆过滤器的工作原理</span></a></h2>
<p>布隆过滤器底层由两部分组成：</p>
<ol>
<li><strong>一个位数组（bit array）</strong>：长度为 <code v-pre>m</code>，初始时所有位都为 0。</li>
<li><strong>多个哈希函数（k 个）</strong>：每个函数将输入映射到位数组中的一个索引位置。</li>
</ol>
<p><strong>插入过程</strong>：</p>
<ul>
<li>将元素通过 <code v-pre>k</code> 个哈希函数计算出 <code v-pre>k</code> 个位置；</li>
<li>把这些位置的 bit 位设置为 1。</li>
</ul>
<p><strong>查询过程</strong>：</p>
<ul>
<li>再次用相同的 <code v-pre>k</code> 个哈希函数计算位置；</li>
<li>若所有对应的 bit 位都是 1，则认为“可能存在”；</li>
<li>若其中任意一位为 0，则“肯定不存在”。</li>
</ul>
<hr>
<h2 id="三、布隆过滤器的优势" tabindex="-1"><a class="header-anchor" href="#三、布隆过滤器的优势"><span>三、布隆过滤器的优势</span></a></h2>
<ol>
<li><strong>节省内存空间</strong>：布隆过滤器使用位数组存储数据，比存储整个集合占用的空间小得多。</li>
<li><strong>查询速度快</strong>：时间复杂度为 O(k)，k 为哈希函数个数，通常很小。</li>
<li><strong>适合大数据场景</strong>：能在内存有限的情况下完成大规模集合判重操作。</li>
</ol>
<hr>
<h2 id="四、布隆过滤器的缺点" tabindex="-1"><a class="header-anchor" href="#四、布隆过滤器的缺点"><span>四、布隆过滤器的缺点</span></a></h2>
<ol>
<li><strong>存在误判</strong>：可能会把不存在的元素判断为存在（假阳性）。</li>
<li><strong>无法删除元素</strong>：标准布隆过滤器不支持删除操作（删除会导致误判率上升）。</li>
<li><strong>误判率随数据量增加而上升</strong>：当存入的数据量接近设计容量时，准确性降低。</li>
</ol>
<hr>
<h2 id="五、为什么要使用布隆过滤器" tabindex="-1"><a class="header-anchor" href="#五、为什么要使用布隆过滤器"><span>五、为什么要使用布隆过滤器</span></a></h2>
<p>布隆过滤器的设计初衷是 <strong>在有限内存中实现高效的集合存在性判断</strong>。<br>
在传统方式下，若使用哈希表或集合存储大量数据，会消耗大量内存，而布隆过滤器能以极低成本完成快速判断。</p>
<p>它之所以能解决并发系统中的性能问题，是因为：</p>
<ul>
<li>避免了无意义的数据库或缓存查询。</li>
<li>能在高 QPS 场景下快速判断请求是否有效。</li>
</ul>
<hr>
<h2 id="六、应用场景" tabindex="-1"><a class="header-anchor" href="#六、应用场景"><span>六、应用场景</span></a></h2>
<ol>
<li>
<p><strong>缓存穿透防护</strong><br>
在 Redis 缓存中，如果用户频繁请求不存在的 key，会导致请求直接打到数据库。<br>
使用布隆过滤器可以在请求前判断 key 是否存在，不存在的直接拦截，从而保护数据库。</p>
</li>
<li>
<p><strong>网页爬虫 URL 判重</strong><br>
爬虫系统中用于判断某个 URL 是否已经爬取过，防止重复抓取。</p>
</li>
<li>
<p><strong>垃圾邮件过滤</strong><br>
判断邮件地址或内容是否出现在黑名单中。</p>
</li>
<li>
<p><strong>推荐系统或广告系统</strong><br>
判断用户是否已浏览过某个内容或广告。</p>
</li>
</ol>
<hr>
<h2 id="七、在-redis-中的实现" tabindex="-1"><a class="header-anchor" href="#七、在-redis-中的实现"><span>七、在 Redis 中的实现</span></a></h2>
<p>Redis 官方提供了 <strong>RedisBloom 模块</strong> 支持布隆过滤器，常用命令如下：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"># 创建布隆过滤器并设置误判率与预期数量</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">BF.RESERVE</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> myBloom</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0.01</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 1000000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"># 添加元素</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">BF.ADD</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> myBloom</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> user:1001</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"># 判断元素是否存在</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">BF.EXISTS</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> myBloom</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> user:1001</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">BF.EXISTS</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> myBloom</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> user:2002</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul>
<li><code v-pre>0.01</code> 表示允许的误判率（1%）</li>
<li><code v-pre>1000000</code> 表示预计存储 100 万个元素</li>
</ul>
<p>Redis 会自动根据参数分配 bit 数组大小和哈希函数数量，以达到目标误判率。</p>
<hr>
<h2 id="八、总结" tabindex="-1"><a class="header-anchor" href="#八、总结"><span>八、总结</span></a></h2>
<p>布隆过滤器是一种基于哈希思想的 <strong>高效空间换时间</strong> 数据结构：</p>
<ul>
<li><strong>优点</strong>：节省内存、查询快、适合大数据场景；</li>
<li><strong>缺点</strong>：存在误判、无法删除；</li>
<li><strong>典型用途</strong>：缓存穿透防护、URL 判重、垃圾邮件检测等。</li>
</ul>
<p>它通过简单的位操作和多哈希函数映射，成为高并发系统中快速判断数据存在性的利器。</p>
</div></template>


