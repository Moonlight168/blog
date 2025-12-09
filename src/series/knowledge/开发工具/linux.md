---
title: Linux
date: 2025-05-22
icon: /assets/icon/linux.png
---

# Linux常用命令与技巧

## 1. 系统监控命令

### 如何查看服务器负载和CPU使用率？
- **基础命令**：
  ```bash
  top                 # 实时查看系统负载和CPU使用率
  htop                # 增强版top，可视化界面更友好
  uptime              # 查看系统负载平均值（1min/5min/15min）
  ```
- **关键点**：  
  关注`load average`三个值，若长期超过CPU核心数，表明系统过载。

### 如何查看系统内存使用情况？
- **基础命令**：
  ```bash
  free -h                    # 以人类可读格式显示内存使用情况
  free -m                    # 以MB为单位显示内存
  ```
- **内存监控**：
  ```bash
  top                        # 查看进程内存占用
  vmstat 1 5                 # 每秒更新一次，共显示5次
  ```

### 如何查看Java进程的内存使用情况？
- **基础命令**：
  ```bash
  ps -ef | grep java  # 查找Java进程ID
  top -Hp <PID>       # 查看Java进程及线程详情
  free -h             # 查看系统内存总体使用情况
  ```
- **进阶工具**：
  ```bash
  jstat -gc <PID>     # 查看JVM堆内存使用情况
  jmap -heap <PID>    # 查看堆内存详细信息
  ```

## 2. 进程管理

### 如何查看进程信息？
- **查看进程状态**：
  ```bash
  ps -ef | grep <进程名>    # 查找特定进程
  ps aux | grep <PID>       # 查看某PID进程状态
  top                       # 实时查看进程资源占用
  ```
- **终止进程**：
  ```bash
  kill <PID>                # 优雅终止进程
  kill -9 <PID>             # 强制终止进程
  pkill -f <进程名>         # 按名称终止进程
  ```

### 如何查看Java应用监听的端口？
```bash
netstat -tulpn | grep java       # 查看所有Java进程监听的端口
lsof -i -P -n | grep LISTEN      # 列出所有监听端口及关联进程
```

### 如何优雅地关闭一个Java进程？
1. **发送SIGTERM信号（推荐）**：
   ```bash
   kill <PID>  # 触发JVM的Shutdown Hook
   ```
2. **强制终止（慎用）**：
   ```bash
   kill -9 <PID>  # 直接终止进程，可能导致资源泄漏
   ```

## 3. 日志与文件操作

### 如何查看和搜索日志文件？
- **查看日志**：
  ```bash
  cat /path/to/logfile | grep "关键词"    # 查找包含关键词的行
  grep -i "关键词" /path/to/logfile       # 忽略大小写搜索
  tail -f /path/to/logfile                # 实时查看日志
  ```
- **高级搜索**：
  ```bash
  grep -A 10 -B 5 "错误" /path/to/logfile  # 显示匹配行前后10行和5行
  grep -n "关键词" /path/to/logfile         # 显示行号
  grep -c "关键词" /path/to/logfile         # 统计匹配行数
  ```

### grep命令常用参数
```bash
grep -i "关键词" 文件        # 忽略大小写
grep -r "关键词" 目录        # 递归搜索目录
grep -n "关键词" 文件        # 显示行号
grep -v "关键词" 文件        # 显示不匹配的行
grep -E "模式1|模式2" 文件   # 匹配多个模式
```

### 如何压缩和解压文件？
- **tar命令**：
  ```bash
  tar -czf archive.tar.gz /path/to/directory  # 压缩
  tar -xzf archive.tar.gz                     # 解压
  tar -tzf archive.tar.gz                      # 查看压缩内容
  ```
- **zip命令**：
  ```bash
  zip -r archive.zip /path/to/directory       # 压缩
  unzip archive.zip                            # 解压
  ```

## 4. 系统配置

### 如何修改主机名？
- **临时修改**：
  ```bash
  sudo hostname <新主机名>    # 重启后失效
  ```
- **永久修改**：
  ```bash
  sudo hostnamectl set-hostname <新主机名>  # 永久生效
  ```

### 如何设置开机自启动命令？
- **使用cron任务**：
  ```bash
  crontab -e                 # 编辑当前用户的cron任务
  @reboot /path/to/script.sh # 添加开机自启动脚本
  ```
- **使用rc.local**：
  ```bash
  sudo chmod +x /etc/rc.d/rc.local  # 添加执行权限
  echo "/path/to/command" >> /etc/rc.d/rc.local  # 添加命令
  ```

## 5. JVM监控与调优

### 如何排查Java应用的内存泄漏？
1. **生成堆转储文件**：
   ```bash
   jmap -dump:format=b,file=heapdump.hprof <PID>  # 手动生成
   # 或设置JVM参数自动生成（OOM时）
   -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/to/dump
   ```
2. **分析工具**：
    - 使用`MAT`（Memory Analyzer Tool）或`VisualVM`分析堆转储文件。
    - 重点关注：
        - 大对象（占用大量内存的对象）。
        - 垃圾回收根路径（GC Roots）中存在的长生命周期引用。

### 如何优化Linux上的Java应用性能？
- **JVM参数优化**：
  ```bash
  # 示例：适用于Web应用的JVM参数
  java -Xms512m -Xmx512m -XX:MetaspaceSize=128m \
       -XX:+UseG1GC -XX:MaxGCPauseMillis=200 \
       -jar your-app.jar
  ```
- **系统层面优化**：
  ```bash
  # 调整文件描述符限制
  ulimit -n 65535

  # 调整TCP连接参数（/etc/sysctl.conf）
  net.ipv4.tcp_tw_reuse = 1
  net.ipv4.tcp_fin_timeout = 30
  ```

## 6. Docker部署

### 如何在Docker中部署Java应用？
1. **编写Dockerfile**：
   ```dockerfile
   FROM openjdk:17-jdk-slim
   COPY target/your-app.jar /app.jar
   EXPOSE 8080
   CMD ["java", "-jar", "/app.jar"]
   ```
2. **构建镜像与运行**：
   ```bash
   docker build -t your-app .
   docker run -p 8080:8080 your-app
   ```