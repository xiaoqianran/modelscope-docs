<!-- modelscope-docs: Vibe-Trading | ecosystem-integrations/api-usage/vibe-trading/vibe-trading_EN.md -->

## Overview

Vibe-Trading is a Personal Trading Agent developed by HKUDS that uses an LLM to drive the full trading research workflow. Describe your research goal in natural language and the Agent automatically completes market data retrieval, strategy backtesting, risk analysis, and portfolio management.

The tech stack is Python 3.11+ / FastAPI / React 19, and it supports three interaction modes: CLI, WebUI, and API/MCP.

Core capabilities:

- **Multi-market backtesting engines**: Covers US stocks, A-shares, Hong Kong stocks, Korean KRX, Canadian stocks, and crypto USD-M perpetual contracts across 9 backtesting engines, with price-limit detection, adjustment handling, and mixed-currency isolation
- **Shadow Account**: A simulated trading environment that executes and records trades without connecting to a real broker
- **Data source coverage**: 24 market data sources, including Yahoo, Tushare, akshare, Eastmoney, Sina, Stooq, OKX, Binance, etc., with automatic fallback to fill in missing data
- **quantlib financial math layer**: ~250 tested financial functions covering options, bonds, credit, VaR/CVaR/EVT, performance attribution, event studies, etc., uniformly callable via Web/API/MCP
- **Multi-Agent collaboration (Swarm)**: 30+ preset swarm templates, supporting nested sub-Agent generation and parallel workflows
- **MCP toolset**: 64 MCP tools covering market data, fundamentals, technical indicators, options analysis, sentiment analysis, and strategy backtesting
- **Technical indicators and options analysis**: RSI/MACD/Bollinger Bands/SMA/EMA calculation, options payoff workflows (extreme P&L at expiry, exact breakeven points, scenario analysis)
- **Scheduled research**: Timezone-aware cron scheduling that handles daylight saving transitions, capable of running research tasks on schedule and pushing results
- **Strategy sandbox**: Generated strategy code runs in an isolated environment, with imports of broker-layer and dangerous modules (`socket`/`subprocess`/`os.system`/`ctypes`) prohibited
- **Memory system**: Persistent memory with quality scoring, Ebbinghaus decay, and structured organization (Tier 2)
- **Multi-Provider support**: OpenAI, Anthropic, DeepSeek, Google Gemini, Groq, DashScope, Zhipu, Moonshot, MiniMax, Ollama, SiliconFlow, ModelScope, etc.

## Resources

| Resource | URL |
|----------|-----|
| Repository | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) |
| Official website | [vibetrading.wiki](https://vibetrading.wiki/) |
| Documentation | [vibetrading.wiki/docs](https://vibetrading.wiki/docs/) |
| PyPI package | [vibe-trading-ai](https://pypi.org/project/vibe-trading-ai/) |
| Discord | [discord.gg/6TdQnT5xcF](https://discord.gg/6TdQnT5xcF) |

## ModelScope Integration

Vibe-Trading registers ModelScope as a built-in LLM Provider, accessed through an OpenAI-compatible API endpoint. Once configured, open-source models on ModelScope (Qwen, DeepSeek, GLM, etc.) can be used to drive the trading research workflow across all interaction modes — CLI, WebUI, and API/MCP.

Integration details:

- **Provider ID**: `modelscope`
- **Endpoint**: `https://api-inference.modelscope.cn/v1`
- **Authentication**: Bearer Token (`MODELSCOPE_API_KEY`)
- **Default model**: `Qwen/Qwen3.5-27B`
- **CLI onboarding recommended models**:
  - `Qwen/Qwen3.5-27B`
  - `Qwen/Qwen3.5-397B-A17B`
  - `Qwen/Qwen3-235B-A22B`
- **Provider type**: Purely OpenAI-compatible, no special adaptation required

> ModelScope is Alibaba Cloud's MaaS platform. Before use, you need to obtain a ModelScope API Key and bind an Alibaba Cloud account.

## Getting Started

### Prerequisites

- Python 3.11+
- ModelScope API Key (obtain from [modelscope.cn](https://modelscope.cn/docs/model-service/API-Inference/intro), requires an Alibaba Cloud account)

### Installation

```bash
pip install -U vibe-trading-ai
```

### Configure ModelScope

**Option 1: WebUI configuration (recommended)**

After launching the WebUI, go to "Settings → LLM Settings", select ModelScope from the provider dropdown, choose a model, and enter your API Key to complete configuration.

![Vibe-Trading ModelScope configuration](../_resources/vibe-trading-3.png)

**Option 2: CLI interactive configuration**

```bash
vibe-trading
```

After launch, enter the interactive onboarding, select ModelScope as the Provider, enter your API Key, and choose a model to complete configuration.

**Option 3: Configure via `.env` file**

Add the following to `~/.vibe-trading/.env` or a `.env` in the project root:

```bash
# --- ModelScope ---
LANGCHAIN_PROVIDER=modelscope
LANGCHAIN_MODEL_NAME=Qwen/Qwen3.5-27B
MODELSCOPE_API_KEY=your_api_key
MODELSCOPE_BASE_URL=https://api-inference.modelscope.cn/v1
```

**Option 4: Configure via environment variables**

```bash
export LANGCHAIN_PROVIDER=modelscope
export LANGCHAIN_MODEL_NAME=Qwen/Qwen3.5-27B
export MODELSCOPE_API_KEY=your_api_key
export MODELSCOPE_BASE_URL=https://api-inference.modelscope.cn/v1
```

### Usage Examples

Once configured, describe your trading research needs in natural language via the CLI or WebUI. Below are two typical examples:

**Example 1: A-share risk parity portfolio backtest**

```
用000001.SZ、600519.SH、000858.SZ构建风险平价组合，回测2024全年，与等权基准对比
```

![Vibe-Trading usage example: A-share risk parity portfolio backtest](../_resources/vibe-trading-1.png)

**Example 2: Crypto moving-average strategy backtest**

```
Backtest a BTC-USDT 20/50 moving-average strategy for 2024, summarize return and drawdown, then export the report
```

![Vibe-Trading usage example: BTC-USDT moving-average strategy backtest](../_resources/vibe-trading-2.png)

### WebUI Features

After launching the WebUI with `vibe-trading serve`, the left navigation bar provides the following functional modules:

**Scheduled Research**

Set research prompts, run cadence (cron expression), local time, and timezone, and the Agent will automatically execute research tasks on schedule. Supports IANA timezones and correctly handles daylight saving transitions.

![Vibe-Trading scheduled research configuration](../_resources/vibe-trading-4.png)

**Alpha Factor Library**

Browse formula-driven Alpha signals from Qlib, the Kakushadze 101 formula set, GTJA 191, academic anomaly literature, and PIT-safe fundamental factors. Click any Alpha to view its formula and source code, or run a benchmark to score the entire factor library over a specific market and time period.

![Vibe-Trading Alpha factor library](../_resources/vibe-trading-5.png)

**IM Channels**

Connect chat adapters to the same Vibe-Trading session runtime used by the Web UI and CLI. Supports refresh, start channel, and stop channel operations.

![Vibe-Trading IM channel configuration](../_resources/vibe-trading-6.png)

**Trade Monitoring**

A read-only status page with data from `/Live/status`. This page does not authorize connectors, start or stop execution programs, submit or cancel orders, or modify trade mandates.

**Reports**

Centrally browse historical backtest reports, metrics, and run details.

**Correlation Matrix**

Displays a rolling correlation matrix between assets, supporting edge density analysis and FUSED market regime tagging.

![Vibe-Trading trade monitoring interface](../_resources/vibe-trading-7.png)

### API / MCP

Vibe-Trading provides REST API and MCP protocol access, allowing external applications or AI Agents to invoke the full set of trading research tools.
