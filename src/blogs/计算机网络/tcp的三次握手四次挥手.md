---
title: TCP的三次握手与四次挥手
date: 2025-11-04
categories: [计算机网络,基本概念]
---

# TCP 三次握手与四次挥手

TCP（Transmission Control Protocol，传输控制协议）是一种**面向连接、可靠传输**的协议。
在建立与断开连接时，TCP 通过**三次握手（Three-way Handshake）**与**四次挥手（Four-way Handshake）**来确保通信可靠。

---

## 一、TCP 三次握手（建立连接）

### 目的

确保客户端和服务器双方都具备收发能力，并建立可靠的逻辑连接。

---

### 握手过程

1. **第一次握手（SYN）**

   * 客户端 → 服务器：发送连接请求（`SYN=1, seq=x`）
   * 表示：“我想建立连接，这是我的初始序列号 x”
   * 客户端进入 `SYN_SENT` 状态

2. **第二次握手（SYN+ACK）**

   * 服务器 → 客户端：回应确认（`SYN=1, ACK=1, seq=y, ack=x+1`）
   * 表示：“我同意连接，你的请求我收到了，我的序号是 y”
   * 服务器进入 `SYN_RCVD` 状态

3. **第三次握手（ACK）**

   * 客户端 → 服务器：确认（`ACK=1, ack=y+1`）
   * 表示：“连接建立，我准备好了”
   * 双方进入 `ESTABLISHED` 状态，连接建立成功

---

### 三次握手示意图

@startuml
title TCP 三次握手 (Three-way Handshake)

actor Client
participant Server

Client -> Server: 1. SYN (seq=x)
note right: SYN=1, seq=x\n状态：SYN_SENT

Server -> Client: 2. SYN+ACK (seq=y, ack=x+1)
note left: SYN=1, ACK=1\n状态：SYN_RCVD

Client -> Server: 3. ACK (ack=y+1)
note right: ACK=1, ack=y+1\n状态：ESTABLISHED

@enduml


---

### 为什么要三次？

1. **防止旧连接请求误触发新连接**（避免滞留的旧 SYN 包）
2. **确认双方通信能力**：

   * 客户端能发、服务器能收
   * 服务器能发、客户端能收

---

## 二、TCP 四次挥手（断开连接）

### 目的

确保数据传输完成后，双方能安全、有序地关闭连接。
TCP 是**全双工**通信，因此关闭连接需要四步。

---

### 挥手过程

1. **第一次挥手（FIN）**

   * 客户端 → 服务器：发送断开请求（`FIN=1, seq=u`）
   * 表示：“我已无数据要发”
   * 客户端进入 `FIN_WAIT_1` 状态

2. **第二次挥手（ACK）**

   * 服务器 → 客户端：确认收到（`ACK=1, ack=u+1`）
   * 表示：“收到请求，但我还没发完数据”
   * 服务器进入 `CLOSE_WAIT`，客户端进入 `FIN_WAIT_2`

3. **第三次挥手（FIN）**

   * 服务器 → 客户端：请求关闭（`FIN=1, seq=w`）
   * 表示：“我也发完了，可以断开”
   * 服务器进入 `LAST_ACK` 状态

4. **第四次挥手（ACK）**

   * 客户端 → 服务器：确认关闭（`ACK=1, ack=w+1`）
   * 客户端进入 `TIME_WAIT`，等待 2MSL 后彻底关闭
   * 服务器收到 ACK 后进入 `CLOSED` 状态

---

### 四次挥手示意图

@startuml
title TCP 四次挥手 (Four-way Handshake)

actor Client
participant Server

Client -> Server: 1. FIN (seq=u)
note right: FIN=1, seq=u\n状态：FIN_WAIT_1

Server -> Client: 2. ACK (ack=u+1)
note left: ACK=1, ack=u+1\n状态：CLOSE_WAIT / FIN_WAIT_2

Server -> Client: 3. FIN (seq=w)
note left: FIN=1, seq=w\n状态：LAST_ACK

Client -> Server: 4. ACK (ack=w+1)
note right: ACK=1, ack=w+1\n状态：TIME_WAIT → CLOSED

@enduml

---

### TIME_WAIT 的作用

客户端在 `TIME_WAIT` 状态等待 **2 × MSL**（最大报文寿命时间），目的有：

1. **确保服务器收到最后的 ACK**（若丢失可重传 FIN）
2. **避免旧连接残留数据干扰新连接**

---

## 三、常见异常与优化

| 异常情况              | 原因                    | 优化建议                      |
| ----------------- | --------------------- | ------------------------- |
| **SYN 洪泛攻击**      | 大量 SYN 包不完成握手导致半开连接过多 | 启用 **SYN Cookie**、限制半连接数量 |
| **CLOSE_WAIT 过多** | 服务端未及时关闭 socket       | 检查代码逻辑、释放连接               |
| **TIME_WAIT 过多**  | 高频连接建立与关闭             | 调整系统内核参数、使用连接复用           |

---

## 四、总结

| 阶段        | 次数      | 核心目的              |
| --------- | ------- | ----------------- |
| 建立连接      | 三次握手    | 确认双方通信能力，防止误连接    |
| 断开连接      | 四次挥手    | 确保数据传输完成并安全关闭     |
| TIME_WAIT | 等待 2MSL | 保证 ACK 可靠传达与旧数据清除 |
