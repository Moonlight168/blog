import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { effectScope, nextTick } from "vue";
import { API, type DocumentKind } from "../../shared/routes.ts";

// 只替换 UI 通知环境；组合函数、Vue 响应式和 HTTP/流解析走真实实现。
registerHooks({ resolve(specifier, context, next) {
  if (specifier === "naive-ui") return { url: "data:text/javascript,export const useMessage=()=>({info(){},warning(){},error(){},success(){}})", shortCircuit: true };
  return next(specifier, context);
} });
const { useDocumentEditor } = await import("../../web/composables/useDocumentEditor.ts");

test("读取改稿前置文件时已经锁定，停止后不发送模型请求", async (t) => {
  const scope = effectScope();
  t.after(() => scope.stop());
  const editor = scope.run(() => useDocumentEditor({ kind: "resume" }))!;
  editor.file.value = "sample.html";
  editor.content.value = "原稿";
  editor.instruction.value = "修改";
  let calls = 0;
  t.mock.method(globalThis, "fetch", (_url: string, options: RequestInit) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      if (options.signal?.aborted) return reject(new DOMException("停止", "AbortError"));
      options.signal?.addEventListener("abort", () => reject(new DOMException("停止", "AbortError")), { once: true });
    });
  });
  const pending = editor.revise();
  assert.equal(editor.busy.value, true);
  editor.abortRevise();
  await pending;
  assert.equal(calls, 1);
  assert.equal(editor.busy.value, false);
  assert.equal(editor.instruction.value, "修改");
});

test("读盘期间的新输入不会被迟到的响应覆盖", async (t) => {
  const scope = effectScope();
  t.after(() => scope.stop());
  const editor = scope.run(() => useDocumentEditor({ kind: "resume" }))!;
  editor.file.value = "sample.html";
  editor.content.value = "原稿";
  let resolve!: (response: Response) => void;
  t.mock.method(globalThis, "fetch", () => new Promise<Response>((done) => { resolve = done; }));
  const pending = editor.syncFromDisk();
  await Promise.resolve();      // 让前置的落盘 await 走完，读到请求才真正发出去
  editor.content.value = "新输入";
  resolve(Response.json({ html: "磁盘版本", mtime: 2, uncommitted: false }));
  assert.equal(await pending, false);
  assert.equal(editor.content.value, "新输入");
});

test("离开编辑页会中止等待中的读取并释放忙碌状态", async (t) => {
  const scope = effectScope();
  const editor = scope.run(() => useDocumentEditor({ kind: "resume" }))!;
  editor.file.value = "sample.html";
  editor.instruction.value = "修改";
  let signal: AbortSignal | null | undefined;
  t.mock.method(globalThis, "fetch", (_url: string, options: RequestInit) => {
    signal = options.signal;
    return new Promise<Response>((_resolve, reject) => {
      if (signal?.aborted) return reject(new DOMException("停止", "AbortError"));
      signal?.addEventListener("abort", () => reject(new DOMException("停止", "AbortError")), { once: true });
    });
  });
  const pending = editor.revise();
  scope.stop();
  await pending;
  assert.equal(signal?.aborted, true);
  assert.equal(editor.busy.value, false);
});

test("清空对话先重置服务端历史，失败保留界面记录", async (t) => {
  const scope = effectScope();
  t.after(() => scope.stop());
  const editor = scope.run(() => useDocumentEditor({ kind: "resume" }))!;
  editor.file.value = "alice/resume.html";
  editor.chatLog.value = [{ role: "user", text: "旧请求" }];
  let succeeds = false;
  let requested = "";
  t.mock.method(globalThis, "fetch", async (url: string) => {
    requested = url;
    return Response.json(succeeds ? {} : { error: "重置失败" }, { status: succeeds ? 200 : 409 });
  });
  await editor.clearChat();
  assert.equal(editor.chatLog.value.length, 1);
  succeeds = true;
  await editor.clearChat();
  assert.equal(requested, `${API.document("resume")}/chat/reset`);
  assert.equal(editor.chatLog.value.length, 0);
});

for (const kind of ["resume", "self-intro"] as DocumentKind[]) {
  test(`${kind}：AI 改稿及回滚落盘后可连续追改，盘上有别的改动时以盘为准`, async (t) => {
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", { value: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) }, configurable: true });
    t.after(() => Reflect.deleteProperty(globalThis, "localStorage"));
    const scope = effectScope();
    t.after(() => scope.stop());
    const editor = scope.run(() => useDocumentEditor({ kind }))!;
    let content = "原稿", calls = 0;
    const key = kind === "resume" ? "html" : "markdown";
    t.mock.method(globalThis, "fetch", async (url: string) => {
      if (url === API.documentRevise(kind)) {
        content = `改稿${++calls}`;
        return new Response(JSON.stringify({ type: "result", data: { action: "revise", reply: "完成", [key]: content, uncommitted: true } }) + "\n");
      }
      if (url === API.documentRollback(kind)) {
        content = "历史稿";
        return Response.json({ [key]: content, uncommitted: true });
      }
      return Response.json({ [key]: content, uncommitted: content !== "原稿" });
    });
    editor.applyLoaded({ file: "sample.html", name: "sample", path: "sample", content, uncommitted: false });
    editor.instruction.value = "改一次";
    await editor.revise();
    assert.equal(editor.content.value, "改稿1");
    assert.equal(editor.uncommitted.value, true);
    editor.instruction.value = "继续改";
    await editor.revise();
    assert.equal(editor.content.value, "改稿2");
    await editor.rollback("old");
    assert.equal(editor.content.value, "历史稿");
    editor.instruction.value = "接着改历史稿";
    await editor.revise();
    assert.equal(editor.content.value, "改稿3");
    // 盘上那份与编辑器不同（比如别处改过）：先重新载入，不拿这条指令去改一份已过期的稿
    editor.content.value = "手工输入";
    editor.instruction.value = "不应覆盖输入";
    await editor.revise();
    assert.equal(editor.content.value, "改稿3");
    await nextTick();
  });
}
