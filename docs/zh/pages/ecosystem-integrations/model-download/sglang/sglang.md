<!-- modelscope-docs: SGLang | ecosystem-integrations/model-download/sglang/sglang_CN.md -->

## 概述

SGLang 是由 LMSYS 组织开发的高性能大语言模型和多模态模型推理服务框架，目前已成为开源 LLM 推理领域的事实标准之一，全球部署规模超过 40 万张 GPU，被 xAI、AMD、NVIDIA、Intel、LinkedIn、Cursor 等企业在生产环境中使用。

它的核心设计围绕推理速度和吞吐量展开，主要特性包括：

- RadixAttention 前缀缓存，避免重复计算
- 零开销 CPU 调度器，减少调度延迟
- 推测解码（Speculative Decoding）、连续批处理、分页注意力
- 张量并行 / 流水线并行 / 专家并行 / 数据并行
- 结构化输出、分块预填充、多种量化方案（FP4/FP8/INT4/AWQ/GPTQ）
- 多 LoRA 批处理

模型支持方面，SGLang 兼容大多数 HuggingFace 格式的模型，包括 Llama、Qwen、DeepSeek、Kimi、GLM、GPT、Gemma、Mistral 等系列，同时提供与 OpenAI API 兼容的接口。硬件方面覆盖 NVIDIA GPU（GB200/B300/H100/A100/5090 等）、AMD GPU（MI355/MI300）、Intel Xeon CPU、Google TPU 和 Ascend NPU。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [sgl-project/sglang](https://github.com/sgl-project/sglang) |
| 官方文档 | [docs.sglang.io](https://docs.sglang.io/) |
| 博客 | [lmsys.org/blog](https://lmsys.org/blog/) |

## ModelScope 集成

SGLang 原生通过 HuggingFace 下载模型，国内用户网络访问不稳定。ModelScope 为 SGLang 提供模型下载源切换能力：

- 通过环境变量 `SGLANG_USE_MODELSCOPE` 控制下载源，设为 `True` 后所有模型下载请求从 HuggingFace 切换到 ModelScope
- 覆盖文本模型和多模态（扩散）模型的下载场景
- 支持通过 `modelscope.snapshot_download` 和 `modelscope.model_file_download` 下载模型
- 支持从 ModelScope 加载 `AutoConfig` 和 `GenerationConfig`
- 修复了开启 ModelScope 后部分代码路径仍残留 HuggingFace 访问的问题（量化配置加载、CLI 工具等）

## 接入流程

### 前置条件

```bash
# 安装 SGLang
pip install sglang[all]

# 安装 ModelScope
pip install modelscope
```

### 启动推理服务

设置环境变量，使 SGLang 从 ModelScope 下载模型：

```bash
export SGLANG_USE_MODELSCOPE=True
```

Mac（Apple Silicon）启动 SGLang 服务的命令：

```bash
SGLANG_USE_MLX=1 python -m sglang.launch_server \
  --model Qwen/Qwen3-0.6B \
  --cuda-graph-backend-decode=disabled \
  --cuda-graph-backend-prefill=disabled \
  --disable-overlap-schedule \
  --host 0.0.0.0
```

![SGLang 启动命令](../_resources/sglang-1.png)

启动后，模型会自动从 ModelScope 下载到本地缓存目录，后续启动会直接使用缓存。更多使用方式请参考 [SGLang 官方文档](https://docs.sglang.io/)。

### 调用推理服务

服务启动后，可以通过以下两种方式调用：

**方式一：curl**

```bash
curl http://localhost:30000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "your-model-name",
    "messages": [{"role": "user", "content": "你好，请介绍一下自己"}]
  }'
```

![curl 测试结果](../_resources/sglang-2.png)

**方式二：OpenAI SDK (Python)**

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

> 将 `your-model-name` 替换为你启动服务时 `--model` 指定的模型名称即可。

## 注意事项

1. **全局开关**：`SGLANG_USE_MODELSCOPE=True` 是全局开关，设置后所有模型下载都会走 ModelScope
2. **本地路径优先**：如果 `model_path` 指向的本地路径已存在模型文件，会直接使用本地模型，不会触发下载
3. **模型 ID 格式**：使用 ModelScope 上的模型 ID（如 `qwen/Qwen3-0.6B`），而非 HuggingFace 的 ID 格式
4. **依赖安装**：使用 ModelScope 下载前需确保已安装 `modelscope` 包