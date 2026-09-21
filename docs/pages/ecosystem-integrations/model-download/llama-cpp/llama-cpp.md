<!-- modelscope-docs: llama.cpp | ecosystem-integrations/model-download/llama-cpp/llama-cpp_EN.md -->

## Overview

llama.cpp is an LLM inference library and toolkit implemented in pure C/C++. It provides tools such as `llama-cli` (command-line inference), `llama-server` (an OpenAI-compatible HTTP server with a WebUI), and `llama-mtmd-cli` (multimodal inference). It supports both quantized and full-precision inference for GGUF-format models and runs on CPU and a variety of GPUs.

Core features:

- **Pure C/C++ implementation**: No external runtime dependencies, single-file compilable, cross-platform
- **GGUF format**: Natively supports the GGUF model format, including f16/bf16 and multiple integer quantizations (Q4_K_M, Q5_K_M, Q8_0, etc.)
- **Multi-backend acceleration**: CPU (AVX/AVX2/AVX512/NEON), CUDA, Metal, Vulkan, SYCL, ROCm, RPC
- **Built-in WebUI**: `llama-server` ships with a web interface — open it in a browser to chat, tune parameters, and upload images to test multimodal models, with no extra frontend required
- **OpenAI-compatible API**: `llama-server` provides chat/completions/embeddings endpoints, as well as the Anthropic Messages API; supports multi-slot parallel decoding and continuous batching
- **Multimodal (VL)**: Supports vision/audio and other multimodal models (mmproj); the WebUI lets you upload images directly, and `llama-mtmd-cli` accepts images via `/image <path>`
- **Function calling**: Built-in function calling and tool use support
- **Inference enhancements**: speculative decoding, Flash Attention, Jinja chat templates, JSON schema-constrained generation

## Resources

| Resource | URL |
|----------|-----|
| Repository | [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) |
| Build documentation | [docs/build.md](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md) |
| server documentation | [tools/server/README.md](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) |
| Pre-built binaries | [releases](https://github.com/ggml-org/llama.cpp/releases) |
| Backend library | [ggml-org/ggml](https://github.com/ggml-org/ggml) |

## ModelScope Integration

llama.cpp natively only supports downloading models from HuggingFace (via the `-hf` parameter) and has no built-in ModelScope download source. The integration approach with ModelScope is therefore: **first use the ModelScope SDK/CLI to download the GGUF model to a local path, then point llama.cpp at the local file with `-m` to load it**. This approach is stable and usable, with no dependence on any unmerged feature.

> In addition, there is an experimental native `-ms` integration under development (PR [#24716](https://github.com/ggml-org/llama.cpp/pull/24716)) that lets you specify a ModelScope repository directly on the command line for download. See the [Experimental: Native `-ms` Support](#experimental-native--ms-supportpr-24716) section at the end.

## Getting Started

### Build from Source

```bash
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
cmake -B build
cmake --build build --config Release
```

The build artifacts are located under `build/bin/`: `llama-cli`, `llama-server`, `llama-mtmd-cli`, etc. You can also download pre-built binaries directly from [releases](https://github.com/ggml-org/llama.cpp/releases).

### Download GGUF Models

Use the ModelScope CLI to download GGUF quantized models from ModelScope to a local path (using the Qwen3-4B GGUF as an example):

**Option 1: CLI**

```bash
# Install the ModelScope CLI
pip install modelscope

# Download a specific quantized file
modelscope download Qwen/Qwen3-4B-GGUF \
  --include "Qwen3-4B-Q4_K_M.gguf" \
  --local-dir ./models/qwen

# Or download the entire repository snapshot
# modelscope download Qwen/Qwen3-4B-GGUF --local-dir ./models/qwen
```

**Option 2: Python API**

```python
from modelscope.hub.snapshot_download import snapshot_download

path = snapshot_download(
    "Qwen/Qwen3-4B-GGUF",
    local_dir="./models/qwen",
    allow_patterns=["*.gguf"],
)
print(path)
```

### CLI Inference (llama-cli)

Point `-m` at the locally downloaded GGUF file:

```bash
./build/bin/llama-cli -m ./models/qwen/Qwen3-4B-Q4_K_M.gguf -p "你好" -n 128
```

### Start the WebUI Server (llama-server)

`llama-server` ships with a web interface and is the most convenient way to use it:

```bash
./build/bin/llama-server -m ./models/qwen/Qwen3-4B-Q4_K_M.gguf --host 0.0.0.0 --port 8080
```

After startup, open `http://localhost:8080` in your browser to chat and adjust sampling parameters in the web interface. The WebUI is enabled by default (use `--no-ui` to disable it).

![llama.cpp WebUI chat interface (Qwen3-4B model)](../_resources/llama-cpp-1.png)

### Query the Inference API

Once the service is running, it provides OpenAI-compatible endpoints:

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen",
    "messages": [{"role": "user", "content": "你好，请介绍一下自己"}]
  }'
```

You can also use the OpenAI SDK:

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

### Run Vision-Language (VL) Models

After downloading a multimodal GGUF model that contains an `mmproj`, start `llama-server` by specifying the model file `-m`, the multimodal projector `--mmproj`, and the context length `-c` together:

```bash
# Download the multimodal model (including the mmproj file)
modelscope download unsloth/Qwen3.5-0.8B-GGUF --local-dir ./models/vl

# Start the server
./build/bin/llama-server \
    -m ./models/vl/Qwen3.5-0.8B-Q4_K_M.gguf \
    --mmproj ./models/vl/mmproj-BF16.gguf \
    -c 4096 --port 8080
```

![llama.cpp multimodal WebUI: click the plus ➕ and select Add files → Image to upload an image (unsloth/Qwen3.5-0.8B-GGUF)](../_resources/llama-cpp-2.png)

After startup, open `http://localhost:8080` in your browser. In the chat box, click the plus ➕ → **Add files** → **Image**, select an image, and send it to the model for analysis.

You can also use `llama-mtmd-cli` to pass in an image on the command line via `/image`:

```bash
./build/bin/llama-mtmd-cli \
    -m ./models/vl/Qwen3.5-0.8B-Q4_K_M.gguf \
    --mmproj ./models/vl/mmproj-BF16.gguf \
    -c 4096
# After entering interactive mode, pass in an image
> /image /path/to/image.jpg
```

## WebUI Features

The WebUI bundled with `llama-server` offers MCP tool integration and a rich set of runtime settings in addition to basic chat.

### MCP Server Configuration

In the **MCP Servers** option at the top left of the WebUI, you can configure a new MCP (Model Context Protocol) Server, and you can also customize the Server URL so that the model can call external tools during the conversation.

![llama.cpp WebUI MCP Server configuration](../_resources/llama-cpp-3.png)

The server can also preconfigure MCP via startup parameters:

- `--mcp-servers-config <path>`: specify a JSON configuration file (Cursor-compatible format)
- `--mcp-servers-json '<json>'`: inline JSON definition
- `--ui-mcp-proxy`: enable the WebUI's MCP CORS proxy

> For security reasons, enabling MCP-related features restricts CORS origins to localhost; do not enable this in untrusted environments.

### Settings Panel

The settings at the top left of the WebUI provide multiple configuration categories:

- **General**: general settings (such as default model, sessions, etc.)
- **Display**: display and appearance settings
- **Sampling**: sampling parameters
- **Penalties**: repetition and penalty parameters
- **Agentic**: agent-related configuration
- **Developer**: developer options
- **Tools**: tool configuration
- **Import/Export**: configuration import/export

Taking **Sampling** as an example, you can adjust Temperature, Top K, Top P, Min P, Typical P, and other sampling parameters to control the randomness and quality of generation:

![llama.cpp WebUI Sampling settings](../_resources/llama-cpp-4.png)

> Sampling parameters can also be specified on the command line when starting the server (e.g. `--temperature`, `--top-k`, `--top-p`, `--min-p`); the settings in the WebUI will override the defaults from startup.

## Experimental: Native `-ms` Support (PR #24716)

> Note: The following feature comes from the unmerged PR [#24716](https://github.com/ggml-org/llama.cpp/pull/24716). Until it is officially merged, please use the "download + local load" approach on the mainline.

This PR introduces the `-ms` (`--ms-repo`) parameter to llama.cpp, allowing you to specify a ModelScope repository directly on the command line — just like `-hf` — to automatically download and cache it, with no pre-download required:

```bash
# Download the Q4_K_M quantization by default
./build/bin/llama-cli -ms Qwen/Qwen3-4B-GGUF -p "你好"

# Specify a quantization
./build/bin/llama-cli -ms Qwen/Qwen3-4B-GGUF:Q5_K_M -p "你好"
```

Main capabilities:

- **Quantization selection**: When no `:quant` is specified, it defaults to `Q4_K_M`; if not found, it falls back to `Q8_0`, and then to the first GGUF in the repository
- **Authenticated access to private models**: via the `MS_TOKEN` environment variable or the `-hft` command-line parameter
- **Multimodal**: automatically detects and downloads the `mmproj` file in the repository
- **Cache management**: `--cache-list` can list locally cached models, distinguishing between `[hf]`/`[ms]` sources; models can be removed via the server's `DELETE /models`
- **Cache path**: `~/.cache/modelscope/hub/models--<owner>--<model>/` (blob/snapshot structure), independent of the `-hf` path at `~/.cache/huggingface/hub/`

## Notes

1. **No native ModelScope download on the current mainline**: mainline llama.cpp only supports `-hf` (HuggingFace); you must first download the GGUF with the ModelScope CLI and then load the local file with `-m`
2. **Model format**: you need to download GGUF-format models; you can search on ModelScope for repositories with the `-GGUF` suffix
3. **Config loading**: llama.cpp loads the tokenizer and other configuration from the GGUF metadata and does not depend on an external config.json
4. **WebUI enabled by default**: `llama-server` ships with a web interface that is available by accessing the service port in a browser; use `--no-ui` to disable it
5. **HF mirror alternative**: you can also use the native `-hf` to download from a mirror site via `HF_ENDPOINT=https://hf-mirror.com`, but this goes through the HuggingFace path
