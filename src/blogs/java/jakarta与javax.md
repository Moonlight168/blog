---
title: Jakarta EE 与 Java EE：javax到jakarta的演进之路
date: 2025-11-17
category: Java
---

# Jakarta EE 与 Java EE：javax到jakarta的演进之路

## 前言

在Java企业级开发中，我们经常听到`javax`和`jakarta`两个包名。本文将详细介绍它们的历史背景、主要区别以及在实际项目中的应用。

## 1. 历史背景

### 1.1 Java EE的诞生
- **1999年**: Java 2 Platform, Enterprise Edition (J2EE) 发布
- **2005年**: J2EE 改名为 Java Platform, Enterprise Edition (Java EE)
- **2006年**: 包名从 `com.sun.*` 迁移到 `javax.*`

### 1.2 Oracle捐赠给Eclipse Foundation
- **2017年**: Oracle将Java EE捐赠给Eclipse Foundation
- **2018年**: Java EE改名为Jakarta EE
- **2019年**: 包名从 `javax.*` 迁移到 `jakarta.*`

## 2. 包名变化对比

### 2.1 核心包名映射

| Java EE (javax) | Jakarta EE (jakarta) | 说明 |
|----------------|---------------------|------|
| `javax.servlet.*` | `jakarta.servlet.*` | Servlet API |
| `javax.persistence.*` | `jakarta.persistence.*` | JPA |
| `javax.validation.*` | `jakarta.validation.*` | Bean Validation |
| `javax.ws.rs.*` | `jakarta.ws.rs.*` | JAX-RS |
| `javax.faces.*` | `jakarta.faces.*` | JSF |
| `javax.enterprise.*` | `jakarta.enterprise.*` | CDI |
| `javax.ejb.*` | `jakarta.ejb.*` | EJB |
| `javax.jms.*` | `jakarta.jms.*` | JMS |

### 2.2 主要区别

#### 包名差异
```java
// Java EE (已废弃)
import javax.servlet.http.HttpServlet;
import javax.persistence.Entity;
import javax.validation.constraints.NotNull;

// Jakarta EE (推荐使用)
import jakarta.servlet.http.HttpServlet;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
```

## 3. 版本对应关系

### 3.1 Java EE版本演进
- Java EE 8 (javax.*) - 2017年发布，最后一个Oracle版本
- Jakarta EE 9 (jakarta.*) - 2020年发布，首个Eclipse Foundation版本
- Jakarta EE 10 (jakarta.*) - 2022年发布
- Jakarta EE 11 (jakarta.*) - 2024年发布

### 3.2 Spring Framework兼容性

| Spring Framework 版本 | Java EE 版本 | 包装名 |
|---------------------|-------------|--------|
| Spring 5.x | Java EE 8 | javax.* |
| Spring 6.x | Jakarta EE 9 | jakarta.* |
| Spring 7.x+ | Jakarta EE 10+ | jakarta.* |

## 4. 实际应用场景

### 4.1 使用Java EE (javax) 的场景

#### 遗留系统维护
```java
// 仍在维护的Java EE 8项目
@Stateless
public class UserService {
    @PersistenceContext
    private EntityManager em;
    
    @NotNull
    private String username;
}
```

#### 传统应用服务器
- WebLogic 12c
- WebSphere 8.5
- GlassFish 4.x

### 4.2 使用Jakarta EE (jakarta) 的场景

#### 新项目开发
```java
// 新开发的Jakarta EE项目
@Stateless
public class UserService {
    @PersistenceContext
    private EntityManager em;
    
    @NotNull
    private String username;
}
```

#### 现代应用服务器
- WildFly 26+
- Tomcat 10+
- Payara 6+
- GlassFish 7+

## 5. Spring Boot中的选择

### 5.1 Spring Boot 2.x (使用javax)
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

```java
// Java EE 8 风格
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.persistence.Entity;

@Entity
public class User {
    @Valid
    @NotNull
    private String name;
}
```

### 5.2 Spring Boot 3.x (使用jakarta)
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

```java
// Jakarta EE 9+ 风格
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.persistence.Entity;

@Entity
public class User {
    @Valid
    @NotNull
    private String name;
}
```

## 6. 迁移指南

### 6.1 从javax迁移到jakarta

#### 6.1.1 依赖更新
```xml
<!-- Spring Boot 2.x → 3.x -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

#### 6.1.2 包名替换
使用IDE的全局替换功能：
```
查找: import javax\.
替换为: import jakarta.
```

#### 6.1.3 具体替换规则
```java
// Servlet API
javax.servlet.http.HttpServletRequest → jakarta.servlet.http.HttpServletRequest
javax.servlet.http.HttpServletResponse → jakarta.servlet.http.HttpServletResponse

// Validation API
javax.validation.constraints.NotNull → jakarta.validation.constraints.NotNull
javax.validation.Valid → jakarta.validation.Valid

// JPA
javax.persistence.Entity → jakarta.persistence.Entity
javax.persistence.PersistenceContext → jakarta.persistence.PersistenceContext
```

### 6.2 自动化迁移工具

#### Jakarta EE Migration Tool
```bash
# 使用Eclipse Transform Tool
wget https://download.eclipse.org/ee4j/jakartaee10/jakartaee10-staged-m2.zip
unzip jakartaee10-staged-m2.zip
```

#### IDE插件
- Eclipse: Jakarta EE Developer Tools
- IntelliJ IDEA: Jakarta EE support plugin

## 7. 常见问题

### 7.1 版本冲突
```xml
<!-- 避免同时包含两个版本 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>jakarta.validation</groupId>
            <artifactId>jakarta.validation-api</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 7.2 依赖传递问题
```xml
<!-- 明确指定版本 -->
<dependency>
    <groupId>jakarta.persistence</groupId>
    <artifactId>jakarta.persistence-api</artifactId>
    <version>3.1.0</version>
</dependency>
```

## 8. 最佳实践

### 8.1 新项目建议
1. **直接使用Jakarta EE 9+**
2. **升级到Spring Boot 3.x**
3. **选择现代应用服务器**

### 8.2 遗留项目维护
1. **评估迁移成本**
2. **分阶段迁移**
3. **保持兼容性测试**

### 8.3 开发建议
```java
// 推荐：使用最新的Jakarta EE规范
package com.example.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@ApplicationScoped
@Transactional
public class UserService {
    
    @Inject
    private EntityManager entityManager;
    
    public void createUser(String name) {
        // 业务逻辑
    }
}
```

## 9. 总结

- **javax**: 传统的Java EE包名，Oracle时代使用，已不再更新
- **jakarta**: 新的Jakarta EE包名，Eclipse Foundation维护，活跃发展
- **选择建议**: 新项目使用jakarta，遗留项目根据需要决定是否迁移
- **未来趋势**: jakarta将成为企业级Java开发的标准

## 10. 参考资源

- [Jakarta EE官网](https://jakarta.ee/)
- [Java EE历史](https://en.wikipedia.org/wiki/Java_Platform,_Enterprise_Edition)
- [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide)
- [Jakarta EE 10规范](https://jakarta.ee/specifications/)