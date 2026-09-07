<!-- modelscope-docs: LMDeploy | ecosystem-integrations/model-download/lmdeploy/lmdeploy_CN.md -->

## 概述

LMDeploy 是由 OpenMMLab 的 MMRazor 和 MMDeploy 团队开发的 LLM 压缩、部署和推理服务工具包，托管于 InternLM 组织。核心目标是提供高性能推理、高效量化和便捷的分布式部署能力。

LMDeploy 包含两个推理引擎：

- **TurboMind**：C++ 引擎，追求极致推理性能，支持 Paged Attention、持久化批处理、Flash Decoding、W4A16 推理等
- **PyTorch Engine**：纯 Python 引擎，降低开发门槛，支持快速实验新特性和新模型，支持华为昇腾平台

核心特性：

- **高效推理**：通过持久化批处理（continuous batching）、blocked KV cache、dynamic split&fuse、张量并行和高性能 CUDA 内核，吞吐量比 vLLM 高 1.8x
- **高效量化**：支持 weight-only 和 KV cache 量化，4-bit 推理比 FP16 快 2.4x，量化质量经 OpenCompass 评测验证
- **分布式服务**：通过请求分发服务，支持多机多卡的多模型推理服务部署
- **广泛兼容**：KV Cache Quant、AWQ 和 Automatic Prefix Caching 可同时使用

支持的模型覆盖 100+ LLM 和 VLM，包括 Llama、Qwen、InternLM、DeepSeek、GLM、ChatGLM、Mixtral、Gemma、InternVL、LLaVA、CogVLM 等。

硬件支持包括 NVIDIA GPU（V100 起，含 H100/H800/B200）和华为昇腾 NPU（PyTorch engine 支持）。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [InternLM/lmdeploy](https://github.com/InternLM/lmdeploy) |
| 官方文档 | [lmdeploy.readthedocs.io](https://lmdeploy.readthedocs.io/en/latest/) |
| 快速上手 | [get_started](https://github.com/InternLM/lmdeploy/blob/main/docs/en/get_started/get_started.md) |
| 支持的模型 | [supported_models](https://github.com/InternLM/lmdeploy/blob/main/docs/en/supported_models/supported_models.md) |
| TurboMind 文档 | [inference/turbomind](https://github.com/InternLM/lmdeploy/blob/main/docs/en/inference/turbomind.md) |
| PyTorch Engine 文档 | [inference/pytorch](https://github.com/InternLM/lmdeploy/blob/main/docs/en/inference/pytorch.md) |
| 量化指南 | [quantization/w4a16](https://github.com/InternLM/lmdeploy/blob/main/docs/en/quantization/w4a16.md) |
| KV cache 量化 | [quantization/kv_quant](https://github.com/InternLM/lmdeploy/blob/main/docs/en/quantization/kv_quant.md) |
| API server 文档 | [llm/api_server](https://github.com/InternLM/lmdeploy/blob/main/docs/en/llm/api_server.md) |

## ModelScope 集成

LMDeploy 默认从 HuggingFace 下载模型，国内用户网络访问不稳定。LMDeploy 支持通过环境变量 `LMDEPLOY_USE_MODELSCOPE` 切换下载源：

- 设置为 `True` 后，所有模型下载请求从 HuggingFace 切换到 ModelScope
- 需安装 `modelscope` 包（`pip install modelscope`）
- 覆盖离线推理和 API 服务两种场景下的模型下载

## 接入流程

### 前置条件

```bash
# 安装 LMDeploy（推荐在 conda 环境中安装，Python 3.10 - 3.13）
conda create -n lmdeploy python=3.12 -y
conda activate lmdeploy
pip install lmdeploy

# 安装 ModelScope
pip install modelscope
```

> 从 v0.13.0 起，PyPI 上的预编译 wheel 基于 CUDA 12.8 构建，`pip install lmdeploy` 即可支持 GeForce RTX 50 系列等典型配置。

### 离线批量推理

设置环境变量，使 LMDeploy 从 ModelScope 下载模型：

```bash
export LMDEPLOY_USE_MODELSCOPE=True
```

使用 pipeline 进行离线推理：

```python
import lmdeploy

with lmdeploy.pipeline("Qwen/Qwen2.5-7B-Instruct") as pipe:
    response = pipe(["你好，请介绍一下自己", "Shanghai is"])
    print(response)
```

模型会自动从 ModelScope 下载到本地缓存目录，后续启动直接使用缓存。

### 启动推理服务

通过 `lmdeploy serve` 启动与 OpenAI API 兼容的推理服务：

```bash
export LMDEPLOY_USE_MODELSCOPE=True

lmdeploy serve api_server Qwen/Qwen2.5-7B-Instruct \
  --server-name 0.0.0.0 \
  --server-port 23333
```

模型同样自动从 ModelScope 下载。启动后可通过 `http://localhost:23333` 访问服务。

### 调用推理服务

服务启动后，可通过 curl 或 OpenAI SDK 调用：

**curl**：

```bash
curl http://localhost:23333/v1/chat/completions \
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
    base_url="http://127.0.0.1:23333/v1",
    api_key="EMPTY"
)

response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "你好，请介绍一下自己"}],
)
print(response.choices[0].message.content)
```

## 注意事项

1. **全局开关**：`LMDEPLOY_USE_MODELSCOPE=True` 是全局开关，设置后所有模型下载都会走 ModelScope
2. **模型 ID 格式**：ModelScope 与 HuggingFace 的模型 ID 通常一致（如 `Qwen/Qwen2.5-7B-Instruct`），启用后从 ModelScope 下载同名模型
3. **依赖安装**：使用 ModelScope 下载前需确保已安装 `modelscope` 包
4. **引擎选择**：TurboMind 引擎性能更高但仅支持特定模型，PyTorch 引擎兼容性更广，参考[支持模型列表](https://github.com/InternLM/lmdeploy/blob/main/docs/en/supported_models/supported_models.md)选择合适引擎
5. **多模态模型**：LMDeploy 支持 VLM（视觉语言模型）推理，如 InternVL、LLaVA、Qwen-VL 等，使用方式与 LLM 一致