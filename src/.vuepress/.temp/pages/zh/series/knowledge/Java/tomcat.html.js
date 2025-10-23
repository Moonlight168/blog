import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/Java/tomcat.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/Java/tomcat.html\",\"title\":\"Tomcat\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"Tomcat\",\"date\":\"2025-05-28T00:00:00.000Z\",\"series\":\"Java\"},\"readingTime\":{\"minutes\":3.56,\"words\":1069},\"filePathRelative\":\"zh/series/knowledge/Java/tomcat.md\",\"excerpt\":\"<h2>Tomcat 是什么？</h2>\\n<p><strong>回答：</strong><br>\\nTomcat 是一个由 Apache 提供的开源 Servlet 容器，支持 JSP 和 Servlet 规范，用于运行 Java Web 应用，是轻量级的 Web 服务器。</p>\\n<h2>Tomcat 的主要组件有哪些？</h2>\\n<p><strong>回答：</strong></p>\\n<h4>1. <strong>Catalina（Servlet 容器核心）</strong></h4>\\n<ul>\\n<li>实现了 Servlet 规范，负责接收请求、加载 Servlet、调用对应的 <code>service()</code> 方法处理请求。</li>\\n<li>是 Tomcat 的核心组件，负责整个请求生命周期的管理。</li>\\n</ul>\"}")
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
