# 项目可用 Skills

本项目下挂载的**面试相关** skill 速查。skill 文件本体在项目级 `my-docs/.claude/skills/<name>/SKILL.md`（已从全局 `C:\Users\86130\.claude\skills\` 迁移至此）。

## Skill 总览

| Skill | 何时调用 | 主要动作 |
|---|---|---|
| `adding-interview-questions` | 用户指定 topic 要求新增/生成面试题（"新增面试题" / "写三道 xx 的题" / topic 出题） | 生成 **3 道**开放型口语化面试题 + 口语化衔接答案，融入 `src/series/knowledge/{分类}/{topic}.md` 与 `src/series/答题历史/{分类}/{topic}-答题记录.md` |
| `interview-grill` | 开始模拟面试、大厂笔试、在线测评、OA、编码面试、手撕题 | 按简历/岗位/JD/Topic 进行有状态面试拷打，三模式（面试/笔试/编码），写入题库+答题记录 |

## 日常使用场景

1. **新增面试题** — "topic=前沿 agent 加 3 道题" → 调 `adding-interview-questions`，生成 3 道口语化题 + 答案，融入对应技术文档与答题记录
2. **模拟面试 / 笔试 / 手撕** — "开始模拟面试" / "topic=java" / "大厂笔试" → 调 `interview-grill`，准备门禁后逐题拷打、点评、归档

## 触发词速查

| Skill | 触发词 |
|---|---|
| `adding-interview-questions` | 新增面试题 / 加几道题 / topic=xx 出题 / 写三道 xx 的面试题 / 前沿 agent 出题 |
| `interview-grill` | 开始模拟面试 / 面试拷打 / 大厂笔试 / 在线测评 / OA / 编码面试 / 手撕题 / topic=python,agent |
