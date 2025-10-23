<template><div><h2 id="如何提升前端性能" tabindex="-1"><a class="header-anchor" href="#如何提升前端性能"><span>如何提升前端性能？</span></a></h2>
<p><strong>回答：</strong><br>
可以从以下几个方面优化前端性能：</p>
<ul>
<li>减少 HTTP 请求：合并 CSS/JS 文件，使用雪碧图、图片压缩。</li>
<li>启用资源压缩与缓存：开启 Gzip，设置合理的浏览器缓存策略。</li>
<li>异步加载资源：对非关键资源使用懒加载（Lazy Load）和异步加载方式。</li>
</ul>
<h2 id="js-和-ts-的区别" tabindex="-1"><a class="header-anchor" href="#js-和-ts-的区别"><span>JS 和 TS 的区别？</span></a></h2>
<p><strong>回答：</strong><br>
JavaScript 是一种动态类型语言，写起来比较灵活，但是也容易出错，比如变量类型写错了编译阶段是发现不了的。<br>
而 TypeScript 是 JavaScript 的超集，它加了静态类型和类型检查机制，能在写代码的时候就发现一些潜在的错误。<br>
简单来说，TS 更加安全、规范，适合大型项目开发，而且它写出来的代码，最终也会编译成 JS 去执行。</p>
<h2 id="vue2-和-vue3-有什么区别" tabindex="-1"><a class="header-anchor" href="#vue2-和-vue3-有什么区别"><span>Vue2 和 Vue3 有什么区别？</span></a></h2>
<p><strong>回答：</strong> Vue3 是 Vue2 的升级版，变化还是挺大的。<br>
首先，它的性能比 Vue2 更好，响应式系统从 <code v-pre>Object.defineProperty</code> 改成了 <code v-pre>Proxy</code>，可以监听更多复杂的数据变化，速度也更快。<br>
再一个是写法上的变化，Vue3 提出了组合式 API，也就是 <code v-pre>setup()</code> 这种写法，更加灵活，方便逻辑复用，而 Vue2 是用 <code v-pre>data</code>、<code v-pre>methods</code>、<code v-pre>computed</code> 这些分散的写法。<br>
还有就是 Vue3 对 TypeScript 支持更好，更适合企业级开发。<br>
另外，一些技术细节比如支持多个根节点、体积更小等等，都是 Vue3 的优势。</p>
</div></template>


