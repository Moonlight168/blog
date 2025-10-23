import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/index.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/\",\"title\":\"面试大全\",\"lang\":\"en-US\",\"frontmatter\":{\"series\":\"knowledge\",\"title\":\"面试大全\"},\"readingTime\":{\"minutes\":1.04,\"words\":311},\"filePathRelative\":\"zh/series/knowledge/index.md\",\"excerpt\":\"\\n<p>这里收录了我在技术学习、工具使用和职业发展中的系统总结与实战经验，内容覆盖后端开发、前端技术、系统原理等多个方向。<br>\\n你可以通过左侧导航快速访问各个知识分类，或点击下方链接跳转到详细模块。</p>\\n<h2>🧠 知识体系概览</h2>\\n<h3>🐧 Linux 与操作系统</h3>\\n<ul>\\n<li>Linux 常用命令与实战技巧</li>\\n<li>操作系统原理（进程线程、内存管理、IO模型等）</li>\\n</ul>\\n<h3>☕ Java 核心</h3>\\n<ul>\\n<li>Java 基础语法与进阶特性</li>\\n<li>集合源码分析与应用场景</li>\\n<li><a href=\\\"/blog/java/multithreading.html\\\" target=\\\"_blank\\\">多线程与并发编程（线程池、锁机制、JMM等)</a></li>\\n<li>JVM 内部机制（GC、类加载、内存模型）</li>\\n<li>Spring 全家桶（Spring、SpringMVC、SpringBoot）</li>\\n<li>微服务架构（SpringCloud、Nacos、Gateway、Feign）</li>\\n<li>项目实战与高并发处理（缓存、消息队列、分布式事务）</li>\\n</ul>\"}")
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
