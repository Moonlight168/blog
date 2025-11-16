---
title: String类相关
order: 3
---


## String、StringBuilder、StringBuffer 区别总结

| 特性   | String    | StringBuilder | StringBuffer |
| ---- | --------- | ------------- | ------------ |
| 可变性  | ❌ 不可变     | ✔ 可变          | ✔ 可变         |
| 线程安全 | ✔ 安全（不可变） | ❌ 不安全         | ✔ 安全（同步）     |
| 性能   | 最低        | 最高（单线程）       | 中等（多线程）      |
| 使用场景 | 定值字符串     | 单线程频繁修改       | 多线程频繁修改      |

示例：

```java
String str = "a"; str += "b";          // 新建对象
StringBuilder sb = new StringBuilder(); sb.append("a");
StringBuffer sbf = new StringBuffer(); sbf.append("a");
```
