---
title: PageHelper 与 MyBatis-Plus 分页对比
date: 2025-11-19
tags: [MyBatis, PageHelper, MyBatis-Plus, 数据库]
category: 数据库
---

## 1. PageHelper 分页 

### 1.1 使用方法 

```java 
PageHelper.startPage(pageNum, pageSize); 
List<User> list = userMapper.selectAll(); 
PageInfo<User> pageInfo = new PageInfo<>(list); 
``` 

要点： 

* **必须在查询前调用** `startPage`。 
* 返回结果自己封装或用 `PageInfo`。 

### 1.2 底层实现 

**核心机制：MyBatis 插件（Interceptor） + ThreadLocal** 

1. `startPage()` 往 ThreadLocal 放入分页参数。 
2. PageHelper 作为 MyBatis 拦截器，拦截 `Executor.query()`。 
3. 在执行 SQL 前自动给原 SQL 加上： 

   * `select count(*) ...` 
   * `limit ?, ?` 
4. 执行两次 SQL：一次 count，一次分页查询。 
5. 清除 ThreadLocal。 

特点：**代理 SQL、自动拼接 limit、对原 Mapper 无侵入。** 


## 2. MyBatis-Plus 分页 

### 2.1 使用方法 

配置分页插件： 

```java 
@Bean 
public MybatisPlusInterceptor mybatisPlusInterceptor() { 
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor(); 
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor()); 
    return interceptor; 
} 
``` 

使用： 

```java 
Page<User> page = new Page<>(pageNum, pageSize); 
IPage<User> result = userMapper.selectPage(page, null); 
``` 

要点： 

* 使用 MyBatis-Plus 提供的 `Page` / `IPage`。 
* 也支持自定义分页查询 XML。 

### 2.2 底层实现 

**核心机制：MyBatis 拦截器 + 自动分页 SQL 改写 + 注入分页模型** 

1. 拦截器拦截 `Executor.query()`。 
2. 判断参数是否是 `Page`，若是则执行分页逻辑。 
3. 自动生成： 

   * count SQL 
   * limit SQL 
4. 将分页信息写回 `Page` 对象。 

特点：与 MyBatis-Plus 的 CRUD 体系集成度更高。 


## 3. 两者对比

| 项目         | PageHelper                   | MyBatis-Plus 分页         | 
| ---------- | ---------------------------- | ----------------------- | 
| **是否独立使用** | 是，任何 MyBatis 项目可用            | 依赖 MyBatis-Plus         | 
| **调用方式**   | 先 `startPage()` 后执行查询        | 参数传入 `Page` 对象          | 
| **分页信息**   | 放在 `PageInfo` 中              | 直接在 `Page` 中            | 
| **底层原理**   | 通过 ThreadLocal 捕获分页参数并改写 SQL | 根据参数类型识别分页并改写 SQL       | 
| **侵入性**    | 调用顺序敏感，容易踩坑                  | 语义更明确，类型安全              | 
| **扩展能力**   | 只做分页                         | 与 MyBatis-Plus 生态深度集成   | 
| **推荐场景**   | 老项目、纯 MyBatis 项目             | 新项目、使用 MyBatis-Plus 的项目 | 

## 4. 简短结论 

* **PageHelper**：分页插件"老大哥"，适用于老项目；通过 `startPage` + 拦截器实现，使用简单但依赖调用顺序。 
* **MyBatis-Plus 分页**：生态更完善，参数强类型，更不容易写错，推荐新项目使用。