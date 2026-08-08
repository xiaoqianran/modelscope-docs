<!-- modelscope-docs: Library介绍 | sdk/intro/intro_CN.md -->

本篇文章介绍ModelScope Library的产品功能、快速使用指南等。
# 什么是ModelScope Library？
为了使ModelScope的用户能够快速、方便的使用平台提供的各类模型，我们提供了一套功能完备的Python library，其中包含了ModelScope官方模型的实现，以及使用这些模型进行推理，finetune等任务所需的数据预处理，后处理，效果评估等功能相关的代码，同时也提供了简单易用的API，以及丰富的使用样例。通过调用library，用户可以只写短短的几行代码，就可以完成模型的推理、训练和评估等任务，也可以在此基础上快速进行二次开发，实现自己的创新想法。

目前library提供的算法模型，涵盖了图像，自然语言处理，语音，多模态，科学5个主要的AI领域，数十个应用场景任务，具体任务可参考文档：[任务的介绍](./各任务最佳实践/任务的介绍.md)。
## 深度学习框架
ModelScope Library当前支持的深度学习框架包括Pytorch和Tensorflow，后续将持续更新拓展，敬请期待！
当前的官方模型均支持使用ModelScope Library进行模型推理，部分支持使用该库进行训练和评估，具体可参看相应模型的模型卡片，了解完整使用信息。
# Library提供的常用方法
## 模型推理

- 创建特定任务的推理流程。支持指定模型，相关数据预处理，后处理，完成单个样本/批量推理，批量推理需指定数据集。具体请参阅[模型的推理](./模型推理Pipeline.md)教程。
## 模型训练和评估

- 调用trainer启动训练任务(通常是finetune)或评估任务(快速跑benchmark)。支持指定模型，数据集，预处理方法，使用默认或者自行构建training/evaluation loop。具体参阅[模型的训练](./模型的训练.md)教程。
## 模型导出

- 调用Exporter模块导出模型为ONNX、TorchScript、SavedModel等格式，具体参阅[模型的导出](./模型的导出.md)教程。
# 快速开始

- [安装ModelScope Library](../快速入门/环境安装.md)
- [使用pipeline快速实现模型推理](./模型推理Pipeline.md)
- [Swift使用指南](../大模型训练与推理/入门介绍/SWIFT安装.md)
