---
title: Spring AI 面试题
icon: java
---

# Spring AI 面试题

## Spring AI 是什么？

Spring AI 是 Spring 家族的 AI 应用开发框架，为 Java 开发者提供与 LLM 交互的标准化 API。

核心特点：
1. **统一 API** - 抽象不同 LLM 提供商
2. **Spring 集成** - 与 Spring Boot 无缝集成
3. **RAG 支持** - 完整的检索增强生成方案
4. **Function Calling** - 声明式函数调用

## Spring AI 的核心组件有哪些？

1. **ChatClient** - 对话模型客户端
2. **PromptTemplate** - 提示词模板
3. **Function Callbacks** - 函数调用
4. **Vector Store** - 向量存储
5. **Document Readers** - 文档读取器

## ChatClient 如何使用？

```java
ChatClient chatClient = ChatClient.builder(openAiChatModel).build();

String response = chatClient.prompt()
    .user("解释什么是机器学习")
    .call()
    .content();
```

## Spring AI 如何实现 Function Calling？

1. 定义 Java 方法并使用 `@Tool` 注解
2. 注册到 FunctionCallback
3. ChatClient 自动识别并调用

```java
@Tool(description = "搜索最新信息")
public String search(String query) {
    return searchService.search(query);
}
```

## 什么是 RAG（检索增强生成）？

RAG 是通过检索外部知识库来增强 LLM 回答质量的技术。

流程：
1. 文档加载 → 2. 文本分块 → 3. 向量化
4. 存储到向量数据库
5. 用户提问时检索相关片段
6. LLM 基于检索内容生成回答


## TextSplitter 的作用是什么？

TextSplitter 将长文档切分成小片段，便于向量和检索。

常用实现：
1. **TokenTextSplitter** - 按 Token 数分割
2. **RecursiveTextSplitter** - 递归分割
3. **DelimiterTextSplitter** - 按分隔符分割

## Spring AI 如何配置模型？

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o
          temperature: 0.7
```

## PromptTemplate 如何使用？

```java
PromptTemplate template = new PromptTemplate(
    "请用{language}解释{concept}"
);

Map<String, Object> params = Map.of(
    "language", "Java",
    "concept", "多态"
);

Prompt prompt = template.create(params);
```

## Spring AI 的 Retry 机制如何实现？

使用 Spring Retry 配置：

```java
@Bean
@Retryable(
    retryFor = ApiException.class,
    maxAttempts = 3,
    backoff = @Backoff(delay = 1000)
)
public String chat(String input) {
    return chatClient.prompt(input).call().content();
}
```

## Spring AI 相比 LangChain Java 的优势？

1. **Spring 生态** - 与 Spring Boot 无缝集成
2. **类型安全** - Java 静态类型检查
3. **生产就绪** - 监控、重试、熔断
4. **学习曲线** - Java 开发者更熟悉

## Spring AI 适合什么场景？

1. **Java 技术栈** - 团队熟悉 Spring
2. **企业应用** - 需要生产级特性
3. **RAG 应用** - 知识库问答
4. **多模型路由** - 需要切换提供商

## Spring AI 的 Maven 依赖是什么？

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    <version>1.0.0-M6</version>
</dependency>
```