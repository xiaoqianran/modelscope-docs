<!-- modelscope-docs: DeepSeek-Reasonix | ecosystem-integrations/api-usage/deepseek-reasonix/deepseek-reasonix_CN.md -->

## 概述

DeepSeek-Reasonix 是开源的终端 AI 编程 Agent，使用 Go 编写，编译为单个静态二进制。核心设计围绕 prefix-cache 稳定性，支持长时间自主运行、每轮检查点和回退。通过四种方式使用：CLI/TUI、桌面应用、浏览器和 VS Code 扩展（ACP 协议）。

核心特性：

- **配置驱动**：Provider、Agent、工具和插件均在 `reasonix.toml` 中声明，无硬编码模型
- **多模型与可组合**：DeepSeek 作为预设，任何 OpenAI 兼容端点均可作为配置项接入；支持双模型运行（executor + planner）
- **插件驱动**：MCP Server 提供工具、提示词和资源；Extension Protocol v1 可拦截运行时事件、提供 Provider 和结构化 UI
- **缓存感知的上下文维护**：启动注入环境摘要，过期工具输出在压缩前被裁剪
- **零摩擦分发**：`CGO_ENABLED=0` 单二进制，支持六平台交叉编译

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [esengine/DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix) |
| 官方网站 | [esengine.github.io/DeepSeek-Reasonix](https://esengine.github.io/DeepSeek-Reasonix/) |
| 指南 | [GUIDE.md](https://github.com/esengine/DeepSeek-Reasonix/blob/main-v2/docs/GUIDE.md) |
| CLI 参考 | [CLI.md](https://github.com/esengine/DeepSeek-Reasonix/blob/main-v2/docs/CLI.md) |
| 配置路径 | [CONFIG_PATHS.md](https://github.com/esengine/DeepSeek-Reasonix/blob/main-v2/docs/CONFIG_PATHS.md) |
| Discord | [discord.gg/XF78rEME2D](https://discord.gg/XF78rEME2D) |

## ModelScope 集成

DeepSeek-Reasonix 将 ModelScope 注册为内置 OpenAI 兼容 Provider preset。配置后可在 CLI/TUI、桌面应用和 VS Code 扩展中使用 ModelScope 上的开源模型（Qwen、DeepSeek、GLM 等）驱动编程 Agent。

集成细节：

- **Provider 类型**：OpenAI 兼容端点
- **Endpoint**：`https://api-inference.modelscope.cn/v1`
- **认证方式**：ModelScope API Key
- **支持模型**：Qwen3.5 系列（含视觉能力模型）、DeepSeek 系列、GLM 系列等
- **能力元数据**：通过模型级元数据声明输入模态（文本/视觉），未知模型默认走纯文本安全路径

该集成通过 [PR #8771](https://github.com/esengine/DeepSeek-Reasonix/pull/8771) 提交，经 [PR #9787](https://github.com/esengine/DeepSeek-Reasonix/pull/9787) 由维护者合并。

## 接入流程

### 安装

**CLI/TUI**：

```bash
npm i -g reasonix                  # 任何 OS，拉取预编译原生二进制
# 或 macOS
brew install esengine/reasonix/reasonix
```

**桌面应用**：从[官方下载页](https://reasonix.io/?download=desktop#start)获取对应平台安装包。

**VS Code 扩展**：先完成 CLI 安装，然后从 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SivanLiu.reasonix-agent) 安装扩展。

### 配置 ModelScope

**桌面端配置（推荐）**：在设置中选择模型服务，点击添加模型服务，选择 ModelScope，填写 API Key 并添加。

![Reasonix 添加 ModelScope 模型服务](../_resources/reasonix-1.png)

添加完成后可查看社区支持的模型列表，选择启用哪些模型，查看模型能力（如视觉、上下文长度等）并进行设置。

![Reasonix ModelScope 模型列表](../_resources/reasonix-2.png)

添加完成后，也可在聊天框底部的模型下拉按钮点击展开模型列表进行快捷选择。

![Reasonix 模型快捷选择](../_resources/reasonix-3.png)

**CLI 配置**：安装后运行交互式配置：

```bash
reasonix setup
```

在配置中选择 ModelScope 作为 Provider，填入 API Key，选择模型即可完成配置。配置写入 `reasonix.toml`。

也可以在 `reasonix.toml` 中直接配置：

```toml
[provider.modelscope]
type = "openai"
base_url = "https://api-inference.modelscope.cn/v1"
api_key = "your_modelscope_api_key"
model = "Qwen/Qwen3.5-27B"
```

### 开始使用

配置完成后，启动交互式会话：

```bash
reasonix
```

或直接运行任务：

```bash
reasonix run "implement the TODOs in main.go"
```

### 桌面端功能

**自动化任务**

Reasonix 支持自动化，让 AI 安排任务、设置提醒或监控更新。在桌面端界面左下角点击闹铃按钮，查看或添加定时任务。

![Reasonix 自动化任务](../_resources/reasonix-4.png)

**模型偏好设置**

支持为不同功能选择不同模型。在设置的模型偏好中，可分别为默认模型、独立规划模型、图片理解、网页搜索、子代理模型设置各自适合的模型服务。可设置子代理推理深度、嵌套深度、并发数等。在运行偏好中可设置思考语言、自动压缩阈值等。

![Reasonix 模型偏好设置](../_resources/reasonix-5.png)

**用量统计**

在用量统计选项中可查看 Token 用量、活跃天数热力图等，可按桌面端、命令行、网页端、机器人、远程等方式分类查看用量。

![Reasonix 用量统计](../_resources/reasonix-6.png)

**IM 通道**

Reasonix 支持接入 IM 实时聊天平台，如 QQ、飞书、Lark、微信、钉钉等。

![Reasonix IM 通道配置](../_resources/reasonix-7.png)

**其他 Agent 功能**

除上述功能外，Reasonix 还支持 MCP 和工具、远程 SSH、Agent Skills、子智能体、插件、记忆设置等 Agent 功能特性。

![Reasonix Agent 功能特性](../_resources/reasonix-8.png)

## 注意事项

1. **API Key 获取**：从 [ModelScope API 文档](https://modelscope.cn/docs/model-service/API-Inference/intro)获取 API Key，需绑定阿里云账号
2. **双模型运行**：支持 executor + planner 双模型配置，两个模型可分别使用不同 Provider
3. **视觉模型支持**：ModelScope 上支持视觉的 Qwen 模型可处理图像输入，能力由模型级元数据自动检测
4. **Plan 模式**：`/init` 可让 Agent 创建项目指令，Plan 模式下可探索代码而不修改文件