<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NButton, NEmpty, NSpin, NTag, useMessage } from "naive-ui";
import { api } from "../api";
import { renderMarkdown } from "../lib/markdown";
import { API } from "../../shared/routes.ts";

interface File { name: string; markdown: string }
interface Detail {
  id: string; company: string; role: string; startedAt: string;
  fileCount: number; files: File[]; docsBaseUrl: string;
}

const route = useRoute();
const router = useRouter();
const toast = useMessage();
const loading = ref(true);
const detail = ref<Detail | null>(null);
const active = ref("");

async function load() {
  loading.value = true;
  try {
    const data = await api<Detail>(API.realInterview(String(route.params.id ?? "")));
    detail.value = data;
    active.value = data.files[0]?.name ?? "";
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "打不开这场记录");
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

const current = computed(() => detail.value?.files.find((file) => file.name === active.value) ?? null);

/**
 * 题块里的「→ 宝典：…」链接写的是站点根路径（/series/knowledge/…），
 * 那是博客的地址；本 app 在另一个端口，得补上博客基址才点得开。
 */
const rendered = computed(() => {
  const markdown = current.value?.markdown ?? "";
  const base = detail.value?.docsBaseUrl ?? "";
  return renderMarkdown(base ? markdown.replace(/\]\(\/series\//g, `](${base}/series/`) : markdown);
});

onMounted(load);
</script>

<template>
  <section class="page">
    <div class="page-title">
      <div>
        <n-button size="small" quaternary @click="router.back()">← 返回</n-button>
        <h1>{{ detail ? `${detail.company}${detail.role ? ` · ${detail.role}` : ""}` : "真实面试" }}</h1>
        <p class="muted">
          <n-tag size="small" type="warning">真实面试</n-tag>
          <span v-if="detail?.startedAt"> · {{ detail.startedAt }}</span>
          <span v-if="detail"> · {{ detail.fileCount }} 份材料</span>
        </p>
      </div>
    </div>

    <n-spin :show="loading">
      <template v-if="detail">
        <div class="real-tabs">
          <button
            v-for="file in detail.files"
            :key="file.name"
            class="real-tab"
            :class="{ active: file.name === active }"
            @click="active = file.name"
          >{{ file.name }}</button>
        </div>
        <article v-if="current" class="real-body">
          <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
          <div class="preview-body" v-html="rendered" />
        </article>
      </template>
      <n-empty v-else-if="!loading" description="没有这场记录" />
    </n-spin>
  </section>
</template>
