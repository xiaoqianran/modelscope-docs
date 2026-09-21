<!-- modelscope-docs: Browser-use | ecosystem-integrations/api-usage/browser-use/browser-use_EN.md -->

## Overview

Browser-use is a framework that enables AI Agents to operate browsers. By describing tasks in natural language, an Agent can automatically open web pages, click buttons, fill out forms, and extract data. On the Odysseys leaderboard, Browser-use ranks first with an average score of 87.4%, surpassing the computer-use agents of OpenAI, Anthropic, Google, and Microsoft.

It supports two usage modes:

- **Python library**: for embedding browser automation capabilities into your own code, suitable for scenarios that require repeated execution or parallel scheduling
- **CLI tool**: registered as a skill after installation, allowing Agents such as Claude Code, Codex, and Cursor to invoke browser capabilities

Built-in tools cover file read/write, terminal execution, browser automation, scheduled tasks, memory retrieval, web search, and more, while also supporting the MCP protocol. Custom tool extensions are supported.

## Resources

| Resource | URL |
|----------|-----|
| Repository | [browser-use/browser-use](https://github.com/browser-use/browser-use) |
| Official documentation | [docs.browser-use.com](https://docs.browser-use.com) |
| Cloud service | [cloud.browser-use.com](https://cloud.browser-use.com) |
| Discord | [link.browser-use.com/discord](https://link.browser-use.com/discord) |

## ModelScope Integration

Browser-use provides sample code and documentation for the ModelScope API, allowing you to connect Qwen3/Qwen3.5 series models to drive the Agent via ModelScope's OpenAI-compatible API. Browser-use's Web UI also supports ModelScope configuration.

## Getting Started

**Installation**:

```bash
pip install browser-use
# or
uv add browser-use
```

**Configuration**: Add your ModelScope API Key in the `.env` file:

```bash
# .env
MODELSCOPE_API_KEY=your_api_key
```

**Sample code**:

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

Supported models include the Qwen3 and Qwen3.5 series. For more models, see: [ModelScope inference model list](https://www.modelscope.cn/models?filter=inference_type&page=1)

After running the program, the browser opens automatically and executes the task. The terminal outputs each step of the Agent's actions:

![Browser-use with ModelScope effect 1](../_resources/browser-use-1.png)

![Browser-use with ModelScope effect 2](../_resources/browser-use-2.png)

![Browser-use with ModelScope effect 3](../_resources/browser-use-3.png)
