<!-- modelscope-docs: LangChain | ecosystem-integrations/api-usage/langchain/langchain_EN.md -->

## Overview

LangChain is a framework for building Agents and LLM applications, providing standardized interfaces for models, embeddings, and vector stores, simplifying AI application development through interoperable components and third-party integrations.

The core design of LangChain is **componentization**—capabilities such as model invocation, prompt management, output parsing, retrieval, and tool calling are all independent components that are combined through Chains (chained calls). Developers can freely switch between different LLM providers without rewriting code, which is the foundation that enables ModelScope's rapid integration.

The LangChain ecosystem includes several products:

- **LangGraph**: A lower-level Agent orchestration framework for building controllable, stateful multi-step Agent workflows. Suitable for scenarios requiring complex logic such as human-in-the-loop, conditional branching, and loops
- **LangSmith**: An Agent evaluation, observability, and debugging platform. It can trace the input/output, latency, and cost of each step's invocation
- **Deep Agents**: A higher-level package built on LangChain, with built-in capabilities such as planning, sub-Agents, and file systems, suitable for rapidly building complex Agents

### Core Advantages

LangChain helps developers build LLM-driven applications through standardized interfaces for models, embeddings, and vector stores. Specific advantages include:

- **Real-time data augmentation**: Connects LLMs with various data sources and external/internal systems, leveraging a rich integration library (model providers, tools, vector stores, retrievers, etc.)
- **Model interoperability**: Freely switch models during experimentation and selection. As the industry frontier continues to evolve, LangChain's abstraction layer supports rapid adaptation, and switching models does not affect development
- **Rapid prototyping**: Quickly build and iterate LLM applications based on a modular, componentized architecture, enabling fast testing of different approaches and workflows
- **Production-grade features**: Provides built-in monitoring, evaluation, and debugging support through integrations such as LangSmith. Battle-tested patterns and best practices support application scaling
- **Active community and ecosystem**: A rich collection of integrations, templates, and community-contributed components, with continuous improvements and tracking of the latest AI developments
- **Flexible abstraction layer**: From high-level Chains for quick starts to fine-grained control with lower-level components, supporting scaling as application complexity grows

## Resources

| Resource | URL |
|----------|-----|
| Repository | [langchain-ai/langchain](https://github.com/langchain-ai/langchain) |
| Official documentation | [docs.langchain.com](https://docs.langchain.com) |
| ModelScope integration documentation | [ModelScope integrations](https://docs.langchain.com/oss/python/integrations/providers/modelscope) |
| PyPI package | [langchain-modelscope-integration](https://pypi.org/project/langchain-modelscope-integration/) |
| LangChain Academy | [academy.langchain.com](https://academy.langchain.com/) |

## ModelScope Integration

LangChain offers two ways to integrate with ModelScope:

1. **Official integration package** (`langchain-modelscope-integration`): Provides three dedicated classes—`ModelScopeChatEndpoint` (Chat conversations), `ModelScopeEmbeddings` (vector embeddings), and `ModelScopeEndpoint` (text completion). Wrapped through the ModelScope SDK, it offers the most complete functionality and also supports Embeddings vector embeddings
2. **OpenAI-compatible interface**: Leverages the fact that the ModelScope API is compatible with the OpenAI format, directly using `ChatOpenAI` with `base_url` set to integrate, without requiring any additional package installation

Both methods use the same token—the ModelScope Access Token, obtained from [modelscope.cn/my/myaccesstoken](https://modelscope.cn/my/myaccesstoken).

## Getting Started

### Method 1: Using the Official Integration Package (Recommended)

```bash
pip install -U langchain-modelscope-integration
```

Set the environment variable:

```bash
export MODELSCOPE_SDK_TOKEN=<your_sdk_token>
```

**Chat**:

```python
from langchain_modelscope import ModelScopeChatEndpoint

llm = ModelScopeChatEndpoint(model="Qwen/Qwen3.5-27B")
llm.invoke("你好，请介绍一下自己。")
```

**Embeddings (vector embeddings)**:

```python
from langchain_modelscope import ModelScopeEmbeddings

embeddings = ModelScopeEmbeddings(model_id="damo/nlp_corom_sentence-embedding_english-base")
embeddings.embed_query("What is the meaning of life?")
```

**LLM (text completion)**:

```python
from langchain_modelscope import ModelScopeEndpoint

llm = ModelScopeEndpoint(model="Qwen/Qwen3.5-27B")
llm.invoke("The meaning of life is")
```

### Method 2: Using the OpenAI-Compatible Format

No additional package installation required—directly use `ChatOpenAI` with `base_url` set:

```bash
pip install langchain langchain-openai
```

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# ModelScope is compatible with the OpenAI format
llm = ChatOpenAI(
    model="Qwen/Qwen3.5-27B",
    api_key="your_modelscope_api_key",
    base_url="https://api-inference.modelscope.cn/v1"
)

# Use within a Chain
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有帮助的助手。"),
    ("user", "{input}")
])

chain = prompt | llm
response = chain.invoke({"input": "你好，请介绍一下自己。"})
print(response.content)
```

### RAG Example: Combining Chat + Embeddings

Using the dedicated classes from Method 1, you can combine Chat and Embeddings to build a complete RAG workflow:

```python
from langchain_modelscope import ModelScopeChatEndpoint, ModelScopeEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Initialize the models
llm = ModelScopeChatEndpoint(model="Qwen/Qwen3.5-27B")
embeddings = ModelScopeEmbeddings(model_id="damo/nlp_corom_sentence-embedding_english-base")

# Build a Q&A Chain
prompt = ChatPromptTemplate.from_template("基于以下上下文回答问题：\n{context}\n\n问题：{question}")
chain = prompt | llm | StrOutputParser()

# Assume retrieved context is already available
context = "ModelScope 是魔搭社区的开源模型平台。"
question = "ModelScope 是什么？"

response = chain.invoke({"context": context, "question": question})
print(response)
```
