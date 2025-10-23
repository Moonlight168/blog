<template><div><h1 id="🌐-flowmind" tabindex="-1"><a class="header-anchor" href="#🌐-flowmind"><span>🌐 FlowMind</span></a></h1>
<p><strong>A Cloud-Native Intelligent Workflow Orchestration Platform Based on LLM and Microservices</strong><br>
<em>(基于云原生与大模型的智能审批工作流编排平台)</em></p>
<hr>
<h2 id="🚀-项目简介" tabindex="-1"><a class="header-anchor" href="#🚀-项目简介"><span>🚀 项目简介</span></a></h2>
<p><strong>FlowMind</strong> 是一个结合 <strong>Camunda 8 (Zeebe)</strong>、<strong>LLM 智能 Agent</strong> 与 <strong>云原生微服务架构</strong> 的智能审批工作流平台。<br>
系统面向跨部门资源与预算申请场景，实现从“申请→审批→分配→通知”的全流程自动化与智能化。</p>
<p>核心目标：</p>
<ul>
<li>🔹 提升审批效率与准确性（通过 LLM 智能初审与自动路由）</li>
<li>🔹 保证分布式一致性（基于 <strong>Saga 模式</strong> 的补偿事务）</li>
<li>🔹 实现高可用架构（Kubernetes 集群 + Zeebe 集群）</li>
</ul>
<hr>
<h2 id="🧠-系统架构" tabindex="-1"><a class="header-anchor" href="#🧠-系统架构"><span>🧠 系统架构</span></a></h2>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>┌──────────────────────────┐</span></span>
<span class="line"><span>│        FlowMind UI       │</span></span>
<span class="line"><span>│ (Vue / React 前端界面)    │</span></span>
<span class="line"><span>└──────────┬───────────────┘</span></span>
<span class="line"><span>           │ REST API</span></span>
<span class="line"><span>┌──────────▼───────────────┐</span></span>
<span class="line"><span>│    Intelligent Agent      │</span></span>
<span class="line"><span>│ (FastAPI + LangChain + LLM)│</span></span>
<span class="line"><span>└──────────┬───────────────┘</span></span>
<span class="line"><span>           │ gRPC / REST</span></span>
<span class="line"><span>┌──────────▼───────────────┐</span></span>
<span class="line"><span>│   Zeebe Workflow Engine   │</span></span>
<span class="line"><span>│ (Camunda 8 Cluster)       │</span></span>
<span class="line"><span>└──────────┬───────────────┘</span></span>
<span class="line"><span>           │ Jobs Dispatch</span></span>
<span class="line"><span>┌──────────▼───────────────┐</span></span>
<span class="line"><span>│  Microservices (Workers) │</span></span>
<span class="line"><span>│  - Approval Service      │</span></span>
<span class="line"><span>│  - Resource Service      │</span></span>
<span class="line"><span>│  - Notification Service  │</span></span>
<span class="line"><span>└──────────┬───────────────┘</span></span>
<span class="line"><span>           │</span></span>
<span class="line"><span>┌──────────▼───────────────┐</span></span>
<span class="line"><span>│   K8s Cluster &#x26; Helm     │</span></span>
<span class="line"><span>│   - HA Deployment        │</span></span>
<span class="line"><span>│   - Monitoring / Logging │</span></span>
<span class="line"><span>└──────────────────────────┘</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>
<h2 id="⚙️-技术栈" tabindex="-1"><a class="header-anchor" href="#⚙️-技术栈"><span>⚙️ 技术栈</span></a></h2>
<table>
<thead>
<tr>
<th>模块</th>
<th>技术</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td>工作流引擎</td>
<td><strong>Camunda 8 (Zeebe)</strong></td>
<td>云原生、分布式 BPMN 工作流引擎</td>
</tr>
<tr>
<td>智能决策层</td>
<td><strong>LangChain + OpenAI API (LLM)</strong></td>
<td>智能初审、自动路由、文本分析</td>
</tr>
<tr>
<td>Agent 微服务</td>
<td><strong>Python + FastAPI</strong></td>
<td>统一封装 LLM 推理接口</td>
</tr>
<tr>
<td>应用微服务</td>
<td><strong>Spring Boot / Go Micro</strong></td>
<td>审批逻辑与资源调度服务</td>
</tr>
<tr>
<td>部署架构</td>
<td><strong>Kubernetes + Helm</strong></td>
<td>高可用部署、自动扩缩容</td>
</tr>
<tr>
<td>存储与消息</td>
<td>PostgreSQL / Redis</td>
<td>数据存储与缓存队列</td>
</tr>
</tbody>
</table>
<hr>
<h2 id="🧩-功能特性" tabindex="-1"><a class="header-anchor" href="#🧩-功能特性"><span>🧩 功能特性</span></a></h2>
<ul>
<li>🧠 <strong>LLM 智能审批</strong>：对申请内容进行摘要、分类、风险提示与自动分派。</li>
<li>⚙️ <strong>BPMN 工作流可视化</strong>：基于 Camunda Modeler 设计跨部门流程。</li>
<li>🔁 <strong>Saga 分布式事务补偿</strong>：保障多微服务操作的一致性。</li>
<li>☁️ <strong>高可用微服务架构</strong>：基于 Kubernetes 实现无单点容错。</li>
<li>📊 <strong>可观测性支持</strong>：Prometheus + Grafana + Zeebe Operate。</li>
</ul>
<hr>
<h2 id="📦-快速启动" tabindex="-1"><a class="header-anchor" href="#📦-快速启动"><span>📦 快速启动</span></a></h2>
<h3 id="_1️⃣-环境要求" tabindex="-1"><a class="header-anchor" href="#_1️⃣-环境要求"><span>1️⃣ 环境要求</span></a></h3>
<ul>
<li>Docker &amp; Docker Compose</li>
<li>Node.js 18+</li>
<li>Python 3.10+</li>
<li>Kubernetes (本地可用 Minikube/K3s)</li>
</ul>
<h3 id="_2️⃣-克隆仓库" tabindex="-1"><a class="header-anchor" href="#_2️⃣-克隆仓库"><span>2️⃣ 克隆仓库</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">git</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> clone</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> https://github.com/yourname/flowmind.git</span></span>
<span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">cd</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> flowmind</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3️⃣-启动-zeebe-operate" tabindex="-1"><a class="header-anchor" href="#_3️⃣-启动-zeebe-operate"><span>3️⃣ 启动 Zeebe &amp; Operate</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">docker-compose</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -f</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> docker/zeebe-compose.yml</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> up</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -d</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="_4️⃣-启动智能-agent" tabindex="-1"><a class="header-anchor" href="#_4️⃣-启动智能-agent"><span>4️⃣ 启动智能 Agent</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">cd</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> services/agent</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">pip</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> install</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -r</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> requirements.txt</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">uvicorn</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> main:app</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> --reload</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5️⃣-启动工作流微服务" tabindex="-1"><a class="header-anchor" href="#_5️⃣-启动工作流微服务"><span>5️⃣ 启动工作流微服务</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">cd</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> services/approval</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">mvn</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> spring-boot:run</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6️⃣-访问系统" tabindex="-1"><a class="header-anchor" href="#_6️⃣-访问系统"><span>6️⃣ 访问系统</span></a></h3>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>Operate UI: http://localhost:8081</span></span>
<span class="line"><span>API Gateway: http://localhost:8000</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><hr>
<h2 id="🧮-系统示例流程-预算申请" tabindex="-1"><a class="header-anchor" href="#🧮-系统示例流程-预算申请"><span>🧮 系统示例流程（预算申请）</span></a></h2>
<p>1️⃣ 用户提交预算申请表（含长文本描述）<br>
2️⃣ LLM Agent 自动分析并提取关键字段（部门、金额、风险）<br>
3️⃣ Camunda BPMN 模型根据智能决策进行审批路由<br>
4️⃣ 审批通过后触发资源分配微服务<br>
5️⃣ 任务完成后发送通知邮件或消息</p>
<hr>
<h2 id="📊-高可用验证场景" tabindex="-1"><a class="header-anchor" href="#📊-高可用验证场景"><span>📊 高可用验证场景</span></a></h2>
<table>
<thead>
<tr>
<th>测试项</th>
<th>验证目标</th>
<th>结果预期</th>
</tr>
</thead>
<tbody>
<tr>
<td>微服务节点故障</td>
<td>K8s 自动拉起新 Pod</td>
<td>流程不中断</td>
</tr>
<tr>
<td>Zeebe 节点故障</td>
<td>集群自动重新分配 Partition</td>
<td>无状态丢失</td>
</tr>
<tr>
<td>流程异常（资源服务失败）</td>
<td>Saga 补偿逻辑生效</td>
<td>状态回滚成功</td>
</tr>
</tbody>
</table>
<hr>
<h2 id="📄-目录结构" tabindex="-1"><a class="header-anchor" href="#📄-目录结构"><span>📄 目录结构</span></a></h2>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>flowmind/</span></span>
<span class="line"><span>├── agent/                # LLM Agent (FastAPI)</span></span>
<span class="line"><span>├── bpmn/                 # BPMN 模型文件</span></span>
<span class="line"><span>├── services/</span></span>
<span class="line"><span>│   ├── approval/         # 审批微服务</span></span>
<span class="line"><span>│   ├── resource/         # 资源管理服务</span></span>
<span class="line"><span>│   └── notification/     # 通知服务</span></span>
<span class="line"><span>├── k8s/                  # K8s YAML / Helm Charts</span></span>
<span class="line"><span>├── docker/               # Docker Compose 配置</span></span>
<span class="line"><span>├── docs/                 # 技术文档与论文材料</span></span>
<span class="line"><span>└── README.md             # 当前文件</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr>
<h2 id="📚-参考文献" tabindex="-1"><a class="header-anchor" href="#📚-参考文献"><span>📚 参考文献</span></a></h2>
<ul>
<li>Camunda 8 Documentation</li>
<li>LangChain Docs</li>
<li>Kubernetes: Up &amp; Running, O’Reilly</li>
<li>Tree of Thoughts (2023), Yao et al.</li>
</ul>
<hr>
<h2 id="👨‍💻-作者信息" tabindex="-1"><a class="header-anchor" href="#👨‍💻-作者信息"><span>👨‍💻 作者信息</span></a></h2>
<table>
<thead>
<tr>
<th>信息</th>
<th>内容</th>
</tr>
</thead>
<tbody>
<tr>
<td>学生</td>
<td>[填写姓名]</td>
</tr>
<tr>
<td>指导教师</td>
<td>[填写导师姓名]</td>
</tr>
<tr>
<td>学校 / 专业</td>
<td>[填写学院与专业]</td>
</tr>
<tr>
<td>时间</td>
<td>2025 年 10 月</td>
</tr>
</tbody>
</table>
</div></template>


