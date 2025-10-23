import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/开发工具/elasticsearch.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7/elasticsearch.html\",\"title\":\"Elasticsearch\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"Elasticsearch\",\"date\":\"2025-09-11T00:00:00.000Z\",\"series\":\"开发工具\"},\"readingTime\":{\"minutes\":1.89,\"words\":567},\"filePathRelative\":\"zh/series/knowledge/开发工具/elasticsearch.md\",\"excerpt\":\"<h2>说一下你对 Elasticsearch 的理解</h2>\\n<p><strong>回答：</strong></p>\\n<p>Elasticsearch 就是一个基于 Lucene 的分布式搜索和分析引擎。它的核心能力是做 <strong>全文检索</strong>，也就是说能在海量文本里快速找到你想要的内容。</p>\\n<p>它的几个特点：</p>\\n<ul>\\n<li><strong>分布式</strong>，数据会自动分片、副本，既能水平扩展，也能保证高可用。</li>\\n<li><strong>近实时</strong>，数据写进去之后几乎立刻就能查到，适合日志、监控这种实时性要求高的场景。</li>\\n<li><strong>搜索和分析能力强</strong>，不仅能做关键词搜索，还能做聚合统计、过滤、排序等分析。</li>\\n<li><strong>接口友好</strong>，对外暴露 RESTful API，用 HTTP/JSON 就能操作，很容易和各种语言集成。</li>\\n</ul>\"}")
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
