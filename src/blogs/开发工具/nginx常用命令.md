---
title: Nginx 的常用命令
date: 2025-06-09
categories: ["开发工具"]
order: 6
icon: /assets/icon/nginx.png
---

## Nginx 常用命令

### 1. 查看 Nginx 版本

```bash
nginx -v
````

输出示例：

```
nginx version: nginx/1.24.0
```

### 2. 启动 Nginx

```bash
nginx
```

> 默认会读取 `/usr/local/nginx/conf/nginx.conf` 配置文件。

如需指定配置文件：

```bash
nginx -c /path/to/nginx.conf
```

### 3. 停止 Nginx

* **快速关闭（不保存连接）**：

  ```bash
  nginx -s stop
  ```

* **优雅关闭（处理完当前连接）**：

  ```bash
  nginx -s quit
  ```

### 4. 重新加载配置（不中断服务）

```bash
nginx -s reload
```

> 修改配置文件后，使用此命令应用新配置。


### 5. 检查配置文件是否有语法错误

```bash
nginx -t
```

输出示例：

```
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
```

### 6. 查看 Nginx 进程状态（Linux）

```bash
ps -ef | grep nginx
```

或使用：

```bash
pidof nginx
```

---

### 7. 强制杀死 Nginx 所有进程（慎用）

```bash
killall -9 nginx
```

##  Nginx 启动失败怎么办？
执行：

```bash
nginx -t
```

检查配置语法是否正确，并确认端口未被占用。

### 2. 80端口被占用怎么办？

```bash
lsof -i :80
kill -9 <PID>
