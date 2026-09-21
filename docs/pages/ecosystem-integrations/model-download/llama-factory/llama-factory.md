<!-- modelscope-docs: LLaMA-Factory | ecosystem-integrations/model-download/llama-factory/llama-factory_EN.md -->

## Overview

LLaMA-Factory is an open-source LLM fine-tuning framework that provides a zero-code CLI and Web UI (LLaMA-Board, powered by Gradio) for easily fine-tuning over a hundred large models, supporting the complete training pipeline from pretraining to human alignment.

Core features:

- **Multiple models**: LLaMA, LLaVA, Mistral, Mixtral-MoE, Qwen3, Qwen3-VL, DeepSeek, Gemma, GLM, Phi, etc.
- **Integration methods**: (incremental) pretraining, (multimodal) supervised fine-tuning, reward model training, PPO, DPO, KTO, ORPO, SimPO training, etc.
- **Multiple precisions**: 16-bit full-parameter fine-tuning, frozen fine-tuning, LoRA fine-tuning, and 2~8-bit QLoRA fine-tuning based on AQLM/AWQ/GPTQ/LLM.int8/HQQ/EETQ
- **Advanced algorithms**: GaLore, BAdam, APOLLO, Adam-mini, Muon, DoRA, LongLoRA, LLaMA Pro, Mixture-of-Depths, LoRA+, LoftQ, PiSSA, etc.
- **Practical techniques**: FlashAttention-2, Unsloth, Liger Kernel, KTransformers, RoPE scaling, NEFTune, rsLoRA
- **Broad tasks**: multi-turn dialogue, tool calling, image understanding, visual grounding, video recognition, speech understanding, etc.
- **Experiment monitoring**: LlamaBoard, TensorBoard, Wandb, MLflow, SwanLab, etc.
- **Fast inference**: OpenAI-style API, browser interface, and command-line interface based on vLLM or SGLang

Training method support matrix:

| Method | Full-parameter | Partial-parameter | LoRA | QLoRA |
|------|:---:|:---:|:---:|:---:|
| Pretraining | ✅ | ✅ | ✅ | ✅ |
| Supervised fine-tuning | ✅ | ✅ | ✅ | ✅ |
| Reward model training | ✅ | ✅ | ✅ | ✅ |
| PPO training | ✅ | ✅ | ✅ | ✅ |
| DPO training | ✅ | ✅ | ✅ | ✅ |
| KTO training | ✅ | ✅ | ✅ | ✅ |
| ORPO training | ✅ | ✅ | ✅ | ✅ |
| SimPO training | ✅ | ✅ | ✅ | ✅ |

## Resources

| Resource | URL |
|------|------|
| Repository | [hiyouga/LlamaFactory](https://github.com/hiyouga/LlamaFactory) |
| README (Chinese) | [README_zh.md](https://github.com/hiyouga/LlamaFactory/blob/main/README_zh.md) |
| Official blog | [blog.llamafactory.net](https://blog.llamafactory.net/en/) |
| FAQ | [GitHub Issues #4614](https://github.com/hiyouga/LlamaFactory/issues/4614) |
| ModelScope Studio | [modelscope.cn/studios/hiyouga/LLaMA-Board](https://modelscope.cn/studios/hiyouga/LLaMA-Board) |
| Dataset format docs | [data/README.md](https://github.com/hiyouga/LLaMA-Factory/blob/main/data/README.md) |
| Example configs | [examples/README_zh.md](https://github.com/hiyouga/LLaMA-Factory/blob/main/examples/README_zh.md) |

## ModelScope Integration

LLaMA-Factory controls the download source for models and datasets via the environment variable `USE_MODELSCOPE_HUB`; when enabled, downloads come from ModelScope. The mechanism includes:

- **Model download**: calls `modelscope.snapshot_download` to download model weights
- **Dataset download**: when a dataset is specified by name only (without an `*_hub_url` field), it is automatically routed to `ms_hub`, which calls `modelscope.MsDataset.load` to load it
- **Authentication**: a ModelScope token can be passed via the `ms_hub_token` field or the `--ms_hub_token` argument to access private models

This integration has been supported since 2023-12-01 (see the README changelog).

## Getting Started

### Install LLaMA-Factory

Install from source (officially recommended):

```bash
git clone --depth 1 https://github.com/hiyouga/LlamaFactory.git
cd LlamaFactory
pip install -e .
pip install -r requirements/metrics.txt
```

Optional dependencies: `metrics` (experiment monitoring), `deepspeed` (multi-GPU training). You can also use the Docker image `hiyouga/llamafactory:latest` (based on Ubuntu 22.04 + CUDA 12.4).

### Enable the ModelScope Download Source

```bash
export USE_MODELSCOPE_HUB=1
# Windows: set USE_MODELSCOPE_HUB=1
```

> LLaMA-Factory supports three download sources: HuggingFace (default), ModelScope (`USE_MODELSCOPE_HUB=1`), and OpenMind (`USE_OPENMIND_HUB=1`).

### LoRA Fine-tuning with a ModelScope Model

After setting `USE_MODELSCOPE_HUB=1`, point `model_name_or_path` to the model ID on ModelScope. Taking Qwen3-4B-Instruct as an example, using the official example config:

```bash
export USE_MODELSCOPE_HUB=1
llamafactory-cli train examples/train_lora/qwen3_lora_sft.yaml
```

The `model_name_or_path` of this example points to a ModelScope model ID (searchable at [modelscope.cn/models](https://modelscope.cn/models)), and the dataset is automatically loaded from ModelScope.

After training, you can run inference and merge the LoRA weights:

```bash
llamafactory-cli chat examples/inference/qwen3_lora_sft.yaml
llamafactory-cli export examples/merge_lora/qwen3_lora_sft.yaml
```

### Visual Fine-tuning with LLaMA Board

Fine-tune with zero code via the Web UI (powered by [Gradio](https://github.com/gradio-app/gradio)):

```bash
llamafactory-cli webui
```

After launching, open `http://127.0.0.1:7860` in your browser. The LLaMA Board interface consists of a top configuration area and four functional tabs.

**Top configuration area** (shared across all tabs):

- Language, model name (select from the supported model list or customize), model path
- **Download source**: `huggingface` / `modelscope` / `openmind`, auto-selected by default based on environment variables (`USE_MODELSCOPE_HUB`, etc.), and can also be switched manually in the UI
- Fine-tuning type (lora/full/freeze, etc.), checkpoint, quantization bit(s) (none/8/4) and method (bnb/hqq/eetq), template, RoPE scaling, Booster (flashattn2/unsloth/liger_kernel)

**Four tabs**:

- **Train**: training configuration. You can set the training stage (Supervised / Pretrain / Reward / PPO / DPO / KTO, etc.), dataset, learning rate, epochs, max samples, compute type, cutoff len, batch size, gradient accumulation, validation set ratio, learning rate scheduler, etc.; the collapsible panel below also provides LoRA parameters (rank/alpha/dropout/DoRA/PiSSA), RLHF parameters, multimodal parameters, and advanced options such as GaLore/BAdam/APOLLO
- **Evaluate & Predict**: model evaluation and batch prediction
- **Chat**: dialogue testing after loading a model, with switchable inference backends (huggingface/vllm/sglang)
- **Export**: merge and export LoRA weights

![LLaMA Board WebUI: select the modelscope download source at the top and configure the model and dataset (Train tab)](../_resources/llama-factory-1.png)

At the bottom of the Train tab there is a **Preview command** button; clicking it shows the complete `llamafactory-cli train` command line corresponding to the current configuration without actually starting training, making it easy to verify or copy to a terminal for standalone execution:

![LLaMA Board WebUI: Preview command previews the training command](../_resources/llama-factory-2.png)

### Custom Training Configuration

To customize the model/dataset, write a yaml config:

```yaml
### model
model_name_or_path: LLM-Research/Meta-Llama-3-8B-Instruct  # ModelScope model ID
trust_remote_code: true

### method
stage: sft
do_train: true
finetuning_type: lora
lora_target: all

### dataset
dataset: alpaca_zh  # Automatically downloaded from ModelScope when USE_MODELSCOPE_HUB=1
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

### Explicitly Route a Dataset Through ModelScope

Use the `ms_hub_url` field in `data/dataset_info.json`:

```json
"my_dataset": {
  "ms_hub_url": "your-namespace/your-dataset-repo",
  "columns": { "prompt": "instruction", "response": "output" }
}
```

### Deploy an OpenAI API with vLLM

After training, you can deploy an OpenAI-compatible inference API based on vLLM:

```bash
API_PORT=8000 llamafactory-cli api examples/inference/qwen3.yaml infer_backend=vllm vllm_enforce_eager=true
```

### Access Private Models (Optional)

```yaml
ms_hub_token: ms-xxxxxxxxxxxxxxxxxxxx
```

Or pass `--ms_hub_token` on the command line.

## Notes

1. **Environment variable name**: It is `USE_MODELSCOPE_HUB` (note the `_HUB` suffix); set to `1` to enable. For OpenMind, use `USE_OPENMIND_HUB`
2. **Installation method**: The official recommendation is to install from source (`git clone` + `pip install -e .`); the Docker image `hiyouga/llamafactory:latest` is also available
3. **CLI command**: Use `llamafactory-cli` consistently (e.g., `llamafactory-cli train`, `llamafactory-cli webui`, `llamafactory-cli api`)
4. **Model ID format**: Use the model ID on ModelScope (e.g., `LLM-Research/Meta-Llama-3-8B-Instruct`), searchable at [modelscope.cn/models](https://modelscope.cn/models)
5. **Dataset auto-routing**: When only the dataset name is specified, `USE_MODELSCOPE_HUB=1` will automatically load it from ModelScope
6. **Dependency version**: When enabled, it validates `modelscope>=1.14.0`
