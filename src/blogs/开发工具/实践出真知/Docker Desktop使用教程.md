---
title: Docker Desktop使用教程
date: 2026-01-19
categories: ["开发工具"]
tags: ["Docker", "Docker Desktop", "Docker Compose"]
---

Docker Desktop 是 Docker 官方提供的桌面应用程序，支持 Windows 和 macOS 系统，为开发者提供了便捷的 Docker 环境管理界面。本教程将详细介绍 Docker Desktop 的安装、配置以及如何在 Windows 环境中使用 Docker Compose 启动容器服务。

## 一、Docker Desktop 简介

Docker Desktop 集成了以下核心组件：
- Docker Engine：Docker 核心运行时
- Docker Compose：用于定义和运行多容器应用
- Docker Buildx：高级构建功能
- Docker Hub 集成：便捷的镜像管理
- Kubernetes：内置 Kubernetes 集群支持
- GUI 管理界面：可视化的容器、镜像、网络和卷管理

## 二、安装 Docker Desktop（Windows 版）

### 2.1 系统要求
- Windows 10 64-bit：版本 2004 或更高版本（Build 19041+）
- Windows 11 64-bit
- WSL 2 功能启用（推荐）或 Hyper-V 功能启用

### 2.2 安装步骤

#### 1. 启用 WSL 2（推荐）
wsl安装参考：[Windows子系统WSL完全指南](my-docs\src\blogs\linux\Windows子系统WSL完全指南.md)  

#### 2. 下载并安装 Docker Desktop

1. 访问 Docker 官方下载页面：https://www.docker.com/products/docker-desktop
2. 点击 "Download for Windows"
3. 运行下载的安装程序
4. 在安装向导中，确保勾选以下选项：
   - "Install required Windows components for WSL 2"
   - "Use WSL 2 instead of Hyper-V"
5. 点击 "Install" 完成安装

#### 3. 启动 Docker Desktop

安装完成后，Docker Desktop 会自动启动。你可以在系统托盘看到 Docker 图标。

### 2.3 验证安装

打开 PowerShell 或命令提示符，执行以下命令验证安装：

```powershell
# 检查 Docker 版本
docker version

# 检查 Docker Compose 版本
docker compose version

```

## 三、Docker Desktop 基本使用

### 3.1 GUI 界面介绍

Docker Desktop 提供了直观的图形界面，主要包括以下功能区域：

1. **Dashboard**：显示运行中的容器和应用
2. **Images**：管理本地镜像
3. **Containers**：查看和管理容器
4. **Volumes**：管理数据卷
5. **Networks**：管理网络
6. **Settings**：配置 Docker Desktop

### 3.2 常用设置

1. **资源配置**
   - 进入 Settings > Resources
   - 调整 CPU、内存、磁盘等资源分配
   - 建议至少分配 2GB 内存和 2 个 CPU 核心

2. **镜像源配置**
   - 进入 Settings > Docker Engine
   - 在配置文件中添加国内镜像源：
     ```json
     {
       "registry-mirrors": [
         "https://hub-mirror.c.163.com",
         "https://docker.mirrors.ustc.edu.cn",
         "https://registry.docker-cn.com"
       ]
     }
     ```
   - 点击 "Apply & Restart" 保存配置

3. **WSL 集成**
   - 进入 Settings > Resources > WSL Integration
   - 选择要启用 Docker 集成的 WSL 分发版
   - 点击 "Apply & Restart" 保存配置

## 四、Docker Compose 基础

### 4.1 Docker Compose 简介

Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。通过 Compose 文件（通常命名为 `docker-compose.yml`），你可以使用 YAML 格式定义服务、网络和卷，然后通过一个命令启动所有服务。

### 4.2 Compose 文件基本结构

```yaml
# Compose 文件版本
version: '3.8'

# 定义服务
services:
  # 服务名称
  web:
    # 镜像名称
    image: nginx:latest
    # 端口映射
    ports:
      - "80:80"
    # 挂载卷
    volumes:
      - ./html:/usr/share/nginx/html
    # 环境变量
    environment:
      - TZ=Asia/Shanghai
    # 依赖关系
    depends_on:
      - db
  
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=123456
      - MYSQL_DATABASE=mydb
    volumes:
      - mysql_data:/var/lib/mysql

# 定义卷
volumes:
  mysql_data:
    # 卷配置
    driver: local
```

## 五、在 Windows 中使用 Docker Compose 启动服务

### 5.1 准备 Compose 文件

创建一个目录用于存放 Compose 文件和相关配置：

```powershell
mkdir -p D:\docker\nginx-mysql
cd D:\docker\nginx-mysql
```

创建 `docker-compose.yml` 文件（以下为简化示例，完整配置可根据实际需求调整）：

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports: ["80:80"]
    volumes: ["./nginx/conf.d:/etc/nginx/conf.d", "./nginx/html:/usr/share/nginx/html"]
    depends_on: [php]
    restart: always
  
  php:
    image: php:8.1-fpm
    volumes: ["./nginx/html:/usr/share/nginx/html"]
    depends_on: [mysql]
    restart: always
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=docker123
      - MYSQL_DATABASE=appdb
    volumes: ["mysql_data:/var/lib/mysql"]
    restart: always

volumes:
  mysql_data: {driver: local}
```

### 5.1.1 卷映射说明

在 Windows 上使用 Docker Desktop 时，卷映射涉及 Windows 与 WSL 2 虚拟机间的路径转换，主要有两种类型：

#### 1. 绑定挂载
- **用途**：开发环境共享代码/配置
- **原理**：相对路径（如 `./nginx/html:/usr/share/nginx/html`）自动转换为 WSL 路径，容器访问 WSL 文件系统
- **示例**：
  - 相对路径：`./nginx/html:/usr/share/nginx/html`
  - 完整转换：`D:\docker\nginx-mysql\nginx\html` → `/run/desktop/mnt/host/d/docker/nginx-mysql/nginx/html`

#### 2. 命名卷
- **用途**：生产环境持久化数据（如数据库）
- **原理**：完全存储在 WSL 2 内部，性能更好
- **存储位置**：`\\wsl$\\docker-desktop-data\\version-pack-data\\community\\docker\\volumes\\`
- **访问方式**：Windows 资源管理器输入 `\\wsl$` 可直接访问

#### 3. 路径选择建议
- 开发环境：优先使用相对路径（自动转换，跨平台）
- 高性能需求：使用 WSL 绝对路径（无转换开销）
- 访问 Windows 特定目录：使用 Windows 绝对路径

### 5.2 创建相关目录和配置文件

创建必要的目录结构和配置文件（Nginx 配置、测试 PHP 文件等），具体操作可参考官方文档或根据实际需求调整。

### 5.3 启动服务

在 Compose 文件所在目录执行以下命令：

```powershell
# 启动服务（后台运行）
docker compose up -d

# 查看服务状态
docker compose ps
```

### 5.4 访问服务

打开浏览器，访问 `http://localhost`，验证服务是否正常运行。


## 六、总结

Docker Desktop 为 Windows 用户提供了便捷的 Docker 环境，结合 Docker Compose 可以轻松管理多容器应用。通过本教程，你应该已经掌握了：

1. Docker Desktop 的安装和配置
2. Docker Compose 的基本语法和使用
3. 在 Windows 环境中使用 Docker Compose 启动和管理服务
4. 常见问题的解决方案和最佳实践

Docker Desktop 和 Docker Compose 是现代应用开发和部署的重要工具，掌握它们将大大提高你的开发效率和部署可靠性。
