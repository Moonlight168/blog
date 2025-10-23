import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/基础知识/计算机网络.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C.html\",\"title\":\"计算机网络\",\"lang\":\"en-US\",\"frontmatter\":{\"series\":\"基础知识\",\"title\":\"计算机网络\"},\"readingTime\":{\"minutes\":8.26,\"words\":2478},\"filePathRelative\":\"zh/series/knowledge/基础知识/计算机网络.md\",\"excerpt\":\"<h2>什么是TCP的三次握手和四次挥手？</h2>\\n<p><strong>回答：</strong></p>\\n<h3><strong>一、TCP三次握手（建立连接）</strong></h3>\\n<p>TCP（传输控制协议）是面向连接的协议，三次握手用于确保通信双方的发送和接收能力正常，流程如下：</p>\\n<h4><strong>1. 握手过程图示</strong></h4>\\n<div class=\\\"language-plaintext line-numbers-mode\\\" data-highlighter=\\\"shiki\\\" data-ext=\\\"plaintext\\\" style=\\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\\"><pre class=\\\"shiki shiki-themes one-light one-dark-pro vp-code\\\"><code class=\\\"language-plaintext\\\"><span class=\\\"line\\\"><span>客户端                          服务器  </span></span>\\n<span class=\\\"line\\\"><span>  │                                │  </span></span>\\n<span class=\\\"line\\\"><span>  ├───────── SYN=1, seq=x ─────────►│  （客户端发送同步请求，初始化序列号x）  </span></span>\\n<span class=\\\"line\\\"><span>  │                                │  </span></span>\\n<span class=\\\"line\\\"><span>  │  ◄───────── SYN=1, ACK=x+1, seq=y ──────┤  （服务器确认请求，发送同步+确认，初始化序列号y）  </span></span>\\n<span class=\\\"line\\\"><span>  │                                │  </span></span>\\n<span class=\\\"line\\\"><span>  ├───────── ACK=y+1 ────────────►│  （客户端确认服务器的确认，连接建立完成）  </span></span>\\n<span class=\\\"line\\\"><span>  │                                │</span></span></code></pre>\\n<div class=\\\"line-numbers\\\" aria-hidden=\\\"true\\\" style=\\\"counter-reset:line-number 0\\\"><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div></div></div>\"}")
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
