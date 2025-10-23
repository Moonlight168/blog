---
title: 从AOP思想到动态代理：揭秘淘票票分布式锁的底层实现
date: 2025-10-19
category: Java
---

切面编程（AOP）是分布式系统中用于**解耦横切关注点**的核心技术，而动态代理正是AOP实现的底层引擎。在淘票票项目中，我们通过AOP结合动态代理实现了分布式锁的无侵入式集成，既让业务代码保持简洁，又解决了并发安全问题。

本文将从AOP思想出发，深入讲解JDK动态代理与CGLIB动态代理的原理，并结合淘票票的分布式锁实现，完整展示从原理到实践的全过程。

---

## 一、AOP思想：为什么要“横向切入”？

在传统的面向对象编程（OOP）中，业务逻辑通常按照“纵向”划分，例如支付、下单、退款等。但日志记录、事务控制、安全校验这些功能，会横向地出现在各个业务中：

```
支付服务 → 需要日志、事务、分布式锁  
订单服务 → 需要日志、事务、分布式锁  
退款服务 → 需要日志、事务、分布式锁  
```

如果每个业务方法都手动编写这些通用逻辑，不仅代码冗余，而且修改维护非常麻烦。
AOP 的核心思想正是：**将这些“横切关注点”单独抽离成切面，通过动态代理在运行时织入业务流程中，从而实现“业务逻辑”与“通用逻辑”的分离。**

### AOP核心概念（以分布式锁为例）

| 概念           | 含义                   | 淘票票示例                                |
| ------------ | -------------------- | ------------------------------------ |
| 切面（Aspect）   | 封装横切逻辑的类，如锁、日志等      | `ServiceLockAspect`（分布式锁切面）          |
| 切点（Pointcut） | 定义切面作用的位置            | `@annotation(ServiceLock)`（标注此注解的方法） |
| 通知（Advice）   | 切面的执行逻辑，如加锁和释放锁      | 环绕通知：`tryLock() → 执行方法 → unlock()`   |
| 代理对象（Proxy）  | 动态生成的“包装对象”，负责执行切面逻辑 | 例如 `PayService` 的代理对象                |
| 织入（Weaving）  | 将切面逻辑嵌入业务方法的过程       | 运行时通过动态代理织入锁逻辑                       |

---

## 二、动态代理：AOP的执行引擎

AOP的无侵入增强依赖于动态代理。动态代理能在**运行时动态生成代理对象**，并在方法调用时自动加入切面逻辑。

Java中有两种主流的动态代理方式：

* **JDK动态代理**：基于接口；
* **CGLIB动态代理**：基于继承。

Spring会根据情况自动选择使用哪一种。

---

### 2.1 JDK动态代理：基于接口的实现

JDK动态代理要求目标类**必须实现接口**。代理对象通过实现相同接口拦截方法调用。

#### 工作原理

1. 目标对象必须实现接口；
2. JVM在运行时生成一个新的代理类，该类实现目标接口；
3. 所有方法调用都会转发到 `InvocationHandler.invoke()` 方法中，在这里可以加入自定义逻辑。

#### 示例：模拟淘票票的分布式锁

```java
// 1. 接口
public interface PayServiceInterface {
    String pay(String orderNo);
}

// 2. 目标对象
public class PayService implements PayServiceInterface {
    @Override
    public String pay(String orderNo) {
        System.out.println("[业务逻辑] 执行支付：" + orderNo);
        return "支付成功";
    }
}

// 3. InvocationHandler
public class LockInvocationHandler implements InvocationHandler {
    private final Object target;

    public LockInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        String lockKey = "pay:" + args[0];
        System.out.println("[切面逻辑] 获取锁：" + lockKey);
        try {
            return method.invoke(target, args);
        } finally {
            System.out.println("[切面逻辑] 释放锁：" + lockKey);
        }
    }
}

// 4. 生成代理对象
public class Main {
    public static void main(String[] args) {
        PayServiceInterface target = new PayService();
        PayServiceInterface proxy = (PayServiceInterface) Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            new LockInvocationHandler(target)
        );
        proxy.pay("ORDER123456");
    }
}
```

**运行结果：**

```
[切面逻辑] 获取锁：pay:ORDER123456
[业务逻辑] 执行支付：ORDER123456
[切面逻辑] 释放锁：pay:ORDER123456
```

---

### 2.2 CGLIB动态代理：基于继承的实现

CGLIB（Code Generation Library）通过继承目标类并在字节码层面重写方法实现代理。它不要求类实现接口。

#### 原理简述

1. 生成目标类的子类；
2. 重写非final方法，在其中加入切面逻辑；
3. 使用ASM直接操作字节码，性能更优。

#### 示例

```java
public class PayService {
    public String pay(String orderNo) {
        System.out.println("[业务逻辑] 执行支付：" + orderNo);
        return "支付成功";
    }
}

public class LockMethodInterceptor implements MethodInterceptor {
    @Override
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
        String lockKey = "pay:" + args[0];
        System.out.println("[切面逻辑] 获取锁：" + lockKey);
        try {
            return proxy.invokeSuper(obj, args);
        } finally {
            System.out.println("[切面逻辑] 释放锁：" + lockKey);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(PayService.class);
        enhancer.setCallback(new LockMethodInterceptor());
        PayService proxy = (PayService) enhancer.create();
        proxy.pay("ORDER123456");
    }
}
```

**运行结果：**

```
[切面逻辑] 获取锁：pay:ORDER123456
[业务逻辑] 执行支付：ORDER123456
[切面逻辑] 释放锁：pay:ORDER123456
```

---

### 2.3 JDK 与 CGLIB 对比

| 对比项    | JDK动态代理       | CGLIB动态代理     |
| ------ | ------------- | ------------- |
| 是否依赖接口 | 是             | 否             |
| 原理     | 通过 Proxy 实现接口 | 通过继承目标类       |
| 拦截范围   | 仅接口方法         | 所有非final方法    |
| 性能     | 反射调用，稍慢       | 字节码调用，稍快      |
| 局限     | 无法代理无接口的类     | 无法代理final类或方法 |

Spring AOP 的选择逻辑：

* 如果类实现了接口，默认使用 **JDK代理**；
* 如果没有实现接口，则使用 **CGLIB代理**；
* 可通过 `@EnableAspectJAutoProxy(proxyTargetClass = true)` 强制使用CGLIB。

---

## 三、淘票票分布式锁的AOP实现

在淘票票中，我们利用AOP和动态代理实现了**分布式锁的自动加解锁机制**。

### 1. 核心组件

1. **注解 `@ServiceLock`**：定义哪些方法需要加锁；
2. **切面类 `ServiceLockAspect`**：负责执行加锁与释放逻辑；
3. **动态代理**：由Spring自动生成，拦截被注解的方法。

### 2. 实现代码

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ServiceLock {
    String name();
    String[] keys();
    long waitTime() default 5;
}
```

```java
@Aspect
@Component
public class ServiceLockAspect {
    @Autowired
    private RedissonClient redissonClient;
    @Autowired
    private SpelExpressionParser spelParser;

    @Pointcut("@annotation(serviceLock)")
    public void lockPointcut(ServiceLock serviceLock) {}

    @Around("lockPointcut(serviceLock)")
    public Object around(ProceedingJoinPoint joinPoint, ServiceLock serviceLock) throws Throwable {
        String lockKey = generateLockKey(joinPoint, serviceLock);
        RLock lock = redissonClient.getLock(lockKey);
        boolean isLocked = lock.tryLock(serviceLock.waitTime(), TimeUnit.SECONDS);

        if (!isLocked) {
            throw new BusinessException("操作太频繁，请稍后再试");
        }

        try {
            return joinPoint.proceed();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    private String generateLockKey(ProceedingJoinPoint joinPoint, ServiceLock serviceLock) {
        EvaluationContext context = new StandardEvaluationContext();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();
        for (int i = 0; i < paramNames.length; i++) {
            context.setVariable(paramNames[i], args[i]);
        }

        StringBuilder keyBuilder = new StringBuilder("taopiaopiao:")
                .append(serviceLock.name())
                .append(":");
        for (String key : serviceLock.keys()) {
            keyBuilder.append(spelParser.parseExpression(key).getValue(context)).append(":");
        }
        return keyBuilder.toString();
    }
}
```

业务层使用：

```java
@Service
public class PayService {
    @ServiceLock(name = "PAY", keys = {"#orderNo"})
    public String pay(String orderNo) {
        return "支付成功";
    }
}
```

**运行流程：**

1. Spring创建 `PayService` 的代理对象；
2. 调用 `pay()` 时触发切面；
3. 切面生成锁key → 获取锁；
4. 执行业务逻辑；
5. finally块中释放锁。

---

## 四、总结

* AOP 通过“横向切入”解决了代码复用与耦合问题；
* 动态代理是 AOP 实现的底层基础；
* JDK代理适合有接口的类，CGLIB代理适合没有接口的类；
* 在淘票票项目中，通过 `@ServiceLock` + AOP 实现了简单优雅的分布式锁机制。

开发者无需关心加锁逻辑，只需一行注解，就能让核心接口拥有分布式并发保护能力，既保持代码整洁，又保障系统稳定。
