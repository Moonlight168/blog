import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/en/posts/banana/4.html.vue"
const data = JSON.parse("{\"path\":\"/en/posts/banana/4.html\",\"title\":\"Banana 4\",\"lang\":\"en-US\",\"frontmatter\":{\"icon\":\"pen-to-square\",\"date\":\"2022-01-08T00:00:00.000Z\",\"category\":[\"Banana\"],\"tag\":[\"yellow\",\"curly\",\"long\"]},\"readingTime\":{\"minutes\":0.09,\"words\":28},\"filePathRelative\":\"en/posts/banana/4.md\",\"excerpt\":\"\\n<h2>Heading 2</h2>\\n<p>Here is the content.</p>\\n<h3>Heading 3</h3>\\n<p>Here is the content.</p>\\n\"}")
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
