---
title: MyBatis-Plus
date: 2026-03-31
icon: /assets/icon/mybatis.png
order: 6
---

## MyBatis-Plus 和 MyBatis 有什么区别？

1. **功能增强**

   - MyBatis-Plus 在 MyBatis 基础上做了增强，不改变原功能
   - 内置通用 CRUD，不用写 mapper.xml

2. **简化开发**

   - 提供通用的 Mapper 和 Service，CRUD 方法直接用
   - 支持条件构造器，不用手写 SQL

3. **代码生成**

   - 提供代码生成器，自动生成 entity、mapper、service

## MyBatis-Plus 常用注解有哪些？

1. **@TableName**

   指定实体类对应的表名

   ```java
   @TableName("sys_user")
   public class User { ... }
   ```

2. **@TableId**

   标记主键字段

   ```java
   @TableId(type = IdType.AUTO)  // 自增
   private Long id;
   ```

3. **@TableField**

   标记普通字段映射

   ```java
   @TableField("user_name")
   private String userName;

   @TableField(exist = false)  // 非数据库字段
   private String tempField;
   ```

4. **@Version**

   乐观锁版本号字段

5. **@TableLogic**

   逻辑删除字段，自动处理删除操作

## MyBatis-Plus 如何实现分页？

1. **配置分页插件**

   ```java
   @Bean
   public MybatisPlusInterceptor mybatisPlusInterceptor() {
       MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
       interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
       return interceptor;
   }
   ```

2. **使用 Page 对象**

   ```java
   Page<User> page = new Page<>(1, 10);  // 第1页，每页10条
   IPage<User> result = userMapper.selectPage(page, null);
   ```

3. **自动拼接 LIMIT**

   框架自动在 SQL 后面拼接 `LIMIT offset, size`

## MyBatis-Plus 条件构造器怎么用？

1. **QueryWrapper（查询）**

   ```java
   QueryWrapper<User> wrapper = new QueryWrapper<>();
   wrapper.eq("name", "张三")
          .like("email", "@qq.com")
          .ge("age", 18);

   List<User> users = userMapper.selectList(wrapper);
   ```

2. **UpdateWrapper（更新）**

   ```java
   UpdateWrapper<User> wrapper = new UpdateWrapper<>();
   wrapper.set("status", 1).eq("id", 1L);

   userMapper.update(null, wrapper);
   ```

3. **LambdaWrapper（类型安全）**

   ```java
   LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
   wrapper.eq(User::getName, "张三")
          .gt(User::getAge, 18);
   ```

## MyBatis-Plus 如何批量插入？

1. **使用 saveBatch（Service 方法）**

   ```java
   userService.saveBatch(userList);
   ```

2. **使用 insertBatchSomeColumn（扩展方法）**

   需要注入 `SqlInjector`，性能更高

3. **注意**

   批量插入本质还是循环插入，没有真正的批量 SQL
   如需真正的批量 INSERT，需要手写 XML

## MyBatis-Plus 主键策略有哪些？

1. **IdType.AUTO**

   数据库自增（MySQL 默认）

2. **IdType.ASSIGN_ID**

   雪花算法生成 ID（Long 类型），分布式唯一

3. **IdType.ASSIGN_UUID**

   生成 UUID 字符串

4. **IdType.INPUT**

   手动输入 ID
