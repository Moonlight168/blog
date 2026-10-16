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
  test(`${kind}：AI 改稿及回滚落盘后可连续追改，手工未落盘输入仍拦截`, async (t) => {
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", { value: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) }, configurable: true });
    t.after(() => Reflect.deleteProperty(globalThis, "localStorage"));
    const scope = effectScope();
    t.after(() => scope.stop());
    const editor = scope.run(() => useDocumentEditor({ kind }))!;
    let content = "原稿", mtime = 1, calls = 0;
    const key = kind === "resume" ? "html" : "markdown";
    t.mock.method(globalThis, "fetch", async (url: string) => {
      if (url === API.documentRevise(kind)) {
        content = `改稿${++calls}`; mtime++;
        return new Response(JSON.stringify({ type: "result", data: { action: "revise", reply: "完成", [key]: content, mtime, uncommitted: true } }) + "\n");
      }
      if (url === API.documentRollback(kind)) { content = "历史稿"; mtime++; }
      return Response.json({ [key]: content, mtime, uncommitted: content !== "原稿" });
    });
    editor.applyLoaded({ file: "sample.html", name: "sample", path: "sample", content, mtime, uncommitted: false });
    editor.instruction.value = "改一次";
    await editor.revise();
    assert.equal(editor.edited.value, false);
    assert.equal(editor.dirty.value, true);
    assert.equal(editor.baseMtime.value, 2);
    editor.instruction.value = "继续改";
    await editor.revise();
    assert.equal(editor.content.value, "改稿2");
    await editor.rollback("old");
    assert.equal(editor.edited.value, false);
    editor.instruction.value = "接着改历史稿";
    await editor.revise();
    assert.equal(editor.content.value, "改稿3");
    editor.content.value = "手工输入";
    editor.instruction.value = "不应覆盖输入";
    await editor.revise();
    assert.equal(editor.content.value, "手工输入");
    await nextTick();
  });
}
