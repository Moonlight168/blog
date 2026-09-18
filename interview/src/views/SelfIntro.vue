<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
/**
 * 盘上这份和最新提交对不上（比如刚恢复过一版、还没点保存）。
 * 光比 text 和 saved 不够——刷新页面后两者都从磁盘重新读，看着就成「已保存」了，
 * 可那份内容其实还没记进历史。这个标记由服务端按 git 算，刷新也带得回来。
 */
const uncommitted = ref(false);
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

const dirty = computed(() => text.value !== saved.value || uncommitted.value);
/**
 * 编辑器里改过、还没落盘。和 dirty 不是一回事：恢复过一版之后 dirty 也是 true，
 * 但那份内容**已经在盘上**了。syncFromDisk 要判断的是「缓冲区里有没有还没落盘的东西」，
 * 用 dirty 会让它恢复后永远不肯重读磁盘。
 */
const edited = computed(() => text.value !== saved.value);
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
  if (edited.value || !currentFile.value) return false;
  const latest = await api<{ markdown: string; mtime: number | null; uncommitted: boolean }>(
    `/api/self-intro?file=${encodeURIComponent(currentFile.value)}`,
  );
  if (latest.mtime === baseMtime.value) return false;
  text.value = latest.markdown;
  saved.value = latest.markdown;
  uncommitted.value = latest.uncommitted;
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
      markdown: string; mtime: number | null; versioned: boolean; uncommitted: boolean;
    }>(`/api/self-intro${file ? `?file=${encodeURIComponent(file)}` : ""}`);
    files.value = data.files;
    currentFile.value = data.file;
    loadChat();                 // 换稿子就换一段对话（按稿子存的）
    if (data.file) localStorage.setItem(STORAGE_KEY, data.file);
    text.value = data.markdown;
    saved.value = data.markdown;
    uncommitted.value = data.uncommitted;
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

/**
 * 切到另一份自我介绍。
 *
 * 这里不弹「还有未保存的改动，确定吗」：浏览器原生的 confirm 拦一下太吵，
 * 而工具栏那颗醒目的「未保存」标签已经说明状态了。切走丢的只是编辑器缓冲区，
 * 盘上那份还在。
 */
async function switchFile(file: string) {
  if (!file || file === currentFile.value) return;
  instruction.value = "";
  // 不要在这里清 chatLog：对话是按文件存的，清空会把上一份的记录覆盖成空。
  // load() 里会按新文件把对应的那段读出来。
  await load(file);
}

async function save() {
  saving.value = true;
  try {
    const data = await api<{ mtime: number; externallyChanged: boolean; notices: string[]; commit: { committed: boolean; hash?: string; reason?: string } }>(
      "/api/self-intro",
      { method: "POST", body: JSON.stringify({ file: currentFile.value, markdown: text.value, baseMtime: baseMtime.value }) },
    );
    saved.value = text.value;
    uncommitted.value = false;
    baseMtime.value = data.mtime;
    toast.success(data.commit.committed ? `已保存 ${data.commit.hash}` : "已保存");
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
/** 清空对话前问一句：清掉就找不回来了 */
const clearChatOpen = ref(false);
/**
 * 更早那些轮的滚动摘要，以及它已经覆盖到第几条。
 *
 * 历史只发最近几条；再往前的要是**直接丢掉**，用户早先提过的偏好和约束就没了——
 * 那些在稿子正文里看不出来（「链路锚点那行别动」「收尾别加联系方式」），一丢后面几轮就开始自相矛盾。
 * 所以攒够了就压成一段摘要，跟着每轮一起发。摘要只在压缩时变一次，比文稿稳定，放在提示词前半段。
 */
const chatSummary = ref("");
const chatSummaryCount = ref(0);
const chatBox = ref<HTMLElement | null>(null);

/**
 * 对话按**哪一份稿子**存在本地：刷新、关掉再回来，之前聊过什么还在。
 * 不落服务端——这是编辑时的临时上下文，不是要沉淀的资产。
 */
const chatKey = () => `self-intro-chat:${currentFile.value}`;
/** 清掉这段对话。它只是本地上下文，跟稿子内容无关，清了不影响任何已保存的东西 */
function clearChat() {
  chatLog.value = [];
  chatSummary.value = "";
  chatSummaryCount.value = 0;
  saveChatSummary();
  clearChatOpen.value = false;
}

const chatSummaryKey = () => `self-intro-chat-summary:${currentFile.value}`;

function loadChat() {
  try {
    chatLog.value = JSON.parse(localStorage.getItem(chatKey()) ?? "[]");
  } catch {
    chatLog.value = [];        // 存的东西坏了就当没有，别拦着页面
  }
  try {
    const saved = JSON.parse(localStorage.getItem(chatSummaryKey()) ?? "null");
    chatSummary.value = typeof saved?.summary === "string" ? saved.summary : "";
    chatSummaryCount.value = Number.isInteger(saved?.count) && saved.count >= 0 ? saved.count : 0;
  } catch {
    chatSummary.value = "";
    chatSummaryCount.value = 0;
  }
}

function saveChatSummary() {
  if (!currentFile.value) return;
  try {
    localStorage.setItem(chatSummaryKey(), JSON.stringify({ summary: chatSummary.value, count: chatSummaryCount.value }));
  } catch {
    /* 存不下不该影响正在进行的对话，下次重新压一遍就是 */
  }
}

/** 最近几条原样发出去，更早的压进摘要 */
const CHAT_KEEP = 8;
/** 没归档的攒到这么多条就先压一次 */
const CHAT_COMPACT_AT = 12;

/**
 * 攒够了就把更早那几轮压成摘要。
 * 压缩失败**不拦住这次改写**——退回「只发最近几条」，跟没做这个功能时一样。
 */
async function compactChatIfNeeded() {
  const pending = chatLog.value.slice(chatSummaryCount.value);
  if (pending.length <= CHAT_COMPACT_AT) return;
  const older = pending.slice(0, -CHAT_KEEP);
  if (!older.length) return;
  try {
    const data = await api<{ summary: string }>("/api/chat/compact", {
      method: "POST",
      body: JSON.stringify({ summary: chatSummary.value, turns: older }),
    });
    chatSummary.value = data.summary;
    chatSummaryCount.value += older.length;
    saveChatSummary();
  } catch {
    /* 压不了就算了，这次按老样子发最近几条 */
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
  instruction.value = "";      // 先清输入框，别让这句话一直挂着
  revising.value = true;
  try {
    // 攒够了先压一次（只在自己压缩时才会多花一次调用）；压完摘要覆盖住的那些就不再单独发
    await compactChatIfNeeded();
    // 再把历史快照出来、然后才推入这句——否则历史里会多一条和这次重复的「他」说的话
    const history = chatLog.value.slice(chatSummaryCount.value);
    chatLog.value.push({ role: "user", text: ask });
    const before = text.value;
    const data = await api<{ action: "revise" | "answer"; reply: string; markdown?: string }>("/api/self-intro/revise", {
      method: "POST",
      body: JSON.stringify({ markdown: before, instruction: ask, history, summary: chatSummary.value }),
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
/** 回滚确认：拿不准改哪一版就不动手 */
const rollbackOpen = ref(false);
const rollbackTarget = ref<Commit | null>(null);
const rollingBack = ref(false);

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

/** 回滚会把编辑器里这份稿子整个换掉，先确认一次；确认框里点明是哪一版 */
function askRollback() {
  rollbackTarget.value = commits.value.find((item) => item.hash === previewHash.value) ?? null;
  if (rollbackTarget.value) rollbackOpen.value = true;
}

async function rollback(hash: string) {
  rollingBack.value = true;
  const label = rollbackTarget.value ? `已恢复到 ${rollbackTarget.value.version}` : "已恢复";
  try {
    const data = await api<{ markdown: string; mtime: number; uncommitted: boolean }>(
      "/api/self-intro/rollback",
      { method: "POST", body: JSON.stringify({ file: currentFile.value, hash }) },
    );
    text.value = data.markdown;
    // 故意不更新 saved：服务端只把内容写回工作区、没有提交。
    // uncommitted 由服务端按 git 照实算——恢复到**最新那版**时它就是 false，
    // 盘上和 HEAD 一模一样，不该亮着「未保存」催人点保存。
    uncommitted.value = data.uncommitted;
    baseMtime.value = data.mtime;
    pushVersion(data.markdown);
    rollbackOpen.value = false;
    historyOpen.value = false;
    toast.success(`${label}，点「保存」才记进历史`);
  } catch (error) {
    toast.error((error as Error).message);
  } finally {
    rollingBack.value = false;
  }
}

onMounted(() => load(localStorage.getItem(STORAGE_KEY) ?? ""));
onBeforeUnmount(() => window.clearTimeout(snapshotTimer));
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
        <!-- 数的是回撤栈里的位置，不是 git 的「第几版」（那个在历史面板里）。别叫「版本」，会撞词 -->
        <span class="si-count">步骤 {{ cursor + 1 }}/{{ versions.length }}</span>
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
          <div class="si-pane-head">
            <span>让 AI 改</span>
            <!-- 常驻显示、空了置灰：只在有对话时才冒出来的话，想清空的人反而找不到 -->
            <n-button size="tiny" quaternary :disabled="!chatLog.length" @click="clearChatOpen = true">清空对话</n-button>
          </div>
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
      <!-- 回滚按钮放标题栏（那块本来就是空的）：预览栏的每一行都是给内容的高度，
           在下面单开一行放按钮，等于从预览里挖走 47px -->
      <template #header-extra>
        <n-button
          class="si-rollback-btn"
          size="small"
          type="primary"
          :disabled="!previewHash"
          title="把这一版的内容放回编辑器，不产生新提交"
          @click="askRollback"
        >恢复到这一版</n-button>
      </template>
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
            <p class="si-blank-hint">在编辑器里改完点「保存」，就会记下这一版——以后随时能翻回来看看，也能恢复。</p>
          </template>
        </div>
      </n-spin>
    </n-modal>

    <!-- 回滚会把编辑器里这份稿子整个换掉，先确认一次。目标那一版按列表里的样子摆出来，
         一眼就知道要换成哪一版；顺带把「历史不会丢」讲清楚——那是最容易被误会的地方 -->
    <n-modal v-model:show="rollbackOpen" preset="dialog" title="恢复到这一版？" :show-icon="false">
      <div class="si-rollback-body">
        <div v-if="rollbackTarget" class="si-rollback-card">
          <span class="si-commit-head">
            <span class="si-commit-ver">{{ rollbackTarget.version }}</span>
            <strong class="si-commit-title">{{ rollbackTarget.title }}</strong>
          </span>
          <span v-if="rollbackTarget.points.length" class="si-commit-points">
            <span v-for="point in rollbackTarget.points" :key="point" class="si-commit-point">{{ point }}</span>
          </span>
          <span class="si-commit-meta">
            <time>{{ rollbackTarget.dateText }}</time>
            <code>{{ rollbackTarget.hash.slice(0, 7) }}</code>
          </span>
        </div>
        <!-- 一句话就够：最要紧的是「不会新增提交」，其次才是「那怎么才能记下来」 -->
        <p><strong>不会</strong>新增提交，只把内容放回编辑器；点「保存」才记成一版。</p>
      </div>
      <template #action>
        <n-button size="small" @click="rollbackOpen = false">取消</n-button>
        <n-button size="small" type="primary" :loading="rollingBack" @click="rollback(previewHash)">恢复到这一版</n-button>
      </template>
    </n-modal>

    <n-modal v-model:show="clearChatOpen" preset="dialog" title="清空这段对话？" :show-icon="false">
      <div class="confirm-body">
        <p>对话记录清掉就找不回来了。</p>
        <p>只清对话——稿子本身和已保存的版本都不受影响。</p>
      </div>
      <template #action>
        <n-button size="small" @click="clearChatOpen = false">取消</n-button>
        <n-button size="small" type="primary" @click="clearChat">清空</n-button>
      </template>
    </n-modal>
  </div>
</template>
