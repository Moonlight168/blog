---
title: 'FastAPI + Pydantic2 踩坑记：ForwardRef 未解析问题'
date: 2026-04-07
categories: ["bug"]
tags: ["FastAPI", "Pydantic", "Python"]
---

# Bug 博客：FastAPI + Pydantic2 踩坑记

## 问题描述
在 FastAPI 接口中使用 Pydantic2 模型作为请求体时，启动项目报错 **`ForwardRef` 未解析**，错误触发点指向 `Body(default=ChatRequestDTO())`。

## 报错原因
1. **错误写法触发提前实例化**
   代码中使用了冗余写法：
   ```python
   async def chat(body: ChatRequestDTO = Body(default=ChatRequestDTO()))
   ```
   Python 函数默认值会在**项目启动时**就执行 `ChatRequestDTO()` 创建实例。

2. **Pydantic2 解析机制限制**
   若 DTO 模型包含**自引用、嵌套模型、字符串类型注解**，Pydantic2 不会一次性完成解析，会保留 `ForwardRef` 延迟占位符。
   启动时提前实例化 → 模型未解析完成 → 直接报错。

3. **冗余代码无意义**
   `Body(...)` 是多余写法：FastAPI 会自动识别 Pydantic 模型为请求体，无需手动声明。

## 解决方案（最优解）
**删除所有冗余的 `Body(default=...)`，直接使用标准写法**：
```python
# 正确代码（简洁、无bug、官方推荐）
async def chat(payload: ChatRequestDTO):
```

## 备选方案（仅特殊场景使用）
若必须设置默认值，**不要实例化模型**，传递类本身，并强制解析：
```python
# 1. 接口参数写法
async def chat(body: ChatRequestDTO = Body(default=ChatRequestDTO)):

# 2. DTO 末尾添加强制解析
class ChatRequestDTO(BaseModel):
    # 字段定义
    pass
ChatRequestDTO.model_rebuild()  # 强制解析所有延迟类型
```

## 核心总结
1. **FastAPI 中，Pydantic 模型直接作为参数即可自动解析请求体**，无需 `Body()` 包装；
2. **禁止用 Pydantic 实例作为函数默认值**，会导致启动时提前实例化触发解析bug；
3. `model_rebuild()` 是应急方案，**标准写法才是根治办法**。

---

### 一句话口诀
**模型直接写，别包Body()；默认不传实例，启动不报错！**
