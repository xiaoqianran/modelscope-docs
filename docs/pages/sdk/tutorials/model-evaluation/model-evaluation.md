<!-- modelscope-docs: Model Evaluation | sdk/tutorials/model-evaluation/model-evaluation_EN.md -->

# The Significance of Metrics

Metrics are used to measure how well a model performs on a dataset. Examples include Accuracy, Precision, Recall, F1, Rouge, etc. A single metric is generally insufficient for directly evaluating a specific type of task, as the evaluation metrics for a particular task might be complex. For instance, the evaluation metric for token-classification tasks combines four individual metrics: Accuracy, Precision, Recall, and F1. To facilitate direct evaluation for specific task types, ModelScope provides high-level Metric encapsulation at the task level, which may internally invoke open-source frameworks to compute individual metrics.

# Metric Module

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
The base Metric class definition is very simple, containing only two methods: `add` and `evaluate`. The `add` method collects model input and output information from each mini-batch and extracts the necessary information for metric computation, such as the `labels` field from `inputs` and the `logits` field from `outputs`. The `add` method is called after each mini-batch execution and is not subject to multi-threading issues.

The `evaluate` method is executed after the entire dataset has been processed. It takes no input parameters and internally aggregates and computes the values collected by `add`, returning the metrics as a dictionary.

# Metric Classes Supported by ModelScope

## NLP

### sequence_classification_metric
#### Method Description

Used to evaluate text classification task results. This Metric collects the `logits` and `labels` fields from model outputs after each mini-batch completes, and returns accuracy and F1 scores as a dictionary when the entire dataset evaluation finishes.

#### Input Format:

```text
label_name: The key of label column in the 'inputs' arg, default 'labels'
logit_name: The key of logits column in the 'inputs' arg, default 'logits'
```

#### Return Format:

```json
# Binary classification
{"accuracy": 0.90, "f1":  0.90}
# Multi-class classification, where f1 is a compatibility field with the same value as macro-f1
{"accuracy": 0.90, "f1":  0.90, "macro-f1": 0.90, "micro-f1": 0.90}
```

`sequence_classification_metric` can be used for text classification tasks across various models. Usage requirements:

- Model output (in `add`'s `outputs`) is a dict-like structure containing a field represented by `logit_name` (default: `logits`), whose last dimension equals the number of labels
- Model input (in `add`'s `inputs`) contains label IDs with a key represented by `label_name` (default: `labels`)
- Task type is `single-label` text classification

We have specified default metric types for certain NLP task categories:
```python
from modelscope.metrics.builder import task_default_metrics
from modelscope.utils.constant import Tasks
print(task_default_metrics[Tasks.sentence_similarity])
print(task_default_metrics[Tasks.nli])
print(task_default_metrics[Tasks.sentiment_classification])
print(task_default_metrics[Tasks.text_classification])
```

The training process for nli/sentiment-classification/sentence-similarity/text_classification tasks will use this metric by default for testing.

Users can also specify their desired metric type in the configuration. If specified, it will override the default metric in `task_default_metrics`:
```python
def cfg_modify_fn(cfg):
    cfg.task = 'text-classification'
    cfg.preprocessor.type = 'sen-cls-tokenizer'
    cfg.preprocessor.first_sequence = 'sentence1'
    cfg.preprocessor.second_sequence = 'sentence2'
    cfg.preprocessor.label = 'label'
    cfg.preprocessor.label2id = {'0': 0, '1': 1}
    # Specify metric type
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


# Running this example directly produces output: {'accuracy': 0.31000926784059313, 'f1': array([0.  , 0.47329324])}.
# This example demonstrates how to specify a metric. The model used is a pre-trained model that can improve from 0.31 to 0.75 after task-specific fine-tuning. Refer to the training documentation for details.
```

### token_classification_metric

#### Method Description

Used to evaluate sequence labeling task results. It collects the `logits` and `labels` fields from model outputs after each mini-batch completes, and returns four metrics—precision, recall, F1, and accuracy—as a dictionary when the entire dataset evaluation finishes.
This Metric uses seqeval as its internal computation implementation.

#### Input Format:

```text
label_name: The key of label column in the 'inputs' arg, default 'labels'
logit_name: The key of logits column in the 'inputs' arg, default 'logits'
return_entity_level_metrics: Whether to return every label's detail metrics, default False.
label2id: The label2id information to get the token labels
```

#### Return Format:

Token-classification labels typically use BIO, BIOES, or similar annotation schemes. For basic information about tagging, click [here](https://zhuanlan.zhihu.com/p/147537898).

Assuming the original labels are B-obj, I-obj, O (i.e., only two token types: obj and O), the metric return value would resemble:
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
Whether to return detailed metrics for each label (such as `obj` in the code above) can be controlled via the `return_entity_level_metrics` parameter in the constructor. This parameter defaults to False (disabled).

`token_classification_metric` can be used for sequence labeling tasks across various models. Usage requirements:
- Model output (in `add`'s `outputs`) is a dict-like structure containing a field represented by `logit_name` (default: `logits`), whose last dimension equals the number of labels
- Model input (in `add`'s `inputs`) contains label IDs with a key represented by `label_name` (default: `labels`)

For token-classification tasks, this metric can be used directly without specification in the configuration, similar to `sequence_classification_metric`. Users can also specify their desired metric type in the configuration.

### text_generation_metric
#### Method Description

Used to evaluate text generation task results. This Metric collects predicted and target texts from model outputs after each mini-batch completes, and returns rouge-1, rouge-l, bleu-1, and bleu-4 metrics as a dictionary when the entire dataset evaluation finishes.
This Metric uses rouge_score and bleu_score as its internal computation implementation.

#### Input Format:

```text
target_text: The key of the target text column in the `inputs` arg, default 'tgts'
pred_text: The key of the predicted text column in the `outputs` arg, default 'preds'
```

#### Return Format:
```json
{'rouge-1': 0.15333333074103708, 'rouge-l': 0.15333333074103708, 'bleu-1': 0.03749999999999999, 'bleu-4': 0.003559290974267897}
```

`text_generation_metric` can be used for text generation tasks across various models. Usage requirements:
- Model output is a dict-like structure containing a field represented by `pred_text` (default: `preds`) (type: List[str], a list of predicted texts with the same length as `tgts`)
- Model input contains a field represented by `target_text` (default: `tgts`) (type: List[str], a list of target texts)

Users can also specify their desired metric type in the configuration:
```py
# Specify using SequenceClassificationMetric
cfg.evaluation.metrics = 'text-gen-metric'
```

## CV
### image_instance_segmentation_metric
#### Method Description

Used to evaluate common two-stage instance segmentation models with COCO dataset format, named `image-ins-seg-coco-metric`. It uses the standard cocoapi for evaluation, with output metrics including:
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

The model output is a dictionary containing keys `eval_result` and `img_metas`, where `output['img_metas']` includes the dataset annotation file path parameter `ann_file` and dataset class names `classes` information. `output['eval_result']` contains the model inference output in the format of list[tuple], including predicted bbox results and mask results. The outer list corresponds to each image, and the inner tuple's first element is the bbox result while the second element is the mask result.
Refer to modelscope/metrics/image_instance_segmentation_metric.py for specific code.

# Using Metrics in Trainer

Metrics are invoked during cross-validation in ModelScope training processes or in standalone testing workflows.

Documentation for training and validation processes can be found [here](../模型的训练.md). Users only need to specify the required metrics in the configuration or use the default task metrics, and the validation process will automatically utilize these classes.

# Using Metrics in External Training

You can use these classes independently in external framework training. Below we demonstrate using the text classification Metric with Transformers' Trainer.

First, construct the model, dataset, tokenizer, and preprocess the dataset:
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

Construct the Trainer and pass in the Metric class:
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

# How to Write a New Metric Class

Metric classes are straightforward—you only need to implement the `add` and `evaluate` methods.
```python
class MyCustomMetric:

    def add(self, outputs, inputs):
        # outputs are model outputs, inputs are model inputs; extract required values here and store them
        eval_results = outputs["result"]
        ground_truths = inputs["label"]
        self.preds.append(eval_results)
        self.labels.append(ground_truths)


    def evaluate(self):
        # Called when dataset validation completes; compute based on values stored by add
        from sklearn.metrics import accuracy_score
        from modelscope.metrics.builder import MetricKeys
        return {MetricKeys.ACCURACY: accuracy_score(self.labels, self.preds)}
```

To register this Metric with ModelScope, simply call manually:
```python
from modelscope.utils.registry import default_group
from modelscope.metrics import METRICS
METRICS.register_module(group_key=default_group, module_name='my-custom-metric', module_cls=MyCustomMetric)
```
When using it, simply specify `cfg.evaluation.metrics = 'my-custom-metric'`.