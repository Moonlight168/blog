import { computed, ref, watch } from "vue";
import { useMessage } from "naive-ui";

import type { Message } from "../../shared/types.ts";

/**
 * 面试官提问的朗读。
 *
 * 从 InterviewWorkspace 里抽出来：这一块跟会话、答题、语音输入都不相干，
 * 只认「消息列表」这一样东西，所以能整块搬走。
 */

/**
 * 音色优先级：装了神经网络音色就优先用（最接近豆包那种质感），没有就退到系统里
 * 最好的中文音色，最后随便挑一个中文的。注意这条链的上限取决于系统装了什么音色。
 */
const VOICE_PREFERENCE = [
  /xiaoxiao|xiaoyi|xiaomeng/i,   // 微软神经网络女声 / Edge 自然音色
  /natural|neural|online/i,      // 其它标注为自然、神经网络的音色
  /yunxi|yunyang|yunjian/i,      // 微软神经网络男声
  /huihui|yaoyao/i,              // SAPI 老版中文女声
  /zh[-_]?cn/i,                  // 兜底：任意中文音色
];

/** 把 markdown 洗成能念的纯文本：代码块、记号、链接目标都得去掉，否则会念出星号和括号。 */
export function toSpeechText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "（代码略）")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function useSpeechSynthesis(messages: { value: Message[] }) {
  const toast = useMessage();
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  /** 自动朗读开关（默认开）：只决定「提问」要不要自动读 */
  const autoSpeak = ref(true);
  /** 正在朗读的消息 id；null 表示没在朗读 */
  const speakingId = ref<number | null>(null);
  const speakingPaused = ref(false);
  /** 消息水位：只朗读比它更新的消息，免得刷新恢复历史时把旧题从头念一遍 */
  const spokenThrough = ref(0);
  /** 朗读语速：默认 1.0 偏慢，1.3 更接近正常语速；可在配置面板里调 */
  const speakRate = ref(1.3);
  const SPEAK_RATE_OPTIONS = [1, 1.2, 1.3, 1.5, 1.8, 2].map((value) => ({ label: `${value}x`, value }));

  /** getVoices() 首次可能是空的（异步加载），先缓存一份，voiceschanged 时刷新 */
  let cachedVoices: SpeechSynthesisVoice[] = [];
  function refreshVoices() { cachedVoices = window.speechSynthesis.getVoices(); }
  if (ttsSupported) {
    refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
  }

  function pickVoice(): SpeechSynthesisVoice | undefined {
    const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
    const zh = voices.filter((item) => item.lang.toLowerCase().startsWith("zh"));
    if (!zh.length) return undefined;
    for (const pattern of VOICE_PREFERENCE) {
      const hit = zh.find((item) => pattern.test(item.name));
      if (hit) return hit;
    }
    return zh[0];
  }

  const isSpeaking = (message: Message) => speakingId.value !== null && speakingId.value === message.id;

  /** 同一时刻只允许一条在念：开新的之前先取消旧的。 */
  function speak(message: Message) {
    if (!ttsSupported) return;
    const text = toSpeechText(message.content);
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = speakRate.value;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    const id = message.id ?? null;
    const finish = () => { if (speakingId.value === id) { speakingId.value = null; speakingPaused.value = false; } };
    utterance.onend = finish;
    utterance.onerror = finish;
    speakingId.value = id;
    speakingPaused.value = false;
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeak() {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    speakingId.value = null;
    speakingPaused.value = false;
  }

  /** 点喇叭：正在念这条 → 暂停；暂停中 → 继续；否则从头念这条。 */
  function toggleSpeak(message: Message) {
    if (!ttsSupported) return toast.warning("当前浏览器不支持语音朗读");
    const id = message.id ?? null;
    if (speakingId.value === id) {
      if (speakingPaused.value) { window.speechSynthesis.resume(); speakingPaused.value = false; }
      else { window.speechSynthesis.pause(); speakingPaused.value = true; }
      return;
    }
    speak(message);
  }

  // 新消息到达：只自动念「面试官提问」，历史恢复带进来的旧消息不念
  watch(() => messages.value.map((item) => item.id ?? 0).join(","), () => {
    const latestId = messages.value.at(-1)?.id ?? 0;
    if (latestId <= spokenThrough.value) return;
    const fresh = messages.value.filter((item) => (item.id ?? 0) > spokenThrough.value);
    spokenThrough.value = latestId;
    if (!autoSpeak.value) return;
    const question = [...fresh].reverse().find((item) => item.role === "assistant" && item.kind === "question");
    if (question) speak(question);
  });

  // 关掉自动朗读时，正在念的那条也一起停掉
  watch(autoSpeak, (on) => { if (!on) stopSpeak(); });

  return {
    ttsSupported,
    autoSpeak, speakingId, speakingPaused, spokenThrough, speakRate, SPEAK_RATE_OPTIONS,
    isSpeaking, speak, stopSpeak, toggleSpeak,
  };
}
