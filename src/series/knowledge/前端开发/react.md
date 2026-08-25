---
title: React
date: 2026-08-25
categories: ["前端开发"]
---

## 你实习的时候用 React 做过什么？跟平时写 Vue 比体验有什么不一样？

**锚点**：`Vue 模板上手快，React 一切皆 JS 更灵活；实习项目是 Umi + Antd 企业级全家桶`

1. **实习项目**：广发证券 VM 变动保证金系统 CMS 模块，用 React 17 + Umi 4 + Ant Design 3 + TypeScript 5.5 + DVA 做履保方案的列表、详情、编辑页面，表单交互、下拉联动、资金户选择都是 React 写的
2. **和 Vue 的体感差异**：
   - 模板：Vue 用 template 语法，React 用 JSX——组件就是函数，逻辑和结构在一个文件里
   - 状态：Vue 响应式自动追踪，React 要显式 setState 触发更新，心智模型是"不可变数据 + 单向数据流"
   - 生态：React 的 Hooks（useState/useEffect）和 Vue3 Composition API 思路很像，两边迁移成本不高

3. **感受**：Vue 适合快速开发、模板直观；React 适合复杂交互，JSX + Hooks 表达力更强，大团队协作更规范

---

## 履保方案编辑页那种"下拉联动 + 资金户选择"的表单交互，你是怎么做的？

**锚点**：`受控组件 + 状态驱动：选交易对手 → 联动协议 → 联动资金户，数据单向流`

1. **受控组件**：表单值全部由 state 持有，`onChange` 更新 state——值永远可控可校验，不像非受控组件值在 DOM 里难追踪
2. **联动实现**：选交易对手 → setState 更新 → 协议下拉的数据源由"交易对手 + 当前协议"派生；选协议 → 资金户下拉按协议过滤
3. **派生数据用计算**：联动选项是"根据已有状态算出来的"，用 useMemo 或 selector 派生，不重复存 state，避免多份状态不同步
4. **校验时机**：表单提交统一校验（必填、金额精度、时限），Ant Design Form 的 rules 声明式配置，联动字段变化时触发相关校验

---

## Umi + DVA 这种企业级方案解决什么问题？DVA 的数据流和 Vuex/Pinia 有什么异同？

**锚点**：`Umi 管工程化（路由/构建/约定），DVA 管数据流（dispatch → effects → reducer）；和 Vuex 同源都是 Flux 单向数据流`

1. **Umi 解决工程化**：约定式路由（目录即路由）、一键构建、插件体系、环境配置——开箱即用，团队不用各自配 webpack
2. **DVA 数据流（基于 Redux + redux-saga）**：
   - 组件 dispatch action → effects（异步副作用，调接口）→ reducer（纯函数改 state）→ 组件订阅更新
   - 单向数据流，和 Vuex 的 action → mutation → state 是同一套 Flux 思想
3. **和 Vuex/Pinia 的异同**：
   - 同：都是集中式 store + 单向数据流 + 异步 action
   - 异：DVA 要写样板代码（model 文件：namespace/state/effects/reducers），Pinia 更轻（去 mutation 直接改）；DVA 用 redux-saga 的 generator 处理异步，Vuex 用 promise
4. **实习体感**：大项目里"所有数据都走 model"一开始觉得繁琐，但多人协作时数据流可追踪、可调试（Redux DevTools 看每次 action），比各自 useState 散落管理靠谱
