<!-- modelscope-docs: LMDeploy | ecosystem-integrations/model-download/lmdeploy/lmdeploy_EN.md -->

## Overview

LMDeploy is a toolkit for compressing, deploying, and serving LLMs, developed by the MMRazor and MMDeploy teams from OpenMMLab, hosted under the InternLM organization. Its core goal is to provide high-performance inference, efficient quantization, and convenient distributed deployment.

LMDeploy includes two inference engines:

- **TurboMind**: A C++ engine focused on ultimate inference performance, supporting Paged Attention, persistent batching, Flash Decoding, W4A16 inference, etc.
- **PyTorch Engine**: A pure Python engine that lowers the development barrier, enabling rapid experimentation with new features and models, and supporting the Huawei Ascend platform

Core features:

- **Efficient inference**: Through persistent batching (continuous batching), blocked KV cache, dynamic split&fuse, tensor parallelism, and high-performance CUDA kernels, achieves 1.8x higher throughput than vLLM
- **Effective quantization**: Supports weight-only and KV cache quantization; 4-bit inference is 2.4x faster than FP16, with quantization quality verified by OpenCompass evaluation
- **Distribution server**: Supports multi-model inference service deployment across multiple machines and cards via a request distribution service
- **Excellent compatibility**: KV Cache Quant, AWQ, and Automatic Prefix Caching can be used simultaneously

Supported models cover 100+ LLMs and VLMs, including Llama, Qwen, InternLM, DeepSeek, GLM, ChatGLM, Mixtral, Gemma, InternVL, LLaVA, CogVLM, etc.

Hardware support includes NVIDIA GPUs (from V100, including H100/H800/B200) and Huawei Ascend NPU (supported by the PyTorch engine).

## Resources

| Resource | URL |
|------|------|
| Repository | [InternLM/lmdeploy](https://github.com/InternLM/lmdeploy) |
| Official docs | [lmdeploy.readthedocs.io](https://lmdeploy.readthedocs.io/en/latest/) |
| Getting started | [get_started](https://github.com/InternLM/lmdeploy/blob/main/docs/en/get_started/get_started.md) |
| Supported models | [supported_models](https://github.com/InternLM/lmdeploy/blob/main/docs/en/supported_models/supported_models.md) |
| TurboMind docs | [inference/turbomind](https://github.com/InternLM/lmdeploy/blob/main/docs/en/inference/turbomind.md) |
| PyTorch Engine docs | [inference/pytorch](https://github.com/InternLM/lmdeploy/blob/main/docs/en/inference/pytorch.md) |
| Quantization guide | [quantization/w4a16](https://github.com/InternLM/lmdeploy/blob/main/docs/en/quantization/w4a16.md) |
| KV cache quantization | [quantization/kv_quant](https://github.com/InternLM/lmdeploy/blob/main/docs/en/quantization/kv_quant.md) |
| API server docs | [llm/api_server](https://github.com/InternLM/lmdeploy/blob/main/docs/en/llm/api_server.md) |

## ModelScope Integration

LMDeploy downloads models from HuggingFace by default, which can be unstable for users in China. LMDeploy supports switching the download source via the environment variable `LMDEPLOY_USE_MODELSCOPE`:

- When set to `True`, all model download requests are redirected from HuggingFace to ModelScope
- Requires the `modelscope` package to be installed (`pip install modelscope`)
- Covers model downloads for both offline inference and API serving scenarios

## Getting Started

### Prerequisites

```bash
# Install LMDeploy (recommended in a conda environment, Python 3.10 - 3.13)
conda create -n lmdeploy python=3.12 -y
conda activate lmdeploy
pip install lmdeploy

# Install ModelScope
pip install modelscope
```

> Starting from v0.13.0, the prebuilt wheels on PyPI are built against CUDA 12.8, so `pip install lmdeploy` supports typical setups including GeForce RTX 50 series.

### Offline Batch Inference

Set the environment variable so LMDeploy downloads models from ModelScope:

```bash
export LMDEPLOY_USE_MODELSCOPE=True
```

Use the pipeline for offline inference:

```python
import lmdeploy

with lmdeploy.pipeline("Qwen/Qwen2.5-7B-Instruct") as pipe:
    response = pipe(["Hello, please introduce yourself", "Shanghai is"])
    print(response)
```

The model is automatically downloaded from ModelScope to the local cache directory; subsequent runs use the cache directly.

### Start the Inference Server

Start an OpenAI API-compatible inference server via `lmdeploy serve`:

```bash
export LMDEPLOY_USE_MODELSCOPE=True

lmdeploy serve api_server Qwen/Qwen2.5-7B-Instruct \
  --server-name 0.0.0.0 \
  --server-port 23333
```

The model is also automatically downloaded from ModelScope. After launch, the service is accessible at `http://localhost:23333`.

### Query the Inference API

After the server starts, you can call it via curl or the OpenAI SDK:

**curl**:

```bash
curl http://localhost:23333/v1/chat/completions \
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
    base_url="http://127.0.0.1:23333/v1",
    api_key="EMPTY"
)

response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "Hello, please introduce yourself"}],
)
print(response.choices[0].message.content)
```

## Notes

1. **Global switch**: `LMDEPLOY_USE_MODELSCOPE=True` is a global switch; once set, all model downloads go through ModelScope
2. **Model ID format**: ModelScope and HuggingFace model IDs are typically the same (e.g., `Qwen/Qwen2.5-7B-Instruct`); once enabled, the same model ID is downloaded from ModelScope
3. **Dependency installation**: Ensure the `modelscope` package is installed before using ModelScope for downloads
4. **Engine selection**: The TurboMind engine offers higher performance but supports a limited set of models; the PyTorch engine offers broader compatibility. Refer to the [supported models list](https://github.com/InternLM/lmdeploy/blob/main/docs/en/supported_models/supported_models.md) to choose the appropriate engine
5. **Multimodal models**: LMDeploy supports VLM (vision-language model) inference, such as InternVL, LLaVA, Qwen-VL, etc., with the same usage as LLMs