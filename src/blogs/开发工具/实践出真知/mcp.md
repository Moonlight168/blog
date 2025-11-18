---
title: 在 VS Code 中用 Chrome DevTools MCP 实现自动化搜索输入并按项目配置 mcp.json
date: 2025-11-07
categories: ["开发工具"]
---
# 在 VS Code 中用 Chrome DevTools MCP 实现自动化搜索输入并按项目配置 mcp.json

本文记录如何在 Visual Studio Code 中使用 `chrome-devtools-mcp`（以下简称 MCP）实现自动化的“打开浏览器 → 导航到搜索引擎 → 在搜索框输入并提交 → 等待结果并截屏”的流程；并说明如何根据不同项目分配或覆盖不同的 `mcp.json` 配置，以便在多项目仓库或多工作区场景下更灵活地使用 MCP。

## 要点速览

- MCP 依赖：Node >= 20.19.0、Chrome（或可连接的 Chrome 实例）。
- 在 VS Code 中，MCP 的服务器配置通常放在工作区的 `.vscode/mcp.json` 中；如果你需要为不同项目使用不同配置，只需在对应项目（即子文件夹）的 `.vscode/mcp.json` 中放置各自配置，或使用 multi-root workspace 来区分。
- 自动化操作可使用 MCP 提供的工具（new_page / navigate_page / fill / click / wait_for / take_screenshot / evaluate_script 等）。

参考：
- chrome-devtools-mcp npm 包文档：https://www.npmjs.com/package/chrome-devtools-mcp
- chrome-devtools-mcp 工具参考（工具列表/参数说明）：https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/HEAD/docs/tool-reference.md

---

## 一、准备工作（先决条件）

1. 本地 Node 版本 >= 20.19.0（或使用 Volta / nvm 切换到该版本）。
2. Chrome（stable）或可远程调试的 Chrome 实例。
3. 在项目中有访问并修改 `.vscode` 的权限。

快速验证命令（PowerShell）

```powershell
node -v        # 确认 Node 版本
"C:\Program Files\Google\Chrome\Application\chrome.exe" --version
```

## 二、MCP 简要说明

`chrome-devtools-mcp` 是一个 MCP server，实现了对 Chrome DevTools 的封装，提供一组易用的“工具”（tools）来做导航、点击、输入、等待、截屏、性能采集等自动化与调试工作。服务器可以通过在 `mcp.json` 中配置来启动（或连接到已经运行的浏览器）。

常用服务器启动参数示例：
- `--headless`：是否以 headless 模式运行。
- `--isolated`：是否为每次运行使用临时 user-data-dir（退出后清理）。
- `--channel`：chrome 通道（stable | canary | beta | dev）。
- `--browserUrl` / `--wsEndpoint`：连接到已运行的 Chrome（用于受限或 sandbox 环境）。

更多参数见参考文档（上方链接）。

---

## 三、如何在 VS Code 中替换/扩展默认 `mcp.json`（按项目配置）

VS Code 的 MCP 客户端会读取工作区（workspace）中的 `.vscode/mcp.json`。因此你可以：

- 在每个项目/子文件夹中放置自己的 `.vscode/mcp.json`。打开该项目文件夹为 workspace 时，VS Code 会使用该文件作为该文件夹的 MCP 配置。
- 如果你使用 multi-root workspace（.code-workspace），为不同的 folder 指定各自 `.vscode/mcp.json` 即可。

示例目录结构（单仓库下每项目单独配置）：
```
my-docs/
  src/
    blogs/
      开发工具/    <-- 我们的文章放这里
      项目A/       <-- 项目 A 根
        .vscode/mcp.json   <-- 项目 A 的 MCP 覆盖配置
      项目B/
        .vscode/mcp.json   <-- 项目 B 的 MCP 覆盖配置
```

注意：VS Code 是按打开的工作区 / folder 来决定 `.vscode` 的作用域的，打开哪个 folder 就会生效哪个 `.vscode/mcp.json`。

---

## 四、示例：项目级 `mcp.json`（推荐示例）

把下面 JSON 文件放到你项目根的 `.vscode/mcp.json`，当你在该项目里打开 VS Code 时，这个配置会作为该项目的 MCP server 配置：

```jsonc
{
  "servers": {
    "chromedevtools/chrome-devtools-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--browserUrl", "${input:browser_url}",
        "--headless", "${input:headless}",
        "--isolated", "${input:isolated}",
        "--channel", "${input:chrome_channel}"
      ]
    }
  },
  "inputs": [
    {"id":"browser_url","type":"promptString","description":"可选：连接到已运行的 Chrome（例如 http://127.0.0.1:9222）","default":""},
    {"id":"headless","type":"promptString","description":"是否 headless（true/false）","default":"false"},
    {"id":"isolated","type":"promptString","description":"是否使用临时 user-data-dir（true/false）","default":"true"},
    {"id":"chrome_channel","type":"promptString","description":"chrome 通道（stable/canary/beta/dev）","default":"stable"}
  ]
}
```

说明：上面示例与仓库默认的 `.vscode/mcp.json` 类似，但把 `isolated` 默认打开。你可以按项目需要调整 `--headless`、`--channel`、或者添加 `--viewport`、`--executablePath` 等参数。

---

## 五、实战：用 MCP 在百度/Google 上自动搜索并截屏（概念步骤）

下面是一个使用 MCP 工具序列实现“自动搜索并截屏”的最小流程（可在你的 MCP 客户端中逐条调用这些工具）：

1. new_page -> 打开一个新标签页（或直接 navigate_page 到目标 URL）
2. navigate_page -> 导航到 `https://www.baidu.com` 或 `https://www.google.com`
3. evaluate_script 或 fill -> 找到搜索输入框并写入关键词（例如 `我的世界` / `今日天气`）
4. click 或派发回车 -> 提交搜索
5. wait_for -> 等待页面包含关键词或某个 css 选择器
6. take_screenshot -> 保存截图


上面的步骤在我们测试时可行（遇到 Google 可能会触发机器人检测，建议使用 Baidu 或在有稳定 cookie 的 Chrome profile 下运行）。

---


有两种方向：

1. 在 VS Code 中通过 MCP 客户端交互式运行上面步骤（适合探索/调试）。
2. 编写一个小的 Node 脚本或任务，借助 `chrome-devtools-mcp` 提供的 CLI 自动化（或者直接用 puppeteer/playwright）。

示例：用 MCP 客户端交互式执行的“提示”内容：
```
打开一个新的页面 -> 导航到 https://www.baidu.com -> 在搜索框键入：我的世界 -> 提交 -> 等待 -> 截图并保存
```

如果你希望将步骤写成脚本并在 CI 中运行，更稳妥的方案是使用 puppeteer/Playwright（或在 CI 上启动 `chrome-devtools-mcp` 并通过 MCP 客户端发起预先定义的动作）。

---

## 七、调试建议与常见问题

- 如果 MCP 报错 `chrome-devtools-mcp does not support Node vX.Y.Z`：请切换到 Node >= 20.19.0（或项目指定的 engines）。  详情见使用NVM管理，[NVM保姆级安装教程](nvm保姆级安装教程.md)。
- 如果被网站反爬（例如 Google 出现验证页），请使用已登录或有合适 profile 的 Chrome（或选择另一搜索引擎测试）。

---

## 八、参考链接
- chrome-devtools-mcp 工具参考（GitHub docs）：https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/HEAD/docs/tool-reference.md
