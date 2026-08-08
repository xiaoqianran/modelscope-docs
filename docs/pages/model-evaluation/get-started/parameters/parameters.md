<!-- modelscope-docs: Parameter Description | model-evaluation/get-started/parameters/parameters_EN.md -->

Execute `evalscope eval --help` to get descriptions of all parameters.

## Model Parameters
- `--model`: The name of the model to be evaluated.
  - Specify the model's `id` on [ModelScope](https://modelscope.ai/), and the model will be automatically downloaded, e.g., [Qwen/Qwen2.5-0.5B-Instruct](https://modelscope.ai/models/Qwen/Qwen2.5-0.5B-Instruct/summary);
  - Specify a local path to the model, e.g., `/path/to/model`, and the model will be loaded from the local path;
  - When evaluating a model API service, specify the model ID corresponding to the service, e.g., `Qwen2.5-0.5B-Instruct`.
- `--model-id`: Alias for the model being evaluated, used for report display. Defaults to the last part of `model`, e.g., the `model-id` for `Qwen/Qwen2.5-0.5B-Instruct` is `Qwen2.5-0.5B-Instruct`.
- `--api-url`: Model API endpoint, defaults to `None`; supports passing local or remote OpenAI API format endpoints, e.g., `http://127.0.0.1:8000/v1`.
- `--api-key`: Model API endpoint key, defaults to `EMPTY`
- `--model-args`: Model loading parameters, in comma-separated `key=value` format; or pass as a JSON string, which will be parsed into a dictionary. Default parameters:
  - `revision`: Model version, defaults to `master`
  - `precision`: Model precision, defaults to `torch.float16`
  - `device_map`: Model device allocation, defaults to `auto`
- `--model-task`: Model task type, defaults to `text_generation`, options include `text_generation`, `image_generation`
- `--chat-template`: Model inference template, defaults to `None`, indicating the use of transformers' `apply_chat_template`; supports passing a Jinja template string to customize the inference template

## Model Inference Parameters
- `--generation-config`: Generation parameters, in comma-separated `key=value` format; or pass as a JSON string, which will be parsed into a dictionary:
  - `timeout`: Optional integer, request timeout in seconds.
  - `stream`: Optional boolean, whether to return responses in streaming mode (depends on the model).
  - `max_tokens`: Optional integer, maximum number of tokens to generate (depends on the model).
  - `top_p`: Optional float, uses nucleus sampling, where the model considers only tokens with cumulative probability mass of top_p.
  - `temperature`: Optional float, sampling temperature, range 0~2, higher values make output more random, lower values make it more deterministic.
  - `frequency_penalty`: Optional float, range -2.0~2.0, positive values penalize repeated tokens, reducing repetition. Supported only by OpenAI, Google, Grok, Groq, vLLM, and SGLang.
  - `presence_penalty`: Optional float, range -2.0~2.0, positive values penalize tokens that have already appeared, encouraging discussion of new topics. Supported only by OpenAI, Google, Grok, Groq, vLLM, and SGLang.
  - `logit_bias`: Optional dictionary, maps token IDs to bias values (-100~100), e.g., "42=10,43=-10". Supported only by OpenAI, Grok, and vLLM.
  - `seed`: Optional integer, random seed. Supported only by OpenAI, Google, Mistral, Groq, HuggingFace, and vLLM.
  - `do_sample`: Optional boolean, whether to use sampling strategy, otherwise greedy decoding is used. Supported only by Transformers models.
  - `top_k`: Optional integer, samples the next token from the top_k most likely tokens. Supported only by Anthropic, Google, HuggingFace, vLLM, and SGLang.
  - `logprobs`: Optional boolean, whether to return log probabilities of output tokens. Supported by OpenAI, Grok, TogetherAI, HuggingFace, llama-cpp-python, vLLM, and SGLang.
  - `top_logprobs`: Optional integer, returns the top_logprobs tokens with highest probabilities at each position along with their probabilities (range 0~20). Supported only by OpenAI, Grok, HuggingFace, vLLM, and SGLang.
  - `parallel_tool_calls`: Optional boolean, whether to support parallel tool calls during tool invocation (defaults to True). Supported only by OpenAI and Groq.
  - `max_tool_output`: Optional integer, maximum bytes for tool output. Defaults to 16*1024.
  - `extra_body`: Optional dictionary, extra request body sent to OpenAI-compatible services.
  - `extra_query`: Optional dictionary, extra query parameters sent to OpenAI-compatible services.
  - `extra_headers`: Optional dictionary, extra request headers sent to OpenAI-compatible services.
  - `height`: Optional integer, specific to image generation models, specifies image height.
  - `width`: Optional integer, specific to image generation models, specifies image width.
  - `num_inference_steps`: Optional integer, specific to image generation models, number of inference steps.
  - `guidance_scale`: Optional float, specific to image generation models, guidance scale.

Parameter passing examples:
```bash
# For example, pass parameters in key=value format
--model-args revision=master,precision=torch.float16,device_map=auto
--generation-config do_sample=true,temperature=0.5
# Or pass more complex parameters as JSON strings
--model-args '{"revision": "master", "precision": "torch.float16", "device_map": "auto"}'
--generation-config '{"do_sample":true,"temperature":0.5,"chat_template_kwargs":{"enable_thinking": false}}'
```

## Dataset Parameters
- `--datasets`: Dataset names, supports multiple datasets separated by spaces. Datasets will be automatically downloaded from ModelScope. Refer to the [Dataset List](./supported_dataset/llm.md) for supported datasets.
- `--dataset-args`: Evaluation dataset configuration parameters, passed as a JSON string, which will be parsed into a dictionary. Note that these must correspond to the values in the `--datasets` parameter:
  - `dataset_id` (or `local_path`): Can specify a local dataset path. If specified, the system will attempt to load data from the local path.
  - `review_timeout`: Optional float, timeout for evaluation samples in seconds, defaults to None (wait indefinitely). For code-related tasks, it's recommended to set a shorter timeout.
  - `prompt_template`: Prompt template for the evaluation dataset. If specified, prompts will be generated using this template. For example, the template for `gsm8k` is `Question: {query}\nLet's think step by step\nAnswer:`, where the dataset question will be filled into the `query` field of the template.
  - `system_prompt`: System prompt for the evaluation dataset.
  - `subset_list`: List of dataset subsets to evaluate. If specified, only subset data will be used.
  - `few_shot_num`: Number of few-shot examples.
  - `few_shot_random`: Whether to randomly sample few-shot data, defaults to `False`.
  - `shuffle`: Whether to shuffle data before evaluation, defaults to `False`.
  - `shuffle_choices`: Whether to shuffle option order before evaluation, defaults to `False`, supported only by multiple-choice datasets.
  - `metric_list`: List of metrics for the evaluation dataset. If specified, the given metrics will be used for evaluation. Currently, `acc` is supported by default; other metrics can be found in the dataset list.
  - `aggregation`: Aggregation method for evaluation results, defaults to `mean`. Other options include:
    - `mean_and_pass_at_k`: Calculates mean and `pass_at_k`. Requires specifying `repeats=k`, which automatically calculates the probability of at least one success in k attempts for the same sample. For example, for the `humaneval` dataset, specifying `repeats=5` will calculate the pass rate across 5 generations for the same sample.
    - `mean_and_vote_at_k`: Calculates mean and `vote_at_k`. Requires specifying `repeats=k`, which automatically calculates the voting result across k attempts for the same sample to determine the final result.
    - `mean_and_pass_hat_k`: Calculates mean and `pass_hat_k`. Requires specifying `repeats=k`, which automatically calculates the probability of all k attempts succeeding for the same sample. For example, for the `tau2_bench` dataset, specifying `repeats=3` will calculate the pass rate across 3 generations for the same sample.
  - `filters`: Filters for the evaluation dataset. If specified, the given filters will be applied to filter evaluation results, which can be used to process inference model outputs. Currently supported:
    - `remove_until {string}`: Filters out parts of the model output before the specified string. For example, for the `ifeval` dataset, specifying `{"remove_until": "