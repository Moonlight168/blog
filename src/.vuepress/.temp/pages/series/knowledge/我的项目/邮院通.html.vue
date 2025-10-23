<template><div><h3 id="请描述一下你在项目中如何实现用户鉴权" tabindex="-1"><a class="header-anchor" href="#请描述一下你在项目中如何实现用户鉴权"><span>请描述一下你在项目中如何实现用户鉴权？</span></a></h3>
<p><strong>回答：</strong> 在项目中，我使用了 Spring Security 实现了用户鉴权模块，<br>
通过配置 UsernamePasswordAuthenticationFilter 和 JwtAuthenticationFilter 来进行用户身份验证。<br>
用户在登录时，通过用户名和密码进行验证，生成 JWT 令牌，返回给客户端，客户端通过 HTTP Header 携带该令牌进行后续的 API 请求，服务器通过 JWT 解析并验证身份。</p>
<h3 id="如何保证redis缓存与数据库的数据一致性" tabindex="-1"><a class="header-anchor" href="#如何保证redis缓存与数据库的数据一致性"><span>如何保证Redis缓存与数据库的数据一致性？</span></a></h3>
<p><strong>回答：</strong><br>
采用‘<strong>更新数据库后删除缓存</strong>’策略，并通过以下方式优化：</p>
<ul>
<li>设置缓存过期时间（如新闻缓存1小时自动失效）</li>
<li>对关键数据使用双删策略（先删缓存→更新DB→再删缓存）</li>
<li>通过消息队列异步处理缓存更新。&quot;</li>
</ul>
<h3 id="当数据库更新时-前端如何获取最新数据并刷新页面" tabindex="-1"><a class="header-anchor" href="#当数据库更新时-前端如何获取最新数据并刷新页面"><span>当数据库更新时，前端如何获取最新数据并刷新页面？</span></a></h3>
<p><strong>1. 主动推送更新（推荐方案）</strong>：使用WebSocket建立长连接，当后端数据更新时主动推送通知</p>
<p><strong>2. 短轮询方案：</strong> 前端定时（如每30秒）发送请求检查数据版本，后端响应中包含数据版本号或最后更新时间，当前端检测到版本变化时触发刷新</p>
<p><strong>3.长轮询方案：</strong> 前端发送请求后，服务端保持连接直到数据有更新</p>
</div></template>


