import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/posts/cherry.html.vue"
const data = JSON.parse("{\"path\":\"/zh/posts/cherry.html\",\"title\":\"樱桃\",\"lang\":\"en-US\",\"frontmatter\":{\"icon\":\"pen-to-square\",\"date\":\"2022-01-09T00:00:00.000Z\",\"category\":[\"樱桃\"],\"tag\":[\"红\",\"小\",\"圆\"]},\"readingTime\":{\"minutes\":0.11,\"words\":33},\"filePathRelative\":\"zh/posts/cherry.md\"}")
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
