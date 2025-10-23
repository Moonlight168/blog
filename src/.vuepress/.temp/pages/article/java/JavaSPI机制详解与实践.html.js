import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/java/JavaSPI机制详解与实践.html.vue"
const data = JSON.parse("{\"path\":\"/article/java/JavaSPI%E6%9C%BA%E5%88%B6%E8%AF%A6%E8%A7%A3%E4%B8%8E%E5%AE%9E%E8%B7%B5.html\",\"title\":\"Java SPI机制详解与在淘票票项目中的实践\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"Java SPI机制详解与在淘票票项目中的实践\",\"date\":\"2025-10-19T00:00:00.000Z\",\"series\":\"Java\"},\"readingTime\":{\"minutes\":4.65,\"words\":1395},\"filePathRelative\":\"article/java/JavaSPI机制详解与实践.md\",\"excerpt\":\"<h2>1. 什么是Java SPI机制</h2>\\n<p>SPI（Service Provider Interface）是Java提供的一种服务发现机制，用于在运行时动态加载和发现服务实现。它通过在classpath路径下的<code>META-INF/services</code>文件夹中配置接口的实现类，使得程序可以在运行时根据配置加载相应的实现。</p>\\n<h3>1.1 SPI的核心思想</h3>\\n<p>SPI机制的核心思想是<strong>解耦接口和实现</strong>。通过配置文件的方式，将接口的实现类完全交给第三方来实现，而不需要在代码中硬编码具体的实现类。这种机制使得框架具有良好的扩展性，开发者可以根据需要提供不同的实现。</p>\"}")
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
