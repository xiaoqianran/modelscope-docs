<!-- modelscope-docs: 数据集卡片 | datasets/dataset-card/dataset-card_CN.md -->

本篇文章介绍数据集卡片（Dataset card） 的定义、编辑规范、使用方式和管理说明。

# 什么是数据集卡片
数据集卡片是ModelScope社区用户获取数据集信息的关键来源，是数据集附带的文件，主要通过解析元数据文件中的README.md文件获取。数据集卡片是由YAML元数据和Markdown文档内容组成，提供了各类介绍信息。

因此我们强烈推荐平台用户根据规范撰写属于您的数据集卡片，以便让社区用户更好地了解和发现您的数据集！

# 数据集卡片提供哪些信息
我们推荐数据集卡片提供如下内容描述，可通过数据集介绍页面进行查看，包括但不限于：

- **数据集协议、标签信息**。其中标签包含系统推荐标签和用户自定义标签。
- **数据集描述与简介**。介绍该数据集的基础信息、使用场景、子数据集、用途、数据量等。
- **支持的模型**。明确该数据集支持的模型信息。
- **数据集的格式和结构**。 包含数据的schema信息，并提供必要的数据样本示范。
- **如何使用**。 可以给出简单示例介绍用户如何使用该数据集，包括所使用的框架、运行环境要求等。若给出代码范例供效果更佳。
- **数据集生成的相关信息**。可以包含原始数据来源、数据标注方式、标注过程等。

# 数据集卡片的元数据
一个有效的数据集卡片需要包含YAML头部信息和Markdown文本。 头部的YAML信息使用---分组进行区隔。一份完整的YAML部分的内容参考如下：

```
---
license: Apache License 2.0
#用户自定义标签
tags:
  - Alibaba
  - arxiv:1810.99999
  - my free-style tag

text:
  #二级只能属于一个task_categories
  fill_mask:
    #三级可以多选
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

configs: # 配置数据集的子数据集和划分
- config_name: default
  data_files:
  - split: train
    path: "train_data.csv"
  - split: test
    path: "test_data.csv"

---    
<!--- 以上YAML section提供属性/tags描述--->

<!--- 以下为markdown格式的dataset描述--->

## 数据集描述
数据集整体描述。

### 数据集简介
提供对于数据集的介绍，支持的使用场景（包括支持的语言等）。

### 数据集支持的任务
该数据集支持的训练任务，以及相关benchmark结果。


## 数据集的格式和结构

### 数据格式
对数据的格式进行描述，包括数据的schema，以及提供必要的数据样本示范。
如果数据集内含多个子数据集的话，每个字数据集都应该提供相对应的数据格式描述。


### 数据集加载方式
通过代码范例等方式，提供数据集通过git/SDK进行加载和使用的详细说明。

### 数据分片
数据集可以被切分成`train/test/validation`的数据分片，以便于训练和测试模型。您可以通过编辑README.md中的configs标签，来配置自定义数据分片。
您可以使用configs标签，对数据集的自定义分片进行描述。其中，config_name为分片的名称，即子数据集的名称；data_files为该子数据集的数据文件分片，包括split和path两个属性，
分别表示数据集的划分和数据文件的路径。



## 数据集生成的相关信息

### 原始数据
描述原始数据的来源以及数据的初步收集是如何进行的，是否经过归一化等处理流程。

### 数据集标注
该数据集是否包含标注，若有的话，相关信息描述。

#### 标注过程
标注是通过什么方式实现的，流程如何。

#### 标注者
标注者相关信息，尤其是当标着和原始数据提供者有所区别时。



## 数据集版权信息

数据集相关的版权信息，授权使用的场景和用户。是否开源，以及采用哪个开源协议等等。

## 引用方式

数据集是否有相关联的文章，以及如果在研究论文中要引用该数据集是否有推荐的引用格式等等。

## 其他相关信息

该数据集可能包含的个人和敏感信息，使用数据集需要考虑的相关背景；
数据集可能包含的社会意义以及其中可能包含的bias信息和可能的局限性等等。
```

已支持的标签可参考下表：
| 领域 | 任务（英文） | 任务（中文） | 筛选标签（英文） | 筛选标签（中文） | 标签值（英文） | 标签值（中文） |
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


# 数据预览
如数据集的提供者已对数据文件进行了维护，那么您可以通过数据预览标签，快速浏览前1000条数据，方便您对数据内容有更直观的掌握。
# 数据集文件
您可以通过数据集文件标签，查看当前数据集下所有的文件和版本信息。
