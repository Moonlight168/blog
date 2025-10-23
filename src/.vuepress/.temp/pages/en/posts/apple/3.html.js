import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/en/posts/apple/3.html.vue"
const data = JSON.parse("{\"path\":\"/en/posts/apple/3.html\",\"title\":\"Apple 3\",\"lang\":\"en-US\",\"frontmatter\":{\"icon\":\"pen-to-square\",\"date\":\"2022-01-03T00:00:00.000Z\",\"category\":[\"Apple\",\"Fruit\"],\"tag\":[\"red\",\"big\",\"round\"]},\"readingTime\":{\"minutes\":0.1,\"words\":29},\"filePathRelative\":\"en/posts/apple/3.md\",\"excerpt\":\"\\n<h2>Heading 2</h2>\\n<p>Here is the content.</p>\\n<h3>Heading 3</h3>\\n<p>Here is the content.</p>\\n\"}")
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
