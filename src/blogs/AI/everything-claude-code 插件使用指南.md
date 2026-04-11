---
title: everything-claude-code 插件使用指南
date: 2026-03-07
categories: AI
tags: [AI, 开发工具，Claude Code]
---

# everything-claude-code 插件使用指南

## 前言

`everything-claude-code` 是一套专为 Claude Code 设计的技能系统，提供开发流程规范、代码质量保障和并行开发能力。

**使用纪律：** 如果技能有 1% 可能适用，就必须调用。技能是用来遵循的，不是用来打破的。

---

## 一、核心技能分类

| 类别 | 常用技能 | 用途 |
|------|---------|------|
| **流程** | `plan`, `tdd-workflow`, `verification-loop` | 规划、TDD、验证 |
| **审查** | `code-reviewer`, `security-reviewer`, `python-review` | 代码/安全审查 |
| **测试** | `test-runner`, `e2e`, `tdd` | 测试生成执行 |
| **优化** | `code-simplifier`, `refactor-cleaner` | 代码简化清理 |
| **架构** | `backend-patterns`, `frontend-patterns` | 设计模式 |

---

## 二、Scrum+XP 模式下的并行开发

### 2.1 为什么用子 Agent

在 Scrum 迭代开发中，一个 User Story 通常包含多个独立任务。使用子 Agent 并行开发可以：

- **加快探索速度**：同时搜索多个目录/模块
- **并行执行独立任务**：多个功能点同时开发
- **保持上下文专注**：每个 Agent 专注于单一职责

### 2.2 何时使用 Agent

| 场景 | 推荐方式 |
|------|---------|
| 探索代码库（多个文件） | ✅ 使用 Explore agent |
| 单一文件修改 | ❌ 直接用工具 |
| 2+ 个独立任务 | ✅ 并行 Agent |
| 需要连续推理 | ❌ 主 Agent 处理 |

### 2.3 User Story 并行拆解示例

**场景：** "作为用户，我希望支持 GitHub 登录"

```
迭代任务拆解（可在一个 Sprint 内并行）：

┌─────────────────────────────────────────────┐
│  User Story: GitHub 登录                     │
├─────────────────────────────────────────────┤
│  Task 1: 探索现有认证模块    → Agent 1      │
│  Task 2: 设计 OAuth 流程       → Agent 2     │
│  Task 3: 实现登录接口        → Agent 3      │
│  Task 4: 编写单元测试        → Agent 4      │
│  Task 5: E2E 测试验证         → Agent 5      │
└─────────────────────────────────────────────┘
```

**并行执行：**

```bash
# 同时启动 5 个 Agent
Agent 1 (Explore):  搜索 auth 相关代码 → 返回文件列表
Agent 2 (Plan):     设计 OAuth 架构图 → 返回实现计划
Agent 3 (tdd):      实现登录接口 → 返回 PR
Agent 4 (test):     生成单元测试 → 返回覆盖率报告
Agent 5 (e2e):      创建 E2E 测试 → 返回测试视频
```

### 2.4 可用的 Agent 类型

| Agent | 用途 | 触发时机 |
|-------|------|---------|
| `Explore` | 代码库探索 | 找文件/类/函数 |
| `Plan` | 架构设计 | 复杂功能规划 |
| `test-runner` | 测试分析 | 生成/修复测试 |
| `code-reviewer` | 代码审查 | 修改后审查 |
| `security-reviewer` | 安全检查 | 认证/输入处理 |
| `general-purpose` | 通用任务 | 多步骤复杂任务 |

---

## 三、标准开发流程

### 3.1 功能开发（TDD 模式）

```
需求 → plan(计划) → tdd(测试) → 实现 → review(审查) → verification(验证)
```

**步骤：**

1. **规划**：`plan` 技能创建实现计划，等用户确认
2. **测试**：`tdd-workflow` 先写测试，覆盖率 ≥ 80%
3. **实现**：最小化实现，刚好通过测试
4. **审查**：`python-review`/`go-review` 审查代码
5. **验证**：`verification-loop` 最终检查

### 3.2 代码修改流程

```
修改代码 → code-reviewer → security-reviewer(如需要) → verification-loop
```

### 3.3 Bug 修复流程

```
发现 Bug → debugging(根因分析) → tdd(复现测试) → 修复 → 验证
```

---

## 四、代码质量保障

### 4.1 多层审查

| 审查类型 | 技能 | 检查项 |
|---------|------|--------|
| 语言审查 | `python-review`, `go-review` | 语法、风格、性能 |
| 安全审查 | `security-review` | OWASP Top 10、注入、密钥 |
| 架构审查 | `backend-patterns` | 设计模式、分层 |

### 4.2 验证闭环（Verification Loop）

提交前必须通过 `verification-loop`：

```
✓ 构建成功
✓ 无 lint 警告
✓ 测试 100% 通过
✓ 安全扫描无高危
✓ Diff 符合预期
```

### 4.3 代码优化

- `code-simplifier`：简化复杂逻辑、消除重复
- `refactor-cleaner`：删除死代码、重复代码

---

## 五、测试规范

### 5.1 TDD 要求

- 测试覆盖率 ≥ 80%
- 先测试，后实现
- 测试失败才写代码

### 5.2 语言特定规范

**Python (pytest):**
```python
def test_validate_user():
    # Arrange
    user = User(name="test")
    # Act
    result = validate_user(user)
    # Assert
    assert result.is_valid == True
```

**Go (表格驱动):**
```go
func TestCalculate(t *testing.T) {
    tests := []struct{
        name string
        input, expected int
    }{
        {"case1", 1, 2},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // 测试逻辑
        })
    }
}
```

### 5.3 E2E 测试

使用 `e2e` 技能：
- 基于 Playwright
- 自动生成测试旅程
- 截图/视频/追踪
- 隔离不稳定测试

---

## 六、技能触发速查表

| 场景 | 技能 |
|------|------|
| 新功能 | `plan` → `tdd-workflow` |
| Bug 修复 | `debugging` → `tdd` |
| 代码审查 | `code-reviewer` / `security-reviewer` |
| API 端点 | `api-design` + `security-review` |
| 数据库 | `database-reviewer` + `database-migrations` |
| 测试 | `test-runner` / `e2e` |
| 优化 | `code-simplifier` / `refactor-cleaner` |
| 构建错误 | `go-build-resolver` / `build-error-resolver` |

---

## 七、实战示例

### 7.1 添加 GitHub 登录功能

| 步骤 | 用户输入 | Claude 动作 |
|------|---------|------------|
| 1. 规划 | `/plan 添加 GitHub 登录` | 创建实现计划，等待确认 |
| 2. 探索 | `Explore: 搜索认证模块` | 返回 auth 目录结构 |
| 3. 实现 | `/tdd 实现 OAuth 回调` | 先写测试，后实现代码 |
| 4. 测试 | `/test-runner 生成单元测试` | 创建测试，覆盖率 80%+ |
| 5. 审查 | `/security-reviewer` | 检查 XSS/CSRF/密钥安全 |
| 6. 验证 | `/verification-loop` | 构建/测试/安全全通过 |

### 7.2 并行开发示例

一个 User Story 拆分为多个独立任务，同时启动多个 Agent：

```
用户：实现用户登录功能

Claude 并行调用：
- Agent 1 (Explore):  探索现有认证代码
- Agent 2 (Plan):     设计 API 接口
- Agent 3 (tdd):      实现登录逻辑
- Agent 4 (test):     生成单元测试
- Agent 5 (security): 安全检查

结果：5 个任务同时进行，10 分钟内完成
```

---

## 总结

everything-claude-code 的核心价值：

| 价值 | 体现 |
|------|------|
| **纪律性** | 技能调用是必选项 |
| **专业性** | 每种语言专属 review |
| **并行效率** | 多 Agent 同时开发 |
| **质量保障** | 测试 + 审查 + 验证闭环 |

**记住：** 在 AI 辅助下，遵循技能规范是保持代码质量的关键。

---

## 附录：常用技能命令

```bash
# 流程类
/plan              # 实现计划
/tdd               # TDD 开发
/debugging         # 系统调试

# 审查类
/code-reviewer     # 代码审查
/security-reviewer # 安全审查
/python-review     # Python 审查
/go-review         # Go 审查

# 测试类
/test-runner       # 测试执行
/e2e               # E2E 测试

# 优化类
/code-simplifier   # 代码简化
/refactor-cleaner  # 死代码清理
```
