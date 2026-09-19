import { type Route } from "./router.ts";
import { API } from "../../shared/routes.ts";
import { config } from "../infra/config/index.ts";
import { setDirectory } from "../infra/config/env-dir.ts";
import { asrEnabled } from "../infra/external/asr.ts";
import { pickPath } from "../infra/picker.ts";
import { embeddingClient, questionIndex, scanJobs, scanResumes } from "../context.ts";

export default [
  {
    /** 前端启动时要的一切：简历目录与列表、岗位、题库分类、各能力开关 */
    method: "GET",
    pattern: API.settings,
    handler: async () => {
      await questionIndex.refresh();
      const resumeDir = config.resumeDir;
      return {
        resumeDir,
        resumes: scanResumes(resumeDir),
        jobs: scanJobs(resumeDir),
        topics: questionIndex.topics(),
        embeddingEnabled: embeddingClient.enabled,
        embeddingModel: config.embedding.model || null,
        docsBaseUrl: config.docsBaseUrl,
        asrEnabled: asrEnabled(config.asr),
        asrModel: config.asr.model || null,
      };
    },
  },
  {
    /** 原生目录 / 文件选择框：浏览器给不了真实路径，这里由服务端开系统对话框 */
    method: "POST",
    pattern: API.pickPath,
    handler: async ({ body }) => {
      const picked = await pickPath({
        kind: String(body.kind ?? "folder"),
        start: String(body.start ?? ""),
        filter: String(body.filter ?? ""),
      });
      return picked ? { path: picked } : { cancelled: true };
    },
  },
  {
    method: "POST",
    pattern: API.resumeDir,
    handler: ({ body }) => {
      const resumeDir = setDirectory(
        body.dir,
        "INTERVIEW_RESUME_DIR",
        (resolved) => { config.resumeDir = resolved; },
        "简历目录",
      );
      return { resumeDir, resumes: scanResumes(resumeDir), jobs: scanJobs(resumeDir) };
    },
  },
] as Route[];
