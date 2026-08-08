<!-- modelscope-docs: Model File Format | contribute/model-file/help/model-file-format/model-file-format_EN.md -->

# Model File Format

### Model File Format

After local testing is completed, contributors can upload the relevant model files following the ModelScope [Model Creation and Upload Guide](https://www.modelscope.ai/docs/Model-Creation-and-File-Upload). Here are several standard model file layouts for reference.<br />Note 1: There's no need to create a top-level folder; simply upload files directly to the root of the model repository.<br />Note 2: For organization and writing of the README.md file, please refer to [How to Write a Good Model Card](https://www.modelscope.ai/docs/How-to-Write-a-Good-Model-Card).<br />Note 3: For models with additional C++ environment requirements, more detailed methods for integrating code/binaries will be provided later.<br />After uploading is complete, you will receive a model_id that can be used to associate with and utilize this model.

- PyTorch BERT Model:

```text
bert-base/
├── README.md
├── label_mapping.json
├── configuration.json
├── pytorch_model.pt
├── train_config.json
└── vocab.txt
```

- TensorFlow Image-Matting Model (frozen graph)

```text
image_matting_person/
├── README.md
├── configuration.json
└── tf_graph.pb
```

- TensorFlow Image-Matting Model (saved model format)

```text
image_matting_person/
├── README.md
├── configuration.json
├── saved_model.pb
└── variables
    ├── variables.data-00000-of-00001
    └── variables.index
```