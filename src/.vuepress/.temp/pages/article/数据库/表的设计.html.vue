<template><div><h2 id="数据库表设计笔记" tabindex="-1"><a class="header-anchor" href="#数据库表设计笔记"><span>数据库表设计笔记</span></a></h2>
<h3 id="一、需求分析" tabindex="-1"><a class="header-anchor" href="#一、需求分析"><span>一、需求分析</span></a></h3>
<ul>
<li><strong>明确业务场景</strong>：确定系统需存储的数据类型（如用户、商品、订单等）。</li>
<li><strong>梳理数据关系</strong>：分析数据关联（一对一/一对多/多对多）。</li>
</ul>
<h3 id="二、表结构设计" tabindex="-1"><a class="header-anchor" href="#二、表结构设计"><span>二、表结构设计</span></a></h3>
<h4 id="_1-划分主题表" tabindex="-1"><a class="header-anchor" href="#_1-划分主题表"><span>1. 划分主题表</span></a></h4>
<ul>
<li>每张表围绕单一主题（如「用户表」「商品表」），避免混合无关数据。</li>
</ul>
<h4 id="_2-定义字段" tabindex="-1"><a class="header-anchor" href="#_2-定义字段"><span>2. 定义字段</span></a></h4>
<ul>
<li><strong>业务适配</strong>：字段需覆盖业务需求，避免冗余或缺失（例：用户表含<code v-pre>userId</code>、<code v-pre>userName</code>、<code v-pre>phone</code>）。</li>
<li><strong>命名与类型</strong>：
<ul>
<li>命名规范（如驼峰式：<code v-pre>orderTime</code>）；</li>
<li>类型匹配（如整数用<code v-pre>INT</code>，文本用<code v-pre>VARCHAR</code>）。</li>
</ul>
</li>
</ul>
<h3 id="三、约束与关联设计" tabindex="-1"><a class="header-anchor" href="#三、约束与关联设计"><span>三、约束与关联设计</span></a></h3>
<h4 id="_1-主键约束" tabindex="-1"><a class="header-anchor" href="#_1-主键约束"><span>1. 主键约束</span></a></h4>
<ul>
<li>每张表必须设置主键（如自增<code v-pre>ID</code>），唯一标识记录。</li>
</ul>
<h4 id="_2-外键关联" tabindex="-1"><a class="header-anchor" href="#_2-外键关联"><span>2. 外键关联</span></a></h4>
<ul>
<li>通过外键建立表间关系（例：订单表<code v-pre>userId</code>关联用户表<code v-pre>userId</code>），保障数据完整性。</li>
</ul>
<h4 id="_3-数据约束" tabindex="-1"><a class="header-anchor" href="#_3-数据约束"><span>3. 数据约束</span></a></h4>
<ul>
<li><strong>非空约束（<code v-pre>NOT NULL</code>）</strong>：必填字段（如<code v-pre>userName</code>）。</li>
<li><strong>唯一约束（<code v-pre>UNIQUE</code>）</strong>：避免重复数据（如<code v-pre>phone</code>）。</li>
<li><strong>检查约束（<code v-pre>CHECK</code>）</strong>：限制取值范围（如<code v-pre>age &gt; 0</code>）。</li>
</ul>
<h3 id="四、规范化设计" tabindex="-1"><a class="header-anchor" href="#四、规范化设计"><span>四、规范化设计</span></a></h3>
<h4 id="_1-第一范式-1nf" tabindex="-1"><a class="header-anchor" href="#_1-第一范式-1nf"><span>1. 第一范式（1NF）</span></a></h4>
<ul>
<li><strong>核心规则</strong>：字段原子性，不可再拆分（例：地址拆分为<code v-pre>province</code>、<code v-pre>city</code>、<code v-pre>district</code>）。</li>
</ul>
<h4 id="_2-第二范式-2nf" tabindex="-1"><a class="header-anchor" href="#_2-第二范式-2nf"><span>2. 第二范式（2NF）</span></a></h4>
<ul>
<li><strong>前提</strong>：已满足1NF。</li>
<li><strong>规则</strong>：消除部分依赖（组合主键场景下，非主属性需完全依赖整个主键）。
<ul>
<li>例：订单明细表主键为<code v-pre>(orderId, productId)</code>，<code v-pre>productName</code>需依赖<strong>全部主键</strong>，而非仅<code v-pre>productId</code>。</li>
</ul>
</li>
</ul>
<h4 id="_3-第三范式-3nf" tabindex="-1"><a class="header-anchor" href="#_3-第三范式-3nf"><span>3. 第三范式（3NF）</span></a></h4>
<ul>
<li><strong>前提</strong>：已满足2NF。</li>
<li><strong>规则</strong>：消除传递依赖（非主属性直接依赖主键，而非通过其他非主属性）。
<ul>
<li>例：订单表不存储<code v-pre>userName</code>，通过外键<code v-pre>userId</code>关联用户表获取。</li>
</ul>
</li>
</ul>
<h3 id="五、性能优化" tabindex="-1"><a class="header-anchor" href="#五、性能优化"><span>五、性能优化</span></a></h3>
<h4 id="_1-索引设计" tabindex="-1"><a class="header-anchor" href="#_1-索引设计"><span>1. 索引设计</span></a></h4>
<ul>
<li>为高频查询字段添加索引（如订单表<code v-pre>createTime</code>），避免过度索引影响写入性能。</li>
</ul>
<h4 id="_2-字段类型优化" tabindex="-1"><a class="header-anchor" href="#_2-字段类型优化"><span>2. 字段类型优化</span></a></h4>
<ul>
<li>选择轻量级数据类型（如用<code v-pre>TINYINT</code>存储状态值替代<code v-pre>INT</code>）。</li>
</ul>
<h4 id="_3-分表策略" tabindex="-1"><a class="header-anchor" href="#_3-分表策略"><span>3. 分表策略</span></a></h4>
<ul>
<li>数据量大时按时间/业务拆分（如<code v-pre>order_current</code>与<code v-pre>order_history</code>）。</li>
</ul>
<h3 id="六、示例-电商系统表结构" tabindex="-1"><a class="header-anchor" href="#六、示例-电商系统表结构"><span>六、示例：电商系统表结构</span></a></h3>
<table>
<thead>
<tr>
<th>表名</th>
<th>主键</th>
<th>核心字段</th>
<th>外键关联</th>
</tr>
</thead>
<tbody>
<tr>
<td>用户表</td>
<td><code v-pre>userId</code></td>
<td><code v-pre>userName</code>、<code v-pre>phone</code>、<code v-pre>email</code></td>
<td>无</td>
</tr>
<tr>
<td>商品表</td>
<td><code v-pre>productId</code></td>
<td><code v-pre>productName</code>、<code v-pre>price</code>、<code v-pre>stock</code></td>
<td>无</td>
</tr>
<tr>
<td>订单表</td>
<td><code v-pre>orderId</code></td>
<td><code v-pre>orderTime</code>、<code v-pre>totalPrice</code>、<code v-pre>userId</code></td>
<td><code v-pre>userId</code> → 用户表</td>
</tr>
<tr>
<td>订单明细表</td>
<td><code v-pre>orderItemId</code></td>
<td><code v-pre>orderId</code>、<code v-pre>productId</code>、<code v-pre>quantity</code></td>
<td><code v-pre>orderId</code> → 订单表<br><code v-pre>productId</code> → 商品表</td>
</tr>
</tbody>
</table>
<h3 id="七、注意事项" tabindex="-1"><a class="header-anchor" href="#七、注意事项"><span>七、注意事项</span></a></h3>
<ul>
<li><strong>平衡规范化与性能</strong>：允许适当冗余减少联表查询（如订单表冗余存储<code v-pre>userName</code>）。</li>
<li><strong>文档化</strong>：记录字段含义、表间关系，便于维护。</li>
<li><strong>预留扩展</strong>：添加<code v-pre>extInfo</code>字段（JSON格式）应对需求变更。</li>
</ul>
<h2 id="数据库相关范式详解" tabindex="-1"><a class="header-anchor" href="#数据库相关范式详解"><span>数据库相关范式详解</span></a></h2>
<h3 id="第一范式-1nf" tabindex="-1"><a class="header-anchor" href="#第一范式-1nf"><span>第一范式（1NF）</span></a></h3>
<p><strong>核心要求</strong>：字段原子性，每个字段存储单一值，不可拆分。</p>
<ul>
<li>❌ 反例：字段<code v-pre>address</code>存储「北京市朝阳区XX路」（可拆分为省/市/区）。</li>
<li>✅ 正例：拆分为<code v-pre>province</code>、<code v-pre>city</code>、<code v-pre>district</code>三个字段。</li>
</ul>
<h3 id="第二范式-2nf" tabindex="-1"><a class="header-anchor" href="#第二范式-2nf"><span>第二范式（2NF）</span></a></h3>
<p><strong>核心要求</strong>：消除部分依赖，非主属性完全依赖主键（适用于组合主键场景）。</p>
<ul>
<li>❌ 反例：订单明细表<code v-pre>(orderId, productId, productName)</code>，<code v-pre>productName</code>仅依赖<code v-pre>productId</code>（部分依赖）。</li>
<li>✅ 正例：拆分出商品表，订单明细表仅保留<code v-pre>productId</code>，通过外键关联商品表获取<code v-pre>productName</code>。</li>
</ul>
<h3 id="第三范式-3nf" tabindex="-1"><a class="header-anchor" href="#第三范式-3nf"><span>第三范式（3NF）</span></a></h3>
<p><strong>核心要求</strong>：消除传递依赖，非主属性直接依赖主键，而非通过其他非主属性。</p>
<ul>
<li>❌ 反例：订单表<code v-pre>(orderId, userId, userName)</code>，<code v-pre>userName</code>通过<code v-pre>userId</code>间接依赖<code v-pre>orderId</code>（传递依赖）。</li>
<li>✅ 正例：订单表仅保留<code v-pre>userId</code>，<code v-pre>userName</code>存储于用户表，通过外键关联查询。</li>
</ul>
<h3 id="第四范式-4nf" tabindex="-1"><a class="header-anchor" href="#第四范式-4nf"><span>第四范式（4NF）</span></a></h3>
<p><strong>核心要求</strong>：消除多值依赖，确保表中无独立的多值属性组。</p>
<ul>
<li>❌ 反例：教师表<code v-pre>(teacherId, course, project)</code>，一个教师对应多门课程和多个项目，课程与项目无关联（多值依赖）。</li>
<li>✅ 正例：拆分为<code v-pre>teacher_course</code>表和<code v-pre>teacher_project</code>表，分别存储教师与课程、教师与项目的关系。<br>
格与正文保持间距，避免内容堆砌。</li>
</ul>
</div></template>


