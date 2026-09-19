import test from "node:test";
import assert from "node:assert/strict";

import { HttpError, matchRoute, statusFor } from "../../server/api/router.ts";

const routes = [
  { method: "GET", pattern: "/api/interviews/:id", handler: () => null },
  { method: "POST", pattern: "/api/interviews/:id/messages", handler: () => null },
  { method: "GET", pattern: "/api/interviews/real/:id", handler: () => null },
  { method: "GET", pattern: "/api/documents/:kind", handler: () => null },
  { method: "POST", pattern: "/api/documents/:kind/history", handler: () => null },
  { method: "GET", pattern: "/api/settings", handler: () => null },
];

test("命名参数被解出来", () => {
  const hit = matchRoute(routes, "GET", "/api/documents/resume");
  assert.equal(hit?.params.kind, "resume");
});

test("字面量段优先于参数段：real 不会被 :id 吃掉", () => {
  const hit = matchRoute(routes, "GET", "/api/interviews/real/abc");
  assert.equal(hit?.route.pattern, "/api/interviews/real/:id");
  assert.equal(hit?.params.id, "abc");
});

test("普通 id 仍然走参数段", () => {
  const hit = matchRoute(routes, "GET", "/api/interviews/s-123");
  assert.equal(hit?.route.pattern, "/api/interviews/:id");
  assert.equal(hit?.params.id, "s-123");
});

test("方法不匹配就不算命中", () => {
  assert.equal(matchRoute(routes, "DELETE", "/api/documents/resume"), null);
  assert.equal(matchRoute(routes, "GET", "/api/documents/resume/history"), null, "history 只有 POST");
});

test("段数不同不命中", () => {
  assert.equal(matchRoute(routes, "GET", "/api/documents/resume/extra"), null);
  assert.equal(matchRoute(routes, "GET", "/api/documents"), null);
});

test("没有参数的固定路径正常命中", () => {
  assert.equal(matchRoute(routes, "GET", "/api/settings")?.route.pattern, "/api/settings");
});

test("参数会被 URL 解码", () => {
  // a%2Fb 是「一个」路径段，所以命中 :id；解码后还原成 a/b
  const encoded = matchRoute(routes, "GET", `/api/interviews/${encodeURIComponent("a/b")}`);
  assert.equal(encoded?.route.pattern, "/api/interviews/:id");
  assert.equal(encoded?.params.id, "a/b");
  assert.equal(matchRoute(routes, "GET", `/api/documents/${encodeURIComponent("self-intro")}`)?.params.kind, "self-intro");
});

test("HttpError 用自带的码，其余一律 502", () => {
  assert.equal(statusFor(new HttpError(404, "面试记录不存在")), 404);
  assert.equal(statusFor(new HttpError(400, "参数不合法")), 400);
  assert.equal(statusFor(new Error("模型超时")), 502);
  assert.equal(statusFor("不是 Error"), 502);
});
