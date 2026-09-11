<script setup lang="ts">
import { NConfigProvider, NMessageProvider, zhCN, dateZhCN } from "naive-ui";
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <div class="shell">
        <header class="topbar">
          <router-link class="brand" to="/">
            <span class="brand-mark">I</span>
            <span><strong>面试演练台</strong><small>把每次回答变成长期积累</small></span>
          </router-link>
          <nav><router-link to="/">开始面试</router-link><router-link to="/history">面试历史</router-link></nav>
        </header>
        <main><router-view /></main>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
