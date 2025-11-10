---
title:  Kubernetes 与 Docker
date: 2025-11-05
categories: [开发工具]
---

## 一、概述

在现代微服务与云原生架构中，**Docker** 与 **Kubernetes (K8s)** 是两项核心容器技术。
两者既有紧密联系，也在职责和功能上有所区分。
本指南旨在说明它们的关系、区别及在企业级开发中的协作模式。

---

## 二、Docker 概述

**Docker** 是一种轻量级的容器化技术，用于将应用及其依赖打包成一个可移植的镜像，从而实现“一次构建，到处运行”。

### 主要功能

* **镜像构建（Image Build）**：通过 Dockerfile 描述应用及依赖环境。
* **容器运行（Container Runtime）**：基于镜像快速启动容器实例。
* **镜像仓库（Registry）**：存储与分发镜像，如 Docker Hub 或 Harbor。
* **隔离性与资源控制**：基于 Linux Namespace 与 Cgroup 实现轻量级虚拟化。

### 核心优势

* 环境一致性，避免“在我电脑上能运行”的问题。
* 快速部署与回滚。
* 高度可移植性，支持多平台与云环境。

---

## 三、Kubernetes 概述

**Kubernetes** 是一个容器编排平台，负责管理大规模容器的自动化部署、扩缩容、负载均衡、滚动升级与自愈。

### 主要功能

* **Pod 管理**：最小调度单元，可包含一个或多个容器。
* **Deployment 控制器**：声明式管理应用副本数与版本。
* **Service 服务发现**：通过 ClusterIP、NodePort、LoadBalancer 暴露服务。
* **ConfigMap 与 Secret**：实现配置与敏感信息解耦。
* **自动扩缩容 (HPA)**：根据负载动态调整 Pod 数量。
* **滚动更新与回滚**：实现零停机部署。

---

## 四、Docker 与 Kubernetes 的关系

| 对比项  | Docker             | Kubernetes                      |
| ---- | ------------------ | ------------------------------- |
| 核心作用 | 容器的打包与运行           | 容器的调度与编排                        |
| 工作层级 | 单机级                | 集群级                             |
| 管理对象 | 容器                 | Pod、Node、Service                |
| 资源调度 | 无                  | 有完整的调度器                         |
| 网络模型 | 桌面或宿主机网络           | 集群统一的 CNI 网络                    |
| 数据存储 | 本地卷或 Docker Volume | 使用 PV/PVC 的动态存储卷                |
| 状态监控 | Docker CLI         | Kubernetes API + Metrics Server |
| 适用场景 | 本地开发、测试、小型服务       | 云原生、微服务、大规模生产环境                 |

简而言之：
**Docker 专注于容器的创建与运行，而 Kubernetes 负责管理成千上万个 Docker 容器的生命周期与通信。**

---

## 五、当前容器运行时的变化

Kubernetes 最初使用 **Docker** 作为默认容器运行时，但在 **v1.24** 后已移除 Dockershim 接口。
目前推荐使用：

* **containerd**（Docker 底层运行时核心组件）
* **CRI-O**（轻量化、专为 K8s 设计的运行时）

> 实际上，Docker → containerd → Kubernetes
> 现在 K8s 仍可间接运行 Docker 构建的镜像，只是直接运行时由 containerd 接管。

---

## 六、企业级实践建议

### 1. 开发阶段

* 使用 **Dockerfile** 构建镜像。
* 利用 **Docker Compose** 管理多容器本地开发环境。
* 在 CI/CD 流水线中集成 **Docker Build + Push** 阶段。

### 2. 测试与部署阶段

* 将镜像上传至企业私有仓库（如 **Harbor**）。
* 使用 **Kubernetes YAML** 或 **Helm Chart** 进行集群部署。
* 结合 **Ingress Controller** 实现统一流量入口。

### 3. 运维阶段

* 使用 **Prometheus + Grafana** 监控容器与 Pod 状态。
* 通过 **HPA + VPA** 自动化扩缩容。
* 借助 **ArgoCD / Jenkins / GitLab CI** 实现持续部署。

---

## 七、典型架构图（文字版）

```
[开发人员]
      │
      ▼
[Docker 构建镜像] → [推送到 Harbor 仓库]
      │
      ▼
[Kubernetes 集群]
   ├── Deployment 控制 Pod 副本
   ├── Service 暴露服务
   ├── Ingress 控制访问路由
   └── ConfigMap / Secret 管理配置
```

---

## 八、总结

* **Docker** 解决的是“如何运行应用”；
* **Kubernetes** 解决的是“如何大规模地管理这些运行的应用”。

两者并非竞争关系，而是层次分工。
在现代企业级架构中，Docker 通常用于构建与打包阶段，而 Kubernetes 用于集群级部署与运维管理。

---

**推荐组合：**

* Docker + Harbor + Kubernetes + Helm
  构建完整的企业级容器化与持续交付体系。
