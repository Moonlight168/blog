---
title: CSRF攻击
date: 2025-11-05
categories: [计算机网络,基本概念]
---

# CSRF攻击原理与防御

## 1. 什么是CSRF攻击

跨站请求伪造（Cross-Site Request Forgery，简称CSRF）是一种攻击方式，它迫使终端用户在当前已认证的Web应用程序上执行不需要的操作。CSRF攻击专门针对状态更改请求，而不是数据窃取，因为攻击者无法查看对伪造请求的响应。

### 1.1 CSRF攻击的特点

- **欺骗性**: 攻击者利用用户已经登录的目标网站身份发起非法请求
- **隐蔽性**: 用户在不知情的情况下执行了非意愿操作
- **依赖性**: 攻击的成功依赖于用户已经在目标网站处于登录状态

## 2. CSRF攻击原理

### 2.1 攻击机制

CSRF攻击利用了Web应用程序的信任机制。当用户访问恶意网站时，恶意网站会构造一个指向目标网站的请求，由于浏览器会自动携带目标网站的Cookie，目标网站会误认为这是用户的合法请求。

攻击流程如下：
1. 用户登录目标网站A，并保持登录状态
2. 用户在未退出网站A的情况下，访问恶意网站B
3. 恶意网站B向网站A发起请求（如转账、修改密码等）
4. 浏览器携带网站A的Cookie发送请求
5. 网站A验证通过，执行恶意操作

### 2.2 攻击示例

假设一个银行网站的转账接口为：
```
http://bank.example.com/transfer.do?to=attacker&amount=1000
```

攻击者可以构造如下HTML代码：
```html
<img src="http://bank.example.com/transfer.do?to=attacker&amount=1000" width="0" height="0" />
```

当已登录银行网站的用户访问包含此代码的恶意网页时，就会在不知情的情况下执行转账操作。

## 3. CSRF攻击类型

### 3.1 GET类型的CSRF

利用GET请求发起攻击，通常通过图片标签、链接等方式触发。

### 3.2 POST类型的CSRF

利用POST请求发起攻击，通常通过表单自动提交的方式触发。

### 3.3 Ajax类型的CSRF

利用Ajax技术发起攻击，更加隐蔽且难以检测。

## 4. CSRF攻击的危害

### 4.1 直接危害

- **资金损失**: 非法转账、购买商品等造成经济损失
- **数据泄露**: 修改用户信息、绑定第三方账号等
- **权限提升**: 修改密码、添加管理员等获得更高权限

### 4.2 间接危害

- **信任危机**: 用户对网站安全性失去信心
- **法律风险**: 可能面临用户诉讼和监管处罚
- **品牌损害**: 影响企业声誉和品牌形象

## 5. CSRF防护策略

### 5.1 Token验证

#### 5.1.1 同步表单Token

在表单中添加一个隐藏字段，包含随机生成的Token，在服务器端验证该Token的有效性。

```html
<form action="/transfer" method="post">
  <input type="hidden" name="csrf_token" value="随机Token值" />
  <!-- 其他表单字段 -->
  <input type="submit" value="提交" />
</form>
```

#### 5.1.2 HTTP头验证

在HTTP请求头中添加自定义字段，如X-CSRF-Token，服务器验证该字段。

### 5.2 Referer验证

检查HTTP请求头中的Referer字段，验证请求来源是否合法。

```java
String referer = request.getHeader("Referer");
if (referer == null || !referer.startsWith("https://trusted-domain.com")) {
    // 拒绝请求
}
```

### 5.3 SameSite Cookie属性

设置Cookie的SameSite属性，限制Cookie在跨站请求中的发送。

```http
Set-Cookie: sessionid=abc123; SameSite=Strict
```

SameSite有三种值：
- **Strict**: 完全禁止跨站请求携带Cookie
- **Lax**: 仅允许GET请求携带Cookie
- **None**: 允许跨站请求携带Cookie（需配合Secure属性）

### 5.4 双重Cookie验证

将Token同时存储在Cookie和请求参数中，服务器验证两者是否一致。

### 5.5 用户交互验证

对于敏感操作，要求用户进行二次验证，如输入密码、短信验证码等。

## 6. 实际案例分析

### 6.1 Gmail联系人泄露事件

2007年，Gmail曾遭受CSRF攻击，攻击者利用CSRF漏洞获取了用户的联系人信息。攻击者构造了一个恶意网页，当用户访问时会自动向Gmail发送添加联系人的请求，从而获取用户通讯录。

### 6.2 YouTube CSRF漏洞

YouTube曾存在CSRF漏洞，攻击者可以利用该漏洞强制用户订阅频道或添加视频到播放列表。该漏洞通过构造特殊的URL实现，用户点击后会在不知情的情况下执行相应操作。
