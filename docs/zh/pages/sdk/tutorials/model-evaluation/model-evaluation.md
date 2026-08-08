<!-- modelscope-docs: 模型的评估 | sdk/tutorials/model-evaluation/model-evaluation_CN.md -->

# 指标的意义

指标用来衡量模型对数据集的效果好坏。例如Accuracy、Precision、Recall、F1、Rouge等。单一指标一般无法直接用于某类任务的评估上，因为一类任务的评价指标可能比较复杂，比如token-classification任务的评价指标融合了Accuracy、Precision、Recall、F1四种单一指标。为了方便用户针对某类任务直接进行评测，ModelScope提供了Metric任务级别的高级封装，其内部可能会调用开源框架进行单一指标评价。

# Metric模块

```py
class Metric(ABC):
    """The metric base class for computing metrics.

    The subclasses can either compute a single metric like 'accuracy', or compute the
    complex metrics for a specific task with or without other Metric subclasses.
    """

    @abstractmethod
    def add(self, outputs: Dict, inputs: Dict):
        """ Append logits and labels within an eval loop.

        Will be called after every batch finished to gather the model predictions and the labels.

        Args:
            outputs: The model prediction outputs.
            inputs: The mini batch inputs from the dataloader.

        Returns: None

        """
        pass

    @abstractmethod
    def evaluate(self):
        """Evaluate the metrics after the eval finished.

        Will be called after the whole validation finished.

        Returns: The actual metric dict with standard names.

        """
        pass
```
Metric的基类定义非常简单，仅有add和evaluate两个方法。add方法用于收集每一个mini-batch的模型输入和输出信息，并从中遴选出需要用于计算指标的信息，比如inputs中的labels字段，以及outputs中的logits字段。add方法会在每次mini-batch执行完调用，且不存在多线程问题。

evaluate方法会在整个数据集跑完之后执行，它没有输入参数，evaluate内部会对add收集的数值进行汇总和计算，并给出Dict形式的指标输出。

# ModelScope支持的Metric类

## NLP

### sequence_classification_metric
#### 方法说明

用于评估文本分类任务的结果，这个Metric会在每个mini-batch跑完后收集模型产出的logits字段和labels字段，在整体数据集评估结束时产出accuracy和F1的值，并以dict形式返回。

#### 输入格式：

```text
label_name: The key of label column in the 'inputs' arg, default 'labels'
logit_name: The key of logits column in the 'inputs' arg, default 'logits'
```

#### 返回格式：

```json
# 二分类
{"accuracy": 0.90, "f1":  0.90}
# 多分类, 其中的f1是兼容性字段，值和macro-f1是相同的
{"accuracy": 0.90, "f1":  0.90, "macro-f1": 0.90, "micro-f1": 0.90}
```

sequence_classification_metric可以用于各类模型的文本分类任务。使用场景要求为：

- 模型输出(add中的outputs)是dict-like结构，并具有logit_name代表的字段（默认为`logits`），其最后一维和标签数量相等
- 模型输入(add中的inputs)有内容为标签id、key为label_name代表的字段（默认为`labels`）
- 任务类型为`单标签`的文本分类任务

我们为NLP部分任务类型指定了默认metric类别：
```python
from modelscope.metrics.builder import task_default_metrics
from modelscope.utils.constant import Tasks
print(task_default_metrics[Tasks.sentence_similarity])
print(task_default_metrics[Tasks.nli])
print(task_default_metrics[Tasks.sentiment_classification])
print(task_default_metrics[Tasks.text_classification])
```

nli/sentiment-classification/sentence-similarity/text_classification任务的训练过程会默认使用这个metric进行测试。

用户也可以在cfg中指定自己需要的指标类型。如果进行指定，会覆盖task_default_metrics中的默认metric：
```python
def cfg_modify_fn(cfg):
    cfg.task = 'text-classification'
    cfg.preprocessor.type = 'sen-cls-tokenizer'
    cfg.preprocessor.first_sequence = 'sentence1'
    cfg.preprocessor.second_sequence = 'sentence2'
    cfg.preprocessor.label = 'label'
    cfg.preprocessor.label2id = {'0': 0, '1': 1}
    # 指定指标类型
    cfg.evaluation.metrics = 'seq-cls-metric'
    return cfg

from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer

dataset = MsDataset.load('clue', subset_name='afqmc')
kwargs = dict(
    model='damo/nlp_structbert_backbone_base_std',
    train_dataset=dataset['train'],
    eval_dataset=dataset['validation'],
    work_dir='/tmp',
    cfg_modify_fn=cfg_modify_fn)

trainer = build_trainer(name='nlp-base-trainer', default_args=kwargs)
res = trainer.evaluate()
print(res)


# 直接运行本示例得到输出：{'accuracy': 0.31000926784059313, 'f1': array([0.  , 0.47329324])}。
# 本示例展示指定metric方法。示例所用模型为预训练模型，基于任务finetune后能从0.31提高至0.75。具体可参考训练文档。
```

### token_classification_metric

#### 方法说明

用于评估序列标注任务的结果，会在每个mini-batch跑完后收集模型产出的logits字段和labels字段，在整体数据集评估结束时产出precision、recall、F1、accuracy四个指标的值，并以dict形式返回。
该Metric使用了seqeval作为内部计算实现。

#### 输入格式：

```text
label_name: The key of label column in the 'inputs' arg, default 'labels'
logit_name: The key of logits column in the 'inputs' arg, default 'logits'
return_entity_level_metrics: Whether to return every label's detail metrics, default False.
label2id: The label2id information to get the token labels
```

#### 返回格式：

token-classification的label一般是BIO、BIOES等标注方式。如果需要查看有关tagging的一些基础信息，可以点击[这里](https://zhuanlan.zhihu.com/p/147537898)。

假设原始label为B-obj,I-obj,O，即只存在obj和O两种token类型, 那么metric的返回值类似于这样：
```json
{
"obj": 
 {"precision": 0.25, 
  "recall": 0.5, 
  "f1": 0.3333333333333333, 
  "number": 2
 }, 
 "precision": 0.25, 
 "recall": 0.5, 
 "f1": 0.3333333333333333, 
 "accuracy": 0.5
}
```
是否返回每种label（如上代码中的obj）的详细指标可以通过构造方法中的return_entity_level_metrics参数控制，该参数默认为False，即关闭状态。

token_classification_metric可以用于各类模型的序列标注任务。使用场景要求为：
- 模型输出(add中的outputs)是dict-like结构，并具有logit_name代表的字段（默认为`logits`），其最后一维和标签数量相等
- 模型输入(add中的inputs)有内容为标签id、key为label_name代表的字段（默认为`labels`）

token-classification任务的训练过程可以在cfg中不指定而直接使用这个metric，同sequence_classification_metric一样，用户也可以在cfg中指定自己需要的指标类型。

### text_generation_metric
#### 方法说明

用于评估文本生成任务的结果，这个Metric会在每个mini-batch跑完后收集模型产出的预测文本和目标文本，在整体数据集评估结束时产出 rouge-1, rouge-l, bleu-1, bleu-4 指标的值，并以dict形式返回。
该Metric使用了 rouge_score 和 bleu_score 作为内部计算实现。

#### 输入格式：

```text
target_text: The key of the target text column in the `inputs` arg, default 'tgts'
pred_text: The key of the predicted text column in the `outputs` arg, default 'preds'
```

#### 返回格式：
```json
{'rouge-1': 0.15333333074103708, 'rouge-l': 0.15333333074103708, 'bleu-1': 0.03749999999999999, 'bleu-4': 0.003559290974267897}
```

text_generation_metric 可以用于各类模型的文本生成任务。使用场景要求为：
- 模型输出是dict-like结构，并具有pred_text代表的字段（默认为`preds`）（类型为 List[str]，为预测文本列表，与 tgts 等长）
- 模型输入有target_text代表的字段（默认为`tgts`）（类型为 List[str]，为目标文本列表）
用户也可以在cfg中指定自己需要的指标类型：
```py
# 指定使用SequenceClassificationMetric
cfg.evaluation.metrics = 'text-gen-metric'
```

## CV
### image_instance_segmentation_metric
#### 方法说明

用于评估常见的two-stage、COCO数据集格式的实例分割模型，名称为`image-ins-seg-coco-metric`，使用标准的cocoapi进行评估，输出指标包括如下：
```json
{
    "bbox_mAP": float, 
    "bbox_mAP_50": float, 
    "bbox_mAP_75": float, 
    "bbox_mAP_s": float, 
    "bbox_mAP_m": float, 
    "bbox_mAP_l": float, 
    "segm_mAP": float,
    "segm_mAP_50": float, 
    "segm_mAP_75": float, 
    "segm_mAP_s": float, 
    "segm_mAP_m": float, 
    "segm_mAP_l": float
}
```

模型的输出output是一个字典，包含关键字 'eval_result' 和 `img_metas`，其中 output['img_metas']
包含数据集标注文件路径参数`ann_file`和数据集类别名称`classes`信息，output['eval_result']为模型推理输出，格式为 list[tuple]，
它包含预测的 bbox 结果和 mask 结果。外部列表对应于每个图像，内部元组第一个元素是 bbox 结果，第二个元素是 mask 结果。
具体代码可见modelscope/metrics/image_instance_segmentation_metric.py。

# 在Trainer中使用Metrics

metrics会在modelscope训练过程的交叉验证中，或单独的测试流程中被调用。

训练过程和验证流程的文档可以查看[这里](../模型的训练.md)。用户只需要在cfg中指定好需要的metrics，或使用任务默认的metrics，验证过程会自动使用这些类。

# 在外部训练中使用Metrics

您可以在外部框架的训练中单独使用这些类。下面我们以transformers的Trainer为例来使用文本分类的Metric。

首先构造模型、数据集、tokenizer并预处理数据集：
```python
from transformers import BertForSequenceClassification, BertTokenizerFast
from datasets import load_dataset
dataset = load_dataset('clue', 'afqmc')
model = BertForSequenceClassification.from_pretrained('bert-base-uncased')
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
def tokenize_function(examples):
    return tokenizer(examples["sentence1"], examples["sentence2"], padding="max_length", truncation=True, max_length=128)
dataset = dataset.map(tokenize_function, batched=True)
small_train_dataset = dataset["train"].shuffle(seed=42).select(range(64))
small_eval_dataset = dataset["validation"].shuffle(seed=42).select(range(64))
```

构造Trainer并传入Metric类：
```python
from transformers import Trainer
from transformers import TrainingArguments
from modelscope.metrics.sequence_classification_metric import SequenceClassificationMetric
training_args = TrainingArguments(output_dir="/tmp", evaluation_strategy='steps', 
                                  metric_for_best_model='accuracy', eval_steps=1)

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    metric = SequenceClassificationMetric()
    metric.add({'logits': logits}, {'labels': labels})
    return metric.evaluate()

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=small_train_dataset,
    eval_dataset=small_eval_dataset,
    compute_metrics=compute_metrics,
)
trainer.train()
```

# 如何编写新的Metric类

Metric类比较简单，您只需要实现add和evaluate两个方法即可。
```python
class MyCustomMetric:

    def add(self, outputs, inputs):
        # outputs是模型输出，inputs为模型输入，在这里取出所需要的value并存下来
        eval_results = outputs["result"]
        ground_truths = inputs["label"]
        self.preds.append(eval_results)
        self.labels.append(ground_truths)


    def evaluate(self):
        # 在数据集验证完成时调用，根据add存下来的value进行计算
        from sklearn.metrics import accuracy_score
        from modelscope.metrics.builder import MetricKeys
        return {MetricKeys.ACCURACY: accuracy_score(self.labels, self.preds)}
```

如果需要将这个Metric注册到modelscope中，只需要手动调用：
```python
from modelscope.utils.registry import default_group
from modelscope.metrics import METRICS
METRICS.register_module(group_key=default_group, module_name='my-custom-metric', module_cls=MyCustomMetric)
```
使用的时候指定cfg.evaluation.metrics = 'my-custom-metric'即可。

