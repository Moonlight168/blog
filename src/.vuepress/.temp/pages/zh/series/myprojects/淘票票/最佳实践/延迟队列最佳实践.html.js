import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/最佳实践/延迟队列最佳实践.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/%E5%BB%B6%E8%BF%9F%E9%98%9F%E5%88%97%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5.html\",\"title\":\"淘票票项目延迟队列最佳实践\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":7.69,\"words\":2307},\"filePathRelative\":\"zh/series/myprojects/淘票票/最佳实践/延迟队列最佳实践.md\",\"excerpt\":\"\\n<p>在分布式系统中，延迟队列是一种重要的组件，用于处理需要在特定时间后执行的任务。淘票票项目通过实现一套完整的延迟队列机制来解决订单超时未支付自动取消、活动开始前提醒等场景的需求。</p>\\n<h2>1. 模块概述</h2>\\n<p>延迟队列模块位于 [taopiaopiao-service-delay-queue-framework](file:///F%3A/MyProjects/taopiaopiao/taopiaopiao-redisson-framework/taopiaopiao-service-delay-queue-framework) 目录下，基于Redisson实现，提供了高性能、可扩展的延迟队列功能。</p>\"}")
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
