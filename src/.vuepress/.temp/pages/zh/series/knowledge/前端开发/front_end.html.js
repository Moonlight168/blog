import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/前端开发/front_end.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91/front_end.html\",\"title\":\"前端相关\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"前端相关\",\"series\":\"前端开发\"},\"readingTime\":{\"minutes\":1.31,\"words\":394},\"filePathRelative\":\"zh/series/knowledge/前端开发/front_end.md\",\"excerpt\":\"<h2>如何提升前端性能？</h2>\\n<p><strong>回答：</strong><br>\\n可以从以下几个方面优化前端性能：</p>\\n<ul>\\n<li>减少 HTTP 请求：合并 CSS/JS 文件，使用雪碧图、图片压缩。</li>\\n<li>启用资源压缩与缓存：开启 Gzip，设置合理的浏览器缓存策略。</li>\\n<li>异步加载资源：对非关键资源使用懒加载（Lazy Load）和异步加载方式。</li>\\n</ul>\\n<h2>JS 和 TS 的区别？</h2>\\n<p><strong>回答：</strong><br>\\nJavaScript 是一种动态类型语言，写起来比较灵活，但是也容易出错，比如变量类型写错了编译阶段是发现不了的。<br>\\n而 TypeScript 是 JavaScript 的超集，它加了静态类型和类型检查机制，能在写代码的时候就发现一些潜在的错误。<br>\\n简单来说，TS 更加安全、规范，适合大型项目开发，而且它写出来的代码，最终也会编译成 JS 去执行。</p>\"}")
export { comp, data }

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
