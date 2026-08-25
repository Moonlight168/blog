---
title: Tool/Function Calling 技术详解
date: 2026-03-07
categories: ["AI"]
tags: ["AI", "Function Calling", "Tool", "LLM"]
---

# Tool/Function Calling 技术详解

> **术语说明**
> | 名词 | 全称 | 中文释义 |
> |------|------|----------|
> | LLM | Large Language Model | 大语言模型 |
> | Function Calling | Function Calling | 函数调用 |
> | Tool | Tool | 工具 |
> | API | Application Programming Interface | 应用程序接口 |
> | ReAct | Reasoning + Acting | 推理与行动 |
> | RAG | Retrieval-Augmented Generation | 检索增强生成 |
> | Schema | Schema | 模式/架构 |

Function Calling 让 LLM 能够调用外部函数获取实时信息或执行操作。

## 一、什么是 Function Calling

### 1.1 核心概念

Function Calling 是 LLM 理解可用函数定义，并决定调用哪个函数返回结构化请求的能力。

```
用户提问 → LLM 分析 → 调用工具 → 执行函数 → 返回结果 → 生成回答
```

### 1.2 应用场景

| 场景 | 示例 |
|------|------|
| 获取实时信息 | 天气、股票、新闻、航班 |
| 执行操作 | 发邮件、创建日程、数据库查询 |
| 计算处理 | 数学计算、代码执行、数据处理 |

### 1.3 与传统 API 调用的区别

| 传统 API | Function Calling |
|----------|------------------|
| 硬编码调用逻辑 | LLM 自主决定 |
| 固定参数传递 | 自然语言提取 |
| 单一用途 | 多工具智能选择 |

## 二、工作原理

### 2.1 基本流程

1. 定义工具（名称、描述、参数 schema）
2. 将工具定义发送给 LLM
3. 用户提问
4. LLM 决定是否调用工具
5. 返回工具名称和参数
6. 执行函数
7. 将结果返回给 LLM
8. LLM 生成最终回答

### 2.2 工具定义示例

```json
{
  "name": "get_weather",
  "description": "获取指定城市的当前天气",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {"type": "string", "description": "城市名称"},
      "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
    },
    "required": ["city"]
  }
}
```

## 三、LangChain4j 实现

### 3.1 @Tool 注解

```java
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.P;

public class WeatherTools {

    @Tool("获取指定城市的当前天气")
    public String getWeather(
        @P("城市名称") String city,
        @P("温度单位") String unit
    ) {
        return weatherService.getWeather(city, unit);
    }
}
```

### 3.2 注册工具

```java
ChatModel chatModel = OpenAiChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName("gpt-4o")
    .build();

Assistant assistant = AiServices.builder(Assistant.class)
    .chatModel(chatModel)
    .tools(new WeatherTools())
    .build();

String response = assistant.chat("北京天气怎么样？");
```

### 3.3 底层 API：ToolSpecification

```java
ToolSpecification toolSpec = ToolSpecification.builder()
    .name("search_knowledge_base")
    .description("搜索知识库")
    .addParameter("query", ToolParameters.builder()
        .type("string")
        .description("搜索关键词")
        .build())
    .build();
```

### 3.4 ToolExecutor 执行器

```java
ToolExecutor executor = (request, memoryId) -> {
    String toolName = request.name();
    Map<String, Object> args = request.argumentsAsMap();

    switch (toolName) {
        case "get_weather": return executeWeatherTool(args);
        case "search_kb": return executeSearch(args);
        default: throw new IllegalArgumentException("未知工具：" + toolName);
    }
};
```

## 四、Spring AI 实现

### 4.1 @Tool 注解

```java
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

@Component
public class WeatherService {

    @Tool(description = "获取指定城市的当前天气")
    public String getWeather(
        @ToolParam(description = "城市名称") String city
    ) {
        return weatherApiClient.getWeather(city);
    }
}
```

### 4.2 注册 Function Callback

```java
@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatModel chatModel, WeatherService weatherService) {
        ToolCallbackProvider toolProvider = MethodToolCallbackProvider.builder()
            .toolObjects(weatherService)
            .build();

        return ChatClient.builder(chatModel)
            .defaultTools(toolProvider)
            .build();
    }
}
```

## 五、多工具协调与 ReAct 模式

### 5.1 ReAct 模式

ReAct（Reasoning + Acting，推理与行动）模式：

```
Thought: 我需要先查询天气，然后根据温度给出建议
Action: get_weather("北京")
Observation: 温度 18°C，晴天

Thought: 18°C 比较舒适，晴天需要注意防晒
Final Answer: 北京今天 18°C 晴天，建议穿薄外套，注意防晒...
```

### 5.2 多工具选择

```java
Assistant assistant = AiServices.builder(Assistant.class)
    .chatModel(chatModel)
    .tools(weatherTools, calendarTools, emailTools)
    .build();

// LLM 自动选择合适的工具
assistant.chat("帮我查一下明天北京的天气，如果下雨就提醒我带伞");
```

## 六、高级应用

### 6.1 RAG + Function Calling

结合检索和工具调用：用户询问政策 → 调用知识库搜索 → 基于检索结果生成回答

### 6.2 数据库查询工具

```java
@Tool("查询订单信息")
public String queryOrder(
    @P("订单 ID") String orderId,
    @P("查询字段") String fields
) {
    String sql = "SELECT " + fields + " FROM orders WHERE order_id = ?";
    return jdbcTemplate.queryForObject(sql, String.class, orderId);
}
```

**安全注意**：使用参数化查询、限制可查询表和字段、添加权限控制

### 6.3 API 集成工具

```java
@Tool("调用外部支付 API 进行退款")
public String refundPayment(
    @P("支付订单号") String paymentId,
    @P("退款金额") BigDecimal amount,
    @P("退款原因") String reason
) {
    return paymentApi.refund(paymentId, amount, reason);
}
```

## 七、最佳实践

### 7.1 工具设计原则

| 原则 | 说明 |
|------|------|
| 单一职责 | 每个工具只做一件事 |
| 清晰命名 | 使用描述性名称 |
| 详细文档 | 描述清楚功能和参数 |
| 错误处理 | 优雅处理错误，返回有意义的信息 |

### 7.2 安全考虑

- **权限控制**：验证操作权限
- **输入验证**：验证参数、限制范围、防止注入
- **审计日志**：记录调用者、时间、参数

### 7.3 性能优化

- **工具缓存**：缓存高频调用结果
- **超时控制**：设置执行超时，提供降级方案
- **并发限制**：限制并发调用数

## 八、总结

Function Calling 让 LLM 能够获取实时信息、执行操作、与外部系统集成。

掌握要点：
1. **工具定义**：清晰描述功能和参数
2. **框架实现**：LangChain4j 和 Spring AI 的工具注册
3. **多工具协调**：ReAct 模式、工具链编排
4. **安全与性能**：权限控制、输入验证、缓存优化
