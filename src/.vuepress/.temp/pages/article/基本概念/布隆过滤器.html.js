import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/基本概念/布隆过滤器.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/%E5%B8%83%E9%9A%86%E8%BF%87%E6%BB%A4%E5%99%A8.html\",\"title\":\"布隆过滤器\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"布隆过滤器\",\"date\":\"2025-10-19T00:00:00.000Z\",\"series\":\"基本概念\"},\"readingTime\":{\"minutes\":3.44,\"words\":1033},\"filePathRelative\":\"article/基本概念/布隆过滤器.md\",\"excerpt\":\"<h2>一、什么是布隆过滤器</h2>\\n<p>布隆过滤器（Bloom Filter）是一种 <strong>高效的概率型数据结构</strong>，用于判断一个元素是否存在于集合中。<br>\\n它的核心特点是：</p>\\n<ul>\\n<li>判断“<strong>一定不存在</strong>”是准确的；</li>\\n<li>判断“<strong>可能存在</strong>”是有一定误差的（即存在误判率）。</li>\\n</ul>\\n<p>因此，布隆过滤器非常适合用于 <strong>快速判断元素是否存在</strong> 的场景，而不需要真正存储所有元素。</p>\\n<hr>\\n<h2>二、布隆过滤器的工作原理</h2>\"}")
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
