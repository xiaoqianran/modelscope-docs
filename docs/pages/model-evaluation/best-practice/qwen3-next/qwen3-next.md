<!-- modelscope-docs: Qwen3-Next Model Evaluation Best Practices | model-evaluation/best-practice/qwen3-next/qwen3-next_EN.md -->

Qwen3-Next is the next-generation foundational model in the Qwen series, achieving breakthrough progress in reasoning, instruction following, agent capabilities, and multilingual support. In this best practice guide, we will use the EvalScope framework to comprehensively evaluate the Qwen3-Next-80B-A3B-Instruct model as an example, covering both model service inference performance evaluation and model capability evaluation.

## Install Dependencies

First, install the [EvalScope](https://github.com/modelscope/evalscope) model evaluation framework:

```bash
pip install 'evalscope[app,perf]' -U
pip install git+https://github.com/huggingface/transformers.git@main
```

## Model Service Inference Performance Evaluation

First, we need to access the model's capabilities through an OpenAI API-compatible inference service for evaluation. It's worth noting that EvalScope also supports model inference evaluation using transformers; for details, please refer to the [documentation](https://evalscope.readthedocs.io/en/latest/get_started/basic_usage.html#id2).

In addition to deploying the model to a cloud service that supports the OpenAI interface, you can also choose to start the model locally using frameworks like vLLM or ollama. These inference frameworks can handle multiple concurrent requests well, thus accelerating the evaluation process.

Below, we'll use vLLM as an example to demonstrate how to start the Qwen3-Next-80B-A3B-Instruct model service locally and perform performance evaluation.

### Install Dependencies

Using the vLLM framework (requires the nightly version of vLLM and the latest version of transformers), install the following dependencies:
```shell
pip install vllm --pre --extra-index-url https://wheels.vllm.ai/nightly
```

### Start the Model Service

The following command can be used to create an API endpoint at `http://localhost:8801/v1` with a maximum context length of 8K tokens, using tensor parallelism across 4 GPUs:
```bash
VLLM_USE_MODELSCOPE=true VLLM_ALLOW_LONG_MAX_MODEL_LEN=1 vllm serve Qwen/Qwen3-Next-80B-A3B-Instruct --served-model-name Qwen3-Next-80B-A3B-Instruct --port 8801 --tensor-parallel-size 4 --max-model-len 8000 --gpu-memory-utilization 0.9 --max-num-seqs 32
```

> [!NOTE]
> - The environment variable `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` is currently required.
>
> - The default context length is 256K. If the server fails to start, consider reducing the context length to a smaller value, such as 8000, and the maximum number of sequences to 32.

### Start Load Testing

- Test environment: 4 * A100 80G
- Test model: Qwen3-Next-80B-A3B-Instruct
- Test data: randomly generated tokens of length 1024
- Test output length: 256 tokens
- Test concurrency levels: 1, 2, 4, 8, 16, 32

Run the following command:

```shell
evalscope perf \
    --url "http://127.0.0.1:8801/v1/chat/completions" \
    --parallel 1 2 4 8 16 32 \
    --number 5 10 20 40 80 160 \
    --model Qwen3-Next-80B-A3B-Instruct \
    --api openai \
    --dataset random \
    --min-prompt-length 1024 \
    --max-prompt-length 1024 \
    --min-tokens 256 \
    --max-tokens 256 \
    --tokenizer-path Qwen/Qwen3-Next-80B-A3B-Instruct \
    --extra-args '{"ignore_eos": true}'
```

For detailed parameter descriptions, please refer to [Performance Evaluation](https://evalscope.readthedocs.io/en/latest/user_guides/stress_test/quick_start.html).

An example output is as follows:

![image.png](https://sail-moe.oss-cn-hangzhou.aliyuncs.com/yunlin/images/evalscope/doc/qwen_next/vllm_perf.png)


## Model Capability Evaluation

Now, let's proceed with the model capability evaluation process.

Note: The subsequent evaluation steps are all based on the model service launched by vLLM. You can start the model service according to the steps in the previous model service performance evaluation section, or use a local model service. The model uses thinking mode by default.

### Build an Evaluation Collection (Optional)

To comprehensively evaluate the model's capabilities across various aspects, we can mix benchmarks supported by EvalScope to build a comprehensive evaluation collection. Below is an example of an evaluation collection that covers mainstream benchmarks, evaluating the model's code capabilities (LiveCodeBench), mathematical abilities (AIME2024, AIME2025), knowledge proficiency (MMLU-Pro, CEVAL), and instruction following (IFEval).

Running the following code will automatically download and mix the datasets according to the defined schema, saving the constructed evaluation collection to a local JSONL file. Of course, you can also skip this step and directly use the pre-processed dataset collection we have placed in the [ModelScope repository](https://modelscope.ai/datasets/evalscope/Qwen3-Test-Collection/summary).

```python
from evalscope.collections import CollectionSchema, DatasetInfo, WeightedSampler
from evalscope.utils.io_utils import dump_jsonl_data

schema = CollectionSchema(name='Qwen3', datasets=[
    CollectionSchema(name='English', datasets=[
        DatasetInfo(name='mmlu_pro', weight=1, task_type='exam', tags=['en'], args={'few_shot_num': 0}),
        DatasetInfo(name='mmlu_redux', weight=1, task_type='exam', tags=['en'], args={'few_shot_num': 0}),
        DatasetInfo(name='ifeval', weight=1, task_type='instruction', tags=['en'], args={'few_shot_num': 0}),
    ]),
    CollectionSchema(name='Chinese', datasets=[
        DatasetInfo(name='ceval', weight=1, task_type='exam', tags=['zh'], args={'few_shot_num': 0}),
        DatasetInfo(name='iquiz', weight=1, task_type='exam', tags=['zh'], args={'few_shot_num': 0}),
    ]),
    CollectionSchema(name='Code', datasets=[
        DatasetInfo(name='live_code_bench', weight=1, task_type='code', tags=['en'], args={'few_shot_num': 0, 'subset_list': ['v5_v6'], 'extra_params': {'start_date': '2025-01-01', 'end_date': '2025-04-30'}}),
    ]),
    CollectionSchema(name='Math&Science', datasets=[
        DatasetInfo(name='math_500', weight=1, task_type='math', tags=['en'], args={'few_shot_num': 0}),
        DatasetInfo(name='aime24', weight=1, task_type='math', tags=['en'], args={'few_shot_num': 0}),
        DatasetInfo(name='aime25', weight=1, task_type='math', tags=['en'], args={'few_shot_num': 0}),
        DatasetInfo(name='gpqa_diamond', weight=1, task_type='knowledge', tags=['en'], args={'few_shot_num': 0})
    ])
])

# get the mixed data
mixed_data = WeightedSampler(schema).sample(100000000)  # set a large number to ensure all datasets are sampled
# dump the mixed data to a jsonl file
dump_jsonl_data(mixed_data, 'outputs/qwen3_test.jsonl')
```

### Run Evaluation Tasks

Run the following code to evaluate the Qwen3-Next model performance:

```python
from evalscope import TaskConfig, run_task
task_cfg = TaskConfig(
    model='Qwen3-Next-80B-A3B-Instruct',
    api_url='http://127.0.0.1:8801/v1/chat/completions',
    eval_type='openai_api',
    datasets=[
        'data_collection',
    ],
    dataset_args={
        'data_collection': {
            'dataset_id': 'evalscope/Qwen3-Test-Collection',
            'shuffle': True,
        }
    },
    eval_batch_size=32,
    generation_config={
        'max_tokens': 6000,  # Maximum number of tokens to generate; it's recommended to set a larger value to avoid output truncation
        'temperature': 0.7,  # Sampling temperature (recommended value from Qwen report)
        'top_p': 0.8,  # Top-p sampling (recommended value from Qwen report)
        'top_k': 20,  # Top-k sampling (recommended value from Qwen report)
    },
    timeout=60000,  # Timeout duration
    stream=True,  # Whether to use streaming output
    limit=100,  # Set to 100 data points for testing
)

run_task(task_cfg=task_cfg)
```

The output results are as follows:

**Note ⚠️**: The results below are based on 100 data points and are only for evaluation process testing. Remove this limit for official evaluation.

```text
+-------------+---------------------+--------------+---------------+-------+
|  task_type  |       metric        | dataset_name | average_score | count |
+-------------+---------------------+--------------+---------------+-------+
|    exam     |         acc         |   mmlu_pro   |    0.7869     |  61   |
|    exam     |         acc         |  mmlu_redux  |     0.913     |  23   |
|    exam     |         acc         |    ceval     |    0.8333     |   6   |
| instruction | prompt_level_strict |    ifeval    |      0.6      |   5   |
|    math     |         acc         |   math_500   |      1.0      |   4   |
|  knowledge  |         acc         | gpqa_diamond |      0.0      |   1   |
+-------------+---------------------+--------------+---------------+-------+
```
For more available evaluation datasets, please refer to the [Dataset List](https://evalscope.readthedocs.io/en/latest/get_started/supported_dataset/llm.html).

### Visualize Evaluation Results

EvalScope supports visualizing results, allowing you to view the model's specific outputs.

Run the following command to launch a Gradio-based visualization interface:

```shell
evalscope app
```

Select the evaluation report and click load to see the model's output for each question, along with the overall answer accuracy rate:

![image.png](https://sail-moe.oss-cn-hangzhou.aliyuncs.com/yunlin/images/evalscope/doc/qwen_next/visual_overview.png)

![image.png](https://sail-moe.oss-cn-hangzhou.aliyuncs.com/yunlin/images/evalscope/doc/qwen_next/visual_detail.png)