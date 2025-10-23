import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/开发工具/idea.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7/idea.html\",\"title\":\"IDEA中常用的快捷键\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"IDEA中常用的快捷键\",\"date\":\"2025-05-22T00:00:00.000Z\",\"categories\":[\"开发工具\"],\"tags\":[\"IDEA\"]},\"readingTime\":{\"minutes\":1.07,\"words\":321},\"filePathRelative\":\"article/开发工具/idea.md\",\"excerpt\":\"<p><strong>ctrl+f12:</strong> 查看该类的所有方法</p>\\n<p><strong>ALT+7：</strong> 打开“Structure”面板，展示类的结构，包括字段、方法及继承关系。</p>\\n<p><strong>CTRL+O：</strong> 调出可重写父类方法列表，便于快速实现方法重写。</p>\\n<p><strong>Ctrl+Shift+R：</strong> 全局替换</p>\\n<p><strong>Ctrl+F12</strong>：查看当前文件的结构，会在一个弹出窗口中列出当前文件中的类、方法、变量等，可通过该窗口快速浏览和定位方法。</p>\\n<p><strong>Ctrl+E</strong>：查看最近打开的文件列表，若之前打开过包含目标方法的文件，可通过此快捷键快速切换到该文件，进而浏览方法。</p>\"}")
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
