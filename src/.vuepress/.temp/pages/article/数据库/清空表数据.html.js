import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/数据库/清空表数据.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E6%95%B0%E6%8D%AE%E5%BA%93/%E6%B8%85%E7%A9%BA%E8%A1%A8%E6%95%B0%E6%8D%AE.html\",\"title\":\"清空表数据\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"清空表数据\",\"date\":\"2025-06-13T00:00:00.000Z\",\"categories\":[\"数据库\"],\"tags\":[\"MYSQL\"]},\"readingTime\":{\"minutes\":1.78,\"words\":535},\"filePathRelative\":\"article/数据库/清空表数据.md\",\"excerpt\":\"<p>在 SQL 中，清空表数据有两种主要方式：<code>TRUNCATE TABLE</code> 和 <code>DELETE FROM</code>。它们的功能和适用场景有所不同，下面为你详细介绍：</p>\\n<h3>一、使用 <code>TRUNCATE TABLE</code>（推荐快速清空）</h3>\\n<p><strong>语法</strong>：</p>\\n<div class=\\\"language-sql line-numbers-mode\\\" data-highlighter=\\\"shiki\\\" data-ext=\\\"sql\\\" style=\\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\\"><pre class=\\\"shiki shiki-themes one-light one-dark-pro vp-code\\\"><code class=\\\"language-sql\\\"><span class=\\\"line\\\"><span style=\\\"--shiki-light:#A626A4;--shiki-dark:#C678DD\\\">TRUNCATE</span><span style=\\\"--shiki-light:#A626A4;--shiki-dark:#C678DD\\\"> TABLE</span><span style=\\\"--shiki-light:#383A42;--shiki-dark:#ABB2BF\\\"> table_name;</span></span></code></pre>\\n<div class=\\\"line-numbers\\\" aria-hidden=\\\"true\\\" style=\\\"counter-reset:line-number 0\\\"><div class=\\\"line-number\\\"></div></div></div>\"}")
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
