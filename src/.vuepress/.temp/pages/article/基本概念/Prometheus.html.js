import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/基本概念/Prometheus.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/Prometheus.html\",\"title\":\"Prometheus\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"Prometheus\",\"date\":\"2025-10-19T00:00:00.000Z\",\"series\":\"基本概念\"},\"readingTime\":{\"minutes\":3.34,\"words\":1001},\"filePathRelative\":\"article/基本概念/Prometheus.md\",\"excerpt\":\"<h2>一、什么是 Prometheus</h2>\\n<p>Prometheus 是一个 <strong>开源的系统监控与告警工具</strong>，由 SoundCloud 于 2012 年开发，并在 2015 年成为 CNCF（云原生计算基金会）托管项目。<br>\\n它以时间序列数据库（Time Series Database, TSDB）为核心，用于采集、存储和查询各种指标数据，是云原生监控体系中最重要的组件之一。</p>\\n<p>通俗来说，Prometheus 就是一个能“自动拉取监控数据、保存历史指标、支持灵活查询和告警”的监控平台。</p>\\n<hr>\\n<h2>二、Prometheus 的核心特点</h2>\"}")
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
