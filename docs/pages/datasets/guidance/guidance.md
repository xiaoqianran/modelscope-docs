<!-- modelscope-docs: Dataset File Guidelines | datasets/guidance/guidance_EN.md -->

This article provides concise guidelines for new developers on creating standardized dataset files, including the content and structure of README.md files and optional Python script files.

# README.md File
## Purpose
The README.md file is used to describe basic information about the dataset, including its characteristics, source, and usage instructions. It consists of YAML metadata and Markdown-formatted text, which users can view on the dataset introduction page.

> Please maintain this file carefully to help community users better understand and discover your dataset. For detailed configuration information, please refer to [Dataset Cards](./dataset-cards.md) and [Dataset Organization Structure Guidelines](./dataset-creation.md).


# (Optional) Python Script File
## Purpose
The Python file with the same name as the dataset serves to organize, build, and load the dataset.
## Structure
The Python file with the same name contains a Python class with the same name, inheriting from the `datasets.GeneratorBasedBuilder` class. You need to implement three methods:

- `_info` method: Provides basic description and external link information for the dataset. Note: Field names cannot start with "_" to avoid conflicts with system reserved fields.
- `_split_generators`: Defines how to download the dataset and split the data into different purposes (such as training and validation sets).
- `_generate_examples`: Defines the organization format for each data record, including how to convert downloaded data into records convenient for training.

## Official Example
Below is a complete Python script example:

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
The URL information in the code block needs to be modified according to your actual situation to point to the dataset URL address you want to download. After specifying the URL, the dataset will be downloaded and extracted in the subsequent code.

It's worth noting that many public dataset file addresses are overseas, making them difficult or slow to download normally. The author has manually downloaded the fashion_mnist dataset zip package in advance and uploaded it to their own OSS with public read permissions.

It's recommended to verify the Python file locally after writing it:
```python
from datasets import load_dataset
fashion_mnist = load_dataset('./fashion_mnist.py')
```
If the dataset can be successfully loaded, it at least indicates that the Python file meets the requirements. ![image.png](./_resources/1656324519707-cfa0660e-a4d6-4494-8422-02e9a34f39c5.png)
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
## Usage Restrictions
For datasets organized by Python scripts, the corresponding Python script with the same name as the repository will be executed during dataset preview processing. The computing resources used and any potential legal responsibilities belong to the submitting user. Please do not perform any illegal operations.