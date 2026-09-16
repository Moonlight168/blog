import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { localNav, localSections, routeExists } from "./local-nav.ts";

/** 这台机器上"有什么"：dirs 建目录，files 建文件（导航目标两种都有） */
type Tree = { dirs?: string[]; files?: string[] };

/**
 * 造一棵 src 树并把 cwd 挪过去——helper 是按 cwd 找 src/ 的。
 * 跑完把 cwd、NODE_ENV 和临时目录都还原，免得影响别的用例。
 */
function withTree(tree: Tree, env: string | undefined, run: () => void): void {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "local-nav-"));
  for (const dir of tree.dirs ?? []) fs.mkdirSync(path.join(root, "src", dir), { recursive: true });
  for (const file of tree.files ?? []) {
    fs.mkdirSync(path.dirname(path.join(root, "src", file)), { recursive: true });
    fs.writeFileSync(path.join(root, "src", file), "", "utf8");
  }
  const cwd = process.cwd();
  const previous = process.env.NODE_ENV;
  process.chdir(root);
  if (env === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = env;
  try {
    run();
  } finally {
    process.chdir(cwd);
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const FINANCE = { text: "投资理财", link: "/private/finance/README.md" };
const OFFER = { text: "寻找 Offer", link: "/private/hires/" };

test("目标在就显示（指向文件和指向目录两种都要认）", () => {
  withTree({ files: ["private/finance/README.md"], dirs: ["private/hires"] }, "development", () => {
    assert.deepEqual(localNav([FINANCE, OFFER]), [FINANCE, OFFER]);
  });
});

test("目标不在就不显示（换台没这份 private 的机器时不会点进去 404）", () => {
  withTree({}, "development", () => {
    assert.deepEqual(localNav([FINANCE, OFFER]), []);
  });
});

test("生产构建一律不显示——构建公开站点时这台机器上目录是存在的，只看存在性会把私人入口带上线", () => {
  withTree({ files: ["private/finance/README.md"] }, "production", () => {
    assert.deepEqual(localNav([FINANCE]), [], "目录在也不能显示");
    assert.deepEqual(localSections({ "/private/finance/": "structure" }), {});
  });
});

test("外链（本机跑的面试台）不查文件，但同样只在开发环境出现", () => {
  const app = { text: "模拟面试", link: "http://127.0.0.1:5174/" };
  withTree({}, "development", () => assert.deepEqual(localNav([app]), [app]));
  withTree({}, "production", () => assert.deepEqual(localNav([app]), []));
});

test("分组项：子项全不在，父级空壳也不留", () => {
  withTree({}, "development", () => {
    const group = { text: "人工智能", children: [{ text: "AI发展历史", link: "/private/ai/AI发展历史.md" }] };
    assert.deepEqual(localNav([group]), []);
  });
});

test("分组项：只保留真的存在的子项", () => {
  withTree({ files: ["private/ai/AI发展历史.md"] }, "development", () => {
    const present = { text: "AI发展历史", link: "/private/ai/AI发展历史.md" };
    const missing = { text: "别的", link: "/private/ai/别的.md" };
    assert.deepEqual(localNav([{ text: "人工智能", children: [present, missing] }]), [
      { text: "人工智能", children: [present] },
    ]);
  });
});

test("裁剪时造新对象，不改原数组里的项", () => {
  withTree({ files: ["private/ai/AI发展历史.md"] }, "development", () => {
    const child = { text: "AI发展历史", link: "/private/ai/AI发展历史.md" };
    const group = { text: "人工智能", children: [child, { text: "别的", link: "/private/ai/别的.md" }] };
    localNav([group]);
    assert.equal(group.children.length, 2, "原对象不该被改动");
  });
});

test("路由带锚点或查询串也认", () => {
  withTree({ files: ["private/ai/AI发展历史.md"] }, "development", () => {
    assert.equal(routeExists("/private/ai/AI发展历史.md#h1"), true);
    assert.equal(routeExists("/private/ai/AI发展历史.md?x=1"), true);
  });
});

test("侧边栏段按 key 过滤", () => {
  withTree({ dirs: ["private/finance", "trash"] }, "development", () => {
    assert.deepEqual(
      localSections({ "/private/finance/": "structure", "/private/checkin/": "structure", "/trash/": "structure" }),
      { "/private/finance/": "structure", "/trash/": "structure" },
    );
  });
});

test("空路由与不存在的路径不抛错", () => {
  withTree({}, "development", () => {
    assert.equal(routeExists(""), false);
    assert.equal(routeExists("/private/根本没有这个目录/"), false);
  });
});
