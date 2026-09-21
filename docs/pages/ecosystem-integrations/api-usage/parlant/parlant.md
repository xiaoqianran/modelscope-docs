<!-- modelscope-docs: Parlant | ecosystem-integrations/api-usage/parlant/parlant_EN.md -->

## Overview

Parlant is an AI Agent control framework for enterprise-grade customer conversation scenarios, focused on conversational governance and behavior control. The core problem: as business rules accumulate, the traditional system-prompt approach causes LLM compliance to degrade — the longer the prompt, the more likely the model is to ignore its instructions.

Instead of stuffing every rule into a single prompt, Parlant uses a **context matching engine**: once rules are defined, the engine filters only the rules relevant to the current topic in each conversation turn and injects them into the context. The more rules, the smarter the Agent — not the more chaotic.

Three design goals:

1. **Precise control over the conversation experience**: In customer service scenarios, tone, timing, edge cases, policy constraints, and brand voice all matter; Parlant makes these aspects configurable and manageable
2. **Maximize prevention of inappropriate behavior**: Build constraints and control points into how the LLM is used, rather than adding guardrails to the output after the fact
3. **The fastest path from product feedback to implementation**: Product owners can adjust Agent behavior intuitively, without manually rewriting flowcharts or fine-tuning models

Core features:

- **Guidelines**: Condition-action pairs; the engine matches only relevant guidelines per turn and injects them into the context
- **Relationships**: Dependencies and exclusions between guidelines, keeping the context focused
- **Journeys**: Multi-turn SOPs; the Agent follows the flow but adapts to the customer's actual interaction style
- **Canned Responses**: At critical moments, restrict the Agent to using only pre-approved templates, eliminating hallucination risk
- **Tools**: External APIs and workflows, triggered only when observed conditions match
- **Glossary**: Domain vocabulary mappings, letting the Agent understand the customer's colloquial expressions
- **Explainability**: End-to-end OpenTelemetry tracing; every guideline match and decision is logged

Parlant does not replace the existing tech stack; instead, it works alongside frameworks such as LangGraph, Agno, and LlamaIndex as a conversational governance layer. An official React Chat Widget is available for direct embedding. It has production deployments in organizations with high compliance requirements, such as banks.

## Resources

| Resource | URL |
|----------|-----|
| Repository | [emcie-co/parlant](https://github.com/emcie-co/parlant) |
| Official Documentation | [parlant.io/docs](https://www.parlant.io/docs) |
| React Chat Widget | [emcie-co/parlant-chat-react](https://github.com/emcie-co/parlant-chat-react) |
| Discord | [discord.gg/duxWqxKk6J](https://discord.gg/duxWqxKk6J) |

## ModelScope Integration

Parlant supports configuring ModelScope as an NLP service (`NLPServices.modelscope`), using open-source models on ModelScope to drive the Agent's conversations. Parlant recommends using a capable model; an undersized model will produce inconsistent results.

## Getting Started

**1. Create the environment and install dependencies**

```bash
conda create -n parlant python=3.10 -y
conda activate parlant
pip install parlant==3.3.2
pip install 'huggingface_hub>=0.21.0,<1.0' 'tokenizers>0.21' 'torch>=2.8.0'
```

**2. Set environment variables**

```bash
export MODELSCOPE_API_KEY="your_api_key"
export MODELSCOPE_MODEL_NAME="Qwen/Qwen3.5-27B"
```

> To make these persist after restarting the terminal, append the two lines above to `~/.zshrc`.

**3. Fix a known bug**

The ModelScope adapter in Parlant 3.3.2 has a method name typo that requires a manual fix:

Locate the file `parlant/adapters/nlp/modelscope_service.py` (under the site-packages directory), change `_do_generate` to `do_generate` (two occurrences in total), and save.

**4. Run**

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

On first run, an approximately 275MB embedding model will be downloaded. If the download is slow, set the mirror first:

```bash
export HF_ENDPOINT=https://hf-mirror.com
```

After a successful run, the terminal will display:

```
Server is ready for some serious action
Try the Sandbox UI at http://localhost:8800
Server is ready to accept requests.
```

Open a browser and visit **http://localhost:8800** to use the Parlant Sandbox UI for conversing with the Agent.

![Parlant running with ModelScope, result 1](../_resources/parlant-1.png)

![Parlant running with ModelScope, result 2](../_resources/parlant-2.png)

> **Note**: Using the ModelScope API requires linking an Alibaba Cloud account and a Chinese mobile phone number.
