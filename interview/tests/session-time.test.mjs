import assert from "node:assert/strict";
import test from "node:test";

import { elapsedMs, expired, remainingMs } from "../server/session-time.mjs";

const START = "2026-09-12T10:00:00.000Z";
const at = (offsetMinutes) => new Date(Date.parse(START) + offsetMinutes * 60_000).getTime();

function session(overrides = {}) {
  return { startedAt: START, durationMinutes: 30, status: "active", pausedAt: null, pausedMs: 0, ...overrides };
}

test("没有暂停时按墙钟扣减", () => {
  assert.equal(elapsedMs(session(), at(10)), 10 * 60_000);
  assert.equal(remainingMs(session(), at(10)), 20 * 60_000);
  assert.equal(expired(session(), at(10)), false);
});

test("暂停期间已用与剩余都恒定", () => {
  const paused = session({ status: "paused", pausedAt: new Date(at(10)).toISOString() });
  assert.equal(elapsedMs(paused, at(10)), 10 * 60_000);
  assert.equal(elapsedMs(paused, at(25)), 10 * 60_000);
  assert.equal(remainingMs(paused, at(25)), 20 * 60_000);
});

test("暂停中的会话永不过期，即使墙钟早已超出时长", () => {
  const paused = session({ status: "paused", pausedAt: new Date(at(10)).toISOString() });
  assert.equal(expired(paused, at(999)), false);
});

test("恢复后暂停时长被扣除，剩余从暂停那一刻接着走", () => {
  // 第 10 分钟暂停，第 25 分钟恢复 → 累计暂停 15 分钟
  const resumed = session({ pausedMs: 15 * 60_000 });
  assert.equal(elapsedMs(resumed, at(25)), 10 * 60_000);
  assert.equal(remainingMs(resumed, at(25)), 20 * 60_000);
  // 恢复后再走 5 分钟，才变成已用 15 分钟
  assert.equal(elapsedMs(resumed, at(30)), 15 * 60_000);
});

test("多次暂停的累计时长同样扣除", () => {
  const resumed = session({ pausedMs: 3 * 60_000 + 7 * 60_000 });
  assert.equal(elapsedMs(resumed, at(20)), 10 * 60_000);
});

test("走到 0 就超时，剩余不会变成负数", () => {
  assert.equal(remainingMs(session(), at(30)), 0);
  assert.equal(remainingMs(session(), at(45)), 0);
  // 已用时长如实累加、不封顶；只有剩余时长会被夹到 0
  assert.equal(elapsedMs(session(), at(45)), 45 * 60_000);
  assert.equal(expired(session(), at(30)), true);
  assert.equal(expired(session(), at(29)), false);
});

test("缺省 pausedMs / pausedAt 按未暂停处理", () => {
  const legacy = { startedAt: START, durationMinutes: 30, status: "active" };
  assert.equal(elapsedMs(legacy, at(10)), 10 * 60_000);
  assert.equal(expired(legacy, at(10)), false);
});
