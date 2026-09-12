<script setup lang="ts">
import { NConfigProvider, NMessageProvider, zhCN, dateZhCN, type GlobalThemeOverrides } from "naive-ui";

/**
 * naive-ui 默认主色是绿色 #18a058，与应用配色（深青 + 金 + 墨）不符。
 * 主色会决定：输入光标、primary 按钮、输入框聚焦边框、下拉选中项等。
 */
const INK_TEAL = "#173f36";
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: INK_TEAL,
    primaryColorHover: "#1f5548",
    primaryColorPressed: "#0f2d27",
    primaryColorSuppl: "#1f5548",
  },
  // 光标默认取主色，这里显式写一遍，避免将来换主题时又偏色
  Input: { caretColor: INK_TEAL },
};
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <n-message-provider>
      <div class="shell">
        <header class="topbar">
          <router-link class="brand" to="/">
            <span class="brand-mark">I</span>
            <span><strong>面试演练台</strong><small>把每次回答变成长期积累</small></span>
          </router-link>
          <nav><router-link to="/">开始面试</router-link><router-link to="/history">面试历史</router-link><router-link to="/review">复习</router-link><router-link to="/retrieval">检索预览</router-link></nav>
        </header>
        <main><router-view /></main>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
