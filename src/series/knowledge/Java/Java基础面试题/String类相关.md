---
title: String类相关
order: 3
---

## 深拷贝和浅拷贝的区别？
（此处应有"浅拷贝与深拷贝对象引用关系"的示意图，图片名称：浅拷贝深拷贝对比图）

| 对比维度 | 浅拷贝（Shallow Copy） | 深拷贝（Deep Copy） |
|----------|-------------------------|---------------------|
| 拷贝范围 | 仅拷贝对象本身和内部值类型字段 | 拷贝对象本身 + 内部所有引用类型字段（递归拷贝） |
| 引用关系 | 原对象与拷贝对象的引用类型字段指向同一对象 | 原对象与拷贝对象的引用类型字段指向不同对象（全新副本） |
| 数据独立性 | 引用类型字段修改会相互影响 | 完全独立，修改一方不影响另一方 |
| 实现复杂度 | 较简单（如`Object.clone()`默认浅拷贝） | 较复杂（需递归处理引用类型或用序列化） |

示例：
- 浅拷贝：Student对象含"姓名（String）""住址（Address引用类型）"，浅拷贝后，两个Student的`Address`指向同一对象，修改一个的住址会影响另一个。
- 深拷贝：拷贝Student时，同时新建`Address`对象并复制其属性，两个Student的`Address`是独立对象，修改互不影响。

## 实现深拷贝的三种方法是什么？
在Java中，实现对象深拷贝主要有三种方法：

### 1. 实现 Cloneable 接口并重写 clone() 方法
需对象及其所有引用类型字段均实现`Cloneable`接口，并重写`clone()`方法，通过递归克隆引用类型字段实现深拷贝。
```java
class MyClass implements Cloneable {
    private String field1;
    private NestedClass nestedObject; // 引用类型字段

    @Override
    protected Object clone() throws CloneNotSupportedException {
        MyClass cloned = (MyClass) super.clone(); // 先浅拷贝当前对象
        // 递归克隆引用类型字段，实现深拷贝
        cloned.nestedObject = (NestedClass) nestedObject.clone();
        return cloned;
    }
}

class NestedClass implements Cloneable {
    private int nestedField;

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone(); // 引用类型字段自身也需实现clone()
    }
}
```

### 2. 使用序列化和反序列化
将对象序列化为字节流，再反序列化为新对象，需对象及其所有引用类型字段实现`Serializable`接口。
```java
import java.io.*;

class MyClass implements Serializable {
    private String field1;
    private NestedClass nestedObject;

    // 深拷贝方法
    public MyClass deepCopy() {
        try {
            // 序列化：将对象写入字节流
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(bos);
            oos.writeObject(this);
            oos.flush();
            oos.close();

            // 反序列化：从字节流读取对象（生成新对象）
            ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());
            ObjectInputStream ois = new ObjectInputStream(bis);
            return (MyClass) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }
}

class NestedClass implements Serializable {
    private int nestedField;
}
```

### 3. 手动递归复制
针对特定对象结构，手动创建新对象并复制所有字段（包括引用类型字段的递归复制），适用于对象结构简单的场景。
```java
class MyClass {
    private String field1;
    private NestedClass nestedObject;

    // 深拷贝方法
    public MyClass deepCopy() {
        MyClass copy = new MyClass();
        copy.setField1(this.field1); // 复制值类型字段
        // 手动复制引用类型字段（调用其深拷贝方法）
        copy.setNestedObject(this.nestedObject.deepCopy());
        return copy;
    }

    // getter/setter省略
}

class NestedClass {
    private int nestedField;

    // 引用类型字段的深拷贝方法
    public NestedClass deepCopy() {
        NestedClass copy = new NestedClass();
        copy.setNestedField(this.nestedField);
        return copy;
    }

    // getter/setter省略
}

## 有一个学生类，想按照分数排序，再按学号排序，应该怎么做？
可通过**实现Comparable接口**（自然排序）或**使用Comparator接口**（定制排序）实现，推荐使用`Comparable`接口，让学生类自身具备排序能力，代码如下：

### 方法1：实现Comparable接口（推荐，自然排序）
让`Student`类实现`java.lang.Comparable`接口，重写`compareTo`方法，定义"先按分数排序，分数相同则按学号排序"的逻辑：
```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Student implements Comparable<Student> {
    private int id; // 学号
    private int score; // 分数

    // 构造方法
    public Student(int id, int score) {
        this.id = id;
        this.score = score;
    }

    // 重写compareTo：定义排序规则
    @Override
    public int compareTo(Student other) {
        // 1. 先按分数降序排序（分数高的在前）
        if (this.score != other.score) {
            // Integer.compare(a, b)：a > b 返回1，a < b 返回-1，相等返回0
            // 降序：用other.score - this.score（或Integer.compare(other.score, this.score)）
            return Integer.compare(other.score, this.score);
        }
        // 2. 分数相同，按学号升序排序（学号小的在前）
        else {
            return Integer.compare(this.id, other.id);
        }
    }

    // toString：方便打印
    @Override
    public String toString() {
        return "Student{id=" + id + ", score=" + score + "}";
    }

    // 测试
    public static void main(String[] args) {
        List<Student> students = new ArrayList<>();
        students.add(new Student(2, 90)); // 学号2，分数90
        students.add(new Student(1, 95)); // 学号1，分数95
        students.add(new Student(3, 90)); // 学号3，分数90

        // 调用Collections.sort()，自动使用compareTo方法排序
        Collections.sort(students);

        // 输出结果：[Student{id=1, score=95}, Student{id=2, score=90}, Student{id=3, score=90}]
        System.out.println(students);
    }
}
```

### 方法2：使用Comparator接口（定制排序，灵活）
若不想修改`Student`类（如类已固化），可在排序时传入`Comparator`对象，定制排序规则：
```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class Student {
    private int id;
    private int score;

    public Student(int id, int score) {
        this.id = id;
        this.score = score;
    }

    // getter方法（Comparator需获取属性）
    public int getId() { return id; }
    public int getScore() { return score; }

    @Override
    public String toString() {
        return "Student{id=" + id + ", score=" + score + "}";
    }

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>();
        students.add(new Student(2, 90));
        students.add(new Student(1, 95));
        students.add(new Student(3, 90));

        // 传入Comparator，定制排序规则
        Collections.sort(students, new Comparator<Student>() {
            @Override
            public int compare(Student s1, Student s2) {
                // 先按分数降序
                if (s1.getScore() != s2.getScore()) {
                    return Integer.compare(s2.getScore(), s1.getScore());
                }
                // 再按学号升序
                else {
                    return Integer.compare(s1.getId(), s2.getId());
                }
            }
        });

        // 输出结果与方法1一致
        System.out.println(students);
    }
}
```

### 关键说明
- **排序方向**：`Integer.compare(a, b)`返回正数表示a > b，若需降序，交换a和b的位置（如`Integer.compare(b, a)`）。
- **稳定性**：两种方法均为稳定排序，即分数和学号都相同的学生，排序后相对位置不变。
- **Java 8+简化**：可使用Lambda表达式简化`Comparator`，如`(s1, s2) -> { ... }`，代码更简洁。

## 说一说String、StringBuffer、StringBuilder的区别和联系
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