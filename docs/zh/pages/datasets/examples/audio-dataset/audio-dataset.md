<!-- modelscope-docs: 音频数据集 | datasets/examples/audio-dataset/audio-dataset_CN.md -->

音频文件的组织方式与图像文件类似，示例如下：

# 组织数据集文件夹格式

在 modelscope上创建数据集库，并按照如下结构组织您的数据集目录：

```
my_dataset/
├── README.md
├── metadata.csv
└── data/
    ├── first_audio_file.mp3
    ├── second_audio_file.mp3
    └── third_audio_file.mp3
```

`data` 文件夹可以取任何您想要的名称。

# 元数据格式

元数据文件(metadata)应该包含一个 `file_name` 列，以将音频文件与其元数据关联：

```csv
file_name,transcription
data/first_audio_file.mp3,转录文本1
data/second_audio_file.mp3,转录文本2
data/third_audio_file.mp3,转录文本3
```


# 多拆分数据集

如果您的数据集涉及多个拆分，目录结构可能如下所示：

```
my_dataset/
├── README.md
├── metadata.csv
└── data/
    ├── train/
    │   ├── first_train_audio_file.mp3
    │   └── second_train_audio_file.mp3
    └── test/
        ├── first_test_audio_file.mp3
        └── second_test_audio_file.mp3
```

**注意**：如果音频文件不在metadata同级目录，`file_name` 列应显示音频文件的完整相对路径，而不仅仅是文件名。

metadata.csv 示例：
```csv
file_name,transcription
data/train/first_train_audio_file.mp3,转录文本1
data/train/second_train_audio_file.mp3,转录文本2
data/test/first_test_audio_file.mp3,转录文本3
data/test/second_test_audio_file.mp3,转录文本4
```

# 自动推断标签

对于没有关联元数据的音频数据集，将根据目录名称自动推断数据集的类别标签，这对音频分类任务十分有用。数据集目录示例：

```
data/train/electronic/01.mp3
data/train/punk/01.mp3
data/test/electronic/09.mp3
data/test/punk/09.mp3
```

通过SDK加载数据集，它将基于目录名称创建 `label` 列：

```python
dataset = MsDataset.load("/path/to/data")
print(dataset["train"][0])
```

输出示例：
```python
{'audio': {'path': '/path/to/electronic/01.mp3', ...},
 'label': 0  # "electronic"
}
```