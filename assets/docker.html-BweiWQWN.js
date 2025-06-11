import{_ as s,c as a,a as e,o as l}from"./app-BwNUJfUp.js";const p={};function t(i,n){return l(),a("div",null,n[0]||(n[0]=[e(`<h1 id="docker的使用" tabindex="-1"><a class="header-anchor" href="#docker的使用"><span>Docker的使用</span></a></h1><p>Docker 是一种轻量级容器技术，能够将应用及其依赖打包在一起，在任何支持 Docker 的环境中快速运行，极大地简化了部署流程。</p><h2 id="一、docker-基础概念" tabindex="-1"><a class="header-anchor" href="#一、docker-基础概念"><span>一、Docker 基础概念</span></a></h2><ul><li><strong>镜像（Image）</strong>：Docker 镜像是容器的模板，可以理解为一个完整的操作系统快照。</li><li><strong>容器（Container）</strong>：镜像运行起来就是容器，是镜像的一个运行实例。</li><li><strong>仓库（Repository）</strong>：用来存储镜像的地方，分为公共仓库（如 Docker Hub）和私有仓库。</li><li><strong>Dockerfile</strong>：定义如何构建镜像的脚本。</li></ul><h2 id="二、安装-docker-以-centos-为例" tabindex="-1"><a class="header-anchor" href="#二、安装-docker-以-centos-为例"><span>二、安装 Docker（以 CentOS 为例）</span></a></h2><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token comment"># 卸载旧版本（如已存在）</span></span>
<span class="line"><span class="token function">sudo</span> yum remove <span class="token function">docker</span> docker-client docker-common docker-latest</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 安装依赖</span></span>
<span class="line"><span class="token function">sudo</span> yum <span class="token function">install</span> <span class="token parameter variable">-y</span> yum-utils device-mapper-persistent-data lvm2</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 设置 Docker 仓库</span></span>
<span class="line"><span class="token function">sudo</span> yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 安装 Docker</span></span>
<span class="line"><span class="token function">sudo</span> yum <span class="token function">install</span> <span class="token parameter variable">-y</span> docker-ce</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 启动并设置开机启动</span></span>
<span class="line"><span class="token function">sudo</span> systemctl start <span class="token function">docker</span></span>
<span class="line"><span class="token function">sudo</span> systemctl <span class="token builtin class-name">enable</span> <span class="token function">docker</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 验证</span></span>
<span class="line"><span class="token function">docker</span> version</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="三、常用命令" tabindex="-1"><a class="header-anchor" href="#三、常用命令"><span>三、常用命令</span></a></h2><h3 id="_1-镜像操作" tabindex="-1"><a class="header-anchor" href="#_1-镜像操作"><span>1. 镜像操作</span></a></h3><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">docker</span> images                    <span class="token comment"># 查看本地镜像</span></span>
<span class="line"><span class="token function">docker</span> pull nginx                <span class="token comment"># 拉取镜像</span></span>
<span class="line"><span class="token function">docker</span> rmi nginx                 <span class="token comment"># 删除镜像</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-容器操作" tabindex="-1"><a class="header-anchor" href="#_2-容器操作"><span>2. 容器操作</span></a></h3><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">docker</span> <span class="token function">ps</span> <span class="token parameter variable">-a</span>                    <span class="token comment"># 查看所有容器</span></span>
<span class="line"><span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token parameter variable">-p</span> <span class="token number">8080</span>:80 nginx  <span class="token comment"># 后台运行 nginx 容器并映射端口</span></span>
<span class="line"><span class="token function">docker</span> stop <span class="token operator">&lt;</span>容器ID或名称<span class="token operator">&gt;</span>      <span class="token comment"># 停止容器</span></span>
<span class="line"><span class="token function">docker</span> <span class="token function">rm</span> <span class="token operator">&lt;</span>容器ID或名称<span class="token operator">&gt;</span>        <span class="token comment"># 删除容器</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-构建自定义镜像" tabindex="-1"><a class="header-anchor" href="#_3-构建自定义镜像"><span>3. 构建自定义镜像</span></a></h3><p>新建一个 <code>Dockerfile</code>：</p><div class="language-docker line-numbers-mode" data-highlighter="prismjs" data-ext="docker" data-title="docker"><pre><code><span class="line"><span class="token instruction"><span class="token keyword">FROM</span> openjdk:8</span></span>
<span class="line"><span class="token instruction"><span class="token keyword">COPY</span> app.jar /app.jar</span></span>
<span class="line"><span class="token instruction"><span class="token keyword">ENTRYPOINT</span> [<span class="token string">&quot;java&quot;</span>, <span class="token string">&quot;-jar&quot;</span>, <span class="token string">&quot;/app.jar&quot;</span>]</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>构建并运行：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">docker</span> build <span class="token parameter variable">-t</span> myapp <span class="token builtin class-name">.</span></span>
<span class="line"><span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token parameter variable">-p</span> <span class="token number">8080</span>:8080 myapp</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="四、常用技巧" tabindex="-1"><a class="header-anchor" href="#四、常用技巧"><span>四、常用技巧</span></a></h2><h3 id="_1-进入容器内部" tabindex="-1"><a class="header-anchor" href="#_1-进入容器内部"><span>1. 进入容器内部</span></a></h3><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">docker</span> <span class="token builtin class-name">exec</span> <span class="token parameter variable">-it</span> <span class="token operator">&lt;</span>容器ID或名称<span class="token operator">&gt;</span> /bin/bash</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h3 id="_2-查看日志" tabindex="-1"><a class="header-anchor" href="#_2-查看日志"><span>2. 查看日志</span></a></h3><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">docker</span> logs <span class="token operator">&lt;</span>容器ID或名称<span class="token operator">&gt;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h3 id="_3-清理无用资源" tabindex="-1"><a class="header-anchor" href="#_3-清理无用资源"><span>3. 清理无用资源</span></a></h3><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">docker</span> system prune <span class="token parameter variable">-a</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="五、docker-compose-简介" tabindex="-1"><a class="header-anchor" href="#五、docker-compose-简介"><span>五、Docker Compose 简介</span></a></h2><p>Docker Compose 用于<strong>一次性启动多个容器服务</strong>，常用于微服务部署。</p><p>示例 <code>docker-compose.yml</code>：</p><div class="language-yaml line-numbers-mode" data-highlighter="prismjs" data-ext="yml" data-title="yml"><pre><code><span class="line"><span class="token key atrule">version</span><span class="token punctuation">:</span> <span class="token string">&#39;3.8&#39;</span></span>
<span class="line"></span>
<span class="line"><span class="token key atrule">services</span><span class="token punctuation">:</span></span>
<span class="line"></span>
<span class="line">  <span class="token key atrule">zookeeper</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> zookeeper<span class="token punctuation">:</span>3.4.14</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> zookeeper</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;2181:2181&quot;</span></span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token key atrule">ZOO_MY_ID</span><span class="token punctuation">:</span> <span class="token number">1</span></span>
<span class="line">      <span class="token key atrule">ZOO_SERVERS</span><span class="token punctuation">:</span> server.1=zookeeper<span class="token punctuation">:</span>2888<span class="token punctuation">:</span><span class="token number">3888</span></span>
<span class="line">    <span class="token key atrule">volumes</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> /park_voyant/data<span class="token punctuation">:</span>/data</span>
<span class="line">      <span class="token punctuation">-</span> /park_voyant/datalog<span class="token punctuation">:</span>/datalog</span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> gupt</span>
<span class="line"></span>
<span class="line">  <span class="token key atrule">elasticsearch</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.elastic.co/elasticsearch/elasticsearch<span class="token punctuation">:</span>8.12.2</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> elasticsearch</span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> discovery.type=single<span class="token punctuation">-</span>node</span>
<span class="line">      <span class="token punctuation">-</span> ES_JAVA_OPTS=<span class="token punctuation">-</span>Xms512m <span class="token punctuation">-</span>Xmx512m</span>
<span class="line">      <span class="token punctuation">-</span> xpack.security.enabled=false</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;9200:9200&quot;</span></span>
<span class="line">    <span class="token key atrule">volumes</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/elasticsearch/esdata<span class="token punctuation">:</span>/usr/share/elasticsearch/data</span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/elasticsearch/config/elasticsearch.yml<span class="token punctuation">:</span>/usr/share/elasticsearch/config/elasticsearch.yml</span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/elasticsearch/logs<span class="token punctuation">:</span>/usr/share/elasticsearch/logs</span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/elasticsearch/certs<span class="token punctuation">:</span>/usr/share/elasticsearch/config/certs</span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> gupt</span>
<span class="line">    <span class="token key atrule">healthcheck</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token key atrule">test</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;CMD-SHELL&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;curl --silent --fail localhost:9200/_cluster/health || exit 1&quot;</span><span class="token punctuation">]</span></span>
<span class="line">      <span class="token key atrule">interval</span><span class="token punctuation">:</span> 30s</span>
<span class="line">      <span class="token key atrule">timeout</span><span class="token punctuation">:</span> 10s</span>
<span class="line">      <span class="token key atrule">retries</span><span class="token punctuation">:</span> <span class="token number">3</span></span>
<span class="line"></span>
<span class="line">  <span class="token key atrule">kibana</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.elastic.co/kibana/kibana<span class="token punctuation">:</span>8.12.2</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> kibana</span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> ELASTICSEARCH_HOSTS=http<span class="token punctuation">:</span>//elasticsearch<span class="token punctuation">:</span><span class="token number">9200</span></span>
<span class="line">      <span class="token punctuation">-</span> I18N_LOCALE=zh<span class="token punctuation">-</span>CN</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;5601:5601&quot;</span></span>
<span class="line">    <span class="token key atrule">volumes</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/kibana/config/kibana.yml<span class="token punctuation">:</span>/usr/share/kibana/config/kibana.yml</span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> gupt</span>
<span class="line">    <span class="token key atrule">depends_on</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token key atrule">elasticsearch</span><span class="token punctuation">:</span></span>
<span class="line">        <span class="token key atrule">condition</span><span class="token punctuation">:</span> service_healthy</span>
<span class="line"></span>
<span class="line">  <span class="token key atrule">logstash</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.elastic.co/logstash/logstash<span class="token punctuation">:</span>8.12.2</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> logstash</span>
<span class="line">    <span class="token key atrule">volumes</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/logstash/logstash.conf<span class="token punctuation">:</span>/usr/share/logstash/pipeline/logstash.conf</span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/logstash/mysql<span class="token punctuation">-</span>connector<span class="token punctuation">-</span>j<span class="token punctuation">-</span>9.2.0/mysql<span class="token punctuation">-</span>connector<span class="token punctuation">-</span>j<span class="token punctuation">-</span>9.2.0.jar<span class="token punctuation">:</span>/usr/share/logstash/mysql<span class="token punctuation">-</span>connector<span class="token punctuation">-</span>java.jar</span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/logstash/logs/<span class="token punctuation">:</span>/usr/share/logstash/logs/</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;5044:5044&quot;</span></span>
<span class="line">    <span class="token key atrule">depends_on</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> elasticsearch</span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> LS_JAVA_OPTS=<span class="token punctuation">-</span>Xmx512m <span class="token punctuation">-</span>Xms512m</span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> gupt</span>
<span class="line"></span>
<span class="line">  <span class="token key atrule">redis</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis<span class="token punctuation">:</span>latest</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> universitymanagementsystem<span class="token punctuation">-</span>redis</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;6379:6379&quot;</span></span>
<span class="line">    <span class="token key atrule">volumes</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/redis/data<span class="token punctuation">:</span>/data</span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/redis/redis.conf<span class="token punctuation">:</span>/usr/local/etc/redis/redis.conf</span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> gupt</span>
<span class="line"></span>
<span class="line">  <span class="token key atrule">torna</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> registry.cn<span class="token punctuation">-</span>hangzhou.aliyuncs.com/tanghc/torna<span class="token punctuation">:</span>1.26.0</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> torna</span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token key atrule">JAVA_OPTS</span><span class="token punctuation">:</span> <span class="token string">&quot;-Xms512m -Xmx512m&quot;</span></span>
<span class="line">    <span class="token key atrule">volumes</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/torna<span class="token punctuation">-</span>1.26.0/application.properties<span class="token punctuation">:</span>/torna/config/application.properties</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;7700:7700&quot;</span></span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> gupt</span>
<span class="line"></span>
<span class="line">  <span class="token key atrule">mysql</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> mysql<span class="token punctuation">:</span>latest</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> universitymanagementsystem<span class="token punctuation">-</span>mysql</span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token key atrule">MYSQL_ROOT_PASSWORD</span><span class="token punctuation">:</span> <span class="token number">123</span></span>
<span class="line">      <span class="token key atrule">MYSQL_DATABASE</span><span class="token punctuation">:</span> university_db</span>
<span class="line">      <span class="token key atrule">MYSQL_USER</span><span class="token punctuation">:</span> root</span>
<span class="line">      <span class="token key atrule">MYSQL_PASSWORD</span><span class="token punctuation">:</span> <span class="token number">123</span></span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;3306:3306&quot;</span></span>
<span class="line">    <span class="token key atrule">volumes</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/mysql/conf<span class="token punctuation">:</span>/etc/mysql/conf.d<span class="token punctuation">:</span>rw</span>
<span class="line">      <span class="token punctuation">-</span> /UniversityManagementSystem/mysql/data<span class="token punctuation">:</span>/var/lib/mysql<span class="token punctuation">:</span>rw</span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> gupt</span>
<span class="line"></span>
<span class="line">  <span class="token key atrule">nacos</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> nacos/nacos<span class="token punctuation">-</span>server<span class="token punctuation">:</span>1.2.0</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> nacos</span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> MODE=standalone</span>
<span class="line">    <span class="token key atrule">restart</span><span class="token punctuation">:</span> always</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;8848:8848&quot;</span></span>
<span class="line">    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;sh&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;-c&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;/home/nacos/bin/startup.sh -m standalone&quot;</span><span class="token punctuation">]</span></span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> gupt</span>
<span class="line"></span>
<span class="line">  <span class="token key atrule">minio</span><span class="token punctuation">:</span></span>
<span class="line">    <span class="token key atrule">image</span><span class="token punctuation">:</span> minio/minio</span>
<span class="line">    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> minio</span>
<span class="line">    <span class="token key atrule">ports</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> <span class="token string">&quot;9000:9000&quot;</span></span>
<span class="line">    <span class="token key atrule">environment</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token key atrule">MINIO_ACCESS_KEY</span><span class="token punctuation">:</span> minio</span>
<span class="line">      <span class="token key atrule">MINIO_SECRET_KEY</span><span class="token punctuation">:</span> minio123</span>
<span class="line">    <span class="token key atrule">volumes</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> /home/data<span class="token punctuation">:</span>/data</span>
<span class="line">      <span class="token punctuation">-</span> /home/config<span class="token punctuation">:</span>/root/.minio</span>
<span class="line">    <span class="token key atrule">command</span><span class="token punctuation">:</span> server /data</span>
<span class="line">    <span class="token key atrule">restart</span><span class="token punctuation">:</span> always</span>
<span class="line">    <span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">      <span class="token punctuation">-</span> gupt</span>
<span class="line"></span>
<span class="line"><span class="token key atrule">networks</span><span class="token punctuation">:</span></span>
<span class="line">  <span class="token key atrule">gupt</span><span class="token punctuation">:</span></span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行：</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">docker-compose</span> up <span class="token parameter variable">-d</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div>`,29)]))}const o=s(p,[["render",t]]),u=JSON.parse('{"path":"/blogs/kaifagongju/docker.html","title":"Docker的使用","lang":"en-US","frontmatter":{"title":"Docker的使用","date":"2025-06-09T00:00:00.000Z","categories":["开发工具"],"tags":["Docker","开发工具"]},"headers":[{"level":2,"title":"一、Docker 基础概念","slug":"一、docker-基础概念","link":"#一、docker-基础概念","children":[]},{"level":2,"title":"二、安装 Docker（以 CentOS 为例）","slug":"二、安装-docker-以-centos-为例","link":"#二、安装-docker-以-centos-为例","children":[]},{"level":2,"title":"三、常用命令","slug":"三、常用命令","link":"#三、常用命令","children":[{"level":3,"title":"1. 镜像操作","slug":"_1-镜像操作","link":"#_1-镜像操作","children":[]},{"level":3,"title":"2. 容器操作","slug":"_2-容器操作","link":"#_2-容器操作","children":[]},{"level":3,"title":"3. 构建自定义镜像","slug":"_3-构建自定义镜像","link":"#_3-构建自定义镜像","children":[]}]},{"level":2,"title":"四、常用技巧","slug":"四、常用技巧","link":"#四、常用技巧","children":[{"level":3,"title":"1. 进入容器内部","slug":"_1-进入容器内部","link":"#_1-进入容器内部","children":[]},{"level":3,"title":"2. 查看日志","slug":"_2-查看日志","link":"#_2-查看日志","children":[]},{"level":3,"title":"3. 清理无用资源","slug":"_3-清理无用资源","link":"#_3-清理无用资源","children":[]}]},{"level":2,"title":"五、Docker Compose 简介","slug":"五、docker-compose-简介","link":"#五、docker-compose-简介","children":[]}],"git":{},"filePathRelative":"blogs/开发工具/docker.md"}');export{o as comp,u as data};
