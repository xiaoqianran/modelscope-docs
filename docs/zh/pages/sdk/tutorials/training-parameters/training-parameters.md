<!-- modelscope-docs: 训练的详细参数 | sdk/tutorials/training-parameters/training-parameters_CN.md -->

# 训练的详细参数

## 更新配置参数

很多时候配置文件configuration.json的参数无法满足您的需求，或某些配置参数一定要在运行时填入，比如数据集信息、预处理器传入的数据集的key、optimizer的lambda方法、lr_scheduler的迭代次数等，这时就需要在运行时动态调整参数。

- 可以通过dump一个新文件来更新参数：

```python
import os
from modelscope.utils.hub import read_config
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
# 读取model中的cfg文件
cfg = read_config(model_id)
# 直接更新其中的参数
cfg.train.max_epochs = 5
cfg.preprocessor.train['label2id'] = {'0': 0, '1': 1}
cfg.preprocessor.val['label2id'] = {'0': 0, '1': 1}
cfg.train.work_dir = '/tmp'
cfg_file = os.path.join('/tmp', 'config.json')
# 将参数写入新的配置文件并传入trainer
cfg.dump(cfg_file)
kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    cfg_file=cfg_file)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

- 也可以通过cfg_modify_fn动态修改参数：

```python
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer


def cfg_modify_fn(cfg):
    cfg.train.max_epochs = 5
    cfg.preprocessor.train['label2id'] = {'0': 0, '1': 1}
    cfg.preprocessor.val['label2id'] = {'0': 0, '1': 1}
    cfg.train.work_dir = '/tmp'
    # 最后返回更新后的cfg
    return cfg


train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')

kwargs = dict(
    model='damo/nlp_structbert_sentence-similarity_chinese-base',
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    # 通过cfg_modify_fn直接修改cfg内容，在训练后会直接将修改后的cfg保存到configuration.json中
    cfg_modify_fn=cfg_modify_fn)

trainer = build_trainer(name='trainer', default_args=kwargs)
trainer.train()
```

## <div id='load_dataset'>载入数据集</div>

ModelScope一般建议在外部构建数据集后传入trainer：

```jax
from modelscope.msdatasets import MsDataset
train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')
```

可选地，如果您想在配置文件中配置数据集信息，下面展示了一种基本的做法：

```py
import os
from modelscope.utils.hub import read_config
from modelscope.trainers import build_trainer

model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'


def cfg_modify_fn(cfg):
    cfg.train.max_epochs = 5
    cfg.train.work_dir = '/tmp'
    cfg.preprocessor.train['label2id'] = {'0': 0, '1': 1}
    cfg.preprocessor.val['label2id'] = {'0': 0, '1': 1}
    cfg.preprocessor.label = 'label'
    # 设置训练数据集和验证数据集
    cfg.dataset = {
        'train': {
            'name': 'clue',
            'subset_name': 'afqmc',
            'split': 'train',
        },
        'val': {
            'name': 'clue',
            'subset_name': 'afqmc',
            'split': 'validation',
        },
    }
    return cfg


kwargs = dict(
    model=model_id,
    cfg_modify_fn=cfg_modify_fn)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

trainer可以支持输入数据集是一个列表，在这时，trainer内部会使用[TaskDataset](#TaskDataset)对数据集进行shuffle来训练。

## 预处理过程

- 如果配置中存在预处理器字段，trainer会在训练过程内部自动调用预处理过程，其过程类似于如下伪代码：

```py
for i, mini_batch in enumerate(data_loader):
    mini_batch = preprocesser(mini_batch)
    loss = model.forward(mini_batch)
    ...
```

某些模态（如NLP）需要更新预处理配置的部分参数：
```py
# 配置句子1的key
cfg.preprocessor.first_sequence='sentence1'
# 配置句子2的key
cfg.preprocessor.second_sequence='sentence2'
# 配置label字段的key
cfg.preprocessor.label='label'
# 配置label id mapping
cfg.preprocessor.label2id={'0':0, '1':1}
```

预处理在训练中需要配置的参数可以查看[各任务最佳实践](../各任务最佳实践/任务的介绍.md)。

- 数据预处理过程也可以在训练前自行处理，适配于以下场景：

  - 数据量过大、数据处理比较复杂导致训练时预处理过程较大影响了运行时长

  - 数据预处理的临时结果需要被缓存下来以备下次使用

  - 预处理器不存在，或不好配置

如下代码展示了前置预处理过程的例子：

```python
import os
from modelscope.utils.hub import read_config, snapshot_download
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.preprocessors import Preprocessor
from transformers import default_data_collator
train_dataset = MsDataset.load('clue', subset_name='afqmc', split='train').to_hf_dataset()
eval_dataset = MsDataset.load('clue', subset_name='afqmc', split='validation').to_hf_dataset()
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model_dir = snapshot_download(model_id)
# 读取model中的cfg文件
cfg = read_config(model_dir)
cfg.train.work_dir = '/tmp'
# config的预处理字段置为空，以免trainer自动预处理
cfg.preprocessor = None
cfg_file = os.path.join('/tmp', 'config.json')
cfg.dump(cfg_file)

train_preprocessor = Preprocessor.from_pretrained(model_dir,
                                                  preprocessor_mode='train',
                                                  first_sequence='sentence1',
                                                  second_sequence='sentence2',
                                                  label='label',
                                                  label2id={'0':0, '1':1},
                                                  sequence_length=256)
eval_preprocessor = Preprocessor.from_pretrained(model_dir,
                                                 preprocessor_mode='eval',
                                                 first_sequence='sentence1',
                                                 second_sequence='sentence2',
                                                 label='label',
                                                 label2id={'0':0, '1':1},
                                                 sequence_length=256)
train_dataset = train_dataset.map(train_preprocessor)
eval_dataset = eval_dataset.map(eval_preprocessor)
# 传入cfg_file，传入后cfg_file会替代model_dir中的cfg_file
kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    # trainer内部使用了torch.utils.data.dataloader.default_collate, 这个collator和hf的list返回格式不兼容，需要使用hf自己的data_collator
    data_collator=default_data_collator,
    cfg_file=cfg_file)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

总结来说，预处理在训练之前定义要注意几个地方：

1. 如果使用MsDataset进行map处理需要调用to_hf_dataset
2. cfg中的preprocessor需要置为空值
3. data_collator可能需要调整

### 如何实现一个预处理器

如果您需要实现一个自己的预处理器用于训练或推理，请查看[这里](./数据的预处理.md)。

## 注册新的Optimizer/LrScheduler

Trainer的Optimizers来自于在运行时注册进去的PyTorch native optimizers。因此您可以使用任何您当前torch版本支持的optimizer：
```json
{
    "train": {
        "optimizer": {
            "type": "AdamW",
            "lr": 1e-5
        }
    }
}
```

其中的type填写torch中optimizer的类名（大小写敏感），下面的其它参数填写该optimizer构造参数。

同样，lr_scheduler来自于PyTorch native LrSchedulers，您可以使用当前torch版本支持的lr_scheduler:
```json
{
    "train": {
        "lr_scheduler": {
            "type": "StepLR"
        }
    }
}
```

### 构造中传入

Trainer的构造支持传入`optimizers`参数，可以传入optimizer和lr_scheduler的Tuple：
```python
import os
from torch.optim import AdamW
from modelscope.hub.snapshot_download import snapshot_download
from torch.optim.lr_scheduler import StepLR
from modelscope.models import Model
from modelscope.trainers import build_trainer
from modelscope.msdatasets import MsDataset
model_dir = snapshot_download('damo/nlp_structbert_sentiment-classification_chinese-base')
model = Model.from_pretrained(model_dir)
optimizer = AdamW(model.parameters(), lr=1e-5)
lr_scheduler = StepLR(optimizer, step_size=2)
dataset = MsDataset.load(
    'clue', subset_name='afqmc',
    split='train').to_hf_dataset().select(range(2))
kwargs = dict(
    model=model,
    cfg_file=os.path.join(model_dir, 'configuration.json'),
    train_dataset=dataset,
    eval_dataset=dataset,
    optimizers=(optimizer, lr_scheduler),
    work_dir='/tmp')
trainer = build_trainer(default_args=kwargs)
```

### 注册后在config中引用

#### 注册optimizer并在config中使用

您可以通过register_module来注册optimizers：
```py
from transformers import AdamW
from modelscope.trainers.optimizer import OPTIMIZERS
# 将类注册进去
OPTIMIZERS.register_module(module_name='TransformerAdamW', module_cls=AdamW)
```

#### 注册LrScheduler并在config中使用

您可以通过register_module来注册lr_scheduler：
```py
from transformers import get_linear_schedule_with_warmup
from modelscope.trainers.lrscheduler import LR_SCHEDULER
# 将方法注册进去
LR_SCHEDULER.register_module(module_name='TransformerLinear', module_cls=get_linear_schedule_with_warmup)
```


之后就可以通过定制cfg来使用`TransformerAdamW`或者`TransformerLinear`：

```python
import os
from modelscope.utils.hub import read_config
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
# 读取model中的cfg文件
cfg = read_config(model_id)
# 直接更新其中的参数
cfg.train.max_epochs = 5
cfg.train.dataloader.workers_per_gpu=0
cfg.evaluation.dataloader.workers_per_gpu=0
cfg.preprocessor.train['label2id'] = {'0': 0, '1': 1}
cfg.preprocessor.val['label2id'] = {'0': 0, '1': 1}
cfg.train.work_dir = '/tmp'
cfg.train.optimizer = {
    'type': 'TransformerAdamW'
}
cfg.train.lr_scheduler = {
    'type': 'TransformerLinear',
    'num_warmup_steps': 10,
    'num_training_steps': 200,
}
cfg_file = os.path.join('/tmp', 'config.json')
cfg.dump(cfg_file)
kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    cfg_file=cfg_file)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

## TaskDataset

TaskDataset是ModelScope特有的设计。和模型、预处理器一样，这个组件也是通过注册进行自动调用的。一般来说，模型的训练过程是加载数据集、预处理、训练评估三部分，
但在一些特殊情况下，数据集需要在特定任务或特定模型下又特殊的处理，举例来说：
1. 某个模型在训练过程中需要同时加载多个训练数据集，以某种方式进行shuffle再输入dataloader
2. 某个任务需要加载一个正例和若干个负例，并将正负例在输入时进入一个batch

TaskDataset就是为了这样的场景而设计，也就是说，满足某些任务和模型的特定情境下需要（多个）数据集整体视角下的处理。
TaskDataset的基类如下：

```py
class TaskDataset(ABC):
    """The task dataset base class for all the task specific dataset processors.
    """

    def __init__(self,
                 datasets: Union[Any, List[Any]],
                 mode,
                 preprocessor=None,
                 **kwargs):
        super().__init__()
        self.mode = mode
        self.preprocessor = preprocessor
        self._inner_dataset = self.prepare_dataset(datasets)

    @abstractmethod
    def prepare_dataset(self, datasets: Union[Any, List[Any]]) -> Any:
        """Prepare a dataset.

        User can process the input datasets in a whole dataset perspective.
        This method also helps to merge several datasets to one.

        Args:
            datasets: The original dataset(s)

        Returns: A single dataset, which may be created after merging.

        """
        pass

    @abstractmethod
    def prepare_sample(self, data):
        """Preprocess the data fetched from the inner_dataset.

        If the preprocessor is None, the original data will be returned, else the preprocessor will be called.
        User can override this method to implement custom logics.

        Args:
            data: The data fetched from the dataset.

        Returns: The processed data.

        """
        pass
```
可以看到，TaskDataset默认关注mode（训练还是评估），是否有预处理过程，以及实际要操作的数据集。
trainer可以接受一个TaskDataset类型的输入（取代原本的数据集输入），但我们一般建议由trainer在内部自动调起TaskDataset，用户只需要传入自己的数据集对象即可。
在这时，mode和preprocessor（如trainer中存在）会由trainer自动传入，_inner_dataset是您在构造中或配置中定义的训练/评估数据集，也会被trainer传入init中。

TaskDataset的注册是任务+模型式的，也就是说，只要在模型文件中指定了模型名称和任务模型，在训练时对应的TaskDataset就会被使用。

### 写一个新的TaskDataset
如果您使用的是Pytorch，您可以直接继承TorchTaskDataset，它继承了PyTorch的Dataset：
```py
from modelscope.msdatasets.task_datasets import TorchTaskDataset
from typing import Any, List, Union
class CustomDataset(TorchTaskDataset):

    def __init__(self,
                 datasets: Union[Any, List[Any]],
                 mode,
                 preprocessor=None,
                 **kwargs):
        super().__init__(datasets, mode, preprocessor, **kwargs)

    def __getitem__(self, item):
        # TODO Write how to fetch an data item here
        pass

    def prepare_dataset(self, datasets: Union[Any, List[Any]]) -> Any:
        # TODO This will be called when the trainer is initing, so you can 
        # write how to mix or prepare the input datasets.
        pass
    def prepare_sample(self, data):
        # how to prepare the sample, by default it will call the preprocessor(if exists in trainer) to do this.
        pass
```

在您的main方法或其他会被执行的地方调用：
```py
from modelscope.msdatasets.task_datasets import TASK_DATASETS
TASK_DATASETS.register_module(module_name='my-custom-model', group_key='my-custom-task', module_cls=CustomDataset)
```

这样，在trainer使用您的模型进行训练时就会自动加载这个TaskDataset了。值得注意的是，TaskDataset init结束后会被传入trainer对象，您可以
在您的TaskDataset内部使用它，比如获得配置：
```py
print(self.trainer.cfg)
```

## 模型的验证
很多模型的配置中，训练过程没有配置交叉验证。如果您想在训练时同步进行交叉验证可以在configuration.json中添加一个EvaluationHook，具体配置如下：
```json
{
   ...
  "train": {
     ...
      "hooks": [
          ...
        {
          "type": "EvaluationHook",
          # 是否每个epoch进行一次验证，false的时候代表按iter验证
          "by_epoch": false,
          # 多少个epoch/iter进行一次验证
          "interval": 100
      }]
  },

}
```

用户可以根据自己实际情况进行调整配置文件，也可自行注册相应hook，并通过type字段注册在配置文件中进行调用。
关于hook的详细说明请参考文档：[回调函数机制详解](./回调函数机制.md)


## 模型的保存与后续使用

### 模型保存的配置

ModelScope支持两种模型保存的Hook，分别是CheckpointHook和BestCkptSaverHook。 

这两种存储策略都会存储两类文件：

- 在work_dir中存储的*.pth文件，这类文件用于恢复训练，里面包含了模型的state_dict、optimizer/lr_scheduler的state_dict、trainer的random_state、epoch_num、iter_num等信息
  - pth文件一般用于调用trainer.train/evaluate/predict方法的checkpoint_path参数中
  - pth文件分为模型文件(epoch\_*.pth)和trainer文件(epoch\_\*\_trainer_state.pth)
- 在{work_dir}中的output/output_best中存储的文件，是训练时产生的用于推理使用的文件，包含了模型的bin文件和各类save_pretrained方法存储下来的配置，其中的bin文件来自于pth文件的硬链接，这两个目录在训练开始时就会被准备好。
  - CheckpointHook**周期性存储pth文件**并硬链接模型statedict文件到output目录中
  - BestCkptSaverHook在**每次有更好的metric时存储pth文件**并硬链接模型statedict文件到output_best目录中

#### CheckpointHook

这是ModelScope`默认`使用的存储模型hook，如果您在配置文件中没有配置，它会被默认添加到hooks中，它的作用是默认每个epoch存储一次模型。如果想要覆盖这一效果，您可以这样配置：
```json
{
   ...
  "train": {
     ...
      "hooks": [
          ...
        {
            # Save every 100 iters(not epochs)
            "type": "CheckpointHook",
            "by_epoch": false,
            "interval": 100
        }]
  },

}
```

#### BestCkptSaverHook

一般来说用户可能会希望只存储最佳的模型文件，ModelScope也提供了对应的机制来达到这一目的。
- 首先需要保证eval_dataset会被传入trainer（或通过配置文件的方式）
- 配置文件增加或改为BestCkptSaverHook

```json
{
   ...
  "train": {
     ...
      "hooks": [
          ...
        {
            "type": "BestCkptSaverHook",
            "metric_key": "accuracy",
            "by_epoch": false,
            "rule": "max",
            "interval": 100
        }]
  }
}
```

"metric_key"用来表示Metric返回值中用来实际进行比较的key，以"rule"的方式比较并存储模型文件。有关Metric的具体使用可以参考[这里](./模型的评估.md)。

有关这两个保存文件的Hook的具体参数请参考[回调参数机制详解](./回调函数机制.md)。

#### 使用文件进行训练或推理

以上任意一种CkptHook都会存储两种类型的文件。

- 用来恢复训练的文件
将上述pth文件加载后就可以继续训练或验证：
```text
import os
trainer.train(os.path.join(trainer.work_dir, 'a-pth-file.pth'))
# trainer.evaluate(os.path.join(trainer.work_dir, 'a-pth-file.pth'))
# trainer.predict(predict_datasets=some_dataset, saving_fn=some_callback, checkpoint_path=os.path.join(trainer.work_dir, 'a-pth-file.pth'))
```

- 用来推理的文件
将上述output/output_best文件夹使用pipeline加载即可进行推理，有关pipeline的使用参考[这里](../模型推理Pipeline.md)。

#### 使用其他框架的dataset进行训练

ModelScope支持使用PyTorch框架的Dataset或其他自定义的Dataset进行训练，只需要该Dataset具有\_\_getitem\_\_方法（或者说，支持可以传入torch的DataLoader中即可）。
您只需要将该dataset传入trainer构造方法的train_dataset和eval_dataset参数中。

#### 使用torch的Module进行训练

ModelScope的trainer支持训练torch.nn.Module，前提是您必须传入对应的configuration.json。

## 分布式训练

### 数据并行

首先，准备训练脚本，并将下列代码保存到例如`./train.py`脚本中：

```python
import os
from modelscope.trainers import build_trainer

# 指定工作目录
tmp_dir = "./tmp"

# 配置参数
kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    work_dir=tmp_dir,
    launcher='pytorch'  # 分布式启动方式
)

# 实例化trainer对象
trainer = build_trainer(default_args=kwargs)

# 调用train接口进行训练
trainer.train()
```

然后启动分布式训练：

**PyTorch：**

**单机多卡：**

```shell
python -m torch.distributed.launch --use_env --nproc_per_node=${NUMBER_GPUS} --master_port=${MASTER_PORT} ./train.py
```

- nproc_per_node：当前主机创建的进程数（使用的GPU个数）， 例如`--nproc_per_node=8`。
- master_port：主节点的端口号，例如`--master_port=29527`。

**多机多卡：**

以两个节点为例。

节点1：

```shell
python -m torch.distributed.launch  --use_env --nproc_per_node=${NUMBER_GPUS} --nnodes=2 --node_rank=0 --master_addr=${YOUR_MASTER_IP_ADDRESS} --master_port=${MASTER_PORT} ./train.py
```

节点2：

```shell
python -m torch.distributed.launch  --use_env --nproc_per_node=${NUMBER_GPUS} --nnodes=2 --node_rank=1 --master_addr=${YOUR_MASTER_IP_ADDRESS} --master_port=${MASTER_PORT} ./train.py
```

- nproc_per_node：当前主机创建的进程数（使用的GPU个数）， 例如`--nproc_per_node=8`。
- nnodes：节点的个数。
- node_rank：当前节点的索引值。
- master_addr：主节点的ip地址，例如`--master_addr=104.171.200.62`。
- master_port：主节点的端口号，例如`--master_port=29527`。

恭喜，你完成了一次使用数据并行的模型分布式训练！😀

### 模型并行

目前在 modelscope 中已有 GPT-3，PLUG，GPT-MOE 等模型支持模型并行训练，以下以 GPT-3 大模型为例提供模型并行示例。

与数据并行相同，首先准备训练脚本，将下列代码保存到例如`./train.py`脚本中：

```python
from torch.utils.tensorboard import SummaryWriter
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.metainfo import Trainers

# 使用诗词生成数据集进行训练，用户也可以使用自己的数据集
dataset_dict = MsDataset.load('chinese-poetry-collection')
train_dataset = dataset_dict['train'].remap_columns(
    {'text1': 'src_txt'})
eval_dataset = dataset_dict['test'].remap_columns({'text1': 'src_txt'})
max_epochs = 10

# 指定工作目录
tmp_dir = './gpt3_poetry'

num_warmup_steps = 100

def noam_lambda(current_step: int):
    current_step += 1
    return min(current_step**(-0.5),
               current_step * num_warmup_steps**(-1.5))

# 修改训练配置
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
        'type': 'EvaluationHook',
        'by_epoch': True,
        'interval': 1
    })
    cfg.evaluation.dataloader = {
        'batch_size_per_gpu': 8,
        'workers_per_gpu': 1
    }
    cfg.evaluation.metrics = 'ppl'
    cfg.model.checkpoint_model_parallel_size = 1
    return cfg

kwargs = dict(
    model='damo/nlp_gpt3_text-generation_1.3B',
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    max_epochs=max_epochs,
    work_dir=tmp_dir,
    cfg_modify_fn=cfg_modify_fn)

# 构造 trainer 并使用 trainer 进行训练
trainer = build_trainer(
    name=Trainers.gpt3_trainer, default_args=kwargs)
trainer.train()
```

对于GPT3 1.3B/2.7B 两个模型我们在训练阶段支持了运行时的模型自动拆分功能，设置好并行进程数即可自动运行相应模型并行度的训练：

**PyTorch：**

**单机多卡：**

```shell
python -m torch.distributed.launch --use_env --nproc_per_node=${NUMBER_GPUS} ./train.py
```

- nproc_per_node：当前主机创建的进程数（使用的GPU个数），同时也是模型并行度， 例如`--nproc_per_node=8`。

恭喜，你完成了一次使用模型并行的模型分布式训练！😀