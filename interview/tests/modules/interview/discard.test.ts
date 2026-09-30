import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { addMessage, openDatabase, saveSession } from "../../../server/db/index.ts";
import { discardInterviewSession } from "../../../server/modules/interview/discard.ts";
import { makeSession } from "../../helpers/factories.ts";

test("丢弃面试会清理磁盘痕迹和全部会话表", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "discard-interview-"));
  const db = openDatabase(path.join(root, "test.sqlite"));
  t.after(() => {
    db.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const session = makeSession({ id: "discard-me", currentQuestion: null });
  saveSession(db, session);
  addMessage(db, session.id, { role: "user", kind: "answer", content: "回答" });
  db.prepare("INSERT INTO attempts(session_id,question_title,raw_answer,evaluation,created_at) VALUES(?,?,?,?,?)")
    .run(session.id, "问题？", "回答", "{}", new Date().toISOString());
  db.prepare("INSERT INTO agent_memories(session_id,summary,updated_at) VALUES(?,?,?)")
    .run(session.id, "摘要", new Date().toISOString());
  const calls: string[] = [];

  await discardInterviewSession({
    db,
    sessionId: session.id,
    forgetAgent: () => { calls.push("forget"); },
    deleteAgentSession: async () => { calls.push("delete-jsonl"); },
    removeWorkspace: () => { calls.push("remove-workspace"); },
  });

  assert.deepEqual(calls, ["forget", "delete-jsonl", "remove-workspace"]);
  for (const table of ["sessions", "messages", "attempts", "agent_memories"]) {
    assert.equal(db.prepare(`SELECT COUNT(*) AS total FROM ${table} WHERE ${table === "sessions" ? "id" : "session_id"}=?`).get(session.id)?.total, 0);
  }
});
