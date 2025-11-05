---
title: Cookie与Session
date: 2025-11-05
categories: [计算机网络,基本概念]
---

# Cookie 与 Session

## 一、基本概念

HTTP 是**无状态协议**，无法识别用户或保持会话。
为解决这个问题，引入了 **Cookie**（客户端存储） 和 **Session**（服务器存储） 技术。

---

## 二、Cookie

### 1. 定义

Cookie 是服务器发送到浏览器并存储在本地的小数据文件。
浏览器下次请求时会自动携带 Cookie，用于识别用户。

### 2. 工作流程

1. 客户端发送请求
2. 服务器响应并设置 `Set-Cookie`
3. 浏览器保存 Cookie
4. 下次请求时携带 Cookie，服务器识别用户

### 3. 主要属性

* **Name / Value**：键值对
* **Domain / Path**：作用范围
* **Expires / Max-Age**：过期时间
* **Secure / HttpOnly / SameSite**：安全控制

### 4. 类型

* **会话 Cookie**：浏览器关闭即失效
* **持久 Cookie**：有固定过期时间

### 5. 常见用途

* 保存登录状态
* 存储用户偏好（语言、主题）
* 临时保存购物车信息

---

## 三、Session

### 1. 定义

Session 是服务器端保存的用户会话数据。
服务器为每个用户分配一个 **Session ID**，通过 Cookie 传递。

### 2. 工作流程

1. 用户访问服务器
2. 服务器创建 Session，生成 Session ID
3. 客户端保存 Session ID（Cookie）
4. 后续请求带 Session ID，服务器获取对应会话

### 3. 存储方式

* 内存（默认）
* 数据库
* Redis 等缓存系统（分布式场景）

### 4. 生命周期

* 创建：用户首次访问时生成
* 超时：长时间未操作自动失效
* 销毁：用户退出登录或手动清理

### 5. 应用场景

* 登录认证
* 权限控制
* 临时数据存储（表单、验证码等）

---

## 四、主要区别

| 对比项  | Cookie  | Session  |
| ---- | ------- | -------- |
| 存储位置 | 浏览器     | 服务器      |
| 安全性  | 易被篡改    | 相对安全     |
| 数据容量 | 小（约4KB） | 大        |
| 生命周期 | 可设置过期时间 | 通常 30 分钟 |
| 性能影响 | 占网络带宽   | 占服务器资源   |

---

## 五、安全性

### Cookie 安全

* **HttpOnly**：防止 JS 读取
* **Secure**：仅 HTTPS 传输
* **SameSite**：防 CSRF
* **加密敏感数据**

### Session 安全

* 使用随机、安全的 Session ID
* 登录后重新生成 Session ID（防固定攻击）
* 绑定 IP 和 User-Agent 防止劫持

---

## 六、选择建议

| 场景         | 推荐技术    |
| ---------- | ------- |
| 用户偏好、主题、语言 | Cookie  |
| 未登录购物车     | Cookie  |
| 登录认证、权限验证  | Session |
| 存储敏感信息     | Session |

---

## 七、趋势

* **JWT（JSON Web Token）**：前后端分离或微服务常用，替代传统 Session。
* **Serverless 环境**：会话状态存储在外部服务（如 Redis、DynamoDB）。

---

## 八、总结

* **Cookie**：客户端存储小量、非敏感信息，适合记住用户偏好。
* **Session**：服务器端管理登录状态与权限，更安全但需资源。
* **最佳实践**：

    * Cookie 加密 + HttpOnly + Secure
    * Session 设置合理超时并防固定攻击
