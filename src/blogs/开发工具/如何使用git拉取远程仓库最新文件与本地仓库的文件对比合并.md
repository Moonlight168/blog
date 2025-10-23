---
title: 使用 Git 拉取远程仓库并与本地文件对比合并
date: 2025-06-09
categories: ["开发工具"]
tags: ["Git"]
---

# 使用 Git 拉取远程仓库并与本地对比合并

## 一、前言

在团队协作或本地代码落后于远程仓库时，我们需要将远程仓库的变更同步到本地，并与当前代码进行对比和合并，避免丢失本地修改。本文将通过命令行方式，说明从查看远程仓库到合并的完整流程。

## 二、查看远程仓库信息

使用以下命令查看远程仓库的别名（默认一般为 `origin`）及对应 URL：

```bash
git remote -v
```

输出示例：

```
origin  https://github.com/user/project.git (fetch)
origin  https://github.com/user/project.git (push)
```

## 三、拉取远程更新（不合并）

使用 `git fetch` 获取远程分支的最新提交，**不会自动合并到当前分支**：

```bash
git fetch origin
```

说明：

* `origin` 是远程仓库名。
* 该命令只更新远程跟踪分支，如 `origin/master`，不修改本地代码。


## 四、对比远程与本地文件差异

若需对比本地文件与远程分支的差异：

```bash
git diff origin/master -- path/to/file
```

说明：

* `origin/master` 表示远程主分支。
* `--` 后为目标文件路径。

> 若不确定远程分支名，可使用 `git branch -r` 查看所有远程分支。


## 五、用远程文件覆盖本地文件（可选）

若希望用远程文件内容替换本地某个文件：

```bash
git checkout origin/master -- path/to/file
```

说明：

* 不会自动合并，只是拷贝远程文件到本地工作区。
* 可用于对比、还原、修复某些特定文件。


## 六、合并远程分支到本地分支

确认无误后，将远程分支合并到当前分支：

```bash
git merge origin/master
```

说明：

* 建议先 `fetch`，再 `merge`，可以控制流程。
* `git pull` = `git fetch` + `git merge`，适合快速同步。


## 七、解决合并冲突

若本地和远程内容冲突，Git 会提示：

```
CONFLICT (content): Merge conflict in path/to/file
```

冲突格式如下：

```text
<<<<<<< HEAD
本地修改
=======
远程修改
>>>>>>> origin/master
```

**解决步骤：**

1. 手动修改冲突内容，删除冲突标记。
2. 使用 `git add 文件名` 标记冲突解决。
3. 执行 `git commit` 提交合并。


## 八、常用命令速查表

| 场景          | 命令                                           |
| ----------- | -------------------------------------------- |
| 查看远程仓库信息    | `git remote -v`                              |
| 拉取远程更新（不合并） | `git fetch origin`                           |
| 对比文件差异      | `git diff origin/master -- path/to/file`     |
| 获取远程文件替换本地  | `git checkout origin/master -- path/to/file` |
| 合并远程分支到当前分支 | `git merge origin/master`                    |
| 解决冲突后提交     | `git add . && git commit -m "fix conflict"`  |

