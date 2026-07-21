---
title: Git
date: 2025-06-09
categories: ["开发工具"]
icon: /assets/icon/git.png
---

## Git 是什么？

Git 是分布式版本控制系统，用于管理源代码变更历史，支持多人协作。每个开发者的本地仓库都是完整的代码库副本，支持离线操作。

**核心功能：**

1. 快速切换分支（branch）
2. 支持版本回退
3. 离线提交
4. 分布式协作（远程仓库）


## Git 中 fetch、pull、merge 的区别？

| 操作 | 是否拉取远程代码 | 是否自动合并 | 用途描述 |
|------|------------------|--------------|----------|
| `git fetch` | ✅ 拉取（不改当前分支） | ❌ 否 | 只同步远程分支，供后续查看或手动合并 |
| `git pull` | ✅ 拉取 | ✅ 自动合并 | 相当于 `fetch` + `merge`，快速同步远程分支 |
| `git merge` | ❌ 否（不拉远程） | ✅ 合并 | 将指定分支合并到当前分支 |

**简要记忆：**

1. `fetch` 拉代码，不动当前分支
2. `merge` 合并指定分支
3. `pull = fetch + merge`，快捷同步更新


## Git 中 push、add、commit 的区别？

| 操作 | 工作区 → 暂存区 | 暂存区 → 本地库 | 本地库 → 远程库 | 功能描述 |
|------|----------------|----------------|----------------|----------|
| `git add` | ✅ 是 | ❌ 否 | ❌ 否 | 把文件加入暂存区，准备提交 |
| `git commit` | ❌ 否 | ✅ 是 | ❌ 否 | 将暂存区内容提交到本地版本库 |
| `git push` | ❌ 否 | ❌ 否 | ✅ 是 | 推送本地提交到远程仓库 |

**简要流程：**

```bash
工作区 --add--> 暂存区 --commit--> 本地库 --push--> 远程仓库
```

**常用组合：**

1. 开发阶段：`git add .` → `git commit -m "注释"`
2. 协作推送：`git push origin 分支名`


## 如何创建、切换、删除分支？

```bash
git branch 分支名              # 创建
git checkout 分支名             # 切换
git checkout -b 分支名           # 创建并切换
git branch -d 分支名             # 删除（已合并）
git branch -D 分支名             # 强制删除（未合并）
git push origin --delete 分支名  # 删除远程分支
```


## 分支合并冲突如何解决？

1. `git status` 找到冲突文件
2. 打开文件，找到 `<<<<<<<` `=======` `>>>>>>>` 标记
3. 手动编辑，保留需要的内容，删除标记
4. `git add` 标记已解决
5. `git commit` 完成合并


## git merge 和 git rebase 的区别？

| 操作 | 提交历史 | 使用场景 |
|------|----------|----------|
| merge | 有分叉和合并节点 | 公共分支、协作 |
| rebase | 线性一条直线 | 本地分支整理历史 |

**原则：** 公共分支用 merge，个人分支用 rebase。

→ [回答历史](../../../series/答题历史/Java/java-答题记录.md#git-merge-vs-git-rebase)


## Git Flow 分支管理策略？

5 种分支类型：

1. **main** — 生产环境，稳定版本
2. **develop** — 开发主分支
3. **feature** — 功能开发（`feature/xxx`）
4. **release** — 发布分支（`release/v1.0`）
5. **hotfix** — 紧急修复（`hotfix/xxx`）


## git reset、git revert、git checkout 的区别？

| 操作 | 作用 | 是否保留历史 |
|------|------|--------------|
| reset | 回退版本 | ❌ 删除提交 |
| revert | 反向提交 | ✅ 新增提交 |
| checkout | 切换/恢复 | - |

**reset 三种模式：**
```bash
git reset --soft HEAD~1   # 回退提交，代码保留在暂存区
git reset --mixed HEAD~1  # 默认，代码保留在工作区
git reset --hard HEAD~1   # 彻底回退，代码不要了
```


## 如何回退到指定版本？

```bash
git log --oneline            # 找到目标 commit hash

git reset --hard 目标 hash    # 本地回退（删除历史）
git revert 目标 hash..HEAD    # 公共分支回退（保留历史）

# 已 push 到远程
git revert 目标 hash..HEAD    # 安全方式
git push origin 分支名

git reset --hard 目标 hash    # 危险方式
git push origin 分支名 --force
```


## git reflog 的作用？误删如何恢复？

reflog 记录所有本地操作历史，即使删除也能找回。

```bash
git reflog                    # 查看所有操作记录
git reset --hard HEAD@{1}     # 回到之前的位置
git branch 新分支名 commit-hash  # 恢复误删的分支
```

**简要记忆：** reflog 是救命命令。


## git stash 的用途？

临时保存工作现场，切换分支修 bug 时用。

```bash
git stash              # 保存当前修改
git stash list         # 查看 stash 列表
git stash pop          # 恢复并删除
git stash apply        # 恢复不删除
git stash drop         # 删除
```


## git cherry-pick 的作用？

复制某个特定提交到当前分支。

```bash
git cherry-pick commit-hash      # 复制单个提交
git cherry-pick hash1 hash2      # 复制多个
```


## 提交错了如何修改最后一次提交？

```bash
git commit --amend -m "新信息"     # 只改信息
git add 遗漏文件                    # 添加遗漏
git commit --amend                  # 合并修改
git push origin 分支名 --force      # 已 push 则强制覆盖
```


## 如何将多个提交合并为一个？

```bash
git rebase -i HEAD~n         # n 是要合并的提交数
# 编辑器中将 pick 改为 squash，保存退出
git push origin 分支名 --force
```


## 如何撤销已经 push 到远程的提交？

```bash
# 公共分支（推荐）
git revert HEAD
git push origin 分支名

# 个人分支
git reset --hard HEAD~1
git push origin 分支名 --force
```

## PR 提交流程？CR 意见不认同怎么处理？

1. 单 PR ≤ 400 行 → 自测通过 → 提 PR 写清楚改动点和原因 → CR → CI 过 → 合并
2. 不认同的意见：先理解对方出发点 → 说明自己理由（拿代码/文档依据）→ 实在僵持拉第三人或 leader 仲裁 → 最终以团队规范为准

→ [回答历史](../../../series/答题历史/我的项目/gf-cms-答题记录.md#pr-提交流程cr-意见不认同怎么处理)

## Docker 多阶段构建解决什么？

**减小最终镜像体积**。阶段 1 用 Maven+JDK 编译，阶段 2 只复制 jar+JRE 运行，扔掉 Maven、源码、完整 JDK。

→ [回答历史](../../../series/答题历史/Java/java-答题记录.md#docker-多阶段构建解决什么)
