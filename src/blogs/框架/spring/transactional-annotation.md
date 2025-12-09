---
title: "@Transactional注解解析"
date: 2025-12-07
categories:
  - 框架
  - Spring
tags:
  - Spring
  - 事务管理
  - 注解
---

# @Transactional注解四种机制详解

@Transactional注解是Spring框架中用于管理事务的核心注解，通过四种机制控制事务行为。

## 1. 传播机制（Propagation）

**作用**：控制事务方法之间的调用关系

**常用场景**：
- `REQUIRED`（默认）：有事务就加入，没有就创建新事务
  ```java
  @Transactional(propagation = Propagation.REQUIRED)
  public void methodA() {
      // 如果methodB有事务，就加入；没有就创建新事务
      methodB();
  }
  ```
- `REQUIRES_NEW`：总是创建新事务，不受调用方影响
  ```java
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void logOperation() {
      // 总是新事务，即使调用方有事务也会挂起
  }
  ```

## 2. 隔离级别（Isolation）

**作用**：控制事务之间的数据可见性，解决并发事务可能出现的问题

**隔离级别对比表**：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 | 常用场景 |
|---------|------|------------|------|------|----------|
| **READ_UNCOMMITTED** | ✔ 可能 | ✔ 可能 | ✔ 可能 | 最高 | 极少使用 |
| **READ_COMMITTED** | ✘ 避免 | ✔ 可能 | ✔ 可能 | 较高 | Oracle默认，大多数场景 |
| **REPEATABLE_READ** | ✘ 避免 | ✘ 避免 | ✔ 可能 | 中等 | MySQL默认，金融场景 |
| **SERIALIZABLE** | ✘ 避免 | ✘ 避免 | ✘ 避免 | 最低 | 高一致性要求 |

**并发问题解释及产生原因**：

### 1. 脏读（Dirty Read）
**定义**：读取到未提交的事务数据
**产生原因**：事务A读取了事务B尚未提交的数据，如果事务B回滚，事务A读取的数据就是无效的
**示例**：
```java
// 事务A
@Transactional(isolation = Isolation.READ_UNCOMMITTED)
public void readUncommittedData() {
    // 读取到用户余额为1000元（事务B已修改但未提交）
    int balance = accountService.getBalance(userId);
    // 此时事务B回滚，余额实际仍为500元
    // 事务A读取到了"脏"数据
}

// 事务B
public void updateBalance() {
    accountService.setBalance(userId, 1000); // 修改余额
    // 发生异常，事务回滚
    throw new RuntimeException();
}
```

### 2. 不可重复读（Non-repeatable Read）
**定义**：同一事务中多次读取同一数据，结果不同
**产生原因**：在事务A的两次读取之间，事务B修改并提交了该数据
**示例**：
```java
// 事务A
@Transactional(isolation = Isolation.READ_COMMITTED)
public void checkBalance() {
    int balance1 = accountService.getBalance(userId); // 第一次读取：500元
    
    // 事务B在此期间修改余额并提交
    Thread.sleep(1000);
    
    int balance2 = accountService.getBalance(userId); // 第二次读取：800元
    // 同一事务内两次读取结果不同，不可重复读
}

// 事务B（并发执行）
@Transactional
public void updateBalance() {
    accountService.setBalance(userId, 800); // 修改余额并提交
}
```

### 3. 幻读（Phantom Read）
**定义**：同一事务中多次查询，结果集行数不同
**产生原因**：在事务A的两次查询之间，事务B插入或删除了符合查询条件的记录
**示例**：
```java
// 事务A
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void countUsers() {
    List<User> users1 = userService.findByAgeGreaterThan(18); // 第一次查询：10条记录
    
    // 事务B在此期间插入新记录并提交
    Thread.sleep(1000);
    
    List<User> users2 = userService.findByAgeGreaterThan(18); // 第二次查询：11条记录
    // 同一事务内两次查询结果集行数不同，幻读
}

// 事务B（并发执行）
@Transactional
public void addUser() {
    User newUser = new User("张三", 20);
    userService.save(newUser); // 插入新记录并提交
}
```

**常用级别示例**：
```java
// 读已提交：避免脏读，允许不可重复读
@Transactional(isolation = Isolation.READ_COMMITTED)
public void transferMoney() {
    // 适用于大多数业务场景
}

// 可重复读：避免脏读和不可重复读
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void batchUpdate() {
    // 适用于需要多次读取同一数据的场景
}

// 串行化：最高隔离级别，完全避免并发问题
@Transactional(isolation = Isolation.SERIALIZABLE)
public void criticalOperation() {
    // 适用于对一致性要求极高的场景
}
```

**数据库默认隔离级别**：
- **MySQL**：REPEATABLE_READ
- **Oracle**：READ_COMMITTED
- **SQL Server**：READ_COMMITTED
- **PostgreSQL**：READ_COMMITTED

## 3. 只读属性（ReadOnly）

**作用**：标记事务为只读，优化查询性能

**使用示例**：
```java
@Transactional(readOnly = true)  // 告诉数据库这是查询操作
public List<User> findAllUsers() {
    return userRepository.findAll();
}
```

## 4. 回滚规则（Rollback For）

**作用**：指定哪些异常会触发事务回滚

**默认规则**：
- RuntimeException和Error：自动回滚
- Checked Exception：不回滚

**自定义规则**：
```java
@Transactional(
    rollbackFor = {BusinessException.class, ValidationException.class},
    noRollbackFor = {DataNotFoundException.class}
)
public void processData() {
    // BusinessException和ValidationException会回滚
    // DataNotFoundException不会回滚
}
```

## 总结

@Transactional注解通过这四种机制提供了灵活的事务管理能力，合理配置这些属性可以有效保证数据一致性，同时优化系统性能。在实际开发中，应根据业务需求选择合适的传播机制和隔离级别，并正确设置只读属性和回滚规则。