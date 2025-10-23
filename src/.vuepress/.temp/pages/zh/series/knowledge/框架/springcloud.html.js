import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/框架/springcloud.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E6%A1%86%E6%9E%B6/springcloud.html\",\"title\":\"SpringCloud\",\"lang\":\"en-US\",\"frontmatter\":{\"series\":\"框架\",\"title\":\"SpringCloud\",\"order\":1},\"readingTime\":{\"minutes\":3.65,\"words\":1096},\"filePathRelative\":\"zh/series/knowledge/框架/springcloud.md\",\"excerpt\":\"<h2>什么是微服务？有哪些优缺点？</h2>\\n<p><strong>回答：</strong><br>\\n微服务是将单体应用拆分成多个独立服务，各服务可独立部署、扩展。</p>\\n<ul>\\n<li>优点：开发独立、部署灵活、可按需扩展。</li>\\n<li>缺点：系统复杂、测试困难、运维成本高、接口通信开销大。</li>\\n</ul>\\n<h2>每个微服务之间如何通信？</h2>\\n<p><strong>回答：</strong></p>\\n<ol>\\n<li>\\n<p><strong>同步通信</strong>：使用 HTTP 或 RPC</p>\\n<ul>\\n<li>常用方式：OpenFeign、RestTemplate、Dubbo、gRPC</li>\\n<li>特点：实时响应，适合强一致性场景</li>\\n</ul>\\n</li>\\n<li>\\n<p><strong>异步通信</strong>：通过消息队列</p>\\n<ul>\\n<li>常用组件：Kafka、RabbitMQ、RocketMQ</li>\\n<li>特点：解耦、削峰填谷，适合异步处理场景</li>\\n</ul>\\n</li>\\n</ol>\"}")
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
