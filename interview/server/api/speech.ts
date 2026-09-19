import { HttpError, type Route } from "./router.ts";
import { API } from "../../shared/routes.ts";
import { config } from "../infra/config/index.ts";
import { asrEnabled, transcribe } from "../infra/external/asr.ts";
import { readBinaryBody } from "./http.ts";

export default [
  {
    /** 语音转写：前端把 16kHz 单声道 WAV 传上来，这里转发给上游（key 只在服务端） */
    method: "POST",
    pattern: API.speechTranscribe,
    binary: true,
    handler: async ({ request }) => {
      if (!asrEnabled(config.asr)) throw new HttpError(400, "未配置语音识别服务（.env 里缺 API Key）");
      const contentType = String(request.headers["content-type"] || "audio/wav").split(";")[0].trim().toLowerCase();
      if (!contentType.startsWith("audio/")) throw new HttpError(400, "只接受音频内容");

      let audio: Buffer;
      try {
        audio = await readBinaryBody(request);
      } catch (error) {
        throw new HttpError(413, (error as Error).message);
      }
      if (!audio.length) throw new HttpError(400, "音频内容为空");

      const { text, duration } = await transcribe({ config: config.asr, buffer: audio, mime: contentType });
      return { text, duration, model: config.asr.model };
    },
  },
] as Route[];
