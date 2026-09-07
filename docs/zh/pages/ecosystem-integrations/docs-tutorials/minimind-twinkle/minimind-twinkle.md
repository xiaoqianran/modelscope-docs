<!-- modelscope-docs: minimind + Twinkle | ecosystem-integrations/docs-tutorials/minimind-twinkle/minimind-twinkle_CN.md -->

## 概述

minimind 是从 0 开始训练小语言模型的开源项目，由 jingyaogong 创建。项目目标是让普通个人 GPU 也能完成 LLM 的训练和复现——最低只需 3 块钱的 GPU 租用成本和 2 小时训练时间，即可体验从 Pretrain 到 SFT 的完整链路。

这不是一个"微调现有大模型"的项目，而是从 Pretrain 到 RLHF 的全链路从零实现。所有核心算法都用 PyTorch 原生编写，不依赖 `transformers`/`trl`/`peft` 等框架的高层封装，代码可读、可理解、可扩展。

覆盖的完整训练链路：Pretrain（预训练）、SFT（监督微调）、LoRA、RLHF-DPO、RLAIF（PPO/GRPO/CISPO）、Agentic RL、Tool Use、自适应思考、模型蒸馏。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [jingyaogong/minimind](https://github.com/jingyaogong/minimind) |
| ModelScope 模型 | [gongjy/minimind-3](https://www.modelscope.cn/models/gongjy/minimind-3) |
| ModelScope 数据集 | [gongjy/minimind_dataset](https://www.modelscope.cn/datasets/gongjy/minimind_dataset/files) |
| 在线体验 | [ModelScope 创空间](https://www.modelscope.cn/studios/gongjy/minimind) |

## 本地训练方式

minimind 的训练需要本地 GPU 资源（推荐单卡 3090 及以上）。快速复现路径：

1. 下载 `pretrain_t2t_mini.jsonl` + `sft_t2t_mini.jsonl` 两个数据集（从 ModelScope 获取）
2. 运行预训练：

```bash
cd trainer && python train_pretrain.py
```

3. 运行指令微调：

```bash
cd trainer && python train_full_sft.py
```

4. 后续可按需选择 LoRA、DPO、GRPO 等进阶训练

所有训练脚本支持断点续训（`--from_resume 1`），支持 wandb/swanlab 可视化。

## Twinkle 线上训练（无需本地 GPU）

minimind 的训练虽然成本很低，但仍然需要 GPU。对于没有 GPU 的初学者，想要体验模型训练过程、理解训练机制，可借助 Twinkle 的线上训练服务。

Twinkle 是 ModelScope 开源的轻量级大模型训练框架，支持 torchrun / Ray / HTTP 多种运行模式，兼容 Transformers 和 Megatron 后端。Twinkle 在 ModelScope 上提供 **Serverless 训练服务（Training as a Service）**，不需要本地 GPU，通过 API 即可远程完成模型训练。

- Twinkle 仓库：[modelscope/twinkle](https://github.com/modelscope/twinkle)
- Twinkle 文档：[modelscope.github.io/twinkle-web](https://modelscope.github.io/twinkle-web/)
- Twinkle 组织：[modelscope.cn/organization/twinkle-kit](https://www.modelscope.cn/organization/twinkle-kit)

> **注意**：Twinkle 的 Serverless 训练服务目前以 Qwen3.6-27B 作为训练基座，支持对该模型进行 LoRA 微调。它不是用来训练 minimind 的自定义 64M 模型的，而是让初学者在没有本地 GPU 的情况下，通过线上服务体验模型训练过程，理解 forward、backward、optimizer step 等训练机制。

## Twinkle 线上训练流程

### 1. 安装

```bash
pip install twinkle-kit
```

或者使用一键安装脚本（会创建 `twinkle-client` 虚拟环境）：

```bash
# Mac / Linux
sh INSTALL_CLIENT.sh

# Windows (PowerShell)
.\INSTALL_CLIENT.ps1
```

### 2. 通过 Tinker 兼容 API 访问 Serverless 训练服务

Twinkle 的 Serverless 端点兼容 Tinker API，通过 `init_tinker_client()` 初始化后，使用 Tinker 的 `ServiceClient` 进行训练：

```python
import os
from tqdm import tqdm
from tinker import types
from twinkle import init_tinker_client
from twinkle.dataloader import DataLoader
from twinkle.dataset import Dataset, DatasetMeta
from twinkle.preprocessor import SelfCognitionProcessor
from twinkle.server.common import input_feature_to_datum

base_model = 'ms://Qwen/Qwen3.6-27B'
base_url = 'your-base-url'      # 从 Twinkle 文档获取
api_key = 'your-api-key'        # 从 ModelScope 获取

# 加载数据集
dataset = Dataset(dataset_meta=DatasetMeta('ms://swift/self-cognition', data_slice=range(500)))
dataset.set_template('Qwen3_5Template', model_id=base_model, max_length=256)
dataset.map(SelfCognitionProcessor('Twinkle Model', 'ModelScope Team'), load_from_cache_file=False)
dataset.encode(batched=True, load_from_cache_file=False)
dataloader = DataLoader(dataset=dataset, batch_size=8)

# 初始化 Tinker 客户端
init_tinker_client()
from tinker import ServiceClient

service_client = ServiceClient(base_url=base_url, api_key=api_key)
training_client = service_client.create_lora_training_client(
    base_model=base_model[len('ms://'):], rank=16
)

# 训练循环
for epoch in range(3):
    for step, batch in tqdm(enumerate(dataloader)):
        input_datum = [input_feature_to_datum(input_feature) for input_feature in batch]

        fwdbwd_future = training_client.forward_backward(input_datum, "cross_entropy")
        optim_future = training_client.optim_step(types.AdamParams(learning_rate=1e-4))

        fwdbwd_result = fwdbwd_future.result()
        optim_result = optim_future.result()

    training_client.save_state(f"twinkle-lora-{epoch}").result()
```

训练完成后，LoRA 权重会自动推送到 ModelScope 或 HuggingFace 仓库（默认私有）。

### 3. 训练类型

Twinkle 支持的线上训练类型包括：

- **SFT（监督微调）**：使用标注数据训练模型完成特定任务
- **LoRA 微调**：轻量级参数高效微调，多个用户可以共享同一个基座模型并行训练
- **GRPO（强化学习）**：通过奖励函数引导模型生成符合预期的输出
- **DPO（直接偏好优化）**：基于偏好数据的对齐训练
- **GKD（知识蒸馏）**：从大模型蒸馏到小模型

### 4. 本地部署 Twinkle（可选）

如果你有自己的 GPU 服务器，也可以自建 Twinkle 服务，支持更多模型（Qwen 系列、DeepSeek 系列、GLM 系列等）：

```bash
# 安装
pip install twinkle-kit

# 启动 Ray 集群
CUDA_VISIBLE_DEVICES=0,1 ray start --head --port=6379 --num-gpus=2

# 启动 Twinkle Server
twinkle-server launch -c cookbook/client/server/transformer/server_config.yaml
```

自建服务支持多租户训练：多个用户可以共享同一个基座模型，各自训练独立的 LoRA，互不干扰。

## 注意事项

1. **minimind 定位**：面向 LLM 入门与教学，从 0 用 PyTorch 原生实现完整训练链路，需要本地 GPU
2. **Twinkle 定位**：轻量级训练框架，提供 Serverless 训练服务，适合没有本地 GPU 的初学者在线体验训练过程
3. **Serverless 限制**：Twinkle 的 Serverless 端点目前以 Qwen3.6-27B 为训练基座，不支持 minimind 的自定义 64M 模型。如需训练 minimind 模型，仍需本地 GPU 或自建 Twinkle 服务
4. **Issue #764**：向 minimind 项目提交了[教程提案](https://github.com/jingyaogong/minimind/issues/764)，让初学者通过线上服务免费体验训练 API，更好地了解模型机制和训练方法