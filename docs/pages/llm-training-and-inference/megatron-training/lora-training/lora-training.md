<!-- modelscope-docs: LoRA Training | llm-training-and-inference/megatron-training/lora-training/lora-training_EN.md -->

# LoRA Training

Best practices for single-node 8x H20 LoRA training of Qwen3-235B-A22B-Instruct-250718 reference: [https://github.com/modelscope/ms-swift/pull/5033](https://github.com/modelscope/ms-swift/pull/5033).

For environment setup, please refer to Megatron-SWIFT's [Quick Start documentation](./Quick-start.md).

## HF to MCore Conversion

The conversion method is the same as full parameter training, with the following script:
```shell
CUDA_VISIBLE_DEVICES=0 \
swift export \
    --model Qwen/Qwen2.5-7B-Instruct \
    --to_mcore true \
    --torch_dtype bfloat16 \
    --output_dir Qwen2.5-7B-Instruct-mcore \
    --test_convert_precision true
```

## LoRA Training

Training script:
```bash
# full: 2 * 70GiB 0.61s/it
# lora: 2 * 14GiB 0.45s/it
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True' \
NPROC_PER_NODE=2 \
CUDA_VISIBLE_DEVICES=0,1 \
megatron sft \
    --load Qwen2.5-7B-Instruct-mcore \
    --dataset 'AI-ModelScope/alpaca-gpt4-data-zh#500' \
              'AI-ModelScope/alpaca-gpt4-data-en#500' \
              'swift/self-cognition#500' \
    --train_type lora \
    --lora_rank 8 \
    --lora_alpha 32 \
    --target_modules all-linear \
    --tensor_model_parallel_size 2 \
    --sequence_parallel true \
    --micro_batch_size 16 \
    --global_batch_size 16 \
    --recompute_granularity full \
    --recompute_method uniform \
    --recompute_num_layers 1 \
    --finetune true \
    --cross_entropy_loss_fusion true \
    --lr 1e-4 \
    --lr_warmup_fraction 0.05 \
    --min_lr 1e-5 \
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
- For MoE model LoRA training scripts, please refer to [here](https://github.com/modelscope/ms-swift/tree/main/examples/megatron/lora).

## MCore to HF Conversion

```bash
CUDA_VISIBLE_DEVICES=0 \
swift export \
    --mcore_adapters megatron_output/Qwen2.5-7B-Instruct/vx-xxx \
    --to_hf true \
    --torch_dtype bfloat16 \
    --output_dir megatron_output/Qwen2.5-7B-Instruct/vx-xxx-hf \
    --test_convert_precision true
```
- Note: The `mcore_adapters` folder contains an `args.json` file. During conversion, the process will read `mcore_model` and LoRA-related parameter information from this file, merge `mcore_model` and `mcore_adapters` into complete weights, and finally convert to HF format weights. (LoRA incremental weight conversion is not currently supported)

## Merge-LoRA

If you only want to merge LoRA without converting to HF format weights (for subsequent DPO training), you can use the following script:
```shell
CUDA_VISIBLE_DEVICES=0 \
swift export \
    --mcore_adapters megatron_output/Qwen2.5-7B-Instruct/vx-xxx \
    --to_mcore true \
    --torch_dtype bfloat16 \
    --output_dir megatron_output/Qwen2.5-7B-Instruct/vx-xxx-mcore \
    --test_convert_precision true
```