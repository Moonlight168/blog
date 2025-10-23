import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/开发工具/如何使用git拉取远程仓库最新文件与本地仓库的文件对比合并.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8git%E6%8B%89%E5%8F%96%E8%BF%9C%E7%A8%8B%E4%BB%93%E5%BA%93%E6%9C%80%E6%96%B0%E6%96%87%E4%BB%B6%E4%B8%8E%E6%9C%AC%E5%9C%B0%E4%BB%93%E5%BA%93%E7%9A%84%E6%96%87%E4%BB%B6%E5%AF%B9%E6%AF%94%E5%90%88%E5%B9%B6.html\",\"title\":\"使用 Git 拉取远程仓库并与本地文件对比合并\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"使用 Git 拉取远程仓库并与本地文件对比合并\",\"date\":\"2025-06-09T00:00:00.000Z\",\"categories\":[\"开发工具\"],\"tags\":[\"Git\"]},\"readingTime\":{\"minutes\":2.12,\"words\":635},\"filePathRelative\":\"article/开发工具/如何使用git拉取远程仓库最新文件与本地仓库的文件对比合并.md\",\"excerpt\":\"\\n<h2>一、前言</h2>\\n<p>在团队协作或本地代码落后于远程仓库时，我们需要将远程仓库的变更同步到本地，并与当前代码进行对比和合并，避免丢失本地修改。本文将通过命令行方式，说明从查看远程仓库到合并的完整流程。</p>\\n<h2>二、查看远程仓库信息</h2>\\n<p>使用以下命令查看远程仓库的别名（默认一般为 <code>origin</code>）及对应 URL：</p>\\n<div class=\\\"language-bash line-numbers-mode\\\" data-highlighter=\\\"shiki\\\" data-ext=\\\"bash\\\" style=\\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\\"><pre class=\\\"shiki shiki-themes one-light one-dark-pro vp-code\\\"><code class=\\\"language-bash\\\"><span class=\\\"line\\\"><span style=\\\"--shiki-light:#4078F2;--shiki-dark:#61AFEF\\\">git</span><span style=\\\"--shiki-light:#50A14F;--shiki-dark:#98C379\\\"> remote</span><span style=\\\"--shiki-light:#986801;--shiki-dark:#D19A66\\\"> -v</span></span></code></pre>\\n<div class=\\\"line-numbers\\\" aria-hidden=\\\"true\\\" style=\\\"counter-reset:line-number 0\\\"><div class=\\\"line-number\\\"></div></div></div>\"}")
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
