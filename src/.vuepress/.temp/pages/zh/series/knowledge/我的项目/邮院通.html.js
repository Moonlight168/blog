import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/我的项目/邮院通.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E6%88%91%E7%9A%84%E9%A1%B9%E7%9B%AE/%E9%82%AE%E9%99%A2%E9%80%9A.html\",\"title\":\"邮院通（校园一站式服务平台）\",\"lang\":\"en-US\",\"frontmatter\":{\"series\":\"我的项目\",\"title\":\"邮院通（校园一站式服务平台）\"},\"readingTime\":{\"minutes\":1.24,\"words\":373},\"filePathRelative\":\"zh/series/knowledge/我的项目/邮院通.md\",\"excerpt\":\"<h3>请描述一下你在项目中如何实现用户鉴权？</h3>\\n<p><strong>回答：</strong> 在项目中，我使用了 Spring Security 实现了用户鉴权模块，<br>\\n通过配置 UsernamePasswordAuthenticationFilter 和 JwtAuthenticationFilter 来进行用户身份验证。<br>\\n用户在登录时，通过用户名和密码进行验证，生成 JWT 令牌，返回给客户端，客户端通过 HTTP Header 携带该令牌进行后续的 API 请求，服务器通过 JWT 解析并验证身份。</p>\\n<h3>如何保证Redis缓存与数据库的数据一致性？</h3>\"}")
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
