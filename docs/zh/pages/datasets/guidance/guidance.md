<!-- modelscope-docs: 数据集文件规范 | datasets/guidance/guidance_CN.md -->

本文为新手开发者提供了创建规范数据集文件的简明指引，包括README.md文件和可选的Python脚本文件的内容及结构。

# README.md文件
## 作用
README.md 文件用于描述数据集的基本信息，包括数据集的特点、来源和使用说明。它由YAML元数据和Markdown格式的文本组成，用户可以在数据集介绍页面上查看。

> 请认真维护此文件，以帮助社区用户更好地理解和发现您的数据集。详细配置信息请参考[数据集卡片](./数据集卡片.md)以及[数据集组织结构规范](./数据集的创建.md)。


# (可选)Python script文件
## 作用
数据集同名Python文件，作用是数据集的组织、构建和加载。
## 组成
同名的py文件下有一个同名的Python class，继承了datasets.GeneratorBasedBuilder 类，有三个方法需要您来实现：

- `_info`  方法: 提供数据集的基本描述和外链信息。注意：字段名不能以“_”开头，以避免与系统保留字段冲突。
- `_split_generators`: 定义如何下载数据集以及将数据划分为不同的用途（如训练集和验证集）。
- `_generate_examples`: 定义每条数据的组织方式，包括如何将下载的数据转换为方便进行训练的记录。

## 官方样例
以下是一个完整的Python脚本示例：

```python
# coding=utf-8

# Lint as: python3
"""FashionMNIST Data Set"""


import struct

import numpy as np

import datasets
from datasets.tasks import ImageClassification


_CITATION = """\
@article{DBLP:journals/corr/abs-1708-07747,
  author    = {Han Xiao and
               Kashif Rasul and
               Roland Vollgraf},
  title     = {Fashion-MNIST: a Novel Image Dataset for Benchmarking Machine Learning
               Algorithms},
  journal   = {CoRR},
  volume    = {abs/1708.07747},
  year      = {2017},
  url       = {http://arxiv.org/abs/1708.07747},
  archivePrefix = {arXiv},
  eprint    = {1708.07747},
  timestamp = {Mon, 13 Aug 2018 16:47:27 +0200},
  biburl    = {https://dblp.org/rec/bib/journals/corr/abs-1708-07747},
  bibsource = {dblp computer science bibliography, https://dblp.org}
}
"""

_DESCRIPTION = """\
Fashion-MNIST is a dataset of Zalando's article images—consisting of a training set of
60,000 examples and a test set of 10,000 examples. Each example is a 28x28 grayscale image,
associated with a label from 10 classes. We intend Fashion-MNIST to serve as a direct drop-in
replacement for the original MNIST dataset for benchmarking machine learning algorithms.
It shares the same image size and structure of training and testing splits.
"""

_HOMEPAGE = "https://github.com/zalandoresearch/fashion-mnist"
_LICENSE = "https://raw.githubusercontent.com/zalandoresearch/fashion-mnist/master/LICENSE"

_URL = "http://vpf-pre.oss-cn-hangzhou.aliyuncs.com/tmp/dataset/fashion/"
_URLS = {
    "train_images": "train-images-idx3-ubyte.gz",
    "train_labels": "train-labels-idx1-ubyte.gz",
    "test_images": "t10k-images-idx3-ubyte.gz",
    "test_labels": "t10k-labels-idx1-ubyte.gz",
}

_NAMES = [
    "T - shirt / top",
    "Trouser",
    "Pullover",
    "Dress",
    "Coat",
    "Sandal",
    "Shirt",
    "Sneaker",
    "Bag",
    "Ankle boot",
]


class FashionMnist(datasets.GeneratorBasedBuilder):
    """FashionMNIST Data Set"""

    BUILDER_CONFIGS = [
        datasets.BuilderConfig(
            name="fashion_mnist",
            version=datasets.Version("1.0.0"),
            description=_DESCRIPTION,
        )
    ]

    def _info(self):
        return datasets.DatasetInfo(
            description=_DESCRIPTION,
            features=datasets.Features(
                {
                    "image": datasets.Image(),
                    "label": datasets.features.ClassLabel(names=_NAMES),
                }
            ),
            supervised_keys=("image", "label"),
            homepage=_HOMEPAGE,
            citation=_CITATION,
            task_templates=[ImageClassification(image_column="image", label_column="label")],
        )

    def _split_generators(self, dl_manager):
        urls_to_download = {key: _URL + fname for key, fname in _URLS.items()}
        downloaded_files = dl_manager.download_and_extract(urls_to_download)

        return [
            datasets.SplitGenerator(
                name=datasets.Split.TRAIN,
                gen_kwargs={
                    "filepath": [downloaded_files["train_images"], downloaded_files["train_labels"]],
                    "split": "train",
                },
            ),
            datasets.SplitGenerator(
                name=datasets.Split.TEST,
                gen_kwargs={
                    "filepath": [downloaded_files["test_images"], downloaded_files["test_labels"]],
                    "split": "test",
                },
            ),
        ]

    def _generate_examples(self, filepath, split):
        """This function returns the examples in the raw form."""
        # Images
        with open(filepath[0], "rb") as f:
            # First 16 bytes contain some metadata
            _ = f.read(4)
            size = struct.unpack(">I", f.read(4))[0]
            _ = f.read(8)
            images = np.frombuffer(f.read(), dtype=np.uint8).reshape(size, 28, 28)

        # Labels
        with open(filepath[1], "rb") as f:
            # First 8 bytes contain some metadata
            _ = f.read(8)
            labels = np.frombuffer(f.read(), dtype=np.uint8)

        for idx in range(size):
            yield idx, {"image": images[idx], "label": int(labels[idx])}
```
代码块中 URL 信息，需要您根据实际情况修改为待下载数据集 URL 地址。指定 URL 后，数据集将会在后面的代码中被下载和解压。

值得注意的是，许多公开数据集的文件地址在海外，平时难以下载，或者下载很慢，笔者这里预先将fashion_mnist的数据集zip包手动下载并放到了自己的oss上面，并设置为公共读权限。

建议在本地编写好Python文件以后，先验证一下:
```python
from datasets import load_dataset
fashion_mnist = load_dataset('./fashion_mnist.py')
```
如果可以成功load 到数据集，则至少说明python文件是符合要求的。![image.png](./_resources/1656324519707-cfa0660e-a4d6-4494-8422-02e9a34f39c5.png)
```text
>>> fashion_mnist
DatasetDict({
    train: Dataset({
        features: ['image', 'label'],
        num_rows: 60000
    })
    test: Dataset({
        features: ['image', 'label'],
        num_rows: 10000
    })
})
```
## 使用限制
由 python 脚本组织的数据集，在进行数据集预览处理时将执行提供的仓库同名python脚本，对应计算资源的使用及可能涉及的法律责任归属于提交用户，请勿进行违法操作。