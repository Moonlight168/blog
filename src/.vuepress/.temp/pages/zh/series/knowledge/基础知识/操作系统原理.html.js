import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/基础知识/操作系统原理.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F%E5%8E%9F%E7%90%86.html\",\"title\":\"操作系统原理\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"操作系统原理\",\"series\":\"基础知识\"},\"readingTime\":{\"minutes\":0.04,\"words\":12},\"filePathRelative\":\"zh/series/knowledge/基础知识/操作系统原理.md\",\"excerpt\":\"\"}")
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
