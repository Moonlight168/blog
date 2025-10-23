import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/posts/banana/4.html.vue"
const data = JSON.parse("{\"path\":\"/zh/posts/banana/4.html\",\"title\":\"香蕉 4\",\"lang\":\"en-US\",\"frontmatter\":{\"icon\":\"pen-to-square\",\"date\":\"2022-01-08T00:00:00.000Z\",\"category\":[\"香蕉\"],\"tag\":[\"黄\",\"弯曲的\",\"长\"]},\"readingTime\":{\"minutes\":0.12,\"words\":36},\"filePathRelative\":\"zh/posts/banana/4.md\"}")
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
