import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/demo/index.html.vue"
const data = JSON.parse("{\"path\":\"/zh/demo/\",\"title\":\"主要功能与配置演示\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"主要功能与配置演示\",\"index\":false,\"icon\":\"laptop-code\",\"category\":[\"使用指南\"]},\"readingTime\":{\"minutes\":0.07,\"words\":22},\"filePathRelative\":\"zh/demo/README.md\"}")
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
