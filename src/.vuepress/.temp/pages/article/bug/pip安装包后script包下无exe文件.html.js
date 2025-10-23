import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/bug/pip安装包后script包下无exe文件.html.vue"
const data = JSON.parse("{\"path\":\"/article/bug/pip%E5%AE%89%E8%A3%85%E5%8C%85%E5%90%8Escript%E5%8C%85%E4%B8%8B%E6%97%A0exe%E6%96%87%E4%BB%B6.html\",\"title\":\"解决 pip 安装 Script目录下没有生成 .exe 文件和 \\\"Could not install packages due to an OSError: [WinError 2]\\\" 报错\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"解决 pip 安装 Script目录下没有生成 .exe 文件和 \\\"Could not install packages due to an OSError: [WinError 2]\\\" 报错\",\"date\":\"2025-06-04T00:00:00.000Z\",\"categories\":[\"BUG\"],\"tags\":[\"Python\",\"Windows\"]},\"readingTime\":{\"minutes\":1.04,\"words\":312},\"filePathRelative\":\"article/bug/pip安装包后script包下无exe文件.md\",\"excerpt\":\"<h2>一、问题描述</h2>\\n<p>在 Windows 系统中使用 <code>pip</code> 安装第三方库时，遇到以下两个相关问题，故此记录一下：</p>\\n<ol>\\n<li>使用 <code>pip install</code> 安装后没有生成对应的 <code>.exe</code> 执行文件（如 <code>xxx.exe</code> 无法找到），而使用 <code>pip3</code> 却能正常生成。</li>\\n<li>执行 <code>pip install</code> 安装某些库时报错：</li>\\n</ol>\\n<div class=\\\"language-error line-numbers-mode\\\" data-highlighter=\\\"shiki\\\" data-ext=\\\"error\\\" style=\\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\\"><pre class=\\\"shiki shiki-themes one-light one-dark-pro vp-code\\\"><code class=\\\"language-error\\\"><span class=\\\"line\\\"><span>Could not install packages due to an OSError: \\\\[WinError 2] 系统找不到指定的文件。</span></span></code></pre>\\n<div class=\\\"line-numbers\\\" aria-hidden=\\\"true\\\" style=\\\"counter-reset:line-number 0\\\"><div class=\\\"line-number\\\"></div></div></div>\"}")
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
