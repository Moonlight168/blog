---
title: Docker
icon: /assets/icon/docker.png
---

# Docker 面试题

## Docker 多阶段构建解决什么？怎么写？

- **解决**：分离构建环境和运行环境，减小最终镜像体积。
- **写法**：一个 Dockerfile 多个 `FROM`，最后 `COPY --from=build` 从构建阶段只拿产物（如 jar）。
- **示例**：
  ```dockerfile
  FROM maven:3.8-jdk-11 AS build
  COPY src /app/src
  COPY pom.xml /app
  RUN mvn -f /app/pom.xml clean package
  FROM openjdk:11-jre-slim
  COPY --from=build /app/target/app.jar /app.jar
  ENTRYPOINT ["java", "-jar", "/app.jar"](
  ```
- 阶段 1 有 Maven + JDK + 源码，阶段 2 只有 JRE + jar，中间垃圾全丢掉。

→ [回答历史](/series/答题历史/开发工具/docker-答题记录.md#docker-多阶段构建解决什么怎么写)