<!-- modelscope-docs: Dataset Card | datasets/dataset-card/dataset-card_EN.md -->

This article introduces the definition, editing guidelines, usage methods, and management instructions for Dataset Cards.

# What is a Dataset Card
Dataset Cards are a key source of information for ModelScope community users to understand datasets. They are files attached to datasets, primarily obtained by parsing the README.md file in the metadata. Dataset Cards consist of YAML metadata and Markdown document content, providing various types of descriptive information.

Therefore, we strongly recommend that platform users write Dataset Cards according to the guidelines for your datasets, so that community users can better understand and discover your datasets!

# What Information Does a Dataset Card Provide
We recommend that Dataset Cards provide the following content descriptions, which can be viewed on the dataset introduction page, including but not limited to:

- **Dataset license and tag information**. Tags include system-recommended tags and user-defined tags.
- **Dataset description and overview**. Introduce basic information about the dataset, usage scenarios, sub-datasets, purposes, data volume, etc.
- **Supported models**. Clearly specify the model information supported by this dataset.
- **Dataset format and structure**. Include data schema information and provide necessary data sample demonstrations.
- **How to use**. Provide simple examples showing users how to use the dataset, including frameworks used, runtime environment requirements, etc. Code examples are highly recommended for better effectiveness.
- **Dataset generation related information**. Can include original data sources, data annotation methods, annotation processes, etc.

# Dataset Card Metadata
A valid Dataset Card needs to contain YAML header information and Markdown text. The YAML header information is separated using --- delimiters. A complete example of the YAML section content is as follows:

```
---
license: Apache License 2.0
# User-defined tags
tags:
  - Alibaba
  - arxiv:1810.99999
  - my free-style tag

text:
  # Level 2 can only belong to one task_categories
  fill_mask:
    # Level 3 can be multi-selected
    languages:
      - en
multilinguality:
  - monolingual

audio:
  automatic_speech_recognition:
    languages:
      - en
      - fr
    sampling_rates:
      - 16000 <!--- integer --->
      - 64000

image:
  Image-to-Text:
    resolutions:
      - 640 x 480
      - 1024 x 720
    color_space:
      - rgb
    encoding:
      - jpeg

video:
  Object-Detection:
    resolutions:
      - 640 x 480
      - 1024 x 720
    encoding:
      - mpeg

multi-modal:
  Feature Extraction:
    resolutions:
      - 640 x 480
    encoding:
      - H264
    languages:
      - en
    multilinguality:
      - monolingual

configs: # Configure sub-datasets and splits for the dataset
- config_name: default
  data_files:
  - split: train
    path: "train_data.csv"
  - split: test
    path: "test_data.csv"

---
<!--- The above YAML section provides attributes/tags description --->

<!--- The following is the markdown-formatted dataset description --->

## Dataset Description
Overall dataset description.

### Dataset Overview
Provide an introduction to the dataset, including supported usage scenarios (including supported languages, etc.).

### Tasks Supported by the Dataset
The training tasks supported by this dataset, along with relevant benchmark results.


## Dataset Format and Structure

### Data Format
Describe the data format, including the data schema, and provide necessary data sample demonstrations.
If the dataset contains multiple sub-datasets, each sub-dataset should provide corresponding data format descriptions.


### Dataset Loading Method
Provide detailed instructions on how to load and use the dataset via git/SDK through code examples.

### Data Splits
Datasets can be split into `train/test/validation` data splits to facilitate model training and testing. You can configure custom data splits by editing the configs tag in README.md.
You can use the configs tag to describe custom splits for your dataset. Here, config_name is the name of the split (i.e., the name of the sub-dataset); data_files are the data file splits for this sub-dataset, including two properties: split and path,
which represent the dataset split and the path to the data file, respectively.



## Dataset Generation Related Information

### Original Data
Describe the source of the original data and how the initial data collection was conducted, including whether normalization or other processing procedures were applied.

### Dataset Annotation
Whether this dataset contains annotations, and if so, provide relevant information descriptions.

#### Annotation Process
How the annotation was implemented and the workflow involved.

#### Annotators
Information about annotators, especially when they differ from the original data providers.



## Dataset Copyright Information

Copyright information related to the dataset, authorized usage scenarios and users. Whether it's open source, and which open-source license is used, etc.

## Citation Format

Whether the dataset has associated papers, and if there's a recommended citation format for referencing the dataset in research papers, etc.

## Other Relevant Information

Personal and sensitive information that may be contained in the dataset, and relevant background considerations for using the dataset;
the social significance of the dataset, potential bias information it may contain, and possible limitations, etc.
```

Supported tags can be referenced in the table below:
| Domain | Task (English) | Task (Chinese) | Filter Tag (English) | Filter Tag (Chinese) | Tag Value (English) | Tag Value (Chinese) |
| --- | --- | --- | --- | --- | --- | --- |
| NLP | text-classification | 文本分类 | type | 类型 | binary-class/multi-class/multi-label | 二分类/多分类/多标签分类 |
|  |  |  | language | 语言 | cn/en | 中文/英语 |
|  | relation-extraction | 关系抽取 | language | 语言 | cn/en | 中文/英语 |
|  | zero-shot | 零样本学习 | language | 语言 | cn/en | 中文/英语 |
|  | translation | 机器翻译 | language | 语言 | cn-en/en-cn/cn-jp | 中英/英中/中日/详见链接 |
|  | token-classification | 词分类 | type | 类型 | ner/word-segmentation/pos-tagging | 命名实体识别/分词/词性标注 |
|  |  |  | language | 语言 | cn-en/en-cn/cn-jp | 中英/英中/中日/详见链接 |
|  | conversational | 智能对话 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  |  |  | type | 类型 | faq/chat/kg-qa/task-qa | FAQ问答/闲聊对话/知识问答/任务型对话 |
|  | text-generation | 文本生成 | language | 语言 | cn/en | 中文/英文 |
|  |  |  | type | 类型 | summarization/question-generation/data-to-text | 文本摘要/问题生成/结构化生成 |
|  | table-question-answering | 表格问答 | language | 语言 | cn/en | 中文/英文 |
|  | feature-extraction | 特征抽取 | language | 语言 | cn/en | 中文/英文 |
|  | sentence-similarity | 句子相似度 | language | 语言 | cn/en | 中文/英文 |
|  | multilingual | 多语言 | language | 语言 | cn/en/de/es/fa/ru | 中文/英文/德文/西班牙文/法文/俄文 |
|  | fill-mask | 完形填空 | language | 语言 | cn/en | 中文/英文/德文/西班牙文/法文/俄文 |
|  | summarization | 摘要总结 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | question-answering | 问答 | language | 语言 | cn/en | 中文、英文 |
| CV | image-to-text | 文字识别 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | pose-estimation | 姿态估计 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | image-classification | 图像分类 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | image-tagging | 图像打标 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | object-detection | 通用检测 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | image-segmentation | 图像分割 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | image-editing | 图像编辑 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | image-generation | 图像生成 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | image-matting | 图像抠图 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
|  | virtual-try-on | 虚拟试衣 | size_scale | 样本规模 | 0-100/100-10k/10k-1m/>1m | 0-100/100-10k/10k-1m/>1m |
| Audio | auto-speech-recognition | 语音识别 | language | 语言 | cn/en/jp | 中文、英语、日语，详见链接 |
|  |  |  | sampling_rate | 采样率 | 8000/16000/24000/32000/other | 8K/16K/24K/32K/其他 |
|  | text-to-speech | 语音合成 | language | 语言 | cn/en/jp | 中文、英语、日语，详见链接 |
|  |  |  | sampling_rate | 采样率 | 16000/22050/24000/44100/48000/other | 16K/22.05K/24K/44.1K/48K/其他 |
|  |  |  | style | 风格 | custom-service/live/novel/newscast/singing/spontaneous/other | 客服/直播/小说/播报/唱歌/口语/其他 |
|  |  |  | emotion | 情感 | neutral/happy/sad/serious/surprise/angry/hate/fear/jealousy/other | 中性/开心/难过/严肃/惊讶/愤怒/厌恶/恐惧/嫉妒/其他 |
|  | speech-signal-process | 语音信号处理 | language | 语言 | cn/en/jp | 中文/英语/日语/详见链接 |
|  |  |  | sampling_rate | 采样率 | 8000/16000/24000/32000/other | 8K/16K/24K/32K/其他 |
|  |  |  | signal_type | 信号类型 | noise/speech/noisy_speech | 纯噪声/纯语音/含噪语音 |
|  |  |  | channels | 声道数 | 1/2/8/16/other | 单声道/双声道/8声道/16声道/其他 |
|  | keyword-spotting | 语音唤醒 | language | 语言 | cn/en/jp | 中文/英语/日语/详见链接 |
|  |  |  | sampling_rate | 采样率 | 8000/16000/24000/32000/other | 8K/16K/24K/32K/其他 |
|  |  |  | signal_type | 信号类型 | noise/speech/noisy_speech | 纯噪声/纯语音/含噪语音 |
|  |  |  | scene_type | 场景类型 | near/far/car | 近场/远场/车机 |
|  |  |  | channels | 声道数 | 1/2/8/16/other | 单声道/双声道/8声道/16声道/其他 |
|  | Audio Claassification | 音频分类 | （以下暂无三级四级标签，完善中） |  |  |  |
|  | Voice Activity Detection | 语音端点检测 |  |  |  |  |
| Video | Object Tracking | 目标追踪 |  |  |  |  |
|  | Action Recognition | 动作识别 |  |  |  |  |
|  | Autonomous Driving | 自动驾驶 |  |  |  |  |
|  | Behavior Understanding | 行为理解 |  |  |  |  |
|  | Video Generation | 视频生成 |  |  |  |  |
|  | Video Super Resolution | 视频超分辨率 |  |  |  |  |
|  | Video Segmentation | 视频分割 |  |  |  |  |
| Multi-Modal | image-captioning | 图像描述 |  |  |  |  |
|  | visual-grounding | 视觉定位 |  |  |  |  |
|  | text-to-image-synthesis | 文本生成图片 |  |  |  |  |
|  | Layout Analysis | 版面分析 |  |  |  |  |
|  | Visual Information Extraction | 视觉信息抽取 |  |  |  |  |
|  | feature-extraction | 特征抽取 |  |  |  |  |
| scientific-computing | biomedicine | 生物医学 |  |  |  |  |
|  | protein-structure | 蛋白质结构生成 |  |  |  |  |


# Data Preview
If the dataset provider has maintained the data files, you can quickly browse the first 1000 records through the data preview tab, allowing you to gain a more intuitive understanding of the data content.
# Dataset Files
You can view all files and version information under the current dataset through the dataset files tab.