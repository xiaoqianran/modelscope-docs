<!-- modelscope-docs: OpenRLHF | ecosystem-integrations/model-download/openrlhf/openrlhf_EN.md -->

## Overview

OpenRLHF is the **first** high-performance, production-ready open-source RLHF framework, combining a **Ray + vLLM distributed architecture** with a **unified Agent design paradigm** to support scalable reinforcement learning training. It scales to 70B+ model sizes, uses vLLM acceleration to eliminate the generation bottleneck, and trains directly from HuggingFace checkpoints via DeepSpeed ZeRO-3 with no model conversion required.

Core features:

- **Ray + vLLM distributed architecture**: Ray + vLLM + DeepSpeed infrastructure; vLLM accelerates generation and removes the main RLHF bottleneck; ZeRO-3 trains directly on HF checkpoints
- **Unified Agent execution paradigm**: token-in-token-out pipeline that decouples the execution mode (single-turn/multi-turn) from the RL algorithm, allowing any algorithm to pair with any mode
- **State-of-the-art RL algorithms**: PPO, REINFORCE++, REINFORCE++-baseline, GRPO, Dr. GRPO, RLOO, switchable with a single flag
- **Complete training pipeline**: SFT, reward model training, DPO/IPO/cDPO preference learning, and full RL training stages
- **Single-turn/multi-turn Agent**: single-turn mode (99% of scenarios) supports custom reward functions; multi-turn mode supports multi-step interaction with environment feedback
- **Efficiency optimizations**: sample packing (`--ds.packing_samples`), vLLM generation acceleration, Hybrid Engine to maximize GPU utilization, asynchronous training pipeline
- **Model support**: VLM vision-language models, LoRA/QLoRA, MoE mixture-of-experts, FlashAttention
- **Advanced optimizers**: AdamW (default) and Muon (DeepSpeed ≥ 0.18.2, for 2D weights)
- **Scalability**: DeepSpeed AutoTP tensor parallelism, RingAttention long context, SLURM multi-node
- **Production features**: Wandb/TensorBoard logging, checkpoint recovery, best-checkpoint saving based on evaluation metrics, multi-process data loading

RL algorithm comparison:

| Algorithm | `--algo.advantage.estimator` | Key Feature | Best Use Case |
|------|------|------|------|
| **PPO** | (default) | Full critic network | Stable training, mature results |
| **REINFORCE++** | `reinforce` | PPO tricks without a critic | Efficient training, less memory |
| **REINFORCE++-baseline** | `reinforce_baseline` | Mean-reward baseline | Reasoning tasks (RLVR), robust to reward scale |
| **RLOO** | `rloo` | Per-token KL + PPO-clip | Multi-sample training |
| **GRPO** | `group_norm` | Group normalization | Batch-based training |
| **Dr. GRPO** | `dr_grpo` | Simplified GRPO | Removes local `/std` normalization |

Training method support:

| Method | CLI Entry | Description |
|------|------|------|
| **SFT** | `train_sft` | Supervised fine-tuning with packing |
| **DPO/IPO/cDPO** | `train_dpo` | Direct preference optimization |
| **Reward Model** | `train_rm` | Train a reward model |
| **PPO/REINFORCE++/GRPO/RLOO** | `train_ppo_ray` | Ray + vLLM-based RL training |

## Resources

| Resource | URL |
|------|------|
| Repository | [openrlhf/openrlhf](https://github.com/openrlhf/openrlhf) |
| README (Chinese) | [README_zh.md](https://github.com/openrlhf/openrlhf/blob/main/README_zh.md) |
| Official Docs | [openrlhf.readthedocs.io](https://openrlhf.readthedocs.io/en/latest/) |
| Quick Start | [Quick Start](https://openrlhf.readthedocs.io/en/latest/Getting-Started/Quick-Start.html) |
| Example Scripts | [examples/scripts](https://github.com/openrlhf/openrlhf/tree/main/examples/scripts) |
| RL Best Practices | [Notion](https://hijkzzz.notion.site/rlhf-implementation-tricks?v=158d9a33ecc98132bf9e000c39227361) |
| Technical Report | [ResearchGate](https://www.researchgate.net/publication/393414545) |

## ModelScope Integration

OpenRLHF controls the download source of models and datasets via the CLI flag `--use_ms`; when enabled, downloads come from ModelScope. The mechanism is similar to vLLM: it calls ModelScope's `patch_hub()` to redirect HuggingFace Hub downloads to ModelScope, and loads datasets via `MsDataset.load()`.

- **CLI flag**: `--use_ms` (available on all training entries: `train_sft`, `train_dpo`, `train_rm`, `train_ppo_ray`, `serve_rm`)
- **Model download**: `--use_ms` triggers `patch_hub()`, so that the ModelScope model ID pointed to by `model_name_or_path` pulls weights from ModelScope
- **Dataset download**: with `--use_ms`, pass `--data.dataset` in `namespace/dataset_name` format to load it from ModelScope via `MsDataset.load()`
- **Dependency requirement**: `modelscope` is not part of OpenRLHF's default dependencies; run `pip install modelscope` manually before using `--use_ms`

> This flag is a hidden flag supported at the source level and is not explicitly documented in the official docs or README.

## Getting Started

### Installation

**Recommended**: use Docker (based on the NVIDIA PyTorch image):

```bash
# 1. Start the Docker container
docker run --runtime=nvidia -it --rm --shm-size="10g" --cap-add=SYS_ADMIN \
  -v $PWD:/openrlhf nvcr.io/nvidia/pytorch:26.03-py3 bash

# 2. Remove conflicting packages
sudo pip uninstall xgboost transformer_engine flash_attn pynvml -y

# 3. Install OpenRLHF (choose one)
pip install openrlhf                    # Base
pip install openrlhf[vllm]              # + vLLM 0.27.1 (recommended)
pip install openrlhf[vllm_latest]       # + latest vLLM
pip install openrlhf[vllm,ring,liger]   # + all optimizations
```

Install from source:

```bash
git clone https://github.com/openrlhf/openrlhf.git
cd OpenRLHF
pip install -e .
```

To use the ModelScope integration, additionally install:

```bash
pip install modelscope
```

> vLLM 0.27.1+ is recommended for best performance.

### SFT with ModelScope Models

Add `--use_ms` and fill in the model and dataset IDs available on ModelScope:

```bash
deepspeed --module openrlhf.cli.train_sft \
   --use_ms \
   --data.max_len 2048 \
   --data.dataset AI-ModelScope/OpenOrca \
   --data.input_key question \
   --data.output_key response \
   --train.batch_size 256 \
   --train.micro_batch_size 2 \
   --data.max_samples 500000 \
   --model.model_name_or_path LLM-Research/Meta-Llama-3-8B \
   --ckpt.output_dir ./checkpoint/llama3-8b-sft-ms \
   --ckpt.save_steps -1 \
   --logger.logging_steps 1 \
   --eval.steps -1 \
   --ds.zero_stage 2 \
   --train.max_epochs 1 \
   --ds.param_dtype bf16 \
   --ds.attn_implementation flash_attention_2 \
   --adam.lr 5e-6 \
   --ckpt.load_enable \
   --ds.packing_samples \
   --model.gradient_checkpointing_enable
```

### RL Training (PPO/REINFORCE++) with ModelScope Models

RL training is based on Ray + vLLM: first start the Ray head node, then run `train_ppo_ray`:

```bash
# Start the Ray head node
ray start --head --node-ip-address 0.0.0.0 --num-gpus 8

ray job submit --address="http://127.0.0.1:8265" \
   --runtime-env-json='{"working_dir": "."}' \
   -- python3 -m openrlhf.cli.train_ppo_ray \
   --use_ms \
   --ref.num_nodes 1 --ref.num_gpus_per_node 8 \
   --reward.num_nodes 1 --reward.num_gpus_per_node 8 \
   --critic.num_nodes 1 --critic.num_gpus_per_node 8 \
   --actor.num_nodes 1 --actor.num_gpus_per_node 8 \
   --vllm.num_engines 4 \
   --vllm.tensor_parallel_size 2 \
   --train.colocate_all \
   --vllm.gpu_memory_utilization 0.5 \
   --actor.model_name_or_path LLM-Research/Meta-Llama-3-8B \
   --reward.model_name_or_path LLM-Research/Llama-3-8b-rm \
   --ckpt.output_dir ./checkpoint/llama3-8b-rlhf-ms \
   --train.batch_size 128 \
   --rollout.batch_size 1024 \
   --train.max_epochs 1 \
   --prompt_max_len 1024 \
   --generate_max_len 1024 \
   --ds.zero_stage 3 \
   --ds.param_dtype bf16 \
   --actor.adam.lr 5e-7 \
   --critic.adam.lr 9e-6 \
   --algo.kl.init_coef 0.01 \
   --data.prompt_dataset AI-ModelScope/prompt-collection \
   --data.input_key context_messages \
   --data.apply_chat_template \
   --actor.gradient_checkpointing_enable \
   --ds.packing_samples \
   --vllm.enforce_eager \
   --vllm.enable_sleep \
   --ds.enable_sleep
```

Switch RL algorithms (all algorithms use the single-turn Agent execution):

```bash
# REINFORCE++ (recommended for RLVR reasoning tasks)
--algo.advantage.estimator reinforce_baseline

# GRPO
--algo.advantage.estimator group_norm

# RLOO
--algo.advantage.estimator rloo

# Dr. GRPO
--algo.advantage.estimator dr_grpo
```

Advanced RL options:

```bash
--algo.kl.init_coef 0                      # No reference model
--reward.remote_url http://host:5000/get_reward   # Custom HTTP reward model
--rollout.n_samples_per_prompt 4                  # Multiple samples per prompt
--actor.policy_loss_type gspo                     # Use the GSPO policy loss variant
--algo.dynamic_filtering_enable                   # DAPO dynamic filtering
```

DPO / RM training works the same way: swap the entry to `openrlhf.cli.train_dpo` / `train_rm` and add `--use_ms`.

### Alternative: Pre-download + Local Path

If you do not use `--use_ms`, you can first pre-download the model to a local directory with the ModelScope CLI, then pass the local path:

```bash
# Pre-download the model
modelscope download --model LLM-Research/Meta-Llama-3-8B --local_dir ./llama3-8b

# Use the local path directly during training, without --use_ms
deepspeed --module openrlhf.cli.train_sft \
   --model.model_name_or_path ./llama3-8b \
   --data.dataset /path/to/local/orca.jsonl \
   ...
```

## Notes

1. **Install modelscope manually**: OpenRLHF's default dependencies do not include `modelscope`; you must run `pip install modelscope` before using `--use_ms`, otherwise an ImportError will occur
2. **Dataset format**: `--data.dataset` must be passed in `namespace/dataset_name` format (e.g. `AI-ModelScope/OpenOrca`) to go through ModelScope
3. **Local files take priority**: if the dataset path is a local `.json/.jsonl/.csv/.parquet` file, it is used directly without triggering a ModelScope download
4. **Available on all entries**: `--use_ms` is supported on all training entries: SFT/DPO/RM/PPO/serve_rm
5. **RLVR reasoning tasks**: `--algo.advantage.estimator reinforce_baseline` (REINFORCE++-baseline) is recommended, as it is robust to reward scale
6. **Algorithm switching**: PPO/REINFORCE++/GRPO/RLOO/Dr.GRPO switch via the single flag `--algo.advantage.estimator`, orthogonal to the execution mode (single-turn/multi-turn)
7. **Ray environment**: RL training requires starting the Ray head node first (`ray start --head`); for multi-node, join with `ray start --address {MASTER}:6379`
8. **Docker recommended**: for production environments, install via Docker (NVIDIA PyTorch image) to avoid dependency conflicts
