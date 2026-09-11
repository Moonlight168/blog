import assert from "node:assert/strict";
import test from "node:test";

import { cjkBigrams, normalizeTitle, reciprocalRankFusion } from "../server/search.mjs";

test("normalizes titles and creates CJK bigrams", () => {
  assert.equal(normalizeTitle(" 什么是 LangGraph？ "), "什么是langgraph");
  assert.equal(cjkBigrams("状态机"), "状态 态机");
});

test("hybrid ranking rewards candidates returned by multiple retrievers", () => {
  const ranked = reciprocalRankFusion([["a", "b"], ["b", "c"]]);
  assert.equal(ranked[0].id, "b");
});
