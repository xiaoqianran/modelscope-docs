<!-- modelscope-docs: Next AI Draw.io | ecosystem-integrations/api-usage/next-ai-draw-io/next-ai-draw-io_CN.md -->

## 概述

Next AI Draw.io 是 Next.js 应用，将 AI 能力与 draw.io 图表编辑器结合。通过自然语言描述图表内容，AI 自动生成 draw.io 格式的 XML 并渲染为可视化图表。也可上传已有的图表图片或 PDF 文档，AI 识别并增强。

核心功能：

- **自然语言生成图表**：输入"画一个 RAG 架构图"，AI 生成对应的 draw.io XML 并渲染
- **图片复刻**：上传已有的图表图片，AI 自动识别并生成可编辑的 draw.io 格式
- **PDF 和文本文件上传**：从 PDF 或文本中提取内容生成图表
- **AI 推理过程展示**：对于支持推理的模型（OpenAI o1/o3、Gemini、Claude 等），可展示 AI 的思考过程
- **图表历史**：版本控制，可查看和恢复之前的版本
- **交互式聊天**：实时对话精炼图表
- **云架构图**：专门支持 AWS、Azure、GCP 架构图生成（Claude 系列在此场景效果最佳）
- **动画连接线**：可生成动态连接线增强可视化
- **MCP Server**：可作为 MCP Server 供 Claude Desktop、Cursor、VS Code 等 Agent 调用

技术栈：Next.js + Vercel AI SDK + react-drawio。

支持 14+ 个 AI Provider（OpenAI、Anthropic、Google AI、Azure、Bedrock、DeepSeek、SiliconFlow、ModelScope、SGLang 等），部署方式包括 Vercel、Tencent EdgeOne Pages、Cloudflare Workers 和桌面应用。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [DayuanJiang/next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) |
| 在线体验 | [next-ai-drawio.jiang.jp](https://next-ai-drawio.jiang.jp) |
| Provider 配置指南 | [ai-providers.md](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/docs/en/ai-providers.md) |

## ModelScope 集成

Next AI Draw.io 将 ModelScope 列为支持的 AI Provider 之一，配置后可使用 ModelScope 上的开源模型（Qwen 等系列）生成图表。

## 接入流程

Next AI Draw.io 支持三种方式配置 ModelScope。

### 方式一：通过设置面板配置

1. 打开 Next AI Draw.io
2. 点击聊天面板中的设置图标
3. 选择 Provider 为 `ModelScope`
4. 填入 API Key
5. 选择模型

### 方式二：通过环境变量配置

```bash
# .env.local
AI_PROVIDER=modelscope
MODELSCOPE_API_KEY=your_api_key
AI_MODEL=Qwen/Qwen3.5-27B
```

### 方式三：服务端多模型配置

```json
// ai-models.json 或 AI_MODELS_CONFIG 环境变量
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

配置完成后，在聊天中描述想要的图表，AI 会自动生成 draw.io 格式的 XML 并渲染。

![Next AI Draw.io 使用 ModelScope 生成图表效果 1](../_resources/Next-AI-Drawio-1.png)

![Next AI Draw.io 使用 ModelScope 生成图表效果 2](../_resources/Next-AI-Drawio-2.png)

![Next AI Draw.io 使用 ModelScope 生成图表效果 3](../_resources/Next-AI-Drawio-3.png)

![Next AI Draw.io 使用 ModelScope 生成图表效果 4](../_resources/Next-AI-Drawio-4.png)

![Next AI Draw.io 使用 ModelScope 生成图表效果 5](../_resources/Next-AI-Drawio-5.png)

### 通过 MCP Server 使用

Next AI Draw.io 提供了 MCP Server，可以让 Claude Desktop、Cursor、VS Code 等 AI Agent 通过 MCP 协议直接调用图表生成能力。Agent 生成图表后会实时在浏览器中渲染。

**Claude Desktop / Cursor / VS Code 配置**：

在 MCP 配置文件中添加：

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

**Claude Code CLI 配置**：

```bash
claude mcp add drawio -- npx @next-ai-drawio/mcp-server@latest
```

配置完成后，直接用自然语言让 Agent 生成图表，例如：

> Create a flowchart showing user authentication with login, MFA, and session management

图表会实时出现在浏览器中。详细配置参考 [MCP Server README](https://github.com/DayuanJiang/next-ai-draw-io/blob/main/packages/mcp-server/README.md)。