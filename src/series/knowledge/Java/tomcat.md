---
title: Tomcat
date: 2025-05-28
icon: /assets/icon/tomcat.png
order: 5
---
## Tomcat 是什么？作用是什么？

**锚点**：`Java 的 Servlet 容器（Servlet/JSP 规范），运行 Web 应用，轻量稳定开源`

* 实现了 **Servlet 规范、JSP 规范**，是 Java Web 的默认运行容器
* Servlet 是运行在服务器上的 Java 小程序，专门处理 HTTP 请求返回响应；继承 HttpServlet 重写 doGet/doPost，部署在 Tomcat 中运行
* 常用于中小型业务场景，轻量、稳定、开源

## Tomcat 架构核心组件有哪些？

**锚点**：`Connector 通信 + Container 处理（Engine→Host→Context→Wrapper）+ Executor 线程池 + ClassLoader + Lifecycle`

* **Connector（连接器）**：负责网络通信，接收请求并返回响应
* **Container（容器）**：负责处理请求，运行 Servlet（Engine → Host → Context → Wrapper）
* **Executor（线程池）**：管理 Tomcat 的线程资源
* **ClassLoader**：支持应用隔离加载
* **Lifecycle**：统一生命周期管理机制

## Tomcat 是如何处理一次请求的？

**锚点**：`Connector 收 Socket → 解析 HTTP → 四层容器定位 Servlet → service() → 返回`

1. **Connector 接收 Socket 请求**（默认 NIO）
2. **解析 HTTP 请求**并封装成 `HttpRequest`
3. 交给 **Engine → Host → Context → Wrapper** 精准定位目标 Servlet
4. **Servlet.service() 执行业务逻辑**
5. 返回 Response，通过 Connector 写回浏览器

## Tomcat 使用哪种线程模型？

**锚点**：`NIO 默认（Selector 高并发）；BIO 阻塞差；APR 高性能部署成本高`

* **NIO（默认）**：基于 Selector 事件驱动，单线程管理多 Channel，支持高并发
* **BIO**：传统阻塞式，每连接一线程，高并发资源消耗大
* **APR**：基于本地库，高性能接近 Nginx，但需安装本地库部署成本高

现代生产通常使用 **NIO/NIO2**。

## Tomcat 的常见配置项有哪些？

**锚点**：`port / protocol / maxConnections / maxThreads / acceptCount / connectionTimeout`

* **port**：监听端口
* **protocol**：协议（`org.apache.coyote.http11.Http11NioProtocol` 最常用）
* **maxConnections**：最大连接数
* **maxThreads**：最大工作线程数（默认 200）
* **acceptCount**：拒绝前的等待队列长度
* **connectionTimeout**：连接超时

## 为什么 Spring Boot 内嵌 Tomcat？

**锚点**：`免安装部署 + Maven 管版本 + jar 一键运行 + 易容器化`

* 免安装、免部署，开箱即用
* 可通过 Maven/Gradle 管理版本
* 更好的自动化运维：jar 一条命令即可运行
* 更容易容器化（Docker）

## Tomcat 如何隔离不同 Web 应用的类？

**锚点**：`分级 ClassLoader：Bootstrap/Common/WebApp，应用间 classpath 隔离`

* 使用一套**分级 ClassLoader**：BootstrapClassLoader（JDK 类）、CommonClassLoader（共享类）、WebAppClassLoader（应用私有类）
* **不同应用之间 classpath 隔离**，相互不影响

## Tomcat 和 Nginx 的区别？

**锚点**：`Tomcat 应用服务器执行 Java 代码；Nginx 反向代理不执行 Java`

* **Tomcat：应用服务器**——能执行 Servlet/Java 代码，动态应用容器
* **Nginx：高性能反向代理服务器**——负载均衡、静态文件、SSL 终端，不执行 Java 代码

大部分架构使用 **Nginx → Tomcat**。

## 如何提升 Tomcat 性能？

**锚点**：`NIO + 线程池调参 + Nginx 前置 + Gzip + 减应用 + 禁无用功能`

* 将 I/O 协议改为 **NIO / NIO2**
* 调整线程池：**maxThreads、minSpareThreads、acceptCount**
* 配合 **Nginx 做反向代理与静态资源处理**
* 配置 **Gzip 压缩**减少数据传输量
* 减少单实例部署的 Web 应用数量
* 禁用不必要的 JSP/Session 功能

## Tomcat 默认端口是多少？怎么修改？

**锚点**：`8080，conf/server.xml 的 <Connector port>`

默认 **8080**，在 `conf/server.xml` 中修改 `<Connector port="8080">` 即可。

## Tomcat 如何实现多线程？

**锚点**：`线程池（Executor），每请求由池中线程处理`

使用线程池（Executor），每个请求由线程池中线程处理，提升并发性能。

## Tomcat 如何解析 web.xml？

**锚点**：`启动时解析 WEB-INF/web.xml，注册 Servlet/Filter/Listener`

启动时解析 `WEB-INF/web.xml`，注册 Servlet、Filter、Listener，并按配置初始化加载。

## Tomcat 如何热部署应用？

**锚点**：`监听 webapps 目录变化，自动部署 .war 或解压目录`

监听 `webapps` 目录变化，自动部署 `.war` 或解压目录，可实现热部署（支持关闭）。

## Tomcat 如何处理静态资源？

**锚点**：`默认 DefaultServlet 处理 HTML/CSS/JS 静态文件`

由默认的 `DefaultServlet` 处理，如 HTML、CSS、JS 等静态文件。

## Tomcat 是线程安全的吗？

**锚点**：`Tomcat 本身安全，但开发者要保证自己写的 Servlet 安全`

Tomcat 本身线程安全，但开发者需保证自己写的 Servlet 是线程安全的（避免共享可变状态）。
