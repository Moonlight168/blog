<template><div><h3 id="✅-git-是什么" tabindex="-1"><a class="header-anchor" href="#✅-git-是什么"><span>✅ Git 是什么？</span></a></h3>
<p><strong>答：</strong><br>
Git 是一个分布式版本控制系统，用于高效地管理源代码的变更历史，支持多人协作开发。每个开发者的本地仓库都是完整的代码库副本，支持离线操作。</p>
<p><strong>核心功能包括：</strong></p>
<ul>
<li>快速切换分支（branch）</li>
<li>支持版本回退</li>
<li>离线提交</li>
<li>分布式协作（远程仓库）</li>
</ul>
<h2 id="git-中-fetch、pull、merge-的区别" tabindex="-1"><a class="header-anchor" href="#git-中-fetch、pull、merge-的区别"><span>Git 中 fetch、pull、merge 的区别？</span></a></h2>
<table>
<thead>
<tr>
<th>操作</th>
<th>是否拉取远程代码</th>
<th>是否自动合并</th>
<th>用途描述</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>git fetch</code></td>
<td>✅ 拉取（但不改当前分支）</td>
<td>❌ 否</td>
<td>只同步远程分支，供后续查看或手动合并</td>
</tr>
<tr>
<td><code v-pre>git pull</code></td>
<td>✅ 拉取</td>
<td>✅ 自动合并</td>
<td>相当于 <code v-pre>fetch</code> + <code v-pre>merge</code>，适合快速同步远程分支</td>
</tr>
<tr>
<td><code v-pre>git merge</code></td>
<td>❌ 否（不拉远程）</td>
<td>✅ 合并</td>
<td>将指定分支（本地或远程）合并到当前分支</td>
</tr>
</tbody>
</table>
<p><strong>简要记忆：</strong></p>
<ul>
<li><code v-pre>fetch</code> 拉代码，不动当前分支；</li>
<li><code v-pre>merge</code> 合并指定分支；</li>
<li><code v-pre>pull = fetch + merge</code>，快捷同步更新。</li>
</ul>
<h2 id="git-中-push、add、commit-的区别" tabindex="-1"><a class="header-anchor" href="#git-中-push、add、commit-的区别"><span>Git 中 push、add、commit 的区别？</span></a></h2>
<table>
<thead>
<tr>
<th>操作</th>
<th>工作区 → 暂存区</th>
<th>暂存区 → 本地库</th>
<th>本地库 → 远程库</th>
<th>功能描述</th>
</tr>
</thead>
<tbody>
<tr>
<td><code v-pre>git add</code></td>
<td>✅ 是</td>
<td>❌ 否</td>
<td>❌ 否</td>
<td>把文件加入暂存区，准备提交</td>
</tr>
<tr>
<td><code v-pre>git commit</code></td>
<td>❌ 否</td>
<td>✅ 是</td>
<td>❌ 否</td>
<td>将暂存区内容提交到本地版本库</td>
</tr>
<tr>
<td><code v-pre>git push</code></td>
<td>❌ 否</td>
<td>❌ 否</td>
<td>✅ 是</td>
<td>推送本地提交到远程仓库</td>
</tr>
<tr>
<td><strong>简要流程：</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
</tbody>
</table>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">工作区</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> --add--</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> 暂存区</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> --commit--</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> 本地库</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> --push--</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> 远程仓库</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p><strong>常用组合：</strong></p>
<ul>
<li>开发阶段：<code v-pre>git add .</code> → <code v-pre>git commit -m &quot;注释&quot;</code></li>
<li>协作推送：<code v-pre>git push origin 分支名</code></li>
</ul>
</div></template>


