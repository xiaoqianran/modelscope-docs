<!-- modelscope-docs: gpt3 | model-overview/nlp/gpt3/gpt3_CN.md -->

# 模型概览

GPT-3模型是一个通用的预训练生成模型，使用Transformer的Decoder-only结构，并对Transformer Decoder进行了一些改动，原本的Decoder包含了两个 Multi-Head Attention 结构，GPT-3只保留了 Mask Multi-Head Attention，利用常规的语言建模优化，从左到右的自回归预训练，可以用于解决下游各种类型的生成任务，特别是zero-shot生成能力。模型利用大量无监督数据，通过自回归任务进行预训练。可以用于解决文本生成相关的任务包含：文本摘要、问题生成、data-to-text等。模型介绍详见：[Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)

论文的摘要信息如下：

```text
对于所有任务，GPT-3 无需任何梯度更新或微调即可应用，任务和小样本演示纯粹通过与模型的文本交互来指定。GPT-3 在许多 NLP 数据集上实现了强大的性能，包括翻译、问答和完形填空任务，以及一些需要即时推理或领域适应的任务，例如解读单词，在句子，或执行 3 位算术。同时，我们还确定了 GPT-3 的小样本学习仍然困难的一些数据集，以及 GPT-3 面临与大型网络语料库训练相关的方法问题的一些数据集。最后，我们发现 GPT-3 可以生成人类评估者难以将其与人类撰写的文章区分开来的新闻文章样本。我们总体上讨论了这一发现和 GPT-3 的更广泛的社会影响。
```

模型领先性：

	1. GPT-3是最有影响力的NLP模型之一，开启了超大规模预训练的浪潮，参数量最多达到175B，提供了匹配模型规模的良好性能。
    2. GPT-3展示了扩展语言模型极大地提高了与任务无关的、少样本的性能，有时甚至达到了与先前最先进的微调方法的竞争力。


# 模型配置项

GPT-3模型的超参数控制可以在下载下来的模型文件中找到config.json文件，该文件一般格式如下：

```text
{
  "attention_probs_dropout_prob": 0.1,
  "hidden_act": "gelu",
  "hidden_dropout_prob": 0.1,
  "hidden_size": 768,
  "initializer_range": 0.02,
  "intermediate_size": 3072,
  "max_position_embeddings": 2048,
  "num_attention_heads": 12,
  "num_hidden_layers": 12,
  "type_vocab_size": 2,
  "vocab_size": 25600,
  "fp16": false,
  "layernorm_epsilon": 1e-12
}
```
在预训练模型中，这些配置只是模型全部配置中的一部分。GPT-3的模型参数会通过GPT3Config类传入，下面是API文档中列举的常用的配置项：

## 参数列表


* **attention_probs_dropout_prob** (`float`, optional, defaults to 0.1) – The dropout ratio for the attention probabilities.


* **hidden_act** (`str` or `Callable`, optional, defaults to `"gelu"`) – The non-linear activation function (function or string) in the decoder and pooler. If string,
`"gelu"`, `"relu"`, `"silu"` and `"gelu_new"` are supported.


* **hidden_dropout_prob** (`float`, optional, defaults to 0.1) – The dropout probability for all fully connected layers in the embeddings, decoder, and pooler.


* **hidden_size** (`int`, optional, defaults to 768) – Dimensionality of the decoder layers and the pooler layer.


* **initializer_range** (`float`, optional, defaults to 0.02) – The standard deviation of the truncated_normal_initializer for initializing all weight matrices.


* **intermediate_size** (`int`, optional, defaults to 3072) – Dimensionality of the “intermediate” (often named feed-forward) layer in the Transformer decoder.


* **max_position_embeddings** (`int`, optional, defaults to 2048) – The maximum sequence length that this model might ever be used with. Typically set this to something large
just in case (e.g., 512 or 1024 or 2048).


* **num_attention_heads** (`int`, optional, defaults to 12) – Number of attention heads for each attention layer in the Transformer decoder.


* **num_hidden_layers** (`int`, optional, defaults to 12) – Number of hidden layers in the Transformer decoder.


* **type_vocab_size** (`int`, optional, defaults to 2) – The vocabulary size of the `token_type_ids` passed when calling `GPT3Model`.


* **vocab_size** (`int`, optional, defaults to 30522) – Vocabulary size of the BERT model. Defines the number of different tokens that can be represented by the `inputs_ids` passed when calling `GPT3Model`.


* **fp16** (`bool`, optional, defaults to `False`) - Whether or not the model should use float16 scalars.


* **layernorm_epsilon** (`float`, optional, defaults to 1e-12) - The epsilon used by the layer normalization layers.


当用户在推理中使用GPT-3的模型时，这些参数一般都是固定的。您可以使用Model类直接拉起模型：
```python
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_gpt3_text-generation_chinese-base')
```

如果您使用ModelScope的trainer进行训练，ModelScope推荐您在trainer中对模型参数等进行配置和调节。训练过程可以参考[模型的训练](https://modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E8%AE%AD%E7%BB%83Train)。

# 模型前处理

## tokenizer

GPT-3模型在ModelScope中的训练使用了两种不同的tokenizer，标为base/large的模型使用BertTokenizer，直接标记参数量的1.3B/2.7B/13B/30B等模型使用基于jieba分词实现的JiebaBPETokenizer。如果您需要在外部框架中直接使用GPT-3模型，以使用transformers库中的BertTokenizer为例：

```python
from transformers import BertTokenizer
# model_dir 为模型配置文件路径，需包含 vocab.txt 文件
tokenizer = BertTokenizer.from_pretrained(model_dir)
output = tokenizer('这是一个测试文本', return_tensors='pt')
print(output)
# 将tokenizer的输出传入模型
print(model(**output))
```

Tokenizer的实现和使用可以查看huggingface的tokenizer文档：[BertTokenizer](https://huggingface.co/docs/transformers/model_doc/bert#transformers.BertTokenizer)。

## 前处理器（Preprocessor）

如果您在ModelScope框架中使用GPT-3，ModelScope建议您使用前处理器而非直接调用tokenizer。
ModelScope的前处理器对各类任务进行了特化封装，并直接对接数据集模块（前处理器承载了取数据、tokenize数据、tensor化、分析label等功能），因此您不需要在直接调用tokenizer并为每个任务编写不同的适配代码。

在ModelScope框架中，GPT-3对应文本生成任务，可以根据模型不同使用不同的文本生成任务的前处理器，当使用base/large模型时：

```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.preprocessors import TextGenerationTransformersPreprocessor

model_id = 'damo/nlp_gpt3_text-generation_chinese-base'
model_dir = snapshot_download(model_id)
sentence = '这是一个测试文本'

preprocessor = TextGenerationTransformersPreprocessor(model_dir)
result = preprocessor(sentence)
print(result)
```

使用1.3B/2.7B/13B等模型时：

```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.preprocessors.text_generation_preprocessor import TextGenerationJiebaPreprocessor

model_id = 'nlp_gpt3_text-generation_1.3B'
model_dir = snapshot_download(model_id)
sentence = '这是一个测试文本'

preprocessor = TextGenerationJiebaPreprocessor(model_dir)
result = preprocessor(sentence)
print(result)
```

TextGenerationTransformersPreprocessor与TextGenerationJiebaPreprocessor这两个文本生成任务的前处理器有着相同的构造参数:


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

有关Preprocessor的整体使用可以参考[这里](https://www.modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E7%9A%84%E9%A2%84%E5%A4%84%E7%90%86)。

# 模型支持的下游任务

## 文本生成任务

NLP中的文本生成任务又可以分为许多具体任务，如文本摘要，机器翻译、故事续写等。这些任务在modelhub中有不同的模型可以使用，部分任务之间可以复用模型和前处理器。

### 文本生成任务的模型

GPT-3的GPT3ForTextGeneration类可以将故事续写等任务模型加载起来用于训练和推理。

```python
from modelscope.models.nlp import PalmForTextGeneration
model = GPT3ForTextGeneration.from_pretrained('damo/nlp_gpt3_text-generation_chinese-base')
```

#### 模型forward参数

    
* **input_ids** (`torch.LongTensor` of shape `(batch_size, sequence_length)`) – Indices of input sequence tokens in the vocabulary.

* **attention_mask** (`torch.FloatTensor` of shape `(batch_size, sequence_length)`, optional) – Mask to avoid performing attention on padding token indices. Mask values selected in `[0, 1]`:


    1 for tokens that are **not masked**,


    0 for tokens that are **masked**.

* **position_ids** (`torch.LongTensor` of shape `(batch_size, sequence_length)`, optional) – Indices of positions of each input sequence tokens in the position embeddings. Selected in the range `[0, config.max_position_embeddings - 1]`.

* **labels** (`torch.LongTensor` of shape `(batch_size, sequence_length)`) - Indices of input sequence tokens in the vocabulary for calculating loss.

#### 模型generate参数

* **input_ids** (`torch.LongTensor` of shape `(batch_size, sequence_length)`) – Indices of input sequence tokens in the vocabulary.

* **attention_mask** (`torch.FloatTensor` of shape `(batch_size, sequence_length)`, optional) – Mask to avoid performing attention on padding token indices. Mask values selected in `[0, 1]`:


    1 for tokens that are **not masked**,


    0 for tokens that are **masked**.

* **do_sample** (`bool`, optional, defaults to `True`) - Whether or not to use sampling; use greedy decoding otherwise.

* **max_length** (`int`, optional, defaults to `model.config.max_length`) - The maximum length the generated tokens can have.

* **top_k** (`int`, optional, defaults to `model.config.top_k` or 10 if the config does not set any value) - The number of highest probability vocabulary tokens to keep for top-k-filtering.

* **top_p** (`float`, optional, defaults to `model.config.top_p` or 1.0 if the config does not set any value) - If set to float < 1, only the smallest set of most probable tokens with probabilities that add up to `top_p` or higher are kept for generation.

### 文本生成任务模型的generate输出


```python
{
  # 生成文本
  "text": "文本形式的模型输出结果"
}
```

### 文本生成任务的Pipeline

如果用户的场景是推理，ModelScope推荐您直接使用pipeline来完成您的需求。

当用户使用中小模型与大模型时，实际pipeline运行时使用的机器资源会有些区别，比如ModelScope中的13B参数量GPT-3如果使用默认配置，会在8卡上以模型并行的方式进行推理。但无论使用中小模型或大模型，面向用户的pipeline代码是没有区别的：

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

inputs = '随着计算机视觉的飞速发展,人脸识别技术已从简单场景发展到复杂场景,也即姿态、光照、表情、噪声、遮挡、化妆、年龄、种族、性别等差异化所呈现的复杂场景。尽管已有的人脸识别系统在特定约束环境下的识别成功率较高,'

# 单卡运行的 base 模型示例代码
pipeline_base = pipeline(Tasks.text_generation, model='damo/nlp_gpt3_text-generation_chinese-base')
result_base = pipeline_base(inputs)
print('文本生成结果:\n' + result_base[OutputKeys.TEXT])

# 多卡运行的 13B 模型示例代码
pipeline_13B = pipeline(Tasks.text_generation, model='damo/nlp_gpt3_text-generation_13B')
result_13B = pipeline_13B(inputs)
print('文本生成结果:\n' + result_13B[OutputKeys.TEXT])
```

可以看出，ModelScope为单卡运行的中小模型与多卡运行的大模型进行了相同的具有易用性的封装，可以让用户快速的使用模型进行推理。

有关pipeline的使用和它们的输出格式请参考[这里](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E6%8E%A8%E7%90%86Pipeline)。

GPT-3系列模型中，1.3B及以上size的模型使用Pipeline进行推理时，实际调用的是DistributedPipeline，在使用上与标准pipeline并无区别，
在接入上的区别可参考[ModelScope模型接入](../../贡献者指南/ModelScope模型接入.md)中“DistributedPipeline介绍”章节。

同时GPT-3支持了推理过程中的自动拆分，如需使用多卡运行1.3B/2.7B等默认为单卡参数的模型进行推理，
可以通过简单的修改configuration.json中的`world_size`和`tensor_model_parallel_size`配置实现，一个例子如下：

注意，json文件不支持注释，请删除标记#及该行后续部分再运行！
```json
{
    "framework": "pytorch",
    "task": "text-generation",
    "preprocessor": {
        "type": "text-gen-jieba-tokenizer"
    },
    "model": {
        "type": "gpt3",
    },
    "pipeline": {
        "type": "gpt3-generation"
    },
    "megatron": {
        "checkpoint_tensor_model_parallel_size": 1, # 保持为1，默认checkpoint切片数为1
        "world_size": 2, # 2卡并行推理
        "tensor_model_parallel_size": 2 # 同上
    }
}
```

对configuration.json文件进行上述修改后即可2卡并行使用DistributedPipeline进行推理，4卡或8卡也同理。

### 文本生成任务模型的导出

如果您是在C++或加速场景下使用GPT-3，您也可以将模型导出为onnx或TorchScript格式。

```python
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_gpt3_text-generation_chinese-base')
# 由于TorchScript是Pytorch特有的格式，因此需要使用TorchModelExporter
from modelscope.exporters import TorchModelExporter
# shape参数是生成dummy inputs的尺寸
# 在NLP领域中一般len(shape) == 2, 分别代表batch_size和sequence_length
output_files = TorchModelExporter.from_model(model).export_torch_script(shape=(2, 256), outputs='/tmp')
print(output_files) # {'model': '/tmp/model.ts'}
```

上面给出了一个导出为TorchScript的例子。在这一过程中，ModelScope会使用模型配置来初始化一个预处理器并生成dummy inputs，并使用trace方法来生成ts模型文件。
有关模型导出的具体细节可以参考[这里](https://modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E5%AF%BC%E5%87%BA)。


### 文本生成任务模型的训练

文本生成任务的训练可以参考下文的“模型的训练”。

# 模型的训练

我们为GPT-3模型支持了续写训练与输入输出形式的训练，训练方式不需要额外指定，训练数据集仅包含 src_txt 时会进行续写训练，同时包含 src_txt 和 tgt_txt 时会进行输入输出形式的训练。以下将为两种训练方式提供示例代码。

## 续写训练
GPT-3模型的训练可以使用ModelScope提供的trainer来进行。下面的代码展示了在诗词生成数据集上进行模型训练的过程：

```python
# 基于modelscope中文gpt3底座二次开发得到诗词生成模型代码

from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.msdatasets import MsDataset
from modelscope.utils.hub import read_config
from modelscope.metainfo import Metrics, Trainers
from datasets import Dataset
from modelscope.msdatasets import MsDataset

dataset_dict = MsDataset.load('chinese-poetry-collection')
train_dataset = dataset_dict['train'].remap_columns({'text1': 'src_txt'})
eval_dataset = dataset_dict['test'].remap_columns({'text1': 'src_txt'})
print (eval_dataset)
max_epochs = 10
tmp_dir = "./gpt3_poetry"

num_warmup_steps = 100
def noam_lambda(current_step: int):
    current_step += 1
    return min(current_step ** (-0.5), current_step * num_warmup_steps ** (-1.5))

def cfg_modify_fn(cfg):
    cfg.train.lr_scheduler = {
        "type": "LambdaLR",
        "lr_lambda": noam_lambda,
        "options": {"by_epoch": False}
    }
    cfg.train.optimizer = {
        "type": "AdamW",
        "lr": 3e-4
    }
    cfg.train.dataloader = {"batch_size_per_gpu": 16, "workers_per_gpu": 1}
    return cfg

kwargs = dict(
    model='damo/nlp_gpt3_text-generation_chinese-base',
    train_dataset=train_dataset,
    eval_datase=eval_dataset,
    max_epochs=max_epochs,
    work_dir=tmp_dir,
    cfg_modify_fn=cfg_modify_fn)

# 构造 trainer 并进行训练
trainer = build_trainer(
    name=Trainers.nlp_base_trainer, default_args=kwargs)
trainer.train()
```

我们为 1.3B 及以上 size 的 GPT-3 模型支持了模型并行训练方式，下面的代码展示了基于 GPT-3 2.7B 的多卡模型并行训练的过程：

```python
# finetune_poetry.py
from torch.utils.tensorboard import SummaryWriter
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.metainfo import Trainers


dataset_dict = MsDataset.load('chinese-poetry-collection')
train_dataset = dataset_dict['train'].remap_columns(
    {'text1': 'src_txt'})
eval_dataset = dataset_dict['test'].remap_columns({'text1': 'src_txt'})
max_epochs = 10
tmp_dir = './gpt3_poetry'

num_warmup_steps = 100

def noam_lambda(current_step: int):
    current_step += 1
    return min(current_step**(-0.5),
               current_step * num_warmup_steps**(-1.5))

def cfg_modify_fn(cfg):
    cfg.train.lr_scheduler = {
        'type': 'LambdaLR',
        'lr_lambda': noam_lambda,
        'options': {
            'by_epoch': False
        }
    }
    cfg.train.optimizer = {'type': 'AdamW', 'lr': 3e-4}
    cfg.train.dataloader = {
        'batch_size_per_gpu': 8,
        'workers_per_gpu': 1
    }
    cfg.train.hooks.append({
        'type': 'MegatronHook'
    })
    cfg.evaluation.dataloader = {
        'batch_size_per_gpu': 8,
        'workers_per_gpu': 1
    }
    cfg.evaluation.metrics = 'ppl'
    cfg.model.checkpoint_model_parallel_size = 1
    return cfg

kwargs = dict(
    model='damo/nlp_gpt3_text-generation_2.7B',
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    max_epochs=max_epochs,
    work_dir=tmp_dir,
    cfg_modify_fn=cfg_modify_fn)

# Construct trainer and train
trainer = build_trainer(
    name=Trainers.gpt3_trainer, default_args=kwargs)
trainer.train()
```

我们推荐使用 torchrun 拉起训练，例如使用以下命令：

```shell
# N 为模型并行度
torchrun --nproc_per_node $N finetune_poetry.py
```

目前对于GPT3 1.3B/2.7B 两个模型我们在训练阶段支持了运行时的模型自动拆分功能，设置好并行进程数即可自动运行相应模型并行度的训练。

## 输入输出形式训练

下面是基于GPT-3中文2.7B模型在Dureader问题生成数据集上二次开发训练的示例代码：
```python
# finetune_dureader.py
from torch.utils.tensorboard import SummaryWriter
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.metainfo import Trainers


dataset_dict = MsDataset.load('DuReader_robust-QG')

train_dataset = dataset_dict['train'].remap_columns({'text1': 'src_txt', 'text2': 'tgt_txt'}) \
    .map(lambda example: {'src_txt': example['src_txt'].replace('[SEP]', '<sep>') + '\n'})
eval_dataset = dataset_dict['validation'].remap_columns({'text1': 'src_txt', 'text2': 'tgt_txt'}) \
    .map(lambda example: {'src_txt': example['src_txt'].replace('[SEP]', '<sep>') + '\n'})

max_epochs = 10

tmp_dir = './gpt3_dureader'

num_warmup_steps = 200

def noam_lambda(current_step: int):
    current_step += 1
    return min(current_step**(-0.5),
               current_step * num_warmup_steps**(-1.5))

def cfg_modify_fn(cfg):
    cfg.train.lr_scheduler = {
        'type': 'LambdaLR',
        'lr_lambda': noam_lambda,
        'options': {
            'by_epoch': False
        }
    }
    cfg.train.optimizer = {'type': 'AdamW', 'lr': 1e-4}
    cfg.train.dataloader = {
        'batch_size_per_gpu': 4,
        'workers_per_gpu': 1
    }
    cfg.train.hooks.append({
        'type': 'MegatronHook'
    })
    cfg.preprocessor.sequence_length = 512
    cfg.model.checkpoint_model_parallel_size = 1
    return cfg

kwargs = dict(
    model='damo/nlp_gpt3_text-generation_2.7B',
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    max_epochs=max_epochs,
    work_dir=tmp_dir,
    cfg_modify_fn=cfg_modify_fn)

trainer = build_trainer(
    name=Trainers.gpt3_trainer, default_args=kwargs)
trainer.train()
```

同上，推荐使用 torchrun 拉起训练：

```shell
# N 为模型并行度
torchrun --nproc_per_node $N finetune_dureader.py
```

可以基于ModelScope中提供的checkpoint在用户自有的数据集上做继续训练，或是重新输出化参数进行训练。训练后在work_dir中会存储训练过程文件（用于断点继续训练）和推理文件（用于上传modelhub或推理、导出等场景）。
训练的具体细节和产出文件的使用请参考[模型的训练文档](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E8%AE%AD%E7%BB%83Train)。
