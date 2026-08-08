<!-- modelscope-docs: Configuration Guide | sdk/tutorials/configuration/configuration_EN.md -->

# Introduction to Configuration Files

One of the core principles of the ModelScope framework is complete configurability. In ModelHub model repositories, there must be a file named `configuration.json` or `configuration.yaml`. This configuration file stores various configuration information used for data preprocessing, model inference, training, and evaluation, ensuring reproducibility throughout the model inference, training, and evaluation processes. Therefore, users can directly pass model files to trainers for training or copy configurations to new models to reproduce SOTA model performance.

The configuration file format supports both `json` and `yaml` formats. The default configuration file name in model repositories is `configuration.json`. ModelScope supports automatically reading configuration files from model repositories for inference and training, as well as using local configuration files for related operations.

# Reading and Using Model Configuration Files

ModelScope provides dedicated APIs to **read configuration files**. If you need to read a model's configuration, you can use the following code:

```python
from modelscope.utils.hub import read_config
cfg = read_config('damo/nlp_structbert_sentence-similarity_chinese-base')
print(cfg)
```

If you want to **find the directory containing the configuration file**, you can use the `snapshot_download` capability:

```python
from modelscope.utils.hub import snapshot_download
model_dir = snapshot_download('damo/nlp_structbert_sentence-similarity_chinese-base')
print(model_dir) # ~/.cache/modelscope/hub/*
```

Generally, ModelScope will **implicitly** load configuration files during your training and inference processes, so you don't need to worry about this step.

For example, initializing a model for prediction by reading the configuration file from a remote model repository:

```python
from modelscope.pipelines import pipeline
word_segmentation = pipeline('word-segmentation')
input_str = 'Today the weather is nice, perfect for going out'
print(word_segmentation(input_str))
```

During training and testing, you can download the configuration file from the model repository to your local machine, or create a new configuration file locally and specify the local configuration path for use:

```python
from modelscope.trainers import build_trainer
from modelscope.msdatasets import MsDataset

model_id = 'damo/nlp_structbert_sentence-similarity_chinese-tiny'
# Ant Financial Question Matching Corpus (AFQMC) dataset
dataset_id = 'clue'

train_dataset = MsDataset.load('clue', subset_name='afqmc', split='train')
eval_dataset = MsDataset.load('clue', subset_name='afqmc', split='validation')

kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    max_epochs=2,
    #cfg_file='your_configuration.json', # Point to custom configuration file
    work_dir='tmp')


trainer = build_trainer(default_args=kwargs)

trainer.train()
```

# Configuration File Format

Configuration files primarily contain the following top-level fields:

- **framework** (required): The framework required for model execution, such as pytorch, tensorflow, kaldi, etc.
- **task** (required): The task type(s) supported by the model, can be a string or a list of strings.
- **pipeline** (required): The pipeline type used for inference.
- **model** (optional): Configuration parameters related to model instantiation. Please refer to the corresponding model library's `configuration.json` examples for specific parameters.
- **dataset** (optional): Dataset configuration information used during training and evaluation.
- **preprocessor** (optional): Preprocessing configuration used during training and evaluation.
- **train** (optional): Configuration for hyperparameters during the training process, such as model save directory, number of training epochs, optimizer, learning rate, etc.
- **evaluation** (optional): Configuration for data reading and evaluation metrics during the evaluation process.

## Detailed Configuration Explanation

The following explanations provide both JSON and Python configuration approaches. In the Python configuration approach, you can configure the entire information for a specific field:

```py
cfg['model'] = {'type': 'bert', 'hidden_size': 512}
```

You can also configure a specific field:

```py
# Assuming the original cfg contains the model.hidden_size field
cfg.model.hidden_size = 512
# Alternatively: cfg['model']['hidden_size'] = 512
```

### framework

The computational framework of the model, supports only string:

```py
# JSON configuration approach
{
  "framework": "pytorch"
}
# Python configuration approach
cfg.framework = 'pytorch'
```

### task

The task type of the model, supports only string:

```py
# JSON configuration approach
{
  "task": "text-classification"
}
# Python configuration approach
cfg.task = 'text-classification'
```

### pipeline

Model inference configuration, supports dictionary:

```py
# JSON configuration approach
{
  "pipeline": {
    # type configures the pipeline name
    "type": "text-classification-pipeline",
    # other parameters for the pipeline class
    "max_length": 128
  }
}
# Python configuration approach
cfg.pipeline = {'type': 'text-classification-pipeline', 'max_length': 128}
```

### model

Model configuration, supports dictionary:

```py
# JSON configuration approach
{
  "model": {
    # type configures the model name
    "type": "bert",
    # other parameters for the model
    "hidden_size": 512
  }
}
# Python configuration approach
cfg.model = {'type': 'bert', 'hidden_size': 512}
```

### preprocessor

Preprocessor configuration, supports dictionary:

```py
# JSON configuration approach
{
  "preprocessor": {
    # type configures the preprocessor name
    "type": "sen-cls-tokenizer",
    # other parameters for the preprocessor
    "max_length": 128
  }
}
# Python configuration approach
cfg.preprocessor = {'type': 'sen-cls-tokenizer', 'max_length': 128}
```

The preprocessor field also supports separate configuration for train (training) and val (evaluation and inference) preprocessors, which are specified by the mode field in `Preprocessor.from_pretrained`:

```py
{
  "preprocessor": {
    "train": {
      "type": xxx,
      ...
    },
    "val": {
      "type": xxx,
      ...
    }
  }
}
# train mode uses 'train', eval/inference mode uses 'val'
Preprocessor.from_pretrained(some-model, mode='train')
```

### train

#### work_dir

Configure the working directory:

```py
# JSON configuration approach
{
  "train": {
    "work_dir": "/tmp"
  }
}
# Python configuration approach
cfg.train.work_dir = '/tmp'
```

#### max_epochs

Configure training epochs:

```py
# JSON configuration approach
{
  "train": {
    "max_epochs": 10
  }
}
# Python configuration approach
cfg.train.max_epochs = 10
```

#### dataloader

Configure PyTorch DataLoader constructor parameters, such as batch_size, workers, etc.:

```py
# JSON configuration approach
{
	"train": {
    # Other parameters refer to PyTorch DataLoader constructor parameters: https://pytorch.org/docs/stable/data.html#torch.utils.data.DataLoader
    "dataloader": {
      "batch_size_per_gpu": 16,
      "workers_per_gpu": 0
    }
  }
}
# Python configuration approach
cfg.train.dataloader.batch_size_per_gpu = 16
cfg.train.dataloader.workers_per_gpu = 0
```

#### optimizer

Configure optimizer information, supports dictionary. The type field is the optimizer name (class name), and fields other than options are constructor parameters for the optimizer:

```py
# JSON configuration approach
{
	"train": {
    # ModelScope registers all optimizers from the current version of PyTorch by default
    # Fill in constructor parameters according to type. Refer to PyTorch documentation: https://pytorch.org/docs/stable/optim.html
		"optimizer": {
      # PyTorch's SGD optimizer
      "type": "SGD",
      # Learning rate, one of SGD's constructor parameters
      "lr": 0.01,
      # options is not an optimizer constructor parameter, can include optimization options
      "options": {
        # gradient cumulative interval, default 1
        "cumulative_iters": 1,
        # kwargs for torch.nn.utils.clip_grad.clip_grad_norm_, including
        # max_norm, norm_type, etc., default None (no clipping)
        "grad_clip": None
      }
    }
  }
}
# Python configuration approach
cfg.train.optimizer.type = 'SGD'
cfg.train.optimizer.lr = 1e-2
cfg.train.optimizer['options'] = {'cumulative_iters': 1, 'grad_clip': None}
```

#### lr_scheduler

Configure learning rate scheduler information, supports dictionary. The type field is the scheduler name (class name), and fields other than options are constructor parameters for the lr_scheduler:

```py
# JSON configuration approach
{
	"train": {
    # ModelScope registers all lr_schedulers from the current version of PyTorch by default
    # Fill in constructor parameters according to type. Refer to PyTorch documentation: https://pytorch.org/docs/stable/optim.html
		"lr_scheduler": {
      # PyTorch's StepLR
      "type": "StepLR",
      # StepLR's step_size parameter
      "step_size": 2,
      # options is not an lr_scheduler constructor parameter, can include optimization options
      "options": {
        # Whether to decay learning rate by epoch, can be set to by_epoch/by_step
        "lr_strategy": 'by_epoch',
        # Can pass a warmup scheduler for lr warmup
        # Supports ConstantWarmup/LinearWarmup/ExponentialWarmup, check API documentation for constructor parameters
        "warmup": None
      }
    }
  }
}
# Python configuration approach
cfg.train.lr_scheduler.type = 'StepLR'
cfg.train.lr_scheduler.lr = 2
cfg.train.lr_scheduler['options'] = {'lr_strategy': 'by_epoch', 'warmup': None}
```

##### Important Notes on Gradient Accumulation Steps

As mentioned in the optimizer section, when `cumulative_iters` is configured to be >1, the training pseudo-code is as follows:

```py
for i, batch in enumerate(data_loader):
    loss = model(batch)
    loss /= cumulative_iters
    loss.backward()
    if i % cumulative_iters == 0:
        optimizer.step()
        optimizer.zero_grad()
    # train.lr_scheduler.options.lr_strategy='by_step'
    lr_scheduler.step()
```

In ModelScope, if `train.lr_scheduler.options.lr_strategy='by_step'`, the lr_scheduler executes step every iteration (not only when `i % cumulative_iters == 0`). Please note this when initializing the lr_scheduler.

#### logging

Configure logging information during training:

```py
# JSON configuration approach
{
	"train": {
    # ModelScope registers all lr_schedulers from the current version of PyTorch by default
    # Fill in constructor parameters according to type. Refer to PyTorch documentation: https://pytorch.org/docs/stable/optim.html
		"logging": {
      # Whether to log by epoch, false means by iteration
      "by_epoch": true,
      # logging interval
      "interval": 10
    }
  }
}
# Python configuration approach
cfg.train.logging.by_epoch = True
cfg.train.logging.interval = 10
```

#### checkpoint

Configure how checkpoints are saved during training:

```py
# JSON configuration approach
{
	"train": {
    # ModelScope registers all lr_schedulers from the current version of PyTorch by default
    # Fill in constructor parameters according to type. Refer to PyTorch documentation: https://pytorch.org/docs/stable/optim.html
		"checkpoint": {
      # Periodically save checkpoints
      "period": {
        # by_epoch/by_step/no
        "save_strategy": 'by_epoch',
        # save interval
        "interval": 2,
        # maximum number of checkpoints to save
        "max_checkpoint_num": 2,
        # whether to push to ModelHub after saving checkpoint
        "push_to_hub": True,
        # hub repo id
        "hub_repo_id": "some-group/some-model",
        # user token
        "hub_token": "user-token",
        # whether it's a private repository
        "private_hub": True
      },
      # Save checkpoint corresponding to best metric
      "best": {
        # whether to save best checkpoint, setting to False disables saving
        "save_best": True,
        # maximum number of checkpoints to save
        "max_checkpoint_num": 2,
        # metric key to determine if current checkpoint is historically best
        "metric_key": "f1-micro",
        # whether to push to ModelHub after saving checkpoint
        "push_to_hub": True,
        # hub repo id
        "hub_repo_id": "some-group/some-model",
        # user token
        "hub_token": "user-token",
        # whether it's a private repository
        "private_hub": True
      }
    }
  }
}
# Python configuration approach
cfg.train.checkpoint.period = {'save_strategy': 'by_epoch',
                               'interval': 2,
                               'max_checkpoint_num': 2}
cfg.train.checkpoint.best = {'interval': 2,
                             'max_checkpoint_num': 2,
                             'metric_key': 'f1-micro'}
```

Note: The ModelHub push capability operates asynchronously. When a previous push to the hub is in progress, subsequent pushes will not execute. Commit messages use training progress strings similar to `epoch-1`.

#### hooks

Hooks are the plugin mechanism for EpochBasedTrainer. When using additional training strategies during training, you can configure them. The hook configuration approach is as follows:

```py
# JSON configuration approach
{
  "train": {
    "hooks": [
      {
        # hook class name
        "type": ...,
        # other constructor parameters
        ...
      },
      {
        "type": ...,
        ...
      }
    ]
  }
}
# Python configuration approach
cfg.train.hooks.append({'type': xxx, ...})
```

Currently supported hooks for EpochBasedTrainer include:

Mixed precision training:

- ApexAMPOptimizerHook: Used for mixed precision training with apex
- TorchAMPOptimizerHook: Used for mixed precision training with native PyTorch

Multi-node multi-GPU training:

- DDPHook: Used for DDP training
- MegatronHook: Used for model training with Megatron components
- DeepSpeedHook: Used for DeepSpeed training

Training control:

- EarlyStopHook: Used to early stop training when a metric fails to improve over multiple training iterations

Visualization:

- TensorboardHook: Used for TensorBoard visualization

### evaluation

#### dataloader

Configure DataLoader constructor parameters for evaluation, same parameter list as train.dataloader:

```py
# JSON configuration approach
{
	"evaluation": {
    # Other parameters refer to PyTorch DataLoader constructor parameters
    "dataloader": {
      "batch_size_per_gpu": 16,
      "workers_per_gpu": 0
    }
  }
}
# Python configuration approach
cfg.evaluation.dataloader.batch_size_per_gpu = 16
cfg.evaluation.dataloader.workers_per_gpu = 0
```

#### metrics

Configure metrics used during evaluation. ModelScope provides customized Metric classes for supported tasks, simply configure them here:

```py
# JSON configuration approach
{
  "evaluation":{
    "metrics": ["seq-cls-metric"]
    # Also supports: "metrics": "seq-cls-metric"
    # Also supports: "metrics": [{"type": "seq-cls-metric", ...}], check model evaluation documentation for specific parameters
  }
}
# Python configuration approach
cfg.evaluation.metrics = 'seq-cls-metric'
```

#### period

Evaluation periodic execution approach and related parameters:

```py
# JSON configuration approach
{
  "evaluation":{
    "period": {
      # Whether to run evaluation by epoch
      "eval_strategy": 'by_epoch'
      # evaluation interval
      "interval": 300,
    }
  }
}
# Python configuration approach
cfg.evaluation.period = {'eval_strategy': 'by_epoch', 'interval': 300}
```

## Configuration File Examples

A complete **minimal configuration file** example is shown below, usable only when calling pipeline inference:

```py
{
    "framework": "pytorch",
    "task": "text-classification",
    "pipeline": {
       "type": "sentiment-classification"
    }
}
```


A common configuration file example is shown below:

```json
{
    "framework": "pytorch",
    "task": "sentence-similarity",
    "pipeline": {
        "type": "sentence-similarity"
    },
    "preprocessor": {
        "type": "sen-cls-tokenizer",
        "first_sequence": "sentence1",
        "second_sequence": "sentence2"
    },
    "model": {
        "type": "structbert"
    },
    "dataset": {
        "train": {
            "name": "modelscope/afqmc_small",
            "split": "train"
        },
        "val": {
            "name": "modelscope/afqmc_small",
            "split": "val"
        }
    },
    "train": {
        "work_dir": "/tmp",
        "max_epochs": 10,
        "dataloader": {
            "batch_size_per_gpu": 2,
            "workers_per_gpu": 1
        },
        "optimizer": {
            "type": "SGD",
            "lr": 0.01
        },
        "lr_scheduler": {
            "type": "StepLR",
            "step_size": 2
        },
        "hooks": [{
            "type": "CheckpointHook",
            "interval": 1
        }]
    },
    "evaluation": {
        "dataloader": {
            "batch_size_per_gpu": 2,
            "workers_per_gpu": 1,
            "shuffle": false
        },
        "metrics": ["seq-cls-metric"]
    }
}
```