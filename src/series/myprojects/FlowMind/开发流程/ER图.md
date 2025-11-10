---
order: 4
title: ER图设计与优化
category: 开发流程
icon: /assets/icon/er-diagram.png
---

# FlowMind 系统ER图设计与优化

## 1. ER图概述

ER图（Entity-Relationship Diagram，实体-关系图）是数据库设计的重要工具，用于描述系统中实体之间的关系。FlowMind智能审批系统的ER图经过精心设计，确保数据结构清晰、关系明确、易于理解和维护。

## 2. 设计原则

### 2.1 设计目标
- **结构清晰**：实体关系清晰，便于理解和维护
- **关系明确**：一对一、一对多、多对多关系明确定义
- **可扩展性**：支持未来业务功能的扩展
- **规范化**：遵循数据库规范化原则，减少数据冗余
- **性能优化**：合理设计关系，支持高效查询

### 2.2 设计规范
- **实体命名**：使用单数形式，首字母大写，如 `User`、`Application`
- **关系命名**：使用动词短语描述关系，如 `has`、`belongs_to`
- **属性命名**：使用小写字母，多个单词用下划线分隔，如 `created_at`
- **主键标识**：使用下划线标注主键，如 `id`
- **外键标识**：使用虚线箭头表示外键关系

## 3. 主键设计说明

### 3.1 为什么使用UUID而不是BIGINT

在本系统中，我们选择使用UUID（36位字符串）作为主键，而不是传统的BIGINT自增主键，主要基于以下考虑：

#### 3.1.1 分布式架构支持
- **无中心化生成**：UUID可以在应用层生成，无需依赖数据库的自增机制，避免单点瓶颈
- **支持分库分表**：在分布式数据库架构中，UUID可以避免不同分片间的ID冲突
- **微服务友好**：微服务架构下，不同服务可以独立生成ID，无需协调

#### 3.1.2 数据安全性
- **不可预测性**：UUID是随机生成的，难以通过ID猜测数据量和业务规模
- **防止信息泄露**：自增ID容易暴露系统的业务活跃度，UUID则无法通过ID推断
- **支持数据脱敏**：在日志和外部接口中，UUID相对更安全

#### 3.1.3 业务灵活性
- **支持数据迁移**：在不同环境间迁移数据时，无需担心ID冲突
- **支持离线操作**：客户端可以在离线状态下生成ID，待联网后同步
- **支持批量导入**：批量导入数据时，无需担心ID重复问题

#### 3.1.4 性能考虑
- **索引性能**：虽然UUID比BIGINT占用更多存储空间（36字节 vs 8字节），但现代数据库对字符串索引优化良好
- **查询性能**：在适当的索引设计下，UUID的查询性能与BIGINT差异不大
- **存储成本**：额外的存储空间成本在现代硬件条件下可以接受

#### 3.1.5 适用场景
- **中等规模系统**：对于FlowMind这种中等规模的业务系统，UUID的性能影响在可接受范围内
- **B2B业务**：企业级应用对数据一致性和安全性要求更高，UUID的优势更加明显
- **长期演进**：为系统未来的分布式扩展预留空间，避免后期重构成本

## 4. 核心实体关系图

### 4.1 用户权限模块ER图

```mermaid
erDiagram
    User ||--o{ UserRole : "has"
    User {
        string id PK "用户ID (UUID)"
        string username "用户名"
        string password_hash "密码哈希"
        string email "邮箱地址"
        string phone "手机号码"
        string real_name "真实姓名"
        string dept_id FK "部门ID"
        json ext_data_json "扩展数据JSON"
        boolean is_active "是否激活"
        datetime last_login_at "最后登录时间"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    Role ||--o{ UserRole : "assigned_to"
    Role {
        string id PK "角色ID (UUID)"
        string role_name "角色名称"
        string role_code "角色编码"
        string description "角色描述"
        int role_level "角色等级"
        json ext_data_json "扩展数据JSON"
        boolean is_active "是否激活"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    Role ||--o{ RolePermission : "has"
    Permission ||--o{ RolePermission : "assigned_to"
    Permission {
        string id PK "权限ID (UUID)"
        string permission_name "权限名称"
        string permission_code "权限编码"
        string description "权限描述"
        string resource_type "资源类型"
        string action "操作类型"
        json ext_data_json "扩展数据JSON"
        boolean is_active "是否激活"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    Department ||--o{ User : "has"
    Department {
        string id PK "部门ID (UUID)"
        string dept_name "部门名称"
        string dept_code "部门编码"
        string parent_dept_id FK "上级部门ID"
        int dept_level "部门层级"
        string description "部门描述"
        json ext_data_json "扩展数据JSON"
        boolean is_active "是否激活"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    UserRole {
        string id PK "关联ID (UUID)"
        string user_id FK "用户ID"
        string role_id FK "角色ID"
        string created_by "创建人ID"
        datetime created_at "创建时间"
    }
    
    RolePermission {
        string id PK "关联ID (UUID)"
        string role_id FK "角色ID"
        string permission_id FK "权限ID"
        string created_by "创建人ID"
        datetime created_at "创建时间"
    }
```

**中文注释说明：**
- **User（用户）**：系统用户实体，包含基本信息和部门关联
- **Role（角色）**：系统角色实体，定义用户权限集合
- **Permission（权限）**：系统权限实体，定义具体操作权限
- **Department（部门）**：组织架构实体，支持多级部门结构
- **UserRole（用户角色关联）**：用户与角色的多对多关系
- **RolePermission（角色权限关联）**：角色与权限的多对多关系

### 4.2 申请流程模块ER图

```mermaid
erDiagram
    User ||--o{ Application : "submits"
    Application ||--|| ApplicationType : "belongs_to"
    Application ||--|| ProcessDefinition : "follows"
    Application ||--o{ Approval : "has"
    Application ||--o{ Attachment : "has"
    Application ||--o{ ApplicationHistory : "has_history"
    
    Application {
        string id PK "申请ID (UUID)"
        string user_id FK "申请人ID"
        string application_type_id FK "申请类型ID"
        string process_definition_id FK "流程定义ID"
        string title "申请标题"
        text content "申请内容"
        decimal amount "申请金额"
        string status "申请状态"
        datetime submitted_at "提交时间"
        datetime updated_at "更新时间"
        string current_node_id FK "当前节点ID"
        json ext_data_json "扩展数据JSON"
        boolean is_deleted "是否删除"
        boolean is_cancelled "是否撤销"
        string cancel_reason "撤销原因"
        date expected_completion_date "期望完成日期"
        string priority "优先级"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
    }
    
    ApplicationType {
        string id PK "申请类型ID (UUID)"
        string type_name "类型名称"
        string type_code "类型编码"
        string description "类型描述"
        json form_config_json "表单配置JSON"
        json workflow_config_json "工作流配置JSON"
        json ext_data_json "扩展数据JSON"
        boolean is_active "是否激活"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    ProcessDefinition ||--o{ ProcessNode : "has"
    ProcessDefinition {
        string id PK "流程定义ID (UUID)"
        string process_name "流程名称"
        string process_code "流程编码"
        string description "流程描述"
        json process_config_json "流程配置JSON"
        int version "版本号"
        boolean is_active "是否激活"
        json ext_data_json "扩展数据JSON"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    ProcessNode {
        string id PK "节点ID (UUID)"
        string process_definition_id FK "流程定义ID"
        string node_name "节点名称"
        string node_code "节点编码"
        string node_type "节点类型"
        json node_config_json "节点配置JSON"
        string next_node_id FK "下一个节点ID"
        int order_num "排序号"
        int timeout_days "超时天数"
        boolean is_skipable "是否可跳过"
        json ext_data_json "扩展数据JSON"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    User ||--o{ Approval : "approves"
    ProcessNode ||--o{ Approval : "at_node"
    Approval {
        string id PK "审批ID (UUID)"
        string application_id FK "申请ID"
        string approver_id FK "审批人ID"
        string node_id FK "流程节点ID"
        string status "审批状态"
        text comment "审批意见"
        datetime approved_at "审批时间"
        datetime due_at "截止时间"
        boolean is_transferred "是否转交"
        decimal intelligent_score "智能评分"
        json ext_data_json "扩展数据JSON"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    Attachment {
        string id PK "附件ID (UUID)"
        string application_id FK "申请ID"
        string file_name "文件名称"
        string file_path "文件路径"
        string file_type "文件类型"
        bigint file_size "文件大小（字节）"
        string hash_value "文件哈希值"
        json ext_data_json "扩展数据JSON"
        string uploaded_by FK "上传人ID"
        datetime uploaded_at "上传时间"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    ApplicationHistory {
        string id PK "历史ID (UUID)"
        string application_id FK "申请ID"
        string field_name "字段名称"
        text old_value "旧值"
        text new_value "新值"
        string action_type "操作类型"
        json ext_data_json "扩展数据JSON"
        string changed_by FK "变更人ID"
        datetime changed_at "变更时间"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
```

**中文注释说明：**
- **Application（申请）**：核心申请实体，关联用户、类型、流程等信息
- **ApplicationType（申请类型）**：定义不同类型的申请，包含表单和工作流配置
- **ProcessDefinition（流程定义）**：审批流程的定义，包含多个流程节点
- **ProcessNode（流程节点）**：流程中的各个审批节点，支持顺序流转
- **Approval（审批）**：具体的审批记录，关联申请、审批人、流程节点
- **Attachment（附件）**：申请相关的附件文件
- **ApplicationHistory（申请历史）**：申请数据的变更历史记录

### 4.3 历史记录与辅助功能模块ER图

```mermaid
erDiagram
    Approval ||--o{ ApprovalHistory : "has_history"
    Approval ||--o{ TransferRecord : "has_transfer"
    User ||--o{ ApprovalHistory : "performs_action"
    User ||--o{ TransferRecord : "transfers_from"
    User ||--o{ TransferRecord : "transfers_to"
    
    ApprovalHistory {
        string id PK "历史ID (UUID)"
        string approval_id FK "审批ID"
        string action "操作动作"
        text details "操作详情"
        string action_by FK "操作人ID"
        json ext_data_json "扩展数据JSON"
        datetime action_time "操作时间"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    TransferRecord {
        string id PK "转交记录ID (UUID)"
        string approval_id FK "审批ID"
        string from_user_id FK "转出人ID"
        string to_user_id FK "接收人ID"
        text transfer_reason "转交原因"
        datetime transferred_at "转交时间"
        json ext_data_json "扩展数据JSON"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    User ||--o{ Notification : "receives"
    Application ||--o{ Notification : "related_to"
    Notification {
        string id PK "通知ID (UUID)"
        string user_id FK "用户ID"
        string application_id FK "申请ID"
        string type "通知类型"
        string title "通知标题"
        text content "通知内容"
        boolean is_read "是否已读"
        datetime read_at "阅读时间"
        string related_id "关联ID"
        json ext_data_json "扩展数据JSON"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    Department ||--o{ Resource : "has"
    Resource {
        string id PK "资源ID (UUID)"
        string dept_id FK "部门ID"
        string resource_type "资源类型"
        string resource_name "资源名称"
        int quantity "总数量"
        int available_quantity "可用数量"
        string unit "单位"
        string description "资源描述"
        json ext_data_json "扩展数据JSON"
        boolean is_active "是否激活"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    Application ||--|| IntelligentReview : "has_review"
    IntelligentReview {
        string id PK "初审ID (UUID)"
        string application_id FK "申请ID"
        json extracted_info_json "提取信息JSON"
        boolean is_compliant "是否合规"
        text compliance_issues "合规问题"
        text approval_suggestion "审批建议"
        decimal confidence_score "置信度评分"
        int processing_time_ms "处理时间（毫秒）"
        json ext_data_json "扩展数据JSON"
        datetime reviewed_at "初审时间"
        string created_by "创建人ID"
        string updated_by "更新人ID"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
```

**中文注释说明：**
- **ApprovalHistory（审批历史）**：记录审批过程中的所有操作历史
- **TransferRecord（转交记录）**：记录审批任务的转交情况
- **Notification（通知）**：系统通知消息，关联用户和申请
- **Resource（资源）**：部门资源管理，支持资源申请和分配
- **IntelligentReview（智能初审）**：AI智能初审结果，关联申请

## 5. 表结构优化说明

### 5.1 扩展性设计

#### 5.1.1 JSON扩展字段
所有主要表都包含 `ext_data_json` 字段，支持以下扩展场景：
- **动态字段**：无需修改表结构即可添加新字段
- **配置信息**：存储业务配置和参数
- **临时数据**：存储计算过程中的临时数据
- **第三方集成**：存储外部系统的数据映射

**示例应用场景：**
```json
{
  "custom_fields": {
    "project_code": "PROJ2024001",
    "cost_center": "CC001",
    "business_line": "BL_01"
  },
  "workflow_config": {
    "auto_approve_amount": 1000,
    "skip_manager_level": true
  },
  "integration_data": {
    "erp_system_id": "ERP123",
    "crm_account_id": "CRM456"
  }
}
```

#### 5.1.2 审计字段标准化
所有表都包含以下审计字段，确保数据的可追溯性：
- **created_at**：记录数据创建时间
- **updated_at**：记录数据最后更新时间
- **created_by**：记录数据创建人
- **updated_by**：记录数据最后更新人

这些字段通过数据库触发器自动维护，确保审计信息的准确性和完整性。

### 5.2 性能优化

#### 5.2.1 索引设计
基于业务查询需求，设计了以下核心索引：

```sql
-- 申请查询优化
CREATE INDEX idx_applications_user_status ON applications(user_id, status);
CREATE INDEX idx_applications_type_status ON applications(application_type_id, status);
CREATE INDEX idx_applications_submitted_status ON applications(submitted_at, status);

-- 审批任务查询优化  
CREATE INDEX idx_approvals_approver_status ON approvals(approver_id, status);
CREATE INDEX idx_approvals_due_status ON approvals(due_at, status);

-- 通知查询优化
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

#### 5.2.2 全文搜索索引
对于内容搜索需求：

```sql
-- 申请表全文索引
ALTER TABLE applications ADD FULLTEXT ft_applications_search (title, content);

-- 审批意见全文索引  
ALTER TABLE approvals ADD FULLTEXT ft_approvals_search (comment);
```

### 5.3 数据完整性

#### 5.3.1 外键约束
- 所有外键关系都设置了外键约束，确保数据引用的完整性
- 关联表使用级联删除，如user_roles、role_permissions等
- 业务数据表使用限制删除，防止误删除重要数据

#### 5.3.2 唯一约束
- 用户表：username、email字段设置唯一约束
- 角色表：role_name、role_code字段设置唯一约束
- 权限表：permission_name、permission_code字段设置唯一约束
- 部门表：dept_code字段设置唯一约束
- 申请类型表：type_name、type_code字段设置唯一约束
- 流程定义表：process_code字段设置唯一约束
- 智能初审表：application_id字段设置唯一约束

#### 5.3.3 非空约束
- 关键业务字段设置NOT NULL约束，确保数据完整性
- 状态字段设置默认值，确保业务状态的正确性
- 时间戳字段设置默认值，确保审计信息的完整性

## 6. 关系说明

### 6.1 一对一关系
- **Application - IntelligentReview**：每个申请最多有一个智能初审结果
- **Application - ApplicationHistory**：每个申请有多个历史记录（一对多，但每个版本独立）

### 6.2 一对多关系
- **User - Application**：一个用户可以提交多个申请
- **Department - User**：一个部门可以有多个用户
- **ProcessDefinition - ProcessNode**：一个流程定义包含多个流程节点
- **Application - Approval**：一个申请可以有多个审批记录
- **Application - Attachment**：一个申请可以有多个附件

### 6.3 多对多关系
- **User - Role**：通过UserRole关联表实现
- **Role - Permission**：通过RolePermission关联表实现
- **User - Approval**：一个用户可以是多个审批的审批人，一个审批记录对应一个审批人

## 7. 扩展性考虑

### 7.1 模块化设计
表结构按照业务模块进行清晰划分：

1. **用户权限模块**：用户、角色、权限、部门管理
2. **申请流程模块**：申请、审批、流程定义
3. **历史记录模块**：申请历史、审批历史、操作日志
4. **智能处理模块**：智能初审、数据分析
5. **辅助功能模块**：通知、附件、资源管理

每个模块内部高内聚，模块间低耦合，便于：
- 独立开发和部署
- 功能模块的复用
- 系统维护和升级
- 数据库分库分表

### 7.2 版本管理
- 流程定义表包含version字段，支持流程版本管理
- 历史记录表完整记录数据变更历史
- 时间戳字段支持数据的时间维度分析

### 7.3 多租户支持
虽然当前设计为单租户系统，但通过以下设计为未来的多租户扩展预留了空间：
- 所有表使用UUID主键，避免不同租户间的ID冲突
- ext_data_json字段可以存储租户特定的配置信息
- 审计字段可以追踪租户内的操作

## 8. 安全性设计

### 8.1 数据加密
- 敏感字段如password_hash使用高强度加密
- 支持字段级加密，如手机号、邮箱等个人信息
- 支持传输层加密，确保数据传输安全

### 8.2 访问控制
- 基于角色的访问控制（RBAC）模型
- 支持行级安全（RLS）控制
- 支持数据脱敏和访问审计

### 8.3 备份策略
- 定期全量备份和增量备份
- 支持点时间恢复（PITR）
- 异地备份和容灾策略

## 9. 总结

FlowMind系统的ER图设计充分考虑了：

1. **业务需求**：完整覆盖智能审批系统的核心业务流程
2. **扩展性**：通过JSON字段和模块化设计支持未来功能扩展
3. **性能**：合理的索引设计和关系优化
4. **安全性**：完整的审计机制和访问控制
5. **可维护性**：清晰的命名规范和关系定义

本ER图为FlowMind智能审批系统提供了坚实的数据模型基础，能够支撑系统的核心业务功能，同时为未来的业务发展和技术演进预留了充分的扩展空间。通过中文注释和详细说明，使得开发团队和运维团队都能够快速理解系统数据结构，提高开发和维护效率。