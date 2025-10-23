import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/业务功能/功能解读/购票功能解读.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E4%B8%9A%E5%8A%A1%E5%8A%9F%E8%83%BD/%E5%8A%9F%E8%83%BD%E8%A7%A3%E8%AF%BB/%E8%B4%AD%E7%A5%A8%E5%8A%9F%E8%83%BD%E8%A7%A3%E8%AF%BB.html\",\"title\":\"1.淘票票购票功能详解\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":13.43,\"words\":4028},\"filePathRelative\":\"zh/series/myprojects/淘票票/业务功能/功能解读/购票功能解读.md\",\"excerpt\":\"\\n<h2>一、项目概述</h2>\\n<h3>1. 核心技术栈</h3>\\n<ol>\\n<li><strong>Spring Boot + Spring Cloud Alibaba</strong> - 微服务框架</li>\\n<li><strong>Nacos</strong> - 服务注册与配置中心</li>\\n<li><strong>Sentinel</strong> - 服务熔断与限流</li>\\n<li><strong>MySQL + ShardingSphere</strong> - 分库分表数据库方案</li>\\n<li><strong>Redis</strong> - 缓存、分布式锁、队列等</li>\\n<li><strong>Kafka</strong> - 消息队列</li>\\n<li><strong>ElasticSearch</strong> - 搜索引擎</li>\\n<li><strong>MyBatis-Plus</strong> - ORM框架</li>\\n</ol>\"}")
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
