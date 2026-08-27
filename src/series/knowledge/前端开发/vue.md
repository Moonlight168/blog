---
title: Vue
date: 2025-10-24
updated: 2026-03-31
categories: ["前端开发"]
---

## Vue2 和 Vue3 有什么区别？

**锚点**：`Proxy 响应式 + 组合式 API + TS 更好 + 多根节点体积小`

1. **性能更好**：响应式从 `Object.defineProperty` 改成 `Proxy`，可监听更复杂变化、更快
2. **组合式 API**：`setup()` 写法更灵活、方便逻辑复用；Vue2 是 data/methods/computed 分散写法
3. **TypeScript 支持更好**：适合企业级开发
4. **其他**：支持多个根节点、体积更小

---

## Vue 的响应式原理是怎么实现的？

**锚点**：`Vue2 劫持属性（defineProperty），Vue3 代理对象（Proxy）`

1. **Vue2**：`Object.defineProperty` 劫持 data 的 getter/setter，递归给每个属性加响应式；数组通过重写 push/slice 等方法监听
2. **Vue3**：<HoverComment text="Proxy" comment="ES6 新增的代理器，可监听对象任意属性的增删改查，无需递归。" /> 代理整个对象，自动追踪依赖，嵌套对象也会代理，性能更好

## Vue 的生命周期钩子有哪些？

**锚点**：`创建 → 挂载 → 更新 → 销毁，Vue3 改名 beforeUnmount/unmounted`

1. 创建阶段：`beforeCreate` → `created`
2. 挂载阶段：`beforeMount` → `mounted`
3. 更新阶段：`beforeUpdate` → `updated`
4. 销毁阶段：`beforeUnmount` → `unmounted`

Vue3 中 `beforeDestroy`/`destroyed` 已更名为 `beforeUnmount`/`unmounted`。

## created 和 mounted 的区别是什么？

**锚点**：`created 数据就绪无 DOM，mounted DOM 可操作`

- **created**：实例刚创建完，data/computed/watch 已就绪，但 DOM 还没挂载，不能操作 `$el` 和 `$refs`
- **mounted**：DOM 已挂载完毕，可以操作了，适合发请求、初始化第三方库

## 组件之间有哪些通信方式？

**锚点**：`父子 props/emit，跨级 provide/inject，全局 Pinia，其余 $refs/$attrs/存储`

1. **props / emit**：父传子 props、子传父 emit
2. **$emit / $on 事件总线**：跨组件通信（Vue3 已移除，需第三方库）
3. **provide / inject**：祖先向后代传值
4. **$attrs**：批量接收父组件传来但没在 props 声明的属性
5. **$refs**：获取子组件实例或 DOM 元素
6. **Pinia / Vuex**：跨组件共享状态
7. **localStorage / sessionStorage**：持久化数据

## v-if 和 v-show 有什么区别？

**锚点**：`v-if 不渲染不创建，v-show 始终渲染只 display:none`

- **v-if**：条件为 false 时元素不渲染（完全不创建），适合不频繁切换的场景
- **v-show**：始终渲染，只是 `display: none`，适合频繁切换

## v-for 为什么要加 key？

**锚点**：`diff 靠 key 唯一标识节点判断复用，无 key 状态错乱`

diff 算法靠 key 唯一标识节点来判断复用。没有 key 或 key 不稳定会导致状态错乱，比如列表顺序变化时。

## computed 和 watch 的区别是什么？

**锚点**：`computed 有缓存适合派生数据，watch 无缓存适合异步/开销大`

- **computed**：基于响应式数据自动计算，有缓存，值不变不重算——派生数据
- **watch**：监听数据变化执行回调，没有缓存——异步操作或开销大的操作

## Vue 的 nextTick 是什么？

**锚点**：`DOM 更新异步，nextTick 回调在下次更新完成后执行`

DOM 更新是异步的，修改数据后视图不会立即更新。`nextTick` 的回调会在下次 DOM 更新完成后执行：

```javascript
this.message = 'updated';
this.$nextTick(() => {
  console.log(this.$refs.input.value); // 能拿到最新值
});
```

## Vue3 的 Composition API 是什么？

**锚点**：`按功能组织逻辑，不散在 data/methods/computed`

一种新的逻辑组织方式，把同一功能相关的代码放在一起：

```javascript
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const doubled = computed(() => count.value * 2);
    onMounted(() => console.log('mounted'));
    return { count, doubled };
  }
}
```

## ref 和 reactive 有什么区别？

**锚点**：`ref 基本类型要 .value，reactive 对象直接访问但不能整体替换`

- **ref**：用于基本类型，访问自动解包，修改用 `.value`；也可以包装对象
- **reactive**：用于对象/数组，直接访问属性不需要 `.value`，但不能直接替换整个对象

## Vue Router 的 hash 和 history 模式有什么区别？

**锚点**：`hash 带 # 兼容好免配置；history 干净但刷新 404 需服务器配置`

- **hash 模式**：URL 带 `#`，如 `localhost:8080/#/home`——兼容性好，不依赖服务器配置
- **history 模式**：URL 正常，如 `localhost:8080/home`——需要服务器配置支持，否则刷新会 404

---

## Pinia 相比 Vuex 有什么优势？

**锚点**：`更轻（无 mutation）、TS 推导好、免 map 辅助、模块免 namespaced`

1. 更轻量，没有 mutation，只有 actions
2. TypeScript 类型推导更好
3. 直接调用 store，不用 map 系列辅助函数
4. 模块化更简单，不需要 namespaced 配置

```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { doubled: (state) => state.count * 2 },
  actions: { increment() { this.count++; } }
});
```

---

## Vue 项目有哪些性能优化手段？

**锚点**：`懒加载（路由/组件/图片）+ keep-alive + 虚拟列表 + 减少响应式数据`

1. 路由懒加载：`() => import('./views/Home.vue')`
2. 组件懒加载：非首屏组件用异步组件
3. keep-alive：缓存组件状态，避免重复渲染
4. 虚拟列表：长列表用 vue-virtual-scroller
5. 图片懒加载：v-lazy 或 IntersectionObserver
6. 减少响应式数据：不需要响应式的数据不要放 data
7. computed 缓存：模板里避免写复杂表达式
8. key 用稳定值：不要用 index 作为 key

---

## Vue 的单向数据流是什么？

**锚点**：`数据只能父→子，子不能直接改 props，要改就 emit`

数据只能从父组件流向子组件。子组件不能直接修改 props，需要修改的话通过 emit 触发父组件的方法。