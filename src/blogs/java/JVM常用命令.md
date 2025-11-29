---
title: JVM参数与命令全攻略
date: 2025-11-28
category: Java
---

# JVM 参数与命令全攻略

**一句话理解**：JVM 参数就像汽车的调节旋钮，`-X` 调基础，`-XX` 调高级，掌握规则轻松玩转 JVM 调优！

## **1. JVM 参数分类速查表**

| 参数类型 | 前缀 | 记忆口诀 | 典型用途 |
|---------|------|----------|----------|
| **标准参数** | `-` | 通用配置 | `-version`, `-cp` |
| **扩展参数** | `-X` | 基础调优 | `-Xms`, `-Xmx`, `-Xss` |
| **高级参数** | `-XX:` | 高级特性 | `-XX:+UseG1GC`, `-XX:+PrintGCDetails` |
| **诊断参数** | `-Xlog` | 日志调试 | `-Xlog:gc*` |

**记忆技巧**：`-X` = e**X**tended，`-XX` = e**X**tra e**X**tra（高级中的高级）

### 1.1 查看版本

```bash
java -version
```

* 输出 JVM 版本、JRE/JDK 构建信息。

```bash
java -showversion
```

* 显示更详细的版本信息，包括 JVM 配置。

### 1.2 查看 JVM 参数

```bash
java -XX:+PrintCommandLineFlags -version
```

* 显示 JVM 默认启动参数和实际生效的参数。

```bash
java -XshowSettings:all
```

* 显示 JVM 设置和环境信息。

```bash
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintFlagsFinal
```

* 打印 JVM 所有参数及最终值，用于深入调优。


## **2. 内存参数详解**

### **2.1 堆内存设置**

| 参数 | 含义 | 命名逻辑 | 生产建议 |
|-----|------|----------|----------|
| `-Xms` | initial heap size（初始堆大小） | **m** → memory, **s** → start/startup，表示启动时的内存大小 | 建议 = `-Xmx`，避免动态扩容 |
| `-Xmx` | maximum heap size（最大堆大小） | **m** → memory, **x** → maximum，表示内存的最大限制 | 不超过物理内存70% |
| `-Xmn` | young generation size（新生代大小） | **m** → memory, **n** → new generation，专指新生代内存 | 建议堆的1/3到1/4 |
| `-Xss` | thread stack size（线程栈大小） | **s** → stack size，每个线程栈的大小 | 默认1MB，高并发可减至512KB |

**💡 为什么建议 Xms = Xmx？**
- 避免运行时动态扩容造成的性能抖动
- 启动时就申请好最大内存，提高运行稳定性

**示例**：
```bash
java -Xms2g -Xmx2g -Xmn1g -Xss512k MyApp
# 堆固定2GB，新生代1GB，线程栈512KB
```

### **2.2 高级参数 -XX 详解**

**语法规则**：
- `-XX:+OptionName` → **开启**某功能
- `-XX:-OptionName` → **关闭**某功能  
- `-XX:OptionName=value` → **设置数值**

| 参数类别 | 典型参数 | 作用 |
|---------|----------|------|
| **GC策略** | `-XX:+UseG1GC` | 使用G1垃圾收集器 |
| **内存优化** | `-XX:+UseCompressedOops` | 压缩对象指针，节省内存 |
| **调试诊断** | `-XX:+PrintGCDetails` | 打印详细GC日志 |
| **性能调优** | `-XX:+TieredCompilation` | 启用分层编译 |

**记忆技巧**：`-XX` = e**X**tra e**X**tra，高级玩家专用参数

### 2.3 查看堆信息

```bash
jmap -heap <pid>          # 堆信息，包括分代
jmap -histo <pid>         # 对象统计信息（类名 + 数量 + 内存）
jmap -dump:format=b,file=heap.bin <pid>  # 堆转储，保存为二进制文件
```

**⚠️ 使用状态说明**：
- **Java 9+**：`jmap` 工具标记为**实验性**，非正式弃用但不推荐
- **官方立场**：未移除但不再积极维护，生产环境首选 `jcmd`
- **对应命令**（推荐）：
  ```bash
  # 替代 jmap -heap
  jcmd <pid> GC.heap_info
  
  # 替代 jmap -histo  
  jcmd <pid> GC.class_histogram
  
  # 替代 jmap -dump
  jcmd <pid> GC.heap_dump filename=heap.bin
  ```
- **生产建议**：**jcmd 为首选**，功能更全，兼容性更好

## 3. 垃圾回收（GC）相关命令

### 3.1 启用不同 GC

```bash
-XX:+UseSerialGC       # Serial GC（单线程）
-XX:+UseParallelGC     # Parallel GC（吞吐量优先）
-XX:+UseG1GC           # G1 GC（默认 Java 9+）
-XX:+UseZGC            # ZGC（Java 11+，低延迟）
-XX:+UseShenandoahGC   # Shenandoah GC（低停顿）- 仅在 OpenJDK 构建（如 Eclipse Temurin、Amazon Corretto）可用，Oracle JDK 不支持
```

### 3.2 GC 日志

```bash
-XX:+PrintGC            # 打印 GC 事件
-XX:+PrintGCDetails     # 打印详细 GC 日志（包括分代信息）
-XX:+PrintGCDateStamps  # 打印 GC 时间戳
-Xlog:gc*               # Java 9+ 统一日志格式
```

**⚠️ 兼容性说明**：
- **Java 8 及以下**：`-XX:+PrintGCDetails` 是标准用法
- **Java 9+ 推荐**：使用统一日志框架 `-Xlog:gc*`
  ```bash
  # Java 8
  -XX:+PrintGC -XX:+PrintGCDetails -XX:+PrintGCDateStamps
  
  # Java 9+ 
  # 仅输出所有含“gc”标签的日志；写入 gc.log，每行带时间、级别、标签；保留 5 个滚动文件，单个文件上限 100 MB
  -Xlog:gc*:file=gc.log:time,level,tags:filecount=5,filesize=100m  
  ```
- **说明**：`PrintGCDetails` 在新版本仍可用，但官方建议迁移到 `-Xlog`，尤其生产环境用滚动日志。

### 3.3 GC 监控工具

```bash
jstat -gc <pid> <interval> <count>        # 监控堆和 GC 状态
jstat -gcutil <pid> <interval> <count>    # 各代使用率百分比
jstat -gccapacity <pid>                   # 各代容量（字节）
jcmd <pid> GC.heap_info                    # 堆信息
jcmd <pid> GC.run                          # 手动触发 GC
jcmd <pid> GC.class_histogram              # 类对象统计
```

## 4. 线程相关命令

### 4.1 查看线程堆栈

```bash
jstack <pid>             # 打印所有线程堆栈
jstack -l <pid>          # 带锁信息
jcmd <pid> Thread.print  # 替代 jstack，现代推荐
```

### 4.2 图形化工具

```bash
jconsole        # GUI 监控线程、堆、GC、CPU
jvisualvm       # 图形化分析工具，可查看堆、线程、GC、CPU
```

**⚠️ 可用性说明**：
- **Java 8**：`jvisualvm` 内置，可直接使用
- **Java 9+**：已从 JDK 中移除，需单独下载安装
- **下载地址**：`https://visualvm.github.io/` （Oracle 维护的开源项目）
- **替代方案**：`jconsole` 在所有版本中保持可用
- **趋势建议**：命令行工具（`jcmd`）更稳定，兼容性更好

## 5. JVM 日志与诊断

```bash
-XX:+UnlockDiagnosticVMOptions -XX:+PrintFlagsFinal   # 打印参数最终值
-Xlog:all=info:file=<file>                          # JVM 统一日志输出（推荐）
jcmd <pid> VM.flags                                # 查看 JVM 参数
jcmd <pid> VM.version                              # JVM 版本
```

## 6. 常用调优示例

### 6.1 查看默认 GC 与堆信息

```bash
java -XX:+PrintCommandLineFlags -version
jstat -gcutil <pid> 1000 10
```

### 6.2 手动触发 GC

```bash
jcmd <pid> GC.run
```

### 6.3 打印对象统计信息

```bash
jcmd <pid> GC.class_histogram
```

## **7. 参数速查口诀**

**一句话记住参数规则**：
> **`-` 是基础，`-X` 是扩展，`-XX` 是高级，记住就能玩转 JVM！**

## Java 25 更新提示

**JDK 25 新弃用选项**：
- **`-XX:+UseCompressedClassPointers`**：已弃用（默认启用压缩类指针）
- **`-XX:-UseCompressedClassPointers`**：已弃用（禁用压缩类指针）
- **`-XX:PerfDataSamplingInterval`**：已弃用，影响 GC 性能计数器采样，用于设置 JVM 性能采样数据的采样间隔（毫秒）。该采样负责定期收集 GC 次数、停顿时间、各代使用量等性能计数器，供 `jstat`、`jconsole` 等工具实时展示；间隔越小，数据越实时，但 CPU 开销略增。

**影响说明**：
- 压缩类指针功能保持启用，但控制参数被弃用
- 建议使用默认配置，无需手动设置
- 后续版本可能完全移除这些参数

# 生产环境标准配置
``` bash
java -Xms4g -Xmx4g -Xmn2g -Xss1m \
     -XX:+UseG1GC \
     -XX:+UseCompressedOops \
     -Xlog:gc*:file=gc.log:time,level,tags:filecount=5,filesize=100m \
     -XX:+PrintFlagsFinal \
     MyApp
```