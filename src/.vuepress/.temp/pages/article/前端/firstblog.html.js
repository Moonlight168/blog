import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/前端/firstblog.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%89%8D%E7%AB%AF/firstblog.html\",\"title\":\"我的第一篇博客-搭建个人博客网站\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"我的第一篇博客-搭建个人博客网站\",\"date\":\"2025-05-17T00:00:00.000Z\",\"categories\":[\"前端\"],\"tags\":[\"vue\",\"vuepress-theme-reco\"]},\"readingTime\":{\"minutes\":1.37,\"words\":411},\"filePathRelative\":\"article/前端/firstblog.md\",\"excerpt\":\"<h2>✅ 一、基础环境准备</h2>\\n<h3>1. 安装 Node.js 和 npm</h3>\\n<p>前往官网下载 <a href=\\\"https://nodejs.org/zh-cn/\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">Node.js LTS 版本</a>，安装后终端执行：</p>\\n<div class=\\\"language-bash line-numbers-mode\\\" data-highlighter=\\\"shiki\\\" data-ext=\\\"bash\\\" style=\\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\\"><pre class=\\\"shiki shiki-themes one-light one-dark-pro vp-code\\\"><code class=\\\"language-bash\\\"><span class=\\\"line\\\"><span style=\\\"--shiki-light:#4078F2;--shiki-dark:#61AFEF\\\">node</span><span style=\\\"--shiki-light:#986801;--shiki-dark:#D19A66\\\"> -v</span></span>\\n<span class=\\\"line\\\"><span style=\\\"--shiki-light:#4078F2;--shiki-dark:#61AFEF\\\">npm</span><span style=\\\"--shiki-light:#986801;--shiki-dark:#D19A66\\\"> -v</span></span></code></pre>\\n<div class=\\\"line-numbers\\\" aria-hidden=\\\"true\\\" style=\\\"counter-reset:line-number 0\\\"><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div></div></div>\"}")
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
