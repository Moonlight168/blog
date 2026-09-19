# 面试演练台

> 改代码前先读 [AGENTS.md](./AGENTS.md)：分层约束、目录约定、pi 的坑都在那里。

一个放在本仓库 `interview/` 下、与 VuePress 站点相互独立的本地 Web 面试工具。前端 Vue 3 + Vite，后端 Node.js 内置 HTTP 与 SQLite（`node:sqlite`）。

## 面试流程

- **简历**：按「人员目录」分组读取简历目录下的 `.md` / `.txt` / `.html`（HTML 由 turndown 自动转 Markdown）。目录可在页面上修改，「保存并刷新」会写回 `interview/.env` 的 `INTERVIEW_RESUME_DIR`
- **主题**：用「知识分类 + 章节」约束出题范围；支持技术面试、编码面试、书面测评三种形式
- **一条消息 = 一次回答**：立刻给出点评和标准答案，不再需要先「攒着」等切题
- **追问**：面试官直接回应，不打分、不写入答题历史
- **切题**：「下一题」「结束」由界面按钮触发，不经模型判断——模型无权替你结束面试
- **书面测评**：开始时一次性生成整卷，按顺序推进，答完最后一题自动结束
- **到时自动结束**：超时的活跃会话由后台轮询收尾

## 归档与查重

- Markdown 是题库真源，SQLite 只保存索引、会话与历史
- 归档时若标准答案不合《面试宝典文章格式规范》，**先让模型按规范重写再入库**；重写仍失败才跳过入库（回答记录照常保存，并在界面上提示）
- 查重：精确标题匹配 + 关键词匹配（FTS5）+ 向量检索，RRF 融合后交模型判定是否与旧题重复
- 已有题只追加原始回答历史；新题写入所选章节，同时追加私有答题历史
- 历史详情里对未入库的题提供「再次归档」

## 页面

- **开始面试**：配置简历 / 知识分类 / 章节 / 形式 / 时长，选择自动持久化
- **面试历史**：按分类 / 人员 / 状态 / 时间范围筛选（条件持久化）；每场显示场均分、题数、已归档数；每道题可跳到「答题历史」与「知识库」的对应标题；未入库的题可「再次归档」
- **复习**：从题库随机抽题，只看题目 + 标准答案 + 自己历次回答，**不调用任何模型**
- **检索预览**：三路召回结果并排展示 + RRF 融合排序；可手动触发增量嵌入或强制重算全部向量
- **我的简历 / 自我介绍**：左边编辑、右边预览（简历走 PDF，所见即导出），右边是「让 AI 改」的对话框

## 让 AI 改简历 / 自我介绍

这两个页面共用一套逻辑（`web/composables/useDocumentEditor.ts`）：

- **AI 直接改文件**，不是把改好的全文发回来。模型用 pi 的 `read` / `edit` / `write` 自己读规范、自己改，服务器**不看它改了什么**
- 每改一次都会**实时推状态**（正在读稿 / 正在改第几处 / 逐字上屏），不再是一个转圈等到底
- 改完之后编辑器显示**未保存**——盘上变了但还没提交。点「保存」才记成一版
- 改坏了有两条退路：**「放弃改动」**（退回上次保存的样子）与**历史里回滚到某一版**
- 编辑器里有**没保存**的输入时，AI 改稿会被拦住并提示先保存 —— 它直接改文件，看不到你缓冲区里的内容

## 评分标准

每题 0–100，按 `prompts/interviewer/SKILL.md` 里的六档锚点给分（完全答对 / 基本答对 / 答到一半 / 答偏了 / 基本没答上来 / 完全没答）。该文件会作为「规则快照」在**建会话时冻结**注入这一场的所有提示词，改它即可调整评分口径（对已经在跑的会话不生效）。

跨场比较看总评里的**场均分**——由服务端计算，不让模型自己算。

## 目录结构

```
interview/
├── web/          前端
│   ├── pages/        8 个页面
│   ├── composables/  useDocumentEditor（两个编辑页共用）/ useSpeechSynthesis
│   ├── api/          client（请求）/ stream（NDJSON 事件流）
│   └── lib/          format / markdown
├── prompts/      提示词与规范。一个 skill 一个目录，文件必须叫 SKILL.md
├── shared/       前后端共用：路由路径、事件名、类型
├── server/
│   ├── api/          HTTP 边界，一个资源一张路由表
│   ├── modules/      业务规则（不懂 HTTP、不懂 pi）：document / interview / question / archive
│   ├── agent/        唯一 import pi 的地方：runtime / model / session / tools / workspace
│   ├── infra/        基础设施：config（含 .env 读写）/ git / network / external（asr、向量）/ paths / prompts
│   └── db/           SQLite
└── tests/        目录镜像源码；夹具在 helpers/，跨层守卫在 guards/
```

**四条分层不变量**（`tests/guards/architecture.test.ts` 钉着）：`modules/` 不许 import pi、`api/` 不许碰子进程与写文件、只有 `agent/` 能 import `pi-ai`、`web/` 不许写死 `/api/...`。

## 启动

要求 Node.js 24+（用内置 `node:sqlite`，并靠 Node 的类型擦除直接跑 `.ts`，无需构建步骤）。

```bash
cd interview
cp .env.example .env
# 编辑 .env：对话模型必填；Embedding 可选，不配则退化为关键词检索
npm ci
npm run dev
```

打开 `http://127.0.0.1:5174`（Vite 前端），后端 API 在 `8890`。

生产方式：

```bash
npm run build
npm start
```

打开 `http://127.0.0.1:8890`。

## 数据与安全

`data/`、`.env`、`dist/` 已在仓库根 `.gitignore` 中排除。服务默认只监听 `127.0.0.1`。

`data/` 下有三样，都由 `INTERVIEW_DATA_DIR` 覆盖位置（默认 `<interview>/data`）：

| 路径 | 内容 |
|---|---|
| `interview.sqlite` | 题库索引、会话元数据、评分、考点游标 |
| `sessions/` | **整段对话记录**（pi 的 JSONL 会话，含工具调用与结果） |
| `workspaces/<会话 id>/` | 那一场的工作目录：冻结的规范副本 + 简历正文。**含个人信息** |

服务端这边几条边界：

- 题目写入公开知识分类前会校验《面试宝典》格式；候选人的原始回答写入已被 Git 忽略的 `src/private/series/答题历史/`
- 点「丢弃这场面试」会把该场的会话记录与工作目录**一并从磁盘删掉**（那里面有简历副本）
- 交给 agent 的 shell **不含带 `KEY` / `TOKEN` / `SECRET` 的环境变量** —— 否则模型为排查随手敲的 `env` 会把 key 打进对话记录，再随上下文发给模型服务
- 配置 Embedding 后，「题目标题 + 标准答案前 180 字」会发送给该嵌入服务；不配置则用本地精确匹配与关键词匹配，基本运行不受影响

## 验证

```bash
npm test          # 除用例之外还有两组守卫：分层不变量、相对 import 必须解析得到
npm run typecheck # 前端 + 服务端两份 tsconfig
npm run build
```
