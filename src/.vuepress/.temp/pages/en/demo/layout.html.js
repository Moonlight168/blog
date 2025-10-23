import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/en/demo/layout.html.vue"
const data = JSON.parse("{\"path\":\"/en/demo/layout.html\",\"title\":\"Layout\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"Layout\",\"icon\":\"object-group\",\"order\":2,\"category\":[\"Guide\"],\"tag\":[\"Layout\"]},\"readingTime\":{\"minutes\":0.35,\"words\":106},\"filePathRelative\":\"en/demo/layout.md\",\"excerpt\":\"<p>The layout contains:</p>\\n<ul>\\n<li><a href=\\\"https://theme-hope.vuejs.press/guide/layout/navbar.html\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">Navbar</a></li>\\n<li><a href=\\\"https://theme-hope.vuejs.press/guide/layout/sidebar.html\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">Sidebar</a></li>\\n<li><a href=\\\"https://theme-hope.vuejs.press/guide/layout/footer.html\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">Footer</a></li>\\n</ul>\"}")
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
