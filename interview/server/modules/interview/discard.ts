import type { Db } from "../../db/index.ts";

interface DiscardInput {
  db: Db;
  sessionId: string;
  forgetAgent: () => Promise<void> | void;
  deleteAgentSession: () => Promise<void>;
  removeWorkspace: () => void;
}

/** 丢弃一场面试的全部本地痕迹；调用方负责先持有该会话的互斥锁。 */
export async function discardInterviewSession({
  db, sessionId, forgetAgent, deleteAgentSession, removeWorkspace,
}: DiscardInput): Promise<void> {
  await forgetAgent();
  await deleteAgentSession();
  removeWorkspace();

  db.exec("BEGIN IMMEDIATE");
  try {
    for (const table of ["messages", "attempts", "agent_memories"]) {
      db.prepare(`DELETE FROM ${table} WHERE session_id=?`).run(sessionId);
    }
    db.prepare("DELETE FROM sessions WHERE id=?").run(sessionId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
