<!-- modelscope-docs: Command Line Parameters | llm-training-and-inference/user-guide/command-line-parameters/command-line-parameters_EN.md -->

# Command Line Parameters

Command line parameters are categorized into basic parameters, atomic parameters, integrated parameters, and model-specific parameters. The final parameter list used in command line is the integrated parameters. Integrated parameters inherit from basic parameters and some atomic parameters. Model-specific parameters are specific to particular models and can be set via `--model_kwargs` or environment variables. For Megatron-SWIFT command line parameters, please refer to the [Megatron-SWIFT Training Documentation](./Megatron-SWIFT Training.md).

Tips:
- To pass a list via command line, separate items with spaces. For example: `--dataset <dataset_path1> <dataset_path2>`.
- To pass a dict via command line, use JSON format. For example: `--model_kwargs '{"fps_max_frames": 12}'`.
- Parameters marked with 🔥 are important parameters. Users new to ms-swift should focus on these command line parameters first.

## Basic Parameters

- 🔥tuner_backend: Options are 'peft', 'unsloth'. Default is 'peft'.
- 🔥train_type: Options include: 'lora', 'full', 'longlora', 'adalora', 'llamapro', 'adapter', 'vera', 'boft', 'fourierft', 'reft'. Default is 'lora'.
- 🔥adapters: A list specifying adapter IDs/paths, default is `[]`.
  - In "ms-swift>=3.8", you can set `--adapters` during training to continue training after this LoRA, which is convenient for scenarios following LoRA SFT with DPO/GRPO. Note: In this case, the reference model (ref_model) is the original model. This behavior differs from first merging LoRA and then performing DPO/GRPO, where the reference model would be the merged model, potentially leading to different training results.
- external_plugins: List of external plugin Python files that will be registered into the plugin module. See example [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/grpo/plugin/run_external_reward_func.sh). Default is `[]`.
- seed: Default is 42.
- model_kwargs: Additional parameters for specific models. This parameter list will be logged during training/inference for reference. Example: `--model_kwargs '{"fps_max_frames": 12}'`. Default is None.
- load_args: When specifying `--resume_from_checkpoint`, `--model`, or `--adapters`, reads `args.json` from the saved files. Keys to read can be found in [base_args.py](https://github.com/modelscope/ms-swift/blob/main/swift/llm/argument/base_args/base_args.py). Default is True for inference and export, False for training.
- load_data_args: If set to True, additionally reads data parameters from `args.json`. Default is False.
- use_hf: Controls whether to use ModelScope or HuggingFace for model download, dataset download, and model push. Default is False (uses ModelScope).
- hub_token: Hub token. ModelScope hub token can be found [here](https://modelscope.cn/my/myaccesstoken). Default is None.
- custom_register_path: List of paths to `.py` files for custom model, conversation template, and dataset registration. Default is `[]`.
- ddp_timeout: Default is 18000000 seconds.
- ddp_backend: Options are "nccl", "gloo", "mpi", "ccl", "hccl", "cncl", "mccl". Default is None (auto-select).
- ignore_args_error: Used for notebook compatibility. Default is False.

### Model Parameters
- 🔥model: Model ID or local model path. For custom models, use with `model_type` and `template`. Refer to [Custom Models](../Customization/Custom Models.md). Default is None.
- model_type: Model type. Same model architecture, template, and model loading process are defined as one model_type. Default is None, automatically selected based on `--model` suffix and architectures property in config.json.
- model_revision: Model version, default is None.
- task_type: Default is 'causal_lm'. Options are 'causal_lm', 'seq_cls', 'embedding'. Examples for seq_cls can be found [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/seq_cls), embedding examples [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/embedding).
- 🔥torch_dtype: Data type for model weights, supports `float16`, `bfloat16`, `float32`. Default is None, read from config.json.
- attn_impl: Attention implementation, options include 'sdpa', 'eager', 'flash_attention_2', 'flash_attention_3', etc. Default is None, read from config.json.
  - Note: Not all implementations may be supported, depending on the specific model's support.
  - If set to 'flash_attn' (for backward compatibility), it uses 'flash_attention_2'.
- new_special_tokens: Special tokens to be added. Default is `[]`. Example reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/new_special_tokens).
  - Note: You can also pass a file path ending with `.txt`, with each line containing one special token.
- num_labels: Required for classification models (`--task_type seq_cls`). Represents number of labels, default is None.
- problem_type: Required for classification models (`--task_type seq_cls`). Options are 'regression', 'single_label_classification', 'multi_label_classification'. Default is None, automatically set based on num_labels and dataset type.
- rope_scaling: RoPE type, supports `linear`, `dynamic`, `yarn`, or directly pass a JSON string: `"{\"factor\":2.0,\"type\":\"yarn\"}"`. Use together with `max_model_len`. Default is None.
- max_model_len: When using `rope_scaling`, you can set `max_model_len` to calculate the `factor` multiple for RoPE. The final `max_position_embeddings` will be set to the original value multiplied by `factor`. If `rope_scaling` is a JSON string, this value has no effect.
- device_map: Device map configuration for the model, e.g., 'auto', 'cpu', JSON string, JSON file path. Default is None, automatically set based on device and distributed training conditions.
- max_memory: When device_map is set to 'auto' or 'sequential', model weights are assigned to devices based on max_memory, e.g., `--max_memory '{0: "20GB", 1: "20GB"}'`. Default is None.
- local_repo_path: Some models depend on GitHub repos during loading. To avoid network issues with `git clone`, you can directly use a local repo. This parameter requires the local repo path. Default is `None`.
- init_strategy: Initializes all uninitialized parameters in the model during loading. Options are 'zero', 'uniform', 'normal', 'xavier_uniform', 'xavier_normal', 'kaiming_uniform', 'kaiming_normal', 'orthogonal'. Default is None.

### Data Parameters
- 🔥dataset: List of dataset IDs or paths. Default is `[]`. Each dataset input format is: `dataset_id or dataset_path:subset#sample_count`, where subset and sample count are optional. Local datasets support jsonl, csv, json, folders, etc. Open-source datasets can be used offline by git cloning to local and passing the folder path. Custom dataset format reference [Custom Datasets](../Customization/Custom Datasets.md). You can pass `--dataset <dataset1> <dataset2>` to use multiple datasets.
  - Subset: This parameter only takes effect when dataset is an ID or folder. If subsets are specified during registration and there's only one subset, it defaults to the registered subset; otherwise, defaults to 'default'. You can use `/` to select multiple subsets, e.g., `<dataset_id>:subset1/subset2`. You can also use 'all' to select all subsets, e.g., `<dataset_id>:all`.
  - Sample Count: Uses complete dataset by default. If sample count is less than total samples, random selection is performed (without replacement). If sample count exceeds total samples, additional random sampling of `sample_count % total_samples` is performed, with data samples repeated `sample_count // total_samples` times. Note: Streaming datasets only perform sequential sampling. If `--dataset_shuffle false` is set, non-streaming datasets also perform sequential sampling.
- 🔥val_dataset: List of validation set IDs or paths. Default is `[]`.
- 🔥split_dataset_ratio: Ratio to split validation set from training set when val_dataset is not specified. Default is 0. (no splitting from training set).
  - Note: Default value was 0.01 in "ms-swift<3.6".
- data_seed: Dataset random seed, default is 42.
- 🔥dataset_num_proc: Number of processes for dataset preprocessing, default is 1.
- 🔥load_from_cache_file: Whether to load dataset from cache, default is True.
  - Note: Recommended to set to False during debugging.
- dataset_shuffle: Whether to shuffle the dataset. Default is True.
  - Note: CPT/SFT shuffling includes two parts: dataset shuffling controlled by `dataset_shuffle`, and train_dataloader shuffling controlled by `train_dataloader_shuffle`.
- val_dataset_shuffle: Whether to shuffle val_dataset. Default is False.
- streaming: Stream reading and processing of datasets, default False.
  - Note: Requires setting `--max_steps` as streaming datasets cannot determine their length. You can achieve equivalent training to `--num_train_epochs` by setting `--save_strategy epoch` with a large max_steps. Alternatively, set `max_epochs` to ensure training exits after corresponding epochs and validates/saves weights.
  - Note: Streaming datasets skip preprocessing wait time, overlapping preprocessing time with training time. Preprocessing for streaming datasets is only performed on rank0 and synchronized to other processes via data distribution, which is typically less efficient than the data sharding approach used by non-streaming datasets. When training world_size is large, preprocessing and data distribution become training bottlenecks.
- interleave_prob: Default is None. When combining multiple datasets, `concatenate_datasets` function is used by default; if this parameter is set, `interleave_datasets` function is used instead. This parameter is typically used for combining streaming datasets and is passed to the `interleave_datasets` function.
- stopping_strategy: Options are "first_exhausted", "all_exhausted", default is "first_exhausted". Passed to interleave_datasets function.
- shuffle_buffer_size: Specifies the shuffle buffer size for streaming datasets, default is 1000. Only effective when `dataset_shuffle` is set to true.
- download_mode: Dataset download mode, includes `reuse_dataset_if_exists` and `force_redownload`, default is reuse_dataset_if_exists.
- columns: Used for column mapping of datasets to make them compatible with AutoPreprocessor processing format. See [here](../Customization/Custom Datasets.md). You can pass a JSON string, e.g., `'{"text1": "query", "text2": "response"}'`, which maps "text1" to "query" and "text2" to "response" in the dataset, and query-response format can be processed by AutoPreprocessor. Default is None.
- strict: If True, throws error immediately when any row has issues; otherwise, discards problematic data samples. Default is False.
- 🔥remove_unused_columns: Whether to remove unused columns from the dataset, default is True.
  - If set to False, additional dataset columns are passed to the trainer's `compute_loss` function, facilitating custom loss functions.
  - Default value is False for GPRO.
- 🔥model_name: Only used for self-cognition tasks, only effective for `swift/self-cognition` dataset, replaces `{{NAME}}` placeholder in the dataset. Pass Chinese and English model names separated by space, e.g., `--model_name Xiao Huang 'Xiao Huang'`. Default is None.
- 🔥model_author: Only used for self-cognition tasks, only effective for `swift/self-cognition` dataset, replaces `{{AUTHOR}}` placeholder in the dataset. Pass Chinese and English author names separated by space, e.g., `--model_author 'ModelScope' 'ModelScope'`. Default is None.
- custom_dataset_info: Path to JSON file for custom dataset registration, reference [Custom Datasets](../Customization/Custom Datasets.md). Default is `[]`.

### Template Parameters
- 🔥template: Conversation template type. Default is None, automatically selects corresponding template type for the model.
- 🔥system: Custom system field, can pass string or txt file path. Default is None, uses template's default system.
  - Note: System in dataset has highest priority, followed by `--system`, then `default_system` defined in template.
- 🔥max_length: Maximum token length for single sample. Default is None, set to model's maximum supported token length (max_model_len).
  - Note: For PPO, GRPO, and inference, max_length represents max_prompt_length.
- truncation_strategy: How to handle when single sample tokens exceed `max_length`, supports `delete`, `left`, and `right`, representing deletion, left truncation, and right truncation, default is 'delete'.
  - Not recommended to set truncation_strategy to `left` or `right` for multimodal model training, as this may cause image tokens to be truncated leading to errors (to be optimized).
- 🔥max_pixels: Maximum pixel count (H*W) for multimodal model input images, scales images exceeding this limit. Default is None (no maximum pixel limit).
- 🔥agent_template: Agent template determines how to convert tool lists to system, how to extract toolcall from model responses, and determines the template format for `{"role": "tool_call", "content": "xxx"}`, `{"role": "tool_response", "content": "xxx"}`. Options include "react_en", "hermes", "glm4", "qwen_en", "toolbench", etc. See more [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/agent_template/__init__.py). Default is None, automatically selected based on model type.
- norm_bbox: Controls how to scale bounding boxes (bbox). Options are 'norm1000' and 'none'. 'norm1000' scales bbox coordinates to one-thousandth, while 'none' means no scaling. Default is None, automatically selected based on model.
- use_chat_template: Uses chat template or generation template. Default is `True`.
  - Note: `swift pt` defaults to False, using generation template.
- 🔥padding_free: Flattens data in a batch to avoid padding, reducing memory usage and speeding up training. Default is False. Currently supports CPT/SFT/DPO/GRPO/GKD.
  - Note: Use padding_free with `--attn_impl flash_attn` and "transformers>=4.44", see [this PR](https://github.com/huggingface/transformers/pull/31629). (same as packing)
  - Supported multimodal models have same packing support. Compared to packing, padding_free doesn't consume extra time and space. Note: Use "ms-swift>=3.6", follow [this PR](https://github.com/modelscope/ms-swift/pull/4838).
  - Megatron-SWIFT uses padding_free by default (`qkv_format='thd'`), no additional setting required.
- padding_side: Padding side when training with `batch_size>=2`, options are 'left', 'right', default is 'right'. (For inference with batch_size>=2, only left padding is performed).
  - Note: PPO and GKD default to 'left'.
- loss_scale: Training token loss weight settings. Default is `'default'`, meaning all responses (including history) calculate cross-entropy loss with weight 1, ignoring loss for `tool_response` corresponding to agent_template. Options are 'default', 'last_round', 'all', 'ignore_empty_think', and agent-specific loss_scales: 'react', 'hermes', 'qwen', 'agentflan', 'alpha_umi'. Agent part can be found in [Plugin Documentation](../Customization/Plugin.md) and [Agent Documentation](./Agent Support.md).
  - 'last_round': Only calculates loss for the last round response.
  - 'all': Calculates loss for all tokens.
  - 'ignore_empty_think': Based on `'default'`, ignores loss calculation for empty `'