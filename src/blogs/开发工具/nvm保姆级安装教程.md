---
title: NVM 保姆级安装教程
date: 2025-11-07
categories: ["开发工具"]
---

# NVM（Node Version Manager）保姆级安装教程

本文首先介绍 NVM 是什么、能干什么、为什么需要它。随后给出保姆级的安装与使用步骤，覆盖 Windows（nvm-windows）、macOS / Linux（原生 nvm）、以及 WSL 的常见场景，并包含常见问题与排查方法。适合初学者一步步跟着操作。

## 开篇：NVM 是什么？干嘛用的？为什么需要它？

- 什么是 NVM：
  NVM（Node Version Manager）是用于管理 Node.js 多版本的工具。它允许你在同一台机器上安装多个 Node 版本，并在不同项目间快速切换。对于前端/后端开发人员、自动化脚本、CI 与历史项目维护非常实用。

- NVM 能做什么：
  - 安装任意受支持的 Node.js 版本（例如 v18、v20、v20.19.0 等）。
  - 在不同版本之间切换（临时或为当前目录固定）。
  - 管理全局包在不同 Node 版本间的隔离（每个 Node 版本有自己的一套全局包）。
  - 配合 `.nvmrc` 文件实现 per-project Node 版本自动化切换（大多数开发工具/CI 支持读取 `.nvmrc`）。

- 为什么需要它（几个常见场景）：
  - 项目A 依赖 Node 16，项目B 要求 Node 20；你不想在不同项目间频繁卸装 Node。
  - CI 或团队规范需要锁定 Node 版本，`.nvmrc` 可以让每个人本地切换到正确版本。
  - 测试兼容性时需要快速在多个 Node 版本上执行相同测试。

- 注意：Windows 上的实现有两个主流选择：原生 `nvm`（适用于 macOS/Linux）与 `nvm-windows`（coreybutler 的移植版本）。二者命令略有不同，且 `nvm-windows` 不完全兼容 `nvm` 的所有脚本行为。

---

## 这篇教程的“契约”（输入/输出、成功判定）

- 输入：你当前的操作系统（Windows / WSL / macOS / Linux），以及是否愿意安装额外工具（管理员权限）。
- 输出：在系统上安装并能使用 NVM，能成功安装 Node 版本并执行 `node -v` 得到对应版本；掌握基本命令（install/use/alias/list）和 `.nvmrc` 的使用。
- 成功判定：运行 `node -v` 返回期望的版本；运行 `nvm --version`（或 `nvm version`）能取得有效响应；且在项目目录放 `.nvmrc` 并执行 `nvm use` 后 Node 版本切换成功。

---

## 目录

1. Windows（nvm-windows）保姆级安装
2. macOS / Linux（原生 nvm）保姆级安装
3. WSL（建议）安装与注意事项
4. 常用命令速查
5. .nvmrc 与项目集成
6. 常见问题与排查

---

## 1. Windows（推荐使用 nvm-windows）保姆级安装

说明：Windows 上最常用且简单的方式是安装 `nvm-windows`（作者：coreybutler）。这是一个二进制安装器，不需要手动编译。注意它与 linux/mac 的 `nvm` 在细节上有差别，但日常使用大体相同。

### 安装前清理（重要）

在安装 `nvm` / `nvm-windows` 之前，强烈建议先卸载系统中已有的 Node.js 版本，以避免 PATH 冲突或旧文件干扰新管理器的工作。

- Windows：通过“应用和功能”/控制面板卸载，或使用第三方卸载工具（推荐：Geek Uninstaller）来彻底删除残留的文件与注册表项：
  1. 下载并运行 [Geek Uninstaller](https://geekuninstaller.com/)，找到 Node.js，选择“强制删除（Force Removal）”。
  2. 卸载后重启终端以确保 PATH 更新。

- macOS / Linux：使用你当初安装 Node 的包管理器卸载（例如 Homebrew、apt、dnf 等），或者手动删除 `/usr/local/bin/node`、`/usr/local/lib/node_modules` 等相关路径：
  - Homebrew:
    ```bash
    brew uninstall --ignore-dependencies node
    ```
  - Debian/Ubuntu:
    ```bash
    sudo apt remove --purge nodejs
    sudo apt autoremove
    ```
  - 若通过官方安装器/二进制安装，删除 `/usr/local/bin/node` 和 `/usr/local/lib/node_modules`，并清理 PATH 中的相关条目。

步骤：

1) 下载 nvm-windows 安装器（需要管理员权限运行安装程序）：

- 官方 Releases 页面（GitHub）：
  https://github.com/coreybutler/nvm-windows/releases

2) 选择最新的 `nvm-setup.exe` 下载并以管理员身份运行。

3) 安装向导要点：
- 安装目录（默认）：`C:\Program Files\nvm`（或你选择的路径）。
- Node.js 的安装目录（默认设置会在 `C:\Program Files\nodejs`，由 nvm 管理）。
- 安装后，重新打开 PowerShell 或 cmd（必须重启终端，或注销/登录），以让 PATH 生效。

4) 验证安装并使用（在 PowerShell 中）：

```powershell
# 打开新的 PowerShell（或 cmd）窗口
nvm --version
# 安装指定版本，例如 20.19.0
nvm install 20.19.0
# 切换到该版本
nvm use 20.19.0
# 验证
node -v
npm -v
```

重要提示（nvm-windows 特有）：
- `nvm` 命令会管理系统级 Node 安装目录；不要手动在 `C:\Program Files\nodejs` 中操作文件。
- 安装后全局包会针对不同版本分离：切换版本后需要重新安装全局包（如果需要）。

卸载 nvm-windows：
- 通过 Windows 控制面板或在安装目录运行卸载程序，然后删除 `C:\ProgramData\nvm`（如果存在）与 PATH 中的残留项。

---

## 2. macOS / Linux（原生 nvm）保姆级安装

说明：在类 Unix 系统上，常用的是 `nvm`（由 creationix / now maintained by other community forks）。安装方式通常是通过 curl 或 wget 拉取并执行安装脚本，然后把初始化脚本加到 shell 配置文件（~/.bashrc / ~/.zshrc / ~/.profile）。

保姆级步骤（示例适用于 bash / zsh）：

1) 运行安装脚本（推荐直接在终端执行）：

```bash
# 使用 curl
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
# 或使用 wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

> 注：上面使用的版本号（v0.39.5）仅作示例，请到 https://github.com/nvm-sh/nvm/releases 查看最新版本并替换。

2) 按提示把下面的内容加入到你的 shell 配置文件（安装脚本一般会自动追加）：

```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf "%s" "$HOME/.nvm" || printf "%s" "$XDG_CONFIG_HOME/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
# 可选：加载 nvm bash_completion
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

3) 重新打开终端或手动 source 配置文件：

```bash
# 例如
source ~/.bashrc
# 或
source ~/.zshrc
```

4) 验证并安装 Node：

```bash
nvm --version
nvm install 20.19.0
nvm use 20.19.0
node -v
```

注意事项：
- 如果你使用 zsh（例如 macOS 默认 zsh），确保将初始化语句加入到 `~/.zshrc`。
- 如果安装后 `nvm` 命令不存在，检查 shell 配置是否被正确加载，或是否安装脚本在不同的 profile（~/.profile）写入了内容。

卸载 nvm（macOS/Linux）：
- 删除 `~/.nvm` 目录，并清理 shell 配置中 `nvm` 的初始化语句。

---

## 3. WSL（Windows Subsystem for Linux）建议与注意事项

- 如果你在 Windows 上同时使用 WSL（Linux 子系统），建议在 WSL 内部按 Linux 步骤使用原生 `nvm` 安装，而不是在 Windows 主机上安装 `nvm-windows` 并尝试在 WSL 中使用。WSL 内部的环境与 Windows 主机环境是分离的。
- 在 WSL 内安装后，在 WSL 的终端运行 `nvm install` / `nvm use` 即可。

---

## 4. 常用命令速查

- 安装 Node 版本：
```bash
nvm install 18
nvm install 20.19.0
```
- 切换到某个版本：
```bash
nvm use 20.19.0
```
- 查看已安装版本：
```bash
nvm ls
```
- 查看可安装的远程版本：
```bash
nvm ls-remote
```
- 设置默认 alias（例如默认 latest LTS）：
```bash
nvm alias default 20.19.0
```
- 移除某个版本：
```bash
nvm uninstall 18
```

（注意：在 `nvm-windows` 中，命令也类似，但语法细节与别名支持可能有所差别，使用 `nvm help` 查看）

---

## 5. 使用 `.nvmrc` 在项目中固定 Node 版本

在项目根创建 `.nvmrc` 并写入想要的 Node 版本号（或 `lts/*`）：

```
20.19.0
```

然后在项目目录执行：

```bash
nvm use
# 或强制安装并使用
nvm install
nvm use
```

这让开发者可以快速用正确的 Node 版本进入项目。CI（如 GitHub Actions）也常用 `.nvmrc` 来设置 Node 版本。

