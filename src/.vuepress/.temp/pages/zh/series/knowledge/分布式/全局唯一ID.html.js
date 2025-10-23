import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/分布式/全局唯一ID.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E5%88%86%E5%B8%83%E5%BC%8F/%E5%85%A8%E5%B1%80%E5%94%AF%E4%B8%80ID.html\",\"title\":\"全局唯一ID\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"全局唯一ID\",\"series\":\"分布式\"},\"readingTime\":{\"minutes\":3.23,\"words\":969},\"filePathRelative\":\"zh/series/knowledge/分布式/全局唯一ID.md\",\"excerpt\":\"<h3>为什么在分布式系统中需要全局唯一 ID？</h3>\\n<p><strong>回答：</strong><br>\\n在分库分表、高并发场景下，如果只依赖单机自增 ID，容易产生重复冲突，难以保证数据唯一性和可追踪性。因此需要一种分布式 ID 生成方案，保证在不同机器、不同库表中生成的 ID <strong>全局唯一、有序、性能高</strong>。</p>\\n<h3>分布式 ID 生成的常见方案有哪些？</h3>\\n<p><strong>回答：</strong></p>\\n<ol>\\n<li>\\n<p><strong>数据库号段（Segment）模式</strong></p>\\n<ul>\\n<li>每次从数据库取一段号段（如 1000 个），缓存在内存中本地生成。</li>\\n<li>优点：实现简单，ID 有序。</li>\\n<li>缺点：依赖数据库，存在单点。</li>\\n</ul>\\n</li>\\n<li>\\n<p><strong>UUID</strong></p>\\n<ul>\\n<li>直接生成随机字符串。</li>\\n<li>优点：本地生成，无中心化依赖。</li>\\n<li>缺点：冗长、无序、查询性能差。</li>\\n</ul>\\n</li>\\n<li>\\n<p><strong>Snowflake（雪花算法）</strong></p>\\n<ul>\\n<li>基于时间戳 + 数据中心 ID + 机器 ID + 自增序列。</li>\\n<li>优点：高性能、趋势递增、分布式场景常用。</li>\\n<li>缺点：时钟回拨问题、机器 ID 配置复杂。</li>\\n</ul>\\n</li>\\n<li>\\n<p><strong>Redis / Zookeeper 分布式自增</strong></p>\\n<ul>\\n<li>利用分布式缓存/协调器生成 ID。</li>\\n<li>优点：一致性强。</li>\\n<li>缺点：性能瓶颈、可用性依赖。</li>\\n</ul>\\n</li>\\n<li>\\n<p><strong>百度 UidGenerator、美团 Leaf 等中间件</strong></p>\\n<ul>\\n<li>开源成熟方案，支持号段模式和 Snowflake。</li>\\n<li>优点：工业级稳定、性能高。</li>\\n</ul>\\n</li>\\n</ol>\"}")
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
