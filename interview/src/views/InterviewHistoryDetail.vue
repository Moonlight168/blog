<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { NButton, NSpin, useMessage } from "naive-ui";
import MarkdownIt from "markdown-it";
import { api } from "../api";
import { durationLabel, resumeLabel, statLabel, timeLabel, topicLabel } from "../format";
import type { Message, Session } from "../types";

const route = useRoute(); const loading = ref(true);
const message = useMessage();
const refilingId = ref<number | null>(null);
/** 总评是三行固定格式，breaks:true 让单换行也生效；html:false 已转义原始 HTML */
const markdown = new MarkdownIt({ html: false, linkify: false, breaks: true });
interface Attempt {
  id: number; questionTitle: string; rawAnswer: string;
  evaluation: { score: number; comment: string };
  historyUrl: string | null; sourcePath: string | null; knowledgeUrl: string | null;
}
const detail = ref<{
  session: Session; messages: Message[]; attempts: Attempt[];
  docsBaseUrl: string; questionCount: number; archivedCount: number; averageScore: number | null;
}>();

/** 补录这道题进知识库（归档时被跳过的题）。 */
async function refile(attempt: Attempt) {
  const current = detail.value;
  if (!current) return;
  refilingId.value = attempt.id;
  try {
    const data = await api<{ historyUrl: string; sourcePath: string }>(
      `/api/history/${route.params.id}/attempts/${attempt.id}/refile`, { method: "POST" });
    const attempts = current.attempts.map((item) =>
      (item.id === attempt.id ? { ...item, historyUrl: data.historyUrl, sourcePath: data.sourcePath } : item));
    detail.value = {
      ...current, attempts,
      archivedCount: new Set(attempts.filter((item) => item.historyUrl).map((item) => item.questionTitle)).size,
    };
    message.success("已补录进知识库");
  } catch (error) {
    message.error(error instanceof Error ? error.message : "补录失败");
  } finally { refilingId.value = null; }
}
// 结束时生成的总评存在消息里，之前拿回来了却没渲染
const summary = computed(() => detail.value?.messages.find((message) => message.kind === "summary")?.content ?? "");

/** 题里的链接写的是文档站路径（.md），VuePress 实际渲染成 .html */
function docsLink(url: string | null) {
  const base = detail.value?.docsBaseUrl;
  return url && base ? `${base}${url.replace(/\.md(?=#|$)/, ".html")}` : "";
}
/** 服务端已经拼好带锚点的相对 URL（/series/knowledge/…​.html#锚点），这里只补基址 */
function knowledgeLink(url: string | null) {
  const base = detail.value?.docsBaseUrl;
  return url && base ? `${base}${url}` : "";
}

onMounted(async () => { try { detail.value = await api(`/api/history/${route.params.id}`); } finally { loading.value = false; } });
</script>

<template>
  <section class="page detail-page"><router-link to="/history"><n-button quaternary>← 返回历史</n-button></router-link>
    <n-spin :show="loading"><template v-if="detail">
      <div class="detail-hero">
        <div>
          <div class="eyebrow">INTERVIEW REVIEW</div>
          <h1>{{ topicLabel(detail.session.series, detail.session.chapterPath) }}</h1>
          <p>
            {{ resumeLabel(detail.session.resumePath) }}<span v-if="detail.session.durationMinutes"> · {{ durationLabel(detail.session.durationMinutes) }}</span>
            · {{ timeLabel(detail.session.startedAt) }}
          </p>
        </div>
        <span class="hero-stat">{{ statLabel(detail.averageScore, detail.questionCount, detail.archivedCount) }}</span>
      </div>
      <section v-if="summary" class="review-summary">
        <span class="message-label">本场总评</span>
        <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
        <div class="summary-body" v-html="markdown.render(summary)" />
      </section>
      <div class="attempts">
        <article v-for="(attempt, index) in detail.attempts" :key="index" class="attempt-card">
          <div class="score">{{ attempt.evaluation.score }}<small>/100</small></div>
          <div>
            <div class="attempt-head">
              <span class="message-label">问题 {{ index + 1 }}</span>
              <div class="attempt-links">
                <template v-if="attempt.historyUrl || attempt.sourcePath">
                  <a v-if="attempt.historyUrl" class="review-link" :href="docsLink(attempt.historyUrl)" target="_blank" rel="noreferrer">答题历史</a>
                  <a v-if="attempt.knowledgeUrl" class="review-link" :href="knowledgeLink(attempt.knowledgeUrl)" target="_blank" rel="noreferrer">知识库</a>
                </template>
                <template v-else>
                  <span class="attempt-unfiled">这题未进知识库</span>
                  <n-button size="tiny" :loading="refilingId === attempt.id" @click="refile(attempt)">再次归档</n-button>
                </template>
              </div>
            </div>
            <h3>{{ attempt.questionTitle }}</h3>
            <h4>我的回答</h4><p>{{ attempt.rawAnswer }}</p>
            <h4>面试官点评</h4>
            <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
            <div class="attempt-comment" v-html="markdown.render(attempt.evaluation.comment)" />
          </div>
        </article>
      </div>
    </template></n-spin>
  </section>
</template>
