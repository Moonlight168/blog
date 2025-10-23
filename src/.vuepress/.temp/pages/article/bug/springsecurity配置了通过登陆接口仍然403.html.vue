<template><div><h2 id="一、问题描述" tabindex="-1"><a class="header-anchor" href="#一、问题描述"><span>一、问题描述</span></a></h2>
<p>在使用 Spring Security 进行权限控制时，即便已配置放行登录接口，如 <code v-pre>/student/login</code>，访问时仍然返回 <strong>403 Forbidden</strong> 错误。</p>
<p><img src="@source/article/bug/imges/登陆接口返回403.png" alt="" loading="lazy"><br>
<img src="@source/article/bug/imges/img.png" alt="" loading="lazy"></p>
<p>这使得前端无法完成用户登录流程，严重影响开发进度。</p>
<h2 id="二、原因分析" tabindex="-1"><a class="header-anchor" href="#二、原因分析"><span>二、原因分析</span></a></h2>
<p>通过排查，最终发现 <strong>不是权限配置的问题</strong>，而是因为：</p>
<ul>
<li>启动类所在模块未正确扫描到包含 <code v-pre>@RestController</code> 的模块；</li>
<li>导致 <code v-pre>Controller</code> 未被加载进 Spring 容器，自然也无法响应请求；</li>
<li>Spring Security 拦截未识别请求路径，默认返回 403。</li>
</ul>
<p>此外，还有部分配置性问题：</p>
<ul>
<li>使用 JWT 自定义认证逻辑时，若 <code v-pre>filterChain</code> 中未正确跳过登录接口，或过滤器顺序不当，也可能导致 Spring Security 仍然尝试身份校验；</li>
<li>IDEA 项目配置错误也会引起模块编译失败或包扫描异常。</li>
</ul>
<h2 id="三、解决方案" tabindex="-1"><a class="header-anchor" href="#三、解决方案"><span>三、解决方案</span></a></h2>
<h3 id="✅-1-启动类必须能扫描到所有-web-层-controller" tabindex="-1"><a class="header-anchor" href="#✅-1-启动类必须能扫描到所有-web-层-controller"><span>✅ 1. 启动类必须能扫描到所有 Web 层 Controller</span></a></h3>
<p>建议将启动类（<code v-pre>@SpringBootApplication</code>）放在统一的 Web 层模块中，如 <code v-pre>gupt-api</code>，并在 <code v-pre>pom.xml</code> 中添加所有业务模块依赖：</p>
<div class="language-xml line-numbers-mode" data-highlighter="shiki" data-ext="xml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-xml"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>edu.gupt&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>gupt-auth&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>edu.gupt&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">groupId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    &#x3C;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">>gupt-user-service&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">artifactId</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">&#x3C;/</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">dependency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">&#x3C;!-- 其他模块同理 --></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>同时，使用 <code v-pre>@ComponentScan</code> 明确扫描范围：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">SpringBootApplication</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">scanBasePackages</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> =</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "edu.gupt"</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> GuptApiApplication</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">[] </span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        SpringApplication</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">run</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">GuptApiApplication</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">class</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">, args);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="✅-2-jwt-登录请求应跳过身份验证过滤器" tabindex="-1"><a class="header-anchor" href="#✅-2-jwt-登录请求应跳过身份验证过滤器"><span>✅ 2. JWT 登录请求应跳过身份验证过滤器</span></a></h3>
<p>在 <code v-pre>JwtAuthenticationTokenFilter</code> 中配置白名单，例如：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"/student/login"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">equals</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">request</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getRequestURI</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">())</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">    filterChain</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">doFilter</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(request, response);</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>确保过滤器位置正确（建议放在 <code v-pre>UsernamePasswordAuthenticationFilter</code> 之前）：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">http</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">addFilterBefore</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(jwtFilter, </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">UsernamePasswordAuthenticationFilter</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">class</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="✅-3-禁用-spring-security-默认登录页面-表单" tabindex="-1"><a class="header-anchor" href="#✅-3-禁用-spring-security-默认登录页面-表单"><span>✅ 3. 禁用 Spring Security 默认登录页面（表单）</span></a></h3>
<p>如你使用的是前后端分离 + JWT，应该禁用 <code v-pre>formLogin()</code>，防止默认跳转 HTML 登录页：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">http</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">formLogin</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(AbstractHttpConfigurer</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">::</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">disable);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="四、idea-提示-源根重复-的原因分析与解决方案" tabindex="-1"><a class="header-anchor" href="#四、idea-提示-源根重复-的原因分析与解决方案"><span>四、IDEA 提示 &quot;源根重复&quot; 的原因分析与解决方案</span></a></h2>
<h3 id="❗-错误提示" tabindex="-1"><a class="header-anchor" href="#❗-错误提示"><span>❗ 错误提示</span></a></h3>
<blockquote>
<p>源根 'F:\MyProjects\gupt-management-back-end\gupt-api\src\main\java' 在模块 'gupt-api' 中重复。</p>
</blockquote>
<figure><img src="@source/article/bug/imges/img_1.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure>
<p>说明 IntelliJ IDEA 误将同一目录多次注册为源根（Source Root），常出现在以下情形：</p>
<ul>
<li>直接以子模块 <code v-pre>gupt-api</code> 打开；</li>
<li>同时导入了父项目与子模块；</li>
<li><code v-pre>.idea/</code> 和 <code v-pre>.iml</code> 文件未清理干净。</li>
</ul>
<h2 id="五、正确导入方式-推荐" tabindex="-1"><a class="header-anchor" href="#五、正确导入方式-推荐"><span>五、正确导入方式（推荐）</span></a></h2>
<h3 id="✅-方法一-只导入父项目-根项目" tabindex="-1"><a class="header-anchor" href="#✅-方法一-只导入父项目-根项目"><span>✅ 方法一：只导入父项目（根项目）</span></a></h3>
<ol>
<li>关闭当前项目；</li>
<li>删除项目根目录下的 <code v-pre>.idea/</code> 文件夹和所有 <code v-pre>.iml</code> 文件；</li>
<li>重新使用 IDEA 打开根项目 <code v-pre>gupt-management-back-end</code>；</li>
<li>使用 <code v-pre>pom.xml</code> → <code v-pre>Import as Maven project</code>；</li>
<li>IDEA 会自动识别所有子模块，不会有重复源根。</li>
</ol>
<h3 id="✅-方法二-一个个取消标记一下也可以-但是很麻烦" tabindex="-1"><a class="header-anchor" href="#✅-方法二-一个个取消标记一下也可以-但是很麻烦"><span>✅ 方法二：一个个取消标记一下也可以，但是很麻烦</span></a></h3>
<figure><img src="@source/article/bug/imges/img_2.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure>
</div></template>


