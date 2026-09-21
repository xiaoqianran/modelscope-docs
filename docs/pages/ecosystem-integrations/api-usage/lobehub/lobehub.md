<!-- modelscope-docs: LobeChat | ecosystem-integrations/api-usage/lobehub/lobehub_EN.md -->

# LobeChat

## Overview

LobeChat (LobeHub) is an open-source, one-click self-deployable AI Agent / multi-model chat framework built on Next.js. It ships with native adapters for 70+ model providers and supports text conversation, voice, multimodal, Function Call plugins, and Agent orchestration.

Core features:

- **Open-source and one-click self-deployable**: Built on Next.js, supports deployment via Vercel / Docker / Zeabur / Sealos / Alibaba Cloud, under the MIT license
- **70+ native model providers**: Ships with native adapters for dozens of providers including OpenAI, Anthropic, Google, Azure, Bedrock, DeepSeek, Qwen, ModelScope, and Ollama
- **Unified multi-model / multimodal interface**: Switch between providers and models within the same session; supports text conversation, TTS/STT, and vision models
- **OpenAI-compatible protocol access**: Platforms that expose an OpenAI-compatible inference API can directly reuse the OpenAI calling chain
- **Function Call / plugin system**: An extensible Function Call plugin system that supports tool invocation and Agent orchestration
- **Skills and MCP**: Built-in skill store where you can install Skills and MCP; supports importing from a URL / GitHub or uploading a Zip package
- **Multi-channel access**: Connect to IM platforms such as Slack, Telegram, Discord, and WeChat
- **Local model support**: Connect local models through Ollama / LM Studio to achieve a fully offline private deployment
- **Server-side proxy forwarding**: For providers subject to CORS restrictions, requests are automatically forwarded through the LobeChat server-side proxy

## Resources

| Resource | URL |
|----------|-----|
| Repository | [lobehub/lobehub](https://github.com/lobehub/lobehub) |
| Official documentation | [lobehub.com](https://lobehub.com) |
| ModelScope Provider documentation (Chinese) | [lobehub.com/docs/usage/providers/modelscope](https://lobehub.com/docs/usage/providers/modelscope) |
| Self-hosting environment variable reference | [environment-variables/model-provider](https://lobehub.com/docs/self-hosting/environment-variables/model-provider) |
| ModelScope Access Token | [modelscope.cn/my/myaccesstoken](https://www.modelscope.cn/my/myaccesstoken) |

## ModelScope Integration

LobeChat ships with a native **ModelScope** provider (provider id `modelscope`) that calls models through ModelScope's OpenAI-compatible inference API, with no need to hand-write a custom endpoint.

- **provider id**: `modelscope` (display name `ModelScope`)
- **SDK type**: `openai` (uses the OpenAI-compatible chat completions protocol)
- **API endpoint**: `https://api-inference.modelscope.cn/v1` (base_url)
- **Connectivity test model**: `Qwen/Qwen3-4B` (LobeChat uses this model to test whether the API Key is usable)
- **Model list**: Dynamically fetched (the available model list is retrieved from ModelScope at runtime); can also be specified manually
- **Server-side proxy**: Due to CORS, direct browser access is disabled, and requests are forwarded through the LobeChat server-side proxy
- **Environment variable**: Set `MODELSCOPE_API_KEY` and the provider is automatically enabled (`ENABLED_MODELSCOPE` defaults to true alongside the API Key)

Recommended models: `Qwen/Qwen3.5-397B-A17B`, `deepseek-ai/DeepSeek-V4-Flash-0731`.

## Getting Started

### Method 1: Configure in the UI (Recommended)

**Step 1: Enable the ModelScope provider**

Go to **Settings → Agent**, select **AI Provider**, find the **ModelScope** option in the list, and enable it.

![LobeChat enable ModelScope provider](../_resources/lobehub-1.png)

**Step 2: Configure the API Key and enable models**

From the list of enabled providers, select **ModelScope** and enter your ModelScope API Token (obtained from [modelscope.cn/my/myaccesstoken](https://www.modelscope.cn/my/myaccesstoken)). The API proxy address defaults to `https://api-inference.modelscope.cn/v1` and does not need to be modified. Click "Fetch Model List" to retrieve available models, then select the models you need to enable to start chatting. For example, you can enable `Qwen/Qwen3.5-397B-A17B` and `deepseek-ai/DeepSeek-V4-Flash-0731`.

![LobeChat configure ModelScope API Key and models](../_resources/lobehub-2.png)

### Method 2: Self-hosting (Docker / .env)

Configure in `.env`:

```bash
ENABLED_MODELSCOPE=1
MODELSCOPE_API_KEY=your_modelscope_api_token
MODELSCOPE_MODEL_LIST=Qwen/Qwen3.5-397B-A17B,deepseek-ai/DeepSeek-V4-Flash-0731
```

`docker-compose.yml`:

```yaml
environment:
  - ENABLED_MODELSCOPE=1
  - MODELSCOPE_API_KEY=your_modelscope_api_token
  - MODELSCOPE_MODEL_LIST=Qwen/Qwen3.5-397B-A17B,deepseek-ai/DeepSeek-V4-Flash-0731
```

> As long as `MODELSCOPE_API_KEY` is configured, `ENABLED_MODELSCOPE` is automatically set to `true`, so it can technically be omitted, but writing it explicitly is recommended.

## Features

### Service Model Settings

In **Agent → Service Model Settings**, you can select an appropriate model for each function individually, including:

- **New assistant**: The model used when creating a new assistant
- **Topic auto-naming**: Automatically names conversation topics
- **AI image topic naming**: Generates topic names based on images
- **Message content translation**: Translates message content
- **Conversation history compression**: Compresses conversation history to control context length
- **Profile information generation**: Generates user profile information

In addition, you can configure a large model separately for the memory feature, including memory analysis, memory profile writing, and memory item quantization, enabling efficient memory management.

![LobeChat service model settings](../_resources/lobehub-3.png)

### IM Channel Access

LobeHub can connect to IM chat platforms, including Slack, Telegram, Discord, WeChat (Pro), and others. Among them, WeChat requires a subscription upgrade (Pro) to use.

![LobeChat IM channel access](../_resources/lobehub-4.png)

### Skills and MCP

In **Agent → Skills**, you can view the skill list and install Skills and MCP in the skill store. It also supports importing from a URL or GitHub, uploading a Zip package, and adding custom MCP features.

![LobeChat skills and MCP](../_resources/lobehub-5.png)

### General Settings and Plans

In **Settings → General** and **Plans**, you can view data statistics, plans and billing, and configure features such as appearance, device connections, shortcuts, and notifications.

![LobeChat general settings and plans](../_resources/lobehub-6.png)

## Notes

1. **Native provider**: LobeChat ships with a built-in ModelScope provider; there is no need to configure an OpenAI-compatible custom endpoint
2. **CORS restrictions**: Direct browser access for the ModelScope provider is disabled (`disableBrowserRequest: true`); requests must be forwarded through the LobeChat server-side proxy, so ensure the server can reach ModelScope when self-hosting
3. **Model ID format**: Use the model IDs as they appear on ModelScope (with a namespace prefix, such as `Qwen/Qwen3.5-397B-A17B`, `deepseek-ai/DeepSeek-V4-Flash-0731`); you can find models available for inference at [modelscope.cn/models](https://modelscope.cn/models?filter=inference_type&page=1)
4. **Coverage scope**: The provider currently runs on the OpenAI-compatible chat completions text conversation; text-to-image / multimodal endpoints are not separately configured in the provider
