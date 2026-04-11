---
title: LangChain 面试题
icon: chain
---

# LangChain 面试题

## LangChain 是什么？

LangChain 是一个用于开发由语言模型驱动的应用程序的框架，提供模块化组件和工具链。

核心能力：
1. **Model I/O** - 统一的 LLM 接口和 Prompt 管理
2. **Retrieval** - RAG 检索增强生成支持
3. **Agents** - 工具调用和任务规划
4. **Callbacks** - 执行追踪和监控

## LangChain 的核心组件有哪些？

1. **Prompts** - 提示词模板，支持变量替换和组合
2. **LLMs** - 大语言模型抽象，支持多种提供商
3. **Chains** - 多个组件的有序组合
4. **Agents** - 基于 LLM 的决策引擎
5. **Memory** - 对话历史管理
6. **Retrievers** - 文档检索
7. **Vector Stores** - 向量数据库

## 什么是 Chain？如何使用？

Chain 是多个组件的顺序组合，用于实现复杂任务。

基本使用：
```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

prompt = PromptTemplate(
    input_variables=["topic"],
    template="请用一句话解释{topic}"
)
chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run(topic="机器学习")
```

## LangChain 中的 Agent 是什么？

Agent 是使用 LLM 来决定执行顺序的工具调用系统。

核心要素：
1. **Agent** - 决策引擎，决定下一步做什么
2. **Tools** - 可执行的函数（搜索、计算器等）
3. **Executor** - 执行 Agent 决策并返回结果

## 什么是 Function Calling？

Function Calling 让 LLM 能够调用外部函数获取实时信息。

工作流程：
1. 定义函数描述（名称、参数、功能）
2. LLM 根据上下文决定是否调用及参数
3. 执行函数并返回结果给 LLM
4. LLM 生成最终响应

## LangChain 如何实现 RAG？

RAG（检索增强生成）流程：

1. **文档加载** - DocumentLoader 读取文件
2. **文本分割** - TextSplitter 分块处理
3. **向量化** - Embeddings 生成向量
4. **存储** - VectorStore 持久化
5. **检索** - 用户提问时语义检索相关片段
6. **生成** - LLM 基于检索内容生成回答

## 常用的 DocumentLoader 有哪些？

1. **TextLoader** - 纯文本文件
2. **PDFLoader** - PDF 文档
3. **WebBaseLoader** - 网页爬取
4. **CSVLoader** - CSV 表格数据
5. **DirectoryLoader** - 整个目录

## TextSplitter 的作用是什么？

TextSplitter 将长文本切分成小片段，便于向量和检索。

常用策略：
1. **RecursiveCharacterTextSplitter** - 递归字符分割
2. **CharacterTextSplitter** - 简单字符分割
3. **TokenTextSplitter** - 按 Token 数量分割

## VectorStore 有哪些常见实现？

1. **FAISS** - Facebook 开源，内存/本地存储
2. **Chroma** - 轻量级向量数据库
3. **Pinecone** - 托管云服务
4. **PGVector** - PostgreSQL 扩展
5. **Milvus** - 分布式向量数据库

## LangChain Memory 有哪些类型？

1. **ConversationBufferMemory** - 完整历史
2. **ConversationBufferWindowMemory** - 滑动窗口
3. **ConversationSummaryMemory** - 摘要压缩
4. **ConversationSummaryBufferMemory** - 摘要 + 窗口

## 如何创建自定义 Tool？

```python
from langchain.tools import tool

@tool
def search(query: str) -> str:
    """搜索最新信息"""
    return perform_search(query)
```

关键点：
1. 使用 `@tool` 装饰器
2. 提供清晰的函数描述
3. 定义明确的参数类型

## LangChain 的 Callback 系统有什么用？

Callback 用于追踪和监控 LLM 应用执行。

应用场景：
1. **日志记录** - 记录 Prompt 和响应
2. **性能监控** - 统计 Token 使用和时间
3. **调试** - 查看中间执行步骤
4. **审计** - 合规性记录

## LangChain 的主要缺点有哪些？

1. **版本迭代快** - API 不稳定
2. **抽象层级多** - 学习曲线陡峭
3. **调试复杂** - 多层封装难以追踪
4. **Python 依赖** - Java 等语言支持较弱
