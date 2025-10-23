import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/核心技术/分布式锁/最佳实践/分布式锁最佳实践.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF/%E5%88%86%E5%B8%83%E5%BC%8F%E9%94%81/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E5%88%86%E5%B8%83%E5%BC%8F%E9%94%81%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5.html\",\"title\":\"淘票票项目分布式锁最佳实践\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":7.73,\"words\":2319},\"filePathRelative\":\"zh/series/myprojects/淘票票/核心技术/分布式锁/最佳实践/分布式锁最佳实践.md\",\"excerpt\":\"\\n<p>在高并发分布式系统中，为了保证数据一致性，经常需要在多个服务实例间协调对共享资源的访问。淘票票项目通过实现一套完整的分布式锁机制来解决这个问题，本文将详细介绍该机制的设计和实现。</p>\\n<h2>1. 模块概述</h2>\\n<p>分布式锁模块位于 [taopiaopiao-service-lock-framework](file:///F%3A/MyProjects/taopiaopiao/taopiaopiao-redisson-framework/taopiaopiao-redisson-service-framework/taopiaopiao-service-lock-framework) 目录下，基于Redisson实现，提供了多种类型的分布式锁和灵活的使用方式。</p>\"}")
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
