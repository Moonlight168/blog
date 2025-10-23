<template><div><h1 id="淘票票项目详细业务讲解" tabindex="-1"><a class="header-anchor" href="#淘票票项目详细业务讲解"><span>淘票票项目详细业务讲解</span></a></h1>
<h2 id="_1-参数加解密配置" tabindex="-1"><a class="header-anchor" href="#_1-参数加解密配置"><span>1. 参数加解密配置</span></a></h2>
<p>淘票票项目采用了完善的参数加密和解密机制，确保数据在传输过程中的安全性。</p>
<h3 id="_1-1-加密配置" tabindex="-1"><a class="header-anchor" href="#_1-1-加密配置"><span>1.1 加密配置</span></a></h3>
<p>系统使用了多种加密算法：</p>
<ul>
<li>RSA签名公钥和私钥用于签名验证</li>
<li>AES密钥用于数据加密</li>
<li>RSA参数公钥和私钥用于参数加密</li>
</ul>
<p>这些密钥信息存储在ChannelDataAddDto类中，包含以下关键字段：</p>
<ul>
<li>signPublicKey: RSA签名公钥</li>
<li>signSecretKey: RSA签名私钥</li>
<li>aesKey: AES私钥</li>
<li>dataPublicKey: RSA参数公钥</li>
<li>dataSecretKey: RSA参数私钥</li>
<li>tokenSecret: Token秘钥</li>
</ul>
<h3 id="_1-2-加密工具类" tabindex="-1"><a class="header-anchor" href="#_1-2-加密工具类"><span>1.2 加密工具类</span></a></h3>
<p>项目提供了多种加密工具类：</p>
<ul>
<li>RsaTool: 提供RSA加密和解密功能</li>
<li>Aes: 提供AES加密和解密功能</li>
<li>RsaSignTool: 提供RSA签名和验签功能</li>
</ul>
<p>这些工具类封装了标准的加密算法，为系统提供统一的加解密接口。</p>
<h2 id="_2-参数加解密过程" tabindex="-1"><a class="header-anchor" href="#_2-参数加解密过程"><span>2. 参数加解密过程</span></a></h2>
<h3 id="_2-1-参数加密流程" tabindex="-1"><a class="header-anchor" href="#_2-1-参数加密流程"><span>2.1 参数加密流程</span></a></h3>
<ol>
<li>客户端使用RSA公钥对业务参数进行加密</li>
<li>将加密后的参数与基础参数拼接</li>
<li>使用RSA私钥对拼接后的参数生成签名</li>
<li>将签名附加到请求参数中</li>
</ol>
<h3 id="_2-2-参数解密流程" tabindex="-1"><a class="header-anchor" href="#_2-2-参数解密流程"><span>2.2 参数解密流程</span></a></h3>
<ol>
<li>服务端接收到请求后，首先验证签名</li>
<li>使用RSA私钥对加密的业务参数进行解密</li>
<li>处理解密后的业务逻辑</li>
</ol>
<h3 id="_2-3-aes加密应用" tabindex="-1"><a class="header-anchor" href="#_2-3-aes加密应用"><span>2.3 AES加密应用</span></a></h3>
<p>在验证码等场景中使用了AES加密：</p>
<ul>
<li>使用AES算法对验证码相关数据进行加密</li>
<li>通过AesUtil工具类实现加密和解密功能</li>
</ul>
<h2 id="_3-gateway处理请求的流程" tabindex="-1"><a class="header-anchor" href="#_3-gateway处理请求的流程"><span>3. Gateway处理请求的流程</span></a></h2>
<p>网关作为系统的统一入口，负责请求的验证、路由和安全控制。</p>
<h3 id="_3-1-请求验证过滤器" tabindex="-1"><a class="header-anchor" href="#_3-1-请求验证过滤器"><span>3.1 请求验证过滤器</span></a></h3>
<p>RequestValidationFilter是核心的请求验证过滤器，主要功能包括：</p>
<ul>
<li>参数验证</li>
<li>签名验证</li>
<li>Token验证</li>
<li>请求限流</li>
</ul>
<h3 id="_3-2-请求处理流程" tabindex="-1"><a class="header-anchor" href="#_3-2-请求处理流程"><span>3.2 请求处理流程</span></a></h3>
<ol>
<li>接收客户端请求</li>
<li>解析请求参数和头部信息</li>
<li>验证签名和Token</li>
<li>检查是否需要进行限流</li>
<li>路由到具体的服务</li>
<li>处理服务响应并返回给客户端</li>
</ol>
<h3 id="_3-3-上下文处理" tabindex="-1"><a class="header-anchor" href="#_3-3-上下文处理"><span>3.3 上下文处理</span></a></h3>
<p>GatewayContextHolder用于维护请求上下文：</p>
<ul>
<li>存储请求相关信息</li>
<li>提供线程安全的上下文访问</li>
<li>支持在不同组件间传递请求信息</li>
</ul>
<h2 id="_4-用户注册功能详解" tabindex="-1"><a class="header-anchor" href="#_4-用户注册功能详解"><span>4. 用户注册功能详解</span></a></h2>
<h3 id="_4-1-应对缓存穿透" tabindex="-1"><a class="header-anchor" href="#_4-1-应对缓存穿透"><span>4.1 应对缓存穿透</span></a></h3>
<p>系统通过以下方式巧妙应对缓存穿透：</p>
<ul>
<li>对查询结果为空的数据也进行缓存，但设置较短的过期时间</li>
<li>使用布隆过滤器预先判断数据是否存在</li>
<li>对查询参数进行合法性校验</li>
</ul>
<h3 id="_4-2-组合模式处理复杂验证" tabindex="-1"><a class="header-anchor" href="#_4-2-组合模式处理复杂验证"><span>4.2 组合模式处理复杂验证</span></a></h3>
<p>用户注册使用组合模式处理复杂的验证功能：</p>
<ul>
<li>通过CompositeContainer执行多种校验逻辑</li>
<li>支持灵活添加和移除校验规则</li>
<li>将复杂的验证逻辑拆分为独立的处理单元</li>
</ul>
<h3 id="_4-3-图形验证码使用" tabindex="-1"><a class="header-anchor" href="#_4-3-图形验证码使用"><span>4.3 图形验证码使用</span></a></h3>
<p>系统集成了AJ-Captcha验证码框架：</p>
<ul>
<li>提供滑动验证码和点选验证码</li>
<li>支持验证码的生成、验证和管理</li>
<li>通过Redis存储验证码相关信息</li>
</ul>
<h2 id="_5-用户登录和退出流程" tabindex="-1"><a class="header-anchor" href="#_5-用户登录和退出流程"><span>5. 用户登录和退出流程</span></a></h2>
<h3 id="_5-1-登录流程" tabindex="-1"><a class="header-anchor" href="#_5-1-登录流程"><span>5.1 登录流程</span></a></h3>
<ol>
<li>验证用户邮箱或手机号</li>
<li>校验密码</li>
<li>生成Token并存储到Redis</li>
<li>返回用户信息和Token</li>
</ol>
<h3 id="_5-2-退出流程" tabindex="-1"><a class="header-anchor" href="#_5-2-退出流程"><span>5.2 退出流程</span></a></h3>
<ol>
<li>验证Token有效性</li>
<li>从Redis中删除Token</li>
<li>更新用户登录状态</li>
<li>返回退出成功信息</li>
</ol>
<h2 id="_6-购票人功能" tabindex="-1"><a class="header-anchor" href="#_6-购票人功能"><span>6. 购票人功能</span></a></h2>
<p>购票人功能用于管理用户的观演人信息：</p>
<ul>
<li>支持添加、删除、查询购票人信息</li>
<li>对身份证等敏感信息进行加密存储</li>
<li>支持多种证件类型的验证</li>
</ul>
<h2 id="_7-用户信息处理" tabindex="-1"><a class="header-anchor" href="#_7-用户信息处理"><span>7. 用户信息处理</span></a></h2>
<h3 id="_7-1-信息脱敏展示" tabindex="-1"><a class="header-anchor" href="#_7-1-信息脱敏展示"><span>7.1 信息脱敏展示</span></a></h3>
<p>对用户的敏感信息进行脱敏处理：</p>
<ul>
<li>手机号中间四位用*替代</li>
<li>身份证号部分位数用*替代</li>
<li>邮箱地址部分字符用*替代</li>
</ul>
<h3 id="_7-2-信息加密存储" tabindex="-1"><a class="header-anchor" href="#_7-2-信息加密存储"><span>7.2 信息加密存储</span></a></h3>
<p>使用国密SM4算法对敏感信息进行加密存储：</p>
<ul>
<li>用户手机号</li>
<li>用户密码</li>
<li>用户身份证号</li>
</ul>
<h2 id="_8-节目展示功能" tabindex="-1"><a class="header-anchor" href="#_8-节目展示功能"><span>8. 节目展示功能</span></a></h2>
<h3 id="_8-1-主页节目列表显示" tabindex="-1"><a class="header-anchor" href="#_8-1-主页节目列表显示"><span>8.1 主页节目列表显示</span></a></h3>
<p>通过以下优化实现高效的节目列表显示：</p>
<ul>
<li>使用Redis缓存热门节目信息</li>
<li>支持分页查询</li>
<li>对节目信息进行预加载</li>
</ul>
<h3 id="_8-2-分库分表情况下的分页显示" tabindex="-1"><a class="header-anchor" href="#_8-2-分库分表情况下的分页显示"><span>8.2 分库分表情况下的分页显示</span></a></h3>
<p>在分库分表环境下实现节目列表分页：</p>
<ul>
<li>使用ShardingSphere处理分库分表逻辑</li>
<li>通过时间范围和分页参数查询节目信息</li>
<li>对查询结果进行合并和排序</li>
</ul>
<h3 id="_8-3-节目搜索功能" tabindex="-1"><a class="header-anchor" href="#_8-3-节目搜索功能"><span>8.3 节目搜索功能</span></a></h3>
<p>支持多种搜索方式：</p>
<ul>
<li>关键词搜索</li>
<li>分类筛选</li>
<li>时间范围筛选</li>
<li>地点筛选</li>
</ul>
<p>使用Elasticsearch实现高性能搜索。</p>
<h3 id="_8-4-节目详情展示" tabindex="-1"><a class="header-anchor" href="#_8-4-节目详情展示"><span>8.4 节目详情展示</span></a></h3>
<p>节目详情页展示完整信息：</p>
<ul>
<li>节目基本信息</li>
<li>演出时间和地点</li>
<li>票档和价格信息</li>
<li>购票须知和观演须知</li>
</ul>
<h2 id="_9-座位选择流程" tabindex="-1"><a class="header-anchor" href="#_9-座位选择流程"><span>9. 座位选择流程</span></a></h2>
<h3 id="_9-1-座位数据管理" tabindex="-1"><a class="header-anchor" href="#_9-1-座位数据管理"><span>9.1 座位数据管理</span></a></h3>
<ul>
<li>座位信息存储在t_seat表中</li>
<li>使用缓存存储座位状态信息</li>
<li>支持座位的锁定和释放</li>
</ul>
<h3 id="_9-2-座位选择流程" tabindex="-1"><a class="header-anchor" href="#_9-2-座位选择流程"><span>9.2 座位选择流程</span></a></h3>
<ol>
<li>查询节目座位信息</li>
<li>展示座位图</li>
<li>用户选择座位</li>
<li>锁定选中座位</li>
<li>生成订单</li>
</ol>
<h2 id="_10-购票验证流程" tabindex="-1"><a class="header-anchor" href="#_10-购票验证流程"><span>10. 购票验证流程</span></a></h2>
<p>系统统一管理复杂的购票验证流程：</p>
<ul>
<li>用户身份验证</li>
<li>节目信息验证</li>
<li>座位有效性验证</li>
<li>价格计算验证</li>
<li>库存数量验证</li>
</ul>
<h2 id="_11-高并发购票处理" tabindex="-1"><a class="header-anchor" href="#_11-高并发购票处理"><span>11. 高并发购票处理</span></a></h2>
<h3 id="_11-1-应对高并发策略" tabindex="-1"><a class="header-anchor" href="#_11-1-应对高并发策略"><span>11.1 应对高并发策略</span></a></h3>
<ul>
<li>使用分布式锁保证数据一致性</li>
<li>采用本地锁减少网络开销</li>
<li>使用Redis缓存热点数据</li>
<li>数据库层面进行分库分表</li>
</ul>
<h3 id="_11-2-锁优化" tabindex="-1"><a class="header-anchor" href="#_11-2-锁优化"><span>11.2 锁优化</span></a></h3>
<p>对分布式锁进行优化：</p>
<ul>
<li>减小锁的粒度，按节目和票档分类加锁</li>
<li>优化网络请求性能</li>
<li>使用本地锁处理部分场景</li>
</ul>
<h3 id="_11-3-无锁化处理" tabindex="-1"><a class="header-anchor" href="#_11-3-无锁化处理"><span>11.3 无锁化处理</span></a></h3>
<p>终极杀招-无锁化处理：</p>
<ul>
<li>使用Redis原子操作处理库存扣减</li>
<li>采用消息队列异步处理订单</li>
<li>利用数据库唯一索引保证数据一致性</li>
</ul>
<h2 id="_12-订单处理" tabindex="-1"><a class="header-anchor" href="#_12-订单处理"><span>12. 订单处理</span></a></h2>
<h3 id="_12-1-订单生成与回滚" tabindex="-1"><a class="header-anchor" href="#_12-1-订单生成与回滚"><span>12.1 订单生成与回滚</span></a></h3>
<p>订单生成失败后的快速回滚机制：</p>
<ul>
<li>使用事务保证数据一致性</li>
<li>异常情况下自动回滚已占用资源</li>
<li>通过补偿机制处理异常情况</li>
</ul>
<h3 id="_12-2-数据初始化管理" tabindex="-1"><a class="header-anchor" href="#_12-2-数据初始化管理"><span>12.2 数据初始化管理</span></a></h3>
<p>节目服务的数据初始化统一管理：</p>
<ul>
<li>节目信息初始化</li>
<li>座位信息初始化</li>
<li>票档信息初始化</li>
</ul>
<h3 id="_12-3-数据一致性保障" tabindex="-1"><a class="header-anchor" href="#_12-3-数据一致性保障"><span>12.3 数据一致性保障</span></a></h3>
<p>保障节目数据在缓存与数据库间的一致性：</p>
<ul>
<li>使用双写一致策略</li>
<li>通过延迟双删处理异常情况</li>
<li>定期进行数据一致性校验</li>
</ul>
<h2 id="_13-订单取消与关闭" tabindex="-1"><a class="header-anchor" href="#_13-订单取消与关闭"><span>13. 订单取消与关闭</span></a></h2>
<h3 id="_13-1-订单取消处理" tabindex="-1"><a class="header-anchor" href="#_13-1-订单取消处理"><span>13.1 订单取消处理</span></a></h3>
<ul>
<li>验证订单状态</li>
<li>释放占用资源</li>
<li>更新订单状态</li>
<li>处理退款流程</li>
</ul>
<h3 id="_13-2-延迟订单关闭" tabindex="-1"><a class="header-anchor" href="#_13-2-延迟订单关闭"><span>13.2 延迟订单关闭</span></a></h3>
<p>使用Redis实现延迟队列处理订单关闭：</p>
<ul>
<li>设置订单超时时间</li>
<li>自动关闭未支付订单</li>
<li>释放占用的座位资源</li>
</ul>
<h2 id="_14-支付流程" tabindex="-1"><a class="header-anchor" href="#_14-支付流程"><span>14. 支付流程</span></a></h2>
<h3 id="_14-1-订单支付流程" tabindex="-1"><a class="header-anchor" href="#_14-1-订单支付流程"><span>14.1 订单支付流程</span></a></h3>
<ol>
<li>选择支付方式</li>
<li>生成支付订单</li>
<li>跳转到支付页面</li>
<li>用户完成支付</li>
<li>接收支付回调</li>
</ol>
<h3 id="_14-2-支付回调处理" tabindex="-1"><a class="header-anchor" href="#_14-2-支付回调处理"><span>14.2 支付回调处理</span></a></h3>
<ol>
<li>验证回调信息</li>
<li>更新订单状态</li>
<li>处理库存信息</li>
<li>发送通知消息</li>
</ol>
<h3 id="_14-3-订单查询" tabindex="-1"><a class="header-anchor" href="#_14-3-订单查询"><span>14.3 订单查询</span></a></h3>
<p>支持查询订单详情和订单列表：</p>
<ul>
<li>按订单号查询详情</li>
<li>支持分页查询订单列表</li>
<li>提供订单状态筛选</li>
</ul>
<h2 id="_15-支付渠道策略" tabindex="-1"><a class="header-anchor" href="#_15-支付渠道策略"><span>15. 支付渠道策略</span></a></h2>
<h3 id="_15-1-支付渠道初始化" tabindex="-1"><a class="header-anchor" href="#_15-1-支付渠道初始化"><span>15.1 支付渠道初始化</span></a></h3>
<p>系统支持多种支付渠道：</p>
<ul>
<li>支付宝支付</li>
<li>微信支付</li>
<li>银联支付</li>
</ul>
<h3 id="_15-2-对账功能" tabindex="-1"><a class="header-anchor" href="#_15-2-对账功能"><span>15.2 对账功能</span></a></h3>
<p>支付服务中的对账功能确保交易准确性：</p>
<ul>
<li>定期与第三方支付平台对账</li>
<li>发现差异及时处理</li>
<li>生成对账报告</li>
</ul>
<h2 id="_16-api防刷策略" tabindex="-1"><a class="header-anchor" href="#_16-api防刷策略"><span>16. API防刷策略</span></a></h2>
<h3 id="_16-1-定制化防刷" tabindex="-1"><a class="header-anchor" href="#_16-1-定制化防刷"><span>16.1 定制化防刷</span></a></h3>
<ul>
<li>接口访问频率限制</li>
<li>用户行为分析</li>
<li>异常请求识别</li>
</ul>
<h3 id="_16-2-防刷策略实现" tabindex="-1"><a class="header-anchor" href="#_16-2-防刷策略实现"><span>16.2 防刷策略实现</span></a></h3>
<ul>
<li>使用令牌桶算法进行限流</li>
<li>基于用户和IP的访问控制</li>
<li>动态调整限流策略</li>
</ul>
<h3 id="_16-3-防刷数据存储策略" tabindex="-1"><a class="header-anchor" href="#_16-3-防刷数据存储策略"><span>16.3 防刷数据存储策略</span></a></h3>
<ul>
<li>使用Redis存储访问记录</li>
<li>定期清理过期数据</li>
<li>支持分布式部署</li>
</ul>
<h2 id="_17-分库分表设计" tabindex="-1"><a class="header-anchor" href="#_17-分库分表设计"><span>17. 分库分表设计</span></a></h2>
<h3 id="_17-1-用户相关表" tabindex="-1"><a class="header-anchor" href="#_17-1-用户相关表"><span>17.1 用户相关表</span></a></h3>
<ul>
<li>用户表(t_user)</li>
<li>用户邮箱表(t_user_email)</li>
<li>购票人表(t_ticket_user)</li>
</ul>
<h3 id="_17-2-节目相关表" tabindex="-1"><a class="header-anchor" href="#_17-2-节目相关表"><span>17.2 节目相关表</span></a></h3>
<ul>
<li>节目表(t_program)</li>
<li>节目座位表(t_seat)</li>
<li>节目时间表(t_program_show_time)</li>
<li>票档表(t_ticket_category)</li>
</ul>
<h3 id="_17-3-订单相关表" tabindex="-1"><a class="header-anchor" href="#_17-3-订单相关表"><span>17.3 订单相关表</span></a></h3>
<ul>
<li>订单表(t_order)</li>
<li>购票人订单表(t_order_ticket_user)</li>
<li>支付账单表(t_pay_bill)</li>
</ul>
<p>通过ShardingSphere实现分库分表，支持水平扩展和高并发访问。</p>
</div></template>


