---
title: SpringMVC
icon: /assets/icon/web.png
order: 2
---

##  Spring MVC是什么？
Spring MVC 是 Spring 框架内基于 Java 实现 Web MVC 模式的轻量级 Web 框架。它解耦了模型、视图、控制器，让开发者能清晰、便捷地构建 Web 应用。像开发电商网站，可分离商品展示与订单处理等功能，提升代码维护与复用性。

##  Spring MVC的核心组件有哪些，各自的作用是什么？
- **DispatcherServlet**：
它是Spring MVC的核心控制器，负责接收所有HTTP请求，并将请求分发给相应的处理器进行处理。在`web.xml`文件中进行配置，示例如下：
```xml
<servlet>
    <servlet-name>dispatcherServlet</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB - INF/spring - mvc - servlet.xml</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```
- **HandlerMapping**：
它负责根据请求的URL等信息查找并确定对应的处理器（Controller）。常见的实现类有`RequestMappingHandlerMapping`，它依据`@RequestMapping`注解来映射请求到具体的控制器方法。比如当请求URL为“/user/list”时，`RequestMappingHandlerMapping`会根据控制器类和方法上的`@RequestMapping`注解找到对应的处理方法。
- **HandlerAdapter**：
它负责调用处理器（Controller）来处理请求，并处理处理器返回的结果。不同类型的处理器有不同的调用和返回结果处理方式，所以需要不同的`HandlerAdapter`。例如`RequestMappingHandlerAdapter`用于处理基于`@RequestMapping`注解的控制器方法，因为这种方法的调用和返回值处理有其特定规则。
- **Controller**：
它是处理具体业务逻辑的组件。通过使用`@Controller`注解标记一个类来定义为控制器，类中的方法使用`@RequestMapping`等注解来映射请求。示例代码如下：
```java
@Controller
@RequestMapping("/user")
public class UserController {

    @RequestMapping("/info")
    @ResponseBody
    public String getUserInfo() {
        return "User information";
    }
}
```
- **ViewResolver**：
它负责将处理器返回的视图名解析为实际的视图对象（如JSP、Thymeleaf视图等）。常见的`ViewResolver`如`InternalResourceViewResolver`，可以将视图名解析为JSP视图，配置如下：
```xml
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/WEB - INF/views/"/>
    <property name="suffix" value=".jsp"/>
</bean>
```
- **View**：
视图对象负责将模型数据渲染给用户。常见的视图类型有JSP、FreeMarker、Thymeleaf等。例如使用JSP作为视图时，它会将从控制器传来的模型数据嵌入到HTML页面中展示给用户。

##  请阐述Spring MVC的工作流程。
- **回答**：

1. **用户请求**：用户发起HTTP请求到服务器。
2. **DispatcherServlet接收请求**：请求被`DispatcherServlet`拦截，它作为整个流程的入口，开始协调后续处理。
3. **HandlerMapping查找处理器**：`DispatcherServlet`调用`HandlerMapping`，`HandlerMapping`依据请求的URL、HTTP方法等信息查找匹配的处理器（Controller及其方法），并返回一个`HandlerExecutionChain`对象，该对象包含处理器和相应的拦截器。比如请求URL为“/product/detail”，`HandlerMapping`会找到映射了该URL的`ProductController`中的具体方法。
4. **HandlerAdapter调用处理器**：`DispatcherServlet`根据`HandlerExecutionChain`中的处理器，挑选合适的`HandlerAdapter`来调用处理器方法。处理器方法执行完毕后返回一个`ModelAndView`对象，此对象包含模型数据和视图名。例如，若处理器是基于`@RequestMapping`注解的方法，`DispatcherServlet`会选择`RequestMappingHandlerAdapter`来调用它。
5. **ViewResolver解析视图**：`DispatcherServlet`调用`ViewResolver`，`ViewResolver`根据返回的视图名解析出实际的`View`对象。比如视图名是“productDetail”，`InternalResourceViewResolver`可能会将其解析为“/WEB - INF/views/productDetail.jsp”对应的视图对象。
6. **View渲染**：`DispatcherServlet`将模型数据传递给`View`，`View`把模型数据渲染成最终的响应内容（如HTML页面），返回给客户端。


## Spring MVC有哪些常用注解，分别有什么作用？
- **@Controller**：
用于标记一个类为Spring MVC的控制器，表明该类负责处理HTTP请求。在项目中，将该注解添加到需要处理请求的类上，例如：
```java
@Controller
public class HomeController {
    // 处理请求的方法
}
```
- **@RequestMapping**：
用于映射请求的URL到控制器的方法，可以在类级别和方法级别使用。在类级别使用时，为该控制器下所有方法定义了一个共同的请求前缀；在方法级别使用时，具体映射该方法处理的请求URL。例如：
```java
@Controller
@RequestMapping("/product")
public class ProductController {

    @RequestMapping("/list")
    public String listProducts() {
        return "productList";
    }
}
```
这里类上的`@RequestMapping("/product")`表示该控制器下所有方法的请求URL都以“/product”开头，方法上的`@RequestMapping("/list")`表示`listProducts`方法处理“/product/list”的请求。
- **@GetMapping、@PostMapping等**：
 它们是`@RequestMapping`的派生注解，用于更明确地映射特定HTTP方法的请求。`@GetMapping`用于映射GET请求，`@PostMapping`用于映射POST请求。使用它们可以使代码更加清晰，明确表明方法处理的请求类型。例如：
```java
@GetMapping("/user")
@ResponseBody
public String getUser() {
    return "User details";
}

@PostMapping("/user")
@ResponseBody
public String createUser(User user) {
    // 创建用户逻辑
    return "User created";
}
```
- **@PathVariable**：
用于获取URL路径中的参数值。例如，对于URL “/user/1”，可以通过以下方式获取参数“1”：
```java
@GetMapping("/user/{id}")
@ResponseBody
public String getUserById(@PathVariable("id") int id) {
    return "User ID: " + id;
}
```
- **@RequestParam**：
用于获取请求参数的值，适用于获取普通的请求参数。例如，对于请求“/user?name=John”，可以这样获取参数“name”的值：
```java
@GetMapping("/user")
@ResponseBody
public String getUserByName(@RequestParam("name") String name) {
    return "User Name: " + name;
}
```
- **@RequestBody**：
用于将请求体中的数据绑定到方法的参数上，通常用于处理JSON、XML等格式的数据。例如，前端发送JSON格式的用户数据，后端可以这样接收：
```java
@PostMapping("/user")
@ResponseBody
public String createUser(@RequestBody User user) {
    // 处理用户数据
    return "User created successfully";
}
```