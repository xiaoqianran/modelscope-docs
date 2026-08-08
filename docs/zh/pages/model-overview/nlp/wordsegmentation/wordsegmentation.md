<!-- modelscope-docs: wordsegmentation | model-overview/nlp/wordsegmentation/wordsegmentation_CN.md -->

# 模型概览

## 中文分词任务介绍
中文分词任务就是把连续的汉字分隔成具有语言语义学意义的词汇。中文的书写方式不像英文等日耳曼语系语言词与词之前显式的用空格分隔。为了让计算机理解中文文本，通常来说中文信息处理的第一步就是进行文本分词。

中文分词样例:

- 输入: 今天天气很好，适合出去玩
- 输出: 今天/ 天气/ 很好/ ，/ 适合/ 出去/ 玩/

分词技术经过过去几十年的发展, 大致经历了词典匹配模型 -> 基于字级别标注的统计模型 -> 基于字级别的深度学习模型的发展历程。尤其是近今年大规模预训练语言模型(BERT)的兴起，基于标注数据的分词结果能达到95%以上的准确率和召回率。这里重点介绍以预训练语言模型+CRF序列标注模型为模型结构的分词模型。序列标注标签体系(B、I、E、S), 四个标签分别表示单字处理单词的起始、中间、终止位置或者该单字单独成词, 以StructBERT预训练语言模型为底座的序列标注模型的模型结构图如下所示:

<div align=center><img src="./_resources/cws_model.png" /></div>

## StructBERT模型
StructBERT的中文预训练模型是使用wikipedia数据和masked language model任务训练的中文自然语言理解预训练模型。其通过引入语言结构信息的方式，将BERT扩展为了一个新模型--StructBERT。在BERT的基础上，新引入了两个辅助任务来让模型学习字级别的顺序信息和句子级别的顺序信息，从而更好的建模语言结构。相关论文也被ICLR 2020接受，详见论文 [StructBERT: Incorporating Language Structures into Pre-training for Deep Language Understanding](https://arxiv.org/abs/1908.04577)。

## BAStructBERT模型
为了进一步提升中文分词模型的效果，在StructBERT模型基础上, 通过在预训练过程中增加大规模无监督词汇边界统计信息可以有效提升预训练模型对词汇边界的识别能力。我们实验验证融合词汇边界信息的预训练模型Boundary Aware StructBERT (BAStructBERT)模型在绝大多数中文序列标注任务上有进一步的效果提升。BAStructBERT模型结构和基础的StructBERT模型一致, BAStructBERT预训练语言模型相关论文已经被EMNLP2022录用, 模型的预训练流程示意图如下所示:

<div align=center><img src="./_resources/bastructbert.png" /></div>

**模型领先性**:
- StructBERT预训练语言模型旨在进一步提升预训练模型表征能力。受语法纠错任务启发，针对BERT中原目标函数不足进行改进，除Masked LM外，额外增加了重构句子中词顺序和判断句子间关系的新训练目标，更好地利用句子内和句子间联系促进语义理解。 
- 无监督统计词汇边界信息增强的预训练语言模型底座进一步提升中文分词模型的效果

## BAStructBERT分词模型

BAStructBERT分词模型采用BAStructBERT预训练模型+CRF序列标注框架, 采用PKU分词数据集训练得到。

## 训练数据介绍

* PKU分词数据: 详细数据集可以参考ModelScope中的数据集[PKU](https://modelscope.cn/datasets/dingkun/chinese_word_segmentation_pku/summary) 

### 如何使用
在安装完成ModelScope-lib之后即可使用

#### 推理代码范例
```python
from modelscope.models import Model
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.preprocessors import TokenClassificationTransformersPreprocessor

model_id = 'damo/nlp_structbert_word-segmentation_chinese-base'
model = Model.from_pretrained(model_id)
tokenizer = TokenClassificationTransformersPreprocessor(model.model_dir)
pipeline_ins = pipeline(task=Tasks.word_segmentation, model=model, preprocessor=tokenizer)
result = pipeline_ins(input="今天天气不错，适合出去游玩")
print (result)
```

### 模型局限性以及可能的偏差
本模型基于PKU数据集(通用新闻领域)上训练，在垂类领域中文文本上的分词效果会有降低，请用户自行评测后决定如何使用。

## 数据评估及结果

模型在PKU测试数据评估结果:

| Model | Precision | Recall | F1    |    Inference speed on CPU   |
|-------|-----------|--------|-------|-------|
|BAStructBERT-Base | 96.44     | 97.31  | 96.87 |  1.0x  |
|BAStructBERT-Lite | 96.66     | 95.59  | 96.12 |  2.91x |


## 中文分词模型列表

除了新闻行业, ModelScope也提供电商行业的分词模型; 详细的模型列表如下:

|       模型           | Size          |  领域  |
| :---------------: |:---------------:| :---------------: |
| [BAStructBERT分词-中文-新闻领域-base](https://modelscope.cn/models/damo/nlp_structbert_word-segmentation_chinese-base/summary)  | Base | 新闻通用 |
| [BAStructBERT分词-中文-新闻领域-lite](https://modelscope.cn/models/damo/nlp_structbert_word-segmentation_chinese-lite/summary) | Lite  | 新闻通用 |
| [BAStructBERT分词-中文-电商领域-base](https://modelscope.cn/models/damo/nlp_structbert_word-segmentation_chinese-base-ecommerce/summary) | Base | 电商行业 |
| [BAStructBERT分词-中文-电商领域-lite](https://modelscope.cn/models/damo/nlp_structbert_word-segmentation_chinese-lite-ecommerce/summary) | Lite | 电商行业 |
## 相关论文以及引用信息

```bib
@article{wang2019structbert,
  title={Structbert: Incorporating language structures into pre-training for deep language understanding},
  author={Wang, Wei and Bi, Bin and Yan, Ming and Wu, Chen and Bao, Zuyi and Xia, Jiangnan and Peng, Liwei and Si, Luo},
  journal={arXiv preprint arXiv:1908.04577},
  year={2019}
}
```
