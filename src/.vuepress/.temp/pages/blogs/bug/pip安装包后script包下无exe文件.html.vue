<template><div><h2 id="一、问题描述" tabindex="-1"><a class="header-anchor" href="#一、问题描述"><span>一、问题描述</span></a></h2>
<p>在 Windows 系统中使用 <code v-pre>pip</code> 安装第三方库时，遇到以下两个相关问题，故此记录一下：</p>
<ol>
<li>使用 <code v-pre>pip install</code> 安装后没有生成对应的 <code v-pre>.exe</code> 执行文件（如 <code v-pre>xxx.exe</code> 无法找到），而使用 <code v-pre>pip3</code> 却能正常生成。</li>
<li>执行 <code v-pre>pip install</code> 安装某些库时报错：</li>
</ol>
<div class="language-error line-numbers-mode" data-highlighter="shiki" data-ext="error" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-error"><span class="line"><span>Could not install packages due to an OSError: \[WinError 2] 系统找不到指定的文件。</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="二、解决方案" tabindex="-1"><a class="header-anchor" href="#二、解决方案"><span>二、解决方案</span></a></h2>
<h3 id="✅-一-直接使用-pip3-代替-pip" tabindex="-1"><a class="header-anchor" href="#✅-一-直接使用-pip3-代替-pip"><span>✅ 一：直接使用 <code v-pre>pip3</code> 代替 <code v-pre>pip</code></span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">pip3</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> install</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> &#x3C;</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">package-nam</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">e></span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>通常能在 <code v-pre>Scripts/</code> 目录下正确生成 <code v-pre>.exe</code> 文件。</p>
<h3 id="✅-二-以管理员的方式启动cmd" tabindex="-1"><a class="header-anchor" href="#✅-二-以管理员的方式启动cmd"><span>✅ 二：以管理员的方式启动cmd</span></a></h3>
<h2 id="三、原因说明" tabindex="-1"><a class="header-anchor" href="#三、原因说明"><span>三、原因说明</span></a></h2>
<h3 id="🎯-问题一-pip-安装后无-exe-文件" tabindex="-1"><a class="header-anchor" href="#🎯-问题一-pip-安装后无-exe-文件"><span>🎯 问题一：pip 安装后无 <code v-pre>.exe</code> 文件</span></a></h3>
<ul>
<li>常见于 <code v-pre>pip</code> 与 <code v-pre>python</code> 来自不同环境（如系统默认、Anaconda、虚拟环境等）。</li>
<li><code v-pre>pip</code> 安装包时会在 <code v-pre>Scripts/</code> 目录下生成对应的 <code v-pre>.exe</code> 可执行文件，若权限不足、路径异常或 pip 被破坏会导致无法生成。</li>
</ul>
<hr>
<h3 id="🎯-问题二-oserror-winerror-2" tabindex="-1"><a class="header-anchor" href="#🎯-问题二-oserror-winerror-2"><span>🎯 问题二：OSError: [WinError 2]</span></a></h3>
<p>错误含义：系统在安装过程中找不到某个临时或中间文件。</p>
<p>原因：没有权限生成文件</p>
</div></template>


