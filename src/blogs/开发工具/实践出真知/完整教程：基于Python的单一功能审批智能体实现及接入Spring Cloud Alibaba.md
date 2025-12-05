---
title: 完整教程：基于Python的单一功能审批智能体实现及接入Spring Cloud Alibaba
date: 2025-12-04
---
# 完整教程：基于Python的审批智能体实现及接入FlowMind

## 适用场景

本教程专为企业级工作流系统（如FlowMind项目）设计，用于添加智能审批功能。智能体专注于审批决策（如基于规则自动批准/拒绝/建议人工处理），使用本地微调模型（Phi-3 Mini）确保数据隐私安全。

## 技术栈

- **Python部分**：CrewAI + vLLM + 微调Phi-3模型
- **Spring Cloud Alibaba部分**：Spring Boot 3.x + Nacos + Sentinel
- **集成方式**：REST API
- **工作流引擎**：Flowable

## 教程目标

1. 基于2025年最新趋势（Agentic AI自主决策、NLP驱动表单自动化）实现智能审批代理
2. 使用CrewAI框架构建单一功能审批代理，代码量仅传统方案的1/3
3. 将智能体作为微服务接入FlowMind项目
4. 支持自动流转/分发、审批建议、自定义规则和NLP表单填写
5. 总时长：~2小时（含测试）

## 最推荐方案：基于CrewAI的AI代理集成

### 为什么CrewAI是最佳选择？
- **2025优势**：支持Agentic AI（代理自主推理/执行），集成NLP（如实体识别填充表单）、自定义规则（规则嵌入代理目标）和自动路由（基于角色/上下文决策）。它在生产级工具中排名前列，代码量仅LangChain的1/3。
- **匹配您的需求**：
  - **自动流转/分发**：代理分析输入，动态生成简化流程（如请假→经理审批），自动路由到角色（e.g., HR/经理）。
  - **审批建议**：代理给出理由/置信度建议。
  - **自定义规则**：从数据库加载规则（如“请假<3天自动通过”），代理执行。
  - **NLP表单填写**：用户说“今天头疼生病了，想请假”→代理识别意图、提取实体（日期、原因）、自动填写表单、发起流程。
- **隐私/性能**：全本地（用vLLM部署模型），RTX 3060友好，推理<300ms。
- **易集成**：Python代理通过REST暴露，Spring调用；Flowable用动态服务任务替换静态BPMN。

## 📋 先决条件

### 硬件/软件

- **Python环境**：Python 3.12+，RTX 3060（12GB VRAM）+ 16GB RAM（用于微调/推理）。
- **Spring环境**：JDK 17+，Maven 3.9+，您的FlowMind项目（基于Spring Cloud Alibaba 2023.x或更新）。
- **其他**：
  - NVIDIA CUDA 12.x（驱动535+）。
  - 数据库：MySQL（存储规则）。

### 依赖安装

- **Python**：`pip install crewai langchain-openai sqlalchemy pymysql vllm`（CrewAI v2.x+）

**注意**：所有操作本地执行，确保隐私。微调需~1小时，推理<300ms。

## 🚀 实现步骤

### 1. 模型准备（可选，已有微调模型可跳过）

#### 1.1 加载基模型

```bash
# 用vLLM加载Phi-3 Mini基模型
python -m vllm.entrypoints.openai.api_server --model microsoft/phi3-mini-4k-instruct --trust-remote-code
```

#### 1.2 准备训练数据

创建`prepare_data.py`脚本，从MySQL导出规则数据：

```python
import json
import pandas as pd
from sqlalchemy import create_engine

# 连接MySQL数据库（替换为您的实际配置）
engine = create_engine('mysql+pymysql://root:password@localhost:3306/flowmind')

# 查询规则数据（建议1000+条）
df = pd.read_sql("SELECT enterpriseId, condition, action, example FROM approval_rules LIMIT 1000", engine)

train_samples = []
for _, row in df.iterrows():
    prompt = f"企业{row['enterpriseId']}，规则: {row['condition']}。申请: {row['example']}。判断: "
    completion = f"{{{{\"decision\": \"{row['action']}\", \"reason\": \"符合规则\", \"confidence\": 0.95}}}}"
    train_samples.append({"prompt": prompt, "completion": completion})

# 保存为JSONL格式
with open("rules_finetune.jsonl", "w", encoding="utf-8") as f:
    for sample in train_samples:
        f.write(json.dumps(sample) + "\n")

print(f"生成 {len(train_samples)} 条训练样本")
```

运行：`python prepare_data.py`

#### 1.3 微调模型（QLoRA）

创建`finetune.py`脚本：

```python
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, BitsAndBytesConfig
from trl import SFTTrainer
import torch

# 模型配置
model_name = "microsoft/phi-3-mini-4k-instruct"
quantization_config = BitsAndBytesConfig(load_in_4bit=True)  # 4-bit量化

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name, 
    quantization_config=quantization_config, 
    device_map="auto", 
    torch_dtype=torch.bfloat16
)

# QLoRA配置
peft_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM, 
    r=8, 
    lora_alpha=16, 
    lora_dropout=0.1
)
model = get_peft_model(model, peft_config)

# 加载训练数据
dataset = load_dataset("json", data_files="rules_finetune.jsonl", split="train")

# 训练参数
training_args = TrainingArguments(
    output_dir="./phi3-rules-tuned",
    num_train_epochs=2,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    save_steps=500
)

trainer = SFTTrainer(
    model=model, 
    args=training_args, 
    train_dataset=dataset, 
    tokenizer=tokenizer
)
trainer.train()

# 保存微调后的模型
model.save_pretrained("phi3-rules-adapter")
tokenizer.save_pretrained("phi3-rules-adapter")

print("模型微调完成！")
```

运行：`python finetune.py`（监控VRAM：`nvidia-smi`，峰值~4GB）

#### 1.4 启动vLLM服务

```bash
# 启动vLLM服务器，加载微调模型
python -m vllm.entrypoints.openai.api_server --model ./phi3-rules-tuned --trust-remote-code
```

### 2. 构建CrewAI审批代理

创建`approval_agent.py`（核心代理，处理NLP、规则、表单、路由）：

```python
from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI
from sqlalchemy import create_engine, text
import json

# LLM配置（本地vLLM）
llm = ChatOpenAI(base_url="http://localhost:8000/v1", model="phi3-rules", api_key="fake_key")

# 连接MySQL加载规则
engine = create_engine('mysql+pymysql://root:password@localhost:3306/flowmind')

def load_rules(enterprise_id):
    with engine.connect() as conn:
        result = conn.execute(text("SELECT condition, action FROM approval_rules WHERE enterprise_id = :id"), {"id": enterprise_id})
        return "; ".join([f"{r[0]}: {r[1]}" for r in result])

# 定义审批代理（单一角色，Agentic AI）
approval_agent = Agent(
    role='智能审批代理',
    goal='基于自然语言输入自动填写表单、应用自定义规则、生成建议、自动路由并发起流程',
    backstory='你处理审批请求：识别意图、提取实体、检查规则、建议决策、模拟路由到角色（如经理）。输出JSON。',
    llm=llm,
    verbose=True
)

# 任务定义（CrewAI链式执行）
def create_approval_task(user_input, enterprise_id):
    rules = load_rules(enterprise_id)
    return Task(
        description=f"用户输入: {user_input}\n企业ID: {enterprise_id}\n规则: {rules}\n"
                    "步骤: 1. NLP解析意图/实体 (e.g., 请假原因、天数)。2. 自动填写表单JSON (e.g., {'type': 'leave', 'days': 1, 'reason': 'headache'}). "
                    "3. 检查规则决策 (approve/reject/manual)。4. 生成建议理由/置信度。5. 模拟路由 (e.g., to: 'manager')。6. 输出完整JSON。",
        agent=approval_agent,
        expected_output='JSON: {"form": {...}, "decision": "...", "reason": "...", "confidence": 0.95, "route_to": "role/user"}'
    )

# 执行代理
def process_request(user_input: str, enterprise_id: str) -> dict:
    task = create_approval_task(user_input, enterprise_id)
    crew = Crew(agents=[approval_agent], tasks=[task])
    result = crew.kickoff()
    return json.loads(result)  # 解析输出JSON

# 测试
if __name__ == "__main__":
    print(process_request("今天头疼生病了，想请假", "A"))
```

输出示例：
```json
{"form": {"type": "leave", "days": 1, "reason": "headache"}, "decision": "approve", "reason": "天数<3，符合规则", "confidence": 0.95, "route_to": "manager"}
```

### 3. 部署代理服务（Flask）

创建`app.py`（暴露REST API，支持Spring调用）：

```python
from flask import Flask, request, jsonify
from approval_agent import process_request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许跨域请求

@app.route('/smart-approve', methods=['POST'])
def smart_approve():
    data = request.json
    result = process_request(data['user_input'], data['enterprise_id'])
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

运行：`python app.py`（服务启动：http://localhost:5000）

测试API：
```bash
curl -X POST http://localhost:5000/smart-approve \
  -H "Content-Type: application/json" \
  -d '{"user_input": "今天头疼生病了，想请假", "enterprise_id": "A"}'
```

### 4. 集成到FlowMind (Spring Cloud Alibaba)

#### 4.1 添加依赖（flowmind-flowable/pom.xml）

```xml
<dependencies>
    <!-- RestTemplate支持 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

#### 4.2 创建审批服务类（SmartApprovalService.java）

在`flowmind-flowable`模块创建服务，调用Python API：

```java
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@Service
public class SmartApprovalService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // 从配置文件加载Python服务URL
    private final String pythonUrl = "http://localhost:5000";

    /**
     * 处理智能审批请求
     */
    public Map<String, Object> processSmartApproval(String userInput, String enterpriseId) {
        Map<String, String> body = Map.of("user_input", userInput, "enterprise_id", enterpriseId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                pythonUrl + "/smart-approve", entity, String.class
            );
            return mapper.readValue(response.getBody(), Map.class);
        } catch (Exception e) {
            return Map.of("decision", "manual", "reason", "API调用失败: " + e.getMessage(), "confidence", 0.0);
        }
    }

    /**
     * 发起Flowable流程（基于代理输出）
     */
    public void initiateFlow(Map<String, Object> result) {
        // 用Flowable API动态创建实例
        ProcessInstance instance = runtimeService.startProcessInstanceByKey("dynamicApproval");
        runtimeService.setVariables(instance.getId(), result);  // 设置表单/决策
        
        // 路由：基于result.get("route_to")，用TaskService分配
        Task task = taskService.createTaskQuery().processInstanceId(instance.getId()).singleResult();
        taskService.claim(task.getId(), (String) result.get("route_to"));
        
        // 如果approve，直接完成
        if ("approve".equals(result.get("decision"))) {
            taskService.complete(task.getId());
        }
    }
}
```

#### 4.3 Flowable配置

1. **创建动态审批流程模板**：
   - 创建“动态审批”流程（简单起点→服务任务→用户任务→结束）
   - 服务任务委托表达式：`${smartApprovalService.processSmartApproval('${userInput}', '${enterpriseId}')}`
   - 用代理输出动态路由/完成

2. **配置Sentinel限流**（application.yml）：

```yaml
spring:
  cloud:
    sentinel:
      enabled: true
      transport:
        dashboard: localhost:8718  # Sentinel Dashboard
      datasource:
        ds1:
          nacos:
            server-addr: localhost:8848
            data-id: flowmind-flowable-rules
            group-id: SENTINEL_GROUP
            data-type: json
            rule-type: flow  # 限流规则：/smart-approve QPS<10
```

#### 4.4 UI扩展（Vue3）

在审批中心组件添加自然语言输入框：

```vue
<template>
  <div class="ai-approval">
    <el-input
      v-model="userInput"
      placeholder="请输入您的请求，例如：今天头疼生病了，想请假"
      type="textarea"
      :rows="3"
    ></el-input>
    <el-button type="primary" @click="callAiApprove" style="margin-top: 10px;">
      AI智能审批
    </el-button>
    
    <div v-if="aiResult" class="ai-result">
      <h4>AI审批建议</h4>
      <p>决策：{{ aiResult.decision }}</p>
      <p>理由：{{ aiResult.reason }}</p>
      <p>置信度：{{ aiResult.confidence }}</p>
      <p>路由：{{ aiResult.route_to }}</p>
      <el-button @click="initiateFlow" style="margin-top: 10px;">
        发起流程
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInput: '',
      aiResult: null
    };
  },
  methods: {
    async callAiApprove() {
      const res = await this.$axios.post('/api/flowable/smart-approve', {
        user_input: this.userInput,
        enterprise_id: this.$store.state.user.enterpriseId
      });
      this.aiResult = res.data;
    },
    async initiateFlow() {
      await this.$axios.post('/api/flowable/initiate-flow', this.aiResult);
      this.$message.success('流程已发起');
    }
  }
};
</script>

<style scoped>
.ai-approval {
  margin: 20px 0;
}
.ai-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 5px;
}
</style>
```

## 🧪 测试与监控

### 端到端测试

1. **启动服务**：
   - 启动vLLM：`python -m vllm.entrypoints.openai.api_server --model ./phi3-rules-tuned --trust-remote-code`
   - 启动Python代理：`python app.py`
   - 启动FlowMind项目：`mvn spring-boot:run`（在flowmind-gateway模块）

2. **测试流程**：
   - 访问FlowMind UI，进入审批中心
   - 在AI审批输入框中输入："今天头疼生病了，想请假"
   - 点击"AI智能审批"，查看AI建议
   - 点击"发起流程"，验证流程自动发起和路由

### 监控

- **Sentinel**：访问http://localhost:8718，查看API调用QPS和限流情况
- **vLLM日志**：查看控制台输出，监控模型推理性能
- **Flowable**：访问Flowable UI，查看流程实例和任务状态

## 🔧 扩展与优化

1. **添加工具**：为CrewAI代理添加工具，如查询历史审批记录、调用外部API等
2. **多代理协作**：复杂场景下，可使用多个CrewAI代理协作处理不同类型的审批
3. **自动学习**：基于用户反馈，定期微调模型，提高审批准确性
4. **规则管理UI**：添加规则管理界面，方便用户可视化编辑审批规则
5. **多语言支持**：扩展代理支持多语言审批请求

## 📚 相关资源

- [CrewAI官方文档](https://docs.crewai.com/)
- [vLLM官方文档](https://vllm.readthedocs.io/)
- [Flowable官方文档](https://www.flowable.com/open-source/docs/)
- [Spring Cloud Alibaba官方文档](https://sca.aliyun.com/)

## 🛡️ 版权信息

本教程基于开源技术构建，遵循各组件的开源协议。

## 📝 结语

基于CrewAI的智能审批代理为FlowMind项目带来了强大的AI能力，实现了从自然语言输入到自动流程发起的全流程自动化。这种方案不仅符合2025年AI代理技术的最新趋势，而且具有代码量少、易维护、隐私安全等优势。通过本教程，您可以快速将智能审批功能集成到自己的FlowMind项目中，提升企业审批效率和智能化水平。