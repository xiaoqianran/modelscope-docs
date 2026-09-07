<!-- modelscope-docs: Browser-use | ecosystem-integrations/api-usage/browser-use/browser-use_CN.md -->

## 概述

Browser-use 是让 AI Agent 操作浏览器的框架。通过自然语言描述任务，Agent 可自动打开网页、点击按钮、填写表单、提取数据。在 Odysseys 排行榜上，Browser-use 以 87.4% 的平均成绩排名第一，超过了 OpenAI、Anthropic、Google 和 Microsoft 的 computer-use agent。

它支持两种使用方式：

- **Python 库**：用于在自己的代码中嵌入浏览器自动化能力，适合需要重复执行或并行调度的场景
- **CLI 工具**：安装后注册为 skill，可以让 Claude Code、Codex、Cursor 等 Agent 调用浏览器能力

内置工具覆盖文件读写、终端执行、浏览器自动化、定时任务、记忆检索、网页搜索等，同时支持 MCP 协议。支持自定义工具扩展。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [browser-use/browser-use](https://github.com/browser-use/browser-use) |
| 官方文档 | [docs.browser-use.com](https://docs.browser-use.com) |
| 云服务 | [cloud.browser-use.com](https://cloud.browser-use.com) |
| Discord | [link.browser-use.com/discord](https://link.browser-use.com/discord) |

## ModelScope 集成

Browser-use 提供 ModelScope API 的示例代码和文档，可通过 ModelScope 的 OpenAI 兼容 API 接入 Qwen3/Qwen3.5 系列模型驱动 Agent。Browser-use 的 Web UI 也支持 ModelScope 配置。

## 接入流程

**安装**：

```bash
pip install browser-use
# 或
uv add browser-use
```

**配置**：在 `.env` 文件中添加 ModelScope API Key：

```bash
# .env
MODELSCOPE_API_KEY=your_api_key
```

**示例代码**：

```python
"""
Simple try of the agent.

@dev You need to add MODELSCOPE_API_KEY to your environment variables.
"""

import asyncio
import os

from dotenv import load_dotenv

from browser_use import Agent, ChatOpenAI

# dotenv
load_dotenv()

api_key = os.getenv('MODELSCOPE_API_KEY', '')
if not api_key:
    raise ValueError('MODELSCOPE_API_KEY is not set')


async def run_search():
    agent = Agent(
        # task=('go to amazon.com, search for laptop'),
        task=('go to google, search for modelscope'),
        llm=ChatOpenAI(base_url='https://api-inference.modelscope.cn/v1/', model='Qwen/Qwen3-VL-30B-A3B-Instruct', api_key=api_key),
        use_vision=False,
    )

    await agent.run()


if __name__ == '__main__':
    asyncio.run(run_search())
```

支持的模型包括 Qwen3 和 Qwen3.5 系列。更多模型参考：[ModelScope 推理模型列表](https://www.modelscope.cn/models?filter=inference_type&page=1)

在执行程序后，会自动打开浏览器并执行任务，终端会输出 Agent 的每一步操作：

![Browser-use 使用 ModelScope 效果图 1](../_resources/browser-use-1.png)

![Browser-use 使用 ModelScope 效果图 2](../_resources/browser-use-2.png)

![Browser-use 使用 ModelScope 效果图 3](../_resources/browser-use-3.png)