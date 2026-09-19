import fs from "node:fs";

import { HttpError, type Route } from "./router.ts";
import { API } from "../../shared/routes.ts";
import { config } from "../infra/config/index.ts";
import { isAllowedResume, readResume } from "../context.ts";

export default [
  {
    /**
     * 把一份**面试用的简历源文件**（Markdown / TXT / HTML）转成 Markdown 原文回给用户，
     * 便于确认「模型实际看到的是什么」。
     *
     * 注意与 /api/documents/resume 的区别：那个是编辑器里可版本化的 HTML 稿，这个是喂给模型的源文件。
     */
    method: "POST",
    pattern: API.resumesPreview,
    handler: ({ body }) => {
      const target = String(body.path ?? "").trim();
      if (!isAllowedResume(target, config.resumeDir) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
        throw new HttpError(400, "只能预览简历目录下的简历");
      }
      const markdown = readResume(target);
      return { markdown, chars: markdown.length };
    },
  },
] as Route[];
