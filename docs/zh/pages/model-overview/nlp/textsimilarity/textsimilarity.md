<!-- modelscope-docs: textsimilarity | model-overview/nlp/textsimilarity/textsimilarity_CN.md -->

# 模型概览

## StructBERT

StructBERT的中文Large预训练模型是使用wikipedia数据和masked language model任务训练的中文自然语言理解预训练模型。 我们通过引入语言结构信息的方式，将BERT扩展为了一个新模型--StructBERT。我们在BERT的基础上，新引入了两个辅助任务来让模型学习字级别的顺序信息和句子级别的顺序信息， 从而更好的建模语言结构。相关论文也被ICLR 2020接受，
详见论文 [StructBERT: Incorporating Language Structures into Pre-training for Deep Language Understanding](https://arxiv.org/abs/1908.04577)。

论文的摘要信息如下：

```text
我们通过将语言结构整合到预训练中，将 BERT 扩展到新模型 StructBERT。 具体来说，我们用两个辅助预训练 StructBERT任务以充分利用单词和句子的顺序，利用单词的语言结构和句子级别，分别。 
因此，新模型适用于不同程度的语言理解下游任务需要。具有结构预训练能力的 StructBERT 在各种下游任务，包括将 GLUE 基准测试中的最新技术推到 89.0（优于所有已发布的模型），SQuAD v1.1 问答的 F1 得分为 93.0，SNLI 的准确率为 91.7。
```

模型领先性：

	1.	StructBERT旨在进一步提升预训练模型表征能力。受语法纠错任务启发，针对BERT中原目标函数不足进行改进，除Masked LM外，额外增加了重构句子中词顺序和判断句子间关系的新训练目标，更好地利用句子内和句子间联系促进语义理解。
	2.	StructBERT在预训练任务创新的基础上，利用大规模高质量的中英文文本训练得到，在下游中、英文benchmark上均取得过SOTA的效果。
    
有关StructBERT模型配置项、参数列表、前处理、训练等更多内容见[structBERT部分](https://code.alibaba-inc.com/Ali-MaaS/documentation/tree/master/model_description/nlp/structbert/structbert.md)。



# 文本相似度模型

## StructBERT文本相似度-中文-通用-base模型

StructBERT文本相似度-中文-通用-base模型是在structbert-base-chinese预训练模型的基础上，用atec、bq_corpus、chineseSTS、lcqmc、paws-x-zh五个数据集（52.5w条数据，正负比例0.48:0.52）训练出来的相似度匹配模型。


StructBERT文本相似度-中文-通用-base模型的超参数控制可以在下载下来的模型文件中找到config.json文件，该文件一般格式如下：

```text
{
    "attention_probs_dropout_prob": 0.1,
    "directionality": "bidi",
    "hidden_act": "gelu",
    "hidden_dropout_prob": 0.1,
    "hidden_size": 768,
    "initializer_range": 0.02,
    "intermediate_size": 3072,
    "max_position_embeddings": 512,
    "num_attention_heads": 12,
    "num_hidden_layers": 12,
    "pooler_fc_size": 768,
    "pooler_num_attention_heads": 12,
    "pooler_num_fc_layers": 3,
    "pooler_size_per_head": 128,
    "pooler_type": "first_token_transform",
    "type_vocab_size": 2,
    "vocab_size": 21128,
    "base_model_prefix": "encoder"
}
```

## 训练数据介绍

* atec：蚂蚁金服比赛数据集。请参考[atec](https://dc.cloud.alipay.com/index#/topic/intro?id=3)

* bq_corpus：Bank Question Corpus，信贷文本匹配数据。请参考ModelScope数据集中的[BQ_Corpus](https://modelscope.cn/datasets/DAMO_NLP/BQ_Corpus/summary)

* chineseSTS：中文文本语义相似度数据集。请参考ModelScope数据集中的[chineseSTS](https://modelscope.cn/datasets/DAMO_NLP/ChineseSTS/summary)

* lcqmc：Large-scale chinese question matching corpus，大规模中文问题匹配数据集。请参考ModelScope数据集中的[lcqmc](https://modelscope.cn/datasets/DAMO_NLP/BQ_Corpus/summary)

* paws-x-zh：谷歌发布的包含7种语言释义对的数据集。请参考[paws-x-zh](https://aistudio.baidu.com/aistudio/competition/detail/45/0/task-definition)

由于license权限问题，目前只上传了BQ_Corpus、chineseSTS、LCQMC这三个数据集。


## 期望模型使用方式以及适用范围

你可以使用StructBERT中文情感分类模型模型，对通用领域的中文情感分类任务进行推理。
输入自然语言文本，模型会给出该文本的情感分类标签(0, 1)以及相应的概率。

### 如何使用
在安装完成ModelScope-lib之后即可使用

#### 推理代码范例
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

semantic_cls = pipeline(Tasks.text_classification, 'damo/nlp_structbert_sentiment-classification_chinese-large')
semantic_cls(input='启动的时候很大声音，然后就会听到1.2秒的卡察的声音，类似齿轮摩擦的声音')
```

#### 微调代码范例
```python
import os.path as osp
from modelscope.trainers import build_trainer
from modelscope.msdatasets import MsDataset
from modelscope.utils.hub import read_config
from modelscope.metainfo import Metrics


model_id = 'damo/nlp_structbert_sentiment-classification_chinese-large'
dataset_id = 'jd'

WORK_DIR = 'workspace'

max_epochs = 2
def cfg_modify_fn(cfg):
    cfg.train.max_epochs = max_epochs
    cfg.train.hooks = cfg.train.hooks = [{
            'type': 'TextLoggerHook',
            'interval': 100
        }]
    cfg.evaluation.metrics = [Metrics.seq_cls_metric]
    cfg['dataset'] = {
        'train': {
            'labels': ['负面', '正面', 'None'],
            'first_sequence': 'sentence',
            'label': 'label',
        }
    }
    return cfg


train_dataset = MsDataset.load(dataset_id, namespace='DAMO_NLP', split='train').to_hf_dataset()
eval_dataset = MsDataset.load(dataset_id, namespace='DAMO_NLP', split='validation').to_hf_dataset()

# remove useless case
train_dataset = train_dataset.filter(lambda x: x["label"] != None and x["sentence"] != None)
eval_dataset = eval_dataset.filter(lambda x: x["label"] != None and x["sentence"] != None)

# map float to index
def map_labels(examples):
    map_dict = {0: "负面", 1: "正面"}
    examples['label'] = map_dict[int(examples['label'])]
    return examples

train_dataset = train_dataset.map(map_labels)
eval_dataset = eval_dataset.map(map_labels)

kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    work_dir=WORK_DIR,
    cfg_modify_fn=cfg_modify_fn)


trainer = build_trainer(name='nlp-base-trainer', default_args=kwargs)

print('===============================================================')
print('pre-trained model loaded, training started:')
print('===============================================================')

trainer.train()

print('===============================================================')
print('train success.')
print('===============================================================')

for i in range(max_epochs):
    eval_results = trainer.evaluate(f'{WORK_DIR}/epoch_{i+1}.pth')
    print(f'epoch {i} evaluation result:')
    print(eval_results)


print('===============================================================')
print('evaluate success')
print('===============================================================')
```

### 模型局限性以及可能的偏差
模型训练数据有限，效果可能存在一定偏差。

## 数据评估及结果

| 数据集   | BDCI2018 | Dianping | JD Binary | Waimai-10k |
| -------- | -------- | -------- | --------- | ---------- |
| Accuracy | 0.8596    | 0.7725    | 0.92     | 0.9154      |


## 相关论文以及引用信息

```bib
@article{wang2019structbert,
  title={Structbert: Incorporating language structures into pre-training for deep language understanding},
  author={Wang, Wei and Bi, Bin and Yan, Ming and Wu, Chen and Bao, Zuyi and Xia, Jiangnan and Peng, Liwei and Si, Luo},
  journal={arXiv preprint arXiv:1908.04577},
  year={2019}
}
```