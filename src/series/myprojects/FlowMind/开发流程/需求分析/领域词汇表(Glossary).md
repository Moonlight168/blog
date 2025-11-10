---
order: 8
title: 领域词汇表
---

# FlowMind 系统领域词汇表

## 1. 概述

本文档旨在定义FlowMind智能审批系统中使用的关键术语和概念，确保产品、设计、开发和测试团队对系统领域知识有一致的理解，减少沟通歧义。

## 2. 通用术语

### 2.1 系统基础术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| FlowMind | FlowMind | FlowMind | 本项目开发的智能审批系统名称，旨在通过AI技术提升审批流程效率 |
| 审批 | Shenpi | Approval | 对提交的申请进行审查、评估并做出决定的过程 |
| 申请 | Shenqing | Request | 用户向系统提交的正式请求，包括预算申请、资源申请等 |
| 流程 | Liucheng | Process/Workflow | 定义了从申请提交到完成的一系列步骤和规则 |
| 工作流 | Gongzuoliu | Workflow | 自动化执行的业务流程，包含多个环节和处理规则 |
| 任务 | Renwu | Task | 工作流中的单个操作单元，通常需要用户执行 |
| 状态 | Zhuangtai | Status | 申请或任务当前所处的处理阶段，如待审批、已通过、已驳回等 |

### 2.2 用户角色术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| 申请人 | Shenqingren | Applicant | 提交各类申请的系统用户，是审批流程的发起人 |
| 审批人 | Shenpiren | Approver | 负责审核和处理申请的系统用户，拥有审批权限 |
| 部门主管 | Bumenzhuguan | Department Manager | 负责审核部门内部申请的管理角色 |
| 财务审批人 | Caiwushenpiren | Financial Approver | 负责从财务角度审核申请的专业角色 |
| 资源审批人 | Ziyuan shenpiren | Resource Approver | 负责审核系统资源分配申请的技术角色 |
| 最终审批人 | Zuizhong shenpiren | Final Approver | 审批流程中的最后一级审批角色，拥有最终决定权 |
| 系统管理员 | Xitong guanliyuan | System Administrator | 负责系统配置、用户管理和维护的技术角色 |
| 运维人员 | Yunwei renyuan | Operations Staff | 负责系统运行维护、性能监控的技术角色 |
| LLM智能Agent | LLM zhinenng Agent | LLM Intelligent Agent | 基于大型语言模型的智能助手，辅助处理申请初审和分析 |
| 审批管理员 | Shenpi guanliyuan | Approval Administrator | 负责审批流程配置和管理的专业角色 |

## 3. 功能术语

### 3.1 申请相关术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| 预算申请 | Yusuan shenqing | Budget Request | 申请资金支持的正式请求，包含金额、用途等信息 |
| 资源申请 | Ziyuan shenqing | Resource Request | 申请系统资源（服务器、存储等）的正式请求 |
| 申请单 | Shenqingdan | Application Form | 包含申请详细信息的表单，用户填写并提交 |
| 申请状态 | Shenqing zhuangtai | Application Status | 申请当前所处的处理阶段，如待审批、审批中、已通过等 |
| 申请详情 | Shenqing xiangqing | Application Details | 申请的完整信息，包括基本信息、附件、审批历史等 |
| 附件 | Fujian | Attachment | 随申请提交的补充文件，如证明材料、预算明细等 |
| 修改申请 | Xiugai shenqing | Modify Request | 申请人对已提交但未审批的申请进行内容变更 |
| 撤销申请 | Chexiao shenqing | Cancel Request | 申请人取消已提交但未完成审批的申请 |
| 申请模板 | Shenqing moban | Application Template | 预定义的常用申请格式，可快速复用 |

### 3.2 审批相关术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| 待审批列表 | Dai shenpi liebiao | Pending Approvals List | 显示审批人需要处理的待审批任务列表 |
| 审批操作 | Shenpi caozuo | Approval Action | 审批人对申请进行的处理操作，通常包括通过、驳回、转交等 |
| 审批意见 | Shenpi yijian | Approval Comment | 审批人在处理申请时添加的说明和建议 |
| 审批历史 | Shenpi lishi | Approval History | 申请在整个审批流程中的所有处理记录 |
| 审批流程 | Shenpi liucheng | Approval Process | 从申请提交到完成的完整审批路径和规则 |
| 多级审批 | Duoji shenpi | Multi-level Approval | 需要多个审批人按顺序审核的审批流程 |
| 转交审批 | Zhuanjiao shenpi | Transfer Approval | 审批人将审批任务转交给其他有审批权限的人处理 |
| 批量审批 | Piliang shenpi | Batch Approval | 审批人同时处理多个相似申请的功能 |
| 审批通知 | Shenpi tongzhi | Approval Notification | 申请状态变更或任务分配时的系统通知 |
| 审批提醒 | Shenpi tixing | Approval Reminder | 催促审批人处理待审批任务的提醒消息 |

### 3.3 智能功能术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| 智能初审 | Zhinenng chushen | Intelligent Preliminary Review | 系统自动对申请进行的初步审核，包括信息提取和合规性检查 |
| 自动分派 | Zidong fenpai | Automatic Assignment | 系统根据规则自动将申请分派给合适审批人的功能 |
| LLM | LLM | Large Language Model | 大型语言模型，是智能处理功能的核心技术基础 |
| 审批建议 | Shenpi jianyi | Approval Suggestion | 系统基于历史数据为审批人提供的智能推荐 |
| 关键信息提取 | Guanjian xinxi tiqu | Key Information Extraction | 从申请文本中自动识别并提取重要数据点的过程 |
| 合规性检查 | Heguixing jiancha | Compliance Check | 自动验证申请是否符合企业规定和政策要求 |
| 智能分析 | Zhinenng fenxi | Intelligent Analysis | 利用AI技术对申请数据进行深度分析的过程 |
| 风险提示 | Fengxian tishi | Risk Alert | 系统识别到申请中可能存在的风险并提示审批人 |
| 模式识别 | Moshi shibie | Pattern Recognition | 识别申请中的典型模式和特征的智能功能 |

## 4. 技术术语

### 4.1 架构与集成术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| 微服务架构 | Weifuwu jiaoxing | Microservices Architecture | 系统设计方法，将应用拆分为多个独立部署的服务 |
| API | API | Application Programming Interface | 应用程序接口，系统间数据交换的标准方式 |
| RESTful API | RESTful API | RESTful Application Programming Interface | 符合REST架构风格的API设计 |
| 消息队列 | Xiaoxi duilie | Message Queue | 用于在系统组件间可靠传递消息的中间件 |
| 容器化 | Rongqihua | Containerization | 使用容器技术（如Docker）打包和部署应用 |
| 负载均衡 | Fuzai junheng | Load Balancing | 分发网络流量以提高系统性能和可靠性的技术 |
| 高可用 | Gao keyong | High Availability | 系统持续运行且几乎不中断的特性 |
| 缓存 | Huanchun | Cache | 临时存储数据以提高访问速度的机制 |
| 数据库 | Shujuku | Database | 存储和管理结构化数据的系统 |
| 对象存储 | Duixiang cunchu | Object Storage | 存储非结构化数据（如文件附件）的服务 |

### 4.2 安全术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| 身份认证 | Shenfen renzheng | Authentication | 验证用户身份的过程 |
| 授权 | Shouquan | Authorization | 确定已认证用户可访问哪些资源的过程 |
| RBAC | RBAC | Role-Based Access Control | 基于角色的访问控制，根据用户角色分配权限 |
| 加密 | Jiami | Encryption | 将数据转换为无法轻易理解的形式以保护信息安全 |
| HTTPS | HTTPS | Hypertext Transfer Protocol Secure | 加密的HTTP协议，用于安全传输数据 |
| 审计日志 | Shenji rizhi | Audit Log | 记录系统关键操作的安全日志 |
| 会话管理 | Huihua guanli | Session Management | 控制用户登录状态和身份验证会话的过程 |
| 数据脱敏 | Shuju tuomin | Data Masking | 隐藏或替换敏感信息的技术 |
| 防火墙 | Fanghuoqiang | Firewall | 监控和控制网络流量的安全设备 |

## 5. 业务术语

### 5.1 预算与资源术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| 预算 | Yusuan | Budget | 计划的财务支出，用于特定目的 |
| 预算申请金额 | Yusuan shenqing jin'e | Budget Request Amount | 申请书中请求的预算金额 |
| 预算执行 | Yusuan zhixing | Budget Execution | 实际使用预算的过程 |
| 计算资源 | Jisuan ziyuan | Computing Resources | 用于处理数据和运行应用的硬件资源 |
| 存储资源 | Cunchu ziyuan | Storage Resources | 用于保存数据的物理或虚拟存储空间 |
| 带宽资源 | Dai kuan ziyuan | Bandwidth Resources | 网络传输能力，通常以Mbps或Gbps衡量 |
| 资源规格 | Ziyuan guige | Resource Specification | 资源的技术参数，如CPU核心数、内存大小等 |
| 资源分配 | Ziyuan fenpei | Resource Allocation | 将可用资源分配给特定项目或申请的过程 |
| 资源使用期限 | Ziyuan shiyong qixian | Resource Usage Period | 申请的资源预计使用的时间段 |

### 5.2 管理术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| 流程配置 | Liucheng peizhi | Process Configuration | 设置审批流程规则和路径的过程 |
| 工作流定义 | Gongzuoliu dingyi | Workflow Definition | 描述工作流步骤、条件和行为的规范 |
| 权限矩阵 | Quanxian juzhen | Permission Matrix | 定义不同角色拥有的具体权限的表格 |
| 角色管理 | Jue se guanli | Role Management | 创建、修改和分配用户角色的功能 |
| 系统监控 | Xitong jiankong | System Monitoring | 观察和跟踪系统性能和状态的活动 |
| 性能指标 | Xingneng zhibiao | Performance Metrics | 衡量系统性能的量化数据，如响应时间、吞吐量等 |
| 统计报表 | Tongji baobiao | Statistical Report | 汇总和展示系统数据的文档或图表 |
| 数据导出 | Shuju daochu | Data Export | 将系统数据以特定格式（如Excel、PDF）导出的功能 |

## 6. 验收与质量管理术语

| 术语 | 拼音 | 英文 | 解释 |
|------|------|------|------|
| 验收标准 | Yanshou biaozhun | Acceptance Criteria | 确定功能或系统是否满足要求的条件 |
| 用户故事 | Yonghu gushi | User Story | 从用户角度描述功能需求的简短描述 |
| 产品待办列表 | Chanpin daiban liebiao | Product Backlog | 按优先级排序的系统功能列表 |
| 迭代 | Diedai | Iteration/Sprint | 开发团队在固定时间内完成特定功能的周期 |
| 测试用例 | Ceshi yongli | Test Case | 用于验证系统功能的详细测试步骤和预期结果 |
| 错误修复 | Cuowu xiufu | Bug Fix | 修复系统中发现的错误或缺陷 |
| 用户体验 | Yonghu tiyan | User Experience (UX) | 用户与系统交互的整体感受 |
| 可用性测试 | Keyongxing ceshi | Usability Testing | 评估系统易用性的测试活动 |
| 响应式设计 | Xiangying shi sheji | Responsive Design | 使界面在不同设备上都能良好显示的设计方法 |

## 7. 维护与更新

本文档将随着项目进展和需求变更持续更新。当系统中引入新的术语或概念时，相关内容将被添加到本词汇表中。请团队成员在日常工作中参考最新版本的词汇表，确保沟通一致性。

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2023-xx-xx | 初始版本 | 需求分析团队 |

---

> **注意**: 本文档为内部工作文档，用于确保团队对系统术语的共同理解。如有术语解释不准确或需要补充的情况，请联系需求分析团队进行更新。