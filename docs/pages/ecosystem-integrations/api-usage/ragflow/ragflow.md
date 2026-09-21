<!-- modelscope-docs: RagFlow | ecosystem-integrations/api-usage/ragflow/ragflow_EN.md -->

## Overview

RagFlow is an open-source RAG (Retrieval-Augmented Generation) engine whose core goal is to transform documents in various formats into high-quality context for LLM use. The core philosophy is that input quality determines output quality, so RagFlow does not simply slice text — it first performs deep document understanding and then chunks documents according to templates, ensuring that each segment has clear semantic boundaries.

Core capabilities:

- **Deep document understanding**: Extracts structured knowledge from unstructured data in complex formats such as Word, PPT, Excel, images, PDF, scanned documents, photocopies, structured data, and web pages, and passes the haystack-in-a-needle test in long-context scenarios
- **Template-based chunking**: Selects chunking strategies by document type; the chunking process is visualizable, explainable, and allows manual intervention, with multiple text templates available
- **Traceable citations**: Answers provide snapshots of key citations and support source tracing; the text slicing process is visualizable and supports manual adjustment, minimizing hallucination to the greatest extent
- **Compatible with heterogeneous data sources**: Supports a rich variety of file types including Word documents, PPT, Excel spreadsheets, txt files, images, PDF, photocopies, scanned documents, structured data, and web pages
- **Automated RAG workflow**: A fully optimized RAG workflow supports ecosystems ranging from personal applications to ultra-large enterprises; both LLM and vector models are configurable, and based on multi-path recall and fused reranking, it provides easy-to-use APIs for integration into enterprise systems
- **Agent workflow and MCP**: Supports Agentic workflow and the MCP protocol
- **Document engine**: Uses Elasticsearch by default, and can also be switched to Infinity

RagFlow has currently reached 40,000+ stars and also provides an online demo for trial: [demo.ragflow.io](https://demo.ragflow.io).

## Resources

| Resource | URL |
|----------|-----|
| Repository | [infiniflow/ragflow](https://github.com/infiniflow/ragflow) |
| Official website | [ragflow.io](https://ragflow.io) |
| Documentation | [ragflow.io/docs/dev](https://ragflow.io/docs/dev/) |
| Cloud service | [cloud.ragflow.io](https://cloud.ragflow.io) |
| Online Demo | [demo.ragflow.io](https://demo.ragflow.io) |

## ModelScope Integration

RagFlow supports ModelScope as a model provider (LLM Factory). Once connected, open-source models on ModelScope can be used throughout the entire RAG pipeline, including:

- Chat conversation: the Q&A session for interacting with the knowledge base
- Document parsing: invoking an LLM during the deep document understanding stage

## Getting Started

### Deploying RagFlow

**Prerequisites**:

- CPU >= 4 cores
- RAM >= 16 GB
- Disk >= 50 GB
- Docker >= 24.0.0 & Docker Compose >= v2.26.1
- Python >= 3.13
- [gVisor](https://gvisor.dev/docs/user_guide/install/): install only when the code executor (sandbox) feature is needed

**Docker deployment** (recommended):

```bash
# 1. Ensure vm.max_map_count >= 262144
sysctl vm.max_map_count
# If less than 262144, run:
sudo sysctl -w vm.max_map_count=262144

# 2. Clone the code
git clone https://github.com/infiniflow/ragflow.git
cd ragflow/docker

# 3. Start the service
docker compose -f docker-compose.yml up -d

# 4. Check the startup status
docker logs -f ragflow-server
```

After a successful startup, the RAGFlow ASCII logo will be displayed, and then you can access it by entering the server IP address in a browser (default port 80).

> If the Docker image cannot be pulled, you can select a Huawei Cloud or Alibaba Cloud mirror based on the `RAGFLOW_IMAGE` comment hints in the `docker/.env` file.

### Configuring ModelScope

1. Log in to the RagFlow interface
2. Go to System Configuration → Model Provider
3. Select ModelScope
4. Enter the ModelScope API Key

![RagFlow configuring ModelScope effect 1](../_resources/ragflow-1.png)

![RagFlow configuring ModelScope effect 2](../_resources/ragflow-2.png)

After configuration is complete, select the model provided by ModelScope in the knowledge base configuration to use it in the RAG pipeline.

### Creating a Knowledge Base (Dataset)

The RagFlow knowledge base is the core of the RAG pipeline. Create a knowledge base in the Dataset option, where you need to configure the following:

- **Database name**: Name the knowledge base
- **Vector Embedding Model**: Select the embedding model used to generate document vector representations
- **Chunking method**: RagFlow provides multiple parsing methods, including deep document understanding (default) and third-party parsing methods such as MinerU and Docling
- **Chunking strategy**: Select a chunking template by document type; the chunking process is visualizable, explainable, and manually adjustable

The knowledge base supports uploading documents in various formats such as Word, PPT, Excel, PDF, images, scanned documents, and web pages. RagFlow will automatically perform deep document understanding, extract structured knowledge, and perform intelligent chunking according to templates. The chunking results are displayed visually, and the content boundaries of each segment can be inspected and adjusted.

In addition, RagFlow supports syncing data from external data sources such as Confluence, S3, Notion, Discord, and Google Drive to the knowledge base, and also supports an Orchestrable Ingestion Pipeline.

![RagFlow creating a knowledge base](../_resources/ragflow-3.png)

### Creating an Agent

RagFlow supports Agentic Workflow, allowing you to create agents to complete complex tasks. There are two ways to create an agent:

- **Create from Blank**: Freely orchestrate the agent's workflow, suitable for customized requirement scenarios
- **Create from Template**: Use a preset agent structure, suitable for quick onboarding

Capabilities supported by the Agent include:

- Python/JavaScript code executor components
- MCP (Model Context Protocol) protocol support
- Multi-path recall + fused reranking knowledge base retrieval
- Multimodal model support (can be used to understand images in PDF or DOCX)

![RagFlow creating an agent](../_resources/ragflow-4.png)

### Memory Feature

RagFlow supports the Memory feature for AI Agents, introduced in December 2025. In the Memory option, you can configure:

- **Name**: Name of the memory module
- **Memory Type**: Memory type; the following four are officially provided:
  - **Raw**: Raw conversations between the user and the agent (required by default)
  - **Semantic Memory**: General knowledge and facts about the user and the world
  - **Episodic Memory**: Records of specific events and experiences with timestamps
  - **Procedural Memory**: Acquired skills, habits, and automated processes
- **Embedding Model**: Vector embedding model used for memory retrieval
- **LLM**: Large language model used for memory processing and generation

The Memory feature enables the agent to maintain contextual memory across multi-turn conversations, rather than starting from scratch each time. Combined with the knowledge base and Agent workflow, RagFlow can build a complete RAG Agent with long-term memory capabilities.

![RagFlow Memory configuration](../_resources/ragflow-5.png)
