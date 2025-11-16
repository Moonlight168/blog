---
title: Docker的使用
date: 2025-06-09
categories: ["开发工具"]
tags: ["Docker"]
icon: /assets/icon/docker.png
---

# Docker的使用

Docker 是一种轻量级容器技术，能够将应用及其依赖打包在一起，在任何支持 Docker 的环境中快速运行，极大地简化了部署流程。

## 一、Docker 基础概念

- **镜像（Image）**：Docker 镜像是容器的模板，可以理解为一个完整的操作系统快照。
- **容器（Container）**：镜像运行起来就是容器，是镜像的一个运行实例。
- **仓库（Repository）**：用来存储镜像的地方，分为公共仓库（如 Docker Hub）和私有仓库。
- **Dockerfile**：定义如何构建镜像的脚本。

## 二、安装 Docker（以 CentOS 为例）

```bash
# 卸载旧版本（如已存在）
sudo yum remove docker docker-client docker-common docker-latest

# 安装依赖
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 设置 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce

# 启动并设置开机启动
sudo systemctl start docker
sudo systemctl enable docker

# 验证
docker version

```

## 三、常用命令

### 1. 镜像操作

```bash
docker images                    # 查看本地镜像
docker pull nginx                # 拉取镜像
docker rmi nginx                 # 删除镜像
```

### 2. 容器操作

```bash
docker ps -a                    # 查看所有容器
docker run -d -p 8080:80 nginx  # 后台运行 nginx 容器并映射端口
docker stop <容器ID或名称>      # 停止容器
docker rm <容器ID或名称>        # 删除容器
docker rm -f $(docker ps -aq) # 删除所有容器
```

### 3. 构建自定义镜像

新建一个 `Dockerfile`：

```dockerfile
FROM openjdk:8
COPY app.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

构建并运行：

```bash
docker build -t myapp .
docker run -d -p 8080:8080 myapp
```

## 四、常用技巧

### 1. 进入容器内部

```bash
docker exec -it <容器ID或名称> /bin/bash
```

### 2. 查看日志

```bash
docker logs <容器ID或名称>
```

### 3. 清理无用资源

```bash
docker system prune -a
```

## 五、Docker Compose 简介

Docker Compose 用于**一次性启动多个容器服务**，常用于微服务部署。

## MySQL

```yaml
mysql:
  image: mysql:latest
  container_name: universitymanagementsystem-mysql
  environment:
    MYSQL_ROOT_PASSWORD: 123
    MYSQL_DATABASE: university_db
    MYSQL_USER: root
    MYSQL_PASSWORD: 123
  ports:
    - "3306:3306"
  volumes:
    - /UniversityManagementSystem/mysql/conf:/etc/mysql/conf.d:rw
    - /UniversityManagementSystem/mysql/data:/var/lib/mysql:rw
  networks:
    - gupt
```

* **作用**: 系统核心数据库。
* **端口**: `3306` MySQL 服务。
* **环境变量**: 初始化数据库和用户。
* **挂载**:

    * `conf`: 配置文件。
    * `data`: 数据持久化。

## 网络配置

```yaml
networks:
  gupt:
```

* 定义了一个用户自建网络 `gupt`，所有容器都加入到同一个网络，可以通过服务名互相访问（例如 `http://mysql:3306`）。

# 🚀 启动

```bash
docker-compose up -d
```

* `-d` 后台运行。
* 启动时会拉取镜像、创建网络、挂载目录并依次运行各容器。


