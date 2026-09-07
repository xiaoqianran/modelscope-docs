<!-- modelscope-docs: RagFlow | ecosystem-integrations/api-usage/ragflow/ragflow_CN.md -->

## 概述

RagFlow 是开源的 RAG（检索增强生成）引擎，核心目标是把各种格式的文档转化为高质量的上下文，供 LLM 使用。核心理念是输入质量决定输出质量，因此 RagFlow 不只做简单的文本切片，而是先做深度文档理解，再按模板进行分块，保证每一段都有明确的语义边界。

核心能力：

- **深度文档理解**：从 Word、PPT、Excel、图片、PDF、扫描件、复印件、结构化数据、网页等各类复杂格式的非结构化数据中提取结构化知识，在长上下文场景下完成大海捞针测试
- **模板化分块**：按文档类型选择分块策略，分块过程可视化、可解释、可人工干预，提供多种文本模板可供选择
- **可溯源引用**：答案提供关键引用的快照并支持追根溯源，文本切片过程可视化、支持手动调整，最大程度降低幻觉（hallucination）
- **兼容异构数据源**：支持 Word 文档、PPT、Excel 表格、txt 文件、图片、PDF、影印件、复印件、结构化数据、网页等丰富的文件类型
- **自动化 RAG 工作流**：全面优化的 RAG 工作流支持从个人应用到超大型企业的各类生态系统，LLM 和向量模型均可配置，基于多路召回、融合重排序，提供易用的 API 便于集成到企业系统
- **Agent 工作流和 MCP**：支持 Agentic workflow 和 MCP 协议
- **文档引擎**：默认使用 Elasticsearch，也可切换到 Infinity

RagFlow 目前已达到 4 万+ star，同时提供线上 demo 供试用：[demo.ragflow.io](https://demo.ragflow.io)。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [infiniflow/ragflow](https://github.com/infiniflow/ragflow) |
| 官方网站 | [ragflow.io](https://ragflow.io) |
| 文档 | [ragflow.io/docs/dev](https://ragflow.io/docs/dev/) |
| 云服务 | [cloud.ragflow.io](https://cloud.ragflow.io) |
| 在线 Demo | [demo.ragflow.io](https://demo.ragflow.io) |

## ModelScope 集成

RagFlow 支持 ModelScope 作为模型提供商（LLM Factory），接入后可在 RAG 全流程中使用 ModelScope 上的开源模型，包括：

- 聊天对话：与知识库交互的问答环节
- 文档解析：在深度文档理解环节调用 LLM

## 接入流程

### 部署 RagFlow

**前提条件**：

- CPU >= 4 核
- RAM >= 16 GB
- Disk >= 50 GB
- Docker >= 24.0.0 & Docker Compose >= v2.26.1
- Python >= 3.13
- [gVisor](https://gvisor.dev/docs/user_guide/install/)：仅在需要使用代码执行器（sandbox）功能时安装

**Docker 部署**（推荐）：

```bash
# 1. 确保 vm.max_map_count >= 262144
sysctl vm.max_map_count
# 如果小于 262144，执行：
sudo sysctl -w vm.max_map_count=262144

# 2. 克隆代码
git clone https://github.com/infiniflow/ragflow.git
cd ragflow/docker

# 3. 启动服务
docker compose -f docker-compose.yml up -d

# 4. 检查启动状态
docker logs -f ragflow-server
```

启动成功后会显示 RAGFlow 的 ASCII Logo，然后在浏览器中输入服务器 IP 地址即可访问（默认端口 80）。

> 如果 Docker 镜像拉不下来，可以在 `docker/.env` 文件内根据 `RAGFLOW_IMAGE` 的注释提示选择华为云或阿里云的镜像。

### 配置 ModelScope

1. 登录 RagFlow 界面
2. 进入系统配置 → 模型提供商 Model Provider
3. 选择 ModelScope
4. 填入 ModelScope API Key

![RagFlow 配置 ModelScope 效果图 1](../_resources/ragflow-1.png)

![RagFlow 配置 ModelScope 效果图 2](../_resources/ragflow-2.png)

配置完成后，在知识库配置中选择 ModelScope 提供的模型即可在 RAG 流程中使用。

### 创建知识库（Dataset）

RagFlow 的知识库是 RAG 流程的核心。在 Dataset 选项中创建知识库，需要配置以下内容：

- **数据库名称**：为知识库命名
- **向量 Embedding Model**：选择用于生成文档向量表示的嵌入模型
- **分块方法**：RagFlow 提供多种解析方式，包括深度文档理解（默认）、MinerU 和 Docling 等第三方解析方法
- **分块策略**：按文档类型选择分块模板，分块过程可视化、可解释、可手动调整

知识库支持上传 Word、PPT、Excel、PDF、图片、扫描件、网页等多种格式的文档。RagFlow 会自动进行深度文档理解，提取结构化知识，并按模板进行智能分块。分块结果可视化展示，可检查和调整每一块的内容边界。

此外，RagFlow 支持从 Confluence、S3、Notion、Discord、Google Drive 等外部数据源同步数据到知识库，也支持编排式数据摄取管道（Orchestrable Ingestion Pipeline）。

![RagFlow 创建知识库](../_resources/ragflow-3.png)

### 创建智能体（Agent）

RagFlow 支持 Agentic Workflow，可创建智能体来完成复杂任务。智能体的创建方式有两种：

- **从空白（Blank）创建**：自由编排 Agent 的工作流，适合定制化需求场景
- **从模板（Template）创建**：使用预设的 Agent 结构，适合快速上手

Agent 支持的能力包括：

- Python/JavaScript 代码执行器组件
- MCP（Model Context Protocol）协议支持
- 多路召回 + 融合重排序的知识库检索
- 多模态模型支持（可用于理解 PDF 或 DOCX 中的图片）

![RagFlow 创建智能体](../_resources/ragflow-4.png)

### 记忆功能（Memory）

RagFlow 支持 AI Agent 的记忆功能（Memory），于 2025 年 12 月引入。在 Memory 选项中可以配置：

- **Name**：记忆模块的名称
- **Memory Type**：记忆类型，官方提供以下四种：
  - **Raw**：用户与 Agent 之间的原始对话（默认必需）
  - **Semantic Memory**：关于用户和世界的通用知识与事实
  - **Episodic Memory**：带有时间戳的特定事件和经历记录
  - **Procedural Memory**：习得的技能、习惯和自动化流程
- **Embedding Model**：用于记忆检索的向量嵌入模型
- **LLM**：用于记忆处理和生成的大语言模型

Memory 功能使智能体在多轮对话中保持上下文记忆，而非每次对话都从零开始。结合知识库和 Agent 工作流，RagFlow 可以构建出具备长期记忆能力的完整 RAG Agent。

![RagFlow Memory 配置](../_resources/ragflow-5.png)