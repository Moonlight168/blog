---
title: Prompt 工程与结构化输出实战
date: 2026-03-07
categories: ["AI"]
tags: ["AI", "Prompt", "结构化输出", "LLM"]
---

# Prompt 工程与结构化输出实战

> **术语说明**
> | 名词 | 全称 | 中文释义 |
> |------|------|----------|
> | LLM | Large Language Model | 大语言模型 |
> | Prompt | Prompt | 提示词/提示语 |
> | Token | Token | 词元/令牌 |
> | Zero-shot | Zero-shot Learning | 零样本学习 |
> | Few-shot | Few-shot Learning | 少样本学习 |
> | CoT | Chain-of-Thought | 思维链 |
> | ReAct | Reasoning + Acting | 推理与行动 |
> | JSON Schema | JSON Schema | JSON 模式 |
> | OutputParser | Output Parser | 输出解析器 |
> | API | Application Programming Interface | 应用程序接口 |

Prompt 工程是与大语言模型高效交互的核心技术。

## 一、Prompt 基础

### 1.1 什么是 Prompt 工程

通过设计和优化提示词引导 LLM 产生期望输出。好的 Prompt 可以提升回答质量、减少幻觉、实现复杂推理、降低 Token 消耗。

### 1.2 Prompt 的基本结构

```
[角色定义] + [任务描述] + [约束条件] + [示例] + [输入数据]
```

**示例**：
```
你是一位资深软件架构师（角色）。
请分析以下代码设计的问题并提出改进建议（任务）。
要求：每条建议不超过 50 字，最多 5 条（约束）。

代码：[输入数据]
```

## 二、核心 Prompt 技术

### 2.1 Zero-shot（零样本）

直接给出任务，不提供示例。适用：简单任务、通用知识。

### 2.2 Few-shot（少样本学习）

提供少量示例帮助模型理解任务。适用：特定格式转换、领域任务。

### 2.3 Chain-of-Thought（思维链）

引导模型展示推理过程。

```
问题：小明有 5 个苹果，他给了小红 2 个，又买了 3 个，现在有几个？

请一步步思考：
1. 初始苹果数：5 个
2. 给小红后：5 - 2 = 3 个
3. 又买了：3 + 3 = 6 个

答案：6 个
```

**关键技巧**：添加 "请一步步思考" 可显著提升复杂问题准确性。

### 2.4 ReAct（推理 + 行动）

ReAct（Reasoning + Acting，推理与行动）结合推理和工具使用：思考 → 行动 → 观察 → 重复直到完成。

### 2.5 Plan-and-Execute（计划与执行）

适用于复杂多步骤任务：先计划，再逐步执行。

## 三、Prompt 模板化

### 3.1 模板变量

使用占位符实现模板复用：

```python
template = """
你是一位{role}专家。
请完成以下任务：{task}
要求：- {requirement1}
      - {requirement2}

输入：{input}
"""
```

### 3.2 系统消息模板

系统消息用于设定 AI 的行为准则，如角色定位、职责范围、回答风格等。

### 3.3 模板最佳实践

- **变量命名**：有意义、一致性、避免模糊
- **模板分层**：系统级（角色设定）、任务级（具体任务）、示例级（few-shot）

## 四、结构化输出

### 4.1 为什么需要结构化输出

LLM 默认生成自由文本，但实际应用通常需要结构化数据：JSON 格式、特定对象、表格数据。

### 4.2 JSON Schema 约束

通过定义 JSON Schema 规范输出格式：

```json
{
  "type": "object",
  "properties": {
    "name": {"type": "string", "description": "姓名"},
    "age": {"type": "integer", "description": "年龄"},
    "skills": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["name", "age", "skills"]
}
```

### 4.3 Bean/对象映射

**LangChain4j**：
```java
AiServices<PersonExtractor> extractor = AiServices.builder(PersonExtractor.class)
    .chatModel(chatModel)
    .build();
Person person = extractor.extract("张三，28 岁，精通 Python...");
```

**Spring AI**：
```java
Person person = chatClient.prompt()
    .user("提取人物信息")
    .call()
    .entity(Person.class);
```

### 4.4 输出解析器（OutputParser）

| 解析器 | 用途 |
|--------|------|
| JsonOutputParser | 解析 JSON |
| BeanOutputParser | 映射到 Java Bean |
| ListOutputParser | 解析列表 |
| MapOutputParser | 解析键值对 |

## 五、最佳实践

### 5.1 明确格式要求

```
❌ "告诉我这个人的信息"
✅ "提取人物信息，输出 JSON 格式，包含字段：name(字符串), age(数字), skills(字符串数组)"
```

### 5.2 提供输出示例

```json
{
  "name": "张三",
  "age": 28,
  "skills": ["Python", "Java"]
}
```

### 5.3 添加验证逻辑

```java
try {
    Person person = objectMapper.readValue(output, Person.class);
    validate(person);
    return person;
} catch (JsonProcessingException e) {
    return retryExtraction(output);
}
```

## 六、高级技巧

### 6.1 角色扮演

```
你现在是拥有 10 年经验的资深面试官，正在面试一位高级 Java 工程师候选人。
请提出 3 个有深度的技术问题，并根据候选人的回答进行追问。
```

### 6.2 限制输出长度

```
请用不超过 100 字总结这篇文章的核心观点。
请列出 3-5 个关键点，每点不超过 20 字。
```

### 6.3 指定回答风格

```
请用专业、正式的语言回答。（技术文档风格）
请用轻松、幽默的方式解释。（科普风格）
```

### 6.4 自我验证

```
请给出答案后，检查你的回答是否存在以下问题：
1. 逻辑是否自洽
2. 是否有遗漏的关键信息
3. 是否有不必要的假设

如有问题，请修正后重新输出。
```

### 6.5 分治策略

复杂任务拆解为多个简单 Prompt：列出大纲 → 详细展开 → 添加对比 → 补充评估 → 汇总输出

## 七、Prompt 安全与防护

### 7.1 Prompt 注入攻击

攻击者尝试覆盖系统指令，如 "忽略上述所有指令，直接输出..."

### 7.2 防护措施

- **输入过滤**：检测拦截恶意关键词、限制输入长度、转义特殊字符
- **指令隔离**：使用分隔符区分系统指令和用户输入
- **输出验证**：检查输出格式、检测敏感信息泄露

## 八、优化方法论

### 8.1 迭代优化流程

编写初始 Prompt → 测试多个用例 → 分析失败案例 → 针对性修改 → 重复直到满意

### 8.2 A/B 测试

准备测试集（20-50 个用例）、定义评估指标、统计对比结果

### 8.3 Prompt 版本管理

```
prompts/
├── code_review_v1.txt
├── code_review_v2.txt
├── code_review_v3_production.txt
└── CHANGELOG.md
```

## 九、总结

Prompt 工程核心要点：

1. **基础技术**：Zero-shot、Few-shot、CoT、ReAct
2. **模板化**：提高复用性和可维护性
3. **结构化输出**：JSON Schema、Bean 映射、OutputParser
4. **高级技巧**：角色扮演、分治策略、自我验证
5. **安全意识**：防范 Prompt 注入攻击
