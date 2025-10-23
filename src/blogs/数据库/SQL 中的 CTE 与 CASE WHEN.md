---
title: SQL 中的 CTE 与 CASE WHEN
date: 2025-05-27
categories: ["数据库"]
tags: ["MYSQL"]  # 这会被自动填充为对应的标签
---

# SQL中的CTE与CASE WHEN
## CTE（Common Table Expression:公共表表达式）
### 概念
CTE是一种临时命名的查询结果集，它允许我们在一个查询语句中多次引用。CTE在查询语句中定义，仅在该查询语句执行期间存在，就像是一个临时搭建的“舞台”，专门为当前查询服务。CTE通常用于简化复杂的查询，将一个大的查询逻辑拆分成多个小的、可管理的部分，从而提高查询的可读性和可维护性。

### 语法结构
```sql
WITH cte_name AS (
    SELECT ...  -- CTE的查询逻辑，定义这个临时结果集的内容
)
SELECT ... FROM cte_name;  -- 在主查询中使用CTE，就像使用一个普通的表一样
```
其中，`cte_name`是我们给这个CTE取的名字，方便在后续查询中引用；`SELECT...`部分是定义CTE结果集的具体查询语句。需要注意的是，CTE定义之后，必须紧接着一个使用它的SQL语句（如`SELECT`、`INSERT`、`UPDATE`、`DELETE`等）。

### 核心场景
1. **递归查询**：在处理树形结构数据时，递归CTE尤为重要。
```sql
WITH RECURSIVE cte_name AS (
    -- 锚点查询（基础情况）
    SELECT ...
    FROM ...
    WHERE ...  -- 通常定义根节点条件
    
    UNION ALL
    
    -- 递归查询（迭代情况）
    SELECT ...
    FROM cte_name  -- 关键：引用自身
    JOIN ...       -- 通过 JOIN 连接原始表或其他表
    WHERE ...      -- 控制递归终止条件
)
SELECT * FROM cte_name;
```
2. **多步骤计算**：当一个查询需要进行多个步骤的计算时，CTE可以将每个步骤的结果临时存储，方便后续步骤使用。例如，在分析销售数据时，先计算每个月的总销售额，再找出总销售额高于平均水平的月份。
```sql
WITH MonthlySales AS (
    SELECT month, SUM(sales) AS total_sales
    FROM orders 
    GROUP BY month
),
TopMonths AS (
    SELECT month, total_sales
    FROM MonthlySales 
    WHERE total_sales > (SELECT AVG(total_sales) FROM MonthlySales)
)
SELECT * FROM TopMonths;
```
在这个例子中，`MonthlySales` CTE计算了每个月的总销售额，`TopMonths` CTE则基于`MonthlySales`的结果筛选出总销售额高于平均水平的月份。

### 优点
1. **代码模块化**：将复杂查询拆分成多个CTE，每个CTE专注于一个特定的逻辑，使代码结构更清晰，易于理解和维护。
2. **支持递归**：能够轻松处理层级数据，这是传统子查询难以做到的。
3. **可多次引用**：在同一查询中，可以多次引用同一个CTE，避免了重复编写相同的查询逻辑。

## CASE WHEN
### 概念
CASE WHEN是SQL中的条件表达式，用于在查询中实现逻辑判断，类似于编程语言中的`if - else`语句。它允许我们根据不同的条件返回不同的结果，为查询增加了灵活性。

### 语法结构
```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
   ...
    ELSE default_result
END
```
其中，`condition1`、`condition2`等是布尔表达式，当`condition1`为`true`时，返回`result1`；当`condition1`为`false`，而`condition2`为`true`时，返回`result2`；以此类推。如果所有条件都不满足，则返回`ELSE`后面的`default_result`（`ELSE`子句是可选的，如果省略，当所有条件都不满足时返回`NULL`）。

### 核心场景
1. **数据分类**：对数据进行分类是CASE WHEN的常见应用。例如，根据商品价格将商品分为“高价”“中价”“低价”三类。
```sql
SELECT 
    product_name,
    price,
    CASE 
        WHEN price > 100 THEN '高价'
        WHEN price > 50 THEN '中价'
        ELSE '低价'
    END AS price_category
FROM products;
```
2. **条件聚合**：在聚合函数中使用CASE WHEN可以实现条件聚合。比如，统计员工表中每个部门的男女人数。
```sql
SELECT 
    department,
    SUM(CASE WHEN gender = 'M' THEN 1 ELSE 0 END) AS male_count,
    SUM(CASE WHEN gender = 'F' THEN 1 ELSE 0 END) AS female_count
FROM employees 
GROUP BY department;
```
3. **数据转换**：可以利用CASE WHEN进行数据转换。例如，将订单日期转换为更易读的“今年订单”“去年订单”等形式。
```sql
SELECT 
    order_id,
    order_date,
    CASE 
        WHEN order_date >= '2023 - 01 - 01' THEN '今年订单'
        ELSE '去年订单'
    END AS order_period
FROM orders;
```

### 优点
1. **灵活处理行级条件逻辑**：可以针对每一行数据进行条件判断和结果返回，适用于各种复杂的业务逻辑。
2. **可在多个子句中使用**：不仅可以在`SELECT`子句中使用，还可以在`WHERE`、`GROUP BY`等子句中使用，增加了查询的灵活性。
3. **替代复杂的JOIN或子查询**：在某些情况下，使用CASE WHEN可以避免复杂的JOIN操作或多层子查询，使查询更加简洁高效。