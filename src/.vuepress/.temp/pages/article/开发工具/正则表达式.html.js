import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/article/开发工具/正则表达式.html.vue"
const data = JSON.parse("{\"path\":\"/article/%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7/%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F.html\",\"title\":\"正则表达式学习笔记与常用技巧\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"正则表达式学习笔记与常用技巧\",\"date\":\"2025-06-04T00:00:00.000Z\",\"categories\":[\"开发工具\"],\"tags\":[\"\"]},\"readingTime\":{\"minutes\":1.85,\"words\":554},\"filePathRelative\":\"article/开发工具/正则表达式.md\",\"excerpt\":\"<hr>\\n<blockquote>\\n<p>正则表达式（Regular Expression, 简称 Regex）是用于字符串匹配和处理的强大工具，广泛应用于文本搜索、数据清洗、表单验证、爬虫开发等场景。</p>\\n</blockquote>\\n<h2>一、基础语法速览</h2>\\n<table>\\n<thead>\\n<tr>\\n<th>符号</th>\\n<th>含义</th>\\n<th>示例</th>\\n<th></th>\\n<th></th>\\n</tr>\\n</thead>\\n<tbody>\\n<tr>\\n<td><code>.</code></td>\\n<td>匹配除换行外的任意字符</td>\\n<td><code>a.b</code> → 匹配 <code>acb</code>、<code>a1b</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>^</code></td>\\n<td>匹配字符串开始</td>\\n<td><code>^abc</code> 匹配 <code>abc123</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>$</code></td>\\n<td>匹配字符串结尾</td>\\n<td><code>abc$</code> 匹配 <code>123abc</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>*</code></td>\\n<td>匹配前一个字符 <strong>0次或多次</strong></td>\\n<td><code>a*</code> 匹配 <code>\\\"\\\"</code>、<code>a</code>、<code>aaa</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>+</code></td>\\n<td>匹配前一个字符 <strong>1次或多次</strong></td>\\n<td><code>a+</code> 匹配 <code>a</code>、<code>aa</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>?</code></td>\\n<td>匹配前一个字符 <strong>0次或1次</strong></td>\\n<td><code>a?</code> 匹配 <code>\\\"\\\"</code>、<code>a</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>{n}</code></td>\\n<td>恰好重复 n 次</td>\\n<td><code>a{3}</code> 匹配 <code>aaa</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>{n,}</code></td>\\n<td>至少重复 n 次</td>\\n<td><code>a{2,}</code> 匹配 <code>aa</code>、<code>aaa...</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>{n,m}</code></td>\\n<td>重复 n 到 m 次</td>\\n<td><code>a{2,4}</code> 匹配 <code>aa</code>、<code>aaa</code>、<code>aaaa</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>[]</code></td>\\n<td>字符集合，匹配其中任意一个字符</td>\\n<td><code>[abc]</code> 匹配 <code>a</code>、<code>b</code>、<code>c</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td><code>[^]</code></td>\\n<td>非字符集合，匹配不在其中的字符</td>\\n<td><code>[^abc]</code> 匹配非 a/b/c 的字符</td>\\n<td></td>\\n<td></td>\\n</tr>\\n<tr>\\n<td>`</td>\\n<td>`</td>\\n<td>或运算，匹配左右任意一个表达式</td>\\n<td>`abc</td>\\n<td>123<code>匹配</code>abc<code>或</code>123`</td>\\n</tr>\\n<tr>\\n<td><code>()</code></td>\\n<td>分组，提取或整体应用量词</td>\\n<td><code>(abc)+</code> 匹配 <code>abcabc</code></td>\\n<td></td>\\n<td></td>\\n</tr>\\n</tbody>\\n</table>\"}")
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
