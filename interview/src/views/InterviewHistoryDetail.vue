<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { NButton, NSpin, NTag } from "naive-ui";
import { api } from "../api";
import type { Message, Session } from "../types";

const route = useRoute(); const loading = ref(true);
const detail = ref<{ session: Session; messages: Message[]; attempts: { questionTitle: string; rawAnswer: string; evaluation: { score: number; comment: string } }[] }>();
onMounted(async () => { try { detail.value = await api(`/api/history/${route.params.id}`); } finally { loading.value = false; } });
</script>

<template>
  <section class="page detail-page"><router-link to="/history"><n-button quaternary>← 返回历史</n-button></router-link>
    <n-spin :show="loading"><template v-if="detail">
      <div class="detail-hero"><div><div class="eyebrow">INTERVIEW REVIEW</div><h1>{{ detail.session.series }}</h1><p>{{ detail.session.chapterPath }}</p></div><n-tag>{{ detail.session.completedCount }} 道已点评</n-tag></div>
      <div class="attempts">
        <article v-for="(attempt, index) in detail.attempts" :key="index" class="attempt-card">
          <div class="score">{{ attempt.evaluation.score }}<small>/100</small></div>
          <div><span class="message-label">问题 {{ index + 1 }}</span><h3>{{ attempt.questionTitle }}</h3><h4>我的回答</h4><p>{{ attempt.rawAnswer }}</p><h4>面试官点评</h4><p>{{ attempt.evaluation.comment }}</p></div>
        </article>
      </div>
    </template></n-spin>
  </section>
</template>
