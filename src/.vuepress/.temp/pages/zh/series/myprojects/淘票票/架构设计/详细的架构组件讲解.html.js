import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/架构设计/详细的架构组件讲解.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1/%E8%AF%A6%E7%BB%86%E7%9A%84%E6%9E%B6%E6%9E%84%E7%BB%84%E4%BB%B6%E8%AE%B2%E8%A7%A3.html\",\"title\":\"淘票票项目详细的架构组件讲解\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":13.86,\"words\":4157},\"filePathRelative\":\"zh/series/myprojects/淘票票/架构设计/详细的架构组件讲解.md\",\"excerpt\":\"\\n<h2>1. 设计灰度环境服务调用</h2>\\n<h3>1.1 灰度发布概念</h3>\\n<p>灰度发布（又名金丝雀发布）是指在黑与白之间，能够平滑过渡的一种发布方式。在其上可以进行A/B testing，即让一部分用户继续用产品特性A，一部分用户开始用产品特性B，如果用户对B没有什么反对意见，那么逐步扩大范围，把所有用户都迁移到B上面来。</p>\\n<h3>1.2 淘票票项目灰度环境设计</h3>\\n<p>淘票票项目通过以下方式实现灰度环境服务调用：</p>\\n<ol>\\n<li>\\n<p><strong>灰度标识配置</strong></p>\\n<ul>\\n<li>通过配置文件设置服务的灰度标识（server.gray）</li>\\n<li>灰度标识通过请求头传递（gray_parameter）</li>\\n</ul>\\n</li>\\n<li>\\n<p><strong>灰度过滤器</strong></p>\\n<ul>\\n<li>实现ServerGrayFilter类继承AbstractServerFilter</li>\\n<li>通过ContextHandler获取请求上下文中的灰度标识</li>\\n<li>根据灰度标识决定调用哪个版本的服务实例</li>\\n</ul>\\n</li>\\n<li>\\n<p><strong>负载均衡配置</strong></p>\\n<ul>\\n<li>使用自定义的GrayLoadBalanceAutoConfiguration配置类</li>\\n<li>通过DefaultFilterLoadBalance类实现灰度路由过滤</li>\\n<li>结合Nacos服务发现机制，根据灰度标识选择对应的服务实例</li>\\n</ul>\\n</li>\\n<li>\\n<p><strong>上下文传递</strong></p>\\n<ul>\\n<li>通过GatewayContextHolder在网关层存储请求上下文</li>\\n<li>通过FeignRequestInterceptor在服务间调用时传递灰度标识</li>\\n</ul>\\n</li>\\n</ol>\"}")
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
