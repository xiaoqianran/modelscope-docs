<!-- modelscope-docs: 撰写完善的模型卡片 | contribute/model-file/help/wrtie-perfect-model-card/wrtie-perfect-model-card_CN.md -->

## Model card编写

ModelCard（即README.md）是ModelScope用户，即模型的使用者了解模型的重要途径，其内容除了提供模型必要的meta信息以外，还会用来渲染ModelScope网页上模型的landing page。所以每个ModelScope上的模型，除了加载模型所必要的bianries和配置文件以外，README.md对于模型能被正常使用也具有至关重要的作用。在一个模型正式被ModelScope接受之前，请务必保证README.md文件参照[规范和样例](../如何撰写好用的模型卡片)详细填写。

好的模型卡片可以帮助用户更好地理解您的模型内容，也可以增加模型的可见性、可搜索性和易读性。 如下为官方推荐的几个模型卡片样例，可供参考：

- https://www.modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary

为了保障平台内的模型质量，我们针对所有贡献者的模型，引入了文件审核机制。目前该审核机制会校验以下几种情况，如果命中了任意一种，则该模型被标记为预发布状态：

1. README 不超过200字或者使用了默认README模版。
2. 未上传除 .gitattributes,  README.md, config.json/configuration.json 三个文件以外的其他文件。
3. 英文名**只有"test"**。
4. 中文名**只有"test"**，或**只有"测试"**。

在您已经将模型文件上传到hub中，且您上传的模型没有满足以上条件，我们将自动为您的模型标记为**预发布（preview）状态**，预发布状态下，**该资源不支持列表页展示及搜索**。我们鼓励更多开发者在ModelScope社区内分享模型，同时也希望能够和开发者一起完善模型的质量。



#### **README (model-card) 的图文/表格组织方式**

Markdown文件允许插入图片，如果希望在model card中展示图片，建议统一将图片文件上传到repo上的description文件夹内，一个最简单的组织结构范例如下：

```
├── README.md
├── configuration.json
├── description
│   └── model_image.jpg <--- image that can be displayed on model card 
└── pytorch_model.pt
```


对应的，在README.md文件中适当的位置添加reference即可

```
![模型图片](description/model_image.jpg)
```

插入表格，公式，code segment等，直接使用markdown的对应语法即可。

下面介绍ModelCard中需要列举的常用信息。

# <模型名字>介绍

介绍模型的基本信息。

## 模型描述
提供模型描述，包括模型结构，使用的训练数据集，以及适用场景等等内容。

## 期望模型使用方式以及适用范围
介绍模型的目标使用场景。

### 如何使用
介绍模型如何使用，包括如何进行模型推理等等信息。在这里希望模型提供者能提供
详尽的范例以及代码片段来介绍模型的使用方法。对于需要配置负责运行环境的模型，
也可以在这里提供怎样配置模型运行环境的详细介绍。

如果模型支持finetune功能的话，在本章节也应该提供如果准备finetune可能需要的
数据集格式。

#### 代码范例
提供代码块

### 模型局限性以及可能的偏差
介绍模型适用的场景，以及在哪些场景可能存在局限性，以及模型在构造训练过程中，本身可能带有的，由于训练数据以及训练方法等因素引入的偏向性。

## 训练数据介绍
训练数据是如何获取，组织，以及针对模型的需求进行格式话的。

## 模型训练流程
描述模型是如何具体训练出来的。

### 预处理

### 训练

## 数据评估及结果
提供模型在不同数据集上的性能评测，包括评测数据是如何获得的。评测结果本身
可以通过表格，图像等多种方法做展示。

### 相关论文以及引用信息
如果本模型有相关论文发表，或者是基于某些论文的结果，可以在这里
提供Bibtex格式的参考文献。

[
](https://test.modelscope.cn/#/models/damo/ofa_image-caption_coco_large_en/)
