<!-- modelscope-docs: LangChain | ecosystem-integrations/api-usage/langchain/langchain_CN.md -->

## 概述

LangChain 是构建 Agent 和 LLM 应用的框架，提供标准化的模型、嵌入、向量存储接口，通过可互操作组件和第三方集成简化 AI 应用开发。

LangChain 的核心设计是**组件化**——模型调用、提示词管理、输出解析、检索、工具调用等能力都是独立组件，通过 Chain（链式调用）组合使用。开发者可以自由切换不同 LLM 提供商而不需要重写代码，这也是 ModelScope 能快速集成的基础。

LangChain 生态包含几个产品：

- **LangGraph**：低层级 Agent 编排框架，用于构建可控的、有状态的多步 Agent 工作流。适合需要人在回路、条件分支、循环等复杂逻辑的场景
- **LangSmith**：Agent 评估、可观测性和调试平台。可以追踪每一步调用的输入输出、延迟、成本
- **Deep Agents**：基于 LangChain 的高层级包，内置规划、子 Agent、文件系统等常用能力，适合快速搭建复杂 Agent

### 核心优势

LangChain 通过标准化的模型、嵌入、向量存储等接口，帮助开发者构建 LLM 驱动的应用。具体优势包括：

- **实时数据增强**：可连接 LLM 与各类数据源和外部/内部系统，利用丰富的集成库（模型提供商、工具、向量存储、检索器等）
- **模型互操作性**：实验和选型时可自由切换模型。行业前沿不断演进时，LangChain 的抽象层支持快速适应，切换模型不影响开发
- **快速原型**：基于模块化、组件化的架构快速搭建和迭代 LLM 应用，可快速测试不同方案和工作流
- **生产级功能**：通过 LangSmith 等集成提供内置的监控、评估和调试支持。经过实战检验的模式和最佳实践支持应用规模化扩展
- **活跃的社区和生态**：丰富的集成、模板和社区贡献组件，持续改进并跟进 AI 最新发展
- **灵活的抽象层**：从高层级的 Chain 快速入门，到低层级组件的细粒度控制，支持随应用复杂度增长而扩展

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [langchain-ai/langchain](https://github.com/langchain-ai/langchain) |
| 官方文档 | [docs.langchain.com](https://docs.langchain.com) |
| ModelScope 集成文档 | [ModelScope integrations](https://docs.langchain.com/oss/python/integrations/providers/modelscope) |
| PyPI 包 | [langchain-modelscope-integration](https://pypi.org/project/langchain-modelscope-integration/) |
| LangChain Academy | [academy.langchain.com](https://academy.langchain.com/) |

## ModelScope 集成

LangChain 有两种方式接入 ModelScope：

1. **官方集成包**（`langchain-modelscope-integration`）：提供三个专用类——`ModelScopeChatEndpoint`（Chat 对话）、`ModelScopeEmbeddings`（向量嵌入）、`ModelScopeEndpoint`（文本补全）。通过 ModelScope SDK 封装，功能最完整，还支持 Embeddings 向量嵌入
2. **OpenAI 兼容接口**：利用 ModelScope API 兼容 OpenAI 格式的特性，直接用 `ChatOpenAI` 设置 `base_url` 接入，不需要额外安装包

两种方式使用的是同一个令牌——ModelScope Access Token，从 [modelscope.cn/my/myaccesstoken](https://modelscope.cn/my/myaccesstoken) 获取。

## 接入流程

### 方式一：使用官方集成包（推荐）

```bash
pip install -U langchain-modelscope-integration
```

设置环境变量：

```bash
export MODELSCOPE_SDK_TOKEN=<your_sdk_token>
```

**Chat 对话**：

```python
from langchain_modelscope import ModelScopeChatEndpoint

llm = ModelScopeChatEndpoint(model="Qwen/Qwen3.5-27B")
llm.invoke("你好，请介绍一下自己。")
```

**Embeddings（向量嵌入）**：

```python
from langchain_modelscope import ModelScopeEmbeddings

embeddings = ModelScopeEmbeddings(model_id="damo/nlp_corom_sentence-embedding_english-base")
embeddings.embed_query("What is the meaning of life?")
```

**LLM（文本补全）**：

```python
from langchain_modelscope import ModelScopeEndpoint

llm = ModelScopeEndpoint(model="Qwen/Qwen3.5-27B")
llm.invoke("The meaning of life is")
```

### 方式二：使用 OpenAI 兼容格式

无需额外安装包，直接用 `ChatOpenAI` 设置 `base_url`：

```bash
pip install langchain langchain-openai
```

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# ModelScope 兼容 OpenAI 格式
llm = ChatOpenAI(
    model="Qwen/Qwen3.5-27B",
    api_key="your_modelscope_api_key",
    base_url="https://api-inference.modelscope.cn/v1"
)

# 在 Chain 中使用
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有帮助的助手。"),
    ("user", "{input}")
])

chain = prompt | llm
response = chain.invoke({"input": "你好，请介绍一下自己。"})
print(response.content)
```

### RAG 示例：Chat + Embeddings 组合

使用方式一的专用类，可以组合 Chat 和 Embeddings 构建完整的 RAG 流程：

```python
from langchain_modelscope import ModelScopeChatEndpoint, ModelScopeEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 初始化模型
llm = ModelScopeChatEndpoint(model="Qwen/Qwen3.5-27B")
embeddings = ModelScopeEmbeddings(model_id="damo/nlp_corom_sentence-embedding_english-base")

# 构建问答 Chain
prompt = ChatPromptTemplate.from_template("基于以下上下文回答问题：\n{context}\n\n问题：{question}")
chain = prompt | llm | StrOutputParser()

# 假设已有检索到的上下文
context = "ModelScope 是魔搭社区的开源模型平台。"
question = "ModelScope 是什么？"

response = chain.invoke({"context": context, "question": question})
print(response)
```
