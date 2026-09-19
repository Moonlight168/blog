import type { DocumentKind } from "../../../shared/routes.ts";
import { commitFile, contentAt, discardChanges, historyOf, readFileAt, rollbackTo, writeFile, type DocTarget } from "./versioned-file.ts";
import { listResumeGroups, resolveResumeDoc } from "./resume.ts";
import { listSelfIntros, resolveSelfIntro, selfIntroDir, personDir } from "./self-intro.ts";

/**
 * 文档域的门面：简历编辑稿与自我介绍是同一套操作的两个实例。
 *
 * 对外只暴露**字段名中立**的 `content`；`html` / `markdown` 这种叫法是给前端看的，
 * 转换留在 api 层 —— 领域层不该知道某一种文档的正文叫什么。
 */

export { listResumeGroups, listSelfIntros, personDir, selfIntroDir };
export type { DocTarget };

interface Resolver {
  resolve(resumeDir: string, file: unknown): DocTarget | null;
  /** 没指定文件时的默认那份 */
  fallback(resumeDir: string): DocTarget | null;
  missing(file: unknown): string;
}

const RESOLVERS: Record<DocumentKind, Resolver> = {
  resume: {
    resolve: resolveResumeDoc,
    fallback: (dir) => null,        // 简历由前端从分组列表里挑，没有「默认那份」的概念
    missing: (file) => `没有这份简历：${file || "(空)"}`,
  },
  "self-intro": {
    resolve: resolveSelfIntro,
    // 通过 resolve 传空串来取「排第一的那份」，与原有行为一致
    fallback: (dir) => resolveSelfIntro(dir, ""),
    missing: (file) => `没有这份自我介绍：${file || "(空)"}`,
  },
};

export function resolverOf(kind: DocumentKind): Resolver {
  return RESOLVERS[kind];
}

function must(target: DocTarget | null, kind: DocumentKind, file: unknown): DocTarget {
  if (!target) throw new Error(RESOLVERS[kind].missing(file));
  return target;
}

/** 读当前文档（含「盘上是否与最新提交不一致」） */
export function readDocument(kind: DocumentKind, resumeDir: string, file: unknown) {
  const target = must(RESOLVERS[kind].resolve(resumeDir, file), kind, file);
  return readFileAt(target);
}

export function writeDocument(kind: DocumentKind, resumeDir: string, file: unknown, content: string) {
  const target = must(RESOLVERS[kind].resolve(resumeDir, file), kind, file);
  return writeFile(target, content);
}

export function commitDocument(kind: DocumentKind, resumeDir: string, file: unknown, message: string) {
  const target = RESOLVERS[kind].resolve(resumeDir, file);
  if (!target) return { committed: false, reason: RESOLVERS[kind].missing(file) };
  return commitFile(target, message);
}

export function documentHistory(kind: DocumentKind, resumeDir: string, file: unknown) {
  const target = RESOLVERS[kind].resolve(resumeDir, file);
  return target ? historyOf(target) : [];
}

export function documentContentAt(kind: DocumentKind, resumeDir: string, file: unknown, hash: string): string {
  const target = must(RESOLVERS[kind].resolve(resumeDir, file), kind, file);
  return contentAt(target, hash);
}

export function rollbackDocument(kind: DocumentKind, resumeDir: string, file: unknown, hash: string) {
  const target = must(RESOLVERS[kind].resolve(resumeDir, file), kind, file);
  return rollbackTo(target, hash);
}

/** 放弃改动 = 回到 HEAD 那一版。改坏了就靠它，所以必须好用。 */
export function discardDocument(kind: DocumentKind, resumeDir: string, file: unknown) {
  const target = must(RESOLVERS[kind].resolve(resumeDir, file), kind, file);
  return discardChanges(target);
}
