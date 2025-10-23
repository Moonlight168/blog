import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/核心技术/API限制/最佳实践/API限制功能深度解析与最佳实践.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF/API%E9%99%90%E5%88%B6/%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/API%E9%99%90%E5%88%B6%E5%8A%9F%E8%83%BD%E6%B7%B1%E5%BA%A6%E8%A7%A3%E6%9E%90%E4%B8%8E%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5.html\",\"title\":\"淘票票项目API限制功能深度解析与最佳实践\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":8.02,\"words\":2407},\"filePathRelative\":\"zh/series/myprojects/淘票票/核心技术/API限制/最佳实践/API限制功能深度解析与最佳实践.md\",\"excerpt\":\"\\n<h2>1. 概述</h2>\\n<p>淘票票项目通过API限制功能来保护系统免受恶意请求和异常流量的影响，确保系统的稳定性和高可用性。该功能基于Redis和Lua脚本实现，具备高性能、低延迟的特点，能够实时监控和限制API访问频率。</p>\\n<h2>2. 整体架构设计</h2>\\n<h3>2.1 核心组件</h3>\\n<p>API限制功能主要由以下几个核心组件构成：</p>\\n<ol>\\n<li><strong>ApiRestrictService</strong>：Java服务层，负责业务逻辑处理和规则配置</li>\\n<li><strong>ApiRestrictCacheOperate</strong>：Redis Lua脚本执行器</li>\\n<li><strong>apiLimit.lua</strong>：核心Lua脚本，实现限流逻辑</li>\\n<li><strong>Redis</strong>：存储限流相关数据和状态</li>\\n</ol>\"}")
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
