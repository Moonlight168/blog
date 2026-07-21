jin

# 🌱 个人技术学习笔记

一个面向后端开发与系统原理的个人学习笔记站，用来沉淀日常学习过程、整理知识点、跟踪前沿技术。

## ✨ 关于这个站点

这是我在学习与项目实践中持续维护的一份笔记，面向和我一样在成长路上的后端开发者。

- 🆓 **完全免费**：所有内容开放访问，无任何付费门槛
- 🧠 **学习导向**：以学习路径为主线，按主题整理知识与思考
- 🛰️ **前沿跟踪**：关注 AI Agent、LLM 应用、微服务等方向的新进展
- 🛠️ **实战沉淀**：每篇笔记尽量与真实项目或真实场景挂钩
- 📱 **易于访问**：基于 VuePress-hope 构建，支持本地运行与在线访问

## 📋 内容结构

### 学习主线

- **Java基础**：新特性、String类、关键字、反射、序列化等
- **JVM**：内存模型、GC算法、类加载机制等
- **多线程**：并发集合、线程池、锁机制等
- **分布式**：全局唯一ID、分布式锁、微服务架构等
- **数据库**：MySQL、Redis、MongoDB等
- **前端开发**：HTML、CSS、JavaScript、Vue、React等
- **操作系统**：进程管理、内存管理、文件系统等
- **计算机网络**：TCP/IP、HTTP、网络安全等
- **算法与设计**：常见算法、数据结构、设计模式等

### 主题延伸

- **开发工具**：Git、Linux、Docker、Kubernetes等
- **框架**：Spring、Spring Boot、MyBatis、Spring Cloud等
- **软件设计**：DDD、高可用、高可靠设计等
- **AI 与 Agent**：Spring AI、LangGraph、Dify、LLM 应用等

## 🚀 使用方法

### 在线访问

直接访问现成的部署网站：

🔗 **https://codebyggbond.dpdns.org/**

### 本地运行（可选）

如果需要本地开发或构建，可以按照以下步骤操作：

#### 环境要求

- Node.js >= 20.19.0（推荐 22+ 或 24+ 启用内置 `node:sqlite`）

#### 运行步骤

```bash
 __init__.py# 安装依赖
npm install

# 初始化 SQLite 数据库（首次或重建时执行）
npm run db:init

# 启动开发服务器
npm run docs:dev
```

访问 http://localhost:8888 查看效果

## 💼 Offer 投递管理子系统

本站内置一个个人校招岗位管理仪表盘，访问 `/private/hires/` 即可使用。

### 数据存储

- 位置：`data/applications.db`（SQLite，git 忽略）
- 表结构：`data/schema.sql`
- 统一读写 API：`data/jobs-store.mjs`

### 数据库操作

```bash
# 建库（首次或重建,会自动备份旧库到 .bak.*）
npm run db:init
```

### 岗位拉取（mmx-cli + mmx text chat）

```bash
# 完整流程：搜索企业类型 → AI 提炼候选企业 → 搜招聘页 → AI 提炼岗位 → 入库
npm run fetch:jobs

# 只跑到"候选企业"阶段,查看 AI 找到了哪些公司（不搜岗位、不写库）
npm run fetch:jobs -- --phase company

# 只预览,不写库（搜索 + 提炼,完整跑但不入库）
npm run fetch:jobs -- --dry-run

# 限制处理数量（开发调试用,例如只处理前 50 条搜索结果）
npm run fetch:jobs -- --limit 50

# 组合使用:只跑候选企业 + 预览
npm run fetch:jobs -- --phase company -- --dry-run
```

### 定时任务（Windows）

```powershell
# 以管理员身份运行 PowerShell,注册凌晨 04:00 自动拉取
cd F:\MyBlogSite\vuepress-theme-hope\my-docs
.\scripts\setup-task-scheduler.ps1

# 查看任务
Get-ScheduledTask -TaskName "OfferJobsFetch"

# 删除任务
Unregister-ScheduledTask -TaskName "OfferJobsFetch" -Confirm:$false
```

## 🤝 贡献指南

欢迎大家参与贡献，共同完善这份学习笔记！

### 贡献流程说明

如果你想为项目添加内容或修复问题，请按照以下步骤操作：

1. **Fork 仓库**：访问原项目的 GitHub 页面，点击右上角「Fork」按钮，将项目复制到你的 GitHub 账号下（生成你的独立远程副本）。
2. **克隆 Fork 副本到本地**：将你账号下的 Fork 仓库（远程副本）下载到本地电脑，便于开发：
   ```bash
   git clone https://github.com/你的GitHub账号/项目仓库名.git
   ```
3. **进入本地仓库目录**：
   ```bash
   cd 项目仓库名
   ```
4. **提交更改**：完成代码修改后，先将文件添加到暂存区，再提交并补充清晰的描述（说明修改目的、内容）：
   ```bash
   git add .  # 提交所有修改文件（也可指定单个文件：git add 文件名）
   git commit -m "feat: 新增用户查询接口，支持分页参数"  # 按规范填写提交信息（feat/fix/docs等前缀）
   ```
5. **推送更改到你的 Fork 仓库**：将本地修改直接推送到你 GitHub 账号下的 Fork 远程仓库（默认推送到 main 分支）：
   ```bash
   git push origin main
   ```
6. **发起 Pull Request（PR）**：
   - 访问原项目的 GitHub 页面，点击顶部「Pull requests」→「New pull request」；
   - 在对比页面，选择「base repository」为原项目仓库、「base」为目标分支（main）；
   - 选择「head repository」为你的 Fork 仓库、「compare」为你推送的分支（通常为 main）；
   - 填写 PR 标题和描述（说明修改内容、解决的问题），点击「Create pull request」完成发起。

### 注意事项

- 贡献内容必须符合项目的主题和风格
- 确保你的修改不会破坏现有功能
- 为你的修改添加清晰的描述信息
- 如果你不确定如何修改，可以先创建 Issue 进行讨论

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议，允许自由使用、修改和分发。

## 📌 声明

本项目所有内容均为免费开放，不存在任何形式的付费内容。这里是我个人在学习与项目实践中沉淀的技术笔记，希望对同样在成长路上的开发者有所帮助。

---

✨ 欢迎一起交流学习，共同进步！
