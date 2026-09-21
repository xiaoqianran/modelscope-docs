<!-- modelscope-docs: Hermes Agent | ecosystem-integrations/api-usage/hermes-agent/hermes-agent_EN.md -->

## Overview

Hermes Agent is a self-evolving AI Agent developed by Nous Research. Its core feature is a built-in learning loop — the Agent creates skills from experience, improves skills through use, proactively persists knowledge, searches conversation history, and continuously deepens its understanding of the user across sessions.

Hermes is designed around the philosophy of "run where you are": it can run on a $5 VPS, a GPU cluster, or on Serverless infrastructure at near-zero cost when idle. It is not tied to a local device — you can chat from Telegram while the Agent works on a cloud VM.

Core features:

- **Terminal interface**: full-featured TUI with multi-line editing, slash command autocompletion, conversation history, interrupt redirection, and streaming tool output
- **Multi-platform messaging**: Telegram, Discord, Slack, WhatsApp, Signal, and Email, unified through a single gateway process, with voice message transcription and cross-platform conversation continuity
- **Closed-loop learning**: Agent-managed memory, scheduled reminders, automatic skill creation after complex tasks, skills that self-improve through use, FTS5 conversation search for cross-session recall, and Honcho dialectical user modeling
- **Scheduled automation**: built-in cron scheduler supporting natural-language scheduled tasks, with results pushed to any platform
- **Delegation and parallelism**: spawns isolated sub-Agents to handle parallel workflows
- **Multiple terminal backends**: seven options — local, Docker, SSH, Singularity, Modal, Daytona, and Vercel Sandbox; Daytona and Modal provide Serverless persistence
- **Free model switching**: supports multiple providers such as Nous Portal, OpenRouter, OpenAI, and self-hosted endpoints; switch via `hermes model` without changing code

Installation supports a one-line command (Linux/macOS/WSL2/Termux) and PowerShell (native Windows).

## Resources

| Resource | URL |
|------|------|
| Repository | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |
| Official website | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/) |
| Documentation | [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs/) |
| ModelScope plugin repository | [modelscope/hermes-modelscope-api](https://github.com/modelscope/hermes-modelscope-api) |
| Discord | [discord.gg/NousResearch](https://discord.gg/NousResearch) |

## ModelScope Integration

Through the standalone plugin repository `hermes-modelscope-api`, ModelScope is registered as a `modelscope` (alias `ms`) Provider in Hermes Agent. The plugin uses ModelScope's OpenAI-compatible `/chat/completions` endpoint from the ModelScope Inference API, allowing you to use open-source models on ModelScope directly within Hermes.

Plugin features:

- Provider ID: `modelscope`, alias: `ms`
- Base URL: `https://api-inference.modelscope.cn/v1`
- Authentication environment variable: `MODELSCOPE_API_KEY`
- Supports optional Base URL override (`MODELSCOPE_BASE_URL`)
- Built-in static fallback model catalog; prefers the `/v1/models` endpoint for a live model list when online

Fallback models include: `Qwen/Qwen3-235B-A22B`, `Qwen/Qwen3.5-27B`, `Qwen/Qwen3.5-397B-A17B`, `deepseek-ai/DeepSeek-V3.2`, `deepseek-ai/DeepSeek-V4-Flash`, `deepseek-ai/DeepSeek-V4-Pro`, `deepseek-ai/DeepSeek-R1-0528`, `ZhipuAI/GLM-5.1`, `MiniMax/MiniMax-M2.7`, `moonshotai/Kimi-K2.5`, and more.

## Getting Started

### 1. Install Hermes Agent

```bash
# Linux / macOS / WSL2
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Windows (PowerShell)
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

After installation, reload your shell, then verify:

```bash
source ~/.bashrc    # or source ~/.zshrc
hermes --help
```

### 2. Install the ModelScope Plugin

The plugin is copy-only and does not require `pip install`:

```bash
# Clone the plugin repository
git clone https://github.com/modelscope/hermes-modelscope-api.git
cd hermes-modelscope-api

# Copy the plugin into Hermes's plugin directory
mkdir -p ~/.hermes/plugins/model-providers
rm -rf ~/.hermes/plugins/model-providers/modelscope
cp -R plugins/model-providers/modelscope ~/.hermes/plugins/model-providers/modelscope
```

Verify the plugin files are in place:

```bash
test -f ~/.hermes/plugins/model-providers/modelscope/plugin.yaml
test -f ~/.hermes/plugins/model-providers/modelscope/__init__.py
```

### 3. Configure the ModelScope API Key

Obtain your ModelScope Access Token: [modelscope.cn/my/access/token](https://modelscope.cn/my/access/token)

```bash
# Option 1: write to ~/.hermes/.env
echo 'MODELSCOPE_API_KEY=your_access_token' >> ~/.hermes/.env

# Option 2: export to shell
export MODELSCOPE_API_KEY="your_access_token"

# Option 3: configure via the Hermes Desktop settings interface
# Settings → Provider → find ModelScope → enter Access Token
```

> You can also run `hermes setup` to complete configuration through an interactive wizard.

### 4. Start Using

```bash
# Start a conversation, specifying ModelScope and the model
hermes chat --provider modelscope --model Qwen/Qwen3.5-397B-A17B

# Use the alias
hermes chat --provider ms --model deepseek-ai/DeepSeek-V4-Flash
```

Or open the Provider/Model selector via the `/model` command during a conversation and find `modelscope`.

You can also persist the configuration in `config.yaml`:

```yaml
model:
  provider: "modelscope"
  default: "Qwen/Qwen3.5-397B-A17B"
```

![Hermes ModelScope configuration screenshot 1](../_resources/hermes-1.png)

![Hermes ModelScope configuration screenshot 2](../_resources/hermes-2.png)

### 5. Messaging Platforms (Messaging Gateway)

Hermes supports unified management of multiple messaging platforms through a single gateway process. Officially supported platforms include Telegram, Discord, Slack, WhatsApp, Signal, and Email. The community also provides bridging solutions for platforms such as WeChat (e.g., HermesClaw). In the desktop app's settings, you can independently configure connection parameters for each platform.

The following shows the platform configuration interface using DingTalk as an example:

![Hermes messaging platform configuration](../_resources/hermes-3.png)

> Start the gateway: run `hermes gateway setup` to configure platforms, then `hermes gateway start` to launch. Once started, you can chat with the Agent on the corresponding platforms.

### 6. Skills and Tools

Hermes comes with 40+ built-in tools covering file read/write, terminal, web search, image generation, code execution, and more. In the Skills & Tools option at the top left of the desktop app, you can:

- View and configure enabled tools
- Connect MCP (Model Context Protocol) servers to extend capabilities
- Browse the Skills Hub to preview and install new skills
- Manage existing skills

The skill system is the core of Hermes's closed-loop learning: the Agent automatically creates skills after complex tasks, skills self-improve through use, and the system is compatible with the [agentskills.io](https://agentskills.io) open standard.

![Hermes Skills and Tools](../_resources/hermes-4.png)

### 7. Memory and Context

Hermes's memory system is its core differentiator from other Agents. In settings you can configure:

- Whether to enable User Profiling, allowing the Agent to deepen its understanding of the user across sessions
- The Memory Provider (e.g., mem0, Openviking, etc.) that controls how memory is stored and retrieved
- Memory persistence and retrieval strategies

Memory capabilities include: Agent-managed memory (with scheduled reminders), FTS5 full-text conversation search (supporting cross-session recall), and Honcho dialectical user modeling. The Agent proactively persists important information into memory and automatically references it in subsequent conversations.

![Hermes memory configuration](../_resources/hermes-5.png)

### 8. Tool Keys Configuration (Tools & Keys)

In the Tools & Keys option of settings, you can independently configure API Keys and URLs for various tools. Configurable tools include:

- **Web search**: Tavily, Brave Search, Firecrawl, etc.
- **Code hosting**: GitHub
- **Image generation**: FAL
- **Speech synthesis**: OpenAI TTS
- **Cloud browser**: Browser Use

If you use a Nous Portal subscription, you do not need to configure each tool's API Key separately — the Portal's Tool Gateway routes these services in a unified manner.

![Hermes tool keys configuration](../_resources/hermes-6.png)
