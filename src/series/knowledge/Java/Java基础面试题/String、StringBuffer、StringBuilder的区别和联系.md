---
order: 10
---
# String、StringBuffer、StringBuilder的区别和联系
1. **可变性**：`String`是不可变的（Immutable），一旦创建，内容无法修改，每次修改都会生成一个新的对象。`StringBuilder`和`StringBuffer`是可变的（Mutable），可以直接对字符串内容进行修改而不会创建新对象。
2. **线程安全性**：`String`因为不可变，天然线程安全。`StringBuilder`不是线程安全的，适用于单线程环境。`StringBuffer`是线程安全的，其方法通过`synchronized`关键字实现同步，适用于多线程环境。
3. **性能**：`String`性能最低，尤其是在频繁修改字符串时会生成大量临时对象，增加内存开销和垃圾回收压力。`StringBuilder`性能最高，因为它没有线程安全的开销，适合单线程下的字符串操作。`StringBuffer`性能略低于`StringBuilder`，因为它的线程安全机制引入了同步开销。
4. **使用场景**：如果字符串内容固定或不常变化，优先使用`String`。如果需要频繁修改字符串且在单线程环境下，使用`StringBuilder`。如果需要频繁修改字符串且在多线程环境下，使用`StringBuffer`。

对比总结如下：
|特性|String|StringBuilder|StringBuffer|
|----|----|----|----|
|不可变性|不可变|可变|可变|
|线程安全|是（因不可变）|否|是（同步方法）|
|性能|低（频繁修改时）|高（单线程）|中（多线程安全）|
|适用场景|静态字符串|单线程动态字符串|多线程动态字符串|

例子代码如下：
```java
// String的不可变性
String str = "abc";
str = str + "def"; // 新建对象，str指向新对象

// StringBuilder（单线程高效）
StringBuilder sb = new StringBuilder();
sb.append("abc").append("def"); // 直接修改内部数组

// StringBuffer（多线程安全）
StringBuffer sbf = new StringBuffer();
sbf.append("abc").append("def"); // 同步方法保证线程安全
```