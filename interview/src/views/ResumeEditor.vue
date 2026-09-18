<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { NButton, NInput, NModal, NSelect, NSplit, NSpin, NTag, useMessage } from "naive-ui";
import { api } from "../api";

interface ResumeFile { file: string; name: string }
interface Person { id: string; label: string; resumes: ResumeFile[] }

const EXPORT_LOCK_KEY = "resume-export-lock";
/** 记住上次编辑的是谁、哪一份：下次进来停在同一份上（人员跟着简历走，不用单独存） */
const FILE_KEY = "resume-doc-file";
const EXPORT_NAME_KEY = "resume-export-name";

const toast = useMessage();
const loading = ref(true);
const saving = ref(false);
const rendering = ref(false);
const revising = ref(false);

const people = ref<Person[]>([]);
const person = ref("");
const file = ref("");
const name = ref("");
const filePath = ref("");
const exportDir = ref("");
const html = ref("");
/** 上次落盘的内容——用它判断「未保存」 */
const saved = ref("");
const baseMtime = ref<number | null>(null);
/** 生成 PDF 期间显示骨架，避免白屏 */
const pdfUrl = ref("");
const pdfError = ref("");

/** 回撤 / 前进用的版本栈：模型改动立即入栈，手工输入停手 800ms 入栈 */
const versions = ref<string[]>([]);
const cursor = ref(-1);
let snapshotTimer = 0;
let previewQueued = false;

/** 预览栏是否切到编辑态 */
const editing = ref(false);
/** 内容改过、但预览还停在旧 PDF 上 */
const stalePreview = ref(false);

const dirty = computed(() => html.value !== saved.value);
const canUndo = computed(() => cursor.value > 0);
const canRedo = computed(() => cursor.value >= 0 && cursor.value < versions.value.length - 1);
const resumesOfPerson = computed(() => people.value.find((item) => item.id === person.value)?.resumes ?? []);

function resetVersions(value: string) { versions.value = [value]; cursor.value = 0; }
function pushVersion(value: string) {
  if (versions.value[cursor.value] === value) return;
  versions.value = [...versions.value.slice(0, cursor.value + 1), value];
  cursor.value = versions.value.length - 1;
}
function flushVersion() { window.clearTimeout(snapshotTimer); pushVersion(html.value); }
async function undo() {
  flushVersion();
  if (!canUndo.value) return;
  cursor.value -= 1;
  html.value = versions.value[cursor.value];
  stalePreview.value = true;
  await refreshPdf();
}
async function redo() {
  flushVersion();
  if (!canRedo.value) return;
  cursor.value += 1;
  html.value = versions.value[cursor.value];
  stalePreview.value = true;
  await refreshPdf();
}
function onInput(event: Event) {
  html.value = (event.target as HTMLTextAreaElement).value;
  stalePreview.value = true;
  window.clearTimeout(snapshotTimer);
  snapshotTimer = window.setTimeout(() => pushVersion(html.value), 800);
}
function toggleEditing() { flushVersion(); editing.value = !editing.value; }

async function load(wanted = "") {
  loading.value = true;
  try {
    const data = await api<{
      people: Person[]; file: string; name: string; path: string;
      html: string; mtime: number | null; exportDir: string; browser: string;
    }>(`/api/resume-doc${wanted ? `?file=${encodeURIComponent(wanted)}` : ""}`);
    people.value = data.people;
    file.value = data.file;
    name.value = data.name;
    filePath.value = data.path;
    exportDir.value = data.exportDir;
    person.value = people.value.find((item) => item.resumes.some((r) => r.file === data.file))?.id ?? people.value[0]?.id ?? "";
    localStorage.setItem(FILE_KEY, data.file);
    html.value = data.html;
    saved.value = data.html;
    baseMtime.value = data.mtime;
    resetVersions(data.html);
    editing.value = false;
    stalePreview.value = false;
    // 换简历就丢掉上次自定义的文件名，否则会把新简历导成旧简历的名字
    lastExportName.value = "";
    localStorage.removeItem(EXPORT_NAME_KEY);
    if (!data.browser) toast.warning("没找到 Chrome 或 Edge，PDF 预览与导出会失败");
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

async function switchFile(next: string) {
  if (!next || next === file.value) return;
  if (dirty.value && !window.confirm("当前简历还有未保存的改动，切换会丢掉，确定吗？")) return;
  chatLog.value = [];
  instruction.value = "";
  await load(next);
}

/**
 * 没有未保存改动时，把文件重新读一遍。两处需要它：
 *
 * - **刷新预览之前**：否则渲染的是编辑器内存里那份，在外面（编辑器、别的工具）
 *   改过文件也看不到——而人点「刷新」的心理预期正是「让我看看现在文件长什么样」
 * - **让 AI 改之前**（更要紧）：模型基于陈旧内容改写，结果一保存就把外面的改动
 *   覆盖掉，而人完全不会察觉
 *
 * 有未保存改动时不读——那才是他正在编辑、正要保存的东西。
 */
async function syncFromDisk() {
  if (dirty.value || !file.value) return false;
  const latest = await api<{ html: string; mtime: number | null }>(
    `/api/resume-doc?file=${encodeURIComponent(file.value)}`,
  );
  if (latest.mtime === baseMtime.value) return false;
  html.value = latest.html;
  saved.value = latest.html;
  baseMtime.value = latest.mtime;
  resetVersions(latest.html);
  toast.info("文件在外部被改过，已重新载入");
  return true;
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

    const response = await fetch("/api/resume-doc/pdf", {
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
    // #zoom=100 让 Chrome 的 PDF 阅读器按真实大小打开（默认是"适应宽度"，窄栏下会缩得很小）；
    // 缩放交给阅读器后，外层就不需要滚动条了——避免出现嵌套滚动条。
    pdfUrl.value = `${URL.createObjectURL(blob)}#zoom=100`;
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

async function save() {
  saving.value = true;
  try {
    const data = await api<{ mtime: number; notices: string[]; commit: { committed: boolean; hash?: string } }>(
      "/api/resume-doc",
      { method: "POST", body: JSON.stringify({ file: file.value, html: html.value, baseMtime: baseMtime.value }) },
    );
    saved.value = html.value;
    baseMtime.value = data.mtime;
    toast.success(data.commit.committed ? `已保存并提交 ${data.commit.hash}` : "已保存");
    for (const notice of data.notices) toast.warning(notice);
    await refreshPdf();
  } catch (error) {
    toast.error((error as Error).message);
  } finally {
    saving.value = false;
  }
}

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

/**
 * 左右分栏交给 naive-ui 的 NSplit（组件库现成实现），不再手搓拖动。
 * 它按「第一个面板的宽度」记账：size 用 px 字符串，min/max 也用 px。
 * 拖动期间盖一层透明遮罩——指针滑到 PDF 的 iframe 上时事件会被 iframe 吞掉，
 * 那样拖动就"脱手"了（这是 iframe 的老问题，跟谁实现的无关）。
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

/** 改导出目录：校验存在性由服务端做，成功后同步到页面 */
/** 开系统原生的目录选择框，选完即写回配置 */
async function pickExportDir() {
  try {
    const data = await api<{ path?: string; cancelled?: boolean }>("/api/pick", {
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
    const data = await api<{ exportDir: string }>("/api/resume-doc/export-dir", {
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
    const data = await api<{ path: string; name: string; bytes: number }>("/api/resume-doc/export", {
      method: "POST",
      body: JSON.stringify({ file: file.value, html: html.value, name: wanted }),
    });
    exportOpen.value = false;
    // 记住这次用的名字，锁定导出时直接复用
    exportName.value = data.name.replace(/\.pdf$/i, "");
    lastExportName.value = exportName.value;
    localStorage.setItem(EXPORT_NAME_KEY, exportName.value);
    toast.success(`已导出 ${data.name}（${Math.round(data.bytes / 1024)} KB）到 ${exportDir.value}`);
  } catch (error) {
    toast.error((error as Error).message);
  } finally {
    exporting.value = false;
  }
}

// 与面试台、自我介绍一致：Enter 发送，Shift+Enter 换行
const instruction = ref("");
// action 要留着：下一轮把它还原成模型当初吐出的 JSON 形状再发回去，
// 混散文进 JSON 模式的对话会让模型返回空内容（实测 40% 概率）
const chatLog = ref<{ role: "user" | "assistant"; text: string; error?: boolean; action?: "revise" | "answer" }[]>([]);
const chatBox = ref<HTMLElement | null>(null);

async function revise() {
  const ask = instruction.value.trim();
  if (!ask || revising.value) return;
  // 先对齐磁盘：模型必须基于"文件里现在真实的内容"改写，否则一保存就把外面的改动盖掉了
  try { await syncFromDisk(); } catch { /* 读不到就按内存里的走，别为此拦住 */ }
  // 先把历史快照出来再推入这句——否则历史里会多一条和这次重复的「他」说的话
  // 当前 HTML 已包含更早改动，只保留最近 6 轮用于指代消解，避免上下文无限增长。
  const history = chatLog.value.slice(-12);
  chatLog.value.push({ role: "user", text: ask });
  instruction.value = "";
  revising.value = true;
  try {
    const data = await api<{ action: "revise" | "answer"; reply: string; html?: string }>("/api/resume-doc/revise", {
      method: "POST",
      body: JSON.stringify({ html: html.value, instruction: ask, history }),
    });
    // action=answer 表示他只是在问意见：简历一个字都不动，也不提示刷新预览
    if (data.action === "revise" && data.html) {
      html.value = data.html;
      pushVersion(data.html);
      stalePreview.value = true;
      editing.value = false;
      await refreshPdf();
    }
    chatLog.value.push({
      role: "assistant",
      action: data.action,
      text: data.reply || (data.action === "revise" ? "改好了，预览已同步更新。" : "（模型这次没给出内容）"),
    });
  } catch (error) {
    chatLog.value.push({ role: "assistant", text: `这次没成功：${(error as Error).message}`, error: true });
  } finally {
    revising.value = false;
    void Promise.resolve().then(() => chatBox.value?.scrollTo({ top: chatBox.value.scrollHeight, behavior: "smooth" }));
  }
}

onMounted(() => load(localStorage.getItem(FILE_KEY) ?? ""));
onBeforeUnmount(() => {
  observer?.disconnect();
  window.clearTimeout(snapshotTimer);
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
});
</script>

<template>
  <div class="page resume-editor">
    <div class="re-toolbar">
      <div class="re-tools">
        <n-select class="re-person" size="small" :value="person" :options="people.map(p => ({ label: p.label, value: p.id }))" @update:value="switchPerson" />
        <n-select class="re-file" size="small" :value="file" :options="resumesOfPerson.map(r => ({ label: r.name, value: r.file }))" @update:value="switchFile" />
        <n-button size="small" :disabled="!canUndo" @click="undo">← 回撤</n-button>
        <n-button size="small" :disabled="!canRedo" @click="redo">前进 →</n-button>
        <n-button size="small" :loading="rendering" @click="refreshPdf">
          {{ stalePreview ? "● 刷新预览" : "刷新预览" }}
        </n-button>
      </div>
      <div class="re-tools">
        <n-tag v-if="dirty" type="warning" size="small" round>未保存</n-tag>
        <n-tag v-else size="small" round>已保存</n-tag>
        <n-button size="small" type="primary" :loading="saving" :disabled="!dirty" @click="save">保存</n-button>
        <n-button size="small" :loading="exporting" @click="openExport">导出 PDF</n-button>
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
            <button class="si-mode" @click="toggleEditing">{{ editing ? "完成" : "编辑" }}</button>
          </div>
          <textarea
            v-if="editing"
            class="re-editor"
            :value="html"
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
          <div class="re-pane-head">让 AI 改</div>
          <div ref="chatBox" class="re-chat">
            <div v-if="!chatLog.length" class="si-chat-hint">
              <p class="si-chat-hint-title">让它改，或者直接问它意见</p>
              <ul class="si-chat-hint-list">
                <li>实习那段压缩到两行</li>
                <li>把 FlowMind 的技术栈补全</li>
                <li>这段实习会不会写太长了？</li>
                <li>几段经历里你觉得该突出哪个？</li>
              </ul>
              <p class="si-chat-hint-foot">要它改的，改完点「刷新预览」看效果；只是问它的话，它不会动你的简历。</p>
            </div>
            <div v-for="(entry, index) in chatLog" :key="index" class="si-chat-item" :class="entry.role">
              <span class="si-chat-who">{{ entry.role === "user" ? "我" : "AI" }}</span>
              <span>{{ entry.text }}</span>
            </div>
          </div>
          <div class="si-chat-box">
            <n-input
              v-model:value="instruction"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="Enter 发送，Shift+Enter 换行"
              :disabled="revising"
              @keydown.enter.exact.prevent="revise"
            />
            <n-button size="small" type="primary" :loading="revising" :disabled="!instruction.trim()" @click="revise">发送</n-button>
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
  </div>
</template>
