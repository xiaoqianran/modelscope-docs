<!-- modelscope-docs: Configuration详解 | sdk/tutorials/configuration/configuration_CN.md -->

# 配置文件介绍

ModelScope框架的核心思想之一是完全的配置化。在ModelHub的模型文件中，必然存在名为configuration.json或configuration.yaml的文件，这个配置文件存储了各式各样的配置信息，用以进行数据预处理、模型推理、训练和评估，确保模型推理、训练评估过程的可复现性。 因此，用户可以直接将模型文件传入trainer中训练，或拷贝配置到新的模型中来复现SOTA模型效果。

配置文件的格式支持`json`和`yaml`格式，模型仓库中默认的配置文件名称为`configuration.json`，ModelScope支持从模型仓库自动读取配置文件进行推理、训练，也支持使用本地配置文件方式进行相关操作。

# 读取和使用模型的配置文件

ModelScope有专门的API来**读取配置文件**。如果您需要读取模型的配置，可以按照如下代码进行：
```python
from modelscope.utils.hub import read_config
cfg = read_config('damo/nlp_structbert_sentence-similarity_chinese-base')
print(cfg)
```

如果您想**找到配置文件所在的文件目录**，可以使用snapshot_download的能力：
```python
from modelscope.utils.hub import snapshot_download
model_dir = snapshot_download('damo/nlp_structbert_sentence-similarity_chinese-base')
print(model_dir) # ~/.cache/modelscope/hub/*
```

一般来说，ModelScope在您使用训练和推理过程中会**隐式地**加载配置文件，您无需关心这一过程。
例如从远端模型仓库读取配置文件初始化模型预测：

```python
from modelscope.pipelines import pipeline
word_segmentation = pipeline('word-segmentation')
input_str = '今天天气不错，适合出去游玩'
print(word_segmentation(input_str))
```

在训练和测试时，您可以从模型仓库下载配置文件到本地，也可以直接本地创建新的配置文件，指定本地配置路径进行使用：
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
    #cfg_file='your_configuration.json', #指向自定义的configuration文件
    work_dir='tmp')


trainer = build_trainer(default_args=kwargs)

trainer.train()
```

# 配置文件格式
配置文件主要包含如下一级字段:

- **framework**(必填)： 模型运行所需的框架， 例如pytorch，tensorflow，kaldi等。
- **task**(必填)： 模型所支持的任务类型，可以是str或者 str列表。
- **pipeline**(必选):  推理使用的pipeline类型。
- model (可选):  模型实例化相关参数配置，具体参数请直接参考对应模型库的configuration.json示例。
- dataset(可选):  训练评估过程中使用的数据集配置信息。
- preprocessor(可选): 训练评估过程中使用的预处理配置
- train(可选)：用以配置训练过程中的超参数，例如模型保存目录、训练轮数、优化器、学习率等参数。
- evaluation(可选): 用以配置评估过程中数据读取、评估指标等参数。

## 配置文件详解

以下说明中会给出json和python配置两种方式。在python配置方式中可以配置某个field的整体信息：

```py
cfg['model'] = {'type': 'bert', 'hidden_size': 512}
```

也可以配置某个具体字段：

```py
# 假定原始cfg中model.hidden_size字段存在
cfg.model.hidden_size = 512
# 也可以cfg['model']['hidden_size'] = 512
```

### framework 

模型的计算框架，仅支持str:

```py
# json配置方式
{
  "framework": "pytorch"
}
# python配置方式
cfg.framework = 'pytorch'
```

### task

模型的任务类型，仅支持str：

```py
# json配置方式
{
  "task": "text-classification"
}
# python配置方式
cfg.task = 'text-classification'
```

### pipieline

模型推理配置，支持dict：

```py
# json配置方式
{
  "pipeline": {
    # type配置pipeline名称
    "type": "text-classification-pipeline",
    # pipeline类的其他参数
    "max_length": 128
  }
}
# python配置方式
cfg.pipeline = {'type': 'text-classification-pipeline', 'max_length': 128}
```

### model

模型配置，支持dict：

```py
# json配置方式
{
  "model": {
    # type配置模型名称
    "type": "bert",
    # model的其他参数
    "hidden_size": 512
  }
}
# python配置方式
cfg.model = {'type': 'bert', 'hidden_size': 512}
```

### preprocessor 

预处理器配置，支持dict：

```py
# json配置方式
{
  "preprocessor": {
    # type配置预处理名称
    "type": "sen-cls-tokenizer",
    # preprocessor的其他参数
    "max_length": 128
  }
}
# python配置方式
cfg.preprocessor = {'type': 'sen-cls-tokenizer', 'max_length': 128}
```

preprocessor字段中还支持将train（训练）和val（评估和推理）分开配置两个预处理器，它们由Preprocessor.from_pretrained的mode字段指定：

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
# train mode使用train，eval/inference mode使用val
Preprocessor.from_pretrained(some-model, mode='train')
```

### train

#### work_dir

配置工作路径：

```py
# json配置方式
{
  "train": {
    "work_dir": "/tmp"
  }
}
# python配置方式
cfg.train.work_dir = '/tmp'
```

#### max_epochs

配置训练epoch：

```py
# json配置方式
{
  "train": {
    "max_epochs": 10
  }
}
# python配置方式
cfg.train.max_epochs = 10
```

#### dataloader

配置pytorch的DataLoader的构造参数，如batch_size，workers等：

```py
# json配置方式
{
	"train": {
    # 其它参数请参考pytorch的DataLoader构造参数:https://pytorch.org/docs/stable/data.html#torch.utils.data.DataLoader
    "dataloader": {
      "batch_size_per_gpu": 16,
      "workers_per_gpu": 0
    }
  }
}
# python配置方式
cfg.train.dataloader.batch_size_per_gpu = 16
cfg.train.dataloader.workers_per_gpu = 0
```

#### optimizer

配置优化器信息，支持dict，type字段是optimizer的名称（类名），除options外其他字段是optimizer的构造参数：

```py
# json配置方式
{
	"train": {
    # ModelScope默认会将当前版本的torch的optimizer都注册进去
    # 根据type填入其构造参数,可以查看torch文档：https://pytorch.org/docs/stable/optim.html
		"optimizer": {
      # torch的SGD optimizer
      "type": "SGD",
      # 学习率learning_rate，SGD的构造参数之一
      "lr": 0.01,
      # options不是optimizer的构造参数，可以填入优化选项
      "options": {
        # gradient cumulative interval, default 1
        "cumulative_iters": 1,
        # torch.nn.utils.clip_grad.clip_grad_norm_的kwargs，包含
        # max_norm，norm_type等，默认为None不进行clip
        "grad_clip": None
      }
    }
  }
}
# python配置方式
cfg.train.optimizer.type = 'SGD'
cfg.train.optimizer.lr = 1e-2
cfg.train.optimizer['options'] = {'cumulative_iters': 1, 'grad_clip': None}
```

#### lr_scheduler

配置lr scheduler信息，支持dict，type是Scheduler名称（类名），除options外其他字段是lr_scheduler的构造参数：

```py
# json配置方式
{
	"train": {
    # ModelScope默认会将当前版本的torch的lr_scheduler都注册进去
    # 根据type填入其构造参数, 可以查看torch文档：https://pytorch.org/docs/stable/optim.html
		"lr_scheduler": {
      # torch的StepLR
      "type": "StepLR",
      # StepLR的step_size参数
      "step_size": 2,
      # options不是lr_scheduler的构造参数，可以填入优化选项
      "options": {
        # 是否按照epoch进行学习率衰减, 可以设置为by_epoch/by_step
        "lr_strategy": 'by_epoch',
        # 可以传入一个warmup scheduler用于lr warmup
        # 支持ConstantWarmup/LinearWarmup/ExponentialWarmup，具体请查看API文档其构造参数
        "warmup": None
      }
    }
  }
}
# python配置方式
cfg.train.lr_scheduler.type = 'StepLR'
cfg.train.lr_scheduler.lr = 2
cfg.train.lr_scheduler['options'] = {'lr_strategy': 'by_epoch', 'warmup': None}
```

##### 对Gradient accumulation steps需要注意的地方

如optimizer章节表述，cumulative_iters可以配置为>1, 此时的训练伪代码如下：
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
在ModelScope中，如果train.lr_scheduler.options.lr_strategy='by_step'，lr_scheduler每个iter都会执行step（而不是i % cumulative_iters == 0时），在初始化lr_scheduler时需要注意这一点。

#### logging

配置训练过程的logging信息：

```py
# json配置方式
{
	"train": {
    # ModelScope默认会将当前版本的torch的lr_scheduler都注册进去
    # 根据type填入其构造参数, 可以查看torch文档：https://pytorch.org/docs/stable/optim.html
		"logging": {
      # 是否按照epoch进行logging，false为按照iter
      "by_epoch": true,
      # logging的间隔
      "interval": 10
    }
  }
}
# python配置方式
cfg.train.logging.by_epoch = True
cfg.train.logging.interval = 10
```

#### checkpoint

配置训练过程中保存checkpoint的方式：

```py
# json配置方式
{
	"train": {
    # ModelScope默认会将当前版本的torch的lr_scheduler都注册进去
    # 根据type填入其构造参数, 可以查看torch文档：https://pytorch.org/docs/stable/optim.html
		"checkpoint": {
      # 周期性保存checkpoint
      "period": {
        # by_epoch/by_step/no
        "save_strategy": 'by_epoch',
        # 保存的间隔
        "interval": 2,
        # 保存checkpoint数量的最大值
        "max_checkpoint_num": 2,
        # 是否在保存checkpoint后推送modelhub
        "push_to_hub": True,
        # hub repo id
        "hub_repo_id": "some-group/some-model",
        # 用户token
        "hub_token": "user-token",
        # 是否是私有仓库
        "private_hub": True
      },
      # 保存最优metric对应的checkpoint
      "best": {
        # 是否存储best checkpoint，设置为False时，存储不生效
        "save_best": True,
        # 保存checkpoint数量的最大值
        "max_checkpoint_num": 2,
        # 根据指定的指标判断当前checkpoint是否为历史最优
        "metric_key": "f1-micro",
        # 是否在保存checkpoint后推送modelhub
        "push_to_hub": True,
        # hub repo id
        "hub_repo_id": "some-group/some-model",
        # 用户token
        "hub_token": "user-token",
        # 是否是私有仓库
        "private_hub": True
      }
    }
  }
}
# python配置方式
cfg.train.checkpoint.period = {'save_strategy': 'by_epoch',
                               'interval': 2,
                               'max_checkpoint_num': 2}
cfg.train.checkpoint.best = {'interval': 2,
                             'max_checkpoint_num': 2,
                             'metric_key': 'f1-micro'}
```

注意：推送modelhub的能力是异步进行的，前一次推送hub进行中时，后一次推送不会执行。提交信息使用了训练进度类似`epoch-1`的字符串。

#### hooks

hooks是EpochBasedTrainer的plugin机制，在训练时使用额外的训练策略时可以配置。hooks的配置方式如下：

```py
# json配置方式
{
  "train": {
    "hooks": [
      {
        # hook类名
        "type": ...,
        # 其他的构造参数
        ...
      },
      {
        "type": ...,
        ...
      }
    ]
  }
}
# python配置方式
cfg.train.hooks.append({'type': xxx, ...})
```

目前EpochBasedTrainer支持的hooks有：

半精度训练：

- ApexAMPOptimizerHook：使用apex进行半精度训练使用
- TorchAMPOptimizerHook:  使用torch native进行半精度训练使用

多机多卡训练：

- DDPHook: 用于DDP训练使用
- MegatronHook: 用于使用Megatron组件的模型训练使用
- DeepSpeedHook：用于使用DeepSpeed训练使用

训练控制：

- EarlyStopHook：用于在某个metric多次训练无法提升时提早结束训练时使用

可视化：

- TensorboardHook：用于TensorBoard可视化展示

### evaluation

#### dataloader

配置评估时的DataLoader的构造参数，参数列表同train.dataloader：

```py
# json配置方式
{
	"evaluation": {
    # 其它参数请参考pytorch的DataLoader构造参数
    "dataloader": {
      "batch_size_per_gpu": 16,
      "workers_per_gpu": 0
    }
  }
}
# python配置方式
cfg.evaluation.dataloader.batch_size_per_gpu = 16
cfg.evaluation.dataloader.workers_per_gpu = 0
```

#### metrics

配置评估时使用的Metric。ModelScope为支持的任务提供了定制的Metric class，仅需把它们配置在这里：

```py
# json配置方式
{
  "evaluation":{
    "metrics": ["seq-cls-metric"]
    # 也支持："metrics": "seq-cls-metric"
    # 也支持："metrics": [{"type": "seq-cls-metric", ...}]，具体的参数请参考模型的评估文档
  }
}
# python配置方式
cfg.evaluation.metrics = 'seq-cls-metric'
```

#### period

evaluation周期性运行的方式以及相关参数：

```py
# json配置方式
{
  "evaluation":{
    "period": {
      # 是否按照epoch运行evaluation
      "eval_strategy": 'by_epoch'
      # evaluation 的间隔
      "interval": 300,
    }
  }
}
# python配置方式
cfg.evaluation.period = {'eval_strategy': 'by_epoch', 'interval': 300}
```

## 配置文件示例

一个完整的**最小配置文件**示例如下，仅在调用pipeline推理时可用：

```py
{
    "framework": "pytorch",
    "task": "text-classification",
    "pipeline": {
       "type": "sentiment-classification"
    }
}
```


一个常见的配置文件示例如下
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

