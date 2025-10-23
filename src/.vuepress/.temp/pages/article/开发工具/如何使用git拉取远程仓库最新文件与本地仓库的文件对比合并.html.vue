<template><div><h1 id="使用-git-拉取远程仓库并与本地对比合并" tabindex="-1"><a class="header-anchor" href="#使用-git-拉取远程仓库并与本地对比合并"><span>使用 Git 拉取远程仓库并与本地对比合并</span></a></h1>
<h2 id="一、前言" tabindex="-1"><a class="header-anchor" href="#一、前言"><span>一、前言</span></a></h2>
<p>在团队协作或本地代码落后于远程仓库时，我们需要将远程仓库的变更同步到本地，并与当前代码进行对比和合并，避免丢失本地修改。本文将通过命令行方式，说明从查看远程仓库到合并的完整流程。</p>
<h2 id="二、查看远程仓库信息" tabindex="-1"><a class="header-anchor" href="#二、查看远程仓库信息"><span>二、查看远程仓库信息</span></a></h2>
<p>使用以下命令查看远程仓库的别名（默认一般为 <code v-pre>origin</code>）及对应 URL：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">git</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> remote</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -v</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>输出示例：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>origin  https://github.com/user/project.git (fetch)</span></span>
<span class="line"><span>origin  https://github.com/user/project.git (push)</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="三、拉取远程更新-不合并" tabindex="-1"><a class="header-anchor" href="#三、拉取远程更新-不合并"><span>三、拉取远程更新（不合并）</span></a></h2>
<p>使用 <code v-pre>git fetch</code> 获取远程分支的最新提交，<strong>不会自动合并到当前分支</strong>：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">git</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> fetch</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> origin</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>说明：</p>
<ul>
<li><code v-pre>origin</code> 是远程仓库名。</li>
<li>该命令只更新远程跟踪分支，如 <code v-pre>origin/master</code>，不修改本地代码。</li>
</ul>
<h2 id="四、对比远程与本地文件差异" tabindex="-1"><a class="header-anchor" href="#四、对比远程与本地文件差异"><span>四、对比远程与本地文件差异</span></a></h2>
<p>若需对比本地文件与远程分支的差异：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">git</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> diff</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> origin/master</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> --</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> path/to/file</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>说明：</p>
<ul>
<li><code v-pre>origin/master</code> 表示远程主分支。</li>
<li><code v-pre>--</code> 后为目标文件路径。</li>
</ul>
<blockquote>
<p>若不确定远程分支名，可使用 <code v-pre>git branch -r</code> 查看所有远程分支。</p>
</blockquote>
<h2 id="五、用远程文件覆盖本地文件-可选" tabindex="-1"><a class="header-anchor" href="#五、用远程文件覆盖本地文件-可选"><span>五、用远程文件覆盖本地文件（可选）</span></a></h2>
<p>若希望用远程文件内容替换本地某个文件：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">git</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> checkout</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> origin/master</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> --</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> path/to/file</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>说明：</p>
<ul>
<li>不会自动合并，只是拷贝远程文件到本地工作区。</li>
<li>可用于对比、还原、修复某些特定文件。</li>
</ul>
<h2 id="六、合并远程分支到本地分支" tabindex="-1"><a class="header-anchor" href="#六、合并远程分支到本地分支"><span>六、合并远程分支到本地分支</span></a></h2>
<p>确认无误后，将远程分支合并到当前分支：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">git</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> merge</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> origin/master</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>说明：</p>
<ul>
<li>建议先 <code v-pre>fetch</code>，再 <code v-pre>merge</code>，可以控制流程。</li>
<li><code v-pre>git pull</code> = <code v-pre>git fetch</code> + <code v-pre>git merge</code>，适合快速同步。</li>
</ul>
<h2 id="七、解决合并冲突" tabindex="-1"><a class="header-anchor" href="#七、解决合并冲突"><span>七、解决合并冲突</span></a></h2>
<p>若本地和远程内容冲突，Git 会提示：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>CONFLICT (content): Merge conflict in path/to/file</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>冲突格式如下：</p>
<div class="language-text line-numbers-mode" data-highlighter="shiki" data-ext="text" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-text"><span class="line"><span>&#x3C;&#x3C;&#x3C;&#x3C;&#x3C;&#x3C;&#x3C; HEAD</span></span>
<span class="line"><span>本地修改</span></span>
<span class="line"><span>=======</span></span>
<span class="line"><span>远程修改</span></span>
<span class="line"><span>>>>>>>> origin/master</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>解决步骤：</strong></p>
<ol>
<li>手动修改冲突内容，删除冲突标记。</li>
<li>使用 <code v-pre>git add 文件名</code> 标记冲突解决。</li>
<li>执行 <code v-pre>git commit</code> 提交合并。</li>
</ol>
<h2 id="八、常用命令速查表" tabindex="-1"><a class="header-anchor" href="#八、常用命令速查表"><span>八、常用命令速查表</span></a></h2>
<table>
<thead>
<tr>
<th>场景</th>
<th>命令</th>
</tr>
</thead>
<tbody>
<tr>
<td>查看远程仓库信息</td>
<td><code v-pre>git remote -v</code></td>
</tr>
<tr>
<td>拉取远程更新（不合并）</td>
<td><code v-pre>git fetch origin</code></td>
</tr>
<tr>
<td>对比文件差异</td>
<td><code v-pre>git diff origin/master -- path/to/file</code></td>
</tr>
<tr>
<td>获取远程文件替换本地</td>
<td><code v-pre>git checkout origin/master -- path/to/file</code></td>
</tr>
<tr>
<td>合并远程分支到当前分支</td>
<td><code v-pre>git merge origin/master</code></td>
</tr>
<tr>
<td>解决冲突后提交</td>
<td><code v-pre>git add . &amp;&amp; git commit -m &quot;fix conflict&quot;</code></td>
</tr>
</tbody>
</table>
</div></template>


