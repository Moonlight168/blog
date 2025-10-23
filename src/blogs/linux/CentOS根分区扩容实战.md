---
title: 'CentOS/RHEL 根分区扩容实战：从 22G 扩展到 78G'
date: 2025-09-24
categories: ["Linux"]
---

在日常使用 Linux 虚拟机时，经常会遇到这样的问题：虚拟机磁盘分配了几十个 G，但实际根分区 `/` 却只有十几 G，用不了多久就满了，导致 Docker、Elasticsearch 等服务无法正常运行。

这篇文章记录了我在一台 **RHEL/CentOS 7** 系统上，将根分区 `/` 从 **22G 扩展到 78G** 的完整过程。

## 一、问题背景

执行 `df -h`，发现 `/` 分区已经 100% 用满：

```bash
/dev/mapper/rhel-root   22G   22G   0  100% /
```

查看磁盘情况：

```bash
lsblk
```

输出结果：

```
NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda             8:0    0   80G  0 disk
├─sda1          8:1    0    1G  0 part /boot
└─sda2          8:2    0   44G  0 part
  ├─rhel-root 253:0    0   22G  0 lvm  /
  └─rhel-swap 253:1    0    2G  0 lvm  [SWAP]
```

可以看到：

* 虚拟机磁盘总大小 = **80G**
* sda1 = 1G（/boot）
* sda2 = 44G，里面用 LVM 分了 22G 给 root，2G 给 swap，还有 **20G 没用**
* 剩余约 **36G 还未分区**

所以 `/` 根分区只有 22G，剩下 56G 空间（20G + 36G）闲置。

## 二、扩容思路

目标是让 `/` 根分区用满所有磁盘：

1. 把 sda2 里卷组剩余的 20G 分配给 root。
2. 把未分区的 36G 建成新分区 `/dev/sda3`，加入卷组 rhel，再分配给 root。

最终 `/` 会从 22G → 78G。

## 三、扩容步骤

### 1. 查看卷组状态

```bash
vgdisplay rhel
```

确认卷组 `rhel` 的可用空间（Free PE / Size）。

### 2. 使用 sda2 的 20G 空间

扩展 root LV：

```bash
lvextend -l +100%FREE /dev/mapper/rhel-root
```

扩展文件系统（xfs 默认）：

```bash
xfs_growfs /
```

此时 `/` 从 22G → 42G。

### 3. 创建 sda3 分区

执行：

```bash
fdisk /dev/sda
```

步骤：

* 输入 `n` 新建分区，分区号 `3`，起始/结束扇区直接回车，默认使用剩余空间。
* 输入 `t` 修改类型，选择分区 `3`，输入 `8e`（Linux LVM）。
* 输入 `w` 保存退出。

新分区 `/dev/sda3` 创建完成。


### 4. 加入 LVM

初始化物理卷：

```bash
pvcreate /dev/sda3
```

扩展卷组：

```bash
vgextend rhel /dev/sda3
```

查看：

```bash
vgdisplay rhel
```

此时 Free PE 大约 36G。


### 5. 扩展根分区

再次扩展 root LV：

```bash
lvextend -l +100%FREE /dev/mapper/rhel-root
```

扩展文件系统：

```bash
xfs_growfs /
```


### 6. 验证结果

```bash
df -h
```

输出类似：

```
/dev/mapper/rhel-root   78G   25G   53G   32% /
```

至此，根分区 `/` 已经成功扩展到接近 80G，完全利用了虚拟机磁盘空间。

## 四、总结

1. 检查磁盘分区情况 (`lsblk` / `fdisk -l`)
2. 如果 LVM 有空闲空间，直接 `lvextend` + `xfs_growfs`。
3. 如果有未分区空间，新建分区 → `pvcreate` → `vgextend` → `lvextend` → `xfs_growfs`。
4. xfs 文件系统支持在线扩容，不需要重启。

通过以上操作，我的 `/` 分区从 22G 扩容到 78G，彻底解决了磁盘不足导致的 Docker 启动失败问题。

