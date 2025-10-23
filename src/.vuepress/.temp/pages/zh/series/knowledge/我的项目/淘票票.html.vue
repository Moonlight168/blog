<template><div><h3 id="说一说你在这个项目中是如何进行分库分表的-为什么要这样做" tabindex="-1"><a class="header-anchor" href="#说一说你在这个项目中是如何进行分库分表的-为什么要这样做"><span>说一说你在这个项目中是如何进行分库分表的，为什么要这样做？</span></a></h3>
<p><strong>回答：</strong><br>
在这个项目中，我使用 <strong>ShardingSphere</strong> 来实现分库分表。用户表、手机号表、邮箱表等核心数据表都做了分库分表处理，例如：</p>
<ul>
<li>
<p><strong>用户表 <code v-pre>t_user</code></strong></p>
<ul>
<li>分库键：<code v-pre>id</code>，分表键：<code v-pre>id</code></li>
<li>分片算法：MOD 取模</li>
<li>实际表：<code v-pre>ds_0.t_user_0</code>、<code v-pre>ds_1.t_user_1</code></li>
<li>根据用户 ID 自动路由到对应数据库和表</li>
</ul>
</li>
<li>
<p><strong>手机号表 <code v-pre>t_user_mobile</code> / 邮箱表 <code v-pre>t_user_email</code></strong></p>
<ul>
<li>分库键 / 分表键：<code v-pre>mobile</code> / <code v-pre>email</code></li>
<li>分片算法：HASH_MOD</li>
<li>自动计算落到具体的数据库和表，保证唯一性和高并发查询性能</li>
</ul>
</li>
</ul>
<p><strong>为什么要这样做：</strong></p>
<ol>
<li><strong>提升性能</strong>：单表数据量大时，查询和写入会成为瓶颈，分库分表可以分散压力。</li>
<li><strong>支持高并发</strong>：多个库和表可以并行处理请求，减少数据库负载。</li>
<li><strong>可扩展性强</strong>：随着业务增长，可增加数据库节点或表数量，轻松扩容。</li>
<li><strong>运维效率高</strong>：单库备份和恢复更快，避免单点性能问题。</li>
</ol>
<p>在业务代码里依然使用逻辑表（如 <code v-pre>t_user</code>）进行操作，ShardingSphere 会自动处理路由和加密字段，业务代码无需关心具体的物理表，实现透明分库分表。</p>
</div></template>


