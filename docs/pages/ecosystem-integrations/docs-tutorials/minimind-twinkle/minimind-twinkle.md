<!-- modelscope-docs: minimind + Twinkle | ecosystem-integrations/docs-tutorials/minimind-twinkle/minimind-twinkle_EN.md -->

## Overview

minimind is an open-source project for training small language models from scratch, created by jingyaogong. The project's goal is to enable ordinary consumer GPUs to complete LLM training and reproduction — with as little as 3 RMB of GPU rental cost and 2 hours of training time, you can experience the complete pipeline from Pretrain to SFT.

This is not a project for "fine-tuning existing large models"; rather, it is a full-pipeline, from-scratch implementation spanning Pretrain to RLHF. All core algorithms are written natively in PyTorch, without relying on high-level wrappers from frameworks such as `transformers`/`trl`/`peft`, making the code readable, understandable, and extensible.

The complete training pipeline covered: Pretrain, SFT (supervised fine-tuning), LoRA, RLHF-DPO, RLAIF (PPO/GRPO/CISPO), Agentic RL, Tool Use, adaptive thinking, and model distillation.

## Resources

| Resource | URL |
|----------|-----|
| Repository | [jingyaogong/minimind](https://github.com/jingyaogong/minimind) |
| ModelScope Model | [gongjy/minimind-3](https://www.modelscope.cn/models/gongjy/minimind-3) |
| ModelScope Dataset | [gongjy/minimind_dataset](https://www.modelscope.cn/datasets/gongjy/minimind_dataset/files) |
| Online Demo | [ModelScope Creation Space](https://www.modelscope.cn/studios/gongjy/minimind) |

## Local Training

Training minimind requires local GPU resources (a single 3090 or above is recommended). The quick reproduction path:

1. Download the two datasets `pretrain_t2t_mini.jsonl` and `sft_t2t_mini.jsonl` (obtained from ModelScope)
2. Run pretraining:

```bash
cd trainer && python train_pretrain.py
```

3. Run instruction fine-tuning:

```bash
cd trainer && python train_full_sft.py
```

4. You may then optionally proceed with advanced training such as LoRA, DPO, GRPO, etc.

All training scripts support resuming from checkpoints (`--from_resume 1`) and support wandb/swanlab visualization.

## Twinkle Online Training (No Local GPU Required)

Although minimind's training cost is very low, it still requires a GPU. For beginners without a GPU who want to experience the model training process and understand the training mechanism, Twinkle's online training service can be used.

Twinkle is a lightweight large model training framework open-sourced by ModelScope. It supports multiple run modes including torchrun / Ray / HTTP, and is compatible with both Transformers and Megatron backends. Twinkle provides a **Serverless training service (Training as a Service)** on ModelScope — no local GPU is needed; model training can be completed remotely via API.

- Twinkle repository: [modelscope/twinkle](https://github.com/modelscope/twinkle)
- Twinkle documentation: [modelscope.github.io/twinkle-web](https://modelscope.github.io/twinkle-web/)
- Twinkle organization: [modelscope.cn/organization/twinkle-kit](https://www.modelscope.cn/organization/twinkle-kit)

> **Note**: Twinkle's Serverless training service currently uses Qwen3.6-27B as the training base model and supports LoRA fine-tuning of this model. It is not intended for training minimind's custom 64M model; rather, it allows beginners without a local GPU to experience the model training process through an online service and understand training mechanisms such as forward, backward, and optimizer step.

## Twinkle Online Training Workflow

### 1. Installation

```bash
pip install twinkle-kit
```

Or use the one-click installation script (which creates a `twinkle-client` virtual environment):

```bash
# Mac / Linux
sh INSTALL_CLIENT.sh

# Windows (PowerShell)
.\INSTALL_CLIENT.ps1
```

### 2. Accessing the Serverless Training Service via the Tinker-Compatible API

Twinkle's Serverless endpoint is compatible with the Tinker API. After initializing with `init_tinker_client()`, use Tinker's `ServiceClient` for training:

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
base_url = 'your-base-url'      # Obtained from the Twinkle documentation
api_key = 'your-api-key'        # Obtained from ModelScope

# Load the dataset
dataset = Dataset(dataset_meta=DatasetMeta('ms://swift/self-cognition', data_slice=range(500)))
dataset.set_template('Qwen3_5Template', model_id=base_model, max_length=256)
dataset.map(SelfCognitionProcessor('Twinkle Model', 'ModelScope Team'), load_from_cache_file=False)
dataset.encode(batched=True, load_from_cache_file=False)
dataloader = DataLoader(dataset=dataset, batch_size=8)

# Initialize the Tinker client
init_tinker_client()
from tinker import ServiceClient

service_client = ServiceClient(base_url=base_url, api_key=api_key)
training_client = service_client.create_lora_training_client(
    base_model=base_model[len('ms://'):], rank=16
)

# Training loop
for epoch in range(3):
    for step, batch in tqdm(enumerate(dataloader)):
        input_datum = [input_feature_to_datum(input_feature) for input_feature in batch]

        fwdbwd_future = training_client.forward_backward(input_datum, "cross_entropy")
        optim_future = training_client.optim_step(types.AdamParams(learning_rate=1e-4))

        fwdbwd_result = fwdbwd_future.result()
        optim_result = optim_future.result()

    training_client.save_state(f"twinkle-lora-{epoch}").result()
```

After training completes, the LoRA weights are automatically pushed to a ModelScope or HuggingFace repository (private by default).

### 3. Training Types

The online training types supported by Twinkle include:

- **SFT (supervised fine-tuning)**: Train the model to complete specific tasks using labeled data
- **LoRA fine-tuning**: Lightweight parameter-efficient fine-tuning; multiple users can share the same base model for parallel training
- **GRPO (reinforcement learning)**: Guide the model to generate outputs that meet expectations through a reward function
- **DPO (direct preference optimization)**: Alignment training based on preference data
- **GKD (knowledge distillation)**: Distill from a large model to a small model

### 4. Self-Hosting Twinkle (Optional)

If you have your own GPU server, you can also self-host a Twinkle service, which supports more models (Qwen series, DeepSeek series, GLM series, etc.):

```bash
# Install
pip install twinkle-kit

# Start the Ray cluster
CUDA_VISIBLE_DEVICES=0,1 ray start --head --port=6379 --num-gpus=2

# Start the Twinkle Server
twinkle-server launch -c cookbook/client/server/transformer/server_config.yaml
```

A self-hosted service supports multi-tenant training: multiple users can share the same base model while each training their own independent LoRA without interfering with one another.

## Notes

1. **Positioning of minimind**: Aimed at LLM introductory learning and teaching, it implements the complete training pipeline from scratch using native PyTorch and requires a local GPU
2. **Positioning of Twinkle**: A lightweight training framework that provides a Serverless training service, suitable for beginners without a local GPU to experience the training process online
3. **Serverless limitations**: Twinkle's Serverless endpoint currently uses Qwen3.6-27B as the training base and does not support minimind's custom 64M model. To train the minimind model, a local GPU or a self-hosted Twinkle service is still required
4. **Issue #764**: A [tutorial proposal](https://github.com/jingyaogong/minimind/issues/764) was submitted to the minimind project, enabling beginners to experience the training API for free through the online service and better understand model mechanisms and training methods
