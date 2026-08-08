<!-- modelscope-docs: 序列标注任务 | sdk/tasks/token-classification/token-classification_CN.md -->

# 序列标注任务

序列标注类型（Token classificaiton or Sequecne Labeling）的任务是将一条文本中的信息进行逐字或者逐词的标注，任务最终会把模型生成的张量转化为与句子等长的序列标注信息。
一般序列标注任务包括很多二级任务，如：命名实体识别、分词、词性标注等， ModelHub中该类型的任务有如下几个

- 命名实体识别(named-entity-recognition)：识别出来句子中有用的实体信息，如地名，公司名等信息
- 分词(word-segmentation)：针对中文、东南亚语种的任务，能够把有意义的词组进行拆分。
- 词性标注(part-of-speech)：针对中文、东南亚语种的任务，能够把有意义的词组进行拆分,并返回个词组在句子中的位置以及词性
- 其他问题：模型经过训练，利用用户的输入句子生成一个与句子等长的标注序列。

## 序列标注任务的推理

ModelScope框架的推理能力依赖于pipeline模块实现，有关推理的基本使用方法，请参考[模型的推理](../模型推理Pipeline.md)。
以词性标注任务来说，您可以这样使用：
```python
from modelscope.pipelines import pipeline
pipeline_ins = pipeline(task='part-of-speech', model='damo/nlp_structbert_part-of-speech_chinese-lite')
pipeline_ins(input='今天天气不错，适合出去游玩')
```

下面我们给出序列标注任务的Pipeline以及支持的参数。

### TokenClassificationPipeline

该Pipeline会调用TokenClassificationPreprocessorBase预处理器的子类或DuckType类进行预处理，并输入给模型进行前向推理。
模型输出的logits会在Pipeline的后处理中转换词语级别的概率，并根据词语的位置信息打上label。后处理过程需要预处理器提供的id2label信息，如果该信息缺失会返回原始的id值。

#### 构造参数

```text
model:  模型id、模型本地路径或模型的实例。
preprocessor: 模型对应的预处理器。如果不传，pipeline会自动使用下载后的模型本地路径中的配置文件进行构造。如果传入模型是一个实例（比如torch.nn.Module类），请保证模型中含有`model_dir`属性，其内容为包含有配置文件的本地路径以便构造一个预处理器。
kwargs: 您可以在这里传入任何需要传给预处理器构造方法的参数。 默认情况下first_sequence的值为`first_sequence`， second_sequence值为`None`，`sequence_length`值为512
其他参数：任何Pipeline基类的参数都支持传递。
```

#### 输入格式

```text
str: 单个句子。
tuple: 单个句子。
dict: 包含有单个句子的key-value对，其中value值为句子的内容，key的内容对应于TokenClassificationPreprocessor预处理器的`first_sequence`入参
```

#### 输出格式

对于命名实体识别和词性标注来说，为了体现对于词组的属性识别，有如下输出
```text
输出的为dict，其中‘output’对应的value为结果是list，list的每个item为一个词对应的信息
{
   "output": [
     {"type": "LOC", "start": 2, "end": 5, "span": "温岭市"},
     {"type": "LOC", "start": 5, "end": 8, "span": "新河镇"}
   ]
}
type: 为词组的属性，词性等信息
start： 为词组在句子中的起始位置
end: 为词组在句子中的结束位置
span： 为当前词组
```

对于分词来说，只需要提取出来句子中有意义的词被分隔出来，因此有如下输出
```text
输出的为dict，其中‘output’对应的value为结果是list，list的句子被分隔出来的词
{
   "output": ["今天", "天气", "不错", "，", "适合", "出去", "游玩"]
}
```

#### Batch推理的支持

目前ModelScope官方已适配该Pipeline的模型均支持forward批量推理，请查看`任务的模型列表`。

#### 模型适配要求

##### 模型返回值
```text
返回为dict类型或ModelScope官方定义的`TokenClassificationModelOutput`类型及其子类
需要的字段：
logits: 对应每个label的模型输出logits，shape为(batch_size, n_labels)
offset_mapping: 对应的为句子中从预处理器出来后各个词组的位置信息开区间信息如[(0,1),(1，2),...]，shape为(batch_size, sequence_length)。值的注意的是如果词组区间长度不及句子长度，后面后被填充（0，0）直到sequence length长度。
predictions：计算logits中对应的最大值的indice，利用这个indice可以通过id2label查到对应的label
，shape为(batch_size, n_labels)
```

##### 预处理器要求
```text
符合序列标注预处理器基类`TokenClassificationPreprocessorBase`构造及方法要求的任何子类或其Duck Type类。
```

## 序列标注任务的预处理器

序列标注任务预处理器的基类是`TokenClassificationPreprocessorBase`。

### 构造参数

当用户使用序列标注任务的预处理器时，通用的参数（即：该基类的构造参数）

- *model_dir*：模型本地路径，包含有label_mapping.json用以解析label2id mapping，如果label2id经参数传递，model_dir可以为空。
first_sequence：第一个句子的key，如果输入为str或tuple该参数不生效。
- *label*：标签列的key，如果输入为tuple该参数不生效。
- *label2id*：可选的label2id mapping，如果不传入请保证model_dir有值并包含label2id信息。
- *label_all_tokens*: 如果数据集中包含label，预处理器会去为tokens打label，如果该值设置为`true`，则所有非起始token会被label为 `I-XXX`, 否则会被填充 -100，默认为`false`
- *mode*：预处理器工作的模式，包含`train`，`eval`, `inference`三个可用值，默认为`inference`。可用于__call__中执行不同逻辑。


### 预处理器的方法

子类必须实现的方法
-  **__call__或 _tokenize_text** 中任意一个，__call__是实际预处理的过程

__call__方法的定义是：
```text
def __call__(self, data: Union[str, Tuple, Dict], **kwargs) -> Dict[str, Any]:
    ...
```

_tokenize_text会在__call__中被调用，其定义是：
```text
def _tokenize_text(self, sequence1, **kwargs):
    ...
```

默认的__call__方法的流程是：

1. call方法默认从输入data中解析出sentence1和label，解析方法为：
   * 如果输入是str，当成句子1处理。
   * 如果输入为tuple：
     * 如果长度为3分别被解析为句子1、_、label
     * 如果长度为2，则区分mode，推理时解析为句子1和_，训练时解析为句子1和label
   * 如果输入为dict：根据构造方法的first_sequence、label分别解析。
2. 解析完成后调用_tokenize_text进行embedding，用户也可以仅覆盖_tokenize_text来执行特定tokenize过程。
3. 为适配torch_default_collator，将List类型tensor转换为numpy.ndarray类型tensor
4. 将label列根据label2id映射为id


可选的方法
- id2label：property，

id2label用于pipeline后处理时，将logits转成的id转为实际label的过程。基类默认会使用构造中label2id反向索引构造。如果该值不存在并并且在子类中没有复写，返回None


### 序列标注任务的预处理器其他子类

任何序列标注任务的训练和推理均可使用基类中定义的方法，并在适当场合可以使用具体子类提供的额外方法。

`TokenClassificationTransformersPreprocessor`

该类是基于Transformers的Tokenizer实现的序列标注任务预处理器。可以适配于任何通用的Transformers codebase模型，如BERT,StructBERT。

在支持基类方法的基础上，该类支持额外构造参数：  
* *sequence_length*： 最大长度的文本输入长度，默认为128
* *use_fast*：使用fast或slow版本的tokenizer。如果没有传递该值，会尝试从model_dir中的tokenizer_config.json文件中解析该值，如果均不存在，则默认使用slow版本的tokenizer。  
* *kwargs*：任何transformers的tokenizer支持的运行参数均可以通过这里传递，如常用的max_length、padding等。默认max_length会赋值为128， padding为'max_length'

该类覆盖了_tokenize_text方法，用户在__call__阶段传入的kwargs会被传递过来，并合并覆盖构造时的kwargs来进行tokenizing。

该类在mode为`inference`时返回torch tensor，在`train`或`eval`时返回numpy tensor以便trainer将一个minibatch转为torch tensor。

```python
from modelscope.preprocessors.nlp import TokenClassificationTransformersPreprocessor
from modelscope.utils.hub import snapshot_download

model_dir = snapshot_download('damo/nlp_structbert_part-of-speech_chinese-lite')
preprocessor = TokenClassificationTransformersPreprocessor(
    model_dir=model_dir,
    padding=True,
    max_length=256,
)

# Cover `padding` in the init method.
print(preprocessor('test word', padding=False))
# {
#     'input_ids': tensor([[101, 162, 147, 161, 162, 100, 165, 157, 160, 146, 102]]), 
#     'attention_mask': tensor([[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]), 
#     'label_mask': tensor([[False,  True,  True,  True,  True,  True,  True,  True,  True,  True,
#          False]]), 
#     'offset_mapping': tensor([[[0, 1],
#          [1, 2],
#          [2, 3],
#          [3, 4],
#          [4, 5],
#          [5, 6],
#          [6, 7],
#          [7, 8],
#          [8, 9]]]), 
#     'text': 'test word'
# }
```

目前这个预处理器支持的预处理能力较多，具体如下：
* 针对多语言、中、英文等不同的文本输入，该基类会跟据 `is_split_into_words`这个参数进行自动判断，选择合适的预处理逻辑。这里用户可以参照三方库`tokenizer`的方式，在模型文件中上传`tokenizer_config.json` 文件，并添加`is_split_into_words`信息即可。上面提到的预处理逻辑主要包括：
  * 当`is_split_into_words` 为`true`，并且当前为推理阶段的任务，该预处理器会逐字（`word`）生成token，并根据每一个token的位置生成 `offset_mapping`，以及`lable_mask`, 文本中出现的额外空格会被当作unknown_token处理，不会被忽略，一般用于分词场景
  * 当`is_split_into_words` 为`false`，并且当 `use_fast` 为 `true`的时候，会使用第三方包`tokenizer`的fast tokenzier逻辑，一般会用于finetune以及多语言等场景。
  * 当`is_split_into_words` 为`false`，并且当 `use_fast` 为 `false`的时候，会先对文本进行处理生成token，并根据token后的结果是否包含`##`或者`_`的信息进行 `offset_map`，以及`label_mask`的生成，一般用于NER场景。

* 同时也支持了基于`lstm`模型结构的模型输入预处理，目前这一判断是自动判断，不需要用户传入额外参数。


除此之外，针对泰语，越南语的序列标注任务我们还分别提供了以下三个子类：

- `NERPreprocessorThai`：用于泰语的命名实体识别任务，构造传参以及预处理输入没有变化，仅根据泰语特性重新实现了__call__方法，其中需要依赖python 泰语三方包 *pythainlp*。
- `NERPreprocessorViet` ：用于越南语的命名实体识别任务，构造传参以及预处理输入没有变化，仅根据越南语特性重新实现了__call__方法，其中需要依赖python 越南语三方包 *pyvi*。
- `WordSegmentationPreprocessorThai`： 用于泰语的分词任务，构造传参以及预处理输入没有变化，仅根据泰语特性重新实现了__call__方法

最后，如果用户在训练分词任务，而源数据是空格分开的句子，且没有标注好的label，则可以方便地使用另一个Preprocessor来处理这个数据集：
- `WordSegmentationBlankSetToLabelPreprocessor`： 该方法可以对未标注的文本进行快速标注，从而快速开始训练任务，具体效果如下展示。

```python
from modelscope.preprocessors.nlp import WordSegmentationBlankSetToLabelPreprocessor
preprocessor = WordSegmentationBlankSetToLabelPreprocessor()
print(preprocessor('今天 天气 不错，适合 出去 游玩'))
#{'first_sequence': ['今', '天', '天', '气', '不', '错', '，', '适', '合', '出', '去', '游', '玩'], 'labels': ['B-CWS', 'E-CWS', 'B-CWS', 'E-CWS', 'B-CWS', 'I-CWS', 'I-CWS', 'I-CWS', 'E-CWS', 'B-CWS', 'E-CWS', 'B-CWS', 'E-CWS']}
```

### 序列标注任务的预处理器输入格式

由于常用的序列标注的任务较多，各种语言的结构也不尽相同，因此用户手中的文本形式也很多样。例如，已分词的list，包含空格的str。

为了到达规范和统一， modelscope的序列标注任务的预处理器统一要求传入的文本为str格式的文本，暂时不支持 list格式的输入。

## 任务的模型列表

序列标注BERT（BertForTokenClassification）

序列标注StructBERT（SbertForTokenClassification）

基于LSTM-CRF的序列标注任务 （LSTMCRF）

基于Transformer-CRF的序列标注任务 （TransformerCRF）

您可以通过[ModelHub](https://modelscope.cn/models)来搜索所有支持此任务的具体模型。


## 任务的数据集列表

以下列举Finetune时常用的数据集：

[MSRA命名实体识别数据集](https://www.modelscope.cn/datasets/damo/msra_ner/summary)

[Resume命名实体识别数据集](https://www.modelscope.cn/datasets/damo/resume_ner/summary)

[分词-中文-新闻领域数据集PKU](https://www.modelscope.cn/datasets/dingkun/chinese_word_segmentation_pku/summary)

[wnut17命名实体识别数据集](https://www.modelscope.cn/datasets/damo/wnut17_ner/summary)

您可以通过[DataHub](https://modelscope.cn/datasets)来搜索所有支持此类任务的更多数据集。注意，以上数据加载方式目前仅支持本地下载后加载使用，具体使用方法参考下面示例。

## 训练任务最佳实践

序列标注任务的训练可以使用ModelScope Library提供的EpochBasedTrainer进行，如果您需要查看训练的基本过程，请查看[模型的训练文档](../模型的训练.md)。

### 加载数据

目前 相关数据集仅支持直接下载，后续会支持在MsDataset上直接通过*dataset_id*下载. 用户可以自行在[官网的数据集](https://www.modelscope.cn/datasets)中查找词分类相关的数据集。

如在[MSRA](https://www.modelscope.cn/datasets/damo/msra_ner/files)这个面向新闻领域的中文命名实体识别数据集中，分别下载`train.txt`, 和`test.txt`到本地, 然后使用如下命令进行数据集加载。。


```py
from modelscope.msdatasets import MsDataset
local_train = 'train.txt'
local_test = 'test.txt'
dataset = MsDataset.load('text',  data_files={'train': [local_train], 'validation': [local_test]})
train_dataset=dataset['train'].to_hf_dataset()
eval_dataset=dataset['validation'].to_hf_dataset()

```


### 配置预处理器

数据集可以在trainer调用之前由用户代码预处理，也可以将预处理器配置写入配置文件，并在trainer中自动进行预处理。trainer预处理的时机在train_loop或evaluation_loop对dataloader进行取值时。

用户代码预处理的逻辑在此不列举，用户可以使用自定义的任何流程对数据进行embedding等操作，需要注意的是如果外部进行了预处理，请保证配置文件中的预处理字段为None。

下面以`TokenClassificationTransformersPreprocessor`为例配置预处理器信息。

在EpochBasedTrainer提供的cfg_modify_fn中进行如下修改：

```text
# 由于tnews label默认为int型实际id，因此无需传入label2id
cfg.preprocessor = {
  'train': {
      # 配置预处理器名字
      'type': 'token-cls-tokenizer',
      # 配置句子1的key
      'first_sequence': 'sentence',
      # 配置label
      'label': 'label',
      # 配置mode
      'mode': 'train',
  },
  'val': {
      # 配置预处理器名字
      'type': 'token-cls-tokenizer',
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
        "type": "token-cls-metric",
        "label_name": "labels",
        "logit_name": "logits",
        "return_entity_level_metrics": false
      }]
 }
```


ModelScope提供了序列标注任务标准使用的[Metrics](../详细教程/模型的评估.md)：`TokenClassificationMetric`，即上面配置中修改的metrics.type字段的名字。
该Metric可以返回`Accuracy`, `F1`, `Precision`和`Recall`值。如果需要自定义评测过程，请参考Metrics链接中的具体构造方法。

### 额外配置的信息

一般来说，如果使用backbone进行训练需要指定task字段；如果需要后续推理使用，需要指定Pipeline名称：
```text
cfg.task = 'token-classification'
# 花括号内也支持填入其他pipeline需要的构造信息
cfg.pipeline = {'type': 'token-classification'}
```

### 一个完整的例子

```python
import os
import shutil
from functools import reduce

from modelscope.metainfo import Trainers
from modelscope.trainers import build_trainer

WORK_DIR = '/tmp/test'
MAX_EPOCH = 2
os.system(
    f'curl http://sighan.cs.uchicago.edu/bakeoff2005/data/icwb2-data.zip > {WORK_DIR}/icwb2-data.zip'
)
shutil.unpack_archive(f'{WORK_DIR}/icwb2-data.zip', WORK_DIR)
from datasets import load_dataset
from modelscope.preprocessors.nlp import WordSegmentationBlankSetToLabelPreprocessor
preprocessor = WordSegmentationBlankSetToLabelPreprocessor()
dataset = load_dataset(
    'text',
    data_files=f'{WORK_DIR}/icwb2-data/training/pku_training.utf8')

def split_to_dict(examples):
    return preprocessor(examples['text'])

dataset = dataset.map(split_to_dict, batched=False)

def reducer(x, y):
    x = x.split(' ') if isinstance(x, str) else x
    y = y.split(' ') if isinstance(y, str) else y
    return x + y

label_enumerate_values = list(
    set(reduce(reducer, dataset['train'][:1000]['labels'])))
label_enumerate_values.sort()

train_len = int(len(dataset['train']) * 0.7)
train_dataset = dataset['train'].select(range(train_len))
dev_dataset = dataset['train'].select(
    range(train_len, len(dataset['train'])))

def cfg_modify_fn(cfg):
    cfg.task = 'token-classification'
    cfg['dataset'] = {
        'train': {
            'labels': label_enumerate_values,
            'first_sequence': 'tokens',
            'label': 'labels',
        }
    }
    cfg['preprocessor'] = {
        'type': 'token-cls-tokenizer',
        'padding': 'max_length'
    }
    cfg.train.max_epochs = MAX_EPOCH
    cfg.train.dataloader.workers_per_gpu = 0
    cfg.evaluation.dataloader.workers_per_gpu = 0
    cfg.train.lr_scheduler = {
        'type': 'LinearLR',
        'start_factor': 1.0,
        'end_factor': 0.0,
        'total_iters':
        int(len(train_dataset) / 32) * cfg.train.max_epochs,
        'options': {
            'by_epoch': False
        }
    }
    cfg.train.hooks = [{
        'type': 'CheckpointHook',
        'interval': 1
    }, {
        'type': 'TextLoggerHook',
        'interval': 1
    }, {
        'type': 'IterTimerHook'
    }, {
        'type': 'EvaluationHook',
        'by_epoch': False,
        'interval': 50
    }]
    return cfg

kwargs = dict(
    model='damo/nlp_structbert_backbone_base_std',
    train_dataset=train_dataset,
    eval_dataset=dev_dataset,
    work_dir=WORK_DIR,
    cfg_modify_fn=cfg_modify_fn)

os.environ['LOCAL_RANK'] = '0'
trainer = build_trainer(name=Trainers.nlp_base_trainer, default_args=kwargs)
trainer.train()

for i in range(MAX_EPOCH):
    print("evaluate path",f'{WORK_DIR}/epoch_{i+1}.pth')
    eval_results = trainer.evaluate(f'{WORK_DIR}/epoch_{i+1}.pth')
    print(f'epoch {i} evaluation result:')
    print(eval_results)
```

Trainer也支持继续训练、保存最佳指标的模型等功能，具体请参考[模型的训练文档](../模型的训练.md)。







