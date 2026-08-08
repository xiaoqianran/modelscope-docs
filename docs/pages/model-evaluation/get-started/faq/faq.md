<!-- modelscope-docs: ❓ Frequently Asked Questions | model-evaluation/get-started/faq/faq_EN.md -->

# ❓ Frequently Asked Questions

This section compiles common issues encountered during EvalScope usage and their solutions.

> [!NOTE]
> We recommend that when encountering issues, you first try updating to the latest `main` branch code. Many problems may have already been fixed in the latest version.

## Quick Navigation

- [❓ Frequently Asked Questions](#-frequently-asked-questions)
  - [Quick Navigation](#quick-navigation)
  - [Installation and Environment](#installation-and-environment)
  - [Model Evaluation](#model-evaluation)
    - [Evaluation Configuration and Parameters](#evaluation-configuration-and-parameters)
    - [Abnormal Results and Troubleshooting](#abnormal-results-and-troubleshooting)
    - [Model and Dataset Support](#model-and-dataset-support)
    - [Framework Usage and Extension](#framework-usage-and-extension)
  - [Performance Stress Testing (perf)](#performance-stress-testing-perf)
    - [Basic Usage and Configuration](#basic-usage-and-configuration)
    - [Performance Metrics and Troubleshooting](#performance-metrics-and-troubleshooting)
  - [Citing Us](#citing-us)

## Installation and Environment

**Q: How do I use EvalScope with Docker?**

**A:** You can use ModelScope's official Docker images, which already include EvalScope. For details, please refer to the [Environment Installation Documentation](https://modelscope.cn/docs/intro/environment-setup#%E6%9C%80%E6%96%B0%E9%95%9C%E5%83%8F).

**Q: What should I do if `pip install evalscope[all]` fails during compilation?**

**A:** Try installing `pip install python-dotenv` separately first, then execute `pip install evalscope[all]`.

**Q: Does `evalscope[app]` have environment conflicts with other libraries (such as `bfcl-eval`)?**

**A:** Please try installing these libraries separately rather than in a single command. For `bfcl-eval`, you can try version `2025.6.16`.

**Q: How do I handle the warning about `trust_remote_code=True` during evaluation?**

**A:** This is an informational warning that doesn't affect the evaluation process. The EvalScope framework has already set `trust_remote_code=True` by default, so you can use it with confidence.

**Q: When running evaluations in a Notebook environment, I get the error `RuntimeError: Cannot run the event loop while another loop is running`?**

**A:** Please write your evaluation code into a Python script file (`.py`) and execute it from the terminal, avoiding running it in a Notebook.

## Model Evaluation

### Evaluation Configuration and Parameters

**Q: How do I perform pass@k evaluation or generate multiple answers for a single sample?**

**A:** Set the `n` parameter in `generation_config`. The value of `n` represents the number of answers generated per sample. The framework will automatically calculate metrics like `pass@k`.
Reference documentation: [Generation Config](https://evalscope.readthedocs.io/zh-cn/latest/get_started/parameters.html#id2), [QwQ Evaluation Practice](https://evalscope.readthedocs.io/zh-cn/latest/best_practice/eval_qwq.html#id5).

**Q: How do I remove the "thinking process" from model outputs (such as `