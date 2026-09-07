<!-- modelscope-docs: verl | ecosystem-integrations/model-download/verl/verl_CN.md -->

## 概述

verl（HybridFlow）是由字节跳动 Seed 团队发起、verl 社区维护的开源 RL 后训练框架，是论文 HybridFlow（EuroSys 2025）的实现。面向大语言模型的灵活、高效、生产可用的强化学习后训练库，可扩展至 671B 模型、数百 GPU 规模。

核心特性：

- **RL 算法丰富**：内置 PPO、GRPO、GSPO、ReMax、REINFORCE++、RLOO、PRIME、DAPO、DrGRPO、KL_Cov & Clip_Cov 等，支持可验证奖励（数学/代码）与模型奖励
- **监督微调（SFT）**：支持 SFT 训练，可先 SFT 后 RL
- **多后端训练**：支持 FSDP / FSDP2 / Megatron-LM 训练后端，灵活的混合控制器编程模型
- **多后端推理（rollout）**：集成 vLLM、SGLang、HuggingFace Transformers 作为 rollout 生成引擎，含 3D-HybridEngine 高效权重 resharding
- **多模态 RL**：支持视觉语言模型（VLM）多模态 RL（Qwen2.5-VL、Kimi-VL 等）
- **多轮 Tool Calling**：支持多轮 rollout 与工具调用（Agent Loop）
- **对齐 recipe**：Self-play preference optimization（SPPO）、SPIN、Entropy 机制等
- **效率优化**：Flash Attention 2、sequence packing、DeepSpeed Ulysses 序列并行、Liger-kernel、LoRA
- **大规模能力**：可扩展至 671B 模型、数百 GPU，支持专家并行、多卡 LoRA RL
- **低精度训练**：FP8 RL、NVFP4 QAT 量化感知训练
- **生态兼容**：兼容 HuggingFace Transformers 与 ModelScope Hub
- **硬件广覆盖**：NVIDIA、AMD（ROCm）、华为昇腾（Ascend NPU）
- **实验追踪**：集成 wandb、swanlab、mlflow、tensorboard

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [verl-project/verl](https://github.com/verl-project/verl) |
| 官方文档 | [verl.readthedocs.io](https://verl.readthedocs.io/en/latest/) |
| 安装指南 | [start/install](https://verl.readthedocs.io/en/latest/start/install.html) |
| 快速上手（GSM8K PPO） | [start/quickstart](https://verl.readthedocs.io/en/latest/start/quickstart.html) |
| PPO 算法文档 | [algo/ppo](https://verl.readthedocs.io/en/latest/algo/ppo.html) |
| GRPO 算法文档 | [algo/grpo](https://verl.readthedocs.io/en/latest/algo/grpo.html) |
| 配置说明 | [config](https://verl.readthedocs.io/en/latest/examples/config.html) |
| 算法 recipe 目录 | [recipe/](https://github.com/verl-project/verl/tree/main/recipe) |
| 性能调优指南 | [Performance Tuning](https://verl.readthedocs.io/en/latest/perf/perf_tuning.html) |
| 论文 HybridFlow | [arXiv:2409.19256](https://arxiv.org/abs/2409.19256) |

## ModelScope 集成

verl 通过环境变量 `VERL_USE_MODELSCOPE` 控制模型下载源，启用后从 ModelScope 下载。机制是在导入时调用 ModelScope 的 `patch_hub()`，对 HuggingFace `huggingface_hub` 做猴子补丁，把模型下载重定向到 ModelScope。

- **环境变量**：`VERL_USE_MODELSCOPE`，取值为字符串 `True`（大小写不敏感），默认 `False`
- **依赖要求**：需安装 `modelscope`（未安装会抛 ImportError 提示 `pip install modelscope -U`）
- **覆盖能力**：模型下载（`AutoModel.from_pretrained` / `AutoTokenizer` / `AutoConfig` 被 patch）、部分数据集下载
- **版本敏感**：该集成依赖 `modelscope.utils.hf_util.patch_hub`，该模块在较旧的 modelscope（如 v1.18.0/v1.20.1）中存在，但在 modelscope v1.23.0 及之后版本中已被移除/重命名，因此需配合 verl 兼容的 modelscope 版本使用

## 接入流程

### 安装

verl 推荐使用 Docker 镜像安装，也支持 pip / uv：

**方式一：Docker（推荐）**

```bash
# 基础镜像 + 应用镜像
docker pull verl-base:latest
docker pull verl:latest
# 或从 Dockerfile 构建，参见 docs/start/install.html
```

**方式二：pip**

```bash
pip install verl
# 或从源码
git clone https://github.com/verl-project/verl.git
cd verl
pip install -e .
```

**方式三：uv（推荐用于自定义环境）**

```bash
pip install uv
uv sync
```

使用 ModelScope 集成需额外安装：

```bash
pip install modelscope
```

> 详细安装指南（含 AMD ROCm、昇腾 NPU、backend 组合等）参见[官方安装文档](https://verl.readthedocs.io/en/latest/start/install.html)。

### 准备数据集

以 GSM8K（小学数学题）为例，verl 需要先将数据预处理为 parquet 格式：

```bash
python3 examples/data_preprocess/gsm8k.py --local_save_dir ~/data/gsm8k
```

GSM8K 使用基于规则的可验证奖励（rule-based reward）：模型输出答案后，用正则提取最终答案，正确给 1 分、错误给 0 分、无答案给 0 分。

### 使用 ModelScope 模型跑 PPO

设置环境变量，使 verl 从 ModelScope 下载模型：

```bash
export VERL_USE_MODELSCOPE=True
```

用 ModelScope 上的模型 ID 跑 PPO 训练（模型 ID 用 ModelScope/HF 上同名的 ID，patch 后会重定向到 ModelScope）。以下为 GSM8K 上的完整示例：

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

> - `actor_rollout_ref.model.path` 和 `critic.model.path` 指向 ModelScope 上的模型 ID（与 HF 同名，patch 后重定向到 ModelScope）
> - `trainer.test_freq` 控制多久在验证集上计算一次（关键指标 `val/test_score/openai/gsm8k`）
> - 最低需要一张 24GB 显存的 GPU

**切换 RL 算法**：verl 支持通过配置切换 PPO / GRPO / REINFORCE++ / RLOO / ReMax / GSPO / DAPO 等，详见 [算法文档](https://verl.readthedocs.io/en/latest/examples/config.html#algorithm) 和 [recipe 目录](https://github.com/verl-project/verl/tree/main/recipe)。

### 监督微调（SFT）

verl 也支持 SFT 训练，可先 SFT 再 RL。SFT 相关示例在 `examples/sft/` 目录：

```bash
# SFT 示例（以 Qwen2.5-0.5B + GSM8K 为例）
python3 -m verl.trainer.main_sft \
    data.train_files=$HOME/data/gsm8k/train.parquet \
    data.val_files=$HOME/data/gsm8k/test.parquet \
    model.path=Qwen/Qwen2.5-0.5B-Instruct \
    ...
```

> SFT 的详细用法参见 `examples/sft/` 目录和 [SFT Trainer 文档](https://verl.readthedocs.io/en/latest/)。

### 替代方案：预下载 + 本地路径

当 modelscope 版本不含 `hf_util` 或想最稳妥时，可先用 ModelScope CLI 预下载模型，再用本地路径：

```bash
# 预下载模型
modelscope download --model Qwen/Qwen2.5-0.5B-Instruct --local_dir ./models/qwen-0.5b

# 训练时用本地路径，无需 VERL_USE_MODELSCOPE
python3 -m verl.trainer.main_ppo \
    actor_rollout_ref.model.path=./models/qwen-0.5b \
    critic.model.path=./models/qwen-0.5b \
    ...
```

## 注意事项

1. **环境变量取值**：`VERL_USE_MODELSCOPE=True` 用字符串 `true`/`false`（大小写不敏感）
2. **版本兼容**：依赖 `modelscope.utils.hf_util.patch_hub`，该模块在 modelscope v1.23.0+ 被移除，若安装了较新的 modelscope 导致集成失效，建议改用预下载 + 本地路径方案
3. **vLLM rollout**：verl 的 vLLM rollout 引擎内部可能通过 `snapshot_download` 加载权重，该路径的覆盖情况取决于 vLLM 版本，若遇到仍走 HuggingFace 的情况，建议用预下载方案
4. **数据格式**：verl 要求数据预处理为 parquet 格式，使用 `examples/data_preprocess/` 下的脚本生成
5. **算法切换**：PPO/GRPO/REINFORCE++/RLOO/ReMax/GSPO/DAPO 等通过配置切换，详见 [config 文档](https://verl.readthedocs.io/en/latest/examples/config.html#algorithm) 和 [recipe 目录](https://github.com/verl-project/verl/tree/main/recipe)
6. **SFT + RL 流程**：可先做 SFT（`examples/sft/`）再做 RL，GSM8K 完整示例参见官方文档
7. **硬件需求**：PPO 训练最低需一张 24GB 显存 GPU；大规模训练（671B）需数百 GPU
8. **仓库迁移**：原 `volcengine/verl` 已迁移至 `verl-project/verl`，旧地址仍可重定向访问
