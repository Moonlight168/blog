---
title: Docker 镜像源配置指南
date: 2025-11-17
categories: ["开发工具"]
---

## Docker 镜像源配置

### 1. 为什么要配置 Docker 镜像源

Docker 默认从 Docker Hub 拉取镜像，在中国大陆地区访问 Docker Hub 速度较慢甚至无法访问。通过配置国内镜像源可以显著提升镜像下载速度。

### 2. 常用 Docker 镜像源

#### 2.1 镜像源现状说明

| 镜像源 | 状态 | 说明 |
|--------|------|------|
| `https://registry.docker-cn.com` | 已停用 | Docker 官方中国区镜像源，2020年正式下线，访问失效 |
| `https://hub-mirror.c.163.com` | 可用，但稳定性一般 | 网易云镜像源，偶尔会出现速度慢、部分镜像拉取失败的情况 |
| `https://docker.mirrors.ustc.edu.cn` | 可用，稳定性较好 | 中科大镜像源，维护良好，访问速度和稳定性都不错 |

#### 2.2 推荐镜像源

以下是目前国内更稳定的 Docker 镜像源推荐（按优先级排序）：

- **DaoCloud**：`https://docker.m.daocloud.io`（目前最稳最快之一）
- **中国科学技术大学**：`https://docker.mirrors.ustc.edu.cn`（非常可靠）
- **阿里云公共镜像**：`https://registry.cn-hangzhou.aliyuncs.com`（无需登录，公共使用）
- **百度云**：`https://mirror.baidubce.com`（备用选择）

### 3. 配置方法

#### 3.1 方法一：修改 Docker 配置文件（推荐）

##### 1. Linux 系统配置

1. 创建或编辑 Docker 配置文件：
```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.cn-hangzhou.aliyuncs.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
```

2. 重启 Docker 服务：
```bash
sudo systemctl restart docker
```

### 5. 验证配置

#### 5.1 检查配置文件
```bash
cat /etc/docker/daemon.json
```

#### 5.2 查看 Docker 信息
```bash
docker info
```

在输出中找到 "Registry Mirrors:" 部分，确认配置的镜像源是否生效。

### 6. 常见问题

#### 6.1 配置后镜像拉取仍然慢

1. 检查配置是否正确：
```bash
docker info | grep -A 10 "Registry Mirrors"
```

2. 重启 Docker 服务：
```bash
sudo systemctl restart docker
```

#### 6.2 某些镜像仍然无法拉取

某些镜像可能在镜像源中不存在，可以使用以下方法：

1. 使用官方源拉取：
```bash
docker pull --platform linux/amd64 镜像名:标签
```

2. 使用代理或 VPN 访问官方源

### 7. 最佳实践

1. **多镜像源配置**：建议配置多个镜像源，提高可用性
2. **定期更新镜像源**：某些镜像源可能会失效，需要及时更新
3. **特殊镜像处理**：对于企业内部镜像或私有仓库，需要额外配置
4. **网络环境考虑**：根据实际网络环境选择最合适的镜像源

### 8. 配置文件示例

完整的 Docker 配置文件示例：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",           // DaoCloud - 目前最稳最快之一
    "https://docker.mirrors.ustc.edu.cn",     // 中科大 - 非常可靠
    "https://registry.cn-hangzhou.aliyuncs.com", // 阿里云公共（无需登录，但稍慢）
    "https://mirror.baidubce.com"             // 百度 - 备胎
  ],
  "insecure-registries": ["私有仓库地址"],
  "debug": false,
  "experimental": false
}
```

**阿里云专属镜像源配置示例**：
```json
{
  "registry-mirrors": [
    "https://xxxxxxx.mirror.aliyuncs.com"   // 替换为你的阿里云专属镜像源
  ]
}
```

> 提示：阿里云专属镜像源需要注册阿里云账号获取，访问地址：https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors
> 阿里云公共镜像源无需登录，可直接使用：`https://registry.cn-hangzhou.aliyuncs.com`

通过以上配置，可以显著提升 Docker 镜像拉取速度，改善开发体验。