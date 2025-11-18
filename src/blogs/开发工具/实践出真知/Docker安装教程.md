---
title: Docker安装教程
date: 2025-06-15
categories: ["开发工具", "实践出真知"]
tags: ["Docker"]
---

Docker 是一种轻量级容器技术，能够将应用及其依赖打包在一起，在任何支持 Docker 的环境中快速运行，极大地简化了部署流程。

## Docker 基础概念

- **镜像（Image）**：Docker 镜像是容器的模板，可以理解为一个完整的操作系统快照。
- **容器（Container）**：镜像运行起来就是容器，是镜像的一个运行实例。
- **仓库（Repository）**：用来存储镜像的地方，分为公共仓库（如 Docker Hub）和私有仓库。
- **Dockerfile**：定义如何构建镜像的脚本。

## 安装 Docker（以 CentOS Stream 为例）

**注意**：CentOS 7 已于 2024 年 6 月 30 日结束支持（EOL）。推荐使用 CentOS Stream 9 或 10，这些版本受 Docker 官方支持至 2027 年左右。 原教程基于旧版 CentOS，使用 yum 命令，现更新为 dnf 以匹配 CentOS Stream。

```bash
# 卸载旧版本（如已存在）
sudo dnf remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

# 安装依赖（如果未安装 dnf-plugins-core）
sudo dnf -y install dnf-plugins-core

# 设置 Docker 仓库
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动并设置开机启动
sudo systemctl enable --now docker

# 验证
docker version
```

## 常见安装问题

### 权限问题
```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或执行（以应用组更改）
newgrp docker
```

### 启动失败
```bash
# 查看 Docker 服务状态
sudo systemctl status docker

# 查看启动日志
sudo journalctl -u docker -f
```

### 防火墙问题
如果遇到网络连接问题，检查防火墙设置。Docker 容器端口可能绕过 ufw 或 firewalld 规则。推荐使用 iptables 添加规则到 DOCKER-USER 链。 对于特定端口暴露：

```bash
# CentOS Stream/RHEL (firewall-cmd 示例，针对 Docker Swarm 等端口)
sudo firewall-cmd --permanent --add-port=2376/tcp
sudo firewall-cmd --reload

# Ubuntu (ufw 示例)
sudo ufw allow 2376/tcp
```

## 验证安装

```bash
# 检查 Docker 是否正确安装
docker --version

# 运行测试容器
docker run hello-world

# 查看 Docker 信息
docker info
```
