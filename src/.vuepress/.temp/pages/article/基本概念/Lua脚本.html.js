import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/基本概念/Lua脚本.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5/Lua%E8%84%9A%E6%9C%AC.html\",\"title\":\"Lua脚本\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"Lua脚本\",\"date\":\"2025-10-19T00:00:00.000Z\",\"series\":\"基本概念\",\"tags\":[\"多线程\"]},\"readingTime\":{\"minutes\":3.05,\"words\":915},\"filePathRelative\":\"article/基本概念/Lua脚本.md\",\"excerpt\":\"<h2>一、什么是 Lua 脚本</h2>\\n<p>Lua 是一种轻量级的脚本语言。Redis 从 2.6 版本开始内置了对 Lua 的支持，允许我们把一段逻辑写成 Lua 脚本，一次性提交给 Redis 服务器执行。</p>\\n<h2>二、Lua 脚本的作用</h2>\\n<p>Lua 脚本在 Redis 中的主要作用是 <strong>将多条命令封装为一个原子操作执行</strong>。这意味着脚本中的所有 Redis 命令会在一次执行中完成，不会被其他客户端的命令打断，从而保证数据操作的一致性和完整性。</p>\\n<p>它常用于以下场景：</p>\\n<ol>\\n<li><strong>原子操作</strong>：在高并发环境下确保关键业务逻辑不被其他请求干扰，比如秒杀、库存扣减。</li>\\n<li><strong>减少网络开销</strong>：客户端只需一次请求即可完成多条命令执行。</li>\\n<li><strong>逻辑复用</strong>：在 Redis 端处理逻辑，减少客户端逻辑复杂度。</li>\\n<li><strong>性能提升</strong>：执行脚本的效率通常高于多条命令连续执行。</li>\\n</ol>\"}")
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
