import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/软件设计/时序图.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E8%BD%AF%E4%BB%B6%E8%AE%BE%E8%AE%A1/%E6%97%B6%E5%BA%8F%E5%9B%BE.html\",\"title\":\"时序图\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"时序图\",\"date\":\"2025-09-15T00:00:00.000Z\",\"categories\":[\"软件设计\"],\"tags\":[\"软件设计\"]},\"readingTime\":{\"minutes\":1.44,\"words\":432},\"filePathRelative\":\"article/软件设计/时序图.md\",\"excerpt\":\"\\n<h2>1. 什么是时序图？</h2>\\n<p>时序图（Sequence Diagram）是 <strong>UML（统一建模语言）</strong> 中的一种交互图，用来描述系统中对象之间的消息传递顺序。它强调 <strong>时间顺序</strong>，展示了对象在特定场景下的交互过程。</p>\\n<h2>2. 时序图的作用</h2>\\n<ul>\\n<li><strong>需求分析阶段</strong>：明确业务流程，帮助开发和测试理解需求。</li>\\n<li><strong>系统设计阶段</strong>：设计模块间的交互逻辑。</li>\\n<li><strong>开发阶段</strong>：作为开发人员编写接口和调用关系的参考。</li>\\n<li><strong>测试阶段</strong>：根据时序图设计测试用例，验证业务流程。</li>\\n</ul>\"}")
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
