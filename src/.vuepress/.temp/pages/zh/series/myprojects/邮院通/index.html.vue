<template><div><p><a href="https://opensource.org/licenses/Apache-2.0" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/License-Apache 2.0-blue.svg" alt="License" loading="lazy"></a><br>
<img src="https://img.shields.io/badge/Java-17-orange" alt="Java" loading="lazy"><br>
<img src="https://img.shields.io/badge/Spring Boot-3.2.x-brightgreen" alt="Spring Boot" loading="lazy"><br>
<img src="https://img.shields.io/badge/build-Maven-blue" alt="Build" loading="lazy"></p>
<blockquote>
<p>一个校园一站式服务平台 + AI 智能助手</p>
</blockquote>
<h3 id="🚀项目简介" tabindex="-1"><a class="header-anchor" href="#🚀项目简介"><span>🚀项目简介</span></a></h3>
<p>打造校园全场景数字化服务生态，覆盖<strong>校园活动、教务管理、社团运营、宿舍服务、邮件通知、智能助手</strong>等核心场景，集成 <strong>Ollama + Qwen 大模型</strong>，为师生提供智能问答、业务办理、数据查询的一站式解决方案，重构校园服务体验。</p>
<h3 id="🌟技术亮点" tabindex="-1"><a class="header-anchor" href="#🌟技术亮点"><span>🌟技术亮点</span></a></h3>
<ol>
<li>
<p><strong>AI 智能助手深度集成</strong></p>
<ul>
<li>基于 <strong>Ollama + Qwen 大模型</strong>，支持自然语言问答、多轮对话</li>
<li>结合 <strong>Redis 会话缓存 + ElasticSearch 语义检索</strong>，实现校园信息“检索增强生成”，回答更准确</li>
</ul>
</li>
<li>
<p><strong>分层架构设计</strong></p>
<ul>
<li>前端 Vue3 + TDesign，UI 风格统一、组件化开发</li>
<li>后端 SpringBoot + MyBatis-Plus，分模块治理（教务、社团、宿舍、消费、邮件通知等），可扩展性强</li>
<li>权限中心基于 SpringSecurity + JWT，实现角色权限控制</li>
</ul>
</li>
<li>
<p><strong>高并发与异步处理</strong></p>
<ul>
<li>使用 <strong>RabbitMQ</strong> 处理邮件通知等异步消息</li>
<li>Redis 缓存热点数据，支持高并发请求下的快速响应</li>
</ul>
</li>
<li>
<p><strong>搜索与日志分析能力</strong></p>
<ul>
<li><strong>ElasticSearch + Kibana</strong> 提供全文检索与可视化日志分析，支持校园通知、新闻、活动的快速搜索。</li>
<li>结合 Logstash 实现数据实时采集与同步，保障系统可观测性。</li>
</ul>
</li>
<li>
<p><strong>容器化与可持续交付</strong></p>
<ul>
<li>基于 <strong>Docker + docker-compose</strong> 部署，支持 MySQL、Redis、RabbitMQ、ElasticSearch 等组件快速启动。</li>
<li>模块化配置，方便扩展与上线维护。</li>
</ul>
</li>
</ol>
<h3 id="🔍项目预览" tabindex="-1"><a class="header-anchor" href="#🔍项目预览"><span>🔍项目预览</span></a></h3>
<h4 id="登录页面" tabindex="-1"><a class="header-anchor" href="#登录页面"><span>登录页面</span></a></h4>
<table>
<thead>
<tr>
<th>页面模块</th>
<th>截图</th>
</tr>
</thead>
<tbody>
<tr>
<td>登录页面</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/login.png" alt="登录页面" loading="lazy"></td>
</tr>
<tr>
<td>新闻栏目</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/info.png" alt="新闻栏目" loading="lazy"></td>
</tr>
<tr>
<td>新闻列表</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/info_list.png" alt="新闻列表" loading="lazy"></td>
</tr>
<tr>
<td>新闻详情</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/info_detail.png" alt="新闻详情" loading="lazy"></td>
</tr>
<tr>
<td>社团活动</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/club_activity.png" alt="社团活动" loading="lazy"></td>
</tr>
<tr>
<td>社团介绍</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/club_introduce.png" alt="社团介绍" loading="lazy"></td>
</tr>
<tr>
<td>我的社团</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/myclub.png" alt="我的社团" loading="lazy"></td>
</tr>
<tr>
<td>我的成绩</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/class_grades.png" alt="我的成绩" loading="lazy"></td>
</tr>
<tr>
<td>我的课表</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/class_schedule.png" alt="我的课表" loading="lazy"></td>
</tr>
<tr>
<td>请假功能</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/class_leave.png" alt="请假功能" loading="lazy"></td>
</tr>
<tr>
<td>请假详情</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/leave_detail.png" alt="请假详情" loading="lazy"></td>
</tr>
<tr>
<td>宿舍评分</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/dorm_score.png" alt="宿舍评分" loading="lazy"></td>
</tr>
<tr>
<td>宿舍报修</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/dorm_repair.png" alt="宿舍报修" loading="lazy"></td>
</tr>
<tr>
<td>我的报修记录</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/dorm_myrepair.png" alt="我的报修记录" loading="lazy"></td>
</tr>
<tr>
<td>我的宿舍</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/dorm_my.png" alt="我的宿舍" loading="lazy"></td>
</tr>
<tr>
<td>校园消费</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/consumption.png" alt="校园消费" loading="lazy"></td>
</tr>
<tr>
<td>我的钱包</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/consumption_wallet.png" alt="我的钱包" loading="lazy"></td>
</tr>
<tr>
<td>消费记录</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/consumption_wallet_transaction.png" alt="消费记录" loading="lazy"></td>
</tr>
<tr>
<td>我的邮箱</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/mail.png" alt="我的邮箱" loading="lazy"></td>
</tr>
<tr>
<td>编辑信件</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/mail_write.png" alt="编辑信件" loading="lazy"></td>
</tr>
<tr>
<td>个人简介</td>
<td><img src="@source/zh/series/myprojects/imges/邮院通/页面预览图/user.png" alt="个人简介" loading="lazy"></td>
</tr>
</tbody>
</table>
<h3 id="🏗️系统整体架构" tabindex="-1"><a class="header-anchor" href="#🏗️系统整体架构"><span>🏗️系统整体架构</span></a></h3>
<h4 id="_1-前端层" tabindex="-1"><a class="header-anchor" href="#_1-前端层"><span>1. 前端层</span></a></h4>
<ul>
<li><strong>技术栈</strong>：Vue3 + TDesign + TailwindCSS</li>
<li><strong>核心作用</strong>：
<ul>
<li>构建响应式校园服务界面（如首页、业务办理页、AI 助手对话界面）</li>
<li>通过 HTTP 请求与后端交互，实现数据展示与用户操作反馈</li>
<li>基于 TDesign 组件库与 TailwindCSS 实现校园风格 UI</li>
</ul>
</li>
</ul>
<h4 id="_2-应用服务层-后端" tabindex="-1"><a class="header-anchor" href="#_2-应用服务层-后端"><span>2. 应用服务层（后端）</span></a></h4>
<ul>
<li><strong>核心框架</strong>：SpringBoot</li>
<li><strong>子模块与技术</strong>：
<ul>
<li>MyBatis-Plus：简化 MySQL 数据库 CRUD 操作，处理课程、社团等业务数据</li>
<li>SpringSecurity：实现用户认证（学生/管理员账号登录）、权限控制（区分学生/管理员操作权限）</li>
</ul>
</li>
<li><strong>核心作用</strong>：
<ul>
<li>接收前端请求，处理业务逻辑（如课程查询、社团申请审核）</li>
<li>调用数据层与中间件，完成数据存取与异步任务调度</li>
<li>对接 AI 能力层，转发用户提问并返回智能回答</li>
</ul>
</li>
</ul>
<h4 id="_3-数据存储层" tabindex="-1"><a class="header-anchor" href="#_3-数据存储层"><span>3. 数据存储层</span></a></h4>
<ul>
<li><strong>技术栈</strong>：MySQL + Redis + ElasticSearch</li>
<li><strong>各自作用</strong>：
<ul>
<li>MySQL：存储结构化业务数据（用户信息、课程表、社团档案等）</li>
<li>Redis：缓存高频访问数据（如用户会话、热门新闻列表）、管理 AI 对话上下文</li>
<li>ElasticSearch：提供全文检索能力（如搜索校园通知、社团活动通知）</li>
</ul>
</li>
</ul>
<h4 id="_4-中间件层" tabindex="-1"><a class="header-anchor" href="#_4-中间件层"><span>4. 中间件层</span></a></h4>
<ul>
<li><strong>技术栈</strong>：RabbitMQ</li>
<li><strong>核心作用</strong>：
<ul>
<li>处理异步任务（如发送通知邮件、AI 回答生成后的消息推送）</li>
</ul>
</li>
</ul>
<h4 id="_5-ai-能力层" tabindex="-1"><a class="header-anchor" href="#_5-ai-能力层"><span>5. AI 能力层</span></a></h4>
<ul>
<li><strong>技术栈</strong>：Ollama + Qwen 模型</li>
<li><strong>核心作用</strong>：
<ul>
<li>接收后端转发的用户自然语言提问（如“如何申请宿舍调换？”“推荐一门计算机基础课”）</li>
<li>通过 Qwen 模型进行语义理解与内容生成，返回结构化回答</li>
<li>支持多轮对话（结合 Redis 缓存的上下文，实现连续提问逻辑）</li>
</ul>
</li>
</ul>
<h4 id="_6-各层交互关系" tabindex="-1"><a class="header-anchor" href="#_6-各层交互关系"><span>6. 各层交互关系</span></a></h4>
<ol>
<li>前端 → 应用服务层：通过 HTTP 接口提交用户操作（如查询课程、发送 AI 提问）</li>
<li>应用服务层 → 数据存储层：通过 MyBatis-Plus 操作 MySQL，通过 Redis 客户端读写缓存，通过 ES 客户端执行检索</li>
<li>应用服务层 → 中间件层：通过 RabbitMQ 发送异步任务消息（如通知、日志记录）</li>
<li>应用服务层 ↔ AI 能力层：后端调用 Ollama API 发送提问，接收 Qwen 模型返回的回答，再转发给前端</li>
</ol>
<h4 id="_2-核心技术栈" tabindex="-1"><a class="header-anchor" href="#_2-核心技术栈"><span>2. 核心技术栈</span></a></h4>
<table>
<thead>
<tr>
<th>模块</th>
<th>技术栈</th>
<th>作用说明</th>
</tr>
</thead>
<tbody>
<tr>
<td>前端</td>
<td>Vue3 + TDesign + TailwindCSS</td>
<td>响应式 UI，快速构建校园业务页面</td>
</tr>
<tr>
<td>后端</td>
<td>SpringBoot + MyBatis-Plus</td>
<td>业务逻辑处理、数据持久化</td>
</tr>
<tr>
<td>权限管理</td>
<td>SpringSecurity</td>
<td>接口鉴权、角色权限控制</td>
</tr>
<tr>
<td>数据存储</td>
<td>MySQL + Redis + ElasticSearch</td>
<td>结构化数据、缓存、全文检索</td>
</tr>
<tr>
<td>消息队列</td>
<td>RabbitMQ</td>
<td>异步任务（如邮件通知）</td>
</tr>
<tr>
<td>AI 能力</td>
<td>Ollama + Qwen 模型</td>
<td>智能问答与搜索</td>
</tr>
</tbody>
</table>
<h3 id="🛠️功能模块详解" tabindex="-1"><a class="header-anchor" href="#🛠️功能模块详解"><span>🛠️功能模块详解</span></a></h3>
<h4 id="_1-业务服务模块" tabindex="-1"><a class="header-anchor" href="#_1-业务服务模块"><span>1. 业务服务模块</span></a></h4>
<ul>
<li>
<p><strong>gupt-assistant-service</strong>：AI 智能助手核心</p>
<ul>
<li>对接 <strong>Ollama 部署的 Qwen 模型</strong>，实现：
<ul>
<li>自然语言问答（如“查一下本学期我的课程表”）</li>
<li>语义检索（结合 ElasticSearch 实现校园信息智能查询）</li>
</ul>
</li>
</ul>
</li>
<li>
<p><strong>gupt-auth</strong>：权限管理中心</p>
<ul>
<li>基于 SpringSecurity 实现 <strong>RBAC（角色权限控制）</strong></li>
<li>支持账号密码、JWT Token 登录，区分学生、管理员等角色权限</li>
</ul>
</li>
<li>
<p><strong>gupt-club-service</strong>：社团管理系统</p>
<ul>
<li>社团创建、招新、活动发布流程</li>
</ul>
</li>
<li>
<p><strong>gupt-course-service</strong>：教务课程服务</p>
<ul>
<li>课程查询、成绩查询</li>
</ul>
</li>
<li>
<p><strong>gupt-dormitory-service</strong>：宿舍服务</p>
<ul>
<li>宿舍分配、报修流程、水电费查询</li>
</ul>
</li>
<li>
<p><strong>gupt-email-service</strong>：邮件通知服务</p>
<ul>
<li>结合 RabbitMQ 异步发送：
<ul>
<li>社团活动提醒、系统公告等</li>
</ul>
</li>
</ul>
</li>
<li>
<p><strong>gupt-user-service</strong>：用户中心</p>
<ul>
<li>学生信息管理、个人资料维护</li>
</ul>
</li>
</ul>
<h4 id="_2-ai-能力深度集成" tabindex="-1"><a class="header-anchor" href="#_2-ai-能力深度集成"><span>2. AI 能力深度集成</span></a></h4>
<ul>
<li>
<p><strong>核心流程</strong>：<br>
<img src="@source/zh/series/myprojects/imges/邮院通/UML/问答流程.svg" alt="AI 能力流程" loading="lazy"></p>
</li>
<li>
<p><strong>关键实现</strong>：</p>
<ul>
<li><strong>上下文管理</strong>：用 Redis 存储用户会话，Key 为 <code v-pre>user:session:{userId}</code>，Value 为对话历史列表，保证多轮对话连贯。</li>
<li><strong>语义检索增强</strong>：结合 ElasticSearch 构建校园知识库（课程、社团、通知等），AI 先检索再回答，提升准确性。</li>
</ul>
</li>
</ul>
<h3 id="🔧部署与启动" tabindex="-1"><a class="header-anchor" href="#🔧部署与启动"><span>🔧部署与启动</span></a></h3>
<h4 id="_1-环境依赖" tabindex="-1"><a class="header-anchor" href="#_1-环境依赖"><span>1. 环境依赖</span></a></h4>
<ul>
<li>
<p>基础环境：JDK 17 + MySQL 8.0 + Redis 7.0 + RabbitMQ 3.12 + Ollama（已部署 Qwen 模型）</p>
</li>
<li>
<p>前端依赖：Node.js 18 + npm/yarn</p>
</li>
<li>
<p>docker-compose.yml文件配置如下：</p>
</li>
</ul>
<div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">services</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  elasticsearch</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">docker.elastic.co/elasticsearch/elasticsearch:8.12.2</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">elasticsearch</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    restart</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">always</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    environment</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">discovery.type=single-node</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">ES_JAVA_OPTS=-Xms512m -Xmx512m</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">xpack.security.enabled=false</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  # 强制禁用安全</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">      #- ELASTIC_PASSWORD=4hDcyD=3xOqFWtwyVRcL</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"9200:9200"</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/elasticsearch/esdata:/usr/share/elasticsearch/data</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  # 挂载配置文件</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/elasticsearch/logs:/usr/share/elasticsearch/logs</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  # 日志目录（可选）</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/elasticsearch/certs:/usr/share/elasticsearch/config/certs</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      </span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    healthcheck</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">      #test: ["CMD-SHELL", "curl -u elastic:'4hDcyD=3xOqFWtwyVRcL' --insecure --silent --fail https://localhost:9200/_cluster/health || exit 1"]</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      test</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: [</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"CMD-SHELL"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">, </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"curl --silent --fail localhost:9200/_cluster/health || exit 1"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">]</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      interval</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">30s</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      timeout</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">10s</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      retries</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">3</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  kibana</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    restart</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">always</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">docker.elastic.co/kibana/kibana:8.12.2</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">kibana</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    environment</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">ELASTICSEARCH_HOSTS=http://elasticsearch:9200</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">      #- ELASTICSEARCH_USERNAME=elastic/kibana</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">      #- ELASTICSEARCH_password=123456</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">I18N_LOCALE=zh-CN</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  # 设置Kibana的默认语言为简体中文</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"5601:5601"</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/kibana/config/kibana.yml:/usr/share/kibana/config/kibana.yml#挂载Kibana配置文件</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    depends_on</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      elasticsearch</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">        condition</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">service_healthy</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  logstash</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">docker.elastic.co/logstash/logstash:8.12.2</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    restart</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">always</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">logstash</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">      # 挂载配置文件</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">      # 挂载 JDBC 驱动库</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/logstash/mysql-connector-j-9.2.0/mysql-connector-j-9.2.0.jar:/usr/share/logstash/mysql-connector-java.jar</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">      # 挂载用于存储元数据的目录</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/logstash/logs/:/usr/share/logstash/logs/</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"5044:5044"</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> # 如果需要监听 Beats 输入插件等，可以暴露端口</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    depends_on</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">elasticsearch</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    environment</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">LS_JAVA_OPTS=-Xmx512m -Xms512m</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> # 根据实际情况调整内存设置</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  redis</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">redis:latest</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">universitymanagementsystem-redis</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"6379:6379"</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/redis/data:/data</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  # 挂载Redis数据目录</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/redis/redis.conf:/usr/local/etc/redis/redis.conf</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  # 挂载Redis配置文件</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    restart</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">always</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  torna</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">registry.cn-hangzhou.aliyuncs.com/tanghc/torna:1.26.0</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">torna</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    environment</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      JAVA_OPTS</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"-Xms512m -Xmx512m"</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    restart</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">always</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/torna-1.26.0/application.properties:/torna/config/application.properties</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"7700:7700"</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> # 根据实际需求配置端口</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  mysql</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">mysql:latest</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">universitymanagementsystem-mysql</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    environment</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      MYSQL_ROOT_PASSWORD</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">123</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      MYSQL_DATABASE</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">university_db</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      MYSQL_USER</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">root</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      MYSQL_PASSWORD</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">123</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"3306:3306"</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/mysql/conf:/etc/mysql/conf.d:rw</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/mysql/data:/var/lib/mysql:rw</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    restart</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">always</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    </span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  rabbitmq</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">rabbitmq:3.12-management</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt-rabbitmq</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    hostname</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">rabbitmq</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"5672:5672"</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">   # AMQP 协议端口（应用连接）</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"15672:15672"</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> # 管理界面端口</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    environment</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      RABBITMQ_DEFAULT_USER</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      RABBITMQ_DEFAULT_PASS</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt123</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">      RABBITMQ_DEFAULT_VHOST</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt_vhost</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/rabbitmq_data:/var/lib/rabbitmq</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">   # 数据持久化</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">/UniversityManagementSystem/rabbitmq_logs:/var/log/rabbitmq</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">   # 日志持久化</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">gupt_network</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">    restart</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">unless-stopped</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">  gupt</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">:</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-部署步骤" tabindex="-1"><a class="header-anchor" href="#_2-部署步骤"><span>2. 部署步骤</span></a></h4>
<h5 id="_1-后端启动-以-idea-为例" tabindex="-1"><a class="header-anchor" href="#_1-后端启动-以-idea-为例"><span>（1）后端启动（以 IDEA 为例）</span></a></h5>
<ol>
<li>克隆代码仓库：<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">git</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> clone</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> https://github.com/Moonlight168/campus-ai-assistant.git</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
<li>配置 <code v-pre>application.yml</code>：
<ul>
<li>填写 MySQL、Redis、RabbitMQ 连接信息</li>
<li>配置 Ollama 地址（如 <code v-pre>http://localhost:11434</code> ，需提前启动 Ollama 并拉取 Qwen 模型：<code v-pre>ollama pull qwen</code> ）</li>
</ul>
</li>
<li>启动 SpringBoot 应用：运行 <code v-pre>gupt-management-back-end</code> 根模块的 <code v-pre>Application</code> 类</li>
</ol>
<h5 id="_2-前端启动" tabindex="-1"><a class="header-anchor" href="#_2-前端启动"><span>（2）前端启动</span></a></h5>
<ol>
<li>进入 <code v-pre>gupt-web</code> 前端目录：<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">cd</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> gupt-web</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
<li>安装依赖：<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">npm</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> install</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
<li>启动开发环境：<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">npm</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> run</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> dev</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
<li>访问前端：浏览器打开 <code v-pre>http://localhost:5173</code></li>
</ol>
<h3 id="🔗源码链接" tabindex="-1"><a class="header-anchor" href="#🔗源码链接"><span>🔗源码链接</span></a></h3>
<ul>
<li>源码地址：<a href="https://github.com/Moonlight168/gupt-management-back-end" target="_blank" rel="noopener noreferrer">GitHub - 邮院通(后端)</a></li>
<li>源码地址：<a href="https://github.com/Moonlight168/gupt-font_end" target="_blank" rel="noopener noreferrer">GitHub - 邮院通(前端)</a></li>
</ul>
</div></template>


