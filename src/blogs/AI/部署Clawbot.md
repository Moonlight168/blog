---
title: "部署Clawbot"
date: 2026-01-28
---
# Clawbot部署指南：WSL2+Ubuntu+RTX3060最佳实践

## 快速导航
- [项目说明](#项目说明)
- [环境推荐](#环境推荐)
- [硬件要求](#硬件要求)
- [部署步骤](#部署步骤)
- [常见问题](#常见问题)
- [总结](#总结)

## 项目说明

### 关于名称变更
- **当前状态**：Clawbot曾计划更名为Moltbot，但由于npm包被第三方抢先注册，目前稳定的CLI命令仍是`clawdbot`
- **注意事项**：npm上的`moltbot`包不是官方发布，安装后可能导致命令无效
- **官方建议**：继续使用`clawdbot`命令，这是当前稳定的选择

### 核心功能
- 支持WhatsApp、Telegram、Discord等消息平台
- 保持对话上下文，支持主动提醒
- 浏览器控制、文件管理等扩展功能
- 支持本地部署，推荐使用云LLM（如Anthropic）
- 可自定义开发/游戏模式切换、AI每周总结等功能

## 环境推荐

### 推荐配置：WSL2 + Ubuntu（★★★★★）
- **官方支持**：Moltbot（原Clawbot）官方推荐Linux环境
- **安全可靠**：Linux权限模型和沙箱机制更完善
- **避免兼容问题**：原生Windows环境未经过充分测试
- **性能优秀**：WSL2提供接近原生Linux的性能

### 不推荐：原生Windows
- **未测试环境**：可能存在未发现的兼容性问题
- **权限管理复杂**：Windows权限模型对AI代理不够友好
- **沙箱机制有限**：安全隔离效果不如Linux

## 硬件要求
- 内存：16GB及以上
- 显卡：RTX3060 12GB及以上NVIDIA显卡
- 系统盘：SSD

## 软件环境
- Win11 22H2+（支持WSL2）
- WSL2 Ubuntu 22.04（默认发行版）
- Docker Desktop（WSL2后端）
- Node.js 22+（官方要求）
- 个人知识库文件夹（如D:\我的知识库\AI每周总结\）

## 部署步骤

### 1. 配置WSL2环境

#### 1.1 安装WSL2和Ubuntu
```powershell
# 以管理员身份运行PowerShell
wsl --install
wsl --set-default-version 2
wsl --install -d Ubuntu
```

#### 1.2 进入WSL2
```powershell
# 启动并进入Ubuntu
wsl
```

#### 1.3 配置npm路径（重要）
修正npm的全局路径和缓存路径，确保指向WSL本地路径：

```bash
# 1. 清空当前npm配置
npm config delete prefix
npm config delete cache

# 2. 设置WSL本地路径
npm config set prefix /home/$(whoami)/.npm-global
npm config set cache /home/$(whoami)/.npm-cache

# 3. 验证配置
npm config get prefix
npm config get cache
```

#### 1.4 配置环境变量
```bash
# 1. 添加全局路径到环境变量
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc

# 2. 加载新配置
source ~/.bashrc

# 3. 验证配置
echo $PATH | grep .npm-global
```

#### 1.5 安装依赖
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要依赖
sudo apt install -y curl wget git build-essential
```

### 2. 安装Clawbot

#### 2.1 安装Node.js
```bash
# 安装Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 验证
node -v && npm -v
```

#### 2.2 安装并启动Clawbot
```bash
# 全局安装
npm install -g clawdbot@latest

# 运行设置向导
clawdbot onboard --install-daemon

# 启动服务
clawdbot gateway start

# 安装服务
clawdbot service install
```

#### 2.3 配置Clawbot
编辑`~/.clawdbot/clawdbot.json`配置文件：

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "local_vllm": {
        "baseUrl": "http://localhost:8001/v1",
        "apiKey": "none",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen2.5_3b_instruct",
            "name": "qwen2.5_3b_instruct",
            "contextWindow": 16384,
            "maxTokens": 4096
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "local_vllm/qwen2.5_3b_instruct"
      },
      "sandbox": {
        "mode": "non-main",
        "scope": "agent",
        "workspaceAccess": "none"
      }
    }
  },
  "tools": {
    "profile": "minimal",
    "allow": ["messaging", "sessions_list", "sessions_history"],
    "deny": ["exec", "write", "edit", "apply_patch", "browser", "web_fetch", "web_search", "process"]
  },
  "dmPolicy": "pairing",
  "requireMention": true,
  "gateway": {
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "你的安全token"
    }
  },
  "commands": [
    {
      "trigger": ["吃鸡", "游戏模式"],
      "action": "wsl.exe --shutdown"
    },
    {
      "trigger": ["开发模式"],
      "action": "echo '开发模式已启动' && docker start nacos mysql"
    }
  ],
  "cron": [
    {
      "schedule": "0 20 * * 0",
      "action": "bash ~/clawbot-scripts/ai-weekly-summary.sh"
    },
    {
      "schedule": "0 2 * * *",
      "action": "bash ~/clawbot-scripts/backup-dev-data.sh"
    }
  ]
}
```

配置完成后重启服务：
```bash
clawdbot gateway restart
```

### 3. 部署vLLM服务

#### 3.1 创建Docker Compose文件
创建`docker-compose.yml`文件：

```yaml
services:
  vllm:
    image: vllm/vllm-openai:v0.6.0
    container_name: flowmind-vllm
    restart: always
    ports:
      - "8001:8000"
    runtime: nvidia
    shm_size: 2g
    environment:
      - HF_ENDPOINT=https://hf-mirror.com
    command: >
      --model Qwen/Qwen2.5-3B-Instruct
      --max-model-len 16384
      --gpu-memory-utilization 0.9
      --dtype bfloat16                    
      --trust-remote-code            
      --served-model-name qwen2.5_3b_instruct
      --host 0.0.0.0         
      --port 8000      
      --enforce-eager                    
    volumes:
       - F:/huggingface-cache:/root/.cache/huggingface
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/v1/models"]
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 60s

networks:
  flowmind-network:
    driver: bridge
```

#### 3.2 启动服务
```bash
# 在配置文件所在目录执行
docker-compose up -d
```

#### 3.3 验证服务
```bash
# 检查服务状态
curl http://localhost:8001/v1/models

# 查看容器状态
docker-compose ps
```

### 4. 验证Clawbot服务
访问`http://127.0.0.1:18789/?token=你的token`，如果返回`{"status":"ok"}`，则服务正常运行。

## 常见问题

### 1. npm安装时的git权限错误

**错误信息**：
```
npm error code 128
npm error An unknown git error occurred
npm error command git --no-replace-objects ls-remote ssh://git@github.com/whiskeysockets/libsignal-node.git
npm error git@github.com: Permission denied (publickey).
```

**解决方案**：
```bash
# 配置git使用https协议
git config --global url."https://github.com/".insteadOf ssh://git@github.com/

# 清理npm缓存
npm cache clean --force

# 强制安装
npm install -g clawdbot@latest --force --legacy-peer-deps
```

### 2. ClawDBot UI一直转圈不回复

**问题现象**：
- UI可以正常打开，WebSocket连接成功
- 发送消息后UI一直显示加载状态
- 无明显错误提示

**根本原因**：
ClawDBot的Embedded Agent对模型上下文长度有最低要求（至少16000 tokens），如果使用的模型上下文窗口不足，会被系统阻止。

**解决方案**：
1. **推荐**：使用支持16k以上上下文的模型，如`qwen2.5_7b_instruct`（32k）或`llama-3.1-8b-instruct`（128k）
2. **临时方案**：在配置中适当提高`contextWindow`值（不推荐长期使用）

**验证方法**：
```bash
# 开启debug模式查看日志
RUST_LOG=debug clawdbot gateway
```

## 总结

本指南提供了在WSL2+Ubuntu+RTX3060环境下部署Clawbot的完整方案：

### 部署架构
- **Win11本机**：提供基础系统支持
- **WSL2 Ubuntu**：运行Clawbot服务
- **Docker容器**：部署vLLM推理引擎
- **本地知识库**：存储数据，自动备份

### 安全措施
- 使用Linux沙箱机制隔离AI代理
- 采用最小权限原则配置工具访问
- 限制工作区访问权限
- 使用token认证保护服务

### 优势
- 官方推荐的Linux环境，兼容性更好
- 安全隔离效果优秀，避免系统风险
- 资源管理高效，性能接近原生
- 统一管理所有服务，维护简便

通过以上步骤，你可以在安全可靠的环境中部署和使用Clawbot，享受其强大的AI代理功能。
