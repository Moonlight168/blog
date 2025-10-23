---
title: MySQL 函数分类及使用场景  
date: 2025-05-21
categories: ["数据库"]
tags: [ "MYSQL"]  
---

在日常开发中，MySQL 内置了大量函数，掌握常见函数的分类及使用场景，有助于提升 SQL 编写效率与可读性。

## 一、字符串函数

用于处理文本内容，常见于数据清洗、字符串拼接、截取等场景。

| 函数            | 说明                        | 示例                                  |
|-----------------|-----------------------------|---------------------------------------|
| `CONCAT(a, b)`  | 字符串拼接                  | `CONCAT('A', 'B') → 'AB'`             |
| `SUBSTRING(s, start, len)` | 截取子串       | `SUBSTRING('hello', 2, 3) → 'ell'`    |
| `REPLACE(s, a, b)` | 替换子串                 | `REPLACE('a-b-c', '-', '_') → 'a_b_c'`|
| `LENGTH(s)`     | 字节长度（与字符集相关）     | `LENGTH('中') → 3（UTF-8下）`          |
| `TRIM(s)`       | 去除首尾空格                | `TRIM(' abc ') → 'abc'`               |


## 二、数值函数

处理数值计算，常用于统计分析、字段计算等。

| 函数           | 说明                        | 示例                          |
|----------------|-----------------------------|-------------------------------|
| `ABS(n)`       | 绝对值                       | `ABS(-5) → 5`                 |
| `CEIL(n)`      | 向上取整                     | `CEIL(1.3) → 2`               |
| `FLOOR(n)`     | 向下取整                     | `FLOOR(1.8) → 1`              |
| `ROUND(n, d)`  | 四舍五入到指定位数           | `ROUND(1.456, 2) → 1.46`      |
| `MOD(a, b)`    | 取模（a除以b的余数）         | `MOD(10, 3) → 1`              |
| `RAND()`       | 生成0~1之间的随机小数        | `RAND() → 0.3749...`          |


## 三、日期时间函数

用于处理时间计算、格式化、提取日期字段等。

| 函数                          | 说明                                | 示例                                          |
|-------------------------------|-------------------------------------|-----------------------------------------------|
| `NOW()`                       | 当前时间（含日期）                   | `NOW() → '2025-06-04 15:30:00'`               |
| `CURDATE()`                   | 当前日期                            | `CURDATE() → '2025-06-04'`                    |
| `DATE_FORMAT(d, fmt)`         | 格式化日期                          | `DATE_FORMAT(NOW(), '%Y-%m') → '2025-06'`     |
| `DATEDIFF(a, b)`              | 相差天数（a-b）                     | `DATEDIFF('2025-06-10', '2025-06-01') → 9`    |
| `YEAR(d)` / `MONTH(d)` / `DAY(d)` | 提取年、月、日字段             | `YEAR('2024-12-01') → 2024`                   |
| `TIMESTAMPDIFF(unit, a, b)`   | 时间差，按指定单位（年/月/日/时等） | `TIMESTAMPDIFF(MINUTE, a, b)`                 |
| `DATE_ADD(date, INTERVAL n unit)` | 指定日期加上时间间隔            | `DATE_ADD('2025-06-01', INTERVAL 7 DAY) → '2025-06-08'` |
| `DATE_SUB(date, INTERVAL n unit)` | 指定日期减去时间间隔            | `DATE_SUB('2025-06-01', INTERVAL 3 DAY) → '2025-05-29'` |


## 四、聚合函数

常与 `GROUP BY` 一起使用，执行分组统计操作。

| 函数             | 说明                                | 示例                                                 |
|------------------|-------------------------------------|------------------------------------------------------|
| `COUNT(*)`       | 统计记录数                          | `COUNT(*) → 总行数`                                  |
| `SUM(expr)`      | 求和                                | `SUM(salary)`                                        |
| `AVG(expr)`      | 平均值                              | `AVG(score)`                                         |
| `MAX(expr)`      | 最大值                              | `MAX(age)`                                           |
| `MIN(expr)`      | 最小值                              | `MIN(created_at)`                                    |
| `GROUP_CONCAT()` | 将同组多个值拼接成字符串            | `GROUP_CONCAT(name SEPARATOR ',') → 'A,B,C'`         |


## 五、控制流函数

用于在 SQL 中进行条件判断、实现逻辑控制。

| 函数                          | 说明                            | 示例                                       |
|-------------------------------|-----------------------------------|--------------------------------------------|
| `IF(expr, a, b)`              | 类似三元表达式，条件判断         | `IF(score > 60, '及格', '不及格')`          |
| `IFNULL(expr, default)`       | 若为空则返回默认值               | `IFNULL(nick_name, '匿名')`                |
| `CASE WHEN ... THEN ... END`  | 多条件判断，相当于 switch-case  | `CASE gender WHEN 'M' THEN '男' ... END`   |
| `NULLIF(a, b)`                | 若a=b则返回NULL，否则返回a       | `NULLIF(5, 5) → NULL`                      |


## 六、JSON 函数（MySQL 5.7+）

适用于存储和查询 JSON 格式的数据。

| 函数                       | 说明                              | 示例                                           |
|----------------------------|-------------------------------------|------------------------------------------------|
| `JSON_OBJECT(k, v, ...)`   | 构造 JSON 对象                    | `JSON_OBJECT('id', 1, 'name', 'Tom')`         |
| `JSON_EXTRACT(json, path)` | 提取 JSON 字段（别名：`->`）      | `JSON_EXTRACT(data, '$.name')`                |
| `JSON_SET(json, path, val)`| 更新 JSON 中的指定字段             | `JSON_SET(data, '$.age', 18)`                 |
| `JSON_ARRAY(v1, v2, ...)`  | 构造 JSON 数组                    | `JSON_ARRAY('A', 'B')`                        |


## 七、窗口函数（需配合 `OVER` 使用）

不影响原始行数，常用于排名、累计值等分析场景。

| 函数                     | 说明                           | 示例                                                         |
|--------------------------|--------------------------------|--------------------------------------------------------------|
| `ROW_NUMBER()`           | 分组内行号                     | `ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary)`      |
| `RANK()` / `DENSE_RANK()`| 分组排名，遇并列名次会跳过或不跳 | `RANK() OVER (PARTITION BY dept ORDER BY salary DESC)`       |
| `SUM()` / `AVG()` / `COUNT()` 等 | 可作为窗口函数使用     | `SUM(sales) OVER (PARTITION BY region ORDER BY date)`        |
