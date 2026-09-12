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
const paused = computed(() => session.value?.status === "paused");
/** 已结束（既不是进行中也不是暂停中）；localStorage 清理与「开始新面试」都只看它 */
const finished = computed(() => !!session.value && !active.value && !paused.value);
/** 配置面板在会话存活期间一律锁住——暂停只是停表，不代表可以换简历和章节 */
const locked = computed(() => active.value || paused.value);
const statusText = computed(() => (active.value ? "进行中" : paused.value ? "已暂停" : "已结束"));
const statusType = computed(() => (active.value ? "success" : paused.value ? "warning" : "default"));
const secondsLeft = computed(() => {
  if (!session.value) return 0;
  const s = session.value;
  // 与 server/session-time.mjs 同一套规则：扣除累计暂停与「当前这次」暂停。
  // 暂停期间 now 被减掉，结果恒定，倒计时自然冻住。
  const elapsed = now.value - new Date(s.startedAt).getTime() - (s.pausedMs ?? 0)
    - (s.pausedAt ? now.value - new Date(s.pausedAt).getTime() : 0);
  return Math.max(0, Math.floor((s.durationMinutes * 60_000 - elapsed) / 1000));
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

/**
 * 语音输入：长按空格说话、松开结束。
 * 用浏览器内置的语音识别（Web Speech API）——零成本、零依赖、无需后端。
 * 注意它在 Chrome 下走 Google 服务器（国内不通），Edge 走 Microsoft 一般可用。
 */
const speechCtor = computed(() => ((window as any).webkitSpeechRecognition ?? (window as any).SpeechRecognition) as (new () => any) | undefined);
const listening = ref(false);
const interimText = ref("");
let recognition: any = null;
let holdTimer: number | undefined;
// 这次按住空格是否已被语音输入接管。接管后所有自动重复的 keydown 都必须拦掉默认行为，
// 否则浏览器会在输入框里连续插入空格——「长按一直出空格」就是这么来的。
let spaceHeld = false;

function startVoice() {
  const Ctor = speechCtor.value;
  if (!Ctor) return;
  recognition = new Ctor();
  recognition.lang = "zh-CN";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = (event: any) => {
    let finalText = "";
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal) finalText += result[0].transcript;
      else interim += result[0].transcript;
    }
    if (finalText) draft.value += finalText;
    interimText.value = interim;
  };
  recognition.onerror = (event: any) => {
    listening.value = false; interimText.value = "";
    toast.error(event.error === "network"
      ? "语音识别连不上服务（Chrome 走 Google 服务器，国内不可用）——改用 Edge 打开即可"
      : `语音识别失败：${event.error}`);
  };
  recognition.onend = () => { listening.value = false; interimText.value = ""; };
  listening.value = true;
  recognition.start();
}

function stopVoice() {
  if (!listening.value) return;
  try { recognition?.stop(); } catch { /* 已经停了 */ }
  listening.value = false;
  interimText.value = "";
}

/** 松开、失焦或卸载时收尾：清定时器、交还空格、停止识别。 */
function releaseSpace() {
  if (holdTimer) { window.clearTimeout(holdTimer); holdTimer = undefined; }
  spaceHeld = false;
  stopVoice();
}

/**
 * 输入框只挂一个 keydown：naive-ui 把 onKeydown 声明成 Function 属性，
 * 同一元素上写两个 @keydown 会被 Vue 合成数组，触发 prop 类型告警。
 * Ctrl/Cmd + Enter 发送，其余交给空格长按语音。
 */
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    void send();
    return;
  }
  onSpaceDown(event);
}

/** 长按空格开始、松开结束；只有输入框为空或光标在开头时才抢空格，否则正常输入。 */
function onSpaceDown(event: KeyboardEvent) {
  if (event.code !== "Space" || event.isComposing) return;
  // 长按产生的重复事件：已接管就必须在这里 preventDefault，不能先 return 再补
  if (event.repeat) {
    if (spaceHeld) event.preventDefault();
    return;
  }
  const el = event.target as HTMLTextAreaElement;
  const atStart = el.selectionStart === 0 && el.selectionEnd === 0;
  if (el.value.trim() !== "" && !atStart) return;
  // 不支持语音的浏览器不要抢空格：抢了就是空格被吞、长按还照样连续输入，反而碍事
  if (!speechCtor.value) {
    toast.warning("当前浏览器不支持内置语音识别——用 Edge 打开这个页面即可");
    return;
  }
  event.preventDefault();
  spaceHeld = true;
  holdTimer = window.setTimeout(() => startVoice(), 300);
}
function onSpaceUp(event: KeyboardEvent) {
  if (event.code !== "Space") return;
  releaseSpace();
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
    if (!["active", "paused"].includes(data.session.status)) localStorage.removeItem("interview-session");
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

/** 返回是否成功，调用方（如结束确认弹窗）据此决定要不要关窗。 */
async function submit(body: Record<string, unknown>, restoreDraft?: () => void) {
  if (!session.value || sending.value) return false;
  sending.value = true;
  try {
    const data = await api<{ session: Session; messages: Message[] }>(`/api/sessions/${session.value.id}/messages`, { method: "POST", body: JSON.stringify(body) });
    session.value = data.session; messages.value = data.messages;
    // 暂停中的会话刷新后要能接着暂停，所以只有真正结束才清掉
    if (!["active", "paused"].includes(data.session.status)) localStorage.removeItem("interview-session");
    await scrollBottom();
    return true;
  } catch (error) { restoreDraft?.(); toast.error((error as Error).message); return false; }
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
  return submit({ action });
}

/** 暂停 / 继续：服务端只改状态与暂停计时，不调用模型。 */
const pausing = ref(false);
async function togglePause() {
  if (!session.value || sending.value || pausing.value || finished.value) return;
  const action = paused.value ? "resume" : "pause";
  pausing.value = true;
  try {
    const data = await api<{ session: Session; messages: Message[] }>(`/api/sessions/${session.value.id}/${action}`, { method: "POST" });
    session.value = data.session;
    toast.success(action === "pause" ? "已暂停，计时停住了" : "继续面试");
  } catch (error) { toast.error((error as Error).message); }
  finally { pausing.value = false; }
}

/** 结束面试前先问一句：这场要不要留下记录。 */
const endConfirmOpen = ref(false);
const discarding = ref(false);

/** 保存并结束：走正常结束流程，服务端会生成总评并写入面试历史。 */
async function endAndSave() {
  if (await act("end")) endConfirmOpen.value = false;
}

/** 不保存结束：直接丢弃本场会话记录，不生成总评；答题时已归档进知识库的题目不受影响。 */
async function endAndDiscard() {
  if (!session.value || discarding.value) return;
  discarding.value = true;
  try {
    await api(`/api/sessions/${session.value.id}/discard`, { method: "POST" });
    endConfirmOpen.value = false;
    newInterview();
    toast.success("已结束，本场面试未写入历史");
  } catch (error) { toast.error((error as Error).message); }
  finally { discarding.value = false; }
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
onBeforeUnmount(() => { window.clearInterval(timer); releaseSpace(); });
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
          <div class="inline"><n-input v-model:value="resumeDir" :disabled="locked" placeholder="简历所在目录的绝对路径" /><n-button :disabled="locked" :loading="savingDir" @click="saveResumeDir">保存并刷新</n-button></div>
          <label>人员目录</label>
          <n-select v-model:value="resumeGroup" :disabled="locked" :options="resumeGroups.map(g => ({ label: g, value: g }))" @update:value="syncResumeSelection" />
          <label>已有简历</label>
          <div class="inline">
            <n-select v-model:value="resumePath" :disabled="locked" filterable :consistent-menu-width="false" :options="visibleResumeOptions" />
            <n-button :disabled="!resumePath" :loading="previewLoading" @click="openPreview">预览</n-button>
          </div>
          <label>目标岗位</label>
          <n-select :value="jdMode ? jdPath : ''" :disabled="locked || !jdMode" :placeholder="jdMode ? '请选择目标岗位' : '仅岗位定制需要'"
            :consistent-menu-width="false" :options="jdOptions" @update:value="(value: string) => { jdPath = value; }" />
          <label>知识分类</label>
          <n-select :value="jdMode ? '' : series" :disabled="locked || jdMode" :placeholder="jdMode ? '岗位定制不需要选' : ''" :options="topics.map(s => ({ label: s.name, value: s.name }))" @update:value="pickSeries" />
          <label>章节（面试主题）</label>
          <n-select :value="jdMode ? '' : chapterPath" :disabled="locked || jdMode" :placeholder="jdMode ? '岗位定制不需要选' : ''" filterable :options="chapters.map(c => ({ label: c.name, value: c.path }))" @update:value="pickChapter" />
          <div class="two-cols">
            <div><label>面试形式</label><n-select v-model:value="mode" :disabled="locked" :options="[{label:'技术面试',value:'interview'},{label:'编码面试',value:'coding'},{label:'书面测评',value:'written'},{label:'岗位定制',value:'jd'}]" /></div>
            <div><label>时长</label><n-select v-model:value="durationMinutes" :disabled="locked" :options="[15,30,45,60,90].map(v => ({label:`${v} 分钟`,value:v}))" /></div>
          </div>
          <n-alert :show-icon="false" type="info">查重：精确匹配 + 关键词匹配 <span v-if="embeddingEnabled">+ 向量检索</span><span v-else>（未配置向量模型）</span></n-alert>
          <n-button v-if="!session" type="primary" size="large" :loading="sending" block @click="start">开始面试</n-button>
          <n-button v-else-if="finished" size="large" block @click="newInterview">开始新面试</n-button>
        </div>
      </n-spin>
    </aside>

    <section class="chat-panel">
      <div class="chat-head">
        <div><div class="eyebrow">LIVE SESSION</div><h2>{{ session ? `${session.series} · ${session.chapterPath.split('/').at(-1)?.replace('.md','')}` : '等待开始' }}</h2></div>
        <div class="session-meta"><n-tag v-if="session" :type="statusType">{{ statusText }}</n-tag><span v-if="session && !finished" class="timer" :class="{ paused }">{{ timerText }}</span></div>
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
        <n-input v-model:value="draft" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" :disabled="!active" placeholder="输入你的回答，或直接追问（长按空格可以说话）"
          @keydown="onKeydown" @keyup="onSpaceUp" @blur="releaseSpace" />
        <div v-if="listening" class="voice-hint">
          <span class="voice-dot" />正在听…松开空格结束
          <span v-if="interimText" class="voice-interim">{{ interimText }}</span>
        </div>
        <div class="composer-foot">
          <span>Ctrl + Enter 发送 · 长按空格语音输入</span>
          <div class="composer-actions">
            <n-button :disabled="!session || finished || sending" :loading="pausing" @click="togglePause">{{ paused ? '继续' : '暂停' }}</n-button>
            <n-button :disabled="!active || sending || pausing" @click="endConfirmOpen = true">结束</n-button>
            <n-button :disabled="!active || sending || pausing" @click="act('next')">下一题</n-button>
            <n-button type="primary" :disabled="!active || !draft.trim() || pausing" :loading="sending" @click="send()">发送</n-button>
          </div>
        </div>
      </div>
    </section>

    <n-modal v-model:show="previewOpen" preset="card" style="width: 900px; max-width: 92vw" title="简历预览">
      <!-- eslint-disable-next-line vue/no-v-html -- markdown-it 以 html:false 渲染，已转义原始 HTML -->
      <div class="preview-body" v-html="renderMarkdown(previewText)" />
    </n-modal>

    <n-modal v-model:show="endConfirmOpen" preset="dialog" title="结束本次面试？"
      :mask-closable="!sending && !discarding" :closable="!sending && !discarding">
      <div class="end-confirm-body">
        <p><strong>保存</strong>后可以在「面试历史」里回看本场的题目、点评与总评。</p>
        <p><strong>不保存</strong>会直接丢弃本场会话记录，也不生成总评；答题过程中已归档进知识库的题目不受影响。</p>
      </div>
      <template #action>
        <n-button :disabled="sending || discarding" @click="endConfirmOpen = false">取消</n-button>
        <n-button type="warning" :disabled="sending || discarding" :loading="discarding" @click="endAndDiscard">不保存结束</n-button>
        <n-button type="primary" :disabled="discarding" :loading="sending" @click="endAndSave">保存并结束</n-button>
      </template>
    </n-modal>
  </div>
</template>
