---
title: Linux
date: 2025-05-22
categories: ["开发工具"]
icon: /assets/icon/linux.png
---

## Linux 有哪些常用命令？

**锚点**：`文件/进程/网络/磁盘/权限/日志——按类记，覆盖 90% 日常场景`

| 分类 | 常用命令 | 作用 |
|------|---------|------|
| 文件 | ls / cd / cp / mv / rm / mkdir | 查看、切换、复制、移动、删除、建目录 |
| 查找 | find / grep / which | 按条件找文件 / 搜文件内容 / 找命令路径 |
| 进程 | ps / top / kill | 查进程 / 实时监控 / 杀进程 |
| 网络 | netstat / ss / curl / ping | 端口与连接 / 发请求 / 测连通性 |
| 磁盘 | df / du | 磁盘剩余空间 / 目录占用大小 |
| 权限 | chmod / chown | 改文件权限 / 改属主 |
| 压缩 | tar / zip | 打包压缩 / 解压 |
| 日志 | tail -f / grep / less | 实时跟随 / 搜关键词 / 分页查看 |
| 服务 | systemctl / crontab | 启停服务与开机自启 / 定时任务 |

**面试要点**：不用背全部参数，记住"每个分类有什么命令、能干什么"，具体参数面试时再说（如 `top` 看负载、`netstat -tulpn` 看端口、`kill -9` 强杀）。后面的题逐个展开各分类的高频用法。

---

## 如何查看服务器负载和 CPU 使用率？

**锚点**：`top 实时 / htop 可视化 / uptime 看负载均值`

```bash
top                 # 实时查看系统负载和CPU使用率
htop                # 增强版top，可视化界面更友好
uptime              # 查看系统负载平均值（1min/5min/15min）
```

关注 `load average` 三个值，若长期超过 CPU 核心数，表明系统过载。

## 如何查看系统内存使用情况？

**锚点**：`free -h 人类可读 / vmstat 看动态`

```bash
free -h             # 以人类可读格式显示内存
free -m             # 以MB为单位显示内存
vmstat 1 5          # 每秒更新一次，共显示5次
```

## 如何查看 Java 进程的内存使用情况？

**锚点**：`ps 找 PID → jstat 看堆 → jmap 看详情`

```bash
ps -ef | grep java  # 查找Java进程ID
top -Hp <PID>       # 查看Java进程及线程详情
jstat -gc <PID>     # 查看JVM堆内存使用情况
jmap -heap <PID>    # 查看堆内存详细信息
```

## 如何查看和终止进程？

**锚点**：`ps/top 查看，kill 优雅、kill -9 强制`

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

## 如何查看 Java 应用监听的端口？

**锚点**：`netstat 按进程查 / lsof 查监听`

```bash
netstat -tulpn | grep java       # 查看Java进程监听的端口
lsof -i -P -n | grep LISTEN      # 列出所有监听端口
```

## 如何优雅关闭 Java 进程？

**锚点**：`kill 触发 Shutdown Hook；kill -9 慎用`

1. **推荐方式**：`kill <PID>`——触发 JVM Shutdown Hook，优雅释放资源
2. **强制终止（慎用）**：`kill -9 <PID>`——可能导致资源泄漏

## 如何查看和搜索日志文件？

**锚点**：`grep 搜内容，tail -f 实时跟`

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

## grep 常用参数有哪些？

**锚点**：`i 忽略大小写 / r 递归 / v 反选 / E 多模式`

```bash
grep -i "关键词" 文件        # 忽略大小写
grep -r "关键词" 目录        # 递归搜索目录
grep -v "关键词" 文件        # 显示不匹配的行
grep -E "模式1|模式2" 文件   # 匹配多个模式
```

## 如何压缩和解压文件？

**锚点**：`tar 打包压缩，zip 通用格式`

**tar 命令：**

```bash
tar -czf archive.tar.gz /path/to/directory  # 压缩
tar -xzf archive.tar.gz                     # 解压
```

**zip 命令：**

```bash
zip -r archive.zip /path/to/directory       # 压缩
unzip archive.zip                            # 解压
```

## 如何修改主机名？

**锚点**：`hostname 临时，hostnamectl 永久`

```bash
sudo hostname <新主机名>              # 临时修改，重启后失效
sudo hostnamectl set-hostname <新主机名>  # 永久生效
```

## 如何排查 Java 应用的内存泄漏？

**锚点**：`jmap 转储 → MAT/VisualVM 分析大对象和 GC Roots`

1. 生成堆转储文件：
```bash
jmap -dump:format=b,file=heap.hprof <PID>
```
2. 使用 MAT 或 VisualVM 分析堆转储文件，关注大对象和 GC Roots 中的长生命周期引用
