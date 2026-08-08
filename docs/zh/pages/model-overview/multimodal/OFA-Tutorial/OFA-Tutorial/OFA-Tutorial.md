<!-- modelscope-docs: OFA_Tutorial | model-overview/multimodal/OFA-Tutorial/OFA-Tutorial/OFA-Tutorial_CN.md -->

# 0. OFA是什么？
OFA(One-For-All)是通义实验室M6团队研发的通用多模态预训练模型，使用简单的序列到序列的学习框架统一模态（跨模态、视觉、语言等模态）和任务（如图片生成、视觉定位、图片描述、图片分类、文本生成等）。这个工作已经发表在ICML 2022上（详见[OFA](https://arxiv.org/abs/2202.03052 )），得到了如Google Brain，DeepMind，Microsoft等一线多模态大模型玩家的引用和关注，在发表约半年的时间内已经有**60多个学术界论文**引用了OFA（其中有一些有意思的应用会第4节：大家在用OFA干什么介绍和说明）。
OFA践行了One For All的理念，同时也在多模态和单模态任务上都得到了较好的结果，如Image Captioning（CIDEr 154.9）、VQA（acc 82.0）、ImageNet-1k（top-1 acc 85.6)、Gigaword（Rouge-1 39.81）等等。
上面简要说明了OFA的理念和效果，相信有些同学很想了解上述介绍中的一些概念，也有些同学很期望了解如何在ModelScope（后面简称为MS）上面如何使用OFA，接下来文档会先从动手层面讲解，最后是简单介绍为OFA的理念和概念，整体安排如下：
- 第1节帮助同学们手把手玩转OFA； 
- 第2节实例介绍如何用OFA做一些有意思的应用； 
- 第3节介绍国内外学术界同仁都在用OFA做什么。
- 第4节介绍OFA核心理念&概念； 

对相关领域感兴趣的同学可以直接浏览相关章节。

<br>

# 1. 手把手玩转OFA
对于一个机器学习模型，我们基本上主要需要了解以下一些信息：如何配置环境、如何推断、如何评估、如何训练、配置项有哪些、核心代码在哪里&如何理解。掌握了这些信息，我们就基本上理解了模型，并具备了对模型进行二次开发的初步条件，剩下的细节则在具体代码中，请同学们打开IDE，利用IDE的强大能力研究具体实现吧。本节的后续小节就主要给大家介绍这些核心内容，里面的示例代码都能够在MS的notebook上即贴即用。
注：MS相关的介绍请参考[此处](https://www.modelscope.cn/docs )，以下小节只会介绍涉及的部分文档。
## 1.1 配置环境
### 1.1.1 使用MS的notebook
随意打开一个modelcard，如[ofa caption](https://www.modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary )，按如下两步操作：

step 1：

<p align="center">
    <img src="./_resources/notebook.png" width="400" />
</p>

step 2:

<p align="center">
    <img src="./_resources/notebook_update.png" width="400" />
</p>

MS的notebook（类似python的notebook）已经预装了相关的环境，所以启动后可以直接使用。step 2中红框部分为环境信息：`ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.0`，分别为操作系统、cuda版本(GPU环境)、python版本、PyTorch版本、TensorFlow版本和ModelScope版本。
### 1.1.2 自己动手配置
使用MS进行推断和开发需要配置好MS的相关运行环境。MS的环境管理主要是依赖基础的深度学习框架：Pytorch和TensorFlow；同时MS集成了各个模态的模型，所以依赖相对比较复杂，因此建议使用Conda进行环境管理，新建一个python环境。详细文档见[这里](https://www.modelscope.cn/docs/%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85 )。
建好环境并安装基础深度学习环境后，安装多模态相关依赖库和fairseq，如下所示：
```shell
pip install "modelscope[multi-modal]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
# ms升级命令
# pip install --upgrade "modelscope[multi-modal]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html

pip install fairseq # ofa 依赖了fairseq
```

安装验证（会下载模型并展示进度条，默认下载路径~/.cache/modelscope/hub）：
```shell
python -c "from modelscope.pipelines import pipeline;print(pipeline('image-captioning')('https://shuangqing-public.oss-cn-zhangjiakou.aliyuncs.com/donuts.jpg'))"
```
## 1.2 如何推断
OFA是基于Transformer的encoder-decoder模型，目前在学术界和工业界备受欢迎的代码库就是HuggingFace（以后简称为HF）的transformers。我们在MS上的代码就是基于transfomers进行实现的，希望这种实现方式对于同学们快速理解OFA有帮助。MS中OFA的推断方式主要是通过Pipeline进行的，可以很简单的调用OFA的推断能力。
OFA是一个预训练框架，具体推断的时候我们以基于OFA的[Image Captioning](https://www.modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary )任务来举例。
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

img_captioning = pipeline(Tasks.image_captioning, model='damo/ofa_image-caption_coco_large_en')
result = img_captioning({'image': 'https://shuangqing-public.oss-cn-zhangjiakou.aliyuncs.com/donuts.jpg'})
print(result[OutputKeys.CAPTION]) # 'a bunch of donuts on a wooden board with popsicle sticks'
# 目前caption支持了batch inference，方式非常简单，具体如下：
result = img_captioning([{'image': 'https://shuangqing-public.oss-cn-zhangjiakou.aliyuncs.com/donuts.jpg'} for _ in range(3)], batch_size=2)
for r in result:
    print(r[OutputKeys.CAPTION]) # 'a bunch of donuts on a wooden board with popsicle sticks'

```

## 1.3 如何批量读数据&评估
推断是对少量样本进行的前向运算过程，可以帮助我们快速的感知到模型的输入和输出，并初步判断模型的性能。但是机器学习的模型效果的准确评估一般是需要对一个权威的数据集进行打分测试。
接下来我同样以图像描述任务为例，给出对于使用OFA进行评估的一般流程。首先进入到OFA系列模型的ModelCard页面（[Image Captioning](https://modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary ))，可以看到页面右侧有展示有关联的数据集，如下图（有关联数据的模型页面同样会展示相应的评估/训练的代码）：

<p align="center">
    <img src="./_resources/dataset.png" width="400" />
</p>

注意：针对单条样本的推断和针对数据集的推断有一个区别，就是对于数据集我们需要注意处理IO，这里可以直接点击进入数据集页面，查看数据集的调用方式，其代码如下：
```python
from modelscope.msdatasets import MsDataset
from modelscope.utils.constant import DownloadMode
ms_ds_train = MsDataset.load("coco_2014_caption", namespace="modelscope", split="validation")
print(next(iter(ms_ds_train)))
```
目前pipeline不支持batch输入，还需要单条样本执行inference，我们后面会升级支持pipeline的batch处理能力。
存储下inference结果和ground truth结果即可以完成评估工作。


## 1.4 如何训练
一般而言，finetune是指在预训练模型的基础上进行的，OFA当下有7个预训练ckpt，在本页附录的模型导航可以找到对应链接。目前OFA下游task已经陆续支持finetune，mnli、caption、ocr已经支持训练，而其他任务正在陆续支持中。OFA整体的finetune方法是类似的，主要变动的是针对任务的预处理和针对不同任务metrics的处理。
下面给出一个finetune ocr的具体实例，较全配置的脚本可以点击[这里](http://xingchen-data.oss-cn-zhangjiakou.aliyuncs.com/maas/scripts/finetune_ocr.py)下载， 启动方式是 python finetune_ocr.py
### 1.4.1 关键配置项
启动一个下游任务的finetune过程需要首先定义配置，下面详细介绍一个配置项：
```python
finetune_cfg = {
    'framework': 'pytorch',  # 运行框架
    'task': 'ocr-recognition',  # 运行任务
    'model': {'type': 'ofa',  # 模型的类型（一般是模型backbone/骨架）这个key下面主要放了如何构建推断的ofa任务
              'language': 'zh',  # 输入输出语言
              },
    'pipeline': {'type': 'ofa-ocr-recognition'},  # pipeline的类型
    'dataset': {'column_map': {'text': 'label', 'image': 'image'}}, # 针对数据集合模型预处理预定义的字段不同，这里做一个映射,key是数据集字段名，value是预处理采用的字段名
    'train': {  # finetune相关配置
        'max_epochs': 1,  # 训练轮数
        'dataloader': {'batch_size_per_gpu': 4, 'workers_per_gpu': 0},  # 数据下载器的配置
        'lr_scheduler': {'name': 'polynomial_decay',  # 学习率配置，不同学习器参数不同。
                         'warmup_proportion': 0.01,
                         'lr_end': 1e-07},
        'lr_scheduler_hook': {'type': 'LrSchedulerHook', 'by_epoch': False}, # ms使用hook进行finetune时各种行为管理，具体来说根据hook是根据step还是epoch以及具体步数进行相应行为的调用
        'optimizer': {'type': 'AdamW', 'lr': 5e-05, 'weight_decay': 0.01},  # optimizer的配置
        'criterion': {'name': 'AdjustLabelSmoothedCrossEntropyCriterion'}},  # 这里criterion相当于是计算loss的全部逻辑，仿照了fairseq的写法
    'evaluation': { 'dataloader': {'batch_size_per_gpu': 4, 'workers_per_gpu': 0}, # eval数据下载器的参数, # 评估时使用的方法，这里是acc
        'metrics': [{'type': 'accuracy'}]},
    'preprocessor': []}  # 预处理配置，这里为空（ofa有统一的预处理方式）
```

### 1.4.2 启动训练
基本配置完成，我们就可以进行finetune了，下面介绍启动finetune的代码：
```python
import os
import json
import shutil
from modelscope.utils.constant import Tasks
from modelscope.pipelines import pipeline
from modelscope.metainfo import Metrics, Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.constant import ModelFile
from modelscope.outputs import OutputKeys
from modelscope.hub.snapshot_download import snapshot_download

WORKSPACE = "./workspace"
ocr_model = 'damo/ofa_ocr-recognition_scene_base_zh'
ocr_path = snapshot_download(ocr_model) # 下载模型至缓存目录，并返回目录
# ofa通用的pretrained模型，未针对OCR场景做过调优
pretrained_model = 'damo/ofa_pretrain_base_zh' # 预训练模型的模型id
pretrained_path = snapshot_download(pretrained_model, revision='v1.0.0') # 预训练模型tag时间低于modelscope v1.0.2的发布时间，所以使用ms 1.0.2版本时需要额外增加具体的tag version
shutil.copy(os.path.join(ocr_path, ModelFile.CONFIGURATION), # 将任务的配置覆盖预训练模型的配置
            os.path.join(pretrained_path, ModelFile.CONFIGURATION))
os.makedirs(WORKSPACE, exist_ok=True)
config_file = os.path.join(WORKSPACE, ModelFile.CONFIGURATION) # 写一下配置文件
with open(config_file, 'w') as writer:
    json.dump(finetune_cfg, writer, indent="\t")
# trainer的其他配置项
args = dict(
    model=pretrained_path, # 要继续finetune的模型
    work_dir=WORKSPACE,
    train_dataset=MsDataset.load( # 数据集，这里msdataset兼容huggingface的dataset
        'ocr_fudanvi_zh', # msdataset的id
        namespace='modelscope',
        split='train'),
    eval_dataset=MsDataset.load('ocr_fudanvi_zh', namespace='modelscope', split='validation'),
    cfg_file=config_file) # 配置文件地址
trainer = build_trainer(name=Trainers.ofa, default_args=args) # 构建训练器
trainer.train()
```

## 1.5 模型关键配置介绍
OFA的模型配置和绝大部分基于transformer的enc-dec配置非常类似，同时由于完全兼容HF，所以我们的配置类是继承自HF transformers中PretrainedConfig，文件名为**config.json**。
模型配置文件在[这里](https://modelscope.cn/models/damo/ofa_image-caption_coco_large_en/file/view/master/config.json )。下面json文件是核心配置项示例和注释，不是正确的Json格式。
```json
{
  ...
  "attention_dropout": 0.0,  # 注意力值的神经元丢弃概率
  "d_model": 1024, # 模型层的输出维度，也是词典中每个token的维度
  "decoder_attention_heads": 16, # 解码器注意力头个数
  "decoder_drop_path_rate": 0.0, # 解码器droppath的概率
  "decoder_ffn_dim": 4096, # 解码器全连接层的维度
  "decoder_layers": 12, # 解码器的层数
  "dropout": 0.1, # 全连接层的神经元丢弃概率
  ... : # 编码器的配置项类似
  "normformer": true, # 是否使用normformer
  "resnet_type": "resnet152",  # 图像侧的编码网络结构，目前支持['resnet18', 'resnet34', 'resnet50', 'resnet101', 'resnet152'] 
  "vocab_size": 59457, # 词典大小，这里是文本侧词典（英文是BPE，中文是bert-base-chinese的词典）
  ...
}
```

## 1.6 核心代码介绍
对于OFA来说，核心代码是如何构建tokenizer和模型；对于MS来说则是Pipeline如何构建、如何train以及如何评估。接下来会重点介绍OFA相关的核心代码，简要介绍MS相关核心代码，因为后者可以重点参考MS自身的[文档中心](https://modelscope.cn/docs )。
### 1.6.1 OFA Tokenizer
OFA最初是一个学术工作，其中语言部分主要是使用了英文数据，当时应用的tokenizer是等价于GPT2的BPE tokenizer。之后为了能够支持中文，我们重新使用了bert-base-chinese的tokenizer，并对词表做了简单修改，因此在OFA有中英文不同的两个Tokenizer。两个tokenizer的基本构造逻辑是一样的，但是词表大小差距较大其中为了兼容英文的Tokenizer（BPE based）一些用法，中文版本做了一些简单的适配。注意，因为OFA是支持多模态输入，所以对于Tokenizer，OFA在支持原本的文本以外还额外增加了image离散化的code和位置离散化后的bin。
具体代码见：modelscope/models/multi_model/ofa/tokenization_ofa.py
OFATokenizer和OFATokenizerZH都可以用兼容HF transformers的方式方便的构建。在获取了model files之后，具体如下所示：
```python
from modelscope.models.multi_modal.ofa import OFATokenizer, OFATokenizerZH
from modelscope.hub.snapshot_download import snapshot_download
model_en_path = snapshot_download('damo/ofa_image-caption_coco_large_en')
model_zh_path = snapshot_download('damo/ofa_image-caption_muge_base_zh')
tokenizer_en = OFATokenizer.from_pretrained(model_en_path)
tokenizer_zh = OFATokenizerZH.from_pretrained(model_zh_path)

# 增加code id和bin id
tokenizer_en.add_tokens(['<code_{}>'.format(i) for i in range(8192)])
tokenizer_en.add_tokens(['<bin_{}>'.format(i) for i in range(1000)])
tokenizer_zh.add_tokens(['<code_{}>'.format(i) for i in range(8192)])
tokenizer_zh.add_tokens(['<bin_{}>'.format(i) for i in range(1000)])
# 英文tokenizer
result_en = tokenizer_en(" what does the image describe?")['input_ids']
print(result_en) # [0, 99, 473, 5, 2274, 6190, 116, 2] 
# 注意BPE tokenizer对于文本前的空格敏感
# tokenizer_en("what does the image describe?")['input_ids'] 的结果是
# [0, 12196, 473, 5, 2274, 6190, 116, 2]

# 中文tokenizer
result_zh = tokenizer_zh(" 图片描述了什么内容?")['input_ids']
print(result_zh) # [0, 1749, 4279, 2993, 6839, 753, 788, 724, 1083, 2163, 140, 2]
# 中文tokenizer是基于WordPiece，对于空格不敏感
# tokenizer_zh("图片描述了什么内容?")['input_ids'] 
# [0, 1749, 4279, 2993, 6839, 753, 788, 724, 1083, 2163, 140, 2]
```
OFATokenizer的调用参数比较常用的是

- **text**: 输入的文本字符串
- **max_length**：这里主要是指截断的最大长度，在OFA内，padding是在collate（modelscope/preporcessors/ofa/utils/collate.py）中做的。
- **add_special_tokens**：是否增加特殊token（一般是bos和eos）
- **truncation**：是否截断
- **return_tensors**:  返回的数据类型

其他参数可以参考transformers/tokenization_utils_base.py

### 1.6.2 OFA preprocessor

相信想入手模型开发的同学们肯定会很快注意到数据处理环节，给定不同的任务，数据的处理方式是差异非常大的，MS中的OFA模型是在preprocessor中进行数据的预处理，想要开发新任务的时候照着这里进行修改就可以了，下面以image caption任务为例来说明如何使用OFA的预处理。
```python
from modelscope.metainfo import Preprocessors
from modelscope.utils.constant import Fields
from modelscope.preprocessors.multi_modal import OfaPreprocessor
from modelscope.hub.snapshot_download import snapshot_download
model_dir = snapshot_download('damo/ofa_image-caption_coco_large_en')
preprocessor = OfaPreprocessor.from_pretrained(model_dir, type=Preprocessors.ofa_tasks_preprocessor,
                    field=Fields.multi_modal)
data = {'image': 'https://shuangqing-public.oss-cn-zhangjiakou.aliyuncs.com/donuts.jpg'}
ret = preprocessor(data)
print(ret)
# {'source': tensor([   0,   99,  473,    5, 2274, 6190,  116,    2]), 'patch_image': tensor([[[0.8431, 0.8
# 039, 0.8039,  ..., 0.8118, 0.8196, 0.8431],
#          [0.8431, 0.8196, 0.8353,  ..., 0.8431, 0.8431, 0.8510],
# ....,
# [0.8275, 0.8667, 0.8745,  ..., 0.7176, 0.7098, 0.7020]]]), 'patch_mask': tensor([True])}
```
OFA preprocessor之后，会经过collate(modelscope/preprocessor/ofa/utils/collate.py)函数，将数据重新组织并进行padding，为后面模型处理做最后的准备。

### 1.6.3 OFA Model - Transformer相关

OFA模型是完全兼容HF的实现，不过由于我们是统一架构和任务，因此省去了预训练模型的head（详细情况可以看第1章），其核心只有OFA backbone本身的类（代码在modelscope/models/mutli_model/ofa/modeling_ofa.py）。

- OFAAttention：多头注意力机制的实现类
- OFADecoder：OFA的解码器
- OFADecoderLayer：OFA解码器的每一层实现
- OFAEncoder：OFA编码器
- OFAEncoderLayer：OFA编码器的每一层实现
- OFAEncoderOutput：OFA编码器的输出信息，结构化成的一个类
- OFAModel：**OFA模型的整体实现，内部包含了OFA的编码器和解码器，模型的前向过程就在这个类的forward函数。**
- OFAPreTrainedModel：OFA模型的基类。

### 1.6.4 OFA Model - Image模态处理

OFA是通过一个处理Image的模型来将原始的Image转变为Tensor，目前选择的模型是ResNet，是标准的实现方式（modelscope/models/multi_model/ofa/resnet.py)，6B规模的模型的图像端使用了ViT架构，具体见（modelscope/models/multi_model/ofa/vit.py）

### 1.6.5 Inference 解码策略

OFA的推断时解码策略主要是使用BeamSearch，可以采用HF自带的BeamSearch和OFA目前在MS中根据fairseq实现的SequenceGenerator(modelscope/models/multi_model/ofa/generate/sequence_generator.py)
目前使用MS内部的生成器效果会略好一点。SequenceGenerator的主要参数是：

- tokenizer：分词器
- beam_size：集束搜索的束宽度
- max_len_a/b：解码长度设定为最长ax + b
- len/unk_penalty：长度/未知词的乘法系数
- constraint_trie/range：推断时有些任务需要有特定的约束，如分类任务需要有前缀树约束以保证生成的候选项在一个闭集之内；视觉定位任务约束生成的token_id是分桶id等。
- lm_weight：可以在生成时叠加一个语言模型，这个参数是语言模型的权重。

### 1.6.6 不同task的推断策略

有了以上的说明，对于具体针对任务时的代码就有了比较清晰的逻辑。目前大部分任务的推断过程都是在modelscope/models/multi_model/ofa_for_all_tasks.py。
这里梗概介绍一下有特色和需要注意的地方。

- OFA进行文本到图片生成的任务因为涉及到了解码时的两阶段策略（先解码出离散code，再通过GAN模型对code解码出图像，所以目前还是独立的类：OfaForTextToImageSynthesis
- 对于输出的token是闭集的情况，代码里面默认会使用configuration中配置label集合构建前缀树，并在解码时使用这个前缀树，用户可以无感知得到闭集的解。 这有2个好处，分别是1，统一的接口减少了对于分类任务的特殊处理；2，对于label较多的任务如imagenet1k有1000个类别，这种写法可以减少推断的计算量（不需要遍历所有的候选项）。但是同时也有一个缺点是对于分类较少的任务，因为采用自回归做法，所以计算效率反而低了一些。

下面以image caption任务为例，介绍下推断策略的代码逻辑：
```python
gen_outputs = self.generator.generate([self.model],
                                      input, prefix_tokens=input.get('prefix_tokens', None))
gen_l = list()
for idx, gen_out in enumerate(gen_outputs):
    if len(gen_out) > 0:
        decode_tokens = gen_out[0]['tokens']
        if 'prefix_tokens' in input:
            prefix_len = input['prefix_tokens'][idx].ne(
                self.pad_item.to(self.model.device)).sum()
            decode_tokens = decode_tokens[prefix_len:]
        gen_l.append(decode_tokens)
    else:
        gen_l.append('')
result = self.tokenizer.batch_decode(gen_l, skip_special_tokens=True)
```

- 对于输出token在原始词表中特定区域的任务，如视觉定位任务，这个时候需要传入constraint_range，同时针对这个特殊任务做一些变换。

<br>

# 2. 有意思的实际应用
上面的介绍中，我们可以看到，通过比较简单的过程，我们就微调出了一个具备OCR能力的OFA模型，不过如果有一些深度学习研究经验，或者细心的同学会很快发现，这个OCR应该只是个demo，使用场景还是大大的受限了。这是因为我们的训练集大多都是单行的文字，但是实际场景中有很多时候都是多行文字的。虽然可以通过自己切割图片解决这个问题，但是毕竟在AI时代能不用手工就不用手工。关于文字位置检测的能力其实也是AI众多能力的一种，我们可以通过将文字检测能力和文字识别能力组合的方法打造一个更加实用OCR能力。下面就开始具体的工作吧！
首先，我们在选中一个文字检测的AI工具，这种工具市面上有不少，比如easyocr，以及目前就在ModelScope上面已经上架的模型： 文字检测行检测模型-中英-通用领域模型。
有了检测模型，接下来就可以进行OCR检测了，我们的目的是识别下图作文的内容，话不多说直接上代码(这里文字识别模型是针对自然场景的，对于手写体效果会略差，我们最近会上相关modelcard，感兴趣的同学也可以自己收集数据集进行finetune)：
<p align="center">
    <img src="./_resources/ocr_essay.jpg" width="400" />
</p>

```python
# 基础环境准备
# detection 模型是cv模型，因此需要安装cv的环境，同时需要安装TensorFlow
# pip install "modelscope[cv]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
# pip install --upgrade tensorflow
from PIL import Image
import cv2
import numpy as np
import urllib
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys
from modelscope.preprocessors.image import load_image

# 检测模型准备
ocr_url = 'http://xingchen-data.oss-cn-zhangjiakou.aliyuncs.com/maas/ocr/ocr_essay.jpg'
ocr_detection = pipeline(Tasks.ocr_detection, model='damo/cv_resnet18_ocr-detection-line-level_damo')
# 获取检测结果
result = ocr_detection(ocr_url)[OutputKeys.POLYGONS]

# OFA文字识别模型准备
ocr_recognize = pipeline(Tasks.ocr_recognition, model='damo/ofa_ocr-recognition_scene_base_zh') 

# OCR文字识别流程
def ocr_pip(image_in, boxes):
    boxes = np.asarray(sorted(boxes.tolist(), key=lambda x: x[1]))
    req = urllib.request.urlopen(image_in) # 读图片
    arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
    img = cv2.imdecode(arr, -1) # 'Load it as it is'
    ret_l = list()
    for box in boxes: # 因为检测结果是四边形，所以用透视变化转为长方形
        post1 = box.reshape((4, 2)).astype(np.float32)
        width = box[4] - box[0]
        height = box[5] - box[1]
        post2 = np.float32([[0, 0], [width, 0], [width, height], [0, height]])
        M = cv2.getPerspectiveTransform(post1, post2)
        new_img = cv2.warpPerspective(img, M, (width, height))
        new_img_pil = Image.fromarray(cv2.cvtColor(new_img, cv2.COLOR_BGR2RGB))
        # 开启文字识别
        ocr = ocr_recognize(new_img_pil)[OutputKeys.TEXT][0].replace(" ", "") 
        ret_l.append(ocr)
    return ret_l

print(ocr_pip(ocr_url, result))
"""
['她把身子倦缩在一个角落里,用叫吸声来暖',
 '如自己的小手,那时,我真想穿越到那里去',
 '为小女孩搬上一件大衣,好让他她没有痛苦',
 '小女孩用自己来冒的小手燃烧燃了一支火乐,',
 '多么明亮的火炮,小女孩看见了大火炉,她',
 '是多么喝望温度,第二次小女孩看见了烤鹅',
 '地是多么肌饿,我真想飞到那里去,为小女孩',
 '买一顿饱饭,第她是多么可恰啊!直到第四次',
 ',小女孩看见了她此生要因亲近的人[UNK]奶奶,',
 '她们牵着手,一起飞向天空中,阻水打湿了我',
 '的衣服,很想到小女孩终于不再受痛苦,我是',
 '着的心终于落下',
 '我不禁想到了自己,我们生活在一个依心',
 '侯水的环境中,不再为经济忙碌,不需要挣钱',
 '养家,每天一心只读圣贤书,过着衣来伸手',
 '而小女孩呢?那个生活在',
 '饭来张口的好日子。',
 '沙县社会的小女孩呢?每天卖不出火柴,被爸',
 '爸打,被妈妈鄂',
 '所以,从现在开始我们要为父母做一些力',
 '所能及的事情,做一个懂事、伞巧的孩子。']
"""
```

<br>

# 3. 大家在用OFA干什么

以下工作的作者们都用到了OFA，并提及了OFA或进行了引用。其中有一些工作比较有趣，同时又有一定的落地价值，另外也有些工作是学术上的一些探索和思考。当然也希望大家可以将OFA作为Baseline，然后超越它（这也是很多知名工作对OFA做的的"食谱"）

## 3.1 OFA作为模态转换的桥梁

### Idea 1：利用OFA图生文的能力使纯文本模型能处理图像

在论文[Binding Language Models in Symbolic Languages](https://www.semanticscholar.org/paper/Binding-Language-Models-in-Symbolic-Languages-Cheng-Xie/c140fe515de2f20d0c85c813c7b3ec1defc41f9d )中，作者们的模型只能处理文本模态，但是利用了OFA的caption能力将image处理为text，从而获得了处理image的能力。
<p align="center">
    <img src="./_resources/binding.png" width="400" />
</p>

### Idea 2: 利用OFA图生文的能力提升机器人控制水平

在论文[DALL-E-Bot: Introducing Web-Scale Diffusion Models to Robotics](https://arxiv.org/pdf/2210.02438.pdf )中，针对桌面上杂乱无章的物体，作者首先利用OFA的caption能力提取出桌面上所有物体的名称，然后使用DALLE-2生成一副物体摆放整齐的图像，机器人则依据生成的图像将杂乱无章的物体摆放整齐。
<p align="center">
    <img src="./_resources/de_robot.png" width="400" />
</p>

### Idea 3：利用OFA文生图的能力使文本续写更自然

在论文[Visualize Before You Write: Imagination-Guided Open-Ended Text Generation](https://www.semanticscholar.org/paper/Visualize-Before-You-Write%3A-Imagination-Guided-Text-Zhu-Yan/0c40146f8ce162c52de4eae6fc4eb3d3302d7835 )中，作者们认为人们讲故事的时候其实在脑海里是有画面的，因此使用OFA的文生图能力将一些文本产出图像后，利用这些视觉信息加上语言模型得到更好的文本生成能力。
<p align="center">
    <img src="./_resources/vb.png" width="400" />
</p>

## 3.2 利用OFA的多模态能力和AI生成图片技术进行融合

### Idea 1：只靠“说话”就能做“PS”

这里面的twitter大V Yuvi利用OFA强大的Visual Grounding（通过描述选中相关的物体）能力和stablediffusion模型做到只靠“说话”就完成了PS的工作（这个工作已经被列入作者的VF教程中）。

<p align="center">
    <img src="./_resources/twitter.png" width="400" />
</p>

### Idea 2：利用OFA的跨模态能力研究DALLE-2生成的图片

在工作[How good are deep models in understanding the generated images?](https://arxiv.org/abs/2208.10760 )中，作者使用OFA来研究目前的模型如何理解生成的图像并定量评估这些生成模型。
作者使用过程如下：
<p align="center">
    <img src="./_resources/how_well_ofa.png" width="400" />
</p>

## 3.3 利用OFA的SOTA能力做数据增强

在工作[CLIP-ViP: Adapting Pre-trained Image-Text Model to Video-Language Representation Alignment](https://arxiv.org/abs/2209.06430 )中，作者们的视频预训练模型使用了OFA Caption的能力做一些额外数据。
<p align="center">
    <img src="./_resources/clip-vit.png" width="400" />
</p>

# 4. OFA核心理念&概念

本节主要从比较粗的角度讲一下OFA相关理念、概念和模型，详细的信息可以参照我们的论文：[OFA: Unifying Architectures, Tasks, and Modalities Through a Simple Sequence-to-Sequence Learning Framework](https://arxiv.org/abs/2202.03052 )。

## 4.1 通用与统一的好处

这一节主要是面向不了解OFA理念的同学介绍为什么会有OFA这个工作，我们主要是面对了哪些问题。本节内容相对没有太多技术细节，但它却是我们工作的驱动力之一。

### 4.1.1 通用的智能体

记得上学的时候老师说过一句话：“某个问题的解决方案越多越说明这个问题还没有解决”。这句话在AI研究上也有体现，六七十年前的前辈们信誓旦旦的要做好通用人工智能，期望一蹴而就的完美解决智能问题，但是后面的情况不论是作为研究者还是普通大众都知道了，通用人工智能遥遥无期（没人能看到像人一样聪明的机器）。
具体的研究过程普通大众可能并不了解，但是相关的研究者却非常明白，过于困难的问题被大家用“分治法”切分的越来越细，在很多小的领域，研究者已经取得了比肩甚至超越人类的表现，如AlphaGo在围棋上的表现（类似的例子还有很多，但可能没有这个知名）。
但是成绩多的同时，细分的领域上千差万别的方案也多，我们（很多研究者也是一样）不能忘记最初的愿景，OFA就是我们“初心”之路上的一步。

### 4.1.2 不只是愿景

统一的方案不只是研究者为了虚无缥缈的审美做的无用功，而是有切切实实的落地意义。我们最先熟悉的预训练模型应该是大名鼎鼎的BERT了，BERT凭借Transformer的优异架构和精心选择的预训练任务，得到了一个预训练模型，并在各类NLP任务上大杀四方。这可以认为是统一的Backbone做到了不同的task上的迁移和适配。不过了解过BERT或使用过相应代码的同学肯定知道，BERT本身的预训练任务与实际的任务在数据和形式上都不匹配。结果是很多任务都需要额外的header来进行适配，这些header都是带有参数的。这就导致：

- **随机初始化的参数会要求相对多的数据来进行finetune，更多的数据训练带来的是更多人力和机器资源消耗；**
- **受限的模型表达形式只能利用少数的预训练任务，导致预训练模型能力受限，同样使迁移学习时需要较多的样本。**

因此，能够支持更多不同的输入（不同的模态），更多的任务的单一模型就能具备更加实用的价值，而且**具备少样本/零样本能力的能力降低了很多复杂任务组合使用模型能力的成本，可以极大发挥想象力从而创造更大的价值。**类比：一个面对任何任务都需要花很长时间来“找例子熟悉熟悉”的“人”，是不可能有生产力的；而通用性更好一点的模型是有希望真正爆发式提高生产力。

## 4.2 OFA的架构

### 4.2.1 OFA的基础架构

我们认为有大量的任务可以通过seq2seq的方式进行表达，同时目前基于seq2seq的方法中，基于Transformer的架构性能极佳，因此作为我们的基础架构。
OFA整体设计上如下图所示：

<p align="center">
    <img src="./_resources/ofa_frame.png" width="600" />
</p>

我们可以看到，OFA的预训练任务有8个，同时包括单模态和多模态任务、理解任务和生成任务，更多的模态和任务是通向通用统一的关键路径。

### 4.2.2 OFA的预训练任务

OFA目前有8个预训练任务，所有的任务都是通过同样的核心架构：Transformer based seq2seq架构，其中图片侧使用Resnet（也可以替换为其他模型）产出向量表征。因为所有的任务共享同样的架构，因此我们设计了使用不同的指令（instruction）来区分不同的任务，这里简要介绍一些任务的设计思路。

- **V**isual **G**rounding
   - Instruction：Which region does the text "Man in white shirt" describe？
   - 设计思路：这个任务是在图片中将给定文本描述的物体检测出来，这个结果是Bounding Box（形式为4个数值，分别是左上角x/y轴坐标和右下角x/y轴坐标）。任务的设计难点是如何处理Bounding Box的坐标和图像不规范的长宽大小。OFA的解决思路是将图片重新缩放到预定义的大小后，在x/y轴分别切分1000个桶，这样像素位置转化为桶id，输出结果就是桶id序列。
- Image Infilling
   - Insturction：What is the image in the middle part?
   - 设计思路：图像的编码可以通过类似Resnet进行实现，但是做图像生成就需要额外的技术将图像做输出端的离散化了。目前有类似VQVAE和VQGAN等方法将图像离散化为code，这里我们的预训练任务是缺失图像填充，任务的Ground Truth就是利用VQGAN离散化得到的code。
- Text Infilling:
   - Instruction：what is the complete text of "A <mask> woman"?
   - 设计思路：类似Bart，和其他的如VQA、Image Captioning任务没有特别的区别。
<br>

# 附录
## 模型规模介绍
目前OFA模型发布的模型规模如下（其中中英文的规模大小是因为中英文词典大小不同造成的）：

<div style='display: flex;justify-content: center;'>

| **Model** | **Params-en** | **Params-zh** | **Backbone** | **Hidden size** | **Intermediate size** | **Num. of heads** | **Enc layers** | **Dec layers** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFA<sub>Tiny</sub> | 33M | - | ResNet50 | 256 | 1024 | 4 | 4 | 4 |
| OFA<sub>Medium</sub> | 93M | - | ResNet101 | 512 | 2048 | 8 | 4 | 4 |
| OFA<sub>Base</sub> | 180M | 160M | ResNet101 | 768 | 3072 | 12 | 6 | 6 |
| OFA<sub>Large</sub> | 470M | 443M | ResNet152 | 1024 | 4096 | 16 | 12 | 12 |
| OFA<sub>Huge</sub> | 930M | - | ResNet152 | 1280 | 5120 | 16 | 24 | 12 |
| OFA<sub>6B</sub> | 6B | - | vit_huge | 2560 | 10240 | 32 | 36 | 24 |

</div>

## OFA 模型任务矩阵
目前ModelScope上面所有已经上传的模型和任务可以在下面导航表格看到，点击链接可以跳转到相应modelcard。

<div style='display: flex;justify-content: center;'>

| 模型规模 | 预训练 | 图像描述 | 视觉问答 | 视觉定位 | 视觉蕴含 | 文生图 | 图像分类 | 文字识别 | 文本摘要 | 文本分类 | 语音识别 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFA<sub>Tiny</sub> | [英文](https://modelscope.cn/models/damo/ofa_pretrain_tiny_en/summary) | [英文](https://modelscope.cn/models/damo/ofa_image-caption_coco_distilled_en/summary) | - | [英文](https://modelscope.cn/models/damo/ofa_visual-grounding_refcoco_distilled_en) | [英文](https://modelscope.cn/models/damo/ofa_visual-entailment_snli-ve_distilled_v2_en/summary) | - | - | - | - | - | - |
| OFA<sub>Medium</sub> | [英文](https://modelscope.cn/models/damo/ofa_pretrain_medium_en/summary)  | - | - | - | - | - | - | - | - | - | - |
| OFA<sub>Base</sub> | [中文](https://modelscope.cn/models/damo/ofa_pretrain_base_zh/summary )/[中文语音](https://modelscope.cn/models/damo/ofa_mmspeech_pretrain_base_zh/summary )/[英文](https://modelscope.cn/models/damo/ofa_pretrain_base_en/summary) | [中文电商](https://modelscope.cn/models/damo/ofa_image-caption_muge_base_zh/summary) | - | - | - | - | - | [通用中文](https://modelscope.cn/models/damo/ofa_ocr-recognition_general_base_zh/summary )/[场景中文](https://modelscope.cn/models/damo/ofa_ocr-recognition_scene_base_zh/summary )/[Web中文](https://modelscope.cn/models/damo/ofa_ocr-recognition_web_base_zh/summary )/[文档中文](https://modelscope.cn/models/damo/ofa_ocr-recognition_document_base_zh/summary )/[手写中文](https://modelscope.cn/models/damo/ofa_ocr-recognition_handwriting_base_zh/summary ) | - | - | [中文AIShell1](https://modelscope.cn/models/damo/ofa_mmspeech_asr_aishell1_base_zh/summary) |
| OFA<sub>Large</sub> | [中文](https://modelscope.cn/models/damo/ofa_pretrain_large_zh/summary )/[中文语音](https://modelscope.cn/models/damo/ofa_mmspeech_pretrain_large_zh/summary )/[英文](https://modelscope.cn/models/damo/ofa_pretrain_large_en/summary) | [英文](https://modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary) | [英文](https://modelscope.cn/models/damo/ofa_visual-question-answering_pretrain_large_en/summary) | [中文](https://modelscope.cn/models/damo/ofa_visual-grounding_refcoco_large_zh/summary )/[英文](https://modelscope.cn/models/damo/ofa_visual-grounding_refcoco_large_en/summary ) | [英文](https://modelscope.cn/models/damo/ofa_visual-entailment_snli-ve_large_en/summary) | [英文](https://modelscope.cn/models/damo/ofa_text-to-image-synthesis_coco_large_en/summary) | [英文](https://modelscope.cn/models/damo/ofa_image-classification_imagenet_large_en/summary) | - | [英文](https://modelscope.cn/models/damo/ofa_summarization_gigaword_large_en/summary) | [英文](https://modelscope.cn/models/damo/ofa_text-classification_mnli_large_en/summary) | [中文AIShell1](https://modelscope.cn/models/damo/ofa_mmspeech_asr_aishell1_large_zh/summary) |
| OFA<sub>Huge</sub> | [英文](https://modelscope.cn/models/damo/ofa_pretrain_huge_en/summary)  | [英文](https://modelscope.cn/models/damo/ofa_image-caption_coco_huge_en/summary) | [英文](https://modelscope.cn/models/damo/ofa_visual-question-answering_pretrain_huge_en/summary) | - | - | - | - | - | - | - | - |
| OFA<sub>6B</sub> | - | [英文](https://modelscope.cn/models/damo/ofa_image-caption_coco_6b_en/summary) | - | - | - | - | - | - | - | - | - |

</div>

<br>

## 相关论文以及引用信息
如果你觉得OFA好用，喜欢我们的工作，欢迎引用：
```
@article{wang2022ofa,
  author    = {Peng Wang and
               An Yang and
               Rui Men and
               Junyang Lin and
               Shuai Bai and
               Zhikang Li and
               Jianxin Ma and
               Chang Zhou and
               Jingren Zhou and
               Hongxia Yang},
  title     = {OFA: Unifying Architectures, Tasks, and Modalities Through a Simple Sequence-to-Sequence
               Learning Framework},
  journal   = {CoRR},
  volume    = {abs/2202.03052},
  year      = {2022}
}
```
```
@article{zhou2022mmspeech,
  author    = {Zhou, Xiaohuan and 
               Wang, Jiaming and 
               Cui, Zeyu and 
               Zhang, Shiliang and 
               Yan, Zhijie and 
               Zhou, Jingren and 
               Zhou, Chang},
  title     = {MMSpeech: Multi-modal Multi-task Encoder-Decoder Pre-training for Speech Recognition},
  journal   = {arXiv preprint arXiv:2212.00500},
  year      = {2022}
}
```
<br>

## 引用
[1]. Wang, Peng, et al. "Unifying architectures, tasks, and modalities through a simple sequence-to-sequence learning framework."  

[2]. Wolf, Thomas, et al. "Huggingface's transformers: State-of-the-art natural language processing."  

[3]. Radford, Alec, et al. "Language models are unsupervised multitask learners."  

[4]. Devlin, Jacob, et al. "Bert: Pre-training of deep bidirectional transformers for language understanding."  

[5]. Cheng, Z et al. "Binding Language Models in Symbolic Languages."  

[6]. Borji, Ali. "How good are deep models in understanding the generated images?."  

[7]. Kapelyukh, Ivan, Vitalis Vosylius, and Edward Johns. "DALL-E-Bot: Introducing Web-Scale Diffusion Models to Robotics."

[8]. Zhu, Wanrong et al. "Visualize Before You Write: Imagination-Guided Open-Ended Text Generation."

[9]. Xue, Hongwei, et al. "CLIP-ViP: Adapting Pre-trained Image-Text Model to Video-Language Representation Alignment."  