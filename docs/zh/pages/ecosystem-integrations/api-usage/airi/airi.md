<!-- modelscope-docs: airi | ecosystem-integrations/api-usage/airi/airi_CN.md -->

# airi

## 概述

airi（Project AIRI）是自托管的 AI 伴侣项目，灵感来自 Neuro-sama。不是简单的聊天机器人，而是可在浏览器中运行、支持游戏交互和实时语音的虚拟角色。

airi 的技术栈大量使用 Web 技术（WebGPU、WebAudio、Web Workers、WebAssembly、WebSocket），可在现代浏览器中运行，也支持移动设备（PWA）。桌面版本可利用原生 NVIDIA CUDA 和 Apple Metal（通过 HuggingFace 的 candle 项目）加速推理。

核心特性：

- **虚拟形象**：支持 VRM 和 Live2D 模型，自动眨眼、自动视线追踪、空闲眼球运动
- **实时语音聊天**：多 Provider 语音合成（ElevenLabs、Microsoft/Azure、OpenAI 兼容、阿里云、Kokoro TTS），客户端语音识别和说话检测
- **游戏交互**：可以玩 Minecraft、Factorio，还有 Dome Keeper 的 PoC
- **多 LLM Provider**：支持 30+ 个 Provider，包括 OpenAI、Anthropic、DeepSeek、Qwen、Google Gemini、xAI、Groq、SiliconFlow、ModelScope 等
- **纯浏览器本地推理**：通过 WebGPU 支持浏览器内推理，无需服务端
- **多平台**：浏览器版本、桌面版本（macOS/Windows）、移动版本
- **记忆系统**：浏览器内数据库（DuckDB WASM / pglite），Memory Alaya（开发中）

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [moeru-ai/airi](https://github.com/moeru-ai/airi) |
| 官方网站 | [airi.moeru.ai](https://airi.moeru.ai) |
| Discord | [discord.gg/TgQ3Cu2F7A](https://discord.gg/TgQ3Cu2F7A) |

## ModelScope 集成

airi 将 ModelScope 列为支持的 LLM API Provider 之一。在设置中选择 ModelScope 后，airi 通过 ModelScope 的 OpenAI 兼容 API 调用 Qwen、DeepSeek、Kimi 等开源模型驱动对话。

## 接入流程

在 airi 的设置中选择 ModelScope 作为 LLM API Provider：

1. 打开 airi 设置
2. 在 LLM Provider 服务来源选项中选择 `ModelScope魔搭社区`
3. 填入 API Key
4. 选择模型

![airi 配置 ModelScope 效果图 1](../_resources/airi-1.png)

![airi 配置 ModelScope 效果图 2](../_resources/airi-2.png)

![airi 配置 ModelScope 效果图 3](../_resources/airi-3.png)

配置完成后，airi 即可使用 ModelScope 模型驱动对话。airi 支持在聊天中发送图片进行图像识别（需选择多模态模型）。

![airi 配置 ModelScope 效果图 5](../_resources/airi-5.png)

### 角色卡管理

在设置中可上传或创建新的角色卡。创建角色卡时可设定身份、行为等特征，构建专属 AI 伴侣。内置角色模型也可在「设置 → 角色模型」中选择。

![airi 配置 ModelScope 效果图 6](../_resources/airi-6.png)

![airi 配置 ModelScope 效果图 7](../_resources/airi-7.png)

![airi 配置 ModelScope 效果图 8](../_resources/airi-8.png)

![airi 配置 ModelScope 效果图 9](../_resources/airi-9.png)

选择模型后，可进行场景微调（视角、相机距离、模型朝向等参数）。

![airi 配置 ModelScope 效果图 10](../_resources/airi-10.png)