<template><div><h2 id="mysql-的事务四大特性-acid-是什么" tabindex="-1"><a class="header-anchor" href="#mysql-的事务四大特性-acid-是什么"><span>MySQL 的事务四大特性（ACID）是什么？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>原子性（Atomicity）：事务要么全成功要么全失败。</li>
<li>一致性（Consistency）：执行前后数据保持一致。</li>
<li>隔离性（Isolation）：事务间互不干扰。</li>
<li>持久性（Durability）：事务提交后数据永久保存。</li>
</ul>
<h2 id="索引有哪些类型-什么时候使用" tabindex="-1"><a class="header-anchor" href="#索引有哪些类型-什么时候使用"><span>索引有哪些类型？什么时候使用？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>主键索引、唯一索引、普通索引、联合索引。</li>
<li>适用于频繁作为 WHERE、JOIN、ORDER BY 条件的字段；不要给频繁变动的字段建索引。</li>
</ul>
<h2 id="mysql-的存储引擎有哪些-它们之间有什么区别-默认使用哪个" tabindex="-1"><a class="header-anchor" href="#mysql-的存储引擎有哪些-它们之间有什么区别-默认使用哪个"><span>MySQL 的存储引擎有哪些？它们之间有什么区别？默认使用哪个？</span></a></h2>
<p><strong>回答：</strong></p>
<p>常见存储引擎：</p>
<ul>
<li><strong>InnoDB</strong>：支持事务、行级锁、外键，支持 MVCC，适合高并发，<strong>MySQL 默认引擎</strong>。</li>
<li><strong>MyISAM</strong>：不支持事务和外键，表级锁，读性能好，占用空间小，适合读多写少场景。</li>
<li><strong>Memory</strong>：数据存储在内存中，速度快，断电丢失数据，适合临时表、缓存。</li>
<li><strong>Archive</strong>：只支持插入和查询，压缩存储，适合日志、归档。</li>
<li><strong>CSV</strong>：以 CSV 文件存储，方便与其他工具交换数据，不支持索引。</li>
</ul>
<p>区别：</p>
<ul>
<li><strong>事务支持</strong>：InnoDB 支持，MyISAM/Memory 不支持。</li>
<li><strong>锁机制</strong>：InnoDB 行级锁，MyISAM 表级锁。</li>
<li><strong>存储方式</strong>：InnoDB 是聚簇索引，MyISAM 使用非聚簇索引。</li>
<li><strong>数据安全性</strong>：InnoDB 更安全，支持崩溃恢复；MyISAM 容易损坏。</li>
</ul>
<p><strong>默认存储引擎：InnoDB</strong>（MySQL 5.5 之后）</p>
<h2 id="innodb-是如何存储数据的" tabindex="-1"><a class="header-anchor" href="#innodb-是如何存储数据的"><span>InnoDB 是如何存储数据的？</span></a></h2>
<p><strong>回答：</strong></p>
<ol>
<li>
<p><strong>页（Page）为最小存储单位</strong></p>
<ul>
<li>默认页大小 16KB。</li>
<li>数据存储在页中，页之间通过双向链表连接。</li>
</ul>
</li>
<li>
<p><strong>行（Row）存储</strong></p>
<ul>
<li>InnoDB 是 <strong>面向行的存储引擎</strong>。</li>
<li>每一行数据存储在页中，行溢出时会用溢出页。</li>
</ul>
</li>
<li>
<p><strong>表空间（Tablespace）</strong></p>
<ul>
<li>InnoDB 把数据存储在表空间中（共享表空间 ibdata 或者独立 .ibd 文件）。</li>
</ul>
</li>
<li>
<p><strong>索引组织表（Clustered Index）</strong></p>
<ul>
<li>InnoDB 的表数据按 <strong>主键顺序存储</strong>，表数据和主键索引存储在同一棵 B+Tree 中。</li>
<li>叶子节点存储整行数据。</li>
<li>如果没有主键，会选择唯一索引或自动生成一个隐藏主键。</li>
</ul>
</li>
<li>
<p><strong>辅助索引（二级索引）</strong></p>
<ul>
<li>二级索引叶子节点存储的是 <strong>主键值</strong>，再通过主键索引找到整行数据（二次查找）。</li>
</ul>
</li>
</ol>
<p>👉 <strong>总结</strong>：<br>
InnoDB 使用 <strong>页（16KB）作为最小存储单位</strong>，数据以 <strong>聚簇索引（B+Tree）</strong> 形式存储在表空间中，<strong>主键索引存整行数据，二级索引存主键值</strong>。</p>
<h2 id="二、sql语句" tabindex="-1"><a class="header-anchor" href="#二、sql语句"><span>二、SQL语句</span></a></h2>
<h2 id="如何优化-sql-性能" tabindex="-1"><a class="header-anchor" href="#如何优化-sql-性能"><span>如何优化 SQL 性能？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>使用合适索引，避免全表扫描；</li>
<li>避免 SELECT *，只查必要字段；</li>
<li>使用 <code v-pre>EXPLAIN</code> 查看执行计划；</li>
<li>避免子查询，尽量用 JOIN；</li>
<li>控制返回行数，分页查询要加 LIMIT。</li>
</ul>
<h2 id="over-与-group-by-的区别" tabindex="-1"><a class="header-anchor" href="#over-与-group-by-的区别"><span><code v-pre>OVER</code> 与 <code v-pre>GROUP BY</code> 的区别？</span></a></h2>
<p><strong>一、核心区别</strong></p>
<table>
<thead>
<tr>
<th>特性</th>
<th><code v-pre>GROUP BY</code></th>
<th><code v-pre>OVER</code>（窗口函数）</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>作用方式</strong></td>
<td>对数据<strong>分组后聚合</strong>，每组只保留一行结果</td>
<td>对每一行数据进行<strong>计算，不减少行数</strong></td>
</tr>
<tr>
<td><strong>返回结果行数</strong></td>
<td>通常比原表<strong>少</strong>，按组聚合</td>
<td>与原表行数<strong>相同</strong>，每行追加计算结果</td>
</tr>
<tr>
<td><strong>适用场景</strong></td>
<td>仅关心每组的聚合结果，如“每个部门的总人数”</td>
<td>需保留明细数据并附带分析值，如“每人所在部门总人数”</td>
</tr>
<tr>
<td><strong>列限制</strong></td>
<td><code v-pre>SELECT</code>中只能出现<code v-pre>GROUP BY</code>字段或聚合函数</td>
<td><code v-pre>SELECT</code>中可使用任意字段</td>
</tr>
</tbody>
</table>
<p><strong>二、举例说明</strong></p>
<h4 id="_1-group-by-示例-统计每个部门总工资" tabindex="-1"><a class="header-anchor" href="#_1-group-by-示例-统计每个部门总工资"><span>1. <code v-pre>GROUP BY</code> 示例：统计每个部门总工资</span></a></h4>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">SELECT</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> department_id, </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">SUM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(salary) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">AS</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> total_salary</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">FROM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> employees</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">GROUP BY</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> department_id;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul>
<li>每个部门输出一行，展示该部门工资总和。</li>
<li>结果行数 = 部门数。</li>
</ul>
<p>GROUP BY 的聚合逻辑：</p>
<p>当你使用GROUP BY player_id时，SQL 会将每个玩家的所有记录合并为一个分组。</p>
<p>对于event_date列，你没有指定聚合函数（如 MIN、MAX），因此数据库会从分组中随机选择一个值作为结果，而不是按照日期排序后取第一个。</p>
<h4 id="_2-over-示例-在每行展示-该员工所在部门的总工资" tabindex="-1"><a class="header-anchor" href="#_2-over-示例-在每行展示-该员工所在部门的总工资"><span>2. <code v-pre>OVER</code> 示例：在每行展示“该员工所在部门的总工资”</span></a></h4>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">SELECT</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> employee_name, department_id,</span></span>
<span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">       SUM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(salary) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">OVER</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">PARTITION</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> BY</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> department_id) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">AS</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> dept_total_salary</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">FROM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> employees;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul>
<li>每行保留员工信息，并显示他所在部门的总工资。</li>
<li>结果行数 = 原始员工数。</li>
</ul>
<h2 id="sql语句关键字顺序-何其执行时的顺序" tabindex="-1"><a class="header-anchor" href="#sql语句关键字顺序-何其执行时的顺序"><span>sql语句关键字顺序？何其执行时的顺序？</span></a></h2>
<p><strong>回答：</strong></p>
<div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-sql"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">语句关键字顺序:</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">SELECT</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> [DISTINCT]</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> select_list</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">FROM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> table_expression</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">[WHERE condition]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">[GROUP BY grouping_expression]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">[HAVING group_condition]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">[WINDOW window_definition]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">[ORDER BY sort_expression]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">[LIMIT | OFFSET row_count]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">执行时的顺序:</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 1. FROM 和 JOIN</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">FROM</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> Employees e</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">JOIN</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> Salaries s </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">ON</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> e</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">employee_id</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> s</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">employee_id</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 2. WHERE</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">WHERE</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> e</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">hire_date</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> ></span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> '2020 - 01 - 01'</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 3. GROUP BY</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">GROUP BY</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> e</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">department_id</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 4. HAVING</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">HAVING</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2"> AVG</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">s</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">salary</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">) </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">></span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 50000</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 5. SELECT</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">SELECT</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> e</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">department_id</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">, </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">AVG</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">s</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">salary</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">AS</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> avg_salary</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">-- 6. ORDER BY</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">ORDER BY</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> avg_salary </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">DESC</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="一条-sql-在-mysql-中的执行过程" tabindex="-1"><a class="header-anchor" href="#一条-sql-在-mysql-中的执行过程"><span>一条 SQL 在 MySQL 中的执行过程?</span></a></h2>
<p><strong>回答：</strong></p>
<ol>
<li>
<p><strong>连接器</strong></p>
<ul>
<li>客户端先通过连接器与 MySQL 建立连接（TCP）。</li>
<li>如果有连接池，会从池中获取。</li>
<li>建立连接后进行权限认证（账号、密码、权限）。</li>
</ul>
</li>
<li>
<p><strong>查询缓存（MySQL 8.0 已移除）</strong></p>
<ul>
<li>在 5.7 及之前版本，MySQL 会先检查缓存是否有相同 SQL 的结果。</li>
<li>有则直接返回，没有则进入解析阶段。</li>
</ul>
</li>
<li>
<p><strong>解析器</strong></p>
<ul>
<li>对 SQL 语句进行词法分析、语法分析。</li>
<li>检查 SQL 语法是否正确，解析出 SQL 的语义，生成解析树。</li>
</ul>
</li>
<li>
<p><strong>优化器</strong></p>
<ul>
<li>对解析树进行优化，选择合适的执行计划。</li>
<li>比如：选择哪个索引、使用全表扫描还是索引扫描、确定表连接顺序。</li>
</ul>
</li>
<li>
<p><strong>执行器</strong></p>
<ul>
<li>根据优化器生成的执行计划，调用存储引擎接口执行 SQL。</li>
<li>判断用户是否有权限操作相关表和字段。</li>
</ul>
</li>
<li>
<p><strong>存储引擎</strong></p>
<ul>
<li>InnoDB、MyISAM 等存储引擎真正执行数据的读写操作。</li>
<li>InnoDB 会用到 <strong>Buffer Pool、redo log、undo log</strong> 等机制保证事务和持久性。</li>
</ul>
</li>
<li>
<p><strong>返回结果</strong></p>
<ul>
<li>存储引擎将结果返回给执行器 → 执行器返回给客户端。</li>
</ul>
</li>
</ol>
<p>👉 <strong>总结</strong>：<br>
客户端 → 连接器 → 查询缓存 → 解析器 → 优化器 → 执行器 → 存储引擎 → 返回结果?</p>
<h2 id="三、线程池" tabindex="-1"><a class="header-anchor" href="#三、线程池"><span>三、线程池</span></a></h2>
<h2 id="为什么数据库连接很消耗资源" tabindex="-1"><a class="header-anchor" href="#为什么数据库连接很消耗资源"><span>为什么数据库连接很消耗资源？</span></a></h2>
<ol>
<li><strong>建立连接开销大</strong>：需要进行网络通信（TCP/SSL握手）、身份认证、资源分配。</li>
<li><strong>连接占用资源</strong>：数据库端要维护会话信息、内存、线程/进程句柄。</li>
<li><strong>连接保持有成本</strong>：需要检测连接状态，空闲连接也会消耗内存和线程。</li>
<li><strong>连接关闭有开销</strong>：释放资源需要时间，频繁创建/销毁连接影响性能。</li>
</ol>
<p>因此，数据库连接属于重量级资源，通常通过<strong>连接池</strong>来复用以降低开销。</p>
<h2 id="什么是数据库连接池-使用过哪些" tabindex="-1"><a class="header-anchor" href="#什么是数据库连接池-使用过哪些"><span>什么是数据库连接池？使用过哪些？</span></a></h2>
<p><strong>回答：</strong><br>
连接池通过复用连接降低连接开销，提高性能。常见连接池：</p>
<ul>
<li>HikariCP（推荐，轻量高效）</li>
<li>Druid（阿里开源，功能全面）</li>
<li>C3P0（较老，配置复杂）</li>
</ul>
<h2 id="为什么连接池可以降低开销" tabindex="-1"><a class="header-anchor" href="#为什么连接池可以降低开销"><span>为什么连接池可以降低开销？</span></a></h2>
<ol>
<li>
<p><strong>避免频繁建立/关闭连接</strong>：</p>
<ul>
<li>连接池在启动时就提前创建一定数量的连接并放入池中。</li>
<li>应用请求数据库时直接复用已有连接，减少频繁的网络通信、身份认证、资源分配开销。</li>
</ul>
</li>
<li>
<p><strong>复用连接资源</strong>：</p>
<ul>
<li>同一个连接可以被多个请求依次使用。</li>
<li>避免了数据库端维护过多短生命周期连接导致的资源浪费。</li>
</ul>
</li>
<li>
<p><strong>统一管理连接数量</strong>：</p>
<ul>
<li>可以设置最大连接数，防止过多连接耗尽数据库资源。</li>
<li>空闲时可以回收或保活，避免资源闲置或失效。</li>
</ul>
</li>
</ol>
<h2 id="连接池是如何实现的" tabindex="-1"><a class="header-anchor" href="#连接池是如何实现的"><span>连接池是如何实现的？</span></a></h2>
<ol>
<li>
<p><strong>初始化</strong>：启动时预先创建一定数量的数据库连接（minIdle / initialSize）。</p>
</li>
<li>
<p><strong>获取连接</strong>：应用请求时，从池中取出可用连接，而不是重新建立。</p>
</li>
<li>
<p><strong>使用连接</strong>：应用执行 SQL 操作。</p>
</li>
<li>
<p><strong>归还连接</strong>：操作完成后，将连接放回池中，供下次复用，而不是关闭。</p>
</li>
<li>
<p><strong>池管理机制</strong>：</p>
<ul>
<li><strong>最大连接数</strong>：限制并发连接上限，保护数据库。</li>
<li><strong>空闲检测</strong>：定期检测连接是否可用，不可用则移除。</li>
<li><strong>连接保活</strong>：执行心跳 SQL（如 <code v-pre>SELECT 1</code>）保持连接可用。</li>
<li><strong>等待队列</strong>：当连接用尽时，新请求进入队列等待，避免直接报错。</li>
</ul>
</li>
</ol>
<p>👉 常见实现：<strong>HikariCP、Druid、C3P0、DBCP</strong>。</p>
</div></template>


