import type { Route } from "./router.ts";

import archive from "./archive.ts";
import documents from "./documents.ts";
import interviews from "./interviews.ts";
import questions from "./questions.ts";
import resumes from "./resumes.ts";
import settings from "./settings.ts";
import speech from "./speech.ts";

/** 全部路由表。一个资源一张；带 `:kind` 的条目展开成两种文档后，用户可见路径 36 条。 */
export const routes: Route[] = [
  ...settings,
  ...resumes,
  ...speech,
  ...documents,
  ...interviews,
  ...archive,
  ...questions,
];
