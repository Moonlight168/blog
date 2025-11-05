---
title: ER图
date: 2025-10-28
categories: [UML建模,基本概念]
---

## 一、什么是ER图

ER图（实体关系图，Entity-Relationship Diagram）是一种用于数据库设计的概念模型工具，用于描述系统中的**实体（Entity）**、**属性（Attribute）**以及实体之间的**关系（Relationship）**。

它主要用于从数据角度展示系统的静态结构，是数据库设计的重要基础。

---

## 二、ER图的组成元素

1. **实体（Entity）**

    * 用矩形表示，代表现实世界中可区分的对象或概念。
    * 实体通常对应数据库中的表。
    * 示例：

      ```
      用户
      ```

2. **属性（Attribute）**

    * 用椭圆表示，描述实体的特征或性质。
    * 属性通常对应数据库表中的字段。
    * 示例：

      ```
      用户     ------  用户ID
              ------  用户名
              ------  密码
      ```

3. **关系（Relationship）**

    * 用菱形表示，连接相关联的实体。
    * 关系的类型：
        * **一对一（1:1）**：一个实体实例与另一个实体实例关联。
        * **一对多（1:N）**：一个实体实例与多个另一个实体实例关联。
        * **多对多（M:N）**：多个实体实例与多个另一个实体实例关联。

4. **连接**

    * 实体与属性之间用直线连接。
    * 实体与关系之间用直线连接，并标注关系的基数（1, N, M等）。

**PlantUML表示示例**：

@startuml ER图关系示例
!theme vibrant

' 定义实体
entity "学生" as Student {
  学号: String
  姓名: String
  年龄: Integer
}

entity "课程" as Course {
  课程号: String
  课程名: String
  学分: Integer
}

entity "选课记录" as Enrollment {
  成绩: Decimal
}

' 定义实体关系
Student "N" -- "M" Course : 选课

' 使用连接表表示多对多关系
Student "1" -- "N" Enrollment : 参与
Course "1" -- "N" Enrollment : 包含

@enduml

---

## 三、如何分析ER图

1. **识别系统中的主要实体**

    * 从业务需求出发，找出系统中需要存储数据的核心对象（如“用户”、“订单”、“商品”等）。

2. **确定实体的属性**

    * 分析每个实体需要存储哪些信息（如用户实体需要用户ID、用户名、密码等）。
    * 识别每个实体的主键属性（用于唯一标识实体实例）。

3. **确定实体之间的关系**

    * 判断实体之间是一对一、一对多还是多对多关系。
    * 分析关系的含义和业务规则（如“一个用户可以下多个订单”）。

4. **检查数据模型的完整性**

    * 确保所有必要的实体和关系都已包含。
    * 验证属性定义是否合理，避免冗余。
    * 检查关系的基数是否符合业务逻辑。

---

## 四、如何绘制ER图

以“电商系统”为例：

**主要实体**：

* `用户（User）`
* `商品（Product）`
* `订单（Order）`
* `订单明细（OrderItem）`
* `购物车（Cart）`

**关系说明**：

* `用户` 与 `订单` 是 **一对多关系**：一个用户可以创建多个订单。
* `用户` 与 `购物车` 是 **一对一关系**：一个用户有一个购物车。
* `订单` 与 `订单明细` 是 **一对多关系**：一个订单包含多个订单明细。
* `订单明细` 与 `商品` 是 **一对一关系**：一个订单明细对应一个商品。
* `购物车` 与 `商品` 是 **多对多关系**：一个购物车可以包含多个商品，一个商品可以在多个购物车中。

@startuml 电商系统ER图
!theme sketchy-outline

' 定义实体
entity "用户" as User {
  用户名: String
  密码: String
  邮箱: String
  注册日期: Date
}

entity "商品" as Product {
  商品ID: String
  商品名称: String
  价格: Decimal
  库存: Integer
  描述: Text
}

entity "订单" as Order {
  订单ID: String
  订单日期: Date
  总金额: Decimal
  订单状态: String
}

entity "订单明细" as OrderItem {
  订单明细ID: String
  数量: Integer
  单价: Decimal
  小计: Decimal
}

entity "购物车" as Cart {
  购物车ID: String
  创建日期: Date
}

' 定义关系
User "1" -- "N" Order : 下
User "1" -- "1" Cart : 拥有
Order "1" -- "N" OrderItem : 包含
OrderItem "N" -- "1" Product : 对应
Cart "N" -- "M" Product : 包含

@enduml

---