---
title: Vue
date: 2025-10-24
updated: 2026-03-31
categories: ["前端开发"]
---

## Vue 的响应式原理是怎么实现的？

Vue2 用 `Object.defineProperty` 劫持 data 的 getter/setter，递归给每个属性加响应式。数组通过重写 push/slice 等方法实现监听。

Vue3 用 <HoverComment text="Proxy" comment="ES6 新增的代理器，可监听对象任意属性的增删改查，无需递归。" /> 代理整个对象，自动追踪依赖，嵌套对象也会代理，性能更好。

## Vue 的生命周期钩子有哪些？

1. 创建阶段：`beforeCreate` → `created`
2. 挂载阶段：`beforeMount` → `mounted`
3. 更新阶段：`beforeUpdate` → `updated`
4. 销毁阶段：`beforeUnmount` → `unmounted`

Vue3 中 `beforeDestroy`/`destroyed` 已更名为 `beforeUnmount`/`unmounted`。

## created 和 mounted 的区别是什么？

`created`：实例刚创建完，data/computed/watch 已就绪，但 DOM 还没挂载，不能操作 `$el` 和 `$refs`。

`mounted`：DOM 已挂载完毕，可以操作了，适合发请求、初始化第三方库。

## 组件之间有哪些通信方式？

1. **props / emit**：父子通信，父传子用 props，子传父用 emit
2. **$emit / $on**：事件总线，跨组件通信（Vue3 已移除，需用第三方库）
3. **provide / inject**：祖先向后代传值
4. **$attrs**：批量接收父组件传过来但没在 props 声明的属性
5. **$refs**：获取子组件实例或 DOM 元素
6. **Pinia / Vuex**：跨组件共享状态
7. **localStorage / sessionStorage**：持久化数据

## v-if 和 v-show 有什么区别？

`v-if`：条件为 false 时元素不渲染（完全不创建），适合不频繁切换的场景。

`v-show`：始终渲染，只是 `display: none`，适合频繁切换。

## v-for 为什么要加 key？

diff 算法靠 key 唯一标识节点来判断复用。没有 key 或 key 不稳定会导致状态错乱，比如列表顺序变化时。

## computed 和 watch 的区别是什么？

`computed`：计算属性，基于响应式数据自动计算，有缓存，值不变不重算，适合派生数据。

`watch`：监听数据变化执行回调，没有缓存，适合异步操作或开销大的操作。

## Vue 的 nextTick 是什么？

DOM 更新是异步的，修改数据后视图不会立即更新。`nextTick` 的回调会在下次 DOM 更新完成后执行：

```javascript
this.message = 'updated';
this.$nextTick(() => {
  console.log(this.$refs.input.value); // 能拿到最新值
});
```

## Vue3 的 Composition API 是什么？

一种新的逻辑组织方式，把同一功能相关的代码放在一起，而不是散在 data/methods/computed 里：

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

`ref`：用于基本类型，访问时会自动解包，修改要用 `.value`；也可以包装对象。

`reactive`：用于对象/数组，直接访问属性，不需要 `.value`，但不能直接替换整个对象。

## Vue Router 有哪些导航守卫？

1. **全局**：`beforeEach`、`afterEach`、`beforeResolve`
2. **路由独享**：`beforeEnter`
3. **组件内**：`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`

## Vue Router 的 hash 和 history 模式有什么区别？

hash 模式：URL 带 `#`，如 `localhost:8080/#/home`，兼容性好，不依赖服务器配置。

history 模式：URL 正常，如 `localhost:8080/home`，需要服务器配置支持，否则刷新会 404。

## Pinia 相比 Vuex 有什么优势？

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

## Vue 项目有哪些性能优化手段？

1. 路由懒加载：`() => import('./views/Home.vue')`
2. 组件懒加载：非首屏组件用异步组件
3. keep-alive：缓存组件状态，避免重复渲染
4. 虚拟列表：长列表用 vue-virtual-scroller
5. 图片懒加载：v-lazy 或 IntersectionObserver
6. 减少响应式数据：不需要响应式的数据不要放 data
7. computed 缓存：模板里避免写复杂表达式
8. key 用稳定值：不要用 index 作为 key

## Vue 的单向数据流是什么？

数据只能从父组件流向子组件。子组件不能直接修改 props，需要修改的话通过 emit 触发父组件的方法。

## Vue3 的 teleport 是干什么的？

把组件的 DOM 移动到指定位置，常用于将弹窗放到 body 下：

```vue
<Teleport to="body">
  <div class="modal">弹窗内容</div>
</Teleport>
```

## mixin 有什么问题？Vue3 推荐用什么替代？

mixin 有三个明显问题：属性方法来源不清晰、可能有命名冲突、隐式依赖关系难维护。

Vue3 推荐用 <HoverComment text="composables" comment="组合式函数，将相关逻辑抽取到独立函数中，可复用、来源清晰。" /> 替代，逻辑来源清晰，也不存在命名冲突问题。
