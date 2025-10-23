import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/java/模块设计.html.vue"
const data = JSON.parse("{\"path\":\"/article/java/%E6%A8%A1%E5%9D%97%E8%AE%BE%E8%AE%A1.html\",\"title\":\"模块设计\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"模块设计\",\"date\":\"2025-05-21T00:00:00.000Z\",\"series\":\"Java\"},\"readingTime\":{\"minutes\":3.57,\"words\":1071},\"filePathRelative\":\"article/java/模块设计.md\",\"excerpt\":\"\\n<p>在企业级开发中，为了提高代码复用率、分工协作效率以及系统的可维护性，Java 项目通常采用 <strong>多模块（multi-module）架构</strong>。本篇将从模块划分思路出发，介绍如何进行合理的模块组织，并讲解 Maven 的依赖管理方式。</p>\\n<h2>一、模块如何划分？</h2>\\n<p>模块划分需遵循 <strong>高内聚、低耦合、职责单一</strong> 的原则，常见方式包括：</p>\\n<h3>1. 业务维度划分</h3>\\n<ul>\\n<li><code>user-service</code>：用户注册、登录、信息管理等功能</li>\\n<li><code>order-service</code>：订单创建、支付、状态流转等功能</li>\\n<li><code>payment-service</code>：支付接口、交易记录等</li>\\n<li><code>inventory-service</code>：库存管理、锁库存、减库存等</li>\\n</ul>\"}")
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
