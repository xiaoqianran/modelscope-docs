<!-- modelscope-docs: 开发导出流程 | contribute/code-based-integration/model-exploration/model-exploration_CN.md -->

# 开发导出流程

**如果不需要支持模型导出，本步骤可以跳过。**

## PyTorch模型的导出

modelscope/exporters/torch_model_exporter.py中的TorchModelExporter实现了基于trace的导出ONNX和TorchScript的基本方案，具体模型可以继承该类并复写以下几个方法：
- generate_dummy_inputs 生成模型的伪输入用于trace
- inputs 给出模型的inputs结构，仅在导出Onnx时使用
- outputs 给出模型的outputs结构，仅在导出Onnx时使用

> TorchModelExporter对ONNX的导出利用了torch.onnx.export，对TorchScript的导出利用了torch.jit.trace, 如果新接入模型的导出方案不能使用它们，可以自行继承TorchModelExporter的export_onnx/export_torch_script方法来编写自己的导出方案。

## TensorFlow模型的导出

modelscope/exporters/tf_model_exporter.py中的TfModelExporter实现了基于tf2onnx.convert.from_keras的基本方案，如果接入模型是Tf2.0的tf.keras模型，可以继承该类并复写以下方法：

- generate_dummy_inputs：生成模型的伪输入

>  如果接入的TF模型是1.0版本的，建议直接复写TfModelExporter.export_onnx来支持onnx导出。

TfModelExporter声明了export_saved_model/export_frozen_graph_def空方法，如果模型不支持onnx，也可以考虑支持导出savedmodel或frozen_graphdef，并在ModelCard上予以说明。

## 测试用例

模型导出编写完成后需要增加一些测试用例来保证正确性：
1. 根据id拉取模型，并将其导出为指定格式

## 实际的例子

- modelscope/exporters/nlp/sbert_for_sequence_classification_exporter.py 文本分类模型导出onnx/torchscript的例子
- modelscope/exporters/nlp/csanmt_for_translation_exporter.py TF模型导出savedmodel的例子