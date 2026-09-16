import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * 本机专属导航：只在开发环境、且目标在本地真的存在时才出现。
 *
 * 为什么两个条件缺一不可：
 * ① `NODE_ENV === "development"`——构建公开站点时，这台机器上 `src/private` 是存在的。
 *    只看「目录在不在」会把私人入口连同指向未构建页面的死链一起带上线。
 * ② 目标存在——换到没有这份 private 的机器（把项目给别人用时），入口自动消失，
 *    而不是点进去 404。
 */

const isDev = (): boolean => process.env.NODE_ENV === "development";

/** 外链（比如本机跑的面试台）没有对应的源码文件，不参与存在性判断 */
const isExternal = (link: string): boolean => /^[a-z][a-z\d+.-]*:\/\//i.test(link);

/**
 * 路由 → 源码路径：`/private/finance/` ⇒ `<docs>/src/private/finance`。
 * 用 `process.cwd()` 而不是 `__dirname`，与 config.ts 里扫 offer 目录的写法保持一致。
 */
export function routeExists(route: string): boolean {
  if (!route || isExternal(route)) return false;
  const clean = route.split("#")[0].split("?")[0];
  try {
    return existsSync(join(process.cwd(), "src", clean.replace(/^\//, "")));
  } catch {
    return false;
  }
}

type NavLike = { link?: string; children?: unknown };

/** 有 link 就按 link 判断；没有 link 的纯分组项，交给子项决定 */
function visibleByLink(item: NavLike): boolean {
  if (!item.link) return true;
  return isExternal(item.link) || routeExists(item.link);
}

/** 递归裁剪：子项全没了，父级分组也不该留着一个空壳 */
function pruneItem<T extends NavLike>(item: T): T | null {
  const children = Array.isArray(item.children) ? (item.children as NavLike[]) : [];
  if (children.length) {
    const kept = children.map(pruneItem).filter((child): child is NavLike => child !== null);
    if (!kept.length) return null;
    return { ...item, children: kept };
  }
  return visibleByLink(item) ? item : null;
}

/** 导航项：本机专属，目标不存在就不显示 */
export function localNav<T extends NavLike>(items: readonly T[]): T[] {
  if (!isDev()) return [];
  return items.map(pruneItem).filter((item): item is T => item !== null);
}

/** 侧边栏段：key 就是要检查的路由 */
export function localSections<T>(sections: Record<string, T>): Record<string, T> {
  if (!isDev()) return {};
  return Object.fromEntries(
    Object.entries(sections).filter(([route]) => routeExists(route)),
  );
}
