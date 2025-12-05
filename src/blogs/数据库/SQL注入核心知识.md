---
title: SQL注入核心知识
date: 2025-12-05
categories: ["数据库"]
---

# SQL注入核心知识

本文提炼SQL注入核心知识，涵盖定义、成因、攻击方法、工具使用及防御策略，内容简洁易懂，聚焦实用要点，帮助快速掌握SQL注入关键逻辑。

## 一、SQL注入概述

### 1.1 核心定义

SQL注入是Web应用高危漏洞，攻击者利用输入校验缺陷，将恶意SQL语句拼接到后台SQL命令中，实现窃取数据、控制服务器等攻击目的。

### 1.2 主要成因

- **输入未过滤**：特殊字符（单引号、逻辑运算符等）未转义，如DVWA Low级别的漏洞场景。
- **SQL语句拼接**：直接将用户输入作为SQL部分拼接，未用参数化查询，例如"SELECT * FROM users WHERE id='$id'"。
- **权限过度**：数据库连接账号权限过高（如root），注入成功后风险被放大。

### 1.3 核心危害

数据泄露（账号密码、敏感信息）、数据篡改（订单状态、权限）、服务器控制（执行系统命令）、数据库破坏（删表删数据）。

### 1.4 常见类型

- **回显注入**：注入结果直接显示在页面，易操作。
- **布尔盲注**：无直接结果，通过页面响应差异（存在/不存在）判断。
- **时间盲注**：无响应差异，用sleep()等函数通过加载时间判断。
- **数字型注入**：参数为数字，无需单引号闭合，如"WHERE id=$id"。
- **字符型注入**：参数为字符串，需单引号闭合，如"WHERE id='$id'"。
- **报错注入**：构造语句触发报错，结果包含在报错信息中。

## 二、SQL注入的核心思路

核心逻辑：破坏原有SQL结构，构造恶意语句执行，全流程分五步，场景不同仅细节有差异。

### 2.1 第一步：判断注入点

注入点常存在于URL参数、POST表单、Cookie等用户输入位置，按参数类型判断：

- **数字型**：输入1（正常）→1 AND 1=1（正常）→1 AND 1=2（异常），则存在注入点。
- **字符型**：输入1（正常）→' or '1'='1（正常）→' or '1'='2（异常），或输入1' or '1'='1'--（正常）→1' or '1'='2'--（异常），则存在注入点。

### 2.2 第二步：判断数据库类型与版本

不同数据库语法不同，需针对性构造语句：

- **MySQL**：用version()查版本、database()查当前库，通用写法如"1' AND SUBSTRING(version(),1,1)='5'-- "（判断MySQL 5.x）、"1' AND SUBSTRING(version(),1,1)='8'-- "（判断MySQL 8.x）。
- **SQL Server**：用@@version，如"1 AND @@version LIKE 'Microsoft%'"。
- **Oracle**：用sysdate，如"1' AND sysdate IS NOT NULL-- "。

### 2.3 第三步：获取数据库结构

MySQL中利用information_schema系统库获取结构，核心操作：

- **查当前库**："1' AND database()='dvwa'-- "（字符型）。
- **查表名**：盲注用"1' AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=database() AND table_name='users')=1-- "；回显用"1' UNION SELECT 1,table_name,3 FROM information_schema.tables WHERE table_schema=database()-- "。
- **查列名**：类似表名查询，条件增加table_name='users'即可。
- **应对过滤**：单引号被过滤时，将字符串转16进制（如admin→0x61646d696e）。

### 2.4 第四步：提取敏感数据

- **回显场景**：用UNION联合查询，如"1' UNION SELECT 1,user,password FROM users-- "。
- **布尔盲注**：用SUBSTRING+ASCII逐字符猜解，如"1' AND ASCII(SUBSTRING(password,1,1))=53-- "。
- **时间盲注**：用sleep()判断，如"1' AND IF(ASCII(SUBSTRING(password,1,1))=53, sleep(5), 1)-- "。

### 2.5 第五步：扩大攻击成果（可选）

权限足够时可尝试高级操作，但2025年传统手法成功率极低，真实攻击链更倾向：用LOAD_FILE读配置文件→提权服务器→反弹shell，或利用UDF提权、内存马等方式。

- **执行系统命令**：xp_cmdshell是SQL Server功能，MySQL无此功能，需通过UDF（用户自定义函数）提权（需root权限且开启lib_plugin）或开启--secure-file-priv=""后写系统启动脚本（成功率极低）。
- **写后门文件**：原"INTO OUTFILE"写法为历史手法，2025年已基本失效——MySQL默认通过secure_file_priv限制该操作，云数据库直接禁用，现代PHP也禁用eval函数。示例路径如'/var/www/html/shell.php'，但需明确成功率低于5%。
- **提权**：通过数据库漏洞或配置缺陷提升服务器权限。

## 三、SQL注入工具SQLMap

开源自动化工具，支持多数据库，自动完成注入全流程，大幅提升效率，Kali默认预装。

### 3.1 核心特点

- **自动化**：指定目标后自动测试，无需手动构造成语句。
- **多类型支持**：覆盖盲注、报错注入等主流类型。
- **功能全**：数据导出、执行命令、写后门等均支持。
- **兼容性强**：支持GET/POST/Cookie注入，可规避WAF。

### 3.2 常用参数与语法

核心语法：sqlmap -u "目标URL" [参数]，高频参数如下：

| 参数 | 功能 | 示例 |
|------|------|------|
| -u | 指定GET参数目标URL | sqlmap -u "http://xxx/?id=1" |
| --data | 指定POST参数 | sqlmap -u "http://xxx" --data "id=1" |
| --dbs | 枚举所有数据库 | sqlmap -u "http://xxx" --dbs |
| --tables | 枚举指定库的表（新版推荐写法） | sqlmap -u "http://xxx" -D dvwa --tables（-T参数已废弃） |
| -C --columns | 枚举指定表的列 | sqlmap -u "http://xxx" -D dvwa -T users --columns |
| --dump | 导出指定列数据 | sqlmap -u "http://xxx" -D dvwa -T users -C user,password --dump |
| --cookie | 携带登录态Cookie | sqlmap -u "http://xxx" --cookie "PHPSESSID=xxx" |
| --os-shell | 获取系统Shell | sqlmap -u "http://xxx" --os-shell |

### 3.3 使用注意事项

- **保持登录态**：需用--cookie携带PHPSESSID等参数，否则权限不足。
- **控制测试级别**：高level/risk可能触发WAF或数据库崩溃，从低级别开始。
- **真实环境用代理**：避免暴露真实IP，可配合Burp Suite等工具。
- **工具非万能**：复杂过滤场景需手工辅助，不能完全依赖。

## 四、SQL注入的预防

核心是切断恶意SQL拼接，多维度构建防御体系，以下是最有效的方法：

### 4.1 核心防御：参数化查询（最有效）

将SQL结构与数据分离，用户输入仅作为参数传递，主流语言示例：

- **PHP（PDO）**：推荐用问号占位符，$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?"); $stmt->execute([$id]);，比命名参数更常用。
- **Java（JDBC）**：PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?")。
- **Python（MySQLdb）**：cursor.execute("SELECT * FROM users WHERE id = %s", (参数,))。

注意：避免用字符串格式化拼接SQL，仍有注入风险。

### 4.2 辅助防御：输入验证与过滤

- **类型校验**：数字参数强制转整数（如intval()），不符合直接拒绝。
- **长度限制**：按业务需求设置输入长度上限，超出拦截。
- **特殊字符过滤**：PHP 7.0+已废弃mysql_real_escape_string()，无需依赖字符过滤，核心靠PDO+参数化查询。
- **优先白名单**：仅允许符合规则的输入（如数字+字母），比黑名单更安全。

### 4.3 降低危害：最小权限原则

数据库连接账号仅分配业务必需权限，避免用root等超级账号：

- **权限分配**：仅授予SELECT/INSERT等必要权限，禁止DROP/TRUNCATE等高危权限。
- **数据库分离**：业务库与系统库（如information_schema）分离，限制访问。

### 4.4 其他防御措施

- **用ORM框架**：Hibernate、MyBatis（开参数化）等，内置参数化查询。
- **部署WAF**：阿里云WAF、ModSecurity等，拦截常见注入语句。
- **隐藏错误信息**：生产环境不显示详细SQL错误，避免泄露结构。
- **定期审计**：代码审计查SQL拼接，用AWVS等工具扫描漏洞。

### 4.5 防御误区

- **仅靠过滤**：过滤可被绕过（如16进制），必须结合参数化查询。
- **用超级账号**：注入成功后攻击者可完全控制数据库。
- **HTTPS防注入**：HTTPS仅加密传输，与应用层注入无关。

## 五、总结

SQL注入风险源于"输入被解析为SQL代码"，攻击核心是破坏SQL结构，工具与手工思路一致但效率不同。2025年最常见的SQL注入利用方式已从"直接跑数据"变为"结合XSS/RCE打内网横向"，且云数据库（RDS、TDSQL）基本都关闭了information_schema的部分访问，传统注入难度大幅上升，当前最有效的注入是"二次注入""堆叠注入""宽字节绕WAF"。防御的关键是用参数化查询切断数据与代码的混淆，配合输入验证、最小权限、WAF等形成多层防护。

实际应用中，真实场景更复杂（如WAF拦截、自定义过滤），需手工分析与工具结合；作为开发者，应将参数化查询融入编码规范，从源头杜绝漏洞。