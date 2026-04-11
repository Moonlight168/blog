---
title: 前端相关
icon: /assets/icon/前端.png
date: 2025-10-24
updated: 2025-10-26
categories: ["前端开发"]
---
## 如何提升前端性能？

可以从以下几个方面优化前端性能：

1. **减少 HTTP 请求**：合并 CSS/JS 文件，使用雪碧图、图片压缩
2. **启用资源压缩与缓存**：开启 Gzip，设置合理的浏览器缓存策略
3. **异步加载资源**：对非关键资源使用懒加载和异步加载方式

## JS 和 TS 的区别？

JavaScript 是动态类型语言，写起来灵活但容易出错，变量类型写错了编译阶段发现不了。TypeScript 是 JavaScript 的超集，加了静态类型和类型检查机制，能在写代码时就发现潜在错误。简单来说，TS 更安全、规范，适合大型项目开发，最终会编译成 JS 执行。


## Vue2 和 Vue3 有什么区别？

Vue3 是 Vue2 的升级版，主要变化：

1. **性能更好**：响应式系统从 `Object.defineProperty` 改成 `Proxy`，可监听更复杂的数据变化，速度更快
2. **组合式 API**：Vue3 提出 `setup()` 写法，更灵活、方便逻辑复用，Vue2 是用 `data`、`methods`、`computed` 分散写法
3. **TypeScript 支持更好**：更适合企业级开发
4. **其他优势**：支持多个根节点、体积更小

## 你是如何实现页面不存在自动跳转404页面的？

在路由配置中添加通配符路由，访问不存在的路由时自动跳转 404 页面：

```javascript
{
  path: "/:pathMatch(.*)*",
  component: () => import('@/views/error/404')
}
```
## CDN是什么？

CDN（Content Delivery Network，内容分发网络）是一种分布式网络服务，通过在全球部署节点服务器，将静态资源缓存到离用户最近的节点上。

**核心作用：**

1. **加速访问**：用户从就近节点获取资源，减少网络延迟
2. **降低源站压力**：大部分请求由 CDN 节点处理，减轻主服务器负载
3. **提高可靠性**：节点故障时自动切换，确保服务可用
4. **带宽优化**：通过智能路由和负载均衡，优化网络传输

**工作原理：**

1. 用户请求静态资源
2. DNS 解析到离用户最近的 CDN 节点
3. 节点检查本地缓存，有则直接返回
4. 无缓存则向源站请求并缓存，再返回给用户

## 什么是闭包？

函数执行完了，但它用过的变量还"活着"。

```javascript
function outer() {
  let count = 0;
  return function inner() {
    count++;
    console.log(count);
  };
}

const fn = outer();  // outer() 执行完了
fn();  // 1
fn();  // 2
```

**底层原因**：`fn` 持有 `inner`，`inner` 引用 `count`，所以 `count` 没被 GC 回收。

**常见场景**：

1. **防抖**：闭包记住 `timer`，实现延迟清除
```javascript
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

2. **数据私有化**：外部访问不到内部变量
```javascript
function createStore() {
  let username = '';  // 私有变量
  return {
    setUser: (name) => username = name,
    getUser: () => username
  };
}
```

## JS 是单线程的，如何实现异步？

靠**事件循环（Event Loop）**。主线程执行代码，遇到异步任务就交给浏览器处理，不阻塞。任务完成后回调函数进入**任务队列**，主线程空闲时再执行。

```javascript
console.log(1);
setTimeout(() => console.log(2), 0);
console.log(3);  // 输出：1 → 3 → 2
```

**宏任务 vs 微任务**：

- 宏任务：setTimeout、setInterval、I/O
- 微任务：Promise.then、async/await

微任务优先级更高，队列空了先清微任务，再执行下一个宏任务。


## 虚拟 DOM 是什么？

用 JS 对象模拟真实 DOM 树。更新时对比新旧虚拟 DOM，只操作真实 DOM 的变化部分，提升渲染性能。Vue 和 React 都用这个。

## 常用的 HTTP 状态码有哪些？

1. **2xx**：200 成功，201 创建，204 无内容
2. **3xx**：301 永久重定向，302 临时，304 缓存未修改
3. **4xx**：400 错误，401 未授权，403 禁止，404 不存在
4. **5xx**：500 服务器错误，502 网关错误，503 服务不可用

## 为什么前端请求后端会存在跨域问题？
浏览器的<HoverComment text="同源策略" comment="协议、域名、端口三者完全相同才算同源，防止恶意网站窃取数据。" />保护用户安全。比如你登录了银行 `bank.com`，恶意网站 `hack.com` 如果能直接请求银行接口，就能以你的身份转账。

实际开发中常见：前端 `localhost:8080` 请求后端 `localhost:3000`，端口不同，被浏览器拦截。服务端其实正常响应了，是浏览器自己拦的。

## 跨域的解决方案有哪些？

1. **CORS**：后端加响应头 `Access-Control-Allow-Origin`
2. **JSONP**：script 标签不受同源限制，只支持 GET
3. **代理**：开发环境用 webpack 代理，生产环境用 Nginx 反向代理
4. **WebSocket/postMessage**：天然跨域

## 箭头函数和普通函数的区别？

1. 箭头函数没有自己的 this，继承外层
2. 不能 new，不能当构造函数
3. 语法更简洁

```javascript
const add = (a, b) => a + b;
```

## 防抖和节流是什么？

1. **防抖**：停止后才执行，比如点提交按钮，只触发最后一次
2. **节流**：间隔执行，比如滚动加载，500ms 内最多一次

## 前端存储有哪些方式？

1. **Cookie**：4KB，每次请求自动带，适合存会话
2. **LocalStorage**：5MB，永久存储，标签页共享
3. **SessionStorage**：5MB，关闭页面清除
4. **IndexedDB**：浏览器数据库，存大量数据

## 什么是 XSS 攻击，如何防范？

攻击者在网页注入恶意脚本，用户访问时执行。

防范：
1. 输入过滤特殊字符
2. 输出用 `textContent` 代替 `innerHTML`
3. CSP 响应头
4. HttpOnly Cookie

## <HoverComment text="ES6" comment="ECMAScript 6.0，是 JavaScript 的语言标准版本。ES6 在 2015 年发布，所以也叫 ECMAScript 2015。之后的版本按年份命名，如 ES7(2016)、ES8(2017) 等。" /> 新特性有哪些？

1. let/const 块级作用域
2. 箭头函数（无 this）
3. 模板字符串（反引号）
4. 解构赋值
5. Promise 异步
6. class 类
7. import/export 模块化
8. 扩展运算符 `...`