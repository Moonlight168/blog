---
title: "Vue 嵌套路由配置问题排查与解决方案"
date: 2025-11-25
categories: ["BUG"]
tags: ["Vue"]
---

## 问题现象

工作流管理系统中，点击OA工作台的流程卡片后：
- URL正确跳转到 `/oa/workplace/start/:deploymentId`
- 但页面内容不变，仍然显示流程列表
- 控制台无任何错误信息

## 问题原因

路由配置结构错误：

```javascript
{
  path: '/oa',
  name: 'Oa',
  component: Layout,
  children: [
    {
      path: 'workplace',  // 这里是问题：workplace/start/:deploymentId 应该作为它的子路由
      name: 'Workplace',
      component: () => import('@/views/oa/workplace/index.vue')
    },
    {
      path: 'workplace/start/:deploymentId',  // 这个路由配置错误
      name: 'WorkStart',
      component: () => import('@/views/oa/workplace/start.vue')
    }
  ]
}
```

**核心问题**：两个路由被配置为平级关系，而不是父子关系，导致Vue Router完全替换页面内容。

## 解决方案

### 1. 修正路由配置

将子路由嵌套到父路由的`children`中：

```javascript
{
  path: '/oa',
  name: 'Oa',
  component: Layout,
  children: [
    {
      path: 'workplace',
      name: 'Workplace',
      component: () => import('@/views/oa/workplace/index.vue'),
      children: [
        {
          path: 'start/:deploymentId',
          name: 'WorkStart',
          component: () => import('@/views/oa/workplace/start.vue'),
          meta: { title: '发起流程', activeMenu: '/oa/workplace' }
        }
      ]
    }
  ]
}
```

### 2. 修改父组件模板

在`workplace/index.vue`中添加条件渲染和`<router-view>`：

```vue
<template>
  <div class="flex h-full bg-gray-50">
    <div class="w-64 bg-white shadow-sm border-r border-gray-100 p-6">
      <!-- 左侧菜单 -->
    </div>

    <div class="flex-1 flex flex-col p-6">
      <!-- 工作台标题 - 只有在主页面显示 -->
      <div v-if="$route.name === 'Workplace'" class="mb-6">
        <h3 class="text-lg font-bold text-gray-800 mb-2">常用应用</h3>
        <p class="text-xs text-gray-500">点击即可发起新的流程申请</p>
      </div>

      <!-- 流程列表 - 只有在主页面显示 -->
      <div v-if="$route.name === 'Workplace'">
        <div v-if="loading" class="py-10 text-center text-gray-400">加载中...</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <!-- 流程卡片 -->
        </div>
        <el-empty v-if="!loading && processList.length === 0" description="暂无可用流程" />
      </div>

      <!-- 子路由内容 - 详情页 -->
      <router-view v-else />
    </div>
  </div>
</template>
```

## 关键要点

1. **父子路由关系**：子路由必须在父路由的`children`数组中定义
2. **父组件需要`<router-view>`**：用于渲染子路由内容
3. **条件渲染**：使用`$route.name`判断当前是主页面还是子页面
4. **URL结构**：`/oa/workplace/start/:deploymentId` 才是正确的嵌套路由格式




## 总结

Vue Router嵌套路由的核心是父子关系配置。当路由配置不正确时，页面内容不会按预期更新。通过正确的嵌套配置和条件渲染，可以完美解决这个问题。