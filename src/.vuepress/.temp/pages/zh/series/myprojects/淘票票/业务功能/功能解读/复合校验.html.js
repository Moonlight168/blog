import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/业务功能/功能解读/复合校验.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E4%B8%9A%E5%8A%A1%E5%8A%9F%E8%83%BD/%E5%8A%9F%E8%83%BD%E8%A7%A3%E8%AF%BB/%E5%A4%8D%E5%90%88%E6%A0%A1%E9%AA%8C.html\",\"title\":\"2.淘票票项目复合校验实现详解\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":6.38,\"words\":1913},\"filePathRelative\":\"zh/series/myprojects/淘票票/业务功能/功能解读/复合校验.md\",\"excerpt\":\"\\n<h2>1. 核心概念</h2>\\n<p><strong>复合校验（Composite Validation）</strong> 是一种结合了 <strong>组合模式（Composite Pattern）</strong> 和 <strong>责任链模式（Chain of Responsibility Pattern）</strong> 思想的设计方式。<br>\\n它通过 <strong>树形结构</strong> 组织多个校验组件，并以 <strong>层次化 + 顺序化</strong> 的方式执行，使得复杂的业务校验逻辑得以高内聚、低耦合地管理和扩展。</p>\\n<p>📌 简单来说：</p>\"}")
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
