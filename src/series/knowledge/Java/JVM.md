---
title: JVM
icon: /assets/icon/jvm.png
order: 3
---

## 了解Java的双亲委派机制吗？

**锚点**：`先父后子：加载请求先给父加载器，父加载不了才自己加载`

1. **目的**：保证核心类一致性（`java.lang.String` 不重复加载）；防止类冲突（同名类不覆盖核心类）
2. **加载链**：启动类加载器（Bootstrap，JDK 核心类）→ 扩展类加载器（Extension，`lib/ext`）→ 应用类加载器（AppClassLoader，classpath）→ 自定义加载器
3. **流程**：自定义加载器先委托父加载器，父加载失败才自己加载

## Java对象底层存储结构是什么？

**锚点**：`对象头(16B) + 实例数据 + 对齐填充`

1. **对象头**：存元信息（锁状态、hashCode、类型指针等）
2. **实例数据**：类字段真正存储的地方
3. **对齐填充**：让对象大小变成 8 字节整数倍，避免 CPU 访问异常

详细：[Java 对象结构](/blogs/java/Java对象存储结构详解.md)

## JVM GC（垃圾回收）有了解吗？

**锚点**：`分代收集（新生代复制 + 老年代标记整理）+ STW；主流 G1/ZGC/Parallel`

1. **核心机制**：分代收集——堆分新生代（复制算法）+ 老年代（标记-整理/清除）；Eden 满触发 Minor GC，老年代满触发 Full GC；STW 暂停应用线程保证引用一致性
2. **主流收集器**：
   - G1（JDK9+ 默认）：区域化，可预测停顿
   - ZGC：亚毫秒级停顿，TB 级堆支持
   - Parallel：吞吐量优先，后台批处理
3. **调优口诀**：Xms=Xmx 防抖动，新生代占 1/3，用 G1/ZGC 减停顿

JVM GC 从入门到进阶：[JVM GC 垃圾回收](/blogs/java/JVMGC入门到进阶.md)

## JVM Minor GC 和 Full GC 区别？什么时候触发 Full GC？

**锚点**：`Minor 年轻代复制算法频繁短停；Full 全堆标记清除低频长停`

| | Minor GC | Full GC |
|---|---|---|
| 发生区域 | 年轻代（Eden 满） | 整个堆（年轻代+老年代+元空间） |
| 频率 | 频繁 | 应尽量避免 |
| STW 时间 | 短 | 长 |
| 算法 | 复制算法 | 标记-清除/标记-整理 |

**Full GC 触发时机**：

1. 老年代空间不足（对象晋升放不下）
2. 元空间不足（类加载/反射生成过多）
3. 显式 `System.gc()`（只是建议，不保证执行）
4. 大对象直接进老年代空间不够（大于 `-XX:PretenureSizeThreshold`）
5. 空间分配担保失败（Minor GC 前老年代连续空间不足）

**日志参数**：`-XX:+PrintGCDetails`；调优目标：多数对象 Minor GC 回收，尽量减少 Full GC。

→ [回答历史](/private/series/答题历史/Java/java-答题记录.md#jvm-minor-gc-和-full-gc-区别什么时候触发-full-gc)

## JVM常用命令有哪些？

**锚点**：`jstat 内存 / jcmd 堆转储和线程栈 / -Xlog GC 日志`

1. **内存监控**：`jstat -gcutil <pid> 1000` 看各代使用率
2. **堆分析**：`jcmd <pid> GC.heap_dump file=heap.hprof` 转储堆
3. **线程诊断**：`jcmd <pid> Thread.print` 打印线程栈
4. **GC 日志**：`-Xlog:gc*:file=gc.log`（JDK9+ 统一日志）

**参数速记**：`-X` 基础调优，`-XX` 高级特性，`-Xlog` 诊断日志。

## 如何优化JVM的FullGC问题？

**锚点**：`参数调优 + 减少对象创建 + 代码优化 + 监控分析`

1. **JVM 参数**：增大 Xms/Xmx；增大老年代占比（`-XX:NewRatio=2`）；用 G1/ZGC 低停顿收集器；调 `-XX:MaxTenuringThreshold` 晋升年龄
2. **减少对象创建**：避免大对象、对象池复用；减少反射（缓存反射结果）；对象懒加载
3. **代码优化**：减少内存泄漏及时关资源；缓存用软引用/弱引用；高效数据结构减内存
4. **监控分析**：看 GC 日志分析 Full GC 原因；MAT/JProfiler 分析内存泄漏；监控内存趋势设告警

## 应用占用内存持续增长，但是堆内存、元空间都没变化，可能是什么原因?

**锚点**：`堆外内存泄漏：直接内存/JNI/线程栈/资源未关/系统缓存`

1. **主要原因**：
   - 本地内存泄漏：直接内存（`ByteBuffer.allocateDirect()`）、JNI 调用、第三方 Native 库（Netty、RocketMQ 客户端）
   - 线程数过多：每个线程栈默认 1MB，不在堆里
   - 资源没关：文件流、网络连接、数据库连接
   - 系统资源：共享内存、系统缓存、内存映射文件
   - JVM 自身：JIT 编译缓存、GC 数据结构、类加载器
2. **诊断命令**：`jcmd <pid> VM.native_memory detail` 看 Native 内存；`jstack <pid> | grep "State" | wc -l` 看线程数
3. **解决**：`-XX:MaxDirectMemorySize=2G` 限直接内存；线程池代替频繁建线程；try-with-resources 自动关资源；Prometheus+Grafana 监控告警

## JVM内存结构有哪些？

**锚点**：`线程私有：程序计数器/虚拟机栈/本地方法栈；线程共享：堆/方法区/直接内存`

**线程私有**：

1. **程序计数器**：记录当前执行的字节码指令位置，线程恢复时继续执行
2. **虚拟机栈**：存储方法调用栈帧（局部变量表、操作数栈、方法出口），每调一个方法压一个栈帧
3. **本地方法栈**：为 Native 方法服务，和虚拟机栈类似

**线程共享**：

1. **堆**：存放对象实例，GC 主要管理区域，分新生代和老年代
2. **方法区**：类信息、常量池、静态变量（JDK8+ 叫元空间 Metaspace）
3. **直接内存**：堆外内存，NIO 使用，通过 Unsafe 分配

---

## 堆内存分几块？对象刚创建放哪？

**锚点**：`堆 = 年轻代（Eden + S0 + S1）+ 老年代；新对象进 Eden，大对象直接进老年代`

- 堆 = 年轻代（Eden + S0 + S1）+ 老年代
- 新对象放 **Eden**；大对象直接进老年代

→ [回答历史](/private/series/答题历史/Java/java-答题记录.md#堆内存分几块对象刚创建放哪)

## 类加载的完整过程是什么？

**锚点**：`加载 → 验证 → 准备 → 解析 → 初始化`

1. **加载**：按类名查找 class 文件（磁盘/网络/jar），读字节流到内存，生成 Class 对象
2. **验证**：检查字节码格式、安全性、语义，确保类文件安全
3. **准备**：为类变量分配内存并设默认值（0、null、false），final 常量直接赋值
4. **解析**：符号引用（类名、方法名）转直接引用（内存地址），被动触发
5. **初始化**：执行类构造器 `<clinit>()`，按代码顺序执行 static 赋值和 static 块，父类先初始化

## 常见的OOM有哪些？怎么排查？

**锚点**：`五类 OOM（堆/元空间/GC 效率/直接内存/栈溢出）；转储 → MAT 分析支配树`

**常见 OOM 类型**：

1. **Java heap space**：堆内存不足，对象太多或泄漏
2. **Metaspace**：元空间不足，类加载太多或类泄漏
3. **GC overhead limit exceeded**：GC 回收效率太低，回收后仍 98%+ 满
4. **Direct buffer memory**：直接内存泄漏
5. **StackOverflowError**：栈溢出，递归太深

**排查步骤**：`-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/dump.hprof` 自动转储 → MAT 分析 dump 文件，看 Dominator Tree 找最大对象 → 看 GC 日志确认触发原因。

## JVM调优的常用参数有哪些？

**锚点**：`内存：-Xms=-Xmx；GC：UseG1GC；比例：SurvivorRatio、TenuringThreshold`

**内存参数**：`-Xms4g -Xmx4g`（相同防扩容抖动）、`-Xmn1g`（新生代 1G）、`-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m`

**GC 参数**：`-XX:+UseG1GC`（JDK9+ 默认）、`-XX:MaxGCPauseMillis=200`（G1 最大停顿）

**调优参数**：`-XX:SurvivorRatio=8`（Eden:S0:S1=8:1:1）、`-XX:MaxTenuringThreshold=15`（晋升最大年龄）

**日志参数**：`-Xlog:gc*:file=gc.log`（JDK9+）

## G1收集器的工作原理是什么？

**锚点**：`Region 化 + 可预测停顿 + 无碎片；Young GC + Mixed GC`

1. **核心特点**：堆分成多个相等 Region（默认 2048 个），不再分固定新生代/老年代；可指定最大停顿时间，优先回收垃圾多的 Region；标记-整理无碎片
2. **工作模式**：Young GC 只回收年轻代 Region；Mixed GC 回收年轻代 + 部分老年代 Region（老年代垃圾比例超阈值触发）
3. **回收过程**：并发标记（找存活对象）→ 最终标记（处理 SATB 缓冲区）→ 筛选回收（按收益排序选 Region）

## JVM 运行时内存区域是怎么划分的？

**锚点**：`私有：程序计数器/虚拟机栈/本地方法栈；共享：堆/方法区`

- **线程私有**：程序计数器（字节码行号，唯一不 OOM）；虚拟机栈（每方法一个栈帧，超深 StackOverflowError）；本地方法栈（Native 调用）
- **线程共享**：堆（对象实例，Eden → S0 → S1 → 老年代）；方法区（类信息、常量、静态变量、JIT 编译代码缓存）

→ [回答历史](/private/series/答题历史/Java/java-答题记录.md#jvm-运行时内存区域是怎么划分的)

## JDK 8 以后 JVM 内存区域有什么变化？

**锚点**：`永久代移除 → 元空间（本地内存）；String 常量池移入堆`

- **永久代移除 → 元空间**：元空间用本地内存而非 JVM 堆，配 `-XX:MaxMetaspaceSize`
- **String 常量池移到堆中**
- 好处：不再受 `-XX:MaxPermSize` 限制，不容易 OOM

→ [回答历史](/private/series/答题历史/Java/java-答题记录.md#jdk-8-以后-jvm-内存区域有什么变化)
