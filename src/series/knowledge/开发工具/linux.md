---
title: Linux
date: 2025-05-22
icon: /assets/icon/linux.png
---
## **如何查看Java进程的内存使用情况？**
**回答**：
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

## **如何查看服务器负载和CPU使用率？**
**回答**：
- **基础命令**：
  ```bash
  top                 # 实时查看系统负载和CPU使用率
  htop                # 增强版top，可视化界面更友好
  uptime              # 查看系统负载平均值（1min/5min/15min）
  ```
- **关键点**：  
  关注`load average`三个值，若长期超过CPU核心数，表明系统过载。

# **2. JVM监控与调优**

## **如何排查Java应用的内存泄漏？**
**回答**：
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

## **如何优化Linux上的Java应用性能？**
**回答**：
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

## **如何查看Java应用监听的端口？**
**回答**：
```bash
netstat -tulpn | grep java       # 查看所有Java进程监听的端口
lsof -i -P -n | grep LISTEN      # 列出所有监听端口及关联进程
```

### **如何优雅地关闭一个Java进程？**
**回答**：
1. **发送SIGTERM信号（推荐）**：
   ```bash
   kill <PID>  # 触发JVM的Shutdown Hook
   ```
2. **强制终止（慎用）**：
   ```bash
   kill -9 <PID>  # 直接终止进程，可能导致资源泄漏
   ```


## **4. 日志与文件操作**

### **如何实时监控Java应用的日志文件？**
**回答**：
```bash
tail -f /path/to/application.log       # 实时查看最新日志
grep "ERROR" /path/to/application.log  # 过滤错误日志
less +F /path/to/application.log       # 可交互查看并实时更新
```

## 如何在Docker中部署Java应用？**
**回答**：
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

