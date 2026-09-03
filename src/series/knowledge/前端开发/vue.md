---
title: Vue
date: 2025-10-24
updated: 2026-09-03
categories: ["前端开发"]
---

## Vue2 和 Vue3 有什么区别？

**锚点**：`Proxy 响应式 + 组合式 API + TS 更好 + 多根节点体积小`

1. **性能更好**：响应式从 `Object.defineProperty` 换成 `Proxy`，可监听更复杂变化、更快
2. **组合式 API**：`setup()` 按功能组织逻辑，方便复用；Vue2 是 data/methods/computed 分散写法
3. **TypeScript 更好**：类型推导友好，适合企业级
4. **其他**：支持多根节点、体积更小

---

## Vue 的生命周期钩子有哪些？

**锚点**：`创建 → 挂载 → 更新 → 销毁，Vue3 改名 beforeUnmount/unmounted`

1. 创建：`beforeCreate` → `created`
2. 挂载：`beforeMount` → `mounted`
3. 更新：`beforeUpdate` → `updated`
4. 销毁：`beforeUnmount` → `unmounted`（Vue2 叫 `beforeDestroy`/`destroyed`）

## created 和 mounted 的区别是什么？

**锚点**：`created 数据就绪无 DOM，mounted DOM 可操作`

- **created**：data/computed/watch 已就绪，但 DOM 没挂载，不能操作 `$el`、`$refs`
- **mounted**：DOM 挂载完毕，适合发请求、初始化第三方库

## 组件之间有哪些通信方式？

**锚点**：`父子 props/emit，跨级 provide/inject，全局 Pinia，其余 $refs/$attrs`

1. **props / emit**：父传子 props、子传父 emit（最常用）
2. **provide / inject**：祖先向后代传值，跨多级好用
3. **Pinia / Vuex**：跨组件共享状态
4. **$attrs / $refs**：$attrs 收未声明的父属性，$refs 拿子实例或 DOM
5. **localStorage**：跨页面持久化

## v-if 和 v-show 有什么区别？

**锚点**：`v-if 不渲染不创建，v-show 始终渲染只 display:none`

- **v-if**：false 时不渲染（不创建），适合不频繁切换
- **v-show**：始终渲染，只是隐藏，适合频繁切换

## v-for 为什么要加 key？

**锚点**：`key=每项稳定身份，让 DOM 跟对数据；用 index 会"换人复用"导致状态串位`

1. **先澄清**：行数增减 Vue 本来就知道，key 不是用来"防止刷新 DOM"
   - key 回答的是"这一项是谁"→ 决定复用旧 DOM 还是重建，并复用在**正确的项**上
2. **Vue 默认想尽量复用**：把新数据填进旧 DOM 省性能，所以必须靠 key 对号入座
3. **key 用 index 的坑**：index 是"第几个"，增删后会换人
   - 例：第一行"张三"被打勾 → 删掉张三，李四顶上来，`index=0` 复用旧 DOM → 数据显示李四，勾选框却还打着勾
4. **结论**：key 用业务唯一 id（用户/记录 id），别用 index

## computed 和 watch 的区别是什么？

**锚点**：`computed 有缓存适合派生数据，watch 无缓存适合异步/开销大`

- **computed**：基于响应式数据自动计算，有缓存、值不变不重算——派生数据
- **watch**：监听数据变化执行回调、无缓存——异步操作或开销大的操作

## Vue3 组合式 API 和选项式 API 有什么区别？

**锚点**：`选项式=按 data/methods/computed 分块；组合式=按功能用 setup 组织，可复用、TS 更好`

1. **组织方式**：选项式按"类型"分块（data/methods/computed 各放一坨）；组合式按"功能"聚在一起
   - 例：做分页查询，选项式逻辑散在多个选项里；组合式可抽成一个 `usePagination()`
2. **逻辑复用**：选项式靠 mixin（命名易冲突、来源不清）；组合式抽成函数/Hook，来源清晰
3. **TypeScript**：组合式类型推导更好；选项式操作 `this` 类型麻烦
4. **写法**：组合式用 `<script setup>` + ref/reactive/computed；选项式是 `export default { data(){}, methods:{} }`
5. **怎么选**：新项目推荐组合式；简单小组件、老项目继续选项式也够

## Vue Router 的 hash 和 history 模式有什么区别？

**锚点**：`hash 带 # 兼容好免配置；history 干净但刷新 404 需服务器配置`

- **hash**：URL 带 `#`，不依赖服务器，兼容好
- **history**：URL 干净，刷新会请求后端路径，需服务器回退到 index.html，否则 404

## Pinia 相比 Vuex 有什么优势？

**锚点**：`更轻（无 mutation）、TS 推导好、免 map 辅助、模块免 namespaced`

1. 更轻量：没有 mutation，只有 state/getters/actions
2. TypeScript 类型推导更好
3. 直接调用 store，不需要 map 系列辅助函数
4. 模块化更简单，不需要 namespaced 配置

## Vue 的单向数据流是什么？

**锚点**：`数据只能父→子，子不能直接改 props，要改就 emit`

数据从父组件流向子组件；子组件不能直接修改 props，需要变更时通过 emit 触发父组件的方法改。
