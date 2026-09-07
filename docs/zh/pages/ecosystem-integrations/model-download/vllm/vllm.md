<!-- modelscope-docs: vLLM | ecosystem-integrations/model-download/vllm/vllm_CN.md -->

## 概述

vLLM 是由 UC Berkeley Sky Computing Lab 发起的高性能 LLM 推理与服务框架，已成为开源 LLM 推理领域最活跃的项目之一，由来自 2000+ 贡献者和数十家机构的社区共同维护。它支持 200+ 模型架构，并提供与 OpenAI 兼容的 API server。

支持 200+ 模型架构，包括：

- **Decoder-only LLM**：Llama、Qwen、Gemma、DeepSeek 等
- **MoE 模型**：Mixtral、DeepSeek-V3、Qwen-MoE、GPT-OSS 等
- **混合注意力与状态空间模型**：Mamba、Qwen3.5 等
- **多模态模型**：LLaVA、Qwen-VL、Pixtral 等
- **Embedding 与检索模型**：E5-Mistral、GTE、ColBERT 等
- **Reward 与分类模型**：Qwen-Math 等

核心特性：

- **PagedAttention**：以分页方式管理 attention 的 KV cache 显存，显著降低显存浪费与碎片化
- **高吞吐**：State-of-the-art 的推理吞吐量
- **连续批处理 + chunked prefill + prefix caching**：动态拼接请求、分块预填充、前缀缓存
- **CUDA/HIP graphs 加速**：piecewise 与 full CUDA/HIP graphs 的灵活执行
- **广泛量化支持**：FP8、MXFP8/MXFP4、NVFP4、INT8、INT4、GPTQ/AWQ、GGUF、compressed-tensors、ModelOpt、TorchAO 等
- **优化 attention 内核**：FlashAttention、FlashInfer、TRTLLM-GEN、FlashMLA、Triton
- **优化 GEMM/MoE 内核**：基于 CUTLASS、TRTLLM-GEN、CuTeDSL 的多精度内核
- **推测解码**：n-gram、suffix、EAGLE、DFlash
- **torch.compile**：自动内核生成与图级变换
- **分离式 prefill/decode/encode**： disaggregated 架构
- **OpenAI 兼容 API server**：另支持 Anthropic Messages API 与 gRPC；多 LoRA、分布式并行（TP/PP/DP/EP/CP）、结构化输出（xgrammar/guidance）、tool calling、流式输出
- **硬件广覆盖**：NVIDIA GPU、AMD GPU、Intel GPU、x86/ARM/PowerPC CPU、Google TPU、华为昇腾、Apple Silicon 等

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [vllm-project/vllm](https://github.com/vllm-project/vllm) |
| 官方文档 | [docs.vllm.ai](https://docs.vllm.ai) |
| 安装指南 | [getting_started/installation](https://docs.vllm.ai/en/latest/getting_started/installation.html) |
| 快速上手 | [getting_started/quickstart](https://docs.vllm.ai/en/latest/getting_started/quickstart.html) |
| 支持的模型 | [supported_models](https://docs.vllm.ai/en/latest/models/supported_models.html) |
| Serving 文档 | [serving/openai_compatible_server](https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html) |
| 环境变量文档 | [configuration/env_vars](https://docs.vllm.ai/en/stable/configuration/env_vars.html) |
| 项目网站 | [vllm.ai](https://vllm.ai) |

## ModelScope 集成

vLLM 通过环境变量 `VLLM_USE_MODELSCOPE` 控制模型下载源，启用后从 ModelScope 而非 Hugging Face Hub 加载模型。机制是对 HuggingFace Hub 做 `patch_hub()` 补丁，把下载请求重定向到 ModelScope，覆盖模型权重下载、AutoConfig 加载、仓库文件列表等。

- **环境变量**：`VLLM_USE_MODELSCOPE`，取值为字符串 `true`（大小写不敏感），默认 `False`。注意不能用数字 `1`/`0`
- **依赖要求**：需安装 `modelscope>=1.18.1`（`patch_hub` 从该版本开始提供），否则会抛 ImportError
- **覆盖能力**：模型权重下载、AutoConfig 加载、仓库文件列表、路径转换、Tokenizer 加载

该集成最初由 [PR #1588](https://github.com/vllm-project/vllm/pull/1588) 引入并持续维护。

## 接入流程

### 安装

vLLM 推荐使用 [uv](https://docs.astral.sh/uv/) 安装，也支持 pip：

```bash
# 使用 uv（推荐）
uv pip install vllm --torch-backend=auto

# 或使用 pip
pip install vllm
```

> uv 会通过 `--torch-backend=auto` 自动根据 CUDA 驱动版本选择合适的 PyTorch index。vLLM 支持 NVIDIA GPU、AMD ROCm、Intel GPU、Google TPU、华为昇腾、Apple Silicon 等多种硬件，安装方式见[安装文档](https://docs.vllm.ai/en/latest/getting_started/installation.html)。

使用 ModelScope 集成需额外安装：

```bash
pip install "modelscope>=1.18.1"
```

### 离线批量推理（Offline Inference）

设置环境变量后，可在 Python 中直接使用 `LLM` 类做离线推理：

```python
import os
# 必须在 import vllm 之前设置
os.environ["VLLM_USE_MODELSCOPE"] = "true"

from vllm import LLM, SamplingParams

llm = LLM(model="Qwen/Qwen2.5-7B-Instruct")
sampling_params = SamplingParams(temperature=0.8, top_p=0.95)
output = llm.generate(["你好，请介绍一下 vLLM。"], sampling_params)
print(output)
```

对于 Instruct/Chat 模型，可直接使用 `llm.chat` 方法（自动应用 chat template）：

```python
messages = [{"role": "user", "content": "你好，请介绍一下自己"}]
output = llm.chat(messages)
print(output[0].outputs[0].text)
```

### 启动推理服务

设置环境变量，使 vLLM 从 ModelScope 下载模型：

```bash
export VLLM_USE_MODELSCOPE=true
# 可选：访问需鉴权的模型时设置 token
export MODELSCOPE_API_TOKEN=your_modelscope_api_token
```

用 ModelScope 上的模型 ID 启动 OpenAI 兼容服务：

```bash
vllm serve Qwen/Qwen2.5-7B-Instruct --host 0.0.0.0 --port 8000
```

模型会自动从 ModelScope 下载到本地缓存，后续启动直接使用缓存。可通过 `--api-key` 或环境变量 `VLLM_API_KEY` 设置 API Key 鉴权。

### 调用推理服务

服务启动后，可通过 curl 或 OpenAI SDK 调用：

**curl**：

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "你好，请介绍一下自己"}],
    "max_tokens": 256,
    "temperature": 0
  }'
```

**OpenAI SDK**：

```python
import openai

client = openai.Client(
    base_url="http://127.0.0.1:8000/v1",
    api_key="EMPTY"
)

response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "你好，请介绍一下自己"}],
)
print(response.choices[0].message.content)
```

> vLLM 的 server 兼容 OpenAI API，可作为任何使用 OpenAI API 的应用的直接替代。

## 注意事项

1. **环境变量取值**：`VLLM_USE_MODELSCOPE=true` 必须用字符串 `true`/`false`，不能用数字 `1`/`0`
2. **ModelScope 版本**：需 `modelscope>=1.18.1`，否则触发 ImportError 提示升级
3. **模型 ID 格式**：使用 ModelScope 上的模型 ID（如 `Qwen/Qwen2.5-7B-Instruct`），可在 [modelscope.cn/models](https://modelscope.cn/models) 查找
4. **仅切换下载源**：该集成只影响模型下载，不影响 vLLM 推理本身的使用方式
5. **无内置 WebUI**：vLLM 只提供 OpenAI 兼容的 API server，没有内置的聊天界面/WebUI，需通过 curl、OpenAI SDK 或第三方前端（如 LobeChat）调用
6. **generation_config**：vLLM 默认使用模型仓库的 `generation_config.json` 采样参数，如需使用 vLLM 默认值可设 `--generation-config vllm`
