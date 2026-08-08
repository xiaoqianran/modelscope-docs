<!-- modelscope-docs: Best Practices for Qwen3 Model Evaluation | model-evaluation/best-practice/qwen3/qwen3_EN.md -->

Qwen3 is the latest generation of large language models in the Qwen series, offering a range of dense and Mixture-of-Experts (MoE) models. Based on extensive training, Qwen3 has achieved breakthrough progress in reasoning, instruction following, agent capabilities, and multilingual support, enabling seamless switching between thinking mode and non-thinking mode. In this best practice guide, we will use the EvalScope framework to comprehensively evaluate the Qwen3-32B model, covering model service inference performance evaluation, model capability evaluation, and model thinking efficiency evaluation.

## Install Dependencies

First, install the [EvalScope](https://github.com/modelscope/evalscope) model evaluation framework:

```bash
pip install 'evalscope[app,perf]' -U
```

## Model Service Inference Performance Evaluation

First, we need to access the model capabilities through an OpenAI API-compatible inference service for evaluation. Note that EvalScope also supports model inference evaluation using transformers; for details, refer to the [documentation](https://evalscope.readthedocs.io/en/latest/get_started/basic_usage.html#id2).

In addition to deploying the model to cloud services that support the OpenAI interface, you can also choose to launch the model locally using frameworks like vLLM or ollama. These inference frameworks can handle multiple concurrent requests well, accelerating the evaluation process. Especially for reasoning models, their outputs typically contain long chains of thought, with output token counts often exceeding 10,000. Deploying models with efficient inference frameworks can significantly improve inference speed.

### ModelScope API Inference Service Performance Evaluation

Users can access Qwen3 through ModelScope's online model inference service. For details, refer to: [https://modelscope.ai/docs/model-service/API-Inference/intro](https://modelscope.ai/docs/model-service/API-Inference/intro)

> **Client-side calling example**

```python
from openai import OpenAI

client = OpenAI(
    api_key="MODELSCOPE_SDK_TOKEN", # Replace with your ModelScope SDK Token, reference: https://modelscope.ai/my/myaccesstoken
    base_url="https://api-inference.modelscope.ai/v1/"
)


response = client.chat.completions.create(
    model="Qwen/Qwen3-32B",    # ModelScope model_id
    messages=[
        {
            'role': 'system',
            'content': 'You are a helpful assistant.'
        },
        {
            'role': 'user',
            'content': 'Write quicksort in Python'
        }
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.reasoning_content:
        print(chunk.choices[0].delta.reasoning_content, end='', flush=True)
    else:
        print(chunk.choices[0].delta.content, end='', flush=True)
```

> **Stress testing command**

```shell
evalscope perf \
    --model Qwen/Qwen3-32B \
    --url "https://api-inference.modelscope.ai/v1/chat/completions" \
    --api-key "YOUR_MODELSCOPE_SDK_TOKEN" \
    --parallel 5 \
    --number 20 \
    --api openai \
    --dataset openqa \
    --stream \
    --wandb-api-key "YOUR_WANDB_API_KEY"  # Optional
```

*   To obtain YOUR_MODELSCOPE_SDK_TOKEN, refer to: [https://modelscope.ai/my/myaccesstoken](https://modelscope.ai/my/myaccesstoken)


Example output:

![image.png](./_resources/3af82a52-21c0-4ba1-914f-4dd75a34c0f7.png)

![image.png](./_resources/28300221-861b-4338-bd8f-3bcd687c3ddc.png)

### Local Model Service Performance Evaluation

Use the vLLM framework (requires vLLM version >= 0.8.5) to launch the model service locally with the following command (default is **thinking mode**):

```bash
VLLM_USE_MODELSCOPE=True CUDA_VISIBLE_DEVICES=0 vllm serve Qwen/Qwen3-32B --gpu-memory-utilization 0.9 --served-model-name Qwen3-32B --trust_remote_code --port 8801
```

> **Stress testing command**

```shell
evalscope perf \
    --url "http://127.0.0.1:8801/v1/chat/completions" \
    --parallel 5 \
    --model Qwen3-32B \
    --number 20 \
    --api openai \
    --dataset openqa \
    --stream
```

For parameter details, refer to [Performance Evaluation](https://evalscope.readthedocs.io/en/latest/user_guides/stress_test/quick_start.html)

Example output:

![image.png](./_resources/56d9113f-9ce6-4990-bb05-4f19e0a3d1a5.png)

![image.png](./_resources/d03843ea-4641-4119-b362-c6f7fdd8f700.png)

## Model Capability Evaluation

Now we begin the model capability evaluation process.

Note: The subsequent evaluation processes are based on the model service launched by vLLM. You can launch the model service according to the steps in the previous model service performance evaluation section or use a local model service. The model uses thinking mode by default.

### Building an Evaluation Collection (Optional)

To comprehensively evaluate the model's capabilities in various aspects, we can mix benchmarks supported by EvalScope to build a comprehensive evaluation collection. Below is an example of an evaluation collection that covers mainstream benchmarks, evaluating the model's code capabilities (LiveCodeBench), mathematical abilities (AIME2024, AIME2025), knowledge capabilities (MMLU-Pro, CEVAL), and instruction following (IFEval).

Run the following code to automatically download and mix datasets according to the defined schema, and save the constructed evaluation collection to a local jsonl file. Of course, you can also skip this step and directly use the pre-processed data collection we've placed in the [ModelScope repository](https://modelscope.ai/datasets/evalscope/Qwen3-Test-Collection/summary).

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

### Running Evaluation Tasks

Run the following code to evaluate the Qwen3-32B model performance in **thinking mode**:

```python
from evalscope import TaskConfig, run_task
task_cfg = TaskConfig(
    model='Qwen3-32B',
    api_url='http://127.0.0.1:8801/v1/chat/completions',
    eval_type='openai_api',
    datasets=[
        'data_collection',
    ],
    dataset_args={
        'data_collection': {
            'dataset_id': 'evalscope/Qwen3-Test-Collection',
            'filters': {'remove_until': '<|endoftext|>'}  # Filter out thinking content
        }
    },
    eval_batch_size=128,
    generation_config={
        'max_tokens': 30000,  # Maximum number of generated tokens, recommended to set a larger value to avoid output truncation
        'temperature': 0.6,  # Sampling temperature (Qwen report recommended value)
        'top_p': 0.95,  # Top-p sampling (Qwen report recommended value)
        'top_k': 20,  # Top-k sampling (Qwen report recommended value)
        'n': 1,  # Number of responses generated per request
    },
    timeout=60000,  # Timeout duration
    stream=True,  # Whether to use streaming output
    limit=100,  # Set to 100 data points for testing
)

run_task(task_cfg=task_cfg)
```

Output results:

Note: The results below are from 1000 data points, used only for evaluation process testing. Remove this limit for official evaluation.

```text
+-------------+-------------------------+-----------------+---------------+-------+
|  task_type  |         metric          |  dataset_name   | average_score | count |
+-------------+-------------------------+-----------------+---------------+-------+
|    code     |         Pass@1          | live_code_bench |     0.544     |  182  |
|    exam     |     AverageAccuracy     |      ceval      |     0.88      |  125  |
|    exam     |     AverageAccuracy     |      iquiz      |    0.8417     |  120  |
|    exam     |     AverageAccuracy     |    mmlu_pro     |    0.6867     |  83   |
|    exam     |     AverageAccuracy     |   mmlu_redux    |    0.9277     |  83   |
| instruction |  inst_level_loose_acc   |     ifeval      |    0.9157     |  83   |
| instruction |  inst_level_strict_acc  |     ifeval      |    0.8775     |  83   |
| instruction | prompt_level_loose_acc  |     ifeval      |    0.8675     |  83   |
| instruction | prompt_level_strict_acc |     ifeval      |    0.8193     |  83   |
|  knowledge  |      AveragePass@1      |      gpqa       |      0.6      |  65   |
|    math     |      AveragePass@1      |    math_500     |    0.9516     |  62   |
|    math     |      AveragePass@1      |     aime24      |      0.7      |  30   |
|    math     |      AveragePass@1      |     aime25      |    0.7667     |  30   |
+-------------+-------------------------+-----------------+---------------+-------+
```

Test the model performance in **non-thinking mode** (note the changes in generation config):

```python
from evalscope import TaskConfig, run_task

task_cfg = TaskConfig(
    model='Qwen3-32B',
    api_url='http://127.0.0.1:8801/v1/chat/completions',
    eval_type='openai_api',
    datasets=[
        'data_collection',
    ],
    dataset_args={
        'data_collection': {
            'dataset_id': 'evalscope/Qwen3-Test-Collection',
        }
    },
    eval_batch_size=128,
    generation_config={
        'max_tokens': 20000,  # Maximum number of generated tokens, recommended to set a larger value to avoid output truncation
        'temperature': 0.7,  # Sampling temperature (Qwen report recommended value)
        'top_p': 0.8,  # Top-p sampling (Qwen report recommended value)
        'top_k': 20,  # Top-k sampling (Qwen report recommended value)
        'n': 1,  # Number of responses generated per request
        'extra_body':{'chat_template_kwargs': {'enable_thinking': False}}  # Disable thinking mode
    },
    timeout=60000,  # Timeout duration
    stream=True,  # Whether to use streaming output
    limit=1000,  # Set to 1000 data points for testing
)

run_task(task_cfg=task_cfg)
```

Output results:
```text
+-------------+-------------------------+-----------------+---------------+-------+
|  task_type  |         metric          |  dataset_name   | average_score | count |
+-------------+-------------------------+-----------------+---------------+-------+
|    code     |         Pass@1          | live_code_bench |    0.2857     |  182  |
|    exam     |     AverageAccuracy     |      ceval      |     0.808     |  125  |
|    exam     |     AverageAccuracy     |      iquiz      |     0.775     |  120  |
|    exam     |     AverageAccuracy     |    mmlu_pro     |    0.6145     |  83   |
|    exam     |     AverageAccuracy     |   mmlu_redux    |    0.8313     |  83   |
| instruction |  inst_level_loose_acc   |     ifeval      |    0.6948     |  83   |
| instruction |  inst_level_strict_acc  |     ifeval      |    0.6888     |  83   |
| instruction | prompt_level_loose_acc  |     ifeval      |    0.6265     |  83   |
| instruction | prompt_level_strict_acc |     ifeval      |    0.6145     |  83   |
|  knowledge  |      AveragePass@1      |      gpqa       |    0.4154     |  65   |
|    math     |      AveragePass@1      |    math_500     |    0.4355     |  62   |
|    math     |      AveragePass@1      |     aime24      |    0.2333     |  30   |
|    math     |      AveragePass@1      |     aime25      |    0.1333     |  30   |
+-------------+-------------------------+-----------------+---------------+-------+
```

### Visualization of Evaluation Results

EvalScope supports visualizing results to view the model's specific outputs.

Run the following command to launch the Gradio-based visualization interface:

```shell
evalscope app
```

Select the evaluation report and click load to see the model's output results for each question, as well as the overall answer accuracy rate:

![image.png](./_resources/ba7d5810-387d-4207-bff1-92a102a698df.png)

## Model Thinking Efficiency Evaluation

Next, we will measure the thinking efficiency of the Qwen-32B model using the [MATH-500](https://www.modelscope.ai/datasets/AI-ModelScope/MATH-500) dataset and compare it with three other models (DeepSeek-R1, QwQ-32B). We evaluate the model's performance from the following six dimensions:

*   Reasoning Tokens $T$: Total number of reasoning content tokens during model inference, generally the part before the `<|endoftext|>` tag.

*   First Correct Tokens $\hat{T}$: Number of tokens from the start position to the first position that can be identified as the correct answer during model inference.

*   Reflection Tokens: $T-\hat{T}$, i.e., the number of tokens from the first correct answer position to the end of reasoning.

*   Token Efficiency: $\hat{T}/T$, i.e., the ratio of tokens from the start position to the first correct answer position to the total number of tokens.

*   Thought Num: Number of sub-chains of thought during model inference, determined by counting certain keywords (such as `alternatively`, `but wait`, `let me reconsider`, etc.).

*   Accuracy: Ratio of correctly answered samples to the total number of samples during model inference.


Test results:

![image.png](./_resources/d6ee0255-aaaf-42f9-b7b3-660a163920cd.png)

From the graph, we can draw the following conclusions:

*  The Qwen3-32B model achieves comparable accuracy to QwQ-32B in thinking mode (their Accuracy curves overlap), both reaching the best level.
*  As problem difficulty increases, the output length of all models increases with problem difficulty, indicating that models need longer "thinking time" to solve more complex problems, consistent with the Inference-Time Scaling phenomenon.
*  As problem difficulty increases, although output length steadily increases, token efficiency also improves (Qwen3-32B increases from 31% to 43%, QwQ-32B from 31% to 49%). This suggests that reasoning-type models make their token consumption more "worthwhile" on more complex problems. On relatively simpler problems, there may be more unnecessary token waste: even on simple problems, answers might be unnecessarily verified repeatedly. Among these, Qwen-32B produces more tokens compared to other models, allowing it to maintain higher accuracy on high-difficulty Level 5 problems, but this also suggests the model may have issues with over-analysis.

For specific evaluation methods and more conclusions, please refer to: [Best Practices for Model Thinking Efficiency Evaluation](https://evalscope.readthedocs.io/en/latest/best_practice/think_eval.html)