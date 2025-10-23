import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/bug/springsecurity配置了通过登陆接口仍然403.html.vue"
const data = JSON.parse("{\"path\":\"/article/bug/springsecurity%E9%85%8D%E7%BD%AE%E4%BA%86%E9%80%9A%E8%BF%87%E7%99%BB%E9%99%86%E6%8E%A5%E5%8F%A3%E4%BB%8D%E7%84%B6403.html\",\"title\":\"Spring Security 配置了登录接口仍然返回 403 的问题排查\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"Spring Security 配置了登录接口仍然返回 403 的问题排查\",\"date\":\"2025-06-09T00:00:00.000Z\",\"categories\":[\"BUG\"],\"tags\":[\"Spring\"]},\"readingTime\":{\"minutes\":2.27,\"words\":682},\"filePathRelative\":\"article/bug/springsecurity配置了通过登陆接口仍然403.md\",\"excerpt\":\"<h2>一、问题描述</h2>\\n<p>在使用 Spring Security 进行权限控制时，即便已配置放行登录接口，如 <code>/student/login</code>，访问时仍然返回 <strong>403 Forbidden</strong> 错误。</p>\\n<p><br>\\n</p>\\n<p>这使得前端无法完成用户登录流程，严重影响开发进度。</p>\\n<h2>二、原因分析</h2>\\n<p>通过排查，最终发现 <strong>不是权限配置的问题</strong>，而是因为：</p>\\n<ul>\\n<li>启动类所在模块未正确扫描到包含 <code>@RestController</code> 的模块；</li>\\n<li>导致 <code>Controller</code> 未被加载进 Spring 容器，自然也无法响应请求；</li>\\n<li>Spring Security 拦截未识别请求路径，默认返回 403。</li>\\n</ul>\"}")
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
