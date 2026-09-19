import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { isAllowedResume } from "../../server/infra/paths.ts";

/** 目录内可读的简历文件类型：HTML 简历本体，以及目录内的 md（规范文档等） */
test("isAllowedResume 只放行目录内的简历文件", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "allowed-"));
  const person = path.join(root, "zhangsan");
  fs.mkdirSync(person, { recursive: true });
  fs.writeFileSync(path.join(person, "张三-Java后端-27届.html"), "<html></html>", "utf8");
  fs.writeFileSync(path.join(person, "photo.jpg"), "binary", "utf8");
  fs.writeFileSync(path.join(root, "简历设计规范.md"), "# 规范\n", "utf8");

  assert.equal(isAllowedResume(path.join(person, "张三-Java后端-27届.html"), root), true);
  assert.equal(isAllowedResume(path.join(person, "photo.jpg"), root), false);
  assert.equal(isAllowedResume(path.join(root, "..", "outside.md"), root), false);
  assert.equal(isAllowedResume(path.join(root, "简历设计规范.md"), root), true, "目录内的 md 仍可读");
});
