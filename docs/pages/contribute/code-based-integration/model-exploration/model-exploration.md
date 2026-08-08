<!-- modelscope-docs: Development Export Workflow | contribute/code-based-integration/model-exploration/model-exploration_EN.md -->

# Development Export Workflow

**This step can be skipped if model export support is not required.**

## PyTorch Model Export

The `TorchModelExporter` in `modelscope/exporters/torch_model_exporter.py` implements a basic trace-based solution for exporting ONNX and TorchScript. Specific models can inherit from this class and override the following methods:
- `generate_dummy_inputs`: Generate dummy inputs for the model to use during tracing
- `inputs`: Define the model's input structure (used only when exporting to ONNX)
- `outputs`: Define the model's output structure (used only when exporting to ONNX)

> `TorchModelExporter` uses `torch.onnx.export` for ONNX export and `torch.jit.trace` for TorchScript export. If the export approach for a newly integrated model cannot use these methods, you can override the `export_onnx`/`export_torch_script` methods in `TorchModelExporter` to implement your own export solution.

## TensorFlow Model Export

The `TfModelExporter` in `modelscope/exporters/tf_model_exporter.py` implements a basic solution based on `tf2onnx.convert.from_keras`. If the integrated model is a TensorFlow 2.0 `tf.keras` model, you can inherit from this class and override the following method:

- `generate_dummy_inputs`: Generate dummy inputs for the model

> If the integrated TensorFlow model is version 1.0, it is recommended to directly override `TfModelExporter.export_onnx` to support ONNX export.

`TfModelExporter` declares empty methods `export_saved_model` and `export_frozen_graph_def`. If the model does not support ONNX, you can also consider supporting SavedModel or Frozen GraphDef export, and document this in the ModelCard.

## Test Cases

After implementing model export, you need to add test cases to ensure correctness:
1. Pull the model by ID and export it to the specified format

## Practical Examples

- `modelscope/exporters/nlp/sbert_for_sequence_classification_exporter.py`: Example of exporting a text classification model to ONNX/TorchScript
- `modelscope/exporters/nlp/csanmt_for_translation_exporter.py`: Example of exporting a TensorFlow model to SavedModel