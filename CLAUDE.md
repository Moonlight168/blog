# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
npm install
npm run docs:dev     # Dev server on port 8888
npm run docs:build   # Production build
```

**Node.js >= 20.19.0** (see `.nvmrc`)

## Architecture

VuePress 2.0 + vuepress-theme-hope 博客知识库站点。

```
my-docs/
├── src/
│   ├── .vuepress/
│   │   ├── config.ts    # Port 8888, slimsearch 插件，百度统计
│   │   ├── theme.ts     # 主题配置，博客过滤规则
│   │   ├── navbar/      # 导航栏配置
│   │   ├── sidebar/     # 侧边栏配置
│   │   └── presets/getBlogsSidebar.ts  # 动态侧边栏生成
│   ├── blogs/           # 博客文章 (动态侧边栏)
│   ├── series/
│   │   ├── knowledge/   # 面试宝典 (Java/分布式/数据库等)
│   │   └── myprojects/  # 项目文档 (FlowMind/淘票票/邮院通)
│   └── about/           # 关于页
└── README.md            # 首页
```



## Git 提交规范

```bash
git commit -m "feat: 新增用户查询接口"
# 前缀：feat/fix/docs/style/refactor/test/chore
```
