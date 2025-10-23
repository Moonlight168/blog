import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/en/index.html.vue"
const data = JSON.parse("{\"path\":\"/en/\",\"title\":\"Blog Home\",\"lang\":\"en-US\",\"frontmatter\":{\"home\":true,\"layout\":\"Blog\",\"icon\":\"house\",\"title\":\"Blog Home\",\"heroImage\":\"https://theme-hope-assets.vuejs.press/logo.svg\",\"heroText\":\"The name of your blog\",\"tagline\":\"You can put your slogan here\",\"heroFullScreen\":true,\"projects\":[{\"icon\":\"folder-open\",\"name\":\"project name\",\"desc\":\"project detailed description\",\"link\":\"https://your.project.link\"},{\"icon\":\"link\",\"name\":\"link name\",\"desc\":\"link detailed description\",\"link\":\"https://link.address\"},{\"icon\":\"book\",\"name\":\"book name\",\"desc\":\"Detailed description of the book\",\"link\":\"https://link.to.your.book\"},{\"icon\":\"newspaper\",\"name\":\"article name\",\"desc\":\"Detailed description of the article\",\"link\":\"https://link.to.your.article\"},{\"icon\":\"user-group\",\"name\":\"friend name\",\"desc\":\"Detailed description of friend\",\"link\":\"https://link.to.your.friend\"},{\"icon\":\"https://theme-hope-assets.vuejs.press/logo.svg\",\"name\":\"custom item\",\"desc\":\"Detailed description of this custom item\",\"link\":\"https://link.to.your.friend\"}],\"footer\":\"customize your footer text\"},\"readingTime\":{\"minutes\":0.52,\"words\":157},\"filePathRelative\":\"en/README.md\",\"excerpt\":\"<p>This is a blog home page demo.</p>\\n<p>To use this layout, you should set both <code>layout: Blog</code> and <code>home: true</code> in the page front matter.</p>\\n<p>For related configuration docs, please see <a href=\\\"https://theme-hope.vuejs.press/guide/blog/home.html\\\" target=\\\"_blank\\\" rel=\\\"noopener noreferrer\\\">blog homepage</a>.</p>\"}")
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
