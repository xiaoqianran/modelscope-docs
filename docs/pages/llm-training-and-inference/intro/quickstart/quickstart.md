<!-- modelscope-docs: Quick Start | llm-training-and-inference/intro/quickstart/quickstart_EN.md -->

**Note**: For the latest documentation, please refer to [https://swift.readthedocs.io/en/latest/](https://swift.readthedocs.io/en/latest/).

# Quick Start

🍲 ms-swift is a fine-tuning and deployment framework for large language models (LLMs) and multimodal LLMs provided by the ModelScope community. It now supports training (pre-training, fine-tuning, human alignment), inference, evaluation, quantization, and deployment for 600+ pure text LLMs and 300+ multimodal LLMs. Text LLMs include: Qwen3, Qwen3-Next, InternLM3, GLM4.5, Mistral, DeepSeek-R1, Llama4, etc. Multimodal LLMs include: Qwen3-VL, Qwen3-Omni, Llava, InternVL3.5, MiniCPM-V-4, Ovis2.5, GLM4.5-V, DeepSeek-VL2, etc.

🍔 Additionally, ms-swift integrates the latest training technologies, including Megatron parallel techniques such as TP, PP, CP, EP, etc., for accelerated training, as well as numerous GRPO algorithm family reinforcement learning algorithms like GRPO, DAPO, GSPO, SAPO, CISPO, RLOO, Reinforce++, etc., to enhance model intelligence. ms-swift supports a wide range of training tasks, including preference learning algorithms like DPO, KTO, RM, CPO, SimPO, ORPO, as well as Embedding, Reranker, and sequence classification tasks. ms-swift provides end-to-end support for LLM training, including acceleration for inference, evaluation, and deployment modules using vLLM, SGLang, and LMDeploy, as well as quantization of LLMs using GPTQ, AWQ, BNB, and FP8 technologies.

**Why choose ms-swift?**
- 🍎 **Model Types**: Supports 600+ pure text LLMs, **300+ multimodal LLMs**, and All-to-All full-modal models from training to deployment, with Day-0 support for popular models.
- **Dataset Types**: Built-in 150+ datasets for pre-training, fine-tuning, human alignment, multimodal tasks, etc., with support for custom datasets—users only need to prepare their dataset for one-click training.
- **Hardware Support**: Supports A10/A100/H100, RTX series, T4/V100, CPU, MPS, and domestic hardware like Ascend NPU.
- **Lightweight Training**: Supports lightweight fine-tuning methods like LoRA, QLoRA, DoRA, LoRA+, LLaMAPro, LongLoRA, LoRA-GA, ReFT, RS-LoRA, Adapter, LISA, etc.
- **Quantized Training**: Supports training quantized models with BNB, AWQ, GPTQ, AQLM, HQQ, EETQ—training a 7B model requires only 9GB of resources.
- **VRAM Optimization**: Supports GaLore, Q-Galore, UnSloth, Liger-Kernel, Flash-Attention 2/3, and **Ulysses and Ring-Attention sequence parallel technologies** to reduce VRAM usage for long-text training.
- **Distributed Training**: Supports distributed data parallelism (DDP), device_map simple model parallelism, DeepSpeed ZeRO2/ZeRO3, FSDP/FSDP2, and Megatron distributed training techniques.
- 🍓 **Multimodal Training**: Supports multimodal packing technology for >100% training speedup, mixed modality data training (text, images, video, audio), and separate control of vit/aligner/llm components.
- **Agent Training**: Supports Agent templates—prepare one dataset for training across different models.
- 🍊 **Training Tasks**: Supports pre-training and instruction fine-tuning, as well as DPO, GKD, KTO, RM, CPO, SimPO, ORPO tasks, and **Embedding/Reranker** and sequence classification tasks.
- 🥥 **Megatron Parallel Technology**: Provides TP/PP/SP/CP/ETP/EP/VPP parallel strategies, with **MoE model acceleration up to 10x**. Supports full-parameter and LoRA training for 250+ pure text LLMs and 100+ multimodal LLMs. Supports CPT/SFT/GRPO/DPO/KTO/RM training tasks.
- 🍉 **Reinforcement Learning**: Built-in **rich GRPO family algorithms**, including GRPO, DAPO, GSPO, SAPO, CISPO, CHORD, RLOO, Reinforce++, etc., with synchronous and asynchronous vLLM engine inference acceleration, and plugin support for reward functions, multi-turn inference schedulers, and environments.
- **End-to-End Capabilities**: Covers the full pipeline of training, inference, evaluation, quantization, and deployment.
- **UI-Based Training**: Provides Web-UI interface for training, inference, evaluation, and quantization to complete the LLM workflow.
- **Inference Acceleration**: Supports PyTorch, vLLM, SGLang, and LmDeploy inference acceleration engines, with OpenAI API compatibility for accelerated inference, deployment, and evaluation modules.
- **Model Evaluation**: Uses EvalScope as the evaluation backend, supporting 100+ evaluation datasets for both text and multimodal models.
- **Model Quantization**: Supports AWQ, GPTQ, FP8, and BNB quantization export, with exported models compatible with vLLM/SGLang/LmDeploy inference acceleration.


## Installation

For ms-swift installation, please refer to the [Installation Guide](./SWIFT-installation.md).

## Usage Example

Fine-tune Qwen2.5-7B-Instruct for self-cognition on a single 3090 GPU in 10 minutes:
```shell
# 22GB
CUDA_VISIBLE_DEVICES=0 \
swift sft \
    --model Qwen/Qwen2.5-7B-Instruct \
    --train_type lora \
    --dataset 'AI-ModelScope/alpaca-gpt4-data-zh#500' \
              'AI-ModelScope/alpaca-gpt4-data-en#500' \
              'swift/self-cognition#500' \
    --torch_dtype bfloat16 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 1 \
    --per_device_eval_batch_size 1 \
    --learning_rate 1e-4 \
    --lora_rank 8 \
    --lora_alpha 32 \
    --target_modules all-linear \
    --gradient_accumulation_steps 16 \
    --eval_steps 50 \
    --save_steps 50 \
    --save_total_limit 2 \
    --logging_steps 5 \
    --max_length 2048 \
    --output_dir output \
    --system 'You are a helpful assistant.' \
    --warmup_ratio 0.05 \
    --dataloader_num_workers 4 \
    --model_author swift \
    --model_name swift-robot
```

Tips:
- To train with a custom dataset, refer to [here](../customization/custom-datasets.md) for dataset formatting and specify `--dataset <dataset_path>`.
- The `--model_author` and `--model_name` parameters only take effect when the dataset includes `swift/self-cognition`.
- To use a different model for training, simply modify `--model <model_id/model_path>`.
- By default, ModelScope is used for model and dataset downloads. To use HuggingFace instead, specify `--use_hf true`.

After training completes, use the following command for inference with the trained weights:
- Replace `--adapters` with the last checkpoint folder generated during training. Since the adapters folder contains the training parameter file `args.json`, there's no need to specify `--model` or `--system` separately—swift will automatically read these parameters. To disable this behavior, set `--load_args false`.

```shell
# Interactive CLI inference
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --stream true \
    --temperature 0 \
    --max_new_tokens 2048

# Merge LoRA and use vLLM for inference acceleration
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

Finally, use the following command to push the model to ModelScope:
```shell
CUDA_VISIBLE_DEVICES=0 \
swift export \
    --adapters output/vx-xxx/checkpoint-xxx \
    --push_to_hub true \
    --hub_model_id '<your-model-id>' \
    --hub_token '<your-sdk-token>' \
    --use_hf false
```

## Learn More

- More shell scripts: [https://github.com/modelscope/ms-swift/tree/main/examples](https://github.com/modelscope/ms-swift/tree/main/examples)
- Using Python: [https://github.com/modelscope/ms-swift/blob/main/examples/notebook/qwen2_5-self-cognition/self-cognition-sft.ipynb](https://github.com/modelscope/ms-swift/blob/main/examples/notebook/qwen2_5-self-cognition/self-cognition-sft.ipynb)