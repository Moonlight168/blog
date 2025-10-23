import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/核心技术/分布式锁/Redisson框架设计与实现.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF/%E5%88%86%E5%B8%83%E5%BC%8F%E9%94%81/Redisson%E6%A1%86%E6%9E%B6%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%AE%9E%E7%8E%B0.html\",\"title\":\"淘票票Redisson框架设计与实现详解\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":5.9,\"words\":1771},\"filePathRelative\":\"zh/series/myprojects/淘票票/核心技术/分布式锁/Redisson框架设计与实现.md\",\"excerpt\":\"\\n<p>在淘票票高并发系统中，Redisson框架扮演着至关重要的角色。该框架基于Redisson客户端封装了分布式锁、防重复执行、布隆过滤器等多个核心组件，为系统提供了高可用、高性能的分布式协调能力。</p>\\n<h2>一、模块结构概览</h2>\\n<p>淘票票Redisson框架采用模块化设计，主要包括以下几个子模块：</p>\\n<div class=\\\"language- line-numbers-mode\\\" data-highlighter=\\\"shiki\\\" data-ext=\\\"\\\" style=\\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\\"><pre class=\\\"shiki shiki-themes one-light one-dark-pro vp-code\\\"><code class=\\\"language-\\\"><span class=\\\"line\\\"><span>taopiaopiao-redisson-framework</span></span>\\n<span class=\\\"line\\\"><span>├── taopiaopiao-redisson-service-framework</span></span>\\n<span class=\\\"line\\\"><span>│   ├── taopiaopiao-redisson-common-framework     # 公共配置模块</span></span>\\n<span class=\\\"line\\\"><span>│   ├── taopiaopiao-service-lock-framework        # 分布式锁模块</span></span>\\n<span class=\\\"line\\\"><span>│   ├── taopiaopiao-repeat-execute-limit-framework # 防重复执行模块</span></span>\\n<span class=\\\"line\\\"><span>│   └── taopiaopiao-bloom-filter-framework        # 布隆过滤器模块</span></span>\\n<span class=\\\"line\\\"><span>└── taopiaopiao-service-delay-queue-framework     # 延迟队列模块</span></span></code></pre>\\n<div class=\\\"line-numbers\\\" aria-hidden=\\\"true\\\" style=\\\"counter-reset:line-number 0\\\"><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div><div class=\\\"line-number\\\"></div></div></div>\"}")
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
