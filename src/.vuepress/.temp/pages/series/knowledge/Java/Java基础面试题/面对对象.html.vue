<template><div><h1 id="面向对象" tabindex="-1"><a class="header-anchor" href="#面向对象"><span>面向对象</span></a></h1>
<h2 id="怎么理解面向对象-简单说说封装继承多态" tabindex="-1"><a class="header-anchor" href="#怎么理解面向对象-简单说说封装继承多态"><span>怎么理解面向对象？简单说说封装继承多态</span></a></h2>
<p>面向对象是一种编程范式，将现实世界中的事物抽象为<strong>对象</strong>——对象包含属性（数据）和行为（方法）。其设计思想以对象为中心，通过对象间的交互实现程序功能，具备灵活性和可扩展性，能通过封装、继承应对需求变化。</p>
<p>Java面向对象的三大特性：</p>
<ol>
<li><strong>封装</strong>：将对象的属性和行为结合，对外隐藏内部细节，仅通过接口与外界交互。目的是增强安全性、简化编程，使对象更独立。</li>
<li><strong>继承</strong>：子类自动共享父类数据结构和方法的机制，是代码复用的重要手段，能建立类的层次关系，使结构更清晰。</li>
<li><strong>多态</strong>：允许不同类的对象对同一消息作出响应（同一接口，不同实例执行不同操作）。分为编译时多态（重载）和运行时多态（重写），能提升程序灵活性和扩展性。</li>
</ol>
<h2 id="多态体现在哪几个方面" tabindex="-1"><a class="header-anchor" href="#多态体现在哪几个方面"><span>多态体现在哪几个方面？</span></a></h2>
<p>多态在面向对象编程中主要体现在四个方面：</p>
<ol>
<li><strong>方法重载</strong>：同一类中多个同名方法，参数列表（类型、数量、顺序）不同；编译器根据传入参数，在编译时确定调用的方法。示例：<code v-pre>add(int a, int b)</code>和<code v-pre>add(double a, double b)</code>。</li>
<li><strong>方法重写</strong>：子类重定义父类的同名方法，方法名、参数列表、返回类型需与父类一致；运行时JVM根据对象实际类型，确定调用的方法（多态的核心）。示例：动物类<code v-pre>Animal</code>的<code v-pre>sound()</code>方法，子类<code v-pre>Dog</code>重写为<code v-pre>bark()</code>，<code v-pre>Cat</code>重写为<code v-pre>meow()</code>。</li>
<li><strong>接口与实现</strong>：多个类实现同一接口，用接口类型的引用来调用方法；程序面对不同实现时，调用方式保持一致。示例：<code v-pre>Dog</code>、<code v-pre>Cat</code>均实现<code v-pre>Animal</code>接口，用<code v-pre>Animal</code>类型引用调用<code v-pre>makeSound()</code>，会触发对应子类实现。</li>
<li><strong>向上转型和向下转型</strong>：
<ul>
<li>向上转型：父类类型引用指向子类对象（如<code v-pre>Animal dog = new Dog()</code>），运行时可调用子类重写的方法。</li>
<li>向下转型：将父类引用转回子类类型（如<code v-pre>Dog d = (Dog) animal</code>），需先确认引用实际指向的对象类型，避免<code v-pre>ClassCastException</code>。</li>
</ul>
</li>
</ol>
<h2 id="多态解决了什么问题" tabindex="-1"><a class="header-anchor" href="#多态解决了什么问题"><span>多态解决了什么问题？</span></a></h2>
<p>多态允许子类替换父类，运行时调用子类的方法实现，需依赖继承、接口等语法机制。</p>
<p>它主要解决<strong>代码扩展性和复用性</strong>问题，是设计模式、设计原则的实现基础：</p>
<ul>
<li>提升扩展性：新增子类时，无需修改现有代码（如新增<code v-pre>Bird</code>类实现<code v-pre>Animal</code>接口，无需修改<code v-pre>Animal</code>相关逻辑）。</li>
<li>提升复用性：通过父类/接口类型引用，统一调用不同子类的方法（如用<code v-pre>Animal</code>类型遍历所有动物对象，调用<code v-pre>sound()</code>）。</li>
<li>简化代码：可替代冗长的if-else判断，例如用多态实现策略模式，避免根据不同类型分支判断。</li>
</ul>
<h2 id="面向对象的设计原则你知道有哪些吗" tabindex="-1"><a class="header-anchor" href="#面向对象的设计原则你知道有哪些吗"><span>面向对象的设计原则你知道有哪些吗</span></a></h2>
<p>面向对象编程的六大核心原则：</p>
<ol>
<li><strong>单一职责原则（SRP）</strong>：一个类仅负责一项职责，只有一个引起变化的原因。示例：员工类仅管理员工信息，不负责薪资计算。</li>
<li><strong>开放封闭原则（OCP）</strong>：软件实体对扩展开放、对修改封闭。示例：定义<code v-pre>Shape</code>抽象类，新增<code v-pre>Circle</code>、<code v-pre>Rectangle</code>子类扩展功能，无需修改<code v-pre>Shape</code>类。</li>
<li><strong>里氏替换原则（LSP）</strong>：子类对象可替换父类对象，且不改变程序正确性。反例：正方形继承矩形后，修改矩形的宽和高会破坏正方形的特性，违反LSP。</li>
<li><strong>接口隔离原则（ISP）</strong>：客户端不依赖无需的接口，接口应小而专。示例：拆分“大接口”为多个“小接口”，如将<code v-pre>Animal</code>接口拆分为<code v-pre>Runable</code>、<code v-pre>Flyable</code>，避免类实现无用方法。</li>
<li><strong>依赖倒置原则（DIP）</strong>：高层模块和低层模块均依赖抽象，抽象不依赖细节，细节依赖抽象。示例：公司类依赖“部门抽象”，而非具体的技术部门、行政部门类。</li>
<li><strong>最少知识原则（Law of Demeter）</strong>：一个对象仅与直接关联的对象交互，减少对其他对象的了解。示例：用户类调用订单类的<code v-pre>getTotal()</code>，而非直接访问订单内商品的价格属性。</li>
</ol>
<h2 id="重载与重写有什么区别" tabindex="-1"><a class="header-anchor" href="#重载与重写有什么区别"><span>重载与重写有什么区别？</span></a></h2>
<table>
<thead>
<tr>
<th>对比维度</th>
<th>重载（Overloading）</th>
<th>重写（Overriding）</th>
</tr>
</thead>
<tbody>
<tr>
<td>定义范围</td>
<td>同一类中</td>
<td>父类与子类之间</td>
</tr>
<tr>
<td>方法签名</td>
<td>方法名相同，参数列表（类型、数量、顺序）不同</td>
<td>方法名、参数列表、返回类型均与父类一致</td>
</tr>
<tr>
<td>返回类型</td>
<td>可不同（需符合返回值兼容规则）</td>
<td>需与父类一致或为其子类型（协变返回）</td>
</tr>
<tr>
<td>访问修饰符</td>
<td>无限制</td>
<td>子类修饰符权限不能低于父类（如父类为public，子类不能为private）</td>
</tr>
<tr>
<td>多态类型</td>
<td>编译时多态（静态绑定）</td>
<td>运行时多态（动态绑定）</td>
</tr>
<tr>
<td>注解</td>
<td>无需特殊注解</td>
<td>需用<code v-pre>@Override</code>注解明确标识</td>
</tr>
</tbody>
</table>
<h2 id="抽象类和普通类区别" tabindex="-1"><a class="header-anchor" href="#抽象类和普通类区别"><span>抽象类和普通类区别？</span></a></h2>
<table>
<thead>
<tr>
<th>对比维度</th>
<th>普通类</th>
<th>抽象类</th>
</tr>
</thead>
<tbody>
<tr>
<td>实例化</td>
<td>可直接用<code v-pre>new</code>实例化对象</td>
<td>不能直接实例化，仅能被继承</td>
</tr>
<tr>
<td>方法定义</td>
<td>所有方法均有具体实现（非抽象）</td>
<td>可包含抽象方法（无实现）和具体方法（有实现）</td>
</tr>
<tr>
<td>继承限制</td>
<td>一个类可继承一个普通类，同时实现多个接口</td>
<td>一个类仅能继承一个抽象类，同时可实现多个接口</td>
</tr>
<tr>
<td>核心作用</td>
<td>直接创建对象，封装具体功能</td>
<td>作为基类，定义子类的通用结构，强制子类实现抽象方法</td>
</tr>
</tbody>
</table>
<h2 id="java抽象类和接口的区别是什么" tabindex="-1"><a class="header-anchor" href="#java抽象类和接口的区别是什么"><span>Java抽象类和接口的区别是什么？</span></a></h2>
<h3 id="两者的特点" tabindex="-1"><a class="header-anchor" href="#两者的特点"><span>两者的特点</span></a></h3>
<ul>
<li><strong>抽象类</strong>：描述类的共同特性和行为，可包含成员变量、构造方法、具体方法和抽象方法；适用于有明显继承关系的场景（如<code v-pre>Animal</code>作为抽象类，子类<code v-pre>Dog</code>、<code v-pre>Cat</code>继承它）。</li>
<li><strong>接口</strong>：定义行为规范，可多实现；Java 8前仅含常量和抽象方法，Java 8后支持默认方法和静态方法，Java 9后支持私有方法；适用于定义类的能力（如<code v-pre>Runnable</code>接口定义“可运行”能力）。</li>
</ul>
<h3 id="两者的区别" tabindex="-1"><a class="header-anchor" href="#两者的区别"><span>两者的区别</span></a></h3>
<table>
<thead>
<tr>
<th>对比维度</th>
<th>抽象类</th>
<th>接口</th>
</tr>
</thead>
<tbody>
<tr>
<td>实现方式</td>
<td>子类用<code v-pre>extends</code>继承，仅能继承一个</td>
<td>类用<code v-pre>implements</code>实现，可实现多个</td>
</tr>
<tr>
<td>方法定义</td>
<td>可包含抽象方法、具体方法、静态方法</td>
<td>Java 8前仅抽象方法；Java 8后含默认方法、静态方法；Java 9后含私有方法</td>
</tr>
<tr>
<td>成员变量</td>
<td>可包含实例变量、静态变量，默认修饰符为<code v-pre>default</code></td>
<td>仅含静态常量（<code v-pre>public static final</code>），必须赋初值且不可修改</td>
</tr>
<tr>
<td>构造方法</td>
<td>有构造方法（子类实例化时调用）</td>
<td>无构造方法（接口不能实例化）</td>
</tr>
<tr>
<td>访问修饰符</td>
<td>成员变量和方法可设多种修饰符（如<code v-pre>private</code>、<code v-pre>protected</code>）</td>
<td>成员变量默认<code v-pre>public static final</code>，方法默认<code v-pre>public</code>（抽象、默认、静态方法）</td>
</tr>
<tr>
<td>继承关系</td>
<td>可继承普通类或抽象类</td>
<td>可继承多个接口（用<code v-pre>extends</code>）</td>
</tr>
</tbody>
</table>
<h2 id="抽象类能加final修饰吗" tabindex="-1"><a class="header-anchor" href="#抽象类能加final修饰吗"><span>抽象类能加final修饰吗？</span></a></h2>
<p>不能。</p>
<p>Java中抽象类的核心作用是<strong>被继承</strong>，而<code v-pre>final</code>修饰符的作用是<strong>禁止类被继承、方法被重写</strong>，两者语义互斥，因此抽象类不能用<code v-pre>final</code>修饰。</p>
<p>若强行用<code v-pre>final</code>修饰抽象类，编译器会直接报错。</p>
<h2 id="接口里面可以定义哪些方法" tabindex="-1"><a class="header-anchor" href="#接口里面可以定义哪些方法"><span>接口里面可以定义哪些方法？</span></a></h2>
<p>接口可定义四种方法（按Java版本演进）：</p>
<ol>
<li><strong>抽象方法</strong>（Java 1.0+）：接口的核心，无方法体，所有实现类必须实现。默认修饰符为<code v-pre>public abstract</code>，可省略。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> interface</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Animal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> makeSound</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 抽象方法，省略public abstract</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li><strong>默认方法</strong>（Java 8+）：带方法体，提供默认实现；实现类可选择重写或直接使用。需用<code v-pre>default</code>关键字修饰。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> interface</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Animal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> makeSound</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    default</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> sleep</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> { </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 默认方法</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Sleeping..."</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li><strong>静态方法</strong>（Java 8+）：属于接口本身，不依赖实现类对象，可通过接口名直接调用。需用<code v-pre>static</code>关键字修饰。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> interface</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Animal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> makeSound</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> staticMethod</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> { </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 静态方法</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Static method in interface"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 调用方式：Animal.staticMethod();</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
<li><strong>私有方法</strong>（Java 9+）：仅接口内部使用，用于辅助默认方法或其他私有方法，避免代码重复。需用<code v-pre>private</code>关键字修饰，无访问权限修饰符（如<code v-pre>public</code>）。<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> interface</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> Animal</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> makeSound</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    default</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> sleep</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Sleeping..."</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">        logSleep</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(); </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 调用私有方法</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> logSleep</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> { </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 私有方法</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Logging sleep"</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ol>
<h2 id="抽象类可以被实例化吗" tabindex="-1"><a class="header-anchor" href="#抽象类可以被实例化吗"><span>抽象类可以被实例化吗？</span></a></h2>
<p>在Java中，抽象类<strong>本身不能被实例化</strong>，即不能用<code v-pre>new</code>关键字直接创建抽象类的对象。</p>
<p>抽象类的核心作用是<strong>被继承</strong>，它通常包含抽象方法（<code v-pre>abstract</code>修饰、无方法体），这些方法需在子类中实现。子类实现所有抽象方法后，才能被实例化；若子类未实现全部抽象方法，子类仍为抽象类，也不能实例化。</p>
<p>抽象类可以有构造器，子类实例化时会调用父类（抽象类）的构造器进行初始化，但这并非“实例化抽象类”——实际创建的是子类对象，抽象类的构造器仅用于初始化父类的成员变量。</p>
<p>示例：</p>
<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 抽象类（不能直接实例化）</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> abstract</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> AbstractClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> AbstractClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 抽象类的构造器，子类实例化时调用</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> abstract</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> abstractMethod</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 抽象方法，需子类实现</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 子类（实现抽象方法，可实例化）</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> ConcreteClass</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> extends</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> AbstractClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ConcreteClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        super</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(); </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 调用抽象类的构造器</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B">Override</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> abstractMethod</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">        // 实现抽象方法</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 正确用法：实例化子类</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">ConcreteClass</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> obj </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> ConcreteClass</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 错误用法：直接实例化抽象类（编译器报错）</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// AbstractClass obj = new AbstractClass();</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="接口可以包含构造函数吗" tabindex="-1"><a class="header-anchor" href="#接口可以包含构造函数吗"><span>接口可以包含构造函数吗？</span></a></h2>
<p>不可以。</p>
<p>接口不能包含构造函数，编译器会提示“Interfaces cannot have constructors”。</p>
<p>原因：构造函数的作用是初始化类的实例，而接口<strong>不能被实例化</strong>（无<code v-pre>new</code>接口对象的语法），因此构造函数无调用场景，接口无需定义构造函数。</p>
<h2 id="解释java中的静态变量和静态方法" tabindex="-1"><a class="header-anchor" href="#解释java中的静态变量和静态方法"><span>解释Java中的静态变量和静态方法</span></a></h2>
<p>静态变量和静态方法与<strong>类本身关联</strong>，而非类的实例，内存中仅存一份，可被所有实例共享。</p>
<h3 id="静态变量-类变量" tabindex="-1"><a class="header-anchor" href="#静态变量-类变量"><span>静态变量（类变量）</span></a></h3>
<p>用<code v-pre>static</code>关键字声明，属于类，而非实例。</p>
<ul>
<li><strong>核心特点</strong>：
<ol>
<li>共享性：所有类实例共享同一静态变量，一个实例修改后，其他实例可见。</li>
<li>初始化：类加载时初始化，仅分配一次内存（早于实例创建）。</li>
<li>访问方式：推荐通过“类名.变量名”访问，也可通过实例访问（不推荐，易混淆）。</li>
</ol>
</li>
<li><strong>示例</strong>：<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> MyClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> staticVar </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 静态变量</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        staticVar++; </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 每创建一个实例，静态变量自增</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> printStaticVar</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Static Var: "</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> staticVar);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 使用</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">MyClass</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> obj1 </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyClass</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B">MyClass</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> obj2 </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> MyClass</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">MyClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">printStaticVar</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 输出Static Var: 2（两个实例共享staticVar）</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ul>
<h3 id="静态方法-类方法" tabindex="-1"><a class="header-anchor" href="#静态方法-类方法"><span>静态方法（类方法）</span></a></h3>
<p>用<code v-pre>static</code>关键字声明，属于类，而非实例。</p>
<ul>
<li><strong>核心特点</strong>：
<ol>
<li>无实例依赖：无需创建类实例即可调用（如<code v-pre>Math.abs()</code>）。</li>
<li>访问限制：仅能直接访问静态变量和静态方法，不能直接访问非静态成员（因非静态成员依赖实例）。</li>
<li>多态性：不支持重写（Override），但可被隐藏（子类定义同名静态方法，隐藏父类方法）。</li>
</ol>
</li>
<li><strong>示例</strong>：<div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34"><pre class="shiki shiki-themes one-light one-dark-pro vp-code" v-pre=""><code class="language-java"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B"> MyClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> int</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75"> count </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66"> 0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">    // 静态方法</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> incrementCount</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">        count++; </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 访问静态变量</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> static</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF"> displayCount</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> {</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">        System</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">out</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">println</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379">"Count: "</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF"> count);</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">// 使用</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">MyClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">incrementCount</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic"> // 直接调用静态方法</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B">MyClass</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF">displayCount</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF">();</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic">   // 输出Count: 1</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li>
</ul>
<h3 id="使用场景" tabindex="-1"><a class="header-anchor" href="#使用场景"><span>使用场景</span></a></h3>
<ul>
<li>静态变量：存储所有实例共享的数据（如计数器、常量）。</li>
<li>静态方法：工具类方法（如<code v-pre>Arrays.sort()</code>）、类级别的数据处理（无需实例状态）。</li>
</ul>
<h2 id="非静态内部类和静态内部类的区别" tabindex="-1"><a class="header-anchor" href="#非静态内部类和静态内部类的区别"><span>非静态内部类和静态内部类的区别？</span></a></h2>
<table>
<thead>
<tr>
<th>对比维度</th>
<th>非静态内部类（成员内部类）</th>
<th>静态内部类（嵌套内部类）</th>
</tr>
</thead>
<tbody>
<tr>
<td>外部类依赖</td>
<td>依赖外部类实例，需先创建外部类对象才能实例化</td>
<td>不依赖外部类实例，可独立实例化</td>
</tr>
<tr>
<td>外部类成员访问</td>
<td>可直接访问外部类的实例变量、静态变量和方法</td>
<td>仅能访问外部类的静态成员，不能访问实例成员</td>
</tr>
<tr>
<td>静态成员定义</td>
<td>不能定义静态变量和静态方法（Java 16前）</td>
<td>可定义静态变量、静态方法和非静态成员</td>
</tr>
<tr>
<td>实例化方式</td>
<td><code v-pre>外部类实例.new 内部类()</code>（如<code v-pre>Outer outer = new Outer(); Outer.Inner inner = outer.new Inner();</code>）</td>
<td><code v-pre>外部类.内部类()</code>（如<code v-pre>Outer.Inner inner = new Outer.Inner();</code>）</td>
</tr>
<tr>
<td>私有成员访问</td>
<td>可直接访问外部类的私有实例成员</td>
<td>不能直接访问外部类的私有实例成员，需通过外部类实例访问</td>
</tr>
</tbody>
</table>
<h2 id="非静态内部类可以直接访问外部方法-编译器是怎么做到的" tabindex="-1"><a class="header-anchor" href="#非静态内部类可以直接访问外部方法-编译器是怎么做到的"><span>非静态内部类可以直接访问外部方法，编译器是怎么做到的？</span></a></h2>
<p>编译器在生成非静态内部类的字节码时，会为其<strong>维护一个指向外部类实例的引用</strong>（默认名为<code v-pre>this$0</code>）。</p>
<p>这个引用的创建逻辑：</p>
<ol>
<li>非静态内部类实例化时，编译器会自动在其构造函数中添加一个外部类实例的参数。</li>
<li>外部类创建内部类实例时，将自身实例作为参数传入内部类构造函数，赋值给<code v-pre>this$0</code>引用。</li>
</ol>
<p>通过<code v-pre>this$0</code>引用，非静态内部类可直接访问外部类的实例变量和方法，实现“直接访问外部方法”的效果。</p>
</div></template>


