<!-- modelscope-docs: vLLM | ecosystem-integrations/model-download/vllm/vllm_EN.md -->

## Overview

vLLM is a high-performance LLM inference and serving framework originated by the UC Berkeley Sky Computing Lab. It has become one of the most active projects in the open-source LLM inference space, jointly maintained by a community of 2000+ contributors and dozens of institutions. It supports 200+ model architectures and provides an OpenAI-compatible API server.

It supports 200+ model architectures, including:

- **Decoder-only LLM**: Llama, Qwen, Gemma, DeepSeek, etc.
- **MoE models**: Mixtral, DeepSeek-V3, Qwen-MoE, GPT-OSS, etc.
- **Hybrid attention and state-space models**: Mamba, Qwen3.5, etc.
- **Multimodal models**: LLaVA, Qwen-VL, Pixtral, etc.
- **Embedding and retrieval models**: E5-Mistral, GTE, ColBERT, etc.
- **Reward and classification models**: Qwen-Math, etc.

Core features:

- **PagedAttention**: Manages the attention KV cache memory in a paged manner, significantly reducing memory waste and fragmentation
- **High throughput**: State-of-the-art inference throughput
- **Continuous batching + chunked prefill + prefix caching**: dynamic request batching, chunked prefill, and prefix caching
- **CUDA/HIP graphs acceleration**: flexible execution of piecewise and full CUDA/HIP graphs
- **Broad quantization support**: FP8, MXFP8/MXFP4, NVFP4, INT8, INT4, GPTQ/AWQ, GGUF, compressed-tensors, ModelOpt, TorchAO, etc.
- **Optimized attention kernels**: FlashAttention, FlashInfer, TRTLLM-GEN, FlashMLA, Triton
- **Optimized GEMM/MoE kernels**: multi-precision kernels based on CUTLASS, TRTLLM-GEN, CuTeDSL
- **Speculative decoding**: n-gram, suffix, EAGLE, DFlash
- **torch.compile**: automatic kernel generation and graph-level transformations
- **Disaggregated prefill/decode/encode**: disaggregated architecture
- **OpenAI-compatible API server**: also supports the Anthropic Messages API and gRPC; multi-LoRA, distributed parallelism (TP/PP/DP/EP/CP), structured output (xgrammar/guidance), tool calling, and streaming output
- **Broad hardware coverage**: NVIDIA GPU, AMD GPU, Intel GPU, x86/ARM/PowerPC CPU, Google TPU, Huawei Ascend, Apple Silicon, etc.

## Resources

| Resource | URL |
|------|------|
| Repository | [vllm-project/vllm](https://github.com/vllm-project/vllm) |
| Official docs | [docs.vllm.ai](https://docs.vllm.ai) |
| Installation guide | [getting_started/installation](https://docs.vllm.ai/en/latest/getting_started/installation.html) |
| Quickstart | [getting_started/quickstart](https://docs.vllm.ai/en/latest/getting_started/quickstart.html) |
| Supported models | [supported_models](https://docs.vllm.ai/en/latest/models/supported_models.html) |
| Serving docs | [serving/openai_compatible_server](https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html) |
| Environment variables docs | [configuration/env_vars](https://docs.vllm.ai/en/stable/configuration/env_vars.html) |
| Project website | [vllm.ai](https://vllm.ai) |

## ModelScope Integration

vLLM controls the model download source via the environment variable `VLLM_USE_MODELSCOPE`. When enabled, it loads models from ModelScope instead of Hugging Face Hub. The mechanism applies a `patch_hub()` patch to HuggingFace Hub that redirects download requests to ModelScope, covering model weight downloads, AutoConfig loading, repository file listing, etc.

- **Environment variable**: `VLLM_USE_MODELSCOPE`, which takes the string value `true` (case-insensitive), defaulting to `False`. Note that the numbers `1`/`0` cannot be used
- **Dependency requirement**: `modelscope>=1.18.1` must be installed (`patch_hub` has been available since that version); otherwise an ImportError is raised
- **Coverage**: model weight downloads, AutoConfig loading, repository file listing, path conversion, and tokenizer loading

This integration was originally introduced by [PR #1588](https://github.com/vllm-project/vllm/pull/1588) and is continuously maintained.

## Getting Started

### Installation

vLLM recommends installing with [uv](https://docs.astral.sh/uv/); pip is also supported:

```bash
# Using uv (recommended)
uv pip install vllm --torch-backend=auto

# Or using pip
pip install vllm
```

> uv uses `--torch-backend=auto` to automatically select the appropriate PyTorch index based on the CUDA driver version. vLLM supports NVIDIA GPU, AMD ROCm, Intel GPU, Google TPU, Huawei Ascend, Apple Silicon, and other hardware; see the [installation docs](https://docs.vllm.ai/en/latest/getting_started/installation.html) for installation methods.

To use the ModelScope integration, additionally install:

```bash
pip install "modelscope>=1.18.1"
```

### Offline Batch Inference

After setting the environment variable, you can use the `LLM` class directly in Python for offline inference:

```python
import os
# Must be set before import vllm
os.environ["VLLM_USE_MODELSCOPE"] = "true"

from vllm import LLM, SamplingParams

llm = LLM(model="Qwen/Qwen2.5-7B-Instruct")
sampling_params = SamplingParams(temperature=0.8, top_p=0.95)
output = llm.generate(["Hello, please introduce vLLM."], sampling_params)
print(output)
```

For Instruct/Chat models, you can directly use the `llm.chat` method (which automatically applies the chat template):

```python
messages = [{"role": "user", "content": "Hello, please introduce yourself"}]
output = llm.chat(messages)
print(output[0].outputs[0].text)
```

### Start the Inference Server

Set the environment variables so that vLLM downloads the model from ModelScope:

```bash
export VLLM_USE_MODELSCOPE=true
# Optional: set a token when accessing models that require authentication
export MODELSCOPE_API_TOKEN=your_modelscope_api_token
```

Launch the OpenAI-compatible server using a model ID from ModelScope:

```bash
vllm serve Qwen/Qwen2.5-7B-Instruct --host 0.0.0.0 --port 8000
```

The model is automatically downloaded from ModelScope to the local cache, and subsequent launches use the cache directly. You can set an API Key for authentication via `--api-key` or the environment variable `VLLM_API_KEY`.

### Query the Inference API

After the server starts, you can call it via curl or the OpenAI SDK:

**curl**:

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello, please introduce yourself"}],
    "max_tokens": 256,
    "temperature": 0
  }'
```

**OpenAI SDK**:

```python
import openai

client = openai.Client(
    base_url="http://127.0.0.1:8000/v1",
    api_key="EMPTY"
)

response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "Hello, please introduce yourself"}],
)
print(response.choices[0].message.content)
```

> vLLM's server is OpenAI API-compatible and can serve as a drop-in replacement for any application that uses the OpenAI API.

## Notes

1. **Environment variable value**: `VLLM_USE_MODELSCOPE=true` must use the string `true`/`false`; the numbers `1`/`0` cannot be used
2. **ModelScope version**: `modelscope>=1.18.1` is required; otherwise an ImportError prompts you to upgrade
3. **Model ID format**: Use the model ID on ModelScope (e.g. `Qwen/Qwen2.5-7B-Instruct`), which can be found at [modelscope.cn/models](https://modelscope.cn/models)
4. **Only switches the download source**: This integration only affects model downloads and does not change how vLLM itself is used for inference
5. **No built-in WebUI**: vLLM only provides an OpenAI-compatible API server with no built-in chat interface/WebUI; you need to call it via curl, the OpenAI SDK, or a third-party frontend (e.g. LobeChat)
6. **generation_config**: vLLM uses the `generation_config.json` sampling parameters from the model repository by default; if you want to use vLLM defaults, set `--generation-config vllm`
