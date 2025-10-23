import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/about/intro.html.vue"
const data = JSON.parse("{\"path\":\"/about/intro.html\",\"title\":\"关于我\",\"lang\":\"zh-CN\",\"frontmatter\":{\"icon\":\"circle-info\",\"cover\":\"/assets/images/cover3.jpg\",\"title\":\"关于我\",\"date\":\"2025-05-17T00:00:00.000Z\",\"sidebar\":false},\"readingTime\":{\"minutes\":2.29,\"words\":687},\"filePathRelative\":\"about/intro.md\",\"excerpt\":\"\\n<h2>🌟个人优势</h2>\\n<ul>\\n<li>具备扎实的 Java 基础与项目实践经验，参与多个后端模块独立开发与接口联调，理解常见业务流程与接口设计规范</li>\\n<li>熟悉常用 Java 开发工具链及主流后端技术栈，能完成基础缓存优化、权限认证与接口调试等常规任务</li>\\n<li>拥有前后端协作经验，了解 Vue3 + TypeScript，可独立完成前端调试与联调任务</li>\\n<li>掌握 Git、Maven、Docker 等常用工具，能在 Linux 环境下进行部署与调试</li>\\n<li>积极拥抱新技术，具备良好的自我驱动和学习能力，能够快速融入团队，适应项目节奏</li>\\n</ul>\"}")
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
