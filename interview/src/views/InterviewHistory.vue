<script setup lang="ts">
import { onMounted, ref } from "vue";
import { NButton, NEmpty, NSpin, NTag } from "naive-ui";
import { api } from "../api";

interface Row { id: string; series: string; chapterPath: string; mode: string; status: string; startedAt: string; completedCount: number }
const rows = ref<Row[]>([]); const loading = ref(true);
onMounted(async () => { try { rows.value = await api<Row[]>("/api/history"); } finally { loading.value = false; } });
</script>

<template>
  <section class="page">
    <div class="page-title"><div><div class="eyebrow">SESSION ARCHIVE</div><h1>面试历史</h1><p class="muted">回看问题、原始回答和逐题点评。</p></div><router-link to="/"><n-button type="primary">开始新面试</n-button></router-link></div>
    <n-spin :show="loading">
      <div v-if="rows.length" class="history-grid">
        <router-link v-for="row in rows" :key="row.id" :to="`/history/${row.id}`" class="history-card">
          <div class="history-top"><n-tag size="small" :type="row.status === 'active' ? 'success' : 'default'">{{ row.status === 'active' ? '进行中' : '已结束' }}</n-tag><span>{{ new Date(row.startedAt).toLocaleString('zh-CN') }}</span></div>
          <h3>{{ row.series }}</h3><p>{{ row.chapterPath }}</p><strong>{{ row.completedCount }} 道已点评</strong>
        </router-link>
      </div>
      <n-empty v-else-if="!loading" description="还没有面试记录" />
    </n-spin>
  </section>
</template>
