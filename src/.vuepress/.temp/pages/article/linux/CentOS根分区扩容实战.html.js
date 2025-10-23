import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/linux/CentOS根分区扩容实战.html.vue"
const data = JSON.parse("{\"path\":\"/article/linux/CentOS%E6%A0%B9%E5%88%86%E5%8C%BA%E6%89%A9%E5%AE%B9%E5%AE%9E%E6%88%98.html\",\"title\":\"CentOS/RHEL 根分区扩容实战：从 22G 扩展到 78G\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"CentOS/RHEL 根分区扩容实战：从 22G 扩展到 78G\",\"date\":\"2025-09-24T00:00:00.000Z\",\"categories\":[\"Linux\"]},\"readingTime\":{\"minutes\":2.26,\"words\":678},\"filePathRelative\":\"article/linux/CentOS根分区扩容实战.md\",\"excerpt\":\"<p>在日常使用 Linux 虚拟机时，经常会遇到这样的问题：虚拟机磁盘分配了几十个 G，但实际根分区 <code>/</code> 却只有十几 G，用不了多久就满了，导致 Docker、Elasticsearch 等服务无法正常运行。</p>\\n<p>这篇文章记录了我在一台 <strong>RHEL/CentOS 7</strong> 系统上，将根分区 <code>/</code> 从 <strong>22G 扩展到 78G</strong> 的完整过程。</p>\\n<h2>一、问题背景</h2>\\n<p>执行 <code>df -h</code>，发现 <code>/</code> 分区已经 100% 用满：</p>\"}")
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
