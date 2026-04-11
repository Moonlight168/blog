---
title: JVM
icon: /assets/icon/jvm.png
order: 3
---

## 了解Java的双亲委派机制吗？

Java类加载器在加载类时，先把请求交给父类加载器处理，如果父加载器无法加载，才由自己去加载。这就是"先父后子"的加载策略。

**目的**：
1. **保证核心类一致性**：避免核心类（如`java.lang.String`）被重复加载
2. **防止类冲突**：不同库中同名类不会覆盖核心类

**加载流程**：

1. **启动类加载器（Bootstrap ClassLoader）**：加载 JDK 核心类。
2. **扩展类加载器（Extension ClassLoader）**：加载 JDK 扩展库类（`lib/ext`）。
3. **应用类加载器（AppClassLoader）**：加载应用类路径下的类。
4. **自定义类加载器**：先委托父加载器加载，父加载器失败后才自己加载。

**示例**：

```java
public class ParentDelegationExample {
    public static void main(String[] args) throws Exception {
        ClassLoader cl = ClassLoader.getSystemClassLoader();
        System.out.println(cl);                    // AppClassLoader
        System.out.println(cl.getParent());        // ExtClassLoader
        System.out.println(cl.getParent().getParent()); // BootstrapClassLoader (null)
    }
}
```

## **Java对象底层存储结构是什么？**

[Java 对象结构](/blogs/java/Java对象存储结构详解.md) = 16字节**对象头** + **实例数据**(字段) + **对齐填充**(填充到8字节倍数)。

1. **对象头**：存元信息（如锁状态、hashCode、类型指针等）
2. **实例数据**：类里面的字段真正存储的地方
3. **对齐填充**：为了让对象的大小变成8字节的整数倍，避免CPU访问异常

## **JVM GC（垃圾回收）有了解吗？**

**核心机制**：
1. **分代收集**：堆分新生代（复制算法）+ 老年代（标记-整理/清除）
2. **触发条件**：Eden满→Minor GC（新生代GC，复制算法，停顿短），老年代满→Full GC
3. **STW**：Stop-The-World暂停应用线程保证引用一致性

**主流收集器**：
1. **G1**（JDK9+默认）：区域化，可预测停顿
2. **ZGC**：亚毫秒级停顿，TB级堆支持
3. **Parallel**：吞吐量优先，后台批处理

**调优口诀**：Xms=Xmx防抖动，新生代占1/3，用G1/ZGC减停顿

JVM GC从入门到进阶：[JVM GC 垃圾回收](/blogs/java/JVMGC入门到进阶.md)

## JVM常用命令有哪些？

1. **内存监控**：`jstat -gcutil <pid> 1000` 看各代使用率
2. **堆分析**：`jcmd <pid> GC.heap_dump file=heap.hprof` 转储堆
3. **线程诊断**：`jcmd <pid> Thread.print` 打印线程栈
4. **GC日志**：`-Xlog:gc*:file=gc.log`（JDK9+统一日志）

**参数速记**：`-X`基础调优，`-XX`高级特性，`-Xlog`诊断日志

JVM常用命令：[JVM参数与命令全攻略](/blogs/java/JVM常用命令.md)

## 如何优化JVM的FullGC问题？

JVM频繁FullGC会导致应用停顿，影响性能。解决策略：

**1. JVM参数调优**
- 增大Xms（初始堆大小）和Xmx（最大堆大小），减少FullGC频率
- 增大老年代占比（-XX:NewRatio=2）
- 使用G1或ZGC等低停顿收集器
- 调整-XX:MaxTenuringThreshold控制对象晋升年龄

**2. 减少对象创建**
- 避免大对象创建，使用对象池复用
- 减少反射操作，缓存反射结果
- 对象懒加载，避免初始化加载过多对象

**3. 代码优化**
- 减少内存泄漏，及时关闭资源
- 对缓存使用软引用/弱引用
- 选择高效数据结构，减少内存占用

**4. 监控分析**
- 查看GC日志，分析FullGC触发原因
- 使用MAT、JProfiler分析内存泄漏
- 监控内存使用趋势，设置告警

## 应用占用内存持续增长，但是堆内存、元空间都没变化，可能是什么原因?

这种情况通常是堆外内存泄漏。

**主要原因**：
1. **本地内存泄漏**：<HoverComment text="直接内存" comment="用`ByteBuffer.allocateDirect()`分配的堆外内存，不走JVM堆，直接在操作系统内存申请。访问快（零拷贝），但分配回收成本高。" />、<HoverComment text="JNI调用" comment="Java Native Interface，允许Java调用C/C++代码。Native代码分配的内存JVM的GC管不到。" />、<HoverComment text="第三方Native库" comment="用C/C++写的库（如Netty、RocketMQ客户端、图像处理库），通过JNI调用。它们在底层申请的内存JVM无法管理，一旦泄漏会导致进程内存持续增长。" />分配的内存
2. **线程数过多**：每个线程栈内存默认1MB，不在堆里
3. **资源没关**：文件流、网络连接、数据库连接没关闭
4. **系统资源占用**：共享内存、系统缓存、内存映射文件
5. **JVM自身占用**：JIT编译缓存、GC数据结构、类加载器

**诊断命令**：
```bash
jcmd <pid> VM.native_memory detail    # 看Native内存
jstack <pid> | grep "State" | wc -l  # 看线程数
```

**解决方案**：
1. 限制直接内存：`-XX:MaxDirectMemorySize=2G`
2. 用线程池，避免频繁创建线程
3. 用try-with-resources自动关闭资源
4. 集成Prometheus+Grafana监控告警

## JVM内存结构有哪些？

JVM运行时数据区分为线程私有和（线程共享）。

**线程私有**：
1. **程序计数器**：记录当前执行的字节码指令位置，线程恢复时继续执行
2. **虚拟机栈**：存储方法调用栈帧（局部变量表、操作数栈、方法出口），每调用一个方法压入一个栈帧
3. **本地方法栈**：为Native方法服务，和虚拟机栈类似

**线程共享**：
1. **堆**：存放对象实例，GC主要管理区域，分为新生代和老年代
2. **方法区**：存储类信息、常量池、静态变量（JDK8+叫元空间Metaspace）
3. **直接内存**：堆外内存，NIO使用，通过Unsafe分配

## 类加载的完整过程是什么？

类加载分为5个阶段：加载→连接（验证、准备、解析）→初始化。

1. **加载**：通过类名查找class文件（磁盘、网络、jar包），读取字节流到内存，生成Class对象
2. **验证**：检查字节码格式、安全性、字节码语义，确保类文件安全
3. **准备**：为类变量分配内存并设置默认值（0、null、false），final常量直接赋值
4. **解析**：将符号引用（类名、方法名）转为直接引用（内存地址），被动触发
5. **初始化**：执行类构造器`<clinit>()`，按代码顺序执行static赋值和static块，父类先初始化

## 常见的OOM有哪些？怎么排查？

**常见OOM类型**：
1. **Java heap space**：堆内存不足，对象太多或内存泄漏
2. **Metaspace**：元空间不足，类加载太多或类泄漏
3. **GC overhead limit exceeded**：GC回收效率太低，回收后还是98%+满
4. **Direct buffer memory**：直接内存泄漏
5. **StackOverflowError**：栈溢出，递归太深

**排查步骤**：
1. <HoverComment text="开启OOM自动转储" comment="JVM参数`-XX:+HeapDumpOnOutOfMemoryError`，当发生OOM时自动将堆内存快照保存到文件（dump文件），方便后续分析。" />：`-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/dump.hprof`
2. 用<HoverComment text="MAT" comment="Memory Analyzer Tool，Eclipse提供的Java内存分析工具，可以打开堆dump文件，分析对象引用关系，快速定位内存泄漏。" />分析<HoverComment text="dump文件" comment="堆内存快照文件，记录OOM时刻堆中所有对象的内存状态和引用关系。通常为.hprof格式，可用MAT、JProfiler等工具打开分析。" />，查看<HoverComment text="Dominator Tree" comment="支配树，MAT工具中的视图，按照对象占用内存大小排序，直接显示哪些对象占用了最多内存，帮助快速定位内存泄漏的大对象。" />找最大对象
3. 查看GC日志确认OOM触发原因

## JVM调优的常用参数有哪些？

**内存参数**：
- `-Xms4g -Xmx4g`：初始堆和最大堆4G，设为相同避免扩容抖动
- `-Xmn1g`：新生代1G，老年代3G
- `-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m`：元空间大小

**GC参数**：
- `-XX:+UseG1GC`：使用G1收集器（JDK9+默认）
- `-XX:MaxGCPauseMillis=200`：G1最大停顿200ms

**调优参数**：
- `-XX:SurvivorRatio=8`：Eden:S0:S1=8:1:1
- `-XX:MaxTenuringThreshold=15`：对象晋升老年代最大年龄

**日志参数**：
- `-Xlog:gc*:file=gc.log`：GC日志（JDK9+）

## G1收集器的工作原理是什么？

G1（Garbage-First）是面向服务端的收集器，将堆划分为多个大小相等的Region。

**核心特点**：
1. **Region化**：堆分成多个Region（默认2048个），不再分固定的新生代老年代
2. **可预测回收**：能指定最大停顿时间，优先回收垃圾多的Region
3. **无碎片**：标记-整理算法，复制存活对象

**工作模式**：
1. **Young GC**：只回收年轻代Region
2. **Mixed GC**：年轻代+部分老年代Region（老年代垃圾比例超过阈值触发）

**回收过程**：
1. **并发标记**：找出所有存活对象
2. **最终标记**：完成标记，处理SATB缓冲区
3. **筛选回收**：根据收益排序，选择Region回收