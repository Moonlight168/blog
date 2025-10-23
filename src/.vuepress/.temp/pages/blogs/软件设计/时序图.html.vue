<template><div><h1 id="时序图-sequence-diagram" tabindex="-1"><a class="header-anchor" href="#时序图-sequence-diagram"><span>时序图（Sequence Diagram）</span></a></h1>
<h2 id="_1-什么是时序图" tabindex="-1"><a class="header-anchor" href="#_1-什么是时序图"><span>1. 什么是时序图？</span></a></h2>
<p>时序图（Sequence Diagram）是 <strong>UML（统一建模语言）</strong> 中的一种交互图，用来描述系统中对象之间的消息传递顺序。它强调 <strong>时间顺序</strong>，展示了对象在特定场景下的交互过程。</p>
<h2 id="_2-时序图的作用" tabindex="-1"><a class="header-anchor" href="#_2-时序图的作用"><span>2. 时序图的作用</span></a></h2>
<ul>
<li><strong>需求分析阶段</strong>：明确业务流程，帮助开发和测试理解需求。</li>
<li><strong>系统设计阶段</strong>：设计模块间的交互逻辑。</li>
<li><strong>开发阶段</strong>：作为开发人员编写接口和调用关系的参考。</li>
<li><strong>测试阶段</strong>：根据时序图设计测试用例，验证业务流程。</li>
</ul>
<h2 id="_3-时序图的常见元素" tabindex="-1"><a class="header-anchor" href="#_3-时序图的常见元素"><span>3. 时序图的常见元素</span></a></h2>
<ol>
<li><strong>参与者（Actor）</strong>：发起交互的用户或系统，通常画在最左边。</li>
<li><strong>对象（Object / Lifeline）</strong>：交互中的角色，用竖直虚线表示生命周期。</li>
<li><strong>消息（Message）</strong>：对象之间传递的调用、返回、异步操作，用箭头表示。
<ul>
<li>实线实箭头：同步调用</li>
<li>实线虚箭头：返回消息</li>
<li>虚线箭头：异步/信号</li>
</ul>
</li>
<li><strong>激活条（Activation Bar）</strong>：对象执行某个操作的时间段。</li>
<li><strong>注释（Note）</strong>：用于补充说明。</li>
</ol>
<h2 id="_4-时序图的绘制规范" tabindex="-1"><a class="header-anchor" href="#_4-时序图的绘制规范"><span>4. 时序图的绘制规范</span></a></h2>
<ul>
<li><strong>从左到右</strong> 放置参与者和对象，顺序要清晰。</li>
<li><strong>从上到下</strong> 展示时间顺序，先发生的事件在上方。</li>
<li>每个交互过程要有始有终，尽量避免悬空调用。</li>
<li><strong>命名清晰</strong>：消息用方法名，避免模糊词（如“处理数据”→“checkUserAuth()”）。</li>
</ul>
<h2 id="_5-时序图示例" tabindex="-1"><a class="header-anchor" href="#_5-时序图示例"><span>5. 时序图示例</span></a></h2>
<p>以“用户登录”流程为例：</p>
<figure><img src="@source/blogs/软件设计/imges/img.png" alt="时序图示例" tabindex="0" loading="lazy"><figcaption>时序图示例</figcaption></figure>
</div></template>


