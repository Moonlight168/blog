---
title: '解决 AsyncRequestNotUsableException 异常'
date: 2025-09-24
categories: ["BUG"]
---
### 1️⃣ 现象

你在日志里看到的异常：

```
AsyncRequestNotUsableException: ServletOutputStream failed to flush
IllegalStateException: A non-container thread attempted to use the AsyncContext
```

意思是：

* 你后端有异步请求（`DeferredResult` 或 `ResponseBodyEmitter`）在处理订单或者其他请求。
* 这个异步请求在后台线程处理时，客户端已经断开连接（比如浏览器关闭或超时）。
* 后台线程还尝试往客户端写数据（刷新流），Tomcat 就抛出异常，告诉你 **不能再使用这个已经“结束”的请求上下文了**。


### 2️⃣ 为什么会导致 Spring Boot Admin 显示 `OFFLINE`

* Spring Boot Admin 会定期去你的服务检查状态。
* 如果异步请求总是超时或者抛异常，Admin 无法获取服务的健康状态。
* Admin 就会把服务标记为 `OFFLINE`。


### 3️⃣ 解决办法

1. **给异步请求设置超时和异常处理**

```java
DeferredResult<String> result = new DeferredResult<>(15000L); // 15秒超时

result.onTimeout(() -> {
    result.setErrorResult("请求超时");
});

result.onError((Throwable t) -> {
    result.setErrorResult("处理异常: " + t.getMessage());
});
```

2. **后台异步任务捕获异常**
   后台线程里做任务时，必须捕获异常，避免继续操作已经关闭的请求流：

```java
taskExecutor.submit(() -> {
    try {
        // 异步逻辑
    } catch (Exception e) {
        log.error("异步任务异常", e);
    }
});
```

3. **延长 Admin 检测超时时间**（可选）
   Admin 默认 10 秒左右，如果你的业务请求可能慢，可以适当增加超时。


简单来说就是：**后台异步线程不能在客户端断开或请求超时后继续写数据**，否则就会抛异常并导致服务被标记 OFFLINE。

