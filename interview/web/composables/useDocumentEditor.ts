import { computed, nextTick, ref, watch } from "vue";
import { useMessage } from "naive-ui";

import { api, apiStream } from "../api";
import { API, type DocumentKind } from "../../shared/routes.ts";
import { EVENT } from "../../shared/events.ts";

/**
 * 两个编辑页共用的那一套：未保存语义、版本栈、对话 + 流式改稿、放弃改动、历史面板状态。
 *
 * 原先这些在 ResumeEditor 和 SelfIntro 里各写一遍（两页 59 个 script 成员里 43 个同名），
 * 改一处要记得改两处。页面各自保留自己特有的部分：
 * 简历那边是 PDF 预览 / 导出 / 分栏，自我介绍那边是 markdown 预览。
 *
 * **返回的 ref 由页面按原名解构**（`const { content: html, ... } = useDocumentEditor(...)`），
 * 这样模板一个字都不用改。
 */

/** 服务端从提交信息里拆好的字段（见 server/infra/git/subject.ts） */
export interface Commit {
  hash: string; date: string; subject: string; added: number; deleted: number;
  version: string; title: string; points: string[]; dateText: string; dateFull: string;
}

export interface ReviseContext {
  changed: boolean;
  /** 改之前的内容（自我介绍用它判断链路锚点有没有被弄丢） */
  before: string;
  /** 改之后的内容 */
  after: string;
  /** 模型自己说的话 */
  reply: string;
  action: string;
}

export interface DocumentEditorOptions {
  kind: DocumentKind;
  /** 恢复 / 放弃改动之后刷新预览（简历要重渲染 PDF） */
  afterRestore?: () => void | Promise<void>;
  /** 改稿回来之后（简历刷 PDF；自我介绍切回预览） */
  afterRevise?: (changed: boolean) => void | Promise<void>;
  /** 阅读历史某一版（两边渲染方式不同，各自实现） */
  previewCommit?: (hash: string) => void | Promise<void>;
  /**
   * 决定「助手那条消息」显示什么。
   * 自我介绍用它把「链路锚点丢了」这件事说出来；简历用默认文案。
   */
  replyText?: (ctx: ReviseContext) => string;
}

export function useDocumentEditor({ kind, afterRestore, afterRevise, previewCommit, replyText }: DocumentEditorOptions) {
  const toast = useMessage();

  // ---- 当前文档 ----
  /** 正文。页面解构成 html / markdown 用 */
  const content = ref("");
  const file = ref("");
  const name = ref("");
  const filePath = ref("");

  /**
   * 上次落盘的内容——用它判断「未保存」。
   * 光比 content 和 saved 不够：刷新页面后两者都从磁盘重新读，看着就成「已保存」了，
   * 可那份内容其实还没记进历史。uncommitted 由服务端按 git 算，刷新也带得回来。
   */
  const saved = ref("");
  const uncommitted = ref(false);
  /** 载入时的文件 mtime；服务端用它识别「编辑期间被别处改过」 */
  const baseMtime = ref<number | null>(null);

  const dirty = computed(() => content.value !== saved.value || uncommitted.value);
  /**
   * 编辑器里改过、还没落盘。和 dirty 不是一回事：恢复过一版之后 dirty 也是 true，
   * 但那份内容**已经在盘上**了。syncFromDisk 要判断的是「缓冲区里有没有还没落盘的东西」，
   * 用 dirty 会让它恢复后永远不肯重读磁盘。
   */
  const edited = computed(() => content.value !== saved.value);

  /**
   * 载入 / 重新载入之后把状态一次性对齐。
   *
   * **对话必须在这里读、不能在页面里提前读**：chatKey() 是按 file 拼的，
   * 文件还没定下来时读到的键是上一份的（首次是空后缀），拿到空数组本身是一次变化，
   * 会触发下面的 deep watcher 把 [] 写进**正确**的那把键 —— 等于打开页面就清空对话。
   */
  function applyLoaded(next: { file: string; name: string; path: string; content: string; mtime: number | null; uncommitted: boolean }) {
    file.value = next.file;
    name.value = next.name;
    filePath.value = next.path;
    content.value = next.content;
    saved.value = next.content;
    uncommitted.value = next.uncommitted;
    baseMtime.value = next.mtime;
    resetVersions(next.content);
    loadChat();
  }

  // ---- 回撤 / 前进 ----
  /**
   * 模型改写、历史回滚都立即入栈；手动输入等停手 800ms 再入栈，
   * 否则每敲一个字都压一个版本，回撤一次只退一个字符。
   */
  const versions = ref<string[]>([]);
  const cursor = ref(-1);
  let snapshotTimer = 0;

  function resetVersions(value: string) { versions.value = [value]; cursor.value = 0; }
  function pushVersion(value: string) {
    if (versions.value[cursor.value] === value) return;
    versions.value = [...versions.value.slice(0, cursor.value + 1), value];
    cursor.value = versions.value.length - 1;
  }
  /** 切模式或点回撤前，先把还在防抖里的这次输入落栈 */
  function flushVersion() { window.clearTimeout(snapshotTimer); pushVersion(content.value); }
  const canUndo = computed(() => cursor.value > 0);
  const canRedo = computed(() => cursor.value >= 0 && cursor.value < versions.value.length - 1);

  async function undo() {
    if (blockedWhileBusy()) return;
    flushVersion();
    if (!canUndo.value) return;
    cursor.value -= 1;
    content.value = versions.value[cursor.value];
    await afterRestore?.();
  }
  async function redo() {
    if (blockedWhileBusy()) return;
    flushVersion();
    if (!canRedo.value) return;
    cursor.value += 1;
    content.value = versions.value[cursor.value];
    await afterRestore?.();
  }
  function onInput(event: Event) {
    content.value = (event.target as HTMLTextAreaElement).value;
    window.clearTimeout(snapshotTimer);
    snapshotTimer = window.setTimeout(() => pushVersion(content.value), 800);
  }

  /** 预览栏是否切到编辑态 */
  const editing = ref(false);
  function toggleEditing() {
    if (blockedWhileBusy()) return;
    flushVersion();
    editing.value = !editing.value;
  }

  /**
   * 没有未保存改动时，把文件重新读一遍。两处需要它：
   * - **刷新预览之前**：否则渲染的是内存里那份，外面改过也看不到
   * - **让 AI 改之前**（更要紧）：模型基于陈旧内容改写，一保存就把外面的改动盖掉了
   *
   * 有未保存改动时不读——那才是他正在编辑、正要保存的东西。
   */
  async function syncFromDisk(): Promise<boolean> {
    if (edited.value || !file.value) return false;
    const latest = await api<{ html?: string; markdown?: string; mtime: number | null; uncommitted: boolean }>(
      `${API.document(kind)}?file=${encodeURIComponent(file.value)}`,
    );
    if (latest.mtime === baseMtime.value) return false;
    const next = (kind === "resume" ? latest.html : latest.markdown) ?? "";
    content.value = next;
    saved.value = next;
    uncommitted.value = latest.uncommitted;
    baseMtime.value = latest.mtime;
    resetVersions(next);
    toast.info("文件在外部被改过，已重新载入");
    return true;
  }

  // ---- 对话（按文件存在本地）----
  const instruction = ref("");
  // action 要留着：下一轮把它还原成模型当初吐出的 JSON 形状再发回去，
  // 混散文进 JSON 模式的对话会让模型返回空内容（实测 40% 概率）
  const chatLog = ref<{ role: "user" | "assistant"; text: string; error?: boolean; action?: "revise" | "answer" }[]>([]);
  const clearChatOpen = ref(false);
  const chatBox = ref<HTMLElement | null>(null);

  /**
   * 更早那些轮的滚动摘要，以及它已经覆盖到第几条。
   *
   * 历史只发最近几条；再往前的要是**直接丢掉**，用户早先提过的偏好和约束就没了——
   * 那些在正文里看不出来（「链路锚点那行别动」「收尾别加联系方式」），一丢后面几轮就开始自相矛盾。
   */
  const chatSummary = ref("");
  const chatSummaryCount = ref(0);
  const chatKey = () => `${kind}-chat:${file.value}`;
  const chatSummaryKey = () => `${kind}-chat-summary:${file.value}`;

  function loadChat() {
    try {
      chatLog.value = JSON.parse(localStorage.getItem(chatKey()) ?? "[]");
    } catch {
      chatLog.value = [];        // 存的东西坏了就当没有，别拦着页面
    }
    try {
      const stored = JSON.parse(localStorage.getItem(chatSummaryKey()) ?? "null");
      chatSummary.value = typeof stored?.summary === "string" ? stored.summary : "";
      chatSummaryCount.value = Number.isInteger(stored?.count) && stored.count >= 0 ? stored.count : 0;
    } catch {
      chatSummary.value = "";
      chatSummaryCount.value = 0;
    }
  }
  function saveChatSummary() {
    if (!file.value) return;
    try {
      localStorage.setItem(chatSummaryKey(), JSON.stringify({ summary: chatSummary.value, count: chatSummaryCount.value }));
    } catch { /* 存不下不该影响正在进行的对话，下次重新压一遍就是 */ }
  }
  /** 清掉这段对话。它只是本地上下文，跟稿子内容无关，清了不影响任何已保存的东西 */
  function clearChat() {
    if (blockedWhileBusy()) return;
    chatLog.value = [];
    chatSummary.value = "";
    chatSummaryCount.value = 0;
    try { localStorage.removeItem(chatSummaryKey()); } catch { /* 同上 */ }
    clearChatOpen.value = false;
  }

  watch(chatLog, () => {
    if (!file.value) return;
    try {
      localStorage.setItem(chatKey(), JSON.stringify(chatLog.value));
    } catch { /* 配额满不该影响正在进行的对话 */ }
  }, { deep: true });

  // ---- 让 AI 改（流式）----
  const revising = ref(false);
  /**
   * 改稿进行中那条 AI 消息的正文。
   *
   * 它作为对话框里最后一条显示（不是挂在输入框下面）—— 先说「正在读文档…」，
   * 模型开始吐字后换成逐字上屏的内容，改完由真正的回复接替。
   * 改一次要 5～10 秒，只转圈用户不知道在干什么。
   */
  const reviseProgress = ref("");

  // 进度就是对话框最后一条，跟着它滚；否则用户在气泡长出可视区之后就看不到进展了
  watch(reviseProgress, () => {
    void nextTick(() => chatBox.value?.scrollTo({ top: chatBox.value.scrollHeight }));
  });

  /** 中断这次改稿；没在改就什么都不做 */
  let reviseAbort: AbortController | null = null;
  function abortRevise() { reviseAbort?.abort(); }

  /**
   * 改完之后把盘上真实的样子读回来；返回**盘上是不是真的跟编辑器不一样**。
   *
   * 模型直接改文件，中断或失败时它可能已经改了一部分 —— 编辑器必须显示那个真实的中间态，
   * 而不是失败前的旧文本；否则用户一保存就把模型改的那部分盖回去，或者刷新后
   * 「凭空」多出一段改动。
   *
   * 盘上没变就**什么都不动** —— 否则每次失败的改稿都会白清掉用户的撤销栈。
   */
  async function reloadAfterRevise(): Promise<boolean> {
    if (!file.value) return false;
    try {
      const latest = await api<{ html?: string; markdown?: string; mtime: number | null; uncommitted: boolean }>(
        `${API.document(kind)}?file=${encodeURIComponent(file.value)}`,
      );
      const next = (kind === "resume" ? latest.html : latest.markdown) ?? "";
      if (next === content.value && latest.mtime === baseMtime.value) return false;
      content.value = next;
      saved.value = next;
      uncommitted.value = latest.uncommitted;
      baseMtime.value = latest.mtime;
      resetVersions(next);
      await afterRestore?.();
      return true;
    } catch {
      return false;   // 读不回来就保持现状，用户还能点「放弃改动」退回去
    }
  }

  async function revise() {
    const ask = instruction.value.trim();
    if (!ask || revising.value) return;
    // AI 直接改**文件**，看不到编辑器缓冲区里还没保存的内容。
    // 不拦的话：它基于旧内容改完，我们再把文件读回来覆盖编辑器，刚敲的字就没了。
    if (edited.value) {
      toast.warning("先把编辑器里的改动保存了再让 AI 改 —— 它直接改文件，看不到你还没保存的内容");
      return;
    }
    try { await syncFromDisk(); } catch { /* 读不到就按内存里的走，别为此拦住 */ }
    instruction.value = "";      // 先清输入框，别让这句话一直挂着
    revising.value = true;
    reviseProgress.value = "正在读文档…";
    const before = content.value;
    const controller = new AbortController();
    reviseAbort = controller;
    let streamed = "";
    try {
      const history = chatLog.value.slice(chatSummaryCount.value);
      chatLog.value.push({ role: "user", text: ask });
      const data = await apiStream<{ action: "revise" | "answer"; reply: string; html?: string; markdown?: string }>(
        API.documentRevise(kind),
        { method: "POST", body: JSON.stringify({ file: file.value, instruction: ask, history, summary: chatSummary.value, stream: true }), signal: controller.signal },
        (event) => {
          if (event.type === EVENT.tool) {
            reviseProgress.value = event.name === "read" || event.name === "bash" ? "正在读文档…" : "正在改文档…";
          }
          if (event.type === EVENT.draft && event.content) {
            // 增量片段，必须拼接
            streamed += event.content;
            reviseProgress.value = streamed;
          }
        },
      );
      const next = (kind === "resume" ? data.html : data.markdown) ?? "";
      const changed = data.action === "revise" && next !== "";
      if (changed) {
        content.value = next;
        // **不要动 saved**：它表示「上次落盘的内容」，而模型只改了盘、没有提交。
        // 动了它 dirty 就成了 false，界面显示「已保存」、「保存」按钮也随之变灰 ——
        // 用户再也没法把这次改动记进版本库。「未保存」由服务端的 uncommitted 与
        // content !== saved 共同保证。
        pushVersion(next);
      }
      const ctx: ReviseContext = { changed, before, after: next, reply: data.reply, action: data.action };
      chatLog.value.push({
        role: "assistant",
        action: data.action,
        text: replyText ? replyText(ctx) : defaultReplyText(ctx),
      });
      if (streamed || changed) await afterRevise?.(changed);
      return { changed, before };
    } catch (error) {
      // 「点停止」和「真的失败」都要走这里重新读盘：模型是**直接改文件**的，
      // 它可能在中断/报错之前已经改了一部分，而编辑器还停在旧文本上。
      const aborted = controller.signal.aborted;
      const reloaded = await reloadAfterRevise();
      const tail = reloaded ? "模型已经改了一部分，编辑器里就是它停下时的样子；不满意可以「放弃改动」" : "";
      chatLog.value.push(aborted
        ? { role: "assistant", text: reloaded ? `已停止。${tail}` : "已停止，文件没有改动。" }
        : { role: "assistant", error: true, text: `这次没成功：${(error as Error).message}${tail ? `（${tail}）` : ""}` });
      return { changed: false, before };
    } finally {
      reviseAbort = null;
      // 两句一起赋值，Vue 会合并成一次渲染 —— 不会闪一个空气泡
      revising.value = false;
      reviseProgress.value = "";
    }
  }

function defaultReplyText({ changed, reply }: ReviseContext): string {
  return reply || (changed ? "改好了。" : "（模型这次没给出内容）");
}

  // ---- 保存 ----
  const saving = ref(false);
  async function save() {
    if (blockedWhileBusy()) return false;
    saving.value = true;
    // 发出去的是这一份快照；saved 也必须用它。
    // 直接读 content.value 的话，一旦内容在保存期间变过，就会把**没写进仓库**的新内容
    // 标成「已保存」—— 用户以为存下来了，其实没有。
    const sent = content.value;
    try {
      const payload = kind === "resume"
        ? { file: file.value, html: sent, baseMtime: baseMtime.value }
        : { file: file.value, markdown: sent, baseMtime: baseMtime.value };
      const data = await api<{ mtime: number; notices: string[]; commit: { committed: boolean; hash?: string; reason?: string; unchanged?: boolean } }>(
        API.document(kind),
        { method: "POST", body: JSON.stringify(payload) },
      );
      // 盘上确实写了新内容，基准得跟上，否则下次保存会把这次当成「外部改过」再存一份
      baseMtime.value = data.mtime;
      // 只有**真的进版本库了**（或内容本来就没变）才算保存成功。
      // 提交失败（典型：没配 git 用户名/邮箱）时绝不能翻成「已保存」——
      // 那样用户以为存下来了，版本列表里却永远不会出现，刷新后连痕迹都没了。
      if (data.commit.committed || data.commit.unchanged) {
        saved.value = sent;
        uncommitted.value = false;
        toast.success(data.commit.committed ? `已保存 ${data.commit.hash}` : "已保存");
      } else {
        toast.warning(`写进磁盘了，但没进版本库：${data.commit.reason ?? "原因未知"}。先解决它，再点一次「保存」`);
      }
      for (const notice of data.notices) toast.warning(notice);
      return true;
    } catch (error) {
      toast.error((error as Error).message);
      return false;
    } finally {
      saving.value = false;
    }
  }

  /**
   * 放弃改动：把工作区退回上次保存的样子。
   *
   * 这是「模型直接改文件、服务器不做任何校验」的逃生口 —— 模型改坏了就靠它。
   * 与 rollback 的区别：回滚到历史里挑的某一版、且**故意不动 saved**（那是「未保存」）；
   * 放弃改动回到 HEAD，盘上那份就是已保存的样子，所以 saved 要一起更新。
   */
  const discarding = ref(false);
  async function discard() {
    if (blockedWhileBusy()) return;
    discarding.value = true;
    try {
      const data = await api<{ html?: string; markdown?: string; mtime: number; uncommitted: boolean }>(
        API.documentDiscard(kind),
        { method: "POST", body: JSON.stringify({ file: file.value }) },
      );
      const next = (kind === "resume" ? data.html : data.markdown) ?? "";
      content.value = next;
      saved.value = next;
      uncommitted.value = data.uncommitted;
      baseMtime.value = data.mtime;
      // 用 pushVersion 而不是 resetVersions：万一放弃错了，还能靠「← 回撤」找回来
      pushVersion(next);
      toast.success("已放弃改动，回到上次保存的那版");
    } catch (error) {
      toast.error((error as Error).message);
      return;
    } finally {
      discarding.value = false;
    }
    await afterRestore?.();
  }

  // ---- 历史版本 ----
  const historyOpen = ref(false);
  const historyLoading = ref(false);
  const commits = ref<Commit[]>([]);
  const previewHash = ref("");
  /** 回滚确认：拿不准改哪一版就不动手 */
  const rollbackOpen = ref(false);
  const rollbackTarget = ref<Commit | null>(null);
  const rollingBack = ref(false);

  async function openHistory() {
    historyOpen.value = true;
    previewHash.value = "";
    historyLoading.value = true;
    try {
      const data = await api<{ commits: Commit[] }>(`${API.documentHistory(kind)}?file=${encodeURIComponent(file.value)}`);
      commits.value = data.commits;
      if (commits.value[0]) await previewCommit?.(commits.value[0].hash);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      historyLoading.value = false;
    }
  }

  function askRollback() {
    rollbackTarget.value = commits.value.find((item) => item.hash === previewHash.value) ?? null;
    if (rollbackTarget.value) rollbackOpen.value = true;
  }

  async function rollback(hash: string) {
    if (blockedWhileBusy()) return;
    rollingBack.value = true;
    const label = rollbackTarget.value ? `已恢复到 ${rollbackTarget.value.version}` : "已恢复";
    try {
      const data = await api<{ html?: string; markdown?: string; mtime: number; uncommitted: boolean }>(
        API.documentRollback(kind),
        { method: "POST", body: JSON.stringify({ file: file.value, hash }) },
      );
      content.value = (kind === "resume" ? data.html : data.markdown) ?? "";
      // 故意不更新 saved：服务端只把内容写回工作区、没有提交。
      // uncommitted 由服务端按 git 照实算——恢复到**最新那版**时它就是 false，
      // 盘上和 HEAD 一模一样，不该亮着「未保存」催人点保存。
      uncommitted.value = data.uncommitted;
      baseMtime.value = data.mtime;
      // 用 pushVersion 而不是 resetVersions：恢复不留提交，万一恢复错了，
      // 至少还能靠「← 回撤」把恢复前的内容找回来
      pushVersion(content.value);
      rollbackOpen.value = false;
      historyOpen.value = false;
      toast.success(`${label}，点「保存」才记进历史`);
    } catch (error) {
      toast.error((error as Error).message);
      return;                        // 恢复没成，别去刷一份对不上的预览
    } finally {
      rollingBack.value = false;
    }
    await afterRestore?.();
  }

  /**
   * 正在忙：模型在改 / 正在保存 / 正在放弃改动 / 正在回滚。
   * 这四种都会写盘或覆盖编辑器里的内容，所以它们期间该锁的必须锁。
   *
   * 只认 revising 是不够的 —— 保存期间打字同样不会进仓库，而界面上完全看不出来。
   */
  const busy = computed(() => revising.value || saving.value || discarding.value || rollingBack.value);

  /**
   * 忙的时候，本地那些会写盘 / 换文档 / 抽掉上下文的操作一律挡住。
   *
   * 为什么数据层也要挡，而不是只把按钮置灰：模型此刻正**直接改磁盘上那份文件**，
   * 保存则会把「发出去的那份」和编辑器里的新内容混起来。按钮置灰是给用户看的，这里是兜底。
   */
  function blockedWhileBusy(): boolean {
    if (!busy.value) return false;
    toast.warning(revising.value ? "AI 正在改这份文档 —— 等它改完，或点「停止」" : "这一步还没完成，稍等一下");
    return true;
  }

  return {
    content, file, name, filePath,
    saved, uncommitted, baseMtime, dirty, edited,
    versions, cursor, canUndo, canRedo,
    pushVersion, resetVersions, flushVersion, undo, redo, onInput,
    editing, toggleEditing, syncFromDisk, applyLoaded,
    instruction, chatLog, clearChatOpen, chatBox, chatSummary, chatSummaryCount, loadChat, clearChat, saveChatSummary,
    revising, reviseProgress, revise, abortRevise,
    saving, save, discarding, discard, busy,
    historyOpen, historyLoading, commits, previewHash, rollbackOpen, rollbackTarget, rollingBack,
    openHistory, askRollback, rollback,
  };
}
