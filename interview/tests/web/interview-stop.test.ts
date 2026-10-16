import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { compile, createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import ts from "typescript";

test("取消发送恢复旧草稿，但不覆盖等待期间输入的新草稿", async () => {
  const source = fs.readFileSync(new URL("../../web/pages/InterviewWorkspace.vue", import.meta.url), "utf8");
  const sendSource = source.match(/async function send\(value = draft.value\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(sendSource);
  // 执行页面本身的发送函数，只替换 HTTP 提交边界。
  const code = ts.transpileModule(sendSource, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const newDraft of ["", "等待期间的新草稿"]) {
    const draft = { value: "原消息" };
    const submit = async (_body: unknown, restore: () => void) => { draft.value = newDraft; restore(); };
    const send = new Function("draft", "sending", "submit", `${code}; return send;`)(draft, { value: false }, submit);
    await send();
    assert.equal(draft.value, newDraft || "原消息");
  }
});

test("发送期间主按钮显示停止生成，空草稿不影响停止入口", async () => {
  const source = fs.readFileSync(new URL("../../web/pages/InterviewWorkspace.vue", import.meta.url), "utf8");
  const toolbar = source.match(/<div class="composer-actions">[\s\S]*?<\/div>/)?.[0];
  assert.ok(toolbar);
  for (const running of [true, false]) {
    const app = createSSRApp({
      render: compile(toolbar),
      setup: () => ({
        activeRequest: running ? new AbortController() : null,
        aiStage: "", session: {}, finished: false, sending: running,
        pausing: false, paused: false, active: true, draft: "",
        togglePause() {}, act() {}, send() {}, endConfirmOpen: false,
      }),
    });
    app.component("NButton", defineComponent({
      props: ["disabled"],
      setup: (props, { slots }) => () => h("button", { disabled: props.disabled }, slots.default?.()),
    }));
    const html = await renderToString(app);
    if (running) {
      assert.match(html, /<button[^>]*>停止生成<\/button>/);
      assert.doesNotMatch(html, /<button[^>]*disabled[^>]*>停止生成/);
      assert.doesNotMatch(html, />发送<\/button>/);
    } else {
      assert.match(html, />发送<\/button>/);
      assert.doesNotMatch(html, /停止生成/);
    }
  }
});
