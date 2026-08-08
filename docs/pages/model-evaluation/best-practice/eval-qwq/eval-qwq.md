<!-- modelscope-docs: Best Practices for QwQ Model Evaluation | model-evaluation/best-practice/eval-qwq/eval-qwq_EN.md -->

Today (March 6, 2025), the Qwen team released the QwQ-32B model, which rivals DeepSeek-R1-671B in a series of benchmark tests. The results below show the performance comparison between QwQ-32B and other leading models.

![QwQ-32B-Final](https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/qwq-32b-final.jpg)

In this best practice guide, we will use the [EvalScope](https://github.com/modelscope/evalscope) model evaluation framework to test the reasoning capabilities and thinking efficiency of the QwQ-32B model ourselves.

The workflow of this best practice includes installing dependencies, preparing the model, evaluating the model, and visualizing the evaluation results. Let's get started.

## Install Dependencies

First, install the [EvalScope](https://github.com/modelscope/evalscope) model evaluation framework:

```bash
pip install 'evalscope[app,perf]' -U
```

## Model Inference

### Prepare Evaluation Model

First, we need to access the model capabilities through an OpenAI API-compatible inference service for evaluation. Note that EvalScope also supports model inference evaluation using transformers; for details, refer to the EvalScope documentation.

In addition to deploying the model to cloud services that support the OpenAI interface, you can also choose to launch the model locally using frameworks like vLLM or ollama. These inference frameworks can handle multiple concurrent requests well, accelerating the evaluation process. Especially for R1-type models, their outputs typically contain long chains of thought, with output token counts often exceeding 10,000. Deploying models with efficient inference frameworks can significantly improve inference speed.

```bash
VLLM_USE_MODELSCOPE=True CUDA_VISIBLE_DEVICES=0 python -m vllm.entrypoints.openai.api_server --model Qwen/QwQ-32B  --served-model-name QwQ-32B --trust_remote_code --port 8801
```

**Model Inference Speed Test**

> [!NOTE]
> [QwQ-32B-Preview Model Inference Speed Test](../experiments/speed_benchmark/QwQ-32B-Preview.md)

### Evaluate Model's Mathematical Reasoning Capability

Run the following command to let the model perform inference on the MATH-500 dataset and obtain the model's output results for each question, as well as the overall answer accuracy rate:

```python
from evalscope import TaskConfig, run_task

task_config = TaskConfig(
    api_url='http://0.0.0.0:8801/v1',  # Inference service address
    model='Qwen/QwQ-32B',  # Model name (must match the model name used during deployment)
    eval_type='openai_api',  # Evaluation type, 'openai_api' indicates evaluating inference service
    datasets=['math_500'],  # Dataset name
    dataset_args={'math_500': {'few_shot_num': 0}},  # Dataset arguments
    eval_batch_size=32,  # Number of concurrent requests
    generation_config={
        'max_tokens': 32000,  # Maximum number of generated tokens, recommended to set a larger value to avoid output truncation
        'temperature': 0.6,  # Sampling temperature (Qwen report recommended value)
        'top_p': 0.95,  # Top-p sampling (Qwen report recommended value)
        'top_k': 40,  # Top-k sampling (Qwen report recommended value)
        'n': 1,  # Number of responses generated per request
    },
)
run_task(task_config)
```

Output results are as follows, showing the model's answer accuracy rate for each difficulty level:

```text
+---------+-----------+---------------+----------+-------+---------+---------+
| Model   | Dataset   | Metric        | Subset   |   Num |   Score | Cat.0   |
+=========+===========+===============+==========+=======+=========+=========+
| QwQ-32B | math_500  | AveragePass@1 | Level 1  |    43 |  0.9535 | default |
+---------+-----------+---------------+----------+-------+---------+---------+
| QwQ-32B | math_500  | AveragePass@1 | Level 2  |    90 |  1      | default |
+---------+-----------+---------------+----------+-------+---------+---------+
| QwQ-32B | math_500  | AveragePass@1 | Level 3  |   105 |  0.9714 | default |
+---------+-----------+---------------+----------+-------+---------+---------+
| QwQ-32B | math_500  | AveragePass@1 | Level 4  |   128 |  0.9375 | default |
+---------+-----------+---------------+----------+-------+---------+---------+
| QwQ-32B | math_500  | AveragePass@1 | Level 5  |   134 |  0.9403 | default |
+---------+-----------+---------------+----------+-------+---------+---------+
```

To run [other datasets](../get_started/supported_dataset/index.md), modify the `datasets` and `dataset_args` parameters in the above configuration, for example:

```python
# ...
datasets=[
    # 'math_500',  # Dataset name
    'gpqa_diamond',
    'aime24'
],
dataset_args={
    # 'math_500': {'few_shot_num': 0 } ,
    'gpqa_diamond': {'few_shot_num': 0},
    'aime24': {'few_shot_num': 0}
},
```

Results are as follows:
```text
+---------+-----------+---------------+--------------+-------+---------+---------+
| Model   | Dataset   | Metric        | Subset       |   Num |   Score | Cat.0   |
+=========+===========+===============+==============+=======+=========+=========+
| QwQ-32B | aime24    | AveragePass@1 | default      |    30 |     0.8 | default |
+---------+-----------+---------------+--------------+-------+---------+---------+
| QwQ-32B | gpqa      | AveragePass@1 | gpqa_diamond |   198 |  0.6717 | default |
+---------+-----------+---------------+--------------+-------+---------+---------+
```

### Evaluate Code Capabilities

We use [LiveCodeBench](https://www.modelscope.ai/datasets/AI-ModelScope/code_generation_lite) to evaluate the model's code capabilities, requiring the following configuration:

```python
# ...
datasets=['live_code_bench'],
dataset_args={
    'live_code_bench': {
        'extra_params': {
            'start_date': '2024-08-01',
            'end_date': '2025-02-28'
        },
        "filters": {"remove_until": "THINKING_TAG"}  # Filter out thinking content from model inference
    }
},
```

Output results are as follows:

```text
+---------+-----------------+----------+----------------+-------+---------+---------+
| Model   | Dataset         | Metric   | Subset         |   Num |   Score | Cat.0   |
+=========+=================+==========+================+=======+=========+=========+
| qwq-32b | live_code_bench | Pass@1   | release_latest |   279 |  0.6237 | default |
+---------+-----------------+----------+----------------+-------+---------+---------+
```

## Visualization of Evaluation Results

EvalScope supports visualizing results to view the model's specific outputs.

Run the following command to launch the visualization interface:

```bash
evalscope app --lang en
```

Select the evaluation report and click load to see the model's output results for each question, as well as the overall answer accuracy rate:

![QwQ-32B-Final](./_resources/qwq.png)

## Thinking Efficiency Evaluation

These reasoning models may exhibit two extreme issues during inference: **Underthinking** and **Overthinking**:

- **Underthinking** refers to the phenomenon where the model frequently switches reasoning paths during inference, repeatedly using words like "alternatively", "but wait", "let me reconsider", etc., unable to focus on a correct reasoning path and think deeply, thus arriving at incorrect answers. This phenomenon is similar to human "attention deficit hyperactivity disorder" and affects the quality of the model's reasoning.

- **Overthinking** manifests as the model generating excessively long chains of thought unnecessarily, wasting substantial computational resources. For example, for a simple question like "2+3=?", some long reasoning models might consume over 900 tokens exploring multiple solution strategies. Although this chain-of-thought strategy is very helpful for solving complex problems, repeatedly verifying existing answers and conducting overly broad exploration for simple problems is clearly a waste of computational resources.

Both phenomena highlight a key issue: how to improve the model's thinking efficiency while ensuring answer quality? In other words, **we hope the model can obtain the correct answer with as short an output as possible**. Next, we will measure the thinking efficiency of models like QwQ-32B using the [MATH-500](https://www.modelscope.ai/datasets/AI-ModelScope/MATH-500) dataset, evaluating model performance from the following six dimensions:

- Reasoning Tokens $T$: Total number of reasoning content tokens during model inference, generally the part before the `THINKING_TAG` tag.
- First Correct Tokens $\hat{T}$: Number of tokens from the start position to the first position that can be identified as the correct answer during model inference.
- Reflection Tokens: $T-\hat{T}$, i.e., the number of tokens from the first correct answer position to the end of reasoning.
- Token Efficiency: $\hat{T}/T$, i.e., the ratio of tokens from the start position to the first correct answer position to the total number of tokens.
- Thought Num: Number of sub-chains of thought during model inference, determined by counting certain keywords (such as `alternatively`, `but wait`, `let me reconsider`, etc.).
- Accuracy: Ratio of correctly answered samples to the total number of samples during model inference.

For specific evaluation methods, please refer to [ThinkEval](./think_eval.md).

Run the following command to start the thinking efficiency evaluation:

```python
from evalscope.third_party.thinkbench import run_task

judge_config = dict(  # Evaluation service configuration
    api_key='EMPTY',
    base_url='http://0.0.0.0:8801/v1',
    model_name='Qwen2.5-72B-Instruct',
)

model_config = dict(
    report_path = './outputs/2025xxxx',  # Path to model inference results from the previous step
    model_name = 'QwQ-32B',  # Model name
    tokenizer_path = 'Qwen/QwQ-32B',  # Model tokenizer path, used for calculating token count
    dataset_name = 'math_500',  # Dataset name from the previous step
    subsets = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],  # Dataset subsets from the previous step
    split_strategies='separator',  # Reasoning step splitting strategy, optional values are separator, keywords, llm
    judge_config=judge_config
)

max_tokens = 20000  # Filter outputs with token count less than max_tokens to improve evaluation efficiency
count = 200  # Select count outputs from each subset to improve evaluation efficiency

# Evaluate model thinking efficiency
run_task(model_config, output_dir='outputs', max_tokens=max_tokens, count=count)
```

Results are shown in the figure below:

![QwQ-32B-Final](./_resources/QwQ-32B_math_500_metrics.png)

We also tested the DeepSeek-R1-671B model and DeepSeek-R1-Distill-Qwen-32B model, with integrated results shown in the figure below:

![model_comparison_metrics_3models](./_resources/model_comparison_metrics_6models.png)


Using the same method, we also evaluated four other reasoning models: QwQ-32B, QwQ-32B-Preview, DeepSeek-R1, DeepSeek-R1-Distill-Qwen-32B, as well as a non-reasoning model Qwen2.5-Math-7B-Instruct (treating all tokens in the model output as the thinking process) to observe the performance of different types of models. The specific results are summarized as follows:

1. As problem difficulty increases, most models show a declining trend in accuracy, but QwQ-32B and DeepSeek-R1 perform exceptionally well, maintaining high accuracy even on difficult problems, with QwQ-32B achieving the best performance at the highest difficulty level.
2. For o1/R1-type reasoning models, as problem difficulty increases, although output length steadily increases, token efficiency also improves (DeepSeek-R1 increases from 36% to 54%, QwQ-32B from 31% to 49%)
3. All models' output lengths increase with problem difficulty, indicating that models need longer "thinking time" to solve more complex problems, consistent with the Inference-Time Scaling phenomenon.
4. On relatively simple problems, various reasoning models exhibit some degree of token waste, repeatedly verifying already output answers

In conclusion, how to more accurately and granularly evaluate a model's reasoning efficiency is a topic worthy of in-depth discussion; meanwhile, the related test conclusions also have very important reference significance for GRPO and SFT training processes, helping to develop "more efficient" models that can "adaptively reason" based on problem difficulty.