<!-- modelscope-docs: τ²-bench | model-evaluation/third-party/tau2-bench/tau2-bench_EN.md -->

## Introduction

τ²-bench (Tau Squared Bench) is an extended and enhanced version of τ-bench, incorporating a series of code fixes and adding new fault diagnosis scenarios in the telecommunications domain. It is designed to evaluate large language models' capabilities in tool usage and policy adherence within dynamic conversational agents.

- Project Repository: https://github.com/sierra-research/tau2-bench
- Important Note: τ²-bench is the latest version; it is recommended to use τ²-bench for evaluation.

Key Features:
- Dynamic Interaction: Simulates multi-turn dialogues between real users and AI agents
- Tool Integration: Agents must appropriately utilize provided API tools
- Policy Adherence: Agents must follow business policies and guidelines
- Domain Expansion: Adds telecommunications fault diagnosis scenarios on top of aviation and retail domains
- Reliability Improvements: Includes code fixes and stability enhancements over τ-bench

Supported Evaluation Domains:
- airline: Airline customer service
- retail: Retail customer service
- telecom: Telecommunications customer service (newly added, covering network issues, plan management, billing, and troubleshooting)

## Installation Dependencies

```bash
pip install evalscope
# Install tau2-bench
pip install "git+https://github.com/sierra-research/tau2-bench@v0.2.0"
```

> [!NOTE]
> - The dataset is automatically fetched from ModelScope by evalscope (Dataset ID: evalscope/tau2-bench-data), and `TAU2_DATA_DIR` is set automatically.
> - Only supports evaluating target models via API services (it is recommended to expose local models as services first using frameworks like vLLM).

## Usage

Taking `qwen-plus` as an example. Official leaderboards typically use `user model = gpt-4.1-2025-04-14`. To align with the official leaderboard, configure `user_model` as `gpt-4.1-2025-04-14` and provide the corresponding API key and base URL.

```python
import os
from evalscope import TaskConfig, run_task

task_cfg = TaskConfig(
    # Target agent model (Agent Model)
    model='qwen-plus',
    api_url='https://dashscope.aliyuncs.com/compatible-mode/v1',
    api_key=os.getenv('DASHSCOPE_API_KEY'),
    eval_type='openai_api',  # Evaluate using OpenAI-compatible services

    datasets=['tau2_bench'],
    dataset_args={
        'tau2_bench': {
            'subset_list': ['airline', 'retail', 'telecom'],  # Supports three domains
            'extra_params': {
                # User simulation model (User Model) to drive the conversational environment
                'user_model': 'qwen-plus',  # Change to 'gpt-4.1-2025-04-14' to align with official leaderboard
                'api_key': os.getenv('DASHSCOPE_API_KEY'),
                'api_base': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
                'generation_config': {
                    'temperature': 0.7,
                }
            }
        }
    },

    eval_batch_size=5,  # Evaluation concurrency size
    limit=5,  # Keep for quick testing; remove for official evaluation
    generation_config={
        'temperature': 0.6,
    },
)

run_task(task_cfg)
```

Tips:
- If using `gpt-4.1-2025-04-14` as the user simulation model, please set:
  - `extra_params.user_model='gpt-4.1-2025-04-14'`
  - `extra_params.api_base='https://api.openai.com/v1'`
  - `extra_params.api_key=<OPENAI_API_KEY>`

## Evaluation Workflow

1) Task Initialization: Provide the agent with domain-specific API tools and policy guidelines
2) User Simulation: The user model generates natural requests based on scenarios
3) Agent Response: The target model generates responses following tools and policies
4) Multi-turn Interaction: Continue dialogue until task completion or failure
5) Result Evaluation: Score based on task completion and policy adherence

## Evaluation Dimensions

- Whether the user's goal was achieved (Task Completion Rate)
- Whether necessary API tools were correctly invoked
- Whether business policies and constraints were followed

## Domain Characteristics

- Aviation (Airline)
  - Tools: Flight search, rebooking, seat selection, refunds/modifications, etc.
  - Typical Tasks: Rebooking, seat upgrades, baggage issue resolution
- Retail (Retail)
  - Tools: Product/order/inventory/payment management, etc.
  - Typical Tasks: Product recommendations, order tracking, returns/exchanges
- Telecommunications (Telecom, newly added)
  - Tools: Network diagnostics, plan changes, service suspension/resumption, trouble tickets, etc.
  - Typical Tasks: Network connectivity issues, billing disputes, plan upgrades, and troubleshooting

## Result Example

```text
+-----------+------------+-------------+----------+-------+---------+---------+
| Model     | Dataset    | Metric      | Subset   |   Num |   Score | Cat.0   |
+===========+============+=============+==========+=======+=========+=========+
| qwen-plus | tau2_bench | mean_Pass^1 | airline  |    10 |     0.6 | default |
+-----------+------------+-------------+----------+-------+---------+---------+
| qwen-plus | tau2_bench | mean_Pass^1 | retail   |    10 |     0.7 | default |
+-----------+------------+-------------+----------+-------+---------+---------+
| qwen-plus | tau2_bench | mean_Pass^1 | telecom  |    10 |     0.8 | default |
+-----------+------------+-------------+----------+-------+---------+---------+
| qwen-plus | tau2_bench | mean_Pass^1 | OVERALL  |    30 |     0.7 | -       |
+-----------+------------+-------------+----------+-------+---------+---------+
```

## Metric Explanation

- Pass^1: Proportion of tasks completed successfully on the first attempt (higher is better)
  - Reflects correctness of tool usage, policy adherence, and goal achievement within a single dialogue turn