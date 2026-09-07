<!-- modelscope-docs: llama.cpp | ecosystem-integrations/model-download/llama-cpp/llama-cpp_CN.md -->

## 概述

llama.cpp 是用纯 C/C++ 实现的 LLM 推理库与工具集，提供 `llama-cli`（命令行推理）、`llama-server`（带 WebUI 的 OpenAI 兼容 HTTP server）、`llama-mtmd-cli`（多模态推理）等工具，支持 GGUF 格式模型的量化与全精度推理，可在 CPU 和多种 GPU 上运行。

核心特性：

- **纯 C/C++ 实现**：无外部运行时依赖，单文件可编译，跨平台
- **GGUF 格式**：原生支持 GGUF 模型格式，支持 f16/bf16 与多种整数量化（Q4_K_M、Q5_K_M、Q8_0 等）
- **多后端加速**：CPU（AVX/AVX2/AVX512/NEON）、CUDA、Metal、Vulkan、SYCL、ROCm、RPC
- **内置 WebUI**：`llama-server` 自带 Web 界面，浏览器打开即可对话、调参、上传图片测试多模态模型，无需额外前端
- **OpenAI 兼容 API**：`llama-server` 提供 chat/completions/embeddings 接口，以及 Anthropic Messages API；支持多 slot 并行解码与 continuous batching
- **多模态（VL）**：支持视觉/音频等多模态模型（mmproj），WebUI 可直接上传图像，`llama-mtmd-cli` 通过 `/image <path>` 传入图片
- **函数调用**：内置 function calling 与 tool use 支持
- **推理增强**：speculative decoding、Flash Attention、Jinja chat 模板、JSON schema 约束生成

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) |
| 构建文档 | [docs/build.md](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md) |
| server 文档 | [tools/server/README.md](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) |
| 预编译二进制 | [releases](https://github.com/ggml-org/llama.cpp/releases) |
| 底层后端库 | [ggml-org/ggml](https://github.com/ggml-org/ggml) |

## ModelScope 集成

llama.cpp 原生仅支持从 HuggingFace 下载模型（`-hf` 参数），未内置 ModelScope 下载源。因此与 ModelScope 的集成方式是：**先用 ModelScope SDK/CLI 把 GGUF 模型下载到本地，再用 llama.cpp 的 `-m` 指向本地文件加载**。该方式稳定可用，不依赖任何未合并的特性。

> 此外有一个正在开发中的原生 `-ms` 集成（PR [#24716](https://github.com/ggml-org/llama.cpp/pull/24716)），可在命令行直接指定 ModelScope 仓库下载，详见文末[开发中的 `-ms` 原生支持](#开发中的--ms-原生支持pr-24716)一节。

## 接入流程

### 编译安装

```bash
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
cmake -B build
cmake --build build --config Release
```

编译产物在 `build/bin/` 下：`llama-cli`、`llama-server`、`llama-mtmd-cli` 等。也可直接从 [releases](https://github.com/ggml-org/llama.cpp/releases) 下载预编译二进制。

### 下载 GGUF 模型

用 ModelScope CLI 从 ModelScope 下载 GGUF 量化模型到本地（以 Qwen3-4B 的 GGUF 为例）：

**方式一：CLI**

```bash
# 安装 ModelScope CLI
pip install modelscope

# 下载指定量化文件
modelscope download Qwen/Qwen3-4B-GGUF \
  --include "Qwen3-4B-Q4_K_M.gguf" \
  --local-dir ./models/qwen

# 或下载整个仓库快照
# modelscope download Qwen/Qwen3-4B-GGUF --local-dir ./models/qwen
```

**方式二：Python API**

```python
from modelscope.hub.snapshot_download import snapshot_download

path = snapshot_download(
    "Qwen/Qwen3-4B-GGUF",
    local_dir="./models/qwen",
    allow_patterns=["*.gguf"],
)
print(path)
```

### 命令行推理（llama-cli）

用 `-m` 指向下载到本地的 GGUF 文件：

```bash
./build/bin/llama-cli -m ./models/qwen/Qwen3-4B-Q4_K_M.gguf -p "你好" -n 128
```

### 启动 WebUI 服务（llama-server）

`llama-server` 自带 Web 界面，是最方便的使用方式：

```bash
./build/bin/llama-server -m ./models/qwen/Qwen3-4B-Q4_K_M.gguf --host 0.0.0.0 --port 8080
```

启动后浏览器打开 `http://localhost:8080`，即可在 Web 界面中对话、调整采样参数。WebUI 默认启用（可用 `--no-ui` 关闭）。

![llama.cpp WebUI 聊天界面（Qwen3-4B 模型）](../_resources/llama-cpp-1.png)

### 调用推理 API

服务启动后，提供 OpenAI 兼容接口：

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen",
    "messages": [{"role": "user", "content": "你好，请介绍一下自己"}]
  }'
```

也可用 OpenAI SDK：

```python
import openai

client = openai.Client(
    base_url="http://127.0.0.1:8080/v1",
    api_key="None"
)

response = client.chat.completions.create(
    model="qwen",
    messages=[{"role": "user", "content": "你好，请介绍一下自己"}],
)
print(response.choices[0].message.content)
```

### 运行多模态（VL）模型

下载含 `mmproj` 的多模态 GGUF 模型后，用 `llama-server` 启动时需同时指定模型文件 `-m`、多模态投影器 `--mmproj` 和上下文长度 `-c`：

```bash
# 下载多模态模型（含 mmproj 文件）
modelscope download unsloth/Qwen3.5-0.8B-GGUF --local-dir ./models/vl

# 启动 server
./build/bin/llama-server \
    -m ./models/vl/Qwen3.5-0.8B-Q4_K_M.gguf \
    --mmproj ./models/vl/mmproj-BF16.gguf \
    -c 4096 --port 8080
```

![llama.cpp 多模态 WebUI：点击加号 ➕ 选择 Add files → Image 上传图片（unsloth/Qwen3.5-0.8B-GGUF）](../_resources/llama-cpp-2.png)

启动后浏览器打开 `http://localhost:8080`，在聊天框点击加号 ➕ → **Add files** → **Image**，选择图片发送给模型解析。

也可用 `llama-mtmd-cli` 在命令行通过 `/image` 传入图片：

```bash
./build/bin/llama-mtmd-cli \
    -m ./models/vl/Qwen3.5-0.8B-Q4_K_M.gguf \
    --mmproj ./models/vl/mmproj-BF16.gguf \
    -c 4096
# 进入交互后传入图片
> /image /path/to/image.jpg
```

## WebUI 功能

`llama-server` 自带的 WebUI 除了基础对话，还提供 MCP 工具接入和丰富的运行时设置。

### MCP Server 配置

在 WebUI 左上角的 **MCP Servers** 选项中，可以配置新的 MCP（Model Context Protocol）Server，也可自定义 Server URL，让模型在对话中调用外部工具。

![llama.cpp WebUI MCP Server 配置](../_resources/llama-cpp-3.png)

服务端也可通过启动参数预置 MCP：

- `--mcp-servers-config <path>`：指定 JSON 配置文件（Cursor 兼容格式）
- `--mcp-servers-json '<json>'`：内联 JSON 定义
- `--ui-mcp-proxy`：开启 WebUI 的 MCP CORS 代理

> 出于安全考虑，启用 MCP 相关功能会将 CORS 来源限制为 localhost，请勿在不受信任的环境中开启。

### 设置面板

在 WebUI 左上角的设置中提供多个配置分类：

- **General**：通用设置（如默认模型、会话等）
- **Display**：显示与外观设置
- **Sampling**：采样参数
- **Penalties**：重复与惩罚参数
- **Agentic**：Agent 相关配置
- **Developer**：开发者选项
- **Tools**：工具配置
- **Import/Export**：配置导入导出

以 **Sampling** 为例，可调整 Temperature、Top K、Top P、Min P、Typical P 等采样参数，控制生成的随机性与质量：

![llama.cpp WebUI Sampling 采样设置](../_resources/llama-cpp-4.png)

> 采样参数也可在启动 server 时通过命令行指定（如 `--temperature`、`--top-k`、`--top-p`、`--min-p`），WebUI 中的设置会覆盖启动时的默认值。

## 开发中的 `-ms` 原生支持（PR #24716）

> 注意：以下特性来自尚未合并的 PR [#24716](https://github.com/ggml-org/llama.cpp/pull/24716)，正式合并前请以主线「下载 + 本地加载」方式为准。

该 PR 为 llama.cpp 引入了 `-ms`（`--ms-repo`）参数，可像 `-hf` 一样直接在命令行指定 ModelScope 仓库，自动下载并缓存，无需预先下载：

```bash
# 默认下载 Q4_K_M 量化
./build/bin/llama-cli -ms Qwen/Qwen3-4B-GGUF -p "你好"

# 指定量化
./build/bin/llama-cli -ms Qwen/Qwen3-4B-GGUF:Q5_K_M -p "你好"
```

主要能力：

- **量化选择**：不指定 `:quant` 时默认 `Q4_K_M`，找不到则回退 `Q8_0`，再回退到仓库内首个 GGUF
- **鉴权访问私有模型**：`MS_TOKEN` 环境变量或 `-hft` 命令行参数
- **多模态**：自动检测并下载仓库内的 `mmproj` 文件
- **缓存管理**：`--cache-list` 可列出本地已缓存模型，区分 `[hf]`/`[ms]` 来源；通过 server 的 `DELETE /models` 可移除模型
- **缓存路径**：`~/.cache/modelscope/hub/models--<owner>--<model>/`（blob/snapshot 结构），与 `-hf` 的 `~/.cache/huggingface/hub/` 相互独立

## 注意事项

1. **当前主线无原生 ModelScope 下载**：主线 llama.cpp 仅支持 `-hf`（HuggingFace），需先用 ModelScope CLI 下载 GGUF 再用 `-m` 加载本地文件
2. **模型格式**：需下载 GGUF 格式模型，可在 ModelScope 上搜索带 `-GGUF` 后缀的仓库
3. **config 加载**：llama.cpp 从 GGUF 元数据加载分词等配置，不依赖外部 config.json
4. **WebUI 默认启用**：`llama-server` 自带 Web 界面，浏览器访问服务端口即可使用，可用 `--no-ui` 关闭
5. **HF 镜像替代**：也可通过 `HF_ENDPOINT=https://hf-mirror.com` 用原生 `-hf` 从镜像站下载，但走的是 HuggingFace 路径
