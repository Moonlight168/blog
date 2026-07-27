# 项目可用 Skills

本项目下挂载的全局 skill 速查。skill 文件本体在 `C:\Users\86130\.claude\skills\<name>\SKILL.md`。

## Skill 总览

| Skill | 何时调用 | 主要动作 |
|---|---|---|
| `merging-interview-qa` | 拿到 `handoff/YYYY-MM-DD/interview/<topic>.md` + `<topic>-答题记录.md` | 融合进 `src/series/knowledge/{分类}/{topic}.md` + `src/series/答题历史/{分类}/{topic}-答题记录.md`（append-only，去重） |
| `merge-weekly-internship-notes` | 本周 `handoff/YYYY-MM-DD/*.md` 详细笔记 + `工作汇报.md` | 追加 `### Wn · YYYY-MM-DD~YYYY-MM-DD · <主题>` 章节到 `实习日报.md`，与 W1/W2 格式对齐 |
| `jobs-cli` | 粘贴 JD / 报进度（已投递/笔试/面试/offer/拒信） / 查统计 / 新公司首次投递 | 增删改查 `data/applications.db` (SQLite)，新公司必建 `src/private/hires/offer/<category>/<city>/<company>/<company>.md` |
| `daily-jobs-push` | "日推" / "今天推几个" / "每日岗位" | 5 条硬过滤（双休+100人+转正+学历匹配+批次字段）后输出 3 官网（写 DB） + 3 第三方（仅文本） |

## 日常使用场景

1. **每日推岗** — "今天推几个岗位" → 调 `daily-jobs-push`，自动过滤 + 输出 6 条（官网 3 条入 `applications.db`、第三方 3 条仅文本）
2. **面试题合并** — handoff 里出现 `interview/<topic>.md` + `<topic>-答题记录.md` → 调 `merging-interview-qa`，append-only 追加到 `src/series/knowledge/{分类}/{topic}.md` + `src/series/答题历史/{分类}/{topic}-答题记录.md`
3. **实习周报合并** — 本周 handoff 整理 → 调 `merge-weekly-internship-notes`，追加 Wn 章节到 `实习日报.md`（自动取今天所在自然周 Mon~Sun，可 `--week` 指定补交）
4. **投递进度更新** — "已笔试" / "已 offer" / "挂了" → 调 `jobs-cli update`，改 SQLite；新公司首次必同步建 `src/private/hires/offer/<category>/<city>/<company>/<company>.md`

## 与 handoff/ 的映射

```
OneDrive/桌面/handoff/
├── 2026-07-24/                          ← merge-weekly-internship-notes 扫
│   ├── handoff-2026-07-24-xxx.md
│   └── ...
├── 2026-07-23/                          ← merge-weekly-internship-notes 扫
├── interview/                            ← merging-interview-qa 扫
│   └── 2026-07-24/
│       ├── java.md                       ← merging-interview-qa 题库
│       ├── java-答题记录.md              ← merging-interview-qa 答题
│       └── ...
├── 工作汇报.md                           ← merge-weekly-internship-notes 扫（按 MM-DD 标题）
└── 文档/                                 ← 不属于任何 skill
```

## 触发词速查

| Skill | 触发词 |
|---|---|
| `merging-interview-qa` | 合并面试题 / 追加面试题 / 今日面试题合并 / ingest interview |
| `merge-weekly-internship-notes` | 合并本周实习笔记 / 整理本周周报 / 周总结追加 / 实习周报到博客 / 追加 Wn |
| `jobs-cli` | 录入岗位 / 添加岗位 / 投递 / 笔试 / 面试 / offer / 拒信 / 岗位统计 |
| `daily-jobs-push` | 日推 / 每日岗位 / 今天推几个 / AI 抓岗 |