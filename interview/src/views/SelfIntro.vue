<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { NButton, NInput, NModal, NSelect, NSpin, NTag, useMessage } from "naive-ui";
import { api } from "../api";
import { renderMarkdown } from "../markdown";

/** version/title/points/dateText 都由服务端从提交信息里拆好（见 server/commit-subject.mjs） */
interface Commit {
  hash: string; date: string; subject: string; added: number; deleted: number;
  version: string; title: string; points: string[]; dateText: string; dateFull: string;
}
interface IntroFile { file: string; name: string }

/** 面试页的预览弹窗也读这个键，两处看的是同一份 */
const STORAGE_KEY = "self-intro-file";

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
/** 目录下的全部自我介绍，以及在编辑的这一份 */
const files = ref<IntroFile[]>([]);
const currentFile = ref("");

/**
 * 回撤 / 前进用的版本栈。模型改写、历史回滚都立即入栈；
 * 手动输入则等停手 800ms 再入栈，否则每敲一个字都压一个版本，回撤一次只退一个字符。
 */
const versions = ref<string[]>([]);
const cursor = ref(-1);
let snapshotTimer = 0;

/** 预览栏是否切到编辑态——同一个栏位，不再并排摆两拦 */
const editing = ref(false);

const dirty = computed(() => text.value !== saved.value);
const canUndo = computed(() => cursor.value > 0);
const canRedo = computed(() => cursor.value >= 0 && cursor.value < versions.value.length - 1);

function resetVersions(value: string) { versions.value = [value]; cursor.value = 0; }
function pushVersion(value: string) {
  if (versions.value[cursor.value] === value) return;
  versions.value = [...versions.value.slice(0, cursor.value + 1), value];
  cursor.value = versions.value.length - 1;
}
/** 切模式或点回撤前，先把还在防抖里的这次输入落栈，否则刚敲的字不在栈上，会「撤不动」 */
function flushVersion() { window.clearTimeout(snapshotTimer); pushVersion(text.value); }
function undo() { flushVersion(); if (canUndo.value) { cursor.value -= 1; text.value = versions.value[cursor.value]; } }
function redo() { flushVersion(); if (canRedo.value) { cursor.value += 1; text.value = versions.value[cursor.value]; } }
function onInput(event: Event) {
  text.value = (event.target as HTMLTextAreaElement).value;
  window.clearTimeout(snapshotTimer);
  snapshotTimer = window.setTimeout(() => pushVersion(text.value), 800);
}
/**
 * 没有未保存改动时，把文件重新读一遍。两处需要它：
 *
 * - **切到预览之前**：否则显示的是内存里那份，外部改过也看不到
 * - **让 AI 改之前**（更要紧）：模型基于陈旧内容改写，结果一保存就把外面的改动
 *   覆盖掉，而人完全不会察觉
 *
 * 有未保存改动时不读——那才是他正在编辑、正要保存的东西。
 */
async function syncFromDisk() {
  if (dirty.value || !currentFile.value) return false;
  const latest = await api<{ markdown: string; mtime: number | null }>(
    `/api/self-intro?file=${encodeURIComponent(currentFile.value)}`,
  );
  if (latest.mtime === baseMtime.value) return false;
  text.value = latest.markdown;
  saved.value = latest.markdown;
  baseMtime.value = latest.mtime;
  resetVersions(latest.markdown);
  toast.info("文件在外部被改过，已重新载入");
  return true;
}

async function toggleEditing() {
  // 切到预览前先对齐磁盘：预览是给人看"现在文件长什么样"的。
  // 读不到也不能拦住切换——那是附带动作，不该让「编辑」按钮点不动（踩过：await 抛错
  // 会让下面那行永远执行不到，表现成"点了没反应"）。
  if (editing.value) {
    try { await syncFromDisk(); } catch { /* 读不到就按内存里的走 */ }
  }
  flushVersion();
  editing.value = !editing.value;
}

async function load(file = "") {
  loading.value = true;
  try {
    const data = await api<{
      files: IntroFile[]; file: string; name: string; path: string;
      markdown: string; mtime: number | null; versioned: boolean;
    }>(`/api/self-intro${file ? `?file=${encodeURIComponent(file)}` : ""}`);
    files.value = data.files;
    currentFile.value = data.file;
    loadChat();                 // 换稿子就换一段对话（按稿子存的）
    if (data.file) localStorage.setItem(STORAGE_KEY, data.file);
    text.value = data.markdown;
    saved.value = data.markdown;
    baseMtime.value = data.mtime;
    filePath.value = data.path;
    versioned.value = data.versioned;
    resetVersions(data.markdown);
    editing.value = false;
  } catch (error) {
    toast.error((error as Error).message);
  } finally {
    loading.value = false;
  }
}

/** 切到另一份自我介绍。有未保存改动先问一句——切过去那份的改动就找不回来了 */
async function switchFile(file: string) {
  if (!file || file === currentFile.value) return;
  if (dirty.value && !window.confirm(`「${nameOf(currentFile.value)}」还有未保存的改动，切换会丢掉，确定吗？`)) return;
  instruction.value = "";
  // 不要在这里清 chatLog：对话是按文件存的，清空会把上一份的记录覆盖成空。
  // load() 里会按新文件把对应的那段读出来。
  await load(file);
}

function nameOf(file: string) {
  return files.value.find((item) => item.file === file)?.name ?? file;
}

async function save() {
  saving.value = true;
  try {
    const data = await api<{ mtime: number; externallyChanged: boolean; notices: string[]; commit: { committed: boolean; hash?: string; reason?: string } }>(
      "/api/self-intro",
      { method: "POST", body: JSON.stringify({ file: currentFile.value, markdown: text.value, baseMtime: baseMtime.value }) },
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
// action 要留着：下一轮把它还原成模型当初吐出的 JSON 形状再发回去，
// 混散文进 JSON 模式的对话会让模型返回空内容（实测 40% 概率）
const chatLog = ref<{ role: "user" | "assistant"; text: string; error?: boolean; action?: "revise" | "answer" }[]>([]);
const chatBox = ref<HTMLElement | null>(null);

/**
 * 对话按**哪一份稿子**存在本地：刷新、关掉再回来，之前聊过什么还在。
 * 不落服务端——这是编辑时的临时上下文，不是要沉淀的资产。
 */
const chatKey = () => `self-intro-chat:${currentFile.value}`;
function loadChat() {
  try {
    chatLog.value = JSON.parse(localStorage.getItem(chatKey()) ?? "[]");
  } catch {
    chatLog.value = [];        // 存的东西坏了就当没有，别拦着页面
  }
}
watch(chatLog, () => {
  if (!currentFile.value) return;
  try {
    localStorage.setItem(chatKey(), JSON.stringify(chatLog.value));
  } catch {
    /* 存不下（配额满）不该影响正在进行的对话 */
  }
}, { deep: true });

async function revise() {
  const ask = instruction.value.trim();
  if (!ask || revising.value) return;
  // 先对齐磁盘：模型必须基于"文件里现在真实的内容"改写，否则一保存就把外面的改动盖掉了
  try { await syncFromDisk(); } catch { /* 读不到就按内存里的走，别为此拦住 */ }
  // 先把历史快照出来再推入这句——否则历史里会多一条和这次重复的「他」说的话
  // 当前正文已包含更早改动，只保留最近 6 轮用于指代消解，避免上下文无限增长。
  const history = chatLog.value.slice(-12);
  chatLog.value.push({ role: "user", text: ask });
  instruction.value = "";
  revising.value = true;
  try {
    const before = text.value;
    const data = await api<{ action: "revise" | "answer"; reply: string; markdown?: string }>("/api/self-intro/revise", {
      method: "POST",
      body: JSON.stringify({ markdown: before, instruction: ask, history }),
    });
    // action=answer 表示他只是在问意见：稿子一个字都不动
    const revised = data.action === "revise" && data.markdown ? data.markdown : "";
    if (revised) {
      text.value = revised;
      pushVersion(revised);
      // 改完切回预览：内容变了，让人直接看到结果，而不是停在编辑框
      editing.value = false;
    }
    // 实测模型会把开头的链路锚点当冗余删掉（`> 开场 → 实习 → …` 那行），
    // 提示词已经要求保留，这里再兜一道——丢了要说出来，别让人自己发现
    const anchor = (value: string) => value.split("\n").find((line) => line.trim())?.trim() ?? "";
    const lostAnchor = Boolean(revised) && anchor(before).startsWith(">") && !anchor(revised).startsWith(">");
    chatLog.value.push({
      role: "assistant",
      action: data.action,
      text: lostAnchor
        ? "改好了，但这次把开头的链路锚点弄丢了——建议点「回撤」退回，或直接让它「把第一行的链路锚点补回去」。"
        : data.reply || (revised ? "已按你的要求改好，看左边预览。" : "（模型这次没给出内容）"),
    });
  } catch (error) {
    chatLog.value.push({ role: "assistant", text: `这次没成功：${(error as Error).message}`, error: true });
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
    const data = await api<{ commits: Commit[] }>(`/api/self-intro/history?file=${encodeURIComponent(currentFile.value)}`);
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
    const data = await api<{ markdown: string }>("/api/self-intro/history", { method: "POST", body: JSON.stringify({ file: currentFile.value, hash }) });
    previewText.value = data.markdown;
  } catch (error) {
    // 取不到就把选中和正文一起清掉：留着上一版的正文配着新的哈希，
    // 底下那个「回滚到这一版」就指向了一个根本没加载出来的版本
    previewText.value = "";
    previewHash.value = "";
    toast.error((error as Error).message);
  }
}

async function rollback(hash: string) {
  try {
    const data = await api<{ markdown: string; mtime: number; commit: { committed: boolean; hash?: string } }>(
      "/api/self-intro/rollback",
      { method: "POST", body: JSON.stringify({ file: currentFile.value, hash }) },
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

onMounted(() => load(localStorage.getItem(STORAGE_KEY) ?? ""));
onBeforeUnmount(() => window.clearTimeout(snapshotTimer));
// 有未保存改动时离开要拦一下：这个文件不在主仓库里，随手丢了不好找回来
onBeforeRouteLeave(() => (dirty.value ? window.confirm("自我介绍还有未保存的改动，确定离开吗？") : true));
</script>

<template>
  <div class="page selfintro">
    <div class="si-toolbar">
      <div class="si-tools">
        <n-select
          class="si-file"
          size="small"
          :value="currentFile"
          :options="files.map((item) => ({ label: item.name, value: item.file }))"
          :disabled="loading || files.length < 2"
          @update:value="switchFile"
        />
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
          <div class="si-pane-head">
            <span>{{ editing ? "编辑" : "预览" }}</span>
            <button class="si-mode" @click="toggleEditing">{{ editing ? "完成" : "编辑" }}</button>
          </div>
          <textarea
            v-if="editing"
            class="si-editor"
            :value="text"
            spellcheck="false"
            placeholder="在这里写自我介绍……"
            @input="onInput"
          />
          <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
          <div v-else class="si-preview preview-body" v-html="renderMarkdown(text)" />
        </section>

        <aside class="si-pane si-chat-pane">
          <div class="si-pane-head">让 AI 改</div>
          <div ref="chatBox" class="si-chat">
            <p v-if="!chatLog.length" class="si-chat-hint">
              让它改，或者直接问它意见。比如「FlowMind 那段再具体一点」「开场压缩到两句」是要它改；
              「开场是不是太长了？」「这段和实习那段是不是重复了？」只是问它——问的时候它不会动你的稿子。
              改完看左边预览，不满意点「回撤」。
            </p>
            <div v-for="(entry, index) in chatLog" :key="index" class="si-chat-item" :class="entry.role">
              <span class="si-chat-who">{{ entry.role === "user" ? "我" : "AI" }}</span>
              <!-- 模型输出按 markdown 渲染；用户自己打的内容保持原文，免得被当成语法 -->
              <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
              <div v-if="entry.role === 'assistant'" class="si-chat-text" v-html="renderMarkdown(entry.text)" />
              <div v-else class="si-chat-text">{{ entry.text }}</div>
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
        <!-- 一版都没有时不摆两栏：右边那句「左侧选一个版本」根本没得选，
             两栏一起说「没有东西」，还白占 380px 高。空着就只说一件事。 -->
        <div v-if="commits.length" class="si-history">
          <div class="si-history-list">
            <button
              v-for="commit in commits"
              :key="commit.hash"
              class="si-commit"
              :class="{ active: commit.hash === previewHash }"
              @click="previewCommit(commit.hash)"
            >
              <span class="si-commit-head">
                <span class="si-commit-ver">{{ commit.version }}</span>
                <strong class="si-commit-title">{{ commit.title }}</strong>
              </span>
              <!-- 分点用 span 不用 ul：button 里放不了流内容，浏览器容错但我们不该依赖它 -->
              <span v-if="commit.points.length" class="si-commit-points">
                <span v-for="point in commit.points" :key="point" class="si-commit-point">{{ point }}</span>
              </span>
              <span class="si-commit-meta">
                <time :datetime="commit.date" :title="commit.dateFull">{{ commit.dateText }}</time>
                <code>{{ commit.hash.slice(0, 7) }}</code>
                <em class="si-diff-add">+{{ commit.added }}</em>
                <em class="si-diff-del">−{{ commit.deleted }}</em>
              </span>
            </button>
          </div>
          <div class="si-history-preview">
            <div class="si-history-preview-body">
              <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
              <div class="preview-body" v-html="renderMarkdown(previewText)" />
            </div>
            <div v-if="previewHash" class="si-history-actions">
              <n-button size="small" type="primary" @click="rollback(previewHash)">回滚到这一版</n-button>
              <span class="si-count">回滚会新增一次提交，历史不会丢</span>
            </div>
          </div>
        </div>
        <div v-else class="si-history-blank">
          <!-- 载入中也走这块：高度一样，弹窗不会先塌成一条、拿到数据再长开 -->
          <template v-if="!historyLoading">
            <svg class="si-blank-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8.4" />
              <path d="M12 7.2v5.1l3.3 2" />
            </svg>
            <p class="si-blank-title">还没有任何版本</p>
            <p class="si-blank-hint">在编辑器里改完点「保存」，就会记下这一版——以后随时能翻回来看看，也能回滚。</p>
          </template>
        </div>
      </n-spin>
    </n-modal>
  </div>
</template>
