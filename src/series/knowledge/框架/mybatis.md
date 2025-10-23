---
title: Mybatis
icon: /assets/icon/mybatis.png
order: 4
---

## Hibernate 和 MyBatis 有什么区别？

**回答：**

* **SQL编写：**

    * Hibernate：自动生成SQL，无需手写SQL，适合快速开发。
    * MyBatis：需要手写SQL，灵活性高，适合复杂查询和性能优化。

* **映射方式：**

    * Hibernate：全自动ORM映射。
    * MyBatis：半自动映射，需要手动配置映射关系。

* **缓存机制：**

    * Hibernate：内置强大的一级、二级缓存机制。
    * MyBatis：提供一级缓存，二级缓存需手动配置。

* **事务管理：**

    * 都支持JDBC和Spring事务管理。

* **适用场景：**

    * Hibernate：适合开发需求变化小、数据结构稳定的项目。
    * MyBatis：适合对SQL控制要求高、业务逻辑复杂的项目。

## MyBatis 是如何进行分页的？

**回答：**
MyBatis 本身不支持分页语法，但可以通过以下两种方式实现分页：

* **手动分页：** 在 SQL 语句中直接使用数据库的分页语法（如 MySQL 的 `LIMIT offset, size`）进行分页。
* **使用分页插件：** 常用插件是 **PageHelper**，只需在查询前调用 `PageHelper.startPage(pageNum, pageSize)` 即可自动生成分页SQL并封装分页结果。


## MyBatis 字段名与数据库列名不一致时的映射方式总结

#### 1. 原生 MyBatis 的处理方式：

* **方式一：使用 SQL 别名**

  ```sql
  SELECT user_name AS userName FROM user
  ```

* **方式二：使用 `@Results` 注解**

  ```java
  @Select("SELECT user_id, user_name FROM user")
  @Results({
      @Result(property = "userId", column = "user_id"),
      @Result(property = "userName", column = "user_name")
  })
  List<User> getAllUsers();
  ```

* **方式三：使用 `<resultMap>` 映射**

  ```xml
  <resultMap id="userMap" type="User">
    <result property="userId" column="user_id"/>
    <result property="userName" column="user_name"/>
  </resultMap>
  ```

* **方式四：配置驼峰命名自动映射**

  ```yaml
  mybatis:
    configuration:
      map-underscore-to-camel-case: true
  ```

  实体字段使用驼峰命名，如 `userName`，可自动映射 `user_name`。


#### 2. MyBatis-Plus 的处理方式（**MyBatis-Plus 专有**）：

* **使用 `@TableName` 指定表名**

  ```java
  @TableName("user")
  public class User { ... }
  ```

* **使用 `@TableField` 指定字段映射**

  ```java
  @TableField("user_name")
  private String userName;
  ```

## MyBatis 的缓存机制？

**回答：**
MyBatis 提供两级缓存机制：

* **一级缓存（本地缓存）：**

  * 默认开启，作用范围是同一个 `SqlSession`。
  * 相同查询在同一个 `SqlSession` 中执行多次时，第二次会从缓存中读取。
  * `SqlSession` 关闭后，一级缓存失效。

* **二级缓存（全局缓存）：**

  * 默认关闭，需要在 `mapper.xml` 中通过 `<cache/>` 显式开启。
  * 作用范围是同一个 Mapper 的多个 `SqlSession` 之间共享。
  * 可配置缓存实现类、过期时间、大小、清除策略等。

* **使用示例（开启二级缓存）：**

  ```xml
  <mapper namespace="com.example.mapper.UserMapper">
    <cache/>
  </mapper>
  ```

* **注意事项：**

  * 更新操作会清空相关缓存。
  * 二级缓存中的对象必须实现 `Serializable` 接口。
  * 与 Spring 集成时，推荐使用第三方缓存（如 EhCache、Redis）配合二级缓存使用。
