---
title: "Windows常用命令"
date: 2025-11-16
icon: /assets/icon/windows.png
order: 3
---

## 获取进程ID

### 按进程名获取进程ID
```bash
tasklist | findstr <进程名称>
```
### 按照端口获取进程ID
```bash
# -aon 显示所有连接和监听端口，并包含进程ID
  netstat -aon | findstr <端口号>
````

## 关闭进程常用命令

### 按ID关闭进程

```bash
taskkill /pid <进程ID>
taskkill /f /pid <进程ID> #强制关闭
```

### 按名关闭进程
```bash
taskkill /im <进程名称>
```
