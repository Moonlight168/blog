---
order: 11
---
# Java 新特性
## Java 8 你知道有什么新特性？
下面是 Java 8 主要新特性的整理表格，包含关键改进和示例说明：
|特性名称|描述|示例或说明|
|----|----|----|
|Lambda 表达式|简化匿名内部类，支持函数式编程|`(a, b) -> a + b` 代替匿名类实现接口|
|函数式接口|仅含一个抽象方法的接口，可用`@FunctionalInterface`注解标记|`Runnable`, `Comparator`, 或自定义接口 `@FunctionalInterface interface MyFunc { void run(); }`|
|Stream API|提供链式操作处理集合数据，支持并行处理|`list.stream().filter(x -> x > 0).collect(Collectors.toList())`|
|Optional 类|封装可能为`null`的对象，减少空指针异常|`Optional.ofNullable(value).orElse("default")`|
|方法引用|简化 Lambda 表达式，直接引用现有方法|`System.out::println` 等价于 `x -> System.out.println(x)`|
|接口的默认方法与静态方法|接口可定义默认实现和静态方法，增强扩展性|`interface A { default void print() { System.out.println("默认方法"); } }`|
|并行数组排序|使用多线程加速数组排序|`Arrays.parallelSort(array)`|
|重复注解|允许同一位置多次使用相同注解|`@Repeatable` 注解配合容器注解使用|
|类型注解|注解可应用于更多位置（如泛型、异常等）|`List<@NonNull String> list`|
|CompletableFuture|增强异步编程能力，支持链式调用和组合操作|`CompletableFuture.supplyAsync(() -> "result").thenAccept(System.out::println)`|

## Lambda 表达式了解吗？
Lambda 表达式是一种简洁的语法，用于创建匿名函数，主要用于简化函数式接口（只有一个抽象方法的接口）的使用。其基本语法有以下两种形式：
- `(parameters) -> expression`：当 Lambda 体只有一个表达式时使用，表达式的结果会作为返回值。
- `(parameters) -> { statements; }`：当 Lambda 体包含多条语句时，需要使用大括号将语句括起来，若有返回值则需要使用`return`语句。

传统的匿名内部类实现方式代码较为冗长，而 Lambda 表达式可以用更简洁的语法实现相同的功能。比如，使用匿名内部类实现`Runnable`接口：
```java
public class AnonymousClassExample {
    public static void main(String[] args) {
        Thread t1 = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("Running using anonymous class");
            }
        });
        t1.start();
    }
}
```

使用 Lambda 表达式实现相同功能：
```java
public class LambdaExample {
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> System.out.println("Running using lambda expression"));
        t1.start();
    }
}
```

可以看到，Lambda 表达式的代码更加简洁明了。

此外，Lambda 表达式能够更清晰地表达代码的意图，尤其是在处理集合操作时，如过滤、映射等。比如，过滤出列表中所有偶数：
```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class ReadabilityExample {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);
        // 使用 Lambda 表达式结合 Stream API 过滤偶数
        List<Integer> evenNumbers = numbers.stream()
                                           .filter(n -> n % 2 == 0)
                                           .collect(Collectors.toList());
        System.out.println(evenNumbers);
    }
}
```

通过 Lambda 表达式，代码的逻辑更加直观，易于理解。

同时，Lambda 表达式使得 Java 支持函数式编程范式，允许将函数作为参数传递，从而可以编写更灵活、可复用的代码。比如定义一个通用的计算函数：
```java
interface Calculator {
    int calculate(int a, int b);
}

public class FunctionalProgrammingExample {
    public static int operate(int a, int b, Calculator calculator) {
        return calculator.calculate(a, b);
    }

    public static void main(String[] args) {
        // 使用 Lambda 表达式传递加法函数
        int sum = operate(3, 5, (x, y) -> x + y);
        System.out.println("Sum: " + sum);

        // 使用 Lambda 表达式传递乘法函数
        int product = operate(3, 5, (x, y) -> x * y);
        System.out.println("Product: " + product);
    }
}
```

不过，Lambda 表达式也有一些缺点，比如会增加调试困难，因为 Lambda 表达式是匿名的，在调试时很难定位具体是哪个 Lambda 表达式出现了问题。尤其是当 Lambda 表达式嵌套使用或者比较复杂时，调试难度会进一步增加。

## Java中stream的API介绍一下
Java 8引入了Stream API，它提供了一种高效且易于使用的数据处理方式，特别适合集合对象的操作，如过滤、映射、排序等。Stream API不仅可以提高代码的可读性和简洁性，还能利用多核处理器的优势进行并行处理。以下通过两个具体例子，对比Stream API引入前后的做法：

### 案例1：过滤并收集满足条件的元素
**问题场景**：从一个列表中筛选出所有长度大于3的字符串，并收集到一个新的列表中。

**无Stream API的做法**：
```java
List<String> originalList = Arrays.asList("apple", "fig", "banana", "kiwi");
List<String> filteredList = new ArrayList<>();

for (String item : originalList) {
    if (item.length() > 3) {
        filteredList.add(item);
    }
}
```
该方式需显式创建新列表，通过循环遍历原列表，手动检查元素条件并添加到新列表，代码较繁琐。

**使用Stream API的做法**：
```java
List<String> originalList = Arrays.asList("apple", "fig", "banana", "kiwi");
List<String> filteredList = originalList.stream()
                                        .filter(s -> s.length() > 3)
                                        .collect(Collectors.toList());
```
直接在原始列表上调用`.stream()`创建流，通过`.filter()`中间操作筛选元素，最后用`.collect(Collectors.toList())`终端操作收集结果，逻辑清晰、代码简洁。

### 案例2：计算列表中所有数字的总和
**问题场景**：计算一个数字列表中所有元素的总和。

**无Stream API的做法**：
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = 0;
for (Integer number : numbers) {
    sum += number;
}
```
通过for-each循环遍历列表，累加元素值计算总和，需手动维护累加变量。

**使用Stream API的做法**：
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.stream()
                 .mapToInt(Integer::intValue)
                 .sum();
```
先通过`.mapToInt()`将Integer流转换为IntStream（优化基本类型处理效率），再直接调用`.sum()`方法计算总和，极大简化代码。

## Stream流的并行API是什么？
Stream流的并行API是**ParallelStream**。

并行流（ParallelStream）会将源数据拆分为多个子流，通过多线程并行处理，最后将各子流处理结果汇总为一个流对象。其底层依赖通用的`fork/join`池实现，即把一个任务拆分成多个"小任务"并行计算，再合并"小任务"结果得到最终结果。

### Stream串行流与并行流的主要区别
- **串行流**：通过`stream()`创建，由单个线程按顺序处理所有数据，适用于数据量小或逻辑简单的场景。
- **并行流**：通过`parallelStream()`或`stream().parallel()`创建，利用多线程并行处理数据，适用于数据量大、CPU密集型的任务，能充分利用多核处理器性能。

需注意，若任务为I/O密集型（如频繁读写文件、网络请求），且任务数远大于线程数，直接使用ParallelStream并非最优选择，可能因线程等待I/O导致资源浪费。

## CompletableFuture怎么用的？
CompletableFuture是Java 8引入的，用于优化异步编程。在Java 8之前，异步计算通常通过Future实现，但Future仅能通过阻塞或轮询获取结果，不支持设置回调，易导致"回调地狱"；而CompletableFuture扩展了Future，支持回调处理计算结果，还能进行任务组合编排，有效解决回调地狱问题。

以下通过案例对比ListenableFuture（Guava提供，用于实现回调）与CompletableFuture的使用差异：

**场景**：有step1、step2、step3三个操作，step3依赖step1和step2的结果。

### 1. ListenableFuture实现（存在回调地狱）
```java
ExecutorService executor = Executors.newFixedThreadPool(5);
ListeningExecutorService guavaExecutor = MoreExecutors.listeningDecorator(executor);

// 执行step1
ListenableFuture<String> future1 = guavaExecutor.submit(() -> {
    System.out.println("执行step 1");
    return "step1 result";
});

// 执行step2
ListenableFuture<String> future2 = guavaExecutor.submit(() -> {
    System.out.println("执行step 2");
    return "step2 result";
});

// 合并step1和step2结果
ListenableFuture<List<String>> future1And2 = Futures.allAsList(future1, future2);

// 回调处理合并结果，触发step3（嵌套回调，形成回调地狱）
Futures.addCallback(future1And2, new FutureCallback<List<String>>() {
    @Override
    public void onSuccess(List<String> result) {
        System.out.println(result);
        // 执行step3
        ListenableFuture<String> future3 = guavaExecutor.submit(() -> {
            System.out.println("执行step 3");
            return "step3 result";
        });
        // 回调处理step3结果（再次嵌套）
        Futures.addCallback(future3, new FutureCallback<String>() {
            @Override
            public void onSuccess(String result) {
                System.out.println(result);
            }        
            @Override
            public void onFailure(Throwable t) {}
        }, guavaExecutor);
    }
    @Override
    public void onFailure(Throwable t) {}
}, guavaExecutor);
```

### 2. CompletableFuture实现（无回调地狱，代码简洁）
```java
ExecutorService executor = Executors.newFixedThreadPool(5);

// 执行step1
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> {
    System.out.println("执行step 1");
    return "step1 result";
}, executor);

// 执行step2
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> {
    System.out.println("执行step 2");
    return "step2 result";
});

// 合并step1和step2结果，触发step3（链式调用，无嵌套）
cf1.thenCombine(cf2, (result1, result2) -> {
    System.out.println(result1 + " , " + result2);
    System.out.println("执行step 3");
    return "step3 result";
}).thenAccept(result3 -> System.out.println(result3));
```

### CompletableFuture核心能力
CompletableFuture实现了`Future`和`CompletionStage`两个接口：
- `Future`：表示异步计算结果，提供获取结果、判断完成状态等基础能力。
- `CompletionStage`：表示异步执行的"步骤"，支持通过`thenApply`（转换结果）、`thenCombine`（合并多个步骤）、`thenAccept`（消费结果）等方法，实现步骤的链式编排，让代码逻辑更清晰。

## Java 21 新特性知道哪些？
### 一、新语言特性
1. **Switch语句的模式匹配（增强）**  
   Java 21增强了Switch的模式匹配能力，允许在`case`标签中直接使用类型模式，无需手动类型转换，减少样板代码且提升类型安全性。例如，针对不同类型的账户类，可直接根据类型模式获取余额：
   ```java
   // 不同账户类型的余额获取
   Object account = new SavingsAccount(1000.0);
   String result = switch (account) {
       case SavingsAccount sa -> "储蓄账户余额：" + sa.getSavings();
       case CheckingAccount ca -> "支票账户余额：" + ca.getChecking();
       default -> "未知账户类型";
   };
   ```

2. **数组模式**  
   将模式匹配扩展到数组，支持在条件语句中直接解构和检查数组内容，无需遍历判断。例如：
   ```java
   int[] arr = {1, 2, 3};
   // 判断数组是否匹配{1,2,3}模式
   if (arr instanceof int[] {1, 2, 3}) {
       System.out.println("数组匹配指定模式");
   }
   ```

3. **字符串模板（预览版）**  
   提供更简洁的字符串构建方式，支持在字符串字面量中直接嵌入表达式，替代传统的`+`拼接，提升可读性和可维护性。例如：
   ```java
   String name = "Alice";
   // 传统拼接
   String oldStr = "Hello " + name + ", welcome to the team!";
   // 字符串模板（预览）
   String newStr = `Hello ${name}, welcome to the team!`;
   ```

### 二、新并发特性
1. **虚拟线程（Virtual Threads）**  
   引入轻量级的虚拟线程，相比传统平台线程（Platform Thread），虚拟线程共享底层操作系统线程的堆栈，内存消耗极低（单个虚拟线程内存开销仅几KB），可支持百万级并发，大幅提升应用吞吐量和响应速度。  
   **创建方式**：
    - 静态构建方法：`Thread.startVirtualThread(() -> System.out.println("虚拟线程执行"));`
    - 构建器：`Thread.ofVirtual().name("vt-1").start(() -> {/* 业务逻辑 */});`
    - ExecutorService：`try (var executor = Executors.newVirtualThreadPerTaskExecutor()) { executor.submit(() -> {/* 任务 */}); }`

2. **Scoped Values（范围值，预览版）**  
   提供线程间共享不可变数据的新方式，替代传统的`ThreadLocal`（易导致内存泄漏、父子线程数据隔离问题）。Scoped Values可在指定"范围"内（如一个请求的处理周期），让多个线程安全共享数据，无需通过方法参数传递，适用于传递用户会话、配置信息等上下文。例如：
   ```java
   // 定义范围值
   static final ScopedValue<String> USER = ScopedValue.newInstance();

   // 在范围中设置并使用值
   ScopedValue.runWhere(USER, "Alice", () -> {
       // 子线程可直接获取USER值，无需显式传递
       Thread.startVirtualThread(() -> System.out.println("当前用户：" + USER.get()));
   });
   ```