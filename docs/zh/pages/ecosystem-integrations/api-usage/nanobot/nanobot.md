<!-- modelscope-docs: nanobot | ecosystem-integrations/api-usage/nanobot/nanobot_CN.md -->

## 概述

nanobot 是开源的轻量级个人 AI Agent 运行时，由 Xubin Ren 创建。设计理念是保持 Agent 核心小而可读，在核心之外提供 WebUI、聊天渠道、工具、记忆、自动化等功能，支持 24/7 运行。

核心特性：

- **WebUI 和终端**：内置浏览器管理界面，也支持命令行交互
- **多渠道聊天**：连接 Telegram、Discord、WeChat、Slack、Email、Mattermost、DingTalk（钉钉）、Feishu（飞书）、QQ、Wecom（企业微信）、Microsoft Teams、WhatsApp、Matrix 等聊天平台
- **工具系统**：文件读写、Shell、网页搜索、网页抓取、MCP、定时任务、图片生成、子 Agent。支持接入第三方工具应用，如 1Password CLI、Blender、Browser 等，在对话中通过 `@` 调用
- **Skills（技能）**：可在对话中动态加载的指令技能，WebUI 中可查看和管理
- **记忆系统**：会话历史和长期记忆（通过 Dream 实现）
- **长周期目标和自动化**：支持持久化的目标任务和定时触发的自动化
- **模型路由**：支持 OpenAI 兼容 API、本地 LLM、图片生成、搜索和 fallback 模型
- **独立 API 配置**：WebUI 支持分别配置 LLM、语音（Voice）、图像生成（Image）、网页搜索（Web Search）的 API
- **部署灵活**：本地运行或作为服务端 Agent 网关，支持后台运行（`--background`）
- **Python SDK 和 OpenAI 兼容 API**：便于与其他系统集成

安装方式包括一行命令安装（macOS/Linux/Windows）、`uv tool install`、`pip install` 和从源码安装。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [HKUDS/nanobot](https://github.com/HKUDS/nanobot) |
| 文档 | [nanobot.wiki/docs](https://nanobot.wiki/docs/latest/getting-started/nanobot-overview) |
| GitHub 文档 | [HKUDS/nanobot/blob/main/docs](https://github.com/HKUDS/nanobot/blob/main/docs/README.md) |

## ModelScope 集成

nanobot 将 ModelScope 注册为内置模型提供商，endpoint 为 `https://api-inference.modelscope.cn/v1`，使用 Bearer 认证。配置后可使用 ModelScope 上的开源模型，支持的集成能力包括：

- LLM 对话
- 文生图（image-generation）：可在 WebUI 的 Image 设置中配置 ModelScope 的文生图模型
- 视觉理解（image-text-to-text）

配置后，nanobot 的模型路由器会根据任务类型自动选择合适的模型，ModelScope 作为一个推理源参与路由。

## 接入流程

### 1. 安装并启动 WebUI

```bash
# 安装 nanobot
pip install nanobot-ai

# 启动 WebUI
nanobot gateway
```

启动后访问 `http://127.0.0.1:8765` 即可打开 WebUI 面板。

### 2. 在 WebUI 中配置 ModelScope

在 WebUI 的设置页面中，添加 ModelScope 作为 Provider：

- **Provider**：在 Models 的设置中，选择 ModelScope 进行配置
- **API Base**：`https://api-inference.modelscope.cn/v1`
- **API Key**：填入你的 ModelScope API Key
- **Model**：在 Provider 下拉框中选择 ModelScope 作为模型提供商，在 Model 中选择模型，如 `Qwen/Qwen3.5-27B`

配置完成后即可在 WebUI 中直接对话使用，也可通过连接的聊天应用（Telegram、Discord、WeChat 等）使用。

<details>
<summary>或通过 config.json 配置（可选）</summary>

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

![nanobot 配置 ModelScope 效果图 1](../_resources/nanobot-1.png)

![nanobot 配置 ModelScope 效果图 2](../_resources/nanobot-2.png)

![nanobot 配置 ModelScope 效果图 3](../_resources/nanobot-3.png)

### 3. 工具（Tools）

nanobot 支持在 WebUI 中连接各种工具应用，连接后可以在对话中通过 `@` 调用。支持的工具包括 1Password CLI、3MF、AdGuardHome、Blender、Browser、CC Switch 等，也可以通过 MCP 协议接入更多工具。

![nanobot 技能管理](../_resources/nanobot-4.png)

### 4. 技能（Skills）

nanobot 支持技能系统，技能是可在对话中动态加载的指令模板。可以在 WebUI 中查看和管理当前 Agent 可用的技能列表。

![nanobot 聊天渠道配置](../_resources/nanobot-5.png)

### 5. 聊天渠道（Chat Apps）

nanobot 支持接入多种聊天平台，包括 Telegram、Discord、WeChat、Slack、Email、Mattermost、DingTalk（钉钉）、Feishu（飞书）、QQ、Wecom（企业微信）、Microsoft Teams、WhatsApp、Matrix 等。每个渠道都可以在 WebUI 的 Channels 设置中独立配置。

以下是以钉钉 DingTalk 为例的通道配置界面：

![nanobot 工具配置](../_resources/nanobot-6.png)

### 6. 网页搜索配置

nanobot 的 WebUI 支持独立配置网页搜索的 API。可以选择多种 Search Provider，包括 DuckDuckGo、Brave Search、Tavily、SearXNG、Jina 等。

![nanobot 网页搜索配置](../_resources/nanobot-7.png)

### 7. 图像生成配置

nanobot 的 WebUI 支持独立配置图像生成（Image）的 API。以下是以 ModelScope 文生图模型为例的配置界面：

![nanobot 图像生成配置](../_resources/nanobot-8.png)