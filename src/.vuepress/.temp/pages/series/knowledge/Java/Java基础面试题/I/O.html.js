import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/series/knowledge/Java/Java基础面试题/I/O.html.vue"
const data = JSON.parse("{\"path\":\"/series/knowledge/Java/Java%E5%9F%BA%E7%A1%80%E9%9D%A2%E8%AF%95%E9%A2%98/I/O.html\",\"title\":\"I/O\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":9.29,\"words\":2788},\"filePathRelative\":\"series/knowledge/Java/Java基础面试题/I/O.md\",\"excerpt\":\"\\n<h2>Java怎么实现网络IO高并发编程？</h2>\\n<p>Java实现网络IO高并发的核心是使用<strong>Java NIO</strong>（Non-Blocking IO），它是一种同步非阻塞的IO模型，基于I/O多路复用技术，可通过单个线程处理多个客户端连接，解决传统BIO（Blocking IO）多线程开销大的问题。</p>\\n<h3>1. 传统BIO的缺陷（不适合高并发）</h3>\\n<p>BIO采用\\\"一个连接一个线程\\\"的模型：客户端发起连接后，服务端需创建一个线程专门处理该连接的IO操作（如<code>socket.read()</code>）。若连接未发送数据，线程会阻塞在<code>read()</code>方法上，导致线程资源浪费。当客户端数量达到数千甚至数万时，线程数量暴增，会耗尽CPU和内存资源，导致系统性能急剧下降。</p>\"}")
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
