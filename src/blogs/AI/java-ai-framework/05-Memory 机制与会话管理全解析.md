---
title: Memory 机制与会话管理全解析
date: 2026-03-07
categories: ["AI"]
tags: ["AI", "Memory", "会话管理", "LLM"]
---

# Memory 机制与会话管理全解析

> **术语说明**
> | 名词 | 全称 | 中文释义 |
> |------|------|----------|
> | LLM | Large Language Model | 大语言模型 |
> | Memory | Memory | 记忆/存储器 |
> | Token | Token | 词元/令牌 |
> | Buffer | Buffer | 缓冲区 |
> | Window | Window | 窗口 |
> | Summary | Summary | 摘要 |
> | Redis | Redis | 远程字典服务 |
> | UUID | Universally Unique Identifier | 通用唯一标识符 |

Memory 机制让 LLM 能够记住对话历史，实现有上下文的连续对话。

## 一、为什么需要 Memory

### 1.1 LLM 的无状态特性

大语言模型是**无状态**的：每次请求独立、模型不记得之前对话、需要显式提供上下文。

### 1.2 Memory 的作用

```
用户：我叫小明
AI: 你好小明，很高兴认识你！

用户：我叫什么名字？  ← 有 Memory 时
AI: 你叫小明  ← 基于上下文的正确回答
```

### 1.3 应用场景

多轮对话、任务执行、个性化服务、长期陪伴

## 二、Memory 类型

### 2.1 ConversationBufferMemory（对话缓冲记忆）

| 特点 | 说明 |
|------|------|
| 原理 | 存储完整对话历史 |
| 优点 | 实现简单、保留完整上下文 |
| 缺点 | Token 消耗随对话增长、长对话可能超出限制 |
| 适用 | 短对话、信息完整性要求高 |

### 2.2 MessageWindowChatMemory（消息窗口记忆）

| 特点 | 说明 |
|------|------|
| 原理 | 只保留最近 N 条消息 |
| 优点 | Token 消耗可控、实现简单 |
| 缺点 | 丢失早期信息 |
| 适用 | 一般对话场景、成本敏感 |

### 2.3 TokenWindowChatMemory（Token 窗口记忆）

| 特点 | 说明 |
|------|------|
| 原理 | 保留最近 N 个 Token 的消息 |
| 优点 | 精确控制 Token 使用、自动适应消息长度 |
| 缺点 | 可能切断重要信息 |
| 适用 | 需要精确控制成本 |

### 2.4 ConversationSummaryMemory（对话摘要记忆）

| 特点 | 说明 |
|------|------|
| 原理 | 使用 LLM 将历史对话压缩为摘要 |
| 优点 | 大幅减少 Token 使用、保留关键信息 |
| 缺点 | 可能丢失细节、需要额外 LLM 调用 |
| 适用 | 长对话、信息密度低 |

### 2.5 混合记忆策略

```
混合策略 = 摘要记忆 + 最近 N 条消息

摘要：用户想订 3 月 15 日去北京的机票（50 tokens）
最近消息：[最后 3 条对话]（300 tokens）

总计：350 tokens，既保留关键信息又有最近上下文
```

## 三、LangChain4j Memory 实现

### 3.1 ChatMemory 接口

```java
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;

// 消息窗口记忆
ChatMemory memory = MessageWindowChatMemory.withMaxMessages(10);
```

### 3.2 在 AiServices 中使用

```java
Assistant assistant = AiServices.builder(Assistant.class)
    .chatModel(chatModel)
    .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
    .build();

// 多轮对话
String response1 = assistant.chat("你好，我叫小明");
String response2 = assistant.chat("我叫什么名字？");
```

### 3.3 多用户 Memory 管理

使用 `@MemoryId` 区分不同用户：

```java
interface Assistant {
    String chat(@MemoryId String userId, @UserMessage String message);
}

Assistant assistant = AiServices.builder(Assistant.class)
    .chatModel(chatModel)
    .chatMemoryProvider(userId ->
        MessageWindowChatMemory.builder()
            .id(userId)
            .maxMessages(10)
            .build()
    )
    .build();

// 不同用户独立记忆
assistant.chat("user1", "我喜欢苹果");
assistant.chat("user2", "我喜欢香蕉");
```

### 3.4 持久化 Memory

```java
public class DatabaseChatMemoryStore implements ChatMemoryStore {

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        return repository.findByUserId((String) memoryId)
            .stream()
            .map(this::toChatMessage)
            .collect(Collectors.toList());
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        repository.saveAll(userId, messages);
    }

    @Override
    public void deleteMessages(Object memoryId) {
        repository.deleteByUserId((String) memoryId);
    }
}
```

### 3.5 手动管理 Memory

```java
ChatMemory memory = MessageWindowChatMemory.withMaxMessages(10);

// 添加消息
memory.add(UserMessage.userMessage("你好"));
memory.add(AiMessage.aiMessage("你好！有什么可以帮你？"));

// 获取历史
List<ChatMessage> history = memory.messages();

// 清空
memory.clear();
```

## 四、Spring AI Memory 实现

### 4.1 ChatMemoryAdvisor

Spring AI 使用 Advisor 模式：

```java
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;

ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(
        MessageChatMemoryAdvisor.builder(new InMemoryChatMemory()).build()
    )
    .build();
```

### 4.2 对话 ID 管理

```java
String conversationId = UUID.randomUUID().toString();

chatClient.prompt()
    .advisors(a -> a.param("conversationId", conversationId))
    .user("你好，我叫小明")
    .call()
    .content();

// 后续对话使用相同 conversationId
```

### 4.3 自定义 ChatMemory

```java
@Component
public class RedisChatMemory implements ChatMemory {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    public List<ChatMemoryMessage> get(String conversationId, int lastN) {
        String key = "chat_memory:" + conversationId;
        List<String> messages = redisTemplate.opsForList().range(key, -lastN, -1);
        return messages.stream().map(this::deserialize).collect(Collectors.toList());
    }

    @Override
    public void add(String conversationId, List<ChatMemoryMessage> messages) {
        String key = "chat_memory:" + conversationId;
        for (ChatMemoryMessage message : messages) {
            redisTemplate.opsForList().rightPush(key, serialize(message));
        }
    }

    @Override
    public void evict(String conversationId) {
        redisTemplate.delete("chat_memory:" + conversationId);
    }
}
```

## 五、最佳实践

### 5.1 选择合适的 Memory 类型

```
是否需要长期记忆（> 10 轮对话）？
├── 否 → MessageWindowChatMemory（窗口 5-10 条）
└── 是 → 是否需要精确控制成本？
    ├── 是 → TokenWindowChatMemory
    └── 否 → ConversationSummaryMemory 或混合策略
```

### 5.2 窗口大小建议

| 场景 | 推荐配置 |
|------|----------|
| 简单问答 | 4-6 条消息 |
| 客服对话 | 8-12 条消息 |
| 任务执行 | 10-20 条消息 |
| 情感陪伴 | 摘要 + 最近 10 条 |

### 5.3 Token 预算控制

```java
int tokenBudget = 2000;    // 总预算
int systemPromptTokens = 200;
int maxOutputTokens = 500;
int availableForMemory = tokenBudget - systemPromptTokens - maxOutputTokens;
// 1300 tokens 可用于对话历史
```

### 5.4 重要信息提取

```java
public class UserProfile {
    private String name;
    private String preferences;
    private List<String> pastOrders;
}

// 在对话过程中更新用户画像
if (message.contains("我叫")) {
    String name = extractName(message);
    userProfile.setName(name);
}
```

### 5.5 Memory 清理策略

```java
// 定时清理
@Scheduled(cron = "0 0 2 * * *")
public void cleanupExpiredMemories() {
    LocalDateTime threshold = LocalDateTime.now().minusDays(30);
    memoryRepository.deleteByLastAccessTimeBefore(threshold);
}

// 用户主动清除
public void clearUserMemory(String userId) {
    memoryStore.deleteMessages(userId);
}
```

## 六、高级话题

### 6.1 长短期记忆结合

```
短期：MessageWindow（最近 10 条）
长期：向量数据库存储重要事件
检索：根据当前对话检索相关长期记忆
```

### 6.2 记忆压缩技术

```python
def compress_memory(messages, max_tokens):
    if count_tokens(messages) <= max_tokens:
        return messages
    early_messages = messages[:-4]  # 保留最后 4 条
    summary = llm.generate(f"总结以下对话：{early_messages}")
    return [summary] + messages[-4:]
```

### 6.3 上下文管理

```java
public class ContextManager {
    public String buildContext(MemoryContext ctx) {
        StringBuilder context = new StringBuilder();
        context.append(ctx.getSystemPrompt());
        if (ctx.getUserProfile() != null) {
            context.append("用户信息：").append(ctx.getUserProfile());
        }
        context.append("对话历史：\n");
        context.append(formatMessages(ctx.getMemory().messages()));
        return context.toString();
    }
}
```

### 6.4 多会话管理

为不同场景创建独立会话：

```java
public class MultiSessionManager {
    String generalSession = createSession("general");
    String taskSession = createSession("task_execution");

    public String routeAndRespond(String userId, String message) {
        Intent intent = intentClassifier.classify(message);
        String sessionId = getSessionId(userId, intent);
        return assistant.chat(sessionId, message);
    }
}
```

## 七、调试与监控

### 7.1 Memory 内容查看

```java
List<ChatMessage> messages = memory.messages();
for (ChatMessage msg : messages) {
    System.out.println(msg.type() + ": " + msg.text());
}
```

### 7.2 Token 使用统计

```java
int totalTokens = tokenizer.estimateTokenCountInMessages(memory.messages());
metrics.record("memory_tokens", totalTokens);
```

### 7.3 监控指标

平均对话轮数、Memory Token 使用量、记忆命中率、存储成本

## 八、总结

Memory 机制核心要点：

1. **类型选择**：Buffer、Window、Summary 各有适用场景
2. **框架实现**：LangChain4j 和 Spring AI 的记忆管理
3. **多用户支持**：使用 MemoryId 区分用户
4. **持久化**：数据库或 Redis 存储历史
5. **成本优化**：合理设置窗口大小，使用摘要压缩
