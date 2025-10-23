<template><div><h2 id="什么是tcp的三次握手和四次挥手" tabindex="-1"><a class="header-anchor" href="#什么是tcp的三次握手和四次挥手"><span>什么是TCP的三次握手和四次挥手？</span></a></h2>
<p><strong>回答：</strong></p>
<h3 id="一、tcp三次握手-建立连接" tabindex="-1"><a class="header-anchor" href="#一、tcp三次握手-建立连接"><span><strong>一、TCP三次握手（建立连接）</strong></span></a></h3>
<p>TCP（传输控制协议）是面向连接的协议，三次握手用于确保通信双方的发送和接收能力正常，流程如下：</p>
<h4 id="_1-握手过程图示" tabindex="-1"><a class="header-anchor" href="#_1-握手过程图示"><span><strong>1. 握手过程图示</strong></span></a></h4>
<div class="language-plaintext line-numbers-mode" data-highlighter="shiki" data-ext="plaintext" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-plaintext"><span class="line"><span>客户端                          服务器  </span></span>
<span class="line"><span>  │                                │  </span></span>
<span class="line"><span>  ├───────── SYN=1, seq=x ─────────►│  （客户端发送同步请求，初始化序列号x）  </span></span>
<span class="line"><span>  │                                │  </span></span>
<span class="line"><span>  │  ◄───────── SYN=1, ACK=x+1, seq=y ──────┤  （服务器确认请求，发送同步+确认，初始化序列号y）  </span></span>
<span class="line"><span>  │                                │  </span></span>
<span class="line"><span>  ├───────── ACK=y+1 ────────────►│  （客户端确认服务器的确认，连接建立完成）  </span></span>
<span class="line"><span>  │                                │</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-各步骤细节" tabindex="-1"><a class="header-anchor" href="#_2-各步骤细节"><span><strong>2. 各步骤细节</strong></span></a></h4>
<ul>
<li>
<p><strong>第一次握手（客户端→服务器）</strong>：<br>
客户端发送带有 <code v-pre>SYN</code>（同步标志）的数据包，声明自己的初始序列号 <code v-pre>x</code>，请求建立连接。此时客户端状态变为 <code v-pre>SYN_SENT</code>。</p>
</li>
<li>
<p><strong>第二次握手（服务器→客户端）</strong>：<br>
服务器收到请求后，返回 <code v-pre>SYN+ACK</code> 数据包：</p>
<ul>
<li><code v-pre>SYN=1</code>：表示服务器同意建立连接；</li>
<li><code v-pre>ACK=x+1</code>：确认客户端的序列号（期望下一个数据包的序列号为 <code v-pre>x+1</code>）；</li>
<li>声明自己的初始序列号 <code v-pre>y</code>。此时服务器状态变为 <code v-pre>SYN_RCVD</code>。</li>
</ul>
</li>
<li>
<p><strong>第三次握手（客户端→服务器）</strong>：<br>
客户端发送 <code v-pre>ACK</code>(Acknowledgment) 数据包，确认服务器的序列号 <code v-pre>y</code>（<code v-pre>ACK=y+1</code>）。此时客户端和服务器状态均变为 <code v-pre>ESTABLISHED</code>，连接正式建立。</p>
</li>
</ul>
<h4 id="_3-为什么需要三次握手" tabindex="-1"><a class="header-anchor" href="#_3-为什么需要三次握手"><span>3.为什么需要三次握手？</span></a></h4>
<h5 id="_1-防止历史连接初始化" tabindex="-1"><a class="header-anchor" href="#_1-防止历史连接初始化"><span>1. <strong>防止历史连接初始化</strong></span></a></h5>
<p>TCP 采用三次握手而非两次握手，核心在于避免旧的网络包（历史连接）被误处理，导致无效连接建立。具体逻辑如下：</p>
<h5 id="一、两次握手为何无法防止历史连接" tabindex="-1"><a class="header-anchor" href="#一、两次握手为何无法防止历史连接"><span>一、两次握手为何无法防止历史连接？</span></a></h5>
<p>假设 TCP 仅通过两次握手建立连接（客户端发 SYN，服务器回 SYN+ACK 即完成连接），可能出现以下风险场景：</p>
<p><strong>场景：旧 SYN 包导致的无效连接</strong></p>
<ol>
<li><strong>客户端首次连接的延迟与重传</strong></li>
</ol>
<ul>
<li>客户端发送 SYN 包（Seq=100）请求连接，但因网络延迟，该包未到达服务器。</li>
<li>客户端超时后重新发送 SYN 包（Seq=200），服务器收到后回复 SYN+ACK（Ack=201, Seq=300），双方完成通信后断开连接。</li>
</ul>
<ol start="2">
<li><strong>历史 SYN 包延迟到达服务器</strong></li>
</ol>
<ul>
<li>首次发送的旧 SYN 包（Seq=100）在连接断开后才到达服务器。</li>
<li>服务器误认为这是新的连接请求，返回 SYN+ACK 包（Ack=101, Seq=400），并认为连接已建立（因两次握手无需客户端最后确认）。</li>
</ul>
<p><strong>问题后果</strong>：<br>
服务器资源被无效连接占用（持续等待客户端数据），而客户端实际未发起新连接，导致资源浪费和错误连接。</p>
<h5 id="_2-双向确认通信能力" tabindex="-1"><a class="header-anchor" href="#_2-双向确认通信能力"><span>2. <strong>双向确认通信能力</strong></span></a></h5>
<p>三次握手通过“客户端→服务器→客户端”的三次交互，确保双方均确认对方的发送和接收能力正常：</p>
<ol>
<li><strong>第一次握手</strong>：客户端发送 SYN 包，确认自身发送能力正常。</li>
<li><strong>第二次握手</strong>：服务器返回 SYN+ACK 包，确认自身接收能力正常，且客户端发送能力正常。</li>
<li><strong>第三次握手</strong>：客户端返回 ACK 包，确认自身接收能力正常，且服务器发送能力正常。</li>
</ol>
<h3 id="二、tcp四次挥手-断开连接" tabindex="-1"><a class="header-anchor" href="#二、tcp四次挥手-断开连接"><span><strong>二、TCP四次挥手（断开连接）</strong></span></a></h3>
<p>当通信结束时，TCP通过四次挥手释放连接，确保数据完整传输。</p>
<h4 id="_1-挥手过程图示" tabindex="-1"><a class="header-anchor" href="#_1-挥手过程图示"><span><strong>1. 挥手过程图示</strong></span></a></h4>
<div class="language-plaintext line-numbers-mode" data-highlighter="shiki" data-ext="plaintext" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-plaintext"><span class="line"><span>客户端                          服务器  </span></span>
<span class="line"><span>  │                                │  </span></span>
<span class="line"><span>  ├───── FIN=1, seq=u ───────────►│  （客户端请求断开，发送FIN包，序列号u）  </span></span>
<span class="line"><span>  │                                │  </span></span>
<span class="line"><span>  │  ◄───── ACK=u+1, seq=v ────────┤  （服务器确认客户端的断开请求）  </span></span>
<span class="line"><span>  │                                │  </span></span>
<span class="line"><span>  │  ◄───── FIN=1, ACK=u+1, seq=w ────┤  （服务器处理完剩余数据后，发送FIN包请求断开）  </span></span>
<span class="line"><span>  │                                │  </span></span>
<span class="line"><span>  ├───── ACK=w+1 ────────────►│  （客户端确认服务器的断开请求，连接彻底关闭）  </span></span>
<span class="line"><span>  │                                │</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-各步骤细节-1" tabindex="-1"><a class="header-anchor" href="#_2-各步骤细节-1"><span><strong>2. 各步骤细节</strong></span></a></h4>
<ul>
<li>
<p><strong>第一次挥手（客户端→服务器）</strong>：<br>
客户端发送 <code v-pre>FIN</code>（结束标志）包，声明序列号 <code v-pre>u</code>，请求断开连接，状态变为 <code v-pre>FIN_WAIT_1</code>。</p>
</li>
<li>
<p><strong>第二次挥手（服务器→客户端）</strong>：<br>
服务器收到 <code v-pre>FIN</code> 后，返回 <code v-pre>ACK</code> 包（<code v-pre>ACK=u+1</code>），确认客户端的断开请求，此时服务器状态变为 <code v-pre>CLOSE_WAIT</code>，客户端状态变为 <code v-pre>FIN_WAIT_2</code>。</p>
</li>
<li>
<p><strong>第三次挥手（服务器→客户端）</strong>：<br>
服务器处理完剩余数据后，发送 <code v-pre>FIN</code> 包（序列号 <code v-pre>w</code>），请求断开连接，状态变为 <code v-pre>LAST_ACK</code>。</p>
</li>
<li>
<p><strong>第四次挥手（客户端→服务器）</strong>：<br>
客户端收到 <code v-pre>FIN</code> 后，返回 <code v-pre>ACK</code> 包（<code v-pre>ACK=w+1</code>），确认服务器的断开请求，状态变为 <code v-pre>TIME_WAIT</code>；服务器收到 <code v-pre>ACK</code> 后，状态变为 <code v-pre>CLOSED</code>。客户端在 <code v-pre>TIME_WAIT</code> 状态等待一段时间（2倍最大段生存期，MSL）后，也变为 <code v-pre>CLOSED</code>。</p>
</li>
</ul>
<h4 id="_3-为什么需要四次挥手" tabindex="-1"><a class="header-anchor" href="#_3-为什么需要四次挥手"><span><strong>3. 为什么需要四次挥手？</strong></span></a></h4>
<ul>
<li><strong>半关闭特性</strong>：TCP连接允许单向关闭（一方发送 <code v-pre>FIN</code> 后，另一方仍可发送数据）。第二次挥手时服务器可能仍有数据未传输完毕，因此 <code v-pre>ACK</code> 和 <code v-pre>FIN</code> 需分开发送，导致四次挥手。</li>
</ul>
<h3 id="三、关键状态与常见问题" tabindex="-1"><a class="header-anchor" href="#三、关键状态与常见问题"><span><strong>三、关键状态与常见问题</strong></span></a></h3>
<ul>
<li>
<p><strong>TIME_WAIT状态的作用</strong>：<br>
确保最后一个 <code v-pre>ACK</code> 包成功到达服务器，避免服务器因未收到 <code v-pre>ACK</code> 而重发 <code v-pre>FIN</code>；同时等待网络中残留的数据包过期，防止干扰新连接。</p>
</li>
<li>
<p><strong>三次握手失败/四次挥手异常</strong>：</p>
<ul>
<li>若服务器未响应第二次握手，客户端会重发 <code v-pre>SYN</code>；</li>
<li>若客户端未响应第四次挥手，服务器会重发 <code v-pre>FIN</code>。</li>
</ul>
</li>
</ul>
<h2 id="tcp和udp的区别" tabindex="-1"><a class="header-anchor" href="#tcp和udp的区别"><span>TCP和UDP的区别?</span></a></h2>
<ol>
<li>TCP<strong>面向连接</strong>；UDP是无连接的，即发送数据之前不需要建立连接。</li>
<li>TCP提供<strong>可靠的服务</strong>；UDP不保证可靠交付。</li>
<li>TCP<strong>面向字节流</strong>，把数据看成一连串无结构的字节流；UDP是面向报文的。</li>
<li>TCP有<strong>拥塞控制</strong>；UDP没有拥塞控制，因此网络出现拥塞不会使源主机的发送速率降低（对实时应用很有用，如实时视频会议等）。</li>
<li>每一条TCP连接只能是<strong>点到点</strong>的；UDP支持一对一、一对多、多对一和多对多的通信方式。</li>
<li>TCP首部开销20字节；UDP的首部开销小，只有8个字节</li>
</ol>
<h2 id="网络的工作模式有哪些" tabindex="-1"><a class="header-anchor" href="#网络的工作模式有哪些"><span>网络的工作模式有哪些?</span></a></h2>
<p><strong>回答：</strong></p>
<p>常见的网络工作模式有：</p>
<ul>
<li>
<p><strong>C/S（Client/Server）模式</strong><br>
客户端主动发起请求，服务器端响应，常见于 Web 应用、APP。</p>
</li>
<li>
<p><strong>B/S（Browser/Server）模式</strong><br>
客户端通过浏览器访问服务器，轻量化，典型代表是各种 Web 系统。</p>
</li>
<li>
<p><strong>P2P（Peer to Peer）模式</strong><br>
各个节点既是客户端也是服务器，节点间直接通信，常见于 BT 下载、区块链。</p>
</li>
<li>
<p><strong>集中式模式</strong><br>
所有请求统一通过中心服务器处理，易于管理，但单点故障风险高。</p>
</li>
<li>
<p><strong>分布式模式</strong><br>
多个节点协同完成任务，负载均衡，高可用，常用于微服务架构。</p>
</li>
</ul>
<h2 id="网络连接模式有哪些" tabindex="-1"><a class="header-anchor" href="#网络连接模式有哪些"><span>网络连接模式有哪些</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>
<p><strong>TCP（面向连接）</strong></p>
<ul>
<li>三次握手建立连接，保证数据可靠传输。</li>
<li>特点：可靠、有序、基于字节流，常用于 HTTP、FTP、SMTP 等协议。</li>
</ul>
</li>
<li>
<p><strong>UDP（无连接）</strong></p>
<ul>
<li>不建立连接，直接发送数据，可能丢包。</li>
<li>特点：不可靠、无序、基于报文，常用于 DNS、视频直播、游戏通信。</li>
</ul>
</li>
<li>
<p><strong>单播（Unicast）</strong></p>
<ul>
<li>一对一通信，最常见的模式，比如客户端请求服务器。</li>
</ul>
</li>
<li>
<p><strong>广播（Broadcast）</strong></p>
<ul>
<li>一对所有通信，在同一局域网内，消息会发给所有节点。</li>
</ul>
</li>
<li>
<p><strong>组播（Multicast）</strong></p>
<ul>
<li>一对多通信，发送给指定组内的多个节点，常用于在线视频会议、直播。</li>
</ul>
</li>
</ul>
<h2 id="虚拟机常见的网络连接模式有哪些" tabindex="-1"><a class="header-anchor" href="#虚拟机常见的网络连接模式有哪些"><span>虚拟机常见的网络连接模式有哪些？</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>
<p><strong>NAT（网络地址转换）</strong></p>
<ul>
<li>虚拟机通过宿主机的 IP 上网，外部网络无法直接访问虚拟机。</li>
<li>优点：配置简单，能上网。</li>
<li>缺点：虚拟机和外部主机之间访问受限。</li>
</ul>
</li>
<li>
<p><strong>桥接（Bridged）</strong></p>
<ul>
<li>虚拟机和宿主机在同一个物理网络中，虚拟机会像一台独立电脑一样获取局域网 IP。</li>
<li>优点：虚拟机和局域网内其他设备可互相访问。</li>
<li>缺点：需要占用局域网 IP，网络环境要求高。</li>
</ul>
</li>
<li>
<p><strong>仅主机（Host-Only）</strong></p>
<ul>
<li>虚拟机只和宿主机通信，不能访问外部网络。</li>
<li>优点：适合做隔离实验环境。</li>
<li>缺点：无法直接上网。</li>
</ul>
</li>
</ul>
<p><strong>总结：</strong></p>
<ul>
<li><strong>NAT</strong>：虚拟机借宿主机上网，外网不能访问虚拟机。</li>
<li><strong>桥接</strong>：虚拟机像局域网中的独立主机，可直接互访。</li>
<li><strong>仅主机</strong>：虚拟机只能和宿主机通信，不联网。</li>
</ul>
<h2 id="什么是软路由" tabindex="-1"><a class="header-anchor" href="#什么是软路由"><span>什么是软路由?</span></a></h2>
<p><strong>回答：</strong></p>
<p>软路由就是用一台普通电脑或嵌入式设备，通过安装路由系统软件（如 OpenWrt、PVE+爱快、ROS 等），来实现传统硬件路由器的功能。</p>
<ul>
<li><strong>本质</strong>：软件实现的路由器功能。</li>
<li><strong>主要功能</strong>：上网拨号、NAT 转换、防火墙、DHCP、端口转发、VPN、流量控制等。</li>
<li><strong>优点</strong>：可扩展性强、功能丰富、性能可根据硬件提升。</li>
<li><strong>缺点</strong>：对硬件要求高、耗电量相对大、需要一定的网络知识配置。</li>
</ul>
<h2 id="上网拨号和-dhcp-的区别" tabindex="-1"><a class="header-anchor" href="#上网拨号和-dhcp-的区别"><span>上网拨号和 DHCP 的区别</span></a></h2>
<p><strong>回答：</strong></p>
<ul>
<li>
<p><strong>DHCP（动态主机配置协议）</strong></p>
<ul>
<li>设备连上网络后，直接向 DHCP 服务器请求一个 IP 地址。</li>
<li>不需要账号密码，自动分配即可。</li>
<li>常见于企业内网、校园网、部分光猫桥接后的家庭网络。</li>
</ul>
</li>
<li>
<p><strong>PPPoE 拨号</strong></p>
<ul>
<li>在 DHCP 分配 IP 之前，需要先用账号密码完成认证。</li>
<li>拨号成功后，运营商再分配一个公网或私网 IP。</li>
<li>常见于家庭宽带、小区宽带，需要宽带账号密码。</li>
</ul>
</li>
</ul>
<p><strong>区别总结</strong>：</p>
<ul>
<li><strong>DHCP</strong>：直接分配 IP，免认证，方便快捷。</li>
<li><strong>PPPoE</strong>：先认证再分配 IP，更适合运营商计费和管理。</li>
</ul>
</div></template>


