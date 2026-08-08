<!-- modelscope-docs: Introduction | model-evaluation/get-started/introduction/introduction_EN.md -->

# Introduction

[EvalScope](https://github.com/modelscope/evalscope) is a comprehensive model evaluation and performance benchmarking framework developed by ModelScope, providing an all-in-one solution for your model assessment needs. Regardless of what type of model you're developing, EvalScope can meet your requirements:

- 🧠 Large Language Models (LLMs)
- 🎨 Multimodal Models
- 🔍 Embedding Models
- 🏆 Reranker Models
- 🖼️ CLIP Models
- 🎭 AIGC Models (Text-to-Image/Video)
- ...and more!

EvalScope is not just an evaluation tool—it's your trusted companion throughout your model optimization journey:

- 🏅 Built-in industry-recognized test benchmarks and evaluation metrics: MMLU, CMMLU, C-Eval, GSM8K, and more.
- 📊 Model inference performance stress testing: Ensure your model performs excellently in real-world applications.
- 🚀 Seamless integration with the [ms-swift](https://github.com/modelscope/ms-swift) training framework, enabling one-click evaluation initiation and providing end-to-end support from training to evaluation for your model development.

## Overall Architecture
![EvalScope Architecture Diagram](https://sail-moe.oss-cn-hangzhou.aliyuncs.com/yunlin/images/evalscope/doc/EvalScope%E6%9E%B6%E6%9E%84%E5%9B%BE.png)
*EvalScope Architecture Diagram.*

The framework includes the following modules:

1. Input Layer
- **Model Sources**: API models (OpenAI API), local models (ModelScope)
- **Datasets**: Standard evaluation benchmarks (MMLU/GSM8k, etc.), custom data (MCQ/QA)

2. Core Features
- **Multi-backend Evaluation**
   - Native backend: Unified evaluation for LLM/VLM/Embedding/T2I models
   - Integrated frameworks: OpenCompass/MTEB/VLMEvalKit/RAGAS

- **Performance Monitoring**
   - Model plugins: Support for various model service APIs
   - Data plugins: Support for multiple data formats
   - Metric tracking: TTFT/TPOP/stability metrics

- **Tool Extensions**
   - Integrations: Tool-Bench/Needle-in-a-Haystack/BFCL-v3

3. Output Layer
- **Structured Reports**: Support for JSON/Table/Logs
- **Visualization Platform**: Support for Gradio/Wandb/SwanLab

## Framework Features
- **Benchmark Datasets**: Pre-configured with multiple commonly used test benchmarks, including: MMLU, CMMLU, C-Eval, GSM8K, ARC, HellaSwag, TruthfulQA, MATH, HumanEval, and more.
- **Evaluation Metrics**: Implementation of various commonly used evaluation metrics.
- **Model Integration**: Unified model integration mechanism compatible with Generate and Chat interfaces across multiple model series.
- **Automated Evaluation**: Includes automatic objective question evaluation and complex task evaluation using expert models.
- **Evaluation Reports**: Automatically generates evaluation reports.
- **Arena Mode**: Used for model-to-model comparison and objective model evaluation, supporting multiple evaluation modes:
  - **Single mode**: Score individual models.
  - **Pairwise-baseline mode**: Compare against baseline models.
  - **Pairwise (all) mode**: All-to-all pairwise comparison between all models.
- **Visualization Tools**: Provides intuitive evaluation result visualization.
- **Model Performance Evaluation**: Provides model inference service stress testing tools and detailed statistics. See [Model Performance Evaluation Documentation](../user_guides/stress_test/index.md) for details.
- **OpenCompass Integration**: Supports OpenCompass as an evaluation backend, with advanced encapsulation and task simplification, making it easier for you to submit evaluation tasks.
- **VLMEvalKit Integration**: Supports VLMEvalKit as an evaluation backend, enabling easy initiation of multimodal evaluation tasks and supporting various multimodal models and datasets.
- **End-to-End Support**: Through seamless integration with the [ms-swift](https://github.com/modelscope/ms-swift) training framework, it achieves a one-stop development workflow covering model training, model deployment, model evaluation, and evaluation report viewing, enhancing user development efficiency.