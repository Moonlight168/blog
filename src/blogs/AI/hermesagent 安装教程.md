---
title: HermesAgent 安装教程
date: 2026-04-22
categories: ["AI"]
---

# HermesAgent 安装教程

> 官网安装文档：https://hermesagent.org.cn/docs/getting-started/windows-installation

---

## 一、安装

### Linux / macOS / WSL2

```bash
# 国内加速
curl -fsSL https://res1.hermesagent.org.cn/install.sh | bash
```

### Windows PowerShell

```powershell
# 国内加速
irm https://res1.hermesagent.org.cn/install.ps1 | iex
```

::: tip 选择建议
- **类 Unix 用户**（Linux/macOS/WSL2）：直接使用第一条 bash 命令
- **Windows 原生用户**：使用第二条 PowerShell 命令
- **长期使用推荐**：WSL2 是大多数 Windows 用户的首选方案
:::

### 激活虚拟环境

安装完成后，每次使用前需先激活虚拟环境：

```bash
# Linux/macOS/WSL2
source ~/.hermes/hermes-agent/venv/bin/activate

# Windows PowerShell
~\.hermes\hermes-agent\venv\Scripts\Activate.ps1
```

---

## 二、配置模型

```bash
hermes setup
hermes model

# 直接编辑配置文件
nano ~/.hermes/.env
```

支持连接 Kimi、GLM、MiniMax 或任意 OpenAI 接口兼容模型。

---

## 三、基础使用

### 开始对话

```bash
hermes
```

启动完整 TUI，支持多行输入、命令补全、上下文压缩、工具输出流和会话历史。

### 接入消息网关

```bash
hermes gateway setup
hermes gateway
```

为 Hermes 接入 Telegram、Discord、Slack、WhatsApp、企业微信、飞书、钉钉等平台。

---

## 四、添加与使用 Skill

通过复制方式将外部 Skill 添加到 Hermes：

```bash
cd ~/draco-skills-collection

# 复制技能文件夹到 Hermes 的 skills 目录
cp -r wechat-article-camofox wechat-article-browseruse ~/.hermes/hermes-agent/skills/
```

启动后，在 Hermes 对话中直接输入 Skill 名称即可调用：

```
用 wechat-article-camofox 帮我抓取 https://mp.weixin.qq.com/s/0DmnGK4zvEEgLG_IUiEOBw 并发布到飞书
用 wechat-article-browseruse 帮我抓取网页 https://mp.weixin.qq.com/s/Bw6shSruXgfYW4hRlIjQYg 并发布到飞书
```

---

## 五、抓取微信公众号文章到飞书

如果你需要把微信公众号文章抓取并发布到飞书，可以使用 [wechat-article-camofox](https://github.com/dracohu2025-cloud/draco-skills-collection/tree/main/wechat-article-camofox) 工具。

### 功能亮点

- 自动安装 CamouFox 抓取层，首次运行自动 clone + npm install
- 结构化正文清洗，修复公众号多余圆点、列表粘连、inline code 拆行等问题
- 支持输出 Markdown / JSON / 飞书原生文档

### 前置要求

- Python 3.9+、git、Node.js 18+
- 如需发布到飞书：运行 `npm install -g @larksuite/cli` 并登录

### 快速开始

```bash
# 克隆仓库到主目录
git clone https://github.com/dracohu2025-cloud/draco-skills-collection.git ~/draco-skills-collection

# 复制技能文件夹到 Hermes 的 skills 目录
cp -r wechat-article-camofox wechat-article-browseruse ~/.hermes/hermes-agent/skills/

# 抓取为 Markdown
python3 ~/.hermes/hermes-agent/skills/wechat-article-camofox/scripts/run.py fetch "https://mp.weixin.qq.com/s/0DmnGK4zvEEgLG_IUiEOBw"

python3 ~/.hermes/hermes-agent/skills/wechat-article-browseruse/scripts/run.py fetch "https://mp.weixin.qq.com/s/Bw6shSruXgfYW4hRlIjQYg"

# 抓取并直接发布到飞书原生文档
python3 ~/.hermes/hermes-agent/skills/wechat-article-camofox/scripts/run.py publish-feishu "https://mp.weixin.qq.com/s/0DmnGK4zvEEgLG_IUiEOBw"

# 推送到指定文档

python3 ~/.hermes/hermes-agent/skills/wechat-article-camofox/scripts/run.py publish-feishu "https://mp.weixin.qq.com/s/0DmnGK4zvEEgLG_IUiEOBw" --folder-token AaCyfWPVHlzkafdb5qSchRBFnsg

python3 ~/.hermes/hermes-agent/skills/wechat-article-browseruse/scripts/run.py publish-feishu --folder-token AaCyfWPVHlzkafdb5qSchRBFnsg "https://mp.weixin.qq.com/s/Bw6shSruXgfYW4hRlIjQYg"
```

::: warning 重要：健康检查的误导性
脚本输出 `camofox-browser is healthy` 只说明 **Node API 服务（:9377 端口）已就绪**，并不代表浏览器 runtime 真正在运行。实际抓取时会直接报 500 错误，health 检查会显示 `browserConnected: false, browserRunning: false`。

camofox-browser 分两层：
- **API 服务层**（Node）→ 自动安装成功
- **浏览器运行时**（Firefox 内核）→ 需要系统依赖，需手动补全

**解决**：执行「常见问题 1」中的系统依赖安装命令，然后手动重启浏览器服务。
:::

---

## 六、常见问题

### 1. camofox-browser 启动失败（系统依赖缺失）

**现象**：`libasound.so.2: cannot open shared object file` / `Couldn't load XPCOM` / `xvfb not available, falling back to headless`

**原因**：Linux 缺少浏览器运行依赖库（音频、GTK、X11 等）

**解决**：
```bash
sudo apt update && sudo apt install -y libgtk-3-0t64 libx11-xcb1 libasound2t64 libdbus-glib-1-2
```

### 2. Node 版本不兼容

**现象**：`EBADENGINE Unsupported engine (Node 18)` requires Node 20+

**解决**：
```bash
nvm install 20
nvm use 20
```

### 3. camofox 端口被占用

**现象**：`port in use: 9377`

**解决**：
```bash
lsof -i :9377
kill -9 <PID>
cd camofox-browser
npm start
```

### 4. camofox fetch 返回 500（浏览器未真正启动）

**现象**：`HTTP Error 500: Internal Server Error`，health 显示 `browserConnected: false, browserRunning: false`

**原因**：camofox-server API 进程在跑，但浏览器 runtime 未成功启动

**解决**：
1. 补齐系统依赖（见问题 1）
2. 安装浏览器内核：
```bash
npx camoufox fetch
```
3. 重启浏览器：
```bash
cd camofox-browser
npm start
```
4. 验证浏览器正常运行：
```bash
curl http://localhost:9377/health
# 应返回 {"browserConnected": true, "browserRunning": true}
```

### 5. 飞书 CLI 解除旧绑定

**现象**：`FileNotFoundError: lark-cli` 或需要切换到新的 Hermes 机器人

**解决**：

```bash
# 解除旧绑定
lark-cli config remove

# 重新初始化 Hermes 机器人
lark-cli config init

# 登录
lark-cli auth login
```

### 6. wechat-article-browseruse 找不到 .env

**现象**：运行时提示找不到环境变量（如 `BROWSER_USE_API_KEY`）

**原因**：Hermes 虚拟环境内无法自动加载 Skill 目录下的 `.env` 文件

**解决**：

**第一步**：安装加载 .env 的工具
```bash
pip install python-dotenv
```

**第二步**：编辑脚本，加载 .env 文件
编辑 `~/.hermes/hermes-agent/skills/wechat-article-browseruse/scripts/run.py`，在文件最顶部添加：
```python
from dotenv import load_dotenv
import os
load_dotenv()  # 自动读取技能根目录的 .env
```

# 后期启动流程

```bash
# 激活 Hermes 虚拟环境
source ~/.hermes/hermes-agent/venv/bin/activate

# 启动 Hermes 消息网关
hermes gateway
```

启动后，在 Hermes 对话中直接输入 Skill 名称即可调用。参考提示词：

```
用 wechat-article-camofox 帮我抓取 https://mp.weixin.qq.com/s/0DmnGK4zvEEgLG_IUiEOBw 并发布到飞书
用 wechat-article-browseruse 帮我抓取网页 https://mp.weixin.qq.com/s/Bw6shSruXgfYW4hRlIjQYg 并发布到飞书
```
