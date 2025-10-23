---
order: 9
---
# object
## == 与 equals 有什么区别？
| 对比维度 | == | equals() |
|----------|----|----------|
| 作用对象 | 基本数据类型：比较值是否相等；<br>引用数据类型：比较内存地址（对象是否为同一实例） | 仅用于引用数据类型，默认比较内存地址（继承自Object），重写后可比较内容（如String） |
| 本质 | 数值比较（基本类型比较值，引用类型比较地址值） | 逻辑比较，可自定义比较规则（通过重写） |
| 可重写性 | 不可重写（运算符，非方法） | 可重写（Object类的方法，子类可自定义实现） |

### 具体场景示例
1. **字符串比较**：
   - `==`：比较两个字符串对象的内存地址（是否为同一对象）。
   - `equals()`：String类重写了`equals()`，比较字符串内容是否相同。
     ```java
     String s1 = "abc";
     String s2 = new String("abc");
     System.out.println(s1 == s2); // false（地址不同）
     System.out.println(s1.equals(s2)); // true（内容相同）
     ```
2. **非字符串引用类型比较**：
   - 若未重写`equals()`，`==`与`equals()`效果一致，均比较内存地址。
   - 若重写`equals()`（如自定义实体类），`equals()`按重写逻辑比较（如比较属性值）。
     ```java
     class Person {
         private String id;
         // 重写equals()：id相同则认为对象相等
         @Override
         public boolean equals(Object o) {
             if (this == o) return true;
             if (o == null || getClass() != o.getClass()) return false;
             Person person = (Person) o;
             return Objects.equals(id, person.id);
         }
     }

     Person p1 = new Person("123");
     Person p2 = new Person("123");
     System.out.println(p1 == p2); // false（地址不同）
     System.out.println(p1.equals(p2)); // true（id相同）
     ```

## hashcode和equals方法有什么关系？
在Java中，`hashCode()`和`equals()`方法紧密关联，需遵循**两大约定**，以保证哈希表（如`HashMap`、`HashSet`）等数据结构正常工作：

### 1. 核心约定
- **一致性**：若两个对象通过`equals()`比较为`true`，则它们的`hashCode()`返回值**必须相同**。
   - 示例：若`obj1.equals(obj2) = true`，则`obj1.hashCode() == obj2.hashCode()`必须成立。
- **非一致性**：若两个对象的`hashCode()`返回值相同，它们通过`equals()`比较**不一定为`true`**（这种情况称为"哈希冲突"）。
   - 示例：若`obj1.hashCode() == obj2.hashCode()`，`obj1.equals(obj2)`可能为`false`。

### 2. 为什么重写equals()必须重写hashCode()？
若仅重写`equals()`而不重写`hashCode()`，会违反"一致性"约定，导致哈希表异常：
- 示例：自定义`Person`类，重写`equals()`（id相同则相等），但未重写`hashCode()`。此时，两个id相同的`Person`对象通过`equals()`为`true`，但`hashCode()`返回值可能不同（继承自Object的`hashCode()`返回对象地址）。
- 问题：将这两个对象存入`HashSet`时，因`hashCode()`不同，会被视为两个不同对象，存入不同位置，违反`HashSet`"不存储重复元素"的规则。

### 3. 总结
- 重写`equals()`时，**必须同步重写`hashCode()`**，确保"相等的对象有相同的哈希码"。
- 重写`hashCode()`时，需保证"相同哈希码的对象不一定相等"（允许哈希冲突，哈希表会通过`equals()`进一步判断）。