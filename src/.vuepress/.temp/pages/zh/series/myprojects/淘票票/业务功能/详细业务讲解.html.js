import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/myprojects/淘票票/业务功能/详细业务讲解.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/myprojects/%E6%B7%98%E7%A5%A8%E7%A5%A8/%E4%B8%9A%E5%8A%A1%E5%8A%9F%E8%83%BD/%E8%AF%A6%E7%BB%86%E4%B8%9A%E5%8A%A1%E8%AE%B2%E8%A7%A3.html\",\"title\":\"淘票票项目详细业务讲解\",\"lang\":\"en-US\",\"frontmatter\":{},\"readingTime\":{\"minutes\":7.54,\"words\":2263},\"filePathRelative\":\"zh/series/myprojects/淘票票/业务功能/详细业务讲解.md\",\"excerpt\":\"\\n<h2>1. 参数加解密配置</h2>\\n<p>淘票票项目采用了完善的参数加密和解密机制，确保数据在传输过程中的安全性。</p>\\n<h3>1.1 加密配置</h3>\\n<p>系统使用了多种加密算法：</p>\\n<ul>\\n<li>RSA签名公钥和私钥用于签名验证</li>\\n<li>AES密钥用于数据加密</li>\\n<li>RSA参数公钥和私钥用于参数加密</li>\\n</ul>\\n<p>这些密钥信息存储在ChannelDataAddDto类中，包含以下关键字段：</p>\\n<ul>\\n<li>signPublicKey: RSA签名公钥</li>\\n<li>signSecretKey: RSA签名私钥</li>\\n<li>aesKey: AES私钥</li>\\n<li>dataPublicKey: RSA参数公钥</li>\\n<li>dataSecretKey: RSA参数私钥</li>\\n<li>tokenSecret: Token秘钥</li>\\n</ul>\"}")
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
