import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/数据库/SQL 中的 CTE 与 CASE WHEN.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E6%95%B0%E6%8D%AE%E5%BA%93/SQL%20%E4%B8%AD%E7%9A%84%20CTE%20%E4%B8%8E%20CASE%20WHEN.html\",\"title\":\"SQL 中的 CTE 与 CASE WHEN\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"SQL 中的 CTE 与 CASE WHEN\",\"date\":\"2025-05-27T00:00:00.000Z\",\"categories\":[\"数据库\"],\"tags\":[\"MYSQL\"]},\"readingTime\":{\"minutes\":3.91,\"words\":1173},\"filePathRelative\":\"article/数据库/SQL 中的 CTE 与 CASE WHEN.md\",\"excerpt\":\"\\n<h2>CTE（Common Table Expression:公共表表达式）</h2>\\n<h3>概念</h3>\\n<p>CTE是一种临时命名的查询结果集，它允许我们在一个查询语句中多次引用。CTE在查询语句中定义，仅在该查询语句执行期间存在，就像是一个临时搭建的“舞台”，专门为当前查询服务。CTE通常用于简化复杂的查询，将一个大的查询逻辑拆分成多个小的、可管理的部分，从而提高查询的可读性和可维护性。</p>\\n<h3>语法结构</h3>\\n<div class=\\\"language-sql line-numbers-mode\\\" data-highlighter=\\\"shiki\\\" data-ext=\\\"sql\\\" style=\\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\\"><pre class=\\\"shiki shiki-themes one-light one-dark-pro vp-code\\\"><code class=\\\"language-sql\\\"><span class=\\\"line\\\"><span style=\\\"--shiki-light:#A626A4;--shiki-dark:#C678DD\\\">WITH</span><span style=\\\"--shiki-light:#383A42;--shiki-dark:#ABB2BF\\\"> cte_name </span><span style=\\\"--shiki-light:#A626A4;--shiki-dark:#C678DD\\\">AS</span><span style=\\\"--shiki-light:#383A42;--shiki-dark:#ABB2BF\\\"> (</span></span>\\n<span class=\\\"line\\\"><span style=\\\"--shiki-light:#A626A4;--shiki-dark:#C678DD\\\">    SELECT</span><span style=\\\"--shiki-light:#383A42;--shiki-dark:#ABB2BF\\\"> ...  </span><span style=\\\"--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic\\\">-- CTE的查询逻辑，定义这个临时结果集的内容</span></span>\\n<span class=\\\"line\\\"><span style=\\\"--shiki-light:#383A42;--shiki-dark:#ABB2BF\\\">)</span></span>\\n<span class=\\\"line\\\"><span style=\\\"--shiki-light:#A626A4;--shiki-dark:#C678DD\\\">SELECT</span><span style=\\\"--shiki-light:#383A42;--shiki-dark:#ABB2BF\\\"> ... </span><span style=\\\"--shiki-light:#A626A4;--shiki-dark:#C678DD\\\">FROM</span><span style=\\\"--shiki-light:#383A42;--shiki-dark:#ABB2BF\\\"> cte_name;  </span><span style=\\\"--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic\\\">-- 在主查询中使用CTE，就像使用一个普通的表一样</span></span></code></pre>\\n<div class=\\\"line-numbers\\\" aria-hidden=\\\"true\\\" style=\\\"counter-reset:line-number 0\\\"><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div></div></div>\"}")
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
