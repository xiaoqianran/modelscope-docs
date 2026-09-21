<!-- modelscope-docs: nanobot | ecosystem-integrations/api-usage/nanobot/nanobot_EN.md -->

## Overview

nanobot is an open-source lightweight personal AI Agent runtime, created by Xubin Ren. The design philosophy is to keep the Agent core small and readable, while providing features such as WebUI, chat channels, tools, memory, and automation outside the core, supporting 24/7 operation.

Core features:

- **WebUI and Terminal**: Built-in browser management interface, also supports command-line interaction
- **Multi-channel Chat**: Connect to chat platforms such as Telegram, Discord, WeChat, Slack, Email, Mattermost, DingTalk, Feishu, QQ, Wecom, Microsoft Teams, WhatsApp, Matrix, etc.
- **Tool System**: File read/write, Shell, web search, web scraping, MCP, scheduled tasks, image generation, sub-Agents. Supports connecting third-party tool applications such as 1Password CLI, Blender, Browser, etc., invoked via `@` in conversations
- **Skills**: Instruction skills that can be dynamically loaded in conversations, viewable and manageable in the WebUI
- **Memory System**: Session history and long-term memory (implemented via Dream)
- **Long-term Goals and Automation**: Supports persistent goal-based tasks and scheduled automation
- **Model Routing**: Supports OpenAI-compatible API, local LLM, image generation, search, and fallback models
- **Independent API Configuration**: WebUI supports separate configuration of APIs for LLM, Voice, Image, and Web Search
- **Flexible Deployment**: Run locally or as a server-side Agent gateway, supports background running (`--background`)
- **Python SDK and OpenAI-compatible API**: Facilitates integration with other systems

Installation methods include one-line installation (macOS/Linux/Windows), `uv tool install`, `pip install`, and installation from source.

## Resources

| Resource | URL |
|----------|-----|
| Repository | [HKUDS/nanobot](https://github.com/HKUDS/nanobot) |
| Documentation | [nanobot.wiki/docs](https://nanobot.wiki/docs/latest/getting-started/nanobot-overview) |
| GitHub Docs | [HKUDS/nanobot/blob/main/docs](https://github.com/HKUDS/nanobot/blob/main/docs/README.md) |

## ModelScope Integration

nanobot registers ModelScope as a built-in model provider, with the endpoint `https://api-inference.modelscope.cn/v1` using Bearer authentication. Once configured, you can use open-source models on ModelScope. Supported integration capabilities include:

- LLM chat
- Text-to-image (image-generation): ModelScope's text-to-image model can be configured in the WebUI's Image settings
- Visual understanding (image-text-to-text)

After configuration, nanobot's model router automatically selects the appropriate model based on the task type, with ModelScope participating in routing as an inference source.

## Getting Started

### 1. Install and Launch WebUI

```bash
# Install nanobot
pip install nanobot-ai

# Launch WebUI
nanobot gateway
```

After launching, visit `http://127.0.0.1:8765` to open the WebUI panel.

### 2. Configure ModelScope in WebUI

In the WebUI settings page, add ModelScope as a Provider:

- **Provider**: In the Models settings, select ModelScope to configure
- **API Base**: `https://api-inference.modelscope.cn/v1`
- **API Key**: Enter your ModelScope API Key
- **Model**: Select ModelScope as the model provider in the Provider dropdown, and select a model in Model, such as `Qwen/Qwen3.5-27B`

Once configured, you can chat directly in the WebUI, or use it through connected chat apps (Telegram, Discord, WeChat, etc.).

<details>
<summary>Or configure via config.json (optional)</summary>

```json
{
  "providers": {
    "modelscope": {
      "apiKey": "your_modelscope_api_key",
      "apiBase": "https://api-inference.modelscope.cn/v1"
    }
  },
  "modelPresets": {
    "primary": {
      "label": "Primary",
      "provider": "modelscope",
      "model": "Qwen/Qwen3.5-27B",
      "maxTokens": 8192,
      "contextWindowTokens": 32768,
      "temperature": 0.1
    }
  },
  "agents": {
    "defaults": {
      "modelPreset": "primary"
    }
  }
}
```

</details>

![nanobot ModelScope configuration screenshot 1](../_resources/nanobot-1.png)

![nanobot ModelScope configuration screenshot 2](../_resources/nanobot-2.png)

![nanobot ModelScope configuration screenshot 3](../_resources/nanobot-3.png)

### 3. Tools

nanobot supports connecting various tool applications in the WebUI. Once connected, they can be invoked via `@` in conversations. Supported tools include 1Password CLI, 3MF, AdGuardHome, Blender, Browser, CC Switch, etc. Additional tools can also be connected via the MCP protocol.

![nanobot skill management](../_resources/nanobot-4.png)

### 4. Skills

nanobot supports a skills system. Skills are instruction templates that can be dynamically loaded in conversations. You can view and manage the list of skills available to the current Agent in the WebUI.

![nanobot chat channel configuration](../_resources/nanobot-5.png)

### 5. Chat Apps

nanobot supports connecting to multiple chat platforms, including Telegram, Discord, WeChat, Slack, Email, Mattermost, DingTalk, Feishu, QQ, Wecom, Microsoft Teams, WhatsApp, Matrix, etc. Each channel can be independently configured in the WebUI's Channels settings.

The following shows the channel configuration interface with DingTalk as an example:

![nanobot tool configuration](../_resources/nanobot-6.png)

### 6. Web Search Configuration

nanobot's WebUI supports independent configuration of the web search API. You can choose from multiple Search Providers, including DuckDuckGo, Brave Search, Tavily, SearXNG, Jina, etc.

![nanobot web search configuration](../_resources/nanobot-7.png)

### 7. Image Generation Configuration

nanobot's WebUI supports independent configuration of the image generation (Image) API. The following shows the configuration interface with ModelScope's text-to-image model as an example:

![nanobot image generation configuration](../_resources/nanobot-8.png)
