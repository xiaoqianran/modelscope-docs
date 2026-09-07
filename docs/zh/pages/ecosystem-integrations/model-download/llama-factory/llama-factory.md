<!-- modelscope-docs: LLaMA-Factory | ecosystem-integrations/model-download/llama-factory/llama-factory_CN.md -->

## 概述

LLaMA-Factory 是开源的 LLM 微调框架，提供零代码 CLI 和 Web UI（LLaMA-Board，由 Gradio 驱动），可轻松微调百余种大模型，支持从预训练到人类对齐的完整训练流程。

核心特色：

- **多种模型**：LLaMA、LLaVA、Mistral、Mixtral-MoE、Qwen3、Qwen3-VL、DeepSeek、Gemma、GLM、Phi 等
- **集成方法**：（增量）预训练、（多模态）指令监督微调、奖励模型训练、PPO、DPO、KTO、ORPO、SimPO 训练等
- **多种精度**：16 比特全参数微调、冻结微调、LoRA 微调和基于 AQLM/AWQ/GPTQ/LLM.int8/HQQ/EETQ 的 2~8 比特 QLoRA 微调
- **先进算法**：GaLore、BAdam、APOLLO、Adam-mini、Muon、DoRA、LongLoRA、LLaMA Pro、Mixture-of-Depths、LoRA+、LoftQ、PiSSA 等
- **实用技巧**：FlashAttention-2、Unsloth、Liger Kernel、KTransformers、RoPE scaling、NEFTune、rsLoRA
- **广泛任务**：多轮对话、工具调用、图像理解、视觉定位、视频识别、语音理解等
- **实验监控**：LlamaBoard、TensorBoard、Wandb、MLflow、SwanLab 等
- **极速推理**：基于 vLLM 或 SGLang 的 OpenAI 风格 API、浏览器界面和命令行接口

训练方法支持矩阵：

| 方法 | 全参数训练 | 部分参数训练 | LoRA | QLoRA |
|------|:---:|:---:|:---:|:---:|
| 预训练 | ✅ | ✅ | ✅ | ✅ |
| 指令监督微调 | ✅ | ✅ | ✅ | ✅ |
| 奖励模型训练 | ✅ | ✅ | ✅ | ✅ |
| PPO 训练 | ✅ | ✅ | ✅ | ✅ |
| DPO 训练 | ✅ | ✅ | ✅ | ✅ |
| KTO 训练 | ✅ | ✅ | ✅ | ✅ |
| ORPO 训练 | ✅ | ✅ | ✅ | ✅ |
| SimPO 训练 | ✅ | ✅ | ✅ | ✅ |

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [hiyouga/LlamaFactory](https://github.com/hiyouga/LlamaFactory) |
| README（中文） | [README_zh.md](https://github.com/hiyouga/LlamaFactory/blob/main/README_zh.md) |
| 官方博客 | [blog.llamafactory.net](https://blog.llamafactory.net/en/) |
| 常见问题 | [GitHub Issues #4614](https://github.com/hiyouga/LlamaFactory/issues/4614) |
| ModelScope Studio | [modelscope.cn/studios/hiyouga/LLaMA-Board](https://modelscope.cn/studios/hiyouga/LLaMA-Board) |
| 数据集格式文档 | [data/README.md](https://github.com/hiyouga/LLaMA-Factory/blob/main/data/README.md) |
| 示例配置 | [examples/README_zh.md](https://github.com/hiyouga/LLaMA-Factory/blob/main/examples/README_zh.md) |

## ModelScope 集成

LLaMA-Factory 通过环境变量 `USE_MODELSCOPE_HUB` 控制模型和数据集的下载源，启用后从 ModelScope 下载。机制包括：

- **模型下载**：调用 `modelscope.snapshot_download` 下载模型权重
- **数据集下载**：当数据集仅指定名称（无 `*_hub_url` 字段）时，自动路由到 `ms_hub`，调用 `modelscope.MsDataset.load` 加载
- **鉴权**：可通过 `ms_hub_token` 字段或 `--ms_hub_token` 参数传入 ModelScope token 访问私有模型

该集成自 2023-12-01 起支持（见 README changelog）。

## 接入流程

### 安装 LLaMA-Factory

从源码安装（官方推荐）：

```bash
git clone --depth 1 https://github.com/hiyouga/LlamaFactory.git
cd LlamaFactory
pip install -e .
pip install -r requirements/metrics.txt
```

可选依赖：`metrics`（实验监控）、`deepspeed`（多卡训练）。也可使用 Docker 镜像 `hiyouga/llamafactory:latest`（基于 Ubuntu 22.04 + CUDA 12.4）。

### 启用 ModelScope 下载源

```bash
export USE_MODELSCOPE_HUB=1
# Windows: set USE_MODELSCOPE_HUB=1
```

> LLaMA-Factory 支持三个下载源：HuggingFace（默认）、魔搭社区（`USE_MODELSCOPE_HUB=1`）、魔乐社区（`USE_OPENMIND_HUB=1`）。

### 使用 ModelScope 模型进行 LoRA 微调

设置 `USE_MODELSCOPE_HUB=1` 后，将 `model_name_or_path` 指向 ModelScope 上的模型 ID 即可。以 Qwen3-4B-Instruct 为例，使用官方示例配置：

```bash
export USE_MODELSCOPE_HUB=1
llamafactory-cli train examples/train_lora/qwen3_lora_sft.yaml
```

该示例的 `model_name_or_path` 指向 ModelScope 模型 ID（可在 [modelscope.cn/models](https://modelscope.cn/models) 查找），数据集会自动从 ModelScope 加载。

训练完成后可进行推理和合并 LoRA 权重：

```bash
llamafactory-cli chat examples/inference/qwen3_lora_sft.yaml
llamafactory-cli export examples/merge_lora/qwen3_lora_sft.yaml
```

### LLaMA Board 可视化微调

通过 Web UI 零代码微调（由 [Gradio](https://github.com/gradio-app/gradio) 驱动）：

```bash
llamafactory-cli webui
```

启动后浏览器打开 `http://127.0.0.1:7860`。LLaMA Board 界面由顶部配置区和四个功能标签页组成。

**顶部配置区**（所有标签页共享）：

- 语言、模型名称（从支持的模型列表选择或自定义）、模型路径
- **下载源**：`huggingface` / `modelscope` / `openmind`，默认根据环境变量（`USE_MODELSCOPE_HUB` 等）自动选择，也可在界面手动切换
- 微调类型（lora/full/freeze 等）、Checkpoint、量化位数（none/8/4）与方法（bnb/hqq/eetq）、模板、RoPE scaling、Booster（flashattn2/unsloth/liger_kernel）

**四个标签页**：

- **Train**：训练配置。可设置训练阶段（Supervised / Pretrain / Reward / PPO / DPO / KTO 等）、数据集、Learning rate、Epochs、Max samples、Compute type、Cutoff len、Batch size、Gradient accumulation、验证集比例、学习率调度器等；下方折叠面板还提供 LoRA 参数（rank/alpha/dropout/DoRA/PiSSA）、RLHF 参数、多模态参数、GaLore/BAdam/APOLLO 等高级选项
- **Evaluate & Predict**：模型评估与批量预测
- **Chat**：加载模型后对话测试，可切换推理后端（huggingface/vllm/sglang）
- **Export**：合并导出 LoRA 权重

![LLaMA Board WebUI：顶部选择 modelscope 下载源并配置模型、数据集（Train 标签页）](../_resources/llama-factory-1.png)

Train 标签页底部有 **Preview command**（预览命令）按钮，点击后可在不真正启动训练的情况下查看当前配置对应的完整 `llamafactory-cli train` 命令行，方便核对或复制到终端单独执行：

![LLaMA Board WebUI：Preview command 预览训练命令](../_resources/llama-factory-2.png)

### 自定义训练配置

如需自定义模型/数据集，编写 yaml 配置：

```yaml
### model
model_name_or_path: LLM-Research/Meta-Llama-3-8B-Instruct  # ModelScope 模型 ID
trust_remote_code: true

### method
stage: sft
do_train: true
finetuning_type: lora
lora_target: all

### dataset
dataset: alpaca_zh  # USE_MODELSCOPE_HUB=1 时自动从 ModelScope 下载
template: llama3
cutoff_len: 1024
max_samples: 1000
overwrite_cache: true

### output
output_dir: saves/llama3-8b/lora/sft
logging_steps: 10
save_steps: 500
plot_loss: true

### train
per_device_train_batch_size: 1
gradient_accumulation_steps: 8
learning_rate: 1.0e-4
num_train_epochs: 3.0
lr_scheduler_type: cosine
warmup_ratio: 0.1
bf16: true
```

### 显式指定数据集走 ModelScope

在 `data/dataset_info.json` 中用 `ms_hub_url` 字段：

```json
"my_dataset": {
  "ms_hub_url": "your-namespace/your-dataset-repo",
  "columns": { "prompt": "instruction", "response": "output" }
}
```

### 利用 vLLM 部署 OpenAI API

训练后可基于 vLLM 部署 OpenAI 兼容的推理 API：

```bash
API_PORT=8000 llamafactory-cli api examples/inference/qwen3.yaml infer_backend=vllm vllm_enforce_eager=true
```

### 访问私有模型（可选）

```yaml
ms_hub_token: ms-xxxxxxxxxxxxxxxxxxxx
```

或在命令行中传入 `--ms_hub_token`。

## 注意事项

1. **环境变量名**：是 `USE_MODELSCOPE_HUB`（注意带 `_HUB` 后缀），取 `1` 启用；魔乐社区用 `USE_OPENMIND_HUB`
2. **安装方式**：官方推荐从源码安装（`git clone` + `pip install -e .`），也可用 Docker 镜像 `hiyouga/llamafactory:latest`
3. **CLI 命令**：统一用 `llamafactory-cli`（如 `llamafactory-cli train`、`llamafactory-cli webui`、`llamafactory-cli api`）
4. **模型 ID 格式**：使用 ModelScope 上的模型 ID（如 `LLM-Research/Meta-Llama-3-8B-Instruct`），可在 [modelscope.cn/models](https://modelscope.cn/models) 查找
5. **数据集自动路由**：仅指定数据集名称时，`USE_MODELSCOPE_HUB=1` 会自动从 ModelScope 加载
6. **依赖版本**：启用时会校验 `modelscope>=1.14.0`
