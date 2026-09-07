<!-- modelscope-docs: LangBot | ecosystem-integrations/api-usage/langbot/langbot_CN.md -->

# LangBot

## 概述

LangBot 是生产级多平台智能机器人开发平台，定位是把 LLM 能力接入任意聊天平台。设计上提供完整的 Agent 基础设施，包括知识库编排、插件系统、多流水线架构和生产级监控。

核心特性：

- **多渠道接入**：一套代码覆盖 Discord、Telegram、Slack、LINE、QQ、微信、企业微信、飞书、钉钉、KOOK、Satori、Email、Matrix 等平台
- **多 Provider 支持**：内置 OpenAI、Anthropic、DeepSeek、Google Gemini、xAI、Moonshot、智谱 AI、Ollama、LM Studio、Dify、MCP、SiliconFlow、阿里云百炼、火山引擎方舟、ModelScope 等多个模型提供商
- **Web 管理面板**：通过浏览器界面配置和管理机器人，不需要手动编辑 YAML
- **多流水线架构**：不同场景可以配置不同的机器人流水线
- **生产级**：访问控制、速率限制、敏感词过滤、异常处理、完整的监控面板
- **插件生态**：事件驱动架构，支持第三方插件扩展
- **MCP 协议支持**：内置 MCP Server，可通过 API 和 MCP 管理机器人

部署方式包括 `uvx langbot` 一行命令启动、Docker Compose、一键云部署（Zeabur、Railway）等。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [RockChinQ/LangBot](https://github.com/RockChinQ/LangBot) |
| 官方网站 | [langbot.app](https://langbot.app) |
| 文档 | [link.langbot.app/en/docs](https://link.langbot.app/en/docs) |
| 在线 Demo | [demo.langbot.dev](https://demo.langbot.dev) |

## ModelScope 集成

LangBot 将 ModelScope 列为支持的模型 Provider（Gateway），在 Web 管理面板中配置后即可在所有渠道中使用 ModelScope 上的开源模型。

## 接入流程

在 LangBot 的 Web 管理面板中配置：

1. 进入「模型配置」页面
2. 选择 Provider 为 `ModelScope`
3. 填入 API Key
4. 选择需要使用的模型

![LangBot 配置 ModelScope 效果图 1](../_resources/langbot1.png)

![LangBot 配置 ModelScope 效果图 2](../_resources/langbot2.png)

### 平台接入示例（以钉钉为例）

LangBot 机器人（Bots）可接入各消息平台：Discord、Telegram、Slack、微信、QQ、飞书、钉钉、LINE 等，用于从消息平台接收消息事件并调用流水线处理消息。

以接入钉钉为例（不同平台的接入方式参考官方文档：https://docs.langbot.app/zh/usage/platforms/readme）：

#### 一键配置（推荐）

LangBot 支持一键创建钉钉应用并自动填写凭证，无需手动复制粘贴。

1. 打开 LangBot WebUI，进入机器人 > 创建机器人
2. 填写机器人名称，平台/适配器选择钉钉
3. 在下方出现的一键创建应用区域，点击右侧的「开始」按钮

![LangBot 配置 ModelScope 效果图 3](../_resources/langbot3.png)

4. 使用钉钉扫描弹出的二维码，手机端会提示选择加入的组织

![LangBot 配置 ModelScope 效果图 4](../_resources/langbot4.png)

5. 选择组织后，可以创建新的机器人或选择已有的机器人

![LangBot 配置 ModelScope 效果图 5](../_resources/langbot5.png)

6. 授权成功后，手机端会显示「配置成功」，同时 LangBot WebUI 中的 Client ID 和 Client Secret 会自动填入

![LangBot 配置 ModelScope 效果图 6](../_resources/langbot6.png)

7. 手动填写机器人名称（名称需与钉钉中创建的机器人一致），以及机器人代码（识图、上传文件等功能必填，需前往钉钉开发者后台 > 机器人配置中获取）

![LangBot 配置 ModelScope 效果图 7](../_resources/langbot7.png)

8. 点击提交，完成创建