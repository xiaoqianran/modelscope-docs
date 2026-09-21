<!-- modelscope-docs: ms-swift | ecosystem-integrations/model-download/ms-swift/ms-swift_EN.md -->

## Overview

ms-swift (SWIFT, Scalable lightWeight Infrastructure for Fine-Tuning) is the official large-model and multimodal large-model fine-tuning and deployment framework provided by the ModelScope community. It now supports training (pre-training/fine-tuning/human alignment), inference, evaluation, quantization, and deployment for 600+ text-only large models and 400+ multimodal large models. Text large models include Qwen3, Qwen3.5, InternLM3, GLM4.5, Mistral, DeepSeek-R1, Llama4, etc.; multimodal large models include Qwen3-VL, Qwen3-Omni, InternVL3.5, MiniCPM-V-4, GLM4.5-V, DeepSeek-VL2, etc.

ms-swift also brings together the latest training techniques: it integrates Megatron parallel techniques (TP/PP/CP/EP) to accelerate training, along with numerous GRPO-family reinforcement learning algorithms (GRPO, DAPO, GSPO, SAPO, CISPO, RLOO, Reinforce++, etc.) to enhance model intelligence. It also supports preference learning algorithms such as DPO, KTO, RM, CPO, SimPO, and ORPO, as well as Embedding, Reranker, and sequence classification tasks.

As a ModelScope-native framework, ms-swift uses ModelScope as the default download source for models and datasets without any additional configuration. You can switch to HuggingFace via `--use_hf true`.

Core features:

- **Model types**: Supports 600+ text-only large models and 400+ multimodal large models, with Day-0 support for popular models
- **Dataset types**: Built-in 150+ pre-training/fine-tuning/human alignment/multimodal task datasets, supports custom datasets for one-click training
- **Hardware support**: A10/A100/H100, RTX series, T4/V100, CPU, MPS, and domestic hardware Ascend NPU
- **Lightweight training**: LoRA, QLoRA, DoRA, LoRA+, LLaMAPro, LongLoRA, LoRA-GA, ReFT, RS-LoRA, Adapter, LISA, etc.
- **Quantized training**: Supports training of BNB/AWQ/GPTQ/AQLM/HQQ/EETQ quantized models; training a 7B model requires only 9GB
- **Memory optimization**: GaLore, Q-Galore, UnSloth, Liger-Kernel, Flash-Attention 2/3, and Ulysses/Ring-Attention sequence parallelism
- **Distributed training**: DDP, device_map, DeepSpeed ZeRO2/ZeRO3, FSDP/FSDP2, Megatron
- **Multimodal training**: Multimodal packing technique boosts speed by 100%+, supports text/image/video/audio mixed modalities, with independent control over vit/aligner/llm
- **Reinforcement learning**: Built-in rich GRPO-family algorithms, supports synchronous/asynchronous vLLM inference acceleration, with pluggable reward functions, multi-turn inference schedulers, and environments
- **Megatron parallelism**: TP/PP/SP/CP/ETP/EP/VPP parallel strategies, significantly accelerating MoE model training
- **Full pipeline**: Training, inference, evaluation, quantization, and deployment end-to-end; provides a Web-UI for graphical operation
- **Inference acceleration**: Transformers, vLLM, SGLang, LMDeploy engines, providing an OpenAI-compatible API
- **Model quantization**: AWQ, GPTQ, FP8, BNB quantization export; exported models support vLLM/SGLang/LMDeploy inference

## Resources

| Resource | URL |
|----------|-----|
| Repository | [modelscope/ms-swift](https://github.com/modelscope/ms-swift) |
| Official documentation (Chinese) | [swift.readthedocs.io/zh-cn/latest](https://swift.readthedocs.io/zh-cn/latest/) |
| Installation guide | [SWIFT installation](https://swift.readthedocs.io/zh-cn/latest/GetStarted/SWIFT-installation.html) |
| Quick start | [Quick-start](https://swift.readthedocs.io/zh-cn/latest/GetStarted/Quick-start.html) |
| Web-UI documentation | [Web-UI](https://swift.readthedocs.io/zh-cn/latest/GetStarted/Web-UI.html) |
| Command-line parameters | [Command-line-parameters](https://swift.readthedocs.io/zh-cn/latest/Instruction/Command-line-parameters.html) |
| Supported models and datasets | [Supported-models-and-datasets](https://swift.readthedocs.io/en/latest/Instruction/Supported-models-and-datasets.html) |
| Example scripts | [examples directory](https://github.com/modelscope/ms-swift/tree/main/examples) |
| Paper | [arXiv:2408.05517](https://arxiv.org/abs/2408.05517) |

## ModelScope Integration

ms-swift is a ModelScope-native framework that **uses ModelScope to download models and datasets by default**, with no environment variables required. Use the `--use_hf` argument to control the download source:

- `--use_hf false` (default): Download models and datasets from ModelScope, and push models to ModelScope Hub
- `--use_hf true`: Switch to HuggingFace

Models and datasets use ModelScope's model id / dataset id directly, e.g. `--model Qwen/Qwen3-4B-Instruct-2507`, `--dataset AI-ModelScope/alpaca-gpt4-data-zh`. It relies on the `modelscope` SDK under the hood.

Related environment variables:

- `MODELSCOPE_DOMAIN`: Switch the ModelScope site (set to `www.modelscope.ai` for the international site; the default `modelscope.cn` is the domestic site)
- `MODELSCOPE_CACHE`: Controls the ModelScope resource cache path
- `--hub_token` / `--hub_model_id`: ModelScope SDK authentication token and target model id

## Getting Started

### Installation

**Wheel installation** (recommended):

```bash
# Basic installation
pip install 'ms-swift' -U
# Extra: install megatron dependencies
pip install 'ms-swift[megatron]' -U
# Extra: install evaluation dependencies
pip install 'ms-swift[eval]' -U
# Full capabilities
pip install 'ms-swift[all]' -U

# Using uv (faster)
pip install uv
uv pip install 'ms-swift' --torch-backend=auto
```

**Install from source**:

```bash
git clone https://github.com/modelscope/ms-swift.git
cd ms-swift
pip install -e .
# Full capabilities
# pip install -e '.[all]'
```

**Docker image**:

```bash
# swift4.4.3 (with CUDA 13.0 + PyTorch 2.11 + vLLM 0.25.1 + modelscope 1.39.0)
docker pull modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:\
ubuntu22.04-cuda13.0.3-py312-torch2.11.0-vllm0.25.1-modelscope1.39.0-swift4.4.3
```

### LoRA Fine-tuning (Downloaded from ModelScope by Default)

Perform self-cognition fine-tuning on Qwen3-4B-Instruct-2507 on a single 3090 GPU in 10 minutes (approx. 13GB VRAM). Both the model and dataset come from ModelScope:

```bash
CUDA_VISIBLE_DEVICES=0 \
swift sft \
    --model Qwen/Qwen3-4B-Instruct-2507 \
    --tuner_type lora \
    --dataset 'AI-ModelScope/alpaca-gpt4-data-zh#500' \
              'AI-ModelScope/alpaca-gpt4-data-en#500' \
              'swift/self-cognition#500' \
    --torch_dtype bfloat16 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 1 \
    --per_device_eval_batch_size 1 \
    --learning_rate 1e-4 \
    --lora_rank 8 --lora_alpha 32 --target_modules all-linear \
    --gradient_accumulation_steps 16 \
    --eval_steps 50 \
    --save_steps 50 \
    --save_total_limit 2 \
    --logging_steps 5 \
    --max_length 2048 \
    --output_dir output \
    --warmup_ratio 0.05 \
    --dataloader_num_workers 4 \
    --model_author swift --model_name swift-robot
```

> - The `#500` suffix after a dataset name means taking the first 500 entries
> - When using a custom dataset, refer to the [custom dataset format](https://swift.readthedocs.io/zh-cn/latest/Customization/Custom-dataset.html) and specify it via `--dataset <dataset_path>`
> - `--model_author` and `--model_name` only take effect when the dataset includes `swift/self-cognition`
> - To switch to another model, simply change `--model <model_id/model_path>`; ModelScope is used for download by default. Add `--use_hf true` to use HuggingFace instead

### Inference

After training completes, use the trained LoRA weights for inference. Replace `--adapters` with the checkpoint folder generated during training — since it contains the parameter file `args.json`, swift automatically reads arguments such as `--model` and `--system`, so you don't need to specify them again (set `--load_args false` to disable this behavior):

```bash
# Interactive CLI inference
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --stream true \
    --temperature 0 \
    --max_new_tokens 2048

# merge-lora and use vLLM for inference acceleration
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --stream true \
    --merge_lora true \
    --infer_backend vllm \
    --vllm_max_model_len 8192 \
    --temperature 0 \
    --max_new_tokens 2048
```

### Deploy as an OpenAI-Compatible Service

```bash
CUDA_VISIBLE_DEVICES=0 swift deploy \
    --model Qwen/Qwen3-4B-Instruct-2507 \
    --infer_backend vllm
```

### Web-UI for Graphical Training and Inference

ms-swift provides a graphical Web-UI that supports graphical training, inference, evaluation, and quantization, with parameters consistent with the command line:

```bash
# Chinese interface
swift web-ui --lang zh
# English interface
swift web-ui --lang en
```

> Note for macOS users: The system-bundled Apple Swift compiler (`/usr/bin/swift`) may conflict with the ms-swift `swift` command, producing `unable to invoke subcommand: swift-web-ui`. Workaround: use the full path `/opt/anaconda3/bin/swift web-ui --lang zh`, or add `export PATH="/opt/anaconda3/bin:$PATH"` to `~/.zshrc` to prioritize the conda bin directory.

The Web-UI is a high-level wrapper around the command line. Each hyperparameter on the interface is tagged with `--xxx` and corresponds one-to-one with a command-line argument. After launch, open it in a browser; the top has **7 functional tabs**:

| Tab | Function |
|-----|----------|
| **LLM Pre-training/Fine-tuning** | SFT/pre-training tasks; configure model, dataset, hyperparameters and launch training |
| **LLM Human Alignment** | DPO/KTO/RM/CPO/SimPO/ORPO and other preference learning training |
| **LLM GRPO** | GRPO/DAPO/GSPO and other reinforcement learning training |
| **LLM Inference** | Load a model for conversational inference testing |
| **LLM Export** | Merge LoRA, quantize and export, push to Hub |
| **LLM Evaluation** | Evaluate models with EvalScope as the backend |
| **LLM Sampling** | Sample model outputs |

Taking the **LLM Pre-training/Fine-tuning** tab as an example, you can configure the model ID or path, dataset, training parameters (training batch size, evaluation batch size, learning rate, evaluation steps, dataset epochs, gradient accumulation steps, Flash Attention type, NEFTune noise coefficient, save steps, output directory, etc.), as well as the training method, training precision, data parallelism, LoRA parameters, quantization, etc.:

![ms-swift WebUI: LLM Pre-training/Fine-tuning tab (model ID, dataset, training parameter configuration)](../_resources/ms-swift-1.png)

Hyperparameter settings and runtime status are expanded via the collapsible panels below. The **Runtime** area provides the following operations:

- **Show run command**: View the complete `swift sft` command line corresponding to the current configuration; can be saved as a shell script
- **Show run status**: View runtime logs and training charts in real time
- **Open TensorBoard**: Launch TensorBoard visualization
- **Recover runtime tasks**: Recover running background tasks after restarting the Web-UI
- **Kill task**: Terminate a specified background training process

Training charts include metrics such as train/loss, train/acc, train/learning_rate, eval/loss, eval/acc (for human alignment tasks: train/rewards/accuracies, train/rewards/margins, train/logps, etc.):

![ms-swift WebUI: hyperparameter settings and runtime (training charts, run command/status/TensorBoard)](../_resources/ms-swift-2.png)

Main features:

- **Independent process**: Training/deployment tasks launched from the interface run as independent processes in the system; closing the Web-UI does not affect background training
- **Multi-task parallelism**: Multiple training/deployment tasks can run in parallel on a multi-GPU machine
- **Interface inference**: Also supports a Space deployment mode for inference only

> Note: The Web-UI does not support PPO training (the workflow is relatively complex; it is recommended to use shell scripts from [examples](https://github.com/modelscope/ms-swift/tree/main/examples)). To share over the public internet, add `--share true` (use with caution in DSW/Notebook environments).

**Inference-only Space deployment** (inference page only):

```bash
swift app --model '<model>' --studio_title My-Awesome-Space --stream true
# Or load adapters
swift app --model '<model>' --adapters '<adapter>' --stream true
```

### Push Models Back to ModelScope Hub

```bash
CUDA_VISIBLE_DEVICES=0 \
swift export --push_to_hub true \
    --adapters output/vx-xxx/checkpoint-xxx \
    --hub_model_id '<your-model-id>' \
    --hub_token '<your-token>' \
    --use_hf false
```

## Notes

1. **ModelScope by default**: No environment variables need to be set. `--use_hf` defaults to `false`, which uses ModelScope; add `--use_hf true` only if you need HuggingFace
2. **Install extras**: The basic `pip install ms-swift` is sufficient to use; add `[megatron]` for Megatron parallelism, `[eval]` for evaluation, or `[all]` for full capabilities
3. **Web-UI**: Launch with `swift web-ui --lang zh`; it is a high-level wrapper around the command line where each parameter is tagged with `--xxx` corresponding to its command-line counterpart; PPO training is not supported — use shell scripts instead
4. **International site**: Overseas users can set `MODELSCOPE_DOMAIN='www.modelscope.ai'` to switch to the ModelScope international site
5. **Model ID format**: Use the model id on ModelScope (e.g. `Qwen/Qwen3-4B-Instruct-2507`), which can be found at [modelscope.cn/models](https://modelscope.cn/models)
6. **Cache path**: The cache location can be customized via the `MODELSCOPE_CACHE` environment variable
7. **Inference auto-reads parameters**: The checkpoint folder pointed to by `--adapters` contains `args.json`, from which swift automatically reads the model/system parameters without re-specifying `--model`; set `--load_args false` to disable this
