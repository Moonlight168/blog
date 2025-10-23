import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/posts/strawberry.html.vue"
const data = JSON.parse("{\"path\":\"/zh/posts/strawberry.html\",\"title\":\"草莓\",\"lang\":\"en-US\",\"frontmatter\":{\"icon\":\"pen-to-square\",\"date\":\"2022-01-11T00:00:00.000Z\",\"category\":[\"水果\",\"草莓\"],\"tag\":[\"红\",\"小\"]},\"readingTime\":{\"minutes\":0.11,\"words\":34},\"filePathRelative\":\"zh/posts/strawberry.md\"}")
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
