<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { NAlert, NButton, NCard, NEmpty, NInput, NModal, NSelect, NSpin, NTag, useMessage } from "naive-ui";
import { api } from "../api";
import { renderMarkdown } from "../markdown";
import type { Chapter, Message, Session, TopicSeries } from "../types";

const toast = useMessage();
// 模型输出一律按 markdown 渲染（含中文紧贴加粗的处理，见 src/markdown.ts）
const loading = ref(true);
const sending = ref(false);
const resumeDir = ref("");
const savingDir = ref(false);
const resumes = ref<{ name: string; path: string; dir: string }[]>([]);
const jobs = ref<{ name: string; path: string }[]>([]);
const resumeGroup = ref("");
const jdPath = ref("");
// 目标岗位只在「岗位定制」模式下用得上，其它模式一律为空
const jdOptions = computed(() => jobs.value.map((job) => ({ label: job.name, value: job.path })));
const topics = ref<TopicSeries[]>([]);
const embeddingEnabled = ref(false);
const resumePath = ref("");
const series = ref("");
const chapterPath = ref("");
const mode = ref("interview");
const durationMinutes = ref(30);
const session = ref<Session | null>(null);
const messages = ref<Message[]>([]);
const draft = ref("");
const chat = ref<HTMLElement>();
const now = ref(Date.now());
let timer: number | undefined;
let lastExpirySync = 0;

const chapters = computed<Chapter[]>(() => topics.value.find((item) => item.name === series.value)?.chapters ?? []);
/** 岗位定制模式：按目标岗位 + 简历出题，不需要（也不校验）知识分类与章节 */
const jdMode = computed(() => mode.value === "jd");
// 简历按一级子目录（每个人一个目录）分组，先选目录再看该目录下的简历
const resumeGroups = computed(() => [...new Set(resumes.value.map((item) => item.dir))]);
const visibleResumes = computed(() => (resumeGroup.value ? resumes.value.filter((item) => item.dir === resumeGroup.value) : resumes.value));
// 只列 HTML 简历本体，显示名去掉后缀（如「黄锦锋-Java后端(AI应用)-27届」）
const visibleResumeOptions = computed(() => visibleResumes.value.map((item) => ({
  label: (item.name.split("/").slice(1).join("/") || item.name).replace(/\.[^.]+$/, ""),
  value: item.path,
})));

/** 目录变化或重扫后，保证「目录」和「已选简历」都落在有效值上；preferred 是要优先恢复的简历。 */
function syncResumeSelection(preferred?: string) {
  if (!resumeGroups.value.includes(resumeGroup.value)) resumeGroup.value = resumeGroups.value[0] ?? "";
  const target = preferred ?? resumePath.value;
  resumePath.value = visibleResumes.value.some((item) => item.path === target)
    ? target
    : (visibleResumes.value[0]?.path ?? "");
}

/** 上次选好的简历 / 章节 / 形式 / JD，避免每次打开配置面板都重选一遍。 */
interface SetupPrefs {
  resumeGroup?: string; resumePath?: string; series?: string;
  chapterPath?: string; mode?: string; durationMinutes?: number; jdPath?: string;
}
const PREFS_KEY = "interview-setup";
function loadPrefs(): SetupPrefs {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") as SetupPrefs; }
  catch { return {}; }
}
function savePrefs() {
  const prefs: SetupPrefs = {
    resumeGroup: resumeGroup.value, resumePath: resumePath.value, series: series.value,
    chapterPath: chapterPath.value, mode: mode.value, durationMinutes: durationMinutes.value,
    jdPath: jdPath.value,
  };
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
const active = computed(() => session.value?.status === "active");
const secondsLeft = computed(() => {
  if (!session.value) return 0;
  return Math.max(0, Math.floor((new Date(session.value.startedAt).getTime() + session.value.durationMinutes * 60_000 - now.value) / 1000));
});
const timerText = computed(() => `${String(Math.floor(secondsLeft.value / 60)).padStart(2, "0")}:${String(secondsLeft.value % 60).padStart(2, "0")}`);

async function loadBootstrap() {
  loading.value = true;
  try {
    const data = await api<{ resumeDir: string; resumes: typeof resumes.value; jobs: typeof jobs.value; topics: TopicSeries[]; embeddingEnabled: boolean }>("/api/bootstrap");
    resumeDir.value = data.resumeDir; resumes.value = data.resumes; jobs.value = data.jobs ?? []; topics.value = data.topics; embeddingEnabled.value = data.embeddingEnabled;

    // 恢复上次的选择；只有失效了（简历被删、章节改名、JD 被删）才退回第一项
    const prefs = loadPrefs();
    resumeGroup.value = resumeGroups.value.includes(prefs.resumeGroup ?? "") ? (prefs.resumeGroup ?? "") : (resumeGroups.value[0] ?? "");
    syncResumeSelection(prefs.resumePath || undefined);
    jdPath.value = jobs.value.some((job) => job.path === prefs.jdPath) ? (prefs.jdPath ?? "") : "";
    if (prefs.mode) mode.value = prefs.mode;
    // 分类/章节始终恢复到上次的值（岗位定制模式下只是不显示，切回来就能接着用）
    series.value = topics.value.some((item) => item.name === prefs.series) ? (prefs.series ?? "") : (topics.value[0]?.name ?? "");
    chapterPath.value = chapters.value.some((item) => item.path === prefs.chapterPath) ? (prefs.chapterPath ?? "") : (chapters.value[0]?.path ?? "");
    if (prefs.durationMinutes) durationMinutes.value = prefs.durationMinutes;
  } catch (error) { toast.error((error as Error).message); }
  finally { loading.value = false; }
}

/** 预览选中简历转换后的 Markdown——即模型实际会看到的内容。 */
const previewOpen = ref(false);
const previewText = ref("");
const previewLoading = ref(false);
async function openPreview() {
  if (!resumePath.value) return toast.warning("请先选择简历");
  previewLoading.value = true;
  try {
    const data = await api<{ markdown: string; chars: number }>("/api/resume/preview", {
      method: "POST",
      body: JSON.stringify({ path: resumePath.value }),
    });
    previewText.value = data.markdown;
    previewOpen.value = true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "预览失败");
  } finally { previewLoading.value = false; }
}

/** 把页面上的简历目录写回 interview/.env，并重新扫描该目录。 */
async function saveResumeDir() {
  const dir = resumeDir.value.trim();
  if (!dir) return toast.warning("请先填写简历目录");
  savingDir.value = true;
  try {
    const data = await api<{ resumeDir: string; resumes: typeof resumes.value; jobs: typeof jobs.value }>("/api/config/resume-dir", {
      method: "POST",
      body: JSON.stringify({ dir }),
    });
    resumeDir.value = data.resumeDir;
    resumes.value = data.resumes;
    jobs.value = data.jobs ?? [];
    if (!jobs.value.some((job) => job.path === jdPath.value)) jdPath.value = "";
    syncResumeSelection();
    toast.success(`已保存，该目录下找到 ${data.resumes.length} 份简历`);
  } catch (error) { toast.error((error as Error).message); }
  finally { savingDir.value = false; }
}

async function restore() {
  const id = localStorage.getItem("interview-session");
  if (!id) return;
  try {
    const data = await api<{ session: Session; messages: Message[] }>(`/api/sessions/${id}`);
    session.value = data.session; messages.value = data.messages;
    // 面板跟着进行中的会话走，否则显示的是上次的选择、和当前面试对不上
    if (data.session.series) series.value = data.session.series;
    if (data.session.chapterPath) chapterPath.value = data.session.chapterPath;
    const group = resumeGroups.value.find((name) => resumes.value.some((item) => item.dir === name && item.path === data.session.resumePath));
    if (group) { resumeGroup.value = group; syncResumeSelection(data.session.resumePath); }
  } catch { localStorage.removeItem("interview-session"); }
}

async function syncExpiredSession() {
  if (!session.value || Date.now() - lastExpirySync < 5_000) return;
  lastExpirySync = Date.now();
  try {
    const data = await api<{ session: Session; messages: Message[] }>(`/api/sessions/${session.value.id}`);
    session.value = data.session; messages.value = data.messages;
    if (data.session.status !== "active") localStorage.removeItem("interview-session");
  } catch { /* 下一次轮询重试 */ }
}

async function start() {
  if (!resumePath.value || !series.value || !chapterPath.value) return toast.warning("请先选好简历和面试章节");
  sending.value = true;
  try {
    const data = await api<{ session: Session; messages: Message[] }>("/api/sessions", { method: "POST", body: JSON.stringify({ resumePath: resumePath.value, series: series.value, chapterPath: chapterPath.value, mode: mode.value, durationMinutes: durationMinutes.value, jdPath: jdPath.value }) });
    session.value = data.session; messages.value = data.messages;
    localStorage.setItem("interview-session", data.session.id);
    await scrollBottom();
  } catch (error) { toast.error((error as Error).message); }
  finally { sending.value = false; }
}

async function submit(body: Record<string, unknown>, restoreDraft?: () => void) {
  if (!session.value || sending.value) return;
  sending.value = true;
  try {
    const data = await api<{ session: Session; messages: Message[] }>(`/api/sessions/${session.value.id}/messages`, { method: "POST", body: JSON.stringify(body) });
    session.value = data.session; messages.value = data.messages;
    if (data.session.status !== "active") localStorage.removeItem("interview-session");
    await scrollBottom();
  } catch (error) { restoreDraft?.(); toast.error((error as Error).message); }
  finally { sending.value = false; }
}

async function send(value = draft.value) {
  const content = value.trim();
  if (!content) return;
  const previous = draft.value;
  draft.value = "";
  await submit({ content }, () => { draft.value = previous; });
}

/** 「下一题」「结束」是明确动作，直接告诉服务端，不经过模型判断。 */
async function act(action: "next" | "end") {
  await submit({ action });
}

async function scrollBottom() { await nextTick(); chat.value?.scrollTo({ top: chat.value.scrollHeight, behavior: "smooth" }); }
function newInterview() { session.value = null; messages.value = []; localStorage.removeItem("interview-session"); }

// 切换模式时**不动** series/chapterPath/jdPath 的真实值，只让选择框显示成空
//（见下面模板的 :value），这样来回切换能保留各自上次的选择。
function pickSeries(value: string) {
  series.value = value;
  chapterPath.value = topics.value.find((item) => item.name === value)?.chapters[0]?.path ?? "";
}
function pickChapter(value: string) { chapterPath.value = value; }

// 任何一项改动都自动记住，下次打开直接恢复
watch([resumeGroup, resumePath, series, chapterPath, mode, durationMinutes, jdPath], savePrefs);

onMounted(async () => {
  // 必须先拿到简历/章节列表，restore() 才能把面板对齐到会话的真实选择
  await loadBootstrap();
  await restore();
  timer = window.setInterval(() => {
    now.value = Date.now();
    if (active.value && secondsLeft.value === 0) void syncExpiredSession();
  }, 1000);
});
onBeforeUnmount(() => window.clearInterval(timer));
</script>

<template>
  <div class="workspace">
    <aside class="config-panel">
      <div class="eyebrow">INTERVIEW SETUP</div>
      <h1>配置本次面试</h1>
      <p class="muted">选择简历和知识章节，面试官会围绕真实经历逐题深挖。</p>
      <n-spin :show="loading">
        <div class="form-stack">
          <label>简历根目录</label>
          <div class="inline"><n-input v-model:value="resumeDir" :disabled="active" placeholder="简历所在目录的绝对路径" /><n-button :disabled="active" :loading="savingDir" @click="saveResumeDir">保存并刷新</n-button></div>
          <label>人员目录</label>
          <n-select v-model:value="resumeGroup" :disabled="active" :options="resumeGroups.map(g => ({ label: g, value: g }))" @update:value="syncResumeSelection" />
          <label>已有简历</label>
          <div class="inline">
            <n-select v-model:value="resumePath" :disabled="active" filterable :consistent-menu-width="false" :options="visibleResumeOptions" />
            <n-button size="small" :disabled="active || !resumePath" :loading="previewLoading" @click="openPreview">预览</n-button>
          </div>
          <label>目标岗位</label>
          <n-select :value="jdMode ? jdPath : ''" :disabled="active || !jdMode" :placeholder="jdMode ? '请选择目标岗位' : '仅岗位定制需要'"
            :consistent-menu-width="false" :options="jdOptions" @update:value="(value: string) => { jdPath = value; }" />
          <label>知识分类</label>
          <n-select :value="jdMode ? '' : series" :disabled="active || jdMode" :placeholder="jdMode ? '岗位定制不需要选' : ''" :options="topics.map(s => ({ label: s.name, value: s.name }))" @update:value="pickSeries" />
          <label>章节（面试主题）</label>
          <n-select :value="jdMode ? '' : chapterPath" :disabled="active || jdMode" :placeholder="jdMode ? '岗位定制不需要选' : ''" filterable :options="chapters.map(c => ({ label: c.name, value: c.path }))" @update:value="pickChapter" />
          <div class="two-cols">
            <div><label>面试形式</label><n-select v-model:value="mode" :disabled="active" :options="[{label:'技术面试',value:'interview'},{label:'编码面试',value:'coding'},{label:'书面测评',value:'written'},{label:'岗位定制',value:'jd'}]" /></div>
            <div><label>时长</label><n-select v-model:value="durationMinutes" :disabled="active" :options="[15,30,45,60,90].map(v => ({label:`${v} 分钟`,value:v}))" /></div>
          </div>
          <n-alert :show-icon="false" type="info">查重：精确匹配 + 关键词匹配 <span v-if="embeddingEnabled">+ 向量检索</span><span v-else>（未配置向量模型）</span></n-alert>
          <n-button v-if="!session" type="primary" size="large" :loading="sending" block @click="start">开始面试</n-button>
          <n-button v-else-if="session.status !== 'active'" size="large" block @click="newInterview">开始新面试</n-button>
        </div>
      </n-spin>
    </aside>

    <section class="chat-panel">
      <div class="chat-head">
        <div><div class="eyebrow">LIVE SESSION</div><h2>{{ session ? `${session.series} · ${session.chapterPath.split('/').at(-1)?.replace('.md','')}` : '等待开始' }}</h2></div>
        <div class="session-meta"><n-tag v-if="session" :type="active ? 'success' : 'default'">{{ active ? '进行中' : '已结束' }}</n-tag><span v-if="active" class="timer">{{ timerText }}</span></div>
      </div>
      <div ref="chat" class="messages">
        <div v-if="!messages.length" class="welcome">
          <div class="welcome-orb">问</div><h2>准备好，把理解说出来</h2>
          <p>每条回答都会立刻得到点评和标准答案。有疑问可以直接追问，答完点「下一题」。</p>
        </div>
        <article v-for="message in messages" :key="message.id" class="message" :class="[message.role, message.kind]">
          <div class="avatar">{{ message.role === 'user' ? '我' : 'AI' }}</div>
          <div class="bubble">
            <span v-if="message.kind === 'evaluation'" class="message-label">本题点评</span>
            <span v-else-if="message.kind === 'answer'" class="message-label">标准答案</span>
            <span v-else-if="message.kind === 'notice'" class="message-label">提示</span>
            <span v-else-if="message.kind === 'summary'" class="message-label">本场总评</span>
            <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
            <!-- 模型输出按 markdown 渲染；用户自己打的内容保持原文，免得被当成语法 -->
            <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
            <div v-if="message.role === 'assistant'" class="message-text" v-html="renderMarkdown(message.content)" />
            <div v-else class="message-text">{{ message.content }}</div>
          </div>
        </article>
      </div>
      <div class="composer" :class="{ disabled: !active }">
        <n-input v-model:value="draft" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" :disabled="!active" placeholder="输入你的回答，或直接追问" @keydown.ctrl.enter.prevent="send()" />
        <div class="composer-foot">
          <span>Ctrl + Enter 发送</span>
          <div class="composer-actions">
            <n-button :disabled="!active || sending" @click="act('end')">结束</n-button>
            <n-button :disabled="!active || sending" @click="act('next')">下一题</n-button>
            <n-button type="primary" :disabled="!active || !draft.trim()" :loading="sending" @click="send()">发送</n-button>
          </div>
        </div>
      </div>
    </section>

    <n-modal v-model:show="previewOpen" preset="card" style="width: 900px; max-width: 92vw" title="简历预览">
      <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
      <div class="preview-body" v-html="renderMarkdown(previewText)" />
    </n-modal>
  </div>
</template>
