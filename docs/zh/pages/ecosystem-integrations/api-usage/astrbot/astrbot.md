<!-- modelscope-docs: AstrBot | ecosystem-integrations/api-usage/astrbot/astrbot_CN.md -->

# AstrBot

## 概述

AstrBot 是开源的一站式 AI Agent 聊天机器人平台，集成了主流 IM 平台接入、LLM 对话、多模态处理、Agent 能力和插件系统。既可作为个人 AI 助手使用，也可作为开发框架进行二次开发。

支持的 IM 平台包括 QQ（含 OneBot v11 协议）、企业微信、微信公众号、飞书（Lark）、钉钉、Telegram、Slack、Discord、QQ 频道、LINE、Satori、KOOK、Misskey、Mattermost 等。社区还贡献了 Matrix 和 Rocket.Chat 等适配器。

支持的模型服务涵盖 OpenAI、Anthropic、Google Gemini、Moonshot AI、智谱 AI、DeepSeek、Ollama、LM Studio、ModelScope、OneAPI、Dify、阿里云百炼、Coze 等，以及多种 TTS/STT 语音服务。

核心特性：

- **1000+ 插件扩展**：社区驱动的插件生态，一键安装
- **Agent Sandbox**：隔离的代码执行环境，支持安全运行 Shell 命令和代码
- **WebUI 管理面板**：浏览器界面管理配置
- **Web ChatUI**：内置网页聊天界面，带 Agent Sandbox 和网页搜索
- **角色扮演与情感陪伴**：支持 Persona 设定和情感交互
- **多模态**：支持图片、语音输入输出
- **MCP 协议**：原生支持 Model Context Protocol
- **自适应思考**：自动上下文压缩，支持 Reasoning 模型
- **国际化**：支持多语言（i18n）

部署方式多样：`uv tool install` 一行命令、Docker、桌面客户端（AstrBot Desktop）、面板部署（宝塔/1Panel/CasaOS）、AUR、Replit 等。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [AstrBotDevs/AstrBot](https://github.com/AstrBotDevs/AstrBot) |
| 官方文档 | [docs.astrbot.app](https://docs.astrbot.app) |
| 桌面客户端 | [AstrBotDevs/AstrBot-desktop](https://github.com/AstrBotDevs/AstrBot-desktop) |

## ModelScope 集成

AstrBot 将 ModelScope 列为支持的 LLM 服务提供商，在 WebUI 面板中配置后即可在所有 IM 渠道中使用 ModelScope 上的开源模型（Qwen、DeepSeek、GLM 等）。

## 接入流程

在 AstrBot 的 WebUI 面板中配置：

1. 进入「模型提供商」设置
2. 选择 ModelScope
3. 填入 ModelScope API Key
4. 选择模型并使用（点击获取模型列表进行选择，或者自定义模型）

API Key 获取：[ModelScope API 文档](https://modelscope.cn/docs/model-service/API-Inference/intro)

![AstrBot 配置 ModelScope 效果图 1](../_resources/astrbot1.png)

![AstrBot 配置 ModelScope 效果图 2](../_resources/astrbot2.png)

![AstrBot 配置 ModelScope 效果图 3](../_resources/astrbot3.png)

- 配置完成后，在聊天中描述需求，AstrBot 自动生成回复。
- 除常规对话外，AstrBot 支持文件上传，包括图片识别（需视觉多模态模型）。

![AstrBot 配置 ModelScope 效果图 4](../_resources/astrbot4.png)

![AstrBot 配置 ModelScope 效果图 7](../_resources/astrbot7.png)

- 此外，可为 AstrBot 配置平台机器人以及开启 Agent 使用电脑的权限。以接入钉钉为例，支持手动填写字段和钉钉一键扫码创建机器人。

![AstrBot 配置 ModelScope 效果图 5](../_resources/astrbot5.png)

![AstrBot 配置 ModelScope 效果图 6](../_resources/astrbot6.png)

- AstrBot 还提供知识库问答、人格设定等功能，支持构建个性化 AI 助手。