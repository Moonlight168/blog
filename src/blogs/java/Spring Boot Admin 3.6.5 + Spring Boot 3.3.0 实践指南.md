---
title: Spring Boot Admin 3.6.5 + Spring Boot 3.3.0 实践指南（集成 Nacos & InstanceId JSON 修复）
date: 2025-09-28
category: Java
---

本文记录了 **Spring Boot Admin (SBA) 3.6.5** 在 **Spring Boot 3.3.0** 环境下的实践过程，结合 **Nacos 服务注册**，并解决了 `InstanceId` 序列化错误的问题。文章包含完整的 **项目依赖、application.yml 配置、核心代码** 和 **运行效果说明**。


## 一、项目环境

| 项目组件                       | 版本         |
| -------------------------- | ---------- |
| Spring Boot                | 3.3.0      |
| Spring Boot Admin Server   | 3.6.5      |
| Spring Boot Admin Client   | 3.6.5      |
| Spring Cloud Alibaba Nacos | 2023.0.1.0 |
| Java                       | 17+        |
| Maven                      | 3.9+       |


## 二、项目依赖

### 1. Admin Server (`taopiaopiao-admin-service/pom.xml`)

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-server</artifactId>
    <version>3.6.5</version>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### 2. Admin Client (`taopiaopiao-order-service/pom.xml`)

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
    <version>3.6.5</version>
</dependency>

<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

---

## 三、Admin Server 配置 (`application.yml`)

```yaml
server:
  port: 10082

spring:
  application:
    name: ${prefix.distinction.name:taopiaopiao}-admin-service
  boot:
    admin:
      ui:
        title: 服务监控中心
        brand: <span>服务监控中心</span>
      monitor:
        default-timeout: 15000
        status-interval: 30000
        status-lifetime: 30000
      discovery:
        enabled: true
  cloud:
    nacos:
      discovery:
        server-addr: 192.168.0.133:8848
        username: nacos
        password: nacos
  security:
    user:
      name: admin
      password: admin

management:
  server:
    port: 10082
  endpoint:
    health:
      show-details: always
  endpoints:
    web:
      exposure:
        include: '*'

logging:
  level:
    de.codecentric.boot.admin.client.registration: DEBUG
```

### 配置说明

| 配置项                                              | 作用                 |
| ------------------------------------------------ | ------------------ |
| `server.port`                                    | Admin Server 端口    |
| `spring.application.name`                        | Admin 服务名          |
| `spring.boot.admin.ui.title`                     | SBA 页面标题           |
| `spring.boot.admin.ui.brand`                     | 左上角品牌              |
| `spring.boot.admin.monitor.*`                    | 实例状态检查间隔、超时时间、生命周期 |
| `spring.boot.admin.discovery.enabled`            | 启用服务发现模式           |
| `spring.cloud.nacos.discovery.server-addr`       | Nacos 注册中心地址       |
| `spring.cloud.nacos.discovery.username/password` | Nacos 登录账号         |
| `spring.security.user.name/password`             | Admin Server 登录账号  |
| `management.endpoints.web.exposure.include`      | 公开所有 actuator 接口   |


## 四、Admin Client 配置 (`application.yml`)

```yaml
spring:
  application:
    name: ${prefix.distinction.name:taopiaopiao}-order-service
  cloud:
    nacos:
      discovery:
        server-addr: 192.168.0.133:8848
        username: nacos
        password: nacos
        metadata:
          management.port: 8081
          management.context-path: /actuator

server:
  port: 8081

management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: always
    beans:
      enabled: true
    caches:
      enabled: true
```


## 五、Security 配置（Admin Server）

```java
@Configuration
public class SecurityConfig {

    private final String adminContextPath;

    public SecurityConfig(AdminServerProperties adminServerProperties) {
        this.adminContextPath = adminServerProperties.getContextPath();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        SavedRequestAwareAuthenticationSuccessHandler successHandler = 
            new SavedRequestAwareAuthenticationSuccessHandler();
        successHandler.setTargetUrlParameter("redirectTo");
        successHandler.setDefaultTargetUrl(adminContextPath + "/");

        http
            .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                .requestMatchers(adminContextPath + "/assets/**").permitAll()
                .requestMatchers(adminContextPath + "/login").permitAll()
                .requestMatchers("/actuator/health/**").permitAll()
                .requestMatchers("/actuator/info").permitAll()
                .requestMatchers("/actuator/beans").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage(adminContextPath + "/login")
                .successHandler(successHandler)
            )
            .logout(logout -> logout.logoutUrl(adminContextPath + "/logout"))
            .httpBasic(withDefaults())
            .csrf(csrf -> csrf.ignoringRequestMatchers(
                "/instances",
                "/actuator/**",
                "/v3/api-docs/**",
                adminContextPath + "/instances/**",
                adminContextPath + "/actuator/**",
                adminContextPath + "/v3/api-docs/**"
            ));

        return http.build();
    }
}
```


## 六、解决 InstanceId 序列化错误

SBA 默认使用 `InstanceId` 对象作为标识，Instance.of()返回的是一个默认的 `InstanceId` 对象，需要转换成字符串，需要自定义 Jackson 模块，否则会造成无法读取到Instance detail：

```java
public class JacksonCustomEnhance implements Jackson2ObjectMapperBuilderCustomizer {
    @Override
    public void customize(Jackson2ObjectMapperBuilder jacksonObjectMapperBuilder) {
        SimpleModule module = new SimpleModule();

        // InstanceId 序列化为字符串
        module.addSerializer(InstanceId.class, new JsonSerializer<InstanceId>() {
            @Override
            public void serialize(InstanceId value, JsonGenerator gen, SerializerProvider serializers) 
                    throws IOException {
                gen.writeString(value.getValue());
            }
        });

        // InstanceId 反序列化
        module.addDeserializer(InstanceId.class, new JsonDeserializer<InstanceId>() {
            @Override
            public InstanceId deserialize(JsonParser p, DeserializationContext ctxt) 
                    throws IOException {
                return InstanceId.of(p.getValueAsString());
            }
        });

        jacksonObjectMapperBuilder.modules(module);
    }
}
```

### 配置 Bean 注入

```java
@Configuration
public class AdminConfig {

    @Primary
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomEnhance(){
        return new JacksonCustomEnhance();
    }

    @Bean
    public InstanceIdGenerator instanceIdGenerator() {
        return registration -> InstanceId.of(registration.getName() + ":" + registration.getServiceUrl());
    }
}
```


## 七、启动顺序与运行效果

1. 启动 **Nacos** (`192.168.0.133:8848`)
2. 启动 **Admin Server** (`10082`)
3. 启动 **Order Service Client** (`8081`)

### 页面展示效果

* **Dashboard**：显示注册的微服务列表
* **实例状态**：UP/DOWN、健康信息
* **元数据**：group、version 等
* **安全登录**：Admin Server 需要输入账号密码

✅ 使用自定义 `JacksonCustomEnhance`，解决了 InstanceId 序列化为 JSON 错误问题。


## 八、总结

* Spring Boot Admin 3.x 完全兼容 Spring Boot 3.3
* 集成 Nacos 可自动发现服务
* Security 集成提供登录保护
* 自定义 Jackson 序列化解决 `InstanceId` 报错问题
* 配置灵活，可扩展通知、健康指标等功能
