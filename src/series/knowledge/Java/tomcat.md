---
title: Tomcat
date: 2025-05-28
icon: /assets/icon/tomcat.png
order: 5
---
## Tomcat 是什么？作用是什么？

```component HoverComment 
text: "* **Tomcat 是 Java 的 Servlet 容器**，负责运行 JSP、Servlet、Spring MVC 等 Web 应用。" 
comment: | 
  #### **Servlet 定义介绍**
  - **核心概念**：Servlet 是运行在 Web 服务器或应用服务器上的 Java 小程序
  - **功能定位**：专门处理 HTTP 请求，返回响应数据
  - **运行依赖**：必须部署在 Servlet 容器（如 Tomcat）中才能运行
  - **开发模式**：继承 HttpServlet 类，重写 doGet/doPost 等方法
  - **请求流程**：接收请求 → 调用 service() → 执行业务逻辑 → 返回响应
```
* **实现了 Servlet 规范、JSP 规范**，是 Java Web 的默认运行容器。
* 常用于中小型业务场景，轻量、稳定、开源。


## Tomcat 架构核心组件有哪些？

* **Connector（连接器）**：负责网络通信，接收请求并返回响应。
* **Container（容器）**：负责处理请求，运行 Servlet（Engine → Host → Context → Wrapper）。
* **Executor（线程池）**：管理 Tomcat 的线程资源。
* **ClassLoader**：支持应用隔离加载。
* **Lifecycle**：统一生命周期管理机制。


## Tomcat 是如何处理一次请求的？

* **Connector 接收 Socket 请求**（默认使用 NIO）。
* **解析 HTTP 请求**并封装成 `HttpRequest`。
* 将请求交给 **Engine → Host → Context → Wrapper** 精准定位目标 Servlet。
* **Servlet.service() 执行业务逻辑**。
* 返回 Response，通过 Connector 写回浏览器。


## Tomcat 使用哪种线程模型？

```component HoverComment 
text: "**NIO（默认）**：基于 Selector，支持高并发" 
comment: |
  #### **NIO (New I/O) 定义**
  - **核心概念**：New I/O，新版输入输出模型，Java 1.4 引入
  - **设计目标**：解决传统BIO的线程阻塞和资源消耗问题
  - **Selector 机制**：单线程管理多个Channel，通过事件驱动处理连接
  - **非阻塞**：读写操作不会阻塞线程，提高系统资源利用率
  - **适用场景**：高并发网络服务，如Web服务器、聊天服务器
  - **关键优势**：减少线程创建，降低上下文切换开销
```

```component HoverComment 
text: "**BIO**：传统阻塞式，性能差" 
comment: |
  #### **BIO (Blocking I/O) 定义**
  - **核心概念**：Blocking I/O，传统阻塞式输入输出模型
  - **线程模型**：每个连接对应一个独立的处理线程
  - **阻塞特性**：读取和写入操作会阻塞当前线程直到完成
  - **实现原理**：基于InputStream和OutputStream的同步I/O
  - **性能瓶颈**：高并发时线程数量过多导致资源消耗大
  - **适用场景**：低连接数、对性能要求不高的简单应用
```

```component HoverComment 
text: "**APR**：基于本地库，高性能、接近 Nginx，但部署成本高" 
comment: |
  #### **APR (Apache Portable Runtime) 定义**
  - **核心概念**：Apache Portable Runtime，提供可移植的C语言库
  - **本地优化**：使用本地系统调用，避免Java层性能损耗
  - **网络优化**：优化TCP/IP栈，提供高效的网络I/O性能
  - **功能特性**：原生支持SSL、压缩、sendfile等高级功能
  - **性能表现**：接近原生C程序的性能水平，优于Java NIO
  - **部署要求**：需要安装APR本地库，不同平台需要不同版本
  - **技术定位**：高性能Web服务器的关键组件
```

现代生产通常使用 **NIO/NIO2**。

## Tomcat 的常见配置项有哪些？

* **port**：监听端口
* **protocol**：协议（`org.apache.coyote.http11.Http11NioProtocol` 最常用）
* **maxConnections**：最大连接数
* **maxThreads**：最大工作线程数（默认 200）
* **acceptCount**：拒绝前的等待队列长度
* **connectionTimeout**：连接超时


## 为什么 Spring Boot 内嵌 Tomcat？

* **免安装、免部署，开箱即用**
* **可通过 Maven/Gradle 管理版本**
* **更好的自动化运维：jar 一条命令即可运行**
* **更容易容器化（Docker）**


## Tomcat 如何隔离不同 Web 应用的类？

* 使用 **一套分级 ClassLoader**：

    * BootstrapClassLoader（JDK 类）
    * CommonClassLoader（共享类）
    * WebAppClassLoader（应用私有类）
* **不同应用之间 classpath 隔离**，相互不影响。


## Tomcat 和 Nginx 的区别？

* **Tomcat：应用服务器**

    * 能执行 Servlet / Java 代码
    * 属于动态应用容器

* **Nginx：高性能反向代理服务器**

    * 负载均衡、静态文件、SSL终端
    * 不执行 Java 代码

大部分架构使用 **Nginx → Tomcat**。

## 如何提升 Tomcat 性能？

* 将 I/O 协议改为 **NIO / NIO2**。
* 调整线程池：**maxThreads、minSpareThreads、acceptCount**。
* 配合 **Nginx 做反向代理与静态资源处理**。
* 配置 **Gzip 压缩** 减少数据传输量。
* 减少单实例部署的 Web 应用数量。
* 禁用不必要的 JSP/Session 功能。

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
