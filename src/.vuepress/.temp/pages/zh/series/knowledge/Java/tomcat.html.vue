<template><div><h2 id="tomcat-是什么" tabindex="-1"><a class="header-anchor" href="#tomcat-是什么"><span>Tomcat 是什么？</span></a></h2>
<p><strong>回答：</strong><br>
Tomcat 是一个由 Apache 提供的开源 Servlet 容器，支持 JSP 和 Servlet 规范，用于运行 Java Web 应用，是轻量级的 Web 服务器。</p>
<h2 id="tomcat-的主要组件有哪些" tabindex="-1"><a class="header-anchor" href="#tomcat-的主要组件有哪些"><span>Tomcat 的主要组件有哪些？</span></a></h2>
<p><strong>回答：</strong></p>
<h4 id="_1-catalina-servlet-容器核心" tabindex="-1"><a class="header-anchor" href="#_1-catalina-servlet-容器核心"><span>1. <strong>Catalina（Servlet 容器核心）</strong></span></a></h4>
<ul>
<li>实现了 Servlet 规范，负责接收请求、加载 Servlet、调用对应的 <code v-pre>service()</code> 方法处理请求。</li>
<li>是 Tomcat 的核心组件，负责整个请求生命周期的管理。</li>
</ul>
<h4 id="_2-coyote-连接器" tabindex="-1"><a class="header-anchor" href="#_2-coyote-连接器"><span>2. <strong>Coyote（连接器）</strong></span></a></h4>
<ul>
<li>用于处理 HTTP、AJP 协议的连接请求。</li>
<li>是 Tomcat 与客户端通信的底层组件，监听端口接收请求并交给 Catalina 处理。</li>
</ul>
<h4 id="_3-jasper-jsp-引擎" tabindex="-1"><a class="header-anchor" href="#_3-jasper-jsp-引擎"><span>3. <strong>Jasper（JSP 引擎）</strong></span></a></h4>
<ul>
<li>负责将 JSP 文件编译为 Servlet。</li>
<li>JSP 初次访问时会由 Jasper 编译生成对应的 Servlet 类文件，后续由 Catalina 执行。</li>
</ul>
<h4 id="_4-cluster-集群组件" tabindex="-1"><a class="header-anchor" href="#_4-cluster-集群组件"><span>4. <strong>Cluster（集群组件）</strong></span></a></h4>
<ul>
<li>提供会话复制和负载均衡的支持，用于在多台 Tomcat 之间实现集群部署。</li>
</ul>
<h4 id="_5-realm-安全组件" tabindex="-1"><a class="header-anchor" href="#_5-realm-安全组件"><span>5. <strong>Realm（安全组件）</strong></span></a></h4>
<ul>
<li>提供用户认证与权限管理。</li>
<li>支持多种方式（如 JDBC、内存、JNDI）验证用户身份。</li>
</ul>
<h4 id="_6-valves-阀门" tabindex="-1"><a class="header-anchor" href="#_6-valves-阀门"><span>6. <strong>Valves（阀门）</strong></span></a></h4>
<ul>
<li>类似于 Servlet 过滤器，可以插入到请求处理管道中，进行日志记录、权限校验等操作。</li>
<li>通常配置在 <code v-pre>server.xml</code> 或 <code v-pre>context.xml</code> 中。</li>
</ul>
<h4 id="_7-service-与-connector" tabindex="-1"><a class="header-anchor" href="#_7-service-与-connector"><span>7. <strong>Service 与 Connector</strong></span></a></h4>
<ul>
<li><code v-pre>Service</code> 是 Tomcat 中的一个服务单元，包含一个 <code v-pre>Engine</code> 和多个 <code v-pre>Connector</code>。</li>
<li><code v-pre>Connector</code> 负责接收客户端请求。</li>
<li><code v-pre>Engine</code> 负责调度请求到具体的 <code v-pre>Host</code> 和 <code v-pre>Context</code>。</li>
</ul>
<h4 id="_8-host-与-context" tabindex="-1"><a class="header-anchor" href="#_8-host-与-context"><span>8. <strong>Host 与 Context</strong></span></a></h4>
<ul>
<li><code v-pre>Host</code> 表示一个虚拟主机（如一个域名）。</li>
<li><code v-pre>Context</code> 表示一个 Web 应用（即一个 <code v-pre>webapp</code>）。</li>
</ul>
<h2 id="tomcat-请求处理流程" tabindex="-1"><a class="header-anchor" href="#tomcat-请求处理流程"><span>Tomcat 请求处理流程？</span></a></h2>
<h4 id="_1-客户端发送请求" tabindex="-1"><a class="header-anchor" href="#_1-客户端发送请求"><span><strong>1. 客户端发送请求</strong></span></a></h4>
<ul>
<li>客户端（如浏览器）通过 HTTP 协议访问 Web 应用（例如：<code v-pre>http://localhost:8080/app/index.jsp</code>）。</li>
</ul>
<h4 id="_2-connector-接收请求-coyote" tabindex="-1"><a class="header-anchor" href="#_2-connector-接收请求-coyote"><span><strong>2. Connector 接收请求（Coyote）</strong></span></a></h4>
<ul>
<li><code v-pre>Connector</code>（通常是 HTTP/1.1 或 AJP 连接器）监听指定端口（如 8080）。</li>
<li>使用 <code v-pre>Coyote</code> 组件将原始 Socket 请求包装成 <code v-pre>Request</code> 和 <code v-pre>Response</code> 对象。</li>
</ul>
<h4 id="_3-请求交给-engine-catalina-处理" tabindex="-1"><a class="header-anchor" href="#_3-请求交给-engine-catalina-处理"><span><strong>3. 请求交给 Engine（Catalina）处理</strong></span></a></h4>
<ul>
<li><code v-pre>Service</code> 中的 <code v-pre>Connector</code> 将请求传递给 <code v-pre>Engine</code>。</li>
<li><code v-pre>Engine</code> 是 Servlet 容器的核心，会根据请求的主机名查找对应的 <code v-pre>Host</code>。</li>
</ul>
<h4 id="_4-匹配虚拟主机-host" tabindex="-1"><a class="header-anchor" href="#_4-匹配虚拟主机-host"><span><strong>4. 匹配虚拟主机（Host）</strong></span></a></h4>
<ul>
<li>Tomcat 根据请求中的主机名（如 <code v-pre>localhost</code>）匹配 <code v-pre>Host</code>。</li>
<li>每个 <code v-pre>Host</code> 可能部署多个 Web 应用（Context）。</li>
</ul>
<h4 id="_5-匹配-web-应用-context" tabindex="-1"><a class="header-anchor" href="#_5-匹配-web-应用-context"><span><strong>5. 匹配 Web 应用（Context）</strong></span></a></h4>
<ul>
<li><code v-pre>Host</code> 根据 URL 中的项目路径（如 <code v-pre>/app</code>）选择对应的 <code v-pre>Context</code>。</li>
<li><code v-pre>Context</code> 是对单个 Web 应用的封装，包含该应用的配置和资源。</li>
</ul>
<h4 id="_6-匹配-servlet-wrapper" tabindex="-1"><a class="header-anchor" href="#_6-匹配-servlet-wrapper"><span><strong>6. 匹配 Servlet（Wrapper）</strong></span></a></h4>
<ul>
<li><code v-pre>Context</code> 会根据请求路径进一步匹配到具体的 <code v-pre>Servlet</code>（由 <code v-pre>Wrapper</code> 封装）。</li>
<li>如果是 JSP 页面，则由 <code v-pre>Jasper</code> 引擎先将 JSP 编译为 Servlet，再处理请求。</li>
</ul>
<h4 id="_7-执行-servlet-逻辑" tabindex="-1"><a class="header-anchor" href="#_7-执行-servlet-逻辑"><span><strong>7. 执行 Servlet 逻辑</strong></span></a></h4>
<ul>
<li><code v-pre>Wrapper</code> 调用 Servlet 的 <code v-pre>service()</code> 方法处理请求。</li>
<li>期间可经过过滤器链（FilterChain）和拦截器。</li>
</ul>
<h4 id="_8-返回响应" tabindex="-1"><a class="header-anchor" href="#_8-返回响应"><span><strong>8. 返回响应</strong></span></a></h4>
<ul>
<li>Servlet 将处理结果写入 <code v-pre>HttpServletResponse</code>。</li>
<li><code v-pre>Response</code> 对象经由 <code v-pre>Connector</code> 写回客户端 Socket。</li>
</ul>
<h4 id="总结关键点" tabindex="-1"><a class="header-anchor" href="#总结关键点"><span>总结关键点：</span></a></h4>
<table>
<thead>
<tr>
<th>阶段</th>
<th>组件</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td>接收请求</td>
<td>Connector</td>
<td>网络通信，使用 Coyote 封装协议请求</td>
</tr>
<tr>
<td>请求分发</td>
<td>Engine → Host</td>
<td>按虚拟主机和应用路径定位到具体应用</td>
</tr>
<tr>
<td>Servlet 匹配</td>
<td>Context → Wrapper</td>
<td>根据 URL 找到 Servlet 或 JSP</td>
</tr>
<tr>
<td>请求处理</td>
<td>Servlet</td>
<td>调用 <code v-pre>service()</code> 方法处理业务逻辑</td>
</tr>
<tr>
<td>响应返回</td>
<td>Connector</td>
<td>将响应通过 Socket 发送给客户端</td>
</tr>
</tbody>
</table>
<h2 id="tomcat-默认端口是多少-怎么修改" tabindex="-1"><a class="header-anchor" href="#tomcat-默认端口是多少-怎么修改"><span>Tomcat 默认端口是多少？怎么修改？</span></a></h2>
<p><strong>回答：</strong><br>
默认是 <strong>8080</strong>，在 <code v-pre>conf/server.xml</code> 中修改 <code v-pre>&lt;Connector port=&quot;8080&quot;&gt;</code> 即可。</p>
<h2 id="tomcat-如何实现多线程" tabindex="-1"><a class="header-anchor" href="#tomcat-如何实现多线程"><span>Tomcat 如何实现多线程？</span></a></h2>
<p><strong>回答：</strong><br>
使用线程池（Executor），每个请求由线程池中线程处理，提升并发性能。</p>
<h2 id="tomcat-如何解析-web-xml" tabindex="-1"><a class="header-anchor" href="#tomcat-如何解析-web-xml"><span>Tomcat 如何解析 web.xml？</span></a></h2>
<p><strong>回答：</strong><br>
启动时解析 <code v-pre>WEB-INF/web.xml</code>，注册 Servlet、Filter、Listener，并按配置初始化加载。</p>
<h2 id="tomcat-如何热部署应用" tabindex="-1"><a class="header-anchor" href="#tomcat-如何热部署应用"><span>Tomcat 如何热部署应用？</span></a></h2>
<p><strong>回答：</strong><br>
监听 <code v-pre>webapps</code> 目录变化，自动部署 <code v-pre>.war</code> 或解压目录，可实现热部署（支持关闭）。</p>
<h2 id="tomcat-如何处理静态资源" tabindex="-1"><a class="header-anchor" href="#tomcat-如何处理静态资源"><span>Tomcat 如何处理静态资源？</span></a></h2>
<p><strong>回答：</strong><br>
由默认的 <code v-pre>DefaultServlet</code> 处理，如 HTML、CSS、JS 等静态文件。</p>
<h2 id="tomcat-是线程安全的吗" tabindex="-1"><a class="header-anchor" href="#tomcat-是线程安全的吗"><span>Tomcat 是线程安全的吗？</span></a></h2>
<p><strong>回答：</strong><br>
Tomcat 本身线程安全，但开发者需保证自己写的 Servlet 是线程安全的（避免共享可变状态）。</p>
<h2 id="tomcat-性能优化方式" tabindex="-1"><a class="header-anchor" href="#tomcat-性能优化方式"><span>Tomcat 性能优化方式？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>设置合适的线程池参数（<code v-pre>maxThreads</code>）。</li>
<li>启用 GZIP 压缩（<code v-pre>compression=&quot;on&quot;</code>）。</li>
<li>使用连接池优化数据库访问。</li>
<li>关闭自动部署功能减少资源消耗。</li>
<li>配置缓存、禁用开发模式。</li>
</ul>
</div></template>


