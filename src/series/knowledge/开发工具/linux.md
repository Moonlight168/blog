---
title: Linux
date: 2025-05-22
categories: ["开发工具"]
icon: /assets/icon/linux.png
---

## 如何查看服务器负载和CPU使用率？

```bash
top                 # 实时查看系统负载和CPU使用率
htop                # 增强版top，可视化界面更友好
uptime              # 查看系统负载平均值（1min/5min/15min）
```

关注 `load average` 三个值，若长期超过 CPU 核心数，表明系统过载。

## 如何查看系统内存使用情况？

```bash
free -h             # 以人类可读格式显示内存
free -m             # 以MB为单位显示内存
vmstat 1 5          # 每秒更新一次，共显示5次
```

## 如何查看Java进程的内存使用情况？

```bash
ps -ef | grep java  # 查找Java进程ID
top -Hp <PID>       # 查看Java进程及线程详情
jstat -gc <PID>     # 查看JVM堆内存使用情况
jmap -heap <PID>    # 查看堆内存详细信息
```

## 如何查看和终止进程？

**查看进程：**

```bash
ps -ef | grep <进程名>    # 查找特定进程
ps aux | grep <PID>       # 查看某PID进程状态
top                       # 实时查看进程资源占用
```

**终止进程：**

```bash
kill <PID>                # 优雅终止进程
kill -9 <PID>             # 强制终止进程
pkill -f <进程名>         # 按名称终止进程
```

## 如何查看Java应用监听的端口？

```bash
netstat -tulpn | grep java       # 查看Java进程监听的端口
lsof -i -P -n | grep LISTEN      # 列出所有监听端口
```

## 如何优雅关闭Java进程？

1. **推荐方式**：`kill <PID>` — 触发 JVM Shutdown Hook
2. **强制终止（慎用）**：`kill -9 <PID>` — 可能导致资源泄漏

## 如何查看和搜索日志文件？

**基础搜索：**

```bash
grep "关键词" /path/to/logfile       # 查找包含关键词的行
grep -i "关键词" /path/to/logfile    # 忽略大小写搜索
tail -f /path/to/logfile            # 实时查看日志
```

**高级搜索：**

```bash
grep -A 10 -B 5 "错误" logfile   # 显示匹配行前后内容
grep -n "关键词" logfile          # 显示行号
grep -c "关键词" logfile          # 统计匹配行数
```

## grep常用参数有哪些？

```bash
grep -i "关键词" 文件        # 忽略大小写
grep -r "关键词" 目录        # 递归搜索目录
grep -v "关键词" 文件        # 显示不匹配的行
grep -E "模式1|模式2" 文件   # 匹配多个模式
```

## 如何压缩和解压文件？

**tar命令：**

```bash
tar -czf archive.tar.gz /path/to/directory  # 压缩
tar -xzf archive.tar.gz                     # 解压
```

**zip命令：**

```bash
zip -r archive.zip /path/to/directory       # 压缩
unzip archive.zip                            # 解压
```

## 如何修改主机名？

```bash
sudo hostname <新主机名>              # 临时修改，重启后失效
sudo hostnamectl set-hostname <新主机名>  # 永久生效
```

## 如何设置开机自启动？

```bash
crontab -e                   # 编辑cron任务
@reboot /path/to/script.sh   # 添加开机自启动脚本
```

## 如何排查Java应用的内存泄漏？

1. 生成堆转储文件：
```bash
jmap -dump:format=b,file=heap.hprof <PID>
```
2. 使用 MAT 或 VisualVM 分析堆转储文件，关注大对象和 GC Roots 中的长生命周期引用

## 如何优化Linux上的Java应用性能？

**JVM参数优化：**

```bash
java -Xms512m -Xmx512m -XX:MetaspaceSize=128m \
     -XX:+UseG1GC -XX:MaxGCPauseMillis=200 \
     -jar your-app.jar
```

**系统层面优化：**

```bash
ulimit -n 65535             # 调整文件描述符限制
```