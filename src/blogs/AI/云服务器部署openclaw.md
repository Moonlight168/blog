# OpenClaw 在云服务器上 Docker Compose 部署实战

本文记录了我在云服务器 Ubuntu 上，从源码部署 OpenClaw 到使用 Docker Compose 启动的完整过程，包括网络受限情况下的解决方案、本地构建技巧以及远程访问 WebUI 的方法。

---

# 一、部署 OpenClaw

## 1️⃣ 准备工作

### 安装依赖

确保服务器安装 **Docker** 和 **Docker Compose**：

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker --now
sudo usermod -aG docker $USER
```

> 允许当前用户直接使用 docker 命令（无需 root）。

检查版本：

```bash
docker -v
docker-compose -v
```

---

## 2️⃣ Clone OpenClaw 源码

```bash
cd ~/workspace
git clone https://ghproxy.com/https://github.com/openclaw/openclaw.git
cd openclaw
```

如果服务器可以直接访问 GitHub，也可以使用 SSH：

```bash
git clone git@github.com:openclaw/openclaw.git
```

---

## 3️⃣ 配置 OpenClaw

OpenClaw 的核心配置分为两部分：

| 配置              | 位置               | 作用          |
| --------------- | ---------------- | ----------- |
| `.env`          | 项目根目录            | 环境变量        |
| `openclaw.json` | 用户目录 `.openclaw` | Agent 与模型配置 |

---

### 3.1 配置 `.env` 文件

创建项目根目录 `.env`：

```dotenv
OPENAI_API_KEY=sk-xxxx
ANTHROPIC_API_KEY=sk-xxxx
QWEN_API_KEY=sk-xxxx
GIT_BRANCH=openclaw-dev
WORKSPACE=/workspace
OPENCLAW_CONFIG_DIR=/root/.openclaw
OPENCLAW_WORKSPACE_DIR=/root/workspace
```

说明：

* `.env` 用于存储 **API Key 等敏感信息**
* 不要提交到 GitHub
* Docker Compose 会自动加载

---

### 3.2 配置 `openclaw.json`

创建配置目录：

```bash
mkdir -p ~/.openclaw
nano ~/.openclaw/openclaw.json
```

示例：

```json
{
  "model": {
    "provider": "openai",
    "model_name": "gpt-4o-mini",
    "api_key": "${OPENAI_API_KEY}"
  },
  "workspace": "/workspace",
  "git": {
    "auto_commit": true,
    "branch": "openclaw-dev"
  },
  "agent": {
    "auto_run": true,
    "max_steps": 50
  }
}
```

说明：

* `${OPENAI_API_KEY}` 会自动从 `.env` 读取
* `workspace` 是 OpenClaw 开发目录
* Git 配置可自动 commit / push

---

# 二、构建 Docker 镜像

## 4️⃣ 构建 OpenClaw Docker 镜像

### 4.1 构建本地镜像

```bash
docker build -t openclaw:local .
```

---

## 常见问题

### 1️⃣ Docker Hub 拉取超时

构建时可能卡在：

```
FROM node:22-bookworm
Get "https://registry-1.docker.io/v2/": context deadline exceeded
```

### 原因

1. Dockerfile 需要拉取基础镜像 `node:22-bookworm`
2. 云服务器访问 Docker Hub 慢
3. 构建阶段无法下载镜像

---

### 解决方法：配置国内镜像

```bash
sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
}
EOF

sudo systemctl restart docker
```

然后重新构建：

```bash
docker build -t openclaw:local .
```

---

### 2️⃣ BuildKit 未启用

如果看到错误：

```
the --mount option requires BuildKit
```

说明 Docker 构建器未启用。

---

### 步骤 1：检查 buildx

```bash
docker --version
docker buildx version
```

如果没有：

```bash
sudo apt install docker-buildx
```

---

### 步骤 2：启用 BuildKit

编辑：

```
/etc/docker/daemon.json
```

```json
{
  "features": {
    "buildkit": true
  },
  "registry-mirrors": [
  ]
}
```

重启 Docker：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

---

### 步骤 3：验证

```bash
docker info | grep -i buildkit
```

应看到：

```
BuildKit: enabled
```

---

### 步骤 4：重新构建

```bash
docker buildx build -t openclaw:local .
```

---

# 三、Docker Compose 启动

## 5️⃣ Docker Compose 配置

通过 `.env` 指定镜像和目录：

```env
OPENCLAW_IMAGE=openclaw:local
OPENCLAW_CONFIG_DIR=/root/.openclaw
OPENCLAW_WORKSPACE_DIR=/root/workspace
```

说明：

| 参数             | 作用            |
| -------------- | ------------- |
| OPENCLAW_IMAGE | 指定使用本地镜像      |
| CONFIG_DIR     | OpenClaw 配置目录 |
| WORKSPACE_DIR  | 开发工作目录        |

---

## 6️⃣ 启动 OpenClaw

```bash
docker-compose up -d
```

查看日志：

```bash
docker-compose logs -f
```

正常情况下会看到：

```
OpenClaw Agent started
Workspace: /workspace
Branch: openclaw-dev
```

---

## 7️⃣ 验证运行

查看容器：

```bash
docker-compose ps
```

检查 workspace：

```bash
ls ~/workspace
git log -1
```

如果启用了 Git 自动提交：

OpenClaw 会自动 commit 并 push 到 `openclaw-dev` 分支。

---

# 四、远程访问 OpenClaw WebUI

默认情况下 OpenClaw **不建议直接暴露公网端口**，推荐通过 SSH 隧道访问。

---

## 8️⃣ 配置 WebUI 安全访问

OpenClaw 对 Control UI 有安全限制：

* 默认只允许 `127.0.0.1`
* 非本机访问必须配置 `allowedOrigins`

编辑：

```
~/.openclaw/openclaw.json
```

```json
{
  "gateway": {
    "controlUi": {
      "allowedOrigins": [
        "http://127.0.0.1:18789",
        "http://localhost:18789"
      ],
      "dangerouslyAllowHostHeaderOriginFallback": false
    }
  }
}
```

说明：

| 参数                                       | 作用                |
| ---------------------------------------- | ----------------- |
| allowedOrigins                           | 允许访问 WebUI 的来源    |
| dangerouslyAllowHostHeaderOriginFallback | 绕过 Origin 检查（不推荐） |

---

## 9️⃣ SSH 隧道访问 WebUI（推荐）

本地执行：

```bash
ssh -L 18789:127.0.0.1:18789 root@服务器IP
```

浏览器访问：

```
http://127.0.0.1:18789
```

这样：

* WebUI 不暴露公网
* 只有 SSH 用户可访问

---

# 五、SSH 密钥登录配置（Windows）

为了方便访问服务器，可以配置 **SSH 密钥登录**。

## 前置准备

腾讯云控制台生成 `.pem` 密钥。

---

### 步骤1：设置私钥权限

Windows 必须限制权限：

1. 右键 `.pem`
2. 属性 → 安全 → 高级
3. 禁用继承
4. 只保留当前用户读取权限

---

### 步骤2：绑定密钥到服务器

腾讯云控制台：

```
云服务器 → 密钥对 → 绑定实例
```

绑定后 **必须重启服务器**。

服务器启动后进入：

```
/root/.ssh
```

确保 `authorized_keys` 包含公钥。

---

### 步骤3：配置 SSH config

```
C:\Users\用户名\.ssh\config
```

```config
Host openclaw
  HostName 111.111.111.111
  User root
  IdentityFile "C:\Users\用户名\.ssh\openclaw_dev.pem"
```

以后只需：

```bash
ssh openclaw
```

即可登录。

---

# 六、访问 WebUI 常见问题

## 1️⃣ pairing required

提示：

```
pairing required
```

需要授权设备。

请求时携带 token：

```
http://127.0.0.1:18789/?token=xxxx
```

然后执行：

```bash
docker-compose run --rm openclaw-cli devices list
docker-compose run --rm openclaw-cli devices approve <requestId>
```

---

## 2️⃣ gateway token missing

提示：

```
unauthorized: gateway token missing
```

解决：

在访问 URL 中加入 token。

---

## 3️⃣ workspace 权限错误

错误：

```
EACCES: permission denied
```

原因：

OpenClaw 容器默认使用 **node 用户（UID 1000）运行**。

解决：

```bash
chown -R 1000:1000 ~/workspace
```

---

# 七、小贴士

1️⃣ `.env` 不要提交 GitHub
2️⃣ `openclaw.json` 放在 `~/.openclaw/`
3️⃣ Docker 镜像建议 **本地构建**
4️⃣ WebUI 推荐 **SSH 隧道访问**
5️⃣ workspace 目录注意 **权限问题**

---

# 总结

OpenClaw 在云服务器部署的关键点：

* 使用 **Docker Compose 隔离运行**
* `.env` + `openclaw.json` 管理配置
* 本地构建 Docker 镜像避免网络问题
* 使用 SSH 隧道安全访问 WebUI
* workspace 挂载实现持久化开发环境

部署完成后，OpenClaw 可以自动：

* 编写代码
* 自动 commit
* 自动 push 到 Git 分支

实现 **AI 自动开发工作流**。
