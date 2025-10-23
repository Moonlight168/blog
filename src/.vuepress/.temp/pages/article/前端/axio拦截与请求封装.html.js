import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/前端/axio拦截与请求封装.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%89%8D%E7%AB%AF/axio%E6%8B%A6%E6%88%AA%E4%B8%8E%E8%AF%B7%E6%B1%82%E5%B0%81%E8%A3%85.html\",\"title\":\"Axios 拦截器与请求封装实战（Vue3 + TypeScript）\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"Axios 拦截器与请求封装实战（Vue3 + TypeScript）\",\"date\":\"2025-06-12T00:00:00.000Z\",\"categories\":[\"前端\"],\"tags\":[\"vue\",\"TS\"]},\"readingTime\":{\"minutes\":2.42,\"words\":726},\"filePathRelative\":\"article/前端/axio拦截与请求封装.md\",\"excerpt\":\"<p>在实际开发中，我们经常会对 <code>axios</code> 进行统一封装，比如：统一设置请求头、添加 token、全局处理响应错误信息等。本文将介绍如何使用 <code>axios</code> 拦截器，配合 TypeScript 进行请求封装，提高代码的可维护性和复用性。</p>\\n<h2>一、为什么需要封装 axios？</h2>\\n<p>在实际开发中，我们通常需要处理以下问题：</p>\\n<ul>\\n<li>每个请求都需要携带 token</li>\\n<li>处理请求失败或权限过期等错误</li>\\n<li>重复的请求配置代码</li>\\n<li>响应数据格式统一解包</li>\\n</ul>\"}")
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
