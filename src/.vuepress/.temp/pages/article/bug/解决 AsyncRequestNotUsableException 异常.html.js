import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/bug/解决 AsyncRequestNotUsableException 异常.html.vue"
const data = JSON.parse("{\"path\":\"/article/bug/%E8%A7%A3%E5%86%B3%20AsyncRequestNotUsableException%20%E5%BC%82%E5%B8%B8.html\",\"title\":\"解决 AsyncRequestNotUsableException 异常\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"解决 AsyncRequestNotUsableException 异常\",\"date\":\"2025-09-24T00:00:00.000Z\",\"categories\":[\"BUG\"]},\"readingTime\":{\"minutes\":1.33,\"words\":398},\"filePathRelative\":\"article/bug/解决 AsyncRequestNotUsableException 异常.md\",\"excerpt\":\"<h3>1️⃣ 现象</h3>\\n<p>你在日志里看到的异常：</p>\\n<div class=\\\"language- line-numbers-mode\\\" data-highlighter=\\\"shiki\\\" data-ext=\\\"\\\" style=\\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\\"><pre class=\\\"shiki shiki-themes one-light one-dark-pro vp-code\\\"><code class=\\\"language-\\\"><span class=\\\"line\\\"><span>AsyncRequestNotUsableException: ServletOutputStream failed to flush</span></span>\\n<span class=\\\"line\\\"><span>IllegalStateException: A non-container thread attempted to use the AsyncContext</span></span></code></pre>\\n<div class=\\\"line-numbers\\\" aria-hidden=\\\"true\\\" style=\\\"counter-reset:line-number 0\\\"><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div></div></div>\"}")
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
