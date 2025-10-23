import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/en/demo/markdown.html.vue"
const data = JSON.parse("{\"path\":\"/en/demo/markdown.html\",\"title\":\"Markdown Enhance\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"Markdown Enhance\",\"icon\":\"fa6-brands:markdown\",\"order\":2,\"category\":[\"Guide\"],\"tag\":[\"Markdown\"],\"gitInclude\":[\"README.md\"]},\"readingTime\":{\"minutes\":2.33,\"words\":699},\"filePathRelative\":\"en/demo/markdown.md\",\"excerpt\":\"<p>VuePress basically generate pages from Markdown files. So you can use it to generate documentation or blog sites easily.</p>\\n<p>You should create and write Markdown files, so that VuePress can convert them to different pages according to file structure.</p>\\n\"}")
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
