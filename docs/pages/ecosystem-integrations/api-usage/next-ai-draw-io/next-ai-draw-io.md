<!-- modelscope-docs: Next AI Draw.io | ecosystem-integrations/api-usage/next-ai-draw-io/next-ai-draw-io_EN.md -->

## Overview

Next AI Draw.io is a Next.js application that combines AI capabilities with the draw.io diagram editor. By describing diagram content in natural language, AI automatically generates draw.io format XML and renders it as a visual diagram. You can also upload existing diagram images or PDF documents for AI to recognize and enhance.

Core features:

- **Natural language diagram generation**: Enter "draw a RAG architecture diagram" and AI generates the corresponding draw.io XML and renders it
- **Image replication**: Upload an existing diagram image and AI automatically recognizes it and generates an editable draw.io format
- **PDF and text file upload**: Extract content from PDF or text to generate diagrams
- **AI reasoning process display**: For models that support reasoning (OpenAI o1/o3, Gemini, Claude, etc.), the AI's thinking process can be displayed
- **Diagram history**: Version control, allowing you to view and restore previous versions
- **Interactive chat**: Real-time conversation to refine diagrams
- **Cloud architecture diagrams**: Dedicated support for AWS, Azure, and GCP architecture diagram generation (the Claude series performs best in this scenario)
- **Animated connection lines**: Can generate dynamic connection lines to enhance visualization
- **MCP Server**: Can be used as an MCP Server for invocation by Agents such as Claude Desktop, Cursor, VS Code, etc.

Tech stack: Next.js + Vercel AI SDK + react-drawio.

It supports 14+ AI Providers (OpenAI, Anthropic, Google AI, Azure, Bedrock, DeepSeek, SiliconFlow, ModelScope, SGLang, etc.), with deployment options including Vercel, Tencent EdgeOne Pages, Cloudflare Workers, and desktop applications.

## Resources

| Resource | URL |
|----------|-----|
| Repository | [DayuanJiang/next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) |
| Online demo | [next-ai-drawio.jiang.jp](https://next-ai-drawio.jiang.jp) |
| Provider configuration guide | [ai-providers.md](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/docs/en/ai-providers.md) |

## ModelScope Integration

Next AI Draw.io lists ModelScope as one of its supported AI Providers. Once configured, you can use open-source models on ModelScope (such as the Qwen series) to generate diagrams.

## Getting Started

Next AI Draw.io supports three ways to configure ModelScope.

### Option 1: Configure via the settings panel

1. Open Next AI Draw.io
2. Click the settings icon in the chat panel
3. Select the Provider as `ModelScope`
4. Enter the API Key
5. Select a model

### Option 2: Configure via environment variables

```bash
# .env.local
AI_PROVIDER=modelscope
MODELSCOPE_API_KEY=your_api_key
AI_MODEL=Qwen/Qwen3.5-27B
```

### Option 3: Server-side multi-model configuration

```json
// ai-models.json or the AI_MODELS_CONFIG environment variable
{
  "providers": [
    {
      "name": "ModelScope",
      "provider": "modelscope",
      "models": ["Qwen/Qwen3.5-27B"],
      "default": true
    }
  ]
}
```

Once configured, describe the diagram you want in the chat, and AI will automatically generate draw.io format XML and render it.

![Next AI Draw.io using ModelScope to generate a diagram - effect 1](../_resources/Next-AI-Drawio-1.png)

![Next AI Draw.io using ModelScope to generate a diagram - effect 2](../_resources/Next-AI-Drawio-2.png)

![Next AI Draw.io using ModelScope to generate a diagram - effect 3](../_resources/Next-AI-Drawio-3.png)

![Next AI Draw.io using ModelScope to generate a diagram - effect 4](../_resources/Next-AI-Drawio-4.png)

![Next AI Draw.io using ModelScope to generate a diagram - effect 5](../_resources/Next-AI-Drawio-5.png)

### Using via the MCP Server

Next AI Draw.io provides an MCP Server that allows AI Agents such as Claude Desktop, Cursor, and VS Code to directly invoke the diagram generation capability via the MCP protocol. After the Agent generates a diagram, it is rendered in real time in the browser.

**Claude Desktop / Cursor / VS Code configuration**:

Add the following to the MCP configuration file:

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

**Claude Code CLI configuration**:

```bash
claude mcp add drawio -- npx @next-ai-drawio/mcp-server@latest
```

Once configured, use natural language to have the Agent generate a diagram, for example:

> Create a flowchart showing user authentication with login, MFA, and session management

The diagram will appear in the browser in real time. For detailed configuration, refer to the [MCP Server README](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/packages/mcp-server/README.md).
