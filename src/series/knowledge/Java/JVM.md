---
title: JVM
icon: /assets/icon/jvm.png
order: 3
---

## **了解Java的双亲委派机制吗？**

**定义**：
Java 类加载器在加载类时，先把请求交给父类加载器处理，如果父加载器无法加载，才由自己去加载。这就是“先父后子”的加载策略。

**目的**：

* **保证核心类一致性**：避免核心类（如 `java.lang.String`）被重复加载。
* **防止类冲突**：不同库中同名类不会覆盖核心类。

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

[Java 对象结构](/blogs/java/Java对象存储结构详解.md) = 16 字节**对象头** + **实例数据**(字段) + **对齐填充**(填充到 8 字节倍数)。

* **对象头**：存元信息（如锁状态、hashCode、类型指针等）
* **实例数据**：类里面的字段真正存储的地方
* **对齐填充**：为了让对象的大小变成 8 字节的整数倍，**避免 CPU 访问异常**

## **JVM GC（垃圾回收）有了解吗？**

**核心机制**：
- **分代收集**：堆分新生代（复制算法）+ 老年代（标记-整理/清除）
- **触发条件**：Eden满→Minor GC（新生代GC，复制算法，停顿短），老年代满→Full GC
- **STW**：Stop-The-World暂停应用线程保证引用一致性

**主流收集器**：
- **G1**（JDK9+默认）：区域化，可预测停顿
- **ZGC**：亚毫秒级停顿，TB级堆支持
- **Parallel**：吞吐量优先，后台批处理

**调优口诀**：Xms=Xmx防抖动，新生代占1/3，用G1/ZGC减停顿

JVM GC从入门到进阶：[JVM GC 垃圾回收](/blogs/java/JVMGC入门到进阶.md)

## **JVM常用命令有哪些？**

**内存监控**：`jstat -gcutil <pid> 1000` 看各代使用率
**堆分析**：`jcmd <pid> GC.heap_dump file=heap.hprof` 转储堆
**线程诊断**：`jcmd <pid> Thread.print` 打印线程栈
**GC日志**：`-Xlog:gc*:file=gc.log`（JDK9+统一日志）

**参数速记**：`-X`基础调优，`-XX`高级特性，`-Xlog`诊断日志

JVM常用命令：[JVM参数与命令全攻略](/blogs/java/JVM常用命令.md)

## 如何优化JVM的FullGC问题？

**回答：**
JVM频繁FullGC会导致应用停顿，影响性能。解决策略：

### 1. JVM参数调优
- 增大Xms（初始堆大小）和Xmx（最大堆大小），减少FullGC频率
- 增大老年代占比（-XX:NewRatio=2）
- 使用G1或ZGC等低停顿收集器
- 调整-XX:MaxTenuringThreshold控制对象晋升年龄

### 2. 减少对象创建
- 避免大对象创建，使用对象池复用
- 减少反射操作，缓存反射结果
- 对象懒加载，避免初始化加载过多对象
- 及时清理静态集合，防止内存泄漏

### 3. 代码优化
- 减少内存泄漏，及时关闭资源
- 对缓存使用软引用/弱引用
- 选择高效数据结构，减少内存占用
- 分批次处理数据，避免一次性加载大量数据

### 4. 监控分析
- 查看GC日志，分析FullGC触发原因
- 使用MAT、JProfiler分析内存泄漏
- 监控内存使用趋势，设置告警
- 跟踪对象生命周期，找出内存占用大的对象