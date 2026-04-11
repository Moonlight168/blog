---
title: 向量数据库与 Embedding 技术全解析
date: 2026-03-07
categories: ["AI"]
tags: ["AI", "Embedding", "向量数据库", "RAG"]
---

# 向量数据库与 Embedding 技术全解析

> **术语说明**
> | 名词 | 全称 | 中文释义 |
> |------|------|----------|
> | Embedding | Embedding | 词嵌入/向量化 |
> | RAG | Retrieval-Augmented Generation | 检索增强生成 |
> | ANN | Approximate Nearest Neighbor | 近似最近邻搜索 |
> | HNSW | Hierarchical Navigable Small World | 分层可导航小世界 |
> | IVF | Inverted File Index | 倒排文件索引 |
> | PQ | Product Quantization | 乘积量化 |
> | LLM | Large Language Model | 大语言模型 |

向量数据库和 Embedding 是实现语义搜索、RAG 检索的基石。

## 一、Embedding 技术

### 1.1 什么是文本向量化

Embedding 将文本转换为向量，**语义相似的文本，在向量空间中距离更近**。

```
"猫喜欢吃鱼"  →  [0.1, -0.3, 0.8, ...]
"狗狗爱吃骨头" →  [0.2, -0.2, 0.7, ...]
"汽车正在行驶" →  [0.9, 0.5, -0.1, ...]
```

### 1.2 模型选型

**中文场景**

| 模型 | 维度 | 最大长度 | 特点 |
|------|------|----------|------|
| BGE-small-zh | 512 | 512 | 轻量级，中文优化 |
| BGE-base-zh | 768 | 512 | 平衡性能和速度 |
| BGE-large-zh | 1024 | 512 | 高精度，资源消耗大 |
| 通义千问 Embedding | 1536 | 2048 | 支持长文本 |

**英文场景**

| 模型 | 维度 | 特点 |
|------|------|------|
| all-MiniLM-L6-v2 | 384 | 速度快 |
| all-mpnet-base-v2 | 768 | 精度高 |
| text-embedding-3-small | 1536 | OpenAI 官方，多语言 |

**选型建议**

```
小型项目（< 10 万文档）→ BGE-small-zh / all-MiniLM
中型项目 → BGE-base-zh / text-embedding-3-small
大型项目/高精度 → BGE-large-zh / 专业模型
多语言 → text-embedding-3 系列 / 通义 Embedding
```

### 1.3 最佳实践

- **预处理**：去除空白特殊字符、统一大小写、保持 256-512 tokens
- **批量处理**：使用批量 API、注意速率限制、添加重试
- **版本管理**：记录模型版本、升级需重新向量化、不同模型向量不兼容

## 二、向量数据库选型

### 2.1 核心功能

向量存储、相似度搜索（ANN）、元数据过滤、水平扩展、持久化

### 2.2 主流向量数据库对比

| 数据库 | 优点 | 缺点 | 适用场景 |
|--------|------|------|----------|
| **Chroma** | 轻量级，开箱即用 | 不适合大规模数据 | 开发测试、小型知识库 |
| **PGVector** | 与 PG 无缝集成，支持 SQL | 性能略低于专用数据库 | 已有 PG 技术栈 |
| **Milvus** | 专业向量数据库，支持十亿级 | 部署复杂 | 大规模向量检索 |
| **Qdrant** | Rust 编写，性能优异 | 社区相对较小 | 高并发检索 |
| **Pinecone** | 全托管服务，免运维 | 成本较高 | 免运维需求 |
| **Weaviate** | 支持混合搜索，模块丰富 | 资源消耗较大 | 需要混合搜索 |

### 2.3 选型决策树

```
是否需要免运维？
├── 是 → Pinecone（云托管）
└── 否 → 是否有 PostgreSQL？
    ├── 是 → PGVector
    └── 否 → 数据规模？
        ├── 小型（< 100 万）→ Chroma / Qdrant
        ├── 中型（100 万 -1 亿）→ Qdrant / Milvus
        └── 大型（> 1 亿）→ Milvus / 分布式 Qdrant
```

## 三、向量检索技术

### 3.1 相似度度量

| 方法 | 范围 | 特点 |
|------|------|------|
| 余弦相似度 | [-1, 1] | 最常用，适合文本向量 |
| 欧几里得距离 | [0, ∞) | 直观的空间距离 |
| 点积相似度 | (-∞, ∞) | 计算最快，需要归一化 |

### 3.2 近似最近邻搜索（ANN）

ANN（Approximate Nearest Neighbor，近似最近邻搜索）通过牺牲少量精度换取数量级的性能提升。

**常见算法**：
- **HNSW**（Hierarchical Navigable Small World，分层可导航小世界）
- **IVF**（Inverted File Index，倒排文件索引）
- **PQ**（Product Quantization，乘积量化）

### 3.3 混合搜索

结合向量搜索和关键词搜索：

```
最终分数 = α × 向量相似度 + (1-α) × 关键词匹配度
```

适用：精确匹配术语、专业领域文档检索

## 四、RAG 中的向量应用

### 4.1 典型架构

```
用户提问 → Embedding → 问题向量 → 向量检索 → Top K 片段 → 组装 Prompt → LLM 生成答案
```

### 4.2 分块大小对检索的影响

| 分块大小 | 优点 | 缺点 |
|----------|------|------|
| 小块（< 200 字） | 精确匹配 | 可能丢失上下文 |
| 中块（200-500 字） | 平衡精确和上下文 | 需要更多存储 |
| 大块（> 500 字） | 上下文完整 | 检索精度下降 |

**推荐策略**：小块存储，检索时扩展上下文（父子文档检索）

### 4.3 检索优化技巧

- **Query 改写**：同义词扩展、添加领域关键词
- **多路召回**：多个 Embedding 模型、不同分块策略并行检索
- **重排序（Re-rank）**：初步检索扩大召回（Top 50）、使用精排模型重新排序

## 五、本地私有化部署

### 5.1 Ollama 部署方案

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 下载模型
ollama pull nomic-embed-text    # Embedding
ollama pull qwen2.5:7b          # LLM
```

### 5.2 推荐模型组合

| 配置 | Embedding | LLM |
|------|-----------|-----|
| 轻量级（8GB） | nomic-embed-text | Phi-3.5-mini / Qwen2.5-1.5B |
| 中等级（16GB） | BGE-m3 | Qwen2.5-7B / Llama3.1-8B |
| 高性能（32GB+） | 多模型组合 | DeepSeek-R1 / Qwen2.5-32B |

## 六、性能优化

- **向量化**：批量处理（Batch Size: 32-128）、GPU 加速
- **检索**：合理设置索引参数、使用 HNSW 等高效索引
- **缓存**：缓存高频问题答案、缓存 Query 向量结果

## 七、总结

向量数据库和 Embedding 是 AI 应用的基础设施。建议从轻量级方案（如 Chroma 或 PGVector）起步，根据业务发展逐步升级。
