/**
 * 会话的时长计算。抽成纯函数，一来服务端超时判定与前端倒计时用的是同一套规则，
 * 二来暂停相关的边界（暂停期间冻结、恢复后不补扣）可以直接单测。
 */

/** 已用时长（毫秒），扣除累计暂停与「当前这次」暂停；暂停期间返回值恒定。 */
export function elapsedMs(session, now = Date.now()) {
  const startedAt = new Date(session.startedAt).getTime();
  const pausedAt = session.pausedAt ? new Date(session.pausedAt).getTime() : null;
  const pausedMs = Number(session.pausedMs ?? 0);
  return Math.max(0, now - startedAt - pausedMs - (pausedAt ? now - pausedAt : 0));
}

/** 剩余时长（毫秒）。暂停期间同样恒定，所以前端显示的倒计时会冻住。 */
export function remainingMs(session, now = Date.now()) {
  return Math.max(0, session.durationMinutes * 60_000 - elapsedMs(session, now));
}

/**
 * 是否已超时。暂停中的会话永不过期——它没在消耗面试时长，
 * 而且服务端巡检本来就只扫 status='active'，这里再兜一层。
 */
export function expired(session, now = Date.now()) {
  if (session.status === "paused") return false;
  return remainingMs(session, now) === 0;
}
