---
title: FastAPI
date: 2026-08-24
categories: [Python]
order: 3
---

# FastAPI 面试题

## 你用过 FastAPI 吗？它跟 Flask、Django 比有什么不一样？

**锚点**：`性能高 + 开发效率高 + 定位居中：纯 API 服务首选 FastAPI`

1. **性能**：基于 Starlette + 异步，单机吞吐比 Flask 高一大截，压测差距明显
2. **开发效率**：类型注解 + Pydantic 自动校验 + OpenAPI 文档自动生成，接口文档不用单独维护
3. **生态定位**：
   - Django：一站式全家桶（ORM、Admin），适合大而全业务系统
   - Flask：极简微框架，自由但啥都要自己搭
   - FastAPI：卡在中间——轻量又有现代工程化能力（校验、文档、异步、依赖注入），做 API 服务最顺手
4. **选型经验**：纯 API 服务优先 FastAPI；要内置 Admin/ORM 全家桶才考虑 Django；极简脚本服务用 Flask

---

## FastAPI 的依赖注入（Depends）是干嘛的？你怎么用的？

**锚点**：`依赖声明成参数，框架调用时注入——连接/鉴权从业务代码抽走`

1. **用法**：写一个函数返回依赖，接口参数里用 `Depends()` 声明
2. **典型场景**：数据库 session（每请求一个、用完自动关）、当前登录用户（从 token 解析塞进去）、公共参数校验
3. **好处**：连接管理、鉴权逻辑不重复写，天然可测试——测试时直接替换依赖

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
```

最大感受：**把每个接口都要的连接/鉴权从业务代码里抽出去了**，接口函数只关心自己的逻辑。

---

## FastAPI 里 async def 和普通 def 有什么区别？什么时候用哪个？

**锚点**：`async def 走事件循环，普通 def 走线程池——别为了异步而异步`

1. **接口写 async def**：内部 `await` 异步操作（aiohttp、asyncpg、httpx），IO 等待期间让出事件循环
2. **接口写普通 def**：同步代码（requests、pymysql、CPU 密集）由 FastAPI 自动丢线程池跑，不阻塞事件循环
3. **怎么选**：IO 密集且生态支持异步 → async def；同步库、CPU 密集或操作简单 → 普通 def
4. **坑**：把同步库硬套 async def 会阻塞整个事件循环；async 函数里别写 `time.sleep`，要用 `await asyncio.sleep`

---

## FastAPI 怎么校验请求参数？校验失败会怎样？

**锚点**：`Pydantic 声明即校验：类型/必填/格式错自动 422`

1. **校验核心**：路径/查询参数用类型标注 + 默认值，请求体定义 Pydantic 模型
2. **失败行为**：类型错、必填缺失、格式不对（email、正则）自动返回 **422**，错误信息结构化，前端好处理
3. **约束扩展**：`Field(ge=0, max_length=...)`、`EmailStr`、自定义 validator；可做"双模型"——请求一个模型、响应一个模型，避免泄露内部字段

```python
class Order(BaseModel):
    user_id: int = Field(gt=0)
    amount: float = Field(ge=0)
    remark: str | None = None

@app.post("/orders")
def create(order: Order):
    return order
```

最大感受：**类型注解即文档即校验**，省掉的校验代码量很可观。

---

## FastAPI 性能为什么好？生产部署要注意什么？

**锚点**：`异步 + 框架薄 + Pydantic 是 Rust 写的；瓶颈在部署和依赖`

1. **性能来源**：全异步（Starlette 走 asyncio，IO 密集不阻塞）；路由中间件很薄；Pydantic v2 用 Rust 实现，校验序列化快好几倍
2. **生产部署**：
   - 单进程跑不满多核，用 `gunicorn -k uvicorn.workers.UvicornWorker` 多 worker
   - worker 数按同步/异步代码比例算，同步多就少进程多线程，别盲目开一堆
   - 前面挂 Nginx 做静态资源和限流；数据库连接池、慢查询才是大头

一句话：**FastAPI 性能下限很高，但生产能不能扛住，取决于部署和依赖，不取决于框架。**
