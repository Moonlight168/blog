import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/基本概念/红锁.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/%E7%BA%A2%E9%94%81.html\",\"title\":\"红锁\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"红锁\",\"date\":\"2025-10-19T00:00:00.000Z\",\"series\":\"基本概念\",\"tags\":[\"多线程\",\"Redis\"]},\"readingTime\":{\"minutes\":4.14,\"words\":1241},\"filePathRelative\":\"article/基本概念/红锁.md\",\"excerpt\":\"<h2>一、什么是红锁（Redlock）</h2>\\n<p>红锁（Redlock）是 Redis 官方提出的一种 <strong>分布式锁算法</strong>，由 Redis 的作者 Antirez 设计。它是基于 Redis 单机版分布式锁（即 <code>SET key value NX PX expireTime</code>）的改进版本，旨在在分布式系统中提供更高可靠性和安全性的锁机制。</p>\\n<p>简单来说，<strong>红锁是为了解决单节点 Redis 锁在主从复制、网络分区等情况下可能出现的锁安全问题</strong>，让分布式环境下的锁具备更高的容错性与一致性保障。</p>\"}")
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
