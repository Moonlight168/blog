import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/bug/虚拟机无法启动.html.vue"
const data = JSON.parse("{\"path\":\"/article/bug/%E8%99%9A%E6%8B%9F%E6%9C%BA%E6%97%A0%E6%B3%95%E5%90%AF%E5%8A%A8.html\",\"title\":\"虚拟机开机报错：/dev/mapper/rhel-root does not exist\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"虚拟机开机报错：/dev/mapper/rhel-root does not exist\",\"date\":\"2025-06-09T00:00:00.000Z\",\"categories\":[\"BUG\"],\"tags\":[\"Linux\"]},\"readingTime\":{\"minutes\":2.36,\"words\":709},\"filePathRelative\":\"article/bug/虚拟机无法启动.md\",\"excerpt\":\"<h2>一、问题描述</h2>\\n<p>在启动 CentOS 虚拟机时，系统报错：</p>\\n<div class=\\\"language- line-numbers-mode\\\" data-highlighter=\\\"shiki\\\" data-ext=\\\"\\\" style=\\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\\"><pre class=\\\"shiki shiki-themes one-light one-dark-pro vp-code\\\"><code class=\\\"language-\\\"><span class=\\\"line\\\"><span></span></span>\\n<span class=\\\"line\\\"><span>/dev/mapper/rhel-root does not exist</span></span></code></pre>\\n<div class=\\\"line-numbers\\\" aria-hidden=\\\"true\\\" style=\\\"counter-reset:line-number 0\\\"><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div></div></div>\"}")
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
