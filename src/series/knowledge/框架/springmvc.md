---
title: SpringMVC
date: 2026-03-23
icon: /assets/icon/web.png
order: 2
---

## Spring MVC是什么？

**锚点**：`Spring 内基于 Java 的 Web MVC 轻量框架：模型、视图、控制器解耦`

Spring MVC 是 Spring 框架内基于 Java 实现 Web MVC 模式的轻量级 Web 框架。它解耦了模型、视图、控制器，让开发者能清晰、便捷地构建 Web 应用。像开发电商网站，可分离商品展示与订单处理等功能，提升代码维护与复用性。

## Spring MVC的核心组件有哪些，各自的作用是什么？

**锚点**：`DispatcherServlet 入口 + HandlerMapping 找处理器 + HandlerAdapter 调方法 + ViewResolver 解析视图`

1. **DispatcherServlet**：核心控制器，接收所有 HTTP 请求并分发给处理器（web.xml 配置）
2. **HandlerMapping**：按 URL 查找处理器，如 `RequestMappingHandlerMapping` 依据 `@RequestMapping` 映射
3. **HandlerAdapter**：调用处理器方法并处理返回值，如 `RequestMappingHandlerAdapter`
4. **Controller**：处理具体业务逻辑，`@Controller` + `@RequestMapping` 标记
5. **ViewResolver**：把视图名解析为视图对象，如 `InternalResourceViewResolver` 解析 JSP
6. **View**：渲染模型数据给用户（JSP、FreeMarker、Thymeleaf）

## 请阐述Spring MVC的工作流程。

**锚点**：`请求 → DispatcherServlet → HandlerMapping 找 → HandlerAdapter 调 → ViewResolver 解析 → View 渲染`

1. **用户请求**：发起 HTTP 请求到服务器
2. **DispatcherServlet 接收**：流程入口，开始协调
3. **HandlerMapping 查找**：按 URL/HTTP 方法找匹配的处理器，返回 `HandlerExecutionChain`（处理器 + 拦截器）
4. **HandlerAdapter 调用**：挑选合适的 Adapter 调用处理器方法，返回 `ModelAndView`（模型数据 + 视图名）
5. **ViewResolver 解析**：按视图名解析出实际 `View` 对象
6. **View 渲染**：模型数据交给 View 渲染成响应内容返回客户端

## Spring MVC有哪些常用注解，分别有什么作用？

**锚点**：`@Controller 控制器 / @RequestMapping 映射 / @PathVariable 路径参数 / @RequestParam 查询参数 / @RequestBody JSON`

1. **@Controller**：标记类为控制器，负责处理 HTTP 请求
2. **@RequestMapping**：映射 URL 到方法，类级定前缀、方法级定具体 URL
3. **@GetMapping / @PostMapping 等**：`@RequestMapping` 的派生注解，明确 HTTP 方法
4. **@PathVariable**：获取 URL 路径参数，如 `/user/{id}` 取 id
5. **@RequestParam**：获取查询参数，如 `/user?name=John` 取 name
6. **@RequestBody**：把请求体（JSON/XML）绑定到方法参数
