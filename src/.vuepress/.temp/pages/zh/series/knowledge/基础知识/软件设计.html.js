import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/基础知识/软件设计.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86/%E8%BD%AF%E4%BB%B6%E8%AE%BE%E8%AE%A1.html\",\"title\":\"软件设计\",\"lang\":\"en-US\",\"frontmatter\":{\"series\":\"基础知识\",\"title\":\"软件设计\"},\"readingTime\":{\"minutes\":0.03,\"words\":10},\"filePathRelative\":\"zh/series/knowledge/基础知识/软件设计.md\",\"excerpt\":\"\"}")
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
