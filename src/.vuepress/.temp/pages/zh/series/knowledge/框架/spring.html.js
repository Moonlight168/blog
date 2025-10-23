import comp from "F:/MyBlogSite/vuepress-theme-hope/my-docs/src/.vuepress/.temp/pages/zh/series/knowledge/框架/spring.html.vue"
const data = JSON.parse("{\"path\":\"/zh/series/knowledge/%E6%A1%86%E6%9E%B6/spring.html\",\"title\":\"Spring\",\"lang\":\"en-US\",\"frontmatter\":{\"series\":\"框架\",\"title\":\"Spring\"},\"readingTime\":{\"minutes\":10.76,\"words\":3227},\"filePathRelative\":\"zh/series/knowledge/框架/spring.md\",\"excerpt\":\"<h2>Spring、SpringBoot 的常用注解？</h2>\\n<p><strong>回答：</strong></p>\\n<h4>一、核心组件注解</h4>\\n<ul>\\n<li><code>@Component</code>：通用组件，注入 Spring 容器</li>\\n<li><code>@Service</code>：业务层组件</li>\\n<li><code>@Repository</code>：持久层组件，支持异常转换</li>\\n<li><code>@Controller</code>：控制器组件</li>\\n<li><code>@RestController</code>：<code>@Controller + @ResponseBody</code>，返回 JSON</li>\\n<li><code>@Configuration</code>：配置类</li>\\n<li><code>@Bean</code>：方法定义 Bean，常配合 <code>@Configuration</code> 使用</li>\\n<li><code>@ComponentScan</code>：指定扫描路径</li>\\n<li><code>@Import</code>：导入配置类或组件</li>\\n</ul>\"}")
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
