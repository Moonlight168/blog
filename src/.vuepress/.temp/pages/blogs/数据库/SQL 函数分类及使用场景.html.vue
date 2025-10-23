<template><div><p>在日常开发中，MySQL 内置了大量函数，掌握常见函数的分类及使用场景，有助于提升 SQL 编写效率与可读性。</p>
<h2 id="一、字符串函数" tabindex="-1"><a class="header-anchor" href="#一、字符串函数"><span>一、字符串函数</span></a></h2>
<p>用于处理文本内容，常见于数据清洗、字符串拼接、截取等场景。</p>
<table>
<thead>
<tr>
<th>函数</th>
<th>说明</th>
<th>示例</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>CONCAT(a, b)</code></td>
<td>字符串拼接</td>
<td><code v-pre>CONCAT('A', 'B') → 'AB'</code></td>
</tr>
<tr>
<td><code v-pre>SUBSTRING(s, start, len)</code></td>
<td>截取子串</td>
<td><code v-pre>SUBSTRING('hello', 2, 3) → 'ell'</code></td>
</tr>
<tr>
<td><code v-pre>REPLACE(s, a, b)</code></td>
<td>替换子串</td>
<td><code v-pre>REPLACE('a-b-c', '-', '_') → 'a_b_c'</code></td>
</tr>
<tr>
<td><code v-pre>LENGTH(s)</code></td>
<td>字节长度（与字符集相关）</td>
<td><code v-pre>LENGTH('中') → 3（UTF-8下）</code></td>
</tr>
<tr>
<td><code v-pre>TRIM(s)</code></td>
<td>去除首尾空格</td>
<td><code v-pre>TRIM(' abc ') → 'abc'</code></td>
</tr>
</tbody>
</table>
<h2 id="二、数值函数" tabindex="-1"><a class="header-anchor" href="#二、数值函数"><span>二、数值函数</span></a></h2>
<p>处理数值计算，常用于统计分析、字段计算等。</p>
<table>
<thead>
<tr>
<th>函数</th>
<th>说明</th>
<th>示例</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>ABS(n)</code></td>
<td>绝对值</td>
<td><code v-pre>ABS(-5) → 5</code></td>
</tr>
<tr>
<td><code v-pre>CEIL(n)</code></td>
<td>向上取整</td>
<td><code v-pre>CEIL(1.3) → 2</code></td>
</tr>
<tr>
<td><code v-pre>FLOOR(n)</code></td>
<td>向下取整</td>
<td><code v-pre>FLOOR(1.8) → 1</code></td>
</tr>
<tr>
<td><code v-pre>ROUND(n, d)</code></td>
<td>四舍五入到指定位数</td>
<td><code v-pre>ROUND(1.456, 2) → 1.46</code></td>
</tr>
<tr>
<td><code v-pre>MOD(a, b)</code></td>
<td>取模（a除以b的余数）</td>
<td><code v-pre>MOD(10, 3) → 1</code></td>
</tr>
<tr>
<td><code v-pre>RAND()</code></td>
<td>生成0~1之间的随机小数</td>
<td><code v-pre>RAND() → 0.3749...</code></td>
</tr>
</tbody>
</table>
<h2 id="三、日期时间函数" tabindex="-1"><a class="header-anchor" href="#三、日期时间函数"><span>三、日期时间函数</span></a></h2>
<p>用于处理时间计算、格式化、提取日期字段等。</p>
<table>
<thead>
<tr>
<th>函数</th>
<th>说明</th>
<th>示例</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>NOW()</code></td>
<td>当前时间（含日期）</td>
<td><code v-pre>NOW() → '2025-06-04 15:30:00'</code></td>
</tr>
<tr>
<td><code v-pre>CURDATE()</code></td>
<td>当前日期</td>
<td><code v-pre>CURDATE() → '2025-06-04'</code></td>
</tr>
<tr>
<td><code v-pre>DATE_FORMAT(d, fmt)</code></td>
<td>格式化日期</td>
<td><code v-pre>DATE_FORMAT(NOW(), '%Y-%m') → '2025-06'</code></td>
</tr>
<tr>
<td><code v-pre>DATEDIFF(a, b)</code></td>
<td>相差天数（a-b）</td>
<td><code v-pre>DATEDIFF('2025-06-10', '2025-06-01') → 9</code></td>
</tr>
<tr>
<td><code v-pre>YEAR(d)</code> / <code v-pre>MONTH(d)</code> / <code v-pre>DAY(d)</code></td>
<td>提取年、月、日字段</td>
<td><code v-pre>YEAR('2024-12-01') → 2024</code></td>
</tr>
<tr>
<td><code v-pre>TIMESTAMPDIFF(unit, a, b)</code></td>
<td>时间差，按指定单位（年/月/日/时等）</td>
<td><code v-pre>TIMESTAMPDIFF(MINUTE, a, b)</code></td>
</tr>
<tr>
<td><code v-pre>DATE_ADD(date, INTERVAL n unit)</code></td>
<td>指定日期加上时间间隔</td>
<td><code v-pre>DATE_ADD('2025-06-01', INTERVAL 7 DAY) → '2025-06-08'</code></td>
</tr>
<tr>
<td><code v-pre>DATE_SUB(date, INTERVAL n unit)</code></td>
<td>指定日期减去时间间隔</td>
<td><code v-pre>DATE_SUB('2025-06-01', INTERVAL 3 DAY) → '2025-05-29'</code></td>
</tr>
</tbody>
</table>
<h2 id="四、聚合函数" tabindex="-1"><a class="header-anchor" href="#四、聚合函数"><span>四、聚合函数</span></a></h2>
<p>常与 <code v-pre>GROUP BY</code> 一起使用，执行分组统计操作。</p>
<table>
<thead>
<tr>
<th>函数</th>
<th>说明</th>
<th>示例</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>COUNT(*)</code></td>
<td>统计记录数</td>
<td><code v-pre>COUNT(*) → 总行数</code></td>
</tr>
<tr>
<td><code v-pre>SUM(expr)</code></td>
<td>求和</td>
<td><code v-pre>SUM(salary)</code></td>
</tr>
<tr>
<td><code v-pre>AVG(expr)</code></td>
<td>平均值</td>
<td><code v-pre>AVG(score)</code></td>
</tr>
<tr>
<td><code v-pre>MAX(expr)</code></td>
<td>最大值</td>
<td><code v-pre>MAX(age)</code></td>
</tr>
<tr>
<td><code v-pre>MIN(expr)</code></td>
<td>最小值</td>
<td><code v-pre>MIN(created_at)</code></td>
</tr>
<tr>
<td><code v-pre>GROUP_CONCAT()</code></td>
<td>将同组多个值拼接成字符串</td>
<td><code v-pre>GROUP_CONCAT(name SEPARATOR ',') → 'A,B,C'</code></td>
</tr>
</tbody>
</table>
<h2 id="五、控制流函数" tabindex="-1"><a class="header-anchor" href="#五、控制流函数"><span>五、控制流函数</span></a></h2>
<p>用于在 SQL 中进行条件判断、实现逻辑控制。</p>
<table>
<thead>
<tr>
<th>函数</th>
<th>说明</th>
<th>示例</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>IF(expr, a, b)</code></td>
<td>类似三元表达式，条件判断</td>
<td><code v-pre>IF(score &gt; 60, '及格', '不及格')</code></td>
</tr>
<tr>
<td><code v-pre>IFNULL(expr, default)</code></td>
<td>若为空则返回默认值</td>
<td><code v-pre>IFNULL(nick_name, '匿名')</code></td>
</tr>
<tr>
<td><code v-pre>CASE WHEN ... THEN ... END</code></td>
<td>多条件判断，相当于 switch-case</td>
<td><code v-pre>CASE gender WHEN 'M' THEN '男' ... END</code></td>
</tr>
<tr>
<td><code v-pre>NULLIF(a, b)</code></td>
<td>若a=b则返回NULL，否则返回a</td>
<td><code v-pre>NULLIF(5, 5) → NULL</code></td>
</tr>
</tbody>
</table>
<h2 id="六、json-函数-mysql-5-7" tabindex="-1"><a class="header-anchor" href="#六、json-函数-mysql-5-7"><span>六、JSON 函数（MySQL 5.7+）</span></a></h2>
<p>适用于存储和查询 JSON 格式的数据。</p>
<table>
<thead>
<tr>
<th>函数</th>
<th>说明</th>
<th>示例</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>JSON_OBJECT(k, v, ...)</code></td>
<td>构造 JSON 对象</td>
<td><code v-pre>JSON_OBJECT('id', 1, 'name', 'Tom')</code></td>
</tr>
<tr>
<td><code v-pre>JSON_EXTRACT(json, path)</code></td>
<td>提取 JSON 字段（别名：<code v-pre>-&gt;</code>）</td>
<td><code v-pre>JSON_EXTRACT(data, '$.name')</code></td>
</tr>
<tr>
<td><code v-pre>JSON_SET(json, path, val)</code></td>
<td>更新 JSON 中的指定字段</td>
<td><code v-pre>JSON_SET(data, '$.age', 18)</code></td>
</tr>
<tr>
<td><code v-pre>JSON_ARRAY(v1, v2, ...)</code></td>
<td>构造 JSON 数组</td>
<td><code v-pre>JSON_ARRAY('A', 'B')</code></td>
</tr>
</tbody>
</table>
<h2 id="七、窗口函数-需配合-over-使用" tabindex="-1"><a class="header-anchor" href="#七、窗口函数-需配合-over-使用"><span>七、窗口函数（需配合 <code v-pre>OVER</code> 使用）</span></a></h2>
<p>不影响原始行数，常用于排名、累计值等分析场景。</p>
<table>
<thead>
<tr>
<th>函数</th>
<th>说明</th>
<th>示例</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>ROW_NUMBER()</code></td>
<td>分组内行号</td>
<td><code v-pre>ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary)</code></td>
</tr>
<tr>
<td><code v-pre>RANK()</code> / <code v-pre>DENSE_RANK()</code></td>
<td>分组排名，遇并列名次会跳过或不跳</td>
<td><code v-pre>RANK() OVER (PARTITION BY dept ORDER BY salary DESC)</code></td>
</tr>
<tr>
<td><code v-pre>SUM()</code> / <code v-pre>AVG()</code> / <code v-pre>COUNT()</code> 等</td>
<td>可作为窗口函数使用</td>
<td><code v-pre>SUM(sales) OVER (PARTITION BY region ORDER BY date)</code></td>
</tr>
</tbody>
</table>
</div></template>


