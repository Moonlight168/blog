<template><div><h2 id="一、问题描述" tabindex="-1"><a class="header-anchor" href="#一、问题描述"><span>一、问题描述</span></a></h2>
<p>在启动 CentOS 虚拟机时，系统报错：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span></span></span>
<span class="line"><span>/dev/mapper/rhel-root does not exist</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>或：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span></span></span>
<span class="line"><span>/dev/rhel/root does not exist</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>导致系统无法正常进入。</p>
<figure><img src="@source/blogs/bug/imges/虚拟机无法启动报错.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure>
<h2 id="二、问题分析" tabindex="-1"><a class="header-anchor" href="#二、问题分析"><span>二、问题分析</span></a></h2>
<h3 id="📌-关键原因" tabindex="-1"><a class="header-anchor" href="#📌-关键原因"><span>📌 关键原因：</span></a></h3>
<blockquote>
<p>系统存在多个物理卷（PV），例如 <code v-pre>/dev/sda2</code> 和 <code v-pre>/dev/nvme0n1</code>，都被加入到了同一个卷组（VG）<code v-pre>rhel</code> 中。</p>
<p>这导致逻辑卷 <code v-pre>rhel-root</code> 跨多个磁盘（<code v-pre>sda2 + nvme0n1</code>），当启动环境中某个磁盘（如 <code v-pre>nvme0n1</code>）加载失败或初始化顺序不一致时，就会找不到完整的 <code v-pre>rhel-root</code>，从而报错。</p>
</blockquote>
<h2 id="三、快速修复-使用-rhel-8-4-镜像修复-centos" tabindex="-1"><a class="header-anchor" href="#三、快速修复-使用-rhel-8-4-镜像修复-centos"><span>三、快速修复（使用 RHEL 8.4 镜像修复 CentOS）</span></a></h2>
<h3 id="_1-准备-rhel-centos-镜像-推荐-rhel-8-4" tabindex="-1"><a class="header-anchor" href="#_1-准备-rhel-centos-镜像-推荐-rhel-8-4"><span>1. 准备 RHEL/CentOS 镜像（推荐 RHEL 8.4）</span></a></h3>
<ul>
<li>下载 <a href="https://access.redhat.com/downloads" target="_blank" rel="noopener noreferrer">RHEL 8.4</a> 镜像 ISO（或 CentOS 8.x）并挂载到虚拟机。</li>
</ul>
<h3 id="_2-启动进入-rescue-模式" tabindex="-1"><a class="header-anchor" href="#_2-启动进入-rescue-模式"><span>2. 启动进入 <strong>Rescue 模式</strong></span></a></h3>
<ol>
<li>从 ISO 启动</li>
<li>选择 <code v-pre>Troubleshooting</code> -&gt; <code v-pre>Rescue a Red Hat Enterprise Linux system</code></li>
<li>执行提示完成挂载，选择 <code v-pre>1</code>（尝试挂载现有系统）</li>
</ol>
<p>系统会将原有文件系统挂载到 <code v-pre>/mnt/sysroot</code>。</p>
<h3 id="_3-切换到原系统环境-可选" tabindex="-1"><a class="header-anchor" href="#_3-切换到原系统环境-可选"><span>3. 切换到原系统环境（可选）</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">chroot</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /mnt/sysroot</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>现在你可以像在原系统中一样操作了。</p>
<h2 id="四、根本解决-将系统从多盘整合为单盘" tabindex="-1"><a class="header-anchor" href="#四、根本解决-将系统从多盘整合为单盘"><span>四、根本解决：将系统从多盘整合为单盘</span></a></h2>
<h3 id="✅-目标-只使用-dev-sda2-彻底移除-nvme0n1" tabindex="-1"><a class="header-anchor" href="#✅-目标-只使用-dev-sda2-彻底移除-nvme0n1"><span>✅ 目标：只使用 <code v-pre>/dev/sda2</code>，彻底移除 <code v-pre>nvme0n1</code></span></a></h3>
<h3 id="_1-扩展-dev-sda2-的物理卷空间" tabindex="-1"><a class="header-anchor" href="#_1-扩展-dev-sda2-的物理卷空间"><span>1. 扩展 <code v-pre>/dev/sda2</code> 的物理卷空间</span></a></h3>
<blockquote>
<p>确保你已在虚拟机中扩大了 <code v-pre>sda</code> 盘大小。</p>
</blockquote>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">pvresize</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /dev/sda2</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>执行成功后，会显示：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>Physical volume "/dev/sda2" changed</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="_2-迁移-lvm-数据-将-nvme0n1-上的内容转移到-sda2" tabindex="-1"><a class="header-anchor" href="#_2-迁移-lvm-数据-将-nvme0n1-上的内容转移到-sda2"><span>2. 迁移 LVM 数据：将 <code v-pre>nvme0n1</code> 上的内容转移到 <code v-pre>sda2</code></span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">pvmove</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /dev/nvme0n1</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>这个过程会把 <code v-pre>nvme0n1</code> 上所有的 extents 数据块迁移到 <code v-pre>/dev/sda2</code>，<strong>时间视磁盘使用量和性能而定</strong>。</p>
<p>如果报错：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>No extents available for allocation</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>说明 <code v-pre>sda2</code> 扩容未成功，或者空间仍不足，请检查 <code v-pre>vgs</code> 和 <code v-pre>pvs</code>。</p>
<h3 id="_3-迁移成功后移除-nvme0n1" tabindex="-1"><a class="header-anchor" href="#_3-迁移成功后移除-nvme0n1"><span>3. 迁移成功后移除 nvme0n1</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">vgreduce</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> rhel</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /dev/nvme0n1</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>再将该设备从 LVM 彻底移除：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">pvremove</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /dev/nvme0n1</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>此时系统不再依赖 <code v-pre>nvme0n1</code>，你可以安全删除它或格式化重用。</p>
<hr>
<h2 id="五、最终确认" tabindex="-1"><a class="header-anchor" href="#五、最终确认"><span>五、最终确认</span></a></h2>
<h3 id="查看卷组只剩下-sda2" tabindex="-1"><a class="header-anchor" href="#查看卷组只剩下-sda2"><span>查看卷组只剩下 sda2：</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">vgs</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -o</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> +devices</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>期望输出：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>VG   #PV #LV VSize   VFree   Devices</span></span>
<span class="line"><span>rhel  1   2  79.99g  &#x3C;xx>    /dev/sda2</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="查看逻辑卷状态" tabindex="-1"><a class="header-anchor" href="#查看逻辑卷状态"><span>查看逻辑卷状态：</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">lvs</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -o</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> +devices</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>确保 <code v-pre>rhel-root</code> 和 <code v-pre>rhel-swap</code> 都只绑定在 <code v-pre>/dev/sda2</code>。</p>
<hr>
<h2 id="六、重启系统" tabindex="-1"><a class="header-anchor" href="#六、重启系统"><span>六、重启系统</span></a></h2>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2">exit</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    # 如果使用了 chroot</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">reboot</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>系统现在应该可以正常从 <code v-pre>/dev/mapper/rhel-root</code> 启动。</p>
<h2 id="七、总结建议" tabindex="-1"><a class="header-anchor" href="#七、总结建议"><span>七、总结建议</span></a></h2>
<ul>
<li>若系统原本因 <code v-pre>/</code> 空间不足而临时添加第二块磁盘（如 <code v-pre>nvme0n1</code>），<strong>推荐使用 bind mount 或 overlayfs</strong>，而不是直接加入到 LVM 卷组中。</li>
<li>使用 LVM 时避免跨多个磁盘构建卷组，除非你使用 RAID 或明确设计了多盘卷组方案。</li>
<li>每次调整 LVM 后都建议备份 <code v-pre>/etc/fstab</code> 并更新 grub：</li>
</ul>
<p>以上就是这次修复虚拟机启动失败的全过程，如有更优方法或补充，欢迎评论交流！</p>
</div></template>


