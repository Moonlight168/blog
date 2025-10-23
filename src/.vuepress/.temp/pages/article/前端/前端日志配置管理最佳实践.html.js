import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/前端/前端日志配置管理最佳实践.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%89%8D%E7%AB%AF/%E5%89%8D%E7%AB%AF%E6%97%A5%E5%BF%97%E9%85%8D%E7%BD%AE%E7%AE%A1%E7%90%86%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5.html\",\"title\":\"前端日志配置管理最佳实践\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"前端日志配置管理最佳实践\",\"date\":\"2025-06-11T00:00:00.000Z\",\"categories\":[\"前端\"],\"tags\":[\"vue\"]},\"readingTime\":{\"minutes\":2.54,\"words\":762},\"filePathRelative\":\"article/前端/前端日志配置管理最佳实践.md\",\"excerpt\":\"<h2>引言</h2>\\n<p>在前端开发中，日志管理是调试、监控和优化应用的重要部分。传统的 <code>console.log</code> 方法虽然简单，但缺乏结构化和集中管理的能力。本文将介绍如何使用现有的日志库 <code>pino</code> 在前端项目中实现统一的日志管理，代码设计为通用性强，适用于 Vue、React 等框架，并结合 VuePress 格式展示。</p>\\n<h2>为什么需要日志管理？</h2>\\n<ul>\\n<li><strong>调试效率</strong>：结构化日志便于快速定位问题。</li>\\n<li><strong>用户体验</strong>：通过通知提示用户错误。</li>\\n<li><strong>监控与分析</strong>：支持本地存储或发送到后端。</li>\\n</ul>\"}")
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
