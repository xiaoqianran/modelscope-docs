<!-- modelscope-docs: Vibe-Trading | ecosystem-integrations/api-usage/vibe-trading/vibe-trading_CN.md -->

## 概述

Vibe-Trading 是 HKUDS 开发的个人交易智能体（Personal Trading Agent），通过 LLM 驱动完整的交易研究流程。用自然语言描述研究目标，Agent 自动完成行情获取、策略回测、风险分析和投资组合管理。

技术栈为 Python 3.11+ / FastAPI / React 19，支持 CLI、WebUI 和 API/MCP 三种交互方式。

核心能力：

- **多市场回测引擎**：覆盖美股、A 股、港股、韩国 KRX、加拿大股票和加密货币 USD-M 永续合约，共 9 个回测引擎，支持涨跌停判定、复权处理和混合币种隔离
- **Shadow Account（影子账户）**：模拟交易环境，在不接入真实券商的情况下执行和记录交易
- **数据源覆盖**：24 个行情数据源，包括 Yahoo、Tushare、akshare、东方财富、新浪、Stooq、OKX、Binance 等，自动 fallback 补齐缺失数据
- **quantlib 金融数学层**：约 250 个带测试的金融函数，覆盖期权、债券、信用、VaR/CVaR/EVT、业绩归因、事件研究等，通过 Web/API/MCP 统一调用
- **多 Agent 协作（Swarm）**：30+ 预设 swarm 模板，支持子 Agent 嵌套生成和并行工作流
- **MCP 工具集**：64 个 MCP 工具，涵盖行情、基本面、技术指标、期权分析、情绪分析和策略回测
- **技术指标与期权分析**：RSI/MACD/布林带/SMA/EMA 计算，期权收益工作流（到期盈亏极值、精确盈亏平衡点、情景分析）
- **定时研究**：时区感知的 cron 调度，支持夏令时切换，可定时执行研究任务并推送结果
- **策略沙箱**：生成的策略代码在隔离环境执行，禁止导入券商层和危险模块（`socket`/`subprocess`/`os.system`/`ctypes`）
- **记忆系统**：持久化记忆，支持质量评分、艾宾浩斯衰减和结构化组织（Tier 2）
- **多 Provider 支持**：OpenAI、Anthropic、DeepSeek、Google Gemini、Groq、DashScope、Zhipu、Moonshot、MiniMax、Ollama、SiliconFlow、ModelScope 等

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) |
| 官方网站 | [vibetrading.wiki](https://vibetrading.wiki/) |
| 文档 | [vibetrading.wiki/docs](https://vibetrading.wiki/docs/) |
| PyPI 包 | [vibe-trading-ai](https://pypi.org/project/vibe-trading-ai/) |
| Discord | [discord.gg/6TdQnT5xcF](https://discord.gg/6TdQnT5xcF) |

## ModelScope 集成

Vibe-Trading 将 ModelScope 注册为内置 LLM Provider，通过 OpenAI 兼容 API 端点接入。配置后可在 CLI、WebUI 和 API/MCP 全部交互方式中使用 ModelScope 上的开源模型（Qwen、DeepSeek、GLM 等）驱动交易研究流程。

集成细节：

- **Provider ID**：`modelscope`
- **Endpoint**：`https://api-inference.modelscope.cn/v1`
- **认证方式**：Bearer Token（`MODELSCOPE_API_KEY`）
- **默认模型**：`Qwen/Qwen3.5-27B`
- **CLI onboarding 推荐模型**：
  - `Qwen/Qwen3.5-27B`
  - `Qwen/Qwen3.5-397B-A17B`
  - `Qwen/Qwen3-235B-A22B`
- **Provider 类型**：纯 OpenAI 兼容，无需特殊适配

> ModelScope（魔搭社区）是阿里云的 MaaS 平台。使用前需获取 ModelScope API Key 并绑定阿里云账号。

## 接入流程

### 前置条件

- Python 3.11+
- ModelScope API Key（从 [modelscope.cn](https://modelscope.cn/docs/model-service/API-Inference/intro) 获取，需绑定阿里云账号）

### 安装

```bash
pip install -U vibe-trading-ai
```

### 配置 ModelScope

**方式一：WebUI 配置（推荐）**

启动 WebUI 后，进入「设置 → LLM 设置」，在提供商下拉框中选择 ModelScope，选择模型并填入 API Key 即可完成配置。

![Vibe-Trading 配置 ModelScope 效果图](../_resources/vibe-trading-3.png)

**方式二：CLI 交互式配置**

```bash
vibe-trading
```

启动后进入交互式 onboarding，选择 ModelScope 作为 Provider，填入 API Key，选择模型即可完成配置。

**方式三：通过 `.env` 文件配置**

在 `~/.vibe-trading/.env` 或项目根目录的 `.env` 中添加：

```bash
# --- ModelScope ---
LANGCHAIN_PROVIDER=modelscope
LANGCHAIN_MODEL_NAME=Qwen/Qwen3.5-27B
MODELSCOPE_API_KEY=your_api_key
MODELSCOPE_BASE_URL=https://api-inference.modelscope.cn/v1
```

**方式四：通过环境变量配置**

```bash
export LANGCHAIN_PROVIDER=modelscope
export LANGCHAIN_MODEL_NAME=Qwen/Qwen3.5-27B
export MODELSCOPE_API_KEY=your_api_key
export MODELSCOPE_BASE_URL=https://api-inference.modelscope.cn/v1
```

### 使用示例

配置完成后，通过 CLI 或 WebUI 用自然语言描述交易研究需求即可。以下为两个典型示例：

**示例一：A 股风险平价组合回测**

```
用000001.SZ、600519.SH、000858.SZ构建风险平价组合，回测2024全年，与等权基准对比
```

![Vibe-Trading 使用示例：A股风险平价组合回测](../_resources/vibe-trading-1.png)

**示例二：加密货币均线策略回测**

```
Backtest a BTC-USDT 20/50 moving-average strategy for 2024, summarize return and drawdown, then export the report
```

![Vibe-Trading 使用示例：BTC-USDT 均线策略回测](../_resources/vibe-trading-2.png)

### WebUI 功能

通过 `vibe-trading serve` 启动 WebUI 后，左侧导航栏提供以下功能模块：

**定时研究（Scheduled）**

设置研究提示词、运行节奏（cron 表达式）、本地时间和时区，Agent 会按计划自动执行研究任务。支持 IANA 时区，可正确处理夏令时切换。

![Vibe-Trading 定时研究配置](../_resources/vibe-trading-4.png)

**Alpha 因子库**

浏览来自 Qlib、Kakushadze 101 公式集、GTJA 191、学术异象文献以及 PIT 安全基本面因子的公式驱动 Alpha 信号。点击任意 Alpha 查看公式和源码，或运行基准测试在特定市场和时间段上评分整个因子库。

![Vibe-Trading Alpha 因子库](../_resources/vibe-trading-5.png)

**IM 通道**

将聊天适配器接入 Web UI 和 CLI 使用的同一套 Vibe-Trading 会话运行时。支持刷新、启动通道和停止通道操作。

![Vibe-Trading IM 通道配置](../_resources/vibe-trading-6.png)

**交易监控**

只读状态页面，数据来自 `/Live/status`。本页面不会授权连接器、启动或停止执行程序、提交或撤销订单，也不会修改交易授权（mandate）。

**报告**

集中浏览历史回测报告、指标和运行详情。

**相关性矩阵**

展示资产间滚动相关性矩阵，支持边密度（edge density）分析和融合（FUSED）市场状态标记。

![Vibe-Trading 交易监控界面](../_resources/vibe-trading-7.png)

### API / MCP

Vibe-Trading 提供 REST API 和 MCP 协议接入，可从外部应用或 AI Agent 调用全部交易研究工具。