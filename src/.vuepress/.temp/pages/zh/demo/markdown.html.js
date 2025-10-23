import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/demo/markdown.html.vue"
const data = JSON.parse("{\"path\":\"/zh/demo/markdown.html\",\"title\":\"Markdown 展示\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"Markdown 展示\",\"icon\":\"fa6-brands:markdown\",\"order\":2,\"category\":[\"使用指南\"],\"tag\":[\"Markdown\"],\"gitInclude\":[\"README.md\"]},\"readingTime\":{\"minutes\":3.13,\"words\":938},\"filePathRelative\":\"zh/demo/markdown.md\"}")
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
