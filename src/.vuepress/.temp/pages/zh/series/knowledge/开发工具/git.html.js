import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/开发工具/git.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7/git.html\",\"title\":\"Git\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"Git\",\"date\":\"2025-06-09T00:00:00.000Z\",\"series\":\"开发工具\"},\"readingTime\":{\"minutes\":1.26,\"words\":377},\"filePathRelative\":\"zh/series/knowledge/开发工具/git.md\",\"excerpt\":\"<h3>✅ Git 是什么？</h3>\\n<p><strong>答：</strong><br>\\nGit 是一个分布式版本控制系统，用于高效地管理源代码的变更历史，支持多人协作开发。每个开发者的本地仓库都是完整的代码库副本，支持离线操作。</p>\\n<p><strong>核心功能包括：</strong></p>\\n<ul>\\n<li>快速切换分支（branch）</li>\\n<li>支持版本回退</li>\\n<li>离线提交</li>\\n<li>分布式协作（远程仓库）</li>\\n</ul>\\n<h2>Git 中 fetch、pull、merge 的区别？</h2>\\n<table>\\n<thead>\\n<tr>\\n<th>操作</th>\\n<th>是否拉取远程代码</th>\\n<th>是否自动合并</th>\\n<th>用途描述</th>\\n</tr>\\n</thead>\\n<tbody>\\n<tr>\\n<td><code>git fetch</code></td>\\n<td>✅ 拉取（但不改当前分支）</td>\\n<td>❌ 否</td>\\n<td>只同步远程分支，供后续查看或手动合并</td>\\n</tr>\\n<tr>\\n<td><code>git pull</code></td>\\n<td>✅ 拉取</td>\\n<td>✅ 自动合并</td>\\n<td>相当于 <code>fetch</code> + <code>merge</code>，适合快速同步远程分支</td>\\n</tr>\\n<tr>\\n<td><code>git merge</code></td>\\n<td>❌ 否（不拉远程）</td>\\n<td>✅ 合并</td>\\n<td>将指定分支（本地或远程）合并到当前分支</td>\\n</tr>\\n</tbody>\\n</table>\"}")
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
