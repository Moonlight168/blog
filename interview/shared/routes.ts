/**
 * 全部 HTTP 路径的唯一来源。
 *
 * 服务端注册路由、前端发请求都从这里取 —— 改名时不会漏改一侧。
 * 只放路径，不放请求体形状（那些在 types.ts）。
 */

export type DocumentKind = "resume" | "self-intro";

export const API = {
  // 环境与设置
  settings: "/api/settings",
  pickPath: "/api/settings/pick-path",
  resumeDir: "/api/settings/resume-dir",

  // 可版本化的文档（简历编辑稿 / 自我介绍）
  documents: "/api/documents",
  document: (kind: DocumentKind) => `/api/documents/${kind}`,
  documentRevise: (kind: DocumentKind) => `/api/documents/${kind}/revise`,
  documentPdf: (kind: DocumentKind) => `/api/documents/${kind}/pdf`,
  documentHistory: (kind: DocumentKind) => `/api/documents/${kind}/history`,
  documentRollback: (kind: DocumentKind) => `/api/documents/${kind}/rollback`,
  documentDiscard: (kind: DocumentKind) => `/api/documents/${kind}/discard`,
  documentExport: (kind: DocumentKind) => `/api/documents/${kind}/export`,
  documentExportDir: (kind: DocumentKind) => `/api/documents/${kind}/export-dir`,

  /** 面试用的简历源文件（Markdown / TXT / HTML）转成 Markdown 给用户核对 */
  resumesPreview: "/api/resumes/preview",

  // 面试
  interviews: "/api/interviews",
  interview: (id: string) => `/api/interviews/${id}`,
  interviewMessages: (id: string) => `/api/interviews/${id}/messages`,
  interviewPause: (id: string) => `/api/interviews/${id}/pause`,
  interviewResume: (id: string) => `/api/interviews/${id}/resume`,
  interviewDiscard: (id: string) => `/api/interviews/${id}/discard`,
  /** 逐题点评与归档链接。面试进行中的轮询用 interview(id)，不用这个。 */
  interviewReport: (id: string) => `/api/interviews/${id}/report`,
  interviewArchiveAnswer: (id: string, index: number) => `/api/interviews/${id}/answers/${index}/archive`,
  realInterview: (id: string) => `/api/interviews/real/${id}`,

  // 题库与索引
  questionsSearch: "/api/questions/search",
  questionsReindex: "/api/questions/reindex",
  questionsPick: "/api/questions/pick",
  questionsAnswers: "/api/questions/answers",

  // 语音
  speechTranscribe: "/api/speech/transcribe",
} as const;

/**
 * 带占位符的路由**模式**，只给服务端注册用。
 *
 * 与上面的 API 常量分开：那边是「拼好的具体 URL」（前端用），
 * 这边是「还没填参数的形状」（服务端用）。混在一起就得靠 as 强转绕过类型。
 */
export const PATTERN = {
  document: "/api/documents/:kind",
  documentRevise: "/api/documents/:kind/revise",
  documentPdf: "/api/documents/:kind/pdf",
  documentHistory: "/api/documents/:kind/history",
  documentRollback: "/api/documents/:kind/rollback",
  documentDiscard: "/api/documents/:kind/discard",
  documentExport: "/api/documents/:kind/export",
  documentExportDir: "/api/documents/:kind/export-dir",

  interview: "/api/interviews/:id",
  interviewMessages: "/api/interviews/:id/messages",
  interviewPause: "/api/interviews/:id/pause",
  interviewResume: "/api/interviews/:id/resume",
  interviewDiscard: "/api/interviews/:id/discard",
  interviewReport: "/api/interviews/:id/report",
  interviewArchiveAnswer: "/api/interviews/:id/answers/:index/archive",
  realInterview: "/api/interviews/real/:id",
} as const;
