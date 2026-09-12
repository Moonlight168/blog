import MarkdownIt from "markdown-it";

/**
 * html:false 会转义原始 HTML，`javascript:` 伪协议也不会渲染成链接，可安全用于 v-html；
 * breaks:true 让单换行也生效（模型的点评常常一行一条，中间没有空行）。
 */
const md = new MarkdownIt({ html: false, linkify: false, breaks: true });

/**
 * CommonMark 的「右翼闭合」规则在中文里会失效：
 * `**标签：**内容` 中，闭合的 `**` 前面是全角标点、后面紧跟汉字，不算右翼分隔符，
 * 于是整段不会加粗（渲染成字面量 `**标签：**内容`）。
 *
 * 注意零宽空格（U+200B）解决不了：markdown-it 的空白判定里它不算空白。
 * 这里在闭合 `**` 后补一个真正的空格让条件成立——代价是标签与正文之间多出一个
 * 极窄的间隙（中文排版里本来就常这么写）。只影响渲染，不动源文本。
 */
// 精确命中「闭合 `**` 前面是标点、后面紧跟字母/数字」这一种失效组合，
// 其它位置（如 `**加粗**中文`）本来就正常，不该多插空格。
const PUNCT_ADJACENT_BOLD = /(\*\*[^*\n]*[^\p{L}\p{N}\s]\*\*)(?=[\p{L}\p{N}])/gu;

export function renderMarkdown(text: string) {
  return md.render((text ?? "").replace(PUNCT_ADJACENT_BOLD, "$1 "));
}
