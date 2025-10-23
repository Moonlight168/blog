import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/posts/banana/1.html.vue"
const data = JSON.parse("{\"path\":\"/zh/posts/banana/1.html\",\"title\":\"香蕉 1\",\"lang\":\"en-US\",\"frontmatter\":{\"icon\":\"pen-to-square\",\"date\":\"2022-01-05T00:00:00.000Z\",\"category\":[\"香蕉\",\"水果\"],\"tag\":[\"黄\",\"弯曲的\",\"长\"]},\"readingTime\":{\"minutes\":0.13,\"words\":38},\"filePathRelative\":\"zh/posts/banana/1.md\"}")
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
