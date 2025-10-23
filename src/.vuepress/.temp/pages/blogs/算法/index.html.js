import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/blogs/算法/index.html.vue"
const data = JSON.parse("{\"path\":\"/blogs/%E7%AE%97%E6%B3%95/\",\"title\":\"\",\"lang\":\"zh-CN\",\"frontmatter\":{\"index\":false,\"dir\":{\"icon\":\"/assets/icon/算法与设计.png\",\"text\":\"算法设计\",\"order\":7}},\"readingTime\":{\"minutes\":0.06,\"words\":18},\"filePathRelative\":\"blogs/算法/README.md\",\"excerpt\":\"\"}")
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
