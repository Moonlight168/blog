export interface Chapter { name: string; path: string }
export interface TopicSeries { name: string; chapters: Chapter[] }
export interface Message { id?: number; role: "user" | "assistant"; kind: string; content: string; createdAt?: string; payload?: unknown }
export interface Session {
  id: string; resumePath: string; series: string; chapterPath: string; mode: string;
  durationMinutes: number; status: string; startedAt: string; endedAt?: string;
  completedCount: number; currentQuestion?: { title: string };
  /** 目标 JD 的路径；没选则为空串 */
  jdPath?: string;
  /** 本次暂停的开始时间；为空表示未暂停 */
  pausedAt?: string | null;
  /** 历史累计暂停毫秒数，超时判定与倒计时都要扣除 */
  pausedMs?: number;
}
