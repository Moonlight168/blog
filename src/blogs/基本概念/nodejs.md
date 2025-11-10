---
title: Node.js 简介
date: 2025-11-07
categories: ["基本概念"]
---

# Node.js 是什么、干什么的、为什么需要它

1) Node.js 是什么？

- Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，让你可以在服务器/命令行等非浏览器环境中运行 JavaScript。它将 JavaScript 从浏览器带到了后端与开发工具链中。

2) Node.js 干什么的？

- 编写服务器：用 JavaScript 构建 HTTP API、Web 应用、实时服务（如 WebSocket）。
- 构建开发工具：很多构建工具、打包器（如 webpack、Vite）、脚本化任务都运行在 Node.js 上。
- 自动化与脚本：用 JavaScript 写自动化脚本、CLI 工具、DevOps 脚本等。
- 与生态集成：通过 npm / pnpm / yarn 管理依赖、安装第三方库并复用大量开源包。

3) 为什么需要 Node.js？

- 统一语言栈：前端使用 JavaScript，后端也用 JavaScript，可以减少语言切换成本，方便团队协作与代码复用。
- 丰富生态：npm 上有海量包（从服务器框架到工具链、数据库客户端等），缩短工程实现时间。
- 高并发与非阻塞 IO：Node.js 的事件驱动、非阻塞 IO 模型非常适合高并发网络应用和实时服务。
- 开发效率：大量现代前端构建工具、脚手架、代码生成器都依赖 Node.js，开发流程（如打包、测试、lint）离不开它。

简单示例：一个最小 HTTP 服务器

```js
// 保存为 server.js
const http = require('http');
const server = http.createServer((req, res) => {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end('Hello from Node.js!');
});
server.listen(3000, () => console.log('Listening on http://localhost:3000'));
```

运行：

```bash
node server.js
```

小结：Node.js 把 JavaScript 带到服务器端，既能做应用后端，也承载了现代前端的工具链，是当前 Web 开发不可或缺的一部分。

