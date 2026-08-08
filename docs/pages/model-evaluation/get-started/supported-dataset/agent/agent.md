<!-- modelscope-docs: AGENT Evaluation Datasets | model-evaluation/get-started/supported-dataset/agent/agent_EN.md -->

# AGENT Evaluation Datasets

Below is a list of supported AGENT evaluation datasets. Click on the standard dataset name to jump to detailed information.

| Dataset Name | Standard Name | Task Categories |
|------------|----------|----------|
| `bfcl_v3` | [BFCL-v3](#bfcl-v3) | `Agent`, `FunctionCalling` |
| `bfcl_v4` | [BFCL-v4](#bfcl-v4) | `Agent`, `FunctionCalling` |
| `general_fc` | [General-FunctionCalling](#general-functioncalling) | `Agent`, `Custom`, `FunctionCalling` |
| `tau2_bench` | [τ²-bench](#τ²-bench) | `Agent`, `FunctionCalling`, `Reasoning` |
| `tau_bench` | [τ-bench](#τ-bench) | `Agent`, `FunctionCalling`, `Reasoning` |
| `tool_bench` | [ToolBench-Static](#toolbench-static) | `FunctionCalling`, `Reasoning` |

---

## Dataset Details

### BFCL-v3

[Back to Index](#agent-evaluation-datasets)
- **Dataset Name**: `bfcl_v3`
- **Dataset ID**: [AI-ModelScope/bfcl_v3](https://modelscope.ai/datasets/AI-ModelScope/bfcl_v3/summary)
- **Dataset Description**:
  > The Berkeley Function Calling Leaderboard (BFCL) is the first **comprehensive and executable function calling benchmark** dedicated to evaluating the function calling capabilities of large language models (LLMs). Unlike previous benchmarks, BFCL considers various forms of function calls, diverse scenarios, and executability. Before evaluation, install `pip install bfcl-eval==2025.10.27.1`. [Usage Example](https://evalscope.readthedocs.io/en/latest/third_party/bfcl_v3.html)
- **Task Categories**: `Agent`, `FunctionCalling`
- **Evaluation Metric**: `acc`
- **Aggregation Method**: `mean`
- **Requires LLM Judge**: No
- **Default Prompting Method**: 0-shot
- **Dataset Subsets**: `irrelevance`, `java`, `javascript`, `live_irrelevance`, `live_multiple`, `live_parallel_multiple`, `live_parallel`, `live_relevance`, `live_simple`, `multi_turn_base`, `multi_turn_long_context`, `multi_turn_miss_func`, `multi_turn_miss_param`, `multiple`, `parallel_multiple`, `parallel`, `simple`

- **Additional Parameters**:
```json
{
    "underscore_to_dot": true,
    "is_fc_model": true
}
```

---

### BFCL-v4

[Back to Index](#agent-evaluation-datasets)
- **Dataset Name**: `bfcl_v4`
- **Dataset ID**: [berkeley-function-call-leaderboard](https://github.com/ShishirPatil/gorilla/tree/main/berkeley-function-call-leaderboard)
- **Dataset Description**:
  > Function calling is a foundational building block for intelligent agents. The Berkeley Function Calling Leaderboard (BFCL) V4 provides a comprehensive agent evaluation for large language models (LLMs). The BFCL V4 agent evaluation includes web search, memory read/write, and format sensitivity. Combined with cross-language function calling capabilities, these constitute the core foundation currently driving the development of agent-capable LLMs, covering highly challenging frontier areas such as deep research, programming agents, and legal agents. Before evaluation, run `pip install bfcl-eval==2025.10.27.1`. [Usage Example](https://evalscope.readthedocs.io/en/latest/third_party/bfcl_v4.html)
- **Task Categories**: `Agent`, `FunctionCalling`
- **Evaluation Metric**: `acc`
- **Aggregation Method**: `mean`
- **Requires LLM Judge**: No
- **Default Prompting Method**: 0-shot
- **Dataset Subsets**: `irrelevance`, `live_irrelevance`, `live_multiple`, `live_parallel_multiple`, `live_parallel`, `live_relevance`, `live_simple`, `memory_kv`, `memory_rec_sum`, `memory_vector`, `multi_turn_base`, `multi_turn_long_context`, `multi_turn_miss_func`, `multi_turn_miss_param`, `multiple`, `parallel_multiple`, `parallel`, `simple_java`, `simple_javascript`, `simple_python`, `web_search_base`, `web_search_no_snippet`

- **Additional Parameters**:
```json
{
    "underscore_to_dot": true,
    "is_fc_model": true,
    "SERPAPI_API_KEY": null
}
```

---

### General-FunctionCalling

[Back to Index](#agent-evaluation-datasets)
- **Dataset Name**: `general_fc`
- **Dataset ID**: [evalscope/GeneralFunctionCall-Test](https://modelscope.ai/datasets/evalscope/GeneralFunctionCall-Test/summary)
- **Dataset Description**:
  > A general-purpose function calling dataset for custom evaluations. For detailed instructions on how to use this benchmark, please refer to the [User Guide](https://evalscope.readthedocs.io/en/latest/advanced_guides/custom_dataset/llm.html#fc).
- **Task Categories**: `Agent`, `Custom`, `FunctionCalling`
- **Evaluation Metrics**: `count_finish_reason_tool_call`, `count_successful_tool_call`, `schema_accuracy`, `tool_call_f1`
- **Aggregation Method**: `f1`
- **Requires LLM Judge**: No
- **Default Prompting Method**: 0-shot
- **Dataset Subsets**: `default`


---

### τ²-bench

[Back to Index](#agent-evaluation-datasets)
- **Dataset Name**: `tau2_bench`
- **Dataset ID**: [evalscope/tau2-bench-data](https://modelscope.ai/datasets/evalscope/tau2-bench-data/summary)
- **Dataset Description**:
  > τ²-bench (Tau Squared Bench) is an extended and enhanced version of the original τ-bench (Tau Bench), designed to evaluate conversational AI agents that interact with users through domain-specific API tools and guidelines. Please install and set up the user model using `pip install git+https://github.com/sierra-research/tau2-bench@v0.2.0` before evaluation. [Usage Example](https://evalscope.readthedocs.io/en/latest/third_party/tau2_bench.html)
- **Task Categories**: `Agent`, `FunctionCalling`, `Reasoning`
- **Evaluation Metrics**:
- **Aggregation Method**: `mean_and_pass_hat_k`
- **Requires LLM Judge**: No
- **Default Prompting Method**: 0-shot
- **Dataset Subsets**: `airline`, `retail`, `telecom`

- **Additional Parameters**:
```json
{
    "user_model": "qwen-plus",
    "api_key": "EMPTY",
    "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "generation_config": {
        "temperature": 0.0,
        "max_tokens": 4096
    }
}
```

---

### τ-bench

[Back to Index](#agent-evaluation-datasets)
- **Dataset Name**: `tau_bench`
- **Dataset ID**: [tau-bench](https://github.com/sierra-research/tau-bench)
- **Dataset Description**:
  > A benchmark that simulates dynamic conversations between a user (simulated by a language model) and a language agent equipped with domain-specific API tools and policy guidelines. Please install and set up the user model via `pip install git+https://github.com/sierra-research/tau-bench` before evaluation. [Usage Example](https://evalscope.readthedocs.io/en/latest/third_party/tau_bench.html)
- **Task Categories**: `Agent`, `FunctionCalling`, `Reasoning`
- **Evaluation Metrics**:
- **Aggregation Method**: `mean_and_pass_hat_k`
- **Requires LLM Judge**: No
- **Default Prompting Method**: 0-shot
- **Dataset Subsets**: `airline`, `retail`

- **Additional Parameters**:
```json
{
    "user_model": "qwen-plus",
    "api_key": "EMPTY",
    "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "generation_config": {
        "temperature": 0.0,
        "max_tokens": 4096
    }
}
```

---

### ToolBench-Static

[Back to Index](#agent-evaluation-datasets)
- **Dataset Name**: `tool_bench`
- **Dataset ID**: [AI-ModelScope/ToolBench-Static](https://modelscope.ai/datasets/AI-ModelScope/ToolBench-Static/summary)
- **Dataset Description**:
  > ToolBench is a benchmark for evaluating AI models' tool usage capabilities, containing multiple subsets (e.g., in-domain and out-of-domain). Each subset provides questions that require step-by-step reasoning to arrive at the correct answer. [Usage Example](https://evalscope.readthedocs.io/en/latest/third_party/toolbench.html)
- **Task Categories**: `FunctionCalling`, `Reasoning`
- **Evaluation Metrics**: `Act.EM`, `F1`, `HalluRate`, `Plan.EM`, `Rouge-L`
- **Aggregation Method**: `mean`
- **Requires LLM Judge**: No
- **Default Prompting Method**: 0-shot
- **Dataset Subsets**: `in_domain`, `out_of_domain`