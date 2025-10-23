import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/series/myprojects/FlowMind/ElderFlow.html.vue"
const data = JSON.parse("{\"path\":\"/series/myprojects/FlowMind/ElderFlow.html\",\"title\":\"🚀 ElderFlow 企业级项目开发流程\",\"lang\":\"zh-CN\",\"frontmatter\":{},\"readingTime\":{\"minutes\":3.99,\"words\":1197},\"filePathRelative\":\"series/myprojects/FlowMind/ElderFlow.md\",\"excerpt\":\"\\n<h2>1. 项目立项阶段</h2>\\n<p><strong>目标</strong>：明确项目愿景、范围、预算、团队架构</p>\\n<ul>\\n<li>\\n<p><strong>愿景</strong>：构建面向养老机构的智慧照护平台，支持护理计划、医疗记录、任务工作流、紧急响应与家属沟通。</p>\\n</li>\\n<li>\\n<p><strong>范围</strong>：覆盖住户档案、护理计划、任务排班、医嘱执行、工作流审批、通知与报表。</p>\\n</li>\\n<li>\\n<p><strong>预算 &amp; 时间</strong>：定义 MVP（最小可用版本，6–8 个月上线），完整企业版（12–18 个月）。</p>\\n</li>\\n<li>\\n<p><strong>团队角色</strong>：</p>\\n<ul>\\n<li>产品经理</li>\\n<li>架构师</li>\\n<li>后端开发（Java/Spring Cloud）</li>\\n<li>前端开发（Vue3/Element Plus）</li>\\n<li>测试工程师</li>\\n<li>DevOps</li>\\n<li>UI/UX</li>\\n<li>医疗/护理业务顾问</li>\\n</ul>\\n</li>\\n</ul>\"}")
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
