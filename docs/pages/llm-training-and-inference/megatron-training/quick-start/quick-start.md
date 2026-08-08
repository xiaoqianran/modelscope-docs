<!-- modelscope-docs: Quick Start | llm-training-and-inference/megatron-training/quick-start/quick-start_EN.md -->

# Quick Start

ms-swift introduces Megatron's parallelization techniques to accelerate large model training, including data parallelism, tensor parallelism, pipeline parallelism, sequence parallelism, context parallelism, and expert parallelism. It supports CPT/SFT/DPO/GRPO for models such as Qwen3, [Qwen3-MoE](https://github.com/modelscope/ms-swift/blob/main/examples/megatron/mcore_bridge/full/moe.sh), Qwen2.5, Llama3, Deepseek-R1, and GLM4.5. For a complete list of supported models, please refer to the [Supported Models and Datasets documentation](../supported-models-and-datasets.md). We recommend using Megatron-SWIFT for MoE training, which typically provides a 10x training speed improvement.


| Method | Full Parameter | LoRA | MoE | Multimodal | FP8 |
| ------ | ------ | ---- | ----- | ----- | ----- |
| Pretraining | ✅ | ✅| ✅ | ✅ | ✅ |
| [Instruction Supervised Fine-tuning](https://github.com/modelscope/ms-swift/tree/main/examples/megatron) | ✅ | ✅| ✅ | ✅ | ✅ |
| [GRPO](https://github.com/modelscope/ms-swift/tree/main/examples/megatron/grpo) | ✅ | ✅| ✅ | ✅ | ✅ |
| [DPO](https://github.com/modelscope/ms-swift/tree/main/examples/megatron/rlhf/dpo) | ✅ | ✅| ✅ | ✅ | ✅ |
| [KTO](https://github.com/modelscope/ms-swift/tree/main/examples/megatron/rlhf/kto) | ✅ | ✅| ✅ | ✅ | ✅ |
| [RM](https://github.com/modelscope/ms-swift/tree/main/examples/megatron/rlhf/rm) | ✅ | ✅| ✅ | ✅ | ✅ |
| [Sequence Classification](https://github.com/modelscope/ms-swift/tree/main/examples/megatron/seq_cls) | ✅ | ✅| ✅ | ✅ | ✅ |


## Environment Setup

To use Megatron-SWIFT, in addition to installing swift dependencies, you need to install the following:

```shell
pip install pybind11

# transformer_engine
# If you encounter installation errors, you can refer to this issue for solutions: https://github.com/modelscope/ms-swift/issues/3793
pip install --no-build-isolation transformer_engine[pytorch]

# apex
# Note: Megatron-SWIFT can run without apex by setting `--no_gradient_accumulation_fusion true`.
git clone https://github.com/NVIDIA/apex
cd apex
pip install -v --disable-pip-version-check --no-cache-dir --no-build-isolation --config-settings "--build-option=--cpp_ext" --config-settings "--build-option=--cuda_ext" ./

# megatron-core
pip install git+https://github.com/NVIDIA/Megatron-LM.git@core_r0.15.0

# For multi-node training, additionally set the `MODELSCOPE_CACHE` environment variable to a shared storage path
# This ensures dataset cache is shared, accelerating preprocessing speed.
# Note: This step is critical; otherwise, multi-node training may stall due to data inconsistency caused by randomness.
export MODELSCOPE_CACHE='/xxx/shared'

# Megatron-LM
# The training module from the Megatron-LM dependency library will be git cloned and installed by swift. 
# You can also point the `MEGATRON_LM_PATH` environment variable to an already downloaded repo path (for offline environments, [core_r0.15.0 branch](https://github.com/NVIDIA/Megatron-LM/tree/core_r0.15.0)).
git clone --branch core_r0.15.0 https://github.com/NVIDIA/Megatron-LM.git
export MEGATRON_LM_PATH='/xxx/Megatron-LM'

# flash_attn
# Install the appropriate version: https://github.com/Dao-AILab/flash-attention/releases/tag/v2.8.3
# Note: Do not install versions higher than the maximum allowed by transformer_engine: https://github.com/NVIDIA/TransformerEngine/blob/release_v2.10/transformer_engine/pytorch/attention/dot_product_attention/utils.py#L118
MAX_JOBS=8 pip install "flash-attn==2.8.3" --no-build-isolation
```

Alternatively, you can use the following Docker images: (For historical images, see [here](../../intro/SWIFT-installation.md#docker-images))
```
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py311-torch2.8.0-vllm0.11.0-modelscope1.32.0-swift3.11.3
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py311-torch2.8.0-vllm0.11.0-modelscope1.32.0-swift3.11.3
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py311-torch2.8.0-vllm0.11.0-modelscope1.32.0-swift3.11.3
```

Recommended runtime environment:
|              | Range           | Recommended          | Notes                 |
|--------------|--------------|-------------|--------------------|
| python       | >=3.9        | 3.10/3.11        |                    |
| cuda         |              | cuda12      |                    |
| torch        | >=2.0        | 2.7.1/2.8.0       |                    |
| transformer_engine    | >=2.3       |   2.10.0    |                  |
| apex |   |  0.1 | |
| megatron_core    |   >=0.12,<0.16    | 0.15      |                  |
| flash_attn    |        | 2.8.3/3.0.0b1   |                  |
| transformers | >=4.33       | 4.57.3      |                    |
| modelscope   | >=1.23       |             |                    |
| peft         | >=0.11,<0.19 |             |      LoRA          |
| trl          | >=0.15,<0.25 |       |      RLHF        |


## Quick Start Example

Here we introduce a quick start example for self-cognition fine-tuning of the Qwen2.5-7B-Instruct model using 2x 80GiB A100 GPUs. The following best practices can be completed within 10 minutes.

First, we need to convert HF format weights to Megatron format:
- Multi-GPU weight conversion: Remove `CUDA_VISIBLE_DEVICES=0` to enable multi-GPU weight conversion.
- Conversion precision testing: `--test_convert_precision true` will test conversion precision. For MoE large model conversion, this parameter takes longer time and consumes more memory, so it can be removed as needed.
- ms-swift supports Mcore-Bridge to avoid the additional time cost of weight conversion. Please refer to the [Mcore-Bridge documentation](./Mcore-Bridge.md).
```shell
CUDA_VISIBLE_DEVICES=0 \
swift export \
    --model Qwen/Qwen2.5-7B-Instruct \
    --to_mcore true \
    --torch_dtype bfloat16 \
    --output_dir Qwen2.5-7B-Instruct-mcore \
    --test_convert_precision true
```

Then, use the following script for training, which requires 2*80GiB GPU memory:
- For multi-node training, it's recommended to use shared disk storage and specify the same path for `--save`.
```shell
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True' \
NPROC_PER_NODE=2 \
CUDA_VISIBLE_DEVICES=0,1 \
megatron sft \
    --load Qwen2.5-7B-Instruct-mcore \
    --dataset 'AI-ModelScope/alpaca-gpt4-data-zh#500' \
              'AI-ModelScope/alpaca-gpt4-data-en#500' \
              'swift/self-cognition#500' \
    --tensor_model_parallel_size 2 \
    --sequence_parallel true \
    --micro_batch_size 16 \
    --global_batch_size 16 \
    --recompute_granularity full \
    --recompute_method uniform \
    --recompute_num_layers 1 \
    --finetune true \
    --cross_entropy_loss_fusion true \
    --lr 1e-5 \
    --lr_warmup_fraction 0.05 \
    --min_lr 1e-6 \
    --max_epochs 1 \
    --save megatron_output/Qwen2.5-7B-Instruct \
    --save_interval 100 \
    --max_length 2048 \
    --system 'You are a helpful assistant.' \
    --num_workers 4 \
    --no_save_optim true \
    --no_save_rng true \
    --dataset_num_proc 4 \
    --model_author swift \
    --model_name swift-robot
```

Finally, convert the Megatron format weights back to HF format:
- Note: `--mcore_model` should point to the parent directory of `iter_xxx`. By default, it will use the checkpoint specified in `latest_checkpointed_iteration.txt`.
- If OOM occurs, remove `CUDA_VISIBLE_DEVICES=0`. If memory is insufficient, remove `--test_convert_precision true`.
```shell
CUDA_VISIBLE_DEVICES=0 \
swift export \
    --mcore_model megatron_output/Qwen2.5-7B-Instruct/vx-xxx \
    --to_hf true \
    --torch_dtype bfloat16 \
    --output_dir megatron_output/Qwen2.5-7B-Instruct/vx-xxx-hf \
    --test_convert_precision true
```

We perform inference on the generated HF format weights:
```shell
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --model megatron_output/Qwen2.5-7B-Instruct/vx-xxx-hf \
    --stream true \
    --temperature 0 \
    --max_new_tokens 2048
```

Inference result:
```
<<< who are you?
I am a language model developed by swift, you can call me swift-robot. How can I assist you?
```

- For pretraining, you can use `megatron pt` instead of `megatron sft`, which will use generative templates for training.
- Megatron-SWIFT uses the same dataset and template processing modules as ms-swift, thus supporting techniques like packing, loss_scale, and agent training. For custom dataset formats, please refer to the [Custom Dataset documentation](../customization/custom-datasets.md).
- **More examples**: Including packing, multi-node, 32K context, DPO, MoE models, and pretraining, can be found [here](https://github.com/modelscope/ms-swift/tree/main/examples/megatron).


## Training Tips
- Methods to increase training throughput: Use packing (without streaming), increase DP, reduce recomputation, increase compute-communication overlap. MoE can also be accelerated by dropping tokens.
- Parallelization technique selection:
  - Megatron-SWIFT's parallelization techniques combine zero1 (enabled by default with use_distributed_optimizer) with various parallelization techniques.
  - DP is the fastest but consumes more GPU memory; other parallelization techniques are used to reduce memory usage.
  - TP/EP have high communication overhead; try to avoid cross-node communication (within NVLink domain). For cross-node scenarios, PP/DP is recommended. For expert layers, EP is recommended over ETP, as ETP saves more memory but is slower.
  - MoE parallel folding: MoE-related parallel groups are separated from Dense groups. Attention uses tp-cp-dp-pp groups, while MoE uses etp-ep-dp-pp groups.
- Selection of parallel count for weight conversion: Megatron-SWIFT uses torch_dist storage format on the mcore side, allowing adjustment of parallel count during training without specifying it during weight conversion.
- Regarding log printing: Megatron-SWIFT logs are printed on the last rank because only the last pp_rank has complete information in PP parallelism.

## Benchmark

Speed comparison between `megatron sft` and `swift sft` for Dense model full-parameter 8K context training in a single-node 8x A800 environment:

**Dense** Qwen2.5-14B:

|          | Megatron-LM | Deepspeed-ZeRO2 | Deepspeed-ZeRO3 |
| -------- | ----------- | ---------- | ---------- |
| Training Speed |      9.04s/it       |  10.32s/it   | 10.56s/it |
| GPU Memory Usage | 8\*64GB     |  8\*80GB   | 8\*58GB |

Speed comparison between `megatron sft` and `swift sft` for MoE model full-parameter 8K context training in a two-node 16x A800 environment:

**MoE** Qwen3-30B-A3B:

|          | Megatron-LM | DeepSpeed-ZeRO2 | DeepSpeed-ZeRO3 |
| -------- | ----------- | --------------- | --------------- |
| Training Speed | 9.6s/it     | -               | 91.2s/it        |
| GPU Memory Usage | 16 * 60GiB  | OOM             | 16 * 80GiB      |


## Megatron-SWIFT WeChat Group

<img src="https://raw.githubusercontent.com/modelscope/ms-swift/main/docs/resources/wechat/megatron.png" width="250">