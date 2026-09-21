<!-- modelscope-docs: LangBot | ecosystem-integrations/api-usage/langbot/langbot_EN.md -->

# LangBot

## Overview

LangBot is a production-grade multi-platform intelligent bot development platform, positioned to bring LLM capabilities to any chat platform. Its design provides complete Agent infrastructure, including knowledge base orchestration, a plugin system, multi-pipeline architecture, and production-grade monitoring.

Core features:

- **Multi-channel access**: A single codebase covers platforms such as Discord, Telegram, Slack, LINE, QQ, WeChat, WeCom, Feishu, DingTalk, KOOK, Satori, Email, and Matrix
- **Multi-Provider support**: Built-in support for multiple model providers including OpenAI, Anthropic, DeepSeek, Google Gemini, xAI, Moonshot, Zhipu AI, Ollama, LM Studio, Dify, MCP, SiliconFlow, Alibaba Cloud Bailian, Volcano Engine Ark, and ModelScope
- **Web management panel**: Configure and manage bots through a browser interface without manually editing YAML
- **Multi-pipeline architecture**: Different scenarios can be configured with different bot pipelines
- **Production-grade**: Access control, rate limiting, sensitive word filtering, exception handling, and a complete monitoring panel
- **Plugin ecosystem**: Event-driven architecture supporting third-party plugin extensions
- **MCP protocol support**: Built-in MCP Server, allowing bot management via API and MCP

Deployment methods include starting with a single `uvx langbot` command, Docker Compose, one-click cloud deployment (Zeabur, Railway), and more.

## Resources

| Resource | URL |
|------|------|
| Repository | [RockChinQ/LangBot](https://github.com/RockChinQ/LangBot) |
| Official website | [langbot.app](https://langbot.app) |
| Documentation | [link.langbot.app/en/docs](https://link.langbot.app/en/docs) |
| Online Demo | [demo.langbot.dev](https://demo.langbot.dev) |

## ModelScope Integration

LangBot lists ModelScope as a supported model Provider (Gateway). After configuration in the Web management panel, open-source models on ModelScope can be used across all channels.

## Getting Started

Configure in the LangBot Web management panel:

1. Go to the "Model Configuration" page
2. Select ModelScope as the Provider
3. Enter the API Key
4. Select the models you want to use

![LangBot ModelScope configuration screenshot 1](../_resources/langbot1.png)

![LangBot ModelScope configuration screenshot 2](../_resources/langbot2.png)

### Platform access example (DingTalk as an example)

LangBot Bots can connect to various messaging platforms: Discord, Telegram, Slack, WeChat, QQ, Feishu, DingTalk, LINE, etc., used to receive message events from messaging platforms and invoke pipelines to process messages.

Taking DingTalk access as an example (for access methods on different platforms, refer to the official documentation: https://docs.langbot.app/zh/usage/platforms/readme):

#### One-click configuration (recommended)

LangBot supports one-click creation of a DingTalk application and auto-filling of credentials, without manual copy and paste.

1. Open the LangBot WebUI, go to Bots > Create Bot
2. Fill in the bot name, and select DingTalk as the platform/adapter
3. In the one-click create application area that appears below, click the "Start" button on the right

![LangBot ModelScope configuration screenshot 3](../_resources/langbot3.png)

4. Scan the popped-up QR code with DingTalk, and the mobile end will prompt you to select the organization to join

![LangBot ModelScope configuration screenshot 4](../_resources/langbot4.png)

5. After selecting the organization, you can create a new bot or select an existing bot

![LangBot ModelScope configuration screenshot 5](../_resources/langbot5.png)

6. After successful authorization, the mobile end will show "Configuration Successful", and the Client ID and Client Secret in the LangBot WebUI will be auto-filled

![LangBot ModelScope configuration screenshot 6](../_resources/langbot6.png)

7. Manually fill in the bot name (the name must match the bot created in DingTalk), as well as the bot code (required for features such as image recognition and file upload, which needs to be obtained from DingTalk Developer Backend > Bot Configuration)

![LangBot ModelScope configuration screenshot 7](../_resources/langbot7.png)

8. Click Submit to complete the creation
