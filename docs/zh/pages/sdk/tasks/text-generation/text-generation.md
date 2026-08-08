<!-- modelscope-docs: 文本生成任务 | sdk/tasks/text-generation/text-generation_CN.md -->

# 文本生成任务

文本生成任务(text-generation)是将输入文本转换为张量并输入模型后，生成可读的文字表述的过程。
文本生成任务可以解决例如文本续写，文章摘要等具体问题，以下列出了ModelHub中文本生成模型的下游任务应用：

- [文本续写](https://modelscope.cn/models/damo/nlp_gpt3_text-generation_13B/summary)：通过给出文本提示(prompt)，续写生成后续内容
- [理解生成联合模型](https://modelscope.cn/models/damo/nlp_plug_text-generation_27B/summary)：可直接用于文本生成，也可以通过finetune用于各类文本理解的任务
- [摘要生成](https://modelscope.cn/models/damo/nlp_palm2.0_text-generation_chinese-base/summary)：给出输入文本，生成其内容摘要
- [零样本学习模型](https://modelscope.cn/models/ClueAI/PromptCLUE/summary)：以自定义标签体系；针对多种生成任务，可以进行采样自由生成
- [商品文案生成](https://modelscope.cn/models/damo/nlp_palm2.0_text-generation_commodity_chinese-base/summary)：给定商品和一些卖点词，生成和卖点相关的商品文案描述。
- 其他问题：模型经过训练，根据用户的输入文本，输入用户期望的内容

## 文本生成任务的推理

ModelScope框架的推理能力依赖于pipeline模块实现，有关推理的基本使用方法，请参考[模型的推理](../模型推理Pipeline.md)。
以文本生成任务来说，您可以这样使用：
```python
from modelscope.pipelines import pipeline
input = '昨天起，上海地铁3号线长江南路站、殷高西路站、江湾镇站三站进一步限流。体验发现，高峰时段排队5分钟能进站；不少乘客选择提前起床，“现在提前10到20分钟起床，即便限流也不会影响上班”。被限流的XDJMS，你们提前多久？新民网'
text_summary = pipeline('text-generation', model='damo/nlp_palm2.0_text-generation_chinese-base')
text_summary(input)
```

下面我们给出文本生成任务的Pipeline以及支持的参数。

### TextGenerationPipeline

该Pipeline会调用TextGenerationPreprocessorBase预处理器的子类或DuckType类进行预处理，并输入给模型进行前向推理。
在pipeline一次生成中会多次进行前向推理，生成token组成的输出sequences，在Pipeline的后处理中转换可读的文本内容。

#### 构造参数

```text
model:  模型id、模型本地路径或模型的实例。
preprocessor: 模型对应的预处理器。如果不传，pipeline会自动使用下载后的模型本地路径中的配置文件进行构造。如果传入模型是一个实例（比如torch.nn.Module类），请保证模型中含有`model_dir`属性，其内容为包含有配置文件的本地路径以便构造一个预处理器。
kwargs: 您可以在这里传入任何需要传给预处理器构造方法的参数。`sequence_length`值为128。
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

##### 模型返回值

**forward**
```text
返回为dict类型或ModelScope官方定义的`TextGenerationModelOutput`类型及其子类
需要的字段：
logits: 对应词汇表的模型输出logits，shape为(batch_size, vocab_size)
```

**generate**
```text
返回为dict类型或ModelScope官方定义的`TokenGeneratorOutput`类型及其子类
需要的字段：
sequences: 模型生成的token序列，shape为(batch_size, sequence_length)
```

##### 预处理器要求
```text
符合文本生成预处理器基类`TextGenerationPreprocessorBase`构造及方法要求的任何子类或其Duck Type类。
```

## 文本生成任务的预处理器

文本生成任务预处理器的基类是`TextGenerationPreprocessorBase`。

当用户使用文本生成任务的预处理器时，通用的参数（即：该基类的构造参数）有：
```text
model_dir：模型本地路径，包含有label_mapping.json用以解析label2id mapping，如果label2id经参数传递，model_dir可以为空。
src_txt：训练时数据dict中对应输入文本的key
tgt_txt：训练时数据dict中对应输出文本的key
mode：预处理器工作的模式，包含`train`，`eval`, `inference`三个可用值，默认为`inference`。可用于__call__中执行不同逻辑。
```

子类必须实现的方法有：

- __call__或_tokenize_text中任意一个，__call__是实际预处理的过程

__call__方法的定义是：
```text
def __call__(self, data: Union[str, Tuple, Dict], **kwargs) -> Dict[str, Any]:
    ...
```

_tokenize_text会在__call__中被调用，其定义是：
```text
def _tokenize_text(self, sequence1, sequence2=None, **kwargs):
    ...
```

默认的__call__方法的流程是：
```text
1. call方法默认从输入data中解析出输入文本和输出文本，解析方法为：
如果输入是str，当成句子1处理。
如果输入为dict：根据构造方法的src_txt，tgt_txt分别解析。
2. 解析完成后调用_tokenize_text进行embedding，用户也可以仅覆盖_tokenize_text来执行特定tokenize过程。
3. 为适配torch_default_collator，将List类型tensor转换为numpy.ndarray类型tensor
```

任何文本生成任务的训练和推理均可使用基类中定义的方法，并在适当场合可以使用具体子类提供的额外方法。

### TextGenerationTransformersPreprocessor

该类是基于Transformers的Tokenizer实现的文本分类任务预处理器。可以适配于任何通用的Transformers codebase模型，如PALM, PLUG等

在支持基类方法的基础上，该类支持额外构造参数：
```text
use_fast：使用fast或slow版本的tokenizer。如果没有传递该值，会尝试从model_dir中的tokenizer_config.json文件中解析该值，如果均不存在，则默认使用slow版本的tokenizer。
kwargs：任何transformers的tokenizer支持的运行参数均可以通过这里传递，如常用的max_length、padding等。默认max_length会赋值为128， padding为'max_length'
```

该类覆盖了_tokenize_text方法，用户在__call__阶段传入的kwargs会被传递过来，并合并覆盖构造时的kwargs来进行tokenizing。

该类在mode为`inference`时返回torch tensor，在`train`或`eval`时返回numpy tensor以便trainer将一个minibatch转为torch tensor。

```python
from modelscope.preprocessors.nlp import TextGenerationTransformersPreprocessor
from modelscope.utils.hub import snapshot_download

model_dir = snapshot_download('damo/nlp_palm2.0_text-generation_chinese-base')
preprocessor = TextGenerationTransformersPreprocessor(
    model_dir=model_dir,
    padding=True,
    max_length=256,
)

# Cover `padding` in the init method.
print(preprocessor('test word', padding=False))
# {'input_ids': tensor([[  101, 10060,  8681,   102]]), 'token_type_ids': tensor([[0, 0, 0, 0]]), 'attention_mask': tensor([[1, 1, 1, 1]])}
```

## 任务的模型列表

[PLAM文本生成（PalmForTextGeneration）](https://www.modelscope.cn/models/damo/nlp_palm2.0_text-generation_chinese-large/summary)

[GPT-3文本生成（GPT3ForTextGeneration）](https://www.modelscope.cn/models/damo/nlp_gpt3_text-generation_1.3B/summary)

您可以通过[ModelHub](https://modelscope.cn/models)来搜索所有支持此任务的具体模型。


## 任务的数据集列表

以下列举Finetune时常用的数据集：

[商品文案描述生成](https://modelscope.cn/datasets/lcl193798/product_description_generation/summary)

[DuReader问题生成](https://modelscope.cn/datasets/modelscope/DuReader_robust-QG/summary)

[中文诗词数据集](https://modelscope.cn/datasets/modelscope/chinese-poetry-collection/summary)

[对联生成](https://modelscope.cn/datasets/lcl193798/couplet_generation/summary)

您可以通过[DataHub](https://modelscope.cn/datasets)来搜索所有支持此任务的数据集。

## 训练任务最佳实践

文本生成任务的训练可以使用ModelScope Library提供的TextGenerationTrainer进行，如果您需要查看训练的基本过程，请查看[模型的训练文档](../模型的训练.md)。

### 加载一个数据集

以DuReader问题生成数据集为例，以下加载此数据集：

```text
from modelscope.msdatasets import MsDataset
dataset = MsDataset.load('DuReader_robust-QG')
```

DuReader数据集属于下游question generation问题生成类任务，可以用于训练问题生成模型，用于下游的FAQ挖掘等场景。

### 配置预处理器

数据集可以在trainer调用之前由用户代码预处理，也可以将预处理器配置写入配置文件，并在trainer中自动进行预处理。trainer预处理的时机在train_loop或evaluation_loop对dataloader进行取值时。

用户代码预处理的逻辑在此不列举，用户可以使用自定义的任何流程对数据进行embedding等操作，需要注意的是如果外部进行了预处理，请保证配置文件中的预处理字段为None。

下面以`TextGenerationTransformersPreprocessor`为例配置预处理器信息。

在TextGenerationTrainer提供的cfg_modify_fn中进行如下修改：

```text
cfg.preprocessor = {
  'train': {
      # 配置预处理器名字
      'type': 'text-gen-tokenizer',
      # 配置src_txt的key
      'src_txt': 'text1',
      # 配置tgt_txt的key
      'tgt_txt': 'text2',
      # 配置mode
      'mode': 'train',
  },
  'val': {
      # 配置预处理器名字
      'type': 'text-gen-tokenizer',
      # 同上
      'src_txt': 'text1',
      'tgt_txt': 'text2',
      'mode': 'eval',
  }
}
```

### 配置训练信息

模型的训练信息一般在ModelHub中提供的模型配置文件中存在（但如max_epochs需要填充值），在这里我们假设该配置不存在，从0给出一个合理配置：

```text
# 将模型需要的label数量传进去
cfg['train'] = {
    "work_dir": "/tmp",
    "max_epochs": 10,
    "dataloader": {
        # batch_size
        "batch_size_per_gpu": 16,
        "workers_per_gpu": 0
    },
    "optimizer": {
        # optimizer信息
        "type": "SGD",
        "lr": 0.01,
        "options": {
            "grad_clip": {
                "max_norm": 2.0
            }
        }
    },
    "lr_scheduler": {
        #lr_scheduler信息，注意torch版本是否包含该lr_scheduler
        "type": "StepLR",
        "step_size": 2,
        "options": {
            "warmup": {
                "type": "LinearWarmup",
                "warmup_iters": 2
            }
        }
    },
    "hooks": [{
        "type": "CheckpointHook",
        "interval": 200,
        "by_epoch": False,
    }, {
        "type": "EvaluationHook",
        "interval": 200,
        "by_epoch": False,
    }]
 }
```

### 配置验证信息

同训练字段相同，我们假设配置文件中没有evaluation信息，从0给出可用的验证信息：

```text
cfg['evaluation'] = {
    "dataloader": {
        # batch_size
        "batch_size_per_gpu": 16,
        "workers_per_gpu": 0,
        "shuffle": false
    },
    "metrics": [{
        "type": "text-gen-metric",
        "target_text": "tgts",
        "pred_text": "preds",
    }]
 }
```


ModelScope提供了文本生成任务标准使用的[Metrics](../详细教程/模型的评估.md)：TextGenerationMetric，即上面配置中修改的metrics.type字段的名字。
该Metric可以返回Rouge-1、Rouge-L、BLEU-1、BLEU-4的指标值。如果需要自定义评测过程，请参考Metrics链接中的具体构造方法。

### 一个完整的例子

```python
import os

from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer


def cfg_modify_fn(cfg):
    cfg.preprocessor = {
        'train': {
            # 配置预处理器名字
            'type': 'text-gen-tokenizer',
            # 配置src_txt的key
            'src_txt': 'text1',
            # 配置tgt_txt的key
            'tgt_txt': 'text2',
            # 配置mode
            'mode': 'train',
        },
        'val': {
            # 配置预处理器名字
            'type': 'text-gen-tokenizer',
            # 同上
            'src_txt': 'text1',
            'tgt_txt': 'text2',
            'mode': 'eval',
        }
    }
    cfg['train'] = {
        "work_dir": "/tmp",
        "max_epochs": 10,
        "dataloader": {
            # batch_size
            "batch_size_per_gpu": 16,
            "workers_per_gpu": 0
        },
        "optimizer": {
            # optimizer信息
            "type": "SGD",
            "lr": 0.01,
            "options": {
                "grad_clip": {
                    "max_norm": 2.0
                }
            }
        },
        "lr_scheduler": {
            # lr_scheduler信息，注意torch版本是否包含该lr_scheduler
            "type": "StepLR",
            "step_size": 2,
            "options": {
                "warmup": {
                    "type": "LinearWarmup",
                    "warmup_iters": 2
                }
            }
        },
        "hooks": [{
            "type": "CheckpointHook",
            "interval": 1,
            "by_epoch": False,
        }, {
            "type": "EvaluationHook",
            "interval": 1,
            "by_epoch": False,
        }]
    }
    cfg['evaluation'] = {
        "dataloader": {
            # batch_size
            "batch_size_per_gpu": 16,
            "workers_per_gpu": 0,
            "shuffle": False
        },
        "metrics": [{
            "type": "text-gen-metric",
            "target_text": "tgts",
            "pred_text": "preds",
        }]
    }
    return cfg


dataset = MsDataset.load('DuReader_robust-QG')

kwargs = dict(
    model='damo/nlp_palm2.0_pretrained_chinese-base',
    train_dataset=dataset['train'],
    eval_dataset=dataset['validation'],
    cfg_modify_fn=cfg_modify_fn)

os.environ['LOCAL_RANK'] = '0'
trainer = build_trainer(name='text-generation-trainer', default_args=kwargs)
trainer.train()
```

Trainer也支持继续训练、保存最佳指标的模型等功能，具体请参考[模型的训练文档](../模型的训练.md)。
