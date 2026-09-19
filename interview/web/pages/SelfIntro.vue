<script setup lang="ts">
import { onMounted, ref } from "vue";
import { NButton, NInput, NModal, NSelect, NSpin, NTag, NTooltip, useMessage } from "naive-ui";
import { api } from "../api";
import { renderMarkdown } from "../lib/markdown";
import { API } from "../../shared/routes.ts";
import { useDocumentEditor, type Commit } from "../composables/useDocumentEditor";

interface IntroFile { file: string; name: string }

/** 面试页的预览弹窗也读这个键，两处看的是同一份 */
const STORAGE_KEY = "self-intro-file";

const toast = useMessage();
const loading = ref(true);
/** 目录下的全部自我介绍，以及在编辑的这一份 */
const files = ref<IntroFile[]>([]);
const versioned = ref(true);

const {
  content: text, file: currentFile, filePath,
  saved, uncommitted, baseMtime, dirty, edited,
  versions, cursor, canUndo, canRedo, flushVersion, undo, redo, onInput,
  editing, toggleEditing: baseToggleEditing, syncFromDisk, applyLoaded,
  instruction, chatLog, clearChatOpen, chatBox, chatSummary, chatSummaryCount, loadChat, clearChat, saveChatSummary,
  revising, reviseProgress, revise, abortRevise, busy,
  saving, save, discarding, discard,
  historyOpen, commits, previewHash, historyLoading, rollbackOpen, rollbackTarget, rollingBack,
  openHistory, askRollback, rollback,
} = useDocumentEditor({
  kind: "self-intro",
  previewCommit: (hash) => previewCommit(hash),
  // 自我介绍这边改完要切回预览，让人直接看到结果，而不是停在编辑框
  afterRevise: (changed) => { if (changed) editing.value = false; },
  // 模型会把开头的链路锚点当冗余删掉（`> 开场 → 实习 → …` 那行），
  // 提示词已经要求保留，这里再兜一道——丢了要说出来，别让人自己发现
  replyText: ({ changed, before, after, reply }) => {
    const anchor = (value: string) => value.split("\n").find((line) => line.trim())?.trim() ?? "";
    const lost = changed && anchor(before).startsWith(">") && !anchor(after).startsWith(">");
    if (lost) return "改好了，但这次把开头的链路锚点弄丢了——建议点「回撤」退回，或直接让它「把第一行的链路锚点补回去」。";
    return reply || (changed ? "已按你的要求改好，看左边预览。" : "（模型这次没给出内容）");
  },
});

/**
 * 切回预览前先对齐磁盘 —— 预览是给人看「现在文件长什么样」的。
 * 读不到也不能拦住切换：那是附带动作，不该让「编辑」按钮点不动。
 */
async function toggleEditing() {
  if (editing.value) {
    try { await syncFromDisk(); } catch { /* 读不到就按内存里的走 */ }
  }
  await baseToggleEditing();
}

/** 历史某一版的正文（自我介绍直接渲染 markdown，不像简历要走 PDF） */
const previewText = ref("");

async function load(file = "") {
  loading.value = true;
  try {
    const data = await api<{
      files: IntroFile[]; file: string; name: string; path: string;
      markdown: string; mtime: number | null; versioned: boolean; uncommitted: boolean;
    }>(`${API.document("self-intro")}${file ? `?file=${encodeURIComponent(file)}` : ""}`);
    files.value = data.files;
    if (data.file) localStorage.setItem(STORAGE_KEY, data.file);
    versioned.value = data.versioned;
    editing.value = false;
    applyLoaded({ file: data.file, name: data.name, path: data.path, content: data.markdown, mtime: data.mtime, uncommitted: data.uncommitted });
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
  await load(file);
}

async function previewCommit(hash: string) {
  previewHash.value = hash;
  try {
    const data = await api<{ markdown: string }>(API.documentHistory("self-intro"), { method: "POST", body: JSON.stringify({ file: currentFile.value, hash }) });
    previewText.value = data.markdown;
  } catch (error) {
    // 取不到就把选中和正文一起清掉：留着上一版的正文配着新的哈希，
    // 底下那个「回滚到这一版」就指向了一个根本没加载出来的版本
    previewText.value = "";
    previewHash.value = "";
    toast.error((error as Error).message);
  }
}

onMounted(async () => {
  await load(localStorage.getItem(STORAGE_KEY) ?? "");
});
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
          :disabled="busy || loading || files.length < 2"
          @update:value="switchFile"
        />
        <n-button size="small" :disabled="busy || !canUndo" @click="undo">← 回撤</n-button>
        <n-button size="small" :disabled="busy || !canRedo" @click="redo">前进 →</n-button>
        <!-- 数的是回撤栈里的位置，不是 git 的「第几版」（那个在历史面板里）。别叫「版本」，会撞词 -->
        <span class="si-count">步骤 {{ cursor + 1 }}/{{ versions.length }}</span>
      </div>
      <div class="si-tools">
        <n-tag v-if="dirty" type="warning" size="small" round>未保存</n-tag>
        <n-tag v-else size="small" round>已保存</n-tag>
        <span class="si-count">{{ text.length }} 字</span>
        <n-button size="small" @click="openHistory">历史</n-button>
        <n-button size="small" type="primary" :loading="saving" :disabled="busy || !dirty" @click="save">保存</n-button>
        <n-button size="small" :loading="discarding" :disabled="busy || !uncommitted" @click="discard">放弃改动</n-button>
      </div>
    </div>

    <n-spin :show="loading">
      <div class="si-body">
        <section class="si-pane">
          <div class="si-pane-head">
            <span>{{ editing ? "编辑" : "预览" }}</span>
            <button class="si-mode" :disabled="busy" @click="toggleEditing">{{ editing ? "完成" : "编辑" }}</button>
          </div>
          <textarea
            v-if="editing"
            class="si-editor"
            :value="text"
            :disabled="busy"
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
            <n-button size="tiny" quaternary :disabled="busy || !chatLog.length" @click="clearChatOpen = true">清空对话</n-button>
          </div>
          <div ref="chatBox" class="si-chat">
            <p v-if="!chatLog.length" class="si-chat-hint">
              让它改，或者直接问它意见。比如「订单中台 那段再具体一点」「开场压缩到两句」是要它改；
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
            <!-- 改稿进度作为最后一条 AI 消息显示：先说「正在读文档…」，模型开始吐字后逐字变长。
                 放在消息流里而不是输入框下面 —— 它本来就是 AI 这一轮说的话。 -->
            <div v-if="revising" class="si-chat-item assistant si-chat-live">
              <span class="si-chat-who">AI</span>
              <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
              <div class="si-chat-text" v-html="renderMarkdown(reviseProgress)" />
            </div>
          </div>
          <div class="si-chat-box">
            <n-input
              v-model:value="instruction"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="Enter 发送，Shift+Enter 换行"
              :disabled="busy"
              @keydown.enter.exact.prevent="revise"
            />
            <!-- 停止占的就是发送的位置：改稿期间这一个按钮既是状态也是出口 -->
            <n-button v-if="revising" size="small" @click="abortRevise">停止</n-button>
            <n-button v-else size="small" type="primary" :disabled="!instruction.trim()" @click="revise">发送</n-button>
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
          :disabled="busy || !previewHash"
          title="把这一版的内容放回编辑器，不产生新提交"
          @click="askRollback"
        >恢复到这一版</n-button>
      </template>
      <n-spin :show="historyLoading">
        <!-- 一版都没有时不摆两栏：右边那句「左侧选一个版本」根本没得选，
             两栏一起说「没有东西」，还白占 380px 高。空着就只说一件事。 -->
        <div v-if="commits.length" class="si-history">
          <div class="si-history-list">
            <!-- 列表里只放标题，详情挂 tooltip：这一栏只有 340px 宽，把分点铺开会变成一堵扫不动的灰墙 -->
            <n-tooltip
              v-for="commit in commits"
              :key="commit.hash"
              trigger="hover"
              :delay="150"
              placement="right-start"
            >
              <template #trigger>
                <button
                  class="si-commit"
                  :class="{ active: commit.hash === previewHash }"
                  @click="previewCommit(commit.hash)"
                >
                  <span class="si-commit-head">
                    <span class="si-commit-ver">{{ commit.version }}</span>
                    <strong class="si-commit-title">{{ commit.title }}</strong>
                  </span>
                  <span class="si-commit-meta">
                    <time :datetime="commit.date" :title="commit.dateFull">{{ commit.dateText }}</time>
                    <code>{{ commit.hash.slice(0, 7) }}</code>
                    <em class="si-diff-add">+{{ commit.added }}</em>
                    <em class="si-diff-del">−{{ commit.deleted }}</em>
                  </span>
                </button>
              </template>
              <div class="si-tip">
                <p class="si-tip-title">{{ commit.title }}</p>
                <ul v-if="commit.points.length" class="si-tip-points">
                  <li v-for="point in commit.points" :key="point">{{ point }}</li>
                </ul>
                <p v-else class="si-tip-empty">这一版没有更细的说明</p>
              </div>
            </n-tooltip>
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
        <n-button size="small" type="primary" :loading="rollingBack" :disabled="busy" @click="rollback(previewHash)">恢复到这一版</n-button>
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
