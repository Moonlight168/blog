<template><div><h1 id="淘票票项目基础文档" tabindex="-1"><a class="header-anchor" href="#淘票票项目基础文档"><span>淘票票项目基础文档</span></a></h1>
<h2 id="_1-数据库表关系" tabindex="-1"><a class="header-anchor" href="#_1-数据库表关系"><span>1. 数据库表关系</span></a></h2>
<p>淘票票项目采用分库分表的设计，主要数据库包括：</p>
<h3 id="_1-1-用户相关数据库-taopiaopiao-user-0-taopiaopiao-user-1" tabindex="-1"><a class="header-anchor" href="#_1-1-用户相关数据库-taopiaopiao-user-0-taopiaopiao-user-1"><span>1.1 用户相关数据库 (taopiaopiao_user_0, taopiaopiao_user_1)</span></a></h3>
<ul>
<li><code v-pre>t_user_0</code>, <code v-pre>t_user_1</code>: 用户基本信息表</li>
<li><code v-pre>t_ticket_user_0</code>, <code v-pre>t_ticket_user_1</code>: 购票人信息表</li>
<li><code v-pre>t_user_email_0</code>, <code v-pre>t_user_email_1</code>: 用户邮箱信息表</li>
<li><code v-pre>t_user_mobile_0</code>, <code v-pre>t_user_mobile_1</code>: 用户手机号信息表</li>
</ul>
<h3 id="_1-2-节目相关数据库-taopiaopiao-program-0-taopiaopiao-program-1" tabindex="-1"><a class="header-anchor" href="#_1-2-节目相关数据库-taopiaopiao-program-0-taopiaopiao-program-1"><span>1.2 节目相关数据库 (taopiaopiao_program_0, taopiaopiao_program_1)</span></a></h3>
<ul>
<li><code v-pre>t_program_0</code>, <code v-pre>t_program_1</code>: 节目信息表</li>
<li><code v-pre>t_program_category</code>: 节目分类表</li>
<li><code v-pre>t_program_group_0</code>: 节目分组表</li>
</ul>
<h3 id="_1-3-订单相关数据库-taopiaopiao-order-0-taopiaopiao-order-1" tabindex="-1"><a class="header-anchor" href="#_1-3-订单相关数据库-taopiaopiao-order-0-taopiaopiao-order-1"><span>1.3 订单相关数据库 (taopiaopiao_order_0, taopiaopiao_order_1)</span></a></h3>
<ul>
<li><code v-pre>t_order_0</code> 至 <code v-pre>t_order_4</code>: 订单信息表</li>
<li><code v-pre>t_order_ticket_user_0</code> 至 <code v-pre>t_order_ticket_user_4</code>: 订单购票人关联表</li>
</ul>
<h3 id="_1-4-支付相关数据库-taopiaopiao-pay-0-taopiaopiao-pay-1" tabindex="-1"><a class="header-anchor" href="#_1-4-支付相关数据库-taopiaopiao-pay-0-taopiaopiao-pay-1"><span>1.4 支付相关数据库 (taopiaopiao_pay_0, taopiaopiao_pay_1)</span></a></h3>
<ul>
<li><code v-pre>t_pay_bill_0</code>, <code v-pre>t_pay_bill_1</code>: 支付账单表</li>
<li><code v-pre>t_refund_bill_0</code>, <code v-pre>t_refund_bill_1</code>: 退款账单表</li>
</ul>
<h2 id="_2-节目业务流程概述" tabindex="-1"><a class="header-anchor" href="#_2-节目业务流程概述"><span>2. 节目业务流程概述</span></a></h2>
<h3 id="_2-1-节目信息管理" tabindex="-1"><a class="header-anchor" href="#_2-1-节目信息管理"><span>2.1 节目信息管理</span></a></h3>
<ul>
<li>节目按类型分类（演唱会、话剧歌剧、体育、儿童亲子等）</li>
<li>节目支持多城市演出，通过节目分组关联</li>
<li>节目信息包含演出时间、地点、票价等详细信息</li>
</ul>
<h3 id="_2-2-节目浏览流程" tabindex="-1"><a class="header-anchor" href="#_2-2-节目浏览流程"><span>2.2 节目浏览流程</span></a></h3>
<ol>
<li>用户访问首页，查看推荐节目列表</li>
<li>可按分类浏览不同类型节目</li>
<li>点击节目查看详细信息</li>
<li>选择场次和票档</li>
</ol>
<h3 id="_2-3-节目数据特点" tabindex="-1"><a class="header-anchor" href="#_2-3-节目数据特点"><span>2.3 节目数据特点</span></a></h3>
<ul>
<li>节目信息采用分库分表存储</li>
<li>支持预售和实时开售两种模式</li>
<li>包含丰富的节目详情和购票须知</li>
</ul>
<h2 id="_3-项目基础讲解" tabindex="-1"><a class="header-anchor" href="#_3-项目基础讲解"><span>3. 项目基础讲解</span></a></h2>
<h3 id="_3-1-项目概述" tabindex="-1"><a class="header-anchor" href="#_3-1-项目概述"><span>3.1 项目概述</span></a></h3>
<p>淘票票是一个在线票务预订系统，主要提供演唱会、话剧歌剧、体育赛事、儿童亲子等节目的在线订票服务。用户可以注册登录后浏览节目、选择座位、下单支付，并管理自己的订单。</p>
<h3 id="_3-2-核心功能模块" tabindex="-1"><a class="header-anchor" href="#_3-2-核心功能模块"><span>3.2 核心功能模块</span></a></h3>
<ol>
<li>
<p><strong>用户管理模块</strong></p>
<ul>
<li>用户注册/登录</li>
<li>个人信息管理</li>
<li>实名认证</li>
</ul>
</li>
<li>
<p><strong>节目管理模块</strong></p>
<ul>
<li>节目信息展示</li>
<li>分类浏览</li>
<li>搜索功能</li>
</ul>
</li>
<li>
<p><strong>订单管理模块</strong></p>
<ul>
<li>选座下单</li>
<li>订单支付</li>
<li>订单查询</li>
<li>退票处理</li>
</ul>
</li>
<li>
<p><strong>支付模块</strong></p>
<ul>
<li>多种支付方式</li>
<li>支付状态管理</li>
<li>退款处理</li>
</ul>
</li>
</ol>
<h3 id="_3-3-技术架构特点" tabindex="-1"><a class="header-anchor" href="#_3-3-技术架构特点"><span>3.3 技术架构特点</span></a></h3>
<ul>
<li>微服务架构：基于Spring Cloud和Spring Cloud Alibaba</li>
<li>高并发处理：采用Redis缓存、分布式锁等技术</li>
<li>数据存储：使用ShardingSphere实现分库分表</li>
<li>监控运维：集成ELK日志系统和Spring Boot Admin</li>
</ul>
<h3 id="_3-4-核心业务流程" tabindex="-1"><a class="header-anchor" href="#_3-4-核心业务流程"><span>3.4 核心业务流程</span></a></h3>
<ol>
<li>用户浏览节目信息</li>
<li>选择场次和座位</li>
<li>创建订单</li>
<li>支付订单</li>
<li>查看订单状态</li>
<li>观演或退票</li>
</ol>
<h2 id="_4-用户业务流程概述" tabindex="-1"><a class="header-anchor" href="#_4-用户业务流程概述"><span>4. 用户业务流程概述</span></a></h2>
<h3 id="_4-1-用户注册与登录" tabindex="-1"><a class="header-anchor" href="#_4-1-用户注册与登录"><span>4.1 用户注册与登录</span></a></h3>
<ul>
<li>支持手机号注册登录</li>
<li>支持邮箱注册登录</li>
<li>集成图形验证码防止恶意注册</li>
</ul>
<h3 id="_4-2-用户信息管理" tabindex="-1"><a class="header-anchor" href="#_4-2-用户信息管理"><span>4.2 用户信息管理</span></a></h3>
<ul>
<li>基本信息维护</li>
<li>实名认证</li>
<li>收货地址管理</li>
<li>购票人信息管理</li>
</ul>
<h3 id="_4-3-用户购票流程" tabindex="-1"><a class="header-anchor" href="#_4-3-用户购票流程"><span>4.3 用户购票流程</span></a></h3>
<ol>
<li>用户登录系统</li>
<li>浏览并选择节目</li>
<li>选择场次和座位</li>
<li>填写购票人信息</li>
<li>提交订单并支付</li>
<li>查看订单详情和票务信息</li>
</ol>
<h3 id="_4-4-用户订单管理" tabindex="-1"><a class="header-anchor" href="#_4-4-用户订单管理"><span>4.4 用户订单管理</span></a></h3>
<ul>
<li>查看订单列表</li>
<li>查看订单详情</li>
<li>取消未支付订单</li>
<li>申请退票</li>
<li>查看票夹信息</li>
</ul>
<h3 id="_4-5-安全与风控" tabindex="-1"><a class="header-anchor" href="#_4-5-安全与风控"><span>4.5 安全与风控</span></a></h3>
<ul>
<li>登录状态管理</li>
<li>敏感操作验证</li>
<li>异常行为监控</li>
<li>支付安全保护</li>
</ul>
</div></template>


