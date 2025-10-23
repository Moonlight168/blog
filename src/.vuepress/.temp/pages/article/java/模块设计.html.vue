<template><div><h1 id="java-多模块项目的模块划分与-maven-依赖管理规范" tabindex="-1"><a class="header-anchor" href="#java-多模块项目的模块划分与-maven-依赖管理规范"><span>Java 多模块项目的模块划分与 Maven 依赖管理规范</span></a></h1>
<p>在企业级开发中，为了提高代码复用率、分工协作效率以及系统的可维护性，Java 项目通常采用 <strong>多模块（multi-module）架构</strong>。本篇将从模块划分思路出发，介绍如何进行合理的模块组织，并讲解 Maven 的依赖管理方式。</p>
<h2 id="一、模块如何划分" tabindex="-1"><a class="header-anchor" href="#一、模块如何划分"><span>一、模块如何划分？</span></a></h2>
<p>模块划分需遵循 <strong>高内聚、低耦合、职责单一</strong> 的原则，常见方式包括：</p>
<h3 id="_1-业务维度划分" tabindex="-1"><a class="header-anchor" href="#_1-业务维度划分"><span>1. 业务维度划分</span></a></h3>
<ul>
<li><code v-pre>user-service</code>：用户注册、登录、信息管理等功能</li>
<li><code v-pre>order-service</code>：订单创建、支付、状态流转等功能</li>
<li><code v-pre>payment-service</code>：支付接口、交易记录等</li>
<li><code v-pre>inventory-service</code>：库存管理、锁库存、减库存等</li>
</ul>
<h3 id="_2-技术维度划分" tabindex="-1"><a class="header-anchor" href="#_2-技术维度划分"><span>2. 技术维度划分</span></a></h3>
<ul>
<li><code v-pre>common-module</code>：公共工具类、DTO、统一响应结构、异常处理等</li>
<li><code v-pre>auth-service</code>：权限认证中心（如 Spring Security + JWT）</li>
<li><code v-pre>gateway-module</code>：统一入口网关服务（如 Spring Cloud Gateway）</li>
<li><code v-pre>config-service</code>：配置中心（如 Spring Cloud Config）</li>
</ul>
<h2 id="二、推荐模块目录结构" tabindex="-1"><a class="header-anchor" href="#二、推荐模块目录结构"><span>二、推荐模块目录结构</span></a></h2>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">my-project/</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> pom.xml</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">               # 父模块，统一依赖和版本控制</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> common-module</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">         # 公共模块（工具类、响应体等）</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">│</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> pom.xml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> domain-module</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">         # 实体模块，统一管理 Entity/VO/DTO</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">│</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> pom.xml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> user-service</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">          # 用户服务模块</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">│</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> pom.xml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> order-service</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">         # 订单服务模块</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">│</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> pom.xml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> auth-service</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">          # 登录认证、权限鉴权模块</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">│</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> pom.xml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">└──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> gateway-module</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        # 网关模块</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">    └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> pom.xml</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="三、父模块-pom-xml-配置-聚合模块" tabindex="-1"><a class="header-anchor" href="#三、父模块-pom-xml-配置-聚合模块"><span>三、父模块 <code v-pre>pom.xml</code> 配置（聚合模块）</span></a></h2>
<div class="language-xml line-numbers-mode" data-highlighter="shiki" data-ext="xml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-xml"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">project</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">modelVersion</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>4.0.0&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">modelVersion</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>com.example&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>my-project&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">version</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>1.0.0&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">version</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">packaging</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>pom&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">packaging</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">modules</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>common-module&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>domain-module&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>user-service&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>order-service&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>auth-service&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>gateway-module&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">module</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">modules</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependencyManagement</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependencies</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">      &#x3C;!-- 集中定义版本 --></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>org.springframework.boot&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>spring-boot-starter-web&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">version</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>3.2.0&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">version</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">      &#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependencies</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependencyManagement</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">project</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="四、子模块-pom-xml-如何配置" tabindex="-1"><a class="header-anchor" href="#四、子模块-pom-xml-如何配置"><span>四、子模块 <code v-pre>pom.xml</code> 如何配置？</span></a></h2>
<h3 id="_1-继承父模块" tabindex="-1"><a class="header-anchor" href="#_1-继承父模块"><span>1. 继承父模块</span></a></h3>
<div class="language-xml line-numbers-mode" data-highlighter="shiki" data-ext="xml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-xml"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">parent</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>com.example&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>my-project&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">version</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>1.0.0&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">version</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">parent</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-引入依赖-无需指定版本" tabindex="-1"><a class="header-anchor" href="#_2-引入依赖-无需指定版本"><span>2. 引入依赖（无需指定版本）</span></a></h3>
<div class="language-xml line-numbers-mode" data-highlighter="shiki" data-ext="xml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-xml"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependencies</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>org.springframework.boot&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>spring-boot-starter-web&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  &#x3C;!-- 引入公共模块 --></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>com.example&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>common-module&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">  &#x3C;!-- 引入实体模块 --></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>com.example&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>domain-module&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">  &#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependencies</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="五、模块命名规范" tabindex="-1"><a class="header-anchor" href="#五、模块命名规范"><span>五、模块命名规范</span></a></h2>
<table>
<thead>
<tr>
<th>命名方式</th>
<th>示例</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td>功能导向</td>
<td><code v-pre>user-service</code></td>
<td>用户服务模块</td>
</tr>
<tr>
<td>公共模块</td>
<td><code v-pre>common-module</code></td>
<td>工具类、统一响应、异常处理</td>
</tr>
<tr>
<td>实体模块</td>
<td><code v-pre>domain-module</code></td>
<td>Entity、DTO、VO 集中管理</td>
</tr>
<tr>
<td>鉴权模块</td>
<td><code v-pre>auth-service</code></td>
<td>Spring Security、JWT 管理</td>
</tr>
<tr>
<td>接口模块</td>
<td><code v-pre>api-gateway</code></td>
<td>网关服务模块</td>
</tr>
</tbody>
</table>
<p><strong>命名建议</strong>：</p>
<ul>
<li>使用 <code v-pre>kebab-case</code>（小写+短横线）用于文件夹和 <code v-pre>artifactId</code></li>
<li>模块名使用<strong>名词组合</strong>，避免使用动词，如：<code v-pre>process-order</code></li>
<li>避免混用大小写或缩写不统一</li>
</ul>
<h2 id="六、登录与权限认证模块放哪" tabindex="-1"><a class="header-anchor" href="#六、登录与权限认证模块放哪"><span>六、登录与权限认证模块放哪？</span></a></h2>
<p>推荐将登录和权限认证逻辑单独抽离为 <code v-pre>auth-service</code> 模块，职责包括：</p>
<table>
<thead>
<tr>
<th>功能</th>
<th>放置模块</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td>登录接口、验证码、密码校验</td>
<td><code v-pre>auth-service</code></td>
<td>控制器、登录逻辑</td>
</tr>
<tr>
<td>用户权限加载、认证逻辑</td>
<td><code v-pre>auth-service</code> + <code v-pre>user-service</code></td>
<td>实现 <code v-pre>UserDetailsService</code></td>
</tr>
<tr>
<td>JWT 工具类</td>
<td><code v-pre>common-module</code></td>
<td>加解密、生成 token</td>
</tr>
<tr>
<td>权限控制配置</td>
<td><code v-pre>auth-service</code></td>
<td>Spring Security 拦截器配置等</td>
</tr>
<tr>
<td>实体类（User、Role）</td>
<td><code v-pre>domain-module</code></td>
<td>所有模块共用</td>
</tr>
</tbody>
</table>
<h2 id="七、模块源码结构标准-src" tabindex="-1"><a class="header-anchor" href="#七、模块源码结构标准-src"><span>七、模块源码结构标准（src）</span></a></h2>
<p>每个模块应采用 Maven 标准结构：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">模块/</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> pom.xml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">└──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> src/</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">    ├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> main/</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">    │</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   ├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> java/</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">             # 源码目录（必须）</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">    │</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   │</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> com/example/xxx</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">    │</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> resources/</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        # 配置文件目录</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">    └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> test/</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">        └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> java/</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">             # 测试代码</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote>
<p>所有模块都必须以 <code v-pre>src/main/java</code> 为 Java 源码目录，这是 Maven 默认识别的结构。</p>
</blockquote>
<h2 id="八、包名为什么是-com-example-xxx-形式" tabindex="-1"><a class="header-anchor" href="#八、包名为什么是-com-example-xxx-形式"><span>八、包名为什么是 <code v-pre>com.example.xxx</code> 形式？</span></a></h2>
<p>Java 推荐使用<strong>倒置的组织域名</strong>作为包名前缀，理由如下：</p>
<ul>
<li>✅ <strong>保证唯一性</strong>（避免类名、包名冲突）</li>
<li>✅ 组织清晰（适合多人协作、开源发布）</li>
<li>✅ 遵循官方规范（JDK、Spring、MyBatis 等全部采用此规范）</li>
</ul>
<p>示例：</p>
<table>
<thead>
<tr>
<th>所属组织</th>
<th>域名</th>
<th>推荐包名</th>
</tr>
</thead>
<tbody>
<tr>
<td>百度</td>
<td><a href="http://baidu.com" target="_blank" rel="noopener noreferrer">baidu.com</a></td>
<td><code v-pre>com.baidu.xxx</code></td>
</tr>
<tr>
<td>阿里</td>
<td><a href="http://alibaba.com" target="_blank" rel="noopener noreferrer">alibaba.com</a></td>
<td><code v-pre>com.alibaba.xxx</code></td>
</tr>
<tr>
<td>教育系统</td>
<td><a href="http://edu.cn" target="_blank" rel="noopener noreferrer">edu.cn</a></td>
<td><code v-pre>cn.edu.xxx</code></td>
</tr>
</tbody>
</table>
<h2 id="九、构建-依赖管理建议" tabindex="-1"><a class="header-anchor" href="#九、构建-依赖管理建议"><span>九、构建 &amp; 依赖管理建议</span></a></h2>
<table>
<thead>
<tr>
<th>实践建议</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td>使用父模块统一构建</td>
<td><code v-pre>mvn clean install</code> 自动构建所有子模块</td>
</tr>
<tr>
<td>公共依赖版本集中管理</td>
<td>父模块使用 <code v-pre>&lt;dependencyManagement&gt;</code> 控制版本</td>
</tr>
<tr>
<td>尽量少写版本号</td>
<td>子模块继承父模块，无需重复写依赖版本</td>
</tr>
<tr>
<td>封装公共逻辑</td>
<td>共用类、工具类、响应封装统一放入 <code v-pre>common-module</code></td>
</tr>
<tr>
<td>模块间显式依赖</td>
<td>子模块间通过 <code v-pre>groupId</code> + <code v-pre>artifactId</code> 显式依赖</td>
</tr>
</tbody>
</table>
</div></template>


