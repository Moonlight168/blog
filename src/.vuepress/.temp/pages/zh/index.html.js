import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/index.html.vue"
const data = JSON.parse("{\"path\":\"/zh/\",\"title\":\"主页 | GGBOND\",\"lang\":\"en-US\",\"frontmatter\":{\"home\":true,\"layout\":\"Blog\",\"icon\":\"house\",\"title\":\"主页 | GGBOND\",\"heroImage\":\"assets/logo/logo.png\",\"bgImage\":\"assets/bg/bg-light.jpg\",\"bgImageDark\":\"assets/bg/bg-dark.jpg\",\"heroText\":\"Hi，Welcome~\",\"heroFullScreen\":true,\"tagline\":\"热爱编码与技术探索,记录实践项目与开发心得,分享高效工具与 AI 编程技巧\",\"footer\":{\"startYear\":2025,\"record\":null,\"cyberSecurityRecord\":null}},\"readingTime\":{\"minutes\":0.59,\"words\":176},\"filePathRelative\":\"zh/README.md\",\"excerpt\":\"<p>这是一个博客主页的案例。</p>\\n<p>要使用此布局，你应该在页面前端设置 <code>layout: Blog</code> 和 <code>home: true</code>。</p>\\n<p>相关配置文档请见 <a href=\\\"https://theme-hope.vuejs.press/zh/guide/blog/home.html\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">博客主页</a>。</p>\\n\"}")
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
