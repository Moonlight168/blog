<template><div><h1 id="i-o" tabindex="-1"><a class="header-anchor" href="#i-o"><span>I/O</span></a></h1>
<h2 id="java怎么实现网络io高并发编程" tabindex="-1"><a class="header-anchor" href="#java怎么实现网络io高并发编程"><span>Java怎么实现网络IO高并发编程？</span></a></h2>
<p>Java实现网络IO高并发的核心是使用<strong>Java NIO</strong>（Non-Blocking IO），它是一种同步非阻塞的IO模型，基于I/O多路复用技术，可通过单个线程处理多个客户端连接，解决传统BIO（Blocking IO）多线程开销大的问题。</p>
<h3 id="_1-传统bio的缺陷-不适合高并发" tabindex="-1"><a class="header-anchor" href="#_1-传统bio的缺陷-不适合高并发"><span>1. 传统BIO的缺陷（不适合高并发）</span></a></h3>
<p>BIO采用&quot;一个连接一个线程&quot;的模型：客户端发起连接后，服务端需创建一个线程专门处理该连接的IO操作（如<code v-pre>socket.read()</code>）。若连接未发送数据，线程会阻塞在<code v-pre>read()</code>方法上，导致线程资源浪费。当客户端数量达到数千甚至数万时，线程数量暴增，会耗尽CPU和内存资源，导致系统性能急剧下降。</p>
<h3 id="_2-java-nio的核心优势-支持高并发" tabindex="-1"><a class="header-anchor" href="#_2-java-nio的核心优势-支持高并发"><span>2. Java NIO的核心优势（支持高并发）</span></a></h3>
<p>NIO基于<strong>I/O多路复用</strong>（通过<code v-pre>Selector</code>实现），核心特点是&quot;同步非阻塞&quot;：</p>
<ul>
<li><strong>非阻塞</strong>：线程调用<code v-pre>read()</code>或<code v-pre>write()</code>时，若IO未就绪，不会阻塞，直接返回，线程可处理其他连接。</li>
<li><strong>多路复用</strong>：通过<code v-pre>Selector</code>（选择器）监听多个<code v-pre>Channel</code>（通道）的IO事件（如&quot;连接就绪&quot;&quot;数据可读&quot;），单个线程即可管理成千上万的<code v-pre>Channel</code>，大幅减少线程数量和上下文切换开销。</li>
</ul>
<h3 id="_3-nio实现高并发的核心组件" tabindex="-1"><a class="header-anchor" href="#_3-nio实现高并发的核心组件"><span>3. NIO实现高并发的核心组件</span></a></h3>
<ul>
<li><strong>Channel</strong>：替代BIO的流（Stream），双向传输数据（可读可写），支持非阻塞操作，如<code v-pre>SocketChannel</code>（TCP客户端）、<code v-pre>ServerSocketChannel</code>（TCP服务端）。</li>
<li><strong>Buffer</strong>：数据缓冲区，Channel读取数据到Buffer，或从Buffer写入数据到Channel，避免直接操作字节流，提升IO效率。</li>
<li><strong>Selector</strong>：IO事件监听器，线程通过<code v-pre>Selector.register()</code>将Channel注册到Selector，并指定监听的事件（如<code v-pre>SelectionKey.OP_ACCEPT</code>（连接事件）、<code v-pre>SelectionKey.OP_READ</code>（读事件））；线程通过<code v-pre>Selector.select()</code>阻塞等待事件就绪，再批量处理就绪的Channel。</li>
</ul>
<h3 id="_4-nio高并发服务端核心流程" tabindex="-1"><a class="header-anchor" href="#_4-nio高并发服务端核心流程"><span>4. NIO高并发服务端核心流程</span></a></h3>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 1. 创建ServerSocketChannel，设置为非阻塞</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">ServerSocketChannel</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> serverChannel </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> ServerSocketChannel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">open</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">serverChannel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">configureBlocking</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">false</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">serverChannel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">bind</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> InetSocketAddress</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">8080</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">));</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 2. 创建Selector，将ServerSocketChannel注册到Selector，监听连接事件</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">Selector</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> selector </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> Selector</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">open</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">serverChannel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">register</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(selector, </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">SelectionKey</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">OP_ACCEPT</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 3. 循环监听IO事件</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">while</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">true</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 阻塞等待事件就绪（返回就绪的事件数量）</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> readyChannels </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> selector</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">select</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (readyChannels </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">==</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">continue</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 4. 遍历就绪的事件</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">    Set</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">SelectionKey</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> selectedKeys </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> selector</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">selectedKeys</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">    Iterator</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">&#x3C;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">SelectionKey</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF">></span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> iterator </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> selectedKeys</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">iterator</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    while</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">iterator</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">hasNext</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">        SelectionKey</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> key </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> iterator</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">next</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        iterator</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">remove</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 移除事件，避免重复处理</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 5. 处理连接事件</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">key</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">isAcceptable</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">            ServerSocketChannel</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> server </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (ServerSocketChannel) </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">key</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">channel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">            // 接受客户端连接，设置为非阻塞</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">            SocketChannel</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> clientChannel </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> server</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">accept</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            clientChannel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">configureBlocking</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">false</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">            // 将客户端Channel注册到Selector，监听读事件</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">            clientChannel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">register</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(selector, </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">SelectionKey</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">OP_READ</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">        } </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 6. 处理读事件</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">        else</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">key</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">isReadable</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">            SocketChannel</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> clientChannel </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (SocketChannel) </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">key</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">channel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">            // 从Buffer读取数据</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">            ByteBuffer</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> buffer </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> ByteBuffer</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">allocate</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66">1024</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">            int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> read </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B"> clientChannel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">read</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(buffer);</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">            if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (read </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">></span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">                buffer</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">flip</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">                String</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> data </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> String</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">buffer</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">array</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(),</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">,</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> read)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">                System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"收到数据："</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> data);</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">                // 响应客户端（省略写操作）</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">            } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">else</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> if</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75"> (read </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">&#x3C;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">) {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">                // 客户端断开连接，取消注册</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">                key</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">cancel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">                clientChannel</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">close</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">            }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-进阶-使用netty框架" tabindex="-1"><a class="header-anchor" href="#_5-进阶-使用netty框架"><span>5. 进阶：使用Netty框架</span></a></h3>
<p>NIO原生API存在编程复杂、需处理半包/粘包、线程模型优化等问题，实际高并发场景（如RPC框架、网关、消息队列）更推荐使用<strong>Netty</strong>。Netty是基于NIO的异步事件驱动框架，封装了NIO的复杂性，提供：</p>
<ul>
<li>内置的半包/粘包解决方案（如LengthFieldBasedFrameDecoder）；</li>
<li>灵活的线程模型（Reactor模型）；</li>
<li>丰富的编解码器（如Protobuf、JSON）；</li>
<li>高可靠性和性能，支持百万级并发连接。</li>
</ul>
<h2 id="bio、nio、aio区别是什么" tabindex="-1"><a class="header-anchor" href="#bio、nio、aio区别是什么"><span>BIO、NIO、AIO区别是什么？</span></a></h2>
<table>
<thead>
<tr>
<th>对比维度</th>
<th>BIO（Blocking IO，阻塞IO）</th>
<th>NIO（Non-Blocking IO，非阻塞IO）</th>
<th>AIO（Asynchronous IO，异步IO）</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>核心模型</strong></td>
<td>同步阻塞</td>
<td>同步非阻塞（I/O多路复用）</td>
<td>异步非阻塞</td>
</tr>
<tr>
<td><strong>线程与连接关系</strong></td>
<td>一个连接对应一个线程，线程阻塞在IO操作上（如<code v-pre>read()</code>），IO未就绪时线程无法做其他事。</td>
<td>一个线程管理多个连接（通过<code v-pre>Selector</code>），IO未就绪时线程不阻塞，可处理其他连接。</td>
<td>IO操作由操作系统异步完成，线程无需阻塞等待，IO完成后操作系统通知线程处理结果。</td>
</tr>
<tr>
<td><strong>核心组件</strong></td>
<td>基于字节流（InputStream/OutputStream）、字符流（Reader/Writer）。</td>
<td>Channel（通道）、Buffer（缓冲区）、Selector（选择器）。</td>
<td><code v-pre>AsynchronousSocketChannel</code>、<code v-pre>AsynchronousServerSocketChannel</code>，基于回调或<code v-pre>Future</code>处理结果。</td>
</tr>
<tr>
<td><strong>适用场景</strong></td>
<td>连接数少（如几百个）、IO操作频繁且耗时短的场景，代码简单直观（如传统Socket服务端）。</td>
<td>连接数多（如数万至百万）、IO操作耗时短（CPU密集型）的场景，如聊天服务器、网关。</td>
<td>连接数多、IO操作耗时长（I/O密集型）的场景，如文件下载、视频流处理，Java中使用较少（多依赖Netty等框架的异步模型）。</td>
</tr>
<tr>
<td><strong>性能特点</strong></td>
<td>线程数量随连接数增加而增加，线程上下文切换和内存开销大，高并发下性能急剧下降。</td>
<td>线程数量少（通常为CPU核心数），减少上下文切换，高并发下性能稳定，需手动处理IO事件。</td>
<td>完全异步，线程利用率最高，但实现复杂，Java原生AIO（NIO.2）API不够成熟，实际使用较少。</td>
</tr>
<tr>
<td><strong>代码复杂度</strong></td>
<td>低，API简单，无需处理非阻塞逻辑。</td>
<td>中，需理解Selector、Channel、Buffer的协作，处理事件循环和非阻塞IO逻辑。</td>
<td>高，需处理异步回调或<code v-pre>Future</code>，避免回调地狱，调试难度大。</td>
</tr>
</tbody>
</table>
<h2 id="nio是怎么实现的" tabindex="-1"><a class="header-anchor" href="#nio是怎么实现的"><span>NIO是怎么实现的？</span></a></h2>
<p>NIO基于<strong>同步非阻塞</strong>和<strong>I/O多路复用</strong>实现，核心是通过<code v-pre>Selector</code>（选择器）让单个线程管理多个<code v-pre>Channel</code>（通道），避免传统BIO的线程阻塞问题，具体实现逻辑如下：</p>
<h3 id="_1-核心设计思想-同步非阻塞-i-o多路复用" tabindex="-1"><a class="header-anchor" href="#_1-核心设计思想-同步非阻塞-i-o多路复用"><span>1. 核心设计思想：同步非阻塞 + I/O多路复用</span></a></h3>
<ul>
<li><strong>同步</strong>：线程需主动轮询<code v-pre>Selector</code>获取IO事件（如&quot;数据可读&quot;），而非被动等待通知（AIO是异步）。</li>
<li><strong>非阻塞</strong>：<code v-pre>Channel</code>设置为非阻塞模式后，调用<code v-pre>read()</code>/<code v-pre>write()</code>时，若IO未就绪，直接返回（不阻塞线程），线程可继续处理其他<code v-pre>Channel</code>。</li>
<li><strong>I/O多路复用</strong>：<code v-pre>Selector</code>作为&quot;事件监听器&quot;，同时监听多个<code v-pre>Channel</code>的IO事件，当某个<code v-pre>Channel</code>的IO就绪时，<code v-pre>Selector</code>会标记该事件，线程只需处理就绪的<code v-pre>Channel</code>，无需逐个检查。</li>
</ul>
<h3 id="_2-三大核心组件协作流程" tabindex="-1"><a class="header-anchor" href="#_2-三大核心组件协作流程"><span>2. 三大核心组件协作流程</span></a></h3>
<p>NIO的核心是<code v-pre>Channel</code>、<code v-pre>Buffer</code>、<code v-pre>Selector</code>三者的协作，流程如下：</p>
<ol>
<li>
<p><strong>创建并配置组件</strong></p>
<ul>
<li>打开<code v-pre>ServerSocketChannel</code>（服务端）或<code v-pre>SocketChannel</code>（客户端），设置为<strong>非阻塞模式</strong>。</li>
<li>打开<code v-pre>Selector</code>（选择器），将<code v-pre>Channel</code>注册到<code v-pre>Selector</code>，并指定监听的IO事件（如<code v-pre>OP_ACCEPT</code>（连接事件）、<code v-pre>OP_READ</code>（读事件）、<code v-pre>OP_WRITE</code>（写事件））。</li>
<li>创建<code v-pre>Buffer</code>（如<code v-pre>ByteBuffer</code>），用于存储IO数据。</li>
</ul>
</li>
<li>
<p><strong>线程循环监听事件</strong></p>
<ul>
<li>线程调用<code v-pre>Selector.select()</code>方法，阻塞等待IO事件就绪（若有事件就绪，返回就绪事件数量；无事件则阻塞，不占用CPU）。</li>
<li>当<code v-pre>Channel</code>的IO事件就绪（如客户端发起连接、数据到达），<code v-pre>Selector</code>会将该<code v-pre>Channel</code>对应的<code v-pre>SelectionKey</code>（事件标识）加入就绪集合。</li>
</ul>
</li>
<li>
<p><strong>处理就绪事件</strong></p>
<ul>
<li>线程遍历<code v-pre>Selector</code>的就绪<code v-pre>SelectionKey</code>集合，判断事件类型（如连接、读、写）。</li>
<li>针对不同事件类型处理：
<ul>
<li><strong>连接事件（OP_ACCEPT）</strong>：<code v-pre>ServerSocketChannel</code>接受客户端连接，创建<code v-pre>SocketChannel</code>，设置为非阻塞并注册到<code v-pre>Selector</code>，监听读事件。</li>
<li><strong>读事件（OP_READ）</strong>：<code v-pre>SocketChannel</code>从<code v-pre>Buffer</code>读取数据，处理后清空<code v-pre>Buffer</code>，继续监听读事件（或根据需求注销）。</li>
<li><strong>写事件（OP_WRITE）</strong>：<code v-pre>SocketChannel</code>将<code v-pre>Buffer</code>中的数据写入通道，完成后注销写事件（避免频繁触发）。</li>
</ul>
</li>
</ul>
</li>
</ol>
<h3 id="_3-底层操作系统支持" tabindex="-1"><a class="header-anchor" href="#_3-底层操作系统支持"><span>3. 底层操作系统支持</span></a></h3>
<p>NIO的<code v-pre>Selector</code>依赖操作系统的I/O多路复用机制，不同操作系统实现不同：</p>
<ul>
<li><strong>Linux</strong>：基于<code v-pre>epoll</code>机制，支持高效的事件通知，无连接数限制（相比早期的<code v-pre>select</code>/<code v-pre>poll</code>，性能更优）。</li>
<li><strong>Windows</strong>：基于<code v-pre>IOCP</code>（I/O Completion Port），但NIO在Windows下对<code v-pre>epoll</code>的模拟效果较差，高并发性能不如Linux。</li>
<li><strong>macOS</strong>：基于<code v-pre>kqueue</code>机制，类似<code v-pre>epoll</code>，支持高效事件监听。</li>
</ul>
<p>JVM会根据操作系统自动选择底层实现，确保<code v-pre>Selector</code>的高效性。</p>
<h3 id="_4-关键优势总结" tabindex="-1"><a class="header-anchor" href="#_4-关键优势总结"><span>4. 关键优势总结</span></a></h3>
<ul>
<li><strong>减少线程数量</strong>：单个线程管理数千至百万个<code v-pre>Channel</code>，避免BIO&quot;一个连接一个线程&quot;的线程爆炸问题。</li>
<li><strong>降低资源开销</strong>：减少线程上下文切换和内存占用（每个线程栈需数MB内存），高并发下性能稳定。</li>
<li><strong>非阻塞IO</strong>：线程无需阻塞等待IO就绪，可充分利用CPU处理其他任务，提升线程利用率。</li>
</ul>
<h2 id="你知道有哪个框架用到nio了吗" tabindex="-1"><a class="header-anchor" href="#你知道有哪个框架用到nio了吗"><span>你知道有哪个框架用到NIO了吗？</span></a></h2>
<p>最典型的框架是<strong>Netty</strong>，它是基于Java NIO开发的异步事件驱动框架，广泛应用于高并发网络编程场景（如RPC框架、网关、消息队列、游戏服务器），其核心依赖NIO的<code v-pre>Selector</code>实现I/O多路复用，具体设计如下：</p>
<h3 id="_1-netty对nio的封装与优化" tabindex="-1"><a class="header-anchor" href="#_1-netty对nio的封装与优化"><span>1. Netty对NIO的封装与优化</span></a></h3>
<p>Netty并未直接暴露NIO的复杂API（如<code v-pre>Selector</code>、<code v-pre>Channel</code>的底层操作），而是通过封装提供更易用、更稳定的接口，解决NIO原生API的痛点：</p>
<ul>
<li><strong>解决半包/粘包问题</strong>：提供<code v-pre>LengthFieldBasedFrameDecoder</code>、<code v-pre>LineBasedFrameDecoder</code>等编解码器，自动处理TCP传输中的数据拆分与合并。</li>
<li><strong>简化线程模型</strong>：内置Reactor线程模型（如单Reactor多线程、主从Reactor多线程），无需手动管理<code v-pre>Selector</code>的事件循环。</li>
<li><strong>提升性能</strong>：优化<code v-pre>Buffer</code>（使用池化<code v-pre>ByteBuf</code>减少内存分配与回收开销）、避免NIO的空轮询bug、支持零拷贝（<code v-pre>CompositeByteBuf</code>、<code v-pre>FileRegion</code>）。</li>
</ul>
<h3 id="_2-netty的核心线程模型-reactor模式" tabindex="-1"><a class="header-anchor" href="#_2-netty的核心线程模型-reactor模式"><span>2. Netty的核心线程模型（Reactor模式）</span></a></h3>
<p>Netty基于Reactor模式（同步非阻塞IO的设计模式）实现，核心是通过<code v-pre>EventLoop</code>（事件循环）管理<code v-pre>Selector</code>和<code v-pre>Channel</code>，典型的&quot;主从Reactor多线程&quot;模型如下：</p>
<ul>
<li><strong>主Reactor（Main Reactor）</strong>：<br>
由一个线程（<code v-pre>Boss EventLoop</code>）负责监听<code v-pre>ServerSocketChannel</code>的<strong>连接事件（OP_ACCEPT）</strong>，接受客户端连接后，将<code v-pre>SocketChannel</code>注册到从Reactor的<code v-pre>Selector</code>。</li>
<li><strong>从Reactor（Sub Reactor）</strong>：<br>
由多个线程（<code v-pre>Worker EventLoop</code>）组成，每个线程管理一个<code v-pre>Selector</code>，监听<code v-pre>SocketChannel</code>的<strong>读/写事件</strong>，IO事件就绪后，将任务提交给业务线程池处理（避免阻塞IO线程）。</li>
<li><strong>业务线程池（Business Thread Pool）</strong>：<br>
处理耗时的业务逻辑（如数据库操作、复杂计算），不占用IO线程，确保IO线程能快速处理新的IO事件。</li>
</ul>
<h3 id="_3-netty的应用场景" tabindex="-1"><a class="header-anchor" href="#_3-netty的应用场景"><span>3. Netty的应用场景</span></a></h3>
<ul>
<li><strong>RPC框架</strong>：如Dubbo、gRPC，使用Netty作为底层通信组件，实现跨服务、跨JVM的高效调用。</li>
<li><strong>API网关</strong>：如Spring Cloud Gateway，基于Netty处理高并发的HTTP请求，支持路由、过滤等功能。</li>
<li><strong>消息队列</strong>：如RocketMQ、Kafka，使用Netty实现Broker与Producer/Consumer之间的高并发通信。</li>
<li><strong>游戏服务器</strong>：如MMORPG游戏的后端，使用Netty处理大量玩家的实时消息（如聊天、战斗指令）。</li>
</ul>
<h3 id="_4-其他使用nio的框架" tabindex="-1"><a class="header-anchor" href="#_4-其他使用nio的框架"><span>4. 其他使用NIO的框架</span></a></h3>
<ul>
<li><strong>Mina</strong>：与Netty类似的NIO框架，由Apache维护，设计理念与Netty相近，但社区活跃度和功能丰富度不如Netty。</li>
<li><strong>Tomcat 8+</strong>：HTTP/2协议的实现基于NIO，替代了早期的BIO模型，提升高并发下的请求处理能力。</li>
</ul>
</div></template>


