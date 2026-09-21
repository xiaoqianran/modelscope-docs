<!-- modelscope-docs: verl | ecosystem-integrations/model-download/verl/verl_EN.md -->

## Overview

verl (HybridFlow) is an open-source RL post-training framework initiated by the ByteDance Seed team and maintained by the verl community. It is the implementation of the paper HybridFlow (EuroSys 2025). It is a flexible, efficient, and production-ready reinforcement learning post-training library for large language models, scalable to 671B models and hundreds of GPUs.

Core features:

- **Rich RL algorithms**: Built-in PPO, GRPO, GSPO, ReMax, REINFORCE++, RLOO, PRIME, DAPO, DrGRPO, KL_Cov & Clip_Cov, etc., supporting verifiable rewards (math/code) and model rewards
- **Supervised Fine-Tuning (SFT)**: Supports SFT training; SFT can be performed before RL
- **Multi-backend training**: Supports FSDP / FSDP2 / Megatron-LM training backends with a flexible hybrid controller programming model
- **Multi-backend inference (rollout)**: Integrates vLLM, SGLang, and HuggingFace Transformers as rollout generation engines, including 3D-HybridEngine for efficient weight resharding
- **Multimodal RL**: Supports vision-language model (VLM) multimodal RL (Qwen2.5-VL, Kimi-VL, etc.)
- **Multi-turn Tool Calling**: Supports multi-turn rollout and tool calling (Agent Loop)
- **Alignment recipes**: Self-play preference optimization (SPPO), SPIN, entropy mechanisms, etc.
- **Efficiency optimizations**: Flash Attention 2, sequence packing, DeepSpeed Ulysses sequence parallelism, Liger-kernel, LoRA
- **Large-scale capability**: Scalable to 671B models and hundreds of GPUs, supporting expert parallelism and multi-card LoRA RL
- **Low-precision training**: FP8 RL, NVFP4 QAT quantization-aware training
- **Ecosystem compatibility**: Compatible with HuggingFace Transformers and ModelScope Hub
- **Broad hardware support**: NVIDIA, AMD (ROCm), Huawei Ascend (Ascend NPU)
- **Experiment tracking**: Integrates wandb, swanlab, mlflow, tensorboard

## Resources

| Resource | URL |
|------|------|
| Repository | [verl-project/verl](https://github.com/verl-project/verl) |
| Official documentation | [verl.readthedocs.io](https://verl.readthedocs.io/en/latest/) |
| Installation guide | [start/install](https://verl.readthedocs.io/en/latest/start/install.html) |
| Quick start (GSM8K PPO) | [start/quickstart](https://verl.readthedocs.io/en/latest/start/quickstart.html) |
| PPO algorithm docs | [algo/ppo](https://verl.readthedocs.io/en/latest/algo/ppo.html) |
| GRPO algorithm docs | [algo/grpo](https://verl.readthedocs.io/en/latest/algo/grpo.html) |
| Configuration reference | [config](https://verl.readthedocs.io/en/latest/examples/config.html) |
| Algorithm recipe directory | [recipe/](https://github.com/verl-project/verl/tree/main/recipe) |
| Performance tuning guide | [Performance Tuning](https://verl.readthedocs.io/en/latest/perf/perf_tuning.html) |
| Paper HybridFlow | [arXiv:2409.19256](https://arxiv.org/abs/2409.19256) |

## ModelScope Integration

verl controls the model download source via the environment variable `VERL_USE_MODELSCOPE`; when enabled, models are downloaded from ModelScope. The mechanism calls ModelScope's `patch_hub()` at import time, applying a monkey patch to HuggingFace `huggingface_hub` to redirect model downloads to ModelScope.

- **Environment variable**: `VERL_USE_MODELSCOPE`, takes the string value `True` (case-insensitive), default `False`
- **Dependency requirement**: Requires `modelscope` to be installed (if not installed, an ImportError is raised prompting `pip install modelscope -U`)
- **Coverage**: Model download (`AutoModel.from_pretrained` / `AutoTokenizer` / `AutoConfig` are patched), partial dataset download
- **Version sensitivity**: This integration depends on `modelscope.utils.hf_util.patch_hub`, which exists in older modelscope versions (e.g., v1.18.0/v1.20.1) but has been removed/renamed in modelscope v1.23.0 and later, so it must be used with a verl-compatible modelscope version

## Getting Started

### Installation

verl recommends installation via Docker images and also supports pip / uv:

**Option 1: Docker (recommended)**

```bash
# Base image + application image
docker pull verl-base:latest
docker pull verl:latest
# Or build from Dockerfile, see docs/start/install.html
```

**Option 2: pip**

```bash
pip install verl
# Or from source
git clone https://github.com/verl-project/verl.git
cd verl
pip install -e .
```

**Option 3: uv (recommended for custom environments)**

```bash
pip install uv
uv sync
```

To use the ModelScope integration, additionally install:

```bash
pip install modelscope
```

> For a detailed installation guide (including AMD ROCm, Ascend NPU, backend combinations, etc.), see the [official installation documentation](https://verl.readthedocs.io/en/latest/start/install.html).

### Prepare the Dataset

Taking GSM8K (grade-school math problems) as an example, verl requires data to be preprocessed into parquet format:

```bash
python3 examples/data_preprocess/gsm8k.py --local_save_dir ~/data/gsm8k
```

GSM8K uses a rule-based verifiable reward: after the model outputs an answer, a regex extracts the final answer; a correct answer scores 1, an incorrect one scores 0, and no answer scores 0.

### Run PPO with ModelScope Models

Set the environment variable to make verl download models from ModelScope:

```bash
export VERL_USE_MODELSCOPE=True
```

Run PPO training with a model ID on ModelScope (use the same model ID as on ModelScope/HF; after patching it will be redirected to ModelScope). The following is a complete example on GSM8K:

```bash
PYTHONUNBUFFERED=1 python3 -m verl.trainer.main_ppo \
    data.train_files=$HOME/data/gsm8k/train.parquet \
    data.val_files=$HOME/data/gsm8k/test.parquet \
    data.train_batch_size=256 \
    data.max_prompt_length=512 \
    data.max_response_length=512 \
    actor_rollout_ref.model.path=Qwen/Qwen2.5-0.5B-Instruct \
    actor_rollout_ref.actor.optim.lr=1e-6 \
    actor_rollout_ref.actor.ppo_mini_batch_size=64 \
    actor_rollout_ref.actor.ppo_micro_batch_size_per_gpu=4 \
    actor_rollout_ref.rollout.name=vllm \
    actor_rollout_ref.rollout.log_prob_micro_batch_size_per_gpu=8 \
    actor_rollout_ref.rollout.tensor_model_parallel_size=1 \
    actor_rollout_ref.rollout.gpu_memory_utilization=0.4 \
    actor_rollout_ref.ref.log_prob_micro_batch_size_per_gpu=4 \
    critic.optim.lr=1e-5 \
    critic.model.path=Qwen/Qwen2.5-0.5B-Instruct \
    critic.ppo_micro_batch_size_per_gpu=4 \
    algorithm.kl_ctrl.kl_coef=0.001 \
    trainer.logger=console \
    trainer.val_before_train=False \
    trainer.n_gpus_per_node=1 \
    trainer.nnodes=1 \
    trainer.save_freq=10 \
    trainer.test_freq=10 \
    trainer.total_epochs=15
```

> - `actor_rollout_ref.model.path` and `critic.model.path` point to the model ID on ModelScope (same name as on HF; redirected to ModelScope after patching)
> - `trainer.test_freq` controls how often evaluation is performed on the validation set (key metric `val/test_score/openai/gsm8k`)
> - At minimum, a single GPU with 24GB of VRAM is required

**Switching RL algorithms**: verl supports switching between PPO / GRPO / REINFORCE++ / RLOO / ReMax / GSPO / DAPO, etc., via configuration. See the [algorithm documentation](https://verl.readthedocs.io/en/latest/examples/config.html#algorithm) and the [recipe directory](https://github.com/verl-project/verl/tree/main/recipe).

### Supervised Fine-Tuning (SFT)

verl also supports SFT training; you can perform SFT first and then RL. SFT-related examples are in the `examples/sft/` directory:

```bash
# SFT example (using Qwen2.5-0.5B + GSM8K)
python3 -m verl.trainer.main_sft \
    data.train_files=$HOME/data/gsm8k/train.parquet \
    data.val_files=$HOME/data/gsm8k/test.parquet \
    model.path=Qwen/Qwen2.5-0.5B-Instruct \
    ...
```

> For detailed SFT usage, see the `examples/sft/` directory and the [SFT Trainer documentation](https://verl.readthedocs.io/en/latest/).

### Alternative: Pre-download + Local Path

When the modelscope version does not include `hf_util` or for maximum reliability, you can pre-download the model with the ModelScope CLI first, then use the local path:

```bash
# Pre-download the model
modelscope download --model Qwen/Qwen2.5-0.5B-Instruct --local_dir ./models/qwen-0.5b

# Use the local path during training, no VERL_USE_MODELSCOPE needed
python3 -m verl.trainer.main_ppo \
    actor_rollout_ref.model.path=./models/qwen-0.5b \
    critic.model.path=./models/qwen-0.5b \
    ...
```

## Notes

1. **Environment variable value**: `VERL_USE_MODELSCOPE=True` uses the string `true`/`false` (case-insensitive)
2. **Version compatibility**: Depends on `modelscope.utils.hf_util.patch_hub`, which was removed in modelscope v1.23.0+; if a newer modelscope is installed and the integration fails, it is recommended to use the pre-download + local path approach
3. **vLLM rollout**: verl's vLLM rollout engine may internally load weights via `snapshot_download`; the coverage of this path depends on the vLLM version. If it still goes through HuggingFace, the pre-download approach is recommended
4. **Data format**: verl requires data to be preprocessed into parquet format, generated using scripts under `examples/data_preprocess/`
5. **Algorithm switching**: PPO/GRPO/REINFORCE++/RLOO/ReMax/GSPO/DAPO, etc., are switched via configuration. See the [config documentation](https://verl.readthedocs.io/en/latest/examples/config.html#algorithm) and the [recipe directory](https://github.com/verl-project/verl/tree/main/recipe)
6. **SFT + RL workflow**: You can perform SFT (`examples/sft/`) first and then RL; for the complete GSM8K example, see the official documentation
7. **Hardware requirements**: PPO training requires at minimum a single GPU with 24GB of VRAM; large-scale training (671B) requires hundreds of GPUs
8. **Repository migration**: The original `volcengine/verl` has been migrated to `verl-project/verl`; the old address still redirects and remains accessible
