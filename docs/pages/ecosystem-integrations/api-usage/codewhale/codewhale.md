<!-- modelscope-docs: Codewhale | ecosystem-integrations/api-usage/codewhale/codewhale_EN.md -->

# Codewhale

## Overview

Codewhale is an open-source terminal AI coding agent written in Rust. It reads project code, edits files, runs commands, and checks results, powered by hosted or local models. It supports four usage modes: TUI, local web client, desktop app, and VS Code extension.

Core features:

- **Provider-agnostic**: Connect hosted providers or local models (Ollama, vLLM, SGLang); switch via `/provider` and `/model` commands
- **Permission control**: Three approval modes — Ask, Auto-Review, Full Access; `/undo` and `/restore` recover workspace changes
- **Long-task management**: Session saving, durable `/goal`, workflow preview, multi-agent coordination
- **Extensible**: MCP servers and skills, hooks configuration, agent roles stored as readable files
- **Computer Use plugin**: Observe and interact with other applications; optionally enabled

## Resources

| Resource | URL |
|------|------|
| Repository | [Hmbown/Codewhale](https://github.com/Hmbown/Codewhale) |
| Installation guide | [INSTALL.md](https://github.com/Hmbown/Codewhale/blob/main/docs/INSTALL.md) |
| Providers docs | [PROVIDERS.md](https://github.com/Hmbown/Codewhale/blob/main/docs/PROVIDERS.md) |
| Configuration docs | [CONFIGURATION.md](https://github.com/Hmbown/Codewhale/blob/main/docs/CONFIGURATION.md) |
| Modes & permissions | [MODES.md](https://github.com/Hmbown/Codewhale/blob/main/docs/MODES.md) |
| MCP docs | [MCP.md](https://github.com/Hmbown/Codewhale/blob/main/docs/MCP.md) |
| Discord | [discord.gg/37gfS3ksug](https://discord.gg/37gfS3ksug) |

## ModelScope Integration

Codewhale registers ModelScope as a built-in Provider, accessed via the OpenAI-compatible API. Once configured, open-source models on ModelScope can be used to drive the coding agent across TUI, web client, and VS Code extension.

Integration details:

- **Provider type**: OpenAI-compatible endpoint
- **Endpoint**: `https://api-inference.modelscope.cn/v1`
- **Authentication**: ModelScope API Key (`MODELSCOPE_API_KEY`)
- **Built-in models**: 11 static models covering Qwen, DeepSeek, and GLM series
- **Default model**: `Qwen/Qwen3.5-397B-A17B`
- **Reasoning effort support**: reasoning effort field (xhigh/max mapped to high); Qwen and GLM series support `reasoning_content` streaming output

This integration was submitted and merged via [PR #6299](https://github.com/Hmbown/Codewhale/pull/6299).

## Getting Started

### Installation

**macOS / Linux**:

```bash
curl -fsSL https://codewhale.net/install.sh | sh
```

**Windows**: Download the installer from [GitHub Releases](https://github.com/Hmbown/Codewhale/releases/latest).

After installation, run `codewhale` to start. The first run guides you through configuring a provider or using Codewhale offline.

### Configure ModelScope

After installation, launch the TUI and use `/provider` to select ModelScope and `/model` to choose a model:

```
codewhale
```

In the TUI:

1. Run `/provider`, select `modelscope`
2. Enter your ModelScope API Key
3. Run `/model`, select a model (e.g., `Qwen/Qwen3.5-397B-A17B`)

![Codewhale ModelScope configuration](../_resources/codewhale-6.png)

You can also configure via the `config.example.toml` file:

```toml
[provider.modelscope]
type = "openai"
base_url = "https://api-inference.modelscope.cn/v1"
api_key = "your_modelscope_api_key"
model = "Qwen/Qwen3.5-397B-A17B"
```

### Start Using

After configuration, describe a concrete task:

```
Fix the failing tests and explain what changed.
```

Or run a task without opening the TUI:

```bash
codewhale exec "fix the failing tests and explain what changed"
```

Use `/mode plan` to explore code without file changes, and `/mode work` to let the Agent make changes. Press `Shift+Tab` to switch between Ask, Auto-Review, or Full Access modes.

![Codewhale conversation example](../_resources/codewhale-1.png)

### Model and Reasoning Effort Switching

Type `/model` in the chat box to switch the current provider model and set the reasoning effort. Use `Ctrl + T` in the chat box to quickly toggle the reasoning effort.

![Codewhale model switching and reasoning effort](../_resources/codewhale-2.png)

You can also type `/model` + model-id to quickly switch to a specific model, for example:

```
/model deepseek-ai/DeepSeek-V4.1-Flash
```

![Codewhale quick model switch](../_resources/codewhale-5.png)

### UI Configuration

Type `/config` in the chat box to configure Codewhale's theme, language, background, and other UI options. The "Show model reasoning in conversation" option controls whether the model's thinking process is displayed in the chat interface.

![Codewhale UI configuration](../_resources/codewhale-4.png)

## Notes

1. **API Key**: Obtain from the [ModelScope API docs](https://modelscope.cn/docs/model-service/API-Inference/intro); an Alibaba Cloud account is required.
2. **Reasoning effort**: Qwen and GLM series models support `reasoning_content` streaming output; reasoning effort `xhigh`/`max` is mapped to `high`.
3. **Approval modes**: For first-time use, the Ask mode is recommended to review the Agent's behavior before switching to Auto-Review or Full Access.
4. **Session management**: Use `/undo` and `/restore` to recover workspace changes; set a durable `/goal` for long tasks.