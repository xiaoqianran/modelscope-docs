<!-- modelscope-docs: Dify | ecosystem-integrations/api-usage/dify/dify_CN.md -->

# Dify

## 概述

Dify 是开源的 LLM 应用开发平台，提供可视化工作流编排、Agent 配置和 RAG 知识库搭建能力，支持从原型到生产的完整应用生命周期管理。

从 v1.0.0 版本开始，Dify 对架构做了拆分调整：原来内置在主仓库中的模型和工具被迁移出来，以插件形式存放在 `dify-official-plugins` 仓库中。这些插件通过 Dify Marketplace 分发，可在应用中按需安装。插件类型涵盖四大类：

- **Models**：模型提供商插件，配置后可在聊天机器人、Agent、工作流中使用对应模型
- **Tools**：工具插件，为 Agent 和工作流提供特定领域能力（数据分析、翻译、自定义集成等）
- **Agent Strategies**：Agent 策略插件，为 Agent 节点提供推理策略（CoT、ToT、Function Call、ReAct 等）
- **Extensions**：扩展插件，通过 HTTP Webhook 与外部系统集成

## 相关资源

| 资源 | 地址 |
|------|------|
| 插件仓库 | [langgenius/dify-official-plugins](https://github.com/langgenius/dify-official-plugins) |
| 主仓库 | [langgenius/dify](https://github.com/langgenius/dify) |
| 官方网站 | [dify.ai](https://dify.ai) |
| 文档 | [docs.dify.ai](https://docs.dify.ai) |
| 插件市场 | [marketplace.dify.ai](https://marketplace.dify.ai) |

## ModelScope 集成

Dify 通过模型提供商插件接入 ModelScope，使 Dify 应用能够调用 ModelScope 上的开源模型（Qwen、DeepSeek、GLM 等）。集成内容包括：

- ModelScope 模型提供商插件，支持 LLM 对话
- 模型列表同步：随 ModelScope 平台上线新模型，Dify 中的模型列表会同步更新
- 插件遵循 Dify 标准插件结构，包含 `manifest.yaml`、`provider.yaml`、模型定义文件等

## 接入流程

### 前置条件

已部署 Dify（v1.0.0+）或使用 Dify Cloud。

### 安装插件

1. 进入 Dify 应用 → 顶部导航栏点击「插件」
2. 在 Dify Marketplace 中搜索「ModelScope」
3. 点击安装

![Dify 配置 ModelScope 效果图 1](../_resources/dify-1.png)

### 配置 API Key

1. 前往 [ModelScope API 页面](https://modelscope.cn/docs/model-service/API-Inference/intro) 获取 API Key
2. 在 Dify 的「模型提供商」设置中，找到 ModelScope，填入 API Key

![Dify 配置 ModelScope 效果图 2](../_resources/dify-2.png)

### 在应用中使用

1. 在 Dify 的聊天机器人、Agent、工作流等应用中
2. 在模型选择处选择 ModelScope 提供的模型
3. 开始对话或执行任务

![Dify 配置 ModelScope 效果图 3](../_resources/dify-3.png)

### Dify 插件结构

Dify 的 ModelScope 插件遵循标准的插件结构：

```
models/
├── modelscope/
│   ├── manifest.yaml          # 插件清单（版本、权限等）
│   ├── provider/
│   │   ├── provider.yaml      # 模型提供商定义
│   │   ├── _icon.svg          # 图标
│   │   └── modelscope.py      # 接入逻辑
│   ├── models/                # 模型定义
│   │   ├── llm/              # LLM 模型
│   │   └── ...
│   └── requirements.txt       # Python 依赖
```

`provider.yaml` 中定义了模型提供商的元信息：

```yaml
provider:
  name: ModelScope
  models:
    - model_name: Qwen/Qwen3.5-27B
      model_type: llm
      model_properties:
        context_size: 32768
```