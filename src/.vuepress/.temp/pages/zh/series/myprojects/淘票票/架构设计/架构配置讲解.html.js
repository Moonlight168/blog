import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/架构设计/架构配置讲解.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1/%E6%9E%B6%E6%9E%84%E9%85%8D%E7%BD%AE%E8%AE%B2%E8%A7%A3.html\",\"title\":\"淘票票项目架构配置讲解\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":18.15,\"words\":5445},\"filePathRelative\":\"zh/series/myprojects/淘票票/架构设计/架构配置讲解.md\",\"excerpt\":\"\\n<h2>1. 业务过滤器的讲解</h2>\\n<p>淘票票项目中实现了多个过滤器来处理请求和响应，确保系统的安全性和一致性。</p>\\n<h3>1.1 网关层过滤器</h3>\\n<h4>RequestValidationFilter（请求验证过滤器）</h4>\\n<ul>\\n<li>位置：taopiaopiao-server/taopiaopiao-gateway-service</li>\\n<li>功能：\\n<ul>\\n<li>请求参数验证和签名验证</li>\\n<li>Token验证和用户身份识别</li>\\n<li>请求限流控制</li>\\n<li>TraceId生成和传递</li>\\n<li>请求体解密和验证</li>\\n</ul>\\n</li>\\n<li>执行顺序：order = -2，优先级较高(Spring Cloud Gateway 中：设置order &gt; 0（post 阶段） 拦截器，设置order &lt; 0（pre 阶段）拦截器）</li>\\n</ul>\"}")
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
