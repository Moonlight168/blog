# 面试演练台

一个放在 `G:\blog\interview` 下、与现有 VuePress 站点相互独立的本地 Web 面试工具。页面使用 Vue 3，后端使用 Node.js 内置 HTTP 与 SQLite。

## 功能

- 从 `.env` 指定的目录选择已有 Markdown / TXT 简历（接口拒绝读取目录外文件）；
- 用 Series 和章节约束面试主题，支持技术面试、编码面试和书面测评口吻；
- 回答可以分多次补充，输入“下一题”时才点评、归档并切题；书面测评会在开始时一次生成固定试卷；
- 输入“结束”时点评当前题并生成总结；
- Markdown 是题库真源，SQLite 只保存索引、会话和历史；
- 精确标题、FTS5 中文二元组及可选 Embedding 混合查重；
- 新题写入前强制检查根目录《面试宝典文章格式规范》；已有题只追加原始回答历史；
- 查看面试历史和每道题的原始回答、分数、点评；
- Vite 前端热更新，Markdown 变更自动增量重建索引。

## 启动

要求 Node.js 22.5+（使用内置 `node:sqlite`）。

```powershell
cd G:\blog\interview
Copy-Item .env.example .env
# 编辑 .env，填写对话模型；Embedding 可选
npm install
npm run dev
```

打开 `http://127.0.0.1:5174`。生产方式：

```powershell
npm run build
npm start
```

打开 `http://127.0.0.1:8890`。

## 数据与安全

`.env`、`data/` 和 `dist/` 已在仓库根 `.gitignore` 中排除。服务默认只监听 `127.0.0.1`。题目写入公开 Series 前会校验格式；候选人的原始回答写入已被 Git 忽略的 `src/private/series/答题历史/`。

远程 Embedding 会把“题目标题 + 标准答案前 180 字”发送给配置的嵌入服务；不配置时使用本地精确匹配和 FTS5，不影响基本运行。

## 验证

```powershell
npm test
npm run typecheck
npm run build
```
