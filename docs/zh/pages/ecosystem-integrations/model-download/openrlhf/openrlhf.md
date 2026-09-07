<!-- modelscope-docs: OpenRLHF | ecosystem-integrations/model-download/openrlhf/openrlhf_CN.md -->

## 概述

OpenRLHF 是**首个**高性能、生产就绪的开源 RLHF 框架，结合 **Ray + vLLM 分布式架构**与**统一的 Agent 设计范式**，支持可扩展的强化学习训练。可扩展至 70B+ 模型规模，vLLM 加速消除生成瓶颈，DeepSpeed ZeRO-3 直接从 HuggingFace 检查点训练，无需模型转换。

核心特性：

- **Ray + vLLM 分布式架构**：Ray + vLLM + DeepSpeed 基础设施，vLLM 加速生成消除 RLHF 主要瓶颈，ZeRO-3 直接训练 HF 检查点
- **统一的 Agent 执行范式**：token-in-token-out 流水线，将执行模式（单轮/多轮）与 RL 算法解耦，任意算法搭配任意模式
- **最先进的 RL 算法**：PPO、REINFORCE++、REINFORCE++-baseline、GRPO、Dr. GRPO、RLOO，一个 flag 切换
- **完整训练流水线**：SFT、奖励模型训练、DPO/IPO/cDPO 偏好学习、RL 训练全阶段
- **单轮/多轮 Agent**：单轮模式（99% 场景）支持自定义 reward 函数；多轮模式支持与环境反馈的多步交互
- **效率优化**：样本打包（`--ds.packing_samples`）、vLLM 生成加速、混合引擎（Hybrid Engine）最大化 GPU 利用率、异步训练流水线
- **模型支持**：VLM 视觉语言模型、LoRA/QLoRA、MoE 专家混合、FlashAttention
- **高级优化器**：AdamW（默认）与 Muon（DeepSpeed ≥ 0.18.2，2D 权重专用）
- **可扩展性**：DeepSpeed AutoTP 张量并行、RingAttention 长上下文、SLURM 多节点
- **生产特性**：Wandb/TensorBoard 日志、检查点恢复、基于评估指标保存最佳检查点、多进程数据加载

RL 算法对比：

| 算法 | `--algo.advantage.estimator` | 关键特性 | 最佳用例 |
|------|------|------|------|
| **PPO** | （默认） | 完整 critic 网络 | 稳定训练，成熟结果 |
| **REINFORCE++** | `reinforce` | 无 critic 的 PPO 技巧 | 高效训练，更少内存 |
| **REINFORCE++-baseline** | `reinforce_baseline` | 均值奖励基线 | 推理任务（RLVR），对奖励尺度鲁棒 |
| **RLOO** | `rloo` | Per-token KL + PPO-clip | 多样本训练 |
| **GRPO** | `group_norm` | 组归一化 | 基于批次的训练 |
| **Dr. GRPO** | `dr_grpo` | 简化的 GRPO | 移除局部 `/std` 归一化 |

训练方法支持：

| 方法 | CLI 入口 | 说明 |
|------|------|------|
| **SFT** | `train_sft` | 带打包的监督微调 |
| **DPO/IPO/cDPO** | `train_dpo` | 直接偏好优化 |
| **奖励模型** | `train_rm` | 训练奖励模型 |
| **PPO/REINFORCE++/GRPO/RLOO** | `train_ppo_ray` | 基于 Ray + vLLM 的 RL 训练 |

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [openrlhf/openrlhf](https://github.com/openrlhf/openrlhf) |
| README（中文） | [README_zh.md](https://github.com/openrlhf/openrlhf/blob/main/README_zh.md) |
| 官方文档 | [openrlhf.readthedocs.io](https://openrlhf.readthedocs.io/en/latest/) |
| 快速开始 | [Quick Start](https://openrlhf.readthedocs.io/en/latest/Getting-Started/Quick-Start.html) |
| 示例脚本 | [examples/scripts](https://github.com/openrlhf/openrlhf/tree/main/examples/scripts) |
| RL 最佳实践 | [Notion](https://hijkzzz.notion.site/rlhf-implementation-tricks?v=158d9a33ecc98132bf9e000c39227361) |
| 技术报告 | [ResearchGate](https://www.researchgate.net/publication/393414545) |

## ModelScope 集成

OpenRLHF 通过 CLI flag `--use_ms` 控制模型和数据集的下载源，启用后从 ModelScope 下载。机制与 vLLM 类似，调用 ModelScope 的 `patch_hub()` 把 HuggingFace Hub 下载重定向到 ModelScope，并通过 `MsDataset.load()` 加载数据集。

- **CLI flag**：`--use_ms`（在所有训练入口可用：`train_sft`、`train_dpo`、`train_rm`、`train_ppo_ray`、`serve_rm`）
- **模型下载**：`--use_ms` 触发 `patch_hub()`，使 `model_name_or_path` 指向的 ModelScope 模型 ID 从 ModelScope 拉取权重
- **数据集下载**：`--use_ms` 时，`--data.dataset` 传 `namespace/dataset_name` 格式，由 `MsDataset.load()` 从 ModelScope 加载
- **依赖要求**：`modelscope` 不在 OpenRLHF 默认依赖中，使用 `--use_ms` 前需手动 `pip install modelscope`

> 该 flag 为源码层面支持的隐藏 flag，官方文档与 README 未明确记录。

## 接入流程

### 安装

**推荐**：使用 Docker（基于 NVIDIA PyTorch 镜像）：

```bash
# 1. 启动 Docker 容器
docker run --runtime=nvidia -it --rm --shm-size="10g" --cap-add=SYS_ADMIN \
  -v $PWD:/openrlhf nvcr.io/nvidia/pytorch:26.03-py3 bash

# 2. 清理冲突包
sudo pip uninstall xgboost transformer_engine flash_attn pynvml -y

# 3. 安装 OpenRLHF（选择一个）
pip install openrlhf                    # 基础
pip install openrlhf[vllm]              # + vLLM 0.27.1（推荐）
pip install openrlhf[vllm_latest]       # + 最新 vLLM
pip install openrlhf[vllm,ring,liger]   # + 所有优化
```

从源码安装：

```bash
git clone https://github.com/openrlhf/openrlhf.git
cd OpenRLHF
pip install -e .
```

使用 ModelScope 集成需额外安装：

```bash
pip install modelscope
```

> 推荐使用 vLLM 0.27.1+ 以获得最佳性能。

### 使用 ModelScope 模型做 SFT

加 `--use_ms`，模型和数据集 ID 填 ModelScope 上的：

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

### 使用 ModelScope 模型做 RL 训练（PPO/REINFORCE++）

RL 训练基于 Ray + vLLM，先启动 Ray 主节点，再用 `train_ppo_ray`：

```bash
# 启动 Ray 主节点
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

切换 RL 算法（所有算法都使用单轮 Agent 执行）：

```bash
# REINFORCE++（推荐用于 RLVR 推理任务）
--algo.advantage.estimator reinforce_baseline

# GRPO
--algo.advantage.estimator group_norm

# RLOO
--algo.advantage.estimator rloo

# Dr. GRPO
--algo.advantage.estimator dr_grpo
```

高级 RL 选项：

```bash
--algo.kl.init_coef 0                      # 无参考模型
--reward.remote_url http://host:5000/get_reward   # 自定义 HTTP 奖励模型
--rollout.n_samples_per_prompt 4                  # 每个提示多个样本
--actor.policy_loss_type gspo                     # 使用 GSPO 策略损失变体
--algo.dynamic_filtering_enable                   # DAPO 动态过滤
```

DPO / RM 训练同理，把入口换成 `openrlhf.cli.train_dpo` / `train_rm` 并加 `--use_ms`。

### 替代方案：预下载 + 本地路径

若不使用 `--use_ms`，可先用 ModelScope CLI 预下载模型到本地，再传本地路径：

```bash
# 预下载模型
modelscope download --model LLM-Research/Meta-Llama-3-8B --local_dir ./llama3-8b

# 训练时直接用本地路径，不加 --use_ms
deepspeed --module openrlhf.cli.train_sft \
   --model.model_name_or_path ./llama3-8b \
   --data.dataset /path/to/local/orca.jsonl \
   ...
```

## 注意事项

1. **手动安装 modelscope**：OpenRLHF 默认依赖不含 `modelscope`，使用 `--use_ms` 前必须先 `pip install modelscope`，否则 ImportError
2. **数据集格式**：`--data.dataset` 需传 `namespace/dataset_name` 格式（如 `AI-ModelScope/OpenOrca`）才会走 ModelScope
3. **本地文件优先**：若 dataset 路径是本地 `.json/.jsonl/.csv/.parquet` 文件，会直接用本地，不触发 ModelScope 下载
4. **所有入口可用**：`--use_ms` 在 SFT/DPO/RM/PPO/serve_rm 全部训练入口都支持
5. **RLVR 推理任务**：推荐用 `--algo.advantage.estimator reinforce_baseline`（REINFORCE++-baseline），对奖励尺度鲁棒
6. **算法切换**：PPO/REINFORCE++/GRPO/RLOO/Dr.GRPO 通过 `--algo.advantage.estimator` 一个 flag 切换，与执行模式（单轮/多轮）正交
7. **Ray 环境**：RL 训练需先启动 Ray 主节点（`ray start --head`），多节点用 `ray start --address {MASTER}:6379` 加入
8. **Docker 推荐**：生产环境推荐用 Docker（NVIDIA PyTorch 镜像）安装，避免依赖冲突
