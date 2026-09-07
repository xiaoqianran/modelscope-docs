<!-- modelscope-docs: LiteLLM | ecosystem-integrations/api-usage/litellm/litellm_CN.md -->

## 概述

LiteLLM 是开源 AI Gateway，提供统一接口调用 100+ LLM Provider。它解决的核心问题是：不同 LLM 提供商的 SDK、认证方式、请求格式、错误类型各不相同，管理复杂度高。LiteLLM 用一套 OpenAI 兼容的接口统一所有调用，已有代码几乎不需要改动——只需要改 `model` 参数和 API Key。

LiteLLM 有两种使用模式：

**Python SDK**：直接在代码中调用，适合在自己的应用里集成。内置 Router 支持跨多个部署的重试和 fallback 逻辑，比如主模型挂了自动切换到备用模型。

**Proxy Server（AI Gateway）**：作为中心化服务部署，适合团队或组织级别使用。核心能力包括：

- **虚拟密钥管理**：为不同用户/项目生成独立的 API Key，可以设置预算上限
- **成本追踪**：按项目、用户、模型维度追踪 Token 使用量和费用
- **负载均衡**：多个相同模型的部署之间自动分配流量
- **护栏（Guardrails）**：对输入输出做内容过滤
- **日志**：完整的请求日志和可观测性
- **管理仪表板**：Web UI 管理所有配置
- **8ms P95 延迟**（1000 RPS 下）

支持 100+ Provider，覆盖 `/chat/completions`、`/messages`、`/responses`、`/embeddings`、`/images`、`/audio`、`/batches`、`/rerank`、`/a2a` 等端点。还支持 MCP 工具集成和 A2A（Agent-to-Agent）协议，可以直接在 Cursor IDE 中通过 MCP 使用。

部署方式包括 Docker、Helm，以及 AWS 和 GCP 的 Terraform 一键部署。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [BerriAI/litellm](https://github.com/BerriAI/litellm) |
| 官方文档 | [docs.litellm.ai](https://docs.litellm.ai) |
| ModelScope Provider 文档 | [docs.litellm.ai/docs/providers/modelscope](https://docs.litellm.ai/docs/providers/modelscope) |
| 网站 | [litellm.ai](https://litellm.ai) |
| 支持的 Provider 列表 | [docs.litellm.ai/docs/providers](https://docs.litellm.ai/docs/providers) |

## ModelScope 集成

LiteLLM 将 ModelScope 列为支持的 OpenAI 兼容 Provider，接入后可通过 LiteLLM 的统一接口调用 ModelScope 上的开源模型。支持的端点：


| 端点                   | 支持  |
| -------------------- | --- |
| `/chat/completions`  | ✅   |
| `/messages`          | ✅   |
| `/responses`         | ✅   |
| `/embeddings`        | —   |
| `/image/generations` | ✅   |


在 LiteLLM 中使用 ModelScope 时，模型名需要加 `modelscope/` 前缀（如 `modelscope/Qwen/Qwen3.5-27B`）。

## 接入流程

### 方式一：Python SDK

直接在代码中调用：

```python
import litellm
import os

os.environ["MODELSCOPE_API_KEY"] = "your_modelscope_api_key"

response = litellm.completion(
    model="modelscope/Qwen/Qwen3.5-27B",
    messages=[{"role": "user", "content": "你好！"}],
)
print(response.choices[0].message.content)
```

**流式输出**：

```python
response = litellm.completion(
    model="modelscope/Qwen/Qwen3.5-27B",
    messages=[{"role": "user", "content": "你好！"}],
    stream=True,
)
for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

### 方式二：Proxy Server（基础版）

适合本地使用或不需要 UI 仪表板的场景，只需模型路由功能：

**config.yaml**：

```yaml
model_list:
  - model_name: qwen-modelscope
    litellm_params:
      model: modelscope/Qwen/Qwen3.5-27B
      api_key: your_modelscope_api_key

  # 可以配置 fallback 模型
  - model_name: qwen-fallback
    litellm_params:
      model: modelscope/Qwen/Qwen3-32B
      api_key: your_modelscope_api_key

litellm_settings:
  # 配置 fallback：主模型失败时自动切换
  fallbacks:
    - qwen-modelscope: [qwen-fallback]
  # 负载均衡策略
  routing_strategy: simple-shuffle
```

**启动**：

```bash
pip install 'litellm[proxy]'

litellm --config config.yaml --port 4000
```

**调用**：

```python
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="qwen-modelscope",
    messages=[{"role": "user", "content": "你好！"}]
)
print(response.choices[0].message.content)
```

curl 调用：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-modelscope",
    "messages": [{"role": "user", "content": "你好！"}]
  }'
```

### 方式三：Proxy Server（完整版，含 UI 仪表板）

如果需要 Web UI 管理仪表板、虚拟密钥和成本追踪功能，需要配置 PostgreSQL 数据库（LiteLLM 不支持 SQLite）。

**安装并启动 PostgreSQL**：

```bash
# macOS
brew install postgresql
brew services start postgresql
createdb litellm

# Linux (Docker)
docker run -d --name litellm-db -e POSTGRES_DB=litellm -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
```

**config.yaml**：

```yaml
model_list:
  - model_name: qwen-modelscope
    litellm_params:
      model: modelscope/Qwen/Qwen3.5-27B
      api_key: your_modelscope_api_key

  - model_name: qwen-fallback
    litellm_params:
      model: modelscope/Qwen/Qwen3-32B
      api_key: your_modelscope_api_key

litellm_settings:
  fallbacks:
    - qwen-modelscope: [qwen-fallback]
  routing_strategy: simple-shuffle

general_settings:
  master_key: "sk-1234"
  database_url: "postgresql://用户名:你的密码@localhost/litellm"
```

> 如果 PostgreSQL 是通过 `initdb` 默认初始化的（没有设置密码），可以省略用户名和密码，直接用 `postgresql://localhost/litellm`。如果设置了密码，格式为 `postgresql://用户名:你的密码@localhost/litellm`。

**启动后访问 UI**：

```bash
litellm --config config.yaml --port 4000
```

打开 `http://localhost:4000/ui`，使用 `master_key` 登录。

### Web UI 功能

LiteLLM 的 Web UI 提供了完整的管理能力，主要分为两大板块：

**AI Gateway**：

- **Virtual Keys**：创建和管理虚拟 API Key，可以为不同用户或项目分配独立的密钥，设置预算上限和过期时间
- **Models + Endpoints**：查看和管理已配置的模型和端点，支持添加、编辑、删除
- **Agentic**：Agent 相关配置
- **MCP Servers**：管理 MCP（Model Context Protocol）服务器，让 Agent 可以调用外部工具
- **Skills**：管理 Agent 技能
- **Guardrails**：配置输入输出内容过滤规则，如关键词拦截、PII 检测等
- **Tools**：管理可用工具

**Access Control**：

- **Teams**：按团队管理密钥和预算
- **Internal Users**：管理内部用户账号
- **Organizations**：组织级别的密钥和预算管理
- **Access Groups / Budgets**：访问组和预算管理，控制不同组的用量上限

**其他功能**：

- **Playground**：在线测试模型可用性，直接在浏览器中发送请求验证配置是否正确

![LiteLLM Playground 测试](../_resources/litellm-1.png)

- **Usage**：用量监测面板，按模型、密钥、用户维度查看 Token 使用量和成本

![LiteLLM 用量监测面板](../_resources/litellm-2.png)
