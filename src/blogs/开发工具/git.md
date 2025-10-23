---
title: Git 核心命令速查表
date: 2025-10-23
updated: 2025-10-23
icon: /assets/icon/git.png
category: 开发工具
tag:
- Git
- 版本控制
---

# Git 核心命令速查表
掌握这些高频 Git 命令，让版本控制效率翻倍 🚀


## 暂存区操作
| 命令                | 说明                                                                 |
|---------------------|----------------------------------------------------------------------|
| `git reset`         | 取消暂存区的文件（仅撤销 `git add` 操作，不影响本地文件）|
| `git rm --cached <文件>` | 从暂存区移除文件（保留本地文件，仅停止 Git 跟踪）|


## 仓库跟踪管理
```bash
# 列出仓库中所有已跟踪的文件
git ls-files  

# 清除 Git 对指定目录的跟踪（仅本地跟踪，不删除文件）
git rm -r --cached <目录>  
```


## 远程仓库推送
```bash
# 推送**当前本地分支**到远程 `gh-pages` 分支
git push origin HEAD:gh-pages  
```


## 拓展技巧
- 若需批量清除所有已忽略文件的跟踪，可执行：
  ```bash
  git rm -r --cached . && git add . && git commit -m "清除已忽略文件的跟踪"
  ```
- 结合 `git status` 定期检查仓库状态，避免冗余文件被跟踪。

