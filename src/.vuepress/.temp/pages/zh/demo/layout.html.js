import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/demo/layout.html.vue"
const data = JSON.parse("{\"path\":\"/zh/demo/layout.html\",\"title\":\"布局\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"布局\",\"icon\":\"object-group\",\"order\":2,\"category\":[\"指南\"],\"tag\":[\"布局\"]},\"readingTime\":{\"minutes\":0.53,\"words\":159},\"filePathRelative\":\"zh/demo/layout.md\"}")
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
