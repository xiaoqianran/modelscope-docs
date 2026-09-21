<!-- modelscope-docs: DeepSeek-Reasonix | ecosystem-integrations/api-usage/deepseek-reasonix/deepseek-reasonix_EN.md -->

## Overview

DeepSeek-Reasonix is an open-source terminal AI coding agent written in Go, compiled to a single static binary. Its core design centers on prefix-cache stability, supporting long autonomous runs with per-turn checkpoints and rewind. It can be used in four ways: CLI/TUI, desktop app, browser, and VS Code extension (ACP protocol).

Core features:

- **Config-driven**: Providers, the agent, enabled tools, and plugins are all declared in `reasonix.toml`. No hardcoded models.
- **Multi-model & composable**: DeepSeek ships as a preset; any OpenAI-compatible endpoint can be configured as an entry. Supports dual-model operation (executor + planner).
- **Plugin-driven**: MCP servers contribute tools, prompts, and resources; Extension Protocol v1 sidecars can intercept runtime events, contribute Providers, and ship versioned plugin packages.
- **Cache-aware context maintenance**: Startup injects a stable environment summary; stale tool output is pruned before compaction.
- **Zero-friction distribution**: `CGO_ENABLED=0` single binary with cross-compilation to six platforms.

## Resources

| Resource | URL |
|------|------|
| Repository | [esengine/DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix) |
| Website | [esengine.github.io/DeepSeek-Reasonix](https://esengine.github.io/DeepSeek-Reasonix/) |
| Guide | [GUIDE.md](https://github.com/esengine/DeepSeek-Reasonix/blob/main-v2/docs/GUIDE.md) |
| CLI reference | [CLI.md](https://github.com/esengine/DeepSeek-Reasonix/blob/main-v2/docs/CLI.md) |
| Configuration paths | [CONFIG_PATHS.md](https://github.com/esengine/DeepSeek-Reasonix/blob/main-v2/docs/CONFIG_PATHS.md) |
| Discord | [discord.gg/XF78rEME2D](https://discord.gg/XF78rEME2D) |

## ModelScope Integration

DeepSeek-Reasonix registers ModelScope as a built-in OpenAI-compatible Provider preset. Once configured, open-source models on ModelScope (Qwen, DeepSeek, GLM, etc.) can be used to drive the coding agent across CLI/TUI, desktop app, and VS Code extension.

Integration details:

- **Provider type**: OpenAI-compatible endpoint
- **Endpoint**: `https://api-inference.modelscope.cn/v1`
- **Authentication**: ModelScope API Key
- **Supported models**: Qwen3.5 series (including vision-capable models), DeepSeek series, GLM series, etc.
- **Capability metadata**: Input modalities (text/vision) declared via model-level metadata; unknown models default to the safe text-only path

This integration was submitted via [PR #8771](https://github.com/esengine/DeepSeek-Reasonix/pull/8771) and merged by the maintainer through [PR #9787](https://github.com/esengine/DeepSeek-Reasonix/pull/9787).

## Getting Started

### Installation

**CLI/TUI**:

```bash
npm i -g reasonix                  # any OS; pulls the prebuilt native binary
# or macOS
brew install esengine/reasonix/reasonix
```

**Desktop app**: Download the installer for your platform from the [official download page](https://reasonix.io/?download=desktop#start).

**VS Code extension**: Complete the CLI installation first, then install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SivanLiu.reasonix-agent).

### Configure ModelScope

**Desktop configuration (recommended)**: In Settings, go to Model Services, click Add, select ModelScope, enter your API Key, and add.

![Reasonix add ModelScope provider](../_resources/reasonix-1.png)

After adding, you can view the list of supported community models, select which models to enable, view model capabilities (such as vision, context length, etc.), and configure settings.

![Reasonix ModelScope model list](../_resources/reasonix-2.png)

After setup, you can also click the model dropdown button at the bottom of the chat box to quickly select a model.

![Reasonix quick model selection](../_resources/reasonix-3.png)

**CLI configuration**: After installation, run the interactive setup:

```bash
reasonix setup
```

Select ModelScope as the Provider, enter your API Key, and choose a model to complete configuration. Configuration is written to `reasonix.toml`.

You can also configure directly in `reasonix.toml`:

```toml
[provider.modelscope]
type = "openai"
base_url = "https://api-inference.modelscope.cn/v1"
api_key = "your_modelscope_api_key"
model = "Qwen/Qwen3.5-27B"
```

### Start Using

After configuration, start an interactive session:

```bash
reasonix
```

Or run a task directly:

```bash
reasonix run "implement the TODOs in main.go"
```

### Desktop Features

**Automation**

Reasonix supports automation, letting the AI schedule tasks, set reminders, or monitor updates. Click the alarm bell button in the bottom-left corner of the desktop UI to view or add scheduled tasks.

![Reasonix automation](../_resources/reasonix-4.png)

**Model Preferences**

Supports selecting different models for different functions. In the model preferences settings, you can configure separate model services for the default model, independent planning model, image understanding, web search, and sub-agent model. You can also set sub-agent reasoning depth, nesting depth, and concurrency. In the runtime preferences, you can set the thinking language, auto-compression threshold, etc.

![Reasonix model preferences](../_resources/reasonix-5.png)

**Usage Statistics**

In the usage statistics section, you can view Token usage, active-day heatmaps, and more, filtered by desktop, CLI, web, bot, remote, etc.

![Reasonix usage statistics](../_resources/reasonix-6.png)

**IM Channels**

Reasonix supports connecting to IM platforms such as QQ, Feishu, Lark, WeChat, DingTalk, etc.

![Reasonix IM channels](../_resources/reasonix-7.png)

**Other Agent Features**

In addition to the above, Reasonix also supports MCP and tools, remote SSH, Agent Skills, sub-agents, plugins, memory settings, and other Agent capabilities.

![Reasonix agent features](../_resources/reasonix-8.png)

## Notes

1. **API Key**: Obtain from the [ModelScope API docs](https://modelscope.cn/docs/model-service/API-Inference/intro); an Alibaba Cloud account is required.
2. **Dual-model operation**: Supports executor + planner configuration where two models can use different Providers.
3. **Vision model support**: Qwen models with vision capability on ModelScope can process image input; capabilities are auto-detected via model-level metadata.
4. **Plan mode**: `/init` lets the Agent create project instructions; Plan mode allows code exploration without file modifications.