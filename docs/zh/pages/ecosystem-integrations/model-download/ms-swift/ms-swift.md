<!-- modelscope-docs: ms-swift | ecosystem-integrations/model-download/ms-swift/ms-swift_CN.md -->

## 概述

ms-swift（SWIFT，Scalable lightWeight Infrastructure for Fine-Tuning）是魔搭社区官方提供的大模型与多模态大模型微调与部署框架，现已支持 600+ 纯文本大模型与 400+ 多模态大模型的训练（预训练/微调/人类对齐）、推理、评测、量化与部署。文本大模型包括 Qwen3、Qwen3.5、InternLM3、GLM4.5、Mistral、DeepSeek-R1、Llama4 等；多模态大模型包括 Qwen3-VL、Qwen3-Omni、InternVL3.5、MiniCPM-V-4、GLM4.5-V、DeepSeek-VL2 等。

ms-swift 还汇集了最新的训练技术：集成 Megatron 并行技术（TP/PP/CP/EP）为训练加速，以及众多 GRPO 算法族强化学习算法（GRPO、DAPO、GSPO、SAPO、CISPO、RLOO、Reinforce++ 等）提升模型智能。同时支持 DPO、KTO、RM、CPO、SimPO、ORPO 等偏好学习算法，以及 Embedding、Reranker、序列分类任务。

作为 ModelScope 自有框架，ms-swift 默认即以 ModelScope 作为模型和数据集的下载来源，无需额外配置，通过 `--use_hf true` 可切换到 HuggingFace。

核心特性：

- **模型类型**：支持 600+ 纯文本大模型、400+ 多模态大模型，热门模型 Day-0 支持
- **数据集类型**：内置 150+ 预训练/微调/人类对齐/多模态任务数据集，支持自定义数据集，一键训练
- **硬件支持**：A10/A100/H100、RTX 系列、T4/V100、CPU、MPS 及国产硬件 Ascend NPU
- **轻量训练**：LoRA、QLoRA、DoRA、LoRA+、LLaMAPro、LongLoRA、LoRA-GA、ReFT、RS-LoRA、Adapter、LISA 等
- **量化训练**：支持对 BNB/AWQ/GPTQ/AQLM/HQQ/EETQ 量化模型训练，7B 模型训练只需 9GB
- **显存优化**：GaLore、Q-Galore、UnSloth、Liger-Kernel、Flash-Attention 2/3 及 Ulysses/Ring-Attention 序列并行
- **分布式训练**：DDP、device_map、DeepSpeed ZeRO2/ZeRO3、FSDP/FSDP2、Megatron
- **多模态训练**：多模态 packing 技术提升 100%+ 速度，支持文本/图像/视频/语音混合模态，可单独控制 vit/aligner/llm
- **强化学习**：内置丰富 GRPO 族算法，支持同步/异步 vLLM 推理加速，可插件拓展奖励函数、多轮推理调度器及环境
- **Megatron 并行**：TP/PP/SP/CP/ETP/EP/VPP 并行策略，显著提升 MoE 模型训练速度
- **全链路能力**：训练、推理、评测、量化、部署全流程；提供 Web-UI 界面化操作
- **推理加速**：Transformers、vLLM、SGLang、LMDeploy 引擎，提供 OpenAI 接口
- **模型量化**：AWQ、GPTQ、FP8、BNB 量化导出，导出模型支持 vLLM/SGLang/LMDeploy 推理

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [modelscope/ms-swift](https://github.com/modelscope/ms-swift) |
| 官方文档（中文） | [swift.readthedocs.io/zh-cn/latest](https://swift.readthedocs.io/zh-cn/latest/) |
| 安装文档 | [SWIFT安装](https://swift.readthedocs.io/zh-cn/latest/GetStarted/SWIFT-installation.html) |
| 快速开始 | [Quick-start](https://swift.readthedocs.io/zh-cn/latest/GetStarted/Quick-start.html) |
| Web-UI 文档 | [Web-UI](https://swift.readthedocs.io/zh-cn/latest/GetStarted/Web-UI.html) |
| 命令行参数 | [Command-line-parameters](https://swift.readthedocs.io/zh-cn/latest/Instruction/Command-line-parameters.html) |
| 支持的模型与数据集 | [Supported-models-and-datasets](https://swift.readthedocs.io/en/latest/Instruction/Supported-models-and-datasets.html) |
| 示例脚本 | [examples 目录](https://github.com/modelscope/ms-swift/tree/main/examples) |
| 论文 | [arXiv:2408.05517](https://arxiv.org/abs/2408.05517) |

## ModelScope 集成

ms-swift 是 ModelScope 自有框架，**默认使用 ModelScope 下载模型和数据集**，无需任何环境变量。通过 `--use_hf` 参数控制下载源：

- `--use_hf false`（默认）：从 ModelScope 下载模型、数据集，并向 ModelScope Hub 推送模型
- `--use_hf true`：改用 HuggingFace

模型与数据集直接使用 ModelScope 的 model id / dataset id，如 `--model Qwen/Qwen3-4B-Instruct-2507`、`--dataset AI-ModelScope/alpaca-gpt4-data-zh`。底层依赖 `modelscope` SDK。

相关环境变量：

- `MODELSCOPE_DOMAIN`：切换 ModelScope 站点（设为 `www.modelscope.ai` 用国际站，默认 `modelscope.cn` 为国内站）
- `MODELSCOPE_CACHE`：控制 ModelScope 资源缓存路径
- `--hub_token` / `--hub_model_id`：ModelScope SDK 认证 token 与目标模型 id

## 接入流程

### 安装

**Wheel 包安装**（推荐）：

```bash
# 基础安装
pip install 'ms-swift' -U
# 额外安装 megatron 依赖
pip install 'ms-swift[megatron]' -U
# 额外安装评测依赖
pip install 'ms-swift[eval]' -U
# 全能力
pip install 'ms-swift[all]' -U

# 使用 uv（更快）
pip install uv
uv pip install 'ms-swift' --torch-backend=auto
```

**源代码安装**：

```bash
git clone https://github.com/modelscope/ms-swift.git
cd ms-swift
pip install -e .
# 全能力
# pip install -e '.[all]'
```

**Docker 镜像**：

```bash
# swift4.4.3（含 CUDA 13.0 + PyTorch 2.11 + vLLM 0.25.1 + modelscope 1.39.0）
docker pull modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:\
ubuntu22.04-cuda13.0.3-py312-torch2.11.0-vllm0.25.1-modelscope1.39.0-swift4.4.3
```

### LoRA 微调（默认从 ModelScope 下载）

10 分钟在单卡 3090 上对 Qwen3-4B-Instruct-2507 进行自我认知微调（约 13GB 显存），模型与数据集均来自 ModelScope：

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

> - 数据集名后的 `#500` 表示取前 500 条
> - 使用自定义数据集时，参考[自定义数据集格式](https://swift.readthedocs.io/zh-cn/latest/Customization/Custom-dataset.html)，通过 `--dataset <dataset_path>` 指定
> - `--model_author` 和 `--model_name` 仅在数据集包含 `swift/self-cognition` 时生效
> - 切换其他模型只需修改 `--model <model_id/model_path>`；默认使用 ModelScope 下载，如需 HuggingFace 加 `--use_hf true`

### 推理

训练完成后，使用训练得到的 LoRA 权重推理。`--adapters` 需替换为训练生成的 checkpoint 文件夹——由于其中包含参数文件 `args.json`，swift 会自动读取 `--model`、`--system` 等参数，无需重复指定（关闭此行为可设 `--load_args false`）：

```bash
# 交互式命令行推理
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --stream true \
    --temperature 0 \
    --max_new_tokens 2048

# merge-lora 并使用 vLLM 推理加速
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

### 部署为 OpenAI 兼容服务

```bash
CUDA_VISIBLE_DEVICES=0 swift deploy \
    --model Qwen/Qwen3-4B-Instruct-2507 \
    --infer_backend vllm
```

### Web-UI 界面化训练与推理

ms-swift 提供图形化 Web-UI，支持界面化训练、推理、评测和量化，参数支持与命令行一致：

```bash
# 中文界面
swift web-ui --lang zh
# 英文界面
swift web-ui --lang en
```

> macOS 用户注意：系统自带的 Apple Swift 编译器（`/usr/bin/swift`）可能与 ms-swift 的 `swift` 命令冲突，报 `unable to invoke subcommand: swift-web-ui`。解决方式：用完整路径 `/opt/anaconda3/bin/swift web-ui --lang zh`，或在 `~/.zshrc` 中 `export PATH="/opt/anaconda3/bin:$PATH"` 使 conda 的 bin 优先。

Web-UI 是命令行的高级封装，界面上的每个超参数都带 `--xxx` 标记，与命令行参数一一对应。启动后浏览器打开，顶部有 **7 个功能标签页**：

| 标签页 | 功能 |
|--------|------|
| **LLM预训练/微调** | SFT/预训练任务，配置模型、数据集、超参数并启动训练 |
| **LLM人类对齐** | DPO/KTO/RM/CPO/SimPO/ORPO 等偏好学习训练 |
| **LLM GRPO** | GRPO/DAPO/GSPO 等强化学习训练 |
| **LLM推理** | 加载模型进行对话推理测试 |
| **LLM导出** | 合并 LoRA、量化导出、推送 Hub |
| **LLM评测** | 以 EvalScope 为后端对模型评测 |
| **LLM采样** | 对模型输出进行采样 |

以 **LLM预训练/微调** 标签页为例，可配置模型 ID 或路径、数据集、训练参数（训练 batch size、验证 batch size、学习率、交叉验证步数、数据集迭代轮次、梯度累计步数、Flash Attention 类型、NEFTune 噪声系数、存储步数、存储目录等），以及训练方式、训练精度、数据并行、LoRA 参数、量化等：

![ms-swift WebUI：LLM预训练/微调标签页（模型 ID、数据集、训练参数配置）](../_resources/ms-swift-1.png)

超参数设置和运行状态通过下方的折叠面板展开。**运行时**区域提供以下操作：

- **展示运行命令**：查看当前配置对应的完整 `swift sft` 命令行，可保存为 sh 脚本
- **展示运行状态**：实时查看运行日志与训练图表
- **打开 TensorBoard**：启动 TensorBoard 可视化
- **找回运行时任务**：重新启动 Web-UI 后找回正在运行的后台任务
- **杀死任务**：终止指定的后台训练进程

训练图表包含 train/loss、train/acc、train/learning_rate、eval/loss、eval/acc 等指标（人类对齐任务则为 train/rewards/accuracies、train/rewards/margins、train/logps 等）：

![ms-swift WebUI：超参数设置与运行时（训练图表、运行命令/状态/TensorBoard）](../_resources/ms-swift-2.png)

主要特性：

- **独立进程**：界面启动的训练/部署任务在系统中以独立进程运行，关闭 Web-UI 不影响后台训练
- **多任务并行**：一台多卡机器上可并行启动多个训练/部署任务
- **界面推理**：还支持纯推理的 Space 部署模式

> 注意：Web-UI 不支持 PPO 训练（流程较复杂，建议用 [examples](https://github.com/modelscope/ms-swift/tree/main/examples) 的 shell 脚本运行）。需要公网分享时加 `--share true`（DSW/Notebook 环境慎用）。

**纯推理 Space 部署**（只有推理页面）：

```bash
swift app --model '<model>' --studio_title My-Awesome-Space --stream true
# 或加载 adapters
swift app --model '<model>' --adapters '<adapter>' --stream true
```

### 推送模型回 ModelScope Hub

```bash
CUDA_VISIBLE_DEVICES=0 \
swift export --push_to_hub true \
    --adapters output/vx-xxx/checkpoint-xxx \
    --hub_model_id '<your-model-id>' \
    --hub_token '<your-token>' \
    --use_hf false
```

## 注意事项

1. **默认即 ModelScope**：无需设置任何环境变量，`--use_hf` 默认为 `false` 即走 ModelScope；若需 HuggingFace 才加 `--use_hf true`
2. **安装 extras**：基础 `pip install ms-swift` 即可使用；需要 Megatron 并行加 `[megatron]`、评测加 `[eval]`、全能力加 `[all]`
3. **Web-UI**：`swift web-ui --lang zh` 启动，是命令行的高级封装，每个参数带 `--xxx` 标记与命令行对应；不支持 PPO 训练，需用 shell 脚本
4. **国际站**：海外用户可设 `MODELSCOPE_DOMAIN='www.modelscope.ai'` 切换到 ModelScope 国际站
5. **模型 ID 格式**：使用 ModelScope 上的 model id（如 `Qwen/Qwen3-4B-Instruct-2507`），可在 [modelscope.cn/models](https://modelscope.cn/models) 查找
6. **缓存路径**：可通过 `MODELSCOPE_CACHE` 环境变量自定义缓存位置
7. **推理自动读参**：`--adapters` 指向的 checkpoint 文件夹含 `args.json`，swift 会自动读取模型/系统参数，无需重复指定 `--model`；关闭可设 `--load_args false`
