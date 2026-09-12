<script setup lang="ts">
import { onMounted, ref } from "vue";
import { NAlert, NButton, NEmpty, NInput, NPopconfirm, NSpin, NTag, useMessage } from "naive-ui";
import { api } from "../api";

interface Hit {
  id: string; title: string; normalized_title: string; source_path: string;
  history_url?: string; channel?: string; score?: number;
}
interface FusedHit extends Hit { rrfScore: number; channels: string[] }
interface SearchResult {
  query: string; normalizedTitle: string; embeddingEnabled: boolean; embeddingModel: string | null;
  channels: { exact: Hit[]; keyword: Hit[]; semantic: Hit[] };
  errors: { keyword: string | null; semantic: string | null };
  fused: FusedHit[];
}
interface RefreshResult {
  total: number; changed: number; embedded: number; embeddingError: string | null;
  embeddingEnabled: boolean; embeddingModel: string | null;
}

const CHANNEL_LABEL: Record<string, string> = { exact: "精确匹配", keyword: "关键词匹配", semantic: "向量检索" };

const message = useMessage();
const query = ref("");
const loading = ref(false);
const refreshing = ref(false);
const result = ref<SearchResult | null>(null);
const embeddingEnabled = ref(false);
const embeddingModel = ref<string | null>(null);

onMounted(async () => {
  try {
    const data = await api<{ embeddingEnabled: boolean; embeddingModel: string | null }>("/api/bootstrap");
    embeddingEnabled.value = data.embeddingEnabled;
    embeddingModel.value = data.embeddingModel;
  } catch (error) {
    message.error(error instanceof Error ? error.message : "读取索引状态失败");
  }
});

async function runSearch() {
  const text = query.value.trim();
  if (!text) return message.warning("请先输入要检索的内容");
  loading.value = true;
  try {
    const data = await api<SearchResult>("/api/retrieval/preview", {
      method: "POST",
      body: JSON.stringify({ query: text, topK: 5 }),
    });
    result.value = data;
    embeddingEnabled.value = data.embeddingEnabled;
    embeddingModel.value = data.embeddingModel;
  } catch (error) {
    message.error(error instanceof Error ? error.message : "检索失败");
  } finally {
    loading.value = false;
  }
}

async function manualRefresh(force: boolean) {
  refreshing.value = true;
  try {
    const data = await api<RefreshResult>("/api/index/refresh", {
      method: "POST",
      body: JSON.stringify(force ? { force: true } : {}),
    });
    embeddingEnabled.value = data.embeddingEnabled;
    embeddingModel.value = data.embeddingModel;
    if (data.embeddingError) {
      message.error(`嵌入失败：${data.embeddingError}`);
    } else {
      message.success(`共 ${data.total} 题，本次更新 ${data.changed} 题，写入向量 ${data.embedded} 条`);
    }
    // 仅在已经展示过检索结果时才顺带刷新，避免没输查询词却弹出「请先输入」提示
    if (result.value && query.value.trim()) await runSearch();
  } catch (error) {
    message.error(error instanceof Error ? error.message : "刷新失败");
  } finally {
    refreshing.value = false;
  }
}

function shortPath(value: string) {
  return value.split(/[\\/]/).slice(-2).join("/");
}
</script>

<template>
  <section class="page">
    <div class="page-title">
      <div>
        <div class="eyebrow">RETRIEVAL PLAYGROUND</div>
        <h1>检索预览</h1>
        <p class="muted">输入一个题目，看三条检索通道各召回了什么、融合后谁排在前面。用于验证向量检索是否真的起作用。</p>
      </div>
    </div>

    <n-alert :show-icon="false" :type="embeddingEnabled ? 'success' : 'info'">
      <template v-if="embeddingEnabled">向量检索已启用 · {{ embeddingModel || "未命名模型" }}</template>
      <template v-else>向量检索未启用（只走精确匹配 + 关键词匹配）</template>
    </n-alert>

    <div class="inline retrieval-bar">
      <n-input v-model:value="query" placeholder="例如：HashMap 的底层原理是什么？" @keyup.enter="runSearch" />
      <n-button type="primary" :loading="loading" @click="runSearch">检索</n-button>
    </div>

    <div class="retrieval-actions">
      <n-button size="small" :loading="refreshing" @click="manualRefresh(false)">手动触发嵌入</n-button>
      <n-popconfirm @positive-click="manualRefresh(true)">
        <template #trigger>
          <n-button size="small" :loading="refreshing">强制重算全部向量</n-button>
        </template>
        <div class="confirm-body">
          <p>会把<strong>全部向量先清空</strong>再逐条重算（当前约数百题，需要多次请求）。</p>
          <p>若中途失败（API 报错、额度用尽），会留下「一部分题有向量、一部分没有」的中间态，检索会静默退化。</p>
          <p>平时不需要点它——新增/修改题目都会自动增量嵌入，换模型也会自动全量重算。确定继续？</p>
        </div>
      </n-popconfirm>
    </div>

    <n-spin :show="loading">
      <template v-if="result">
        <div class="channel-grid">
          <div v-for="key in (['exact', 'keyword', 'semantic'] as const)" :key="key" class="channel-col">
            <div class="channel-head">
              <strong>{{ CHANNEL_LABEL[key] }}</strong>
              <n-tag size="small">{{ result.channels[key].length }}</n-tag>
            </div>
            <ol v-if="result.channels[key].length" class="hit-list">
              <li v-for="hit in result.channels[key]" :key="`${key}-${hit.id}`">
                <span class="hit-title">{{ hit.title }}</span>
                <span v-if="hit.score !== undefined" class="hit-score">{{ hit.score.toFixed(4) }}</span>
                <span class="hit-path">{{ shortPath(hit.source_path) }}</span>
              </li>
            </ol>
            <p v-else class="muted channel-empty">无召回</p>
          </div>
        </div>

        <h2 class="retrieval-h2">融合结果（RRF）</h2>
        <ol v-if="result.fused.length" class="fused-list">
          <li v-for="(hit, index) in result.fused" :key="hit.id">
            <span class="fused-rank">{{ index + 1 }}</span>
            <div>
              <div class="hit-title">{{ hit.title }}</div>
              <div class="fused-meta">
                <n-tag v-for="channel in hit.channels" :key="channel" size="tiny">{{ CHANNEL_LABEL[channel] }}</n-tag>
                <span class="hit-score">RRF {{ hit.rrfScore.toFixed(4) }}</span>
                <span class="hit-path">{{ shortPath(hit.source_path) }}</span>
              </div>
            </div>
          </li>
        </ol>
        <n-empty v-else description="没有召回任何题目" />
      </template>
      <n-empty v-else-if="!loading" description="输入一个题目后点「检索」" />
    </n-spin>
  </section>
</template>
