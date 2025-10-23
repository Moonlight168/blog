import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/intro.html.vue"
const data = JSON.parse("{\"path\":\"/zh/intro.html\",\"title\":\"介绍页\",\"lang\":\"en-US\",\"frontmatter\":{\"icon\":\"circle-info\",\"cover\":\"/assets/images/cover3.jpg\"},\"readingTime\":{\"minutes\":0.08,\"words\":23},\"filePathRelative\":\"zh/intro.md\",\"excerpt\":\"\\n<p>将你的个人介绍和档案放置在此处。</p>\\n\"}")
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
