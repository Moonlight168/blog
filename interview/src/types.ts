export interface Chapter { name: string; path: string }
export interface TopicSeries { name: string; chapters: Chapter[] }
export interface Message { id?: number; role: "user" | "assistant"; kind: string; content: string; createdAt?: string; payload?: unknown }
export interface Session {
  id: string; resumePath: string; series: string; chapterPath: string; mode: string;
  durationMinutes: number; status: string; startedAt: string; endedAt?: string;
  completedCount: number; currentQuestion?: { title: string };
}
