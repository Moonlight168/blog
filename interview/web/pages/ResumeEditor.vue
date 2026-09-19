<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { NButton, NInput, NModal, NSelect, NSplit, NSpin, NTag, NTooltip, useMessage } from "naive-ui";
import { api } from "../api";
import { renderMarkdown } from "../lib/markdown";
import { API } from "../../shared/routes.ts";
import { useDocumentEditor, type Commit } from "../composables/useDocumentEditor";

interface ResumeFile { file: string; name: string }
interface Person { id: string; label: string; resumes: ResumeFile[] }

const EXPORT_LOCK_KEY = "resume-export-lock";
/** 记住上次编辑的是谁、哪一份：下次进来停在同一份上（人员跟着简历走，不用单独存） */
const FILE_KEY = "resume-doc-file";
const EXPORT_NAME_KEY = "resume-export-name";

const toast = useMessage();
const loading = ref(true);
const rendering = ref(false);

const people = ref<Person[]>([]);
const person = ref("");
const exportDir = ref("");

/** 生成 PDF 期间显示骨架，避免白屏 */
const pdfUrl = ref("");
const pdfError = ref("");
/** 预览栏是否切到编辑态 */
const stalePreview = ref(false);
let previewQueued = false;

const {
  content: html, file, name, filePath,
  saved, uncommitted, baseMtime, dirty, edited,
  versions, cursor, canUndo, canRedo, flushVersion, undo, redo,
  editing, toggleEditing, syncFromDisk, applyLoaded, onInput: baseOnInput,
  instruction, chatLog, clearChatOpen, chatBox, chatSummary, chatSummaryCount, loadChat, clearChat, saveChatSummary,
  revising, reviseProgress, revise, abortRevise, busy,
  saving, save: baseSave, discarding, discard,
  historyOpen, commits, previewHash, historyLoading, rollbackOpen, rollbackTarget, rollingBack,
  openHistory, askRollback, rollback,
} = useDocumentEditor({
  kind: "resume",
  // 内容换了就把预览跟上，否则预览还停在上一版的画面上
  afterRestore: () => refreshPdf(),
  afterRevise: async (changed) => {
    if (!changed) return;
    stalePreview.value = true;
    editing.value = false;
    await refreshPdf();
  },
  previewCommit: (hash) => previewCommit(hash),
});

/** 「← 回撤 / 前进 →」也要把预览跟上，它们走的是 afterRestore */
async function undoAndRefresh() { await undo(); }
async function redoAndRefresh() { await redo(); }

/** 在编辑框里打字后，主预览就过期了 —— 工具栏按钮要变成「● 刷新预览」提示一下 */
function onInput(event: Event) {
  baseOnInput(event);
  stalePreview.value = true;
}

/** 保存成功后把预览跟上（旧版行为，抽取时漏了） */
async function save() {
  if (await baseSave()) await refreshPdf();
}

const resumesOfPerson = computed(() => people.value.find((item) => item.id === person.value)?.resumes ?? []);

async function load(wanted = "") {
  loading.value = true;
  try {
    const data = await api<{
      people: Person[]; file: string; name: string; path: string;
      html: string; mtime: number | null; exportDir: string; browser: string; uncommitted: boolean;
    }>(`${API.document("resume")}${wanted ? `?file=${encodeURIComponent(wanted)}` : ""}`);
    people.value = data.people;
    exportDir.value = data.exportDir;
    person.value = people.value.find((item) => item.resumes.some((r) => r.file === data.file))?.id ?? people.value[0]?.id ?? "";
    localStorage.setItem(FILE_KEY, data.file);
    editing.value = false;
    stalePreview.value = false;
    // 换简历就丢掉上次自定义的文件名，否则会把新简历导成旧简历的名字
    lastExportName.value = "";
    localStorage.removeItem(EXPORT_NAME_KEY);
    if (!data.browser) toast.warning("没找到 Chrome 或 Edge，预览与导出会失败");
    applyLoaded({ file: data.file, name: data.name, path: data.path, content: data.html, mtime: data.mtime, uncommitted: data.uncommitted });
    await refreshPdf();
  } catch (error) {
    // 记住的那份没了（改名/删除）就退回默认，别让页面直接卡在报错上
    if (wanted) { localStorage.removeItem(FILE_KEY); await load(); return; }
    toast.error((error as Error).message);
  } finally {
    loading.value = false;
  }
}

/** 切人：自动跳到这个人的第一份简历 */
async function switchPerson(id: string) {
  const first = people.value.find((item) => item.id === id)?.resumes[0]?.file;
  if (!first) { person.value = id; return; }
  await switchFile(first);
}

/**
 * 切到另一份简历。
 *
 * 这里不弹「还有未保存的改动，确定吗」：浏览器原生的 confirm 拦一下太吵，
 * 而工具栏那颗醒目的「未保存」标签已经说明状态了。切走丢的只是编辑器缓冲区，盘上那份还在。
 *
 * 也**不要**在这里清 chatLog：对话是按文件存的，而这一刻 file.value 还是旧的那份，
 * 一清就会触发写回、把上一份的对话覆盖成空。
 */
async function switchFile(next: string) {
  if (!next || next === file.value) return;
  instruction.value = "";
  await load(next);
}

/**
 * 生成预览用的 PDF。
 * 每次约 2～3 秒（Chrome 的打印排版本身就这么慢），所以不做逐键实时，
 * 由刷新按钮、保存、撤销/重做和 AI 改写触发；手工逐键输入仍不触发。
 */
async function refreshPdf() {
  if (rendering.value) { previewQueued = true; return; }
  rendering.value = true;
  pdfError.value = "";
  try {
    await syncFromDisk();
    if (!html.value.trim()) return;

    const response = await fetch(API.documentPdf("resume"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 带上 file：照片是同目录下的相对路径，服务端要靠它把渲染基准钉回简历目录
      body: JSON.stringify({ file: file.value, html: html.value }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(detail.error || `生成预览失败（HTTP ${response.status}）`);
    }
    const blob = await response.blob();
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
    // #zoom=page-width 让 PDF 阅读器按**栏宽**适配打开。A4 是 794px 宽，预览栏常常比它窄，
    // 按真实大小（#zoom=100）会把右边裁掉——而简历的右半截正是照片和联系方式。
    pdfUrl.value = `${URL.createObjectURL(blob)}#zoom=page-width`;
    stalePreview.value = false;
  } catch (error) {
    pdfError.value = (error as Error).message;
  } finally {
    rendering.value = false;
    if (previewQueued) {
      previewQueued = false;
      void refreshPdf();
    }
  }
}

// ---- 历史版本预览（简历走 PDF：老版本的 HTML 直接塞进页面会把它的 <style> 也带进来、把界面搞花）----

const previewLoading = ref(false);
const previewUrl = ref("");

function dropPreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
}

async function previewCommit(hash: string) {
  previewHash.value = hash;
  previewLoading.value = true;
  try {
    const data = await api<{ html: string }>(API.documentHistory("resume"), {
      method: "POST",
      body: JSON.stringify({ file: file.value, hash }),
    });
    const response = await fetch(API.documentPdf("resume"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: file.value, html: data.html }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(detail.error || `生成这一版的预览失败（HTTP ${response.status}）`);
    }
    const blob = await response.blob();
    dropPreview();
    // 历史预览用 page-fit：目的是「一眼看全这一版长什么样」。用 100%（真实大小）页面会超出这一栏，
    // 于是阅读器出现滚动条、外层再来一根——就是那对「双滚动条」。主预览仍用 page-width。
    previewUrl.value = `${URL.createObjectURL(blob)}#zoom=page-fit`;
  } catch (error) {
    // 取不到就把选中和画面一起清掉：留着上一版的预览配着新的哈希，
    // 底下那个「回滚到这一版」就指向了一个根本没加载出来的版本
    dropPreview();
    previewHash.value = "";
    toast.error((error as Error).message);
  } finally {
    previewLoading.value = false;
  }
}

// ---- 导出 ----

const exportName = ref("");
const exportOpen = ref(false);
const exporting = ref(false);
/**
 * 锁定后点「导出 PDF」直接用上次的参数导出，不再弹配置窗——导出是重复动作，
 * 每次重填没意义。锁的状态与上次的文件名都存 localStorage。
 */
const exportLocked = ref(localStorage.getItem(EXPORT_LOCK_KEY) === "1");
const lastExportName = ref(localStorage.getItem(EXPORT_NAME_KEY) ?? "");
/** 导出目录可以在弹窗里改（写回 .env，下次启动仍是它） */
const exportDirDraft = ref("");
const savingDir = ref(false);

function toggleExportLock() {
  exportLocked.value = !exportLocked.value;
  localStorage.setItem(EXPORT_LOCK_KEY, exportLocked.value ? "1" : "0");
  toast.info(exportLocked.value
    ? "已开启直接导出：不再弹窗，同名文件会直接覆盖"
    : "已关闭直接导出：导出前会先让你确认目录和文件名");
}

function openExport() {
  if (exportLocked.value) { void doExport(lastExportName.value || name.value); return; }
  exportName.value = name.value;
  exportDirDraft.value = exportDir.value;
  exportOpen.value = true;
}

/** 开系统原生的目录选择框，选完即写回配置 */
async function pickExportDir() {
  try {
    const data = await api<{ path?: string; cancelled?: boolean }>(API.pickPath, {
      method: "POST",
      body: JSON.stringify({ kind: "folder", start: exportDirDraft.value }),
    });
    if (data.path) {
      exportDirDraft.value = data.path;
      await saveExportDir();
    }
  } catch (error) { toast.error((error as Error).message); }
}

async function saveExportDir() {
  const dir = exportDirDraft.value.trim();
  if (!dir || dir === exportDir.value) return;
  savingDir.value = true;
  try {
    const data = await api<{ exportDir: string }>(API.documentExportDir("resume"), {
      method: "POST",
      body: JSON.stringify({ dir }),
    });
    exportDir.value = data.exportDir;
    exportDirDraft.value = data.exportDir;
    toast.success(`导出目录已改为 ${data.exportDir}`);
  } catch (error) {
    toast.error((error as Error).message);
    exportDirDraft.value = exportDir.value;
  } finally {
    savingDir.value = false;
  }
}

async function doExport(nameOverride?: string) {
  const wanted = nameOverride ?? exportName.value;
  exporting.value = true;
  try {
    const data = await api<{ path: string; name: string; bytes: number }>(API.documentExport("resume"), {
      method: "POST",
      body: JSON.stringify({ file: file.value, html: html.value, name: wanted }),
    });
    exportOpen.value = false;
    // 记住这次用的名字，锁定导出时直接复用
    exportName.value = data.name.replace(/\.pdf$/i, "");
    lastExportName.value = exportName.value;
    localStorage.setItem(EXPORT_NAME_KEY, exportName.value);
    toast.success(`已导出 ${data.name}（${Math.round(data.bytes / 1024)} KB）`);
  } catch (error) {
    toast.error((error as Error).message);
  } finally {
    exporting.value = false;
  }
}

// ---- 分栏 ----

/**
 * 左右分栏交给 naive-ui 的 NSplit（组件库现成实现），不再手搓拖动。
 * 它按「第一个面板的宽度」记账：size 用 px 字符串，min/max 也用 px。
 * 拖动期间盖一层透明遮罩——指针滑到 PDF 的 iframe 上时事件会被 iframe 吞掉，
 * 那样拖动就「脱手」了（这是 iframe 的老问题，跟谁实现的无关）。
 */
const MIN_PREVIEW = 360;
const MIN_CHAT = 320;
/** NSplit 的拖动条自己也占宽度，算右栏下限时要扣掉它 */
const SPLIT_TRIGGER = 6;
/** 拖动条配色：平时一条浅线，hover 时柔和的青绿（0.3s 过渡是组件自带的） */
const SPLIT_THEME = { resizableTriggerColor: "#eae7de", resizableTriggerColorHover: "#c8dcd4" };
const PREVIEW_WIDTH_KEY = "resume-preview-width";
const bodyEl = ref<HTMLElement>();
const containerWidth = ref(0);
/** 第一栏（预览）的宽度，px 字符串 */
const previewSize = ref(`${MIN_PREVIEW}px`);
const dragging = ref(false);

const maxPreview = computed(() => Math.max(MIN_PREVIEW, containerWidth.value - SPLIT_TRIGGER - MIN_CHAT));
function clampPreview(px: number) {
  return Math.min(Math.max(Math.round(px), MIN_PREVIEW), maxPreview.value);
}
function setPreviewWidth(px: number) {
  previewSize.value = `${clampPreview(px)}px`;
}
/** 容器宽度变了（窗口缩放）：把预览宽度收回合法区间，别把右栏挤没 */
function syncContainer() {
  const width = bodyEl.value?.clientWidth ?? 0;
  if (!width) return;
  containerWidth.value = width;
  const stored = Number(localStorage.getItem(PREVIEW_WIDTH_KEY));
  // 默认把右栏留在 380px（同样要扣掉拖动条）
  setPreviewWidth(stored || width - SPLIT_TRIGGER - Math.max(MIN_CHAT, 380));
}
function onSizeChange(size: string | number) {
  previewSize.value = typeof size === "number" ? `${clampPreview(size * containerWidth.value)}px` : size;
}
function onDragEnd() {
  dragging.value = false;
  localStorage.setItem(PREVIEW_WIDTH_KEY, String(parseInt(previewSize.value, 10) || MIN_PREVIEW));
}

let observer: ResizeObserver | undefined;
onMounted(() => {
  syncContainer();
  observer = new ResizeObserver(syncContainer);
  if (bodyEl.value) observer.observe(bodyEl.value);
});
onBeforeUnmount(() => observer?.disconnect());

onMounted(async () => {
  await load(localStorage.getItem(FILE_KEY) ?? "");
});
</script>

<template>
  <div class="page resume-editor">
    <div class="re-toolbar">
      <div class="re-tools">
        <n-select class="re-person" size="small" :disabled="busy" :value="person" :options="people.map(p => ({ label: p.label, value: p.id }))" @update:value="switchPerson" />
        <n-select class="re-file" size="small" :disabled="busy" :value="file" :options="resumesOfPerson.map(r => ({ label: r.name, value: r.file }))" @update:value="switchFile" />
        <n-button size="small" :disabled="busy || !canUndo" @click="undo">← 回撤</n-button>
        <n-button size="small" :disabled="busy || !canRedo" @click="redo">前进 →</n-button>
        <!-- 和自我介绍同一处、同一套写法：数的是回撤栈里的位置，不是 git 的「第几版」 -->
        <span class="si-count">步骤 {{ cursor + 1 }}/{{ versions.length }}</span>
        <n-button size="small" :loading="rendering" :disabled="busy" @click="refreshPdf">
          {{ stalePreview ? "● 刷新预览" : "刷新预览" }}
        </n-button>
      </div>
      <div class="re-tools">
        <n-tag v-if="dirty" type="warning" size="small" round>未保存</n-tag>
        <n-tag v-else size="small" round>已保存</n-tag>
        <!-- 和自我介绍同一套摆放：历史属于「落盘」这一组，紧贴保存左边；
             它动的是 git 提交，「回撤/前进」动的是内存里的撤销栈，两回事 -->
        <n-button size="small" @click="openHistory">历史</n-button>
        <n-button size="small" type="primary" :loading="saving" :disabled="busy || !dirty" @click="save">保存</n-button>
        <n-button size="small" :loading="discarding" :disabled="busy || !uncommitted" @click="discard">放弃改动</n-button>
        <n-button size="small" :loading="exporting" :disabled="busy" @click="openExport">导出 PDF</n-button>
        <button
          class="re-lock"
          :class="{ locked: exportLocked }"
          :title="exportLocked ? '直接导出已开启，点此关闭' : '开启直接导出：跳过配置窗，按上次的目录和文件名导出'"
          @click="toggleExportLock"
        >
          <svg class="re-lock-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path v-if="exportLocked" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm0 2a3 3 0 0 1 3 3v3H9V7a3 3 0 0 1 3-3Z" />
            <path v-else d="M12 2a5 5 0 0 0-5 5h2a3 3 0 0 1 6 0v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Z" />
          </svg>
        </button>
      </div>
    </div>

    <div ref="bodyEl" class="re-body">
      <n-split
        direction="horizontal"
        :size="previewSize"
        :min="`${MIN_PREVIEW}px`"
        :max="`${maxPreview}px`"
        :resize-trigger-size="SPLIT_TRIGGER"
        :theme-overrides="SPLIT_THEME"
        pane1-class="re-pane-slot"
        pane2-class="re-pane-slot"
        @update:size="onSizeChange"
        @drag-start="dragging = true"
        @drag-end="onDragEnd"
      >
        <template #1>
        <section class="re-pane">
          <div class="re-pane-head">
            <span>{{ editing ? "编辑（HTML）" : "预览（A4 · 与导出同一份 PDF）" }}</span>
            <button class="si-mode" :disabled="busy" @click="toggleEditing">{{ editing ? "完成" : "编辑" }}</button>
          </div>
          <textarea
            v-if="editing"
            class="re-editor"
            :value="html"
            :disabled="busy"
            spellcheck="false"
            @input="onInput"
          />
          <div v-else class="re-preview">
            <div v-if="rendering" class="re-preview-loading">
              <span class="re-spinner" />
              <p>正在排版…（约 2~3 秒）</p>
            </div>
            <iframe v-else-if="pdfUrl" class="re-pdf" :src="pdfUrl" title="简历预览" />
            <p v-else-if="pdfError" class="re-error">{{ pdfError }}</p>
            <p v-else class="muted">点「刷新预览」生成 PDF 预览</p>
          </div>
        </section>
          <!-- 拖动时挡住 iframe，否则指针移到 PDF 上就会丢事件、拖动中断 -->
          <div v-if="dragging" class="re-drag-shield" />
        </template>

        <template #2>
        <aside class="re-pane re-chat-pane">
          <div class="re-pane-head">
            <span>让 AI 改</span>
            <!-- 常驻显示、空了置灰：只在有对话时才冒出来的话，想清空的人反而找不到 -->
            <n-button size="tiny" quaternary :disabled="busy || !chatLog.length" @click="clearChatOpen = true">清空对话</n-button>
          </div>
          <div ref="chatBox" class="re-chat">
            <div v-if="!chatLog.length" class="si-chat-hint">
              <p class="si-chat-hint-title">让它改，或者直接问它意见</p>
              <ul class="si-chat-hint-list">
                <li>实习那段压缩到两行</li>
                <li>把 某审批系统 的技术栈补全</li>
                <li>这段实习会不会写太长了？</li>
                <li>几段经历里你觉得该突出哪个？</li>
              </ul>
              <p class="si-chat-hint-foot">要它改的，改完点「刷新预览」看效果；只是问它的话，它不会动你的简历。</p>
            </div>
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
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="Enter 发送，Shift+Enter 换行"
              :disabled="busy"
              @keydown.enter.exact.prevent="revise"
            />
            <!-- 停止占的就是发送的位置：改稿期间这一个按钮既是状态也是出口 -->
            <n-button v-if="revising" size="small" @click="abortRevise">停止</n-button>
            <n-button v-else size="small" type="primary" :disabled="!instruction.trim()" @click="revise">发送</n-button>
          </div>
        </aside>
        </template>
      </n-split>
    </div>

    <p class="si-path muted">
      {{ filePath }}<span v-if="exportDir">　·　导出到 {{ exportDir }}</span>
    </p>

    <n-modal v-model:show="exportOpen" preset="dialog" title="导出 PDF" :show-icon="false">
      <div class="confirm-body">
        <label class="re-export-label">保存到</label>
        <div class="re-dir-row">
          <n-input
            v-model:value="exportDirDraft"
            placeholder="导出目录的绝对路径"
            :disabled="savingDir"
            @blur="saveExportDir"
            @keydown.enter.prevent="saveExportDir"
          />
          <n-button :disabled="savingDir" @click="pickExportDir">浏览</n-button>
        </div>
        <p class="re-export-note">改完回车即生效，会记住（同名文件<strong>直接覆盖</strong>）</p>
        <label class="re-export-label">文件名</label>
        <n-input v-model:value="exportName" placeholder="不带 .pdf 后缀">
          <template #suffix>.pdf</template>
        </n-input>
      </div>
      <template #action>
        <n-button size="small" :disabled="exporting" @click="exportOpen = false">取消</n-button>
        <n-button size="small" type="primary" :loading="exporting" @click="doExport()">导出</n-button>
      </template>
    </n-modal>

    <!-- 历史版本：左边列表、右边那一版的 PDF。样式和自我介绍那个面板共用（si-history 系列） -->
    <n-modal v-model:show="historyOpen" preset="card" style="width: 1000px; max-width: 94vw" title="历史版本">
      <!-- 回滚按钮放标题栏（那块本来就是空的）：预览栏的每一行都是给 PDF 的高度，
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
              <!-- 打开面板会自动选中最新一版，那时 historyLoading 还没落地。
                   两个转圈一起转（外面罩整个弹窗、里面罩预览栏）看着像卡死了，
                   外面那个已经说明"在加载"，里面就等它让位 -->
              <n-spin :show="previewLoading && !historyLoading">
                <iframe v-if="previewUrl" class="re-history-pdf" :src="previewUrl" title="历史版本预览" />
                <p v-else-if="!previewLoading" class="muted si-history-hint">左侧选一个版本看它当时长什么样。</p>
              </n-spin>
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

    <!-- 回滚会把编辑器里这份整个换掉，先确认一次。目标那一版按列表里的样子摆出来，
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
        <p>只清对话——简历本身和已保存的版本都不受影响。</p>
      </div>
      <template #action>
        <n-button size="small" @click="clearChatOpen = false">取消</n-button>
        <n-button size="small" type="primary" @click="clearChat">清空</n-button>
      </template>
    </n-modal>
  </div>
</template>
