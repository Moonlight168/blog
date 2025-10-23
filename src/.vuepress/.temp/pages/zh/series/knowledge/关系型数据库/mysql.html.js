import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/关系型数据库/mysql.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E5%85%B3%E7%B3%BB%E5%9E%8B%E6%95%B0%E6%8D%AE%E5%BA%93/mysql.html\",\"title\":\"MySQL\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"MySQL\",\"date\":\"2025-05-21T00:00:00.000Z\",\"series\":\"关系型数据库\"},\"readingTime\":{\"minutes\":7,\"words\":2101},\"filePathRelative\":\"zh/series/knowledge/关系型数据库/mysql.md\",\"excerpt\":\"<h2>MySQL 的事务四大特性（ACID）是什么？</h2>\\n<p><strong>回答：</strong></p>\\n<ul>\\n<li>原子性（Atomicity）：事务要么全成功要么全失败。</li>\\n<li>一致性（Consistency）：执行前后数据保持一致。</li>\\n<li>隔离性（Isolation）：事务间互不干扰。</li>\\n<li>持久性（Durability）：事务提交后数据永久保存。</li>\\n</ul>\\n<h2>索引有哪些类型？什么时候使用？</h2>\\n<p><strong>回答：</strong></p>\\n<ul>\\n<li>主键索引、唯一索引、普通索引、联合索引。</li>\\n<li>适用于频繁作为 WHERE、JOIN、ORDER BY 条件的字段；不要给频繁变动的字段建索引。</li>\\n</ul>\"}")
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
