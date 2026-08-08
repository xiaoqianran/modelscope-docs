<!-- modelscope-docs: Command Line Parameters | llm-training-and-inference/megatron-training/command-line-parameters/command-line-parameters_EN.md -->

# Command Line Parameters

## Megatron Parameters

**Training Parameters**:
- 🔥micro_batch_size: Batch size per device, default is 1.
- 🔥global_batch_size: Total batch size, equivalent to `micro_batch_size * data_parallel_size * gradient_accumulation_steps`. Default is 16.
  - Where `data_parallel_size (DP) = total_GPU_count / (TP × PP × CP)`.
- 🔥recompute_granularity: Granularity of activation recomputation, options are 'full', 'selective'. 'full' means recomputing the entire transformer layer, 'selective' means only computing the core attention part of the transformer layer. 'selective' is generally recommended. Default is 'selective'.
  - When set to 'selective', you can specify `--recompute_modules` to choose which parts to recompute.
- 🔥recompute_method: Only effective when recompute_granularity is set to 'full', options are 'uniform', 'block'. Default is None.
- 🔥recompute_num_layers: Only effective when recompute_granularity is set to 'full', default is None. If `recompute_method` is set to uniform, this parameter represents the number of transformer layers in each uniformly divided recomputation unit. For example, you can specify `--recompute_granularity full --recompute_method uniform --recompute_num_layers 4`. Larger recompute_num_layers means less memory usage but higher computational cost. Note: The number of model layers in the current process must be divisible by `recompute_num_layers`. Default is None.
- 🔥recompute_modules: Options include "core_attn", "moe_act", "layernorm", "mla_up_proj", "mlp", "moe", default value is `["core_attn"]`. This parameter takes effect when `--recompute_granularity selective` is set. For example, during MoE training, you can reduce memory usage by specifying `--recompute_granularity selective --recompute_modules core_attn moe`. "core_attn", "mlp" and "moe" use regular checkpointing, while "moe_act", "layernorm" and "mla_up_proj" use output-dropping checkpointing.
  - "core_attn": Recompute the core attention part in Transformer layers.
  - "mlp": Recompute dense MLP layers.
  - "moe": Recompute MoE layers.
  - "moe_act": Recompute the MLP activation function part in MoE.
  - "layernorm": Recompute input_layernorm and pre_mlp_layernorm.
  - "mla_up_proj": Recompute MLA up-projection and RoPE application parts.
- deterministic_mode: Deterministic mode, which will slow down training, default is False.
- 🔥train_iters: Total number of training iterations, default is None.
  - Tip: You can set `--max_epochs` to specify the number of training epochs. When using non-streaming datasets, `train_iters` will be automatically calculated based on dataset size (compatible with packing).
- 🔥max_epochs: Specify the number of training epochs. When using non-streaming datasets, this parameter will automatically calculate train_iters for you without manually passing `train_iters`. When using streaming datasets, this parameter will force exit training when reaching `max_epochs` and validate/save weights. Default is None.
- 🔥log_interval: Log interval (in iterations), default is 5.
- tensorboard_dir: Directory to write tensorboard logs. Default is None, which stores in `f'{save}/runs'` directory.
- no_masked_softmax_fusion: Default is False. Used to disable scaling, masking, and softmax fusion for query_key_value.
- no_bias_dropout_fusion: Default is False. Used to disable bias and dropout fusion.
- no_bias_swiglu_fusion: Default is False. Specify `--no_bias_dropout_fusion true` to disable bias and swiglu fusion.
- no_rope_fusion: Default is False. Specify `--no_rope_fusion true` to disable rope fusion.
  - **When using position encodings like mrope that don't support rope_fusion, this parameter will be automatically set to True**.
- no_gradient_accumulation_fusion: Default is False. Specify `--no_gradient_accumulation_fusion true` to disable gradient accumulation fusion.
- 🔥cross_entropy_loss_fusion: Enable cross-entropy loss computation fusion. Default is False.
- cross_entropy_fusion_impl: Implementation of cross-entropy loss fusion. Options are 'native' and 'te'. Default is 'native'.
- calculate_per_token_loss: Scale cross-entropy loss based on the number of non-padding tokens in the global batch. Default is True.
  - Note: This parameter defaults to False when using RLHF training or when `task_type` is not equal to 'causal_lm'.
- 🔥attention_backend: Attention backend to use (flash, fused, unfused, local, auto). Default is flash.
  - **Note: Recommended flash_attn version: 2.8.3**. In versions "ms-swift<3.7", the default for this parameter was 'auto'.
  - If 'flash_attention_3' is installed, `--attention_backend flash` will prioritize using fa3. Training script reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/flash_attention_3). For the vit part of multimodal models to use flash_attention_3, set `--attn_impl flash_attention_3`.
  - Some models may not support flash, and you need to manually set `--attention_backend unfused/fused --padding_free false`, for example: Llama4, GPT-OSS.
- optimizer: Optimizer type, options are 'adam', 'sgd'. Default is adam.
  - Note: This 'adam' is actually 'adamw', reference [here](https://github.com/NVIDIA/TransformerEngine/blob/d8f1e68f7c414f3e7985a8b41de4443b2f819af3/transformer_engine/pytorch/optimizers/fused_adam.py#L69-L70).
- 🔥optimizer_cpu_offload: Offload optimizer states to CPU, for example: `--use_precision_aware_optimizer true --optimizer_cpu_offload true --optimizer_offload_fraction 0.7`. Default is False.
  - This parameter can significantly reduce GPU memory usage (but increases CPU memory usage). If global_batch_size is large, the impact on training speed is minimal.
- 🔥optimizer_offload_fraction: Proportion of optimizer states to offload to CPU. Default is 1.
- use_precision_aware_optimizer: Use precision-aware optimizer from TransformerEngine, which allows setting main parameters and optimizer states to lower precision, such as fp16 and fp8.
- main_grads_dtype: Dtype of main gradients when enabling use_precision_aware_optimizer. Options are 'fp32', 'bf16'. Default is 'fp32'.
- main_params_dtype: Dtype of main parameters when enabling use_precision_aware_optimizer. Options are 'fp32', 'fp16'. Default is 'fp32'.
- exp_avg_dtype: Dtype of exp_avg (first moment) in adam optimizer when enabling use_precision_aware_optimizer. This dtype is used to store optimizer states in memory during training but doesn't affect kernel computation precision. Options are 'fp32', 'fp16', 'bf16', 'fp8'. Default is 'fp32'.
- exp_avg_sq_dtype: Dtype of exp_avg_sq (second moment) in adam optimizer when enabling use_precision_aware_optimizer. This dtype is used to store optimizer states in memory during training but doesn't affect kernel computation precision. Options are 'fp32', 'fp16', 'bf16', 'fp8'. Default is 'fp32'.
- dataloader_type: Default is 'cyclic', options are 'single', 'cyclic', 'external'. If `--streaming` is enabled, it's set to `external`.
- manual_gc: Disable default garbage collector and trigger garbage collection manually. Default is False.
- manual_gc_interval: Interval for manual garbage collection triggering. Default is 0.
- seed: Random seed for python, numpy, pytorch and cuda, default is 42.
- 🔥num_workers: Number of dataloader workers, default is 4.
  - Note: If `--streaming true` is set, this is set to 1.
- seq_length: Default is None, which sets to `max_length`. It's recommended to control dataset length limitation using `--max_length` in "basic parameters" instead of setting this parameter.
- use_cpu_initialization: Initialize weights on CPU, default is False. Used during HF and MCore weight conversion. Usually doesn't need modification.
- 🔥megatron_extra_kwargs: Additional parameters to pass through to megatron, passed as JSON. Default is None.
  - In "ms-swift<3.10", this parameter was named `--extra_megatron_kwargs`.

**Learning Rate Parameters**:
- 🔥lr: Initial learning rate, which will be determined by learning rate warmup and decay strategies for each iteration. Default is None. **Full parameter training defaults to 1e-5, LoRA training defaults to 1e-4**.
- lr_decay_style: Learning rate decay strategy, default is 'cosine'. Usually set to 'cosine', 'linear', 'constant'.
- 🔥lr_decay_iters: Number of iterations for learning rate decay. Default is None, which sets to `--train_iters`.
- lr_warmup_iters: Number of iterations for linear learning rate warmup, default is 0.
- 🔥lr_warmup_fraction: Proportion of linear learning rate warmup phase, default is None.
- 🔥min_lr: Minimum learning rate value, learning rates below this threshold will be clipped to this value, default is 0.

**Regularization Parameters**:
- 🔥weight_decay: Default is 0.1.
- 🔥clip_grad: L2 gradient clipping, default is 1.0.
  - The grad_norm printed in logs is the value before clipping.
- adam_beta1: Default 0.9.
- adam_beta2: Default 0.95.
- adam_eps: Default 1e-8.
- sgd_momentum: Effective when `--optimizer sgd` is set, default is 0.9.

**Checkpoint Parameters**:
- 🔥save: Output directory for checkpoints, default is None. During training, if this parameter is not set, it defaults to `f'megatron_output/{model_suffix}'`, for example `'megatron_output/Qwen2.5-7B-Instruct'`.
  - Note: **In multi-node training, ensure the save path points to the same location on each node**, otherwise you'll need to manually consolidate these weights after training.
- 🔥save_interval: Checkpoint save interval (steps), default is 500.
  - Note: Weights will always be saved at the end of training.
- 🔥save_retain_interval: Iteration interval for retaining checkpoints. Only checkpoints whose iteration steps are multiples of this interval will be retained (except the last checkpoint).
  - Tip: You can set this to a very large value to only save the last checkpoint.
- 🔥no_save_optim: Don't save optimizer, default is False. In full parameter training, this can significantly reduce storage time.
- 🔥no_save_rng: Don't save RNG, default is False.
- 🔥load: Checkpoint directory to load, default is None.
  - Note: If you didn't use ms-swift's `swift export` for weight conversion, you need to additionally set `--model <hf-repo>` to load the `config.json` configuration file.
  - For resuming training, please check the `--finetune` parameter description.
- 🔥no_load_optim: Don't load optimizer, default is False.
  - Note: When resuming training, setting `--no_load_optim false` to read optimizer state usually consumes more GPU memory than setting `--no_load_optim true` to not read optimizer state.
- 🔥no_load_rng: Don't load RNG, default is False.
- 🔥finetune: Load and fine-tune the model. **Doesn't load checkpoint optimizer and random seed states, and sets iteration count to 0**. Default is False.
  - Note: **For resuming training**, you need to set `--load` (for LoRA training, additionally set `--adapter_load`). If `--finetune true` is set, optimizer state and random seed state won't be loaded and iteration count will be set to 0, without skipping datasets; if `--finetune false` is set, iteration count will be read and previous training dataset quantity will be skipped, with optimizer state and random seed state reading controlled by `--no_load_optim` and `--no_load_rng`.
  - Streaming datasets `--streaming` don't currently support dataset skipping.
- ckpt_format: Checkpoint format. Options are 'torch', 'torch_dist', 'zarr'. Default is 'torch_dist'. (Currently weight conversion only supports 'torch_dist' format)
- no_initialization: Don't initialize weights, default is True.
- auto_detect_ckpt_format: Automatically detect whether ckpt format is legacy or distributed format. Default is True.
- exit_on_missing_checkpoint: If `–-load` is set but **checkpoint is not found, exit directly** instead of initializing. Default is True.
- 🔥async_save: Use asynchronous checkpoint saving. Currently only applicable to `torch_dist` distributed checkpoint format. Default is False.
- use_persistent_ckpt_worker: Use persistent checkpoint worker process for asynchronous saving, i.e., create dedicated background process to handle asynchronous saving. Default is False.
- ckpt_fully_parallel_load: Use fully parallel loading across DP for distributed checkpoints to accelerate weight loading speed. Default is False.
- ckpt_assume_constant_structure: If model and optimizer state dictionary structure remains unchanged within a single training run, allow Megatron to perform additional checkpoint performance optimizations. Default is False.

**Distributed Parameters**:
For parallel technique selection, please refer to [Training Tips documentation](Quick-start.md#training-tips).

- distributed_backend: Distributed backend, options are 'nccl', 'gloo'. Default is nccl.
- 🔥use_distributed_optimizer: Use distributed optimizer (i.e., zero1). Default is True.
- 🔥tensor_model_parallel_size: TP count, default is 1.
- 🔥pipeline_model_parallel_size: PP count, default is 1.
- 🔥decoder_first_pipeline_num_layers: Number of Transformer layers in the first pipeline stage of decoder. Default is None, meaning Transformer layers are evenly distributed across all pipeline stages.
  - This parameter is typically used when **Transformer layer count cannot be evenly divided by PP**, or when the first PP stage of multimodal models has excessive memory usage.
- 🔥decoder_last_pipeline_num_layers: Number of Transformer layers in the last pipeline stage of decoder. Default is None, meaning Transformer layers are evenly distributed across all pipeline stages.
- account_for_embedding_in_pipeline_split: If set to True, input embedding layer is treated as a standard Transformer layer in pipeline parallel partitioning and placement strategy. Default is False.
- account_for_loss_in_pipeline_split: If set to True, loss layer is treated as a standard Transformer layer in pipeline parallel partitioning and placement strategy. Default is False.
- 🔥sequence_parallel: Enable sequence parallel optimization, this parameter requires `tensor_model_parallel_size` to be set. Default is False.
- 🔥context_parallel_size: CP count, default is 1.
- tp_comm_overlap: Enable overlap between tensor parallel communication and GEMM (General Matrix Multiply) kernels (reducing communication time). Default is False.
- 🔥overlap_grad_reduce: Enable overlap of grad reduce operations in DDP (reducing DP communication time). Default is False.
- 🔥overlap_param_gather: Enable overlap of parameter all-gather in distributed optimizer (reducing DP communication time). Default is False.
- distributed_timeout_minutes: Timeout for torch.distributed (in minutes), this parameter is deprecated, use ddp_timeout in [basic parameters](../Instruction/Command-line-parameters.md#basic-parameters) instead, default is 300000 minutes.
- num_layers_per_virtual_pipeline_stage: Number of layers per virtual pipeline stage. Default is None. This parameter and `--num_virtual_stages_per_pipeline_rank` can both be used to set vpp parallelism.
- num_virtual_stages_per_pipeline_rank: Number of virtual pipeline stages per pipeline parallel rank. Default is None. VPP parallelism is used to reduce PP parallel computation bubbles and improve GPU utilization, but slightly increases communication volume.
- microbatch_group_size_per_virtual_pipeline_stage: Number of consecutive microbatches processed per virtual pipeline stage. Default is None, equal to pipeline_model_parallel_size.
- 🔥pipeline_model_parallel_layout: A string describing custom pipeline (pp/vpp) model parallel layout. Example: "E|(t|)*3,m|m||L". Where E, L, t, m represent embedding layer, loss layer, Transformer decoder layer, and MTP layer respectively. Stages are separated by "|". Repeated stages or layers can be represented by multiplication. Commas are only for readability (no actual syntax function). Default is None, meaning this parameter is not used to set layout.
  - This parameter is typically used on heterogeneous GPU clusters.

**Logging Parameters**:
- log_params_norm: Record parameter norm. Default is False.
- log_throughput: Record throughput per GPU (theoretical value). Default is False.
  - Note: In non-packing scenarios, log_throughput is not accurate because `seq_length` doesn't equal actual sequence length.
- tensorboard_log_interval: Interval for recording to tensorboard (steps), default is 1.
- tensorboard_queue_size: TensorBoard queue size for temporarily storing events and summaries; when the number of pending events and summaries reaches this size, the next call to "add" related methods will trigger data flushing to disk. Default is 50.
- log_timers_to_tensorboard: Record timers to tensorboard. Default is True.
- no_log_learning_rate_to_tensorboard: Don't record learning rate to tensorboard. Default is False.
- log_validation_ppl_to_tensorboard: Write validation perplexity to tensorboard. Default is True.
- log_memory_to_tensorboard: Write memory logs to tensorboard. Default is True.
- logging_level: Logging level. Default is None.
- wandb_project: Wandb project name. Default is '', which ignores wandb.
- wandb_exp_name: Wandb experiment name. Default is ''.
- wandb_save_dir: Local path to save wandb results. Default is ''.

**Evaluation Parameters**:
- 🔥eval_iters: Number of evaluation iterations, default is `-1`, set appropriate value based on validation dataset size. **If validation set size is less than global_batch_size, evaluation won't be performed**. If using streaming datasets, this value needs to be manually set.
- 🔥eval_interval: Evaluation interval (steps), i.e., how many steps to evaluate after training, default is None, which sets to save_interval.

**FP8 Parameters**:
- fp8_format: FP8 format scheme for FP8 tensors in forward and backward propagation. Options are 'e4m3', 'hybrid'. Default is None.
- fp8_recipe: FP8 algorithm scheme for FP8 tensors in forward and backward propagation. Options are 'tensorwise', 'delayed', 'mxfp8', 'blockwise'. Default is 'delayed'. Blockwise fp8 requires cuda129 or higher.
- fp8_amax_history_len: Number of steps to record amax history for each tensor. Default is 1024.
- fp8_amax_compute_algo: Algorithm for computing amax based on history records. Options are 'most_recent', 'max'. Default is 'max'.
- fp8_param_gather: Keep computation parameters as fp8 (without using any other intermediate data types) and perform parameter all-gather operations in fp8 format. Default is False.
  - Tip: Set to True if you want to export FP8 weight format; otherwise set to False.

**Mixed Precision Parameters**:
- fp16: fp16 mode. Default is None, will be set based on model's torch_dtype, i.e., if torch_dtype is float16 or float32 then fp16 is set to True. torch_dtype defaults to reading from config.json.
- bf16: bf16 mode. Default is None, will be set based on model's torch_dtype, i.e., if torch_dtype is bfloat16 then bf16 is set to True.
- apply_query_key_layer_scaling: Scale `Q * K^T` to `1 / layer_count` (e.g., divide by layer_num for layer_num-th layer). This is very helpful for fp16 training. Default is None, which means if `--fp16` is used, it's set to True.
- 🔥attention_softmax_in_fp32: Use fp32 for attention_mask and softmax calculations. Default is True.

**Model Parameters**: (**The following parameters usually don't need to be set, as they will be configured based on HF model's config.json, users don't need to worry about them**)
- num_layers: Number of transformer layers, default is None.
- hidden_size: Transformer hidden size, default is None.
- ffn_hidden_size: Hidden size of transformer FFN layer. Default is None, set to `4*hidden_size`.
- num_attention_heads: Number of transformer attention heads, default is None.
- group_query_attention: Default is None. If `num_query_groups>1`, group_query_attention is set to True, otherwise False.
- num_query_groups: Default is 1.
- softmax_type: Softmax type for attention mechanism. Supports fixed offset and learnable offset methods. Options are 'vanilla', 'off-by-one', and 'learnable', default is 'vanilla'.
- window_size: Window size for window attention, e.g., `'128,0'`. If not provided, window attention is disabled. Default is None.
- window_attn_skip_freq: Frequency to skip window attention layers. Default is None.
- max_position_embeddings: Maximum length of position encoding, default is None.
- position_embedding_type: Type of position encoding, options are 'learned_absolute', 'rope', 'mrope', 'relative', and 'none', default is 'rope'.
- rotary_base: Default is 10000.
- rotary_percent: Default is 1.
- normalization: Options are 'LayerNorm', 'RMSNorm', default is RMSNorm.
- norm_epsilon: Default is 1e-5.
- swiglu: Use swiglu instead of default gelu. Default is True.
- quick_geglu: Use fast geglu activation function instead of default gelu. Default is False.
- activation_func_clamp_value: Limit the output value range of linear_fc1 in activation function. Only used when `activation_func` is `quick_gelu`. Default is None.
- glu_linear_offset: Offset term in GLU activation function: `activation_func(x[0]) * (x[1] + offset)`. Only used when gated_linear_unit is True. Default is 0.
- untie_embeddings_and_output_weights: Untie embedding and output weight binding, default is True.
- disable_bias_linear: Disable bias in linear layers. Default is True.
- add_qkv_bias: Add bias only in QKV linear layers, default is True.
- attention_dropout: Default is 0.
- hidden_dropout: Default is 0.
- kv_channels: Default is None, set to `args.hidden_size // args.num_attention_heads`.
- qk_layernorm: Whether to apply layer normalization to Q and K.
- qk_l2_norm: Use Llama 4's QK L2 norm.
- no_rope_freq: Control on which layers to skip applying Rotary Position Encoding (RoPE). Default is None, meaning RoPE is executed on every layer.
- moe_apply_probs_on_input: Apply probabilities (probs) before MLP activation function in MoE routing.
- transformer_impl: Which transformer implementation to use, options are 'local' and 'transformer_engine'. Default is transformer_engine.
- padded_vocab_size: Complete vocabulary size, default is None.
- rope_scaling: Rope_scaling related parameters, default is None. Format reference [llama3.1 config.json](https://modelscope.cn/models/LLM-Research/Meta-Llama-3.1-8B-Instruct/file/view/master?fileName=config.json&status=1), pass as JSON string.
  - **Currently rope_scaling module uses transformers implementation, supporting all rope_scaling supported by transformers.**

**MoE Parameters**:
- num_experts: Number of MoE experts, default is None. Automatically read from config.json.
- moe_layer_freq: Distribution frequency between MoE layers and Dense layers. Default is None. Read from config.json.
- moe_ffn_hidden_size: Hidden layer size of FFN for each expert. Default is None, automatically read from config.json. If not read and `num_experts` is not None, set to ffn_hidden_size.
- moe_shared_expert_intermediate_size: Total FFN hidden layer size for shared experts. If there are multiple shared experts, it should equal `num_shared_experts * ffn_size_of_each_shared_expert`. Default is None. Automatically read from config.json.
- moe_router_topk: Number of experts each token is routed to. Default is None. Automatically read from config.json.
- moe_router_num_groups: Number of groups to divide experts into, for group-constrained routing. Reference DeepSeek-V2 and DeepSeek-V3. Default is None. Automatically read from config.json.
- moe_router_group_topk: Number of groups selected in group-constrained routing. Default is None. Automatically read from config.json.
- moe_router_pre_softmax: Enable pre-softmax routing for MoE, meaning softmax is performed before top-k selection. Default is None. Automatically read from config.json.
- 🔥moe_router_dtype: Data type used for routing computation and expert output weighted averaging. Options are 'none', 'fp32', 'fp64', which enhances numerical stability, especially when there are many experts. When used with `moe_permute_fusion`, performance impact is negligible. Default is 'fp32'. 'none' means not changing data type.
- moe_router_score_function: Scoring function for MoE TopK routing. Can be "softmax" or "sigmoid". Default is None, read from config.json.
- moe_router_bias_update_rate: Update rate for expert bias in auxiliary loss-free load balancing strategy. Expert bias is updated based on the number of tokens assigned to each expert in the global batch, increasing bias for experts with fewer assigned tokens and decreasing bias for experts with more assigned tokens. Default is None, read from config.json.
- moe_router_enable_expert_bias: TopK routing with dynamic expert bias in auxiliary loss-free load balancing strategy. Routing decisions are based on the sum of routing scores and expert bias. Details see: https://arxiv.org/abs/2408.15664. Default is None, automatically read from config.json.
- moe_router_topk_scaling_factor: Default is None. Read from config.json.
- moe_router_load_balancing_type: Determine router's load balancing strategy. Options are "aux_loss", "seq_aux_loss", "global_aux_loss", "sinkhorn", "none". "global_aux_loss" requires "megatron-core>=0.15". Default is None. Read from config.json.
- 🔥expert_model_parallel_size: Expert parallel count, default is 1.
- 🔥expert_tensor_parallel_size: Expert TP parallelism degree. Default is 1.
  - In "ms-swift<3.9", default was None, equal to `--tensor_model_parallel_size` value, this default will be changed in "ms-swift>=3.9".
- moe_token_dispatcher_type: Type of token dispatcher to use. Options include 'allgather', 'alltoall', 'flex', and 'alltoall_seq'. Default is 'alltoall'.
- moe_enable_deepep: Enable DeepEP for efficient token scheduling and merging in MoE models. Only effective when using flexible token dispatcher by setting `--moe_token_dispatcher_type flex`.
- 🔥moe_grouped_gemm: When each rank contains multiple experts, improve utilization and performance by launching multiple local GEMM kernels in multiple streams using GroupedLinear in TransformerEngine. Default is True.
  - In "ms-swift>=3.10", default value changed from False to True.
- 🔥moe_permute_fusion: Fuse token permutation operations during token dispatch. Default is False.
- 🔥moe_aux_loss_coeff: Default is 0, aux_loss not used. **Generally, larger values result in worse training performance but more balanced MoE load**, please choose appropriate value based on experimental results.
  - Note: In "ms-swift<3.7.1", default was None, automatically read from config.json.
- moe_z_loss_coeff: Scaling coefficient for z-loss. Default is None.
- 🔥moe_shared_expert_overlap: Enable overlap between shared expert computation and dispatcher communication. If not enabled, shared experts will be executed after routing experts. Only effective when `moe_shared_expert_intermediate_size` is set. Default is False.
- 🔥moe_expert_capacity_factor: Capacity factor for each expert, None means no tokens will be dropped. Default is None. By setting `--moe_expert_capacity_factor`, tokens exceeding expert capacity will be dropped based on their selection probability. Can **make training load uniform and improve training speed** (e.g., set to 1 or 2).
- moe_pad_expert_input_to_capacity: Pad input for each expert to align with expert capacity length, default is False. This operation only takes effect when `--moe_expert_capacity_factor` parameter is set.
- moe_token_drop_policy: Options are 'probs', 'position'. Default is 'probs'.

**MLA Parameters**
- multi_latent_attention: Whether to use MLA. Default is False.
- q_lora_rank: Rank value for low-rank representation of Query tensor. Default is None, automatically read from config.json.
- kv_lora_rank: Rank value for low-rank representation of Key and Value tensors. Default is None, automatically read from config.json.
- qk_head_dim: Head dimension in QK projection. `q_head_dim = qk_head_dim + qk_pos_emb_head_dim`. Default is None, automatically read from config.json.
- qk_pos_emb_head_dim: Position embedding dimension in QK projection. Default is None, automatically read from config.json.

**MTP Parameters**
- mtp_num_layers: Number of Multi-Token Prediction (MTP) layers. MTP extends prediction range for each position to multiple future tokens. This MTP implementation uses D sequential modules to predict D additional tokens sequentially. Default is None. (Requires "megatron-core>=0.14")
  - Note: mtp_num_layers value won't be automatically obtained from config.json and needs to be set manually. You can refer to the `num_nextn_predict_layers` field in config.json to fill this value. When using mcore-bridge, MTP weights will be prioritized from safetensors files, and if not found, random initialization will be performed. (To use blockwise fp8 + mtp, use mcore>=0.15)
- mtp_loss_scaling_factor: Scaling factor for Multi-Token Prediction (MTP) loss. We calculate the average of MTP losses across all depths, then multiply by this scaling factor to get the overall MTP loss, which serves as an additional training objective. Default is 0.1.

**Tuner Parameters**:
- train_type: Options are 'lora' and 'full'. Default is 'full'.
- 🔥freeze_llm: This parameter only affects multimodal models and can be used in both full parameter training and LoRA training, but produces different effects. In full parameter training, setting freeze_llm to True will freeze LLM part weights; in LoRA training with `target_modules` set to 'all-linear', setting freeze_llm to True will cancel adding LoRA modules to LLM part. Default is False.
- 🔥freeze_vit: This parameter only affects multimodal models and can be used in both full parameter training and LoRA training, but produces different effects. In full parameter training, setting freeze_vit to True will freeze vit part weights; in LoRA training with `target_modules` set to 'all-linear', setting freeze_vit to True will cancel adding LoRA modules to vit part. Default is True.
  - Note: **Here vit is not limited to vision_tower, but also includes audio_tower**. For Omni models, if you only want to add LoRA to vision_tower but not audio_tower, you can modify [this code](https://github.com/modelscope/ms-swift/blob/a5d4c0a2ce0658cef8332d6c0fa619a52afa26ff/swift/llm/model/model_arch.py#L544-L554).
- 🔥freeze_aligner: This parameter only affects multimodal models and can be used in both full parameter training and LoRA training, but produces different effects. In full parameter training, setting freeze_aligner to True will freeze aligner (also called projector) part weights; in LoRA training with `target_modules` set to 'all-linear', setting freeze_aligner to True will cancel adding LoRA modules to aligner part. Default is True.

Full parameter training:
- freeze_parameters: Prefixes of parameters to be frozen, default is `[]`.
- freeze_parameters_regex: Regular expression for parameters to be frozen, default is None.
- freeze_parameters_ratio: Ratio of parameters to freeze from bottom to top, default is 0. Can be set to 1 to freeze all parameters, combined with `trainable_parameters` to set trainable parameters. Except for 0/1, this parameter is incompatible with pp parallelism.
- trainable_parameters: Prefixes of additional trainable parameters, default is `[]`.
- trainable_parameters_regex: Regular expression matching additional trainable parameters, default is None.

LoRA training:
- adapter_load: Path to load adapter weights, used for LoRA resuming training, default is None. LoRA resuming training method is consistent with full parameter training, please pay attention to the meaning of `--finetune` parameter.
- 🔥target_modules: Specify suffixes of LoRA modules, for example: you can set `--target_modules linear_qkv linear_proj`. Default is `['all-linear']`, meaning all linear layers are set as target_modules.
  - Note: Behavior of 'all-linear' differs between LLM and multimodal LLM. In LLM, it automatically finds all linear layers except lm_head and attaches tuners; **in multimodal LLM, it defaults to only attaching tuners to LLM, and this behavior can be controlled by `freeze_llm`, `freeze_vit`, `freeze_aligner`**.
  - Note: If you need to set all routers as target_modules, you can additionally set `--target_modules all-router ...`, for example: `--target_modules all-router all-linear`.
  - Linear layer suffix names differ between transformers and Megatron. In Megatron, `linear_proj` represents `o_proj`, `linear_qkv` represents concatenated `q_proj, k_proj, v_proj`, `linear_fc1` represents concatenated `gate_proj`, `up_proj`, `linear_fc2` represents `down_proj`.
- 🔥target_regex: Specify regex expression for LoRA modules, default is `None`. If this value is passed, target_modules parameter becomes ineffective.
- 🔥modules_to_save: After attaching tuner, additionally specify a portion of original model modules to participate in training and storage. Default is `[]`. For example, set `--modules_to_save word_embeddings output_layer`, in LoRA training, unlock `word_embeddings` and `output_layer` layers for training, and weight information of these two parts will be saved eventually.
- 🔥lora_rank: Default is `8`.
- 🔥lora_alpha: Default is `32`.
- lora_dropout: Default is `0.05`.
- lora_bias: Default is `'none'`, selectable values: 'none', 'all'. If you want to make all bias trainable, you can set to `'all'`.
- use_rslora: Default is `False`, whether to use `RS-LoRA`.

**Mcore-Bridge Parameters**
- 🔥load_safetensors: Default is False, whether to load weights directly from safetensors.
- 🔥save_safetensors: Default is False, whether to save directly as safetensors weights. Note, if this parameter is set to True, optimizer weights, random state, and other resuming training content won't be stored.
- model: model_id or model_path of safetensors weights. Default is None.
- model_type: Model type. Introduction reference [ms-swift command line parameters documentation](../Instruction/Command-line-parameters.md).
- adapters: adapter_id or adapter_path of safetensors format LoRA incremental weights. Default is `[]`.
- ref_model: model_id or model_path of ref_model safetensors weights. Required when using grpo, dpo, kto algorithms with full parameter training. Default is None, set to `--model`.
- ref_adapters: List of adapter_id or adapter_path of ref_adapters safetensors weights (currently only supports length 1), default is `[]`.
- use_hf: Control whether model download, dataset download, and model push use ModelScope or HuggingFace. Default is False, using ModelScope.
- hub_token: Hub token. ModelScope hub token can be viewed [here](https://modelscope.cn/my/myaccesstoken). Default is None.
- merge_lora: Whether to store merged weights. Default is None, if `save_safetensors` is set to True, default value is `True`, otherwise False. That is, by default, when storing in safetensors format, LoRA will be merged; when storing in torch_dist format, LoRA won't be merged.
- max_shard_size: Maximum size of safetensors format storage files, default '5GB'.
- 🔥offload_bridge: Megatron exports use CPU main memory to store vLLM updated HF format weights to reduce GPU memory usage. Default is False.

## Training Parameters

Megatron training parameters inherit from Megatron parameters and basic parameters (**sharing dataset, template and other parameters with ms-swift, also supporting ms-swift specific model parameters**). Basic parameters content can be referenced [here](../Instruction/Command-line-parameters.md#basic-parameters). Additionally includes the following parameters:

- add_version: Add extra directory `'<version>-<timestamp>'` on `save` to prevent weight overwriting, default is True.
- check_model: Check local model files for corruption or modification and provide prompts, default is True. **For offline environments, please set to False**.
- padding_free: Flatten data in a batch to avoid data padding, thereby reducing memory usage and accelerating training. Default is True.
  - To customize attention_mask, you can set `--padding_free false`.
  - Note: **Megatron-SWIFT training features prioritize padding_free format**, unless special circumstances, please don't modify this value.
- mlp_padding_free: Default is False. Used when padding_free is set to false, to optimize MLP with padding_free. This can improve training speed and reduce memory usage while customizing attention_mask.
- vit_gradient_checkpointing: Whether to enable gradient_checkpointing for vit part during multimodal model training. Default is True. (**Megatron-SWIFT's vit implementation uses transformers implementation**)
- attn_impl: Set attn_impl implementation for vit part during multimodal model training. Default is 'flash_attn'.
- vit_lr: When training multimodal large models, this parameter specifies vit learning rate, default is None, equal to learning_rate. Usually used in combination with `--freeze_vit`, `--freeze_aligner` parameters.
  - Tip: The "learning rate" printed in logs is the llm learning rate.
- aligner_lr: When training multimodal large models, this parameter specifies aligner learning rate, default is None, equal to learning_rate.
- gradient_checkpointing_kwargs: Parameters passed to `torch.utils.checkpoint`. For example, set `--gradient_checkpointing_kwargs '{"use_reentrant": false}'`. Default is None. This parameter only takes effect for `vit_gradient_checkpointing`.
- 🔥packing: Pack data samples of different lengths into uniform length samples, achieving load balancing across nodes and processes during training (avoiding long texts slowing down short text training speed), thereby improving GPU utilization and maintaining stable memory usage. When using `--attention_backend flash`, it ensures different sequences within packed samples are independent and invisible to each other (except Qwen3-Next, which contains linear-attention). This parameter defaults to `False`. All Megatron-SWIFT training tasks support this parameter. Note: **packing reduces dataset sample count, please adjust gradient accumulation count and learning rate accordingly**.
- packing_length: Packing length. Default is None, set to max_length.
- packing_num_proc: Number of packing processes, default is 1. Note that different `packing_num_proc` values result in different final packed datasets. (This parameter doesn't take effect in streaming packing). Usually doesn't need modification, as packing speed is much faster than tokenize speed.
- streaming: Stream reading and processing datasets, default False. (Streaming dataset randomness isn't thorough, which may cause severe loss fluctuations.)
  - Note: Because streaming datasets can't obtain their length, `--train_iters` parameter needs to be set. Setting `max_epochs` parameter ensures training exits when reaching corresponding epochs and validates/saves weights.
  - Note: Streaming datasets can skip preprocessing waiting, overlapping preprocessing time with training time. Preprocessing for streaming datasets is only performed on rank0 and synchronized to other processes through data distribution, **its efficiency is usually inferior to non-streaming datasets using data sharding reading method**. When training world_size is large, preprocessing and data distribution become training bottlenecks.
- lazy_tokenize: Whether to use lazy_tokenize. If this parameter is set to False, all dataset samples will be tokenized before training (for multimodal models, this includes reading images from disk). This parameter defaults to None, False in LLM training, and True in MLLM training to save memory.
- enable_dft_loss: Whether to use [DFT](https://arxiv.org/abs/2508.05629) (Dynamic Fine-Tuning) loss in SFT training, default is False.
- enable_channel_loss: Enable channel loss, default is `False`. You need to prepare "channel" field in dataset, ms-swift will group and calculate loss based on this field (if "channel" field isn't prepared, it's grouped as default `None` channel). Dataset format reference [channel loss](../Customization/Custom-dataset.md#channel-loss). Channel loss is compatible with packing/padding_free/loss_scale technologies.
- new_special_tokens: Special tokens to be added. Default is `[]`. Examples reference [here](https://github.com/modelscope/ms-swift/blob/main/examples/megatron/lora/new_special_tokens.sh).
  - Note: You can also pass file paths ending with `.txt`, with each line being one special token.
- 🔥task_type: Default is 'causal_lm'. Options are 'causal_lm', 'seq_cls'.
- num_labels: This parameter needs to be specified for classification models (i.e., `--task_type seq_cls`). Represents number of labels, default is None.
- problem_type: This parameter needs to be specified for classification models (i.e., `--task_type seq_cls`). Options are 'regression', 'single_label_classification', 'multi_label_classification'. Default is None, if model is reward_model or num_labels is 1, this parameter is 'regression', otherwise it's 'single_label_classification'.
- 🔥save_strategy: Save strategy, options are 'steps' and 'epochs'. Default is 'steps'. When set to 'epoch', 'save_interval' and 'eval_interval' are forced to 1, meaning weights are saved every epoch, 'save_retain_interval' can be set to integer, representing how many epochs to store retained checkpoints.

## RLHF Parameters

In addition to inheriting training parameters, also supports the following parameters:
- 🔥rlhf_type: Default is 'dpo'. Currently options are 'dpo', 'grpo', 'kto', and 'rm'.
- loss_scale: Override loss_scale in [basic parameters](../Instruction/Command-line-parameters.md). Default is 'last_round'.
- calculate_per_token_loss: Override Megatron parameters, default is False.

### DPO Parameters
- ref_load: Ref_model loading path. Required when using DPO/GRPO/KTO algorithms with full parameter training. Default is None, i.e., set to `load`.
- ref_adapter_load: Path to load ref_adapter weights, default is None. If you want to use SFT-generated LoRA weights for DPO, use "ms-swift>=3.8", and set `--adapter_load sft_ckpt --ref_adapter_load sft_ckpt --finetune true` during training. For resuming training in this scenario, set `--adapter_load rlhf_ckpt --ref_adapter_load sft_ckpt --finetune false`.
- beta: Same meaning as [TRL](https://huggingface.co/docs/trl/main/en/dpo_trainer#trl.DPOConfig). Parameter controlling deviation degree from reference model. Higher beta values mean smaller deviation from reference model. For IPO loss function (loss_type="ipo"), beta is the regularization parameter mentioned in the [paper](https://huggingface.co/papers/2310.12036). Default is 0.1.
- 🔥rpo_alpha: Parameter from [RPO paper](https://huggingface.co/papers/2404.19733), used to control weight of NLL term in loss function (i.e., SFT loss), `loss = dpo_loss + rpo_alpha * sft_loss`, paper recommends setting to `1.`. Default is `None`, meaning SFT loss isn't introduced by default.
  - **Note**: In "ms-swift<3.8", default value was `1.`. In "ms-swift>=3.8", default value changed to `None`.
- reference_free: Whether to ignore provided reference model and implicitly use a reference model that assigns equal probability to all responses. Default is False.
- label_smoothing: Default is 0.
- f_divergence_type: Default is `reverse_kl`. Options reference [TRL documentation](https://huggingface.co/docs/trl/main/en/dpo_trainer).
- loss_type: Default is 'sigmoid'. Options reference [TRL documentation](https://huggingface.co/docs/trl/main/en/dpo_trainer#loss-functions).

### KTO Parameters
- ref_load: Same meaning as DPO.
- ref_adapter_load: Same meaning as DPO.
- beta: Parameter controlling deviation degree from ref_model. Higher beta means smaller deviation from ref_model. Default is `0.1`.
- loss_type: Default is 'kto'. Options reference [TRL documentation](https://huggingface.co/docs/trl/main/en/kto_trainer#trl.KTOConfig.loss_type).
- desirable_weight: Counteract imbalance between desirable and undesirable quantities, weight desirable loss by this coefficient, default is `1.`.
- undesirable_weight: Counteract imbalance between desirable and undesirable quantities, weight undesirable loss by this coefficient, default is `1.`.

### RM Parameters
- center_rewards_coefficient: Coefficient to incentivize reward model to output rewards with zero mean, see this [paper](https://huggingface.co/papers/2312.09244). Recommended value: 0.01.

### GRPO Parameters
- ref_load: Same meaning as DPO.
- ref_adapter_load: Same meaning as DPO.
- beta: KL regularization coefficient, default is 0.04, when set to 0, ref model isn't loaded.
- micro_batch_size: Batch size per device, default is 1.
- global_batch_size: Total batch size, equivalent to `micro_batch_size * data_parallel_size * gradient_accumulation_steps`. Default is 16.
- steps_per_generation: Number of optimization steps per generation round, i.e., multiple of sampling batch size relative to global_batch_size, default is 1.
- generation_batch_size: Sampling batch size, needs to be multiple of global_batch_size, default equals global_batch_size*steps_per_generation.
- num_generations: Number of samples per prompt, G value in paper, default is 8.
- reward_funcs: GRPO algorithm reward functions, options are `accuracy`, `format`, `cosine`, `repetition`, and `soft_overlong`, see swift/plugin/orm.py. You can also define your own reward functions in plugin. Default is `[]`.
- reward_weights: Weight for each reward function. Must match total number of reward functions and reward models. Default is None, meaning all rewards have equal weight of `1.0`.
  - Tip: If GRPO training includes `--reward_model`, it's added at the end position of reward functions.
- truncation_strategy: Handling method for inputs exceeding `max_length`, supports `delete` and `left`, representing deletion and left truncation, default is `left`. Note for multimodal models,
left truncation may truncate multimodal tokens causing model forward shape mismatch errors. Using `delete` method, for oversized data and encoding failure examples, other data will be resampled from original dataset as supplement.
- loss_type: Loss normalization type, options are ['grpo', 'bnpo', 'dr_grpo'], default is 'grpo', see this [pr](https://github.com/huggingface/trl/pull/3256#discussion_r2033213348).
- log_completions: Whether to log model generation content during training, default is False.
- vllm_mode: vLLM integration mode, options are `server` and `colocate`. Server mode uses `swift rollout` launched vLLM server for sampling, colocate mode deploys vLLM internally. When using server mode,
- vllm_mode server parameters
  - vllm_server_host: vLLM server host address, default is None.
  - vllm_server_port: vLLM server port, default is 8000.
  - vllm_server_base_url: vLLM server Base URL (e.g., http://local_host:8000), default is None. When set, ignores host and port settings.
  - vllm_server_timeout: Timeout for connecting to vLLM server, default is 240s.
  - vllm_server_pass_dataset: Pass additional dataset information to vLLM server for multi-round training.
  - async_generate: Asynchronous rollout to improve training speed, note that when enabled, sampling uses model from previous round update, doesn't support multi-round scenarios. Default `false`.
  - SWIFT_UPDATE_WEIGHTS_BUCKET_SIZE: Environment variable, controls transmission bucket size during weight synchronization (bucket size), applicable to full parameter training in Server Mode, unit is MB, default value is 512 MB.
- vllm_mode colocate parameters (more parameter support reference [vLLM parameters](#vLLM-parameters).)
  - vllm_gpu_memory_utilization: vllm passthrough parameter, default is 0.9.
  - vllm_max_model_len: vllm passthrough parameter, default is None.
  - vllm_enforce_eager: vllm passthrough parameter, default is False.
  - vllm_limit_mm_per_prompt: vllm passthrough parameter, default is None.
  - vllm_enable_prefix_caching: vllm passthrough parameter, default is True.
  - vllm_tensor_parallel_size: TP parallel count, default is `1`.
  - vllm_enable_lora: Support vLLM Engine loading LoRA adapter, default is False. Used to accelerate LoRA training weight synchronization, see [documentation](../Instruction/GRPO/GetStarted/GRPO.md#weight-synchronization-acceleration).
  - sleep_level: Release vLLM memory during training, options are [0, 1, 2], default is 0, no release.
  - offload_optimizer: Whether to offload optimizer parameters during vLLM inference, default is False.
  - offload_model: Whether to offload model during vLLM inference, default is False.
- num_iterations: Number of updates per data item, $\mu$ value in [GRPO paper](https://arxiv.org/abs/2402.03300), default is 1.
- epsilon: Clip coefficient, default is 0.2.
- epsilon_high: Upper clip coefficient, default is None, when set, forms [epsilon, epsilon_high] clipping range with epsilon.
- dynamic_sample: Filter out data with zero reward standard deviation in group, resample new data, default is False.
- max_resample_times: Limit resampling times under dynamic_sample setting, default 3 times.
- overlong_filter: Skip samples with overlong truncation, don't participate in loss calculation, default is False.
- delta: Upper bound clipping value for bilateral GRPO in [INTELLECT-2 tech report](https://huggingface.co/papers/2505.07291). If set, recommended to be greater than 1 + epsilon. Default is None.
- importance_sampling_level: Control importance sampling ratio calculation, options are `token` and `sequence`, `token` mode retains original log probability ratio for each token, `sequence` mode averages log probability ratios for all valid tokens in sequence. [GSPO paper](https://arxiv.org/abs/2507.18071) uses sequence-level calculation to stabilize training, default is `token`.
- scale_rewards: Specify reward scaling strategy. Options include `group` (scale by within-group standard deviation), `batch` (scale by entire batch standard deviation), `none` (no scaling). In ms-swift < 3.10 versions, this parameter was boolean type, `true` corresponds to `group`, `false` corresponds to `none`. Default value is bound to `advantage_estimator`: `grpo` corresponds to `group`, `rloo` corresponds to `none`, `reinforce_plus_plus` corresponds to `batch`.
- rollout_importance_sampling_mode: Training-inference inconsistency correction mode, options are `token_truncate`, `token_mask`, `sequence_truncate`, `sequence_mask`. Default is None, correction not enabled. See [documentation](../Instruction/GRPO/AdvancedResearch/training_inference_mismatch.md) for details.
- rollout_importance_sampling_threshold: Threshold for importance sampling weights, used to truncate or mask extreme weights. Default is 2.0.
- log_rollout_offpolicy_metrics: When `rollout_importance_sampling_mode` is not set, whether to log training-inference inconsistency diagnostic metrics (KL, PPL, χ², etc.). When `rollout_importance_sampling_mode` is set, metrics are automatically logged. Default is False.

Built-in reward function parameters reference [documentation](../Instruction/Command-line-parameters.md#reward-function-parameters)

## Export Parameters

This section introduces parameters for `megatron export` (requires "ms-swift>=3.10"). For `swift export` export commands, please reference [ms-swift command line parameters documentation](../Instruction/Command-line-parameters.md#export-parameters). `megatron export` supports distributed and multi-node export compared to `swift export`. Megatron export parameters inherit from Megatron parameters and basic parameters.
- 🔥to_mcore: Convert HF format weights to Megatron format. Default is False.
- 🔥to_hf: Convert Megatron format weights to HF format. Default is False.
- 🔥merge_lora: Default is None, if `to_hf` is set to True, default value is `True`, otherwise False. That is, by default, when storing in safetensors format, LoRA will be merged; when storing in torch_dist format, LoRA won't be merged. Merged weights are stored in `--save` directory.
  - Note: Since transformers and Megatron model structures aren't necessarily identical (e.g., transformers' Qwen3-VL-Moe expert part isn't Linear implementation but Parameters), some models can't be converted (but Qwen3-VL-Moe with only linear_proj and linear_qkv LoRA training supports conversion). However, most models support LoRA conversion, such as: Qwen3-Moe, Qwen3-Omni-Moe, GLM4.5-V, etc.
- 🔥test_convert_precision: Test precision error of HF and Megatron format weight conversion. Default is False.
- test_convert_dtype: Dtype used for conversion precision testing, default is 'float32'.
- exist_ok: If `args.save` exists, don't throw exception, perform overwrite. Default is False.
- device_map: Effective when `--test_convert_precision true` is set, controls HF model loading location, default is 'auto'. You can set to 'cpu' to save memory resources.