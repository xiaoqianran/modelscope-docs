<!-- modelscope-docs: Hermes Agent | ecosystem-integrations/api-usage/hermes-agent/hermes-agent_CN.md -->

## 概述

Hermes Agent 是 Nous Research 开发的自我进化 AI Agent。核心特点是内置学习闭环——Agent 从经验中创建技能、在使用中改进技能、主动持久化知识、搜索历史对话，并在跨会话中不断深化对用户的理解。

Hermes 的设计理念是"在你所在的地方运行"：可在 5 美元的 VPS、GPU 集群或空闲时几乎零成本的 Serverless 基础设施上运行。不绑定本地设备——可从 Telegram 对话，Agent 在云端 VM 上工作。

核心特性：

- **终端界面**：全功能 TUI，支持多行编辑、斜杠命令自动补全、对话历史、中断重定向、流式工具输出
- **多平台消息**：Telegram、Discord、Slack、WhatsApp、Signal、Email，通过一个 gateway 进程统一管理，支持语音消息转写和跨平台对话连续性
- **闭环学习**：Agent 自主管理的记忆、定时提醒、复杂任务后自动创建技能、技能在使用中自我改进、FTS5 会话搜索支持跨会话回顾、Honcho 辩证用户建模
- **定时自动化**：内置 cron 调度器，支持自然语言编写定时任务，结果推送到任意平台
- **委托与并行**：生成隔离的子 Agent 处理并行工作流
- **多终端后端**：本地、Docker、SSH、Singularity、Modal、Daytona、Vercel Sandbox 七种，Daytona 和 Modal 提供 Serverless 持久化
- **模型自由切换**：支持 Nous Portal、OpenRouter、OpenAI、自有端点等多种 Provider，通过 `hermes model` 切换，无需改代码

安装方式支持一行命令安装（Linux/macOS/WSL2/Termux）和 PowerShell（Windows 原生）。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |
| 官方网站 | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/) |
| 文档 | [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs/) |
| ModelScope 插件仓库 | [modelscope/hermes-modelscope-api](https://github.com/modelscope/hermes-modelscope-api) |
| Discord | [discord.gg/NousResearch](https://discord.gg/NousResearch) |

## ModelScope 集成

通过独立的插件仓库 `hermes-modelscope-api`，ModelScope 作为 `modelscope`（别名 `ms`）Provider 注册到 Hermes Agent 中。插件使用 ModelScope Inference API 的 OpenAI 兼容 `/chat/completions` 端点，可在 Hermes 中直接使用 ModelScope 上的开源模型。

插件特性：

- Provider ID：`modelscope`，别名：`ms`
- Base URL：`https://api-inference.modelscope.cn/v1`
- 认证环境变量：`MODELSCOPE_API_KEY`
- 支持可选的 Base URL 覆盖（`MODELSCOPE_BASE_URL`）
- 内置静态 fallback 模型目录，在线时优先使用 `/v1/models` 端点获取实时模型列表

Fallback 模型包括：`Qwen/Qwen3-235B-A22B`、`Qwen/Qwen3.5-27B`、`Qwen/Qwen3.5-397B-A17B`、`deepseek-ai/DeepSeek-V3.2`、`deepseek-ai/DeepSeek-V4-Flash`、`deepseek-ai/DeepSeek-V4-Pro`、`deepseek-ai/DeepSeek-R1-0528`、`ZhipuAI/GLM-5.1`、`MiniMax/MiniMax-M2.7`、`moonshotai/Kimi-K2.5` 等。

## 接入流程

### 1. 安装 Hermes Agent

```bash
# Linux / macOS / WSL2
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Windows (PowerShell)
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

安装完成后重新加载 shell，然后验证：

```bash
source ~/.bashrc    # 或 source ~/.zshrc
hermes --help
```

### 2. 安装 ModelScope 插件

插件是 copy-only 方式，不需要 `pip install`：

```bash
# 克隆插件仓库
git clone https://github.com/modelscope/hermes-modelscope-api.git
cd hermes-modelscope-api

# 复制插件到 Hermes 的插件目录
mkdir -p ~/.hermes/plugins/model-providers
rm -rf ~/.hermes/plugins/model-providers/modelscope
cp -R plugins/model-providers/modelscope ~/.hermes/plugins/model-providers/modelscope
```

验证插件文件已就位：

```bash
test -f ~/.hermes/plugins/model-providers/modelscope/plugin.yaml
test -f ~/.hermes/plugins/model-providers/modelscope/__init__.py
```

### 3. 配置 ModelScope API Key

获取 ModelScope Access Token：[modelscope.cn/my/access/token](https://modelscope.cn/my/access/token)

```bash
# 方式一：写入 ~/.hermes/.env
echo 'MODELSCOPE_API_KEY=your_access_token' >> ~/.hermes/.env

# 方式二：导出到 shell
export MODELSCOPE_API_KEY="your_access_token"

# 方式三：通过 Hermes Desktop 设置界面配置
# Settings → Provider → 找到 ModelScope → 填入 Access Token
```

> 也可以运行 `hermes setup` 通过交互式向导完成配置。

### 4. 开始使用

```bash
# 启动对话，指定 ModelScope 和模型
hermes chat --provider modelscope --model Qwen/Qwen3.5-397B-A17B

# 使用别名
hermes chat --provider ms --model deepseek-ai/DeepSeek-V4-Flash
```

或者在对话中通过 `/model` 命令打开 Provider/Model 选择器，找到 `modelscope`。

也可以在 `config.yaml` 中永久配置：

```yaml
model:
  provider: "modelscope"
  default: "Qwen/Qwen3.5-397B-A17B"
```

![Hermes 配置 ModelScope 效果图 1](../_resources/hermes-1.png)

![Hermes 配置 ModelScope 效果图 2](../_resources/hermes-2.png)

### 5. 消息平台（Messaging Gateway）

Hermes 支持通过一个 gateway 进程统一管理多个消息平台。官方支持的平台包括 Telegram、Discord、Slack、WhatsApp、Signal 和 Email。社区还提供了 WeChat 等平台的桥接方案（如 HermesClaw）。在桌面版的设置中可以为每个平台独立配置连接参数。

以下是以钉钉 DingTalk 为例的平台配置界面：

![Hermes 消息平台配置](../_resources/hermes-3.png)

> 启动 gateway：运行 `hermes gateway setup` 配置平台，然后 `hermes gateway start` 启动。启动后即可在对应平台上与 Agent 对话。

### 6. 技能与工具（Skills & Tools）

Hermes 内置 40+ 工具，覆盖文件读写、终端、网页搜索、图片生成、代码执行等场景。在桌面版左上角的技能与工具选项中，可以：

- 查看和配置已启用的工具
- 接入 MCP（Model Context Protocol）服务器扩展能力
- 浏览技能中心（Skills Hub）预览和安装新技能
- 管理已有技能

技能系统是 Hermes 闭环学习的核心：Agent 会在复杂任务后自动创建技能，技能在使用中自我改进，并且兼容 [agentskills.io](https://agentskills.io) 开放标准。

![Hermes 技能与工具](../_resources/hermes-4.png)

### 7. 记忆与上下文（Memory）

Hermes 的记忆系统是它区别于其他 Agent 的核心能力。在设置中可以配置：

- 是否开启用户画像（User Profiling），让 Agent 跨会话深化对用户的理解
- 记忆提供商（Memory Provider），如 mem0、Openviking 等，控制记忆的存储和检索方式
- 记忆的持久化和检索策略

记忆功能包括：Agent 自主管理的记忆（带定时提醒）、FTS5 全文会话搜索（支持跨会话回顾）、以及 Honcho 辩证用户建模。Agent 会主动将重要信息持久化到记忆中，在后续对话中自动引用。

![Hermes 记忆配置](../_resources/hermes-5.png)

### 8. 工具密钥配置（Tools & Keys）

在设置的 Tools & Keys 选项中，可以为各种工具独立配置 API Key 和 URL。支持配置的工具包括：

- **网页搜索**：Tavily、Brave Search、Firecrawl 等
- **代码托管**：GitHub
- **图片生成**：FAL
- **语音合成**：OpenAI TTS
- **云浏览器**：Browser Use

如果使用 Nous Portal 订阅，则不需要单独配置每个工具的 API Key——Portal 的 Tool Gateway 会统一路由这些服务。

![Hermes 工具密钥配置](../_resources/hermes-6.png)