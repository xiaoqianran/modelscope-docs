<!-- modelscope-docs: sentiment-analysis | model-overview/nlp/sentiment-analysis/sentiment-analysis_CN.md -->

# 模型概览

本模型是针对实际场景中常见的社交媒体文本情感分析需求所提供的一个英文情感分类模型。模型使用TweetEval社交媒体情感分析文本数据，在BERT预训练模型的基础上进行微调，可用于社交媒体领域的英文文本情感分类。模型特点如下：

- 本模型基于bert-base-uncased预训练模型进行微调。
- 微调时采用TweetEval社交媒体情感分类数据集。
- 模型适用于英文情感分类场景，类别包括Negative、Neutral、Positive，在TweetEval的测试集上的f1为69.18。


# 模型配置项

本模型的超参数控制可见于模型文件中的config.json文件，该文件一般格式如下：

```text
{
    "architectures": [
        "BertForSequenceClassification"
    ],
    "attention_probs_dropout_prob": 0.1,
    "classifier_dropout": null,
    "gradient_checkpointing": false,
    "hidden_act": "gelu",
    "hidden_dropout_prob": 0.1,
    "hidden_size": 768,
    "id2label": {
        "0": "Negative",
        "1": "Neutral",
        "2": "Positive"
    },
    "initializer_range": 0.02,
    "intermediate_size": 3072,
    "label2id": {
        "Negative": 0,
        "Neutral": 1,
        "Positive": 2
    },
    "layer_norm_eps": 1e-12,
    "max_position_embeddings": 512,
    "model_type": "bert",
    "num_attention_heads": 12,
    "num_hidden_layers": 12,
    "pad_token_id": 0,
    "position_embedding_type": "absolute",
    "torch_dtype": "float32",
    "type_vocab_size": 2,
    "vocab_size": 30522
}
```
这些配置只是模型全部配置中的一部分。以下列举了常用的配置项：

## 参数列表

    
* **vocab_size** (`int`, optional, defaults to 30522) – Vocabulary size of the BERT model. Defines the number of different tokens that can be represented by the
`inputs_ids` passed when calling `BertModel` or
`TFBertModel`.


* **hidden_size** (`int`, optional, defaults to 768) – Dimensionality of the encoder layers and the pooler layer.


* **num_hidden_layers** (`int`, optional, defaults to 12) – Number of hidden layers in the Transformer encoder.


* **num_attention_heads** (`int`, optional, defaults to 12) – Number of attention heads for each attention layer in the Transformer encoder.


* **intermediate_size** (`int`, optional, defaults to 3072) – Dimensionality of the “intermediate” (often named feed-forward) layer in the Transformer encoder.


* **hidden_act** (`str` or `Callable`, optional, defaults to `"gelu"`) – The non-linear activation function (function or string) in the encoder and pooler. If string,
`"gelu"`, `"relu"`, `"silu"` and `"gelu_new"` are supported.


* **hidden_dropout_prob** (`float`, optional, defaults to 0.1) – The dropout probability for all fully connected layers in the embeddings, encoder, and pooler.


* **attention_probs_dropout_prob** (`float`, optional, defaults to 0.1) – The dropout ratio for the attention probabilities.


* **max_position_embeddings** (`int`, optional, defaults to 512) – The maximum sequence length that this model might ever be used with. Typically set this to something large
just in case (e.g., 512 or 1024 or 2048).


* **type_vocab_size** (`int`, optional, defaults to 2) – The vocabulary size of the `token_type_ids` passed when calling `BertModel` or
`TFBertModel`.


* **initializer_range** (`float`, optional, defaults to 0.02) – The standard deviation of the truncated_normal_initializer for initializing all weight matrices.


* **layer_norm_eps** (`float`, optional, defaults to 1e-12) – The epsilon used by the layer normalization layers.


* **position_embedding_type** (`str`, optional, defaults to `"absolute"`) – Type of position embedding. Choose one of `"absolute"`, `"relative_key"`,
`"relative_key_query"`. For positional embeddings use `"absolute"`. For more information on
`"relative_key"`, please refer to [Self-Attention with Relative Position Representations (Shaw et al.)](https://arxiv.org/abs/1803.02155). For more information on `"relative_key_query"`, please refer to
Method 4 in [Improve Transformer Models with Better Relative Position Embeddings (Huang et al.)](https://arxiv.org/abs/2009.13658).


* **use_cache** (`bool`, optional, defaults to `True`) – Whether or not the model should return the last key/values attentions (not used by all models). Only
relevant if `config.is_decoder=True`.


* **classifier_dropout** (`float`, optional) – The dropout ratio for the classification head.


* **adv_grad_factor** (`float`, optional) – This factor will be multipled by the KL loss grad and then
the result will be added to the original embedding.
More details please check:https://arxiv.org/abs/1908.04577
The range of this value always be 1e-3~1e-7


* **adv_bound** (`float`, optional) – adv_bound is used to cut the top and the bottom bound of
the produced embedding.
If not proveded, 2 \* sigma will be used as the adv_bound factor


* **sigma** (`float`, optional) – The std factor used to produce a 0 mean normal distribution.
If adv_bound not proveded, 2 \* sigma will be used as the adv_bound factor

当用户在推理中使用本模型时，这些参数一般都是固定的。您可以使用Model类直接拉起模型：
```python
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_bert_sentiment-analysis_english-base')
```


# 模型使用

输入自然语言文本，模型会给出该文本的情感分类标签(0, 1, 2)，即（Negative, Neutral, Positive）以及相应的概率。 

## 在外部框架中调用模型推理

模型使用了bert预训练模型的tokenizer对输入文本进行前处理，然后调用本模型预测情感类别。如果您需要在外部框架中直接使用本模型，可以直接调用它：

```python
#调用tokenizer对输入文本进行前处理
from transformers import BertTokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
result = tokenizer('Good night.', return_tensors='pt')
print (result)

#调用模型预测情感类别
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_bert_sentiment-analysis_english-base')
print(model(**result))
```

Tokenizer的实现和使用基于transformers.bert的tokenizer，用户可以查看huggingface的[tokenizer文档](https://huggingface.co/docs/transformers/model_doc/bert#transformers.BertTokenizer)。

## 在ModelScope框架Pipeline式调用模型（推荐）

ModelScope推荐您直接使用pipeline来完成模型推理。

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

input = 'Good night.'
semantic_cls = pipeline(Tasks.text_classification, 'damo/nlp_bert_sentiment-analysis_english-base')
result = semantic_cls(input)

print('输入文本:\n{}\n'.format(input))
print('分类结果:\n{}'.format(result))
```

有关pipeline的使用和它们的输出格式请参考[这里](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E6%8E%A8%E7%90%86Pipeline)。

## 模型输出

```text
{
  # 类别标签
  'labels': ['Negative', 'Neutral', 'Positive'],
  # 每个类别的概率分布
  'scores': [0.041243892163038254, 0.07342174649238586, 0.885334312915802]
}
```
