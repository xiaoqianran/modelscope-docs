<!-- modelscope-docs: Pre-training and Fine-tuning | llm-training-and-inference/user-guide/pretraining-and-finetuning/pretraining-and-finetuning_EN.md -->

# Pre-training and Fine-tuning

Training Capabilities:

| Method | Full Parameter | LoRA | QLoRA | Deepspeed | Multi-node | Multimodal |
| ------ | ------ | ---- | ----- | ------ | ------ | ------ |
| Pre-training | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/pretrain/train.sh) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Instruction Supervised Fine-tuning | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/full/train.sh) | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/lora_sft.sh) | [✅](https://github.com/modelscope/ms-swift/tree/main/examples/train/qlora) | [✅](https://github.com/modelscope/ms-swift/tree/main/examples/train/multi-gpu/deepspeed) | [✅](https://github.com/modelscope/ms-swift/tree/main/examples/train/multi-node) | [✅](https://github.com/modelscope/ms-swift/tree/main/examples/train/multimodal) |
| DPO Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/dpo) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/dpo) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/multimodal/rlhf/dpo) |
| GRPO Training | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/grpo/internal) | ✅ | ✅ | ✅ | [✅](https://github.com/modelscope/ms-swift/tree/main/examples/train/grpo/external) | ✅ |
| Reward Model Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/rm.sh) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/rm.sh) | ✅ | ✅ |
| PPO Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/ppo) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/ppo) | ✅ | ❌ |
| GKD Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/gkd)            | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/gkd) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/multimodal/rlhf/gkd)  |
| KTO Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/kto.sh) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/kto.sh) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/multimodal/rlhf/kto.sh) |
| CPO Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/cpo.sh) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/cpo.sh) | ✅ | ✅ |
| SimPO Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/simpo.sh) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/simpo.sh) | ✅ | ✅ |
| ORPO Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/orpo.sh) | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/rlhf/orpo.sh) | ✅ | ✅ |
| Classification Model Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/seq_cls/qwen2_5/sft.sh) | ✅ | ✅ | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/seq_cls/qwen2_vl/sft.sh) |
| Embedding Model Training | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/embedding/train_gte.sh) | ✅ | ✅ | ✅ | [✅](https://github.com/modelscope/ms-swift/blob/main/examples/train/embedding/train_gme.sh)  |


## Environment Setup
Recommended third-party library versions can be found in the [SWIFT Installation Documentation](../Introduction/SWIFT Installation.md)
```bash
pip install ms-swift -U

# If using deepspeed zero2/zero3
pip install deepspeed -U
```

## Pre-training
Pre-training uses the `swift pt` command, which automatically uses generative templates instead of conversational templates, i.e., sets `use_chat_template` to False (all other commands like `swift sft/rlhf/infer` default to setting `use_chat_template` to True). Additionally, `swift pt` has a different dataset format compared to `swift sft`, which can be referenced in the [Custom Dataset Documentation](../Customization/Custom Datasets.md).

Scripts for pre-training using CLI can be found [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/pretrain/train.sh). For more training techniques, please refer to the fine-tuning section.

Tips:
- `swift pt` is equivalent to `swift sft --use_chat_template false --loss_scale all`.
- `swift pt` typically uses large datasets, so it's recommended to combine with `--streaming` for streaming datasets.

## Fine-tuning

ms-swift uses a layered design philosophy, allowing users to perform fine-tuning via command line interface, Web-UI interface, or directly using Python.

### Using CLI

We provide a best practice example for self-cognition fine-tuning of Qwen2.5-7B-Instruct on a single 3090 GPU within 10 minutes. Please refer to [here](../Introduction/Quick Start.md) to quickly understand SWIFT.

Additionally, we provide a series of scripts to help you understand SWIFT's training capabilities:

- Lightweight Training: Examples of lightweight fine-tuning supported by SWIFT can be found [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/tuners). (Note: These methods can also be used for pre-training, but pre-training typically uses full parameter training).
- Distributed Training: SWIFT supports distributed training technologies including: DDP, device_map, DeepSpeed ZeRO2/ZeRO3, FSDP.
  - device_map: Simple model parallelism. If multiple GPUs are available, device_map will be automatically enabled. This evenly distributes the model across visible GPUs, significantly reducing memory consumption, but usually slows down training speed due to serial processing.
  - DDP+device_map: Performs device_map partitioning by groups, reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/multi-gpu/ddp_device_map/train.sh).
  - DeepSpeed ZeRO2/ZeRO3: Saves memory resources but reduces training speed. ZeRO2 shards optimizer states and model gradients. ZeRO3 adds model parameter sharding on top of ZeRO2, saving even more memory but further slowing training speed. Reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/multi-gpu/deepspeed).
  - FSDP+QLoRA: Training 70B models on two 3090 GPUs, reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/multi-gpu/fsdp_qlora/train.sh).
  - Multi-node Multi-GPU Training: We provide shell script examples for launching multi-node runs using swift, torchrun, dlc, deepspeed, and accelerate. Except for dlc and deepspeed, other launch scripts need to be started on all nodes to run. Reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/multi-node).
- Quantized Training: Supports QLoRA training using quantization techniques like GPTQ, AWQ, AQLM, BNB, HQQ, EETQ. Fine-tuning 7B models requires only 9GB of memory. Reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/qlora).
- Multimodal Training: SWIFT supports pre-training, fine-tuning, and RLHF for multimodal models. Supports Caption, VQA, OCR, [Grounding](https://github.com/modelscope/ms-swift/blob/main/examples/notebook/qwen2_5-vl-grounding/zh.ipynb) tasks. Supports three modalities: image, video, and audio. Reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/multimodal). Multimodal custom dataset format reference [Custom Dataset Documentation](../Customization/Custom Datasets.md).
  - Example of full parameter training for ViT/Aligner and LoRA training for LLM with different learning rates reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/multimodal/lora_llm_full_vit).
  - Multimodal model packing to increase training speed, example reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/packing).
- RLHF Training: Reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/rlhf). Multimodal models reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/multimodal/rlhf). GRPO training reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/grpo/internal). Reinforced fine-tuning reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/rft).
- Megatron Training: Supports using Megatron's parallel technologies to accelerate large model training, including data parallelism, tensor parallelism, pipeline parallelism, sequence parallelism, and context parallelism. Reference [Megatron-SWIFT Training Documentation](./Megatron-SWIFT Training.md).
- Sequence Classification Model Training: Reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/seq_cls).
- Embedding Model Training: Reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/embedding)
- Agent Training: Reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/agent).
- Any-to-Any Model Training: Reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/all_to_all).
- Other Capabilities:
  - Streaming Data Reading: Reduces memory usage when dealing with large datasets. Reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/streaming/train.sh).
  - packing: Combines multiple sequences into one, making each training sample as close to max_length as possible, improving GPU utilization. Reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/packing).
  - Long Text Training: Reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/long_text).
  - lazy tokenize: Tokenizes data during training rather than before training (multimodal models can avoid loading all multimodal resources before training), avoiding preprocessing wait time and saving memory. Reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/lazy_tokenize/train.sh).

Tips:

- When using `swift sft` with LoRA to fine-tune base models into chat models, sometimes you need to manually set the template. Add the `--template default` parameter to avoid issues where base models cannot properly stop due to unseen special characters in conversation templates. Reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/base_to_chat).
- If you need to train in an **offline** environment, please set `--model <model_dir>` and `--check_model false`. If the corresponding model requires `git clone` from GitHub repositories (e.g., `deepseek-ai/Janus-Pro-7B`), please manually download the repository and set `--local_repo_path <repo_dir>`. For specific parameter meanings, please refer to the [Command Line Parameters Documentation](Command Line Parameters.md).
- Models trained with QLoRA cannot be merged with LoRA, so it's not recommended to use QLoRA for fine-tuning if you plan to use vLLM/Sglang/LMDeploy for inference acceleration during inference and deployment. It's recommended to use LoRA/full parameter fine-tuning, merge into complete weights, and then use GPTQ/AWQ/BNB for [quantization](https://github.com/modelscope/ms-swift/tree/main/examples/export/quantize).
- If using NPU for training, simply change `CUDA_VISIBLE_DEVICES` to `ASCEND_RT_VISIBLE_DEVICES` in the shell script.
- SWIFT defaults to setting `--gradient_checkpointing true` during training to save memory, which slightly reduces training speed.
- If using DDP for training and encountering the error: `RuntimeError: Expected to mark a variable ready only once.`, please additionally set the parameter `--gradient_checkpointing_kwargs '{"use_reentrant": false}'` or use DeepSpeed for training.
- If you want to use deepspeed, you need to install deepspeed: `pip install deepspeed -U`. Using deepspeed can save memory but slightly reduce training speed.
- If your machine has high-performance GPUs like A100 and the model supports flash-attn, we recommend installing [flash-attn](https://github.com/Dao-AILab/flash-attention/releases) and setting `--attn_impl flash_attn`, which will speed up training and inference while slightly reducing memory usage.

**How to debug:**

You can use the following method for debugging, which is equivalent to command line fine-tuning but doesn't support distributed training. The fine-tuning command line entry point can be found [here](https://github.com/modelscope/ms-swift/blob/main/swift/cli/sft.py).

```python
from swift.llm import sft_main, TrainArguments
result = sft_main(TrainArguments(
    model='Qwen/Qwen2.5-7B-Instruct',
    train_type='lora',
    dataset=['AI-ModelScope/alpaca-gpt4-data-zh#500',
             'AI-ModelScope/alpaca-gpt4-data-en#500',
             'swift/self-cognition#500'],
    torch_dtype='bfloat16',
    # ...
))
```


### Using Web-UI
If you want to use a GUI for training, please refer to the [Web-UI Documentation](../Introduction/Web-UI.md).

### Using Python

- Qwen2.5 self-cognition fine-tuning notebook reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/notebook/qwen2_5-self-cognition/self-cognition-sft.ipynb).
- Qwen2VL OCR task notebook reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/notebook/qwen2vl-ocr/ocr-sft.ipynb).


## Merge LoRA

- Reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/export/merge_lora.sh).

## Inference (Post-fine-tuning Model)

Using CLI for inference with LoRA-trained checkpoints:
```shell
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --infer_backend pt \
    --stream true \
    --temperature 0 \
    --max_new_tokens 2048
```
- The adapters folder contains the training parameter file `args.json`, so there's no need to specify `--model` or `--system` separately; swift will automatically read these parameters. To disable this behavior, set `--load_args false`.
- For full parameter training, use `--model` instead of `--adapters` to specify the training checkpoint directory. More reference [Inference and Deployment Documentation](./Inference and Deployment.md#Inference).
- You can use `swift app` instead of `swift infer` for GUI inference.
- You can choose to merge LoRA (additionally specify `--merge_lora true`) and then specify `--infer_backend vllm/sglang/lmdeploy` for inference acceleration.

Batch inference on validation sets from datasets:
```shell
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --infer_backend pt \
    --temperature 0 \
    --max_new_tokens 2048 \
    --load_data_args true \
    --max_batch_size 1
```

- You can set `--max_batch_size 8` to enable batch processing with `--infer_backend pt`. If using `infer_backend vllm/sglang/lmdeploy`, no specification is needed as automatic batching will be performed.
- `--load_data_args true` will additionally read data parameters from the training parameter file `args.json`.

For inference on additional test sets instead of the validation set used during training, use `--val_dataset <dataset_path>` for inference:
```shell
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --infer_backend pt \
    --temperature 0 \
    --max_new_tokens 2048 \
    --val_dataset <dataset-path> \
    --max_batch_size 1
```


Python example for inference with trained LoRA:

```python
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '0'

from swift.llm import (
    PtEngine, RequestConfig, safe_snapshot_download, get_model_tokenizer, get_template, InferRequest
)
from swift.tuners import Swift
# Please adjust the following lines
model = 'Qwen/Qwen2.5-7B-Instruct'
lora_checkpoint = safe_snapshot_download('swift/test_lora')  # Change to checkpoint_dir
template_type = None  # None: Use the default template_type for the corresponding model
default_system = "You are a helpful assistant."  # None: Use the default default_system for the corresponding model

# Load model and conversation template
model, tokenizer = get_model_tokenizer(model)
model = Swift.from_pretrained(model, lora_checkpoint)
template_type = template_type or model.model_meta.template
template = get_template(template_type, tokenizer, default_system=default_system)
engine = PtEngine.from_model_template(model, template, max_batch_size=2)
request_config = RequestConfig(max_tokens=512, temperature=0)

# Here we use 2 infer_requests to demonstrate batch inference
infer_requests = [
    InferRequest(messages=[{'role': 'user', 'content': 'who are you?'}]),
    InferRequest(messages=[{'role': 'user', 'content': 'Where is the capital of Zhejiang?'},
                           {'role': 'assistant', 'content': 'Where is the capital of Zhejiang?'},
                           {'role': 'user', 'content': 'What delicious food is there here?'},]),
]
resp_list = engine.infer(infer_requests, request_config)
query0 = infer_requests[0].messages[0]['content']
print(f'response0: {resp_list[0].choices[0].message.content}')
print(f'response1: {resp_list[1].choices[0].message.content}')
```

Multimodal model LoRA inference example:
```python
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '0'

from swift.llm import (
    PtEngine, RequestConfig, safe_snapshot_download, get_model_tokenizer, get_template, InferRequest
)
from swift.tuners import Swift
# Please adjust the following lines
model = 'Qwen/Qwen2.5-VL-7B-Instruct'
lora_checkpoint = safe_snapshot_download('swift/test_grounding')  # Change to checkpoint_dir
template_type = None  # None: Use the default template_type for the corresponding model
default_system = None  # None: Use the default default_system for the corresponding model

# Load model and conversation template
model, tokenizer = get_model_tokenizer(model)
model = Swift.from_pretrained(model, lora_checkpoint)
template_type = template_type or model.model_meta.template
template = get_template(template_type, tokenizer, default_system=default_system)
engine = PtEngine.from_model_template(model, template, max_batch_size=2)
request_config = RequestConfig(max_tokens=512, temperature=0)

# Here we use 2 infer_requests to demonstrate batch inference
infer_requests = [
    InferRequest(messages=[{'role': 'user', 'content': 'who are you?'}]),
    InferRequest(messages=[{'role': 'user', 'content': '<image>Task: Object Detection'}],
                 images=['http://modelscope-open.oss-cn-hangzhou.aliyuncs.com/images/animal.png']),
]
resp_list = engine.infer(infer_requests, request_config)
query0 = infer_requests[0].messages[0]['content']
print(f'response0: {resp_list[0].choices[0].message.content}')
print(f'response1: {resp_list[1].choices[0].message.content}')
```

If using models trained with ms-swift, you can obtain training configurations as follows:
```python
from swift.llm import safe_snapshot_download, BaseArguments

lora_adapters = safe_snapshot_download('swift/test_lora')
args = BaseArguments.from_pretrained(lora_adapters)
print(f'args.model: {args.model}')
print(f'args.model_type: {args.model_type}')
print(f'args.template_type: {args.template}')
print(f'args.default_system: {args.system}')
```

- For inference with full parameter trained checkpoints, set `model` to checkpoint_dir and set lora_checkpoint to None. More reference [Inference and Deployment Documentation](./Inference and Deployment.md#Inference).
- For streaming inference and inference acceleration using `VllmEngine`, `SglangEngine`, `LmdeployEngine`, reference [Large Language Model](https://github.com/modelscope/ms-swift/blob/main/examples/infer/demo.py) and [Multimodal Large Language Model](https://github.com/modelscope/ms-swift/blob/main/examples/infer/demo_mllm.py) inference examples.
- Inference with huggingface transformers/peft ecosystem for models fine-tuned with ms-swift, reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/infer/demo_hf.py).
- For multi-LoRA switching after training multiple LoRAs, reference [Inference](https://github.com/modelscope/ms-swift/blob/main/examples/infer/demo_lora.py) and [Deployment](https://github.com/modelscope/ms-swift/tree/main/examples/deploy/lora) examples.
- For grounding tasks with bounding boxes on multimodal models, reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/infer/demo_grounding.py).
- For inference with LoRA fine-tuned Bert, reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/infer/demo_bert.py).


## Deployment (Post-fine-tuning Model)

Use the following command to start the deployment server. If weights are trained with full parameters, use `--model` instead of `--adapters` to specify the training checkpoint directory. You can reference the client calling methods described in the [Inference and Deployment Documentation](./Inference and Deployment.md#Deployment): curl, openai library, and swift client.

```shell
CUDA_VISIBLE_DEVICES=0 \
swift deploy \
    --adapters output/vx-xxx/checkpoint-xxx \
    --infer_backend pt \
    --temperature 0 \
    --max_new_tokens 2048 \
    --served_model_name '<model-name>'
```

Here we provide a complete example of deploying and calling multiple LoRAs using vLLM.

### Server Side
First, you need to install vLLM: `pip install vllm -U`, and use `--infer_backend vllm` during deployment, which usually significantly accelerates inference speed.

We have pre-trained 2 different self-cognition LoRA incremental weights based on the same base model `Qwen/Qwen2.5-7B-Instruct` (can be run directly). You can find relevant information in [args.json](https://modelscope.ai/models/swift/test_lora/file/view/master). You just need to modify `--adapters` to specify the local path of the trained LoRA weights during deployment.
```bash
CUDA_VISIBLE_DEVICES=0 \
swift deploy \
    --adapters lora1=swift/test_lora lora2=swift/test_lora2 \
    --infer_backend vllm \
    --temperature 0 \
    --max_new_tokens 2048
```

### Client Side

Here we only introduce calling using the openai library. Examples using curl and swift client can be found in the [Inference and Deployment Documentation](./Inference and Deployment.md#Deployment).

```python
from openai import OpenAI

client = OpenAI(
    api_key='EMPTY',
    base_url=f'http://127.0.0.1:8000/v1',
)
models = [model.id for model in client.models.list().data]
print(f'models: {models}')

query = 'who are you?'
messages = [{'role': 'user', 'content': query}]

resp = client.chat.completions.create(model=models[1], messages=messages, max_tokens=512, temperature=0)
query = messages[0]['content']
response = resp.choices[0].message.content
print(f'query: {query}')
print(f'response: {response}')

gen = client.chat.completions.create(model=models[2], messages=messages, stream=True, temperature=0)
print(f'query: {query}\nresponse: ', end='')
for chunk in gen:
    if chunk is None:
        continue
    print(chunk.choices[0].delta.content, end='', flush=True)
print()
"""
models: ['Qwen2.5-7B-Instruct', 'lora1', 'lora2']
query: who are you?
response: I am an artificial intelligence model named swift-robot, developed by swift. I can answer your questions, provide information, and engage in conversation. If you have any inquiries or need assistance, feel free to ask me at any time.
query: who are you?
response: I am an artificial intelligence model named Xiao Huang, developed by ModelScope. I can answer your questions, provide information, and engage in conversation. If you have any inquiries or need assistance, feel free to ask me at any time.
"""
```