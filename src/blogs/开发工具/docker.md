---
title: Docker常用命令
date: 2025-06-15
categories: ["开发工具"]
tags: ["Docker"]
icon: /assets/icon/docker.png
order: 6
---

# Docker 核心命令速查表

## 镜像操作
```bash
docker images                    # 查看本地镜像
docker pull nginx                # 拉取镜像
docker rmi nginx                 # 删除镜像
docker rmi -f $(docker images -q) # 删除所有镜像

# 查看镜像版本
docker search nginx              # 搜索Docker Hub上的镜像
docker pull nginx:1.21           # 指定版本拉取镜像
docker pull nginx:latest         # 拉取最新版本
docker pull nginx:alpine         # 拉取轻量级镜像

```

## 容器操作
```bash
docker ps -a                    # 查看所有容器
docker ps                       # 查看运行中的容器
docker run -d -p 8080:80 nginx  # 后台运行 nginx 容器并映射端口
docker run -it --rm ubuntu bash # 交互式运行容器
docker stop <容器ID或名称>      # 停止容器
docker start <容器ID或名称>     # 启动容器
docker restart <容器ID或名称>   # 重启容器
docker rm <容器ID或名称>        # 删除容器
docker rm -f $(docker ps -aq)   # 删除所有容器
```

## 容器管理
```bash
docker exec -it <容器ID或名称> /bin/bash  # 进入容器内部
docker exec -it <容器ID或名称> sh         # 进入容器（sh）
docker logs <容器ID或名称>               # 查看容器日志
docker logs -f <容器ID或名称>            # 实时查看日志
docker top <容器ID或名称>                # 查看容器进程
docker inspect <容器ID或名称>            # 查看容器详细信息
```

## 镜像构建
```bash
# 构建自定义镜像
docker build -t myapp .

# 构建时指定 Dockerfile
docker build -f Dockerfile.custom -t myapp .

# 查看构建历史
docker history <镜像ID或名称>
```

## 数据管理
```bash
# 查看卷
docker volume ls
docker volume create myvolume

# 复制文件到容器
docker cp 本地路径 容器ID:容器路径

# 复制文件从容器
docker cp 容器ID:容器路径 本地路径
```

## 清理命令
```bash
# 清理无用资源
docker system prune -a

# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 清理网络
docker network prune
```

## Docker Compose
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs

# 重启服务
docker-compose restart

# 进入服务容器
docker-compose exec <服务名> bash
```

## 常用技巧

### 端口映射
```bash
# 基本格式：-p 宿主机端口:容器端口
docker run -d -p 8080:80 nginx

# 映射多个端口
docker run -d -p 8080:80 -p 8443:443 nginx

# 只指定容器端口（随机分配宿主机端口）
docker run -d -p 80 nginx
```

### 环境变量
```bash
# 设置环境变量
docker run -d -e KEY=value -e ANOTHER_KEY=value2 nginx

# 从文件读取环境变量
docker run -d --env-file ./env.list nginx
```

### 数据卷挂载
```bash
# 挂载本地目录
docker run -d -v /本地路径:/容器路径 nginx

# 挂载命名卷
docker run -d -v myvolume:/容器路径 nginx

# 只读挂载
docker run -d -v /本地路径:/容器路径:ro nginx
```

### 网络设置
```bash
# 创建自定义网络
docker network create mynetwork

# 容器加入网络
docker network connect mynetwork 容器名

# 查看网络详情
docker network inspect mynetwork
```


