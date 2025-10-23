<template><div><blockquote>
<p>⚠️ <strong>免责声明：本教程仅供学习 Android 安全和逆向工程知识，请勿用于商业破解或任何违法行为。若用于非法目的，后果自负！</strong></p>
</blockquote>
<h2 id="🧰-工具准备" tabindex="-1"><a class="header-anchor" href="#🧰-工具准备"><span>🧰 工具准备</span></a></h2>
<table>
<thead>
<tr>
<th>工具</th>
<th>说明</th>
<th>下载地址</th>
</tr>
</thead>
<tbody>
<tr>
<td>🔹 Java JDK（8+）</td>
<td>用于运行 apktool 和签名 APK</td>
<td><a href="https://www.oracle.com/java/technologies/javase-downloads.html" target="_blank" rel="noopener noreferrer">Oracle JDK</a> 或 <a href="https://jdk.java.net/" target="_blank" rel="noopener noreferrer">OpenJDK</a></td>
</tr>
<tr>
<td>🔹 Apktool</td>
<td>用于反编译 / 回编译 APK</td>
<td><a href="https://ibotpeaches.github.io/Apktool/" target="_blank" rel="noopener noreferrer">Apktool 官网</a></td>
</tr>
<tr>
<td>🔹 Frida-dexdump</td>
<td>用于动态脱壳</td>
<td><a href="https://github.com/hluwa/frida-dexdump" target="_blank" rel="noopener noreferrer">GitHub - frida-dexdump</a></td>
</tr>
<tr>
<td>🔹 Jadx GUI</td>
<td>将 APK 转换为 Java 源码</td>
<td><a href="https://github.com/skylot/jadx" target="_blank" rel="noopener noreferrer">Jadx GitHub</a></td>
</tr>
<tr>
<td>🔹 ADB 工具</td>
<td>安装 APK 到 Android 手机</td>
<td><a href="https://developer.android.com/studio/releases/platform-tools" target="_blank" rel="noopener noreferrer">Platform Tools</a></td>
</tr>
</tbody>
</table>
<h2 id="🔧-一、环境配置" tabindex="-1"><a class="header-anchor" href="#🔧-一、环境配置"><span>🔧 一、环境配置</span></a></h2>
<h3 id="✅-配置-java-jdk-环境变量-以-jdk-17-为例" tabindex="-1"><a class="header-anchor" href="#✅-配置-java-jdk-环境变量-以-jdk-17-为例"><span>✅ 配置 Java JDK 环境变量（以 JDK 17 为例）</span></a></h3>
<ol>
<li>
<p>安装 JDK，假设路径为：<code v-pre>C:\Program Files\Java\jdk-17</code></p>
</li>
<li>
<p>打开系统环境变量设置：</p>
<ul>
<li>
<p>新建系统变量 <code v-pre>JAVA_HOME</code>，值为 JDK 路径：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>JAVA_HOME = C:\Program Files\Java\jdk-17</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
<li>
<p>编辑 <code v-pre>Path</code> 变量，添加：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>%JAVA_HOME%\bin</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div></li>
</ul>
</li>
<li>
<p>验证是否配置成功：</p>
</li>
</ol>
<div class="language-cmd line-numbers-mode" data-highlighter="shiki" data-ext="cmd" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-cmd"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">java</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> -</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">version</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">javac</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> -</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75">version</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="✅-配置-apktool-使用-推荐-cli-方式" tabindex="-1"><a class="header-anchor" href="#✅-配置-apktool-使用-推荐-cli-方式"><span>✅ 配置 apktool 使用（推荐 CLI 方式）</span></a></h3>
<ol>
<li>下载 <code v-pre>apktool_2.xx.jar</code> ，放到如 <code v-pre>F:\AndroidTools\apktool\</code> 中。</li>
<li>新建 <code v-pre>apktool.bat</code> 内容如下：</li>
</ol>
<div class="language-bat line-numbers-mode" data-highlighter="shiki" data-ext="bat" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bat"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">@</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">echo</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> off</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">java -jar </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"</span><span style="--shiki-light:#50A14F;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">%</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic">~dp0</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">apktool_2.9.3.jar"</span><span style="--shiki-light:#383A42;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic"> %*</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><ol start="3">
<li>添加到系统 Path 环境变量：</li>
</ol>
<div class="language-bat line-numbers-mode" data-highlighter="shiki" data-ext="bat" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bat"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">F:\AndroidTools\apktool\</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><ol start="4">
<li>验证是否成功：</li>
</ol>
<div class="language-cmd line-numbers-mode" data-highlighter="shiki" data-ext="cmd" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-cmd"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">apktool</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="✅-使用-frida-进行脱壳" tabindex="-1"><a class="header-anchor" href="#✅-使用-frida-进行脱壳"><span>✅ 使用 Frida 进行脱壳</span></a></h3>
<ol>
<li>安装 frida：</li>
</ol>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">pip3</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> install</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> frida</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> frida-tools</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> frida-dexdump</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><ol start="2">
<li>
<p>下载 <code v-pre>frida-server</code>（版本根据目标 Android 系统和架构选择），例如 <code v-pre>frida-server-17.0.7-android-x86_64.xz</code></p>
</li>
<li>
<p>解压并放入 MuMu 模拟器 shell 目录（例如：<code v-pre>F:\MuMu Player 12\shell</code>），与 <code v-pre>adb.exe</code> 同目录。</p>
</li>
<li>
<p>启动MuMu模拟器，连接 adb(我这个模拟器的端口是 7555,不同模拟器可能不一样)：</p>
</li>
</ol>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">adb</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> connect</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> 127.0.0.1:7555</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><ol start="5">
<li>设置为 root 权限：</li>
</ol>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">adb</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> root</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><ol start="6">
<li>推送并设置执行权限：</li>
</ol>
<p>将下载的frida-server-16.0.11-android-x86_64解压后放到mumu模拟器shell目录下，与adb同一目录，注意一定是解压后的</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">adb</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> push</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> frida-server-17.0.7-android-x86_64</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /data/local/tmp/</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">adb</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> shell</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> chmod</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 755</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /data/local/tmp/frida-server-17.0.7-android-x86_64</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><ol start="7">
<li>启动 frida-server（注意使用管理员权限的 CMD）：</li>
</ol>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">adb</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> shell</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> /data/local/tmp/frida-server-17.0.7-android-x86_64</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> &#x26;</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>若提示 <code v-pre>Permission denied</code>，说明模拟器未 root，可尝试使用可以root的模拟器</p>
<ol start="8">
<li>获取当前运行中的应用的包名：</li>
</ol>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">adb</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> shell</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> dumpsys</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> window</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> | </span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">findstr</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> mCurrentFocus</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="🔍-二、使用-jadx-gui-分析-vip-逻辑" tabindex="-1"><a class="header-anchor" href="#🔍-二、使用-jadx-gui-分析-vip-逻辑"><span>🔍 二、使用 Jadx GUI 分析 VIP 逻辑</span></a></h2>
<ol>
<li>
<p>启动 <code v-pre>jadx-gui.exe</code>，打开 APK 文件（如 <code v-pre>app.apk</code>）</p>
</li>
<li>
<p>搜索以下关键词：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>isVip</span></span>
<span class="line"><span>getIsVipVideo</span></span>
<span class="line"><span>isPaid</span></span>
<span class="line"><span>money</span></span>
<span class="line"><span>pay_type</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li>
<p>找到核心 Java 方法，例如：</p>
</li>
</ol>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> boolean</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> getIsMoneyVideo</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    return</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> StringUtils</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">INSTANCE</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">isBiggerThan0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">this</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">money</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> boolean</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> getIsVipVideo</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    return</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> !</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">getIsMoneyVideo</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">() </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">&#x26;&#x26;</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> TextUtils</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">equals</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">this</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">pay_type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">, </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"vip"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="🛠-三、使用-apktool-修改-smali-实现" tabindex="-1"><a class="header-anchor" href="#🛠-三、使用-apktool-修改-smali-实现"><span>🛠 三、使用 apktool 修改 smali 实现</span></a></h2>
<h3 id="_1-反编译-apk" tabindex="-1"><a class="header-anchor" href="#_1-反编译-apk"><span>1. 反编译 APK：</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">apktool</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> d</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> app.apk</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -o</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> app_src</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="_2-修改-smali-文件" tabindex="-1"><a class="header-anchor" href="#_2-修改-smali-文件"><span>2. 修改 smali 文件：</span></a></h3>
<p>文件可能在如下路径：</p>
<div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-"><span class="line"><span>app_src/smali*/com/xxx/xxx/bean/VideoItemBean.smali</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>将 <code v-pre>getIsVipVideo()</code> 方法替换为：</p>
<div class="language-smali line-numbers-mode" data-highlighter="shiki" data-ext="smali" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-smali"><span class="line"><span>.method public getIsVipVideo()Z</span></span>
<span class="line"><span>    .locals 1</span></span>
<span class="line"><span>    const/4 v0, 0x1</span></span>
<span class="line"><span>    return v0</span></span>
<span class="line"><span>.end method</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此修改表示该方法恒定返回 <code v-pre>true</code>，始终视为 VIP。</p>
<h2 id="🧱-四、重新打包-apk" tabindex="-1"><a class="header-anchor" href="#🧱-四、重新打包-apk"><span>🧱 四、重新打包 APK</span></a></h2>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">apktool</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> b</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> app_src</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -o</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> modified_app.apk</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="🔏-五、生成签名密钥并签名-apk" tabindex="-1"><a class="header-anchor" href="#🔏-五、生成签名密钥并签名-apk"><span>🔏 五、生成签名密钥并签名 APK</span></a></h2>
<h3 id="_1-生成-keystore-仅需一次" tabindex="-1"><a class="header-anchor" href="#_1-生成-keystore-仅需一次"><span>1. 生成 keystore（仅需一次）</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">keytool</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -genkeypair</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -alias</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> my-key-alias</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -keyalg</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> RSA</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -keysize</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 2048</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -validity</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 10000</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2"> \</span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -keystore</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> my-release-key.keystore</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -storepass</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 123456</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -keypass</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 123456</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2"> \</span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -dname</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> "CN=Test, OU=Dev, O=Dev, L=City, ST=State, C=CN"</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-使用-jarsigner-签名-apk" tabindex="-1"><a class="header-anchor" href="#_2-使用-jarsigner-签名-apk"><span>2. 使用 <code v-pre>jarsigner</code> 签名 APK</span></a></h3>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">jarsigner</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -verbose</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -sigalg</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> SHA256withRSA</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -digestalg</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> SHA-256</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2"> \</span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -keystore</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> my-release-key.keystore</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -storepass</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 123456</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2"> \</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> modified_app.apk</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> my-key-alias</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="🚀-六、安装并测试" tabindex="-1"><a class="header-anchor" href="#🚀-六、安装并测试"><span>🚀 六、安装并测试</span></a></h2>
<p>确保开启 USB 调试并连接设备：</p>
<div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">adb</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> install</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> -r</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379"> modified_app.apk</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>打开 App，验证 VIP 功能是否破解成功。</p>
<h2 id="🧩-常见问题-faq" tabindex="-1"><a class="header-anchor" href="#🧩-常见问题-faq"><span>🧩 常见问题 FAQ</span></a></h2>
<table>
<thead>
<tr>
<th>问题</th>
<th>解决方案</th>
</tr>
</thead>
<tbody>
<tr>
<td>安装失败：签名不合法</td>
<td>使用 <code v-pre>jarsigner</code> 重新签名 APK</td>
</tr>
<tr>
<td>提示 SHA1 算法被禁用</td>
<td>改用 <code v-pre>SHA256withRSA</code> 签名算法</td>
</tr>
<tr>
<td>找不到修改方法</td>
<td>用 jadx 的“跳转到定义”功能精确定位，或搜索 smali 类名精确修改</td>
</tr>
<tr>
<td>修改无效</td>
<td>检查是否修改了正确 smali 文件，是否重新打包、签名和安装成功</td>
</tr>
<tr>
<td>frida 无法注入或报 SELinux 错误</td>
<td>尝试 root 设备或更换模拟器；也可用 Magisk 配置为 permissive 模式</td>
</tr>
</tbody>
</table>
</div></template>


