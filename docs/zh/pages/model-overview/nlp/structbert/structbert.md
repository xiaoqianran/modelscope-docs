<!-- modelscope-docs: structbert | model-overview/nlp/structbert/structbert_CN.md -->

# 模型概览

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

# 模型配置项

StructBERT模型的超参数控制可以在下载下来的模型文件中找到config.json文件，该文件一般格式如下：

```text
{
    "attention_probs_dropout_prob": 0.1,
    "directionality": "bidi",
    "hidden_act": "gelu",
    "hidden_dropout_prob": 0.1,
    "hidden_size": 256,
    "initializer_range": 0.02,
    "intermediate_size": 1024,
    "max_position_embeddings": 512,
    "num_attention_heads": 4,
    "num_hidden_layers": 4,
    "pooler_fc_size": 768,
    "pooler_num_attention_heads": 12,
    "pooler_num_fc_layers": 3,
    "pooler_size_per_head": 128,
    "pooler_type": "first_token_transform",
    "type_vocab_size": 2,
    "vocab_size": 21128
}
```
在预训练模型中，这些配置只是模型全部配置中的一部分。StructBERT的模型参数会通过SbertConfig类传入，下面是API文档中列举的常用的配置项：

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

当用户在推理中使用StructBERT的模型时，这些参数一般都是固定的。您可以使用Model类直接拉起模型：
```python
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base')
```

也可以直接初始化一个backbone：
```python
# 下载模型
from modelscope.hub.snapshot_download import snapshot_download
model_dir = snapshot_download('damo/nlp_structbert_backbone_base_std')
from modelscope.models.nlp.structbert import SbertConfig
config = SbertConfig.from_pretrained(model_dir)
# 可以对其中的参数进行调节：
config.attention_probs_dropout_prob = 0.2
# 使用修改后的参数初始化模型：
from modelscope.models.nlp.structbert import SbertModel
model = SbertModel.from_pretrained(model_dir, config=config)
print(model.config.attention_probs_dropout_prob)
```

如果您使用ModelScope的trainer进行训练，ModelScope推荐您在trainer中对模型参数等进行配置和调节。训练过程可以参考“模型的训练”章节。

# 模型前处理

## tokenizer

StructBERT自带了tokenizer。如果您需要在外部框架中直接使用StructBERT，可以直接调用它：

```python
from modelscope.preprocessors.nlp import Tokenize
# model_dir请参考上面的例子
tokenizer = Tokenize.from_pretrained(model_dir)
output = tokenizer('This is a test.', return_tensors='pt')
print(output)
# 将tokenizer的输出传入上面的模型
print(model(**output))
```

Tokenizer的实现和使用基于transformers.bert的tokenizer，用户可以查看huggingface的[tokenizer文档](https://huggingface.co/docs/transformers/model_doc/bert#transformers.BertTokenizer)。

## 前处理器（Preprocessor）

如果您在ModelScope框架中使用StructBERT，ModelScope建议您使用前处理器而非直接调用tokenizer。
ModelScope的前处理器对各类任务进行了特化封装，并直接对接数据集模块（前处理器承载了取数据、tokenize数据、tensor化、分析label等功能），因此您不需要在直接调用tokenizer并为每个任务编写不同的适配代码。

StructBERT不同的任务模型有不同的前处理器，具体可以查看“模型支持的下游任务”。

有关Preprocessor的整体使用可以参考[这里](https://www.modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E7%9A%84%E9%A2%84%E5%A4%84%E7%90%86)。

# 模型支持的下游任务

## backbone

Backbone一般指预训练中缺少特定任务头的模型体，它需要经过用户数据集的训练才能够在具体任务中使用。有关StructBERT训练的部分请参考“模型的训练”章节。

## 分类任务

NLP中的分类任务又可以分为许多具体任务，如单句的情感分析，双句的句子相似度和推理等。这些任务在modelhub中有不同的模型可以使用，它们都复用一个模型和一个前处理器。

### 分类任务的模型

StructBERT的SbertForSequenceClassification类可以将上述的各种具体任务模型加载起来用于训练和推理。

```python
from modelscope.models.nlp import SbertForSequenceClassification
# 加载推理模型
model = SbertForSequenceClassification.from_pretrained('damo/nlp_structbert_nli_chinese-base')
# 加载相似度模型
model = SbertForSequenceClassification.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base')
```

#### 模型forward参数

    
* **input_ids** (`torch.LongTensor` of shape `(batch_size, sequence_length)`) – Indices of input sequence tokens in the vocabulary.

* **attention_mask** (`torch.FloatTensor` of shape `(batch_size, sequence_length)`, optional) – Mask to avoid performing attention on padding token indices. Mask values selected in `[0, 1]`:


    1 for tokens that are **not masked**,


    0 for tokens that are **masked**.


* **token_type_ids** (`torch.LongTensor` of shape `(batch_size, sequence_length)`, optional) – Segment token indices to indicate first and second portions of the inputs. Indices are selected in `[0,
1]`:


    0 corresponds to a sentence A token,


    1 corresponds to a sentence B token.



* **position_ids** (`torch.LongTensor` of shape `(batch_size, sequence_length)`, optional) – Indices of positions of each input sequence tokens in the position embeddings. Selected in the range `[0,
config.max_position_embeddings - 1]`.

* **head_mask** (`torch.FloatTensor` of shape `(num_heads,)` or `(num_layers, num_heads)`, optional) – Mask to nullify selected heads of the self-attention modules. Mask values selected in `[0, 1]`:


    1 indicates the head is **not masked**,


    0 indicates the head is **masked**.



* **inputs_embeds** (`torch.FloatTensor` of shape `(batch_size, sequence_length, hidden_size)`, optional) – Optionally, instead of passing `input_ids` you can choose to directly pass an embedded representation.
This is useful if you want more control over how to convert `input_ids` indices into associated
vectors than the model’s internal embedding lookup matrix.


* **output_attentions** (`bool`, optional) – Whether or not to return the attentions tensors of all attention layers. See `attentions` under returned
tensors for more detail.


* **output_hidden_states** (`bool`, optional) – Whether or not to return the hidden states of all layers. See `hidden_states` under returned tensors for
more detail.


* **return_dict** (`bool`, optional) – Whether or not to return a `ModelOutput` instead of a plain tuple.


* **encoder_hidden_states** (`torch.FloatTensor` of shape `(batch_size, sequence_length, hidden_size)` – optional):
Sequence of hidden-states at the output of the last layer of the encoder. Used in the cross-attention if
the model is configured as a decoder.


* **encoder_attention_mask** (`torch.FloatTensor` of shape `(batch_size, sequence_length)`, optional) – Mask to avoid performing attention on the padding token indices of the encoder input. This mask is used in
the cross-attention if the model is configured as a decoder. Mask values selected in `[0, 1]`:


    * 1 for tokens that are **not masked**,


    * 0 for tokens that are **masked**.



* **past_key_values** (`tuple(tuple(torch.FloatTensor))` of length `config.n_layers`, optional) with each tuple having 4 tensors of shape `(batch_size, num_heads, sequence_length - 1, embed_size_per_head)`):
Contains precomputed key and value hidden states of the attention blocks. Can be used to speed up decoding.

If `past_key_values` are used, the user can optionally input only the last `decoder_input_ids`
(those that don’t have their past key value states given to this model) of shape `(batch_size, 1)`
instead of all `decoder_input_ids` of shape `(batch_size, sequence_length)`.



* **use_cache** (`bool`, optional) – If set to `True`, `past_key_values` key value states are returned and can be used to speed up
decoding (see `past_key_values`).

### 分类任务的前处理器

StructBERT用户分类任务的前处理器是SequenceClassificationPreprocessor, 它可以接受各单句和双句分类任务的数据集并给出模型需要的输入：

```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.models.nlp import SbertForSequenceClassification
model_dir = snapshot_download('damo/nlp_structbert_sentence-similarity_chinese-base')
from modelscope.preprocessors.nlp import TextClassificationTransformersPreprocessor
preprocessor = TextClassificationTransformersPreprocessor(model_dir)
inputs = preprocessor(('这是个测试', '这也是个测试'))
model = SbertForSequenceClassification.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base')
print(model(**inputs))
# AttentionTextClassificationModelOutput(logits=tensor([[-1.2855,  1.4926]])
```

#### 前处理器的参数

构造参数:


* **model_dir** (`str`) – The model_dir to load the configuration from. Note that this model_dir must exist in the local file system.

* **mode** (`str`, optional, defaults to ‘inference’) – The work mode for this preprocessor. Valid values can be ‘train’, ‘eval’ and ‘inference’.
This preprocessor’s behavior may be different under these values.

* **kwargs** (`dict`, optional) 
    
    sequence_length: The input sequence length to padding to.

    first_sequence: The key for the first sequence

    second_sequence: The key for the second sequence

    label: The label key

    label2id: An optional label2id mapping, the class will try to call utils.parse_label_mapping if this mapping is not supplied.

    Other input args will be fed into the tokenizer at the runtime.

前处理器可以通过__call__方法直接使用：
```python
preprocessor(('这是个测试', '这也是个测试'))
```
可接受的参数类型有str、tuple、dict。当用户的输入是tuple或str时，构造时传入的first_sequence、second_sequence、label三个参数不起作用。

### 分类任务的模型输出


```text
AttentionTextClassificationModelOutput(
    logits=tensor([[-1.2855,  1.4926]], grad_fn=<AddmmBackward0>), 
    loss=None, 
    attentions=None, 
    hidden_states=None
)
```

### 分类任务的Pipeline

如果用户的场景是推理，ModelScope推荐您直接使用pipeline来完成您的需求。

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
pipeline_ins = pipeline(task=Tasks.sentence_similarity, model='damo/nlp_structbert_sentence-similarity_chinese-base')
print(pipeline_ins(input=('这是个测试', '这也是个测试')))
```

有关pipeline的使用和它们的输出格式请参考[这里](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E6%8E%A8%E7%90%86Pipeline)。

### 分类任务模型的导出

如果您是在C++或加速场景下使用StructBERT，您也可以将模型导出为onnx或TorchScript格式。

```python
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base')
# 由于TorchScript是Pytorch特有的格式，因此需要使用TorchModelExporter
from modelscope.exporters import TorchModelExporter
# shape参数是生成dummy inputs的尺寸
# 在NLP领域中一般len(shape) == 2, 分别代表batch_size和sequence_length
output_files = TorchModelExporter.from_model(model).export_torch_script(shape=(2, 256), output_dir='/tmp')
print(output_files) # {'model': '/tmp/model.ts'}
```

上面给出了一个导出为TorchScript的例子。在这一过程中，ModelScope会使用模型配置来初始化一个预处理器并生成dummy inputs，并使用trace方法来生成ts模型文件。

### 分类任务模型列表

在这里我们列举了StructBERT支持的部分模型，完整模型列表可以查看[模型库](https://www.modelscope.cn/models)并搜索`structbert`，并在左侧选择您感兴趣的对应任务。

| 模型                                                                                                             |       任务 |
|----------------------------------------------------------------------------------------------------------------|---------:|
| [中文句子相似度base模型](https://www.modelscope.cn/models/damo/nlp_structbert_sentence-similarity_chinese-base/summary) |    句子相似度 |
| [中文句子推理base模型](https://www.modelscope.cn/models/damo/nlp_structbert_nli_chinese-base/summary) |    推理任务 |
| [中文句子情感分类base模型](https://www.modelscope.cn/models/damo/nlp_structbert_sentiment-classification_chinese-base/summary) |    情感分类任务 |


### 分类任务模型的训练

分类任务的训练可以参考下文的“模型的训练”。

## 序列标注任务

NLP中的序列标注任务又可以分为许多具体任务，如分词任务，命名实体识别任务等。这些任务在modelhub中有不同的模型可以使用，它们都复用一个模型和一个前处理器。

### 序列标注任务的模型

StructBERT的SbertForTokenClassification类可以将上述的各种具体任务模型加载起来用于训练和推理。

```python
from modelscope.models.nlp import SbertForTokenClassification
# 加载分词模型
model = SbertForTokenClassification.from_pretrained('damo/nlp_structbert_word-segmentation_chinese-lite-ecommerce')
```

### 序列标注任务的前处理器

StructBERT序列标注任务的前处理器是TokenClassificationPreprocessor：

```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.models.nlp import SbertForTokenClassification
model_dir = snapshot_download('damo/nlp_structbert_word-segmentation_chinese-lite-ecommerce')
from modelscope.preprocessors.nlp import TokenClassificationTransformersPreprocessor
preprocessor = TokenClassificationTransformersPreprocessor(model_dir)
inputs = preprocessor('这是个测试', padding=False)
text = inputs.pop('text')
model = SbertForTokenClassification.from_pretrained('damo/nlp_structbert_word-segmentation_chinese-lite-ecommerce')
print(model(**inputs))
# AttentionTokenClassificationModelOutput(logits=tensor([[[-1.2649, -1.9372, -4.0658,  9.0954],
#          [-1.5067, -1.8668, -3.8505,  8.9027],
#          [-1.7146, -1.5011, -3.9185,  8.9747],
#          [ 7.9338, -3.9410, -4.9401,  0.9133],
#          [-4.5097,  8.4406, -3.9096,  0.5213],
#          [ 0.0000,  0.0000,  0.0000,  0.0000],
#          [ 0.0000,  0.0000,  0.0000,  0.0000]]], grad_fn=<CopySlices>), loss=None, offset_mapping=tensor([[[0, 1],
#          [1, 2],
#          [2, 3],
#          [3, 4],
#          [4, 5]]]), predictions=None, label_mask=tensor([[False,  True,  True,  True,  True,  True, False]]), attentions=None, hidden_states=None)
```

#### 前处理器的参数

构造参数:


* **model_dir** (`str`) – The model_dir to load the configuration from. Note that this model_dir must exist in the local file system.

* **mode** (`str`, optional, defaults to ‘inference’) – The work mode for this preprocessor. Valid values can be ‘train’, ‘eval’ and ‘inference’.
This preprocessor’s behavior may be different under these values.

* **kwargs** (`dict`, optional) 
    
    sequence_length: The input sequence length to padding to.

    first_sequence: The key for the first sequence

    label: The label key

    is_split_into_words: Whether the input has already been split into a token list.

    label_all_tokens: Whether to label all tokens, including the inner tokens within one object, else these inner tokens will be labeled to -100.

    label2id: An optional label2id mapping, the class will try to call utils.parse_label_mapping if this mapping is not supplied.

    Other input args will be fed into the tokenizer at the runtime.

前处理器可以通过__call__方法直接使用：

```python
preprocessor('这是个测试')
```
可接受的参数类型有str、tuple、dict。当用户的输入是tuple或str时，构造时传入的first_sequence、label两个参数不起作用。

### 序列标注任务的模型输出

```text
AttentionTokenClassificationModelOutput(logits=tensor([[[-1.2649, -1.9372, -4.0658,  9.0954],
         [-1.5067, -1.8668, -3.8505,  8.9027],
         [-1.7146, -1.5011, -3.9185,  8.9747],
         [ 7.9338, -3.9410, -4.9401,  0.9133],
         [-4.5097,  8.4406, -3.9096,  0.5213],
         [ 0.0000,  0.0000,  0.0000,  0.0000],
         [ 0.0000,  0.0000,  0.0000,  0.0000]]], grad_fn=<CopySlices>), loss=None, offset_mapping=tensor([[[0, 1],
         [1, 2],
         [2, 3],
         [3, 4],
         [4, 5]]]), predictions=None, label_mask=tensor([[False,  True,  True,  True,  True,  True, False]]), 
```

### 序列标注任务的Pipeline

如果用户的场景是推理，ModelScope推荐您直接使用pipeline来完成您的需求。

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
pipeline_ins = pipeline(task=Tasks.word_segmentation, model='damo/nlp_structbert_word-segmentation_chinese-lite-ecommerce')
print(pipeline_ins(input=('这是个测试')))
```

有关pipeline的使用请参考[这里](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E6%8E%A8%E7%90%86Pipeline)。

### 序列标注任务模型列表

在这里我们列举了StructBERT支持的部分模型，完整模型列表可以查看[模型库](https://www.modelscope.cn/models)并搜索`structbert`，并在左侧选择您感兴趣的对应任务。

| 模型                                                                                                                                     |   任务 |
|----------------------------------------------------------------------------------------------------------------------------------------|-----:|
| [BAStructBERT分词-中文-新闻领域-base模型](https://www.modelscope.cn/models/damo/nlp_structbert_word-segmentation_chinese-base/summary)           | 中文分词 |
| [BAStructBERT分词-中文-电商领域-base模型](https://www.modelscope.cn/models/damo/nlp_structbert_word-segmentation_chinese-base-ecommerce/summary) | 中文分词 |


### 序列标注任务模型的训练

序列标注任务的训练可以参考下文章节“模型的训练”。


# 模型的训练

StructBERT模型的训练可以使用ModelScope提供的trainer来进行。下面的代码展示了一个完整的模型训练过程：
```python
from modelscope.metainfo import Preprocessors
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.constant import Tasks


# 通过这个方法修改cfg
def cfg_modify_fn(cfg):
    # 将backbone模型加载到句子相似度的模型类中
    cfg.task = Tasks.sentence_similarity
    # 使用句子相似度的预处理器
    cfg['preprocessor'] = {'type': Preprocessors.sen_sim_tokenizer}

    # 演示代码修改，正常使用不用修改
    cfg.train.dataloader.workers_per_gpu = 0
    cfg.evaluation.dataloader.workers_per_gpu = 0

    # 补充数据集的特性
    cfg['dataset'] = {
        'train': {
            # 实际label字段内容枚举，在训练backbone时需要传入
            'labels': ['0', '1'],
            # 第一个字段的key
            'first_sequence': 'sentence1',
            # 第二个字段的key
            'second_sequence': 'sentence2',
            # label的key
            'label': 'label',
        }
    }
    # lr_scheduler的配置
    cfg.train.lr_scheduler.total_iters = int(len(dataset['train']) / 32) * cfg.train.max_epochs
    return cfg

#使用clue的afqmc进行训练
dataset = MsDataset.load('clue', subset_name='afqmc')
kwargs = dict(
    model='damo/nlp_structbert_backbone_base_std',
    train_dataset=dataset['train'],
    eval_dataset=dataset['validation'],
    work_dir='/tmp',
    cfg_modify_fn=cfg_modify_fn)

#使用nlp-base-trainer
trainer = build_trainer(name='nlp-base-trainer', default_args=kwargs)
trainer.train()
```
StructBERT模型的各backbone均支持各类文本分类任务、序列标注任务等自然语言理解任务的训练。训练后再work_dir中会存储训练过程文件（用于断点继续训练）和推理文件（用于上传modelhub或推理、导出等场景）。
训练的具体细节和产出文件的使用请参考[模型的训练文档](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E8%AE%AD%E7%BB%83Train)。



