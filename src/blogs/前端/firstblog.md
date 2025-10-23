---
title: "我的第一篇博客-搭建个人博客网站"
date: 2025-05-17
categories: ["前端开发"]  # 这会被自动填充为对应的分类
tags: ["vue", "vuepress-theme-reco"]  # 这会被自动填充为对应的标签
---


## ✅ 一、基础环境准备

### 1. 安装 Node.js 和 npm

前往官网下载 [Node.js LTS 版本](https://nodejs.org/zh-cn/)，安装后终端执行：

```bash
node -v
npm -v
```

---

## ✅ 二、初始化 VuePress 博客项目

### 1. 初始化项目

```bash
mkdir my-blog
cd my-blog
```

### 2. 安装 VuePress的主题 vuepress-theme-reco

```bash
# 初始化，并选择 2.x
npm install @vuepress-reco/theme-cli@1.0.7 -g
theme-cli init

```

---

## ✅ 三、项目目录结构推荐

```
my-blog
├── docs
│   ├── .vuepress
│   │   ├── public               # 静态资源目录
│   │   ├── components          # 自定义组件 自动注册
│   │   ├── styles      
│   │   ├──── index.css       # 样式文件覆盖原有样式
│   │   └── config.js           # 配置文件
│   └── blogs
│       ├── README.md           #可指定为首页
├── package.json
```

## ✅ 四、配置文件 config.ts

```ts
import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
    //description: "屏幕上的字符随光标跃动，如同浪花轻拍思维的海岸，无尽灵感在键盘上航行",
    bundler: viteBundler(),
    theme: recoTheme({
        home:'/',
        repo: 'your-github-account/blog', // 你的 GitHub 仓库地址（用户名/仓库名）
        colorMode: 'light', // 默认浅色
        colorModeSwitch: true, // 开启切换
        // 自动设置分类
        autoSetBlogCategories: true,
        socialLinks: [
            { icon: "GiteeIcon", link: "https://gitee.com/your-gitee-account" }
        ],
        docsDir: "/docs", //docsDir 是 VuePress 配置项中的一个字段，主要用于指定文档源文件所在的目录路径
        navbar: [
            { text: "主页", link: "/" },
            { text: "我的项目", link: "/myprojects/" },
            { text: "博客", link: "/posts" },
            {
                text: "时间抽",
                link:"/timeline"
            },
            {
                text: "知识库",
                link:"/knowledge/"
            },
            { text: "关于我", link: "/about" },
        ],
        friendshipLinks: [
            {
                title: 'vuepress-recovuepress-recovuepress-recovuepress-reco',
                logo: 'https://avatars.githubusercontent.com/u/54167020?s=200&v=4',
                link: 'https://github.com/vuepress-reco'
            }
        ]
    }),
});

```

更多配置项请查看 [VuePress-reco](https://theme-reco.vuejs.press/docs/theme/frontmatter-home.html)

---
