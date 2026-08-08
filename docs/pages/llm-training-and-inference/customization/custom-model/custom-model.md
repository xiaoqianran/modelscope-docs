<!-- modelscope-docs: Custom Models | llm-training-and-inference/customization/custom-model/custom-model_EN.md -->

# Custom Models

Built-in models in ms-swift can be used directly by specifying either `model_id` or `model_path`: `--model <model_id_or_path>`. ms-swift determines the `model_type` based on the suffix of the `model_id`/`model_path` and the `config.json` file.

Each `model_type` has a unique model architecture, template, and loading method. You can also manually override these by passing `--model_type` and `--template`. For a list of supported `model_type` and templates in ms-swift, please refer to [Supported Models and Datasets](../功能指引/Supported Models and Datasets.md).

The following sections explain how to register a new model and its corresponding template. For best practices, please refer to [Best Practices for Multimodal Model Registration](../最佳实践/MLLM-Registration.md).

## Model Registration

Custom models are typically registered using model registration. You can refer to the [built-in models](https://github.com/modelscope/ms-swift/blob/main/swift/llm/model/model/qwen.py), [built-in conversation templates](https://github.com/modelscope/ms-swift/blob/main/swift/llm/template/template/qwen.py), or example code in [examples](https://github.com/modelscope/ms-swift/blob/main/examples/custom). You can parse external registration content by specifying `--custom_register_path xxx.py` (convenient for users who installed via pip rather than git clone).

`register_model` registers the model in `MODEL_MAPPING`. Simply call the function `register_model(model_meta)` to complete model registration, where `model_meta` stores the model's metadata. The parameters for `ModelMeta` are as follows:

- `model_type`: Required. Model type, which also serves as the unique ID.
- `model_groups`: Required. Lists ModelScope/HuggingFace model IDs and local model paths. Running the [run_model_info.py](https://github.com/modelscope/ms-swift/blob/main/scripts/utils/run_model_info.py) script will automatically generate the [Supported Models Documentation](https://swift.readthedocs.io/en/latest/Instruction/Supported Models and Datasets.html) and automatically match the `model_type` based on the `--model` suffix.
- `template`: Required. Default template type when `--template` is not explicitly specified in the command line.
- `get_function`: Required. Function to load the model and tokenizer/processor (for multimodal models). For LLMs, this is typically set to `get_model_tokenizer_with_flash_attn`.
- `model_arch`: Model architecture. Defaults to None. Required for multimodal model training to determine the prefixes for llm/vit/aligner.
- `architectures`: The `architectures` field in `config.json`, used to automatically match the model to its corresponding `model_type`. Defaults to `[]`.
- `additional_saved_files`: Additional files that need to be saved during full-parameter training and merge-lora. Defaults to `[]`.
- `torch_dtype`: Default dtype when `torch_dtype` is not passed during model loading. Defaults to None, reading from `config.json`.
- `is_multimodal`: Whether it's a multimodal model. Defaults to False.
- `ignore_patterns`: File patterns to ignore when downloading files from the hub. Defaults to `[]`.

`register_template` registers conversation templates in `TEMPLATE_MAPPING`. Simply call the function `register_template(template_meta)` to complete template registration, where `template_meta` stores the template's metadata. The parameters for `TemplateMeta` are as follows:

- `template_type`: Required. Conversation template type, which also serves as the unique ID.
- `prefix`: Required. Prefix of the conversation template, typically containing system, bos_token, etc., independent of the multi-turn conversation loop. For example, qwen's prefix is `[]`.
- `prompt`: Required. Represents the part of the conversation template before `{{RESPONSE}}`. We use `{{QUERY}}` as the placeholder for the user query portion. For example, qwen's prompt is `['<|im_start|>user\n{{QUERY}}<|im_end|>\n<|im_start|>assistant\n']`.
- `chat_sep`: Required. Separator between turns in multi-turn conversations. If set to None, the template doesn't support multi-turn conversations. For example, qwen's chat_sep is `['<|im_end|>\n']`.
- `suffix`: Defaults to `[['eos_token_id']]`. Suffix portion of the conversation template, independent of the multi-turn conversation loop, typically the eos_token. For example, qwen's suffix is `['<|im_end|>']`.
- `template_cls`: Defaults to `Template`. Usually needs to be customized when defining templates for multimodal models, with custom `_encode`, `_post_encode`, and `_data_collator` functions.
- `system_prefix`: Defaults to None. Prefix for conversation templates containing system messages. We use `{{SYSTEM}}` as the system placeholder. For example, qwen's system_prefix is `['<|im_start|>system\n{{SYSTEM}}<|im_end|>\n']`.
  - Note: If the system is empty, `prefix` can be replaced by `system_prefix`, allowing you to write the prefix as containing the system prefix without setting `system_prefix`.
  - If `prefix` doesn't contain `{{SYSTEM}}` and `system_prefix` is not set, the template doesn't support system messages.
- `default_system`: Defaults to None. Default system message used when `--system` is not passed. For example, qwen's default_system is `'You are a helpful assistant.'`.
- `stop_words`: Defaults to `[]`. Additional stop words beyond eos_token and `suffix[-1]`. For example, qwen's stop_words is `['']`.
  - Note: During inference, the output response will filter out eos_token and `suffix[-1]`, but will retain additional stop_words.