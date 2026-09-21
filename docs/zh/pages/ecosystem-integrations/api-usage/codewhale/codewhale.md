<!-- modelscope-docs: Codewhale | ecosystem-integrations/api-usage/codewhale/codewhale_CN.md -->

# Codewhale

## 概述

Codewhale 是开源的终端 AI 编程 Agent，使用 Rust 编写。读取项目代码、编辑文件、执行命令并检查结果，通过托管或本地模型驱动。支持 TUI 交互、本地 Web 客户端、桌面应用和 VS Code 扩展四种使用方式。

核心特性：

- **Provider 无关**：连接托管 Provider 或本地模型（Ollama、vLLM、SGLang），通过 `/provider` 和 `/model` 命令切换
- **权限控制**：Ask、Auto-Review、Full Access 三种审批模式，`/undo` 和 `/restore` 恢复工作区变更
- **长任务管理**：会话保存、持久化 `/goal`、工作流预览、多 Agent 协调
- **可扩展**：MCP Server 和技能、hooks 配置、Agent 角色以可读文件形式存储
- **Computer Use 插件**：观察和操作其他应用程序，可选启用

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [Hmbown/Codewhale](https://github.com/Hmbown/Codewhale) |
| 安装指南 | [INSTALL.md](https://github.com/Hmbown/Codewhale/blob/main/docs/INSTALL.md) |
| Provider 文档 | [PROVIDERS.md](https://github.com/Hmbown/Codewhale/blob/main/docs/PROVIDERS.md) |
| 配置文档 | [CONFIGURATION.md](https://github.com/Hmbown/Codewhale/blob/main/docs/CONFIGURATION.md) |
| 模式与权限 | [MODES.md](https://github.com/Hmbown/Codewhale/blob/main/docs/MODES.md) |
| MCP 文档 | [MCP.md](https://github.com/Hmbown/Codewhale/blob/main/docs/MCP.md) |
| Discord | [discord.gg/37gfS3ksug](https://discord.gg/37gfS3ksug) |

## ModelScope 集成

Codewhale 将 ModelScope 注册为内置 Provider，通过 OpenAI 兼容 API 接入。配置后可在 TUI、Web 客户端和 VS Code 扩展中使用 ModelScope 上的开源模型驱动编程 Agent。

集成细节：

- **Provider 类型**：OpenAI 兼容端点
- **Endpoint**：`https://api-inference.modelscope.cn/v1`
- **认证方式**：ModelScope API Key（`MODELSCOPE_API_KEY`）
- **内置模型**：11 个静态模型，覆盖 Qwen、DeepSeek、GLM 系列
- **默认模型**：`Qwen/Qwen3.5-397B-A17B`
- **推理强度支持**：reasoning effort 字段（xhigh/max 映射为 high），Qwen 和 GLM 系列支持 `reasoning_content` 流式输出

该集成通过 [PR #6299](https://github.com/Hmbown/Codewhale/pull/6299) 提交并合并。

## 接入流程

### 安装

**macOS / Linux**：

```bash
curl -fsSL https://codewhale.net/install.sh | sh
```

**Windows**：从 [GitHub Releases](https://github.com/Hmbown/Codewhale/releases/latest) 下载安装包。

安装后运行 `codewhale` 即可启动。首次运行会引导配置 Provider 或离线使用。

### 配置 ModelScope

安装后启动 TUI，使用 `/provider` 命令选择 ModelScope，使用 `/model` 选择模型：

```
codewhale
```

在 TUI 中：

1. 运行 `/provider`，选择 `modelscope`
2. 输入 ModelScope API Key
3. 运行 `/model`，选择模型（如 `Qwen/Qwen3.5-397B-A17B`）

![Codewhale 配置 ModelScope](../_resources/codewhale-6.png)

也可以通过配置文件 `config.example.toml` 配置：

```toml
[provider.modelscope]
type = "openai"
base_url = "https://api-inference.modelscope.cn/v1"
api_key = "your_modelscope_api_key"
model = "Qwen/Qwen3.5-397B-A17B"
```

### 开始使用

配置完成后，描述具体任务即可：

```
Fix the failing tests and explain what changed.
```

或直接执行任务（不打开 TUI）：

```bash
codewhale exec "fix the failing tests and explain what changed"
```

使用 `/mode plan` 在不修改文件的情况下探索代码，使用 `/mode work` 让 Agent 执行修改。按 `Shift+Tab` 切换 Ask、Auto-Review 或 Full Access 模式。

![Codewhale 对话示例](../_resources/codewhale-1.png)

### 模型与思考强度切换

在聊天框输入 `/model` 可切换当前供应商模型，并可为模型设置思考强度（reasoning effort）。在对话框中使用 `Ctrl + T` 可快捷切换思考强度。

![Codewhale 模型切换与思考强度](../_resources/codewhale-2.png)

也可以直接输入 `/model` + model-id 快速切换指定模型，例如：

```
/model deepseek-ai/DeepSeek-V4.1-Flash
```

![Codewhale 快捷切换模型](../_resources/codewhale-5.png)

### 界面配置

在对话框输入 `/config` 可设置 Codewhale 的主题、语言、背景等界面选项。其中「对话中显示模型推理」选项可控制模型的思考过程是否在对话界面中展示。

![Codewhale 界面配置](../_resources/codewhale-3.png)

## 注意事项

1. **API Key 获取**：从 [ModelScope API 文档](https://modelscope.cn/docs/model-service/API-Inference/intro)获取 API Key，需绑定阿里云账号
2. **推理强度**：Qwen 和 GLM 系列模型支持 `reasoning_content` 流式输出，reasoning effort 的 `xhigh`/`max` 会映射为 `high`
3. **审批模式**：建议首次使用时选择 Ask 模式，确认 Agent 的操作行为后再调整为 Auto-Review 或 Full Access
4. **会话管理**：使用 `/undo` 和 `/restore` 可恢复工作区变更，长任务可设置持久化 `/goal`