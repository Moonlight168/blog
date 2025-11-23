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
