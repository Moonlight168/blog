import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/架构设计/设计模式在淘票票项目中的应用.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1/%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F%E5%9C%A8%E6%B7%98%E7%A5%A8%E7%A5%A8%E9%A1%B9%E7%9B%AE%E4%B8%AD%E7%9A%84%E5%BA%94%E7%94%A8.html\",\"title\":\"设计模式在淘票票项目中的应用\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":6.46,\"words\":1939},\"filePathRelative\":\"zh/series/myprojects/淘票票/架构设计/设计模式在淘票票项目中的应用.md\",\"excerpt\":\"\\n<p>淘票票项目作为高并发的票务系统，在架构设计中广泛应用了多种设计模式，以提高代码的可维护性、可扩展性和复用性。本文将详细介绍项目中使用的主要设计模式及其具体应用。</p>\\n<h2>1. 工厂模式（Factory Pattern）</h2>\\n<h3>1.1 模式定义</h3>\\n<p>工厂模式是一种创建型设计模式，它提供了一种创建对象的最佳方式。在工厂模式中，我们在创建对象时不会对客户端暴露创建逻辑，而是引用一个共同的接口来指向新创建的对象。</p>\\n<h3>1.2 项目应用</h3>\\n<h4>1.2.1 ServiceLockFactory（分布式锁工厂）</h4>\\n<p>在分布式锁模块中，[ServiceLockFactory](file://F:\\\\MyProjects\\\\taopiaopiao\\\\taopiaopiao-redisson-framework\\\\taopiaopiao-redisson-service-framework\\\\taopiaopiao-service-lock-framework\\\\src\\\\main\\\\java\\\\com\\\\taopiaopiao\\\\servicelock\\\\factory\\\\ServiceLockFactory.java#L15-L36)根据锁类型创建不同的锁实现：</p>\"}")
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
