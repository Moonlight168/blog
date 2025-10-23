import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/核心技术/分布式锁/最佳实践/防重复提交最佳实践.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF/%E5%88%86%E5%B8%83%E5%BC%8F%E9%94%81/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E9%98%B2%E9%87%8D%E5%A4%8D%E6%8F%90%E4%BA%A4%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5.html\",\"title\":\"淘票票项目防重复提交（幂等性）最佳实践\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":5.84,\"words\":1751},\"filePathRelative\":\"zh/series/myprojects/淘票票/核心技术/分布式锁/最佳实践/防重复提交最佳实践.md\",\"excerpt\":\"\\n<p>在高并发系统中，防止用户重复提交请求是一个常见且重要的问题。淘票票项目中通过实现一个专门的防重复提交模块来解决这个问题，该模块基于Redis和本地锁实现了一套完整的防重复提交机制。</p>\\n<h2>1. 模块概述</h2>\\n<p>防重复提交模块位于 [taopiaopiao-repeat-execute-limit-framework](file:///F%3A/MyProjects/taopiaopiao/taopiaopiao-redisson-framework/taopiaopiao-redisson-service-framework/taopiaopiao-repeat-execute-limit-framework) 目录下，通过AOP（面向切面编程）和注解的方式实现防重复提交功能。</p>\"}")
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
