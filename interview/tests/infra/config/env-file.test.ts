import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { updateEnvFile } from "../../../server/infra/config/env-file.ts";

/** 建一个只有 .env 的临时目录 */
function makeEnvFile(content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "env-"));
  const file = path.join(dir, ".env");
  fs.writeFileSync(file, content, "utf8");
  return file;
}

test("写 .env：替换已有键、保留其他行、拒绝注入", () => {
  const file = makeEnvFile("# 注释\nINTERVIEW_HOST=127.0.0.1\nINTERVIEW_RESUME_DIR=G:\\\\old\nINTERVIEW_PORT=8890\n");

  updateEnvFile(file, "INTERVIEW_RESUME_DIR", "F:/new/dir");
  const written = fs.readFileSync(file, "utf8");
  assert.match(written, /^INTERVIEW_RESUME_DIR=F:\/new\/dir$/m);
  assert.match(written, /^INTERVIEW_HOST=127\.0\.0\.1$/m, "其他行必须原样保留");
  assert.match(written, /^INTERVIEW_PORT=8890$/m);
  assert.match(written, /^# 注释$/m);
  assert.equal(written.match(/INTERVIEW_RESUME_DIR=/g)?.length, 1, "不能重复写入该键");

  // 注入：换行可以凭空插入别的环境变量
  assert.throws(() => updateEnvFile(file, "INTERVIEW_RESUME_DIR", "a\nINTERVIEW_CHAT_API_KEY=stolen"), /非法/);
  assert.throws(() => updateEnvFile(file, "INTERVIEW_RESUME_DIR", "a=b"), /非法/);
});

test("写 .env：键不存在时追加", () => {
  const file = makeEnvFile("INTERVIEW_HOST=127.0.0.1\n");

  updateEnvFile(file, "INTERVIEW_RESUME_DIR", "F:/resume");
  const written = fs.readFileSync(file, "utf8");
  assert.match(written, /^INTERVIEW_RESUME_DIR=F:\/resume$/m);
  assert.match(written, /^INTERVIEW_HOST=127\.0\.0\.1$/m);
});
