<!-- modelscope-docs: LiteLLM | ecosystem-integrations/api-usage/litellm/litellm_EN.md -->

## Overview

LiteLLM is an open-source AI Gateway that provides a unified interface to call 100+ LLM Providers. The core problem it solves: different LLM providers have different SDKs, authentication methods, request formats, and error types, making management highly complex. LiteLLM unifies all calls through a single OpenAI-compatible interface — existing code barely needs to change; you only need to update the `model` parameter and API Key.

LiteLLM has two usage modes:

**Python SDK**: Call directly in code, suitable for integration within your own application. The built-in Router supports retry and fallback logic across multiple deployments, for example automatically switching to a backup model when the primary model goes down.

**Proxy Server (AI Gateway)**: Deployed as a centralized service, suitable for team or organization-level use. Core capabilities include:

- **Virtual key management**: Generate independent API Keys for different users/projects, with configurable budget limits
- **Cost tracking**: Track Token usage and costs by project, user, and model dimensions
- **Load balancing**: Automatically distribute traffic across multiple deployments of the same model
- **Guardrails**: Filter input and output content
- **Logging**: Complete request logging and observability
- **Management dashboard**: Web UI to manage all configurations
- **8ms P95 latency** (at 1000 RPS)

It supports 100+ Providers, covering endpoints such as `/chat/completions`, `/messages`, `/responses`, `/embeddings`, `/images`, `/audio`, `/batches`, `/rerank`, and `/a2a`. It also supports MCP tool integration and the A2A (Agent-to-Agent) protocol, and can be used directly in Cursor IDE via MCP.

Deployment options include Docker, Helm, and one-click Terraform deployments for AWS and GCP.

## Resources

| Resource | URL |
|------|------|
| Repository | [BerriAI/litellm](https://github.com/BerriAI/litellm) |
| Official documentation | [docs.litellm.ai](https://docs.litellm.ai) |
| ModelScope Provider documentation | [docs.litellm.ai/docs/providers/modelscope](https://docs.litellm.ai/docs/providers/modelscope) |
| Website | [litellm.ai](https://litellm.ai) |
| Supported Provider list | [docs.litellm.ai/docs/providers](https://docs.litellm.ai/docs/providers) |

## ModelScope Integration

LiteLLM lists ModelScope as a supported OpenAI-compatible Provider. Once connected, you can call open-source models on ModelScope through LiteLLM's unified interface. Supported endpoints:


| Endpoint              | Supported |
| -------------------- | --- |
| `/chat/completions`  | ✅   |
| `/messages`          | ✅   |
| `/responses`         | ✅   |
| `/embeddings`        | —   |
| `/image/generations` | ✅   |


When using ModelScope in LiteLLM, the model name must be prefixed with `modelscope/` (e.g., `modelscope/Qwen/Qwen3.5-27B`).

## Getting Started

### Method 1: Python SDK

Call directly in code:

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

**Streaming output**:

```python
response = litellm.completion(
    model="modelscope/Qwen/Qwen3.5-27B",
    messages=[{"role": "user", "content": "你好！"}],
    stream=True,
)
for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

### Method 2: Proxy Server (Basic)

Suitable for local use or scenarios that do not require a UI dashboard, where only model routing functionality is needed:

**config.yaml**:

```yaml
model_list:
  - model_name: qwen-modelscope
    litellm_params:
      model: modelscope/Qwen/Qwen3.5-27B
      api_key: your_modelscope_api_key

  # Fallback model can be configured
  - model_name: qwen-fallback
    litellm_params:
      model: modelscope/Qwen/Qwen3-32B
      api_key: your_modelscope_api_key

litellm_settings:
  # Configure fallback: automatically switch when the primary model fails
  fallbacks:
    - qwen-modelscope: [qwen-fallback]
  # Load balancing strategy
  routing_strategy: simple-shuffle
```

**Start**:

```bash
pip install 'litellm[proxy]'

litellm --config config.yaml --port 4000
```

**Call**:

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

Call with curl:

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-modelscope",
    "messages": [{"role": "user", "content": "你好！"}]
  }'
```

### Method 3: Proxy Server (Full version, with UI dashboard)

If you need the Web UI management dashboard, virtual keys, and cost tracking, you must configure a PostgreSQL database (LiteLLM does not support SQLite).

**Install and start PostgreSQL**:

```bash
# macOS
brew install postgresql
brew services start postgresql
createdb litellm

# Linux (Docker)
docker run -d --name litellm-db -e POSTGRES_DB=litellm -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
```

**config.yaml**:

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
  database_url: "postgresql://username:your_password@localhost/litellm"
```

> If PostgreSQL was initialized via `initdb` by default (without a password set), you can omit the username and password and use `postgresql://localhost/litellm` directly. If a password is set, the format is `postgresql://username:your_password@localhost/litellm`.

**Access the UI after starting**:

```bash
litellm --config config.yaml --port 4000
```

Open `http://localhost:4000/ui` and log in with the `master_key`.

### Web UI Features

LiteLLM's Web UI provides comprehensive management capabilities, divided into two main sections:

**AI Gateway**:

- **Virtual Keys**: Create and manage virtual API Keys; you can assign independent keys to different users or projects, with configurable budget limits and expiration times
- **Models + Endpoints**: View and manage configured models and endpoints, supporting add, edit, and delete
- **Agentic**: Agent-related configuration
- **MCP Servers**: Manage MCP (Model Context Protocol) servers, enabling Agents to call external tools
- **Skills**: Manage Agent skills
- **Guardrails**: Configure input/output content filtering rules, such as keyword blocking and PII detection
- **Tools**: Manage available tools

**Access Control**:

- **Teams**: Manage keys and budgets by team
- **Internal Users**: Manage internal user accounts
- **Organizations**: Organization-level key and budget management
- **Access Groups / Budgets**: Access group and budget management, controlling usage limits for different groups

**Other features**:

- **Playground**: Test model availability online; send requests directly in the browser to verify whether the configuration is correct

![LiteLLM Playground testing](../_resources/litellm-1.png)

- **Usage**: Usage monitoring panel; view Token usage and costs by model, key, and user dimensions

![LiteLLM usage monitoring panel](../_resources/litellm-2.png)
