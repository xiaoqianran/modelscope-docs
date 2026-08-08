<!-- modelscope-docs: Library Introduction | sdk/intro/intro_EN.md -->

This article introduces the features and quick start guide of the ModelScope Library.

# What is ModelScope Library?

To enable ModelScope users to quickly and easily use various models provided by the platform, we offer a comprehensive Python library. This library includes implementations of official ModelScope models, as well as code for data preprocessing, post-processing, and performance evaluation required for inference, fine-tuning, and other tasks using these models. It also provides simple and easy-to-use APIs along with abundant usage examples. By calling the library, users can complete model inference, training, and evaluation tasks with just a few lines of code, and can also rapidly perform secondary development on this foundation to implement their own innovative ideas.

Currently, the algorithm models provided by the library cover five major AI domains: computer vision, natural language processing, speech, multimodal, and scientific computing, spanning dozens of application scenarios. For specific tasks, please refer to the documentation: [Task Introduction](./各任务最佳实践/任务的介绍.md).

## Deep Learning Frameworks

ModelScope Library currently supports deep learning frameworks including PyTorch and TensorFlow, with continuous updates and expansions planned for the future!

All current official models support model inference using ModelScope Library, while some also support training and evaluation using this library. Please refer to the respective model cards for complete usage information.

# Common Methods Provided by the Library

## Model Inference

- Create inference pipelines for specific tasks. Supports specifying models, related data preprocessing, and post-processing to complete single-sample/batch inference. For batch inference, a dataset must be specified. Please refer to the [Model Inference](./模型推理Pipeline.md) tutorial for details.

## Model Training and Evaluation

- Call the trainer to start training tasks (typically fine-tuning) or evaluation tasks (quick benchmark runs). Supports specifying models, datasets, and preprocessing methods, using either default or custom-built training/evaluation loops. Please refer to the [Model Training](./模型的训练.md) tutorial for details.

## Model Export

- Call the Exporter module to export models to formats such as ONNX, TorchScript, and SavedModel. Please refer to the [Model Export](./模型的导出.md) tutorial for details.

# Quick Start

- [Install ModelScope Library](../快速入门/环境安装.md)
- [Quickly implement model inference using pipeline](./模型推理Pipeline.md)
- [Swift Usage Guide](../大模型训练与推理/入门介绍/SWIFT安装.md)