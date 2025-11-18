---
title: 从0到1实现OCS脚本对接本地FastAPI服务
date: 2025-10-26
categories: ["开发工具"]
---
# 从0到1实现OCS脚本对接本地FastAPI服务

在日常学习或工作中，我们经常会遇到各类需要答题的场景，手动搜索答案不仅效率低，还容易出错。
本文将带你一步步搭建本地 FastAPI 服务，集成 **火山引擎方舟大模型**（Doubao 系列），并通过 **OCS 脚本** 实现自动答题功能。
全程覆盖：环境配置、服务开发、题库对接、API Key 管理与问题排查。

---

## 一、项目背景与核心架构

### 1. 需求场景

我们需要实现一个“自动答题系统”，核心目标包括：

* 本地搭建 API 服务，对接火山方舟大模型；
* 支持 OCS 脚本调用，实现自动识别题目并获取答案；
* 内置题库与缓存，避免重复请求模型；
* 不再依赖系统环境变量，使用 `.env` 文件管理密钥。

### 2. 系统架构

```
[OCS脚本] → [本地FastAPI服务] → [火山引擎方舟大模型]
  （识别题目）   （转发请求+缓存答案）   （生成答案）
```

---

## 二、前置准备

在开始开发前，请准备以下环境和账号：

1. **开发环境**：

    * Python 3.8+
    * pip（Python 包管理器）

2. **火山引擎账号**：

    * 注册并登录 [火山引擎控制台](https://console.volcengine.com/)
    * 激活方舟大模型（例如 `Doubao-Seed-Translation` 或 `doubao-1-5-pro-32k`）
    * 获取 `ARK_API_KEY`

3. **浏览器脚本工具**：

    * 安装油猴（Tampermonkey）或脚本猫；
    * 安装 OCS 助手脚本（[下载地址](https://greasyfork.org/zh-CN/scripts/457151-ocs-%E7%BD%91%E8%AF%BE%E5%8A%A9%E6%89%8B)）

4. **辅助工具**：

    * [JSON.cn](https://www.json.cn/)（验证 JSON 格式）
    * 浏览器 F12 开发者工具（排查接口问题）

---

## 三、第一步：搭建本地 FastAPI 服务

FastAPI 是一个高性能 Python Web 框架，用于快速开发 API。我们用它实现 “题目接收 → 模型调用 → 答案返回”。

### 1️⃣ 安装依赖

在项目目录下执行以下命令：

```bash
pip install fastapi uvicorn openai python-dotenv
```

---

### 2️⃣ 创建 `.env` 文件

在项目根目录创建 `.env` 文件，内容如下：

```
ARK_API_KEY=你的火山方舟API密钥
MODEL_NAME=Doubao-Seed-Translation
```

> ⚠️ 注意：不要加引号，键值之间不要有空格。
> 该文件将由 `python-dotenv` 自动加载。

---

### 3️⃣ 编写 `main.py`

创建 `main.py`，粘贴以下完整代码👇

```python
import os
import json
import re
import hashlib
import logging
from datetime import datetime
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from volcenginesdkarkruntime import Ark
from fastapi import Request

# ------------------------------------------------------------
# 1. 初始化日志系统
# ------------------------------------------------------------
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "app.log")

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    handlers=[
        logging.StreamHandler(),  # 控制台输出
        logging.FileHandler(LOG_FILE, mode="a", encoding="utf-8"),  # 文件输出
    ],
)
logger = logging.getLogger("OCS-API")

logger.info("🚀 日志系统已初始化")

# ------------------------------------------------------------
# 2. 环境变量加载
# ------------------------------------------------------------
load_dotenv()
ARK_API_KEY = os.getenv("ARK_API_KEY")
if not ARK_API_KEY:
    logger.critical("❌ 未检测到 ARK_API_KEY，请在 .env 文件中配置")
    raise ValueError("❌ 请在项目根目录的 .env 文件中配置 ARK_API_KEY")

MODEL_NAME = "doubao-seed-1-6-flash-250828"
CACHE_FILE = "cache.json"

# ------------------------------------------------------------
# 3. 初始化缓存
# ------------------------------------------------------------
if not os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump({}, f)

try:
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        cache = json.load(f)
except json.JSONDecodeError:
    cache = {}
    logger.warning("⚠️ cache.json 格式错误，已重置为空缓存。")

def save_cache():
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

# ------------------------------------------------------------
# 4. 缓存 Key 工具函数
# ------------------------------------------------------------
def normalize_text(text: str) -> str:
    """去除空白和符号差异"""
    if not text:
        return ""
    text = re.sub(r"\s+", "", text)
    text = text.replace("．", ".").replace("。", ".")
    text = text.replace("，", ",").replace("：", ":")
    return text.strip()

def make_cache_key(title: str, qtype: str, options=None) -> str:
    """生成稳定的MD5缓存Key"""
    norm_title = normalize_text(title)
    norm_qtype = qtype.strip().lower() if qtype else "single"
    norm_opts = [normalize_text(opt) for opt in (options or [])]
    data = f"{norm_title}|{norm_qtype}|{'|'.join(norm_opts)}"
    return hashlib.md5(data.encode("utf-8")).hexdigest()

# ------------------------------------------------------------
# 5. 统一格式化选项
# ------------------------------------------------------------
def normalize_options(options):
    if not options:
        return None

    # 如果是字符串，尝试解析 JSON
    if isinstance(options, str):
        try:
            parsed = json.loads(options)
            options = parsed
        except:
            # 普通换行分割
            return [o.strip() for o in options.split("\n") if o.strip()]

    # 如果是 dict
    if isinstance(options, dict):
        return [f"{k}. {v}" for k, v in options.items()]

    # 如果是 list
    if isinstance(options, list):
        return [str(o).strip() for o in options if str(o).strip()]

    # 其他类型
    return [str(options)]

# ------------------------------------------------------------
# 6. 初始化火山方舟客户端
# ------------------------------------------------------------
client = Ark(api_key=ARK_API_KEY, base_url="https://ark.cn-beijing.volces.com/api/v3")
logger.info("✅ 火山方舟 SDK 初始化成功")

# ------------------------------------------------------------
# 7. 构建 Prompt
# ------------------------------------------------------------
def build_prompt(title: str, qtype: str, options=None) -> str:
    """
    精简版提示词生成函数，减少tokens消耗同时保持格式约束
    """
    # 基础信息（精简题型说明）
    qtype_cn = "单选(仅1个)" if qtype == "single" else "多选(可多个)"
    prompt = f"题：{title}\n型：{qtype_cn}\n"

    # 处理选项（保留字母标识核心功能）
    if options and isinstance(options, list) and options:
        opts_text = "\n".join([f"{chr(65+i)}. {opt.strip()}" for i, opt in enumerate(options)])
        prompt += f"选：\n{opts_text}\n"

        # 核心规则（合并条目，用短句强化关键约束）
        if qtype == "single":
            prompt += "答：仅1个大写字母（如A），无其他字符/文字"
        elif qtype == "multiple":
            prompt += "答：多选项大写字母用#分隔（如A#C），无其他字符/文字"
        else:
            prompt += "答：仅输出选项字母或简洁答案，无多余内容"
    else:
        # 无选项场景（压缩字数）
        prompt += "答：简洁答案（≤50字），无解释/符号"

    return prompt


def map_ai_answer_to_options(ai_answer: str, options: list[str]) -> str:
    """
    将 AI 返回的字母答案（如 "C#D"）映射到页面选项文字。

    :param ai_answer: AI 返回的答案，可能是 "C#D", "A", 或 "B#C#D"
    :param options: 页面选项文字列表，顺序对应 A/B/C/D
    :return: 用 # 拼接的文本答案，例如 "聚合#组合"
    """
    if not ai_answer or not options:
        return ai_answer  # 如果没有选项或答案，直接返回原始

    # 支持多选，用 # 分隔
    letters = ai_answer.replace(" ", "").split("#")
    mapped = []
    for letter in letters:
        idx = ord(letter.upper()) - ord("A")
        if 0 <= idx < len(options):
            mapped.append(options[idx])
        else:
            # 超出范围，保留原值
            mapped.append(letter)
    return "#".join(mapped)


# ------------------------------------------------------------
# 8. 获取AI答案（含缓存 + 日志）
# ------------------------------------------------------------
def get_ai_answer(title: str, qtype: str, options=None):
    key = make_cache_key(title, qtype, options)

    if key in cache:
        logger.info(f"缓存命中：{title}")
        cached_answer = cache[key]["answer"]
        if options:
            return map_ai_answer_to_options(cached_answer, options)
        return cached_answer

    prompt = build_prompt(title, qtype, options)
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "system", "content": prompt}],
            temperature=0.0,
            max_tokens=50,
            stop=["。", "\n"],
            thinking={"type": "disabled"},   # 关闭模型思考（打开可提高正确率）
        )

        raw_answer = completion.choices[0].message.content
        answer = str(raw_answer).strip()

        cache[key] = {
            "title": title,
            "type": qtype,
            "options": options,
            "answer": answer,
            "time": datetime.now().isoformat(timespec="seconds"),
        }
        save_cache()
        logger.info(f"新答案已缓存：{title} → {answer}")
        # 将AI返回的答案映射到选项文字
        if qtype == "multiple":
            return map_ai_answer_to_options(answer, options)
        return answer

    except Exception as e:
        logger.exception(f"模型调用失败：{title}")
        raise e

# ------------------------------------------------------------
# 9. FastAPI 初始化
# ------------------------------------------------------------
app = FastAPI(title="OCS 自动答题 API 服务", description="支持OCS脚本 + AI答题 + 缓存 + 日志")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# 10. 接口定义
# ------------------------------------------------------------
@app.get("/search")
async def search (
    title: str = Query(..., description="题目内容（必填）"),
    type: str = Query("single", description="题目类型（默认single，可选multi）"),
    options: str = Query(None, description="题目选项（多选时用\n分隔）"),
):

    logger.info(f"接收到查询：{title}")
    logger.debug(f"选项标准化前：\n{options}")
    opts = normalize_options(options)
    logger.debug(f"选项标准化后：{opts}")

    try:
        answer = get_ai_answer(title, type, opts)
        return {"code": 1, "results": [{"question": title, "answer": answer}]}
    except Exception as e:
        logger.error(f"获取答案失败：{title} → {e}")
        return {"code": 0, "msg": f"获取答案失败: {str(e)}"}

# ------------------------------------------------------------
# 11. 启动入口
# ------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 FastAPI 服务启动中... 访问 http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)

```

---

## 四、第二步：测试接口

1. 启动服务：

   ```bash
   python main.py
   ```
2. 打开浏览器访问：

   ```
   http://localhost:8000/docs
   ```
3. 测试 `/search` 接口：

    * title: `1+1等于几？`
    * type: `single`
    * options: `A.1\nB.2\nC.3`

正常返回：

```json
{
  "code": 1,
  "results": [{"question": "1+1等于几？", "answer": "B"}]
}
```

---

## 五、第三步：配置 OCS 脚本（调用本地服务）

### OCS 题库配置示例：

```json
[
   {
      "url": "http://localhost:8000/search",
      "name": "豆包速问",
      "homepage": "http://localhost:8000",
      "method": "get",
      "contentType": "json",
      "data": {
         "title": "${title}",
         "type": "${type}",
         "options": "${options}"
      },
      "headers": {
         "Content-Type": "application/json"
      },
      "type": "fetch",
      "handler": "return (res)=>{ if(!res || !res.results) return [[undefined,'未找到答案']]; return res.results.map(i=>{ let ans = i.answer; if(Array.isArray(ans)) ans = ans.join('#'); if(typeof ans !== 'string') ans = String(ans); console.log('🧩 题目:', i.question, '→ 答案原始值:', i.answer, '→ 处理后:', ans); return [i.question, ans.trim()]; }); }"
   }
]
```

将此 JSON 粘贴到 OCS 脚本的题库配置处即可。

---

## 六、问题排查

| 错误类型       | 原因               | 解决方案                         |
| ---------- | ---------------- | ---------------------------- |
| 模型未激活      | 控制台未启用模型         | 登录火山方舟 → 启动对应模型              |
| API Key 无效 | `.env` 配置错误      | 检查 `.env` 是否在项目根目录、是否填写正确    |
| 跨域错误       | FastAPI CORS 未配置 | 确保 `allow_origins=["*"]` 已设置 |
| 模型调用失败     | 网络或权限问题          | 检查 Key 权限、终端网络、模型可用性         |

这是一个关于使用 PyInstaller 打包 Python 应用为可执行文件（.exe）的详细教程。内容涵盖了安装、基础/高级打包命令、文件获取与运行、以及常见问题解决。

以下是根据您提供的文本内容，**简化和优化布局**，并重新组织为**二级以下目录结构**的版本：

-----

## 七、打包运行（PyInstaller 教程）

### 7.1 PyInstaller 安装与验证

使用 `pip` 安装或指定版本，并进行验证。

| 操作 | 命令示例 | 备注 |
| :--- | :--- | :--- |
| **安装最新版** | `pip install pyinstaller` | 推荐使用此命令。 |
| **指定版本** | `pip install pyinstaller==6.16.0` | 适用于兼容旧项目。 |
| **验证安装** | `pyinstaller --version` | 若显示版本号（如 `6.16.0`）则成功。 |

### 7.2 打包前准备：切换至项目根目录

在执行打包命令前，必须通过 `cd` 命令切换到项目主脚本所在的文件夹。

**示例：**

```bash
# 需替换为你的项目实际路径
cd F:\MyProjects\local_api_ocs
```

### 7.3 执行打包命令（核心操作）

根据项目类型选择基础或高级打包命令。

#### 7.3.1 基础打包（单脚本 + 无额外依赖）

适用于项目仅包含一个主脚本（如 `main.py`）的场景。

```bash
pyinstaller --onefile --name DOUBAO_QA main.py
```

| 参数 | 说明 |
| :--- | :--- |
| `--onefile` | 将所有依赖打包为**单个** `.exe` 文件（推荐）。 |
| `--name DOUBAO_QA` | 指定最终生成的可执行文件名为 `DOUBAO_QA.exe`。 |
| `main.py` | 项目的**主脚本路径**（需替换为你的主文件）。 |

#### 7.3.2 高级打包（含外部文件 / 图标 / 隐藏窗口）

适用于项目涉及配置文件、数据文件、自定义图标或需要隐藏命令行窗口的场景。

**示例命令：**

```bash
pyinstaller --onefile --name DOUBAO_QA ^
--icon=app_icon.ico ^                  # 自定义程序图标（需替换为你的.ico文件路径）
--add-data "config.ini;." ^            # 打包外部文件，"."表示与.exe同目录
--add-data "data.xlsx;data" ^          # 示例：将data.xlsx打包到.exe同级的data文件夹
--noconsole ^                          # 隐藏命令行窗口（仅用于GUI项目或无须日志输出的项目）
--clean ^                              # 清理上次打包残留文件
main.py
```

> **注意：** 在 Windows 命令行中，`^` 或 PowerShell 中的 \`\` 是命令换行符。

### 7.4 获取与运行可执行文件

#### 7.4.1 查找生成的文件

打包完成后，会在项目根目录生成以下内容：

* **`dist/`**：最终可执行文件（`DOUBAO_QA.exe`）所在目录。
* **`build/`**：打包过程中的临时文件（可删除）。
* **`DOUBAO_QA.spec`**：打包配置文件（可用于修改后二次打包）。

#### 7.4.2 运行 `.exe` 文件

1.  **双击运行：** 打开 `dist/` 文件夹，双击 `DOUBAO_QA.exe`。
   * **API 服务：** 会弹出命令行窗口显示启动日志。
2.  **命令行运行（推荐排错）：** 若双击失败，进入 `dist` 目录并运行，以便查看错误日志。
    ```bash
    cd F:\MyProjects\local_api_ocs\dist
    .\DOUBAO_QA.exe
    ```

### 7.5 常见问题与解决方案

#### 7.5.1 问题 1：`pyinstaller 不是内部或外部命令`

**原因：** Python 的 `Scripts` 目录未添加到系统环境变量 `Path` 中。
**解决：**

1.  找到 Python 的 `Scripts` 目录（如 `C:\Python312\Scripts`）。
2.  进入“系统属性”→“高级”→“环境变量”。
3.  在“系统变量”→“Path”中添加上述路径。
4.  重启命令行窗口。

#### 7.5.2 问题 2：打包后缺少外部文件（如 `config.ini`）

**原因：** 未使用 `--add-data` 参数将外部文件指定打包。
**解决：** 重新打包，并补充 `--add-data` 参数（Windows 使用 `;` 分隔路径）：

```bash
# 示例：打包config.ini到.exe同级，data文件夹到data子目录
pyinstaller --onefile --name DOUBAO_QA ^
--add-data "config.ini;." ^
--add-data "data;data" ^
main.py
```

#### 7.5.3 问题 3：安装 PyInstaller 时提示 `[WinError 2] 系统找不到指定文件`

**原因：** PyInstaller 相关进程被占用或权限不足。
**解决：**

1.  打开任务管理器，结束所有 `python.exe` 和 `pyinstaller.exe` 进程。
2.  以**管理员模式**打开 PowerShell 或命令行，执行强制重装：
    ```bash
    pip install --force-reinstall pyinstaller==6.16.0
    ```

### 7.6 验证打包结果

运行 `DOUBAO_QA.exe` 后，进行功能和环境兼容性测试：

* **功能验证：**
   * API 服务：访问接口文档或指定端口（如 `http://localhost:8000/docs`），确认接口可正常调用。
   * GUI 项目：操作各功能按钮，确认无异常。
* **环境兼容性：** 将 `dist/DOUBAO_QA.exe` 复制到**其他 Windows 电脑**上运行（需保证架构一致：32/64 位），确认无需安装 Python 即可正常启动和运行。