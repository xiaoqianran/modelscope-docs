<!-- modelscope-docs: LobeChat | ecosystem-integrations/api-usage/lobehub/lobehub_CN.md -->

# LobeChat

## 概述

LobeChat（LobeHub）是开源的、可一键自部署的 AI Agent / 多模型聊天框架，基于 Next.js。内置对 70+ 模型 provider 的原生适配，支持文本对话、语音、多模态、Function Call 插件与 Agent 编排。

核心特性：

- **开源、可一键自部署**：基于 Next.js，支持 Vercel / Docker / Zeabur / Sealos / 阿里云等部署方式，MIT 协议
- **70+ 原生模型 provider**：内置 OpenAI、Anthropic、Google、Azure、Bedrock、DeepSeek、Qwen、ModelScope、Ollama 等数十家 provider 的原生适配
- **多模型 / 多模态统一界面**：同一会话中切换不同 provider 与模型，支持文本对话、TTS/STT、视觉模型
- **OpenAI 兼容协议接入**：对提供 OpenAI 兼容推理 API 的平台可直接复用 OpenAI 调用链
- **Function Call / 插件系统**：可扩展的 Function Call 插件体系，支持工具调用与 Agent 编排
- **技能与 MCP**：内置技能商店，可安装 Skills、MCP，支持从 URL / GitHub 导入或上传 Zip
- **多渠道接入**：可接入 Slack、Telegram、Discord、微信等 IM 平台
- **本地模型支持**：通过 Ollama / LM Studio 接入本地模型，实现完全离线的私有部署
- **服务端代理转发**：对存在 CORS 限制的 provider 自动经服务端代理转发请求

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [lobehub/lobehub](https://github.com/lobehub/lobehub) |
| 官方文档 | [lobehub.com](https://lobehub.com) |
| ModelScope Provider 文档（中文） | [lobehub.com/docs/usage/providers/modelscope](https://lobehub.com/docs/usage/providers/modelscope) |
| 自部署环境变量参考 | [environment-variables/model-provider](https://lobehub.com/docs/self-hosting/environment-variables/model-provider) |
| ModelScope Access Token | [modelscope.cn/my/myaccesstoken](https://www.modelscope.cn/my/myaccesstoken) |

## ModelScope 集成

LobeChat 内置原生的 **ModelScope** provider（provider id 为 `modelscope`），通过 ModelScope 的 OpenAI 兼容推理 API 调用模型，无需手写自定义 endpoint。

- **provider id**：`modelscope`（显示名 `ModelScope`）
- **SDK 类型**：`openai`（走 OpenAI 兼容的 chat completions 协议）
- **接口地址**：`https://api-inference.modelscope.cn/v1`（base_url）
- **连通性检测模型**：`Qwen/Qwen3-4B`（LobeChat 用该模型测试 API Key 是否可用）
- **模型列表**：动态拉取（运行时从 ModelScope 获取可用模型列表），也可手动指定
- **服务端代理**：因 CORS，浏览器端直连被禁用，请求经 LobeChat 服务端代理转发
- **环境变量**：设置 `MODELSCOPE_API_KEY` 后 provider 自动启用（`ENABLED_MODELSCOPE` 默认随 API Key 置为 true）

推荐使用的模型：`Qwen/Qwen3.5-397B-A17B`、`deepseek-ai/DeepSeek-V4-Flash-0731`。

## 接入流程

### 方式一：在 UI 中配置（推荐）

**第一步：启用 ModelScope 服务商**

进入 **设置 → 智能体**，选择 **AI 服务商**，在列表中找到 **ModelScope** 选项并启用。

![LobeChat 启用 ModelScope 服务商](../_resources/lobehub-1.png)

**第二步：配置 API Key 并启用模型**

在已启用的服务商中选择 **ModelScope**，填入 ModelScope API Token（从 [modelscope.cn/my/myaccesstoken](https://www.modelscope.cn/my/myaccesstoken) 获取）。接口代理地址默认即 `https://api-inference.modelscope.cn/v1`，无需修改。点击「获取模型列表」拉取可用模型，选择需要的模型进行启用，即可开始对话。例如可启用 `Qwen/Qwen3.5-397B-A17B` 与 `deepseek-ai/DeepSeek-V4-Flash-0731`。

![LobeChat 配置 ModelScope API Key 与模型](../_resources/lobehub-2.png)

### 方式二：自部署（Docker / .env）

在 `.env` 中配置：

```bash
ENABLED_MODELSCOPE=1
MODELSCOPE_API_KEY=your_modelscope_api_token
MODELSCOPE_MODEL_LIST=Qwen/Qwen3.5-397B-A17B,deepseek-ai/DeepSeek-V4-Flash-0731
```

`docker-compose.yml`：

```yaml
environment:
  - ENABLED_MODELSCOPE=1
  - MODELSCOPE_API_KEY=your_modelscope_api_token
  - MODELSCOPE_MODEL_LIST=Qwen/Qwen3.5-397B-A17B,deepseek-ai/DeepSeek-V4-Flash-0731
```

> 只要配了 `MODELSCOPE_API_KEY`，`ENABLED_MODELSCOPE` 会自动置为 `true`，理论上可省略，但建议显式写出。

## 功能特性

### 服务模型设置

在 **智能体 → 服务模型设置** 中，可以为各个功能单独选择合适的模型，包括：

- **新建助理**：新建助手时使用的模型
- **话题自动命名**：为对话话题自动命名
- **AI 图片话题命名**：基于图片生成话题名
- **消息内容翻译**：翻译消息内容
- **会话历史压缩**：压缩会话历史以控制上下文长度
- **档案信息生成**：生成用户档案信息

此外，还可以为记忆功能单独配置大模型，包括记忆分析、记忆画像写入、记忆项量化等，实现高效的记忆管理。

![LobeChat 服务模型设置](../_resources/lobehub-3.png)

### IM 渠道接入

LobeHub 可以接入 IM 聊天平台，包括 Slack、Telegram、Discord、WeChat（Pro）等。其中微信（WeChat）需要升级订阅（Pro）才可以使用。

![LobeChat IM 渠道接入](../_resources/lobehub-4.png)

### 技能与 MCP

在 **智能体 → 技能** 选项中，可以查看技能列表，也可以在技能商店中安装技能（Skills）、MCP 等，并且支持从 URL 或 GitHub 导入、上传 Zip 包，以及添加自定义的 MCP 功能。

![LobeChat 技能与 MCP](../_resources/lobehub-5.png)

### 通用设置与套餐

在 **设置 → 通用** 和 **套餐** 选项中，可以查看数据统计、套餐与账单，设置外观、设备连接、快捷键、通知等功能。

![LobeChat 通用设置与套餐](../_resources/lobehub-6.png)

## 注意事项

1. **原生 provider**：LobeChat 内置 ModelScope provider，无需配置 OpenAI 兼容自定义 endpoint
2. **CORS 限制**：ModelScope provider 的浏览器直连被禁用（`disableBrowserRequest: true`），需通过 LobeChat 服务端代理转发，自部署时确保服务端可达 ModelScope
3. **模型 ID 格式**：使用 ModelScope 上的模型 ID（带 namespace 前缀，如 `Qwen/Qwen3.5-397B-A17B`、`deepseek-ai/DeepSeek-V4-Flash-0731`），可在 [modelscope.cn/models](https://modelscope.cn/models?filter=inference_type&page=1) 查找推理可用模型
4. **覆盖范围**：当前 provider 走 OpenAI 兼容的 chat completions 文本对话；文生图/多模态端点未在 provider 中单独配置
