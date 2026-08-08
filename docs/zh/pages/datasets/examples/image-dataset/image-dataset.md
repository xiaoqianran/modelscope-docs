<!-- modelscope-docs: 图片数据集 | datasets/examples/image-dataset/image-dataset_CN.md -->

构建图像和视频类型的数据集，主要有三种方式：基于文件夹结构、使用metadata文件、使用parquet格式

# 1. 基于文件夹结构

数据集示例：[图片分类数据集样例](https://modelscope.cn/datasets/AlexEz/image_dataset_example/files)

数据集可以按照以下文件夹结构组织，SDK进行自动推断`split`(`train`,`validation`)和对应`label`，适用于图像分类场景：

```
image_dataset_example
├── train
│   ├── cat
│   │   ├── cat1.jpg
│   │   ├── cat2.jpg
│   └── dog
│       ├── dog1.jpg
│       ├── dog2.jpg
└── validation
    ├── cat
    │   ├── cat_val1.jpg
    │   ├── cat_val2.jpg
    └── dog
        ├── dog_val1.jpg
        ├── dog_val2.jpg

```

- `train` 和 `validation`: 数据划分
- `cat` 和 `dog`: 数据标签
- `dog1.jpg` 和 `cat1.jpg`: 数据文件

## 数据集加载代码

- train split
    ```python
    from modelscope.msdatasets import MsDataset
    dataset = MsDataset.load('AlexEz/image_dataset_example', subset_name='default', split='train')
    ```

- validation split
    ```python
    from modelscope.msdatasets import MsDataset
    dataset = MsDataset.load('AlexEz/image_dataset_example', subset_name='default', split='validation')
    ```


# 2. 使用metadata文件

如果您想在数据集中包含其他信息，例如文本描述(image caption)或边界框(bounding boxes)，请将其作为 `metadata.csv` 文件添加到您的文件夹中。这使您能够快速创建用于不同计算机视觉任务的数据集，如文本描述或目标检测。您也可以使用 JSONL 文件 `metadata.jsonl`。

## 在子目录中添加metadata

```
folder/
├── train/
│   ├── metadata.csv
│   ├── 0001.png
│   ├── 0002.png
│   └── 0003.png
└── test/
    ├── metadata.csv
    ├── 0004.png
    ├── 0005.png
    └── 0006.png
```


> 您的 `metadata.csv` 文件**必须包含一个 `file_name` 列**，该列将图像文件与它们的元数据链接起来。

- `folder/train/metadata.csv` 示例内容：

    ```csv
    file_name,additional_feature
    0001.png,这是你为图像添加的首个文本特征值
    0002.png,这是你为图像添加的第二个文本特征值
    0003.png,这是你为图像添加的第三个文本特征值
    ```
- `folder/test/metadata.csv` 示例内容：
    ```csv
    file_name,additional_feature
    0004.png,这是你为图像添加的首个文本特征值
    0005.png,这是你为图像添加的第二个文本特征值
    0006.png,这是你为图像添加的第三个文本特征值
    ```

如果您选择`jsonl`格式，`metadata.jsonl`文件内容如下：

```json
{"file_name": "0001.png", "additional_feature": "这是你为图像添加的首个文本特征值"}
{"file_name": "0002.png", "additional_feature": "这是你为图像添加的第二个文本特征值"}
{"file_name": "0003.png", "additional_feature": "这是你为图像添加的第三个文本特征值"}
```

## 在父目录中添加metadata

将 `metadata.csv` 文件放在父目录，同时保持 `train` 和 `test` 目录的结构。这是一个示例结构：

```
folder/
├── metadata.csv
├── train/
│   ├── 0001.png
│   ├── 0002.png
│   └── 0003.png
└── test/
    ├── 0004.png
    ├── 0005.png
    └── 0006.png
```

以下是 `metadata.csv` 文件的示例内容，其中包含与 `train` 和 `test` 目录下的图像文件对应的元数据：

```csv
file_name,additional_feature
train/0001.png,这是你为训练图像添加的首个文本特征值
train/0002.png,这是你为训练图像添加的第二个文本特征值
train/0003.png,这是你为训练图像添加的第三个文本特征值
test/0004.png,这是你为测试图像添加的首个文本特征值
test/0005.png,这是你为测试图像添加的第二个文本特征值
test/0006.png,这是你为测试图像添加的第三个文本特征值
```

请确保将 `metadata.csv` 文件放在 `folder/` 目录中，并确保其格式正确，以便能够将图像文件与其元数据有效链接。


## 使用 zip 文件

使用`.zip`文件压缩图片文件时，需要按照[子目录添加metadata](#在子目录中添加metadata)的格式组织文件夹，再将对应的`metadata.jsonl`文件一起压缩

> 注意：zip 文件中的metadata必须为`jsonl`格式


数据集示例：
[图片问答数据集示例](https://modelscope.cn/datasets/AlexEz/image_mcq_example/files)

数据集结构如下：
```
image_mcq_example
├── README.md
├── test.zip
└── train.zip
```

- `train.zip`文件结构如下：
    ```
    train
    ├── AMNH.jpg
    ├── dog.jpg
    ├── metadata.jsonl
    └── tokyo.jpg
    ```

- `test.zip`文件结构如下：
    ```
    test
    ├── metadata.jsonl
    ├── runing.jpg
    └── tesla.jpg
    ```



# 3. 使用parquet格式（推荐）
对于parquet格式，您可以使用datasets、pandas或pyarrow等库进行创建，支持大规模的数据集分片和创建。

## 示例1

[mnist手写数字识别](https://modelscope.cn/datasets/modelscope/mnist/files)

### 数据集配置
```yaml
---
dataset_info:
  config_name: mnist
  features:
  - name: image
    dtype: image
  - name: label
    dtype:
      class_label:
        names:
          '0': '0'
          '1': '1'
          '2': '2'
          '3': '3'
          '4': '4'
          '5': '5'
          '6': '6'
          '7': '7'
          '8': '8'
          '9': '9'
configs:
- config_name: mnist
  data_files:
  - split: train
    path: mnist/train-*
  - split: test
    path: mnist/test-*
  default: true
---
```


## 示例2 

[可图优质咒语书](https://modelscope.cn/datasets/modelscope/Kolors_awesome_prompts/files)

### 数据集配置

```yaml
---
dataset_info:
- config_name: default
  features:
  - name: NAME_ZH
    dtype: string
  - name: PROMPT
    dtype: string
  - name: NEGATIVE_PROMPT
    dtype: string
  - name: IMAGE
    dtype: image
  - name: PROMPT_EXAMPLE
    dtype: string
configs:
  - config_name: default
    data_files:
    - split: train
      path: "data.parquet"
---
```

使用`datasets`创建包含图片的parquet数据集示例代码：
```python
# 读取图片
img = Image.open(image_path)
with io.BytesIO() as output:
    img.save(output, format="PNG")  # 存储为PNG, 也可以用JPEG
    record['IMAGE'] = output.getvalue()
# 创建features
features = datasets.Features({
    'IMAGE': datasets.Image(True),
    'NAME_ZH': datasets.Value('string'),
    'PROMPT': datasets.Value('string'),
    'NEGATIVE_PROMPT': datasets.Value('string'),
    'PROMPT_EXAMPLE': datasets.Value('string'),
})
# 创建dataset
dataset = datasets.Dataset.from_list(records, features=features)
dataset.to_parquet(output_file)
```