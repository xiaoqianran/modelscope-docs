<!-- modelscope-docs: Dify | ecosystem-integrations/api-usage/dify/dify_EN.md -->

# Dify

## Overview

Dify is an open-source LLM application development platform that provides visual workflow orchestration, Agent configuration, and RAG knowledge base building capabilities, supporting the full application lifecycle from prototype to production.

Starting from v1.0.0, Dify restructured its architecture: the models and tools originally built into the main repository were migrated out and stored as plugins in the `dify-official-plugins` repository. These plugins are distributed through the Dify Marketplace and can be installed on demand within applications. Plugin types fall into four categories:

- **Models**: Model provider plugins that, once configured, allow corresponding models to be used in chatbots, Agents, and workflows
- **Tools**: Tool plugins that provide domain-specific capabilities for Agents and workflows (data analysis, translation, custom integrations, etc.)
- **Agent Strategies**: Agent strategy plugins that provide reasoning strategies for Agent nodes (CoT, ToT, Function Call, ReAct, etc.)
- **Extensions**: Extension plugins that integrate with external systems via HTTP Webhook

## Resources

| Resource | URL |
|------|------|
| Plugin repository | [langgenius/dify-official-plugins](https://github.com/langgenius/dify-official-plugins) |
| Main repository | [langgenius/dify](https://github.com/langgenius/dify) |
| Official website | [dify.ai](https://dify.ai) |
| Documentation | [docs.dify.ai](https://docs.dify.ai) |
| Plugin marketplace | [marketplace.dify.ai](https://marketplace.dify.ai) |

## ModelScope Integration

Dify connects to ModelScope through a model provider plugin, enabling Dify applications to call open-source models on ModelScope (Qwen, DeepSeek, GLM, etc.). The integration includes:

- A ModelScope model provider plugin that supports LLM chat
- Model list synchronization: as new models come online on the ModelScope platform, the model list in Dify is updated synchronously
- The plugin follows the standard Dify plugin structure, containing `manifest.yaml`, `provider.yaml`, model definition files, etc.

## Getting Started

### Prerequisites

Dify (v1.0.0+) has been deployed, or Dify Cloud is in use.

### Install the Plugin

1. Go to the Dify application → click "Plugins" in the top navigation bar
2. Search for "ModelScope" in the Dify Marketplace
3. Click Install

![Dify ModelScope configuration screenshot 1](../_resources/dify-1.png)

### Configure the API Key

1. Go to the [ModelScope API page](https://modelscope.cn/docs/model-service/API-Inference/intro) to obtain an API Key
2. In Dify's "Model Providers" settings, find ModelScope and enter the API Key

![Dify ModelScope configuration screenshot 2](../_resources/dify-2.png)

### Use in Applications

1. In Dify applications such as chatbots, Agents, and workflows
2. Select a model provided by ModelScope at the model selection step
3. Start a conversation or execute a task

![Dify ModelScope configuration screenshot 3](../_resources/dify-3.png)

### Dify Plugin Structure

Dify's ModelScope plugin follows the standard plugin structure:

```
models/
├── modelscope/
│   ├── manifest.yaml          # Plugin manifest (version, permissions, etc.)
│   ├── provider/
│   │   ├── provider.yaml      # Model provider definition
│   │   ├── _icon.svg          # Icon
│   │   └── modelscope.py      # Integration logic
│   ├── models/                # Model definitions
│   │   ├── llm/              # LLM models
│   │   └── ...
│   └── requirements.txt       # Python dependencies
```

`provider.yaml` defines the metadata of the model provider:

```yaml
provider:
  name: ModelScope
  models:
    - model_name: Qwen/Qwen3.5-27B
      model_type: llm
      model_properties:
        context_size: 32768
```
