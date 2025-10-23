<template><div><p>在日常使用 Linux 虚拟机时，经常会遇到这样的问题：虚拟机磁盘分配了几十个 G，但实际根分区 <code v-pre>/</code> 却只有十几 G，用不了多久就满了，导致 Docker、Elasticsearch 等服务无法正常运行。</p>
<p>这篇文章记录了我在一台 <strong>RHEL/CentOS 7</strong> 系统上，将根分区 <code v-pre>/</code> 从 <strong>22G 扩展到 78G</strong> 的完整过程。</p>
<h2 id="一、问题背景" tabindex="-1"><a class="header-anchor" href="#一、问题背景"><span>一、问题背景</span></a></h2>
<p>执行 <code v-pre>df -h</code>，发现 <code v-pre>/</code> 分区已经 100% 用满：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">/dev/mapper/rhel-root</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   22G</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">   22G</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">   0</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">  100%</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>查看磁盘情况：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lsblk</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>输出结果：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT</span></span>
<span class="line"><span>sda             8:0    0   80G  0 disk</span></span>
<span class="line"><span>├─sda1          8:1    0    1G  0 part /boot</span></span>
<span class="line"><span>└─sda2          8:2    0   44G  0 part</span></span>
<span class="line"><span>  ├─rhel-root 253:0    0   22G  0 lvm  /</span></span>
<span class="line"><span>  └─rhel-swap 253:1    0    2G  0 lvm  [SWAP]</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到：</p>
<ul>
<li>虚拟机磁盘总大小 = <strong>80G</strong></li>
<li>sda1 = 1G（/boot）</li>
<li>sda2 = 44G，里面用 LVM 分了 22G 给 root，2G 给 swap，还有 <strong>20G 没用</strong></li>
<li>剩余约 <strong>36G 还未分区</strong></li>
</ul>
<p>所以 <code v-pre>/</code> 根分区只有 22G，剩下 56G 空间（20G + 36G）闲置。</p>
<h2 id="二、扩容思路" tabindex="-1"><a class="header-anchor" href="#二、扩容思路"><span>二、扩容思路</span></a></h2>
<p>目标是让 <code v-pre>/</code> 根分区用满所有磁盘：</p>
<ol>
<li>把 sda2 里卷组剩余的 20G 分配给 root。</li>
<li>把未分区的 36G 建成新分区 <code v-pre>/dev/sda3</code>，加入卷组 rhel，再分配给 root。</li>
</ol>
<p>最终 <code v-pre>/</code> 会从 22G → 78G。</p>
<h2 id="三、扩容步骤" tabindex="-1"><a class="header-anchor" href="#三、扩容步骤"><span>三、扩容步骤</span></a></h2>
<h3 id="_1-查看卷组状态" tabindex="-1"><a class="header-anchor" href="#_1-查看卷组状态"><span>1. 查看卷组状态</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">vgdisplay</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> rhel</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>确认卷组 <code v-pre>rhel</code> 的可用空间（Free PE / Size）。</p>
<h3 id="_2-使用-sda2-的-20g-空间" tabindex="-1"><a class="header-anchor" href="#_2-使用-sda2-的-20g-空间"><span>2. 使用 sda2 的 20G 空间</span></a></h3>
<p>扩展 root LV：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lvextend</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -l</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> +100%FREE</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /dev/mapper/rhel-root</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>扩展文件系统（xfs 默认）：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">xfs_growfs</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>此时 <code v-pre>/</code> 从 22G → 42G。</p>
<h3 id="_3-创建-sda3-分区" tabindex="-1"><a class="header-anchor" href="#_3-创建-sda3-分区"><span>3. 创建 sda3 分区</span></a></h3>
<p>执行：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">fdisk</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /dev/sda</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>步骤：</p>
<ul>
<li>输入 <code v-pre>n</code> 新建分区，分区号 <code v-pre>3</code>，起始/结束扇区直接回车，默认使用剩余空间。</li>
<li>输入 <code v-pre>t</code> 修改类型，选择分区 <code v-pre>3</code>，输入 <code v-pre>8e</code>（Linux LVM）。</li>
<li>输入 <code v-pre>w</code> 保存退出。</li>
</ul>
<p>新分区 <code v-pre>/dev/sda3</code> 创建完成。</p>
<h3 id="_4-加入-lvm" tabindex="-1"><a class="header-anchor" href="#_4-加入-lvm"><span>4. 加入 LVM</span></a></h3>
<p>初始化物理卷：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">pvcreate</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /dev/sda3</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>扩展卷组：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">vgextend</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> rhel</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /dev/sda3</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>查看：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">vgdisplay</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> rhel</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>此时 Free PE 大约 36G。</p>
<h3 id="_5-扩展根分区" tabindex="-1"><a class="header-anchor" href="#_5-扩展根分区"><span>5. 扩展根分区</span></a></h3>
<p>再次扩展 root LV：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lvextend</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -l</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> +100%FREE</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /dev/mapper/rhel-root</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>扩展文件系统：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">xfs_growfs</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="_6-验证结果" tabindex="-1"><a class="header-anchor" href="#_6-验证结果"><span>6. 验证结果</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">df</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -h</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>输出类似：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>/dev/mapper/rhel-root   78G   25G   53G   32% /</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>至此，根分区 <code v-pre>/</code> 已经成功扩展到接近 80G，完全利用了虚拟机磁盘空间。</p>
<h2 id="四、总结" tabindex="-1"><a class="header-anchor" href="#四、总结"><span>四、总结</span></a></h2>
<ol>
<li>检查磁盘分区情况 (<code v-pre>lsblk</code> / <code v-pre>fdisk -l</code>)</li>
<li>如果 LVM 有空闲空间，直接 <code v-pre>lvextend</code> + <code v-pre>xfs_growfs</code>。</li>
<li>如果有未分区空间，新建分区 → <code v-pre>pvcreate</code> → <code v-pre>vgextend</code> → <code v-pre>lvextend</code> → <code v-pre>xfs_growfs</code>。</li>
<li>xfs 文件系统支持在线扩容，不需要重启。</li>
</ol>
<p>通过以上操作，我的 <code v-pre>/</code> 分区从 22G 扩容到 78G，彻底解决了磁盘不足导致的 Docker 启动失败问题。</p>
</div></template>


