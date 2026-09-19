import test from "node:test";
import assert from "node:assert/strict";

import { API } from "../../shared/routes.ts";

test("documents 的两个 kind 拼出不同路径", () => {
  assert.equal(API.document("resume"), "/api/documents/resume");
  assert.equal(API.document("self-intro"), "/api/documents/self-intro");
});

test("实时面试与逐题报告不会撞车", () => {
  assert.equal(API.realInterview("abc"), "/api/interviews/real/abc");
  assert.equal(API.interviewReport("abc"), "/api/interviews/abc/report");
});

test("归档路径带上题号", () => {
  assert.equal(API.interviewArchiveAnswer("s1", 3), "/api/interviews/s1/answers/3/archive");
});

test("所有路径都以 /api 开头（Vite 按前缀代理）", () => {
  const paths = Object.entries(API).flatMap(([key, value]) =>
    typeof value === "string" ? [[key, value]] : [["", ""]],
  );
  for (const [key, path] of paths) {
    if (key === "") continue;
    assert.ok(path.startsWith("/api/"), `${key} 不是 /api 前缀：${path}`);
  }
});
