<!-- modelscope-docs: CowAgent | ecosystem-integrations/api-usage/cowagent/cowagent_EN.md -->

# CowAgent

## Overview

CowAgent (formerly ChatGPT-on-WeChat) is an open-source personal AI assistant and Agent framework. The project has evolved from a simple WeChat chatbot into a full Agent platform, and now supports task planning, long-term memory, knowledge bases, a skill system, and the MCP protocol.

Its architecture is designed around an "Agent Harness": after messages arrive from various channels, the Agent Core is responsible for planning tasks, retrieving context from memory and the knowledge base, invoking tools and skills, and finally generating a reply through the model that is returned to the originating channel. Each layer is decoupled and can scale independently.

Core capabilities:

- **Task planning**: Decomposes complex tasks into multiple steps that are executed sequentially, invoking tools in a loop until completion.
- **Three-tier memory architecture**: Conversation context (short-term) → daily memory (medium-term) → MEMORY.md (long-term), with automatic memory distillation performed at night.
- **Knowledge base**: Automatically distills structured knowledge from conversations to build a Markdown wiki and a visualized knowledge graph.
- **Skill system**: Supports one-click installation of skills from the Skill Hub or GitHub, or creating custom skills through natural-language conversation.
- **Tool system**: Built-in tools for file read/write, terminal, browser, timers, memory retrieval, web search, and more, with native support for the MCP protocol.
- **Multi-channel**: Web console, WeChat, Feishu, DingTalk, WeCom, QQ, WeChat Official Account, Telegram, Slack, Discord.

Installation is supported via one-line command installation (Linux/macOS/Windows), Docker, and desktop clients (macOS/Windows).

## Resources

| Resource | URL |
|----------|-----|
| Repository | [zhayujie/chatgpt-on-wechat](https://github.com/zhayujie/chatgpt-on-wechat) |
| Official website | [cowagent.ai](https://cowagent.ai) |
| Documentation | [docs.cowagent.ai](https://docs.cowagent.ai) |
| Skill marketplace | [skills.cowagent.ai](https://skills.cowagent.ai) |

## ModelScope Integration

CowAgent integrates with open-source models on ModelScope via the ModelScope API-Inference, including:

- ModelScope as a model provider, supporting LLM conversations for series such as Qwen and DeepSeek.
- Text-to-image support: Text-to-image models (such as `Qwen/Qwen-Image-2512`) can be invoked through ModelScope.



## Getting Started

Configure ModelScope as the model provider in `config.json`:

```json
{
  "bot_type": "modelscope",
  "model": "Qwen/Qwen3.5-397B-A17B",
  "modelscope_api_key": "your_api_key",
  "modelscope_base_url": "https://api-inference.modelscope.cn/v1/chat/completions",
  "text_to_image": "Qwen/Qwen-Image-2512"
}
```

Supported optional models include: `Qwen/Qwen3.5-397B-A17B`, `deepseek-ai/DeepSeek-V4-Flash-0731`, `deepseek-ai/DeepSeek-V4-Pro`, `Qwen/Qwen3.5-27B`, and more. For additional models, see: [ModelScope inference model list](https://www.modelscope.cn/models?filter=inference_type&page=1)

In the model configuration settings, select ModelScope as the model provider and fill in the API-Key to start using it.

![CowAgent using ModelScope - screenshot 2](../_resources/cow2.png)

Once configured, you can start using it. In CowAgent, ModelScope supports not only LLM conversations but also text-to-image functionality. For ModelScope-supported text-to-image models, see: [ModelScope text-to-image model list](https://modelscope.cn/models?filter=inference_type&page=1&tabKey=task&tasks=hotTask:text-to-image-synthesis&type=tasks)

![CowAgent using ModelScope - screenshot 1](../_resources/cow1.png)

![CowAgent using ModelScope - screenshot 3](../_resources/cow3.png)

In addition, CowAgent also supports standard Agent capabilities, including task planning, knowledge base, skill system, tool system, and more.

To integrate with instant messaging tools such as WeChat, DingTalk, or QQ, select the corresponding option in the channel settings and fill in the required fields. For example, to connect DingTalk, you need to fill in the Client ID and Client Secret.

![CowAgent using ModelScope - screenshot 4](../_resources/cow4.png)

CowAgent also supports Skills management. In the skills options, you can view, enable, or disable Agent tools and skills, or click "Explore Skill Square" in the upper right corner to discover and install new skills.

![CowAgent using ModelScope - screenshot 5](../_resources/cow5.png)
