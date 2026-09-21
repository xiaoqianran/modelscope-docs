<!-- modelscope-docs: SGLang | ecosystem-integrations/model-download/sglang/sglang_EN.md -->

## Overview

SGLang is a high-performance inference serving framework for large language models and multimodal models developed by the LMSYS organization. It has become one of the de facto standards in the open-source LLM inference field, with a global deployment scale exceeding 400,000 GPUs, and is used in production environments by enterprises such as xAI, AMD, NVIDIA, Intel, LinkedIn, and Cursor.

Its core design centers on inference speed and throughput. The main features include:

- RadixAttention prefix caching, avoiding redundant computation
- Zero-overhead CPU scheduler, reducing scheduling latency
- Speculative Decoding, continuous batching, paged attention
- Tensor parallelism / pipeline parallelism / expert parallelism / data parallelism
- Structured output, chunked prefill, multiple quantization schemes (FP4/FP8/INT4/AWQ/GPTQ)
- Multi-LoRA batching

In terms of model support, SGLang is compatible with most HuggingFace-format models, including the Llama, Qwen, DeepSeek, Kimi, GLM, GPT, Gemma, and Mistral series, and provides an OpenAI API-compatible interface. On the hardware side, it covers NVIDIA GPUs (GB200/B300/H100/A100/5090, etc.), AMD GPUs (MI355/MI300), Intel Xeon CPUs, Google TPUs, and Ascend NPUs.

## Resources

| Resource | URL |
|----------|-----|
| Repository | [sgl-project/sglang](https://github.com/sgl-project/sglang) |
| Official documentation | [docs.sglang.io](https://docs.sglang.io/) |
| Blog | [lmsys.org/blog](https://lmsys.org/blog/) |

## ModelScope Integration

SGLang natively downloads models through HuggingFace, which is unreliable for users in China due to network access. ModelScope provides SGLang with the ability to switch the model download source:

- Control the download source via the environment variable `SGLANG_USE_MODELSCOPE`; when set to `True`, all model download requests are switched from HuggingFace to ModelScope
- Covers both text model and multimodal (diffusion) model download scenarios
- Supports downloading models via `modelscope.snapshot_download` and `modelscope.model_file_download`
- Supports loading `AutoConfig` and `GenerationConfig` from ModelScope
- Fixes residual HuggingFace access in certain code paths that remained after enabling ModelScope (quantization config loading, CLI tools, etc.)

## Getting Started

### Prerequisites

```bash
# Install SGLang
pip install sglang[all]

# Install ModelScope
pip install modelscope
```

### Start the Inference Server

Set the environment variable so that SGLang downloads models from ModelScope:

```bash
export SGLANG_USE_MODELSCOPE=True
```

The command to start the SGLang server on Mac (Apple Silicon):

```bash
SGLANG_USE_MLX=1 python -m sglang.launch_server \
  --model Qwen/Qwen3-0.6B \
  --cuda-graph-backend-decode=disabled \
  --cuda-graph-backend-prefill=disabled \
  --disable-overlap-schedule \
  --host 0.0.0.0
```

![SGLang launch command](../_resources/sglang-1.png)

After startup, the model is automatically downloaded from ModelScope to a local cache directory, and subsequent startups use the cache directly. For more usage, please refer to the [SGLang official documentation](https://docs.sglang.io/).

### Query the Inference API

After the service starts, you can call it via the following two methods:

**Method 1: curl**

```bash
curl http://localhost:30000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "your-model-name",
    "messages": [{"role": "user", "content": "你好，请介绍一下自己"}]
  }'
```

![curl test result](../_resources/sglang-2.png)

**Method 2: OpenAI SDK (Python)**

```python
import openai

client = openai.Client(
    base_url="http://127.0.0.1:30000/v1",
    api_key="None"
)

response = client.chat.completions.create(
    model="your-model-name",
    messages=[
        {"role": "user", "content": "你好，请介绍一下自己"}
    ],
)

print(response.choices[0].message.content)
```

> Replace `your-model-name` with the model name specified by `--model` when you started the service.

## Notes

1. **Global switch**: `SGLANG_USE_MODELSCOPE=True` is a global switch; once set, all model downloads go through ModelScope
2. **Local path takes precedence**: If the local path pointed to by `model_path` already contains model files, the local model is used directly without triggering a download
3. **Model ID format**: Use the model ID on ModelScope (such as `qwen/Qwen3-0.6B`), not the HuggingFace ID format
4. **Dependency installation**: Before using ModelScope to download, ensure that the `modelscope` package is installed
