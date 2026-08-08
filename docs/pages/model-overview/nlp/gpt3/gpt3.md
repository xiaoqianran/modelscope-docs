<!-- modelscope-docs: GPT-3 | model-overview/nlp/gpt3/gpt3_EN.md -->

# Model Overview

GPT-3 is a general-purpose pre-trained generative model that uses a Transformer decoder-only architecture with some modifications to the standard Transformer decoder. The original decoder contains two Multi-Head Attention structures, but GPT-3 retains only the Masked Multi-Head Attention. Using conventional language modeling optimization and left-to-right autoregressive pre-training, it can be applied to various downstream generative tasks, particularly demonstrating strong zero-shot generation capabilities. The model leverages large amounts of unsupervised data and is pre-trained through autoregressive tasks. It can be used for text generation-related tasks including text summarization, question generation, data-to-text, and more. For detailed model information, please refer to: [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)

The paper's abstract is as follows:

```text
For all tasks, GPT-3 is applied without any gradient updates or fine-tuning; tasks and few-shot demonstrations are specified purely through text interaction with the model. GPT-3 achieves strong performance on many NLP datasets, including translation, question answering, and cloze tasks, as well as some tasks requiring on-the-fly reasoning or domain adaptation, such as unscrambling words, sentence interpretation, or performing 3-digit arithmetic. Additionally, we identify datasets where GPT-3's few-shot learning remains challenging, as well as datasets where GPT-3 faces methodological issues related to training on large web corpora. Finally, we find that GPT-3 can generate news article samples that human evaluators struggle to distinguish from articles written by humans. We discuss this finding and GPT-3's broader societal implications overall.
```

Model Advantages:

1. GPT-3 is one of the most influential NLP models, initiating the wave of ultra-large-scale pre-training with up to 175B parameters, delivering performance that matches its massive scale.
2. GPT-3 demonstrates that scaling up language models significantly improves task-agnostic, few-shot performance, sometimes even competing with previous state-of-the-art fine-tuned methods.

# Model Configuration

GPT-3 model hyperparameters can be found in the `config.json` file within the downloaded model directory. The typical format is as follows:

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

In pre-trained models, these configurations represent only a portion of the complete model configuration. GPT-3 model parameters are passed through the `GPT3Config` class. Below are commonly used configuration options listed in the API documentation:

## Parameter List

* **attention_probs_dropout_prob** (`float`, optional, defaults to 0.1) – The dropout ratio for the attention probabilities.

* **hidden_act** (`str` or `Callable`, optional, defaults to `"gelu"`) – The non-linear activation function (function or string) in the decoder and pooler. If string, `"gelu"`, `"relu"`, `"silu"` and `"gelu_new"` are supported.

* **hidden_dropout_prob** (`float`, optional, defaults to 0.1) – The dropout probability for all fully connected layers in the embeddings, decoder, and pooler.

* **hidden_size** (`int`, optional, defaults to 768) – Dimensionality of the decoder layers and the pooler layer.

* **initializer_range** (`float`, optional, defaults to 0.02) – The standard deviation of the truncated_normal_initializer for initializing all weight matrices.

* **intermediate_size** (`int`, optional, defaults to 3072) – Dimensionality of the "intermediate" (often named feed-forward) layer in the Transformer decoder.

* **max_position_embeddings** (`int`, optional, defaults to 2048) – The maximum sequence length that this model might ever be used with. Typically set this to something large just in case (e.g., 512 or 1024 or 2048).

* **num_attention_heads** (`int`, optional, defaults to 12) – Number of attention heads for each attention layer in the Transformer decoder.

* **num_hidden_layers** (`int`, optional, defaults to 12) – Number of hidden layers in the Transformer decoder.

* **type_vocab_size** (`int`, optional, defaults to 2) – The vocabulary size of the `token_type_ids` passed when calling `GPT3Model`.

* **vocab_size** (`int`, optional, defaults to 30522) – Vocabulary size of the BERT model. Defines the number of different tokens that can be represented by the `inputs_ids` passed when calling `GPT3Model`.

* **fp16** (`bool`, optional, defaults to `False`) - Whether or not the model should use float16 scalars.

* **layernorm_epsilon** (`float`, optional, defaults to 1e-12) - The epsilon used by the layer normalization layers.

When using GPT-3 models for inference, these parameters are generally fixed. You can directly load the model using the Model class:
```python
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_gpt3_text-generation_chinese-base')
```

If you're using ModelScope's trainer for training, ModelScope recommends configuring and adjusting model parameters within the trainer. For training procedures, please refer to [Model Training](https://modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E8%AE%AD%E7%BB%83Train).

# Model Preprocessing

## Tokenizer

GPT-3 models in ModelScope use two different tokenizers during training. Models labeled as base/large use `BertTokenizer`, while models explicitly labeled with parameter counts like 1.3B/2.7B/13B/30B use `JiebaBPETokenizer` implemented based on jieba segmentation. If you need to use GPT-3 models directly in external frameworks, here's an example using `BertTokenizer` from the transformers library:

```python
from transformers import BertTokenizer
# model_dir is the path to model configuration files, which must contain vocab.txt
tokenizer = BertTokenizer.from_pretrained(model_dir)
output = tokenizer('This is a test text', return_tensors='pt')
print(output)
# Pass the tokenizer output to the model
print(model(**output))
```

For tokenizer implementation and usage, please refer to Hugging Face's tokenizer documentation: [BertTokenizer](https://huggingface.co/docs/transformers/model_doc/bert#transformers.BertTokenizer).

## Preprocessor

When using GPT-3 within the ModelScope framework, ModelScope recommends using preprocessors instead of directly calling tokenizers. ModelScope preprocessors are specialized for various tasks and directly integrate with the dataset module (preprocessors handle data fetching, tokenization, tensor conversion, label analysis, etc.), so you don't need to directly call tokenizers and write different adapter code for each task.

In the ModelScope framework, GPT-3 corresponds to text generation tasks and can use different text generation preprocessors depending on the model. When using base/large models:

```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.preprocessors import TextGenerationTransformersPreprocessor

model_id = 'damo/nlp_gpt3_text-generation_chinese-base'
model_dir = snapshot_download(model_id)
sentence = 'This is a test text'

preprocessor = TextGenerationTransformersPreprocessor(model_dir)
result = preprocessor(sentence)
print(result)
```

When using 1.3B/2.7B/13B models:

```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.preprocessors.text_generation_preprocessor import TextGenerationJiebaPreprocessor

model_id = 'nlp_gpt3_text-generation_1.3B'
model_dir = snapshot_download(model_id)
sentence = 'This is a test text'

preprocessor = TextGenerationJiebaPreprocessor(model_dir)
result = preprocessor(sentence)
print(result)
```

Both `TextGenerationTransformersPreprocessor` and `TextGenerationJiebaPreprocessor` have the same constructor parameters:

* **model_dir** (`str`) – The model_dir to load the configuration from. Note that this model_dir must exist in the local file system.

* **mode** (`str`, optional, defaults to 'inference') – The work mode for this preprocessor. Valid values can be 'train', 'eval' and 'inference'. This preprocessor's behavior may be different under these values.

* **kwargs** (`dict`, optional)

    sequence_length: The input sequence length to padding to.

    first_sequence: The key for the first sequence

    second_sequence: The key for the second sequence

    label: The label key

    label2id: An optional label2id mapping, the class will try to call utils.parse_label_mapping if this mapping is not supplied.

    Other input args will be fed into the tokenizer at the runtime.

The preprocessor accepts input types of str, tuple, or dict. When the user input is a tuple or str, the three parameters `first_sequence`, `second_sequence`, and `label` passed during construction have no effect.

For general preprocessor usage, please refer to [here](https://www.modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E7%9A%84%E9%A2%84%E5%A4%84%E7%90%86).

# Supported Downstream Tasks

## Text Generation Tasks

Text generation tasks in NLP can be further divided into specific tasks such as text summarization, machine translation, story continuation, etc. Different models are available on ModelHub for these tasks, and some tasks can share models and preprocessors.

### Text Generation Models

GPT-3's `GPT3ForTextGeneration` class can load story continuation and other task models for training and inference.

```python
from modelscope.models.nlp import PalmForTextGeneration
model = GPT3ForTextGeneration.from_pretrained('damo/nlp_gpt3_text-generation_chinese-base')
```

#### Model Forward Parameters

* **input_ids** (`torch.LongTensor` of shape `(batch_size, sequence_length)`) – Indices of input sequence tokens in the vocabulary.

* **attention_mask** (`torch.FloatTensor` of shape `(batch_size, sequence_length)`, optional) – Mask to avoid performing attention on padding token indices. Mask values selected in `[0, 1]`:

    1 for tokens that are **not masked**,

    0 for tokens that are **masked**.

* **position_ids** (`torch.LongTensor` of shape `(batch_size, sequence_length)`, optional) – Indices of positions of each input sequence tokens in the position embeddings. Selected in the range `[0, config.max_position_embeddings - 1]`.

* **labels** (`torch.LongTensor` of shape `(batch_size, sequence_length)`) - Indices of input sequence tokens in the vocabulary for calculating loss.

#### Model Generate Parameters

* **input_ids** (`torch.LongTensor` of shape `(batch_size, sequence_length)`) – Indices of input sequence tokens in the vocabulary.

* **attention_mask** (`torch.FloatTensor` of shape `(batch_size, sequence_length)`, optional) – Mask to avoid performing attention on padding token indices. Mask values selected in `[0, 1]`:

    1 for tokens that are **not masked**,

    0 for tokens that are **masked**.

* **do_sample** (`bool`, optional, defaults to `True`) - Whether or not to use sampling; use greedy decoding otherwise.

* **max_length** (`int`, optional, defaults to `model.config.max_length`) - The maximum length the generated tokens can have.

* **top_k** (`int`, optional, defaults to `model.config.top_k` or 10 if the config does not set any value) - The number of highest probability vocabulary tokens to keep for top-k-filtering.

* **top_p** (`float`, optional, defaults to `model.config.top_p` or 1.0 if the config does not set any value) - If set to float < 1, only the smallest set of most probable tokens with probabilities that add up to `top_p` or higher are kept for generation.

### Text Generation Model Generate Output

```python
{
  # Generated text
  "text": "Text-formatted model output result"
}
```

### Text Generation Pipeline

If your scenario involves inference, ModelScope recommends using pipelines directly to fulfill your requirements.

When using small/medium models versus large models, there are some differences in machine resources used during pipeline execution. For example, ModelScope's 13B parameter GPT-3 model, when using default configuration, performs inference using model parallelism across 8 GPUs. However, regardless of using small/medium or large models, the pipeline code presented to users remains identical:

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

inputs = 'With the rapid development of computer vision, face recognition technology has evolved from simple scenarios to complex scenarios, involving variations in pose, lighting, expression, noise, occlusion, makeup, age, race, gender, and other factors. Although existing face recognition systems achieve high success rates in specific constrained environments,'

# Example code for single-GPU base model
pipeline_base = pipeline(Tasks.text_generation, model='damo/nlp_gpt3_text-generation_chinese-base')
result_base = pipeline_base(inputs)
print('Text generation result:\n' + result_base[OutputKeys.TEXT])

# Example code for multi-GPU 13B model
pipeline_13B = pipeline(Tasks.text_generation, model='damo/nlp_gpt3_text-generation_13B')
result_13B = pipeline_13B(inputs)
print('Text generation result:\n' + result_13B[OutputKeys.TEXT])
```

As shown above, ModelScope provides the same user-friendly encapsulation for both single-GPU small/medium models and multi-GPU large models, enabling users to quickly perform inference with models.

For pipeline usage and output formats, please refer to [here](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E6%8E%A8%E7%90%86Pipeline).

In the GPT-3 model series, models with 1.3B parameters and above actually invoke `DistributedPipeline` when using Pipeline for inference, which is identical to standard pipeline usage. For integration differences, please refer to the "DistributedPipeline Introduction" section in [ModelScope Model Integration](../../贡献者指南/ModelScope模型接入.md).

Additionally, GPT-3 supports automatic model splitting during inference. To use multi-GPU inference for models like 1.3B/2.7B that default to single-GPU parameters, you can simply modify the `world_size` and `tensor_model_parallel_size` configurations in `configuration.json`. Here's an example:

Note: JSON files do not support comments. Please remove the # marker and everything after it on that line before running!
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
        "checkpoint_tensor_model_parallel_size": 1,
        "world_size": 2,
        "tensor_model_parallel_size": 2
    }
}
```

After making the above modifications to the `configuration.json` file, you can perform 2-GPU parallel inference using DistributedPipeline. The same applies to 4-GPU or 8-GPU setups.

### Text Generation Model Export

If you're using GPT-3 in C++ or acceleration scenarios, you can also export the model to ONNX or TorchScript format.

```python
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_gpt3_text-generation_chinese-base')
# Since TorchScript is PyTorch-specific, use TorchModelExporter
from modelscope.exporters import TorchModelExporter
# The shape parameter defines the dimensions for generating dummy inputs
# In NLP, len(shape) == 2 typically, representing batch_size and sequence_length
output_files = TorchModelExporter.from_model(model).export_torch_script(shape=(2, 256), outputs='/tmp')
print(output_files) # {'model': '/tmp/model.ts'}
```

The example above demonstrates exporting to TorchScript. During this process, ModelScope uses model configuration to initialize a preprocessor, generate dummy inputs, and create the TS model file using the trace method. For specific details about model export, please refer to [here](https://modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E5%AF%BC%E5%87%BA).

### Text Generation Model Training

For text generation model training, please refer to "Model Training" below.

# Model Training

We support both continuation training and input-output format training for GPT-3 models. The training method doesn't need to be explicitly specified—continuation training is performed when the training dataset contains only `src_txt`, while input-output format training is performed when the dataset contains both `src_txt` and `tgt_txt`. The following provides example code for both training approaches.

## Continuation Training

GPT-3 model training can be performed using ModelScope's provided trainer. The following code demonstrates the model training process on a Chinese poetry generation dataset:

```python
# Code for developing a Chinese poetry generation model based on ModelScope's Chinese GPT-3 base

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

# Build trainer and perform training
trainer = build_trainer(
    name=Trainers.nlp_base_trainer, default_args=kwargs)
trainer.train()
```

We support model parallel training for GPT-3 models of 1.3B size and above. The following code demonstrates multi-GPU model parallel training based on GPT-3 2.7B:

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

We recommend using `torchrun` to launch training, for example with the following command:

```shell
# N represents the model parallelism degree
torchrun --nproc_per_node $N finetune_poetry.py
```

Currently, for GPT-3 1.3B/2.7B models, we support automatic model splitting during training. Simply setting the parallel process count enables automatic training with the corresponding model parallelism degree.

## Input-Output Format Training

Below is an example of fine-tuning training based on the Chinese GPT-3 2.7B model on the DuReader question generation dataset:
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

As above, we recommend using `torchrun` to launch training:

```shell
# N represents the model parallelism degree
torchrun --nproc_per_node $N finetune_dureader.py
```

You can perform continued training on your own datasets based on checkpoints provided by ModelScope, or reinitialize parameters for training. After training, the `work_dir` will store training process files (for resuming interrupted training) and inference files (for uploading to ModelHub or inference/export scenarios). For specific training details and usage of output files, please refer to [Model Training Documentation](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E8%AE%AD%E7%BB%83Train).