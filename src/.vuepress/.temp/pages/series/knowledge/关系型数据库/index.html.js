import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/series/knowledge/关系型数据库/index.html.vue"
const data = JSON.parse("{\"path\":\"/series/knowledge/%E5%85%B3%E7%B3%BB%E5%9E%8B%E6%95%B0%E6%8D%AE%E5%BA%93/\",\"title\":\"\",\"lang\":\"zh-CN\",\"frontmatter\":{\"index\":false,\"dir\":{\"icon\":\"/assets/icon/data.png\",\"text\":\"关系型数据库\",\"order\":2.9}},\"readingTime\":{\"minutes\":0.05,\"words\":14},\"filePathRelative\":\"series/knowledge/关系型数据库/README.md\",\"excerpt\":\"\"}")
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
