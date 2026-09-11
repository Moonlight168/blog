<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { NAlert, NButton, NCard, NEmpty, NInput, NSelect, NSpin, NTag, useMessage } from "naive-ui";
import { api } from "../api";
import type { Chapter, Message, Session, TopicSeries } from "../types";

const toast = useMessage();
const loading = ref(true);
const sending = ref(false);
const resumeDir = ref("G:\\handoff\\interview");
const resumes = ref<{ name: string; path: string }[]>([]);
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

const chapters = computed<Chapter[]>(() => topics.value.find((item) => item.name === series.value)?.chapters ?? []);
const active = computed(() => session.value?.status === "active");
const secondsLeft = computed(() => {
  if (!session.value) return 0;
  return Math.max(0, Math.floor((new Date(session.value.startedAt).getTime() + session.value.durationMinutes * 60_000 - now.value) / 1000));
});
const timerText = computed(() => `${String(Math.floor(secondsLeft.value / 60)).padStart(2, "0")}:${String(secondsLeft.value % 60).padStart(2, "0")}`);

async function loadBootstrap() {
  loading.value = true;
  try {
    const data = await api<{ resumeDir: string; resumes: typeof resumes.value; topics: TopicSeries[]; embeddingEnabled: boolean }>(`/api/bootstrap?resumeDir=${encodeURIComponent(resumeDir.value)}`);
    resumeDir.value = data.resumeDir; resumes.value = data.resumes; topics.value = data.topics; embeddingEnabled.value = data.embeddingEnabled;
    if (!resumePath.value && resumes.value.length) resumePath.value = resumes.value[0].path;
    if (!series.value && topics.value.length) series.value = topics.value[0].name;
    if (!chapterPath.value && chapters.value.length) chapterPath.value = chapters.value[0].path;
  } catch (error) { toast.error((error as Error).message); }
  finally { loading.value = false; }
}

async function restore() {
  const id = localStorage.getItem("interview-session");
  if (!id) return;
  try {
    const data = await api<{ session: Session; messages: Message[] }>(`/api/sessions/${id}`);
    session.value = data.session; messages.value = data.messages;
  } catch { localStorage.removeItem("interview-session"); }
}

async function start() {
  if (!resumePath.value || !series.value || !chapterPath.value) return toast.warning("请先选好简历和面试章节");
  sending.value = true;
  try {
    const data = await api<{ session: Session; messages: Message[] }>("/api/sessions", { method: "POST", body: JSON.stringify({ resumePath: resumePath.value, series: series.value, chapterPath: chapterPath.value, mode: mode.value, durationMinutes: durationMinutes.value }) });
    session.value = data.session; messages.value = data.messages;
    localStorage.setItem("interview-session", data.session.id);
    await scrollBottom();
  } catch (error) { toast.error((error as Error).message); }
  finally { sending.value = false; }
}

async function send(value = draft.value) {
  const content = value.trim();
  if (!content || !session.value || sending.value) return;
  draft.value = ""; sending.value = true;
  try {
    const data = await api<{ session: Session; messages: Message[] }>(`/api/sessions/${session.value.id}/messages`, { method: "POST", body: JSON.stringify({ content }) });
    session.value = data.session; messages.value = data.messages;
    if (data.session.status !== "active") localStorage.removeItem("interview-session");
    await scrollBottom();
  } catch (error) { draft.value = content; toast.error((error as Error).message); }
  finally { sending.value = false; }
}

async function scrollBottom() { await nextTick(); chat.value?.scrollTo({ top: chat.value.scrollHeight, behavior: "smooth" }); }
function newInterview() { session.value = null; messages.value = []; localStorage.removeItem("interview-session"); }

onMounted(async () => {
  await Promise.all([loadBootstrap(), restore()]);
  timer = window.setInterval(() => { now.value = Date.now(); }, 1000);
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
          <label>简历目录</label>
          <div class="inline"><n-input v-model:value="resumeDir" :disabled="active" /><n-button :disabled="active" @click="loadBootstrap">刷新</n-button></div>
          <label>已有简历</label>
          <n-select v-model:value="resumePath" :disabled="active" filterable :options="resumes.map(r => ({ label: r.name, value: r.path }))" />
          <label>Series</label>
          <n-select v-model:value="series" :disabled="active" :options="topics.map(s => ({ label: s.name, value: s.name }))" @update:value="chapterPath = topics.find(s => s.name === series)?.chapters[0]?.path || ''" />
          <label>章节（面试主题）</label>
          <n-select v-model:value="chapterPath" :disabled="active" filterable :options="chapters.map(c => ({ label: c.name, value: c.path }))" />
          <div class="two-cols">
            <div><label>面试形式</label><n-select v-model:value="mode" :disabled="active" :options="[{label:'技术面试',value:'interview'},{label:'编码面试',value:'coding'},{label:'书面测评',value:'written'}]" /></div>
            <div><label>时长</label><n-select v-model:value="durationMinutes" :disabled="active" :options="[15,30,45,60,90].map(v => ({label:`${v} 分钟`,value:v}))" /></div>
          </div>
          <n-alert :show-icon="false" type="info">查重：精确匹配 + FTS5 <span v-if="embeddingEnabled">+ 向量检索</span><span v-else>（未配置向量模型）</span></n-alert>
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
          <p>回答可以分多次发送。输入“下一题”时才会生成点评并归档；你也可以直接追问面试官。</p>
        </div>
        <article v-for="message in messages" :key="message.id" class="message" :class="[message.role, message.kind]">
          <div class="avatar">{{ message.role === 'user' ? '我' : 'AI' }}</div>
          <div class="bubble"><span v-if="message.kind === 'evaluation'" class="message-label">本题点评</span><div class="message-text">{{ message.content }}</div></div>
        </article>
      </div>
      <div class="composer" :class="{ disabled: !active }">
        <n-input v-model:value="draft" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" :disabled="!active" placeholder="输入回答、补充或追问；输入“下一题”生成点评并切题，输入“结束”完成面试" @keydown.ctrl.enter.prevent="send()" />
        <div class="composer-foot"><span>Ctrl + Enter 发送</span><n-button type="primary" :disabled="!active || !draft.trim()" :loading="sending" @click="send()">发送</n-button></div>
      </div>
    </section>
  </div>
</template>
