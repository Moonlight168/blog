<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { NButton, NDatePicker, NEmpty, NSelect, NSpin, NTag } from "naive-ui";
import { api } from "../api";
import { SCORE_BANDS, durationLabel, personLabel, resumeLabel, statLabel, timeLabel, topicLabel } from "../format";

interface Row {
  id: string; series: string; chapterPath: string; resumePath: string; mode: string; status: string;
  startedAt: string; durationMinutes: number; completedCount: number;
  questionCount: number; archivedCount: number; averageScore: number | null;
}

/** 筛选条件持久化，下次打开还是上次筛的那一档 */
interface Filters { series: string; person: string; status: string; range: [number, number] | null }
const FILTERS_KEY = "history-filters";
function loadFilters(): Partial<Filters> {
  try { return JSON.parse(localStorage.getItem(FILTERS_KEY) ?? "{}") as Partial<Filters>; }
  catch { return {}; }
}

const saved = loadFilters();
const rows = ref<Row[]>([]); const loading = ref(true);
const seriesFilter = ref(saved.series ?? "");
const personFilter = ref(saved.person ?? "");
const statusFilter = ref(saved.status ?? "");
const rangeFilter = ref<[number, number] | null>(saved.range ?? null);

watch([seriesFilter, personFilter, statusFilter, rangeFilter], () => {
  const filters: Filters = {
    series: seriesFilter.value, person: personFilter.value,
    status: statusFilter.value, range: rangeFilter.value,
  };
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}, { deep: true });

onMounted(async () => {
  try { rows.value = await api<Row[]>("/api/history"); } finally { loading.value = false; }
  // 上次筛的分类/人员可能已经没有对应记录了，落回「全部」免得出现空列表
  if (seriesFilter.value && !rows.value.some((row) => row.series === seriesFilter.value)) seriesFilter.value = "";
  if (personFilter.value && !rows.value.some((row) => personLabel(row.resumePath) === personFilter.value)) personFilter.value = "";
});

const seriesOptions = computed(() => [
  { label: "全部分类", value: "" },
  ...[...new Set(rows.value.map((row) => row.series))].map((name) => ({ label: name, value: name })),
]);
const personOptions = computed(() => [
  { label: "全部人员", value: "" },
  ...[...new Set(rows.value.map((row) => personLabel(row.resumePath)).filter(Boolean))].map((name) => ({ label: name, value: name })),
]);
const STATUS_OPTIONS = [
  { label: "全部状态", value: "" },
  { label: "已结束", value: "completed" },
  { label: "进行中", value: "active" },
];

const visible = computed(() => rows.value.filter((row) => {
  if (seriesFilter.value && row.series !== seriesFilter.value) return false;
  if (personFilter.value && personLabel(row.resumePath) !== personFilter.value) return false;
  if (statusFilter.value && row.status !== statusFilter.value) return false;
  if (rangeFilter.value) {
    const at = new Date(row.startedAt).getTime();
    const [from, to] = rangeFilter.value;
    // 区间选到某天时，那天 23:59 之前的记录都算在范围内
    if (at < from || at > to + 86_400_000 - 1) return false;
  }
  return true;
}));

const filtering = computed(() => Boolean(
  seriesFilter.value || personFilter.value || statusFilter.value || rangeFilter.value));

const showGuide = ref(false);

function resetFilters() {
  seriesFilter.value = ""; personFilter.value = ""; statusFilter.value = ""; rangeFilter.value = null;
}
</script>

<template>
  <section class="page">
    <div class="page-title">
      <div><div class="eyebrow">SESSION ARCHIVE</div><h1>面试历史</h1></div>
      <router-link to="/"><n-button type="primary">开始新面试</n-button></router-link>
    </div>

    <div class="page-sub">
      <p class="muted">回看问题、原始回答和逐题点评。</p>
      <button class="score-guide-toggle" @click="showGuide = !showGuide">
        <span class="eyebrow">评分标准</span>
        <span>每题 0–100 分{{ showGuide ? "，收起" : "，展开" }}</span>
      </button>
    </div>

    <div v-if="showGuide" class="score-guide-card">
      <table class="score-guide-table">
        <tbody>
          <tr v-for="band in SCORE_BANDS" :key="band.range">
            <td class="score-range">{{ band.range }}</td>
            <td><strong>{{ band.label }}</strong>：{{ band.hint }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="rows.length" class="history-filters">
      <n-select v-model:value="seriesFilter" class="filter-series" :options="seriesOptions" />
      <n-select v-model:value="personFilter" class="filter-person" :options="personOptions" />
      <n-select v-model:value="statusFilter" class="filter-status" :options="STATUS_OPTIONS" />
      <n-date-picker v-model:value="rangeFilter" class="filter-range" type="daterange" clearable
        start-placeholder="起始日期" end-placeholder="结束日期" />
      <n-button :disabled="!filtering" @click="resetFilters">重置</n-button>
      <span class="history-count">{{ visible.length }} / {{ rows.length }} 场</span>
    </div>

    <n-spin :show="loading">
      <div v-if="visible.length" class="history-grid">
        <router-link v-for="row in visible" :key="row.id" :to="`/history/${row.id}`" class="history-card">
          <div class="history-top">
            <n-tag size="small" :type="row.status === 'active' ? 'success' : 'default'">{{ row.status === 'active' ? '进行中' : '已结束' }}</n-tag>
            <span>{{ timeLabel(row.startedAt) }}</span>
          </div>
          <h3>{{ topicLabel(row.series, row.chapterPath) }}</h3>
          <p>{{ resumeLabel(row.resumePath) }}<span v-if="row.durationMinutes"> · {{ durationLabel(row.durationMinutes) }}</span></p>
          <strong>{{ statLabel(row.averageScore, row.questionCount, row.archivedCount) }}</strong>
        </router-link>
      </div>
      <n-empty v-else-if="!loading" :description="filtering ? '没有符合筛选条件的面试' : '还没有面试记录'" />
    </n-spin>
  </section>
</template>
