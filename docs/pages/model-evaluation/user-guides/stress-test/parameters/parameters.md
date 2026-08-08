<!-- modelscope-docs: Parameter Description | model-evaluation/user-guides/stress-test/parameters/parameters_EN.md -->

# Parameter Description

Execute `evalscope perf --help` to get the full parameter description:


## Basic Settings
- `--model` The name of the model to test.
- `--url` Specify the API address, supporting both `/chat/completion` and `/completion` endpoints.
- `--name` The name for results in wandb/swanlab database and the results database. Defaults to: `{model_name}_{current_time}`. Optional.
- `--api` Specify the service API. Currently supports `[openai|local|local_vllm]`.
  - If set to `openai`, it uses an OpenAI-compatible API, requiring the `--url` parameter.
  - If set to `local`, it uses a local file as the model and performs inference using transformers. `--model` should be the path to the model file, or a model_id, which will be automatically downloaded from ModelScope (e.g., `Qwen/Qwen2.5-0.5B-Instruct`).
  - If set to `local_vllm`, it uses a local file as the model and starts a vLLM inference service. `--model` should be the path to the model file, or a model_id, which will be automatically downloaded from ModelScope (e.g., `Qwen/Qwen2.5-0.5B-Instruct`).
  - You can also define a custom API; please refer to the [Custom API Guide](./custom.md/#custom-request-api).
- `--port` The port for the local inference service. Defaults to 8877. Only valid for `local` and `local_vllm`.
- `--attn-implementation` The attention implementation method. Defaults to None. Options: `[flash_attention_2|eager|sdpa]`. Only valid when `api` is `local`.
- `--api-key` API key. Optional.
- `--debug` Output debug information.

## Network Configuration
- `--connect-timeout` Network connection timeout. Defaults to 600s.
- `--read-timeout` Network read timeout. Defaults to 600s.
- `--headers` Additional HTTP headers, formatted as `key1=value1 key2=value2`. These headers will be used for every query.
- `--no-test-connection` Skip the connection test and start stress testing directly. Defaults to False.

## Request Control
- `--parallel` The number of concurrent requests. Multiple values can be passed, separated by spaces. Defaults to 1.
- `--number` The total number of requests to make. Multiple values can be passed, separated by spaces (must correspond one-to-one with `parallel`). Defaults to 1000.
- `--rate` The number of requests generated per second (not sent). Defaults to -1, meaning all requests are generated at time 0 with no interval. Otherwise, a Poisson process is used to generate request intervals.
  > [!NOTE]
> In this tool's implementation, request generation and sending are separate:
>   The `--rate` parameter controls the number of requests generated per second. Requests are placed into a request queue.
>   The `--parallel` parameter controls the number of workers sending requests. Workers fetch requests from the queue and send them, only sending the next request after receiving a reply to the previous one.
- `--log-every-n-query` Log every n queries. Defaults to 10.
- `--stream` Use SSE streaming output. Defaults to True. Note: `--stream` must be set to measure the Time to First Token (TTFT) metric; setting `--no-stream` disables streaming output.
- `--sleep-interval` Sleep time between each performance test, in seconds. Defaults to 5 seconds. This parameter helps avoid overloading the server.

## Prompt Settings
- `--max-prompt-length` Maximum input prompt length. Defaults to `131072`. Prompts longer than this will be discarded.
- `--min-prompt-length` Minimum input prompt length. Defaults to 0. Prompts shorter than this will be discarded.
- `--prefix-length` Length of the prompt prefix. Defaults to 0. Only valid for the `random` dataset.
- `--prompt` Specify the request prompt as a string or a local file. Takes precedence over `dataset`. When using a local file, specify the path with `@/path/to/file`, e.g., `@./prompt.txt`.
- `--query-template` Specify the query template as a `JSON` string or a local file. When using a local file, specify the path with `@/path/to/file`, e.g., `@./query_template.json`.
- `--apply-chat-template` Whether to apply the chat template. Defaults to None, and will be automatically selected based on whether the URL suffix is `chat/completion`.
- `--image-width` Image width for the random VL dataset. Defaults to 224.
- `--image-height` Image height for the random VL dataset. Defaults to 224.
- `--image-format` Image format for the random VL dataset. Defaults to 'RGB'.
- `--image-num` Number of images for the random VL dataset. Defaults to 1.
- `--image-patch-size` Patch size of the image, used only for local image token calculation. Defaults to 28.

## Dataset Configuration
- `--dataset` Can specify the following dataset modes:
  - **`openqa`**: Automatically downloads [OpenQA](https://www.modelscope.ai/datasets/AI-ModelScope/HC3-Chinese/summary) from ModelScope. Prompts are short, usually under 100 tokens. Specifying `dataset_path` will use the `question` field from the jsonl file as the prompt.
  - **`longalpaca`**: Automatically downloads [LongAlpaca-12k](https://www.modelscope.ai/datasets/AI-ModelScope/LongAlpaca-12k/dataPeview) from ModelScope. Prompts are long, usually over 6000 tokens. Specifying `dataset_path` will use the `instruction` field from the jsonl file as the prompt.
  - **`line_by_line`**: Requires `dataset_path`. Each line of the txt file is used as a prompt.
  - **`flickr8k`**: Automatically downloads [Flick8k](https://www.modelscope.ai/datasets/clip-benchmark/wds_flickr8k/dataPeview) from ModelScope to construct vision-language inputs. This is a large dataset, suitable for evaluating multimodal models. Does not support specifying `dataset_path`.
  - **`kontext_bench`**: Automatically downloads [Kontext-Bench](https://modelscope.ai/datasets/black-forest-labs/kontext-bench/dataPeview) from ModelScope to construct vision-language inputs. This is a smaller dataset, with approximately 1000 entries, suitable for quick evaluation of multimodal models. Does not support specifying `dataset_path`.
  - **`random`**: Generates prompts randomly based on `prefix-length`, `max-prompt-length`, and `min-prompt-length`. Requires `tokenizer-path`. [Usage example](./examples.md#using-the-random-dataset).
  - **`random_vl`**: Generates random image and text inputs, adding image-related parameters (`image-width`, `image-height`, `image-format`, `image-num`) on top of `random`. [Usage example](./examples.md#using-the-random-vision-language-dataset).
  - **`custom`**: Custom dataset parser. Refer to the [Custom Dataset Guide](custom.md/#custom-dataset).
- `--dataset-path` Path to the dataset file, used in conjunction with the dataset.

## Model Settings
- `--tokenizer-path` Optional. Specifies the path to the tokenizer weights, used to calculate the number of input and output tokens. Usually located in the same directory as the model weights.
- `--frequency-penalty` The frequency_penalty value.
- `--logprobs` Log probabilities.
- `--max-tokens` Maximum number of tokens that can be generated.
- `--min-tokens` Minimum number of tokens to generate. Not supported by all model services; please check the corresponding API documentation. For `vLLM>=0.8.1`, you need to additionally set `--extra-args '{"ignore_eos": true}'`.
- `--n-choices` Number of completion choices to generate.
- `--seed` Random seed. Defaults to None.
- `--stop` Tokens to stop generation.
- `--stop-token-ids` Set the IDs of tokens to stop generation.
- `--temperature` Sampling temperature. Defaults to 0.
- `--top-p` Top_p sampling.
- `--top-k` Top_k sampling.
- `--extra-args` Additional parameters to pass into the request body, formatted as a JSON string, e.g., `'{"ignore_eos": true}'`.

## Data Storage
- `--visualizer` Visualization tool. Options: `wandb` or `swanlab`. If set, metrics will be saved to the specified visualization tool.
- `--wandb-api-key` wandb API key, used to log in to the wandb server.
- `--swanlab-api-key` swanlab API key, used to log in to the swanlab server.
- `--outputs-dir` Output file path. Defaults to `./outputs`.

## Other Parameters
- `--db-commit-interval` Number of rows buffered before writing results to the SQLite database. Defaults to 1000.
- `--queue-size-multiplier` Maximum size of the request queue, calculated as `parallel * multiplier`. Defaults to 5.
- `--in-flight-task-multiplier` Maximum number of scheduled tasks, calculated as `parallel * multiplier`. Defaults to 2.