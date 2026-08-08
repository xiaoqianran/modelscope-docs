<!-- modelscope-docs: passageranking | model-overview/nlp/passageranking/passageranking_CN.md -->

# 模型概览

文本检索是信息检索领域的核心问题, 其在很多信息检索、NLP下游任务中发挥着非常重要的作用。 近几年, BERT等大规模预训练语言模型的出现使得文本表示效果有了大幅度的提升, 基于预训练语言模型构建的文本检索系统在召回、排序效果上都明显优于传统统计模型。

由于文档候选集合通常比较庞大，实际的工业搜索系统中候选文档数量往往在千万甚至更高的数量级, 为了兼顾效率和准确率，目前的文本检索系统通常是基于召回&排序的多阶段搜索框架。在召回阶段，系统的主要目标是从海量文本中去找到潜在跟query相关的文档，得到较小的候选文档集合（100-1000个）。召回完成后, 排序阶段的模型会对这些召回的候选文档进行更加复杂的排序, 产出最后的排序结果。

语义相关性模型为通常应用于文本检索任务的排序阶段，该类模型以查询句子以及待比较的句子列表作为输入，并输出查询句子与列表中每个句子的相似度（0-1之间，分数越高，代表相关性越高）。

<div align=center><img height="300" src="./_resources/ranker.png" /></div>


# 模型参数配置项

语义相关性模型的参数配置可以在下载下来的模型文件中找到configuration.json文件，该文件一般格式如下：


```text
{
    "framework": "pytorch",
    "task": "passage-ranking",
    "model": {
        "architectures": [
            "BertForSequenceClassification"
        ],
        "type": "bert",            
        "attention_probs_dropout_prob": 0.1, # 多头注意力dropout权重, 建议设置为0.1
        "classifier_dropout": 0.0,           # 分类器dropout, 建议设置为0
        "hidden_act": "gelu",                # 激活函数类型，支持"gelu", "relu",
        "hidden_size": 768,                  # 词嵌入维度，模型隐含层神经元个数
        "initializer_range": 0.02,           # 初始化参数范围
        "intermediate_size": 3072,           # 编码器线性层维度 
        "max_position_embeddings": 512,      # 位置编码最大长度
        "num_attention_heads": 12,           # 注意力头
        "num_hidden_layers": 12,             # transofrmers 层数
        "pad_token_id": 0,                   # pad的token id
        "position_embedding_type": "absolute", # 位置embedding类型，支持`"absolute"`, `"relative_key"`, `"relative_key_query"`. 默认为"absolute"。
        "vocab_size": 30522                    # 词表大小
    },
    "pipeline": {
        "type": "passage-ranking" 
    },
    "preprocessor": {
        "type": "passage-ranking"
    },
    "dataset":{
        "train": {
            'type': 'bert',                             # tokenizer类型，与backbone模型类型应保持一致
            'query_sequence': 'query',                  # query对应字段
            'pos_sequence': 'positive_passages',        # 正样本对应字段名
            'neg_sequence': 'negative_passages',        # 负样本对应字段名
            'passage_text_fileds': ['title','text'],    # 文档用于排序的字段名
            'qid_field': 'query_id'                     # query id字段名
        }
        'val': {
            'type': 'bert',
            'query_sequence': 'query',
            'pos_sequence': 'positive_passages',
            'neg_sequence': 'negative_passages',
            'passage_text_fileds': ['title','text'],
            'qid_field': 'query_id'
        },
    }
    "train": {
        "work_dir": "/tmp", # 模型保存目录
        "max_epochs": 10,   # 训练的epoch数  
        "neg_samples": 4,   # 负样本数量
    },
    "evaluation": {
        "metrics": ["mrr@10"] # 测试使用的metric，string类型，支持“mrr@k", "ndcg@k"
    }
}
```
模型相关的其他参数可以参考HuggingFace的[BERT文档](https://huggingface.co/docs/transformers/model_doc/bert)。
在推理中过程中，这些参数一般都是固定的。您可以使用modelscope.models类直接拉起模型：
```python
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_corom_passage-ranking_english-base')
```


如果您使用了ModelScope提供的backbone模型文件进行后续微调，那么大多数的参数都需要保持原样，以便模型文件可以正常加载，但是仍然可以对dropout prob等参数进行修改。

# 模型前处理

## 前处理器（Preprocessor）

ModelScope的[前处理器](https://www.modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E7%9A%84%E9%A2%84%E5%A4%84%E7%90%86)封装了tokenizer的逻辑，使得推理和训练中部分参数无需重复配置。由于语义相关性的输入格式与其他任务不同，需要特定的前处理器（PassageRankingPreprocessor）, 该前处理器将输入的查询与文档列表处理为模型要求的句子对格式并进行tokenize。 如有需要，您可以单独使用该前处理器。


示例代码：
```python
from modelscope.preprocessors import TextRankingTransformersPreprocessor
from modelscope.hub.snapshot_download import snapshot_download
model_id = 'damo/nlp_corom_passage-ranking_english-base'
model_dir = snapshot_download(model_id)
preprocessor=TextRankingTransformersPreprocessor(model_dir=model_dir)
input = { 
    'source_sentence': ["how long it take to get a master's degree"],
    'sentences_to_compare': [
        "On average, students take about 18 to 24 months to complete a master's degree.",
        'On the other hand, some students prefer to go at a slower pace and choose to take '
        'several years to complete their studies.',
        'It can take anywhere from two semesters'
    ]   
}
tokenized_inputs = preprocessor(input)
```

# 模型主体

## 模型类

语义相关性模型使用modelscope.models.nlp.PassageRanking类


### 参数列表   
* **model_dir** (str) – The model_dir to load the configuration from. Note that this model_dir must exist in the local file system.

* **kwargs** (`dict`, optional) 
    
    train_batch_size: (int, defalts to 4) Number of batch size during training.

    hidden_size: (int, defaults to 1024) – Dimensionality of the encoder layers and the embedding layer.

    filter_size: (int, defaults to 4096) – Dimensionality of the FFN activation layers.

    num_heads: (int, defaults to 16) – Number of attention heads.

    num_encoder_layers: (int, defaults to 24) – Number of hidden layers in the Transformer encoder.

    num_decoder_layers: (int, defaults to 6) – Number of hidden layers in the Transformer decoder.

    ...
    
    其余参数请参考[structbert文档](https://modelscope.cn/docs/structbert).


## 模型Forward函数


```text
def forward(self,input: Dict[str, Tensor] ) -> Dict[str, Tensor]:
```
### 参数列表 

* **input** (`tensor` of shape `(batch_size, sequence_length)`) – Indices of input sequence pair's tokens.


## 模型输出
```text
outputs =
{
    'loss': contrastive_loss,       # 对比学习训练loss
    'scores': output_scores,   # 句子列表中每个句子与查询句子的相关性分数
}
```

### 参数列表 

* ** scores** (`tensor` of shape `(batch_size)`, optional) – Scores of output sequences.

* ** loss** (torch.FloatTensor of shape (1,), optional, returned when model.is_training=True) — Constrastive Learning loss.

## 模型后处理

利用sigmoid函数将分数转化为0-1之间的相关性得分。
```text
def postprocess(self, inputs: Dict[str, np.ndarray],
                **kwargs) -> Dict[str, np.ndarray]:
    logits = inputs['logits'].squeeze(-1).detach().cpu().numpy()
    logits = self.sigmoid(logits).tolist()
    result = {OutputKeys.SCORES: logits}
    return result
```

## Pipeline使用示例

```python
# 可在CPU/GPU环境运行
from modelscope.models import Model
from modelscope.pipelines import pipeline
from modelscope.preprocessors import TextRankingTransformersPreprocessor
from modelscope.utils.constant import Tasks

input = { 
    'source_sentence': ["how long it take to get a master's degree"],
    'sentences_to_compare': [
        "On average, students take about 18 to 24 months to complete a master's degree.",
        'On the other hand, some students prefer to go at a slower pace and choose to take '
        'several years to complete their studies.',
        'It can take anywhere from two semesters'
    ]   
}
model_id = 'damo/nlp_corom_passage-ranking_english-base'
model = Model.from_pretrained(model_id)
preprocessor = TextRankingTransformersPreprocessor(model.model_dir)
pipeline_ins = pipeline(task=Tasks.text_ranking, model=model, preprocessor=preprocessor)
result = pipeline_ins(input=input)
print (result)
# {'scores': [0.9292812943458557, 0.2204243242740631, 0.4248475730419159]}
```

# 模型微调

ModelScope支持对模型进行[微调](https://www.modelscope.cn/docs/ModelScope%20Library%E6%A6%82%E8%A7%88%E4%BB%8B%E7%BB%8D)。语义相关性模型训练过程中采用[对比学习损失函数](https://arxiv.org/abs/2101.08751)进行训练，对于每个query，训练数据包括一个相关文档（正样本）以及k个不相关文档（负样本），训练时需设置负样本个数。 

高级: 如需调整优化器，lr_scheduler等参数，请参考ModelScope[回调函数文档](https://modelscope.cn/docs/%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0%E6%9C%BA%E5%88%B6%E8%AF%A6%E8%A7%A3)。

## 修改参数配置

用户可根据实际情况对如下参数进行调整，其他参数可保持默认值。
```text
"dataset":{
    "train": {
        'type': 'bert',                             
        'query_sequence': 'query',                  
        'pos_sequence': 'positive_passages',        
        'neg_sequence': 'negative_passages',       
        'passage_text_fileds': ['title','text'],   
        'qid_field': 'query_id'
    }
    'val': {
        'type': 'bert',
        'query_sequence': 'query',
        'pos_sequence': 'positive_passages',
        'neg_sequence': 'negative_passages',
        'passage_text_fileds': ['title','text'],
        'qid_field': 'query_id'
    },
}
"train": {
    "work_dir": "/tmp", # 模型保存目录
    "max_epochs": 10,   # 训练的epoch数  
    "neg_samples": 4,   # 负样本数量
},
"evaluation": {
    "metrics": ["mrr@10"] # 测试使用的metric，string类型，支持“mrr@k", "ndcg@k"
}
```

## 训练代码示例
```python
# 需在GPU环境运行
# 加载数据集过程可能由于网络原因失败，请尝试重新运行代码
from modelscope.metainfo import Trainers                                                                                                                                                              
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
import tempfile
import os

tmp_dir = tempfile.TemporaryDirectory().name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)

# load dataset
ds = MsDataset.load('msmarco-passage-ranking', 'zyznull')
train_ds = ds['train'].to_hf_dataset()
dev_ds = ds['dev'].to_hf_dataset()
model_id = 'damo/nlp_corom_passage-ranking_english-base'
def cfg_modify_fn(cfg):
    cfg.task = 'text-ranking'
    cfg['preprocessor'] = {'type': 'text-ranking'}
    cfg['dataset'] = {
        'train': {
            'type': 'bert',
            'query_sequence': 'query',
            'pos_sequence': 'positive_passages',
            'neg_sequence': 'negative_passages',
            'passage_text_fileds': ['title','text'],
            'qid_field': 'query_id'
        },
        'val': {
            'type': 'bert',
            'query_sequence': 'query',
            'pos_sequence': 'positive_passages',
            'neg_sequence': 'negative_passages',
            'passage_text_fileds': ['title','text'],
            'qid_field': 'query_id'
        },
    }
    cfg['train']['neg_samples'] = 4
    cfg['evaluation']['dataloader']['batch_size_per_gpu'] = 30
    cfg.train.max_epochs = 1
    cfg.train.train_batch_size = 4
    cfg.train.hooks = [{
        'type': 'TextLoggerHook',
        'interval': 1
    }, {
        'type': 'IterTimerHook'
    }, {
        'type': 'EvaluationHook',
        'by_epoch': False,
        'interval': 1000
    }]
    return cfg 
kwargs = dict(
    model=model_id,
    train_dataset=train_ds,
    work_dir=tmp_dir,
    eval_dataset=dev_ds,
    cfg_modify_fn=cfg_modify_fn)
trainer = build_trainer(name=Trainers.nlp_passage_ranking_trainer, default_args=kwargs)
trainer.train()
```


## 语义相关性模型列表

|       模型           | 语言          |
| :--------------- |:---------------:|
| [ROM语义相关性-中文-通用领域-base](https://modelscope.cn/models/damo/nlp_rom_passage-ranking_chinese-base/summary)     | 中文 |
| [CoROM语义相关性-英文-通用领域-base](https://modelscope.cn/models/damo/nlp_corom_passage-ranking_english-base/summary) | 英文 |

## 引用
预训练语言模型应用于语义相关性、文本检索排序可以参考论文
```BibTex
@article{zhangHLATR,
  author    = {Yanzhao Zhang and Dingkun Long and Guangwei Xu and Pengjun Xie},
  title     = {{HLATR:} Enhance Multi-stage Text Retrieval with Hybrid List Aware Transformer Reranking},
  journal   = {CoRR},
  volume    = {abs/2205.10569},
  year      = {2022}
}
```