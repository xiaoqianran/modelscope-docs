<!-- modelscope-docs: AstrBot | ecosystem-integrations/api-usage/astrbot/astrbot_EN.md -->

# AstrBot

## Overview

AstrBot is an open-source, all-in-one AI Agent chatbot platform that integrates mainstream IM platform access, LLM conversation, multimodal processing, Agent capabilities, and a plugin system. It can be used both as a personal AI assistant and as a development framework for secondary development.

Supported IM platforms include QQ (including the OneBot v11 protocol), WeCom, WeChat Official Account, Feishu (Lark), DingTalk, Telegram, Slack, Discord, QQ Channel, LINE, Satori, KOOK, Misskey, Mattermost, and more. The community has also contributed adapters such as Matrix and Rocket.Chat.

Supported model services cover OpenAI, Anthropic, Google Gemini, Moonshot AI, Zhipu AI, DeepSeek, Ollama, LM Studio, ModelScope, OneAPI, Dify, Alibaba Cloud Bailian, Coze, and more, as well as a variety of TTS/STT voice services.

Core features:

- **1000+ plugin extensions**: A community-driven plugin ecosystem with one-click installation
- **Agent Sandbox**: An isolated code execution environment that supports safely running Shell commands and code
- **WebUI management panel**: A browser interface for managing configuration
- **Web ChatUI**: A built-in web chat interface with Agent Sandbox and web search
- **Role-playing and emotional companionship**: Supports Persona settings and emotional interaction
- **Multimodal**: Supports image and voice input/output
- **MCP protocol**: Native support for Model Context Protocol
- **Adaptive reasoning**: Automatic context compression, supports Reasoning models
- **Internationalization**: Supports multiple languages (i18n)

Multiple deployment methods are available: a single `uv tool install` command, Docker, a desktop client (AstrBot Desktop), panel deployment (BT Panel/1Panel/CasaOS), AUR, Replit, and more.

## Resources

| Resource | URL |
|------|------|
| Repository | [AstrBotDevs/AstrBot](https://github.com/AstrBotDevs/AstrBot) |
| Official documentation | [docs.astrbot.app](https://docs.astrbot.app) |
| Desktop client | [AstrBotDevs/AstrBot-desktop](https://github.com/AstrBotDevs/AstrBot-desktop) |

## ModelScope Integration

AstrBot lists ModelScope as a supported LLM service provider. Once configured in the WebUI panel, open-source models on ModelScope (Qwen, DeepSeek, GLM, etc.) can be used across all IM channels.

## Getting Started

Configure it in the AstrBot WebUI panel:

1. Go to "Model Provider" settings
2. Select ModelScope
3. Enter your ModelScope API Key
4. Select a model and start using it (click to fetch the model list for selection, or customize a model)

API Key acquisition: [ModelScope API documentation](https://modelscope.cn/docs/model-service/API-Inference/intro)

![AstrBot ModelScope configuration screenshot 1](../_resources/astrbot1.png)

![AstrBot ModelScope configuration screenshot 2](../_resources/astrbot2.png)

![AstrBot ModelScope configuration screenshot 3](../_resources/astrbot3.png)

- After configuration, describe your needs in the chat and AstrBot will automatically generate a reply.
- In addition to regular conversation, AstrBot supports file uploads, including image recognition (requires a vision multimodal model).

![AstrBot ModelScope configuration screenshot 4](../_resources/astrbot4.png)

![AstrBot ModelScope configuration screenshot 7](../_resources/astrbot7.png)

- In addition, you can configure a platform bot for AstrBot and enable the Agent's permission to use the computer. Taking DingTalk integration as an example, it supports manually filling in fields as well as creating a bot via DingTalk one-click QR code scanning.

![AstrBot ModelScope configuration screenshot 5](../_resources/astrbot5.png)

![AstrBot ModelScope configuration screenshot 6](../_resources/astrbot6.png)

- AstrBot also provides features such as knowledge base Q&A and persona settings, supporting the building of personalized AI assistants.
