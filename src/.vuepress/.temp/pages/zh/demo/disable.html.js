import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/demo/disable.html.vue"
const data = JSON.parse("{\"path\":\"/zh/demo/disable.html\",\"title\":\"布局与功能禁用\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"布局与功能禁用\",\"icon\":\"gears\",\"order\":4,\"category\":[\"使用指南\"],\"tag\":[\"禁用\"],\"navbar\":false,\"sidebar\":false,\"breadcrumb\":false,\"pageInfo\":false,\"contributors\":false,\"editLink\":false,\"lastUpdated\":false,\"prev\":false,\"next\":false,\"comment\":false,\"footer\":false,\"backtotop\":false},\"readingTime\":{\"minutes\":0.43,\"words\":128},\"filePathRelative\":\"zh/demo/disable.md\"}")
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
