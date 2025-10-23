<template><div><p>本文将详细介绍如何将使用 VuePress 构建的博客部署到 GitHub Pages 上，包括本地构建、生成静态文件、推送到 <code v-pre>gh-pages</code> 分支以及自定义域名绑定等。</p>
<h2 id="一、前提条件" tabindex="-1"><a class="header-anchor" href="#一、前提条件"><span>一、前提条件</span></a></h2>
<p>在开始部署之前，请确保你已经完成了以下准备工作：</p>
<ul>
<li>已经搭建好 VuePress 项目并可本地正常访问</li>
<li>已将博客项目推送至 GitHub 仓库（如：<code v-pre>https://github.com/你的用户名/你的仓库名</code>）</li>
<li>安装了 Node.js 和 Git</li>
<li>本地可正常构建 VuePress 静态文件</li>
</ul>
<h2 id="二、构建静态文件" tabindex="-1"><a class="header-anchor" href="#二、构建静态文件"><span>二、构建静态文件</span></a></h2>
<p>VuePress 的构建命令会将所有页面编译为静态 HTML 文件，默认输出在 <code v-pre>docs/.vuepress/dist</code> 目录下：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">npm</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> run</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> build</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>执行成功后，你会在 <code v-pre>docs/.vuepress/dist/</code> 目录下看到生成的 <code v-pre>index.html</code>、<code v-pre>.js</code>、<code v-pre>.css</code> 文件等。</p>
<h2 id="三、部署到-github-pages" tabindex="-1"><a class="header-anchor" href="#三、部署到-github-pages"><span>三、部署到 GitHub Pages</span></a></h2>
<p>GitHub Pages 通常部署在 <code v-pre>gh-pages</code> 分支上。你可以使用如下方式手动推送部署：</p>
<h3 id="使用-bat-脚本部署-推荐" tabindex="-1"><a class="header-anchor" href="#使用-bat-脚本部署-推荐"><span>使用 bat 脚本部署（推荐）</span></a></h3>
<div class="language-bat line-numbers-mode" data-highlighter="shiki" data-ext="bat" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bat"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">echo</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> off</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">echo</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> 正在构建 VuePress 项目...</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">call</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> npm run build</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">if</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> %ERRORLEVEL%</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> NEQ</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> (</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">  echo</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> ❌ 构建失败，终止脚本！</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">  pause</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">  exit</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> /b </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">%ERRORLEVEL%</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">echo</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> ✅ 构建完成，进入构建输出目录...</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">cd</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> .vuepress/dist</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">echo</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> 初始化 Git 仓库...</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">git init</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">git add .</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">git commit -m </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"deploy"</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">echo</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> 推送到 GitHub gh-pages 分支...</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">git branch -M gh-pages</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">git remote add origin https://github.com/your-github-account/blog.git</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">git push -f origin gh-pages</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">echo</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> 🎉 更新完成！</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">pause</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意将 <code v-pre>origin</code> 后面的链接替换为你的仓库地址。</p>
<h2 id="四、配置-github-pages" tabindex="-1"><a class="header-anchor" href="#四、配置-github-pages"><span>四、配置 GitHub Pages</span></a></h2>
<ol>
<li>打开你的 GitHub 仓库</li>
<li>点击【Settings】→【Pages】</li>
<li>选择部署分支：<code v-pre>gh-pages</code></li>
<li>Folder 选择 <code v-pre>/ (root)</code></li>
</ol>
<h2 id="五、配置自定义域名-可选" tabindex="-1"><a class="header-anchor" href="#五、配置自定义域名-可选"><span>五、配置自定义域名（可选）</span></a></h2>
<p>如果你有自己的域名，你可以：</p>
<ol>
<li>在 <code v-pre>docs/.vuepress/dist</code> 中创建一个名为 <code v-pre>CNAME</code> 的文件，内容如下：</li>
</ol>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>你的域名</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><figure><img src="@source/blogs/前端/imges/img.png" alt="img.png" tabindex="0" loading="lazy"><figcaption>img.png</figcaption></figure>
<ol start="2">
<li>登录 DNS 服务商（如 Cloudflare）添加一条 CNAME 记录：</li>
</ol>
<table>
<thead>
<tr>
<th>类型</th>
<th>主机记录</th>
<th>目标地址</th>
</tr>
</thead>
<tbody>
<tr>
<td>CNAME</td>
<td>@</td>
<td><a href="http://your-github-account.github.io" target="_blank" rel="noopener noreferrer">your-github-account.github.io</a></td>
</tr>
</tbody>
</table>
<ol start="3">
<li>返回 GitHub Pages 设置页面，绑定这个域名（Custom domain）。</li>
</ol>
<h2 id="六、常见问题排查" tabindex="-1"><a class="header-anchor" href="#六、常见问题排查"><span>六、常见问题排查</span></a></h2>
<h3 id="_1-页面-404-或不生效" tabindex="-1"><a class="header-anchor" href="#_1-页面-404-或不生效"><span>1. 页面 404 或不生效</span></a></h3>
<ul>
<li>检查 <code v-pre>gh-pages</code> 分支是否成功部署了 <code v-pre>/index.html</code></li>
<li>检查 GitHub Pages 设置是否指向了 <code v-pre>gh-pages</code> 分支</li>
<li>清除浏览器缓存或强制刷新页面</li>
</ul>
<h3 id="_2-自定义域名无效" tabindex="-1"><a class="header-anchor" href="#_2-自定义域名无效"><span>2. 自定义域名无效</span></a></h3>
<ul>
<li>检查 DNS 是否已成功解析（使用 <code v-pre>nslookup</code> 命令）</li>
<li>确认 <code v-pre>CNAME</code> 文件已存在于 <code v-pre>dist</code> 并成功提交至 <code v-pre>gh-pages</code> 分支</li>
</ul>
<h2 id="七、总结" tabindex="-1"><a class="header-anchor" href="#七、总结"><span>七、总结</span></a></h2>
<p>整个部署流程看似复杂，其实核心就是三步：</p>
<ol>
<li>使用 <code v-pre>vuepress build</code> 构建出静态网页</li>
<li>将 <code v-pre>dist</code> 目录内容推送到 <code v-pre>gh-pages</code> 分支</li>
<li>配置 GitHub Pages 设置页面（可加自定义域名）</li>
</ol>
<p>完成上述步骤后，你的 VuePress 博客就成功上线啦！</p>
</div></template>


