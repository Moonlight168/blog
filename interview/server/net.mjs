/**
 * 网络层错误翻译。
 *
 * undici（Node 内置的 fetch）在网络不可用时只会给一句 `fetch failed`，
 * 真正的原因塞在 error.cause 里（ENOTFOUND / ECONNREFUSED / 证书错误…）。
 * 直接抛给用户看不懂，所以统一翻成「连不上谁、为什么、怎么办」。
 */

/** undici 把根因放在 error.cause */
function causeText(error) {
  const cause = error?.cause;
  if (!cause) return "";
  return String(cause.code ?? cause.message ?? cause);
}

/** 常见网络错误的中文说法；后半句保留原始 code，排查时还能用 */
const CAUSE_TEXT = {
  ENOTFOUND: "域名解析失败",
  EAI_AGAIN: "域名解析超时",
  ECONNREFUSED: "连接被拒绝，服务可能没启动",
  ECONNRESET: "连接被中断",
  EPIPE: "连接被中断",
  ETIMEDOUT: "连接超时",
  EHOSTUNREACH: "目标主机不可达",
  ENETUNREACH: "网络不可达",
};

function describeCause(error) {
  const cause = error?.cause;
  const code = String(cause?.code ?? "");
  const detail = String(cause?.message ?? "");
  if (CAUSE_TEXT[code]) return `${CAUSE_TEXT[code]}（${code}）`;
  if (/bad port/i.test(detail)) return "端口不可用";
  if (/certificate|self.signed/i.test(detail)) return "证书校验失败";
  return code || detail;
}

const NETWORK_LIKE = /fetch failed|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EPIPE|EHOSTUNREACH|ENETUNREACH|socket hang up|network|certificate|self.signed/i;

/**
 * 是「网络不可用」这类错误就返回一句给用户看的话，否则返回 null 让调用方原样抛。
 * 只认网络特征，不靠 error.name 猜——免得把代码 bug 也误报成网络问题。
 */
export function friendlyNetworkError(error, { what = "外部服务", url = "" } = {}) {
  const detail = `${error?.message ?? ""} ${causeText(error)}`;
  if (!NETWORK_LIKE.test(detail)) return null;
  let host = url;
  try { host = new URL(url).host; } catch { /* 不是完整 URL 就原样用 */ }
  const reason = describeCause(error) || error?.message || "网络请求失败";
  return `连不上${what}${host ? `（${host}）` : ""}：${reason}。请检查网络或代理后重试`;
}

/** HTTP 状态码对应的补充说明，让报错能直接指向「该改什么」 */
export function httpStatusHint(status) {
  if (status === 401 || status === 403) return "（API Key 无效或权限不足）";
  if (status === 402) return "（账户余额不足）";
  if (status === 429) return "（请求过于频繁或额度用尽，稍后重试）";
  if (status >= 500) return "（模型服务端异常，稍后重试）";
  return "";
}
