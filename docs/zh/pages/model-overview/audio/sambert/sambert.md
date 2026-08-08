<!-- modelscope-docs: sambert | model-overview/audio/sambert/sambert_CN.md -->

# Sambert语音合成模型训练教程

本文将介绍语音合成模型Sambert, 包括其模型结构, 如何在ModelScope上体验模型效果, 以及如何使用开源代码训练Sambert模型.

## 什么是语音合成

语音合成(Text-to-Speech, TTS) 是指将输入文字合成为对应语音信号的功能，即赋予计算机“说”的能力，是人机交互中重要的一环。现代语音合成最早可以追溯到1939年贝尔实验室制造的第一个电子语音合成器，后来历经共振峰合成、PSOLA合成、Unit Selection波形拼接、统计参数合成几代的发展，在2016年随着WaveNet的出现步入了深度学习合成时代，此时语音合成的效果已经表现出了比拟真人的水准。

一个语音合成系统通常由两部分组成，分别是语言分析部分和声学系统部分，也被称为前端部分和后端部分，语言分析部分主要是根据输入的文字信息进行分析，生成对应的语言学特征，想好该怎么读；声学系统部分主要是根据语音分析部分提供的语音学特征，生成对应的音频，实现发声的功能，其中声学系统部分直接影响了合成语音的自然度和真实感。如人类通过大脑传递神经信号驱动肺部和声带发出声音一样，计算机对输入的文本，先后经过语言分析和声学系统，最终合成语音信号。

<style>
/* Three image containers (use 25% for four, and 50% for two, etc) */
.column {
  float: left;
  width: 50%;
  padding: 2px;
}

/* Clear floats after image containers */
.row::after {
  content: "";
  clear: both;
  display: table;
}

.row {
  display: flex;
}

.column {
  flex: 50%;
  padding: 2px;
}

figcaption {
  color: gray;
  font-style: italic;
  padding: 2px;
  text-align: center;
}

</style>

<div align=center>
    <figure>
        <img src="./_resources/tts_desc.png">
        <figcaption>语音合成系统</figcaption>
    </figure>
</div>

语音合成技术目前被广泛应用在各种领域，例如智能设备语音助手、音视频媒体创作、辅助阅读等，具体到我们的日常使用场景，手机、可穿戴设备、智能音箱、电话客服、有声电子书、各种各样的短视频配音等等，语音合成技术的身影随处可见。随着语音合成技术的不断发展，其合成结果也越来越逼真，也许有一天你无法分辨正在和你交谈的是人类还是计算机。

## Sambert模型设计

在语音合成领域，类似FastSpeech的Parallel模型是目前的主流，它针对基频（pitch）、能量（energy）和时长（duration）三种韵律表征分别建模。但是，该类模型普遍存在一些效果和性能上的问题，例如，独立建模时长、基频、能量，忽视了其内在联系；完全非自回归的网络结构，无法满足工业级实时合成需求；帧级别基频和能量预测不稳定。
因此通义实验室语音实验室设计了SAMBERT，一种基于Parallel结构的改良版TTS模型，它具有以下优点：
1. 建立时长与基频、能量的依赖关系，并使用自回归结构的时长预测模块，提升预测韵律的自然度和多样性
2. Decoder使用PNCA自回归结构，降低带宽要求，支持CPU实时合成
3. 音素级别建模基频、能量，提高容错率
4. 以预训练BERT语言模型为编码器，在小规模数据上效果更好


<div class="row">
  <div class="column">
    <figure>
        <img src="./_resources/fastspeech.png" alt="fastspeech" style="width: 100%;" >
        <figcaption>FastSpeech模型结构</figcaption>
    </figure>
  </div>
  <div class="column">
    <figure>
        <img src="./_resources/sambert.png" alt="sambert" style="width: 100%;" >
        <figcaption>Sambert模型结构</figcaption>
    </figure>
  </div>
</div>

目前通义实验室语音实验室在[ModelScope魔搭社区](https://modelscope.cn/models?page=1&tasks=text-to-speech)已经上线了13个基于Sambert的语音合成模型，其中男女声发音人模型各4个，多发音人模型5个，整体MOS评分在4.5分左右，达到了接近真实录音的水平，模型支持中文、英式英文、美式英文、中英混这几类语言，适用于客服、电销、朗读、视频配音等多种场景。

## 如何体验模型效果

### 在线体验
我们在[ModelScope上线的语音合成模型](https://modelscope.cn/models?page=1&tasks=text-to-speech)均提供了在线体验功能，点击进入模型主页，在页面右侧可以输入想要合成的文本，点击“执行测试”，模型会加载并进行推理，推理完成后，下方的“测试结果”会出现合成的音频，点击它就可以播放音频啦。

<div class="row">
  <div class="column">
    <figure>
        <img src="./_resources/online_demo1.png" style="width: 100%;" >
        <figcaption>点击进入模型主页</figcaption>
    </figure>
  </div>
  <div class="column">
    <figure>
        <img src="./_resources/online_demo2.png" style="width: 100%;" >
        <figcaption>输入文字点击合成</figcaption>
    </figure>
  </div>
</div>

### Notebook体验
对于有一定经验的开发者，还可以通过在线Notebook体验模型效果，点击模型主页右上角的“在Notebook中打开”

<div align=center>
    <figure>
        <img src="./_resources/notebook_open.png">
        <figcaption>点击"在notebook中打开"</figcaption>
    </figure>
</div>

随后会出现选择开发环境的页面，此处我们推荐使用CPU环境，当前可以免费试用, 接着我们创建一个新脚本 (***请注意：首次使用Notebook功能时会提示您关联阿里云账号，按提示操作即可***)

<div class="row">
  <div class="column">
    <figure>
        <img src="./_resources/notebook_envsetting.png" style="width: 100%;" >
        <figcaption>选择Notebook开发环境</figcaption>
    </figure>
  </div>
  <div class="column">
    <figure>
        <img src="./_resources/notebook_script.png" style="width: 100%;" >
        <figcaption>点击创建Python脚本</figcaption>
    </figure>
  </div>
</div>

将模型主页的示例代码粘贴到Notebook代码块中, 这里我们以[中文多发音人预训练模型](https://modelscope.cn/models/speech_tts/speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k/summary)为例，将text替换成想要合成的文本，运行代码块，随后即可在左侧文件栏中获得合成的语音文件，文件可下载到本地进行试听。

```python
from scipy.io.wavfile import write

from modelscope.outputs import OutputKeys
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

# 在此处编辑您想要合成的文本
text = '待合成文本'
model_id = 'speech_tts/speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k'
sambert_hifigan_tts = pipeline(task=Tasks.text_to_speech, model=model_id, model_revision='v1.0.0')
output = sambert_hifigan_tts(input=text)
pcm = output[OutputKeys.OUTPUT_PCM]
write('output.wav', 16000, pcm)
```

<div align=center>
    <figure>
        <img src="./_resources/notebook_codeblock.png">
        <figcaption>运行模型示例代码块</figcaption>
    </figure>
</div>


## 如何训练一个定制语音合成模型

通义实验室语音实验室已经将ModelScope上语音合成模型使用的训练框架[KAN-TTS](https://github.com/alibaba-damo-academy/KAN-TTS)开源到了Github代码托管平台，并提供了[中文多人预训练模型](https://modelscope.cn/models/speech_tts/speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k/summary)，开发者基于此语音合成训练框架及预训练模型，即可在小规模数据集上定制自己的语音合成模型，这里我们将使用[AISHELL-3开源语音合成数据集](https://modelscope.cn/datasets/speech_tts/AISHELL-3/summary)，演示如何生产一个定制化语音合成模型。

首先在开始训练前，我们需要完成环境搭建和数据准备两个操作。

### 环境搭建

获取KAN-TTS源码， 后续操作默认在代码库根目录下执行

```bash
git clone https://github.com/alibaba-damo-academy/KAN-TTS.git
cd KAN-TTS
```
我们推荐使用[Anaconda](https://www.anaconda.com/products/distribution#Downloads)来搭建Python虚拟环境，使用以下命令创建(目前只兼容Linux x86系统)：

```bash
# 防止使用pip安装时出现网络问题，建议切换国内pip源
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 创建虚拟环境
conda env create -f environment.yaml

# 激活虚拟环境
conda activate maas
```

### 数据准备

目前KAN-TTS支持两种类型的数据格式：**阿里标准格式**和**通用格式**

其中阿里标准格式数据如下:

```bash
# 阿里标准格式数据
.
├── interval
│   ├── 500001.interval
│   ├── 500002.interval
│   ├── 500003.interval
│   ├── ...
│   └── 600010.interval
├── prosody
│   └── prosody.txt
└── wav
    ├── 500001.wav
    ├── 500002.wav
    ├── ...
    └── 600010.wav
```
通用格式数据如下：

```bash
# 通用格式数据
.
├── prosody
│   └── prosody.txt
└── wav
    ├── 1.wav
    ├── 2.wav
    ├── ...
    └── 9000.wav
```
`wav`文件夹下存放了音频文件，`prosody`文件夹下的`.txt`文件对应的是音频文件的文本标注， `interval`文件夹下存放的是音素级别的时间戳标注，通常情况下通用格式数据不会携带时间戳标注，这是两种格式的区别。

如果您的数据不满足上述两种格式要求，请联系我们获取数据标注服务。

**快速开始**：你可以从ModelScope下载经过阿里标准格式处理的[AISHELL-3开源语音合成数据集](https://modelscope.cn/datasets/speech_tts/AISHELL-3/summary)，用来进行后续操作。

<div align=center>
    <figure>
        <img src="./_resources/dataset_download.png">
        <figcaption>下载AISHELL3数据集</figcaption>
    </figure>
</div>

```bash
# 解压数据
unzip aishell3.zip
```

解压后得到如下结构文件夹:

```bash
./
├── SSB0005
│   ├── interval
│   ├── prosody
│   └── wav
├── SSB0009
│   ├── interval
│   ├── prosody
│   └── wav
├── SSB0011
│   ├── interval
│   ├── prosody
│   └── wav
├── SSB0012
│   ├── interval
│   ├── prosody
│   └── wav
├── SSB0016
│   ├── interval
│   ├── prosody
│   └── wav
├── SSB0018
......
```
AISHELL-3包含两百多个发音人录音，每个发音人数据量在20～30分钟不等，这里我们选择其中的一个发音人进行数据处理，以SSB0009为例(开发者也可自行选择其他发音人)，训练一个16k采样率的语音合成模型。

由于原始音频采样率为44k，我们先对音频做重采样，这里需要用到该数据集的元数据仓库脚本

```bash
# 拉取元数据仓库，并做重采样处理
git clone https://www.modelscope.cn/datasets/speech_tts/AISHELL-3.git
./AISHELL-3/aishell_resample.sh aishell3 aishell3_16k 16000
```

下面我们选择适合数据采样率的配置文件进行特征提取操作，这里我们以16k采样率为例`kantts/configs/audio_config_16k.yaml` 

运行以下命令来进行特征提取，其中`--speaker`代表该数据集对应发音人的名称，用户可以随意命名。

```bash
# 特征提取
python kantts/preprocess/data_process.py --voice_input_dir aishell3_16k/SSB0009 --voice_output_dir training_stage/SSB0009_feats --audio_config kantts/configs/audio_config_16k.yaml --speaker SSB0009
```

根据数据集规模，特征提取需要运行一段时间，提取完毕后你会在training_stage/SSB0009_feats目录下得到如下结构的文件：

```bash
# 基于阿里标准格式数据所提取出的特征目录
├── am_train.lst
├── am_valid.lst
├── audio_config.yaml
├── badlist.txt
├── data_process_stdout.log
├── duration
├── energy
├── f0
├── frame_energy
├── frame_f0
├── frame_uv
├── mel
├── raw_duration
├── raw_metafile.txt
├── Script.xml
├── train.lst
├── valid.lst
└── wav
```

至此数据准备工作就算完成了。

### 拉取预训练模型

ModelScope[中文多人语音合成模型](https://modelscope.cn/models/speech_tts/speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k/summary)是通义实验室语音实验室在100小时精标多人数据集上训练产出的预训练模型，我们以此为basemodel做后续微调。

使用git命令拉取模型，在拉取前，首先你需要安装git-lfs, 具体的安装教程见[Git Large File Storage](https://docs.github.com/cn/repositories/working-with-files/managing-large-files/installing-git-large-file-storage)，安装完成后执行以下命令

```bash
# 克隆预训练模型
git clone -b pretrain http://www.modelscope.cn/speech_tts/speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k.git
```

在`basemodel_16k`目录下即为我们需要的checkpoints.

### 微调声学模型
KAN-TTS的训练脚本是配置驱动的，我们使用预训练模型的`sambert/config.yaml`作为训练配置文件。

此外根据在数据准备阶段对数据集做的命名，我们还需要修改配置文件中的`speaker_list`配置项：

```yaml
# 将speaker_list其中一个发音人替换为aishell3发音人
linguistic_unit: 
  cleaners: english_cleaners
  lfeat_type_list: sy,tone,syllable_flag,word_segment,emo_category,speaker_category
  speaker_list: SSB0009,F74,FBYN,FRXL,M7,xiaoyu
```

以及`train_max_steps`配置项，我们希望在basemodel 980k的基础上，继续微调120k

```yaml
# 将train_max_steps改为1100100
...
train_max_steps: 1100100
...
```
完成上述必要的配置项修改后，我们就可以使用以下命令训练声学模型了：
```bash
# 训练声学模型
CUDA_VISIBLE_DEVICES=0 python kantts/bin/train_sambert.py --model_config speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k/basemodel_16k/sambert/config.yaml --resume_path speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k/basemodel_16k/sambert/ckpt/checkpoint_980000.pth --root_dir training_stage/SSB0009_feats --stage_dir training_stage/SSB0009_sambert_ckpt
```

根据你的显卡数量和性能不同，此处sambert训练会需要5～10个小时，训练完成后模型输出目录如下：
```bash
# 声学模型输出目录
./SSB0009_sambert_ckpt
├── ckpt/
├── checkpoint_1100000.pth   <----- this is the latest checkpoint
├── checkpoint_1020000.pth
├── checkpoint_1040000.pth
|....
├── config.yaml
├── log/
└── stdout.log
```

### 微调声码器

与声学模型类似，声码器的训练脚本也是配置驱动的，你可以使用预训练模型目录下的`hifigan/config.yaml`作为训练配置文件，另外声学模型和声码器的微调并没有依赖关系，两者可以同时进行。
我们希望在basemodel 2000k steps的基础上再微调100k steps, 但不保留state，修改`hifigan/config.yaml`配置项`train_max_steps`

```bash
# 将train_max_steps改为100100
...
train_max_steps: 100100
...
```
运行以下命令进行训练：
```bash
# 训练声码器
CUDA_VISIBLE_DEVICES=0 python kantts/bin/train_hifigan.py --model_config speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k/basemodel_16k/hifigan/config.yaml --resume_path speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k/basemodel_16k/hifigan/ckpt/checkpoint_2000000.pth --root_dir training_stage/SSB0009_feats --stage_dir training_stage/SSB0009_hifigan_ckpt
```
声码器需要的微调时间较长，根据GPU型号不同在12～20小时不等。
训练完成后，声码器模型输出目录如下：

```bash
# 声码器模型输出目录
.
├── ckpt/
│   ├── checkpoint_20000.pth
│   ├── checkpoint_40000.pth
│   ├── ...
│   └── checkpoint_100000.pth      <---- this is the latest checkpoint
├── config.yaml
├── log/
└── stdout.log
```

### 体验微调模型效果
在声学模型和声码器微调完毕后，我们就可以使用产出的模型文件来合成语音了，在此之前需要做一些准备工作。

将我们想要合成的文本写入一个文件`test.txt`，每句话按行分隔，如下所示

```txt
徐玠诡谲多智，善揣摩，知道徐知询不可辅佐，掌握着他的短处以归附徐知诰。
许乐夫生于山东省临朐县杨善镇大辛庄，毕业于抗大一分校。
宣统元年（1909年），顺德绅士冯国材在香山大黄圃成立安洲农务分会，管辖东海十六沙，冯国材任总理。
学生们大多住在校区宿舍，通过参加不同的体育文化俱乐部及社交活动，形成一个友谊长存的社会圈。
学校的“三节一会”（艺术节、社团节、科技节、运动会）是显示青春才华的盛大活动。
雪是先天自闭症患者，不懂与人沟通，却拥有灵敏听觉，而且对复杂动作过目不忘。
勋章通过一柱状螺孔和螺钉附着在衣物上。
雅恩雷根斯堡足球俱乐部（）是一家位于德国雷根斯堡的足球俱乐部，处于德国足球丙级联赛。
亚历山大·格罗滕迪克于1957年证明了一个深远的推广，现在叫做格罗滕迪克–黎曼–罗赫定理。
```

运行以下命令进行合成：
```bash
# 运行合成语音
CUDA_VISIBLE_DEVICES=0 python kantts/bin/text_to_wav.py --txt test.txt --output_dir res/SSB0009_syn --res_zip speech_sambert-hifigan_tts_zh-cn_multisp_pretrain_16k/resource.zip --am_ckpt training_stage/SSB0009_sambert_ckpt/ckpt/checkpoint_1100000.pth --voc_ckpt training_stage/SSB0009_hifigan_ckpt/ckpt/checkpoint_2100000.pth --speaker SSB0009
```

完成后在`res/SSB0009_syn/res_wavs`文件夹下就可以获得合成结果
```bash
│   ├── 8_0_dur.txt
│   ├── 8_0_energy.txt
│   ├── 8_0_f0.txt
│   ├── 8_0_mel.npy
│   ├── 8_1_dur.txt
│   ├── 8_1_energy.txt
│   ├── 8_1_f0.txt
│   └── 8_1_mel.npy
├── res_wavs
│   ├── 0.wav
│   ├── 1.wav
│   ├── 2.wav
│   ├── 3.wav
│   ├── 4.wav
│   ├── 5.wav
│   ├── 6.wav
│   ├── 7.wav
│   └── 8.wav
├── stdout.log
└── symbols.lst
```
#### 合成样音

<audio controls src="https://raw.githubusercontent.com/wiki/alibaba-damo-academy/KAN-TTS/resources/audio/synthesis/0.wav" ></audio>
<audio controls src="https://raw.githubusercontent.com/wiki/alibaba-damo-academy/KAN-TTS/resources/audio/synthesis/1.wav" ></audio>
<audio controls src="https://raw.githubusercontent.com/wiki/alibaba-damo-academy/KAN-TTS/resources/audio/synthesis/2.wav" ></audio>
<audio controls src="https://raw.githubusercontent.com/wiki/alibaba-damo-academy/KAN-TTS/resources/audio/synthesis/3.wav" ></audio>

#### 原始录音
<audio controls src="https://raw.githubusercontent.com/wiki/alibaba-damo-academy/KAN-TTS/resources/audio/recording/SSB00090001.wav" ></audio>
<audio controls src="https://raw.githubusercontent.com/wiki/alibaba-damo-academy/KAN-TTS/resources/audio/recording/SSB00090002.wav" ></audio>
<audio controls src="https://raw.githubusercontent.com/wiki/alibaba-damo-academy/KAN-TTS/resources/audio/recording/SSB00090003.wav" ></audio>
<audio controls src="https://raw.githubusercontent.com/wiki/alibaba-damo-academy/KAN-TTS/resources/audio/recording/SSB00090005.wav" ></audio>


## 参考文献
```bibtex
@inproceedings{li2020robutrans,
  title={Robutrans: A robust transformer-based text-to-speech model},
  author={Li, Naihan and Liu, Yanqing and Wu, Yu and Liu, Shujie and Zhao, Sheng and Liu, Ming},
  booktitle={Proceedings of the AAAI Conference on Artificial Intelligence},
  volume={34},
  number={05},
  pages={8228--8235},
  year={2020}
}
```

```bibtex
@article{devlin2018bert,
  title={Bert: Pre-training of deep bidirectional transformers for language understanding},
  author={Devlin, Jacob and Chang, Ming-Wei and Lee, Kenton and Toutanova, Kristina},
  journal={arXiv preprint arXiv:1810.04805},
  year={2018}
}
```

```bibtex
@article{kong2020hifi,
  title={Hifi-gan: Generative adversarial networks for efficient and high fidelity speech synthesis},
  author={Kong, Jungil and Kim, Jaehyeon and Bae, Jaekyoung},
  journal={Advances in Neural Information Processing Systems},
  volume={33},
  pages={17022--17033},
  year={2020}
}
```
