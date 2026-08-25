---
title: 基础知识
date: 2025-10-24
updated: 2025-10-26
categories: ["前端开发"]
---
## 如何提升前端性能？

**锚点**：`减请求 + 压缓存 + 异步加载`

1. **减少 HTTP 请求**：合并 CSS/JS 文件，雪碧图、图片压缩
2. **启用资源压缩与缓存**：开启 Gzip，设置合理的浏览器缓存策略
3. **异步加载资源**：非关键资源用懒加载和异步加载

## JS 和 TS 的区别？

**锚点**：`JS 动态类型灵活易错，TS 超集加静态类型更安全规范`

JavaScript 是动态类型语言，写起来灵活但容易出错，变量类型写错编译阶段发现不了。TypeScript 是 JavaScript 的超集，加了静态类型和类型检查机制，写代码时就能发现潜在错误。TS 更安全、规范，适合大型项目，最终编译成 JS 执行。

## Vue2 和 Vue3 有什么区别？

**锚点**：`Proxy 响应式 + 组合式 API + TS 更好 + 多根节点体积小`

1. **性能更好**：响应式从 `Object.defineProperty` 改成 `Proxy`，可监听更复杂变化、更快
2. **组合式 API**：`setup()` 写法更灵活、方便逻辑复用；Vue2 是 data/methods/computed 分散写法
3. **TypeScript 支持更好**：适合企业级开发
4. **其他**：支持多个根节点、体积更小

## 你是如何实现页面不存在自动跳转404页面的？

**锚点**：`路由配通配符，未匹配的路径落 404 组件`

```javascript
{
  path: "/:pathMatch(.*)*",
  component: () => import('@/views/error/404')
}
```

## CDN是什么？

**锚点**：`分布式网络：静态资源缓存到离用户最近的节点`

1. **核心作用**：加速访问（就近取资源减延迟）、降低源站压力、节点故障自动切换、带宽优化
2. **工作原理**：用户请求静态资源 → DNS 解析到最近 CDN 节点 → 节点有缓存直接返回 → 无缓存向源站请求并缓存再返回

## 什么是闭包？

**锚点**：`函数执行完，它用过的变量还"活着"——因为内部函数还引用着`

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

**锚点**：`事件循环：异步任务交浏览器，完成后回调进任务队列，主线程空闲再执行`

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

**锚点**：`JS 对象模拟 DOM 树，diff 后只操作变化部分`

用 JS 对象模拟真实 DOM 树。更新时对比新旧虚拟 DOM，只操作真实 DOM 的变化部分，提升渲染性能。Vue 和 React 都用这个。

## 常用的 HTTP 状态码有哪些？

**锚点**：`2xx 成功 / 3xx 重定向 / 4xx 客户端错 / 5xx 服务器错`

1. **2xx**：200 成功，201 创建，204 无内容
2. **3xx**：301 永久重定向，302 临时，304 缓存未修改
3. **4xx**：400 错误，401 未授权，403 禁止，404 不存在
4. **5xx**：500 服务器错误，502 网关错误，503 服务不可用

## 为什么前端请求后端会存在跨域问题？

**锚点**：`浏览器安全策略：防止恶意网站以你的身份调接口`

浏览器的保护用户安全。比如你登录了银行 `bank.com`，恶意网站 `hack.com` 如果能直接请求银行接口，就能以你的身份转账。

实际开发中常见：前端 `localhost:8080` 请求后端 `localhost:3000`，端口不同，被浏览器拦截。服务端其实正常响应了，是浏览器自己拦的。

## 跨域的解决方案有哪些？

**锚点**：`CORS / JSONP / 代理 / WebSocket、postMessage`

1. **CORS**：后端加响应头 `Access-Control-Allow-Origin`
2. **JSONP**：script 标签不受同源限制，只支持 GET
3. **代理**：开发环境用 webpack 代理，生产环境用 Nginx 反向代理
4. **WebSocket/postMessage**：天然跨域

## 箭头函数和普通函数的区别？

**锚点**：`无自己的 this（继承外层）、不能 new、语法简洁`

1. 箭头函数没有自己的 this，继承外层
2. 不能 new，不能当构造函数
3. 语法更简洁

```javascript
const add = (a, b) => a + b;
```

## 防抖和节流是什么？

**锚点**：`防抖停止后才执行，节流间隔执行`

1. **防抖**：停止后才执行，比如点提交按钮，只触发最后一次
2. **节流**：间隔执行，比如滚动加载，500ms 内最多一次

## 前端存储有哪些方式？

**锚点**：`Cookie 4KB / LocalStorage 5MB 永久 / SessionStorage 关页清 / IndexedDB 大容量`

1. **Cookie**：4KB，每次请求自动带，适合存会话
2. **LocalStorage**：5MB，永久存储，标签页共享
3. **SessionStorage**：5MB，关闭页面清除
4. **IndexedDB**：浏览器数据库，存大量数据

## 什么是 XSS 攻击，如何防范？

**锚点**：`注入恶意脚本；防：过滤输入 + textContent + CSP + HttpOnly`

攻击者在网页注入恶意脚本，用户访问时执行。

防范：

1. 输入过滤特殊字符
2. 输出用 `textContent` 代替 `innerHTML`
3. CSP 响应头
4. HttpOnly Cookie

## ES6 新特性有哪些？

**锚点**：`let/const、箭头、模板串、解构、Promise、class、模块化、扩展运算符`

1. let/const 块级作用域
2. 箭头函数（无 this）
3. 模板字符串（反引号）
4. 解构赋值
5. Promise 异步
6. class 类
7. import/export 模块化
8. 扩展运算符 `...`
