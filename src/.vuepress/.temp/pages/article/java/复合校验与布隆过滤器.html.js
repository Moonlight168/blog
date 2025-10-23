import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/java/复合校验与布隆过滤器.html.vue"
const data = JSON.parse("{\"path\":\"/article/java/%E5%A4%8D%E5%90%88%E6%A0%A1%E9%AA%8C%E4%B8%8E%E5%B8%83%E9%9A%86%E8%BF%87%E6%BB%A4%E5%99%A8.html\",\"title\":\"复合校验与布隆过滤器实践\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"复合校验与布隆过滤器实践\",\"date\":\"2025-09-19T00:00:00.000Z\",\"series\":\"Java\"},\"readingTime\":{\"minutes\":4.51,\"words\":1352},\"filePathRelative\":\"article/java/复合校验与布隆过滤器.md\",\"excerpt\":\"<p>比如在高并发系统中，用户注册是一个典型的高风险操作：</p>\\n<ul>\\n<li>同一个手机号可能被重复提交</li>\\n<li>数据校验逻辑复杂</li>\\n<li>数据库频繁查询可能成为性能瓶颈</li>\\n</ul>\\n<p>为了应对这些挑战，本篇笔记总结了 <strong>复合校验（Composite Check）</strong> 和 <strong>布隆过滤器（Bloom Filter）</strong> 在注册场景中的应用实践。</p>\\n<h2>1️⃣ 注册方法解析</h2>\\n<p>以 <code>register(UserRegisterDto userRegisterDto)</code> 方法为例：</p>\"}")
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
