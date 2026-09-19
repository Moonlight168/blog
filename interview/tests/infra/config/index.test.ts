import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { config, findAppRoot } from "../../../server/infra/config/index.ts";

test("从任意深度向上都能找到应用根", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "approot-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "package.json"), "{}");
  const deep = path.join(root, "server", "infra", "git");
  fs.mkdirSync(deep, { recursive: true });

  assert.equal(findAppRoot(deep), root);
  assert.equal(findAppRoot(root), root);
});

test("向上找不到 package.json 时抛错，不返回空串或猜一个", (t) => {
  const orphan = fs.mkdtempSync(path.join(os.tmpdir(), "orphan-"));
  t.after(() => fs.rmSync(orphan, { recursive: true, force: true }));

  assert.throws(() => findAppRoot(orphan), /package\.json/);
});

test("appRoot 就是含 package.json 的那一层", () => {
  assert.ok(fs.existsSync(path.join(config.appRoot, "package.json")));
  assert.equal(path.basename(config.appRoot), "interview");
});

test("数据库落在 appRoot/data 下，而不是 server/ 下", () => {
  assert.equal(path.dirname(config.databasePath), path.join(config.appRoot, "data"));
});
