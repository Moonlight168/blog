<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { NButton, NInput, NModal, NSpin, NTag, useMessage } from "naive-ui";
import { api } from "../api";
import { renderMarkdown } from "../markdown";

interface Commit { hash: string; date: string; subject: string; added: number; deleted: number }

const toast = useMessage();
const loading = ref(true);
const saving = ref(false);
const revising = ref(false);
const text = ref("");
/** 上次落盘的内容——用它判断「未保存」，比一个布尔标记可靠 */
const saved = ref("");
/** 载入时的文件 mtime；服务端用它识别「编辑期间被别处改过」 */
const baseMtime = ref<number | null>(null);
const filePath = ref("");
const versioned = ref(true);

/**
 * 回撤 / 前进用的版本栈。模型每次改写立即入栈；手动输入则等停手 800ms 再入栈，
 * 否则每敲一个字都会压一个版本，回撤一次只退一个字符。
 */
const versions = ref<string[]>([]);
const cursor = ref(-1);
let snapshotTimer = 0;

const dirty = computed(() => text.value !== saved.value);
const canUndo = computed(() => cursor.value > 0);
const canRedo = computed(() => cursor.value >= 0 && cursor.value < versions.value.length - 1);

function resetVersions(value: string) { versions.value = [value]; cursor.value = 0; }
function pushVersion(value: string) {
  if (versions.value[cursor.value] === value) return;
  versions.value = [...versions.value.slice(0, cursor.value + 1), value];
  cursor.value = versions.value.length - 1;
}
/** 点回撤/前进前先把还在防抖里的这次输入落栈，否则刚敲的字不在栈上，会「撤不动」 */
function flushVersion() { window.clearTimeout(snapshotTimer); pushVersion(text.value); }
function undo() { flushVersion(); if (canUndo.value) { cursor.value -= 1; text.value = versions.value[cursor.value]; } }
function redo() { flushVersion(); if (canRedo.value) { cursor.value += 1; text.value = versions.value[cursor.value]; } }
function onInput(event: Event) {
  text.value = (event.target as HTMLTextAreaElement).value;
  window.clearTimeout(snapshotTimer);
  snapshotTimer = window.setTimeout(() => pushVersion(text.value), 800);
}

async function load() {
  loading.value = true;
  try {
    const data = await api<{ path: string; markdown: string; mtime: number | null; versioned: boolean }>("/api/self-intro");
    text.value = data.markdown;
    saved.value = data.markdown;
    baseMtime.value = data.mtime;
    filePath.value = data.path;
    versioned.value = data.versioned;
    resetVersions(data.markdown);
  } catch (error) {
    toast.error((error as Error).message);
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    const data = await api<{ mtime: number; externallyChanged: boolean; notices: string[]; commit: { committed: boolean; hash?: string; reason?: string } }>(
      "/api/self-intro",
      { method: "POST", body: JSON.stringify({ markdown: text.value, baseMtime: baseMtime.value }) },
    );
    saved.value = text.value;
    baseMtime.value = data.mtime;
    toast.success(data.commit.committed ? `已保存并提交 ${data.commit.hash}` : "已保存");
    for (const notice of data.notices) toast.warning(notice);
  } catch (error) {
    toast.error((error as Error).message);
  } finally {
    saving.value = false;
  }
}

// 与面试台一致：Enter 发送指令，Shift+Enter 换行
const instruction = ref("");
const chatLog = ref<{ role: "user" | "assistant"; text: string }[]>([]);
const chatBox = ref<HTMLElement | null>(null);

async function revise() {
  const ask = instruction.value.trim();
  if (!ask || revising.value) return;
  chatLog.value.push({ role: "user", text: ask });
  instruction.value = "";
  revising.value = true;
  try {
    const data = await api<{ markdown: string }>("/api/self-intro/revise", {
      method: "POST",
      body: JSON.stringify({ markdown: text.value, instruction: ask }),
    });
    text.value = data.markdown;
    pushVersion(data.markdown);
    chatLog.value.push({ role: "assistant", text: "已按你的要求改好，预览在中间那栏。不满意就点「回撤」。" });
  } catch (error) {
    chatLog.value.push({ role: "assistant", text: `这次没改成：${(error as Error).message}` });
  } finally {
    revising.value = false;
    void Promise.resolve().then(() => chatBox.value?.scrollTo({ top: chatBox.value.scrollHeight }));
  }
}

const historyOpen = ref(false);
const commits = ref<Commit[]>([]);
const previewHash = ref("");
const previewText = ref("");
const historyLoading = ref(false);

async function openHistory() {
  historyOpen.value = true;
  previewHash.value = "";
  previewText.value = "";
  historyLoading.value = true;
  try {
    const data = await api<{ commits: Commit[] }>("/api/self-intro/history");
    commits.value = data.commits;
    if (commits.value[0]) await previewCommit(commits.value[0].hash);
  } catch (error) {
    toast.error((error as Error).message);
  } finally {
    historyLoading.value = false;
  }
}

async function previewCommit(hash: string) {
  previewHash.value = hash;
  try {
    const data = await api<{ markdown: string }>("/api/self-intro/history", { method: "POST", body: JSON.stringify({ hash }) });
    previewText.value = data.markdown;
  } catch (error) {
    toast.error((error as Error).message);
  }
}

async function rollback(hash: string) {
  try {
    const data = await api<{ markdown: string; mtime: number; commit: { committed: boolean; hash?: string } }>(
      "/api/self-intro/rollback",
      { method: "POST", body: JSON.stringify({ hash }) },
    );
    text.value = data.markdown;
    saved.value = data.markdown;
    baseMtime.value = data.mtime;
    pushVersion(data.markdown);
    historyOpen.value = false;
    toast.success(data.commit.committed ? `已回滚并提交 ${data.commit.hash}` : "已回滚");
  } catch (error) {
    toast.error((error as Error).message);
  }
}

onMounted(load);
onBeforeUnmount(() => window.clearTimeout(snapshotTimer));
// 有未保存改动时离开要拦一下：这个文件不在主仓库里，随手丢了不好找回来
onBeforeRouteLeave(() => (dirty.value ? window.confirm("自我介绍还有未保存的改动，确定离开吗？") : true));
</script>

<template>
  <div class="page selfintro">
    <div class="si-toolbar">
      <div class="si-tools">
        <n-button size="small" :disabled="!canUndo" @click="undo">← 回撤</n-button>
        <n-button size="small" :disabled="!canRedo" @click="redo">前进 →</n-button>
        <span class="si-count">版本 {{ cursor + 1 }}/{{ versions.length }}</span>
      </div>
      <div class="si-tools">
        <n-tag v-if="dirty" type="warning" size="small" round>未保存</n-tag>
        <n-tag v-else size="small" round>已保存</n-tag>
        <span class="si-count">{{ text.length }} 字</span>
        <n-button size="small" @click="openHistory">历史</n-button>
        <n-button size="small" type="primary" :loading="saving" :disabled="!dirty" @click="save">保存</n-button>
      </div>
    </div>

    <n-spin :show="loading">
      <div class="si-body">
        <section class="si-pane">
          <div class="si-pane-head">编辑</div>
          <textarea
            class="si-editor"
            :value="text"
            spellcheck="false"
            placeholder="在这里写自我介绍……"
            @input="onInput"
          />
        </section>

        <section class="si-pane">
          <div class="si-pane-head">预览</div>
          <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
          <div class="si-preview preview-body" v-html="renderMarkdown(text)" />
        </section>

        <aside class="si-pane si-chat-pane">
          <div class="si-pane-head">让模型改</div>
          <div ref="chatBox" class="si-chat">
            <p v-if="!chatLog.length" class="si-chat-hint">
              用一句话说怎么改，比如「FlowMind 那段再具体一点」「开场压缩到两句」「实习那段加上 SQL 脚本维护」。
            </p>
            <div v-for="(entry, index) in chatLog" :key="index" class="si-chat-item" :class="entry.role">
              <span class="si-chat-who">{{ entry.role === "user" ? "我" : "AI" }}</span>
              <span>{{ entry.text }}</span>
            </div>
          </div>
          <div class="si-chat-box">
            <n-input
              v-model:value="instruction"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="Enter 发送，Shift+Enter 换行"
              :disabled="revising"
              @keydown.enter.exact.prevent="revise"
            />
            <n-button size="small" type="primary" :loading="revising" :disabled="!instruction.trim()" @click="revise">发送</n-button>
          </div>
        </aside>
      </div>
    </n-spin>

    <p class="si-path muted">
      {{ filePath }}<span v-if="!versioned">（这个文件不在 git 仓库里，保存不会留版本）</span>
    </p>

    <n-modal v-model:show="historyOpen" preset="card" style="width: 1000px; max-width: 94vw" title="历史版本">
      <n-spin :show="historyLoading">
        <div class="si-history">
          <div class="si-history-list">
            <button
              v-for="commit in commits"
              :key="commit.hash"
              class="si-commit"
              :class="{ active: commit.hash === previewHash }"
              @click="previewCommit(commit.hash)"
            >
              <strong>{{ commit.subject }}</strong>
              <span class="si-commit-meta">{{ commit.date.slice(0, 16).replace("T", " ") }} · {{ commit.hash.slice(0, 7) }} · +{{ commit.added }}/-{{ commit.deleted }}</span>
            </button>
            <p v-if="!historyLoading && !commits.length" class="muted">还没有任何提交。</p>
          </div>
          <div class="si-history-preview">
            <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
            <div class="preview-body" v-html="renderMarkdown(previewText)" />
            <div v-if="previewHash" class="si-history-actions">
              <n-button size="small" type="primary" @click="rollback(previewHash)">回滚到这一版</n-button>
              <span class="si-count">回滚会新增一次提交，历史不会丢</span>
            </div>
          </div>
        </div>
      </n-spin>
    </n-modal>
  </div>
</template>
