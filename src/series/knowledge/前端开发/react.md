---
title: React
date: 2026-08-25
categories: ["前端开发"]
---

## 虚拟 DOM 是什么？

**锚点**：`JS 对象模拟 DOM 树，diff 后只操作变化部分`

1. **是什么**：用 JS 对象模拟真实 DOM 树，更新时对比新旧虚拟 DOM，只操作真实 DOM 的变化部分，提升渲染性能
2. **为什么快**：直接操作真实 DOM 代价高（重排重绘），diff 在内存里做，批量提交变化
3. **React 的 diff**：同层对比 + key 优化——key 稳定才能复用节点，所以列表 key 不要用 index
4. **注意**：虚拟 DOM 不是"一定比手动操作 DOM 快"，它保证的是**可维护性和性能下限**；Vue 和 React 都用这个

---

## React 和 Vue 有什么区别？

**锚点**：`模板 vs JSX、自动响应式 vs 手动 setState、生态一一对应`

| 对比维度 | Vue | React |
|---------|-----|-------|
| 模板写法 | `<template>` 标签 + 指令（v-if/v-for） | <HoverComment text="JSX" comment="JavaScript XML，React 的模板写法：允许在 JS 代码里直接写类似 HTML 的标签（如 `return <button>点我</button>`）。浏览器不能直接运行，构建时由 Babel 编译成 React.createElement 调用。" />：HTML 写在 JS 里 |
| 数据更新 | **自动响应式**，改数据页面自动变 | **手动 setState()** 才更新 |
| 生态 | Pinia/Vuex、Element Plus、Vue Router | Redux/Zustand、Ant Design、React Router |
| 上手难度 | 低（模板直观） | 中（JSX 心智） |

```html
<!-- Vue：改 count，页面自动变 -->
<script setup>
const count = ref(0)
</script>
<template><button @click="count++">{{ count }}</button></template>
```

```jsx
// React：必须 setCount() 才更新
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

核心差别一句话：**Vue 自动跟踪"数据→视图"，React 把更新控制权交给你（setState）**。

---

## 你实习的时候用 React 做过什么？跟平时写 Vue 比体验有什么不一样？

**锚点**：`Vue 模板上手快，React 一切皆 JS 更灵活；实习项目是 Umi + Antd 企业级全家桶`

1. **实习项目**：广发证券 VM 变动保证金系统 CMS 模块，用 React 17 + Umi 4 + Ant Design 3 + TypeScript 5.5 做履保方案的列表、详情、编辑页面，表单交互、下拉联动、资金户选择都是 React 写的
2. **和 Vue 的体感差异**：
   - 模板：Vue 用 template 语法，React 用 JSX——组件就是函数，逻辑和结构在一个文件里
   - 状态：Vue 响应式自动追踪，React 要显式 setState 触发更新，心智模型是"不可变数据 + 单向数据流"
   - 生态：React 的 <HoverComment text="Hooks" comment="React 的函数钩子：以 use 开头的函数（useState / useEffect / useMemo），让函数组件也能拥有状态和副作用。useState 存状态、useEffect 处理挂载/更新/卸载时的副作用、useMemo 缓存计算结果——以前只有 class 组件能做的事，函数组件现在也能做。" />（useState/useEffect）和 Vue3 Composition API 思路很像，两边迁移成本不高

3. **感受**：Vue 适合快速开发、模板直观；React 适合复杂交互，JSX + Hooks 表达力更强，大团队协作更规范

---

## 履保方案编辑页那种"下拉联动 + 资金户选择"的表单交互，你是怎么做的？

**锚点**：`受控组件 + 状态驱动：选交易对手 → 联动协议 → 联动资金户，数据单向流`

1. **受控组件**：表单值全部由 state 持有，`onChange` 更新 state——值永远可控可校验，不像非受控组件值在 DOM 里难追踪
2. **联动实现**：选交易对手 → setState 更新 → 协议下拉的数据源由"交易对手 + 当前协议"派生；选协议 → 资金户下拉按协议过滤
3. **派生数据用计算**：联动选项是"根据已有状态算出来的"，用 useMemo 或 selector 派生，不重复存 state，避免多份状态不同步
4. **校验时机**：表单提交统一校验（必填、金额精度、时限），Ant Design Form 的 rules 声明式配置，联动字段变化时触发相关校验

---

## Umi + Ant Design 这种企业级方案解决什么问题？和 Vue 生态（Vite/Vuex/Pinia）比有什么异同？

**锚点**：`Umi 管工程化（路由/构建/约定），antd 管组件，React 数据流自己定——和 Vue 全家桶是一套对应关系`

1. **Umi 解决工程化**：约定式路由（目录即路由）、一键构建、插件体系、环境配置——开箱即用，团队不用各自配 webpack；对应 Vue 侧的 Vite + Vue Router + 脚手架
2. **Ant Design 解决组件**：表格、表单、下拉、弹窗等企业级组件开箱即用，表单校验用声明式 rules——对应 Vue 侧的 Element Plus
3. **React 数据流（自己选）**：小项目 useState/useContext 够用；大了用 Redux（dispatch → reducer，配 DevTools 可追踪）或 Zustand；和 Vue 侧 Vuex/Pinia 是同一套 Flux 单向数据流思想
4. **实习体感**：企业项目"脚手架 + 组件库 + 集中状态"三件套是标配，选型时前端生态和团队熟悉度比技术优劣更重要
