import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { compile, createSSRApp, defineComponent, h } from "vue";
import { parse } from "vue/compiler-sfc";
import { renderToString } from "vue/server-renderer";
import { durationLabel, resumeLabel, statLabel, timeLabel, topicLabel } from "../../web/lib/format.ts";

test("存在目标章节但未入库的作答仍显示再次归档按钮", async () => {
  const source = fs.readFileSync(new URL("../../web/pages/InterviewHistoryDetail.vue", import.meta.url), "utf8");
  const template = parse(source).descriptor.template!.content;
  const app = createSSRApp({
    render: compile(template),
    setup: () => ({
      loading: false, deleting: false, summary: "", refilingId: null,
      removeSession: () => {}, refile: () => {},
      durationLabel, resumeLabel, statLabel, timeLabel, topicLabel,
      renderMarkdown: (text: string) => text,
      detail: {
        session: { series: "Java", chapterPath: "Java/状态机.md", resumePath: "alice/resume.html", startedAt: "2026-01-01" },
        questionCount: 1, archivedCount: 0, averageScore: 60,
        attempts: [{ id: 1, questionTitle: "什么是状态机？", rawAnswer: "我的回答",
          evaluation: { score: 60, comment: "继续练习" }, sourcePath: "Java/状态机.md", historyUrl: null, knowledgeUrl: null }],
      },
    }),
  });
  // 只替换 UI 库外壳；条件渲染使用真实页面模板。
  for (const name of ["RouterLink", "NSpin", "NPopconfirm", "NButton"]) {
    app.component(name, defineComponent({ setup: (_, { slots }) => () => h(name === "NButton" ? "button" : "div", slots.default?.()) }));
  }
  const html = await renderToString(app);
  assert.match(html, /再次归档/);
  assert.match(html, /这题未进知识库/);
});
