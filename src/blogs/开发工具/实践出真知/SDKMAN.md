---
title: "SDKMAN 使用指南"
date: 2025-11-10
---

# SDKMAN 使用指南

## 什么是 SDKMAN？

SDKMAN（Software Development Kit Manager）是一个用于管理多个软件开发工具包（SDK）并行版本的工具。它提供了一个方便的命令行界面，可以轻松安装、切换和管理不同版本的 Java、Scala、Groovy、Kotlin 等开发工具。

SDKMAN 主要解决以下问题：
- 在同一台机器上管理多个版本的开发工具
- 快速切换不同项目所需的特定版本
- 简化新工具的安装和卸载过程
- 提供统一的命令行接口管理所有开发工具

## 主要特性

1. **多版本管理**：可以同时安装同一工具的多个版本
2. **快速切换**：通过简单命令在不同版本间切换
3. **跨平台支持**：支持 Linux、macOS、Windows（通过 WSL）等系统
4. **丰富的工具支持**：支持 Java、Scala、Groovy、Kotlin、Maven、Gradle 等众多工具
5. **离线模式**：支持离线安装已下载的工具包

## 安装教程

详细的安装教程请参考：
- [SDKMAN 安装教程 - 简书](https://www.jianshu.com/p/ddce36a50720)

## 官方使用指南

更多使用方法和详细说明请访问：
- [SDKMAN 官方使用指南](https://sdkman.java.net.cn/usage/)

## 常用命令示例

```bash
# 列出所有可用的候选工具
sdk list

# 列出特定工具的所有可用版本
sdk list java

# 安装最新稳定版的 Java
sdk install java

# 安装特定版本的工具
sdk install scala 3.4.2

# 切换当前终端使用的版本
sdk use scala 3.4.2

# 设置默认版本
sdk default scala 3.4.2

# 查看当前使用的版本
sdk current

# 卸载特定版本
sdk uninstall scala 3.4.2
```

通过 SDKMAN，开发者可以更高效地管理开发环境，避免版本冲突问题，提升开发体验。