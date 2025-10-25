---
title: Tomcat
date: 2025-05-28
icon: /assets/icon/tomcat.png
order: 5
---
## Tomcat 是什么？

**回答：**
Tomcat 是一个由 Apache 提供的开源 Servlet 容器，支持 JSP 和 Servlet 规范，用于运行 Java Web 应用，是轻量级的 Web 服务器。

## Tomcat 的主要组件有哪些？

**回答：**

#### 1. **Catalina（Servlet 容器核心）**
- 实现了 Servlet 规范，负责接收请求、加载 Servlet、调用对应的 `service()` 方法处理请求。
- 是 Tomcat 的核心组件，负责整个请求生命周期的管理。

#### 2. **Coyote（连接器）**
- 用于处理 HTTP、AJP 协议的连接请求。
- 是 Tomcat 与客户端通信的底层组件，监听端口接收请求并交给 Catalina 处理。

#### 3. **Jasper（JSP 引擎）**
- 负责将 JSP 文件编译为 Servlet。
- JSP 初次访问时会由 Jasper 编译生成对应的 Servlet 类文件，后续由 Catalina 执行。

#### 4. **Cluster（集群组件）**
- 提供会话复制和负载均衡的支持，用于在多台 Tomcat 之间实现集群部署。

#### 5. **Realm（安全组件）**
- 提供用户认证与权限管理。
- 支持多种方式（如 JDBC、内存、JNDI）验证用户身份。

#### 6. **Valves（阀门）**
- 类似于 Servlet 过滤器，可以插入到请求处理管道中，进行日志记录、权限校验等操作。
- 通常配置在 `server.xml` 或 `context.xml` 中。

#### 7. **Service 与 Connector**
- `Service` 是 Tomcat 中的一个服务单元，包含一个 `Engine` 和多个 `Connector`。
- `Connector` 负责接收客户端请求。
- `Engine` 负责调度请求到具体的 `Host` 和 `Context`。

#### 8. **Host 与 Context**
- `Host` 表示一个虚拟主机（如一个域名）。
- `Context` 表示一个 Web 应用（即一个 `webapp`）。

## Tomcat 请求处理流程？

#### **1. 客户端发送请求**
- 客户端（如浏览器）通过 HTTP 协议访问 Web 应用（例如：`http://localhost:8080/app/index.jsp`）。

#### **2. Connector 接收请求（Coyote）**
- `Connector`（通常是 HTTP/1.1 或 AJP 连接器）监听指定端口（如 8080）。
- 使用 `Coyote` 组件将原始 Socket 请求包装成 `Request` 和 `Response` 对象。

#### **3. 请求交给 Engine（Catalina）处理**
- `Service` 中的 `Connector` 将请求传递给 `Engine`。
- `Engine` 是 Servlet 容器的核心，会根据请求的主机名查找对应的 `Host`。

#### **4. 匹配虚拟主机（Host）**
- Tomcat 根据请求中的主机名（如 `localhost`）匹配 `Host`。
- 每个 `Host` 可能部署多个 Web 应用（Context）。

#### **5. 匹配 Web 应用（Context）**
- `Host` 根据 URL 中的项目路径（如 `/app`）选择对应的 `Context`。
- `Context` 是对单个 Web 应用的封装，包含该应用的配置和资源。

#### **6. 匹配 Servlet（Wrapper）**
- `Context` 会根据请求路径进一步匹配到具体的 `Servlet`（由 `Wrapper` 封装）。
- 如果是 JSP 页面，则由 `Jasper` 引擎先将 JSP 编译为 Servlet，再处理请求。

#### **7. 执行 Servlet 逻辑**
- `Wrapper` 调用 Servlet 的 `service()` 方法处理请求。
- 期间可经过过滤器链（FilterChain）和拦截器。

#### **8. 返回响应**
- Servlet 将处理结果写入 `HttpServletResponse`。
- `Response` 对象经由 `Connector` 写回客户端 Socket。

#### 总结关键点：

| 阶段         | 组件           | 说明                                      |
|--------------|----------------|-------------------------------------------|
| 接收请求     | Connector      | 网络通信，使用 Coyote 封装协议请求        |
| 请求分发     | Engine → Host  | 按虚拟主机和应用路径定位到具体应用        |
| Servlet 匹配 | Context → Wrapper | 根据 URL 找到 Servlet 或 JSP                |
| 请求处理     | Servlet        | 调用 `service()` 方法处理业务逻辑         |
| 响应返回     | Connector      | 将响应通过 Socket 发送给客户端             |


## Tomcat 默认端口是多少？怎么修改？

**回答：**
默认是 **8080**，在 `conf/server.xml` 中修改 `<Connector port="8080">` 即可。


## Tomcat 如何实现多线程？

**回答：**
使用线程池（Executor），每个请求由线程池中线程处理，提升并发性能。


## Tomcat 如何解析 web.xml？

**回答：**
启动时解析 `WEB-INF/web.xml`，注册 Servlet、Filter、Listener，并按配置初始化加载。

## Tomcat 如何热部署应用？

**回答：**
监听 `webapps` 目录变化，自动部署 `.war` 或解压目录，可实现热部署（支持关闭）。


## Tomcat 如何处理静态资源？

**回答：**
由默认的 `DefaultServlet` 处理，如 HTML、CSS、JS 等静态文件。


## Tomcat 是线程安全的吗？

**回答：**
Tomcat 本身线程安全，但开发者需保证自己写的 Servlet 是线程安全的（避免共享可变状态）。

## Tomcat 性能优化方式？

**回答：**

* 设置合适的线程池参数（`maxThreads`）。
* 启用 GZIP 压缩（`compression="on"`）。
* 使用连接池优化数据库访问。
* 关闭自动部署功能减少资源消耗。
* 配置缓存、禁用开发模式。
