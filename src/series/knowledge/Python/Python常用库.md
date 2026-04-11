---
title: Python 常用库
date: 2026-04-06
categories: [Python]
---
# Python 常用库

## pip 和 pipx 的区别？什么时候用 pipx？

1. pip 直接把包安装到系统 Python 环境，可能导致依赖冲突
2. pipx 为每个包创建独立的虚拟环境，避免全局污染

用 pipx 的场景：命令行工具、全局安装的开发工具，如 black、flake8、httpie

## poetry 相比 pip+requirements.txt 有什么优势？

1. pyproject.toml 同时管理依赖和项目元数据，统一管理
2. poetry.lock 锁文件保证团队环境一致
3. 无需手动创建和激活虚拟环境
4. 自动处理传递依赖和冲突解析
5. 一条命令发布到 PyPI

## venv 和 conda 的区别？

- venv 是 Python 标准库，轻量级，只能隔离 Python 版本
- conda 是独立的包管理器，支持 Python 和非 Python 包，可以隔离不同 Python 版本，适合数据科学和有二进制依赖的项目

## pyproject.toml 有什么用？

1. 替代 setup.py、setup.cfg、requirements.txt
2. 定义项目元数据、依赖、构建配置
3. PEP 621 是目前推荐的标准格式

## pip 如何加速？

1. 换源：`pip install -i https://pypi.tuna.tsinghua.edu.cn/simple`
2. 永久换源：创建 pip.conf 配置文件
3. 常用国内源：清华、阿里云、腾讯云、华为云

## logging 模块怎么配置？

1. 字典配置：灵活，可从文件加载
2. fileConfig：ini 格式配置文件
3. basicConfig：快速上手

日志级别：DEBUG < INFO < WARNING < ERROR < CRITICAL

## pydantic 有什么用？

数据验证和设置管理，基于 TypeHint。FastAPI 内置使用 pydantic 做请求/响应验证。

1. **在 FastAPI 异常处理器中直接返回 Pydantic 模型**：`ResponseVO(code=400, message=str(exc), data=None)`，FastAPI 会自动序列化成 JSON，无需手动返回 `JSONResponse`

```python
class ResponseVO(BaseModel):
    code: int
    message: str
    data: dict | None = None

@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return ResponseVO(code=400, message=str(exc))  # FastAPI 自动序列化
```

## dataclasses 相比普通类有什么优势？

1. 自动生成 `__init__`、`__repr__`、`__eq__`，代码更简洁
2. 支持类型提示
3. 可定义字段默认值和默认值工厂
