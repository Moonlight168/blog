import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/Java/集合.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/Java/%E9%9B%86%E5%90%88.html\",\"title\":\"集合\",\"lang\":\"en-US\",\"frontmatter\":{\"title\":\"集合\",\"date\":\"2025-05-17T00:00:00.000Z\",\"series\":\"Java\"},\"readingTime\":{\"minutes\":5.24,\"words\":1571},\"filePathRelative\":\"zh/series/knowledge/Java/集合.md\",\"excerpt\":\"<h2>Java中有哪些集合？</h2>\\n<p><strong>回答：</strong><br>\\n</p>\\n<h2>List, Set, Queue, Map 有什么区别？</h2>\\n<p><strong>回答：</strong></p>\\n<ul>\\n<li><strong>List</strong>：有序、可重复，如 <code>ArrayList</code>、<code>LinkedList</code></li>\\n<li><strong>Set</strong>：无序、不可重复，如 <code>HashSet</code>、<code>TreeSet</code></li>\\n<li><strong>Queue</strong>：队列结构，先进先出，如 <code>LinkedList</code>、<code>PriorityQueue</code></li>\\n<li><strong>Map</strong>：键值对存储，键唯一，如 <code>HashMap</code>、<code>TreeMap</code></li>\\n</ul>\"}")
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
