<!-- modelscope-docs: NLG大模型使用介绍 | sdk/tasks/nlg-models/nlg-models_CN.md -->

# NLG大模型使用介绍
NLG大模型指GPT-3系列、PLUG（270亿参数）等参数量非常大的文本生成模型。

文本生成任务(text-generation)具体文档可参考[文本生成任务](文本生成任务.md)。是将输入文本转换为张量并输入模型后，生成可读的文字表述的过程。
NLG大模型可以解决例如文本续写，文章摘要、写作、问答、对话等等具体生成问题，以下列出了ModelHub中NLG大模型：

- [多任务文本生成](https://modelscope.cn/models/damo/nlp_gpt3_text-generation_13B/summary)：通过给出文本提示(prompt)，续写生成后续内容，支持代码生成、sql语句生成、问答、写作、续写等多任务。
- [文本续写](https://modelscope.cn/models/damo/nlp_plug_text-generation_27B/summary)：可直接用于文本生成，也可以通过finetune用于各类文本理解的任务

- 其他任务：模型经过进一步finetune，根据用户的输入文本，输入用户期望的内容

## 大模型的推理

ModelScope框架的推理能力依赖于pipeline模块实现，有关推理的基本使用方法，请参考[模型的推理](模型的推理Pipeline.md)。

大模型使用特殊的大模型DistributedPipeline，在使用上与标准pipeline并无区别，在接入上的区别可参考[ModelScope模型接入](../../贡献者指南/ModelScope模型接入.md)中“DistributedPipeline介绍”章节。

1. 目前GPT-3 2.7B及以下尺寸都支持直接下载使用，以[GPT-3 1.3B模型](https://modelscope.cn/models/damo/nlp_gpt3_text-generation_1.3B/summary)为例，您可以这样使用GPT-3 1.3B模型：

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

if __name__ == '__main__':
    input = '程序员脱发用什么洗发水'
    model_id = 'damo/nlp_gpt3_text-generation_1.3B'
    pipe = pipeline(Tasks.text_generation, model=model_id)

    # 可以在 pipe 中输入 max_length, top_k, top_p, temperature 等生成参数
    print(pipe(input, max_length=512))
```

2. [PLUG(270亿参数)大模型](https://modelscope.cn/models/damo/nlp_plug_text-generation_27B/summary)通过申请下载的形式开放。运行时需要您的机器上有8卡(GPU)，每张GPU约显存大于12G。PLUG模型目前的申请通过原则是仅限个人以学术、研究目的使用，禁止分发及商用。PLUG模型运行前需要安装deepspeed：`pip install deepspeed==0.7.2`

1. 通过model_id获取默认model_dir
```
from modelscope.hub.snapshot_download import snapshot_download
model_id = 'damo/nlp_plug_text-generation_27B'
model_dir = snapshot_download(model_id)
print(model_dir)
```

2. 将模型二进制文件下载至model_dir/model，申请下载地址在[这里](https://github.com/alibaba/AliceMind/tree/main/PLUG#pre-trained-model-download) 。放置好的模型目录结构应为：
```shell
nlp_plug_text-generation_27B
    |_ config.json
    |_ configuration.json
    |_ ds_zero-offload_10B_config.json
    |_ vocab.txt
    |_ model 
        |_ mp_rank_00_model_states.pt
        |_ mp_rank_01_model_states.pt
        |_ mp_rank_02_model_states.pt
        |_ mp_rank_03_model_states.pt
        |_ mp_rank_04_model_states.pt
        |_ mp_rank_05_model_states.pt
        |_ mp_rank_06_model_states.pt
        |_ mp_rank_07_model_states.pt
```

模型调用

from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

if __name__ == '__main__':
    input = '段誉轻挥折扇，摇了摇头，说道：“你师父是你的师父，你师父可不是我的师父。"'
    model_id = 'damo/nlp_plug_text-generation_27B'
    pipe = pipeline(Tasks.text_generation, model=model_id)
    pipe.models = []

    # out_length为期望的生成长度，最大为512
    result = pipe(input, out_length=256)
    print(result)


### 大模型Pipeline

由于模型需要在多卡完成加载和多次推理，与单卡模型存在一定区别。我们提供DistributedPipeline进行大模型推理。DistributedPipeline中会进行并行环境初始化，启动多个子进程，每个子进程负责一张GPU卡上的部分模型任务。每个大模型接入 pipeline 时可继承此类实现自己的 Pipeline 类。

DistributedPipeline 的初始化过程包含了必要的 rank，进程池，同步通讯使用的 ip 及端口的配置，并在各个子进程中进行了_instantiate_one 方法的调用，_instantiate_one在子类中实现，主要为初始化对应卡上的部分模型。

NLG大模型作为文本生成任务模型，在pipeline一次生成中会多次进行前向推理，生成token组成的输出sequences，在Pipeline的后处理中转换可读的文本内容。

#### 构造参数

```text
model:  模型id或模型本地路径。需特别申明的是，由于大模型pipeline和模型实例并非一一对应关系，大模型pipeline不支持传入模型的实例进行初始化。
preprocessor: 模型对应的预处理器。如果不传，pipeline会自动使用下载后的模型本地路径中的配置文件进行构造。
kwargs: 您可以在这里传入任何需要传给预处理器构造方法的参数，以及您希望的同步通讯使用的 ip 及端口的配置参数。如果不传入将以默认值进行运行，如`master_ip`默认值为`127.0.0.1`, `master_port`的默认值为`29500`，这两个参数会被用于进行分布式初始化。
其他参数：任何Pipeline基类的参数都支持传递。
```

#### 输入格式

```text
str: 单个句子。
```

#### 输出格式

```text
输入为dict，其中的key有：
text: 模型生成的文本内容
```

#### 模型适配要求

##### 预处理器要求
```text
NLG任务，符合文本生成预处理器基类`TextGenerationPreprocessorBase`构造及方法要求的任何子类或其Duck Type类。
```

## 预处理器

NLG大模型为文本生成任务，预处理器可参考[文本生成任务](文本生成任务.md)中“文本生成任务的预处理器”章节。


## 任务的模型列表

[GPT-3文本生成（GPT3ForTextGeneration）](../../模型介绍/自然语言处理模型/gpt3/gpt3.md)

[PLUG文本生成](../../模型介绍/自然语言处理模型/plug/plug.md)


您可以通过[ModelHub](https://modelscope.cn/models)来搜索具体模型。


## 任务的数据集列表

以下列举Finetune时常用的数据集：

[商品文案描述生成](https://modelscope.cn/datasets/lcl193798/product_description_generation/summary)

[DuReader问题生成](https://modelscope.cn/datasets/modelscope/DuReader_robust-QG/summary)

[中文诗词数据集](https://modelscope.cn/datasets/modelscope/chinese-poetry-collection/summary)

[对联生成](https://modelscope.cn/datasets/lcl193798/couplet_generation/summary)

您可以通过[DataHub](https://modelscope.cn/datasets)来搜索所有支持此任务的数据集。


## 大模型finetune最佳实践
本篇将介绍如何在dureader-robust数据集上微调预训练生成模型plug，并在问题生成任务上取得不错的评估结果。

由于plug模型有270亿参数，本示例需要在单机8卡32G V100，使用`deepspeed==0.7.2`运行。下述代码无法在notebook中直接运行。 需要写成python文件如`finetune_plug.py`, 运行时需要使用deepspeed命令`deepspeed --num_gpus=8 --num_nodes=1 finetune_plug.py`整体运行。

### 载入数据
ModelScope可以提供了标准的`MsDataset`接口供用户进行基于ModelScope生态的数据源加载，也支持来自第三方库用户自定义数据集加载，如NLP领域的`datasets`库。
具体示例如下，本示例从第三方库`datasets`加载NLP领域里面的dureader-robust数据集：
```python
    # Option 1: 使用ModelScope dataset-hub上存储的原生的MsDataset
    from datasets import load_dataset
    dataset_dict = load_dataset('luozhouyang/dureader', 'robust')

    # Option 2: 为做问题生成任务，tgt_txt为待生成的目标问题，将src_txt拼接成 "答案 + [SEP] + 原文"的形式
    def concat_answer_context(dataset):
        dataset['src_txt'] = dataset['answers']['text'][0] + '[SEP]' + dataset[
            'context']
        return dataset

    train_dataset = dataset_dict['train'].map(concat_answer_context)
    eval_dataset = dataset_dict['validation'].map(concat_answer_context)

    # Option 3: 将待生成的目标问题key改为tgt_txt，删除其他信息
    train_dataset = train_dataset \
        .rename_columns({'question': 'tgt_txt'}).remove_columns('context') \
        .remove_columns('id').remove_columns('answers')
    eval_dataset = eval_dataset \
        .rename_columns({'question': 'tgt_txt'}).remove_columns('context') \
        .remove_columns('id').remove_columns('answers')

    # 第三方库datasets的使用可参考huggingface/Datasets说明：https://huggingface.co/docs/datasets/index 

```
如您使用MsDataset中的数据集，具体使用可以参考数据集的文档： [数据的处理](../../数据集/数据集介绍.md)

### 数据预处理
相同任务的训练和推理的数据预处理，可以采用相同的Preprocessor（预处理器）。用户只需要在配置文件中传入注册的preprocessor名称即可，trainer在build阶段会自动加载相应preprocessor，并根据当前mode置于 `train`或`eval`的状态。
如下面示例代码，在进行NLP文本生成下游任务`text-generation`的finetune过程，需要调用的preprocessor在configuration.json配置与推理阶段相同，会通过type='text-gen-tokenizer'构建出对应的预处理模块。
NLP的预处理输入参数的介绍可以参考[预处理模块介绍](../详细教程/数据的预处理.md)。

数据集相关的字段在NLP的预处理模块均可以接受`first_sequence`（句子1的key）、`second_sequence`（句子2的key）、`label`（标签的key）、`label2id`（label对id的mapping）几个额外参数，您可以直接将它们配置到`preprocessor`字段中。

在本示例中使用的`src_txt`即为任务`text-generation`默认的first_sequence（句子1的key），`tgt_txt`即为任务`text-generation`默认的second_sequence（句子2的key），您也可以通过参数指定key以便从数据集中读取。示例中的`sequence_length`为输入文本的最大长度，`target_max_length`为输出文本的最大长度。本示例展示的下游任务为问题生成，问题长度较短，因此`target_max_length`仅设置为`30`便足够。

```json
{
    "framework": "pytorch",
    "task": "text-generation",
    "preprocessor": {
        "type": "text-gen-tokenizer",
        "sequence_length": 384,
        "target_max_length": 30
    },
    "model": {
        "type": "plug",
        "world_size": 8,
        "model_parallel_size": 8,
        "pre_load": true,
        "distributed_backend": "nccl",
        "checkpoint_activations": true,
        "top_k": 20,
        "top_p": 0.0,
        "temperature": 0.9,
        "seed": 1234
    },
    "pipeline": {
        "type": "plug-generation"
    },
    "train": {
        ...
    } 
}

```

### 训练
由trainer相关的接口文档可以了解到，训练过程核心流程由dataset、dataloader、optimizer、lr_scheduler和hooks等组件功能组成，具体是通过在configuration.json配置文件中申明的方式注册进入trainer的流程中，具体参考：[configuration详解](../详细教程/Configuration详解.md)
#### 基础配置
在训练开始前需要配置好相应的trainer配置文件， 下面是一个完整的plug下游任务finetune的配置。
用户在实际使用过程中，如果示例无法提供帮助，可以根据自己实际训练要求，针对optimizer/lr_scheduler/hooks进行定制注册，并在配置文件中通过type字段申明相应定制方法进行使用。

```json
{
    "framework": "pytorch",
    "task": "text-generation",
    "preprocessor": {
        "type": "text-gen-tokenizer",
        "sequence_length": 384,
        "target_max_length": 30
    },
    "model": {
        "type": "plug",
        "world_size": 8,
        "model_parallel_size": 8,
        "pre_load": true,
        "distributed_backend": "nccl",
        "checkpoint_activations": true,
        "top_k": 20,
        "top_p": 0.0,
        "temperature": 0.9,
        "seed": 1234
    },
    "pipeline": {
        "type": "plug-generation"
    },
    "train": {
        "work_dir": "/tmp",
        "max_epochs": 5,
        "deepspeed": true,
        "deepspeed_config": "ds_zero-offload_10B_config.json",
        "fp16": true,
        "dataloader": {
            "batch_size_per_gpu": 32,
            "workers_per_gpu": 0
        },
        "optimizer": {
            "type": "DeepSpeedCPUAdam",
            "lr": 1e-5,
            "weight_decay": 1e-2
        },
        "lr_scheduler": {
            "decay_style": "linear",
            "warmup": 0.01,
            "type": "LinearLR",
            "options": {
                "warmup": {
                    "type": "LinearWarmup",
                    "warmup_iters": 74,
                    "warmup_ratio": 0.0
                }
            }
        },
        "hooks": [{
            "type": "DeepspeedHook"
        }, {
            "type": "CheckpointHook",
            "by_epoch": true,
            "interval": 1
        }, {
            "type": "TextLoggerHook",
            "interval": 5
        }, {
            "type": "IterTimerHook"
        }, {
            "type": "EvaluationHook",
            "interval": 1,
            "by_epoch": true
        }]
    },
    "evaluation": {
        "dataloader": {
            "batch_size_per_gpu": 1,
            "workers_per_gpu": 0,
            "shuffle": false
        }
    }
}

```

综合上述内容，可通过如下代码进行模型的finetune训练。

运行前请确保：
1. 机器环境至少为单机8卡32G V100。
2. 安装合适版本的deepspeed ：`pip3 install deepspeed==0.7.2`
3. 申请并下载plug二进制模型文件至model_dir。model_dir一般为`~/.cache/modelscope/hub/damo/nlp_plug_text-generation_27B`，您也可以通过

```python
from modelscope.hub.snapshot_download import snapshot_download
model_id = 'damo/nlp_plug_text-generation_27B'
model_dir = snapshot_download(model_id)
print(model_dir)
```

运行finetune代码：需要写成python文件如`finetune_plug.py`, 运行时需要使用deepspeed命令`deepspeed --num_gpus=8 --num_nodes=1 finetune_plug.py`整体运行。
```python
import os
import tempfile

from modelscope.metainfo import Trainers
from modelscope.trainers import build_trainer

def main():

    # 准备数据集
    from datasets import load_dataset
    dataset_dict = load_dataset('luozhouyang/dureader', 'robust')

    def concat_answer_context(dataset):
        dataset['src_txt'] = dataset['answers']['text'][0] + '[SEP]' + dataset[
            'context']
        return dataset

    train_dataset = dataset_dict['train'].map(concat_answer_context)
    eval_dataset = dataset_dict['validation'].map(concat_answer_context)

    train_dataset = train_dataset \
        .rename_columns({'question': 'tgt_txt'}).remove_columns('context') \
        .remove_columns('id').remove_columns('answers')
    eval_dataset = eval_dataset \
        .rename_columns({'question': 'tgt_txt'}).remove_columns('context') \
        .remove_columns('id').remove_columns('answers')

    # 准备work目录，用以存放log和finetune后的checkpoint文件
    tmp_dir = "plug_work_dir/rank" + os.environ['RANK']
    if not os.path.exists(tmp_dir):
        os.makedirs(tmp_dir)
    model_id = 'damo/nlp_plug_text-generation_27B'

    # 使用plug_trainer进行训练
    kwargs = dict(
        model=model_id,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        work_dir=tmp_dir)

    trainer = build_trainer(
        name=Trainers.nlp_plug_trainer, default_args=kwargs)
    trainer.train()

if __name__ == '__main__':
    main()
```
