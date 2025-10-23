import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/java/Spring Boot自动配置机制与组件扫描.html.vue"
const data = JSON.parse("{\"path\":\"/article/java/Spring%20Boot%E8%87%AA%E5%8A%A8%E9%85%8D%E7%BD%AE%E6%9C%BA%E5%88%B6%E4%B8%8E%E7%BB%84%E4%BB%B6%E6%89%AB%E6%8F%8F.html\",\"title\":\"Spring Boot自动配置机制与组件扫描：演进、区别与最佳实践\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"Spring Boot自动配置机制与组件扫描：演进、区别与最佳实践\",\"date\":\"2025-09-23T00:00:00.000Z\",\"series\":\"Java\"},\"readingTime\":{\"minutes\":3.16,\"words\":948},\"filePathRelative\":\"article/java/Spring Boot自动配置机制与组件扫描.md\",\"excerpt\":\"<h2>引言</h2>\\n<p>Spring Boot 的核心优势之一就是“开箱即用”的自动配置，它极大地减少了开发者的配置负担。同时，Spring 本身的 <strong>组件扫描机制</strong> 也是我们日常开发中必不可少的工具。<br>\\n这两种机制都能帮助我们注册 Bean，但在实现方式、使用场景和演进方向上有明显区别。本文将从 <strong>Spring Boot 自动配置机制的演进</strong> 出发，结合 <strong>自动配置与组件扫描的差异</strong>，为你梳理一条完整的理解路径。</p>\\n<h2>一、Spring Boot 自动配置机制演进</h2>\\n<h3>1. 旧方式：<code>spring.factories</code></h3>\"}")
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
