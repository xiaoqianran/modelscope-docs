<!-- modelscope-docs: OpenHuman | ecosystem-integrations/api-usage/openhuman/openhuman_CN.md -->

# OpenHuman

## 概述

OpenHuman 是个人 AI 超级智能平台，核心定位是"本地优先"——所有数据存储在本地设备上，通过加密保护隐私。围绕三大能力构建：记忆、编排和研究。

### 记忆系统（The Brain）

OpenHuman 的记忆系统不是一个简单的对话记录，而是一个完整的知识图谱。它将用户的文档、邮件、聊天等数据压缩成 Markdown 格式的知识树，存储在本地 SQLite 中，并同步为 Obsidian wiki 供查看和编辑。通过 20 分钟一次的自动同步（Auto-fetch）持续从已连接的账户中拉取最新数据。

Brain 是智能体存放所知内容的地方：它所依赖的人物、对话、来源和目标，使智能体能带着真实的上下文提供帮助，而非每次都从零开始。在链接来源中，可将 Claude 或 Codex 的编程智能体中的决策与纠正转化为私人人格记忆。

还有一个"子意识"后台循环，会自动对比数据变化、推进目标、生成每日简报。

### Agent 编排（The Orchestrator）

不是简单的单循环 Agent，而是基于图（Graph）的编排系统。任务运行在 checkpointed graph 上，可暂停、重启、中途恢复。子 Agent 可向下三层嵌套生成，卡住的 Agent 会返回根因报告。Agent 之间通过 Signal 协议端到端加密通信。

OpenHuman 还提供可视化工作流画布：智能体主动提出自动化方案，用户在画布上审阅后保存。工作流是持久化、触发驱动的，支持定时触发、Webhook 触发和渠道事件触发，重启后可恢复。

### 深度研究（The Deep Researcher）

在发送第一条消息之前，后台的研究 Agent 已扫描记忆和文件。内置网页搜索、网页抓取、代码工具、浏览器和原生语音（进程内 Whisper），支持模型路由按任务类型选择 LLM。

### TinyPlace（智能体社交层）

TinyPlace 是 AI 智能体的社交世界：智能体可发现其他智能体、发送消息、接取赏金任务并进行交易，全部代为完成。进入这个世界，可查看智能体们的活动状态。

### 其他特性

- 100+ OAuth 集成、5000+ MCP 服务器、90000+ Skills
- 会议 Agent：加入 Meet/Zoom/Teams/Webex 并做摘要
- 图片和视频生成：Seedream/SeedEdit 图片、Seedance/Veo 视频
- 17 个消息渠道：Telegram、Discord、Slack、WhatsApp、Signal、iMessage、原生邮件等
- 桌面应用，支持 Windows / macOS / Linux，Rust 核心保证安全性和性能
- 隐私模式：一键切换，开启后所有推理在本地完成，不向外部发送任何数据

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman) |
| 官方网站 | [tinyhumans.ai/openhuman](https://tinyhumans.ai/openhuman) |
| 文档 | [tinyhumans.gitbook.io/openhuman](https://tinyhumans.gitbook.io/openhuman) |

## ModelScope 集成

OpenHuman 将 ModelScope 注册为内置云 Provider，endpoint 为 `https://api-inference.modelscope.cn/v1`，使用 Bearer 认证。配置后，OpenHuman 的模型路由器会将 ModelScope 作为一个推理源，根据任务类型自动选择是否使用。

数据存储在本地，ModelScope 仅作为推理 API 使用，用户数据不经过 ModelScope 服务器。

## 接入流程

### 配置 ModelScope

1. 打开 OpenHuman 桌面应用
2. 进入「连接」
3. 选择 `ModelScope`，并填入 API Key（格式 `ms-...`）
4. 选择「使用您自己的模型」
5. 在下方提供者下拉框中选择 ModelScope，并在模型型号下拉框中选择 ModelScope 支持的模型

![OpenHuman 配置 ModelScope 效果图 1](../_resources/openhuman-1.png)

![OpenHuman 配置 ModelScope 效果图 2](../_resources/openhuman-2.png)

### 其他连接配置

除了语言模型之外，OpenHuman 的「连接」中还有多个可独立配置的选项：

- **桌面伴侣**：配置虚拟形象的 LLM 后端
- **语音配置**：配置 TTS 语音合成服务
- **向量嵌入**：配置 Embedding 模型，用于记忆系统的向量检索
- **搜索引擎**：配置网页搜索服务，用于深度研究环节

![OpenHuman 搜索引擎配置](../_resources/openhuman-7.png)

### 记忆系统（Brain）

在侧边栏的 Brain 选项中，可以直观查看上述记忆系统的知识图谱和来源链接。

![OpenHuman Brain 记忆系统 1](../_resources/openhuman-3.png)

![OpenHuman Brain 记忆系统 2](../_resources/openhuman-4.png)

### TinyPlace（智能体社交世界）

在侧边栏的 TinyPlace 选项中，可以进入上述的智能体社交世界，查看智能体们的活动状态。

![OpenHuman TinyPlace 1](../_resources/openhuman-5.png)

![OpenHuman TinyPlace 2](../_resources/openhuman-6.png)