<!-- modelscope-docs: 文本分类任务 | sdk/tasks/text-classification/text-classification_CN.md -->

# 文本分类任务

文本分类任务是将单个文本、文本对转换为张量并输入模型后，转换为具有最大概率的已知标签的过程。
文本分类任务可以解决例如情感分析、句子相似度等具体问题，ModelHub中文本分类模型具体可以解决的问题有：

- 情感分析(sentiment-classification)：给出一个句子，判断该句子属于负向情感，正向情感或者中立
- 句子相似度(sentence-similarity)：给出两个句子，判断两个句子是否相似
- 自然语言推理(nli)：给出两个句子，判断这两个句子是逻辑无关、逻辑蕴含或者逻辑矛盾
- 其他问题：模型经过训练，将用户的输入句子分类为用户指定的标签中的一个

## 文本分类任务的推理

ModelScope框架的推理能力依赖于pipeline模块实现，有关推理的基本使用方法，请参考[模型的推理](../模型推理Pipeline.md)。
以文本分类任务来说，您可以这样使用：
```python
from modelscope.pipelines import pipeline
pipeline_ins = pipeline(task='nli', model='damo/nlp_structbert_nli_chinese-base')
pipeline_ins(input=('四川商务职业学院和四川财经职业学院哪个好？', '四川商务职业学院商务管理在哪个校区？'))
```

下面我们给出文本分类任务的Pipeline以及支持的参数。

### TextClassificationPipeline

该Pipeline会调用TextClassificationPreprocessorBase预处理器的子类或DuckType类进行预处理，并输入给模型进行前向推理。
模型输出的logits会在Pipeline的后处理中转换为概率最大的id再转换为原始label。后处理过程需要预处理器提供的id2label信息，如果该信息缺失会返回原始的id值。

#### 构造参数

```text
model:  模型id、模型本地路径或模型的实例。
preprocessor: 模型对应的预处理器。如果不传，pipeline会自动使用下载后的模型本地路径中的配置文件进行构造。如果传入模型是一个实例（比如torch.nn.Module类），请保证模型中含有`model_dir`属性，其内容为包含有配置文件的本地路径以便构造一个预处理器。
kwargs: 您可以在这里传入任何需要传给预处理器构造方法的参数。 默认情况下first_sequence的值为`first_sequence`， second_sequence值为`None`，`sequence_length`值为512。
其他参数：任何Pipeline基类的参数都支持传递。
```

#### 输入格式

```text
str: 单个句子。
tuple: 两个句子构成的句子对。
dict: 包含有两个句子的key-value对，其中value值为句子的内容，key的内容对应于TextClassificationPreprocessor预处理器的`first_sequence`入参和`second_sequence`入参。
```

#### 输出格式

```text
输入为dict，其中的key有：
scores: 各标签的概率值List，最大概率值在前。
labels: 各标签的实际值List，顺序与scores相同。
```

#### Batch推理的支持

目前ModelScope官方已适配该Pipeline的模型均支持forward批量推理，请查看`任务的模型列表`章节。

#### 模型适配要求

##### 模型返回值
```text
返回为dict类型或ModelScope官方定义的`TextClassificationModelOutput`类型及其子类
需要的字段：
logits: 对应每个label的模型输出logits，shape为(batch_size, n_labels)
```

##### 预处理器要求
```text
符合文本分类预处理器基类`TextClassificationPreprocessorBase`构造及方法要求的任何子类或其Duck Type类。
```

## 文本分类任务的预处理器

文本分类任务预处理器的基类是`TextClassificationPreprocessorBase`。

当用户使用文本分类任务的预处理器时，通用的参数（即：该基类的构造参数）有：
```text
model_dir：模型本地路径，包含有label_mapping.json用以解析label2id mapping，如果label2id经参数传递，model_dir可以为空。
first_sequence：第一个句子的key，如果输入为str或tuple该参数不生效。
second_sequence：第二个句子的key，如果输入为str或tuple该参数不生效。
label：标签列的key，如果输入为tuple该参数不生效。
label2id：可选的label2id mapping，如果不传入请保证model_dir有值并包含label2id信息。
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
1. call方法默认从输入data中解析出句子1，句子2和label，解析方法为：
如果输入是str，当成句子1处理。
如果输入为tuple：
如果长度为3分别被解析为句子1、句子2、label
如果长度为2，则区分mode，推理时解析为句子1和句子2，训练时解析为句子1和label
如果输入为dict：根据构造方法的first_sequence、second_sequence、label分别解析。
2. 解析完成后调用_tokenize_text进行embedding，用户也可以仅覆盖_tokenize_text来执行特定tokenize过程。
3. 为适配torch_default_collator，将List类型tensor转换为numpy.ndarray类型tensor
4. 将label列根据label2id映射为id
```

- id2label：property，可选

id2label用于pipeline后处理时，将logits转成的id转为实际label的过程。基类默认会使用构造中label2id反向索引构造。如果该值不存在并且在子类中没有复写，返回None


任何文本分类任务的训练和推理均可使用基类中定义的方法，并在适当场合可以使用具体子类提供的额外方法。

### TextClassificationTransformersPreprocessor

该类是基于Transformers的Tokenizer实现的文本分类任务预处理器。可以适配于任何通用的Transformers codebase模型，如BERT,StructBERT。

在支持基类方法的基础上，该类支持额外构造参数：
```text
use_fast：使用fast或slow版本的tokenizer。如果没有传递该值，会尝试从model_dir中的tokenizer_config.json文件中解析该值，如果均不存在，则默认使用slow版本的tokenizer。
kwargs：任何transformers的tokenizer支持的运行参数均可以通过这里传递，如常用的max_length、padding等。默认max_length会赋值为128， padding为'max_length'
```

该类覆盖了_tokenize_text方法，用户在__call__阶段传入的kwargs会被传递过来，并合并覆盖构造时的kwargs来进行tokenizing。

该类在mode为`inference`时返回torch tensor，在`train`或`eval`时返回numpy tensor以便trainer将一个minibatch转为torch tensor。

```python
from modelscope.preprocessors.nlp import TextClassificationTransformersPreprocessor
from modelscope.utils.hub import snapshot_download

model_dir = snapshot_download('damo/nlp_structbert_nli_chinese-base')
preprocessor = TextClassificationTransformersPreprocessor(
    model_dir=model_dir,
    padding=True,
    max_length=256,
)

# Cover `padding` in the init method.
print(preprocessor('test word', padding=False))
# {'input_ids': tensor([[  101, 10060,  8681,   102]]), 'token_type_ids': tensor([[0, 0, 0, 0]]), 'attention_mask': tensor([[1, 1, 1, 1]])}
```

## 任务的模型列表

文本分类BERT（BertForSequenceClassification）

文本分类StructBERT（SbertForSequenceClassification）

您可以通过[ModelHub](https://modelscope.cn/models)来搜索所有支持此任务的具体模型。


## 任务的数据集列表

以下列举Finetune时常用的数据集：

[CLUE](https://modelscope.cn/datasets/modelscope/clue/summary)

[GLUE](https://modelscope.cn/datasets/modelscope/glue/summary)

[SUPER_GLUE](https://modelscope.cn/datasets/modelscope/super_glue/summary)

您可以通过[DataHub](https://modelscope.cn/datasets)来搜索所有支持此任务的数据集。

## 训练任务最佳实践

文本分类任务的训练可以使用ModelScope Library提供的EpochBasedTrainer进行，如果您需要查看训练的基本过程，请查看[模型的训练文档](../模型的训练.md)。

### 加载一个数据集

以clue为例，以下加载它的子数据集tnews：

```text
dataset = MsDataset.load('clue', subset_name='tnews')
```

tnews是一个15分类的数据集, 其目的是预测输入句子属于哪种新闻类型。

### 配置预处理器

数据集可以在trainer调用之前由用户代码预处理，也可以将预处理器配置写入配置文件，并在trainer中自动进行预处理。trainer预处理的时机在train_loop或evaluation_loop对dataloader进行取值时。

用户代码预处理的逻辑在此不列举，用户可以使用自定义的任何流程对数据进行embedding等操作，需要注意的是如果外部进行了预处理，请保证配置文件中的预处理字段为None。

下面以`TextClassificationTransformersPreprocessor`为例配置预处理器信息。

在EpochBasedTrainer提供的cfg_modify_fn中进行如下修改：

```text
# 由于tnews label默认为int型实际id，因此无需传入label2id
cfg.preprocessor = {
  'train': {
      # 配置预处理器名字
      'type': 'sen-cls-tokenizer',
      # 配置句子1的key
      'first_sequence': 'sentence',
      # 配置label
      'label': 'label',
      # 配置mode
      'mode': 'train',
  },
  'val': {
      # 配置预处理器名字
      'type': 'sen-cls-tokenizer',
      # 配置句子1的key
      'first_sequence': 'sentence',
      # 配置label
      'label': 'label',
      'mode': 'eval',
  }
}
```

### 配置模型

您可以直接将模型id或本地路径传入trainer的构造参数中，并在cfg_modify_fn中修改模型参数：

```text
# 将模型需要的label数量传进去
cfg.model['num_labels'] = 15
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
        "type": "seq-cls-metric",
        "label_name": "labels",
        "logit_name": "logits",
      }]
 }
```


ModelScope提供了文本分类任务标准使用的[Metrics](../详细教程/模型的评估.md)：SequenceClassificationMetric，即上面配置中修改的metrics.type字段的名字。
该Metric可以返回Accuracy和F1值。如果需要自定义评测过程，请参考Metrics链接中的具体构造方法。

### 额外配置的信息

一般来说，如果使用backbone进行训练需要指定task字段；如果需要后续推理使用，需要指定Pipeline名称：
```text
cfg.task = 'text-classification'
# 花括号内也支持填入其他pipeline需要的构造信息
cfg.pipeline = {'type': 'text-classification'}
```

### 一个完整的例子

```python
import os

from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer


def cfg_modify_fn(cfg):
    cfg.task = 'text-classification'
    cfg.pipeline = {'type': 'text-classification'}
    cfg.preprocessor = {
        'train': {
            # 配置预处理器名字
            'type': 'sen-cls-tokenizer',
            # 配置句子1的key
            'first_sequence': 'sentence',
            # 配置label
            'label': 'label',
            # 配置mode
            'mode': 'train',
        },
        'val': {
            # 配置预处理器名字
            'type': 'sen-cls-tokenizer',
            # 配置句子1的key
            'first_sequence': 'sentence',
            # 配置label
            'label': 'label',
            'mode': 'eval',
        }
    }
    cfg.model['num_labels'] = 15
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
            "type": "seq-cls-metric",
            "label_name": "labels",
            "logit_name": "logits",
        }]
    }
    return cfg


dataset = MsDataset.load('clue', subset_name='tnews')

kwargs = dict(
    model='damo/nlp_structbert_backbone_base_std',
    train_dataset=dataset['train'],
    eval_dataset=dataset['validation'],
    cfg_modify_fn=cfg_modify_fn)

os.environ['LOCAL_RANK'] = '0'
trainer = build_trainer(name='trainer', default_args=kwargs)
trainer.train()
```

Trainer也支持继续训练、保存最佳指标的模型、训练后验证等功能，具体请参考[模型的训练文档](../模型的训练.md)。







