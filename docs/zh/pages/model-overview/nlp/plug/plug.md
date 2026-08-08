<!-- modelscope-docs: plug | model-overview/nlp/plug/plug_CN.md -->

# 模型概览

PLUG (Pre-training for Language Understanding and Generation) 是一个270亿参数规模的中文理解和生成联合模型。该模型的训练由两个阶段构成。首先我们训练了一个24层的基于StructBERT: [Incorporating Language Structures into Pre-training for Deep Language Understanding](https://arxiv.org/abs/1908.04577)的encoder，然后我们基于此训练了一个24+6层的PALM: [PALM: Pre-training an Autoencoding&Autoregressive Language Model
for Context-conditioned Generation](https://arxiv.org/pdf/2004.07159.pdf?fbclid=IwAR0BNl1IzR5bhcuEbyfNw2UN7MApHFoFP3BN40FKkW8x3bqolK_HilU293I) encoder-decoder。这使得模型既可以通过finetune来处理文本分类、序列标注等自然语言理解（NLU）任务，也可以用来处理自然语言生成（NLG）的任务。

![model](./_resources/plug.png)

PLUG同时开源到了[AliceMind](https://github.com/alibaba/AliceMind)，关于该模型更多细节介绍可以前往了解。

# 模型配置项

PLUG模型的超参数控制可以在下载下来的模型文件中找到config.json文件，该文件一般格式如下：

```text
{
    "hidden_size": 8192,
    "intermediate_size": 32768,
    "num_hidden_layers": 24,
    "dec_hidden_layers": 6,
    "num_attention_heads": 128,
    "hidden_dropout_prob": 0.1,
    "attention_probs_dropout_prob": 0.1,
    "hidden_act": "gelu",
    "type_vocab_size": 3,
    "vocab_size": 21504,
    "original_vocab_size": 21128,
    "max_position_embeddings": 2048,
    "lr_decay_style": "linear",
    "lr": 3e-5,
    "weight_decay": 1e-2,
    "clip_grad": 1.0,
    "warmup": 0.0333,
    "layernorm_epsilon": 1e-5,
    "fp32_embedding": false,
    "fp32_tokentypes": false,
    "fp32_layernorm": true,
    "fp16": true,
    "attn_separate": false,
    "pre_ln": true
}
```

## 参数列表


* **hidden_size** (`int`, optional, defaults to 8192) - Dimensionality of the encoder layers and the pooler layer.


* **intermediate_size** (`int`, optional, defaults to 32768) - Dimensionality of the "intermediate" (i.e., feed-forward) layer in the Transformer encoder.


* **num_hidden_layers** (`int`, optional, defaults to 24) - Number of hidden layers in the Transformer encoder.


* **dec_hidden_layers** (`int`, optional, defaults to 6) - Number of hidden layers in the Transformer decoder.


* **num_attention_heads** (`int`, optional, defaults to 128) - Number of attention heads for each attention layer in the Transformer encoder.


* **hidden_dropout_prob** (`float`, optional, defaults to 0.1) - The dropout ratio for all fully connected layers in the embeddings, encoder, and pooler.


* **attention_probs_dropout_prob** (`float`, optional, defaults to 0.1) - The dropout ratio for the Transformer Attention.


* **hidden_act** (`str`, optional, defaults to `"gelu"`) - The non-linear activation function (function or string) in the encoder and pooler. If string, `"gelu"`, `"relu"`, `"selu"` and `"gelu_new"` are supported.


* **type_vocab_size** (`int`, optional, defaults to 3) - The vocabulary size of the `token_type_ids` passed when calling [`PlugModel`].


* **vocab_size** (`int`, optional, defaults to 21504) - Padded vocabulary size of the PLUG model for vocab tensor parallel. Defines the number of different tokens that can be represented by the `inputs_ids` passed when calling [`PlugModel`].


* **original_vocab_size** (`int`, optional, defaults to 21128) - True vocabulary size of the PLUG model. Defines the number of different tokens that can be represented.


* **max_position_embeddings** (`int`, optional, defaults to 2048) - The maximum sequence length that this model might ever be used with. Typically set this to something large just in case (e.g., 512 or 1024 or 2048).


* **lr_decay_style** (`str`, optional, defaults to 'linear') - The decay style of learning rate during fine-tunining. If string, `"linear"`, `"cosine"`, `"exponential"`, `"constant"`, `"None"` are supported.


* **lr** (`float`, optional, defaults to 3e-5) - The tuning parameter in an optimization algorithm that determines the step size at each iteration while moving toward a minimum of a loss function.


* **weight_decay** (`float`, optional, defaults to 1e-2) - Decoupled weight decay to apply.


* **clip_grad** (`float`, optional, defaults to 1.0) - Maximum gradient norm for gradient clipping.


* **warmup** (`float`, optional, defaults to 0.01) - Ratio of total training steps used for a linear warmup from 0 to `learning_rate`.


* **layernorm_epsilon** (`float`, optional, defaults to 1e-5) - The epsilon to use in the layer normalization layers.


* **fp32_embedding** (`boolean`, optional, defaults to `False`) - Whether to use fp32 32-bit precision Embedding training while the argument `fp16` set to `True`.


* **fp32_tokentypes** (`boolean`, optional, defaults to `False`) - Whether to use fp32 32-bit precision token types training while the argument `fp16` set to `True`.


* **fp32_layernorm** (`boolean`, optional, defaults to `True`) - Whether to use fp32 32-bit precision LayerNorm training while the argument `fp16` set to `True`.


* **fp16** (`boolean`, optional, defaults to `True`) - Whether to use fp16 16-bit (mixed) precision training instead of 32-bit training.


* **attn_separate** (`boolean`, optional, defaults to `False`) - Whether or not to separate query-key-value to query, key, value in the Attention.


* **pre_ln** (`boolean`, optional, defaults to `True`) - Whether or not to apply LayerNorm to the input instead of the output in the blocks.


如果您使用了modelscope提供的backbone模型文件进行后续finetune，那么大多数的参数都需要保持原样，
以便模型文件可以正常加载，但是仍然可以对dropout prob等参数进行修改。

由于PLUG模型较大，通常需要多张GPU协同运行，因此无法直接用Model类拉起完整模型。我们提供DistributedPipeline进行tensor并行的模型运行：该类在初始化时会起多个子进程，每个子进程控制一张GPU，其会自动加载config配置项，并处理该GPU上的一部分模型。您可以通过pipeline进行完整模型的运行。

# 模型前处理

## tokenizer

PLUG模型使用了transformers中的[BertTokenizer](https://huggingface.co/docs/transformers/model_doc/bert#transformers.BertTokenizer)，如果您需要在外部框架中直接使用tokenizer，
您可以直接调用它：

```python
from transformers import BertTokenizer
model_dir = 'path/to/your/model'
tokenizer = BertTokenizer.from_pretrained(model_dir)
output = tokenizer('这是一个测试。')
print(output)
```

关于Tokenizer的实现细节与详细使用方法，用户可以查看huggingface的[tokenizer文档](https://huggingface.co/docs/transformers/model_doc/bert#transformers.BertTokenizer)。


## 前处理器

一般来说，不同的任务模型有不同的前处理器（Preprocessor），我们列举了plug的一些下游任务及它们的前处理器：

| 任务                      |                                  前处理器 |
|--------------------------|-----------------------------------------:|
| nli                      |   PairSentenceClassificationPreprocessor |
| sentiment-classification | SingleSentenceClassificationPreprocessor |
| sentence-similarity      |   PairSentenceClassificationPreprocessor |
| zero-shot-classification |       ZeroShotClassificationPreprocessor |
| word_segmentation        |          TokenClassificationPreprocessor |
| token_classification     |          TokenClassificationPreprocessor |
| text_generation          |               TextGenerationPreprocessor |


modelscope在前处理器中封装了tokenizer的逻辑，使得推理和训练中部分参数无需重复配置。
如果您在modelscope项目中使用structbert，您可以直接使用对应的Preprocessor。

目前modelscope中plug模型仅支持生成任务(nlg)，理解分类任务(nlu)尚未集成。

有关Preprocessor的使用可以参考[这里](https://www.modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E7%9A%84%E9%A2%84%E5%A4%84%E7%90%86)。


# <div id="model_tasks">模型支持的下游任务</div>

| 任务                      |                 文档地址 |
|--------------------------|------------------------:|
| backbone                 |         [backbone文档]() |
| nli                      |          [推理任务文档]() |
| sentiment-classification |       [情感分类任务文档]() |
| sentence-similarity      |        [句子相似度文档]() |
| zero-shot-classification | [zero-shot分类任务文档]() |
| word_segmentation        |          [分词任务文档]() |
| token_classification     |     [token分类任务文档]() |
| text_generation          |          [文本生成任务]() |

当前ModelScope已支持了文本生成任务（text_generation），其他文本理解任务尚未集成。


## 多个下游任务的模型调用及输出

模型调用的样例可以参考模型forward和postprocess的[文档](https://modelscope.cn/docs/api_docs/API%E6%96%87%E6%A1%A3%2Fbuild%2Fjson%2Fapi%2Fgenerated%2Fmodelscope.models.nlp.plug.distributed_plug.DistributedPlug)。 

模型输出为不同任务模型的标准输出, 我们列举了plug的一些下游任务及它们的输出。
| 任务                      |                                             输出 |
|--------------------------|-------------------------------------------------:|
| nli                      | "labels": ["happy", "sad"], "scores": [0.9, 0.1] |
| sentiment-classification |  "scores": [0.0718, 0.928], "labels": ["1", "0"] |
| zero-shot-classification | "scores": [0.9, 0.1], "labels": ["happy", "sad"] |
| sentence-similarity      |                     "scores": 0.9, "labels": "1" |
| text_generation          |                   "text": "这是模型生成的输出语句。" |

需要注意的是，modelscope的模型训练时一般只会调用forward方法，而模型推理时调用了__call__方法，其中包含了对forward和postprocess方法的顺序调用。

## 文本生成任务

NLP中的文本生成任务又可以分为许多具体任务，如文本摘要，机器翻译、故事续写等。这些任务在modelhub中有不同的模型可以使用，它们都复用一个模型和一个前处理器。

### 文本生成任务的前处理器

如果您在ModelScope框架中使用PLUG，ModelScope建议您使用前处理器而非直接调用tokenizer。
ModelScope的前处理器对各类任务进行了特化封装，并直接对接数据集模块（前处理器承载了取数据、tokenize数据、tensor化、分析label等功能），因此您不需要在直接调用tokenizer并为每个任务编写不同的适配代码。

在ModelScope框架中，PLUG用于文本生成任务时，可以使用文本生成任务的前处理器：

```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.preprocessors import TextGenerationTransformersPreprocessor

model_id = 'damo/nlp_plug_text-generation_27B'
model_dir = snapshot_download(model_id)
sentence = '这是一个测试。'

preprocessor = TextGenerationTransformersPreprocessor(model_dir)
# 前处理器可以通过__call__方法直接使用
result = preprocessor(sentence, padding=False)
print(result)
```

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

前处理器可接受的参数类型有str、tuple、dict。当用户的输入是tuple或str时，构造时传入的first_sequence、second_sequence、label三个参数不起作用。

### 文本生成任务的模型

由于PLUG模型参数量较大，通常需要多卡同时运行推理任务，目前在ModelScope中不提供Model层的直接调用方式，请参考基于pipeline的文本生成任务调用示例。


### 文本生成任务的Pipeline

如果用户的场景是推理，ModelScope推荐您直接使用pipeline来完成您的需求。

此示例为单机8卡(GPU)示例，运行时每张GPU约占用显存12G。

```python
# 下载模型config并获取模型路径model_dir
from modelscope.hub.snapshot_download import snapshot_download
model_id = 'damo/nlp_plug_text-generation_27B'
model_dir = snapshot_download(model_id)
print(model_dir)

# 将模型二进制文件下载至model_dir/model，下载地址获取：https://github.com/alibaba/AliceMind/tree/main/PLUG#pre-trained-model-download
# 将二进制文件放入model_dir的model文件夹中，最终model_dir目录的文件组织应包含如下结构：
# model_dir
# |_ config.json
# |_ configuration.json
# |_ ds_zero-offload_10B_config.json
# |_ vocab.txt
# |_ model
#    |_ mp_rank_00_model_states.pt
#    |_ mp_rank_01_model_states.pt
#    |_ mp_rank_02_model_states.pt
#    |_ mp_rank_03_model_states.pt
#    |_ mp_rank_04_model_states.pt
#    |_ mp_rank_05_model_states.pt
#    |_ mp_rank_06_model_states.pt
#    |_ mp_rank_07_model_states.pt

# 通过修改config.json对其中的参数进行调节

# 通过pipeline初始化完整模型
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

model_id = 'damo/nlp_plug_text-generation_27B'
pipe = pipeline(Tasks.text_generation, model=model_id)

# 执行一次生成
input = '段誉轻挥折扇，摇了摇头，说道：“你师父是你的师父，你师父可不是我的师父。"'
# out_length为期望的生成长度，最大为512
result = pipe(input, out_length=256)
print(result)
```

有关pipeline的使用和它们的输出格式请参考[这里](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E6%8E%A8%E7%90%86Pipeline)。

