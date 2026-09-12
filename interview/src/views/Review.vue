<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { NButton, NEmpty, NInputNumber, NSelect, NSpin, NTag, useMessage } from "naive-ui";
import MarkdownIt from "markdown-it";
import { api } from "../api";
import type { Chapter, TopicSeries } from "../types";

interface ReviewQuestion { id: string; title: string; answer: string; historyUrl: string | null }
interface HistoryEntry { date: string; answer: string }

/** html:false 会把原始 HTML 转义，javascript: 伪协议也不会被渲染成链接，可安全用于 v-html */
const markdown = new MarkdownIt({ html: false, linkify: false });

const message = useMessage();
const topics = ref<TopicSeries[]>([]);
const series = ref("");
const chapterPath = ref("");
const count = ref(10);
const loading = ref(false);
const questions = ref<ReviewQuestion[]>([]);
const docsBaseUrl = ref("");

const answerOpenIds = ref<string[]>([]);
const historyOpenIds = ref<string[]>([]);
const historyCache = ref<Record<string, HistoryEntry[]>>({});
const historyLoadingId = ref("");

const chapters = computed<Chapter[]>(() => topics.value.find((item) => item.name === series.value)?.chapters ?? []);

/** 复习的选择持久化：下次打开还是上次挑的那一章、那个数量 */
interface ReviewPrefs { series?: string; chapterPath?: string; count?: number }
const PREFS_KEY = "review-setup";
function loadPrefs(): ReviewPrefs {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") as ReviewPrefs; }
  catch { return {}; }
}
watch([series, chapterPath, count], () => {
  const prefs: ReviewPrefs = { series: series.value, chapterPath: chapterPath.value, count: count.value };
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
});

onMounted(async () => {
  try {
    const data = await api<{ topics: TopicSeries[]; docsBaseUrl: string }>("/api/bootstrap");
    topics.value = data.topics;
    docsBaseUrl.value = data.docsBaseUrl;

    // 恢复上次的选择；分类或章节已不存在时退回第一项
    const prefs = loadPrefs();
    series.value = topics.value.some((item) => item.name === prefs.series)
      ? (prefs.series ?? "")
      : (topics.value[0]?.name ?? "");
    chapterPath.value = chapters.value.some((item) => item.path === prefs.chapterPath)
      ? (prefs.chapterPath ?? "")
      : (chapters.value[0]?.path ?? "");
    if (prefs.count) count.value = Math.min(50, Math.max(1, Number(prefs.count)));
  } catch (error) {
    message.error(error instanceof Error ? error.message : "读取题库失败");
  }
});

function changeSeries() {
  chapterPath.value = chapters.value[0]?.path ?? "";
}

async function draw() {
  if (!chapterPath.value) return message.warning("请先选择章节");
  loading.value = true;
  try {
    const data = await api<{ questions: ReviewQuestion[] }>("/api/review/questions", {
      method: "POST",
      body: JSON.stringify({ chapterPath: chapterPath.value, count: count.value }),
    });
    questions.value = data.questions;
    answerOpenIds.value = [];
    historyOpenIds.value = [];
    historyCache.value = {};
  } catch (error) {
    message.error(error instanceof Error ? error.message : "抽题失败");
  } finally {
    loading.value = false;
  }
}

function toggleAnswer(id: string) {
  answerOpenIds.value = answerOpenIds.value.includes(id)
    ? answerOpenIds.value.filter((item) => item !== id)
    : [...answerOpenIds.value, id];
}

async function toggleHistory(question: ReviewQuestion) {
  if (historyOpenIds.value.includes(question.id)) {
    historyOpenIds.value = historyOpenIds.value.filter((item) => item !== question.id);
    return;
  }
  if (historyCache.value[question.id]) {
    historyOpenIds.value = [...historyOpenIds.value, question.id];
    return;
  }
  historyLoadingId.value = question.id;
  try {
    const data = await api<{ entries: HistoryEntry[] }>("/api/review/history", {
      method: "POST",
      body: JSON.stringify({ chapterPath: chapterPath.value, title: question.title }),
    });
    historyCache.value = { ...historyCache.value, [question.id]: data.entries };
    historyOpenIds.value = [...historyOpenIds.value, question.id];
  } catch (error) {
    message.error(error instanceof Error ? error.message : "读取答题历史失败");
  } finally {
    historyLoadingId.value = "";
  }
}

function renderMarkdown(text: string) {
  return markdown.render(text);
}

/** 题里的历史链接是文档站路径（.md），VuePress 实际渲染成 .html，这里做同样转换。 */
function historyLink(url: string | null) {
  if (!url) return "";
  return `${docsBaseUrl.value}${url.replace(/\.md(?=#|$)/, ".html")}`;
}
</script>

<template>
  <section class="page">
    <div class="page-title">
      <div>
        <div class="eyebrow">REVIEW DRILL</div>
        <h1>复习</h1>
        <p class="muted">从题库里随机抽题，看题目、标准答案和自己的历次回答。不调用任何模型，不花 token。</p>
      </div>
    </div>

    <div class="review-bar">
      <n-select v-model:value="series" :options="topics.map(t => ({ label: t.name, value: t.name }))" @update:value="changeSeries" />
      <n-select v-model:value="chapterPath" filterable :options="chapters.map(c => ({ label: c.name, value: c.path }))" />
      <n-input-number v-model:value="count" :min="1" :max="50" />
      <n-button type="primary" :loading="loading" @click="draw">抽题</n-button>
    </div>

    <n-spin :show="loading">
      <div v-if="questions.length" class="review-list">
        <article v-for="(question, index) in questions" :key="question.id" class="review-card">
          <header class="review-head">
            <span class="review-index">{{ index + 1 }} / {{ questions.length }}</span>
            <h3>{{ question.title }}</h3>
            <div class="review-tools">
              <n-button size="tiny" :loading="historyLoadingId === question.id" @click="toggleHistory(question)">
                {{ historyOpenIds.includes(question.id) ? "收起历史" : "看历史" }}
              </n-button>
              <n-button size="tiny" :type="answerOpenIds.includes(question.id) ? 'default' : 'primary'" @click="toggleAnswer(question.id)">
                {{ answerOpenIds.includes(question.id) ? "收起答案" : "看答案" }}
              </n-button>
            </div>
          </header>

          <div v-if="historyOpenIds.includes(question.id)" class="review-history">
            <template v-if="historyCache[question.id]?.length">
              <div v-for="(entry, entryIndex) in historyCache[question.id]" :key="`${entry.date}-${entryIndex}`" class="history-entry">
                <n-tag size="tiny">{{ entry.date }}</n-tag>
                <span :class="{ 'history-blank': !entry.answer }">{{ entry.answer || "（本次未记录内容）" }}</span>
              </div>
              <a v-if="question.historyUrl" class="review-link" :href="historyLink(question.historyUrl)" target="_blank" rel="noreferrer">在文档站查看</a>
            </template>
            <p v-else class="muted history-empty">这道题还没有回答记录。</p>
          </div>

          <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
          <div v-if="answerOpenIds.includes(question.id)" class="review-answer" v-html="renderMarkdown(question.answer)" />
        </article>
      </div>
      <n-empty v-else-if="!loading" description="选好章节后点「抽题」" />
    </n-spin>
  </section>
</template>
