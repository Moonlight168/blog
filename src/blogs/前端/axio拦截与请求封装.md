---
title: Axios 拦截器与请求封装实战（Vue3 + TypeScript）
date: 2025-06-12
categories: ["前端开发"]  # 这会被自动填充为对应的分类
tags: ["vue", "TS"]  # 这会被自动填充为对应的标签
---
在实际开发中，我们经常会对 `axios` 进行统一封装，比如：统一设置请求头、添加 token、全局处理响应错误信息等。本文将介绍如何使用 `axios` 拦截器，配合 TypeScript 进行请求封装，提高代码的可维护性和复用性。

## 一、为什么需要封装 axios？

在实际开发中，我们通常需要处理以下问题：

* 每个请求都需要携带 token
* 处理请求失败或权限过期等错误
* 重复的请求配置代码
* 响应数据格式统一解包

手动在每个请求中写这些逻辑，会导致代码冗余、不易维护。因此我们应该 **封装 axios 实例并添加拦截器**。


## 二、基础 axios 封装结构

项目目录建议如下：

```
src/
├── utils/
│   └── request.ts      // axios封装
├── exception.ts        // 错误消息转换
└── api/
    └── studentApi.ts   // 请求使用示例
```

## 三、创建 `request.ts`：Axios 实例封装

```ts
// src/utils/request.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useUserStore } from '@/store';
import { reason } from '@/exception';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const instance = axios.create({
  baseURL: '/', // 可配置环境变量控制
  timeout: 10000,
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.token = userStore.token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const res = response.data;
    if (res.code !== 200) {
      const msg = reason(res.message);
      return Promise.reject(new Error(msg));
    }
    return res.data;
  },
  error => {
    return Promise.reject(error);
  }
);

interface RequestOptions extends AxiosRequestConfig {
  description?: string;
}

/**
 * 通用请求方法封装
 */
export default async function request<T = any>(options: RequestOptions): Promise<T> {
  try {
    const response = await instance.request<ApiResponse<T>>(options);
    return response;
  } catch (error: any) {
    console.error(`❌ ${options.description || '请求失败'}：${error.message}`);
    throw error;
  }
}
```


## 四、错误原因统一处理（可选）

```ts
// src/exception.ts
export const reason = (msg: string): string => {
  if (msg.includes('token')) return '认证失败，请重新登录';
  if (msg.includes('permission')) return '权限不足';
  if (msg.includes('timeout')) return '请求超时';
  return msg || '服务异常';
};
```


## 五、使用示例：调用接口

```ts
// src/api/studentApi.ts
import request from '@/utils/request';
import type { Student } from '@/types/model';

/**
 * 获取学生信息
 */
export const getStudentInfo = () => {
  return request<Student>({
    url: '/api/student',
    method: 'GET',
    description: '获取学生信息'
  });
};
```

## 六、封装优点总结

✅ 自动添加 token
✅ 请求失败自动统一提示
✅ 响应数据解包，调用方直接拿到 `data`
✅ 请求参数类型自动推断，接口调用更类型安全
✅ 支持多模块复用

## 七、进阶建议（可选）

* ✅ 配置多个 `axios` 实例（如多服务源）
* ✅ 在拦截器中处理自动刷新 token
* ✅ 添加 loading 状态、错误弹窗等全局 UI 效果


## 八、结语

对 `axios` 进行统一封装和使用拦截器处理请求，是现代前端开发的标配。它能显著提高代码质量与开发效率，特别是在大型项目中尤为重要。

如果你正在用 Vue3 + TypeScript 构建项目，强烈建议将 `axios` 做好这一层的封装！
