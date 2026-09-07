<!-- modelscope-docs: Eko | ecosystem-integrations/api-usage/eko/eko_CN.md -->

# Eko

## 概述

Eko（Eko Keeps Operating）是生产级 JavaScript Agent 框架，支持用自然语言创建从简单指令到复杂工作流的智能体。提供统一接口，Agent 可运行在浏览器扩展、Web 应用和 Node.js 三种环境中。

Eko 的定位和 Browser-use 类似但侧重不同：Eko 更强调工作流编排和多 Agent 协作，而不只是浏览器操作。

核心特性：

- **纯 JavaScript 实现**：面向浏览器和 Node.js 环境
- **多 Agent**：一个任务中可以编排多个 Agent 协作
- **Agent/工具灵活性**：一行代码自定义新的 Agent 和工具
- **原生 MCP**：与 MCP 服务器生态无缝连接
- **动态 LLM**：灵活的模型选择，平衡速度和性能
- **Human-in-the-loop**：关键时刻可以人工介入
- **流式规划**：动态渲染任务规划过程
- **循环和监听任务**：自动化重复性任务
- **任务并行**：依赖感知的并行执行

根据 Eko 的框架对比表，它在"一句话生成多步工作流""可干预性""任务并行"等维度上优于 LangChain、Browser-use、Dify.ai 和 Coze。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [FellouAI/eko](https://github.com/FellouAI/eko) |
| 官方文档 | [eko.fellou.ai/docs](https://eko.fellou.ai/docs) |

## ModelScope 集成

Eko 支持配置 ModelScope 作为 LLM Provider。由于 ModelScope API 兼容 OpenAI 格式，Eko 可直接通过 OpenAI provider 接入，使用 Qwen3-VL 等多模态模型驱动浏览器自动化任务中的视觉理解。

## 接入流程

**安装**：

```bash
pnpm install @eko-ai/eko
```

**配置**：

```typescript
import { Eko, BrowserAgent } from '@eko-ai/eko';

const llms = {
  default: {
    provider: "openai",  // ModelScope 兼容 OpenAI 格式
    model: "qwen3-vl",
    apiKey: "your_modelscope_api_key",
    config: {
      baseURL: "https://api-inference.modelscope.cn/v1"
    }
  }
};

const agents = [new BrowserAgent()];
const eko = new Eko({ llms, agents });

// 用自然语言描述任务
const result = await eko.run(
  "搜索最新的 AI 新闻，总结并保存到桌面"
);
```

Eko 主要兼容 ModelScope 的 `qwen3-vl` 系列多模态模型，适用于浏览器自动化场景中的视觉理解。

![Eko 使用 ModelScope 效果图 1](../_resources/eko-1.png)

![Eko 使用 ModelScope 效果图 2](../_resources/eko-2.png)