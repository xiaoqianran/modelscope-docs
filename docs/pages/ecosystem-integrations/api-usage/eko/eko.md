<!-- modelscope-docs: Eko | ecosystem-integrations/api-usage/eko/eko_EN.md -->

# Eko

## Overview

Eko (Eko Keeps Operating) is a production-grade JavaScript Agent framework that supports creating agents from simple instructions to complex workflows using natural language. It provides a unified interface, allowing Agents to run in three environments: browser extensions, Web applications, and Node.js.

Eko's positioning is similar to Browser-use but with a different focus: Eko emphasizes workflow orchestration and multi-Agent collaboration, rather than just browser operations.

Core features:

- **Pure JavaScript implementation**: Designed for browser and Node.js environments
- **Multi-Agent**: Multiple Agents can be orchestrated to collaborate within a single task
- **Agent/tool flexibility**: Customize new Agents and tools with a single line of code
- **Native MCP**: Seamlessly connect with the MCP server ecosystem
- **Dynamic LLM**: Flexible model selection, balancing speed and performance
- **Human-in-the-loop**: Manual intervention at critical moments
- **Streaming planning**: Dynamically render the task planning process
- **Loop and listen tasks**: Automate repetitive tasks
- **Task parallelism**: Dependency-aware parallel execution

According to Eko's framework comparison table, it outperforms LangChain, Browser-use, Dify.ai, and Coze in dimensions such as "single-sentence multi-step workflow generation", "intervention capability", and "task parallelism".

## Resources

| Resource | URL |
|----------|-----|
| Repository | [FellouAI/eko](https://github.com/FellouAI/eko) |
| Official documentation | [eko.fellou.ai/docs](https://eko.fellou.ai/docs) |

## ModelScope Integration

Eko supports configuring ModelScope as an LLM Provider. Since the ModelScope API is compatible with the OpenAI format, Eko can be integrated directly via the OpenAI provider, using multimodal models such as Qwen3-VL to drive visual understanding in browser automation tasks.

## Getting Started

**Installation**:

```bash
pnpm install @eko-ai/eko
```

**Configuration**:

```typescript
import { Eko, BrowserAgent } from '@eko-ai/eko';

const llms = {
  default: {
    provider: "openai",  // ModelScope is compatible with the OpenAI format
    model: "qwen3-vl",
    apiKey: "your_modelscope_api_key",
    config: {
      baseURL: "https://api-inference.modelscope.cn/v1"
    }
  }
};

const agents = [new BrowserAgent()];
const eko = new Eko({ llms, agents });

// Describe the task in natural language
const result = await eko.run(
  "Search for the latest AI news, summarize it, and save it to the desktop"
);
```

Eko is primarily compatible with ModelScope's `qwen3-vl` series of multimodal models, suitable for visual understanding in browser automation scenarios.

![Eko using ModelScope effect diagram 1](../_resources/eko-1.png)

![Eko using ModelScope effect diagram 2](../_resources/eko-2.png)
