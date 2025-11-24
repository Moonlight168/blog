---
title: "Vue Router 路由跳转需要刷新才能加载页面的Bug"
date: 2025-11-24
categories: ["BUG"]
tags: ["Vue"]
---

## 问题描述

在Vue应用中，通过`<router-link to="/oa/todo">`跳转到特定路由后，页面显示404错误，只有刷新页面才能正常加载内容。这个问题在首次访问路由时特别明显，直接在浏览器地址栏输入URL也会遇到相同问题。

## 原因分析

经过分析，发现这个问题有两个主要原因：

1. **路由初始化顺序问题**：
   - 在应用启动时，`oaRoutes`路由组没有被正确加载到路由表中
   - 这些路由是在用户登录后才动态添加的，导致首次访问时路由表不完整
   - 当用户尝试访问未注册的路由时，Vue Router会匹配到404路由规则，显示404页面

2. **路由匹配优先级问题**：
   - 404路由规则`/:pathMatch(.*)*`位于路由数组的前面位置
   - 这导致特定路由（如`/oa/todo`）在匹配时被404路由"拦截"
   - Vue Router按照路由定义的顺序进行匹配，而不是按照具体性

## 解决方案

针对上述问题，我们实施了以下解决方案：

### 1. 调整路由初始化顺序

在`main.js`中确保`oaRoutes`在应用启动时就被加载：

```javascript
import router, { oaRoutes } from './router'

// 确保oa路由在应用启动时就被加载
oaRoutes.forEach(route => {
  router.addRoute(route)
})
```

### 2. 修改路由匹配顺序

在`router/index.js`中，将404路由从`constantRoutes`中移出，作为单独的`notFoundRoute`放在路由数组的最后：

```javascript
// 移除404路由从constantRoutes
// 添加为单独的notFoundRoute
export const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  redirect: '/404',
  hidden: true
}

// 创建路由实例时，确保notFoundRoute在最后
const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, ...oaRoutes, ...dynamicRoutes, notFoundRoute]
})
```

### 3. 增强路由守卫检查

在`permission.js`中增加路由加载检查，确保在用户登录后`oaRoutes`也被正确添加：

```javascript
// 确保oa路由已经加载
if (!router.hasRoute('oa')) {
  oaRoutes.forEach(route => {
    router.addRoute(route)
  })
}
```

## 总结

这个问题的根本原因是路由初始化和匹配顺序的问题。通过确保路由在应用启动时就被正确加载，并调整404路由的匹配优先级，我们解决了这个需要刷新才能加载页面的问题。

这种问题在大型Vue应用中比较常见，特别是在使用动态路由和嵌套路由的情况下。正确的路由初始化顺序和合理的路由匹配规则对于确保良好的用户体验至关重要。