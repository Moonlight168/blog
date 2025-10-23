import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/en/demo/encrypt.html.vue"
const data = JSON.parse("{\"path\":\"/en/demo/encrypt.html\",\"title\":\"Encryption Article\",\"lang\":\"en-US\",\"frontmatter\":{\"icon\":\"lock\",\"category\":[\"Guide\"],\"tag\":[\"encryption\"],\"feed\":false,\"seo\":false},\"readingTime\":{\"minutes\":0.3,\"words\":90},\"filePathRelative\":\"en/demo/encrypt.md\"}")
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
