---
title: MySQL索引详解
date: 2025-11-27
categories: ["数据库"]
tags: ["MYSQL"]
---

# MySQL索引详解

## 前言
MySQL索引就像是一本书的目录，它让数据库能够快速找到所需数据，而不用扫描整个表。合理的索引设计是数据库性能优化的核心技能之一。

## 1. 索引基础概念

### 1.1 什么是索引？
索引是一种特殊的数据结构，存储着表中一列或多列的值以及对应的物理地址引用。就像图书馆的目录系统，让我们能够快速找到目标图书的位置。

### 1.2 索引的工作原理
```
原始表数据：
┌─────┬─────────┬─────────┐
│  id │   name  │  email  │
├─────┼─────────┼─────────┤
│  1  │  张三   │zhang@1  │
│  2  │  李四   │li@2     │
│  3  │  王五   │wang@3   │
│  4  │  赵六   │zhao@4   │
└─────┴─────────┴─────────┘

索引结构（B+Tree）：
┌─────────┬─────────┐
│  key值  │  指针   │
├─────────┼─────────┤
│    1    │  指向1  │
│    2    │  指向2  │
│    3    │  指向3  │
│    4    │  指向4  │
└─────────┴─────────┘

查找过程：查找key=3 → 找到指针 → 直接访问目标记录
```

### 1.3 索引的核心优势
- **加速查询**：大幅减少数据扫描量
- **减少I/O操作**：通过索引直接定位数据位置
- **提高排序性能**：索引天然有序，可加速ORDER BY操作
- **加速表连接**：在JOIN操作中，索引能显著提升性能

## 2. 索引分类

### 2.1 按数据结构分类

#### B+Tree 索引（默认类型）
```sql
-- 创建B+Tree索引（MySQL默认）
CREATE INDEX idx_name ON users(name);
```

**特点：**
- 支持等值查询：`WHERE name = '张三'`
- 支持范围查询：`WHERE id > 10 AND id < 100`
- 支持排序：`ORDER BY name`
- 支持前缀匹配：`WHERE name LIKE '张%'`
- 所有数据存储在叶子节点，查询效率稳定

#### 哈希索引
```sql
-- 创建哈希索引（Memory和InnoDB支持）
CREATE TABLE test_hash (
    id INT,
    name VARCHAR(20),
    INDEX USING HASH (name)
) ENGINE = MEMORY;
```

**特点：**
- 查询速度极快：O(1)时间复杂度
- 不支持范围查询：无法进行 `>`, `<` 操作
- 不支持排序：哈希无序
- 只支持等值查询：`WHERE name = '张三'`

#### 全文索引
```sql
-- 创建全文索引
CREATE FULLTEXT INDEX idx_content ON articles(content);
```

**特点：**
- 专为文本搜索设计
- 支持自然语言搜索
- 不支持中文（需要特殊配置）

### 2.2 按逻辑特性分类

#### 逻辑索引类型对比表

| 索引类型 | 唯一性 | 允许NULL | 查询性能 | 适用场景 | 数量限制 |
|---------|--------|----------|----------|----------|----------|
| **主键** |  唯一 |  不允许 |  最优 | 主键查询 | 每表1个 |
| **唯一** |  唯一 |  允许 |  很好 | 防止重复数据 | 每表多个 |
| **普通** |  可重复 |  允许 |  一般 | 普通查询加速 | 每表多个 |
| **复合** |  可重复 |  允许 |  依赖列数 | 多条件查询 | 每表多个 |

#### 主键索引（Primary Key）
```sql
-- 创建表时指定主键索引
CREATE TABLE users (
    id INT PRIMARY KEY,  -- 自动创建主键索引
    name VARCHAR(50),
    email VARCHAR(100)
);
```

**特点：**
- 唯一且非空：每个表只能有一个主键
- 自动创建：主键列自动创建唯一索引
- 查询最快：主键索引是最优的索引

#### 唯一索引（Unique Index）
```sql
-- 创建唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);
```

**特点：**
- 值唯一：不允许重复值（除了NULL）
- 加速查询：优化等值查找
- 数据完整性：防止重复数据

#### 普通索引（Normal Index）
```sql
-- 创建普通索引
CREATE INDEX idx_name ON users(name);
```

**特点：**
- 无唯一性限制：值可以重复
- 加速查询：优化一般查询
- 适用性广：最常用的索引类型

#### 复合索引（Composite Index）
```sql
-- 创建复合索引
CREATE INDEX idx_name_email ON users(name, email);

-- 查询优化建议
-- 最优：使用完整索引
SELECT * FROM users WHERE name = '张三' AND email = 'zhang@1.com';

-- 部分使用：只使用name列
SELECT * FROM users WHERE name = '张三';

-- 无法使用：跳过name列
SELECT * FROM users WHERE email = 'zhang@1.com';
```

**最左前缀原则：**
- `WHERE name = 'xxx'` - 使用索引
- `WHERE name = 'xxx' AND email = 'xxx'` - 使用索引
- `WHERE email = 'xxx'` - 不使用索引

## 3. 索引的创建和管理

### 3.1 创建索引

#### 创建表时创建索引
```sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    category_id INT,
    created_at TIMESTAMP,
    -- 索引定义
    INDEX idx_name (name),           -- 普通索引
    UNIQUE INDEX idx_category (category_id), -- 唯一索引
    INDEX idx_price_category (price, category_id), -- 复合索引
    INDEX idx_created_at (created_at),
    
    -- 外键约束
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;
```

#### 单独创建索引
```sql
-- 普通索引
CREATE INDEX idx_name ON users(name);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 复合索引
CREATE INDEX idx_user_status ON users(name, status);
```

### 3.2 修改和删除索引

```sql
-- 删除索引
DROP INDEX idx_name ON users;
DROP INDEX idx_email ON users;

-- 删除主键索引
ALTER TABLE users DROP PRIMARY KEY;

-- 添加主键索引
ALTER TABLE users ADD PRIMARY KEY (id);

-- 删除唯一索引
ALTER TABLE users DROP INDEX idx_email;

-- 修改索引（需先删除再添加）
ALTER TABLE users DROP INDEX idx_name, ADD INDEX idx_name_new (name);
```

### 3.3 查看索引信息

```sql
-- 查看表的索引信息
SHOW INDEX FROM users;
```

## 4. 索引使用最佳实践

### 4.1 什么时候应该创建索引？

#### 适合创建索引的场景
1. **主键列**：自动创建，无需手动操作
2. **外键列**：加速JOIN操作
3. **WHERE条件频繁使用的列**：
   ```sql
   -- 频繁查询用户状态
   WHERE status = 'active'
   ```
4. **ORDER BY经常使用的列**：
   ```sql
   -- 经常按创建时间排序
   ORDER BY created_at DESC
   ```
5. **GROUP BY经常使用的列**：
   ```sql
   -- 按分类统计
   GROUP BY category_id
   ```

#### 不适合创建索引的场景
1. **小表**：表记录少于几百行
2. **频繁更新的列**：UPDATE操作会同步更新索引
3. **重复值多的列**：如性别字段，只有'男'、'女'两个值
4. **TEXT、BLOB等大字段**：占用空间大，维护成本高
5. **几乎不查询的列**：不会带来性能提升

### 4.2 索引设计原则

#### 1. 遵循最左前缀原则
```sql
-- 创建复合索引时考虑最左前缀
CREATE INDEX idx_user_status_created ON users(status, created_at);

-- 最佳使用方式
SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC;
SELECT * FROM users WHERE status = 'active';  -- 仍可使用索引
SELECT * FROM users WHERE created_at > '2023-01-01';  -- 不使用索引
```

#### 2. 选择性高的列优先
```sql
-- 好的索引选择
CREATE INDEX idx_email ON users(email);  -- 唯一性高

-- 差的索引选择
CREATE INDEX idx_gender ON users(gender);  -- 只有'男'、'女'两个值，值种类很少
```

#### 3. 避免重复索引
```sql
-- 错误做法：创建重复索引
CREATE INDEX idx_email ON users(email);
CREATE UNIQUE INDEX idx_email ON users(email);  -- 重复

-- 正确做法：使用唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);
```

### 4.3 索引性能优化技巧

#### 前缀索引
```sql
-- 当列值很长时，使用前缀索引节省空间
CREATE INDEX idx_name_prefix ON users(name(10));

-- 索引无法命中情况
-- 后缀模糊查询（%在前面，无法利用前缀索引）
EXPLAIN SELECT * FROM sys_user WHERE user_name LIKE '%san123';
-- 中间模糊查询（%在中间，无法匹配前缀）
EXPLAIN SELECT * FROM sys_user WHERE user_name LIKE 'zhang%san';
-- 函数操作字段（索引失效）
EXPLAIN SELECT * FROM sys_user WHERE SUBSTR(user_name, 2) = 'hangsan123';
```

#### 覆盖索引
```sql
-- 覆盖索引：包含查询所需所有列的索引
CREATE INDEX idx_user_info ON users(id, name, email, status);

-- 查询可以直接从索引中获取所有数据，无需回表
SELECT id, name, email, status FROM users WHERE name = '张三';
```

## 5. 索引性能分析

### 5.1 使用EXPLAIN分析查询性能

```sql
-- 查看查询执行计划
EXPLAIN SELECT * FROM users WHERE name = '张三' ORDER BY created_at;
```

**EXPLAIN输出字段：**
| 字段 | 含义 | 优化目标 |
|------|------|----------|
| `type` | 连接类型 | 越靠右越好：const > eq_ref > ref > range > index > all |
| `key` | 实际使用的索引 | 不为NULL |
| `rows` | 扫描行数 | 越小越好 |
| `Extra` | 额外信息 | 避免Using filesort |

**type连接类型详解（按性能从高到低排序）：**

| type类型 | 含义说明 | 示例场景 |
|---------|---------|---------|
| **const** | 主键或唯一索引等值查询，最多返回1条记录 | `WHERE id = 1`（id是主键） |
| **eq_ref** | 联表查询中，被驱动表使用主键或唯一索引等值匹配 | `JOIN users ON orders.user_id = users.id` |
| **ref** | 非唯一索引等值查询，可能返回多条记录 | `WHERE name = '张三'`（name有普通索引） |
| **range** | 索引范围查询（>、<、BETWEEN、IN等） | `WHERE age > 18 AND age < 60` |
| **index** | 全索引扫描，遍历整个索引树 | `SELECT id FROM users`（id有索引） |
| **all** | 全表扫描，遍历所有数据行 | `SELECT * FROM users WHERE name = '张三'`（name无索引） |

**type类型优化建议：**
- 尽量让查询达到`ref`级别或以上
- 避免`all`（全表扫描）和`index`（全索引扫描）
- `const`和`eq_ref`是最理想的连接类型
- `range`类型在范围查询时是可以接受的

### 5.2 索引失效的情况

#### 使用函数导致索引失效

**原因分析：**
在索引列上使用函数会使列值发生变化，MySQL无法预知函数结果，只能对每行数据计算函数值后再比较。

```sql
-- 索引失效：函数操作列
SELECT * FROM users WHERE YEAR(created_at) = 2023;
-- 需要对created_at列的每个值计算YEAR()函数

-- 索引生效：范围查询替代
SELECT * FROM users WHERE created_at >= '2023-01-01' 
    AND created_at < '2024-01-01';
-- 直接比较列值，可以利用索引的范围查询能力
```

#### 类型转换导致索引失效

**原因分析：**
当比较不同类型时，MySQL会进行隐式类型转换，导致索引列的值被转换，无法使用索引进行快速定位。

```sql
-- 假设name列是VARCHAR类型
-- 索引失效：字符串转数字
SELECT * FROM users WHERE name = 123;
-- MySQL会将name列的值转换为数字进行比较，导致全表扫描

-- 索引生效：字符串比较
SELECT * FROM users WHERE name = '123';
-- 类型匹配，可以直接使用索引
```

#### LIKE通配符前置导致索引失效

**原因分析：**
B+Tree索引是按照字典顺序排序的，前置通配符（如`%张`）意味着匹配任意前缀，无法利用索引的有序性进行范围定位。

```sql
-- 索引失效：前置通配符
SELECT * FROM users WHERE name LIKE '%张%';
-- 需要扫描所有记录，检查每个值是否包含"张"

-- 索引生效：后置通配符
SELECT * FROM users WHERE name LIKE '张%';
-- 可以利用索引的有序性，直接定位到以"张"开头的记录范围
```

#### OR条件中有非索引列

**原因分析：**
OR条件需要满足任意一个条件即可，如果其中一个条件无法使用索引，MySQL通常会选择全表扫描来确保结果正确性。

```sql
-- 索引失效：OR条件混用
SELECT * FROM users WHERE name = '张三' OR status = 'active';
-- status列无索引，需要全表扫描检查status='active'的记录

-- 分成两次查询或使用UNION
SELECT * FROM users WHERE name = '张三'
UNION
SELECT * FROM users WHERE status = 'active';
-- 分别利用各自的索引，然后合并结果
```

#### 违反最左前缀原则

**原因分析：**
联合索引遵循最左前缀原则，即只有当查询条件包含索引的最左列时，才能使用该索引。如果跳过最左列直接使用后面的列，索引将无法生效。

```sql
-- 假设创建了联合索引：CREATE INDEX idx_name_age ON users(name, age);

-- 索引失效：跳过最左列name
SELECT * FROM users WHERE age = 18;
-- 直接使用age列，无法利用联合索引idx_name_age

-- 索引生效：包含最左列name
SELECT * FROM users WHERE name = '张三' AND age = 18;
-- 包含联合索引的最左列，可以正常使用索引
```

#### 否定条件导致索引失效

**原因分析：**
使用否定条件（如!=、<>、NOT IN）时，MySQL优化器可能无法高效利用索引，因为这些条件通常需要检查大量不满足条件的记录，导致全表扫描。

```sql
-- 索引失效：使用NOT IN
SELECT * FROM users WHERE status NOT IN ('active', 'pending');
-- 需要扫描大部分或全部记录来排除指定值

-- 索引失效：使用!=或<>
SELECT * FROM users WHERE status != 'inactive';
-- 否定条件可能导致全表扫描

-- 优化建议：尽量使用正向条件
SELECT * FROM users WHERE status IN ('active', 'pending');
-- 正向条件可以更高效地利用索引
```

#### IS NULL/IS NOT NULL查询

**原因分析：**
当查询条件包含IS NULL或IS NOT NULL时，MySQL可能无法有效利用索引，尤其是当列中NULL值较多时。

```sql
-- 索引失效：IS NOT NULL
SELECT * FROM users WHERE email IS NOT NULL;
-- 可能导致全表扫描，尤其是email列NULL值较多时

-- 索引失效：IS NULL
SELECT * FROM users WHERE email IS NULL;
-- 同样可能无法有效利用索引

-- 优化建议：使用默认值替代NULL
-- 例如将email的默认值设为空字符串''，然后查询
SELECT * FROM users WHERE email != '';
-- 可以更高效地利用索引
```

#### 运算表达式导致索引失效

**原因分析：**
与函数类似，对索引列进行运算会改变列值的比较基准，无法直接使用索引的有序性。

```sql
-- 索引失效：列参与运算
SELECT * FROM users WHERE age + 10 = 30;
-- 需要对每行数据的age列进行加法运算

-- 索引生效：移项变换
SELECT * FROM users WHERE age = 20;
-- 直接比较列值，可以利用索引
```

## 5. 聚簇索引与非聚簇索引

### 5.1 核心概念对比

| 特性 | 聚簇索引 | 非聚簇索引 |
|------|----------|------------|
| **存储方式** | 索引与数据物理存储在一起 | 索引与数据分离存储 |
| **数据顺序** | 数据按索引顺序物理排列 | 数据物理顺序与索引无关 |
| **索引指针** | 叶子节点直接存储数据行 | 叶子节点存储数据行地址或主键 |
| **数量限制** | 每张表只能有1个 | 每张表可以有多个 |
| **典型应用** | InnoDB主键索引 | MyISAM所有索引、InnoDB二级索引 |

### 5.2 聚簇索引（Clustered Index）

**工作原理：**
- 索引与数据物理存储在一起
- 数据行按照索引顺序物理排列
- 叶子节点直接包含完整数据行
- 没有额外的回表操作（除非使用二级索引）

**InnoDB中的聚簇索引：**
```sql
-- InnoDB自动使用主键作为聚簇索引
CREATE TABLE users (
    id INT PRIMARY KEY,  -- 聚簇索引，决定数据物理顺序
    name VARCHAR(50),
    email VARCHAR(100)
) ENGINE=InnoDB;
```

**聚簇索引优势：**
- 按主键范围查询非常高效
- 主键排序和范围扫描性能优异
- 避免了额外的I/O操作

### 5.3 非聚簇索引（Non-Clustered Index）

**工作原理：**
- 索引与数据分开存储
- 叶子节点存储指向数据行的指针或主键值
- 查询时可能需要回表操作

**非聚簇索引类型：**
1. **MyISAM所有索引**：叶子节点存储数据物理地址
2. **InnoDB二级索引**：叶子节点存储主键值

```sql
-- InnoDB二级索引（非聚簇）
CREATE INDEX idx_name ON users(name);
-- 叶子节点存储：name值 + 主键id
```

**非聚簇索引特点：**
- 索引维护成本较低
- 支持多列索引
- InnoDB二级索引需要通过主键回表

### 5.4 索引范围搜索详解

**什么是范围搜索？**
范围搜索是指使用比较操作符（>、<、>=、<=、BETWEEN、IN）进行的查询，如：
```sql
-- 数值范围
SELECT * FROM users WHERE age > 18 AND age < 60;

-- 日期范围  
SELECT * FROM orders WHERE created_at BETWEEN '2023-01-01' AND '2023-12-31';

-- IN范围
SELECT * FROM users WHERE status IN ('active', 'pending');
```

**范围搜索工作原理：**
1. **B+Tree索引有序性**：索引按key值有序排列，范围搜索可以利用这一特性
2. **范围定位**：快速定位起始点和结束点
3. **区间扫描**：扫描范围内的所有叶子节点
4. **回表操作**：如果是二级索引，需要回表获取完整数据

**范围搜索优化技巧：**
- ✅ **使用聚簇索引**：避免回表
- ✅ **覆盖索引**：包含查询所需所有列，避免回表
- ✅ **最左前缀**：复合索引中把范围列放在最后
- ❌ **避免在范围列后使用其他索引列**：范围列后的索引列无法使用
- ❌ **避免大量数据扫描**：范围过大可能导致全表扫描

**范围搜索中的索引失效情况：**
- 范围列后有其他索引列
- 范围过大导致MySQL认为全表扫描更高效
- 使用了函数或类型转换

## 6. 不同存储引擎的索引特点

### 6.1 InnoDB存储引擎

```sql
-- InnoDB支持B+Tree和自适应哈希索引
-- 自适应哈希索引会自动创建热点数据的哈希索引

-- 查看自适应哈希索引状态
SHOW ENGINE INNODB STATUS;

-- 强制使用B+Tree索引（禁止自适应哈希）
SET GLOBAL innodb_adaptive_hash_index = OFF;
```

**InnoDB索引特点：**
- 默认使用**聚簇索引**
- 支持事务和外键
- 二级索引存储主键值
- 自动优化：自适应哈希索引

### 6.2 MyISAM存储引擎

```sql
-- MyISAM只支持B+Tree索引
CREATE TABLE users_myisam (
    id INT,
    name VARCHAR(50),
    INDEX idx_name (name)
) ENGINE=MyISAM;
```

**MyISAM索引特点：**
- 所有索引都是**非聚簇索引**
- 索引和数据分离存储
- 不支持事务和外键
- 查询速度在某些场景下较快

