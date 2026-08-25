---
title: Mybatis
date: 2026-03-23
icon: /assets/icon/mybatis.png
order: 4
---

## Hibernate 和 MyBatis 有什么区别？

**锚点**：`手写 SQL vs 自动生成：MyBatis 灵活控 SQL，Hibernate 快速开发`

| 维度 | Hibernate | MyBatis |
|------|-----------|---------|
| SQL 编写 | 自动生成，无需手写，适合快速开发 | 手写 SQL，灵活，适合复杂查询和性能优化 |
| 映射方式 | 全自动 ORM 映射 | 半自动映射，手动配置映射关系 |
| 缓存 | 内置强一级、二级缓存 | 一级缓存，二级需手动配置 |
| 适用场景 | 需求变化小、数据结构稳定 | 对 SQL 控制要求高、业务逻辑复杂 |

事务管理：两者都支持 JDBC 和 Spring 事务管理。

## MyBatis 是如何进行分页的？

**锚点**：`三种：手动 SQL 分页 / PageHelper 插件 / MyBatis-Plus 内置`

MyBatis 本身不支持分页语法，三种实现方式：

1. **手动分页**：SQL 中直接使用数据库分页语法（如 MySQL `LIMIT offset, size`）
2. **PageHelper 插件（第三方）**
3. **MyBatis-Plus 内置分页**

- [PageHelper 与 MyBatis-Plus 分页](/blogs/数据库/pagehelper与mybatis-plus分页.html)

## MyBatis 字段名与数据库列名不一致时的映射方式总结

**锚点**：`四选一：SQL 别名 / @Results / resultMap / 驼峰自动映射`

1. **原生 MyBatis**：
   - SQL 别名：`SELECT user_name AS userName FROM user`
   - `@Results` 注解：

```java
@Select("SELECT user_id, user_name FROM user")
@Results({
    @Result(property = "userId", column = "user_id"),
    @Result(property = "userName", column = "user_name")
})
List<User> getAllUsers();
```

   - `<resultMap>` 映射：

```xml
<resultMap id="userMap" type="User">
  <result property="userId" column="user_id"/>
  <result property="userName" column="user_name"/>
</resultMap>
```

   - 驼峰自动映射：`map-underscore-to-camel-case: true`，实体 `userName` 自动映射 `user_name`
2. **MyBatis-Plus**：`@TableName` 指定表名、`@TableField("user_name")` 指定字段映射

## MyBatis 的缓存机制？

**锚点**：`一级缓存 SqlSession 内默认开；二级缓存 Mapper 级默认关需 <cache/>`

1. **一级缓存（本地缓存）**：默认开启，作用范围同一个 `SqlSession`；相同查询第二次从缓存读；`SqlSession` 关闭后失效
2. **二级缓存（全局缓存）**：默认关闭，`mapper.xml` 中 `<cache/>` 显式开启；作用范围同一个 Mapper 的多个 SqlSession 共享；可配实现类、过期时间、大小、清除策略
3. **注意事项**：更新操作清空相关缓存；二级缓存对象必须实现 `Serializable`；与 Spring 集成推荐第三方缓存（EhCache、Redis）配合

```xml
<mapper namespace="com.example.mapper.UserMapper">
  <cache/>
</mapper>
```

## MP中的selectOne()方法和selectList()方法的区别？

**锚点**：`selectOne 单条（超 1 条抛异常），selectList 多条集合`

1. **返回结果**：`selectOne()` 返回单个实体，结果必须 1 条或 0 条；`selectList()` 返回 List，0/1/多条都行
2. **异常处理**：`selectOne()` 结果超 1 条抛 `TooManyResultsException`；`selectList()` 不抛，返回全部匹配
3. **使用场景**：`selectOne()` 唯一结果（按主键查）；`selectList()` 条件查询、列表查询

## MyBatis `#{}` 和 `${}` 的区别？

**锚点**：`#{} 预编译占位符防注入，${} 字符串拼接有风险`

| `#{}` | `${}` |
|-------|-------|
| 预编译占位符 `?`，**防注入** | 字符串直接拼接，有注入风险 |
| 自动加引号 | 原样拼接 |

必须用 `${}`：动态表名/列名/ORDER BY，**必须配合白名单校验**。

→ [回答历史](/private/series/答题历史/框架/mybatis-答题记录.md#mybatis-和-的区别)
