import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/en/demo/disable.html.vue"
const data = JSON.parse("{\"path\":\"/en/demo/disable.html\",\"title\":\"Disabling layout and features\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"Disabling layout and features\",\"icon\":\"gears\",\"order\":4,\"category\":[\"Guide\"],\"tag\":[\"disable\"],\"navbar\":false,\"sidebar\":false,\"breadcrumb\":false,\"pageInfo\":false,\"contributors\":false,\"editLink\":false,\"lastUpdated\":false,\"prev\":false,\"next\":false,\"comment\":false,\"footer\":false,\"backtotop\":false},\"readingTime\":{\"minutes\":0.28,\"words\":83},\"filePathRelative\":\"en/demo/disable.md\",\"excerpt\":\"<p>You can disable some function and layout on the page by setting the Frontmatter of the page.</p>\\n\"}")
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
