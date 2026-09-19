import fs from "node:fs";

/**
 * 就地把某个键写回 .env：已存在则按行替换，不存在则追加。
 *
 * 拒绝换行与等号 —— 否则调用方可以凭空插入别的环境变量。
 */
export function updateEnvFile(file: string, key: string, value: string): void {
  if (/[\r\n=]/.test(value)) throw new Error(`简历目录含非法字符（不允许换行或等号）：${JSON.stringify(value)}`);

  const exists = fs.existsSync(file);
  const original = exists ? fs.readFileSync(file, "utf8") : "";
  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const line = `${key}=${value}`;

  const lines = original.length ? original.split(/\r?\n/) : [];
  const index = lines.findIndex((item) => item.startsWith(`${key}=`));
  if (index >= 0) lines[index] = line;
  else lines.push(line);

  const text = lines.join(eol).replace(new RegExp(`(${eol}){2,}$`), eol);
  fs.writeFileSync(file, text.endsWith(eol) ? text : `${text}${eol}`);
}
