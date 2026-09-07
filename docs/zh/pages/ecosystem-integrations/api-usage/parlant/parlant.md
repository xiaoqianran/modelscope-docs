<!-- modelscope-docs: Parlant | ecosystem-integrations/api-usage/parlant/parlant_CN.md -->

## 概述

Parlant 是面向企业级客户对话场景的 AI Agent 控制框架，专注于对话治理和行为控制。核心问题是：随着业务规则增多，传统的系统提示词方式会导致 LLM 遵循度下降——提示词越长，模型越容易忽略其中的指令。

Parlant 的思路不是把所有规则塞进一个 prompt，而是用**上下文匹配引擎**：定义好规则后，引擎在每一轮对话中只将与当前话题相关的规则筛选出来注入上下文。规则越多，Agent 越聪明，而不是越混乱。

三个设计目标：

1. **对对话体验的精确控制**：在客服场景中，语气、时机、边界情况、政策约束和品牌声音都很重要，Parlant 让这些方面可配置可管理
2. **最大限度防止不当行为**：把约束和控制点内建到 LLM 的使用方式中，而不是事后给输出加护栏
3. **从产品反馈到实现的最快路径**：产品方可以直观地调整 Agent 行为，不需要手动重写流程图或微调模型

核心功能：

- **Guidelines（规则）**：条件-动作对，引擎每轮只匹配相关的规则注入上下文
- **Relationships（关系）**：规则之间的依赖和排除关系，保持上下文聚焦
- **Journeys（旅程）**：多轮 SOP，Agent 按流程走但能适应客户的实际交互方式
- **Canned Responses（预置回复）**：关键时刻限制 Agent 只能使用预批准的模板，消除幻觉风险
- **Tools（工具）**：外部 API 和工作流，只在观测条件匹配时触发
- **Glossary（术语表）**：领域词汇映射，让 Agent 理解客户的口语化表达
- **Explainability（可解释性）**：全链路 OpenTelemetry 追踪，每条规则匹配和决策都有日志

Parlant 不替代现有技术栈，而是作为对话治理层与 LangGraph、Agno、LlamaIndex 等框架配合使用。已有官方 React Chat Widget 可直接嵌入。在银行等高合规要求的组织中已有生产部署。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [emcie-co/parlant](https://github.com/emcie-co/parlant) |
| 官方文档 | [parlant.io/docs](https://www.parlant.io/docs) |
| React Chat Widget | [emcie-co/parlant-chat-react](https://github.com/emcie-co/parlant-chat-react) |
| Discord | [discord.gg/duxWqxKk6J](https://discord.gg/duxWqxKk6J) |

## ModelScope 集成

Parlant 支持配置 ModelScope 作为 NLP 服务（`NLPServices.modelscope`），使用 ModelScope 上的开源模型驱动 Agent 对话。Parlant 建议使用能力较强的模型，模型过小会产生不一致的结果。

## 接入流程

**1. 创建环境并安装依赖**

```bash
conda create -n parlant python=3.10 -y
conda activate parlant
pip install parlant==3.3.2
pip install 'huggingface_hub>=0.21.0,<1.0' 'tokenizers>0.21' 'torch>=2.8.0'
```

**2. 设置环境变量**

```bash
export MODELSCOPE_API_KEY="your_api_key"
export MODELSCOPE_MODEL_NAME="Qwen/Qwen3.5-27B"
```

> 想要重启终端后也生效，把上面两行加到 `~/.zshrc` 末尾。

**3. 修复已知 Bug**

Parlant 3.3.2 的 ModelScope 适配器有个方法名笔误，需手动修复：

找到文件 `parlant/adapters/nlp/modelscope_service.py`（在 site-packages 目录下），把 `_do_generate` 改成 `do_generate`（共两处），保存即可。

**4. 运行**

```python
# parlant-test.py
import asyncio
import parlant.sdk as p

async def main():
    async with p.Server(nlp_service=p.NLPServices.modelscope) as server:
        agent = await server.create_agent(
            name="Otto Carmen",
            description="You work at a car dealership",
        )

asyncio.run(main())
```

```bash
python parlant-test.py
```

首次运行会下载一个约 275MB 的 embedding 模型。下载慢的话先设镜像：

```bash
export HF_ENDPOINT=https://hf-mirror.com
```

运行成功后，终端会显示：

```
Server is ready for some serious action
Try the Sandbox UI at http://localhost:8800
Server is ready to accept requests.
```

打开浏览器访问 **http://localhost:8800** 即可使用 Parlant Sandbox UI 与 Agent 进行对话。

![Parlant 使用 ModelScope 运行效果 1](../_resources/parlant-1.png)

![Parlant 使用 ModelScope 运行效果 2](../_resources/parlant-2.png)

> **注意**：使用 ModelScope API 需绑定阿里云账号，且需要中国手机号。