<!-- modelscope-docs: named-entity-recognition | model-overview/nlp/named-entity-recognition/named-entity-recognition_CN.md -->

# 模型概览
## 命名实体识别任务介绍
命名实体识别（英语：Named Entity Recognition，简称NER），又称作“专名识别”，是指识别文本中具有特定意义的实体，主要包括人名、地名、机构名、专有名词等，以及时间、数量、货币、比例数值等文字。简单的讲，就是识别自然文本中的实体指称的边界和类别。

命名实体识别样例：
<div align=center><img src="./_resources/example.jpg" /></div>

## Transformer-CRF模型
NER任务的一个经典方法是序列标注模型，即为输入句子中的每个token打上标签，标签体系通常为(BIO)或(BIOES)。以(BIOES)为例，5个标签分别表示：O-非实体，B-实体开头，I-实体中间，E-实体结束，S-单字实体。如“通义实验室”三个字可标注为"B-ORG","I-ORG","E-ORG"。

以Transformer等预训练语言模型为底座的序列标注模型的模型结构如下图所示：
<div align=center><img src="./_resources/transformer_crf.jpg" /></div>

## RaNER方法介绍
RaNER方法采用Transformer-CRF模型，使用StructBERT作为预训练模型底座，结合使用外部工具召回的相关句子作为额外上下文，使用Multi-view Training方式进行训练。模型结构如下图所示：

<div align=center><img src="./_resources/model_image.jpg" /></div>

### 模型领先性
- 在多领域NER任务中，RaNER方法较baseline提升明显。

| Methods | WNUT-16 | WNUT-17 | CoNLL-03 | CoNLL++ | BC5CDR | NCBI | E-commerce |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Baseline | 56.04 | 57.86 | 93.03 | 94.20 | 90.52 | 88.65 | 81.47 |
| **RaNER** | **58.14** | **59.33** | **93.21** | **94.55** | **90.73** | **89.24** | **82.31** |

- 基于RaNER方法，我们还取得了以下成绩：
  - SemEval-2022多语言复杂实体抽取榜单获得**10项第一**
  - NLPCC-2022语音实体链接大赛获得**冠军**

具体可参考论文：
- [Improving Named Entity Recognition by External Context Retrieving and Cooperative Learning](https://aclanthology.org/2021.acl-long.142/)
- [DAMO-NLP at SemEval-2022 Task 11: A Knowledge-based System for Multilingual Named Entity Recognition](https://aclanthology.org/2022.semeval-1.200/)
- [DAMO-NLP at NLPCC-2022 Task 2: Knowledge Enhanced Robust NER for Speech Entity Linking](https://arxiv.org/abs/2209.13187)

# 模型配置项
本模型的超参数控制可见于模型文件中的config.json文件，该文件的一般格式如下：
```
{
    "type": "bert",
    "adv_bound": 1e-05,
    "adv_grad_factor": 5e-05,
    "attention_probs_dropout_prob": 0.1,
    "classifier_dropout": null,
    "directionality": "bidi",
    "hidden_act": "gelu",
    "hidden_dropout_prob": 0.1,
    "hidden_size": 768,
    "num_labels": 13,
    "id2label": {
        "0": "O",
        "1": "B-LOC",
        "2": "S-LOC",
        "3": "B-ORG",
        "4": "S-ORG",
        "5": "B-PER",
        "6": "S-PER",
        "7": "I-LOC",
        "8": "E-LOC",
        "9": "I-ORG",
        "10": "E-ORG",
        "11": "I-PER",
        "12": "E-PER"
    },
    "initializer_range": 0.02,
    "intermediate_size": 3072,
    "layer_norm_eps": 1e-12,
    "max_position_embeddings": 512,
    "model_type": "bert",
    "num_attention_heads": 12,
    "num_hidden_layers": 12,
    "pad_token_id": 0,
    "pooler_fc_size": 768,
    "pooler_num_attention_heads": 12,
    "pooler_num_fc_layers": 3,
    "pooler_size_per_head": 128,
    "pooler_type": "first_token_transform",
    "position_embedding_type": "absolute",
    "sigma": 5e-06,
    "torch_dtype": "float32",
    "transformers_version": "4.18.0",
    "type_vocab_size": 2,
    "use_cache": true,
    "vocab_size": 21128
}
```
## 参数列表
- **num_labels** (`int`) - The number of all token labels.
- **id2label** (`Dict[int, str]`) - The mapping from label ids to label names.

其他参数与预训练模型相同

# 如何使用

## 使用Pipeline完成模型推理
```
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

input = 'eh 摇滚狗涂鸦拔印宽松牛仔裤 情侣款'
ner_pipeline = pipeline(Tasks.named_entity_recognition, 'damo/nlp_raner_named-entity-recognition_chinese-base-ecom-50cls')
result = ner_pipeline(input)

print('输入文本:\n{}\n'.format(input))
print('抽取结果:\n{}'.format(result))
```

## 模型输出
```
{'output': [{'type': '品牌', 'start': 0, 'end': 2, 'span': 'eh'}, {'type': '品牌', 'start': 3, 'end': 6, 'span': '摇滚狗'}, {'type': '款式_其他', 'start': 6, 'end': 8, 'span': '涂鸦'}, {'type': '款式_其他', 'start': 8, 'end': 10, 'span': '拔印'}, {'type': '款式_其他', 'start': 10, 'end': 12, 'span': '宽松'}, {'type': '材质_面料', 'start': 12, 'end': 14, 'span': '牛仔'}, {'type': '产品_核心产品', 'start': 14, 'end': 15, 'span': '裤'}, {'type': '款式_其他', 'start': 16, 'end': 19, 'span': '情侣款'}]}
```

# 命名实体识别模型列表
命名实体识别提供多语种、多领域、多尺寸的模型可供选择，具体的模型列表如下：

| 序号 | 分类 | 模型 | Size | 语种 | 领域 |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | 通用 | [RaNER命名实体识别-中文-新闻领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-news) | Base | 中文 | 新闻 |
| 2 | 通用 | [RaNER命名实体识别-中文-社交媒体领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-social_media) | Base | 中文 | 社交媒体 |
| 3 | 通用 | [RaNER命名实体识别-中文-通用领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-generic) | Base | 中文 | 通用 |
| 4 | 通用 | [RaNER命名实体识别-英文-新闻领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-news) | Large | 英语 | 新闻 |
| 5 | 通用 | [RaNER命名实体识别-英文-社交媒体领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-social_media) | Large | 英语 | 社交媒体 |
| 6 | 电商 | [RaNER命名实体识别-中文-电商领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-ecom) | Base | 中文 | 电商 |
| 7 | 电商 | [RaNER命名实体识别-中文-电商领域-细粒度-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-ecom-50cls) | Base | 中文 | 电商 |
| 8 | 电商 | [RaNER命名实体识别-英语-电商领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-ecom) | Large | 英语 | 电商 |
| 9 | 电商 | [RaNER命名实体识别-俄语-电商领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_russian-large-ecom) | Large | 俄语 | 电商 |
| 10 | 电商 | [RaNER命名实体识别-法语-电商领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_french-large-ecom) | Large | 法语 | 电商 |
| 11 | 电商 | [RaNER命名实体识别-西班牙语-电商领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_spanish-large-ecom) | Large | 西班牙语 | 电商 |
| 12 | 多语言 | [RaNER命名实体识别-中文-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-large-generic) | Large | 中文 | 通用 |
| 13 | 多语言 | [RaNER命名实体识别-英语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-generic) | Large | 英语 | 通用 |
| 14 | 多语言 | [RaNER命名实体识别-多语言统一-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_multilingual-large-generic) | Large | 多语言 | 通用 |
| 15 | 多语言 | [RaNER命名实体识别-俄语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_russian-large-generic) | Large | 俄语 | 通用 |
| 16 | 多语言 | [RaNER命名实体识别-西班牙语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_spanish-large-generic) | Large | 西班牙语 | 通用 |
| 17 | 多语言 | [RaNER命名实体识别-荷兰语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_dutch-large-generic) | Large | 荷兰语 | 通用 |
| 18 | 多语言 | [RaNER命名实体识别-土耳其语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_turkish-large-generic) | Large | 土耳其语 | 通用 |
| 19 | 多语言 | [RaNER命名实体识别-韩语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_korean-large-generic) | Large | 韩语 | 通用 |
| 20 | 多语言 | [RaNER命名实体识别-波斯语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_farsi-large-generic) | Large | 波斯语 | 通用 |
| 21 | 多语言 | [RaNER命名实体识别-德语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_german-large-generic) | Large | 德语 | 通用 |
| 22 | 多语言 | [RaNER命名实体识别-印地语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_hindi-large-generic) | Large | 印地语 | 通用 |
| 23 | 多语言 | [RaNER命名实体识别-孟加拉语-通用领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_bangla-large-generic) | Large | 孟加拉语 | 通用 |
| 24 | 其他 | [RaNER命名实体识别-中文-简历领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-resume) | Base | 中文 | 简历 |
| 25 | 其他 | [RaNER命名实体识别-中文-小说领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-book) | Base | 中文 | 小说 |
| 26 | 其他 | [RaNER命名实体识别-中文-金融领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-finance) | Base | 中文 | 金融 |
| 27 | 其他 | [RaNER命名实体识别-中文-游戏领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-game) | Base | 中文 | 游戏 |
| 28 | 其他 | [RaNER命名实体识别-中文-银行领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-bank) | Base | 中文 | 银行 |
| 29 | 其他 | [RaNER命名实体识别-中文-文学领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-literature) | Base | 中文 | 文学 |
| 30 | 其他 | [RaNER命名实体识别-中文-医疗领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-cmeee) | Base | 中文 | 医疗 |
| 31 | 其他 | [RaNER命名实体识别-英文-文学领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-literature) | Large | 英语 | 文学 |
| 32 | 其他 | [RaNER命名实体识别-英文-政治领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-politics) | Large | 英语 | 政治 |
| 33 | 其他 | [RaNER命名实体识别-英文-音乐领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-music) | Large | 英语 | 音乐 |
| 34 | 其他 | [RaNER命名实体识别-英文-科学领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-science) | Large | 英语 | 科学 |
| 35 | 其他 | [RaNER命名实体识别-英文-人工智能领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-ai) | Large | 英语 | 人工智能 |
| 36 | 其他 | [RaNER命名实体识别-英语-wiki领域-large](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_english-large-wiki) | Large | 英语 | 维基百科 |
| 37 | 小模型 | [LSTM命名实体识别-中文-新闻领域](https://modelscope.cn/models/damo/nlp_lstm_named-entity-recognition_chinese-news) | LSTM | 中文 | 新闻 |
| 38 | 小模型 | [LSTM命名实体识别-中文-社交媒体领域](https://modelscope.cn/models/damo/nlp_lstm_named-entity-recognition_chinese-social_media) | LSTM | 中文 | 社交媒体 |
| 39 | 小模型 | [LSTM命名实体识别-中文-通用领域](https://modelscope.cn/models/damo/nlp_lstm_named-entity-recognition_chinese-generic) | LSTM | 中文 | 通用 |
| 40 | 小模型 | [LSTM命名实体识别-中文-简历领域](https://modelscope.cn/models/damo/nlp_lstm_named-entity-recognition_chinese-resume) | LSTM | 中文 | 简历 |


# 相关论文及引用信息
如果你觉得这个该模型对有所帮助，请考虑引用下面的相关的论文：
```
@inproceedings{wang-etal-2021-improving,
    title = "Improving Named Entity Recognition by External Context Retrieving and Cooperative Learning",
    author = "Wang, Xinyu  and
      Jiang, Yong  and
      Bach, Nguyen  and
      Wang, Tao  and
      Huang, Zhongqiang  and
      Huang, Fei  and
      Tu, Kewei",
    booktitle = "Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers)",
    month = aug,
    year = "2021",
    address = "Online",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2021.acl-long.142",
    pages = "1800--1812",
}

@inproceedings{wang-etal-2022-damo,
    title = "{DAMO}-{NLP} at {S}em{E}val-2022 Task 11: A Knowledge-based System for Multilingual Named Entity Recognition",
    author = "Wang, Xinyu  and
      Shen, Yongliang  and
      Cai, Jiong  and
      Wang, Tao  and
      Wang, Xiaobin  and
      Xie, Pengjun  and
      Huang, Fei  and
      Lu, Weiming  and
      Zhuang, Yueting  and
      Tu, Kewei  and
      Lu, Wei  and
      Jiang, Yong",
    booktitle = "Proceedings of the 16th International Workshop on Semantic Evaluation (SemEval-2022)",
    month = jul,
    year = "2022",
    address = "Seattle, United States",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2022.semeval-1.200",
    pages = "1457--1468",
}

@inproceedings{huang-etal-2022-damo,
    title = "DAMO-NLP at NLPCC-2022 Task 2: Knowledge Enhanced Robust NER for Speech Entity Linking",
    author = "Huang, Shen
      and Zhai, Yuchen
      and Long, Xinwei
      and Jiang, Yong
      and Wang, Xiaobin
      and Zhang, Yin
      and Xie, Pengjun",
    booktitle = "Natural Language Processing and Chinese Computing",
    year = "2022",
    publisher = "Springer Nature Switzerland",
    address = "Cham",
    pages = "284--293",
}
```
