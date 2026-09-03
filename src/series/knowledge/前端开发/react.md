---
title: React
date: 2026-08-25
categories: ["前端开发"]
---

## 虚拟 DOM 是什么？

**锚点**：`JS 对象模拟 DOM 树，diff 后只改变化部分`

1. **是什么**：用 JS 对象模拟真实 DOM（Document Object Model，文档对象模型）树
   - 更新时对比新旧虚拟 DOM，只改真实 DOM 的变化部分
2. **为什么快**：直接操作真实 DOM 代价高（重排重绘）
   - diff 在内存里算完，再**批量提交**最小变化
3. **React 的 diff**：同层对比 + key 优化
   - key 稳定才复用节点，列表 key 别用 index
4. **别神化**：保证**可维护性和性能下限**，不是一定比手写 DOM 快
   - Vue 和 React 都基于它，机制同源

---

## React 和 Vue 有什么区别？

**锚点**：`模板 vs JSX、自动响应式 vs 手动 setState、生态一一对应`

| 对比维度 | Vue | React |
|---------|-----|-------|
| 模板写法 | `<template>` + 指令（v-if/v-for） | <HoverComment text="JSX" comment="JavaScript XML，React 的模板写法：允许在 JS 代码里直接写类似 HTML 的标签（如 `return <button>点我</button>`）。浏览器不能直接运行，构建时由 Babel 编译成 React.createElement 调用。" />——HTML 写在 JS 里 |
| 数据更新 | **自动响应式**，改数据页面自动变 | **手动 setState()** 才更新 |
| 生态 | Pinia/Vuex、Element Plus、Vue Router | Redux/Zustand、Ant Design、React Router |
| 上手难度 | 低（模板直观） | 中（JSX 心智） |

---

## 你实习的时候用 React 做过什么？跟平时写 Vue 比体验有什么不一样？

**锚点**：`Vue 模板上手快，React 一切皆 JS 更灵活；实习是 Umi + Antd 全家桶`

1. **项目背景**：广发证券 VM 变动保证金 CMS 模块
   - 技术栈：React 17 + Umi 4 + Ant Design 3 + TypeScript 5.5
   - 负责履保方案列表/详情/编辑：表单交互、下拉联动、资金户选择
2. **和 Vue 的体感差异**：
   - 模板：Vue 用 template，React 用 JSX——组件就是函数，逻辑和结构同文件
   - 状态：Vue 自动追踪，React 要显式 setState，心智是"不可变数据 + 单向数据流"
   - 生态：React 的 <HoverComment text="Hooks" comment="React 的函数钩子：以 use 开头的函数（useState / useEffect / useMemo），让函数组件也能拥有状态和副作用。useState 存状态、useEffect 处理挂载/更新/卸载时的副作用、useMemo 缓存计算结果——以前只有 class 组件能做的事，函数组件现在也能做。" /> 和 Vue3 Composition API 思路很像，迁移成本低
3. **总体感受**：Vue 上手快、适合快速开发；React 复杂交互表达力强，大团队协作更规范

---

## 履保方案编辑页那种"下拉联动 + 资金户选择"的表单交互，你是怎么做的？

**锚点**：`受控组件 + 状态驱动：选交易对手 → 联动协议 → 联动资金户`

1. **受控组件**：表单值全由 state 持有，`onChange` 更新 state
   - 值永远可控可校验；非受控组件值在 DOM 里，难追踪
2. **联动靠状态驱动**：选交易对手 → setState → 协议下拉数据源派生；选协议 → 资金户按协议过滤
3. **派生数据现算不另存**：联动选项用 useMemo/selector 从已有状态推出，避免多份状态不同步
4. **校验时机**：提交统一校验（必填、金额精度、时限），AntD Form 用 rules 声明式配置
   - 联动字段变化时触发相关字段校验

---

## Umi + Ant Design 这种企业级方案解决什么问题？和 Vue 生态（Vite/Vuex/Pinia）比有什么异同？

**锚点**：`Umi 管工程化、antd 管组件、数据流自己定——对标 Vue 全家桶`

1. **Umi 管工程化**：约定式路由（目录即路由）、一键构建、插件体系
   - 对标 Vue 侧：Vite + Vue Router + 脚手架
2. **Ant Design 管组件**：表格/表单/弹窗企业组件开箱即用，校验用声明式 rules
   - 对标 Vue 侧：Element Plus
3. **数据流自己选**：小项目 useState/useContext 够用，大了用 Redux 或 Zustand
   - 与 Vuex/Pinia 同属 Flux 单向数据流思想
4. **选型体感**：企业项目"脚手架 + 组件库 + 集中状态"三件套是标配，看生态与团队熟悉度
