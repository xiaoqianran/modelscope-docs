<!-- modelscope-docs: 模型文件格式 | contribute/model-file/help/model-file-format/model-file-format_CN.md -->

# 模型文件格式

### 模型文件格式

本地测试通过后， 贡献者可以按照model hub[模型创建以及上传指导](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E5%88%9B%E5%BB%BA%E4%B8%8E%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0)，完成相关模型文件的上传。这里给出几个标准模型文件layout供参考。<br />note 1: top-level文件夹无需创建，直接将文件上传到模型repo的root即可）<br />note 2: README.md文件的组织和撰写，详见[如何撰写好模型卡片](https://www.modelscope.cn/docs/%E5%A6%82%E4%BD%95%E6%92%B0%E5%86%99%E5%A5%BD%E7%94%A8%E7%9A%84%E6%A8%A1%E5%9E%8B%E5%8D%A1%E7%89%87).<br />note 3: 对于有C++额外环境需求的模型，后续将提供更加详细的代码/binaries接入方法。<br />上传完成后，可以获得一个model_id，用于关联使用该模型。

- PyTorch BERT 模型：

```text
bert-base/
├── README.md
├── label_mapping.json
├── configuration.json
├── pytorch_model.pt
├── train_config.json
└── vocab.txt
```

- Tensorflow Image-Matting模型 (frozen graph)

```text
image_matting_person/
├── README.md
├── configuration.json
└── tf_graph.pb
```

- Tensorflow Image-Matting模型 (saved model格式)

```text
image_matting_person/
├── README.md
├── configuration.json
├── saved_model.pb
└── variables
    ├── variables.data-00000-of-00001
    └── variables.index
```
