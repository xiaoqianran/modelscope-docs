<!-- modelscope-docs: Text Classification Task | sdk/tasks/text-classification/text-classification_EN.md -->

# Text Classification Task

The text classification task involves converting a single text or text pair into tensors, feeding them into a model, and then converting the output into the known label with the highest probability.
Text classification tasks can solve specific problems such as sentiment analysis and sentence similarity. The text classification models on ModelScope can specifically address the following issues:

- Sentiment Analysis (sentiment-classification): Given a sentence, determine whether it expresses negative, positive, or neutral sentiment.
- Sentence Similarity (sentence-similarity): Given two sentences, determine whether they are similar.
- Natural Language Inference (nli): Given two sentences, determine whether they are logically unrelated, entailment, or contradictory.
- Other problems: After training, the model classifies user input sentences into one of the user-specified labels.

## Inference for Text Classification Tasks

The inference capability of the ModelScope framework is implemented through the pipeline module. For basic usage methods of inference, please refer to [Model Inference Pipeline](../model-inference-pipeline.md).
For text classification tasks, you can use it as follows:
```python
from modelscope.pipelines import pipeline
pipeline_ins = pipeline(task='nli', model='damo/nlp_structbert_nli_chinese-base')
pipeline_ins(input=('Which is better between Sichuan Business Vocational College and Sichuan Finance and Economics Vocational College?', 'Which campus is the Business Management program at Sichuan Business Vocational College located in?'))
```

Below we provide the Pipeline for text classification tasks and its supported parameters.

### TextClassificationPipeline

This Pipeline will call a subclass or DuckType class of TextClassificationPreprocessorBase preprocessor for preprocessing, and then feed the input to the model for forward inference.
The logits output by the model will be converted to the ID with the highest probability and then to the original label during the Pipeline's post-processing. The post-processing requires the id2label information provided by the preprocessor; if this information is missing, the original ID value will be returned.

#### Constructor Parameters

```text
model: Model ID, local model path, or model instance.
preprocessor: The preprocessor corresponding to the model. If not provided, the pipeline will automatically construct it using the configuration file from the downloaded model's local path. If a model instance (e.g., torch.nn.Module class) is passed, ensure that the model contains a `model_dir` attribute with the local path containing the configuration file to construct a preprocessor.
kwargs: You can pass any parameters needed for the preprocessor constructor here. By default, the value of first_sequence is `first_sequence`, second_sequence is `None`, and `sequence_length` is 512.
Other parameters: Any parameters supported by the Pipeline base class can be passed.
```

#### Input Format

```text
str: A single sentence.
tuple: A sentence pair consisting of two sentences.
dict: A key-value pair containing two sentences, where the values are the sentence contents and the keys correspond to the `first_sequence` and `second_sequence` parameters of the TextClassificationPreprocessor.
```

#### Output Format

```text
Returns a dict with the following keys:
scores: List of probability values for each label, with the highest probability first.
labels: List of actual label values, in the same order as scores.
```

#### Batch Inference Support

Currently, all models officially adapted by ModelScope for this Pipeline support batch forward inference. Please refer to the `Model List for Tasks` section.

#### Model Adaptation Requirements

##### Model Return Value
```text
Return type should be dict or ModelScope's official `TextClassificationModelOutput` type and its subclasses.
Required fields:
logits: Model output logits corresponding to each label, with shape (batch_size, n_labels)
```

##### Preprocessor Requirements
```text
Any subclass of the text classification preprocessor base class `TextClassificationPreprocessorBase` or its Duck Type class that meets the constructor and method requirements.
```

## Preprocessors for Text Classification Tasks

The base class for text classification task preprocessors is `TextClassificationPreprocessorBase`.

When users employ text classification task preprocessors, the common parameters (i.e., the base class constructor parameters) are:
```text
model_dir: Local model path containing label_mapping.json to parse label2id mapping. If label2id is passed as a parameter, model_dir can be empty.
first_sequence: Key for the first sentence. This parameter is ineffective if the input is str or tuple.
second_sequence: Key for the second sentence. This parameter is ineffective if the input is str or tuple.
label: Key for the label column. This parameter is ineffective if the input is tuple.
label2id: Optional label2id mapping. If not provided, ensure model_dir has a value and contains label2id information.
mode: The working mode of the preprocessor, with three available values: `train`, `eval`, and `inference`. Default is `inference`. Different logic can be executed in __call__ based on this mode.
```

Subclasses must implement either of the following methods:

- Either __call__ or _tokenize_text, where __call__ is the actual preprocessing process

The definition of the __call__ method is:
```text
def __call__(self, data: Union[str, Tuple, Dict], **kwargs) -> Dict[str, Any]:
    ...
```

_tokenize_text is called within __call__, and its definition is:
```text
def _tokenize_text(self, sequence1, sequence2=None, **kwargs):
    ...
```

The default __call__ method workflow is:
```text
1. The call method defaults to parsing sentence1, sentence2, and label from the input data as follows:
   - If input is str, treat it as sentence1.
   - If input is tuple:
     - If length is 3, parse as sentence1, sentence2, label respectively
     - If length is 2, distinguish by mode: during inference, parse as sentence1 and sentence2; during training, parse as sentence1 and label
   - If input is dict: parse according to first_sequence, second_sequence, and label from the constructor parameters.
2. After parsing, call _tokenize_text for embedding. Users can also override only _tokenize_text to execute specific tokenization processes.
3. To adapt to torch_default_collator, convert List-type tensors to numpy.ndarray-type tensors.
4. Map the label column to ID according to label2id mapping.
```

- id2label: property, optional

id2label is used in pipeline post-processing to convert IDs (derived from logits) back to actual labels. The base class defaults to constructing this by reverse indexing the label2id from the constructor. If this value doesn't exist and isn't overridden in subclasses, it returns None.

Any training and inference for text classification tasks can use the methods defined in the base class, and additional methods provided by specific subclasses can be used when appropriate.

### TextClassificationTransformersPreprocessor

This class is a text classification task preprocessor implemented based on Transformers' Tokenizer. It can adapt to any general Transformers codebase model, such as BERT and StructBERT.

In addition to supporting base class methods, this class supports additional constructor parameters:
```text
use_fast: Use fast or slow version of tokenizer. If this value is not passed, it will attempt to parse from the tokenizer_config.json file in model_dir. If neither exists, it defaults to using the slow version of the tokenizer.
kwargs: Any runtime parameters supported by transformers' tokenizer can be passed here, such as commonly used max_length and padding. By default, max_length is set to 128 and padding to 'max_length'.
```

This class overrides the _tokenize_text method. The kwargs passed during the __call__ phase will be passed here and merged to override the kwargs from construction for tokenization.

This class returns torch tensors when mode is `inference`, and numpy tensors when mode is `train` or `eval` to allow the trainer to convert a minibatch to torch tensors.

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

## Model List for Tasks

Text Classification BERT (BertForSequenceClassification)

Text Classification StructBERT (SbertForSequenceClassification)

You can search for all models supporting this task on [ModelHub](https://modelscope.ai/models).

## Dataset List for Tasks

The following datasets are commonly used for fine-tuning:

[CLUE](https://modelscope.ai/datasets/modelscope/clue/summary)

[GLUE](https://modelscope.ai/datasets/modelscope/glue/summary)

[SUPER_GLUE](https://modelscope.ai/datasets/modelscope/super_glue/summary)

You can search for all datasets supporting this task on [DataHub](https://modelscope.ai/datasets).

## Best Practices for Training Tasks

Text classification task training can use the EpochBasedTrainer provided by ModelScope Library. If you need to view the basic training process, please refer to the [Model Training Documentation](../model-training.md).

### Loading a Dataset

Taking CLUE as an example, the following loads its subset dataset tnews:

```text
dataset = MsDataset.load('clue', subset_name='tnews')
```

tnews is a 15-class classification dataset aimed at predicting which news category the input sentence belongs to.

### Configuring the Preprocessor

Datasets can be preprocessed by user code before the trainer is called, or preprocessor configuration can be written into the configuration file and automatically preprocessed in the trainer. The preprocessing timing in the trainer occurs when train_loop or evaluation_loop fetches values from the dataloader.

The logic for user code preprocessing is not listed here. Users can use any custom process for data embedding operations. Note that if external preprocessing is performed, ensure that the preprocessing field in the configuration file is set to None.

Below is an example of configuring preprocessor information using `TextClassificationTransformersPreprocessor`.

Make the following modifications in the cfg_modify_fn provided by EpochBasedTrainer:

```text
# Since tnews labels are default int-type actual IDs, label2id doesn't need to be passed
cfg.preprocessor = {
  'train': {
      # Configure preprocessor name
      'type': 'sen-cls-tokenizer',
      # Configure key for sentence1
      'first_sequence': 'sentence',
      # Configure label
      'label': 'label',
      # Configure mode
      'mode': 'train',
  },
  'val': {
      # Configure preprocessor name
      'type': 'sen-cls-tokenizer',
      # Configure key for sentence1
      'first_sequence': 'sentence',
      # Configure label
      'label': 'label',
      'mode': 'eval',
  }
}
```

### Configuring the Model

You can directly pass the model ID or local path to the trainer's constructor parameters and modify model parameters in cfg_modify_fn:

```text
# Pass the required number of labels for the model
cfg.model['num_labels'] = 15
```

### Configuring Training Information

Model training information generally exists in the model configuration file provided by ModelHub (though values like max_epochs need to be filled). Here we assume this configuration doesn't exist and provide a reasonable configuration from scratch:

```text
# Pass the required number of labels for the model
cfg['train'] = {
      "work_dir": "/tmp",
      "max_epochs": 10,
      "dataloader": {
          # batch_size
          "batch_size_per_gpu": 16,
          "workers_per_gpu": 0
      },
      "optimizer": {
          # optimizer information
          "type": "SGD",
          "lr": 0.01,
          "options": {
              "grad_clip": {
                  "max_norm": 2.0
              }
          }
      },
      "lr_scheduler": {
          # lr_scheduler information, note torch version compatibility
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

### Configuring Validation Information

Similar to the training field, we assume there's no evaluation information in the configuration file and provide usable validation information from scratch:

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

ModelScope provides a standard [Metrics](../detailed-tutorials/model-evaluation.md) for text classification tasks: SequenceClassificationMetric, which is the name modified in the metrics.type field above.
This Metric can return Accuracy and F1 values. If custom evaluation processes are needed, please refer to the specific construction methods in the Metrics link.

### Additional Configuration Information

Generally, if training with a backbone, the task field needs to be specified; if subsequent inference is required, the Pipeline name needs to be specified:
```text
cfg.task = 'text-classification'
# Braces also support filling in other pipeline construction information needed
cfg.pipeline = {'type': 'text-classification'}
```

### A Complete Example

```python
import os

from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer


def cfg_modify_fn(cfg):
    cfg.task = 'text-classification'
    cfg.pipeline = {'type': 'text-classification'}
    cfg.preprocessor = {
        'train': {
            # Configure preprocessor name
            'type': 'sen-cls-tokenizer',
            # Configure key for sentence1
            'first_sequence': 'sentence',
            # Configure label
            'label': 'label',
            # Configure mode
            'mode': 'train',
        },
        'val': {
            # Configure preprocessor name
            'type': 'sen-cls-tokenizer',
            # Configure key for sentence1
            'first_sequence': 'sentence',
            # Configure label
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
            # optimizer information
            "type": "SGD",
            "lr": 0.01,
            "options": {
                "grad_clip": {
                    "max_norm": 2.0
                }
            }
        },
        "lr_scheduler": {
            # lr_scheduler information, note torch version compatibility
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

The Trainer also supports continued training, saving models with best metrics, and post-training validation. For details, please refer to the [Model Training Documentation](../model-training.md).